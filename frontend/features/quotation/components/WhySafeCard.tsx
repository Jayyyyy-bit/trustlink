// features/quotation/components/WhySafeCard.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, space, radius } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';

const SAFETY_POINTS = [
  {
    title: 'Nobody can open it early',
    body: 'Your quotation is locked the moment you submit it. The buyer cannot peek at your price and quietly tell a competitor to come in lower — because the buyer cannot see it either. Every quotation on this requirement opens at the same second.',
  },
  {
    title: 'Nobody can change it — including us',
    body: 'When you submitted, Trustlink took a fingerprint of your quotation and wrote it into a permanent record that cannot be edited or erased. At closing your quotation is checked against that fingerprint. If a single figure had been altered, it would open with a warning attached, visible to the buyer.',
  },
  {
    title: 'You can still change your mind, until closing',
    body: 'Withdraw and submit a new price any time before closing. The withdrawal is written into the record too — the buyer will see that you revised, though never what the first price was. After closing, nothing can be changed by anyone.',
  },
];

export function WhySafeCard() {
  return (
    <View style={sharedStyles.card}>
      <Text style={styles.sealHeading}>Why your price is safe</Text>
      <View style={{ gap: space.xl, marginTop: space.sm }}>
        {SAFETY_POINTS.map((p, i) => (
          <View key={p.title} style={styles.safeRow}>
            <View style={styles.safeNumberCircle}>
              <Text style={styles.safeNumberText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.safeTitle}>{p.title}</Text>
              <Text style={styles.safeBody}>{p.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sealHeading: { fontFamily: font.display, fontSize: fontSize.lg, lineHeight: lineHeight.lg, letterSpacing: letterSpacing.tight, color: color.ink },
  safeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  safeNumberCircle: { width: 30, height: 30, borderRadius: radius.pill, backgroundColor: color.primaryFaint, alignItems: 'center', justifyContent: 'center' },
  safeNumberText: { fontFamily: font.mono, fontSize: fontSize.sm, color: color.primary },
  safeTitle: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  safeBody: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
});
