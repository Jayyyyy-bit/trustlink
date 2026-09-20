// src/routes/businesses.ts
// POST /businesses — the one route that creates a business, called when onboarding
// is submitted. Links the new business to the caller's account and leaves it
// PENDING; moving to VERIFIED is still the manual step documented in the README.
// Writes no ledger entry — the ledger only ever records marketplace activity
// (requirements, quotations), not account/business administration.

import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { pool } from '../db/pool';
import { refreshBusinessEmbeddings } from '../lib/embeddings';
import type { Business, BusinessType } from '../types';

export const businessesRouter = Router();

const BUSINESS_TYPES: BusinessType[] = ['SOLE_PROP', 'PARTNERSHIP', 'CORPORATION', 'COOPERATIVE'];

export interface BusinessRow {
  id: string;
  registered_name: string;
  display_name: string | null;
  business_type: BusinessType;
  category: string;
  city: string;
  province: string;
  contact_person: string;
  contact_mobile: string;
  capabilities: string[];
  service_areas: string[];
  credibility_status: Business['credibility']['status'];
  credibility_verified_at: Date | null;
  credibility_recheck_due_at: Date | null;
  credibility_tier: Business['credibility']['tier'];
  credibility_requirements_posted: number;
  credibility_requirements_awarded: number;
  credibility_quotations_submitted: number;
  credibility_quotations_awarded: number;
  profile_completion_pct: number;
  member_since_year: number;
}

export const BUSINESS_COLUMNS = `
  id, registered_name, display_name, business_type, category, city, province,
  contact_person, contact_mobile, capabilities, service_areas,
  credibility_status, credibility_verified_at, credibility_recheck_due_at, credibility_tier,
  credibility_requirements_posted, credibility_requirements_awarded,
  credibility_quotations_submitted, credibility_quotations_awarded,
  profile_completion_pct, member_since_year
`;

export function toBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    registeredName: row.registered_name,
    displayName: row.display_name,
    businessType: row.business_type,
    category: row.category,
    city: row.city,
    province: row.province,
    contactPerson: row.contact_person,
    contactMobile: row.contact_mobile,
    capabilities: row.capabilities,
    serviceAreas: row.service_areas,
    credibility: {
      status: row.credibility_status,
      verifiedAt: row.credibility_verified_at ? row.credibility_verified_at.toISOString() : null,
      recheckDueAt: row.credibility_recheck_due_at ? row.credibility_recheck_due_at.toISOString() : null,
      tier: row.credibility_tier,
      requirementsPosted: row.credibility_requirements_posted,
      requirementsAwarded: row.credibility_requirements_awarded,
      quotationsSubmitted: row.credibility_quotations_submitted,
      quotationsAwarded: row.credibility_quotations_awarded,
    },
    profileCompletionPct: row.profile_completion_pct,
    memberSinceYear: row.member_since_year,
    capabilitiesEmbedding: null,
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

businessesRouter.post('/', authenticate, async (req, res) => {
  if (req.businessId) {
    res.status(409).json({ error: 'Account already has a business' });
    return;
  }

  const {
    registeredName,
    displayName,
    businessType,
    category,
    city,
    province,
    contactPerson,
    contactMobile,
    capabilities,
    serviceAreas,
  } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(registeredName)) {
    res.status(400).json({ error: 'registeredName is required' });
    return;
  }
  if (typeof businessType !== 'string' || !BUSINESS_TYPES.includes(businessType as BusinessType)) {
    res.status(400).json({ error: `businessType must be one of ${BUSINESS_TYPES.join(', ')}` });
    return;
  }
  if (!isNonEmptyString(category)) {
    res.status(400).json({ error: 'category is required' });
    return;
  }
  if (!isNonEmptyString(city)) {
    res.status(400).json({ error: 'city is required' });
    return;
  }
  if (!isNonEmptyString(province)) {
    res.status(400).json({ error: 'province is required' });
    return;
  }
  if (!isNonEmptyString(contactPerson)) {
    res.status(400).json({ error: 'contactPerson is required' });
    return;
  }
  if (!isNonEmptyString(contactMobile)) {
    res.status(400).json({ error: 'contactMobile is required' });
    return;
  }
  if (displayName !== undefined && displayName !== null && typeof displayName !== 'string') {
    res.status(400).json({ error: 'displayName must be a string or null' });
    return;
  }
  if (!isStringArray(capabilities)) {
    res.status(400).json({ error: 'capabilities must be an array of strings' });
    return;
  }
  if (!isStringArray(serviceAreas)) {
    res.status(400).json({ error: 'serviceAreas must be an array of strings' });
    return;
  }

  const id = randomUUID();
  const memberSinceYear = new Date().getFullYear();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query<BusinessRow>(
      `INSERT INTO businesses (
         id, registered_name, display_name, business_type, category, city, province,
         contact_person, contact_mobile, capabilities, service_areas,
         credibility_status, profile_completion_pct, member_since_year
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING', 100, $12)
       RETURNING ${BUSINESS_COLUMNS}`,
      [
        id,
        registeredName,
        displayName ?? null,
        businessType,
        category,
        city,
        province,
        contactPerson,
        contactMobile,
        capabilities,
        serviceAreas,
        memberSinceYear,
      ],
    );

    const row = rows[0];
    if (!row) {
      throw new Error('business insert returned no row');
    }

    await client.query('UPDATE accounts SET business_id = $1 WHERE id = $2', [id, req.accountId]);

    await client.query('COMMIT');

    // After commit, best effort: onboarding never fails on an embedding-provider error.
    await refreshBusinessEmbeddings(id);

    res.status(201).json(toBusiness(row));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// PATCH /businesses/me — change the caller's capabilities and/or service areas. The old
// embeddings are cleared in the same transaction so a failed re-embed leaves the business
// on fallback matching rather than ranking with vectors of text it no longer has.
businessesRouter.patch('/me', authenticate, async (req, res) => {
  if (!req.businessId) {
    res.status(404).json({ error: 'Account has no business' });
    return;
  }

  const { capabilities, serviceAreas } = req.body as Record<string, unknown>;
  if (capabilities !== undefined && !isStringArray(capabilities)) {
    res.status(400).json({ error: 'capabilities must be an array of strings' });
    return;
  }
  if (serviceAreas !== undefined && !isStringArray(serviceAreas)) {
    res.status(400).json({ error: 'serviceAreas must be an array of strings' });
    return;
  }
  if (capabilities === undefined && serviceAreas === undefined) {
    res.status(400).json({ error: 'Provide capabilities and/or serviceAreas' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE businesses
       SET capabilities = COALESCE($2, capabilities),
           service_areas = COALESCE($3, service_areas),
           capabilities_embedding = NULL
       WHERE id = $1`,
      [req.businessId, capabilities ?? null, serviceAreas ?? null],
    );
    await client.query('DELETE FROM business_capability_embeddings WHERE business_id = $1', [req.businessId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await refreshBusinessEmbeddings(req.businessId);

  const { rows } = await pool.query<BusinessRow>(`SELECT ${BUSINESS_COLUMNS} FROM businesses WHERE id = $1`, [
    req.businessId,
  ]);
  res.json(toBusiness(rows[0] as BusinessRow));
});

businessesRouter.get('/:id', authenticate, async (req, res) => {
  const { rows } = await pool.query<BusinessRow>(
    `SELECT ${BUSINESS_COLUMNS} FROM businesses WHERE id = $1`,
    [req.params.id],
  );
  const row = rows[0];
  if (!row) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  res.json(toBusiness(row));
});
