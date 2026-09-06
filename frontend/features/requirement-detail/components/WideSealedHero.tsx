// features/requirement-detail/components/WideSealedHero.tsx

import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  color,
  font,
  fontSize,
  lineHeight,
  letterSpacing,
  space,
  radius,
  layout,
  elevation,
} from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { formatDateTime } from '../format';
import { sharedStyles } from '../sharedStyles';
import { ActionButton } from './ActionButton';

export function WideSealedHero({ requirement }: { requirement: Requirement }) {
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
          <Text style={sharedStyles.bodyText}>
            Quotations stay unreadable so nobody can undercut a price they cannot see — the last quotation you
            receive is priced on the same information as the first.
          </Text>
          <Text style={sharedStyles.bodyText}>
            Each submission is recorded in a tamper-evident log the moment it arrives. At closing, every record
            is re-checked and any quotation altered after submission opens with a flag rather than being hidden.
            Withdrawals stay in the record alongside their replacement.
          </Text>
          <Text style={sharedStyles.wideLinkText}>View audit record</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
