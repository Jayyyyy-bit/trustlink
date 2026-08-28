// features/home-feed/mock.ts
// Mock data only. No backend yet. Values mirror the design.
// All dates are computed relative to Date.now() at import time (hour offsets), the same
// way the source design anchors its countdowns to `t0 = Date.now()` at mount — so the
// feed's "closing soon" / "posted X ago" framing stays correct whenever this is run,
// rather than drifting stale against a hardcoded calendar date.

import type { Business, Requirement, Alert, MessageThread, Message } from '../../lib/types';

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3600_000).toISOString();
}

/* ─── Viewer ────────────────────────────────────────── */

export const mockViewer: Business = {
  id: 'biz-santiago',
  registeredName: 'Santiago Metal Works',
  displayName: null,
  businessType: 'SOLE_PROP',
  category: 'Construction',
  city: 'Quezon City',
  province: 'Metro Manila',
  contactPerson: 'Renato Santiago',
  contactMobile: '+63 917 555 0118',
  capabilities: ['Steel fabrication', 'Metal supply', 'Welding', 'Powder coating'],
  serviceAreas: ['Metro Manila', 'Rizal', 'Bulacan'],
  credibility: {
    status: 'VERIFIED',
    verifiedAt: '2026-02-12T09:00:00+08:00',
    recheckDueAt: '2027-02-12T09:00:00+08:00',
    tier: 2,
    requirementsPosted: 9,
    requirementsAwarded: 6,
    quotationsSubmitted: 34,
    quotationsAwarded: 14,
  },
  profileCompletionPct: 80,
  memberSinceYear: 2024,
};

/* ─── Buyers (other businesses posting requirements) ───── */

function buyer(overrides: Partial<Business> & Pick<Business, 'id' | 'registeredName' | 'category' | 'city'>): Business {
  return {
    displayName: null,
    businessType: 'CORPORATION',
    province: 'Metro Manila',
    contactPerson: 'Procurement Officer',
    contactMobile: '+63 917 555 0100',
    capabilities: [],
    serviceAreas: [],
    credibility: {
      status: 'VERIFIED',
      verifiedAt: '2025-01-01T09:00:00+08:00',
      recheckDueAt: '2026-01-01T09:00:00+08:00',
      tier: 2,
      requirementsPosted: 0,
      requirementsAwarded: 0,
      quotationsSubmitted: 0,
      quotationsAwarded: 0,
    },
    profileCompletionPct: 90,
    memberSinceYear: 2024,
    ...overrides,
  };
}

