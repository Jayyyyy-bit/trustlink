// features/post-requirement/constants.ts
import type { PostRequirementState } from '../../lib/types';

/* Time and preset options are screen-local UI sugar, not domain data. */

export const TIME_OPTIONS: { value: string; label: string }[] = [
  { value: '09:00', label: '9:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '21:00', label: '9:00 PM' },
];

export const CLOSING_PRESETS: { label: string; days: number }[] = [
  { label: '+3 days', days: 3 },
  { label: '+1 week', days: 7 },
  { label: '+2 weeks', days: 14 },
  { label: '+1 month', days: 30 },
];

/** Matches RequirementDetail.tsx's OWNER_SEALED EditabilityList exactly. */
export const LOCK_ITEMS = [
  { name: 'Scope and specifications', body: 'Respondents price against exactly what you posted — changing it after publish would invalidate quotations already sealed against it.' },
  { name: 'Quantity', body: 'A different quantity is a different job. Post a new requirement instead of changing this one underneath respondents.' },
  { name: 'Indicative budget', body: 'Shown to every respondent before they price. Moving it after publish would be moving the target they already aimed at.' },
  { name: 'Closing date and time', body: 'The only field that alerts the platform. It fires that event once, on publish, and cannot be moved afterward.' },
];

export const STEP_ORDER: PostRequirementState[] = ['DETAILS', 'DELIVERY', 'CLOSING', 'REVIEW'];
export const STEP_LABELS: Record<PostRequirementState, string> = {
  DETAILS: 'Details',
  DELIVERY: 'Delivery',
  CLOSING: 'Closing',
  REVIEW: 'Review',
};
