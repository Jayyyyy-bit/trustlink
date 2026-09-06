import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { color, font, fontSize, lineHeight, radius, space } from '../../../components/ui/tokens';
import type { DetailsProps } from '../PostRequirement';
import { CATEGORIES } from '../mock';
import { num, listOut } from '../format';
import { sharedStyles } from '../sharedStyles';
import { ScreenTitle } from './ScreenTitle';
import { SummaryBanner } from './SummaryBanner';
import { FieldLabel } from './FieldLabel';
import { Pill } from './Pill';
import { FormDivider } from './FormDivider';
import { AddDashedButton } from './AddDashedButton';
import { SpecificationEditRow } from './SpecificationEditRow';
import type { SpecRowDraft } from './SpecificationEditRow';

/* STEP 1 — DETAILS: Category, title, scope, specifications, quantity, indicative budget.
 * Nothing about location, dates, attachments, or closing. */

export function DetailsScreen({ poster, initial, onContinue, reportContinue }: DetailsProps & { reportContinue: (fn: () => void) => void }) {
  const [category, setCategory] = useState(initial?.category ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [scope, setScope] = useState(initial?.scope ?? '');
  const [specRows, setSpecRows] = useState<SpecRowDraft[]>(
    () => (initial?.specifications ?? []).map((s, i) => ({ id: `spec-init-${i}`, label: s.label, value: s.value })),
  );
  const [quantity, setQuantity] = useState(initial?.quantity ?? '');
  const [budgetMinText, setBudgetMinText] = useState(initial?.budgetMin != null ? String(initial.budgetMin) : '');
  const [budgetMaxText, setBudgetMaxText] = useState(initial?.budgetMax != null ? String(initial.budgetMax) : '');
  const [attempted, setAttempted] = useState(false);

  const budgetMin = num(budgetMinText);
  const budgetMax = num(budgetMaxText);
  const budgetReversed = budgetMin !== null && budgetMax !== null && budgetMin > budgetMax;

  const addSpecRow = () => setSpecRows((prev) => [...prev, { id: `spec${Date.now()}`, label: '', value: '' }]);
  const removeSpecRow = (id: string) => setSpecRows((prev) => prev.filter((r) => r.id !== id));
  const updateSpecRow = (id: string, field: 'label' | 'value', v: string) =>
    setSpecRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: v } : r)));

  const filledSpecRows = specRows.filter((r) => r.label.trim() && r.value.trim());

  const missing: string[] = [];
  if (!category) missing.push('a category');
  if (!title.trim()) missing.push('a title');
  if (!scope.trim()) missing.push('scope');
  if (filledSpecRows.length === 0) missing.push('at least one specification');
  if (!quantity.trim()) missing.push('quantity');

  const ready = missing.length === 0 && !budgetReversed;

  const handleContinue = () => {
    if (!ready) {
      setAttempted(true);
      return;
    }
    onContinue({
      category,
      title: title.trim(),
      scope: scope.trim(),
      specifications: filledSpecRows.map((r) => ({ label: r.label.trim(), value: r.value.trim() })),
      quantity: quantity.trim(),
      budgetMin,
      budgetMax,
    });
  };
  reportContinue(handleContinue);

  return (
    <View style={styles.stepContent}>
      <ScreenTitle
        title="Post a requirement"
        subtitle={`Verified businesses in your category and service area are alerted the moment ${poster.displayName ?? poster.registeredName} publishes.`}
      />
      {attempted && missing.length > 0 && <SummaryBanner message={`Still needed before you continue: ${listOut(missing)}.`} />}

      <View style={{ gap: space.lg }}>
        <View>
          <FieldLabel>Category</FieldLabel>
          <View style={sharedStyles.pillGroupWrap}>
            {CATEGORIES.map((c) => (
              <Pill key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </View>

        <View>
          <FieldLabel>Title</FieldLabel>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Fabrication and installation of steel mezzanine platform"
            placeholderTextColor={color.inkFaint}
            style={sharedStyles.input}
          />
        </View>

        <View>
          <FieldLabel>Scope</FieldLabel>
          <TextInput
            value={scope}
            onChangeText={setScope}
            multiline
            numberOfLines={6}
            placeholder="What is included and what is not — the boundaries of the work."
            placeholderTextColor={color.inkFaint}
            style={styles.textareaLarge}
          />
          <Text style={styles.fieldCaption}>Vague scope produces quotations you cannot compare.</Text>
        </View>

        <View>
          <FieldLabel>Specifications</FieldLabel>
          <Text style={styles.fieldCaption}>Materials, dimensions, standards, finish — whatever a business needs to price accurately, as labelled rows.</Text>
          <View style={{ gap: space.sm, marginTop: space.sm }}>
            {specRows.map((row) => (
              <SpecificationEditRow
                key={row.id}
                row={row}
                onChangeLabel={(v) => updateSpecRow(row.id, 'label', v)}
                onChangeValue={(v) => updateSpecRow(row.id, 'value', v)}
                onRemove={() => removeSpecRow(row.id)}
              />
            ))}
          </View>
          <View style={{ marginTop: space.sm }}>
            <AddDashedButton label="Add specification" onPress={addSpecRow} />
          </View>
        </View>

        <FormDivider />

        <View style={styles.twoColRow}>
          <View style={styles.twoCol}>
            <FieldLabel>Quantity</FieldLabel>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="e.g. One platform, 240 sqm"
              placeholderTextColor={color.inkFaint}
              style={sharedStyles.input}
            />
          </View>
          <View style={styles.twoCol}>
            <FieldLabel optional>Indicative budget</FieldLabel>
            <View style={styles.budgetRow}>
              <View style={[styles.budgetField, attempted && budgetReversed ? styles.inputError : null]}>
                <Text style={styles.budgetCurrency}>₱</Text>
                <TextInput
                  value={budgetMinText}
                  onChangeText={setBudgetMinText}
                  placeholder="From"
                  placeholderTextColor={color.inkFaint}
                  keyboardType="decimal-pad"
                  style={styles.budgetInput}
                />
              </View>
              <Text style={styles.budgetSep}>—</Text>
              <View style={[styles.budgetField, attempted && budgetReversed ? styles.inputError : null]}>
                <Text style={styles.budgetCurrency}>₱</Text>
                <TextInput
                  value={budgetMaxText}
                  onChangeText={setBudgetMaxText}
                  placeholder="To"
                  placeholderTextColor={color.inkFaint}
                  keyboardType="decimal-pad"
                  style={styles.budgetInput}
                />
              </View>
            </View>
            {attempted && budgetReversed && <Text style={styles.errorText}>That reads as a smaller maximum than minimum.</Text>}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: { gap: space.lg },
  textareaLarge: { marginTop: space.xs, minHeight: 150, backgroundColor: color.canvas, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: font.body, fontSize: fontSize.base, lineHeight: lineHeight.base, color: color.ink, textAlignVertical: 'top' },
  fieldCaption: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  twoColRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  twoCol: { flexGrow: 1, flexBasis: 200, minWidth: 180 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
  budgetField: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space.xs, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm },
  inputError: { borderColor: color.dangerBorder },
  budgetCurrency: { fontFamily: font.mono, fontSize: fontSize.sm, color: color.inkFaint },
  budgetInput: { flex: 1, minWidth: 0, fontFamily: font.monoMedium, fontSize: fontSize.sm, color: color.ink },
  budgetSep: { color: color.inkFaint },
  errorText: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, color: color.danger },
});
