import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, lineHeight } from '../../../components/ui/tokens';

export function SummaryBlock({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.summaryLineLabel}>{label}</Text>
      <Text style={styles.summaryBlockValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryLineLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
  summaryBlockValue: { marginTop: 2, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.ink },
});
