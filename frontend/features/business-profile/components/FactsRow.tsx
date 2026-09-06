// features/business-profile/components/FactsRow.tsx
import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, space } from '../../../components/ui/tokens';
import type { Business } from '../../../lib/types';
import { businessTypeLabel } from '../format';

export function FactsRow({ business }: { business: Business }) {
  return (
    <View style={styles.factsRow}>
      <Text style={styles.factText}>{businessTypeLabel(business.businessType)}</Text>
      <Text style={styles.factText}>{business.category}</Text>
      <Text style={styles.factText}>{business.city}, {business.province}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  factsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  factText: { fontFamily: font.body, fontSize: fontSize.base, color: color.inkMuted },
});
