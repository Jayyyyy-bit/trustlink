// features/quotation/components/PriceSection.tsx
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, space, radius } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { formatPHP, num } from '../format';
import type { FormState } from '../useQuotationForm';
import { sharedStyles } from '../sharedStyles';
import { StepLabel } from './StepLabel';
import { Pill } from './Pill';
import { AddDashedButton } from './AddDashedButton';
import { XGlyph } from './Glyphs';
import { SectionLabel } from './SectionLabel';

export function PriceSection({ requirement, st }: { requirement: Requirement; st: FormState }) {
  return (
    <View style={sharedStyles.card}>
      <View style={styles.cardHeaderRow}>
        <StepLabel n="01" label="Your price" />
        <View style={{ flex: 1 }} />
        <View style={styles.segmentGroup}>
          <Pill label="Line items" active={st.priceMode === 'LINES'} onPress={() => st.setPriceMode('LINES')} variant="segment" />
          <Pill label="Total price only" active={st.priceMode === 'TOTAL'} onPress={() => st.setPriceMode('TOTAL')} variant="segment" />
        </View>
      </View>

      {st.priceMode === 'LINES' ? (
        <View style={styles.lineItemsBox}>
          {st.items.length === 0 ? (
            <View style={styles.lineItemEmptyRow}>
              <Text style={styles.lineItemEmptyText}>No line items yet</Text>
              <AddDashedButton label="Add line item" onPress={st.addItem} prominent />
            </View>
          ) : (
            <>
              <View style={styles.lineItemsHeaderRow}>
                <Text style={[styles.lineItemsHeaderLabel, { flex: 2.4 }]}>Description</Text>
                <Text style={[styles.lineItemsHeaderLabel, { flex: 0.7 }]}>Qty</Text>
                <Text style={[styles.lineItemsHeaderLabel, { flex: 1 }]}>Unit price</Text>
                <Text style={[styles.lineItemsHeaderLabel, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                <View style={{ width: 28 }} />
              </View>
              {st.items.map((item) => (
                <View key={item.id} style={styles.lineItemRow}>
                  <TextInput
                    value={item.desc}
                    onChangeText={(v) => st.patchItem(item.id, 'desc', v)}
                    placeholder="Item description"
                    placeholderTextColor={color.inkFaint}
                    style={[styles.lineItemInput, { flex: 2.4 }]}
                  />
                  <TextInput
                    value={item.qty}
                    onChangeText={(v) => st.patchItem(item.id, 'qty', v)}
                    placeholder="1"
                    placeholderTextColor={color.inkFaint}
                    keyboardType="decimal-pad"
                    style={[styles.lineItemInput, styles.mono, { flex: 0.7 }]}
                  />
                  <TextInput
                    value={item.unit}
                    onChangeText={(v) => st.patchItem(item.id, 'unit', v)}
                    placeholder="0"
                    placeholderTextColor={color.inkFaint}
                    keyboardType="decimal-pad"
                    style={[styles.lineItemInput, styles.mono, { flex: 1 }]}
                  />
                  <Text style={[styles.lineItemAmount, { flex: 1 }]}>{formatPHP(num(item.qty) * num(item.unit))}</Text>
                  <Pressable onPress={() => st.removeItem(item.id)} style={styles.lineItemRemove} hitSlop={8}>
                    <XGlyph tone={color.inkFaint} />
                  </Pressable>
                </View>
              ))}
              <View style={{ marginTop: space.sm, marginHorizontal: space.sm, marginBottom: space.sm }}>
                <AddDashedButton label="Add line item" onPress={st.addItem} prominent />
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.totalOnlyBox}>
          <SectionLabel>Total price, all-in</SectionLabel>
          <View style={styles.totalOnlyField}>
            <Text style={styles.totalOnlyCurrency}>₱</Text>
            <TextInput
              value={st.totalOnly}
              onChangeText={st.setTotalOnly}
              placeholder="0"
              placeholderTextColor={color.inkFaint}
              keyboardType="decimal-pad"
              style={styles.totalOnlyInput}
            />
          </View>
        </View>
      )}

      <View style={styles.grandTotalRow}>
        <SectionLabel>Quotation total</SectionLabel>
        <Text style={styles.grandTotalValue}>{formatPHP(st.total)}</Text>
      </View>
      {!!st.budgetNote && <Text style={styles.budgetNote}>{st.budgetNote}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },

  segmentGroup: { flexDirection: 'row', backgroundColor: color.surfaceSunken, borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, padding: 2 },

  mono: { fontFamily: font.monoMedium },

  lineItemsBox: { borderWidth: 1, borderColor: color.borderFaint, borderRadius: radius.lg, overflow: 'hidden' },
  lineItemsHeaderRow: { flexDirection: 'row', gap: space.md, padding: space.sm, backgroundColor: color.surfaceSunken, borderBottomWidth: 1, borderBottomColor: color.borderFaint },
  lineItemsHeaderLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
  lineItemRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.xs, borderBottomWidth: 1, borderBottomColor: color.borderFaint },
  lineItemInput: { minWidth: 0, borderWidth: 1, borderColor: 'transparent', borderRadius: radius.sm, paddingHorizontal: space.sm, paddingVertical: space.xs, fontFamily: font.body, fontSize: fontSize.sm, color: color.ink },
  lineItemAmount: { fontFamily: font.monoMedium, fontSize: fontSize.sm, textAlign: 'right', color: color.ink },
  lineItemRemove: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  lineItemEmptyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, flexWrap: 'wrap', padding: space.sm },
  lineItemEmptyText: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkFaint },

  totalOnlyBox: { maxWidth: 340 },
  totalOnlyField: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm, marginTop: space.sm },
  totalOnlyCurrency: { fontFamily: font.mono, fontSize: fontSize.lg, color: color.inkFaint },
  totalOnlyInput: { flex: 1, minWidth: 0, fontFamily: font.monoMedium, fontSize: fontSize.lg, color: color.ink },

  grandTotalRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md, marginTop: space.xs, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.lg, backgroundColor: color.primaryFaint },
  grandTotalValue: { fontFamily: font.display, fontSize: fontSize.display, lineHeight: lineHeight.display, letterSpacing: letterSpacing.tight, color: color.ink },
  budgetNote: { textAlign: 'right', fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
});
