// features/requirement-detail/components/WideQuotationCard.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, letterSpacing, space, radius, elevation } from '../../../components/ui/tokens';
import type { Quotation } from '../../../lib/types';
import type { Respondent } from '../useOwnerReleased';
import { formatDate, formatDateTime, formatPHP, formatValidUntil, initials, tierLabel } from '../format';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { Badge, type BadgeTone } from './Badge';
import { ActionButton } from './ActionButton';
import { WideFileChips } from './WideFileChips';

export function WideQuotationCard({
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
        <View style={[sharedStyles.avatarChip, { backgroundColor: avatarBg }]}>
          <Text style={sharedStyles.avatarChipLabel}>{initials(name)}</Text>
        </View>
        <View style={sharedStyles.wideBuyerInfo}>
          <View style={sharedStyles.wideBuyerNameRow}>
            <Text style={sharedStyles.wideBuyerName}>{name}</Text>
            {respondent.credibility.verifiedAt && (
              <View style={sharedStyles.verifiedTag}>
                <Text style={sharedStyles.verifiedTagLabel}>Verified {formatDate(respondent.credibility.verifiedAt)}</Text>
              </View>
            )}
            <View style={sharedStyles.tierPill}>
              <Text style={sharedStyles.tierPillLabel}>{tierLabel(respondent.credibility.tier)}</Text>
            </View>
          </View>
          <Text style={sharedStyles.mutedSmall}>
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

      <View style={[sharedStyles.factsGrid, sharedStyles.wideDividedSection]}>
        <View style={sharedStyles.factsGridItem}>
          <SectionLabel>Price</SectionLabel>
          <Text style={styles.widePriceValue}>{formatPHP(quotation.totalPrice)}</Text>
        </View>
        <View style={sharedStyles.factsGridItem}>
          <SectionLabel>Lead time</SectionLabel>
          <Text style={sharedStyles.factValue}>{quotation.leadTimeDays} days</Text>
        </View>
        <View style={sharedStyles.factsGridItem}>
          <SectionLabel>Payment terms</SectionLabel>
          <Text style={sharedStyles.factValue}>{quotation.paymentTerms}</Text>
        </View>
        <View style={sharedStyles.factsGridItem}>
          <SectionLabel>Valid until</SectionLabel>
          <Text style={sharedStyles.factValue}>{formatValidUntil(quotation.submittedAt, quotation.validityDays)}</Text>
        </View>
      </View>

      {quotation.notesToBuyer.length > 0 && (
        <Text style={sharedStyles.bodyText}>{quotation.notesToBuyer}</Text>
      )}

      <WideFileChips attachments={quotation.attachments} />

      {predecessor && (
        <View style={styles.ledgerHistoryCard}>
          <SectionLabel>Ledger history</SectionLabel>
          <View style={styles.ledgerHistoryRow}>
            <View style={styles.withdrawnTag}>
              <Text style={styles.withdrawnTagLabel}>Withdrawn</Text>
            </View>
            <Text style={[sharedStyles.labelValueValue, sharedStyles.mono]}>{predecessor.ref}</Text>
            <Text style={sharedStyles.mutedSmall}>
              Withdrawn {predecessor.withdrawnAt ? formatDateTime(predecessor.withdrawnAt) : ''} · replaced by this submission
            </Text>
          </View>
        </View>
      )}

      <View style={styles.wideQuoteFooter}>
        <Text style={sharedStyles.mutedSmall}>Submitted {formatDateTime(quotation.submittedAt)}</Text>
        <View style={sharedStyles.wideMetaSpacer} />
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

const styles = StyleSheet.create({
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
});
