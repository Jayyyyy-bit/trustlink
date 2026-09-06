// features/quotation/components/TitleBlock.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, space } from '../../../components/ui/tokens';
import type { Business, Requirement } from '../../../lib/types';

export function TitleBlock({ requirement, buyer }: { requirement: Requirement; buyer: Business }) {
  const buyerName = buyer.displayName ?? buyer.registeredName;
  return (
    <View style={{ marginTop: space.md, gap: space.xs }}>
      <Text style={styles.pageTitle}>Your quotation for {requirement.title}</Text>
      <Text style={styles.pageSubtitle}>{buyerName} · {buyer.city}, {buyer.province}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontFamily: font.display,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
  },
  pageSubtitle: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
});
