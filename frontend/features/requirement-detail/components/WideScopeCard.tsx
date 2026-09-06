// features/requirement-detail/components/WideScopeCard.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, lineHeight, space, radius } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { splitParagraphs } from '../format';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { WideFileChips } from './WideFileChips';

export function WideScopeCard({ requirement }: { requirement: Requirement }) {
  return (
    <View style={sharedStyles.wideCard}>
      <View style={{ gap: space.md }}>
        <SectionLabel>Scope of work</SectionLabel>
        {splitParagraphs(requirement.scope).map((para, i) => (
          <Text key={i} style={sharedStyles.bodyText}>{para}</Text>
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

      <View style={[sharedStyles.factsGrid, sharedStyles.wideDividedSection]}>
        <View style={sharedStyles.factsGridItem}>
          <SectionLabel>Site address</SectionLabel>
          <Text style={sharedStyles.factValue}>
            {requirement.deliverySite.name}
            {'\n'}
            <Text style={sharedStyles.factValueMuted}>{requirement.deliverySite.address}</Text>
          </Text>
        </View>
        <View style={sharedStyles.factsGridItem}>
          <SectionLabel>Site access</SectionLabel>
          <Text style={sharedStyles.factValue}>
            {requirement.deliverySite.accessHours}
            {'\n'}
            <Text style={sharedStyles.factValueMuted}>{requirement.deliverySite.accessNote}</Text>
          </Text>
        </View>
        <View style={sharedStyles.factsGridItem}>
          <SectionLabel>Settlement</SectionLabel>
          <Text style={sharedStyles.factValue}>
            Direct between parties
            {'\n'}
            <Text style={sharedStyles.factValueMuted}>Trustlink does not process payment</Text>
          </Text>
        </View>
      </View>

      <View style={sharedStyles.wideDividedSection}>
        <SectionLabel>Attachments</SectionLabel>
        <View style={{ marginTop: space.sm }}>
          <WideFileChips attachments={requirement.attachments} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
