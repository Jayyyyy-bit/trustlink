// features/business-profile/mock.ts
// Mock data only. No backend yet. Values mirror the design.

import type { Business } from '../../lib/types';

export const mockBusiness: Business = {
  id: 'biz-bayan-logistics',
  registeredName: 'Bayan Logistics Corporation',
  displayName: 'Bayan Logistics Corp.',
  businessType: 'CORPORATION',
  category: 'Transport & Warehousing',
  city: 'Valenzuela City',
  province: 'Metro Manila',
  contactPerson: 'Ramon Bayani',
  contactMobile: '+63 917 402 8815',
  capabilities: [
    'Warehousing',
    'Freight forwarding',
    'Cold chain storage',
    'Last-mile delivery',
    'Customs brokerage',
    'Fleet operations',
  ],
  serviceAreas: ['Valenzuela', 'Quezon City', 'Caloocan', 'Malabon', 'Bulacan', 'Meycauayan'],
  credibility: {
    status: 'VERIFIED',
    verifiedAt: '2025-03-03T09:00:00+08:00',
    recheckDueAt: '2027-03-03T09:00:00+08:00',
    tier: 3,
    requirementsPosted: 14,
    requirementsAwarded: 11,
    quotationsSubmitted: 6,
    quotationsAwarded: 4,
  },
  profileCompletionPct: 100,
  memberSinceYear: 2021,
};
