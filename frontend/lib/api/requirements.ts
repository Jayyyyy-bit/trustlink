// lib/api/requirements.ts
// Typed calls onto backend/src/routes/requirements.ts. Every input/output shape is built
// from the canonical types in lib/types/index.ts — never redefined here.

import { apiFetch } from './client';
import type { Quotation, Requirement, RequirementRef } from '../types';

export type CreateRequirementInput = Pick<
  Requirement,
  | 'category'
  | 'title'
  | 'scope'
  | 'specifications'
  | 'quantity'
  | 'budgetMin'
  | 'budgetMax'
  | 'deliverySite'
  | 'deliveryWindow'
  | 'attachments'
  | 'closingAt'
>;

/** The open feed — never includes the caller's own requirements. */
export function listRequirements(): Promise<Requirement[]> {
  return apiFetch<Requirement[]>('/requirements');
}

/** Create + publish are one step on the backend — there is no draft-save route. */
export function createRequirement(input: CreateRequirementInput): Promise<Requirement> {
  return apiFetch<Requirement>('/requirements', { method: 'POST', body: input });
}

/** The owner sees quotation contents only once closing has passed — everyone else, and the
 *  owner before closing, gets back a plain `Requirement` with no `quotations` field. */
export function getRequirement(
  ref: RequirementRef,
): Promise<Requirement | (Requirement & { quotations: Quotation[] })> {
  return apiFetch(`/requirements/${encodeURIComponent(ref)}`);
}
