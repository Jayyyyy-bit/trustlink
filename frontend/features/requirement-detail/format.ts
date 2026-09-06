// features/requirement-detail/format.ts
// Pure formatting/label helpers shared by RequirementDetail and its sub-components.

import type {
  ISODateTime,
  TrustTier,
  BusinessStatus,
  RequirementStatus,
  QuotationStatus,
  IntegrityResult,
} from '../../lib/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: ISODateTime): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(iso: ISODateTime): string {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(iso)}, ${h}:${mm} ${ampm}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

export function formatPHP(amount: number): string {
  const rounded = Math.round(amount);
  const withCommas = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `₱${withCommas}`;
}

export function formatBudget(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${formatPHP(min)} – ${formatPHP(max)}`;
  if (min !== null) return `From ${formatPHP(min)}`;
  if (max !== null) return `Up to ${formatPHP(max)}`;
  return 'Not specified';
}

/** submittedAt + validityDays, presented as an absolute date rather than a duration. */
export function formatValidUntil(submittedAt: ISODateTime, validityDays: number): string {
  const d = new Date(submittedAt);
  d.setDate(d.getDate() + validityDays);
  return formatDate(d.toISOString());
}

/** Up to two letters for an avatar chip — "Bayan Logistics Corp." → "BL". */
export function initials(name: string): string {
  const words = name.split(' ').filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const second = words[1]?.[0] ?? '';
  return (first + second).toUpperCase();
}

export function splitParagraphs(text: string): string[] {
  return text.split(/\n{2,}/);
}

export function tierLabel(tier: TrustTier | null): string {
  return tier === null ? 'Unrated' : `Tier ${tier}`;
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

export function requirementStatusLabel(status: RequirementStatus): string {
  switch (status) {
    case 'DRAFT': return 'Draft';
    case 'OPEN': return 'Open';
    case 'CLOSED': return 'Closed';
    case 'AWARDED': return 'Awarded';
    case 'CLOSED_NO_AWARD': return 'Closed — No Award';
    case 'CANCELLED': return 'Cancelled';
  }
}

export function requirementStatusTone(status: RequirementStatus): 'primary' | 'danger' | 'neutral' {
  switch (status) {
    case 'OPEN':
    case 'AWARDED':
      return 'primary';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function quotationStatusLabel(status: QuotationStatus): string {
  switch (status) {
    case 'SUBMITTED': return 'Submitted';
    case 'RELEASED': return 'Released';
    case 'SHORTLISTED': return 'Shortlisted';
    case 'AWARDED': return 'Awarded';
    case 'NOT_SELECTED': return 'Not selected';
    case 'WITHDRAWN': return 'Withdrawn';
  }
}

export function integrityLabel(result: IntegrityResult | null): string {
  if (result === null) return 'Pending';
  return result === 'VALID' ? 'Valid' : 'Flagged';
}
