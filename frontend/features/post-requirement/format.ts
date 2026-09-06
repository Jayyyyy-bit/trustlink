// features/post-requirement/format.ts
import type { ISODateTime } from '../../lib/types';
import type {
  RequirementDetailsDraft,
  RequirementDeliveryDraft,
  RequirementClosingDraft,
  RequirementDraftInput,
} from './PostRequirement';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string): string {
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

export function formatWindow(fromDate: string, toDate: string): string {
  if (!fromDate || !toDate) return 'Not set';
  const a = new Date(`${fromDate}T00:00:00`);
  const b = new Date(`${toDate}T00:00:00`);
  return `${a.getDate()} ${MONTHS[a.getMonth()]} — ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`;
}

function withCommas(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatPHP(amount: number): string {
  return `₱${withCommas(amount)}`;
}

export function formatBudget(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${formatPHP(min)} – ${formatPHP(max)}`;
  if (min !== null) return `From ${formatPHP(min)}`;
  if (max !== null) return `Up to ${formatPHP(max)}`;
  return 'Not specified';
}

export function num(v: string): number | null {
  const cleaned = v.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function pluralUnit(n: number, w: string): string {
  return `${n} ${w}${n === 1 ? '' : 's'}`;
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${pluralUnit(days, 'day')}, ${pluralUnit(hours, 'hour')}`;
  if (hours > 0) return `${pluralUnit(hours, 'hour')}, ${pluralUnit(minutes, 'minute')}`;
  return pluralUnit(Math.max(minutes, 0), 'minute');
}

export function daysFromNowDateString(days: number): string {
  const d = new Date(Date.now() + days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export function buildClosingISO(dateStr: string, timeValue: string): ISODateTime {
  if (!dateStr) return '';
  return `${dateStr}T${timeValue}:00+08:00`;
}

export function listOut(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function buildDraftInput(details: RequirementDetailsDraft, delivery: RequirementDeliveryDraft, closing: RequirementClosingDraft): RequirementDraftInput {
  return {
    category: details.category,
    title: details.title,
    scope: details.scope,
    specifications: details.specifications,
    quantity: details.quantity,
    budgetMin: details.budgetMin,
    budgetMax: details.budgetMax,
    deliveryCity: delivery.city,
    deliveryAddress: delivery.address,
    deliveryWindowFrom: delivery.windowFrom,
    deliveryWindowTo: delivery.windowTo,
    attachments: delivery.attachments,
    closingAt: buildClosingISO(closing.closeDate, closing.closeTime),
  };
}
