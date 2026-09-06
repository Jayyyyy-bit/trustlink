// features/home-feed/components/HowMatchingWorksCard.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, letterSpacing, lineHeight, radius, space } from '../../../components/ui/tokens';

export function HowMatchingWorksCard() {
  return (
    <View style={styles.statsCard}>
      <Text style={styles.microLabel}>How matching works</Text>
      <Text style={styles.howMatchingBody}>
        Trustlink compares each new requirement against your category, service area, and the capabilities listed on
        your profile. Matched opportunities carry a blue edge and a written reason.
      </Text>
      <Pressable onPress={() => {}} style={{ marginTop: space.md }}>
        <Text style={styles.profileNextStepLabel}>Update your capabilities</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  statsCard: { borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, padding: space.xl },
  microLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
  howMatchingBody: { marginTop: space.sm, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  profileNextStepLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
});
