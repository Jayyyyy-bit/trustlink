// features/quotation/components/Breadcrumb.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, space } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';

export function Breadcrumb({ requirement, onBack }: { requirement: Requirement; onBack?: () => void }) {
  return (
    <View style={styles.breadcrumbRow}>
      <Pressable onPress={onBack} hitSlop={6}>
        <Text style={styles.breadcrumbLink}>Business Opportunities</Text>
      </Pressable>
      <Text style={styles.breadcrumbSep}>/</Text>
      <Text style={styles.breadcrumbLink}>{requirement.ref}</Text>
      <Text style={styles.breadcrumbSep}>/</Text>
      <Text style={styles.breadcrumbCurrent}>Submit quotation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  breadcrumbRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  breadcrumbLink: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkFaint },
  breadcrumbSep: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkFaint },
  breadcrumbCurrent: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
});
