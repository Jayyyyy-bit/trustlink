// features/quotation/mock.ts
// Mock data only. No backend yet. Values mirror the design.
// Dates are computed relative to Date.now() (day/hour offsets) rather than a hardcoded
// calendar date, the same approach as home-feed/mock.ts, so the countdown and the
// receipt's "submitted" timestamp stay correct whenever this is run.

import type { Business, Requirement, Quotation, LedgerEntry } from '../../lib/types';

function daysFromNow(d: number): string {
  return new Date(Date.now() + d * 86_400_000).toISOString();
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}

/** The business submitting the quotation — the signed-in respondent, not the buyer. */
export const mockRespondentId = 'biz-santiago';

export const mockBuyer: Business = {
  id: 'biz-bayan',
  registeredName: 'Bayan Logistics Corp.',
  displayName: 'Bayan Logistics',
  businessType: 'CORPORATION',
  category: 'Logistics and Warehousing',
  city: 'Calamba',
  province: 'Laguna',
  contactPerson: 'Marisol Ocampo',
  contactMobile: '+63 917 555 0142',
  capabilities: ['Warehousing', 'Freight forwarding', 'Cold chain'],
  serviceAreas: ['Laguna', 'Batangas', 'Cavite'],
  credibility: {
    status: 'VERIFIED',
    verifiedAt: '2025-03-03T09:00:00+08:00',
    recheckDueAt: '2026-03-03T09:00:00+08:00',
    tier: 3,
    requirementsPosted: 18,
    requirementsAwarded: 14,
    quotationsSubmitted: 0,
    quotationsAwarded: 0,
  },
  profileCompletionPct: 100,
  memberSinceYear: 2022,
};

export const mockRequirement: Requirement = {
  id: 'req-0418',
  ref: 'RQ-2026-0418',
  buyerId: 'biz-bayan',
  status: 'OPEN',
  category: 'Metal Fabrication',
  title: 'Fabrication and installation of steel mezzanine platform, 240 sqm',
  scope:
    'Supply, fabrication, delivery, and installation of a structural steel mezzanine platform inside an existing warehouse bay. Work covers shop fabrication of all members, transport to site, erection, welding, and finishing. The warehouse remains in partial operation throughout, so erection must be sequenced around live racking on the east side of the bay.\n\nCivil works, electrical rough-in, and fire suppression are excluded and handled under separate requirements. Respondents are expected to have completed at least one comparable mezzanine or platform installation.',
  specifications: [
    { label: 'Platform area', value: '240 sqm (20.0 m × 12.0 m), clear height 3.2 m beneath' },
    { label: 'Design load', value: '500 kg/sqm uniformly distributed, per NSCP 2015' },
    { label: 'Structure', value: 'ASTM A36 wide-flange beams and columns, fully welded connections' },
    { label: 'Decking', value: '6 mm checkered steel plate, continuously welded to framing' },
    { label: 'Finish', value: 'Epoxy primer plus two coats industrial enamel, mid-grey' },
    { label: 'Access', value: 'One flight of steel stairs, 1.2 m width, handrail both sides' },
  ],
  quantity: 'One platform, 240 sqm — supplied and installed',
  budgetMin: 450000,
  budgetMax: 700000,
  deliverySite: {
    name: 'Bayan Logistics Hub 3',
    address: 'Barangay Canlubang, Calamba, Laguna',
    accessHours: 'Mon–Sat, 7:00 AM – 6:00 PM',
    accessNote: 'Warehouse remains in partial operation',
  },
  deliveryWindow: '15 Sep — 30 Oct 2026',
  attachments: [
    { id: 'a1', filename: 'Structural drawings.pdf', sizeBytes: 4_400_000, mimeType: 'application/pdf', uri: '' },
    { id: 'a2', filename: 'Site photographs.pdf', sizeBytes: 2_900_000, mimeType: 'application/pdf', uri: '' },
    { id: 'a3', filename: 'Load specification.pdf', sizeBytes: 348_000, mimeType: 'application/pdf', uri: '' },
  ],
  closingAt: daysFromNow(21),
  publishedAt: hoursAgo(24 * 19),
  quotationCount: 7,
  lastQuotationAt: hoursAgo(24 * 9),
  awardedQuotationId: null,
};

/** The respondent's own sealed record. Drives the SEALED_RECEIPT state. */
export const mockSubmittedQuotation: Quotation = {
  id: 'q-own',
  ref: 'QT-2026-0407',
  requirementId: 'req-0418',
  respondentId: mockRespondentId,
  status: 'SUBMITTED',
  totalPrice: 486000,
  leadTimeDays: 42,
  paymentTerms: '30 / 60 / 10',
  validityDays: 30,
  notesToBuyer:
    'Shop fabrication at our Cabuyao plant, erection sequenced in two phases so the east racking bay stays live. Includes epoxy primer and enamel finish, and one flight of stairs with handrails both sides.',
  attachments: [
    { id: 'qa1', filename: 'Method statement.pdf', sizeBytes: 1_200_000, mimeType: 'application/pdf', uri: '' },
    { id: 'qa2', filename: 'Bill of quantities.xlsx', sizeBytes: 240_000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uri: '' },
  ],
  submittedAt: minutesAgo(3),
  hashTruncated: '9f4c2a7e',
  ledgerEntryId: 'led-48213',
  integrity: null,
  withdrawnAt: null,
  replacedByQuotationId: null,
};

export const mockLedgerEntry: LedgerEntry = {
  id: 'led-48213',
  sequence: 48213,
  type: 'QUOTATION_SUBMITTED',
  subjectId: 'q-own',
  hash: '9f4c2a7e1b03d55f8a6c2049e71b3fd2',
  previousHash: 'aa30f19c77b45e02d183ca6690f14b77',
  createdAt: mockSubmittedQuotation.submittedAt,
};
