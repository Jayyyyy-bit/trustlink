// features/requirement-detail/RequirementDetail.tsx
// One component, three states, driven entirely by props. No screens, no tabs.

import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import {
  color,
  font,
  fontSize,
  lineHeight,
  letterSpacing,
  space,
  radius,
  elevation,
  layout,
  breakpoint,
} from '../../components/ui/tokens';
import type {
  Requirement,
  Business,
  Quotation,
  LedgerEntry,
  RequirementDetailState,
  BusinessId,
  SpecRow,
  DeliverySite,
  Attachment,
  ISODateTime,
  TrustTier,
  RequirementStatus,
  QuotationStatus,
  IntegrityResult,
  BusinessStatus,
} from '../../lib/types';

/* ─── Props ─────────────────────────────────────────── */

interface RespondentNotSubmitted {
  state: Extract<RequirementDetailState, 'RESPONDENT'>;
  requirement: Requirement;
  buyer: Business;
  hasSubmitted: false;
  onSubmitQuotation?: () => void;
}

interface RespondentSubmitted {
  state: Extract<RequirementDetailState, 'RESPONDENT'>;
  requirement: Requirement;
  buyer: Business;
  hasSubmitted: true;
  ownQuotation: Quotation;
  ledgerEntry: LedgerEntry;
  onWithdraw?: () => void;
}

interface OwnerSealedProps {
  state: Extract<RequirementDetailState, 'OWNER_SEALED'>;
  requirement: Requirement;
}

/** Everything a released quotation card shows about its respondent — nothing more. */
type Respondent = Pick<Business, 'id' | 'registeredName' | 'city' | 'province' | 'credibility'>;

interface OwnerReleasedProps {
  state: Extract<RequirementDetailState, 'OWNER_RELEASED'>;
  requirement: Requirement;
  quotations: Quotation[];
  respondents: Record<BusinessId, Respondent>;
  onShortlistToggle?: (quotationId: string) => void;
  onAward?: (quotationId: string) => void;
  onCloseWithoutAward?: () => void;
}

export type RequirementDetailProps =
  | RespondentNotSubmitted
  | RespondentSubmitted
  | OwnerSealedProps
  | OwnerReleasedProps;

/* ─── Formatting helpers ────────────────────────────── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: ISODateTime): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateTime(iso: ISODateTime): string {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(iso)}, ${h}:${mm} ${ampm}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

function formatPHP(amount: number): string {
  const rounded = Math.round(amount);
  const withCommas = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `₱${withCommas}`;
}

function formatBudget(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${formatPHP(min)} – ${formatPHP(max)}`;
  if (min !== null) return `From ${formatPHP(min)}`;
  if (max !== null) return `Up to ${formatPHP(max)}`;
  return 'Not specified';
}

/** submittedAt + validityDays, presented as an absolute date rather than a duration. */
function formatValidUntil(submittedAt: ISODateTime, validityDays: number): string {
  const d = new Date(submittedAt);
  d.setDate(d.getDate() + validityDays);
  return formatDate(d.toISOString());
}

/** Up to two letters for an avatar chip — "Bayan Logistics Corp." → "BL". */
function initials(name: string): string {
  const words = name.split(' ').filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const second = words[1]?.[0] ?? '';
  return (first + second).toUpperCase();
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n{2,}/);
}

function tierLabel(tier: TrustTier | null): string {
  return tier === null ? 'Unrated' : `Tier ${tier}`;
}

function businessStatusLabel(status: BusinessStatus): string {
  switch (status) {
    case 'UNVERIFIED': return 'Unverified';
    case 'PENDING': return 'Pending verification';
    case 'VERIFIED': return 'Verified';
    case 'REJECTED': return 'Rejected';
    case 'EXPIRED': return 'Verification expired';
  }
}

function requirementStatusLabel(status: RequirementStatus): string {
  switch (status) {
    case 'DRAFT': return 'Draft';
    case 'OPEN': return 'Open';
    case 'CLOSED': return 'Closed';
    case 'AWARDED': return 'Awarded';
    case 'CLOSED_NO_AWARD': return 'Closed — No Award';
    case 'CANCELLED': return 'Cancelled';
  }
}

function requirementStatusTone(status: RequirementStatus): 'primary' | 'danger' | 'neutral' {
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

function quotationStatusLabel(status: QuotationStatus): string {
  switch (status) {
    case 'SUBMITTED': return 'Submitted';
    case 'RELEASED': return 'Released';
    case 'SHORTLISTED': return 'Shortlisted';
    case 'AWARDED': return 'Awarded';
    case 'NOT_SELECTED': return 'Not selected';
    case 'WITHDRAWN': return 'Withdrawn';
  }
}

function integrityLabel(result: IntegrityResult | null): string {
  if (result === null) return 'Pending';
  return result === 'VALID' ? 'Valid' : 'Flagged';
}

/* ─── Countdown hook ────────────────────────────────── */

function pluralUnit(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** "113 days, 17 hours" — drops to the next pair of units as each one empties out. */
function formatCountdownWords(days: number, hours: number, minutes: number): string {
  if (days > 0) return `${pluralUnit(days, 'day')}, ${pluralUnit(hours, 'hour')}`;
  if (hours > 0) return `${pluralUnit(hours, 'hour')}, ${pluralUnit(minutes, 'minute')}`;
  return pluralUnit(minutes, 'minute');
}

function useCountdown(closingAt: ISODateTime): { label: string; closed: boolean; urgent: boolean } {
  const target = new Date(closingAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = target - now;
  if (remainingMs <= 0) return { label: 'Closed', closed: true, urgent: false };

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return { label: formatCountdownWords(days, hours, minutes), closed: false, urgent: remainingMs < 24 * 3600_000 };
}

/* ─── Small building blocks ─────────────────────────── */

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function LabelValueRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.labelValueRow}>
      <Text style={styles.labelValueLabel}>{label}</Text>
      <Text style={[styles.labelValueValue, mono ? styles.mono : null]}>{value}</Text>
    </View>
  );
}

type BadgeTone = 'primary' | 'danger' | 'neutral' | 'ink';

