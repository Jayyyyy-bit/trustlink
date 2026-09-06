// features/onboarding/format.ts
// Constants and pure helpers shared across the onboarding step components.

import type { BusinessType, SignupIntent } from '../../lib/types';
import type { FormStep } from './types';

export const SIGNUP_INTENTS: { value: SignupIntent; label: string }[] = [
  { value: 'FIND_SUPPLIERS', label: "I'm buying" },
  { value: 'FIND_WORK', label: "I'm supplying" },
  { value: 'BOTH', label: 'Both' },
];

export const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'SOLE_PROP', label: 'Sole proprietorship' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'CORPORATION', label: 'Corporation' },
  { value: 'COOPERATIVE', label: 'Cooperative' },
];

export function businessTypeLabel(type: BusinessType): string {
  return BUSINESS_TYPES.find((t) => t.value === type)?.label ?? type;
}

export const CAPABILITIES_BY_CATEGORY: Record<string, string[]> = {
  'Construction': ['Steel fabrication', 'Welding', 'Metal supply', 'Installation', 'Roofing', 'Concrete works', 'Masonry', 'Carpentry', 'Painting & finishing', 'Scaffolding', 'Cement & aggregates supply', 'Hardware supply'],
  'Food Retail': ['Bulk grains supply', 'Fresh produce', 'Cold storage', 'Meat & poultry', 'Food processing', 'Packaging supply', 'Catering', 'Distribution'],
  'Printing & Packaging': ['Offset printing', 'Digital printing', 'Large format', 'Corrugated boxes', 'Labels & stickers', 'Bookbinding', 'Signage', 'Packaging design'],
  'Logistics and Warehousing': ['Trucking', 'Warehousing', 'Courier', 'Freight forwarding', 'Heavy equipment hauling', 'Cold chain', 'Last-mile delivery'],
  'Professional Services': ['Bookkeeping', 'Audit', 'Legal services', 'Architectural design', 'Structural engineering', 'Surveying', 'IT services', 'Permit processing'],
  'Electrical & Electronics': ['Electrical installation', 'Panel fabrication', 'Generator supply', 'Lighting supply', 'CCTV & security', 'Network cabling', 'Aircon installation', 'Equipment repair'],
};
export const CATEGORIES = Object.keys(CAPABILITIES_BY_CATEGORY);
export const CATEGORY_VISIBLE_COUNT = 4;

export const CAPABILITY_MIN = 3;
export const CAPABILITY_MAX = 8;

export const FORM_COLUMN_MAX_WIDTH = 520;
/** Caps the scrollable form column (shellInner) so paired fields read comfortably instead
 *  of stretching edge to edge — narrower than layout.maxWidthWide, which the header/bottom
 *  bars still use for their own full-width bar treatment. */
export const FORM_CONTENT_MAX_WIDTH = 680;

/** Sits under the page heading on every form step, replacing the old brand column's copy. */
export const SUPPORTING_LINE = 'One profile. Verified once — a few details about your business, checked once by our team.';

export const STEP_ORDER: FormStep[] = ['IDENTITY', 'OPERATIONS', 'DOCUMENTS'];
export const STEP_INDICATOR_LABELS: Record<FormStep, string> = {
  IDENTITY: 'Business',
  OPERATIONS: 'Capabilities',
  DOCUMENTS: 'Verification',
};

export function listOut(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function summarizeList(items: string[], max = 4): string {
  if (items.length === 0) return '—';
  if (items.length <= max) return items.join(' · ');
  return `${items.slice(0, max).join(' · ')} · +${items.length - max} more`;
}

/** DTI registers a sole proprietorship's business name; SEC registers a partnership or
 *  corporation. A cooperative registers with the CDA in reality, but the product only asks
 *  for one of two documents here, so it is bucketed with the SEC path — the closer
 *  analogue of the two. */
export function registrationDocSpec(type: BusinessType): { key: string; name: string; help: string } {
  if (type === 'SOLE_PROP') {
    return {
      key: 'DTI',
      name: 'DTI certificate of business name registration',
      help: 'The certificate issued when you registered your business name with the DTI.',
    };
  }
  return {
    key: 'SEC',
    name: 'SEC certificate of registration',
    help: 'The certificate issued when your business was registered with the SEC.',
  };
}

export function formatMobileDisplay(rawDigits: string): string {
  const digits = rawDigits.length === 11 && rawDigits.startsWith('0') ? rawDigits.slice(1) : rawDigits;
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean).join(' ');
}
