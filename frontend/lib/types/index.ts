// lib/types/index.ts
// Single source of truth for TrustLink. Change only via PR seen by all four.
// Derived from the sealed quotation loop flow specification.

export type ISODateTime = string; // "2026-09-01T14:00:00+08:00"
export type BusinessId = string;
export type RequirementRef = string; // "RQ-0042"
export type QuotationRef = string;   // "QT-0117"

/* ─── Business ──────────────────────────────────────── */

export type BusinessStatus =
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'; // proposed, pending decision 02

export type TrustTier = 1 | 2 | 3;

export type BusinessType =
  | 'SOLE_PROP'
  | 'PARTNERSHIP'
  | 'CORPORATION'
  | 'COOPERATIVE';

/** Seven observed facts. No ratings, no reviews, no response-time averages. */
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
  capabilities: string[];   // 3–8, drives feed matching
  serviceAreas: string[];
  credibility: CredibilityBlock;
}

/* ─── Requirement ───────────────────────────────────── */

export type RequirementStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'CLOSED'          // clock trigger, never a person
  | 'AWARDED'
  | 'CLOSED_NO_AWARD'
  | 'CANCELLED';      // proposed, pending decision 04

export interface SpecRow {
  label: string;
  value: string;
}

export interface DeliverySite {
  name: string;        // "Bayan Logistics Hub 3"
  address: string;     // "Barangay Canlubang, Calamba, Laguna"
  accessHours: string; // "Mon–Sat, 7:00 AM – 6:00 PM"
  accessNote: string;  // "Warehouse remains in partial operation"
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
  budgetMin: number | null;   // PHP, indicative
  budgetMax: number | null;
  deliverySite: DeliverySite;
  deliveryWindow: string;
  attachments: Attachment[];
  closingAt: ISODateTime;     // the only field that fires a platform event
  publishedAt: ISODateTime | null;
  quotationCount: number;     // count only while sealed — never contents
  awardedQuotationId: string | null;
}

/* ─── Quotation ─────────────────────────────────────── */

export type QuotationStatus =
  | 'SUBMITTED'      // only state where withdrawal is possible
  | 'RELEASED'       // clock trigger, all move together
  | 'SHORTLISTED'
  | 'AWARDED'
  | 'NOT_SELECTED'
  | 'WITHDRAWN';

export type IntegrityResult = 'VALID' | 'FLAGGED';

export interface Quotation {
  id: string;
  ref: QuotationRef;
  requirementId: string;
  respondentId: BusinessId;
  status: QuotationStatus;
  totalPrice: number;         // PHP
  leadTimeDays: number;
  paymentTerms: string;
  validityDays: number;
  notesToBuyer: string;
  attachments: Attachment[];
  submittedAt: ISODateTime;
  hashTruncated: string;      // server-computed, display only
  ledgerEntryId: string;
  integrity: IntegrityResult | null;  // null until RELEASED
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

/* ─── Screen state unions ───────────────────────────── */

export type RequirementDetailState =
  | 'RESPONDENT'
  | 'OWNER_SEALED'
  | 'OWNER_RELEASED';

export type QuotationSubmissionState = 'FORM' | 'SEALED_RECEIPT';

export type OnboardingStep = 'IDENTITY' | 'OPERATIONS' | 'DOCUMENTS' | 'ARRIVAL';

export type PostRequirementState = 'FORM' | 'REVIEW';

/** Segmented control on the identity step. Decays; never a profile label. */
export type SignupIntent = 'FIND_SUPPLIERS' | 'FIND_WORK' | 'BOTH';