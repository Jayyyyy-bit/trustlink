// features/business-profile/format.ts
import type { BusinessStatus, BusinessType, ISODateTime, TrustTier } from '../../lib/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: ISODateTime): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function tierLabel(tier: TrustTier | null): string {
  return tier === null ? 'Unrated' : `Tier ${tier}`;
}

export function businessTypeLabel(type: BusinessType): string {
  switch (type) {
    case 'SOLE_PROP': return 'Sole proprietorship';
    case 'PARTNERSHIP': return 'Partnership';
    case 'CORPORATION': return 'Corporation';
    case 'COOPERATIVE': return 'Cooperative';
  }
}

export function businessStatusLabel(status: BusinessStatus): string {
  switch (status) {
    case 'UNVERIFIED': return 'Unverified';
    case 'PENDING': return 'Pending verification';
    case 'VERIFIED': return 'Verified';
    case 'REJECTED': return 'Rejected';
    case 'EXPIRED': return 'Verification expired';
  }
}

export function statusTone(status: BusinessStatus): 'primary' | 'neutral' | 'danger' {
  switch (status) {
    case 'VERIFIED': return 'primary';
    case 'REJECTED':
    case 'EXPIRED': return 'danger';
    default: return 'neutral';
  }
}
