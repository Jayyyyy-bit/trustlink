// src/lib/refs.ts
// Mints the human-readable references shown throughout the frontend
// (RQ-2026-0001, QT-2026-0511, ...). Backed by the sequences in
// 003_ref_sequences.sql so numbers are unique and never reused, even across
// rolled-back inserts.

import { pool } from '../db/pool';

async function nextRef(prefix: 'RQ' | 'QT', sql: string): Promise<string> {
  const { rows } = await pool.query<{ n: string }>(sql);
  const row = rows[0];
  if (!row) {
    throw new Error('sequence nextval() returned no row');
  }
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${row.n.padStart(4, '0')}`;
}

export function nextRequirementRef(): Promise<string> {
  return nextRef('RQ', "SELECT nextval('requirement_ref_seq')::text AS n");
}

export function nextQuotationRef(): Promise<string> {
  return nextRef('QT', "SELECT nextval('quotation_ref_seq')::text AS n");
}
