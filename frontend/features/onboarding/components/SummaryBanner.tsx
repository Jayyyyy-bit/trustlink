// features/onboarding/components/SummaryBanner.tsx

import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, lineHeight, space, radius, color } from '../../../components/ui/tokens';

export function SummaryBanner({ message }: { message: string }) {
  return (
    <View style={styles.summaryBanner}>
      <View style={styles.summaryDot} />
      <Text style={styles.summaryText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, borderWidth: 1, borderColor: color.dangerBorder, borderRadius: radius.lg, backgroundColor: color.surface, padding: space.sm },
  summaryDot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: color.danger, marginTop: 5 },
  summaryText: { flex: 1, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
});
