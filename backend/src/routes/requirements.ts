// src/routes/requirements.ts
// POST /requirements — publish a requirement (create + publish are one step; there's
// no draft-save route here). GET /requirements — the open feed. GET /requirements/:ref
// — one requirement.
//
// The sealed rule lives in GET /requirements/:ref: quotation contents are fetched by a
// second, separate query that is only ever reached — and therefore only ever
// constructed — once the caller is confirmed to be the owner and the closing time has
// passed. Every other path never builds a query that touches quotation content
// columns, so there's no code path where a stray `if` could leak them.

import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { authenticate, requireVerifiedBusiness } from '../middleware/auth';
import { pool } from '../db/pool';
import { appendLedgerEntry } from '../lib/ledger';
import { nextRequirementRef } from '../lib/refs';
import type { Attachment, DeliverySite, Requirement, SpecRow } from '../types';

export const requirementsRouter = Router();

export interface RequirementRow {
  id: string;
  ref: string;
  buyer_id: string;
  status: Requirement['status'];
  category: string;
  title: string;
  scope: string;
  specifications: SpecRow[];
  quantity: string;
  budget_min: string | null;
  budget_max: string | null;
  delivery_site: DeliverySite;
  delivery_window: string;
  attachments: Attachment[];
  closing_at: Date;
  published_at: Date | null;
  quotation_count: number;
  last_quotation_at: Date | null;
  awarded_quotation_id: string | null;
}

export function toRequirement(row: RequirementRow): Requirement {
  return {
    id: row.id,
    ref: row.ref,
    buyerId: row.buyer_id,
    status: row.status,
    category: row.category,
    title: row.title,
    scope: row.scope,
    specifications: row.specifications,
    quantity: row.quantity,
    budgetMin: row.budget_min !== null ? Number(row.budget_min) : null,
    budgetMax: row.budget_max !== null ? Number(row.budget_max) : null,
    deliverySite: row.delivery_site,
    deliveryWindow: row.delivery_window,
    attachments: row.attachments,
    closingAt: row.closing_at.toISOString(),
    publishedAt: row.published_at ? row.published_at.toISOString() : null,
    quotationCount: row.quotation_count,
    lastQuotationAt: row.last_quotation_at ? row.last_quotation_at.toISOString() : null,
    awardedQuotationId: row.awarded_quotation_id,
  };
}

export const REQUIREMENT_COLUMNS = `
  id, ref, buyer_id, status, category, title, scope, specifications, quantity,
  budget_min, budget_max, delivery_site, delivery_window, attachments, closing_at,
  published_at, quotation_count, last_quotation_at, awarded_quotation_id
`;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSpecRows(value: unknown): value is SpecRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) => v && typeof v === 'object' && typeof (v as SpecRow).label === 'string' && typeof (v as SpecRow).value === 'string',
    )
  );
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

function isDeliverySite(value: unknown): value is DeliverySite {
  if (!value || typeof value !== 'object') return false;
  const site = value as DeliverySite;
  return (
    typeof site.name === 'string' &&
    typeof site.address === 'string' &&
    typeof site.accessHours === 'string' &&
    typeof site.accessNote === 'string'
  );
}

