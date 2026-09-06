// features/business-profile/components/OwnerBar.tsx
import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';
import { ActionButton } from './ActionButton';

export function OwnerBar({ onPreview }: { onPreview?: () => void }) {
  return (
    <View style={styles.topBar}>
      <View style={{ minWidth: 0 }}>
        <Text style={styles.topBarTitle}>Your business profile</Text>
        <Text style={styles.topBarNote}>Verified records and Trustlink activity are fixed.</Text>
      </View>
      <View style={{ flex: 1 }} />
      <ActionButton label="Preview public profile" variant="outline" onPress={onPreview} />
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
  topBarTitle: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  topBarNote: { marginTop: 2, fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
});
