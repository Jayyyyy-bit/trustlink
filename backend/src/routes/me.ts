// src/routes/me.ts
// GET /me — the authenticated account's own business (if it has one), its credibility
// block, and its status. Exists so callers can establish who they are server-side —
// e.g. to decide whether they own a given requirement — instead of trusting a route
// param or query string for that. Reuses the same row shape, columns, and mapper as
// GET /businesses/:id (src/routes/businesses.ts); this is that same read, scoped to
// the caller's own business_id from `authenticate` instead of an arbitrary :id.

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { pool } from '../db/pool';
import { BUSINESS_COLUMNS, toBusiness, type BusinessRow } from './businesses';
import type { Business, BusinessStatus } from '../types';

export const meRouter = Router();

export interface MeResponse {
  accountId: string;
  business: Business | null;
  businessStatus: BusinessStatus;
}

meRouter.get('/', authenticate, async (req, res) => {
  const accountId = req.accountId as string;
  const businessStatus = req.businessStatus as BusinessStatus;

  if (!req.businessId) {
    res.json({ accountId, business: null, businessStatus } satisfies MeResponse);
    return;
  }

  const { rows } = await pool.query<BusinessRow>(
    `SELECT ${BUSINESS_COLUMNS} FROM businesses WHERE id = $1`,
    [req.businessId],
  );
  const row = rows[0];

  res.json({
    accountId,
    business: row ? toBusiness(row) : null,
    businessStatus,
  } satisfies MeResponse);
});
