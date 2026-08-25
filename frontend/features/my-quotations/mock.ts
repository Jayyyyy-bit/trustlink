// features/my-quotations/mock.ts
// Mock data only. No backend yet. Dates are computed relative to Date.now() (day/hour
// offsets), the same approach as the other features' mock.ts files, so countdowns and
// "time ago" phrasing stay correct whenever this is run.

import type { Business, BusinessId, Quotation, Requirement } from '../../lib/types';

function daysFromNow(d: number): string {
  return new Date(Date.now() + d * 86_400_000).toISOString();
}

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3_600_000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86_400_000).toISOString();
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

/** The business whose quotations these are — the signed-in respondent. */
export const mockRespondentId = 'biz-santiago';

function buyer(overrides: Partial<Business> & Pick<Business, 'id' | 'registeredName' | 'category' | 'city' | 'province'>): Business {
  return {
    displayName: null,
    businessType: 'CORPORATION',
    contactPerson: 'Procurement Officer',
    contactMobile: '+63 917 555 0100',
    capabilities: [],
    serviceAreas: [],
    credibility: {
      status: 'VERIFIED',
      verifiedAt: '2025-06-01T09:00:00+08:00',
      recheckDueAt: '2026-06-01T09:00:00+08:00',
      tier: 2,
      requirementsPosted: 0,
      requirementsAwarded: 0,
      quotationsSubmitted: 0,
      quotationsAwarded: 0,
    },
    profileCompletionPct: 90,
    memberSinceYear: 2023,
    ...overrides,
  };
}

export const mockBuyers: Record<BusinessId, Business> = {
  'biz-coldline': buyer({ id: 'biz-coldline', registeredName: 'Coldline Distribution Inc.', category: 'Logistics', city: 'Muntinlupa', province: 'Metro Manila' }),
  'biz-vertex': buyer({ id: 'biz-vertex', registeredName: 'Vertex Builders Inc.', category: 'Construction', city: 'Pasig', province: 'Metro Manila', credibility: { status: 'VERIFIED', verifiedAt: '2026-01-01T09:00:00+08:00', recheckDueAt: '2027-01-01T09:00:00+08:00', tier: 2, requirementsPosted: 14, requirementsAwarded: 11, quotationsSubmitted: 0, quotationsAwarded: 0 } }),
  'biz-northgate': buyer({ id: 'biz-northgate', registeredName: 'Northgate Industrial Park', category: 'Construction', city: 'Caloocan', province: 'Metro Manila' }),
  'biz-orchard': buyer({ id: 'biz-orchard', registeredName: 'Orchard Retail Fit-Outs', category: 'Services', city: 'Taguig', province: 'Metro Manila' }),
  'biz-sunrise': buyer({ id: 'biz-sunrise', registeredName: 'Sunrise Realty Development', category: 'Construction', city: 'Quezon City', province: 'Metro Manila', credibility: { status: 'VERIFIED', verifiedAt: '2025-06-01T09:00:00+08:00', recheckDueAt: '2026-06-01T09:00:00+08:00', tier: 3, requirementsPosted: 31, requirementsAwarded: 27, quotationsSubmitted: 0, quotationsAwarded: 0 } }),
  'biz-mabuhay': buyer({ id: 'biz-mabuhay', registeredName: 'Mabuhay Logistics', category: 'Services', city: 'Parañaque', province: 'Metro Manila' }),
  'biz-bayan': buyer({ id: 'biz-bayan', registeredName: 'Bayan Logistics Corp.', category: 'Logistics and Warehousing', city: 'Calamba', province: 'Laguna', credibility: { status: 'VERIFIED', verifiedAt: '2025-03-03T09:00:00+08:00', recheckDueAt: '2026-03-03T09:00:00+08:00', tier: 3, requirementsPosted: 18, requirementsAwarded: 14, quotationsSubmitted: 0, quotationsAwarded: 0 } }),
};

