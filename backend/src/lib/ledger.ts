// src/lib/ledger.ts
// The only way an entry gets into ledger_entries. Hashing happens here and nowhere
// else — nothing on the device ever computes a hash. appendLedgerEntry canonicalises
// the payload, chains it to the previous entry's hash with SHA-256, and inserts.
//
// There is deliberately no update/delete function in this module (or anywhere else
// in the codebase) — ledger_entries is append-only.

import { createHash, randomUUID } from 'node:crypto';
import { pool } from '../db/pool';
import type { LedgerEntry, LedgerEntryType } from '../types';

/** Any JSON-serialisable value — the thing being recorded, not the ledger row itself. */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface AppendLedgerEntryInput {
  type: LedgerEntryType;
  subjectId: string;
  payload: JsonValue;
}

interface LedgerEntryRow {
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

function toLedgerEntry(row: LedgerEntryRow): LedgerEntry {
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

export async function appendLedgerEntry(input: AppendLedgerEntryInput): Promise<LedgerEntry> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [LEDGER_APPEND_LOCK_KEY]);

    const { rows: previousRows } = await client.query<{ hash: string }>(
      'SELECT hash FROM ledger_entries ORDER BY sequence DESC LIMIT 1',
    );
    const previousHash = previousRows[0]?.hash ?? null;

    const canonicalPayload = canonicalize({
      type: input.type,
      subjectId: input.subjectId,
      payload: input.payload,
    });

    const hash = createHash('sha256')
      .update(previousHash ?? '')
      .update(canonicalPayload)
      .digest('hex');

    const id = randomUUID();

    const { rows } = await client.query<LedgerEntryRow>(
      `INSERT INTO ledger_entries (id, type, subject_id, hash, previous_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, sequence, type, subject_id, hash, previous_hash, created_at`,
      [id, input.type, input.subjectId, hash, previousHash],
    );

    await client.query('COMMIT');

    const row = rows[0];
    if (!row) {
      throw new Error('ledger insert returned no row');
    }
    return toLedgerEntry(row);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
