import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, space } from '../../../components/ui/tokens';

export function ScreenTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ gap: space.xs }}>
      <Text style={styles.pageTitle}>{title}</Text>
      <Text style={styles.pageSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontFamily: font.display, fontSize: fontSize.xl, lineHeight: lineHeight.xl, letterSpacing: letterSpacing.tight, color: color.ink },
  pageSubtitle: { maxWidth: 480, fontFamily: font.body, fontSize: fontSize.base, lineHeight: lineHeight.base, color: color.inkMuted },
});
