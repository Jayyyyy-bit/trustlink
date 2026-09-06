// features/onboarding/components/OperationsScreen.tsx

import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { font, fontSize, iconSize, lineHeight, space, radius, color } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import { CAPABILITIES_BY_CATEGORY, CAPABILITY_MIN, CAPABILITY_MAX, listOut } from '../format';
import type { OperationsProps } from '../types';
import { ScreenTitle } from './ScreenTitle';
import { SummaryBanner } from './SummaryBanner';
import { FormSection } from './FormSection';
import { FormDivider } from './FormDivider';
import { ActionButton } from './ActionButton';

function CheckGlyph({ tone }: { tone: string }) {
  return <Check size={iconSize.xs} color={tone} strokeWidth={2.5} />;
}

export function OperationsScreen({ identity, initial, onContinue, reportContinue }: OperationsProps & { reportContinue: (fn: () => void) => void }) {
  const [capabilities, setCapabilities] = useState<string[]>(initial?.capabilities ?? []);
  const [capQuery, setCapQuery] = useState('');
  const [serviceAreas, setServiceAreas] = useState<string[]>(initial?.serviceAreas ?? (identity.province ? [identity.province] : []));
  const [areaInput, setAreaInput] = useState('');
  const [attempted, setAttempted] = useState(false);

  const pool = CAPABILITIES_BY_CATEGORY[identity.category] ?? [];
  const q = capQuery.trim().toLowerCase();
  const shownCaps = q ? pool.filter((c) => c.toLowerCase().includes(q)) : pool;
  const atCap = capabilities.length >= CAPABILITY_MAX;

  function toggleCapability(c: string) {
    setCapabilities((prev) => {
      const has = prev.includes(c);
      if (!has && prev.length >= CAPABILITY_MAX) return prev;
      return has ? prev.filter((x) => x !== c) : [...prev, c];
    });
  }

  function addArea() {
    const v = areaInput.trim();
    if (!v) return;
    setServiceAreas((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setAreaInput('');
  }
  function removeArea(v: string) {
    setServiceAreas((prev) => prev.filter((x) => x !== v));
  }

  const missing: string[] = [];
  if (capabilities.length < CAPABILITY_MIN) missing.push(`at least ${CAPABILITY_MIN} capabilities`);
  if (serviceAreas.length === 0) missing.push('at least one service area');
  const ready = missing.length === 0;

  const handleContinue = () => {
    if (!ready) {
      setAttempted(true);
      return;
    }
    onContinue({ capabilities, serviceAreas });
  };

  reportContinue(handleContinue);

  return (
    <View style={styles.stepContent}>
      <ScreenTitle title="What you do, and where" />
      {attempted && missing.length > 0 && <SummaryBanner message={`Add ${listOut(missing)} first.`} />}
      <FormSection heading="What you provide">
        <View style={styles.cardHeaderRow}>
          <Text style={sharedStyles.fieldLabel}>Capabilities</Text>
          <View style={{ flex: 1 }} />
          <Text style={[styles.capCount, capabilities.length >= CAPABILITY_MIN ? styles.capCountReady : null]}>
            {capabilities.length} of {CAPABILITY_MAX} selected
          </Text>
        </View>
        <Text style={sharedStyles.fieldCaption}>Pick between {CAPABILITY_MIN} and {CAPABILITY_MAX}. Choosing everything you could possibly do makes your feed worse, not better.</Text>

        <TextInput
          value={capQuery}
          onChangeText={setCapQuery}
          placeholder={`Search capabilities in ${identity.category || 'your category'}`}
          placeholderTextColor={color.inkFaint}
          style={styles.searchInput}
        />

        <View style={styles.pillGroupWrap}>
          {shownCaps.map((c) => {
            const on = capabilities.includes(c);
            const blocked = !on && atCap;
            return (
              <Pressable key={c} onPress={() => toggleCapability(c)} disabled={blocked} style={[styles.pill, on ? styles.pillActive : null, blocked ? styles.pillBlocked : null]}>
                <View style={styles.pillContentRow}>
                  {on && <CheckGlyph tone={color.primary} />}
                  <Text style={[styles.pillLabel, on ? styles.pillLabelActive : null]}>{c}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        {q.length > 0 && shownCaps.length === 0 && (
          <Text style={styles.fieldNote}>Nothing in {identity.category} matches "{capQuery}". Try a broader word.</Text>
        )}
      </FormSection>

      <FormDivider />

      <FormSection heading="Where you work">
        <Text style={sharedStyles.fieldLabel}>Service areas</Text>
        <Text style={sharedStyles.fieldCaption}>Cities or provinces you would travel to for work. Pre-filled from where you are based.</Text>

        <View style={styles.pillGroupWrap}>
          {serviceAreas.map((a) => (
            <Pressable key={a} onPress={() => removeArea(a)} style={[styles.pill, styles.pillActive]}>
              <View style={styles.pillContentRow}>
                <CheckGlyph tone={color.primary} />
                <Text style={[styles.pillLabel, styles.pillLabelActive]}>{a}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.addAreaRow}>
          <TextInput
            value={areaInput}
            onChangeText={setAreaInput}
            onSubmitEditing={addArea}
            placeholder="Add a city or province"
            placeholderTextColor={color.inkFaint}
            style={[styles.input, { flex: 1, marginTop: 0 }]}
          />
          <ActionButton label="Add" variant="outline" onPress={addArea} />
        </View>
      </FormSection>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: { gap: space.lg },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, flexWrap: 'wrap' },
  fieldNote: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },

  input: { marginTop: space.xs, backgroundColor: color.canvas, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: font.body, fontSize: fontSize.base, color: color.ink },

  searchInput: { marginTop: space.sm, borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: font.body, fontSize: fontSize.sm, color: color.ink, backgroundColor: color.surfaceSunken },

  /* pills — natural tag-wrap, plus a blocked state and an inline check glyph that the
   * shared Pill component doesn't support, so this is rendered inline rather than through it */
  pillGroupWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },
  pill: { borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs + 2, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: color.primaryFaint, borderColor: color.primary },
  pillBlocked: { opacity: 0.45 },
  pillContentRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  pillLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted, textAlign: 'center' },
  pillLabelActive: { color: color.primary },

  /* capability count */
  capCount: { fontFamily: font.mono, fontSize: fontSize.micro, color: color.inkFaint },
  capCountReady: { color: color.primary },

  /* add service area */
  addAreaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm },
});
