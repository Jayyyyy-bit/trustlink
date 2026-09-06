// features/business-profile/components/LabelValueRow.tsx
import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, space } from '../../../components/ui/tokens';

export function LabelValueRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.labelValueRow}>
      <Text style={styles.labelValueLabel}>{label}</Text>
      <Text style={styles.labelValueValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  labelValueRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md },
  labelValueLabel: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  labelValueValue: { fontFamily: font.bodyMedium, fontSize: fontSize.base, color: color.ink, textAlign: 'right' },
});
