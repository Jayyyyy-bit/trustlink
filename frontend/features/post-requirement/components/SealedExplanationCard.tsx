import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, radius, space } from '../../../components/ui/tokens';
import type { ISODateTime } from '../../../lib/types';
import { formatDateTime } from '../format';
import { SectionLabel } from './SectionLabel';

export function SealedExplanationCard({ closingAt }: { closingAt: ISODateTime }) {
  return (
    <View style={styles.sealedCard}>
      <SectionLabel tone={color.primary}>Sealed until closing</SectionLabel>
      <Text style={styles.sealedHeading}>Quotations stay sealed until closing</Text>
      <Text style={styles.sealedBody}>
        Every quotation submitted before {formatDateTime(closingAt)} stays hidden — from you, and from every other business quoting.
        At closing, every sealed quotation opens at once, so no business ever prices against one it was never allowed to see.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sealedCard: { borderWidth: 1, borderColor: color.primaryBorder, borderLeftWidth: 3, borderLeftColor: color.primary, borderRadius: radius.xl, backgroundColor: color.primaryFaint, padding: space.lg, gap: space.xs },
  sealedHeading: { fontFamily: font.display, fontSize: fontSize.md, letterSpacing: letterSpacing.tight, color: color.ink },
  sealedBody: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
});
