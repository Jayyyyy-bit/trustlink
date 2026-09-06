// features/quotation/components/VerifiedTierTag.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, letterSpacing } from '../../../components/ui/tokens';
import type { TrustTier } from '../../../lib/types';

export function VerifiedTierTag({ tier }: { tier: TrustTier | null }) {
  return (
    <View style={styles.verifiedTag}>
      <Text style={styles.verifiedTagLabel}>Verified · {tier === null ? 'Unrated' : `Tier ${tier}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  verifiedTag: { flexDirection: 'row', alignItems: 'center' },
  verifiedTagLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.primary },
});