export const mockRequirementBuyers: Record<string, Business> = {
  'biz-ramos': buyer({
    id: 'biz-ramos', registeredName: 'Ramos Construction Supply', category: 'Construction', city: 'Quezon City',
    credibility: { status: 'VERIFIED', verifiedAt: '2025-11-01T09:00:00+08:00', recheckDueAt: '2026-11-01T09:00:00+08:00', tier: 3, requirementsPosted: 24, requirementsAwarded: 19, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
  'biz-metro-canteen': buyer({
    id: 'biz-metro-canteen', registeredName: 'Metro Canteen Group', category: 'Food Retail', city: 'Mandaluyong',
    credibility: { status: 'VERIFIED', verifiedAt: '2026-03-01T09:00:00+08:00', recheckDueAt: '2027-03-01T09:00:00+08:00', tier: 2, requirementsPosted: 9, requirementsAwarded: 6, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
  'biz-vertex': buyer({
    id: 'biz-vertex', registeredName: 'Vertex Builders Inc.', category: 'Construction', city: 'Pasig',
    credibility: { status: 'VERIFIED', verifiedAt: '2026-01-01T09:00:00+08:00', recheckDueAt: '2027-01-01T09:00:00+08:00', tier: 2, requirementsPosted: 14, requirementsAwarded: 11, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
  'biz-bayanihan': buyer({
    id: 'biz-bayanihan', registeredName: 'Bayanihan Cooperative', category: 'Printing', city: 'Makati', businessType: 'COOPERATIVE',
    credibility: { status: 'VERIFIED', verifiedAt: '2025-08-01T09:00:00+08:00', recheckDueAt: '2026-08-01T09:00:00+08:00', tier: 2, requirementsPosted: 7, requirementsAwarded: 5, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
  'biz-sunrise': buyer({
    id: 'biz-sunrise', registeredName: 'Sunrise Realty Development', category: 'Construction', city: 'Quezon City',
    credibility: { status: 'VERIFIED', verifiedAt: '2025-06-01T09:00:00+08:00', recheckDueAt: '2026-06-01T09:00:00+08:00', tier: 3, requirementsPosted: 31, requirementsAwarded: 27, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
  'biz-lakan': buyer({
    id: 'biz-lakan', registeredName: 'Lakan Trading Corp.', category: 'Services', city: 'Manila',
    credibility: { status: 'VERIFIED', verifiedAt: '2026-04-01T09:00:00+08:00', recheckDueAt: '2027-04-01T09:00:00+08:00', tier: 1, requirementsPosted: 3, requirementsAwarded: 1, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
  'biz-pacific-foods': buyer({
    id: 'biz-pacific-foods', registeredName: 'Pacific Foods PH', category: 'Food Retail', city: 'Valenzuela',
    credibility: { status: 'VERIFIED', verifiedAt: '2025-10-01T09:00:00+08:00', recheckDueAt: '2026-10-01T09:00:00+08:00', tier: 3, requirementsPosted: 18, requirementsAwarded: 15, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
  'biz-northgate': buyer({
    id: 'biz-northgate', registeredName: 'Northgate Industrial Park', category: 'Construction', city: 'Caloocan',
    credibility: { status: 'VERIFIED', verifiedAt: '2026-02-01T09:00:00+08:00', recheckDueAt: '2027-02-01T09:00:00+08:00', tier: 2, requirementsPosted: 11, requirementsAwarded: 8, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
  'biz-aling-nena': buyer({
    id: 'biz-aling-nena', registeredName: "Aling Nena's Bakeshop", category: 'Printing', city: 'Marikina', businessType: 'SOLE_PROP',
    credibility: { status: 'VERIFIED', verifiedAt: '2026-05-01T09:00:00+08:00', recheckDueAt: '2027-05-01T09:00:00+08:00', tier: 1, requirementsPosted: 2, requirementsAwarded: 1, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
  'biz-mabuhay': buyer({
    id: 'biz-mabuhay', registeredName: 'Mabuhay Logistics', category: 'Services', city: 'Parañaque',
    credibility: { status: 'VERIFIED', verifiedAt: '2025-12-01T09:00:00+08:00', recheckDueAt: '2026-12-01T09:00:00+08:00', tier: 2, requirementsPosted: 12, requirementsAwarded: 9, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
  'biz-bayan-builders': buyer({
    id: 'biz-bayan-builders', registeredName: 'Bayan Builders Supply', category: 'Construction', city: 'Quezon City',
    credibility: { status: 'VERIFIED', verifiedAt: '2025-05-01T09:00:00+08:00', recheckDueAt: '2026-05-01T09:00:00+08:00', tier: 3, requirementsPosted: 22, requirementsAwarded: 17, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
  'biz-sagip-pharmacy': buyer({
    id: 'biz-sagip-pharmacy', registeredName: 'Sagip Pharmacy Group', category: 'Printing', city: 'Pasig',
    credibility: { status: 'VERIFIED', verifiedAt: '2025-09-01T09:00:00+08:00', recheckDueAt: '2026-09-01T09:00:00+08:00', tier: 2, requirementsPosted: 6, requirementsAwarded: 4, quotationsSubmitted: 0, quotationsAwarded: 0 },
  }),
};

/* ─── Feed: open requirements from other buyers ────────── */

function req(r: {
  ref: string; buyerId: string; category: string; title: string; scope: string;
  specifications: { label: string; value: string }[]; quantity: string;
  budgetMin: number | null; budgetMax: number | null; siteName: string; siteCity: string;
  deliveryWindow: string; closingInHours: number; publishedHoursAgo: number; quotationCount: number;
  /** Hours since the most recent quotation arrived. Omit to default to a quarter of
   *  publishedHoursAgo; ignored (null) when quotationCount is 0. */
  lastQuotationHoursAgo?: number;
}): Requirement {
  return {
    id: r.ref.toLowerCase(),
    ref: r.ref,
    buyerId: r.buyerId,
    status: 'OPEN',
    category: r.category,
    title: r.title,
    scope: r.scope,
    specifications: r.specifications,
    quantity: r.quantity,
    budgetMin: r.budgetMin,
    budgetMax: r.budgetMax,
    deliverySite: {
      name: r.siteName,
      address: r.siteCity,
      accessHours: 'Mon–Sat, 8:00 AM – 5:00 PM',
      accessNote: '',
    },
    deliveryWindow: r.deliveryWindow,
    attachments: [],
    closingAt: hoursFromNow(r.closingInHours),
    publishedAt: hoursFromNow(-r.publishedHoursAgo),
    quotationCount: r.quotationCount,
    lastQuotationAt:
      r.quotationCount === 0 ? null : hoursFromNow(-(r.lastQuotationHoursAgo ?? r.publishedHoursAgo / 4)),
    awardedQuotationId: null,
  };
}

export const mockRequirements: Requirement[] = [
  req({
    ref: 'RQ-4821', buyerId: 'biz-ramos', category: 'Construction',
    title: 'Rebar and cement supply for a 3-storey commercial build',
    scope: 'Supply of reinforcing steel bar and Portland cement for the structural phase of a 3-storey commercial building. Delivery in three scheduled batches to match the pour schedule.',
    specifications: [{ label: 'Rebar', value: '10mm–20mm deformed bars, ASTM A615' }, { label: 'Cement', value: 'Type 1 Portland, 40kg bags' }],
    quantity: '85 tonnes rebar, 2,400 bags cement', budgetMin: 850000, budgetMax: 1200000,
    siteName: 'Ramos Commercial Build Site', siteCity: 'Quezon City',
    deliveryWindow: 'Staggered over 6 weeks from award',
    closingInHours: 6.4, publishedHoursAgo: 48, quotationCount: 12, lastQuotationHoursAgo: 0.067,
  }),
  req({
    ref: 'RQ-4818', buyerId: 'biz-metro-canteen', category: 'Food Retail',
    title: 'Weekly bread and pastry supply for four canteen branches',
    scope: 'Recurring weekly supply of bread and pastry items across four canteen branches. Early-morning delivery required before service opens.',
    specifications: [{ label: 'Delivery', value: '4 branches, Mon–Sat, before 6:00 AM' }, { label: 'Range', value: 'Pandesal, loaf bread, assorted pastries' }],
    quantity: 'Recurring monthly contract, approx. ₱60K/month', budgetMin: null, budgetMax: 60000,
    siteName: 'Metro Canteen — 4 branches', siteCity: 'Mandaluyong',
    deliveryWindow: 'Ongoing, monthly renewal',
    closingInHours: 52, publishedHoursAgo: 11, quotationCount: 5, lastQuotationHoursAgo: 0.633,
  }),
  req({
    ref: 'RQ-4815', buyerId: 'biz-vertex', category: 'Construction',
    title: 'Scaffolding rental, 30 days, Pasig mid-rise site',
    scope: '30-day scaffolding rental for exterior works on a mid-rise residential site, including erection and dismantling.',
    specifications: [{ label: 'Coverage', value: 'Full building perimeter, 8 storeys' }, { label: 'Duration', value: '30 days, extendable' }],
    quantity: 'One scaffolding system, full perimeter', budgetMin: null, budgetMax: 180000,
    siteName: 'Vertex Pasig Mid-Rise', siteCity: 'Pasig',
    deliveryWindow: 'Erected within 5 days of award',
    closingInHours: 18.2, publishedHoursAgo: 24, quotationCount: 3, lastQuotationHoursAgo: 0.867,
  }),
  req({
    ref: 'RQ-4812', buyerId: 'biz-bayanihan', category: 'Printing',
    title: '5,000 tri-fold brochures, full colour, 150gsm matte',
    scope: 'Print production of tri-fold brochures for a member outreach campaign. Artwork supplied; printing and finishing only.',
    specifications: [{ label: 'Stock', value: '150gsm matte, full colour both sides' }, { label: 'Fold', value: 'Tri-fold, A4 to DL' }],
    quantity: '5,000 units', budgetMin: null, budgetMax: 45000,
    siteName: 'Bayanihan Cooperative Office', siteCity: 'Makati',
    deliveryWindow: 'Within 10 days of award',
    closingInHours: 33, publishedHoursAgo: 48, quotationCount: 8, lastQuotationHoursAgo: 0.35,
  }),
  req({
    ref: 'RQ-4809', buyerId: 'biz-sunrise', category: 'Construction',
    title: 'Ready-mix concrete delivery, 40 cubic metres, staggered',
    scope: 'Staggered delivery of ready-mix concrete for foundation works across three pour dates.',
    specifications: [{ label: 'Mix', value: '3000 psi, 40 cu.m total' }, { label: 'Pours', value: '3 scheduled pours' }],
    quantity: '40 cubic metres', budgetMin: null, budgetMax: 310000,
    siteName: 'Sunrise QC Development', siteCity: 'Quezon City',
    deliveryWindow: '3 pour dates over 2 weeks',
    closingInHours: 102, publishedHoursAgo: 6, quotationCount: 2, lastQuotationHoursAgo: 1.6,
  }),
  req({
    ref: 'RQ-4806', buyerId: 'biz-lakan', category: 'Services',
    title: 'Monthly bookkeeping and BIR filing for a 12-staff enterprise',
    scope: 'Ongoing monthly bookkeeping, payroll support, and BIR filing for a 12-staff trading enterprise.',
    specifications: [{ label: 'Staff count', value: '12' }, { label: 'Filings', value: 'Monthly and quarterly BIR returns' }],
    quantity: 'Recurring monthly service, approx. ₱18K/month', budgetMin: null, budgetMax: 18000,
    siteName: 'Lakan Trading Office', siteCity: 'Manila',
    deliveryWindow: 'Ongoing, monthly renewal',
    closingInHours: 71, publishedHoursAgo: 72, quotationCount: 7, lastQuotationHoursAgo: 0.2,
  }),
  req({
    ref: 'RQ-4803', buyerId: 'biz-pacific-foods', category: 'Food Retail',
    title: 'Cold storage and chilled delivery for frozen goods',
    scope: 'Monthly cold storage capacity plus chilled delivery service for frozen food distribution.',
    specifications: [{ label: 'Storage', value: '-18°C, minimum 40 pallet positions' }, { label: 'Delivery', value: 'Chilled truck, twice weekly' }],
    quantity: 'Recurring monthly contract, approx. ₱120K/month', budgetMin: null, budgetMax: 120000,
    siteName: 'Pacific Foods Distribution Hub', siteCity: 'Valenzuela',
    deliveryWindow: 'Ongoing, monthly renewal',
    closingInHours: 22.5, publishedHoursAgo: 24, quotationCount: 9, lastQuotationHoursAgo: 0.117,
  }),
  req({
    ref: 'RQ-4799', buyerId: 'biz-northgate', category: 'Construction',
    title: 'Electrical fit-out for a 400 sqm warehouse conversion',
    scope: 'Full electrical fit-out for the conversion of a 400 sqm warehouse bay into light-industrial use.',
    specifications: [{ label: 'Area', value: '400 sqm' }, { label: 'Scope', value: 'Panel upgrade, wiring, lighting, outlets' }],
    quantity: 'One warehouse bay, 400 sqm', budgetMin: null, budgetMax: 640000,
    siteName: 'Northgate Industrial Park — Bay 4', siteCity: 'Caloocan',
    deliveryWindow: 'Completed within 6 weeks of award',
    closingInHours: 60, publishedHoursAgo: 4, quotationCount: 6, lastQuotationHoursAgo: 0.55,
  }),
  req({
    ref: 'RQ-4795', buyerId: 'biz-aling-nena', category: 'Printing',
    title: 'Branded packaging boxes, 2,000 units, food-grade',
    scope: 'Food-grade branded packaging boxes for retail bakery products, printed one colour.',
    specifications: [{ label: 'Material', value: 'Food-grade kraft board' }, { label: 'Print', value: 'One colour, single side' }],
    quantity: '2,000 units', budgetMin: null, budgetMax: 75000,
    siteName: "Aling Nena's Bakeshop", siteCity: 'Marikina',
    deliveryWindow: 'Within 15 days of award',
    closingInHours: 118, publishedHoursAgo: 120, quotationCount: 1, lastQuotationHoursAgo: 2.333,
  }),
  req({
    ref: 'RQ-4791', buyerId: 'biz-mabuhay', category: 'Services',
    title: 'Preventive maintenance contract for six delivery vans',
    scope: 'Quarterly preventive maintenance contract covering six delivery vans across the fleet.',
    specifications: [{ label: 'Fleet', value: '6 delivery vans' }, { label: 'Cadence', value: 'Quarterly service' }],
    quantity: 'Recurring quarterly contract, approx. ₱95K/quarter', budgetMin: null, budgetMax: 95000,
    siteName: 'Mabuhay Logistics Yard', siteCity: 'Parañaque',
    deliveryWindow: 'Ongoing, quarterly renewal',
    closingInHours: 11.6, publishedHoursAgo: 24, quotationCount: 4, lastQuotationHoursAgo: 0.433,
  }),
];

/* ─── Viewer's own posted requirements ─────────────────── */

export const mockMyRequirements: Requirement[] = [
  req({
    ref: 'RQ-4776', buyerId: 'biz-santiago', category: 'Construction',
    title: 'Powder coating service for 200 steel railings',
    scope: 'Powder coating for 200 fabricated steel railings ahead of site installation.',
    specifications: [{ label: 'Units', value: '200 railings' }, { label: 'Finish', value: 'Powder coat, matte black' }],
    quantity: '200 railings', budgetMin: null, budgetMax: 120000,
    siteName: 'Santiago Metal Works Shop', siteCity: 'Quezon City',
    deliveryWindow: 'Within 2 weeks of award',
    closingInHours: 9, publishedHoursAgo: 72, quotationCount: 7,
  }),
  req({
    ref: 'RQ-4742', buyerId: 'biz-santiago', category: 'Construction',
    title: 'Bulk galvanised sheet supply, monthly contract',
    scope: 'Recurring monthly supply of galvanised sheet stock for the fabrication shop.',
    specifications: [{ label: 'Gauge', value: '18–22 gauge GI sheet' }, { label: 'Cadence', value: 'Monthly delivery' }],
    quantity: 'Recurring monthly contract, approx. ₱240K/month', budgetMin: null, budgetMax: 240000,
    siteName: 'Santiago Metal Works Shop', siteCity: 'Quezon City',
    deliveryWindow: 'Ongoing, monthly renewal',
    closingInHours: 240, publishedHoursAgo: 144, quotationCount: 11,
  }),
  req({
    ref: 'RQ-4688', buyerId: 'biz-santiago', category: 'Services',
    title: 'Delivery truck rental for a 2-week haul',
    scope: 'Short-term truck rental to cover a 2-week haul of fabricated steel to a provincial site.',
    specifications: [{ label: 'Duration', value: '2 weeks' }, { label: 'Vehicle', value: '6-wheeler closed van' }],
    quantity: 'One 6-wheeler, 2 weeks', budgetMin: null, budgetMax: 48000,
    siteName: 'Santiago Metal Works Shop', siteCity: 'Quezon City',
    deliveryWindow: 'Completed',
    closingInHours: -288, publishedHoursAgo: 480, quotationCount: 4,
  }),
];
mockMyRequirements[0].status = 'OPEN';
mockMyRequirements[1].status = 'OPEN';
mockMyRequirements[2].status = 'AWARDED';
mockMyRequirements[2].awardedQuotationId = 'q-mock-awarded';

/* ─── Recently closed (other buyers, last 7 days) ──────── */

export const mockRecentlyClosed: Requirement[] = [
  req({
    ref: 'RQ-4770', buyerId: 'biz-bayan-builders', category: 'Construction',
    title: 'Steel roof trusses for a 220 sqm workshop',
    scope: 'Fabrication and installation of steel roof trusses for a 220 sqm workshop extension.',
    specifications: [{ label: 'Area', value: '220 sqm' }, { label: 'Structure', value: 'Steel roof trusses' }],
    quantity: 'One roof structure, 220 sqm', budgetMin: null, budgetMax: 410000,
    siteName: 'Bayan Builders Workshop', siteCity: 'Quezon City',
    deliveryWindow: 'Completed',
    closingInHours: -48, publishedHoursAgo: 288, quotationCount: 9,
  }),
  req({
    ref: 'RQ-4763', buyerId: 'biz-sagip-pharmacy', category: 'Printing',
    title: 'Vinyl signage for 6 branch storefronts',
    scope: 'Production and installation of vinyl storefront signage across 6 pharmacy branches.',
    specifications: [{ label: 'Branches', value: '6' }, { label: 'Material', value: 'Vinyl, backlit' }],
    quantity: '6 storefront signs', budgetMin: null, budgetMax: 88000,
    siteName: 'Sagip Pharmacy — 6 branches', siteCity: 'Pasig',
    deliveryWindow: 'Completed',
    closingInHours: -96, publishedHoursAgo: 336, quotationCount: 6,
  }),
  req({
    ref: 'RQ-4758', buyerId: 'biz-northgate', category: 'Services',
    title: 'Night-shift security detail for a warehouse yard',
    scope: 'Ongoing night-shift security detail for a warehouse yard, monthly contract.',
    specifications: [{ label: 'Shift', value: 'Night, 6 days/week' }, { label: 'Headcount', value: '2 guards' }],
    quantity: 'Recurring monthly contract, approx. ₱150K/month', budgetMin: null, budgetMax: 150000,
    siteName: 'Northgate Industrial Park', siteCity: 'Caloocan',
    deliveryWindow: 'Closed without award',
    closingInHours: -120, publishedHoursAgo: 360, quotationCount: 0,
  }),
  req({
    ref: 'RQ-4751', buyerId: 'biz-metro-canteen', category: 'Food Retail',
    title: 'Rice supply contract, 2 tonnes monthly',
    scope: 'Recurring monthly rice supply for canteen operations, 2 tonnes per month.',
    specifications: [{ label: 'Volume', value: '2 tonnes/month' }, { label: 'Grade', value: 'Well-milled, premium' }],
    quantity: 'Recurring monthly contract, approx. ₱190K/month', budgetMin: null, budgetMax: 190000,
    siteName: 'Metro Canteen — 4 branches', siteCity: 'Mandaluyong',
    deliveryWindow: 'Completed',
    closingInHours: -144, publishedHoursAgo: 384, quotationCount: 14,
  }),
];
mockRecentlyClosed[0].status = 'AWARDED';
// Awarded to the viewer (Santiago Metal Works) — the one recently-closed listing the
// viewer was actually the winning respondent on, which is what opens mockMessageThreads'
// thread-bayan-builders below. The other three are other businesses' outcomes, shown for
// market visibility only — the viewer was never a party to them, so no thread exists.
mockRecentlyClosed[0].awardedQuotationId = 'q-4770-santiago';
mockRecentlyClosed[1].status = 'AWARDED';
mockRecentlyClosed[2].status = 'CLOSED_NO_AWARD';
mockRecentlyClosed[3].status = 'AWARDED';

/* ─── Alerts ────────────────────────────────────────── */

export const mockAlerts: Alert[] = [
  { id: 'alert-1', type: 'REQUIREMENT_CLOSING', title: 'Your requirement is closing soon', detail: 'RQ-4776 · Powder coating service for 200 steel railings · 9 hours remaining', createdAt: hoursFromNow(-0.3), urgent: true, read: false },
  { id: 'alert-2', type: 'QUOTATION_RECEIVED', title: 'New quotation received', detail: 'Ramos Construction Supply · RQ-4821 · Rebar and cement supply', createdAt: hoursFromNow(-1), urgent: false, read: false },
  { id: 'alert-3', type: 'DECISION', title: 'Your quotation was shortlisted', detail: 'Vertex Builders Inc. · RQ-4815 · Scaffolding rental, 30 days', createdAt: hoursFromNow(-4), urgent: false, read: false },
  { id: 'alert-4', type: 'DECISION', title: 'Your quotation was awarded', detail: 'Bayan Builders Supply · RQ-4770 · Steel roof trusses, 220 sqm workshop', createdAt: hoursFromNow(-24), urgent: false, read: false },
  { id: 'alert-5', type: 'VERIFICATION', title: 'Your business verification was approved', detail: 'Santiago Metal Works · DTI and BIR records checked · valid to Feb 2027', createdAt: hoursFromNow(-72), urgent: false, read: true },
  { id: 'alert-6', type: 'VERIFICATION', title: 'Trust Tier increased to Tier 2', detail: 'Santiago Metal Works · based on verified documents and 6 awarded requirements', createdAt: hoursFromNow(-144), urgent: false, read: true },
];

/* ─── Message threads ─────────────────────────────────
 * A thread exists only once a requirement is awarded, between the buyer and the awarded
 * respondent — see the note on MessageThread. Every entry below traces to a requirement in
 * this file that is actually status 'AWARDED' with the viewer on one side of that award:
 * thread-coastal-freight is the viewer's own posted requirement (RQ-4688, viewer as buyer,
 * awardedQuotationId 'q-mock-awarded' from mockMyRequirements above); thread-bayan-builders
 * is a requirement the viewer won as respondent (RQ-4770, awardedQuotationId
 * 'q-4770-santiago' from mockRecentlyClosed above). No thread references an OPEN
 * requirement — there is nothing to negotiate before an award exists. */

export const mockMessageThreads: MessageThread[] = [
  {
    id: 'thread-coastal-freight',
    requirementId: 'rq-4688',
    requirementRef: 'RQ-4688',
    awardedQuotationId: 'q-mock-awarded',
    counterpartyId: 'biz-coastal-freight',
    counterpartyName: 'Coastal Freight Rentals',
    lastMessagePreview: "7:00 AM works on our end. I'll send the driver's contact once confirmed.",
    lastMessageAt: hoursFromNow(-26),
    unread: false,
  },
  {
    id: 'thread-bayan-builders',
    requirementId: 'rq-4770',
    requirementRef: 'RQ-4770',
    awardedQuotationId: 'q-4770-santiago',
    counterpartyId: 'biz-bayan-builders',
    counterpartyName: 'Bayan Builders Supply',
    lastMessagePreview: 'Awarded. Please send the sales invoice when you get a chance.',
    lastMessageAt: hoursFromNow(-1 / 15),
    unread: true,
  },
];

export const mockMessagesByThread: Record<string, Message[]> = {
  'thread-coastal-freight': [
    { id: 'msg-cf-1', threadId: 'thread-coastal-freight', senderId: 'biz-coastal-freight', body: 'Thank you for the award — we can mobilize the truck starting Monday.', sentAt: hoursFromNow(-30), read: true },
    { id: 'msg-cf-2', threadId: 'thread-coastal-freight', senderId: 'biz-santiago', body: 'Great, please confirm the exact pickup time.', sentAt: hoursFromNow(-28), read: true },
    { id: 'msg-cf-3', threadId: 'thread-coastal-freight', senderId: 'biz-coastal-freight', body: "7:00 AM works on our end. I'll send the driver's contact once confirmed.", sentAt: hoursFromNow(-26), read: true },
  ],
  'thread-bayan-builders': [
    { id: 'msg-bb-1', threadId: 'thread-bayan-builders', senderId: 'biz-bayan-builders', body: 'Congratulations — you were awarded the roof truss job. Looking forward to working with you.', sentAt: hoursFromNow(-1), read: true },
    { id: 'msg-bb-2', threadId: 'thread-bayan-builders', senderId: 'biz-bayan-builders', body: 'Awarded. Please send the sales invoice when you get a chance.', sentAt: hoursFromNow(-1 / 15), read: false },
  ],
};
