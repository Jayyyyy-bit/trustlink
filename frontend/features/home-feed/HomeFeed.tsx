// features/home-feed/HomeFeed.tsx
// The authenticated business's main feed. One component, phone stack below
// breakpoint.desktop, wide dashboard at/above it — same pattern as RequirementDetail.tsx.
// Rebuilt from docs/design/Trustlink Home Feed.dc.html: same cards, same sections, same
// hierarchy as the design. Literal icon glyphs are dropped in favour of RN-native
// affordances (dots, badges, pills, initials chips) — the precedent RequirementDetail.tsx
// already set, since this project has no react-native-svg dependency.

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import {
  color,
  font,
  fontSize,
  lineHeight,
  letterSpacing,
  space,
  radius,
  layout,
  breakpoint,
} from '../../components/ui/tokens';
import type {
  Business,
  BusinessId,
  Requirement,
  Alert,
  AlertType,
  MessageThread,
  ISODateTime,
  TrustTier,
  RequirementStatus,
} from '../../lib/types';

/* ─── Props ─────────────────────────────────────────── */

/** Everything a feed card shows about the business that posted it — nothing more. */
type FeedBuyer = Pick<
  Business,
  'id' | 'registeredName' | 'displayName' | 'category' | 'city' | 'province' | 'capabilities' | 'credibility'
>;

export interface HomeFeedProps {
  viewer: Business;
  requirements: Requirement[];
  requirementBuyers: Record<BusinessId, FeedBuyer>;
  myRequirements: Requirement[];
  recentlyClosed: Requirement[];
  alerts: Alert[];
  messageThreads: MessageThread[];
  onSubmitQuotation?: (requirementId: string) => void;
  onPostRequirement?: () => void;
  onSelectRequirement?: (requirementId: string) => void;
}

/* ─── Formatting helpers ────────────────────────────── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthYear(iso: ISODateTime): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
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

function initials(name: string): string {
  const words = name.split(' ').filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const second = words[1]?.[0] ?? '';
  return (first + second).toUpperCase();
}

function timeAgoWords(iso: ISODateTime, now: number): string {
  const min = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return h === 1 ? '1 hour ago' : `${h} hours ago`;
  const d = Math.round(h / 24);
  return d === 1 ? '1 day ago' : `${d} days ago`;
}

function timeAgoCompact(iso: ISODateTime, now: number): string {
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
function formatCompactCountdown(closingAt: ISODateTime, now: number): { label: string; closed: boolean; hoursLeft: number } {
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

function shortCountdown(hoursLeft: number, closed: boolean): string {
  if (closed || hoursLeft <= 0) return 'Closed';
  if (hoursLeft < 1) return 'Ends within the hour';
  if (hoursLeft < 12) return `${Math.floor(hoursLeft)}h left`;
  return 'Ends today';
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

function alertTypeLabel(type: AlertType): string {
  switch (type) {
    case 'REQUIREMENT_CLOSING': return 'Requirement closing';
    case 'QUOTATION_RECEIVED': return 'Quotation received';
    case 'DECISION': return 'Decision';
    case 'VERIFICATION': return 'Verification';
  }
}

/** Presentation, not data — derived from type, never stored. */
function alertActionLabel(type: AlertType): string {
  switch (type) {
    case 'REQUIREMENT_CLOSING': return 'Review quotations';
    case 'QUOTATION_RECEIVED': return 'View quotation';
    case 'DECISION': return 'Open requirement';
    case 'VERIFICATION': return 'View details';
  }
}

function tierLabel(tier: TrustTier | null): string {
  return tier === null ? 'Unrated' : `Tier ${tier}`;
}

/** Boilerplate progression copy, hardcoded like the design's own JSX (not data-driven —
 *  the specific documents named here belong to the onboarding flow, not this screen). */
function tierProgressionLine(tier: TrustTier | null): string | null {
  switch (tier) {
    case null: return 'Complete verification to start earning trust tiers.';
    case 1: return 'Reach Tier 2 by completing your BIR registration and 5 awarded requirements.';
    case 2: return "Reach Tier 3 by adding your Mayor's permit and completing 10 awarded requirements.";
    case 3: return null;
  }
}

type Signal = { label: string; hint: string; urgent: boolean } | null;

