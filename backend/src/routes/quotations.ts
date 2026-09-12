// src/routes/quotations.ts
// POST /quotations — submit a sealed quotation. POST /quotations/:ref/withdraw —
// withdraw one of the caller's own, while still SUBMITTED. GET /quotations/mine —
// the caller's own quotations, in full (a business always sees its own contents).

import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { authenticate, requireVerifiedBusiness } from '../middleware/auth';
import { pool } from '../db/pool';
import { appendLedgerEntry, toLedgerEntry, type JsonValue } from '../lib/ledger';
import { nextQuotationRef } from '../lib/refs';
import { BUSINESS_COLUMNS, toBusiness, type BusinessRow } from './businesses';
import { REQUIREMENT_COLUMNS, toRequirement, type RequirementRow } from './requirements';
import type { Attachment, IntegrityResult, LedgerEntry, Quotation, QuotationStatus } from '../types';

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

// GET /mine additionally returns, per quotation, the requirement it was submitted against,
// that requirement's buyer, and the full ledger entry — everything MyQuotations.tsx (and
// RequirementDetail.tsx's RESPONDENT/hasSubmitted view) needs, none of it fabricated:
// a respondent is always entitled to see the requirement/buyer/ledger context of their own
// quotation, sealed-content rules notwithstanding (those only ever gate *other* businesses'
// quotation contents, never a business's own).
interface MineRow extends QuotationRow {
  req_id: string;
  req_ref: string;
  req_buyer_id: string;
  req_status: RequirementRow['status'];
  req_category: string;
  req_title: string;
  req_scope: string;
  req_specifications: RequirementRow['specifications'];
  req_quantity: string;
  req_budget_min: string | null;
  req_budget_max: string | null;
  req_delivery_site: RequirementRow['delivery_site'];
  req_delivery_window: string;
  req_attachments: RequirementRow['attachments'];
  req_closing_at: Date;
  req_published_at: Date | null;
  req_quotation_count: number;
  req_last_quotation_at: Date | null;
  req_awarded_quotation_id: string | null;
  biz_id: string;
  biz_registered_name: string;
  biz_display_name: string | null;
  biz_business_type: BusinessRow['business_type'];
  biz_category: string;
  biz_city: string;
  biz_province: string;
  biz_contact_person: string;
  biz_contact_mobile: string;
  biz_capabilities: string[];
  biz_service_areas: string[];
  biz_credibility_status: BusinessRow['credibility_status'];
  biz_credibility_verified_at: Date | null;
  biz_credibility_recheck_due_at: Date | null;
  biz_credibility_tier: BusinessRow['credibility_tier'];
  biz_credibility_requirements_posted: number;
  biz_credibility_requirements_awarded: number;
  biz_credibility_quotations_submitted: number;
  biz_credibility_quotations_awarded: number;
  biz_profile_completion_pct: number;
  biz_member_since_year: number;
  ledger_id: string | null;
  ledger_sequence: number | null;
  ledger_type: LedgerEntry['type'] | null;
  ledger_subject_id: string | null;
  ledger_hash: string | null;
  ledger_previous_hash: string | null;
  ledger_created_at: Date | null;
}

const QUOTATION_COLUMNS_QUALIFIED = QUOTATION_COLUMNS
  .split(',')
  .map((col) => `q.${col.trim()}`)
  .join(', ');

