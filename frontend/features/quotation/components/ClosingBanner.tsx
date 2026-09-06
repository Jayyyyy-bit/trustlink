// features/quotation/components/ClosingBanner.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, space, radius } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { useCountdown } from '../useCountdown';
import { formatDateTime } from '../format';

export function ClosingBanner({ requirement }: { requirement: Requirement }) {
  const { label, closed, urgent } = useCountdown(requirement.closingAt);
  return (
    <View style={styles.closingBanner}>
      <View style={[styles.closingDot, { backgroundColor: urgent ? color.danger : color.ink }]} />
      <Text style={[styles.closingCountdown, urgent ? styles.closingCountdownUrgent : null]}>
        {closed ? 'Closed' : `Closes in ${label}`}
      </Text>
      <Text style={styles.closingNoteText}>
        · Closes {formatDateTime(requirement.closingAt)} · Stays private until then — buyer and other businesses
        can't see it; withdraw and resend any time before closing.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  closingBanner: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  closingDot: { width: 7, height: 7, borderRadius: radius.pill },
  closingCountdown: { fontFamily: font.display, fontSize: fontSize.md, letterSpacing: letterSpacing.tight, color: color.ink },
  closingCountdownUrgent: { color: color.danger },
  closingNoteText: { flex: 1, minWidth: 220, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
});
