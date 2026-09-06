// features/requirement-detail/components/WideInfoBand.tsx
// The info band: quick facts + buyer identity (respondent only), countdown, count,
// actions (respondent only), and the seal-line footer. Present in all three states.

import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, letterSpacing, space, radius, layout } from '../../../components/ui/tokens';
import type { Requirement, Business } from '../../../lib/types';
import { formatBudget, formatDate, formatDateTime, initials, tierLabel } from '../format';
import { useCountdown } from '../useCountdown';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { ActionButton } from './ActionButton';

export function WideInfoBand({
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
    <View style={[sharedStyles.wideCard, sealTinted ? styles.wideCardSealedTint : null]}>
      {showRespondentFacts && buyer && (
        <>
          <View style={[sharedStyles.factsGrid, styles.wideDividedSectionBottom]}>
            <View style={sharedStyles.factsGridItem}>
              <SectionLabel>Quantity</SectionLabel>
              <Text style={sharedStyles.factValue}>{requirement.quantity}</Text>
            </View>
            <View style={sharedStyles.factsGridItem}>
              <SectionLabel>Location</SectionLabel>
              <Text style={sharedStyles.factValue}>
                {buyer.city}, {buyer.province}
                {'\n'}
                <Text style={sharedStyles.factValueMuted}>{requirement.deliverySite.name}</Text>
              </Text>
            </View>
            <View style={sharedStyles.factsGridItem}>
              <SectionLabel>Indicative budget</SectionLabel>
              <Text style={sharedStyles.factValue}>
                {formatBudget(requirement.budgetMin, requirement.budgetMax)}
                {'\n'}
                <Text style={sharedStyles.factValueMuted}>Stated, not binding</Text>
              </Text>
            </View>
            <View style={sharedStyles.factsGridItem}>
              <SectionLabel>Needed by</SectionLabel>
              <Text style={sharedStyles.factValue}>
                {requirement.deliveryWindow}
                {'\n'}
                <Text style={sharedStyles.factValueMuted}>Installation window</Text>
              </Text>
            </View>
          </View>

          <View style={[styles.wideBuyerRow, styles.wideDividedSectionBottom]}>
            <View style={sharedStyles.avatarChip}>
              <Text style={sharedStyles.avatarChipLabel}>{initials(buyer.displayName ?? buyer.registeredName)}</Text>
            </View>
            <View style={sharedStyles.wideBuyerInfo}>
              <View style={sharedStyles.wideBuyerNameRow}>
                <Text style={sharedStyles.wideBuyerName}>{buyer.displayName ?? buyer.registeredName}</Text>
                {buyer.credibility.verifiedAt && (
                  <View style={sharedStyles.verifiedTag}>
                    <Text style={sharedStyles.verifiedTagLabel}>Verified {formatDate(buyer.credibility.verifiedAt)}</Text>
                  </View>
                )}
                <View style={sharedStyles.tierPill}>
                  <Text style={sharedStyles.tierPillLabel}>{tierLabel(buyer.credibility.tier)} of 3</Text>
                </View>
              </View>
              <Text style={sharedStyles.mutedSmall}>
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
          <Text style={sharedStyles.mutedSmall}>{formatDateTime(requirement.closingAt)}</Text>
        </View>

        <View style={styles.wideMetaDivider} />

        <View style={styles.wideMetaBlock}>
          <SectionLabel>{countLabel}</SectionLabel>
          <Text style={styles.wideCountValue}>{requirement.quotationCount}</Text>
          <Text style={sharedStyles.mutedSmall}>{countCaption}</Text>
        </View>

        <View style={sharedStyles.wideMetaSpacer} />

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

      <View style={sharedStyles.wideDividedSectionTop}>
        <Text style={sharedStyles.mutedSmall}>{sealLine}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wideCardSealedTint: {
    backgroundColor: color.primaryFaint,
    borderColor: color.primaryBorder,
  },
  wideDividedSectionBottom: {
    paddingBottom: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: color.borderFaint,
  },
  wideBuyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flexWrap: 'wrap',
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
  wideCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
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
});
