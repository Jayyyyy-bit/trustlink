// features/quotation/components/ReceiptHero.tsx
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, space, radius } from '../../../components/ui/tokens';
import type { Business, Requirement } from '../../../lib/types';
import { formatDateTime } from '../format';
import { LockGlyph } from './Glyphs';

export function ReceiptHero({ requirement, buyer }: { requirement: Requirement; buyer: Business }) {
  const buyerName = buyer.displayName ?? buyer.registeredName;
  return (
    <View style={styles.receiptHero}>
      <View style={styles.receiptIconCircle}>
        <LockGlyph />
      </View>
      <View style={styles.sealedPill}>
        <Text style={styles.sealedPillLabel}>Submitted · sealed</Text>
      </View>
      <Text style={styles.receiptTitle}>Your quotation is locked away until closing</Text>
      <Text style={styles.receiptSubtitle}>
        {buyerName} cannot see your price. Neither can any other business quoting for this job. Everything opens
        together on <Text style={styles.receiptSubtitleBold}>{formatDateTime(requirement.closingAt)}</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  receiptHero: { alignItems: 'center', gap: space.md, textAlign: 'center' } as ViewStyle,
  receiptIconCircle: { width: 66, height: 66, borderRadius: radius.pill, backgroundColor: color.primaryFaint, alignItems: 'center', justifyContent: 'center' },
  sealedPill: { backgroundColor: color.ink, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  sealedPillLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.canvas },
  receiptTitle: { textAlign: 'center', fontFamily: font.display, fontSize: fontSize.display, lineHeight: lineHeight.display, letterSpacing: letterSpacing.tight, color: color.ink, maxWidth: 480 },
  receiptSubtitle: { textAlign: 'center', fontFamily: font.body, fontSize: fontSize.base, lineHeight: lineHeight.base, color: color.inkMuted, maxWidth: 560 },
  receiptSubtitleBold: { fontFamily: font.bodySemi, color: color.ink },
});