quotationsRouter.get('/mine', authenticate, async (req, res) => {
  const { rows } = await pool.query<MineRow>(
    `SELECT ${QUOTATION_COLUMNS_QUALIFIED},
            r.id AS req_id, r.ref AS req_ref, r.buyer_id AS req_buyer_id, r.status AS req_status,
            r.category AS req_category, r.title AS req_title, r.scope AS req_scope,
            r.specifications AS req_specifications, r.quantity AS req_quantity,
            r.budget_min AS req_budget_min, r.budget_max AS req_budget_max,
            r.delivery_site AS req_delivery_site, r.delivery_window AS req_delivery_window,
            r.attachments AS req_attachments, r.closing_at AS req_closing_at,
            r.published_at AS req_published_at, r.quotation_count AS req_quotation_count,
            r.last_quotation_at AS req_last_quotation_at, r.awarded_quotation_id AS req_awarded_quotation_id,
            b.id AS biz_id, b.registered_name AS biz_registered_name, b.display_name AS biz_display_name,
            b.business_type AS biz_business_type, b.category AS biz_category, b.city AS biz_city,
            b.province AS biz_province, b.contact_person AS biz_contact_person,
            b.contact_mobile AS biz_contact_mobile, b.capabilities AS biz_capabilities,
            b.service_areas AS biz_service_areas, b.credibility_status AS biz_credibility_status,
            b.credibility_verified_at AS biz_credibility_verified_at,
            b.credibility_recheck_due_at AS biz_credibility_recheck_due_at,
            b.credibility_tier AS biz_credibility_tier,
            b.credibility_requirements_posted AS biz_credibility_requirements_posted,
            b.credibility_requirements_awarded AS biz_credibility_requirements_awarded,
            b.credibility_quotations_submitted AS biz_credibility_quotations_submitted,
            b.credibility_quotations_awarded AS biz_credibility_quotations_awarded,
            b.profile_completion_pct AS biz_profile_completion_pct,
            b.member_since_year AS biz_member_since_year,
            le.id AS ledger_id, le.sequence AS ledger_sequence, le.type AS ledger_type,
            le.subject_id AS ledger_subject_id, le.hash AS ledger_hash,
            le.previous_hash AS ledger_previous_hash, le.created_at AS ledger_created_at
     FROM quotations q
     JOIN requirements r ON r.id = q.requirement_id
     JOIN businesses b ON b.id = r.buyer_id
     LEFT JOIN ledger_entries le ON le.id = q.ledger_entry_id
     WHERE q.respondent_id = $1
     ORDER BY q.submitted_at DESC`,
    [req.businessId],
  );

  res.json(
    rows.map((row) => ({
      ...toQuotation(row),
      requirement: toRequirement({
        id: row.req_id,
        ref: row.req_ref,
        buyer_id: row.req_buyer_id,
        status: row.req_status,
        category: row.req_category,
        title: row.req_title,
        scope: row.req_scope,
        specifications: row.req_specifications,
        quantity: row.req_quantity,
        budget_min: row.req_budget_min,
        budget_max: row.req_budget_max,
        delivery_site: row.req_delivery_site,
        delivery_window: row.req_delivery_window,
        attachments: row.req_attachments,
        closing_at: row.req_closing_at,
        published_at: row.req_published_at,
        quotation_count: row.req_quotation_count,
        last_quotation_at: row.req_last_quotation_at,
        awarded_quotation_id: row.req_awarded_quotation_id,
      }),
      buyer: toBusiness({
        id: row.biz_id,
        registered_name: row.biz_registered_name,
        display_name: row.biz_display_name,
        business_type: row.biz_business_type,
        category: row.biz_category,
        city: row.biz_city,
        province: row.biz_province,
        contact_person: row.biz_contact_person,
        contact_mobile: row.biz_contact_mobile,
        capabilities: row.biz_capabilities,
        service_areas: row.biz_service_areas,
        credibility_status: row.biz_credibility_status,
        credibility_verified_at: row.biz_credibility_verified_at,
        credibility_recheck_due_at: row.biz_credibility_recheck_due_at,
        credibility_tier: row.biz_credibility_tier,
        credibility_requirements_posted: row.biz_credibility_requirements_posted,
        credibility_requirements_awarded: row.biz_credibility_requirements_awarded,
        credibility_quotations_submitted: row.biz_credibility_quotations_submitted,
        credibility_quotations_awarded: row.biz_credibility_quotations_awarded,
        profile_completion_pct: row.biz_profile_completion_pct,
        member_since_year: row.biz_member_since_year,
      }),
      ledger:
        row.ledger_id && row.ledger_sequence !== null && row.ledger_type && row.ledger_subject_id && row.ledger_hash && row.ledger_created_at
          ? toLedgerEntry({
              id: row.ledger_id,
              sequence: row.ledger_sequence,
              type: row.ledger_type,
              subject_id: row.ledger_subject_id,
              hash: row.ledger_hash,
              previous_hash: row.ledger_previous_hash,
              created_at: row.ledger_created_at,
            })
          : null,
    })),
  );
});
