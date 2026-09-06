// features/requirement-detail/components/WideIntegrityFlagCard.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, space, radius } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';

export function WideIntegrityFlagCard() {
  return (
    <View style={styles.wideFlagCard}>
      <View style={styles.wideFlagHeader}>
        <View style={styles.flagDot} />
        <SectionLabel>Integrity flag</SectionLabel>
      </View>
      <Text style={[sharedStyles.mutedSmall, { marginTop: space.sm }]}>
        One quotation no longer matches the record made at submission. It stays in the list, marked, so you can
        judge it yourself.
      </Text>
      <Text style={[sharedStyles.wideLinkText, { color: color.danger, marginTop: space.md }]}>View audit record</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wideFlagCard: {
    borderWidth: 1,
    borderColor: color.dangerBorder,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    paddingVertical: space.lg,
    paddingHorizontal: space.xl,
  },
  wideFlagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  flagDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: color.danger,
  },
});
