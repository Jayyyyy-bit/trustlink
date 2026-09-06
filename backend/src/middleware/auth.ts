// src/middleware/auth.ts
// `authenticate` verifies the access token and attaches the account's business
// context to the request. `requireVerifiedBusiness` is a second, separate gate for
// routes that must not run until that business is VERIFIED (posting a requirement,
// submitting a quotation) — kept apart from `authenticate` so routes that only need
// to know who's asking (without requiring VERIFIED) can use one but not the other.

import type { NextFunction, Request, Response } from 'express';
import { pool } from '../db/pool';
import { verifyAccessToken } from '../lib/tokens';
import type { BusinessStatus } from '../types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      accountId?: string;
      businessId?: string | null;
      businessStatus?: BusinessStatus;
    }
  }
}

interface AccountBusinessRow {
  business_id: string | null;
  credibility_status: BusinessStatus | null;
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.header('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired access token' });
    return;
  }

  const { rows } = await pool.query<AccountBusinessRow>(
    `SELECT a.business_id, b.credibility_status
     FROM accounts a
     LEFT JOIN businesses b ON b.id = a.business_id
     WHERE a.id = $1`,
    [payload.accountId],
  );

  const row = rows[0];
  if (!row) {
    res.status(401).json({ error: 'Account no longer exists' });
    return;
  }

  req.accountId = payload.accountId;
  req.businessId = row.business_id;
  req.businessStatus = row.business_id ? row.credibility_status ?? 'UNVERIFIED' : 'UNVERIFIED';
  next();
}

export function requireVerifiedBusiness(req: Request, res: Response, next: NextFunction): void {
  if (req.businessStatus !== 'VERIFIED') {
    res.status(403).json({ error: 'Business is not verified' });
    return;
  }
  next();
}
