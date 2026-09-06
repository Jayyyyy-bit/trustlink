// features/requirement-detail/components/SpecTable.tsx

import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, lineHeight, color, space } from '../../../components/ui/tokens';
import type { SpecRow } from '../../../lib/types';

export function SpecTable({ rows }: { rows: SpecRow[] }) {
  return (
    <View style={{ gap: space.sm }}>
      {rows.map((row, index) => (
        <View key={`${row.label}-${index}`} style={styles.specRow}>
          <Text style={styles.specLabel}>{row.label}</Text>
          <Text style={styles.specValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  specRow: {
    gap: space.xs,
  },
  specLabel: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.inkMuted,
  },
  specValue: {
    fontFamily: font.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: color.ink,
  },
});