function req(r: {
  id: string; ref: string; buyerId: string; category: string; title: string; siteAddress: string;
  budgetMin: number | null; budgetMax: number | null; deliveryWindow: string;
  status: Requirement['status']; closingAt: string; publishedHoursAgo: number; quotationCount: number;
}): Requirement {
  return {
    id: r.id,
    ref: r.ref,
    buyerId: r.buyerId,
    status: r.status,
    category: r.category,
    title: r.title,
    scope: '',
    specifications: [],
    quantity: '',
    budgetMin: r.budgetMin,
    budgetMax: r.budgetMax,
    deliverySite: { name: '', address: r.siteAddress, accessHours: '', accessNote: '' },
    deliveryWindow: r.deliveryWindow,
    attachments: [],
    closingAt: r.closingAt,
    publishedAt: hoursAgo(r.publishedHoursAgo),
    quotationCount: r.quotationCount,
    lastQuotationAt: null,
    awardedQuotationId: null,
  };
}

export const mockRequirements: Record<string, Requirement> = {
  'req-gate': req({
    id: 'req-gate', ref: 'RQ-2026-0521', buyerId: 'biz-northgate', category: 'Construction',
    title: 'Structural steel gate fabrication, 12 m span',
    siteAddress: 'Caloocan', budgetMin: null, budgetMax: 95000,
    deliveryWindow: 'Within 3 weeks of award', status: 'OPEN',
    closingAt: hoursFromNow(6), publishedHoursAgo: 96, quotationCount: 4,
  }),
  'req-chilled': req({
    id: 'req-chilled', ref: 'RQ-2026-0518', buyerId: 'biz-coldline', category: 'Logistics',
    title: 'Chilled delivery van rental, 3-month contract',
    siteAddress: 'Muntinlupa', budgetMin: null, budgetMax: 210000,
    deliveryWindow: 'Ongoing, monthly renewal', status: 'OPEN',
    closingAt: daysFromNow(2), publishedHoursAgo: 48, quotationCount: 6,
  }),
  'req-rebar': req({
    id: 'req-rebar', ref: 'RQ-2026-0480', buyerId: 'biz-vertex', category: 'Construction',
    title: 'Rebar and cement supply, mid-rise foundation phase',
    siteAddress: 'Pasig', budgetMin: 600000, budgetMax: 900000,
    deliveryWindow: 'Staggered over 6 weeks from award', status: 'OPEN',
    closingAt: daysFromNow(9), publishedHoursAgo: 240, quotationCount: 5,
  }),
  'req-racking': req({
    id: 'req-racking', ref: 'RQ-2026-0455', buyerId: 'biz-mabuhay', category: 'Construction',
    title: 'Warehouse racking installation, 900 sqm floor',
    siteAddress: 'Parañaque', budgetMin: null, budgetMax: 340000,
    deliveryWindow: 'Completed within 4 weeks of award', status: 'CLOSED',
    closingAt: daysAgo(3), publishedHoursAgo: 480, quotationCount: 8,
  }),
  'req-fitout': req({
    id: 'req-fitout', ref: 'RQ-2026-0447', buyerId: 'biz-orchard', category: 'Services',
    title: 'Office fit-out electrical works, 3 floors',
    siteAddress: 'Taguig', budgetMin: null, budgetMax: 95000,
    deliveryWindow: 'Within 5 weeks of award', status: 'CLOSED',
    closingAt: daysAgo(5), publishedHoursAgo: 552, quotationCount: 6,
  }),
  'req-fence': req({
    id: 'req-fence', ref: 'RQ-2026-0410', buyerId: 'biz-sunrise', category: 'Construction',
    title: 'Perimeter fencing, 180 linear metres',
    siteAddress: 'Quezon City', budgetMin: null, budgetMax: 230000,
    deliveryWindow: 'Completed', status: 'AWARDED',
    closingAt: daysAgo(10), publishedHoursAgo: 720, quotationCount: 7,
  }),
  'req-dock': req({
    id: 'req-dock', ref: 'RQ-2026-0398', buyerId: 'biz-coldline', category: 'Logistics',
    title: 'Loading dock leveler supply, 4 units',
    siteAddress: 'Muntinlupa', budgetMin: null, budgetMax: 190000,
    deliveryWindow: 'Completed', status: 'AWARDED',
    closingAt: daysAgo(12), publishedHoursAgo: 840, quotationCount: 9,
  }),
};