function computeSignal(requirement: Requirement, hoursLeft: number, closed: boolean, matched: boolean, now: number): Signal {
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

function matchReason(buyerCity: string, viewer: Business): string {
  const capability = (viewer.capabilities[0] ?? viewer.category).toLowerCase();
  if (buyerCity === viewer.city) {
    return `Same category as your business, and the site is in ${viewer.city} — your service area. Your profile lists ${capability}.`;
  }
  return `Same category as your business. ${buyerCity} is within your listed delivery range, and the scope fits your ${capability} capability.`;
}

/* ─── Small building blocks ─────────────────────────── */

function AvatarChip({ label, size = 32, dark = true }: { label: string; size?: number; dark?: boolean }) {
  return (
    <View
      style={[
        styles.avatarChip,
        { width: size, height: size, borderRadius: size >= 40 ? radius.lg : radius.md, backgroundColor: dark ? color.ink : color.primary },
      ]}
    >
      <Text style={[styles.avatarChipLabel, { fontSize: size >= 40 ? fontSize.base : fontSize.sm }]}>{label}</Text>
    </View>
  );
}

function VerifiedTag({ verifiedAt }: { verifiedAt: ISODateTime | null }) {
  if (!verifiedAt) return null;
  return (
    <View style={styles.verifiedTag}>
      <Text style={styles.verifiedTagLabel}>Verified {formatMonthYear(verifiedAt)}</Text>
    </View>
  );
}

function TierTag({ tier }: { tier: TrustTier | null }) {
  return (
    <View style={styles.tierTag}>
      <Text style={styles.tierTagLabel}>{tierLabel(tier)}</Text>
    </View>
  );
}

/* Simple shape-built glyphs — no icon library, same precedent as RequirementDetail.tsx's
 * plain-shape/dot icons and its ↑/↓ sort-direction text glyphs. */

function CategoryIcon({ tone = color.primary }: { tone?: string }) {
  return (
    <View style={[styles.categoryIcon, { borderColor: tone }]}>
      <View style={[styles.categoryIconLine, { backgroundColor: tone }]} />
    </View>
  );
}

function PinIcon({ tone = color.primary }: { tone?: string }) {
  return (
    <View style={[styles.pinIcon, { borderColor: tone }]}>
      <View style={[styles.pinIconDot, { backgroundColor: tone }]} />
    </View>
  );
}

function BookmarkIcon({ filled, tone }: { filled: boolean; tone: string }) {
  return <View style={[styles.bookmarkIcon, { borderColor: tone, backgroundColor: filled ? tone : 'transparent' }]} />;
}

function ArrowIcon({ tone }: { tone: string }) {
  return (
    <View style={styles.arrowIconRow}>
      <View style={[styles.arrowIconLine, { backgroundColor: tone }]} />
      <View style={[styles.arrowIconHead, { borderColor: tone }]} />
    </View>
  );
}

type ButtonVariant = 'primary' | 'outline' | 'text' | 'tinted';

function FeedButton({
  label,
  onPress,
  variant = 'outline',
  disabled = false,
  icon,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.feedButton,
        {
          backgroundColor:
            variant === 'primary' ? (pressed ? color.primaryPressed : color.primary)
            : variant === 'tinted' ? color.primaryFaint
            : variant === 'text' ? 'transparent'
            : 'transparent',
          borderColor: variant === 'primary' ? color.primary : variant === 'tinted' ? color.primaryBorder : variant === 'text' ? 'transparent' : color.border,
          opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.feedButtonContent}>
        {icon}
        <Text
          style={[
            styles.feedButtonLabel,
            { color: variant === 'primary' ? color.onPrimary : variant === 'tinted' || variant === 'text' ? color.primary : color.inkMuted },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function PulseDot({ dotColor, pulse }: { dotColor: string; pulse: boolean }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!pulse) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, opacity]);
  return <Animated.View style={[styles.dot, { backgroundColor: dotColor, opacity }]} />;
}

/* ─── Header pieces ─────────────────────────────────── */

function Logo() {
  return (
    <View style={styles.logoRow}>
      <View style={styles.logoMark} />
      <Text style={styles.logoText}>Trustlink</Text>
    </View>
  );
}

function SearchField() {
  return (
    <View style={styles.searchField}>
      <TextInput
        placeholder="Search requirements or businesses"
        placeholderTextColor={color.inkFaint}
        style={styles.searchInput}
      />
    </View>
  );
}

function AlertRow({ alertItem, now }: { alertItem: Alert; now: number }) {
  return (
    <View style={[styles.alertRow, !alertItem.read ? styles.alertRowUnread : null]}>
      <View style={[styles.alertIcon, { borderColor: alertItem.urgent ? color.dangerBorder : color.primaryBorder }]} />
      <View style={{ flex: 1, gap: space.xs, minWidth: 0 }}>
        <View style={styles.alertTopRow}>
          <Text style={[styles.alertType, { color: alertItem.urgent ? color.danger : color.inkFaint }]}>{alertTypeLabel(alertItem.type)}</Text>
          <Text style={styles.alertTime}>{timeAgoCompact(alertItem.createdAt, now)}</Text>
        </View>
        <Text style={styles.alertTitle}>{alertItem.title}</Text>
        <Text style={styles.alertDetail}>{alertItem.detail}</Text>
        <View style={{ marginTop: space.xs }}>
          <FeedButton label={alertActionLabel(alertItem.type)} variant="outline" onPress={() => {}} />
        </View>
      </View>
    </View>
  );
}

function AlertsPanel({ alerts, now, onClose }: { alerts: Alert[]; now: number; onClose: () => void }) {
  const unread = alerts.filter((a) => !a.read).length;
  return (
    <View style={styles.dropdownPanel}>
      <View style={styles.dropdownHeader}>
        <Text style={styles.dropdownTitle}>Alerts</Text>
        <Text style={styles.dropdownMeta}>{unread} new</Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={onClose} hitSlop={8}>
          <Text style={styles.dropdownClose}>Close</Text>
        </Pressable>
      </View>
      <ScrollView style={{ maxHeight: 420 }}>
        {alerts.map((a) => (
          <AlertRow key={a.id} alertItem={a} now={now} />
        ))}
      </ScrollView>
      <Pressable style={styles.dropdownFooter} onPress={() => {}}>
        <Text style={styles.dropdownFooterLabel}>View all alerts</Text>
      </Pressable>
    </View>
  );
}

function ThreadRow({ thread, now }: { thread: MessageThread; now: number }) {
  return (
    <View style={styles.threadRow}>
      <AvatarChip label={initials(thread.counterpartyName)} size={30} dark={!thread.unread} />
      <View style={{ flex: 1, minWidth: 0, gap: space.xs }}>
        <View style={styles.alertTopRow}>
          <Text style={[styles.threadName, { fontFamily: thread.unread ? font.bodySemi : font.body }]} numberOfLines={1}>
            {thread.counterpartyName}
          </Text>
          <Text style={styles.alertTime}>{timeAgoCompact(thread.lastMessageAt, now)}</Text>
        </View>
        <Text style={[styles.threadPreview, { color: thread.unread ? color.inkMuted : color.inkFaint }]} numberOfLines={1}>
          {thread.lastMessagePreview}
        </Text>
        <Text style={styles.threadRef}>{thread.requirementRef}</Text>
      </View>
      {thread.unread && <View style={styles.dot} />}
    </View>
  );
}

function ChatWidget({
  threads,
  now,
  open,
  onToggle,
}: {
  threads: MessageThread[];
  now: number;
  open: boolean;
  onToggle: () => void;
}) {
  const unread = threads.filter((t) => t.unread).length;
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(340, width - 40);
  return (
    <View style={[styles.chatWidget, fixedOnWeb]} pointerEvents="box-none">
      {open && (
        <View style={[styles.dropdownPanel, { width: panelWidth, marginBottom: space.md }]}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Messages</Text>
            <Text style={styles.dropdownMeta}>{unread} unread</Text>
            <View style={{ flex: 1 }} />
            <Pressable onPress={onToggle} hitSlop={8}>
              <Text style={styles.dropdownClose}>Close</Text>
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 320 }}>
            {threads.map((t) => (
              <ThreadRow key={t.id} thread={t} now={now} />
            ))}
          </ScrollView>
          <Pressable style={styles.dropdownFooter} onPress={() => {}}>
            <Text style={styles.dropdownFooterLabel}>Open all messages</Text>
          </Pressable>
        </View>
      )}
      <Pressable onPress={onToggle} style={styles.chatButton}>
        <Text style={styles.chatButtonLabel}>Messages</Text>
        {unread > 0 && (
          <View style={styles.chatBadge}>
            <Text style={styles.chatBadgeLabel}>{unread}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

/* ─── Category filter ───────────────────────────────── */

function CategoryPills({
  categories,
  active,
  onSelect,
}: {
  categories: { name: string; count: number }[];
  active: string;
  onSelect: (name: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
      {categories.map((c) => {
        const on = c.name === active;
        return (
          <Pressable
            key={c.name}
            onPress={() => onSelect(c.name)}
            style={[styles.categoryPill, on ? styles.categoryPillActive : null]}
          >
            <Text style={[styles.categoryPillLabel, on ? styles.categoryPillLabelActive : null]}>{c.name}</Text>
            <Text style={[styles.categoryPillCount, on ? styles.categoryPillCountActive : null]}>{c.count}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ─── Profile sidebar ───────────────────────────────── */

function ProfileCard({ viewer }: { viewer: Business }) {
  const name = viewer.displayName ?? viewer.registeredName;
  const tier = viewer.credibility.tier;
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileTopRow}>
        <AvatarChip label={initials(name)} size={44} />
        <View style={{ minWidth: 0, flex: 1 }}>
          <Text style={styles.profileName}>{name}</Text>
          {viewer.credibility.status === 'VERIFIED' && (
            <Text style={styles.profileVerified}>Verified business</Text>
          )}
        </View>
      </View>

      <View style={styles.profileFactList}>
        <View style={styles.profileFactRow}>
          <CategoryIcon />
          <Text style={styles.profileFact}>{viewer.category}</Text>
        </View>
        <View style={styles.profileFactRow}>
          <PinIcon />
          <Text style={styles.profileFact}>{viewer.city}, {viewer.province}</Text>
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileSectionRow}>
          <Text style={styles.microLabel}>Trust tier</Text>
          <Text style={styles.profileSectionValue}>{tierLabel(tier)} of 3</Text>
        </View>
        <View style={styles.tierBarRow}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={[styles.tierBarSegment, tier !== null && n <= tier ? styles.tierBarSegmentFilled : null]} />
          ))}
        </View>
        <Text style={styles.profileSectionCaption}>
          {viewer.credibility.verifiedAt ? `Verified ${formatMonthYear(viewer.credibility.verifiedAt)}` : 'Not yet verified'}
          {viewer.credibility.recheckDueAt ? ` · re-check due ${formatMonthYear(viewer.credibility.recheckDueAt)}.` : '.'}
          {tierProgressionLine(tier) ? ` ${tierProgressionLine(tier)}` : ''}
        </Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileSectionRow}>
          <Text style={styles.microLabel}>Profile completion</Text>
          <Text style={styles.profileSectionValueMono}>{viewer.profileCompletionPct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${viewer.profileCompletionPct}%` }]} />
        </View>
        <Pressable style={styles.profileNextStep} onPress={() => {}}>
          <Text style={styles.profileNextStepLabel}>Add your Mayor&apos;s permit</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: space.lg }}>
        <FeedButton label="View business profile" variant="outline" onPress={() => {}} />
      </View>
    </View>
  );
}

function ActivityStatsCard({ viewer }: { viewer: Business }) {
  const c = viewer.credibility;
  const rows: { label: string; value: string }[] = [
    { label: 'Requirements posted', value: String(c.requirementsPosted) },
    { label: 'Quotations submitted', value: String(c.quotationsSubmitted) },
    { label: 'Requirements awarded to you', value: String(c.requirementsAwarded) },
    { label: 'On Trustlink since', value: String(viewer.memberSinceYear) },
  ];
  return (
    <View style={styles.statsCard}>
      <Text style={styles.microLabel}>Your activity on Trustlink</Text>
      <View style={{ marginTop: space.md }}>
        {rows.map((r) => (
          <View key={r.label} style={styles.statRow}>
            <Text style={styles.statLabel}>{r.label}</Text>
            <Text style={styles.statValue}>{r.value}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.statsCaption}>
        Buyers see these counts on your profile. Responding to more requirements raises your standing.
      </Text>
    </View>
  );
}

function CtaBanner({ onPostRequirement }: { onPostRequirement?: () => void }) {
  return (
    <View style={styles.ctaBanner}>
      <View style={{ flexShrink: 1, minWidth: 200, gap: space.xs }}>
        <Text style={styles.ctaTitle}>Need suppliers, contractors, or business partners?</Text>
        <Text style={styles.ctaSubtitle}>Reach verified businesses in your industry.</Text>
      </View>
      <View style={styles.ctaActions}>
        <FeedButton label="Post a Requirement" variant="primary" onPress={onPostRequirement} />
        <FeedButton label="Use Previous Requirement" variant="outline" onPress={() => {}} />
      </View>
    </View>
  );
}

/* ─── Feed card ──────────────────────────────────────── */

/** `transitionProperty`/`transitionDuration` aren't in RN's ViewStyle type — react-native-web
 *  passes them straight through to CSS, same escape hatch as stickyOnWeb/fixedOnWeb below.
 *  Native has no hover state to transition, so this is a no-op there. */
const cardHoverTransitionOnWeb: ViewStyle =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform, border-color',
        transitionDuration: '150ms',
        transitionTimingFunction: 'ease-out',
      } as unknown as ViewStyle)
    : {};

function RequirementCard({
  requirement,
  buyer,
  viewer,
  now,
  saved,
  quoted,
  onToggleSave,
  onSubmitQuotation,
  onSelect,
}: {
  requirement: Requirement;
  buyer: FeedBuyer;
  viewer: Business;
  now: number;
  saved: boolean;
  quoted: boolean;
  onToggleSave: () => void;
  onSubmitQuotation: () => void;
  onSelect: () => void;
}) {
  const { label: countdownLabel, closed, hoursLeft } = formatCompactCountdown(requirement.closingAt, now);
  const matched = requirement.category === viewer.category;
  const signal = computeSignal(requirement, hoursLeft, closed, matched, now);
  const urgent = !closed && hoursLeft < 24;
  const critical = !closed && hoursLeft < 6;
  const buyerName = buyer.displayName ?? buyer.registeredName;
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onSelect}
      {...(Platform.OS === 'web'
        ? { onHoverIn: () => setHovered(true), onHoverOut: () => setHovered(false) }
        : null)}
      style={[
        styles.card,
        cardHoverTransitionOnWeb,
        { borderColor: urgent ? (hovered ? color.danger : color.dangerBorder) : hovered ? color.borderStrong : color.border },
        hovered ? styles.cardHovered : null,
        matched ? styles.cardMatched : null,
      ]}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeLabel}>{requirement.category}</Text>
        </View>
        {signal && (
          <View style={[styles.signalBadge, signal.urgent ? styles.signalBadgeUrgent : null]}>
            <Text style={[styles.signalBadgeLabel, signal.urgent ? styles.signalBadgeLabelUrgent : null]}>{signal.label}</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <Text style={styles.cardRef}>{requirement.ref} · posted {requirement.publishedAt ? timeAgoWords(requirement.publishedAt, now) : ''}</Text>
      </View>

      <Text style={styles.cardTitle}>{requirement.title}</Text>

      <View style={styles.buyerRow}>
        <AvatarChip label={initials(buyerName)} size={32} />
        <View style={{ minWidth: 0, flex: 1, gap: space.xs }}>
          <View style={styles.buyerNameRow}>
            <Text style={styles.buyerName}>{buyerName}</Text>
            <VerifiedTag verifiedAt={buyer.credibility.verifiedAt} />
            <TierTag tier={buyer.credibility.tier} />
          </View>
          <Text style={styles.mutedSmall}>
            {buyer.credibility.requirementsPosted} requirements posted · {buyer.credibility.requirementsAwarded} awarded on Trustlink
          </Text>
        </View>
      </View>

      <View style={styles.factsRow}>
        <View style={styles.factItem}>
          <Text style={styles.microLabel}>Budget</Text>
          <Text style={styles.factValue}>{formatBudget(requirement.budgetMin, requirement.budgetMax)}</Text>
        </View>
        <View style={styles.factItem}>
          <Text style={styles.microLabel}>Location</Text>
          <Text style={styles.factValue}>{buyer.city}</Text>
        </View>
        <View style={styles.factItem}>
          <Text style={styles.microLabel}>Quotations received</Text>
          <Text style={styles.factValue}>
            {requirement.quotationCount} quotation{requirement.quotationCount === 1 ? '' : 's'}
            {requirement.lastQuotationAt ? ` · latest ${timeAgoWords(requirement.lastQuotationAt, now)}` : ''}
          </Text>
        </View>
      </View>

      {matched && (
        <View style={styles.matchBox}>
          <Text style={styles.microLabel}>Why this matches</Text>
          <Text style={styles.matchReasonText}>{matchReason(buyer.city, viewer)}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.countdownRow}>
          <PulseDot dotColor={urgent ? color.danger : color.inkMuted} pulse={critical} />
          <Text style={styles.countdownLabelText}>Closes in</Text>
          <Text style={[styles.countdownValue, { color: urgent ? color.danger : color.inkMuted }]}>{countdownLabel}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <FeedButton
          label={saved ? 'Saved' : 'Save'}
          variant={saved ? 'tinted' : 'outline'}
          onPress={onToggleSave}
          icon={<BookmarkIcon filled={saved} tone={saved ? color.primary : color.inkMuted} />}
        />
        <FeedButton label="View requirement" variant="outline" onPress={onSelect} />
        <FeedButton
          label={quoted ? 'Quotation sent' : 'Submit quotation'}
          variant={quoted ? 'text' : 'primary'}
          disabled={quoted}
          onPress={onSubmitQuotation}
          icon={!quoted ? <ArrowIcon tone={color.onPrimary} /> : undefined}
        />
      </View>
    </Pressable>
  );
}

/* ─── Your requirements / recently closed / closing soon ── */

function MyRequirementRow({ requirement, now }: { requirement: Requirement; now: number }) {
  const { hoursLeft, closed } = formatCompactCountdown(requirement.closingAt, now);
  let statusLabel: string;
  let statusColor: string;
  if (requirement.status === 'OPEN' && !closed && hoursLeft < 24) {
    statusLabel = `Closing in ${Math.max(1, Math.ceil(hoursLeft))}h`;
    statusColor = color.danger;
  } else if (requirement.status === 'OPEN') {
    statusLabel = 'Open';
    statusColor = color.primary;
  } else {
    statusLabel = requirementStatusLabel(requirement.status);
    statusColor = color.inkFaint;
  }
  const posted = requirement.publishedAt ? `Posted ${timeAgoWords(requirement.publishedAt, now)}` : 'Not yet published';
  const meta = `${posted} · ${requirement.category} · ${requirement.deliverySite.address} · ${formatBudget(requirement.budgetMin, requirement.budgetMax)}`;

  return (
    <View style={styles.myReqRow}>
      <View style={{ flex: 1, minWidth: 200, gap: space.xs }}>
        <View style={styles.myReqStatusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.myReqStatusLabel, { color: statusColor }]}>{statusLabel}</Text>
          <Text style={styles.cardRef}>{requirement.ref}</Text>
        </View>
        <Text style={styles.myReqTitle}>{requirement.title}</Text>
        <Text style={styles.mutedSmall}>{meta}</Text>
      </View>
      <View style={styles.myReqRight}>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.myReqCount}>{requirement.quotationCount}</Text>
          <Text style={styles.microLabel}>Quotations</Text>
        </View>
        <FeedButton
          label={requirement.status === 'AWARDED' ? 'View award' : 'Review quotations'}
          variant="outline"
          onPress={() => {}}
        />
      </View>
    </View>
  );
}

function ClosedRequirementRow({ requirement, buyerName, now }: { requirement: Requirement; buyerName: string; now: number }) {
  const outcome =
    requirement.status === 'AWARDED'
      ? { label: `Awarded · ${requirement.quotationCount} quotation${requirement.quotationCount === 1 ? '' : 's'}`, color: color.primary, border: color.primaryBorder }
      : { label: 'Closed · no quotations received', color: color.inkFaint, border: color.border };
  const meta = `${buyerName} · ${requirement.deliverySite.address} · ${formatBudget(requirement.budgetMin, requirement.budgetMax)}`;

  return (
    <View style={styles.closedRow}>
      <View style={{ flex: 1, minWidth: 220, gap: space.xs }}>
        <View style={styles.myReqStatusRow}>
          <View style={styles.categoryBadgeMuted}>
            <Text style={styles.categoryBadgeMutedLabel}>{requirement.category}</Text>
          </View>
          <Text style={styles.cardRef}>{requirement.ref} · closed {requirement.publishedAt ? timeAgoWords(requirement.closingAt, now) : ''}</Text>
        </View>
        <Text style={styles.closedTitle}>{requirement.title}</Text>
        <Text style={styles.mutedSmall}>{meta}</Text>
      </View>
      <View style={[styles.outcomeTag, { borderColor: outcome.border }]}>
        <View style={[styles.dot, { backgroundColor: outcome.color }]} />
        <Text style={[styles.outcomeLabel, { color: outcome.color }]}>{outcome.label}</Text>
      </View>
    </View>
  );
}

function ClosingSoonItem({ requirement, buyerName, now, onSelect }: { requirement: Requirement; buyerName: string; now: number; onSelect: () => void }) {
  const { hoursLeft, closed } = formatCompactCountdown(requirement.closingAt, now);
  return (
    <Pressable style={styles.closingSoonRow} onPress={onSelect}>
      <Text style={styles.closingSoonTitle} numberOfLines={2}>{requirement.title}</Text>
      <Text style={styles.mutedSmall}>{buyerName} · {formatBudget(requirement.budgetMin, requirement.budgetMax)}</Text>
      <View style={styles.myReqStatusRow}>
        <View style={[styles.dot, { backgroundColor: color.danger }]} />
        <Text style={[styles.closingSoonCountdown]}>{shortCountdown(hoursLeft, closed)}</Text>
      </View>
    </Pressable>
  );
}

function HowMatchingWorksCard() {
  return (
    <View style={styles.statsCard}>
      <Text style={styles.microLabel}>How matching works</Text>
      <Text style={styles.howMatchingBody}>
        Trustlink compares each new requirement against your category, service area, and the capabilities listed on
        your profile. Matched opportunities carry a blue edge and a written reason.
      </Text>
      <Pressable onPress={() => {}} style={{ marginTop: space.md }}>
        <Text style={styles.profileNextStepLabel}>Update your capabilities</Text>
      </Pressable>
    </View>
  );
}

/* ─── Shared state hook ─────────────────────────────── */

function useHomeFeed(props: HomeFeedProps) {
  const { viewer, requirements } = props;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [sessionQuoted, setSessionQuoted] = useState<Set<string>>(new Set());
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const categoryNames = Array.from(new Set(requirements.map((r) => r.category)));
  const categories = ['All', ...categoryNames].map((name) => ({
    name,
    count: name === 'All' ? requirements.length : requirements.filter((r) => r.category === name).length,
  }));

  const filtered = requirements.filter((r) => categoryFilter === 'All' || r.category === categoryFilter);
  const matchedCount = filtered.filter((r) => r.category === viewer.category).length;
  const resultLabel = `${filtered.length} Open · ${matchedCount} Matched to You`;

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const submitQuotation = (id: string) => {
    setSessionQuoted((prev) => new Set(prev).add(id));
    props.onSubmitQuotation?.(id);
  };

  const closingSoon = requirements
    .map((r) => ({ requirement: r, ...formatCompactCountdown(r.closingAt, now) }))
    .filter((r) => !r.closed && r.hoursLeft < 24)
    .sort((a, b) => a.hoursLeft - b.hoursLeft)
    .slice(0, 4);

  return {
    now,
    categories,
    categoryFilter,
    setCategoryFilter,
    filtered,
    resultLabel,
    saved,
    sessionQuoted,
    toggleSave,
    submitQuotation,
    alertsOpen,
    setAlertsOpen,
    chatOpen,
    setChatOpen,
    closingSoon,
  };
}

/* ─── Header (shared by phone + wide) ───────────────── */

function Header({
  viewer,
  alerts,
  now,
  alertsOpen,
  onToggleAlerts,
  showNav,
}: {
  viewer: Business;
  alerts: Alert[];
  now: number;
  alertsOpen: boolean;
  onToggleAlerts: () => void;
  showNav: boolean;
}) {
  const unread = alerts.filter((a) => !a.read).length;
  const name = viewer.displayName ?? viewer.registeredName;
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Logo />
        <SearchField />
        <View style={{ flex: 1 }} />
        {showNav && (
          <View style={styles.navRow}>
            <View style={[styles.navItem, styles.navItemActive]}>
              <Text style={styles.navLabelActive}>Home</Text>
            </View>
            <Pressable style={styles.navItem} onPress={() => {}}>
              <Text style={styles.navLabel}>My Quotations</Text>
            </Pressable>
            <Pressable style={styles.navItem} onPress={() => {}}>
              <Text style={styles.navLabel}>My Requirements</Text>
            </Pressable>
            <Pressable style={styles.navItem} onPress={() => {}}>
              <Text style={styles.navLabel}>Saved</Text>
            </Pressable>
          </View>
        )}
        <View>
          <Pressable style={styles.navItem} onPress={onToggleAlerts}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
              <Text style={[styles.navLabel, alertsOpen ? styles.navLabelActive : null]}>Alerts</Text>
              {unread > 0 && (
                <View style={styles.navBadge}>
                  <Text style={styles.navBadgeLabel}>{unread}</Text>
                </View>
              )}
            </View>
          </Pressable>
          {alertsOpen && (
            <View style={styles.alertsAnchor}>
              <AlertsPanel alerts={alerts} now={now} onClose={onToggleAlerts} />
            </View>
          )}
        </View>
        <View style={styles.profileChip}>
          <AvatarChip label={initials(name)} size={32} />
          <View style={{ minWidth: 0 }}>
            <Text style={styles.profileChipName} numberOfLines={1}>{name}</Text>
            <Text style={styles.profileChipTier}>Verified · {tierLabel(viewer.credibility.tier)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ─── Phone layout ───────────────────────────────────── */

function PhoneHomeFeed(props: HomeFeedProps) {
  const st = useHomeFeed(props);
  const { viewer, myRequirements, recentlyClosed, requirementBuyers, alerts, messageThreads } = props;

  return (
    <View style={styles.root}>
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <Header viewer={viewer} alerts={alerts} now={st.now} alertsOpen={st.alertsOpen} onToggleAlerts={() => st.setAlertsOpen((v) => !v)} showNav={false} />

      <View style={styles.page}>
        <CategoryPills categories={st.categories} active={st.categoryFilter} onSelect={st.setCategoryFilter} />
        <ProfileCard viewer={viewer} />
        <ActivityStatsCard viewer={viewer} />
        <CtaBanner onPostRequirement={props.onPostRequirement} />

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Business Opportunities</Text>
          <Text style={styles.microLabel}>{st.resultLabel}</Text>
        </View>
        <View style={{ gap: space.md }}>
          {st.filtered.map((r) => (
            <RequirementCard
              key={r.id}
              requirement={r}
              buyer={requirementBuyers[r.buyerId]}
              viewer={viewer}
              now={st.now}
              saved={st.saved.has(r.id)}
              quoted={st.sessionQuoted.has(r.id)}
              onToggleSave={() => st.toggleSave(r.id)}
              onSubmitQuotation={() => st.submitQuotation(r.id)}
              onSelect={() => props.onSelectRequirement?.(r.id)}
            />
          ))}
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Your requirements</Text>
            <Pressable onPress={() => {}}><Text style={styles.manageAllLink}>Manage all</Text></Pressable>
          </View>
          <View style={{ gap: space.md }}>
            {myRequirements.map((r) => (
              <MyRequirementRow key={r.id} requirement={r} now={st.now} />
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Recently closed on Trustlink</Text>
            <Text style={styles.microLabel}>Last 7 days</Text>
          </View>
          <Text style={styles.mutedSmall}>
            Outcomes are published once a buyer closes a requirement, so you can see what actually gets awarded in
            your category.
          </Text>
          <View style={{ gap: space.md, marginTop: space.sm }}>
            {recentlyClosed.map((r) => (
              <ClosedRequirementRow key={r.id} requirement={r} buyerName={requirementBuyers[r.buyerId]?.displayName ?? requirementBuyers[r.buyerId]?.registeredName ?? ''} now={st.now} />
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.microLabel}>Closing within 24 hours</Text>
          <View>
            {st.closingSoon.map(({ requirement }) => (
              <ClosingSoonItem
                key={requirement.id}
                requirement={requirement}
                buyerName={requirementBuyers[requirement.buyerId]?.displayName ?? requirementBuyers[requirement.buyerId]?.registeredName ?? ''}
                now={st.now}
                onSelect={() => props.onSelectRequirement?.(requirement.id)}
              />
            ))}
          </View>
        </View>

        <HowMatchingWorksCard />
      </View>
    </ScrollView>
    <ChatWidget threads={messageThreads} now={st.now} open={st.chatOpen} onToggle={() => st.setChatOpen((v) => !v)} />
    </View>
  );
}

/* ─── Wide layout ─────────────────────────────────────
 * Reproduces docs/design/Trustlink Home Feed.dc.html's structure directly: sticky
 * header with full nav, left sidebar (profile + stats), centre column (CTA, feed,
 * your requirements, recently closed), right sidebar (closing-soon rail, how-matching),
 * floating messages widget. Capped at layout.maxWidthDashboard (1760) — wider than
 * RequirementDetail.tsx's two-column layout.maxWidthWide, since a three-column dashboard
 * needs the extra room, and wider than the source design's own 1720px so the three
 * columns use more of the window on large screens.
 *
 * The category filter row lives in page content (not the header), and on web sticks to
 * the top of the viewport just below the fixed header once the user scrolls past it —
 * same stickyOnWeb/native gating as the sidebar below. Its resting position depends on
 * the header's rendered height (which varies with alert badges, nav wrapping, etc.), so
 * both the header and the filter row report their measured heights via onLayout and the
 * filter row's `top` — and the sidebar's, which now docks beneath the filter row too —
 * are derived from those measurements instead of a hardcoded constant. */

const stickyOnWeb: ViewStyle =
  Platform.OS === 'web' ? ({ position: 'sticky', top: 0 } as unknown as ViewStyle) : {};

/** `position: 'fixed'` isn't in RN's own Position type and StyleSheet.create silently
 *  drops it, same reason stickyOnWeb above is merged via the style array instead of
 *  baked into a StyleSheet.create entry. Native has no fixed-to-viewport concept, so it
 *  falls back to absolute (positioned by the nearest positioned ancestor). */
const fixedOnWeb: ViewStyle =
  Platform.OS === 'web' ? ({ position: 'fixed' } as unknown as ViewStyle) : { position: 'absolute' };

function WideHomeFeed(props: HomeFeedProps) {
  const st = useHomeFeed(props);
  const { viewer, myRequirements, recentlyClosed, requirementBuyers, alerts, messageThreads } = props;
  const [headerHeight, setHeaderHeight] = useState(0);
  const [categoryHeight, setCategoryHeight] = useState(0);
  const sidebarTop: ViewStyle = Platform.OS === 'web' ? { top: headerHeight + categoryHeight } : {};

  return (
    <View style={styles.root}>
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContentWide}>
      <View
        style={[styles.headerSticky, stickyOnWeb]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <Header viewer={viewer} alerts={alerts} now={st.now} alertsOpen={st.alertsOpen} onToggleAlerts={() => st.setAlertsOpen((v) => !v)} showNav />
      </View>

      <View
        style={[styles.categorySticky, stickyOnWeb, Platform.OS === 'web' ? { top: headerHeight } : {}]}
        onLayout={(e) => setCategoryHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.pageWide}>
          <CategoryPills categories={st.categories} active={st.categoryFilter} onSelect={st.setCategoryFilter} />
        </View>
      </View>

      <View style={styles.pageWide}>
        <View style={styles.columnsWide}>
          <View style={[styles.sideColumn, stickyOnWeb, sidebarTop]}>
            <ProfileCard viewer={viewer} />
            <ActivityStatsCard viewer={viewer} />
          </View>

          <View style={styles.mainColumnWide}>
            <CtaBanner onPostRequirement={props.onPostRequirement} />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Business Opportunities</Text>
              <Text style={styles.microLabel}>{st.resultLabel}</Text>
            </View>
            <View style={{ gap: space.md }}>
              {st.filtered.map((r) => (
                <RequirementCard
                  key={r.id}
                  requirement={r}
                  buyer={requirementBuyers[r.buyerId]}
                  viewer={viewer}
                  now={st.now}
                  saved={st.saved.has(r.id)}
                  quoted={st.sessionQuoted.has(r.id)}
                  onToggleSave={() => st.toggleSave(r.id)}
                  onSubmitQuotation={() => st.submitQuotation(r.id)}
                  onSelect={() => props.onSelectRequirement?.(r.id)}
                />
              ))}
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Your requirements</Text>
                <Pressable onPress={() => {}}><Text style={styles.manageAllLink}>Manage all</Text></Pressable>
              </View>
              <View style={{ gap: space.md }}>
                {myRequirements.map((r) => (
                  <MyRequirementRow key={r.id} requirement={r} now={st.now} />
                ))}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Recently closed on Trustlink</Text>
                <Text style={styles.microLabel}>Last 7 days</Text>
              </View>
              <Text style={styles.mutedSmall}>
                Outcomes are published once a buyer closes a requirement, so you can see what actually gets awarded
                in your category.
              </Text>
              <View style={{ gap: space.md, marginTop: space.sm }}>
                {recentlyClosed.map((r) => (
                  <ClosedRequirementRow key={r.id} requirement={r} buyerName={requirementBuyers[r.buyerId]?.displayName ?? requirementBuyers[r.buyerId]?.registeredName ?? ''} now={st.now} />
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.sideColumn, stickyOnWeb, sidebarTop]}>
            <View style={styles.statsCard}>
              <Text style={styles.microLabel}>Closing within 24 hours</Text>
              <View>
                {st.closingSoon.map(({ requirement }) => (
                  <ClosingSoonItem
                    key={requirement.id}
                    requirement={requirement}
                    buyerName={requirementBuyers[requirement.buyerId]?.displayName ?? requirementBuyers[requirement.buyerId]?.registeredName ?? ''}
                    now={st.now}
                    onSelect={() => props.onSelectRequirement?.(requirement.id)}
                  />
                ))}
              </View>
            </View>
            <HowMatchingWorksCard />
          </View>
        </View>
      </View>
    </ScrollView>
    <ChatWidget threads={messageThreads} now={st.now} open={st.chatOpen} onToggle={() => st.setChatOpen((v) => !v)} />
    </View>
  );
}

/* ─── Root component ────────────────────────────────── */

export default function HomeFeed(props: HomeFeedProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= breakpoint.desktop;
  return isWide ? <WideHomeFeed {...props} /> : <PhoneHomeFeed {...props} />;
}

/* ─── Styles ─────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  scrollContent: { paddingBottom: space.section },
  scrollContentWide: { paddingBottom: space.section },
  page: { width: '100%', paddingHorizontal: layout.screenPadding, gap: space.lg, paddingTop: space.lg },
  pageWide: { width: '100%', maxWidth: layout.maxWidthDashboard, marginHorizontal: 'auto', paddingHorizontal: layout.screenPadding },
  headerSticky: { backgroundColor: color.canvas, borderBottomWidth: 1, borderBottomColor: color.border, zIndex: 50 },
  categorySticky: { backgroundColor: color.canvas, borderBottomWidth: 1, borderBottomColor: color.border, zIndex: 40 },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xxl, paddingVertical: space.xl },
  sideColumn: { flex: 1, minWidth: layout.sideColumnMinWidth, maxWidth: 340, gap: space.lg },
  mainColumnWide: { flex: 3, minWidth: 0, gap: space.lg },
  sectionBlock: { gap: space.md, marginTop: space.xl, paddingTop: space.xl, borderTopWidth: 1, borderTopColor: color.border },

  /* header */
  header: { width: '100%', maxWidth: layout.maxWidthDashboard, marginHorizontal: 'auto', paddingHorizontal: layout.screenPadding, paddingVertical: space.md, backgroundColor: color.canvas },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logoMark: { width: 18, height: 18, borderRadius: radius.pill, borderWidth: 1.5, borderColor: color.primary },
  logoText: { fontFamily: font.display, fontSize: fontSize.base, color: color.ink },
  searchField: { flex: 1, minWidth: 140, maxWidth: 340, backgroundColor: color.surfaceSunken, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.sm },
  searchInput: { fontFamily: font.body, fontSize: fontSize.sm, color: color.ink },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  navItem: { paddingHorizontal: space.sm, paddingVertical: space.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  navItemActive: { borderBottomColor: color.ink },
  navLabel: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  navLabelActive: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.ink },
  navBadge: { backgroundColor: color.primary, borderRadius: radius.pill, paddingHorizontal: space.xs, paddingVertical: 1 },
  navBadgeLabel: { fontFamily: font.mono, fontSize: 10, color: color.onPrimary },
  profileChip: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minWidth: 0 },
  profileChipName: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
  profileChipTier: { fontFamily: font.mono, fontSize: 10, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.primary },

  /* dropdown panels (alerts / chat) */
  alertsAnchor: { position: 'absolute', top: 44, right: 0, zIndex: 70 },
  dropdownPanel: { width: 340, maxWidth: 340, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, overflow: 'hidden' },
  dropdownHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderBottomWidth: 1, borderBottomColor: color.border },
  dropdownTitle: { fontFamily: font.display, fontSize: fontSize.base, color: color.ink },
  dropdownMeta: { fontFamily: font.mono, fontSize: 10, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
  dropdownClose: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
  dropdownFooter: { alignItems: 'center', padding: space.md },
  dropdownFooterLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.primary },

  alertRow: { flexDirection: 'row', gap: space.md, padding: space.md, borderBottomWidth: 1, borderBottomColor: color.borderFaint },
  alertRowUnread: { backgroundColor: color.primaryFaint },
  alertIcon: { width: 30, height: 30, borderRadius: radius.md, borderWidth: 1 },
  alertTopRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  alertType: { flex: 1, fontFamily: font.mono, fontSize: 9.5, letterSpacing: letterSpacing.label, textTransform: 'uppercase' },
  alertTime: { fontFamily: font.mono, fontSize: fontSize.micro, color: color.inkFaint },
  alertTitle: { fontFamily: font.bodySemi, fontSize: fontSize.sm },
  alertDetail: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },

  threadRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, padding: space.md, borderBottomWidth: 1, borderBottomColor: color.borderFaint },
  threadName: { flex: 1, fontSize: fontSize.sm, color: color.ink },
  threadPreview: { fontFamily: font.body, fontSize: fontSize.sm },
  threadRef: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },

  chatWidget: { right: space.xl, bottom: space.xl, alignItems: 'flex-end', zIndex: 80 },
  chatButton: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: color.primary, borderRadius: radius.pill, paddingHorizontal: space.xl, paddingVertical: space.md },
  chatButtonLabel: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.onPrimary },
  chatBadge: { backgroundColor: color.onPrimary, borderRadius: radius.pill, paddingHorizontal: space.xs, paddingVertical: 1 },
  chatBadgeLabel: { fontFamily: font.mono, fontSize: fontSize.micro, color: color.primary },

  /* category pills */
  categoryRow: { flexDirection: 'row', gap: space.sm, paddingVertical: space.md },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm },
  categoryPillActive: { backgroundColor: color.ink, borderColor: color.ink },
  categoryPillLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
  categoryPillLabelActive: { color: color.canvas },
  categoryPillCount: { fontFamily: font.mono, fontSize: fontSize.micro, color: color.inkFaint },
  categoryPillCountActive: { color: color.canvas },

  /* profile sidebar */
  profileCard: { borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.xl },
  profileTopRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  profileName: { fontFamily: font.display, fontSize: fontSize.md, color: color.ink },
  profileVerified: { marginTop: space.xs, fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.primary },
  profileFactList: { gap: space.sm, marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: color.border },
  profileFactRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  profileFact: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  profileSection: { marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: color.border },
  profileSectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileSectionValue: { fontFamily: font.display, fontSize: fontSize.sm, color: color.ink },
  profileSectionValueMono: { fontFamily: font.mono, fontSize: fontSize.sm, color: color.ink },
  profileSectionCaption: { marginTop: space.sm, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  tierBarRow: { flexDirection: 'row', gap: space.xs, marginTop: space.sm },
  tierBarSegment: { flex: 1, height: 5, borderRadius: radius.pill, backgroundColor: color.borderFaint },
  tierBarSegmentFilled: { backgroundColor: color.ink },
  progressTrack: { height: 5, borderRadius: radius.pill, backgroundColor: color.borderFaint, marginTop: space.sm, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: color.ink, borderRadius: radius.pill },
  profileNextStep: { marginTop: space.md },
  profileNextStepLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },

  /* activity stats */
  statsCard: { borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, padding: space.xl },
  statRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: color.borderFaint },
  statLabel: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  statValue: { fontFamily: font.display, fontSize: fontSize.md, color: color.ink },
  statsCaption: { marginTop: space.md, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  howMatchingBody: { marginTop: space.sm, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },

  /* CTA banner */
  ctaBanner: { borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, backgroundColor: color.surface, padding: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.lg, flexWrap: 'wrap' },
  ctaTitle: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  ctaSubtitle: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  ctaActions: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },

  /* section headers */
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md },
  sectionHeading: { fontFamily: font.display, fontSize: fontSize.xl, color: color.ink },
  manageAllLink: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  microLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
  mutedSmall: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },

  /* feed card */
  card: { borderWidth: 1, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.xl, gap: space.md },
  cardMatched: { borderLeftWidth: 3, borderLeftColor: color.primary },
  cardHovered: { transform: [{ scale: 1.01 }] },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  categoryBadge: { borderWidth: 1, borderColor: color.primaryBorder, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  categoryBadgeLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.primary },
  categoryBadgeMuted: { borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 2 },
  categoryBadgeMutedLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkMuted },
  signalBadge: { borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  signalBadgeUrgent: { backgroundColor: color.danger, borderColor: color.danger },
  signalBadgeLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkMuted },
  signalBadgeLabelUrgent: { color: color.onPrimary },
  cardRef: { fontFamily: font.mono, fontSize: fontSize.micro, color: color.inkFaint },
  cardTitle: { fontFamily: font.display, fontSize: fontSize.lg, lineHeight: lineHeight.lg, color: color.ink },

  buyerRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: color.surfaceSunken, borderRadius: radius.lg, padding: space.md },
  buyerNameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  buyerName: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  avatarChip: { alignItems: 'center', justifyContent: 'center' },
  avatarChipLabel: { fontFamily: font.display, color: color.canvas },
  verifiedTag: { flexDirection: 'row', alignItems: 'center' },
  verifiedTagLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.primary },
  tierTag: { borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 2 },
  tierTagLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkMuted },

  factsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  factItem: { minWidth: layout.factMinWidth, gap: space.xs },
  factValue: { fontFamily: font.bodyMedium, fontSize: fontSize.base, color: color.ink },

  matchBox: { flexDirection: 'row', gap: space.sm, borderWidth: 1, borderStyle: 'dashed', borderColor: color.border, borderRadius: radius.lg, padding: space.md },
  matchReasonText: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.ink },

  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap', paddingTop: space.md, borderTopWidth: 1, borderTopColor: color.borderFaint },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  countdownLabelText: { fontFamily: font.body, fontSize: fontSize.base, color: color.inkMuted },
  countdownValue: { fontFamily: font.mono, fontSize: fontSize.base },
  dot: { width: 7, height: 7, borderRadius: radius.pill },

  feedButton: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm },
  feedButtonContent: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  feedButtonLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm },

  /* simple shape-built icons */
  categoryIcon: { width: 13, height: 10, borderWidth: 1.2, borderRadius: 2, justifyContent: 'center' },
  categoryIconLine: { height: 1.2, marginHorizontal: 1.5 },
  pinIcon: { width: 12, height: 12, borderRadius: radius.pill, borderWidth: 1.3, alignItems: 'center', justifyContent: 'center' },
  pinIconDot: { width: 4, height: 4, borderRadius: radius.pill },
  bookmarkIcon: { width: 10, height: 10, borderWidth: 1.3, borderRadius: 2 },
  arrowIconRow: { flexDirection: 'row', alignItems: 'center' },
  arrowIconLine: { width: 7, height: 1.4 },
  arrowIconHead: { width: 6, height: 6, borderTopWidth: 1.4, borderRightWidth: 1.4, transform: [{ rotate: '45deg' }], marginLeft: -3 },

  /* your requirements */
  myReqRow: { borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.lg, flexWrap: 'wrap' },
  myReqStatusRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  myReqStatusLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase' },
  myReqTitle: { fontFamily: font.display, fontSize: fontSize.base, color: color.ink },
  myReqRight: { flexDirection: 'row', alignItems: 'center', gap: space.xl },
  myReqCount: { fontFamily: font.display, fontSize: fontSize.xl, color: color.ink },

  /* recently closed */
  closedRow: { borderWidth: 1, borderColor: color.borderFaint, borderRadius: radius.xl, backgroundColor: color.surfaceSunken, padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.lg, flexWrap: 'wrap' },
  closedTitle: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  outcomeTag: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.sm },
  outcomeLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm },

  /* closing soon */
  closingSoonRow: { gap: space.xs, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: color.borderFaint },
  closingSoonTitle: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.ink },
  closingSoonCountdown: { fontFamily: font.mono, fontSize: fontSize.sm, color: color.danger },
});
