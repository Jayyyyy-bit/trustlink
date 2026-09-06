// features/requirement-detail/components/WideDecisionCard.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, letterSpacing } from '../../../components/ui/tokens';
import { useOwnerReleased } from '../useOwnerReleased';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { LabelValueRow } from './LabelValueRow';

export function WideDecisionCard({ st }: { st: ReturnType<typeof useOwnerReleased> }) {
  const decided = st.awardedId !== null;
  const title = decided ? 'Awarded' : st.shortlistedCount > 0 ? 'Shortlist in progress' : 'No decision recorded';
  const body = decided
    ? 'The award is written to the ledger. Contact details have been exchanged — Trustlink does not handle payment, delivery, or contracts, and observes nothing beyond this point.'
    : 'Shortlisting is optional. You may award directly from the released quotations, or shortlist first when comparing many.';

  return (
    <View style={sharedStyles.wideCard}>
      <SectionLabel>Decision</SectionLabel>
      <Text style={styles.wideCardTitle}>{title}</Text>
      <Text style={sharedStyles.mutedSmall}>{body}</Text>
      <View style={[sharedStyles.sideKeyValueList, sharedStyles.wideDividedSectionTop]}>
        <LabelValueRow label="Released" value={String(st.visible.length)} />
        <LabelValueRow label="Shortlisted" value={String(st.shortlistedCount)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wideCardTitle: {
    fontFamily: font.display,
    fontSize: fontSize.md,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
  },
});
