// src/routes/quotations.ts
// POST /quotations — submit a sealed quotation. POST /quotations/:ref/withdraw —
// withdraw one of the caller's own, while still SUBMITTED. GET /quotations/mine —
// the caller's own quotations, in full (a business always sees its own contents).

import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { authenticate, requireVerifiedBusiness } from '../middleware/auth';
import { pool } from '../db/pool';
import { appendLedgerEntry, type JsonValue } from '../lib/ledger';
import { nextQuotationRef } from '../lib/refs';
import type { Attachment, IntegrityResult, Quotation, QuotationStatus } from '../types';

export const quotationsRouter = Router();

interface QuotationRow {
  id: string;
  ref: string;
  requirement_id: string;
  respondent_id: string;
  status: QuotationStatus;
  total_price: string;
  lead_time_days: number;
  payment_terms: string;
  validity_days: number;
  notes_to_buyer: string;
  attachments: Attachment[];
  submitted_at: Date;
  hash_truncated: string;
  ledger_entry_id: string;
  integrity: IntegrityResult | null;
  withdrawn_at: Date | null;
  replaced_by_quotation_id: string | null;
}

const QUOTATION_COLUMNS = `
  id, ref, requirement_id, respondent_id, status, total_price, lead_time_days,
  payment_terms, validity_days, notes_to_buyer, attachments, submitted_at,
  hash_truncated, ledger_entry_id, integrity, withdrawn_at, replaced_by_quotation_id
`;

function toQuotation(row: QuotationRow): Quotation {
  return {
    id: row.id,
    ref: row.ref,
    requirementId: row.requirement_id,
    respondentId: row.respondent_id,
    status: row.status,
    totalPrice: Number(row.total_price),
    leadTimeDays: row.lead_time_days,
    paymentTerms: row.payment_terms,
    validityDays: row.validity_days,
    notesToBuyer: row.notes_to_buyer,
    attachments: row.attachments,
    submittedAt: row.submitted_at.toISOString(),
    hashTruncated: row.hash_truncated,
    ledgerEntryId: row.ledger_entry_id,
    integrity: row.integrity,
    withdrawnAt: row.withdrawn_at ? row.withdrawn_at.toISOString() : null,
    replacedByQuotationId: row.replaced_by_quotation_id,
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isAttachments(value: unknown): value is Attachment[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        v &&
        typeof v === 'object' &&
        typeof (v as Attachment).id === 'string' &&
        typeof (v as Attachment).filename === 'string' &&
        typeof (v as Attachment).sizeBytes === 'number' &&
        typeof (v as Attachment).mimeType === 'string' &&
        typeof (v as Attachment).uri === 'string',
    )
  );
}

