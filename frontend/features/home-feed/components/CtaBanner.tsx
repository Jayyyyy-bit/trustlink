// features/home-feed/components/CtaBanner.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';
import { FeedButton } from './FeedButton';

export function CtaBanner({ onPostRequirement }: { onPostRequirement?: () => void }) {
  return (
    <View style={styles.ctaBanner}>
      <View style={{ flexShrink: 1, minWidth: 200, gap: space.xs }}>
        <Text style={styles.ctaTitle}>Need suppliers, contractors, or business partners?</Text>
        <Text style={styles.ctaSubtitle}>Reach verified businesses in your industry.</Text>
      </View>
      <View style={styles.ctaActions}>
        <FeedButton label="Post a Requirement" variant="primary" onPress={onPostRequirement} />
        <FeedButton label="Use Previous Requirement" variant="outline" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaBanner: { borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, backgroundColor: color.surface, padding: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.lg, flexWrap: 'wrap' },
  ctaTitle: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  ctaSubtitle: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  ctaActions: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
});
