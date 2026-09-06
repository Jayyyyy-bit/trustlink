import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, space } from '../../../components/ui/tokens';

export function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryLine}>
      <Text style={styles.summaryLineLabel}>{label}</Text>
      <Text style={styles.summaryLineValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.md, flexWrap: 'wrap' },
  summaryLineLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
  summaryLineValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.body, fontSize: fontSize.sm, color: color.ink },
});