quotationsRouter.post('/', authenticate, requireVerifiedBusiness, async (req, res) => {
  const { requirementRef, totalPrice, leadTimeDays, paymentTerms, validityDays, notesToBuyer, attachments } =
    req.body as Record<string, unknown>;

  if (!isNonEmptyString(requirementRef)) {
    res.status(400).json({ error: 'requirementRef is required' });
    return;
  }
  if (typeof totalPrice !== 'number' || totalPrice <= 0) {
    res.status(400).json({ error: 'totalPrice must be a positive number' });
    return;
  }
  if (typeof leadTimeDays !== 'number' || !Number.isInteger(leadTimeDays) || leadTimeDays <= 0) {
    res.status(400).json({ error: 'leadTimeDays must be a positive integer' });
    return;
  }
  if (!isNonEmptyString(paymentTerms)) {
    res.status(400).json({ error: 'paymentTerms is required' });
    return;
  }
  if (typeof validityDays !== 'number' || !Number.isInteger(validityDays) || validityDays <= 0) {
    res.status(400).json({ error: 'validityDays must be a positive integer' });
    return;
  }
  if (notesToBuyer !== undefined && typeof notesToBuyer !== 'string') {
    res.status(400).json({ error: 'notesToBuyer must be a string' });
    return;
  }
  if (!isAttachments(attachments)) {
    res.status(400).json({ error: 'attachments must be an array of attachment objects' });
    return;
  }

  const { rows: requirementRows } = await pool.query<{ id: string; status: string; closing_at: Date }>(
    'SELECT id, status, closing_at FROM requirements WHERE ref = $1',
    [requirementRef],
  );
  const requirement = requirementRows[0];
  if (!requirement) {
    res.status(404).json({ error: 'Requirement not found' });
    return;
  }
  if (requirement.status !== 'OPEN' || requirement.closing_at.getTime() <= Date.now()) {
    res.status(409).json({ error: 'Requirement is closed' });
    return;
  }

  const id = randomUUID();
  const ref = await nextQuotationRef();
  const submittedAt = new Date();
  const notes = notesToBuyer ?? '';

  const ledgerEntry = await appendLedgerEntry({
    type: 'QUOTATION_SUBMITTED',
    subjectId: id,
    payload: {
      ref,
      requirementRef,
      respondentId: req.businessId as string,
      totalPrice,
      leadTimeDays,
      paymentTerms,
      validityDays,
      notesToBuyer: notes,
      attachments: attachments as unknown as JsonValue,
      submittedAt: submittedAt.toISOString(),
    },
  });
  const hashTruncated = ledgerEntry.hash.slice(0, 8);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO quotations (
         id, ref, requirement_id, respondent_id, status, total_price, lead_time_days,
         payment_terms, validity_days, notes_to_buyer, attachments, submitted_at,
         hash_truncated, ledger_entry_id
       ) VALUES ($1, $2, $3, $4, 'SUBMITTED', $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id,
        ref,
        requirement.id,
        req.businessId,
        totalPrice,
        leadTimeDays,
        paymentTerms,
        validityDays,
        notes,
        JSON.stringify(attachments),
        submittedAt,
        hashTruncated,
        ledgerEntry.id,
      ],
    );

    await client.query(
      'UPDATE requirements SET quotation_count = quotation_count + 1, last_quotation_at = $1 WHERE id = $2',
      [submittedAt, requirement.id],
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  res.status(201).json({
    ref,
    submittedAt: submittedAt.toISOString(),
    hashTruncated,
    sequence: ledgerEntry.sequence,
  });
});

quotationsRouter.post('/:ref/withdraw', authenticate, async (req, res) => {
  const { rows } = await pool.query<QuotationRow>(`SELECT ${QUOTATION_COLUMNS} FROM quotations WHERE ref = $1`, [
    req.params.ref,
  ]);
  const row = rows[0];
  if (!row) {
    res.status(404).json({ error: 'Quotation not found' });
    return;
  }
  if (row.respondent_id !== req.businessId) {
    res.status(403).json({ error: 'Not your quotation' });
    return;
  }
  if (row.status !== 'SUBMITTED') {
    res.status(409).json({ error: 'Quotation can only be withdrawn while SUBMITTED' });
    return;
  }

  const withdrawnAt = new Date();

  await appendLedgerEntry({
    type: 'QUOTATION_WITHDRAWN',
    subjectId: row.id,
    payload: { ref: row.ref, withdrawnAt: withdrawnAt.toISOString() },
  });

  const { rows: updatedRows } = await pool.query<QuotationRow>(
    `UPDATE quotations SET status = 'WITHDRAWN', withdrawn_at = $1 WHERE id = $2
     RETURNING ${QUOTATION_COLUMNS}`,
    [withdrawnAt, row.id],
  );
  const updated = updatedRows[0];
  if (!updated) {
    throw new Error('quotation update returned no row');
  }

  res.json(toQuotation(updated));
});

quotationsRouter.get('/mine', authenticate, async (req, res) => {
  const { rows } = await pool.query<QuotationRow>(
    `SELECT ${QUOTATION_COLUMNS} FROM quotations WHERE respondent_id = $1 ORDER BY submitted_at DESC`,
    [req.businessId],
  );

  res.json(rows.map(toQuotation));
});
