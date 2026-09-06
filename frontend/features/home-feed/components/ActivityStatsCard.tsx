// features/home-feed/components/ActivityStatsCard.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, letterSpacing, lineHeight, radius, space } from '../../../components/ui/tokens';
import type { Business } from '../../../lib/types';

export function ActivityStatsCard({ viewer }: { viewer: Business }) {
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

const styles = StyleSheet.create({
  statsCard: { borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, padding: space.xl },
  microLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
  statRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: color.borderFaint },
  statLabel: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  statValue: { fontFamily: font.display, fontSize: fontSize.md, color: color.ink },
  statsCaption: { marginTop: space.md, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
});
