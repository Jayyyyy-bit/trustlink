// features/home-feed/components/RequirementCard.tsx
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Bookmark, ArrowRight } from 'lucide-react-native';
import { color, font, fontSize, iconSize, letterSpacing, lineHeight, radius, space, layout } from '../../../components/ui/tokens';
import { AvatarChip, initials } from '../../../components/ui/AvatarChip';
import type { ISODateTime, Requirement, TrustTier } from '../../../lib/types';
import { computeSignal, formatBudget, formatCompactCountdown, formatMonthYear, tierLabel, timeAgoWords } from '../format';
import type { FeedBuyer } from '../types';
import { FeedButton } from './FeedButton';

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

function BookmarkIcon({ filled, tone }: { filled: boolean; tone: string }) {
  return <Bookmark size={iconSize.sm} color={tone} fill={filled ? tone : 'transparent'} strokeWidth={1.75} />;
}

function ArrowIcon({ tone }: { tone: string }) {
  return <ArrowRight size={iconSize.sm} color={tone} strokeWidth={1.75} />;
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

/** `transitionProperty`/`transitionDuration` aren't in RN's ViewStyle type — react-native-web
 *  passes them straight through to CSS, same escape hatch as stickyOnWeb/fixedOnWeb in
 *  HomeFeed.tsx. Native has no hover state to transition, so this is a no-op there. */
const cardHoverTransitionOnWeb: ViewStyle =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform, border-color',
        transitionDuration: '150ms',
        transitionTimingFunction: 'ease-out',
      } as unknown as ViewStyle)
    : {};

export function RequirementCard({
  requirement,
  buyer,
  now,
  saved,
  quoted,
  onToggleSave,
  onSubmitQuotation,
  onSelect,
}: {
  requirement: Requirement;
  buyer: FeedBuyer;
  now: number;
  saved: boolean;
  quoted: boolean;
  onToggleSave: () => void;
  onSubmitQuotation: () => void;
  onSelect: () => void;
}) {
  const { label: countdownLabel, closed, hoursLeft } = formatCompactCountdown(requirement.closingAt, now);
  const matched = Boolean(requirement.matchReason);
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

      {requirement.matchReason && (
        <View style={styles.matchBox}>
          <Text style={styles.microLabel}>Why this matches</Text>
          <Text style={styles.matchReasonText}>{requirement.matchReason}</Text>
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

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.xl, gap: space.md },
  cardMatched: { borderLeftWidth: 3, borderLeftColor: color.primary },
  cardHovered: { transform: [{ scale: 1.01 }] },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  categoryBadge: { borderWidth: 1, borderColor: color.primaryBorder, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  categoryBadgeLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.primary },
  signalBadge: { borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  signalBadgeUrgent: { backgroundColor: color.danger, borderColor: color.danger },
  signalBadgeLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkMuted },
  signalBadgeLabelUrgent: { color: color.onPrimary },
  cardRef: { fontFamily: font.mono, fontSize: fontSize.micro, color: color.inkFaint },
  cardTitle: { fontFamily: font.display, fontSize: fontSize.lg, lineHeight: lineHeight.lg, color: color.ink },

  buyerRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: color.surfaceSunken, borderRadius: radius.lg, padding: space.md },
  buyerNameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  buyerName: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  verifiedTag: { flexDirection: 'row', alignItems: 'center' },
  verifiedTagLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.primary },
  tierTag: { borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 2 },
  tierTagLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkMuted },

  factsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  factItem: { minWidth: layout.factMinWidth, gap: space.xs },
  microLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
  factValue: { fontFamily: font.bodyMedium, fontSize: fontSize.base, color: color.ink },
  mutedSmall: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },

  matchBox: { flexDirection: 'row', gap: space.sm, borderWidth: 1, borderStyle: 'dashed', borderColor: color.border, borderRadius: radius.lg, padding: space.md },
  matchReasonText: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.ink },

  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap', paddingTop: space.md, borderTopWidth: 1, borderTopColor: color.borderFaint },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  countdownLabelText: { fontFamily: font.body, fontSize: fontSize.base, color: color.inkMuted },
  countdownValue: { fontFamily: font.mono, fontSize: fontSize.base },
  dot: { width: 7, height: 7, borderRadius: radius.pill },
});