function Badge({ label, tone, dot = false }: { label: string; tone: BadgeTone; dot?: boolean }) {
  const bg = tone === 'primary' ? color.primaryFaint : tone === 'danger' ? color.dangerFaint : tone === 'ink' ? color.ink : color.surfaceSunken;
  const borderColor = tone === 'primary' ? color.primary : tone === 'danger' ? color.dangerBorder : tone === 'ink' ? color.ink : color.border;
  const textColor = tone === 'primary' ? color.primary : tone === 'danger' ? color.danger : tone === 'ink' ? color.canvas : color.inkMuted;
  return (
    <View style={[styles.badge, styles.badgeRow, { backgroundColor: bg, borderColor }]}>
      {dot && <View style={[styles.badgeDot, { backgroundColor: textColor }]} />}
      <Text style={[styles.badgeLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
}

type ActionButtonVariant = 'primary' | 'outline' | 'danger' | 'text' | 'tinted' | 'ink';

function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  variant?: ActionButtonVariant;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor:
            variant === 'primary' ? (pressed ? color.primaryPressed : color.primary)
            : variant === 'ink' ? color.ink
            : variant === 'tinted' ? color.primaryFaint
            : variant === 'text' ? 'transparent'
            : color.surface,
          borderColor:
            variant === 'danger' ? color.dangerBorder
            : variant === 'outline' ? color.border
            : variant === 'text' ? 'transparent'
            : variant === 'tinted' ? color.primaryBorder
            : variant === 'ink' ? color.ink
            : color.primary,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.actionButtonLabel,
          {
            color:
              variant === 'primary' ? color.onPrimary
              : variant === 'ink' ? color.canvas
              : variant === 'danger' ? color.danger
              : variant === 'text' ? color.inkMuted
              : variant === 'tinted' ? color.primary
              : color.ink,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SpecTable({ rows }: { rows: SpecRow[] }) {
  return (
    <View style={{ gap: space.sm }}>
      {rows.map((row, index) => (
        <View key={`${row.label}-${index}`} style={styles.specRow}>
          <Text style={styles.specLabel}>{row.label}</Text>
          <Text style={styles.specValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

function DeliverySiteView({ site }: { site: DeliverySite }) {
  return (
    <View style={{ gap: space.xs }}>
      <Text style={styles.bodyTextSemi}>{site.name}</Text>
      <Text style={styles.bodyText}>{site.address}</Text>
      <Text style={styles.mutedSmall}>{site.accessHours}</Text>
      <Text style={styles.mutedSmall}>{site.accessNote}</Text>
    </View>
  );
}

function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) {
    return <Text style={styles.mutedSmall}>No attachments</Text>;
  }
  return (
    <View style={{ gap: space.sm }}>
      {attachments.map((attachment) => (
        <View key={attachment.id} style={styles.attachmentRow}>
          <Text style={styles.bodyText} numberOfLines={1}>{attachment.filename}</Text>
          <Text style={styles.mutedSmall}>{formatBytes(attachment.sizeBytes)}</Text>
        </View>
      ))}
    </View>
  );
}

function CredibilityBlockView({ label, business }: { label: string; business: Business }) {
  const c = business.credibility;
  const name = business.displayName ?? business.registeredName;
  return (
    <View style={styles.block}>
      <SectionLabel>{label}</SectionLabel>
      <Text style={styles.bodyTextSemi}>{name}</Text>
      <View style={{ gap: space.xs, marginTop: space.xs }}>
        <LabelValueRow label="Status" value={businessStatusLabel(c.status)} />
        <LabelValueRow label="Tier" value={tierLabel(c.tier)} />
        <LabelValueRow label="Verified" value={c.verifiedAt ? formatDate(c.verifiedAt) : '—'} />
        <LabelValueRow label="Recheck due" value={c.recheckDueAt ? formatDate(c.recheckDueAt) : '—'} />
        <LabelValueRow label="Requirements posted" value={String(c.requirementsPosted)} />
        <LabelValueRow label="Requirements awarded" value={String(c.requirementsAwarded)} />
        <LabelValueRow label="Quotations submitted" value={String(c.quotationsSubmitted)} />
        <LabelValueRow label="Quotations awarded" value={String(c.quotationsAwarded)} />
      </View>
    </View>
  );
}

function CountdownBadge({ closingAt }: { closingAt: ISODateTime }) {
  const { label, closed } = useCountdown(closingAt);
  return (
    <View style={styles.block}>
      <SectionLabel>{closed ? 'Closed' : 'Closes in'}</SectionLabel>
      <Text style={[styles.countdown, closed ? styles.countdownClosed : null]}>{label}</Text>
      {!closed && <Text style={styles.mutedSmall}>{formatDateTime(closingAt)}</Text>}
    </View>
  );
}

function BareQuotationCount({ count }: { count: number }) {
  return (
    <View style={styles.block}>
      <SectionLabel>Quotations received</SectionLabel>
      <Text style={styles.countNumber}>{count}</Text>
    </View>
  );
}

/* ─── Shared requirement overview (all three states) ───── */
/** Split into atomic blocks so the wide layout can route them to different columns
 *  while the phone layout keeps composing them in this same original order. */

function ScopeBlock({ requirement }: { requirement: Requirement }) {
  return (
    <View style={styles.block}>
      <SectionLabel>Scope</SectionLabel>
      <Text style={styles.bodyText}>{requirement.scope}</Text>
    </View>
  );
}

function SpecificationsBlock({ requirement }: { requirement: Requirement }) {
  return (
    <View style={styles.block}>
      <SectionLabel>Specifications</SectionLabel>
      <SpecTable rows={requirement.specifications} />
    </View>
  );
}

function QuantityBudgetRow({ requirement }: { requirement: Requirement }) {
  return (
    <View style={styles.rowBlock}>
      <View style={styles.blockHalf}>
        <SectionLabel>Quantity</SectionLabel>
        <Text style={styles.bodyText}>{requirement.quantity}</Text>
      </View>
      <View style={styles.blockHalf}>
        <SectionLabel>Indicative budget</SectionLabel>
        <Text style={styles.bodyText}>{formatBudget(requirement.budgetMin, requirement.budgetMax)}</Text>
      </View>
    </View>
  );
}

function DeliveryWindowBlock({ requirement }: { requirement: Requirement }) {
  return (
    <View style={styles.block}>
      <SectionLabel>Delivery window</SectionLabel>
      <Text style={styles.bodyText}>{requirement.deliveryWindow}</Text>
    </View>
  );
}

function DeliverySiteBlock({ requirement }: { requirement: Requirement }) {
  return (
    <View style={styles.block}>
      <SectionLabel>Delivery site</SectionLabel>
      <DeliverySiteView site={requirement.deliverySite} />
    </View>
  );
}

function AttachmentsBlock({ requirement }: { requirement: Requirement }) {
  return (
    <View style={styles.block}>
      <SectionLabel>Attachments</SectionLabel>
      <AttachmentList attachments={requirement.attachments} />
    </View>
  );
}

function RequirementOverview({ requirement }: { requirement: Requirement }) {
  return (
    <View style={{ gap: space.xxl }}>
      <ScopeBlock requirement={requirement} />
      <SpecificationsBlock requirement={requirement} />
      <QuantityBudgetRow requirement={requirement} />
      <DeliveryWindowBlock requirement={requirement} />
      <DeliverySiteBlock requirement={requirement} />
      <AttachmentsBlock requirement={requirement} />
    </View>
  );
}

function Header({ requirement }: { requirement: Requirement }) {
  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.headerTopRow}>
        <SectionLabel>{requirement.category}</SectionLabel>
        <Badge label={requirementStatusLabel(requirement.status)} tone={requirementStatusTone(requirement.status)} />
      </View>
      <Text style={styles.title}>{requirement.title}</Text>
      <Text style={styles.ref}>{requirement.ref}</Text>
    </View>
  );
}

/* ─── RESPONDENT state ──────────────────────────────── */

function SealedRecordPanel({
  quotation,
  ledgerEntry,
  onWithdraw,
}: {
  quotation: Quotation;
  ledgerEntry: LedgerEntry;
  onWithdraw?: () => void;
}) {
  const canWithdraw = quotation.status === 'SUBMITTED';
  return (
    <View style={styles.sealedCard}>
      <SectionLabel>Your quotation</SectionLabel>
      <View style={{ gap: space.xs }}>
        <LabelValueRow label="Reference" value={quotation.ref} mono />
        <LabelValueRow label="Submitted" value={formatDateTime(quotation.submittedAt)} />
        <LabelValueRow label="Ledger entry" value={`#${ledgerEntry.sequence}`} mono />
        {!canWithdraw && <LabelValueRow label="Status" value={quotationStatusLabel(quotation.status)} />}
      </View>
      {canWithdraw ? (
        <ActionButton label="Withdraw quotation" variant="danger" onPress={onWithdraw} />
      ) : (
        <Text style={styles.mutedSmall}>
          Withdrawal is only possible while a quotation is submitted and unreleased.
        </Text>
      )}
    </View>
  );
}

/** All of RESPONDENT's content lives in the side column on the wide layout. */
function RespondentSideContent(props: RespondentNotSubmitted | RespondentSubmitted) {
  const { requirement, buyer } = props;
  return (
    <>
      <CredibilityBlockView label="Posted by" business={buyer} />
      <CountdownBadge closingAt={requirement.closingAt} />
      <BareQuotationCount count={requirement.quotationCount} />
      {props.hasSubmitted ? (
        <SealedRecordPanel
          quotation={props.ownQuotation}
          ledgerEntry={props.ledgerEntry}
          onWithdraw={props.onWithdraw}
        />
      ) : (
        <ActionButton label="Submit quotation" variant="primary" onPress={props.onSubmitQuotation} />
      )}
    </>
  );
}

function RespondentPanel(props: RespondentNotSubmitted | RespondentSubmitted) {
  return (
    <View style={{ gap: space.xxl }}>
      <RespondentSideContent {...props} />
    </View>
  );
}

/* ─── OWNER_SEALED state ─────────────────────────────── */

function SealedExplanation() {
  return (
    <View style={styles.block}>
      <SectionLabel>Why nothing more is visible</SectionLabel>
      <Text style={styles.bodyText}>
        Quotations stay sealed until the countdown reaches zero. This stops respondents from seeing
        each other&apos;s pricing and undercutting one another, so the comparison is fair the moment
        it releases. Until then only the count above is shown — no names, figures, or previews.
      </Text>
    </View>
  );
}

function EditabilityList() {
  return (
    <View style={styles.block}>
      <SectionLabel>Before closing</SectionLabel>
      <View style={{ gap: space.sm }}>
        <Text style={styles.bodyText}>Can still edit: delivery window, delivery site, attachments.</Text>
        <Text style={styles.bodyText}>
          Locked: scope, specifications, quantity, indicative budget, closing date — respondents
          have already priced against these.
        </Text>
      </View>
    </View>
  );
}

/** Goes in the side column on the wide layout. */
function OwnerSealedSideContent({ requirement }: { requirement: Requirement }) {
  return (
    <>
      <CountdownBadge closingAt={requirement.closingAt} />
      <BareQuotationCount count={requirement.quotationCount} />
    </>
  );
}

/** Goes in the main column on the wide layout. */
function OwnerSealedMainContent() {
  return (
    <>
      <SealedExplanation />
      <EditabilityList />
    </>
  );
}

function OwnerSealedPanel({ requirement }: { requirement: Requirement }) {
  return (
    <View style={{ gap: space.xxl }}>
      <OwnerSealedSideContent requirement={requirement} />
      <OwnerSealedMainContent />
    </View>
  );
}

/* ─── OWNER_RELEASED state ───────────────────────────── */

type SortKey = 'price' | 'leadTime' | 'tier' | 'submittedAt';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'price', label: 'Price' },
  { key: 'leadTime', label: 'Lead time' },
  { key: 'tier', label: 'Tier' },
  { key: 'submittedAt', label: 'Submitted' },
];

const SORT_DEFAULT_DIR: Record<SortKey, SortDir> = {
  price: 'asc',
  leadTime: 'asc',
  tier: 'desc',
  submittedAt: 'desc',
};

function compareQuotations(
  a: Quotation,
  b: Quotation,
  key: SortKey,
  dir: SortDir,
  respondents: Record<BusinessId, Respondent>,
): number {
  let result: number;
  switch (key) {
    case 'price':
      result = a.totalPrice - b.totalPrice;
      break;
    case 'leadTime':
      result = a.leadTimeDays - b.leadTimeDays;
      break;
    case 'submittedAt':
      result = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      break;
    case 'tier': {
      const ta = respondents[a.respondentId]?.credibility.tier ?? 0;
      const tb = respondents[b.respondentId]?.credibility.tier ?? 0;
      result = ta - tb;
      break;
    }
  }
  return dir === 'asc' ? result : -result;
}

function SortBar({
  activeKey,
  activeDir,
  onPress,
}: {
  activeKey: SortKey;
  activeDir: SortDir;
  onPress: (key: SortKey) => void;
}) {
  return (
    <View style={styles.sortBar}>
      {SORT_OPTIONS.map((option) => {
        const active = option.key === activeKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => onPress(option.key)}
            style={[styles.sortChip, active ? styles.sortChipActive : null]}
          >
            <Text style={[styles.sortChipLabel, active ? styles.sortChipLabelActive : null]}>
              {option.label}{active ? (activeDir === 'asc' ? ' ↑' : ' ↓') : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function QuotationCard({
  quotation,
  respondent,
  awardLocked,
  predecessor,
  onToggleShortlist,
  onRequestAward,
}: {
  quotation: Quotation;
  respondent: Respondent;
  awardLocked: boolean;
  predecessor: Quotation | null;
  onToggleShortlist: () => void;
  onRequestAward: () => void;
}) {
  const isAwarded = quotation.status === 'AWARDED';
  const isNotSelected = quotation.status === 'NOT_SELECTED';
  const isShortlisted = quotation.status === 'SHORTLISTED';
  const isFlagged = quotation.integrity === 'FLAGGED';
  const name = respondent.registeredName;

  return (
    <View style={[styles.quotationCard, isAwarded ? styles.quotationCardAwarded : null, isFlagged ? styles.quotationCardFlagged : null]}>
      <View style={styles.quotationCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.respondentName}>{name}</Text>
          <Text style={styles.mutedSmall}>{quotation.ref}</Text>
        </View>
        <View style={{ gap: space.xs, alignItems: 'flex-end' }}>
          {isAwarded && <Badge label="Awarded" tone="primary" />}
          {isNotSelected && <Badge label="Not selected" tone="neutral" />}
          {isShortlisted && <Badge label="Shortlisted" tone="primary" />}
          {isFlagged && <Badge label="Flagged" tone="danger" />}
        </View>
      </View>

      <View style={styles.quotationFactRow}>
        <LabelValueRow label="Verified" value={respondent.credibility.verifiedAt ? formatDate(respondent.credibility.verifiedAt) : '—'} />
        <LabelValueRow label="Tier" value={tierLabel(respondent.credibility.tier)} />
      </View>
      <View style={styles.quotationFactRow}>
        <LabelValueRow label="Requirements posted" value={String(respondent.credibility.requirementsPosted)} />
        <LabelValueRow label="Quotations awarded" value={String(respondent.credibility.quotationsAwarded)} />
      </View>

      <View style={styles.quotationPriceRow}>
        <Text style={styles.priceText}>{formatPHP(quotation.totalPrice)}</Text>
        <Text style={styles.mutedSmall}>{quotation.leadTimeDays} days lead time</Text>
      </View>

      <View style={styles.quotationFactRow}>
        <LabelValueRow label="Payment terms" value={quotation.paymentTerms} />
        <LabelValueRow label="Validity" value={`${quotation.validityDays} days`} />
      </View>

      {quotation.notesToBuyer.length > 0 && (
        <View style={styles.block}>
          <SectionLabel>Notes</SectionLabel>
          <Text style={styles.bodyText}>{quotation.notesToBuyer}</Text>
        </View>
      )}

      {quotation.attachments.length > 0 && (
        <View style={styles.block}>
          <SectionLabel>Attachments</SectionLabel>
          <AttachmentList attachments={quotation.attachments} />
        </View>
      )}

      <View style={styles.quotationFactRow}>
        <LabelValueRow label="Submitted" value={formatDateTime(quotation.submittedAt)} />
        <LabelValueRow label="Integrity" value={integrityLabel(quotation.integrity)} />
      </View>

      {predecessor && (
        <Text style={styles.mutedSmall}>
          Replaces withdrawn {predecessor.ref}
          {predecessor.withdrawnAt ? ` (${formatDateTime(predecessor.withdrawnAt)})` : ''}
        </Text>
      )}

      {!isAwarded && !isNotSelected && (
        <View style={styles.quotationActions}>
          <ActionButton
            label={isShortlisted ? 'Unshortlist' : 'Shortlist'}
            variant="outline"
            onPress={onToggleShortlist}
            disabled={awardLocked}
          />
          <ActionButton label="Award" variant="primary" onPress={onRequestAward} disabled={awardLocked} />
        </View>
      )}
    </View>
  );
}

function AwardConfirmationModal({
  visible,
  respondentName,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  respondentName: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <SectionLabel>Confirm award</SectionLabel>
          <Text style={styles.bodyTextSemi}>
            {respondentName ? `Award ${respondentName}?` : 'Award this quotation?'}
          </Text>
          <Text style={styles.bodyText}>
            All other quotations for this requirement move to Not Selected.
          </Text>
          <Text style={styles.bodyText}>
            This is irreversible and is recorded on the ledger.
          </Text>
          <Text style={styles.mutedSmall}>
            Trustlink does not handle payment, delivery, or contracts — the two parties settle directly.
          </Text>
          <View style={styles.modalActions}>
            <View style={styles.modalActionButton}>
              <ActionButton label="Cancel" variant="text" onPress={onCancel} />
            </View>
            <View style={styles.modalActionButton}>
              <ActionButton label="Confirm" variant="primary" onPress={onConfirm} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** State + business logic for OWNER_RELEASED, shared by the phone stack and the
 *  wide layout's rebuilt cards so both render the same underlying decisions. */
function useOwnerReleased({
  requirement,
  quotations: initialQuotations,
  respondents,
  onShortlistToggle,
  onAward,
}: OwnerReleasedProps) {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [awardedId, setAwardedId] = useState<string | null>(requirement.awardedQuotationId);
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [awardTargetId, setAwardTargetId] = useState<string | null>(null);

  const handleSortPress = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(SORT_DEFAULT_DIR[key]);
    }
  };

  const handleToggleShortlist = (id: string) => {
    if (awardedId) return;
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: q.status === 'SHORTLISTED' ? 'RELEASED' : 'SHORTLISTED' } : q,
      ),
    );
    onShortlistToggle?.(id);
  };

  const handleConfirmAward = (id: string) => {
    setAwardedId(id);
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.status === 'WITHDRAWN') return q;
        return { ...q, status: q.id === id ? 'AWARDED' : 'NOT_SELECTED' };
      }),
    );
    setAwardTargetId(null);
    onAward?.(id);
  };

  const visible = quotations.filter((q) => q.status !== 'WITHDRAWN');
  const withdrawn = quotations.filter((q) => q.status === 'WITHDRAWN');
  const sorted = [...visible].sort((a, b) => compareQuotations(a, b, sortKey, sortDir, respondents));
  const orphanWithdrawn = withdrawn.filter((w) => !visible.some((v) => v.id === w.replacedByQuotationId));

  const awardTarget = quotations.find((q) => q.id === awardTargetId) ?? null;
  const awardTargetName = awardTarget ? respondents[awardTarget.respondentId].registeredName : null;

  const shortlistedCount = quotations.filter((q) => q.status === 'SHORTLISTED').length;
  const flaggedCount = visible.filter((q) => q.integrity === 'FLAGGED').length;

  return {
    respondents,
    visible,
    withdrawn,
    sorted,
    orphanWithdrawn,
    sortKey,
    sortDir,
    awardedId,
    awardTargetId,
    awardTargetName,
    shortlistedCount,
    flaggedCount,
    handleSortPress,
    handleToggleShortlist,
    handleConfirmAward,
    setAwardTargetId,
  };
}

function OwnerReleasedPanel(props: OwnerReleasedProps) {
  const st = useOwnerReleased(props);

  return (
    <View style={{ gap: space.lg }}>
      <SectionLabel>{`${st.visible.length} quotation${st.visible.length === 1 ? '' : 's'} released`}</SectionLabel>
      <SortBar activeKey={st.sortKey} activeDir={st.sortDir} onPress={st.handleSortPress} />
      <View style={{ gap: space.md }}>
        {st.sorted.map((q) => {
          const predecessor = st.withdrawn.find((w) => w.replacedByQuotationId === q.id) ?? null;
          return (
            <QuotationCard
              key={q.id}
              quotation={q}
              respondent={st.respondents[q.respondentId]}
              awardLocked={st.awardedId !== null}
              predecessor={predecessor}
              onToggleShortlist={() => st.handleToggleShortlist(q.id)}
              onRequestAward={() => st.setAwardTargetId(q.id)}
            />
          );
        })}
      </View>
      {st.orphanWithdrawn.length > 0 && (
        <View style={{ gap: space.sm }}>
          <SectionLabel>Withdrawn</SectionLabel>
          {st.orphanWithdrawn.map((w) => (
            <Text key={w.id} style={styles.mutedRow}>
              {w.ref} — withdrawn {w.withdrawnAt ? formatDateTime(w.withdrawnAt) : ''}
            </Text>
          ))}
        </View>
      )}
      <AwardConfirmationModal
        visible={st.awardTargetId !== null}
        respondentName={st.awardTargetName}
        onCancel={() => st.setAwardTargetId(null)}
        onConfirm={() => {
          if (st.awardTargetId) st.handleConfirmAward(st.awardTargetId);
        }}
      />
    </View>
  );
}

/* ─── Wide layout ────────────────────────────────────────
 * Rebuilt from docs/design/Trustlink Requirement Detail.dc.html: same cards, same
 * sections, same order, same hierarchy as the design — the prototype's state-switcher
 * tabs are the only thing intentionally left out, since those aren't part of the product.
 * The phone stack above this point is untouched. */

const LOCKED_FIELDS = ['Scope and specifications', 'Quantities', 'Closing date and time', 'Cancellation'];

function WideHeader({ requirement }: { requirement: Requirement }) {
  const tone = requirementStatusTone(requirement.status);
  return (
    <View style={{ gap: space.md }}>
      <View style={styles.widePillRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillLabel}>{requirement.category}</Text>
        </View>
        <Badge label={requirementStatusLabel(requirement.status)} tone={tone} dot />
      </View>
      <Text style={styles.wideTitle}>{requirement.title}</Text>
      <Text style={styles.wideSubtitle}>
        {requirement.publishedAt ? `Posted ${formatDate(requirement.publishedAt)}` : 'Not yet published'}
        {' · '}
        {requirement.deliverySite.address}
      </Text>
    </View>
  );
}

function WideFileChips({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) {
    return <Text style={styles.mutedSmall}>No attachments</Text>;
  }
  return (
    <View style={styles.wideChipsRow}>
      {attachments.map((a) => (
        <View key={a.id} style={styles.fileChip}>
          <Text style={styles.fileChipLabel} numberOfLines={1}>{a.filename}</Text>
        </View>
      ))}
    </View>
  );
}

function WideScopeCard({ requirement }: { requirement: Requirement }) {
  return (
    <View style={styles.wideCard}>
      <View style={{ gap: space.md }}>
        <SectionLabel>Scope of work</SectionLabel>
        {splitParagraphs(requirement.scope).map((para, i) => (
          <Text key={i} style={styles.bodyText}>{para}</Text>
        ))}
      </View>

      <View style={styles.wideSpecTable}>
        {requirement.specifications.map((row, index) => (
          <View key={`${row.label}-${index}`} style={[styles.wideSpecRow, index % 2 === 1 ? styles.wideSpecRowAlt : null]}>
            <Text style={styles.wideSpecKey}>{row.label}</Text>
            <Text style={styles.wideSpecValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.factsGrid, styles.wideDividedSection]}>
        <View style={styles.factsGridItem}>
          <SectionLabel>Site address</SectionLabel>
          <Text style={styles.factValue}>
            {requirement.deliverySite.name}
            {'\n'}
            <Text style={styles.factValueMuted}>{requirement.deliverySite.address}</Text>
          </Text>
        </View>
        <View style={styles.factsGridItem}>
          <SectionLabel>Site access</SectionLabel>
          <Text style={styles.factValue}>
            {requirement.deliverySite.accessHours}
            {'\n'}
            <Text style={styles.factValueMuted}>{requirement.deliverySite.accessNote}</Text>
          </Text>
        </View>
        <View style={styles.factsGridItem}>
          <SectionLabel>Settlement</SectionLabel>
          <Text style={styles.factValue}>
            Direct between parties
            {'\n'}
            <Text style={styles.factValueMuted}>Trustlink does not process payment</Text>
          </Text>
        </View>
      </View>

      <View style={styles.wideDividedSection}>
        <SectionLabel>Attachments</SectionLabel>
        <View style={{ marginTop: space.sm }}>
          <WideFileChips attachments={requirement.attachments} />
        </View>
      </View>
    </View>
  );
}

function WideRecordCard({ requirement }: { requirement: Requirement }) {
  return (
    <View style={styles.wideCard}>
      <SectionLabel>Record</SectionLabel>
      <View style={styles.sideKeyValueList}>
        <LabelValueRow label="Reference" value={requirement.ref} mono />
        <LabelValueRow label="Published" value={requirement.publishedAt ? formatDateTime(requirement.publishedAt) : '—'} mono />
        <LabelValueRow label="Closing" value={formatDateTime(requirement.closingAt)} mono />
      </View>
    </View>
  );
}

/** The info band: quick facts + buyer identity (respondent only), countdown, count,
 *  actions (respondent only), and the seal-line footer. Present in all three states. */
function WideInfoBand({
  requirement,
  buyer,
  showRespondentFacts,
  showActions,
  showSubmit,
  onSubmitQuotation,
  sealTinted,
  countLabel,
  countCaption,
  sealLine,
}: {
  requirement: Requirement;
  buyer: Business | null;
  showRespondentFacts: boolean;
  showActions: boolean;
  showSubmit: boolean;
  onSubmitQuotation?: () => void;
  sealTinted: boolean;
  countLabel: string;
  countCaption: string;
  sealLine: string;
}) {
  const [saved, setSaved] = useState(false);
  const { label: countdownLabel, closed, urgent } = useCountdown(requirement.closingAt);
  const clockColor = closed ? color.inkMuted : urgent ? color.danger : color.ink;

  return (
    <View style={[styles.wideCard, sealTinted ? styles.wideCardSealedTint : null]}>
      {showRespondentFacts && buyer && (
        <>
          <View style={[styles.factsGrid, styles.wideDividedSectionBottom]}>
            <View style={styles.factsGridItem}>
              <SectionLabel>Quantity</SectionLabel>
              <Text style={styles.factValue}>{requirement.quantity}</Text>
            </View>
            <View style={styles.factsGridItem}>
              <SectionLabel>Location</SectionLabel>
              <Text style={styles.factValue}>
                {buyer.city}, {buyer.province}
                {'\n'}
                <Text style={styles.factValueMuted}>{requirement.deliverySite.name}</Text>
              </Text>
            </View>
            <View style={styles.factsGridItem}>
              <SectionLabel>Indicative budget</SectionLabel>
              <Text style={styles.factValue}>
                {formatBudget(requirement.budgetMin, requirement.budgetMax)}
                {'\n'}
                <Text style={styles.factValueMuted}>Stated, not binding</Text>
              </Text>
            </View>
            <View style={styles.factsGridItem}>
              <SectionLabel>Needed by</SectionLabel>
              <Text style={styles.factValue}>
                {requirement.deliveryWindow}
                {'\n'}
                <Text style={styles.factValueMuted}>Installation window</Text>
              </Text>
            </View>
          </View>

          <View style={[styles.wideBuyerRow, styles.wideDividedSectionBottom]}>
            <View style={styles.avatarChip}>
              <Text style={styles.avatarChipLabel}>{initials(buyer.displayName ?? buyer.registeredName)}</Text>
            </View>
            <View style={styles.wideBuyerInfo}>
              <View style={styles.wideBuyerNameRow}>
                <Text style={styles.wideBuyerName}>{buyer.displayName ?? buyer.registeredName}</Text>
                {buyer.credibility.verifiedAt && (
                  <View style={styles.verifiedTag}>
                    <Text style={styles.verifiedTagLabel}>Verified {formatDate(buyer.credibility.verifiedAt)}</Text>
                  </View>
                )}
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillLabel}>{tierLabel(buyer.credibility.tier)} of 3</Text>
                </View>
              </View>
              <Text style={styles.mutedSmall}>
                {buyer.credibility.requirementsPosted} requirements posted · {buyer.credibility.requirementsAwarded} awarded on Trustlink
              </Text>
            </View>
            <ActionButton label="View buyer profile" variant="outline" onPress={() => {}} />
          </View>
        </>
      )}

      <View style={styles.wideMetaRow}>
        <View style={styles.wideMetaBlock}>
          <SectionLabel>{closed ? 'Closed' : 'Closes in'}</SectionLabel>
          <View style={styles.wideCountdownRow}>
            <View style={[styles.statusDot, { backgroundColor: clockColor }]} />
            <Text style={[styles.wideCountdownValue, { color: clockColor }]}>{countdownLabel}</Text>
          </View>
          <Text style={styles.mutedSmall}>{formatDateTime(requirement.closingAt)}</Text>
        </View>

        <View style={styles.wideMetaDivider} />

        <View style={styles.wideMetaBlock}>
          <SectionLabel>{countLabel}</SectionLabel>
          <Text style={styles.wideCountValue}>{requirement.quotationCount}</Text>
          <Text style={styles.mutedSmall}>{countCaption}</Text>
        </View>

        <View style={styles.wideMetaSpacer} />

        {showActions && (
          <View style={styles.wideActionsRow}>
            <ActionButton
              label={saved ? 'Saved' : 'Save'}
              variant={saved ? 'tinted' : 'outline'}
              onPress={() => setSaved((v) => !v)}
            />
            {showSubmit && <ActionButton label="Submit quotation" variant="primary" onPress={onSubmitQuotation} />}
          </View>
        )}
      </View>

      <View style={styles.wideDividedSectionTop}>
        <Text style={styles.mutedSmall}>{sealLine}</Text>
      </View>
    </View>
  );
}

function WideSealedHero({ requirement }: { requirement: Requirement }) {
  const [showHow, setShowHow] = useState(false);
  const bars = Array.from({ length: Math.min(requirement.quotationCount, 12) });

  return (
    <View style={styles.wideHeroCard}>
      <View style={styles.wideHeroIcon} />
      <Text style={styles.wideHeroTitle}>{requirement.quotationCount} quotations are sealed</Text>
      <Text style={styles.wideHeroBody}>
        All submissions remain hidden until {formatDateTime(requirement.closingAt)}. At closing, all quotations open simultaneously.
      </Text>

      <View style={styles.sealBarsRow}>
        {bars.map((_, i) => (
          <View key={i} style={styles.sealBar} />
        ))}
      </View>
      <Text style={styles.wideHeroCaption}>
        {requirement.quotationCount} sealed record{requirement.quotationCount === 1 ? '' : 's'} · contents unreadable
      </Text>

      <ActionButton
        label={showHow ? 'Hide how sealed quotations work' : 'How sealed quotations work'}
        variant="outline"
        onPress={() => setShowHow((v) => !v)}
      />

      {showHow && (
        <View style={styles.wideHeroDisclosure}>
          <Text style={styles.bodyText}>
            Quotations stay unreadable so nobody can undercut a price they cannot see — the last quotation you
            receive is priced on the same information as the first.
          </Text>
          <Text style={styles.bodyText}>
            Each submission is recorded in a tamper-evident log the moment it arrives. At closing, every record
            is re-checked and any quotation altered after submission opens with a flag rather than being hidden.
            Withdrawals stay in the record alongside their replacement.
          </Text>
          <Text style={styles.wideLinkText}>View audit record</Text>
        </View>
      )}
    </View>
  );
}

function WideOwnerControlsCard({ requirement }: { requirement: Requirement }) {
  return (
    <View style={styles.wideCard}>
      <SectionLabel>Owner controls</SectionLabel>
      <ActionButton label="Edit contact and site notes" variant="outline" onPress={() => {}} />
      <View style={styles.wideDividedSectionTop}>
        <SectionLabel>Locked until closing</SectionLabel>
        <View style={{ gap: space.sm, marginTop: space.sm }}>
          {LOCKED_FIELDS.map((field) => (
            <Text key={field} style={styles.mutedSmall}>{field}</Text>
          ))}
        </View>
        <Text style={[styles.mutedSmall, { marginTop: space.sm }]}>
          {requirement.quotationCount} business{requirement.quotationCount === 1 ? '' : 'es'} have priced against
          these terms, so they cannot change. Cancellation is available only before the first quotation arrives.
        </Text>
      </View>
    </View>
  );
}

function WideMyRecordCard({
  quotation,
  ledgerEntry,
  onWithdraw,
}: {
  quotation: Quotation;
  ledgerEntry: LedgerEntry;
  onWithdraw?: () => void;
}) {
  const canWithdraw = quotation.status === 'SUBMITTED';
  return (
    <View style={styles.wideMyRecordCard}>
      <View style={styles.submittedTag}>
        <Text style={styles.submittedTagLabel}>Submitted · sealed</Text>
      </View>
      <Text style={styles.mutedSmall}>
        Your quotation is recorded and cannot be read by the buyer or any other respondent until closing.
      </Text>
      <View style={[styles.sideKeyValueList, styles.wideDividedSectionTop]}>
        <LabelValueRow label="Reference" value={quotation.ref} mono />
        <LabelValueRow label="Submitted" value={formatDateTime(quotation.submittedAt)} mono />
      </View>
      <Text style={styles.wideLedgerNote}>
        Recorded and tamper-evident · #{ledgerEntry.sequence}
      </Text>
      {canWithdraw ? (
        <>
          <ActionButton label="Withdraw quotation" variant="danger" onPress={onWithdraw} />
          <Text style={styles.mutedSmall}>
            Withdrawal is recorded in the ledger. The original entry is kept and shown to the buyer at release.
            You may resubmit until closing.
          </Text>
        </>
      ) : (
        <Text style={styles.mutedSmall}>Status: {quotationStatusLabel(quotation.status)}</Text>
      )}
    </View>
  );
}

function WideReleasedHeaderCard({
  st,
  requirement,
}: {
  st: ReturnType<typeof useOwnerReleased>;
  requirement: Requirement;
}) {
  return (
    <View style={styles.wideCard}>
      <View style={styles.wideReleasedHeaderRow}>
        <View style={{ minWidth: 0 }}>
          <Text style={styles.wideSectionTitle}>
            {st.visible.length} quotation{st.visible.length === 1 ? '' : 's'} released
          </Text>
          <Text style={styles.mutedSmall}>
            Opened {formatDateTime(requirement.closingAt)}
            {st.withdrawn.length > 0
              ? ` · ${st.withdrawn.length} withdrawal${st.withdrawn.length === 1 ? '' : 's'} in the record`
              : ''}
            {st.flaggedCount > 0 && (
              <Text style={{ color: color.danger }}>
                {' · '}{st.flaggedCount} integrity flag{st.flaggedCount === 1 ? '' : 's'}
              </Text>
            )}
          </Text>
        </View>
        <View style={styles.wideMetaSpacer} />
        <View style={styles.wideSortRow}>
          <SectionLabel>Sort</SectionLabel>
          {SORT_OPTIONS.map((option) => {
            const active = option.key === st.sortKey;
            return (
              <Pressable
                key={option.key}
                onPress={() => st.handleSortPress(option.key)}
                style={[styles.wideSortChip, active ? styles.wideSortChipActive : null]}
              >
                <Text style={[styles.wideSortChipLabel, active ? styles.wideSortChipLabelActive : null]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function WideQuotationCard({
  quotation,
  respondent,
  awardLocked,
  predecessor,
  onToggleShortlist,
  onRequestAward,
}: {
  quotation: Quotation;
  respondent: Respondent;
  awardLocked: boolean;
  predecessor: Quotation | null;
  onToggleShortlist: () => void;
  onRequestAward: () => void;
}) {
  const isAwarded = quotation.status === 'AWARDED';
  const isNotSelected = quotation.status === 'NOT_SELECTED';
  const isShortlisted = quotation.status === 'SHORTLISTED';
  const isFlagged = quotation.integrity === 'FLAGGED';
  const name = respondent.registeredName;

  const accentColor = isFlagged ? color.danger : isAwarded ? color.ink : isShortlisted ? color.primary : color.border;
  const avatarBg = isAwarded ? color.ink : color.primary;

  let stateLabel: string | null = null;
  let stateTone: BadgeTone = 'neutral';
  if (isAwarded) { stateLabel = 'Awarded'; stateTone = 'ink'; }
  else if (isNotSelected) { stateLabel = 'Not selected'; stateTone = 'neutral'; }
  else if (isShortlisted) { stateLabel = 'Shortlisted'; stateTone = 'primary'; }

  return (
    <View style={[styles.wideQuoteCard, { borderLeftColor: accentColor }, isFlagged ? styles.wideQuoteCardFlagged : null]}>
      <View style={styles.wideQuoteHeader}>
        <View style={[styles.avatarChip, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarChipLabel}>{initials(name)}</Text>
        </View>
        <View style={styles.wideBuyerInfo}>
          <View style={styles.wideBuyerNameRow}>
            <Text style={styles.wideBuyerName}>{name}</Text>
            {respondent.credibility.verifiedAt && (
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagLabel}>Verified {formatDate(respondent.credibility.verifiedAt)}</Text>
              </View>
            )}
            <View style={styles.tierPill}>
              <Text style={styles.tierPillLabel}>{tierLabel(respondent.credibility.tier)}</Text>
            </View>
          </View>
          <Text style={styles.mutedSmall}>
            {respondent.credibility.requirementsPosted} requirements posted · {respondent.credibility.quotationsAwarded} awarded on Trustlink
          </Text>
        </View>
        <View style={styles.wideQuoteHeaderTags}>
          {stateLabel && <Badge label={stateLabel} tone={stateTone} />}
          <View style={[styles.integrityTag, isFlagged ? styles.integrityTagFlagged : null]}>
            <Text style={[styles.integrityTagLabel, isFlagged ? { color: color.danger } : null]}>
              {isFlagged ? 'Integrity check failed' : predecessor ? 'Withdrawn and replaced' : 'Integrity verified'}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.factsGrid, styles.wideDividedSection]}>
        <View style={styles.factsGridItem}>
          <SectionLabel>Price</SectionLabel>
          <Text style={styles.widePriceValue}>{formatPHP(quotation.totalPrice)}</Text>
        </View>
        <View style={styles.factsGridItem}>
          <SectionLabel>Lead time</SectionLabel>
          <Text style={styles.factValue}>{quotation.leadTimeDays} days</Text>
        </View>
        <View style={styles.factsGridItem}>
          <SectionLabel>Payment terms</SectionLabel>
          <Text style={styles.factValue}>{quotation.paymentTerms}</Text>
        </View>
        <View style={styles.factsGridItem}>
          <SectionLabel>Valid until</SectionLabel>
          <Text style={styles.factValue}>{formatValidUntil(quotation.submittedAt, quotation.validityDays)}</Text>
        </View>
      </View>

      {quotation.notesToBuyer.length > 0 && (
        <Text style={styles.bodyText}>{quotation.notesToBuyer}</Text>
      )}

      <WideFileChips attachments={quotation.attachments} />

      {predecessor && (
        <View style={styles.ledgerHistoryCard}>
          <SectionLabel>Ledger history</SectionLabel>
          <View style={styles.ledgerHistoryRow}>
            <View style={styles.withdrawnTag}>
              <Text style={styles.withdrawnTagLabel}>Withdrawn</Text>
            </View>
            <Text style={[styles.labelValueValue, styles.mono]}>{predecessor.ref}</Text>
            <Text style={styles.mutedSmall}>
              Withdrawn {predecessor.withdrawnAt ? formatDateTime(predecessor.withdrawnAt) : ''} · replaced by this submission
            </Text>
          </View>
        </View>
      )}

      <View style={styles.wideQuoteFooter}>
        <Text style={styles.mutedSmall}>Submitted {formatDateTime(quotation.submittedAt)}</Text>
        <View style={styles.wideMetaSpacer} />
        <View style={styles.wideQuoteFooterActions}>
          <ActionButton label="View profile" variant="outline" onPress={() => {}} />
          <ActionButton label="Message" variant="outline" onPress={() => {}} />
          <ActionButton
            label={isShortlisted ? 'Shortlisted' : 'Shortlist'}
            variant={isShortlisted ? 'tinted' : 'outline'}
            onPress={onToggleShortlist}
            disabled={awardLocked}
          />
          <ActionButton
            label={isAwarded ? 'Awarded' : isNotSelected ? 'Not selected' : 'Award'}
            variant={isAwarded ? 'ink' : 'primary'}
            onPress={onRequestAward}
            disabled={awardLocked}
          />
        </View>
      </View>
    </View>
  );
}

function WideCloseoutCard({
  awarded,
  onCloseWithoutAward,
}: {
  awarded: boolean;
  onCloseWithoutAward?: () => void;
}) {
  return (
    <View style={styles.wideCloseoutCard}>
      <View style={styles.wideCloseoutBody}>
        <Text style={styles.bodyTextSemi}>{awarded ? 'This requirement is awarded' : 'No suitable quotation?'}</Text>
        <Text style={[styles.mutedSmall, { marginTop: space.xs }]}>
          {awarded
            ? 'All other respondents were notified that the requirement was awarded to another business.'
            : 'Closing without award notifies every respondent and records the outcome on your public profile. The requirement cannot be reopened.'}
        </Text>
      </View>
      {!awarded && <ActionButton label="Close without award" variant="danger" onPress={onCloseWithoutAward} />}
    </View>
  );
}

function WideDecisionCard({ st }: { st: ReturnType<typeof useOwnerReleased> }) {
  const decided = st.awardedId !== null;
  const title = decided ? 'Awarded' : st.shortlistedCount > 0 ? 'Shortlist in progress' : 'No decision recorded';
  const body = decided
    ? 'The award is written to the ledger. Contact details have been exchanged — Trustlink does not handle payment, delivery, or contracts, and observes nothing beyond this point.'
    : 'Shortlisting is optional. You may award directly from the released quotations, or shortlist first when comparing many.';

  return (
    <View style={styles.wideCard}>
      <SectionLabel>Decision</SectionLabel>
      <Text style={styles.wideCardTitle}>{title}</Text>
      <Text style={styles.mutedSmall}>{body}</Text>
      <View style={[styles.sideKeyValueList, styles.wideDividedSectionTop]}>
        <LabelValueRow label="Released" value={String(st.visible.length)} />
        <LabelValueRow label="Shortlisted" value={String(st.shortlistedCount)} />
      </View>
    </View>
  );
}

function WideIntegrityFlagCard() {
  return (
    <View style={styles.wideFlagCard}>
      <View style={styles.wideFlagHeader}>
        <View style={styles.flagDot} />
        <SectionLabel>Integrity flag</SectionLabel>
      </View>
      <Text style={[styles.mutedSmall, { marginTop: space.sm }]}>
        One quotation no longer matches the record made at submission. It stays in the list, marked, so you can
        judge it yourself.
      </Text>
      <Text style={[styles.wideLinkText, { color: color.danger, marginTop: space.md }]}>View audit record</Text>
    </View>
  );
}

/** Owns the OWNER_RELEASED hook (rules of hooks means it needs its own component)
 *  and lays out the full wide screen: main column cards, side column cards, modal. */
function WideOwnerReleasedScreen(props: OwnerReleasedProps) {
  const { requirement } = props;
  const st = useOwnerReleased(props);
  const decided = st.awardedId !== null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <View style={styles.pageWide}>
        <WideHeader requirement={requirement} />
        <View style={styles.columns}>
          <View style={styles.mainColumn}>
            <WideInfoBand
              requirement={requirement}
              buyer={null}
              showRespondentFacts={false}
              showActions={false}
              showSubmit={false}
              sealTinted={false}
              countLabel="Quotations released"
              countCaption="opened simultaneously"
              sealLine="Every quotation opened together at the closing time. Nobody saw a price before that moment."
            />
            <WideReleasedHeaderCard st={st} requirement={requirement} />
            <View style={{ gap: space.lg }}>
              {st.sorted.map((q) => {
                const predecessor = st.withdrawn.find((w) => w.replacedByQuotationId === q.id) ?? null;
                return (
                  <WideQuotationCard
                    key={q.id}
                    quotation={q}
                    respondent={st.respondents[q.respondentId]}
                    awardLocked={decided}
                    predecessor={predecessor}
                    onToggleShortlist={() => st.handleToggleShortlist(q.id)}
                    onRequestAward={() => st.setAwardTargetId(q.id)}
                  />
                );
              })}
            </View>
            <WideCloseoutCard awarded={decided} onCloseWithoutAward={props.onCloseWithoutAward} />
            <WideScopeCard requirement={requirement} />
          </View>
          <View style={[styles.sideColumn, stickyOnWeb]}>
            <WideDecisionCard st={st} />
            {st.flaggedCount > 0 && <WideIntegrityFlagCard />}
            <WideRecordCard requirement={requirement} />
          </View>
        </View>
        <AwardConfirmationModal
          visible={st.awardTargetId !== null}
          respondentName={st.awardTargetName}
          onCancel={() => st.setAwardTargetId(null)}
          onConfirm={() => {
            if (st.awardTargetId) st.handleConfirmAward(st.awardTargetId);
          }}
        />
      </View>
    </ScrollView>
  );
}

/* ─── Root component ────────────────────────────────── */

export default function RequirementDetail(props: RequirementDetailProps) {
  const { requirement } = props;
  const { width } = useWindowDimensions();
  const isWide = width >= breakpoint.desktop;

  if (!isWide) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <Header requirement={requirement} />
          <RequirementOverview requirement={requirement} />

          {props.state === 'RESPONDENT' && <RespondentPanel {...props} />}
          {props.state === 'OWNER_SEALED' && <OwnerSealedPanel requirement={requirement} />}
          {props.state === 'OWNER_RELEASED' && <OwnerReleasedPanel {...props} />}
        </View>
      </ScrollView>
    );
  }

  if (props.state === 'OWNER_RELEASED') {
    return <WideOwnerReleasedScreen {...props} />;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <View style={styles.pageWide}>
        <WideHeader requirement={requirement} />
        <View style={styles.columns}>
          <View style={styles.mainColumn}>
            <WideInfoBand
              requirement={requirement}
              buyer={props.state === 'RESPONDENT' ? props.buyer : null}
              showRespondentFacts={props.state === 'RESPONDENT'}
              showActions={props.state === 'RESPONDENT'}
              showSubmit={props.state === 'RESPONDENT' && !props.hasSubmitted}
              onSubmitQuotation={props.state === 'RESPONDENT' && !props.hasSubmitted ? props.onSubmitQuotation : undefined}
              sealTinted={props.state === 'OWNER_SEALED'}
              countLabel={props.state === 'OWNER_SEALED' ? 'Sealed quotations' : 'Quotations'}
              countCaption="contents sealed"
              sealLine={
                props.state === 'OWNER_SEALED'
                  ? 'You cannot see who has quoted or what they offered. Neither can they. Everything opens together at closing.'
                  : 'Your price stays hidden until closing — from the buyer and from every other business quoting.'
              }
            />
            {props.state === 'OWNER_SEALED' && <WideSealedHero requirement={requirement} />}
            <WideScopeCard requirement={requirement} />
          </View>
          <View style={[styles.sideColumn, stickyOnWeb]}>
            {props.state === 'RESPONDENT' && props.hasSubmitted && (
              <WideMyRecordCard
                quotation={props.ownQuotation}
                ledgerEntry={props.ledgerEntry}
                onWithdraw={props.onWithdraw}
              />
            )}
            {props.state === 'OWNER_SEALED' && <WideOwnerControlsCard requirement={requirement} />}
            <WideRecordCard requirement={requirement} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* ─── Wide layout: sticky side column ───────────────────
 * RN's own style types only know 'absolute' | 'relative' | 'static' for `position` —
 * 'sticky' is a react-native-web extension the type defs don't model. Native ScrollView
 * has no equivalent, so this only applies on web; native just gets a normal flowing column. */
const stickyOnWeb: ViewStyle =
  Platform.OS === 'web' ? ({ position: 'sticky', top: space.xxl } as unknown as ViewStyle) : {};

/* ─── Styles ─────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.canvas,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: space.xxl,
  },
  page: {
    width: '100%',
    maxWidth: layout.maxWidth,
    paddingHorizontal: layout.screenPadding,
    gap: space.section,
  },
  pageWide: {
    width: '100%',
    maxWidth: layout.maxWidthWide,
    paddingHorizontal: layout.screenPadding,
    gap: space.section,
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.xxl,
  },
  mainColumn: {
    flex: 3,
    gap: space.lg,
  },
  sideColumn: {
    flex: 1,
    minWidth: layout.sideColumnMinWidth,
    gap: space.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: font.display,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
  },
  ref: {
    fontFamily: font.mono,
    fontSize: fontSize.sm,
    color: color.inkFaint,
  },
  sectionLabel: {
    fontFamily: font.mono,
    fontSize: fontSize.micro,
    lineHeight: lineHeight.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.inkMuted,
    marginBottom: space.sm,
  },
  block: {},
  rowBlock: {
    flexDirection: 'row',
    gap: space.xl,
  },
  blockHalf: {
    flex: 1,
  },
  bodyText: {
    fontFamily: font.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: color.ink,
  },
  bodyTextSemi: {
    fontFamily: font.bodySemi,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: color.ink,
  },
  mutedSmall: {
    fontFamily: font.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: color.inkMuted,
  },
  mutedRow: {
    fontFamily: font.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: color.inkFaint,
  },
  specRow: {
    gap: space.xs,
  },
  specLabel: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.inkMuted,
  },
  specValue: {
    fontFamily: font.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: color.ink,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.sm,
  },
  countdown: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.xl,
    color: color.primary,
  },
  countdownClosed: {
    color: color.inkMuted,
  },
  countNumber: {
    fontFamily: font.display,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    color: color.ink,
  },
  sealedCard: {
    ...elevation.cardRaised,
    borderRadius: radius.lg,
    padding: space.lg,
    backgroundColor: color.surface,
    gap: space.md,
  },
  labelValueRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  labelValueLabel: {
    fontFamily: font.body,
    fontSize: fontSize.sm,
    color: color.inkMuted,
  },
  labelValueValue: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.ink,
    textAlign: 'right',
  },
  mono: {
    fontFamily: font.monoMedium,
  },
  actionButton: {
    minHeight: layout.minTouchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  actionButtonLabel: {
    fontFamily: font.bodySemi,
    fontSize: fontSize.base,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  badgeLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
  },
  sortBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  sortChip: {
    minHeight: layout.minTouchTarget,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  sortChipActive: {
    backgroundColor: color.primaryFaint,
    borderColor: color.primary,
  },
  sortChipLabel: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.inkMuted,
  },
  sortChipLabelActive: {
    color: color.primary,
  },
  quotationCard: {
    ...elevation.card,
    borderRadius: radius.lg,
    padding: space.lg,
    backgroundColor: color.surface,
    gap: space.md,
  },
  quotationCardAwarded: {
    borderColor: color.primary,
    backgroundColor: color.primaryFaint,
  },
  quotationCardFlagged: {
    borderColor: color.dangerBorder,
  },
  quotationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space.md,
  },
  respondentName: {
    fontFamily: font.bodySemi,
    fontSize: fontSize.md,
    color: color.ink,
  },
  quotationFactRow: {
    flexDirection: 'row',
    gap: space.lg,
  },
  quotationPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  priceText: {
    fontFamily: font.display,
    fontSize: fontSize.lg,
    color: color.ink,
  },
  quotationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: color.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  modalCard: {
    ...elevation.cardRaised,
    width: '100%',
    maxWidth: layout.maxWidth - layout.screenPadding * 2,
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    gap: space.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.sm,
  },
  modalActionButton: {
    flex: 1,
  },

  /* ─── Wide layout ─────────────────────────────────── */

  widePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  categoryPill: {
    borderWidth: 1,
    borderColor: color.primaryBorder,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  categoryPillLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.primary,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  wideTitle: {
    fontFamily: font.display,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
  },
  wideSubtitle: {
    fontFamily: font.body,
    fontSize: fontSize.base,
    color: color.inkMuted,
  },

  wideCard: {
    ...elevation.cardRaised,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    paddingVertical: space.xl,
    paddingHorizontal: space.xxl,
    gap: space.lg,
  },
  wideCardSealedTint: {
    backgroundColor: color.primaryFaint,
    borderColor: color.primaryBorder,
  },
  wideCardTitle: {
    fontFamily: font.display,
    fontSize: fontSize.md,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
  },

  wideDividedSection: {
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: color.borderFaint,
  },
  wideDividedSectionTop: {
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: color.borderFaint,
  },
  wideDividedSectionBottom: {
    paddingBottom: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: color.borderFaint,
  },

  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xl,
  },
  factsGridItem: {
    flexGrow: 1,
    flexBasis: layout.factMinWidth,
    minWidth: layout.factMinWidth,
  },
  factValue: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: color.ink,
    marginTop: space.xs,
  },
  factValueMuted: {
    fontFamily: font.body,
    color: color.inkMuted,
  },

  avatarChip: {
    width: space.section,
    height: space.section,
    borderRadius: radius.lg,
    backgroundColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChipLabel: {
    fontFamily: font.display,
    fontSize: fontSize.sm,
    color: color.canvas,
  },
  wideBuyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flexWrap: 'wrap',
  },
  wideBuyerInfo: {
    flex: 1,
    minWidth: layout.factMinWidth,
    gap: space.xs,
  },
  wideBuyerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  wideBuyerName: {
    fontFamily: font.display,
    fontSize: fontSize.md,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedTagLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.primary,
  },
  tierPill: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  tierPillLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.inkMuted,
  },

  wideMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
    flexWrap: 'wrap',
  },
  wideMetaBlock: {
    minWidth: layout.factMinWidth,
  },
  wideMetaDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: color.border,
  },
  wideMetaSpacer: {
    flex: 1,
    minWidth: space.sm,
  },
  wideCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.xs,
  },
  wideCountdownValue: {
    fontFamily: font.display,
    fontSize: fontSize.xl,
    letterSpacing: letterSpacing.tight,
  },
  wideCountValue: {
    fontFamily: font.display,
    fontSize: fontSize.xl,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
    marginTop: space.xs,
  },
  wideActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
  },

  wideHeroCard: {
    ...elevation.cardRaised,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    paddingVertical: space.xxxl,
    paddingHorizontal: space.xxl,
    alignItems: 'center',
    gap: space.lg,
  },
  wideHeroIcon: {
    width: space.xxxl * 2,
    height: space.xxxl * 2,
    borderRadius: radius.pill,
    backgroundColor: color.primaryFaint,
  },
  wideHeroTitle: {
    fontFamily: font.display,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
    textAlign: 'center',
    maxWidth: '80%',
  },
  wideHeroBody: {
    fontFamily: font.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: color.inkMuted,
    textAlign: 'center',
    maxWidth: '90%',
  },
  sealBarsRow: {
    flexDirection: 'row',
    gap: space.xs,
    width: '100%',
    maxWidth: layout.maxWidth,
  },
  sealBar: {
    flex: 1,
    height: space.xxxl,
    borderRadius: radius.sm,
    backgroundColor: color.primaryFaint,
    borderWidth: 1,
    borderColor: color.primaryBorder,
  },
  wideHeroCaption: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.inkFaint,
    textAlign: 'center',
  },
  wideHeroDisclosure: {
    alignSelf: 'stretch',
    paddingTop: space.xxl,
    borderTopWidth: 1,
    borderTopColor: color.borderFaint,
    gap: space.md,
  },
  wideLinkText: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.primary,
  },

  wideChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  fileChip: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    maxWidth: '100%',
  },
  fileChipLabel: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.inkMuted,
  },

  wideSpecTable: {
    borderWidth: 1,
    borderColor: color.borderFaint,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  wideSpecRow: {
    flexDirection: 'row',
    gap: space.lg,
    padding: space.md,
    borderBottomWidth: 1,
    borderBottomColor: color.borderFaint,
    backgroundColor: color.surface,
  },
  wideSpecRowAlt: {
    backgroundColor: color.surfaceSunken,
  },
  wideSpecKey: {
    flex: 1,
    fontFamily: font.mono,
    fontSize: fontSize.sm,
    color: color.inkMuted,
  },
  wideSpecValue: {
    flex: 2,
    fontFamily: font.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: color.ink,
  },

  sideKeyValueList: {
    gap: space.sm,
  },

  wideMyRecordCard: {
    borderWidth: 1,
    borderColor: color.primaryBorder,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    paddingVertical: space.xl,
    paddingHorizontal: space.xxl,
    gap: space.lg,
  },
  submittedTag: {
    alignSelf: 'flex-start',
    backgroundColor: color.primary,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  submittedTagLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.canvas,
  },
  wideLedgerNote: {
    fontFamily: font.body,
    fontSize: fontSize.sm,
    color: color.inkFaint,
  },

  wideReleasedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flexWrap: 'wrap',
  },
  wideSectionTitle: {
    fontFamily: font.display,
    fontSize: fontSize.lg,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
  },
  wideSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  wideSortChip: {
    minHeight: layout.minTouchTarget,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  wideSortChipActive: {
    backgroundColor: color.primaryFaint,
    borderColor: color.primaryBorder,
  },
  wideSortChipLabel: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.inkMuted,
  },
  wideSortChipLabelActive: {
    color: color.primary,
  },

  wideQuoteCard: {
    ...elevation.card,
    borderLeftWidth: 3,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    paddingVertical: space.xl,
    paddingHorizontal: space.xxl,
    gap: space.lg,
  },
  wideQuoteCardFlagged: {
    borderColor: color.dangerBorder,
  },
  wideQuoteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    flexWrap: 'wrap',
  },
  wideQuoteHeaderTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  widePriceValue: {
    fontFamily: font.display,
    fontSize: fontSize.lg,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
    marginTop: space.xs,
  },
  integrityTag: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  integrityTagFlagged: {
    borderColor: color.dangerBorder,
  },
  integrityTagLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.inkFaint,
  },

  ledgerHistoryCard: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceSunken,
    padding: space.lg,
  },
  ledgerHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flexWrap: 'wrap',
    marginTop: space.sm,
  },
  withdrawnTag: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  withdrawnTagLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.inkMuted,
  },

  wideQuoteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flexWrap: 'wrap',
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: color.borderFaint,
  },
  wideQuoteFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
  },

  wideCloseoutCard: {
    ...elevation.cardRaised,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    flexWrap: 'wrap',
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    paddingVertical: space.lg,
    paddingHorizontal: space.xxl,
  },
  wideCloseoutBody: {
    flex: 1,
    minWidth: layout.factMinWidth,
  },

  wideFlagCard: {
    borderWidth: 1,
    borderColor: color.dangerBorder,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    paddingVertical: space.lg,
    paddingHorizontal: space.xl,
  },
  wideFlagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  flagDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: color.danger,
  },
});
