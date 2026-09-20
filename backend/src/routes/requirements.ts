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
import { tryEmbedRequirement } from '../lib/embeddings';
import { scoreRequirement, type ViewerProfile } from '../lib/matching';
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
  // Best effort: a provider failure publishes the requirement with no embedding and the
  // feed falls back to category/service-area matching for it.
  const scopeEmbedding = await tryEmbedRequirement(title, scope, specifications);

  const { rows } = await pool.query<RequirementRow>(
    `INSERT INTO requirements (
       id, ref, buyer_id, status, category, title, scope, specifications, quantity,
       budget_min, budget_max, delivery_site, delivery_window, attachments,
       closing_at, published_at, scope_embedding
     ) VALUES ($1, $2, $3, 'OPEN', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::vector)
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
      scopeEmbedding,
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

interface FeedRow extends RequirementRow {
  buyer_city: string;
  buyer_province: string;
  distance: number | null;
  nearest_capability: string | null;
  nearest_capability_distance: number | null;
}

interface ViewerRow {
  category: string;
  capabilities: string[];
  service_areas: string[];
}

// GET /requirements — the open feed, ranked by match (cosine distance between the
// caller's business embedding and each requirement's scope embedding) combined with
// closing time; see src/lib/matching.ts. Requirements or businesses without an
// embedding are ranked by a category/service-area fallback, never dropped.
requirementsRouter.get('/', authenticate, async (req, res) => {
  const viewerId = req.businessId ?? null;
  const columns = REQUIREMENT_COLUMNS.split(',').map((c) => `r.${c.trim()}`).join(', ');

  const [{ rows }, { rows: viewerRows }] = await Promise.all([
    pool.query<FeedRow>(
      `SELECT ${columns},
              buyer.city AS buyer_city, buyer.province AS buyer_province,
              r.scope_embedding <=> viewer.capabilities_embedding AS distance,
              cap.capability AS nearest_capability, cap.distance AS nearest_capability_distance
       FROM requirements r
       JOIN businesses buyer ON buyer.id = r.buyer_id
       LEFT JOIN businesses viewer ON viewer.id = $1
       LEFT JOIN LATERAL (
         SELECT c.capability, c.embedding <=> r.scope_embedding AS distance
         FROM business_capability_embeddings c
         WHERE c.business_id = $1 AND r.scope_embedding IS NOT NULL
         ORDER BY c.embedding <=> r.scope_embedding
         LIMIT 1
       ) cap ON true
       WHERE r.status = 'OPEN'
         AND ($1::text IS NULL OR r.buyer_id != $1)`,
      [viewerId],
    ),
    viewerId
      ? pool.query<ViewerRow>('SELECT category, capabilities, service_areas FROM businesses WHERE id = $1', [viewerId])
      : Promise.resolve({ rows: [] as ViewerRow[] }),
  ]);

  const viewerRow = viewerRows[0];
  const viewer: ViewerProfile | null = viewerRow
    ? { category: viewerRow.category, capabilities: viewerRow.capabilities, serviceAreas: viewerRow.service_areas }
    : null;

  const now = Date.now();
  const ranked = rows
    .map((row) => {
      const { score, matchReason } = scoreRequirement(
        viewer,
        {
          category: row.category,
          title: row.title,
          scope: row.scope,
          specifications: row.specifications,
          deliverySite: row.delivery_site,
          buyerCity: row.buyer_city,
          buyerProvince: row.buyer_province,
          closingAt: row.closing_at,
          distance: row.distance,
          nearestCapability: row.nearest_capability,
          nearestCapabilityDistance: row.nearest_capability_distance,
        },
        now,
      );
      return { row, score, matchReason };
    })
    .sort((a, b) => b.score - a.score || a.row.closing_at.getTime() - b.row.closing_at.getTime());

  res.json(ranked.map(({ row, matchReason }) => ({ ...toRequirement(row), matchReason })));
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
