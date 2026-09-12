// lib/api/quotations.ts
// Typed calls onto backend/src/routes/quotations.ts. Every input/output shape is built
// from the canonical types in lib/types/index.ts — never redefined here.
//
// POST /quotations deliberately returns far less than a `Quotation` — reference, timestamp,
// truncated hash, ledger sequence, nothing else. That's the sealed rule enforced server-side:
// hashing and ledger recording happen there, never on the device, so there is no fuller
// object to hand back. `QuotationReceipt` names exactly that shape; nothing here ever widens
// it into a fabricated `Quotation`.

import { apiFetch } from './client';
import type {
  Business,
  BusinessId,
  ISODateTime,
  LedgerEntry,
  Quotation,
  QuotationRef,
  Requirement,
  RequirementRef,
} from '../types';

export type SubmitQuotationInput = Pick<
  Quotation,
  'totalPrice' | 'leadTimeDays' | 'paymentTerms' | 'validityDays' | 'notesToBuyer' | 'attachments'
> & {
  requirementRef: RequirementRef;
};

export interface QuotationReceipt {
  ref: QuotationRef;
  submittedAt: ISODateTime;
  hashTruncated: string;
  sequence: number;
}

export function submitQuotation(input: SubmitQuotationInput): Promise<QuotationReceipt> {
  return apiFetch<QuotationReceipt>('/quotations', { method: 'POST', body: input });
}

export function withdrawQuotation(ref: QuotationRef): Promise<Quotation> {
  return apiFetch<Quotation>(`/quotations/${encodeURIComponent(ref)}/withdraw`, { method: 'POST' });
}

/** Everything MyQuotations.tsx (and RequirementDetail.tsx's respondent/hasSubmitted view)
 *  needs about the caller's own quotations — each one's requirement, that requirement's
 *  buyer, and its full ledger entry, keyed for direct lookup. All real, joined server-side
 *  (see GET /quotations/mine) — a respondent is always entitled to this much about their
 *  own quotation. `ledgerEntries` only omits an entry if the join genuinely found none. */
export interface MyQuotationsData {
  quotations: Quotation[];
  requirements: Record<string, Requirement>;
  buyers: Record<BusinessId, Business>;
  ledgerEntries: Record<string, LedgerEntry>;
}

interface MineResponseRow extends Quotation {
  requirement: Requirement;
  buyer: Business;
  ledger: LedgerEntry | null;
}

export async function getMyQuotations(): Promise<MyQuotationsData> {
  const rows = await apiFetch<MineResponseRow[]>('/quotations/mine');

  const quotations: Quotation[] = [];
  const requirements: Record<string, Requirement> = {};
  const buyers: Record<BusinessId, Business> = {};
  const ledgerEntries: Record<string, LedgerEntry> = {};

  for (const { requirement, buyer, ledger, ...quotation } of rows) {
    quotations.push(quotation);
    requirements[requirement.id] = requirement;
    buyers[buyer.id] = buyer;
    if (ledger) ledgerEntries[quotation.id] = ledger;
  }

  return { quotations, requirements, buyers, ledgerEntries };
}
