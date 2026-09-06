// features/requirement-detail/components/LabelValueRow.tsx

import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, color, space } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';

export function LabelValueRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.labelValueRow}>
      <Text style={styles.labelValueLabel}>{label}</Text>
      <Text style={[sharedStyles.labelValueValue, mono ? sharedStyles.mono : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  labelValueRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  labelValueLabel: {
    fontFamily: font.body,
    fontSize: fontSize.sm,
    color: color.inkMuted,
  },
});
