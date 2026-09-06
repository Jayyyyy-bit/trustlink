// features/quotation/components/SealSection.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, space, radius } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { formatDateTime } from '../format';
import type { FormState } from '../useQuotationForm';
import { sharedStyles } from '../sharedStyles';
import { StepLabel } from './StepLabel';
import { AckCheckbox } from './AckCheckbox';
import { ActionButton } from './ActionButton';

export function SealSection({
  requirement,
  st,
  onSaveDraft,
}: {
  requirement: Requirement;
  st: FormState;
  onSaveDraft?: () => void;
}) {
  return (
    <View style={[sharedStyles.card, styles.sealCard, { borderColor: st.ready ? color.primaryBorder : color.border }]}>
      <StepLabel n="04" label="Seal and submit" primary />
      <Text style={styles.sealHeading}>This is a commitment, not a saved draft.</Text>

      <View style={{ gap: space.sm, marginTop: space.sm }}>
        <AckCheckbox checked={st.ack1} onToggle={() => st.setAck1((v) => !v)}>
          Sealed from the buyer, other bidders, and Trustlink staff until{' '}
          <Text style={styles.ackBold}>{formatDateTime(requirement.closingAt)}</Text>, when all quotations open.
        </AckCheckbox>
        <AckCheckbox checked={st.ack2} onToggle={() => st.setAck2((v) => !v)}>
          Withdraw anytime before closing — it's recorded. After closing, no withdrawing, changing, or new prices.
        </AckCheckbox>
      </View>

      <View style={styles.sealFooterRow}>
        <ActionButton label="Save draft" variant="outline" onPress={onSaveDraft} />
        <View style={{ flex: 1, minWidth: 8 }} />
        <Text style={styles.sealHint}>
          {st.ready ? 'Your quotation seals immediately.' : 'Confirm both statements above to submit.'}
        </Text>
        <ActionButton label="Seal and submit" variant="primary" disabled={!st.ready} onPress={st.handleSeal} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sealCard: { borderLeftWidth: 3, borderLeftColor: color.primary },
  sealHeading: { fontFamily: font.display, fontSize: fontSize.lg, lineHeight: lineHeight.lg, letterSpacing: letterSpacing.tight, color: color.ink },
  ackBold: { fontFamily: font.bodySemi, color: color.ink },
  sealFooterRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap', marginTop: space.sm, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: color.borderFaint },
  sealHint: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted, maxWidth: 220 },
});
