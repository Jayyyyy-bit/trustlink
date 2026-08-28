// features/post-requirement/mock.ts
// Mock data only. No backend yet. Values mirror the design and the poster used across the
// rest of the app's mocks (home-feed/mock.ts's mockViewer) so a requirement drafted here
// reads as posted by the same business the signed-in shell already shows.

import type { Business } from '../../lib/types';

export const mockPoster: Business = {
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

/** Same six categories onboarding offers — a business posting a requirement chooses from
 *  the same list it picked its own industry category from. */
export const CATEGORIES = [
  'Construction',
  'Food Retail',
  'Printing & Packaging',
  'Logistics and Warehousing',
  'Professional Services',
  'Electrical & Electronics',
];
