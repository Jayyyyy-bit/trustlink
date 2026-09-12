// lib/api/businesses.ts
// Typed calls onto backend/src/routes/businesses.ts. Every input/output shape is built
// from the canonical types in lib/types/index.ts — never redefined here.

import { apiFetch } from './client';
import type { Business, BusinessId } from '../types';

export type CreateBusinessInput = Omit<Business, 'id' | 'credibility' | 'profileCompletionPct' | 'memberSinceYear'>;

/** Called once, when onboarding's DOCUMENTS step submits. Leaves the business PENDING —
 *  moving to VERIFIED is a manual step on the backend, not something this call triggers. */
export function createBusiness(input: CreateBusinessInput): Promise<Business> {
  return apiFetch<Business>('/businesses', { method: 'POST', body: input });
}

export function getBusiness(id: BusinessId): Promise<Business> {
  return apiFetch<Business>(`/businesses/${encodeURIComponent(id)}`);
}
