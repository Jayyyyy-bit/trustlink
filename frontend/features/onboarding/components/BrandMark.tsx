// features/onboarding/components/BrandMark.tsx
// Trustlink mark and wordmark only — the header's sole content.

import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, space, radius, color } from '../../../components/ui/tokens';

export function BrandMark() {
  return (
    <View style={styles.brandMarkRow}>
      <View style={styles.brandMarkGlyph} />
      <Text style={styles.brandWordmark}>Trustlink</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandMarkRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  brandMarkGlyph: { width: 20, height: 20, borderRadius: radius.pill, borderWidth: 1.6, borderColor: color.primary },
  brandWordmark: { fontFamily: font.display, fontSize: fontSize.base, color: color.ink },
});
