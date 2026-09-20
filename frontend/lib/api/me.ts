// lib/api/me.ts
// Typed call onto backend/src/routes/me.ts — the authenticated account's own business
// (if it has one), for screens that need to know who's asking. Ownership checks (e.g.
// "is this requirement mine?") are done by comparing `business.id` against a record's
// owning id — never by trusting a route param or query string for that.

import { apiFetch } from './client';
import type { Business, BusinessStatus } from '../types';

export interface Me {
  accountId: string;
  business: Business | null;
  businessStatus: BusinessStatus;
}

export function getMe(): Promise<Me> {
  return apiFetch<Me>('/me');
}
