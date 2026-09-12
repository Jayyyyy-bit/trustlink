// src/lib/ledger.ts
// The only way an entry gets into ledger_entries. Hashing happens here and nowhere
// else — nothing on the device ever computes a hash. appendLedgerEntry canonicalises
// the payload, chains it to the previous entry's hash with SHA-256, and inserts.
//
// There is deliberately no update/delete function in this module (or anywhere else
// in the codebase) — ledger_entries is append-only.

import { createHash, randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { pool } from '../db/pool';
import type { LedgerEntry, LedgerEntryType } from '../types';

/** Any JSON-serialisable value — the thing being recorded, not the ledger row itself. */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface AppendLedgerEntryInput {
  type: LedgerEntryType;
  subjectId: string;
  payload: JsonValue;
}

export interface LedgerEntryRow {
  id: string;
  sequence: number;
  type: LedgerEntryType;
  subject_id: string;
  hash: string;
  previous_hash: string | null;
  created_at: Date;
}

/** Sorts object keys recursively so the same logical payload always serialises to the
 *  same string, regardless of the key order it arrived in. */
function canonicalize(value: JsonValue): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    const sorted: { [key: string]: JsonValue } = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortKeysDeep(value[key] as JsonValue);
    }
    return sorted;
  }
  return value;
}

/** The one place the append hash formula lives — sha256(previousHash + canonicalPayload).
 *  Exported so callers that need to verify an entry (rather than append one), such as the
 *  release job's integrity check, recompute it the exact same way instead of duplicating
 *  the formula. */
export function computeLedgerHash(
  previousHash: string | null,
  entry: { type: LedgerEntryType; subjectId: string; payload: JsonValue },
): string {
  const canonicalPayload = canonicalize({
    type: entry.type,
    subjectId: entry.subjectId,
    payload: entry.payload,
  });
  return createHash('sha256').update(previousHash ?? '').update(canonicalPayload).digest('hex');
}

export function toLedgerEntry(row: LedgerEntryRow): LedgerEntry {
  return {
    id: row.id,
    sequence: row.sequence,
    type: row.type,
    subjectId: row.subject_id,
    hash: row.hash,
    previousHash: row.previous_hash,
    createdAt: row.created_at.toISOString(),
  };
}

/** Serializes every append behind a Postgres advisory lock so the hash chain can never
 *  fork under concurrent writers — the lock is held for the transaction only and is
 *  released automatically on commit or rollback. Truncated to 13 hex digits so it fits
 *  a safe JS integer (advisory lock keys are bigint, but any int8-range value works). */
const LEDGER_APPEND_LOCK_KEY = parseInt(
  createHash('sha256').update('trustlink.ledger_entries').digest('hex').slice(0, 13),
  16,
);

/**
 * Appends a ledger entry. By default this opens and commits its own transaction, exactly
 * as before. Pass `existingClient` (a client already inside a `BEGIN`) to fold the append
 * into a caller-owned transaction instead — e.g. the release job, which must move
 * quotations, close the requirement, and append REQUIREMENT_CLOSED as one atomic unit. In
 * that mode the caller owns BEGIN/COMMIT/ROLLBACK and the connection; this function only
 * takes the advisory lock (safe to nest — Postgres advisory locks are re-entrant within a
 * session) and inserts the row.
 */
export async function appendLedgerEntry(
  input: AppendLedgerEntryInput,
  existingClient?: PoolClient,
): Promise<LedgerEntry> {
  const client = existingClient ?? (await pool.connect());
  const ownsTransaction = !existingClient;
  try {
    if (ownsTransaction) {
      await client.query('BEGIN');
    }
    await client.query('SELECT pg_advisory_xact_lock($1)', [LEDGER_APPEND_LOCK_KEY]);

    const { rows: previousRows } = await client.query<{ hash: string }>(
      'SELECT hash FROM ledger_entries ORDER BY sequence DESC LIMIT 1',
    );
    const previousHash = previousRows[0]?.hash ?? null;

    const hash = computeLedgerHash(previousHash, input);

    const id = randomUUID();

    const { rows } = await client.query<LedgerEntryRow>(
      `INSERT INTO ledger_entries (id, type, subject_id, hash, previous_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, sequence, type, subject_id, hash, previous_hash, created_at`,
      [id, input.type, input.subjectId, hash, previousHash],
    );

    if (ownsTransaction) {
      await client.query('COMMIT');
    }

    const row = rows[0];
    if (!row) {
      throw new Error('ledger insert returned no row');
    }
    return toLedgerEntry(row);
  } catch (err) {
    if (ownsTransaction) {
      await client.query('ROLLBACK');
    }
    throw err;
  } finally {
    if (ownsTransaction) {
      client.release();
    }
  }
}
