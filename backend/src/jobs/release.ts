// src/jobs/release.ts
// The release job — the only place SUBMITTED quotations become RELEASED and an OPEN
// requirement becomes CLOSED. It runs on the clock (node-cron, every 30s), never on
// request: no route calls into this file, and nothing here reads req/res. Once a
// requirement is picked up here, withdrawal is no longer possible — quotations.ts only
// allows withdrawal while a quotation is still SUBMITTED, and this job is what moves it
// out of that state.

import { createHash } from 'node:crypto';
import cron from 'node-cron';
import type { PoolClient } from 'pg';
import { pool } from '../db/pool';
import { appendLedgerEntry, computeLedgerHash, type JsonValue } from '../lib/ledger';
import type { Attachment, IntegrityResult } from '../types';

/** Same construction as ledger.ts's LEDGER_APPEND_LOCK_KEY, with its own namespaced
 *  string so it can never collide with that (or any other) advisory lock in this
 *  codebase. Held for the duration of each per-requirement transaction below, so if two
 *  instances of this process (or two overlapping ticks of the same instance) both reach
 *  for the release job at once, the second blocks until the first's transaction commits
 *  or rolls back — the same run is never processed twice. */
const RELEASE_JOB_LOCK_KEY = parseInt(
  createHash('sha256').update('trustlink.release_job').digest('hex').slice(0, 13),
  16,
);

interface DueRequirementRow {
  id: string;
  ref: string;
}

interface SubmittedQuotationRow {
  id: string;
  ref: string;
  respondent_id: string;
  total_price: string;
  lead_time_days: number;
  payment_terms: string;
  validity_days: number;
  notes_to_buyer: string;
  attachments: Attachment[];
  submitted_at: Date;
  ledger_entry_id: string;
}

/** Rebuilds exactly the payload quotations.ts passed to appendLedgerEntry at submission
 *  time (see POST /quotations), from what's now stored on the row, so the hash it
 *  produces can be compared against the hash actually recorded in the ledger. */
function submittedPayload(q: SubmittedQuotationRow, requirementRef: string): JsonValue {
  return {
    ref: q.ref,
    requirementRef,
    respondentId: q.respondent_id,
    totalPrice: Number(q.total_price),
    leadTimeDays: q.lead_time_days,
    paymentTerms: q.payment_terms,
    validityDays: q.validity_days,
    notesToBuyer: q.notes_to_buyer,
    attachments: q.attachments as unknown as JsonValue,
    submittedAt: q.submitted_at.toISOString(),
  };
}

/** Recomputes one quotation's hash from its stored payload and the previous_hash its
 *  ledger entry actually chained to, and compares it against the hash recorded in the
 *  ledger at submission time. VALID means the stored row still matches what was sealed;
 *  FLAGGED means it doesn't (row tampering, or a ledger inconsistency) — either way it
 *  stays in the list, it is never hidden or dropped. */
async function checkIntegrity(
  client: PoolClient,
  quotation: SubmittedQuotationRow,
  requirementRef: string,
): Promise<IntegrityResult> {
  const { rows } = await client.query<{ hash: string; previous_hash: string | null }>(
    'SELECT hash, previous_hash FROM ledger_entries WHERE id = $1',
    [quotation.ledger_entry_id],
  );
  const ledgerEntry = rows[0];
  if (!ledgerEntry) {
    // Every SUBMITTED quotation is inserted with a ledger_entry_id FK that must already
    // exist (see POST /quotations) — this would mean the ledger row was lost, which
    // should be impossible. Treat it as a flag rather than crashing the whole sweep.
    return 'FLAGGED';
  }

  const recomputed = computeLedgerHash(ledgerEntry.previous_hash, {
    type: 'QUOTATION_SUBMITTED',
    subjectId: quotation.id,
    payload: submittedPayload(quotation, requirementRef),
  });

  return recomputed === ledgerEntry.hash ? 'VALID' : 'FLAGGED';
}

/** Releases one due requirement: every SUBMITTED quotation on it moves to RELEASED (with
 *  its integrity stamped), the requirement moves to CLOSED, and a REQUIREMENT_CLOSED
 *  ledger entry is appended — all in one transaction. Re-checks status under the lock
 *  before doing anything, since the caller's SELECT that found this requirement ran
 *  before the lock was taken. */
async function releaseRequirement(requirementId: string, ref: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [RELEASE_JOB_LOCK_KEY]);

    const { rows: requirementRows } = await client.query<{ status: string; closing_at: Date }>(
      'SELECT status, closing_at FROM requirements WHERE id = $1 FOR UPDATE',
      [requirementId],
    );
    const requirement = requirementRows[0];
    if (!requirement || requirement.status !== 'OPEN' || requirement.closing_at.getTime() > Date.now()) {
      // Already released by a prior tick (or another instance) between the sweep's
      // SELECT and this lock — nothing to do.
      await client.query('ROLLBACK');
      return;
    }

    const { rows: quotations } = await client.query<SubmittedQuotationRow>(
      `SELECT id, ref, respondent_id, total_price, lead_time_days, payment_terms,
              validity_days, notes_to_buyer, attachments, submitted_at, ledger_entry_id
       FROM quotations
       WHERE requirement_id = $1 AND status = 'SUBMITTED'
       FOR UPDATE`,
      [requirementId],
    );

    let flaggedCount = 0;
    for (const quotation of quotations) {
      const integrity = await checkIntegrity(client, quotation, ref);
      if (integrity === 'FLAGGED') {
        flaggedCount++;
      }
      await client.query('UPDATE quotations SET status = $1, integrity = $2 WHERE id = $3', [
        'RELEASED',
        integrity,
        quotation.id,
      ]);
    }

    await client.query("UPDATE requirements SET status = 'CLOSED' WHERE id = $1", [requirementId]);

    const closedAt = new Date().toISOString();
    await appendLedgerEntry(
      {
        type: 'REQUIREMENT_CLOSED',
        subjectId: requirementId,
        payload: { ref, closedAt, quotationCount: quotations.length, flaggedCount },
      },
      client,
    );

    await client.query('COMMIT');

    console.log(
      `[release-job] closed ${ref}: ${quotations.length} quotation(s) released, ${flaggedCount} flagged`,
    );
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[release-job] failed to release ${ref}`, err);
  } finally {
    client.release();
  }
}

/** One sweep: find every requirement that's still OPEN past its closing_at, and release
 *  each in its own transaction. Requirements are processed one at a time (not batched
 *  into a single transaction) so a failure or a lock wait on one never blocks the rest. */
export async function runReleaseSweep(): Promise<void> {
  const { rows: due } = await pool.query<DueRequirementRow>(
    "SELECT id, ref FROM requirements WHERE status = 'OPEN' AND closing_at <= now()",
  );

  for (const requirement of due) {
    await releaseRequirement(requirement.id, requirement.ref);
  }
}

/** Starts the schedule. Call once, from server.ts — never from app.ts, so building the
 *  Express app (e.g. under test) never starts a background timer. */
export function startReleaseJob(): void {
  cron.schedule('*/30 * * * * *', () => {
    runReleaseSweep().catch((err) => {
      console.error('[release-job] sweep failed', err);
    });
  });
}
