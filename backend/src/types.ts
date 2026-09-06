// src/types.ts
// Mirrors the shapes in frontend/lib/types/index.ts for the four tables this backend
// owns (businesses, requirements, quotations, ledger_entries). Kept as an independent
// copy rather than a cross-package import — frontend and backend ship separately.

export type ISODateTime = string;
export type BusinessId = string;
export type RequirementRef = string;
export type QuotationRef = string;

/* ─── Business ──────────────────────────────────────── */

export type BusinessStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export type TrustTier = 1 | 2 | 3;

export type BusinessType = 'SOLE_PROP' | 'PARTNERSHIP' | 'CORPORATION' | 'COOPERATIVE';

export interface CredibilityBlock {
  status: BusinessStatus;
  verifiedAt: ISODateTime | null;
  recheckDueAt: ISODateTime | null;
  tier: TrustTier | null;
  requirementsPosted: number;
  requirementsAwarded: number;
  quotationsSubmitted: number;
  quotationsAwarded: number;
}

export interface Business {
  id: BusinessId;
  registeredName: string;
  displayName: string | null;
  businessType: BusinessType;
  category: string;
  city: string;
  province: string;
  contactPerson: string;
  contactMobile: string;
  capabilities: string[];
  serviceAreas: string[];
  credibility: CredibilityBlock;
  profileCompletionPct: number;
  memberSinceYear: number;
  /** pgvector embedding of `capabilities`, used for feed-matching similarity search.
   *  Absent until a business has been embedded. */
  capabilitiesEmbedding: number[] | null;
}

/* ─── Requirement ───────────────────────────────────── */

export type RequirementStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'AWARDED' | 'CLOSED_NO_AWARD' | 'CANCELLED';

export interface SpecRow {
  label: string;
  value: string;
}

export interface DeliverySite {
  name: string;
  address: string;
  accessHours: string;
  accessNote: string;
}

export interface Attachment {
  id: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  uri: string;
}

export interface Requirement {
  id: string;
  ref: RequirementRef;
  buyerId: BusinessId;
  status: RequirementStatus;
  category: string;
  title: string;
  scope: string;
  specifications: SpecRow[];
  quantity: string;
  budgetMin: number | null;
  budgetMax: number | null;
  deliverySite: DeliverySite;
  deliveryWindow: string;
  attachments: Attachment[];
  closingAt: ISODateTime;
  publishedAt: ISODateTime | null;
  quotationCount: number;
  lastQuotationAt: ISODateTime | null;
  awardedQuotationId: string | null;
}

/* ─── Quotation ─────────────────────────────────────── */

export type QuotationStatus = 'SUBMITTED' | 'RELEASED' | 'SHORTLISTED' | 'AWARDED' | 'NOT_SELECTED' | 'WITHDRAWN';

export type IntegrityResult = 'VALID' | 'FLAGGED';

export interface Quotation {
  id: string;
  ref: QuotationRef;
  requirementId: string;
  respondentId: BusinessId;
  status: QuotationStatus;
  totalPrice: number;
  leadTimeDays: number;
  paymentTerms: string;
  validityDays: number;
  notesToBuyer: string;
  attachments: Attachment[];
  submittedAt: ISODateTime;
  hashTruncated: string;
  ledgerEntryId: string;
  integrity: IntegrityResult | null;
  withdrawnAt: ISODateTime | null;
  replacedByQuotationId: string | null;
}

/* ─── Ledger ────────────────────────────────────────── */

export type LedgerEntryType =
  | 'REQUIREMENT_PUBLISHED'
  | 'QUOTATION_SUBMITTED'
  | 'QUOTATION_WITHDRAWN'
  | 'REQUIREMENT_CLOSED'
  | 'AWARD_RECORDED';

export interface LedgerEntry {
  id: string;
  sequence: number;
  type: LedgerEntryType;
  subjectId: string;
  hash: string;
  previousHash: string | null;
  createdAt: ISODateTime;
}