requirementsRouter.post('/', authenticate, requireVerifiedBusiness, async (req, res) => {
  const {
    category,
    title,
    scope,
    specifications,
    quantity,
    budgetMin,
    budgetMax,
    deliverySite,
    deliveryWindow,
    attachments,
    closingAt,
  } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(category)) {
    res.status(400).json({ error: 'category is required' });
    return;
  }
  if (!isNonEmptyString(title)) {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  if (!isNonEmptyString(scope)) {
    res.status(400).json({ error: 'scope is required' });
    return;
  }
  if (!isSpecRows(specifications)) {
    res.status(400).json({ error: 'specifications must be an array of { label, value }' });
    return;
  }
  if (!isNonEmptyString(quantity)) {
    res.status(400).json({ error: 'quantity is required' });
    return;
  }
  if (budgetMin !== null && budgetMin !== undefined && typeof budgetMin !== 'number') {
    res.status(400).json({ error: 'budgetMin must be a number or null' });
    return;
  }
  if (budgetMax !== null && budgetMax !== undefined && typeof budgetMax !== 'number') {
    res.status(400).json({ error: 'budgetMax must be a number or null' });
    return;
  }
  if (!isDeliverySite(deliverySite)) {
    res.status(400).json({ error: 'deliverySite must be a { name, address, accessHours, accessNote } object' });
    return;
  }
  if (!isNonEmptyString(deliveryWindow)) {
    res.status(400).json({ error: 'deliveryWindow is required' });
    return;
  }
  if (!isAttachments(attachments)) {
    res.status(400).json({ error: 'attachments must be an array of attachment objects' });
    return;
  }
  if (typeof closingAt !== 'string' || Number.isNaN(Date.parse(closingAt))) {
    res.status(400).json({ error: 'closingAt must be an ISO date string' });
    return;
  }
  if (Date.parse(closingAt) <= Date.now()) {
    res.status(400).json({ error: 'closingAt must be in the future' });
    return;
  }

  const id = randomUUID();
  const ref = await nextRequirementRef();
  const publishedAt = new Date();

  const { rows } = await pool.query<RequirementRow>(
    `INSERT INTO requirements (
       id, ref, buyer_id, status, category, title, scope, specifications, quantity,
       budget_min, budget_max, delivery_site, delivery_window, attachments,
       closing_at, published_at
     ) VALUES ($1, $2, $3, 'OPEN', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING ${REQUIREMENT_COLUMNS}`,
    [
      id,
      ref,
      req.businessId,
      category,
      title,
      scope,
      JSON.stringify(specifications),
      quantity,
      budgetMin ?? null,
      budgetMax ?? null,
      JSON.stringify(deliverySite),
      deliveryWindow,
      JSON.stringify(attachments),
      closingAt,
      publishedAt,
    ],
  );
  const row = rows[0];
  if (!row) {
    throw new Error('requirement insert returned no row');
  }

  await appendLedgerEntry({
    type: 'REQUIREMENT_PUBLISHED',
    subjectId: id,
    payload: { ref, buyerId: req.businessId as string, closingAt },
  });

  res.status(201).json(toRequirement(row));
});

requirementsRouter.get('/', authenticate, async (req, res) => {
  const { rows } = await pool.query<RequirementRow>(
    `SELECT ${REQUIREMENT_COLUMNS}
     FROM requirements
     WHERE status = 'OPEN'
       AND ($1::text IS NULL OR buyer_id != $1)
     ORDER BY closing_at ASC`,
    [req.businessId ?? null],
  );

  res.json(rows.map(toRequirement));
});

requirementsRouter.get('/:ref', authenticate, async (req, res) => {
  const { rows } = await pool.query<RequirementRow>(
    `SELECT ${REQUIREMENT_COLUMNS} FROM requirements WHERE ref = $1`,
    [req.params.ref],
  );
  const row = rows[0];
  if (!row) {
    res.status(404).json({ error: 'Requirement not found' });
    return;
  }

  const requirement = toRequirement(row);
  const isOwner = req.businessId !== null && req.businessId === requirement.buyerId;
  const closingPassed = row.closing_at.getTime() <= Date.now();

  if (!isOwner || !closingPassed) {
    res.json(requirement);
    return;
  }

  const { rows: quotationRows } = await pool.query<{
    id: string;
    ref: string;
    respondent_id: string;
    status: string;
    total_price: string;
    lead_time_days: number;
    payment_terms: string;
    validity_days: number;
    notes_to_buyer: string;
    attachments: Attachment[];
    submitted_at: Date;
    hash_truncated: string;
    integrity: string | null;
    withdrawn_at: Date | null;
  }>(
    `SELECT id, ref, respondent_id, status, total_price, lead_time_days, payment_terms,
            validity_days, notes_to_buyer, attachments, submitted_at, hash_truncated,
            integrity, withdrawn_at
     FROM quotations
     WHERE requirement_id = $1
     ORDER BY submitted_at ASC`,
    [row.id],
  );

  res.json({
    ...requirement,
    quotations: quotationRows.map((q) => ({
      id: q.id,
      ref: q.ref,
      respondentId: q.respondent_id,
      status: q.status,
      totalPrice: Number(q.total_price),
      leadTimeDays: q.lead_time_days,
      paymentTerms: q.payment_terms,
      validityDays: q.validity_days,
      notesToBuyer: q.notes_to_buyer,
      attachments: q.attachments,
      submittedAt: q.submitted_at.toISOString(),
      hashTruncated: q.hash_truncated,
      integrity: q.integrity,
      withdrawnAt: q.withdrawn_at ? q.withdrawn_at.toISOString() : null,
    })),
  });
});
