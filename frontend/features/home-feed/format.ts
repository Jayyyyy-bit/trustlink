// features/home-feed/format.ts
import type { Business, ISODateTime, Requirement, RequirementStatus, TrustTier } from '../../lib/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonthYear(iso: ISODateTime): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatPHP(amount: number): string {
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

export function timeAgoWords(iso: ISODateTime, now: number): string {
  const min = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return h === 1 ? '1 hour ago' : `${h} hours ago`;
  const d = Math.round(h / 24);
  return d === 1 ? '1 day ago' : `${d} days ago`;
}

export function formatClockTime(iso: ISODateTime): string {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${mm} ${ampm}`;
}

export function timeAgoCompact(iso: ISODateTime, now: number): string {
  const min = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (min < 1) return 'now';
  if (min < 60) return `${min}m`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
}

/** `Xd Yh MMm` while more than a day remains, else a ticking `HH:MM:SS`. Distinct from
 *  RequirementDetail.tsx's word-form countdown — this screen's card treatment is a
 *  monospace ticking clock in the source design, a deliberately different presentation. */
export function formatCompactCountdown(closingAt: ISODateTime, now: number): { label: string; closed: boolean; hoursLeft: number } {
  const target = new Date(closingAt).getTime();
  const remainingMs = target - now;
  if (remainingMs <= 0) return { label: 'Closed', closed: true, hoursLeft: 0 };
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const label = days > 0 ? `${days}d ${hours}h ${pad(minutes)}m` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return { label, closed: false, hoursLeft: remainingMs / 3600000 };
}

export function shortCountdown(hoursLeft: number, closed: boolean): string {
  if (closed || hoursLeft <= 0) return 'Closed';
  if (hoursLeft < 1) return 'Ends within the hour';
  if (hoursLeft < 12) return `${Math.floor(hoursLeft)}h left`;
  return 'Ends today';
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

export function tierLabel(tier: TrustTier | null): string {
  return tier === null ? 'Unrated' : `Tier ${tier}`;
}

/** Boilerplate progression copy, hardcoded like the design's own JSX (not data-driven —
 *  the specific documents named here belong to the onboarding flow, not this screen). */
export function tierProgressionLine(tier: TrustTier | null): string | null {
  switch (tier) {
    case null: return 'Complete verification to start earning trust tiers.';
    case 1: return 'Reach Tier 2 by completing your BIR registration and 5 awarded requirements.';
    case 2: return "Reach Tier 3 by adding your Mayor's permit and completing 10 awarded requirements.";
    case 3: return null;
  }
}

export type Signal = { label: string; hint: string; urgent: boolean } | null;

export function computeSignal(requirement: Requirement, hoursLeft: number, closed: boolean, matched: boolean, now: number): Signal {
  if (!closed && hoursLeft < 24) {
    return { label: 'Closing soon', hint: 'This requirement closes in under 24 hours.', urgent: true };
  }
  const publishedMsAgo = requirement.publishedAt ? now - new Date(requirement.publishedAt).getTime() : Infinity;
  if (publishedMsAgo < 24 * 3600_000) {
    return { label: 'New', hint: 'Posted since your last visit.', urgent: false };
  }
  if (requirement.quotationCount >= 8) {
    return { label: 'High demand', hint: `${requirement.quotationCount} businesses have already sent quotations.`, urgent: false };
  }
  if (matched) {
    return { label: 'Matched', hint: 'Trustlink matched this to your business profile.', urgent: false };
  }
  return null;
}

export function matchReason(buyerCity: string, viewer: Business): string {
  const capability = (viewer.capabilities[0] ?? viewer.category).toLowerCase();
  if (buyerCity === viewer.city) {
    return `Same category as your business, and the site is in ${viewer.city} — your service area. Your profile lists ${capability}.`;
  }
  return `Same category as your business. ${buyerCity} is within your listed delivery range, and the scope fits your ${capability} capability.`;
}