export const mockQuotations: Quotation[] = [
  {
    id: 'q-gate', ref: 'QT-2026-0602', requirementId: 'req-gate', respondentId: mockRespondentId,
    status: 'SUBMITTED', totalPrice: 62000, leadTimeDays: 21, paymentTerms: '50 / 50', validityDays: 30,
    notesToBuyer: '', attachments: [], submittedAt: daysAgo(1),
    hashTruncated: 'b7c1e94a', ledgerEntryId: 'led-1', integrity: null, withdrawnAt: null, replacedByQuotationId: null,
  },
  {
    id: 'q-chilled', ref: 'QT-2026-0599', requirementId: 'req-chilled', respondentId: mockRespondentId,
    status: 'SUBMITTED', totalPrice: 145000, leadTimeDays: 7, paymentTerms: '30 / 60 / 10', validityDays: 30,
    notesToBuyer: '', attachments: [], submittedAt: hoursAgo(2),
    hashTruncated: 'e214f7a2', ledgerEntryId: 'led-2', integrity: null, withdrawnAt: null, replacedByQuotationId: null,
  },
  {
    id: 'q-rebar-2', ref: 'QT-2026-0591', requirementId: 'req-rebar', respondentId: mockRespondentId,
    status: 'SUBMITTED', totalPrice: 812000, leadTimeDays: 42, paymentTerms: '30 / 60 / 10', validityDays: 30,
    notesToBuyer: '', attachments: [], submittedAt: daysAgo(4),
    hashTruncated: 'af02c318', ledgerEntryId: 'led-4', integrity: null, withdrawnAt: null, replacedByQuotationId: null,
  },
  {
    id: 'q-rebar-1', ref: 'QT-2026-0560', requirementId: 'req-rebar', respondentId: mockRespondentId,
    status: 'WITHDRAWN', totalPrice: 845000, leadTimeDays: 45, paymentTerms: '30 / 60 / 10', validityDays: 30,
    notesToBuyer: '', attachments: [], submittedAt: daysAgo(6),
    hashTruncated: '5d9a10bb', ledgerEntryId: 'led-3', integrity: null, withdrawnAt: daysAgo(4), replacedByQuotationId: 'q-rebar-2',
  },
  {
    id: 'q-racking', ref: 'QT-2026-0512', requirementId: 'req-racking', respondentId: mockRespondentId,
    status: 'SHORTLISTED', totalPrice: 310000, leadTimeDays: 28, paymentTerms: '20 / 70 / 10', validityDays: 30,
    notesToBuyer: '', attachments: [], submittedAt: daysAgo(9),
    hashTruncated: '2b6f88d4', ledgerEntryId: 'led-5', integrity: 'VALID', withdrawnAt: null, replacedByQuotationId: null,
  },
  {
    id: 'q-fitout', ref: 'QT-2026-0498', requirementId: 'req-fitout', respondentId: mockRespondentId,
    status: 'RELEASED', totalPrice: 88000, leadTimeDays: 35, paymentTerms: '50 / 50', validityDays: 15,
    notesToBuyer: '', attachments: [], submittedAt: daysAgo(11),
    hashTruncated: '9c4a7710', ledgerEntryId: 'led-6', integrity: 'VALID', withdrawnAt: null, replacedByQuotationId: null,
  },
  {
    id: 'q-fence', ref: 'QT-2026-0450', requirementId: 'req-fence', respondentId: mockRespondentId,
    status: 'AWARDED', totalPrice: 210000, leadTimeDays: 30, paymentTerms: '30 / 60 / 10', validityDays: 30,
    notesToBuyer: '', attachments: [], submittedAt: daysAgo(16),
    hashTruncated: '117f6a2e', ledgerEntryId: 'led-7', integrity: 'VALID', withdrawnAt: null, replacedByQuotationId: null,
  },
  {
    id: 'q-dock', ref: 'QT-2026-0431', requirementId: 'req-dock', respondentId: mockRespondentId,
    status: 'NOT_SELECTED', totalPrice: 175000, leadTimeDays: 14, paymentTerms: '100% on completion', validityDays: 15,
    notesToBuyer: '', attachments: [], submittedAt: daysAgo(18),
    hashTruncated: 'cc850a91', ledgerEntryId: 'led-8', integrity: 'VALID', withdrawnAt: null, replacedByQuotationId: null,
  },
];
