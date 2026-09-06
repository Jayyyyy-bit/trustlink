// features/onboarding/components/ScreenTitle.tsx

import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, lineHeight, letterSpacing, space, color } from '../../../components/ui/tokens';
import { SUPPORTING_LINE } from '../format';

export function ScreenTitle({ title }: { title: string }) {
  return (
    <View style={{ gap: space.xs }}>
      <Text style={styles.pageTitle}>{title}</Text>
      <Text style={styles.pageSubtitle}>{SUPPORTING_LINE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontFamily: font.display, fontSize: fontSize.xl, lineHeight: lineHeight.xl, letterSpacing: letterSpacing.tight, color: color.ink },
  pageSubtitle: { maxWidth: 480, fontFamily: font.body, fontSize: fontSize.base, lineHeight: lineHeight.base, color: color.inkMuted },
});
