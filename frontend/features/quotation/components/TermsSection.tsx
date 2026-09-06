// features/quotation/components/TermsSection.tsx
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { color, font, fontSize, space, radius } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { formatDate } from '../format';
import { VALIDITY_OPTIONS, PAYMENT_TERM_OPTIONS } from '../useQuotationForm';
import type { FormState } from '../useQuotationForm';
import { sharedStyles } from '../sharedStyles';
import { StepLabel } from './StepLabel';
import { Pill } from './Pill';

export function TermsSection({ requirement, st }: { requirement: Requirement; st: FormState }) {
  return (
    <View style={sharedStyles.card}>
      <StepLabel n="02" label="Terms" />

      <View style={styles.termsGrid}>
        <View style={styles.termsGridItem}>
          <Text style={styles.fieldLabel}>How long will the work take?</Text>
          <Text style={styles.fieldCaption}>Counted from the day you're awarded, not from today.</Text>
          <View style={styles.leadField}>
            <TextInput
              value={st.lead}
              onChangeText={st.setLead}
              placeholder="6"
              placeholderTextColor={color.inkFaint}
              keyboardType="decimal-pad"
              style={styles.leadInput}
            />
            <Text style={styles.leadUnit}>weeks</Text>
          </View>
          <Text style={styles.fieldNote}>Buyer needs delivery {requirement.deliveryWindow}.</Text>
        </View>

        <View style={styles.termsGridItem}>
          <Text style={styles.fieldLabel}>How long is this price good for?</Text>
          <Text style={styles.fieldCaption}>After that, the buyer would need to ask you for a new price.</Text>
          <View style={styles.pillGroupWrap}>
            {VALIDITY_OPTIONS.map((v) => (
              <Pill key={v} label={`${v} days`} active={st.validity === v} onPress={() => st.setValidity(v)} />
            ))}
          </View>
          <Text style={styles.fieldNote}>This price holds until {formatDate(st.validUntilDate)}.</Text>
        </View>
      </View>

      <View style={sharedStyles.dividedTop}>
        <Text style={styles.fieldLabel}>Payment terms</Text>
        <Text style={styles.fieldCaption}>Settled directly with the buyer — Trustlink does not process payment.</Text>
        <View style={styles.pillGroupWrap}>
          {PAYMENT_TERM_OPTIONS.map((t) => (
            <Pill key={t} label={t} active={st.term === t} onPress={() => st.setTerm(t)} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  termsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  termsGridItem: { flexGrow: 1, flexBasis: 230, minWidth: 230 },
  fieldLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
  fieldCaption: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  fieldNote: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  leadField: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.xs },
  leadInput: { flex: 1, minWidth: 0, fontFamily: font.monoMedium, fontSize: fontSize.base, color: color.ink },
  leadUnit: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  pillGroupWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.xs },
});
