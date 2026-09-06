// features/quotation/format.ts
// Pure formatting/label helpers shared across QuotationSubmission and its components.

import type { ISODateTime } from '../../lib/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: ISODateTime): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(d: Date): string {
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${mm} ${ampm}`;
}

export function formatDateTime(iso: ISODateTime): string {
  return `${formatDate(iso)}, ${formatTime(new Date(iso))}`;
}

/** The receipt's "Submitted" field wants the exact second, unlike every other timestamp
 *  on this screen — it is the one place the seconds matter. */
export function formatDateTimeExact(iso: ISODateTime): string {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${formatDate(iso)}, ${h}:${mm}:${ss} ${ampm}`;
}

export function withCommas(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatPHP(amount: number): string {
  return `₱${withCommas(amount)}`;
}

export function formatBudget(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${formatPHP(min)} – ${formatPHP(max)}`;
  if (min !== null) return `From ${formatPHP(min)}`;
  if (max !== null) return `Up to ${formatPHP(max)}`;
  return 'Not specified';
}

export function num(v: string): number {
  const n = parseFloat(v.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

export function pluralUnit(n: number, w: string): string {
  return `${n} ${w}${n === 1 ? '' : 's'}`;
}

export function formatCountdownWords(days: number, hours: number, minutes: number): string {
  if (days > 0) return `${pluralUnit(days, 'day')}, ${pluralUnit(hours, 'hour')}`;
  if (hours > 0) return `${pluralUnit(hours, 'hour')}, ${pluralUnit(minutes, 'minute')}`;
  return pluralUnit(minutes, 'minute');
}
