// features/business-profile/components/PreviewBar.tsx
import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';
import { ActionButton } from './ActionButton';

export function PreviewBar({ onExit }: { onExit?: () => void }) {
  return (
    <View style={[styles.topBar, styles.topBarPreview]}>
      <Text style={styles.topBarPreviewTitle}>You&apos;re viewing your profile as others see it.</Text>
      <View style={{ flex: 1 }} />
      <ActionButton label="Back to editing" variant="primary" onPress={onExit} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.md,
    borderWidth: 1,
    borderColor: color.borderFaint,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceSunken,
    padding: space.lg,
  },
  topBarPreview: { backgroundColor: color.primaryFaint, borderColor: color.primaryBorder },
  topBarPreviewTitle: { fontFamily: font.bodyMedium, fontSize: fontSize.base, color: color.primary },
});
