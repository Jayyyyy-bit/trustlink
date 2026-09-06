// features/business-profile/components/ActivityStats.tsx
import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';
import type { CredibilityBlock } from '../../../lib/types';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';

export function ActivityStats({ credibility, isOwner }: { credibility: CredibilityBlock; isOwner: boolean }) {
  const items = [
    { label: 'Requirements posted', value: credibility.requirementsPosted },
    { label: 'Requirements awarded', value: credibility.requirementsAwarded },
    { label: 'Quotations submitted', value: credibility.quotationsSubmitted },
    { label: 'Quotations awarded', value: credibility.quotationsAwarded },
  ];
  return (
    <View style={sharedStyles.block}>
      <View style={sharedStyles.blockHeaderRow}>
        <SectionLabel>Trustlink activity</SectionLabel>
        <View style={{ flex: 1 }} />
        {isOwner && <Text style={styles.mutedMicro}>Counted by Trustlink · not editable</Text>}
      </View>
      <View style={styles.statsGrid}>
        {items.map((it) => (
          <View key={it.label} style={styles.statTile}>
            <Text style={styles.statValue}>{it.value}</Text>
            <Text style={styles.statLabel}>{it.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  statTile: { flexGrow: 1, minWidth: 130, backgroundColor: color.surfaceSunken, borderRadius: radius.lg, padding: space.md },
  statValue: { fontFamily: font.display, fontSize: fontSize.xl, color: color.ink },
  statLabel: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  mutedMicro: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkFaint },
});
