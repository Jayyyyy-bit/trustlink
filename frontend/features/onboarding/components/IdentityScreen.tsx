// features/onboarding/components/IdentityScreen.tsx

import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { font, fontSize, lineHeight, space, radius, elevation, color } from '../../../components/ui/tokens';
import type { SignupIntent, BusinessType } from '../../../lib/types';
import { sharedStyles } from '../sharedStyles';
import { SIGNUP_INTENTS, BUSINESS_TYPES, listOut, registrationDocSpec, formatMobileDisplay } from '../format';
import type { IdentityProps } from '../types';
import { ScreenTitle } from './ScreenTitle';
import { SummaryBanner } from './SummaryBanner';
import { FormSection } from './FormSection';
import { FormDivider } from './FormDivider';
import { Pill } from './Pill';
import { CategoryChips } from './CategoryChips';

export function IdentityScreen({ initial, onContinue, reportContinue }: IdentityProps & { reportContinue: (fn: () => void) => void }) {
  const [signupIntent, setSignupIntent] = useState<SignupIntent>(initial?.signupIntent ?? 'BOTH');
  const [registeredName, setRegisteredName] = useState(initial?.registeredName ?? '');
  const [businessType, setBusinessType] = useState<BusinessType | ''>(initial?.businessType ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [province, setProvince] = useState(initial?.province ?? '');
  const [contactPerson, setContactPerson] = useState(initial?.contactPerson ?? '');
  // Strip a leading "+63" before stripping the rest of the non-digits, so re-hydrating from
  // a previously-submitted "+63 917 555 0142" (going Back to this step) yields the 10-digit
  // "9175550142" the input expects, not "639175550142" with the country code folded in.
  const [mobileDigits, setMobileDigits] = useState(() => (initial?.contactMobile ?? '').replace(/^\+?63\s*/, '').replace(/[^0-9]/g, ''));
  const [attempted, setAttempted] = useState(false);

  const nameBad = registeredName.trim().length > 0 && registeredName.trim().length < 4;
  const mobileBad = mobileDigits.length > 0 && (mobileDigits.length < 10 || mobileDigits.length > 11);

  const missing: string[] = [];
  if (!registeredName.trim()) missing.push('your registered business name');
  if (!businessType) missing.push('business type');
  if (!category) missing.push('industry category');
  if (!city.trim()) missing.push('city');
  if (!province.trim()) missing.push('province');
  if (!contactPerson.trim()) missing.push('contact person');
  if (!mobileDigits) missing.push('mobile number');

  const ready = missing.length === 0 && !nameBad && !mobileBad;

  const handleContinue = () => {
    if (!ready || !businessType) {
      setAttempted(true);
      return;
    }
    onContinue({
      signupIntent,
      registeredName: registeredName.trim(),
      businessType,
      category,
      city: city.trim(),
      province: province.trim(),
      contactPerson: contactPerson.trim(),
      contactMobile: `+63 ${formatMobileDisplay(mobileDigits)}`,
    });
  };

  const docHint = businessType ? registrationDocSpec(businessType).key : null;

  reportContinue(handleContinue);

  return (
    <View style={styles.stepContent}>
      <ScreenTitle title="Tell us about your business" />
      {attempted && missing.length > 0 && <SummaryBanner message={`Still needed before you continue: ${listOut(missing)}.`} />}
      <View style={styles.intentBlock}>
        <Text style={sharedStyles.fieldLabel}>What brought you here?</Text>
        <Text style={sharedStyles.fieldCaption}>
          This just orders what shows up in your first feed — you can look for both any time, and it is never shown on your profile.
        </Text>
        <View style={styles.segmentGroup}>
          {SIGNUP_INTENTS.map((opt) => {
            const active = signupIntent === opt.value;
            return (
              <Pressable key={opt.value} onPress={() => setSignupIntent(opt.value)} style={[styles.segment, active ? styles.segmentActive : null]}>
                <Text style={[styles.segmentLabel, active ? styles.segmentLabelActive : null]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FormSection heading="About your business">
        <View style={{ gap: space.md }}>
          <View>
            <Text style={sharedStyles.fieldLabel}>Registered business name</Text>
            <Text style={sharedStyles.fieldCaption}>Exactly as it appears on your DTI or SEC certificate. We check the two against each other.</Text>
            <TextInput
              value={registeredName}
              onChangeText={setRegisteredName}
              placeholder="Santiago Metal Works and General Merchandise"
              placeholderTextColor={color.inkFaint}
              style={[styles.input, nameBad ? styles.inputError : null]}
            />
            {nameBad && <Text style={styles.errorText}>That looks short for a registered name — check it against the certificate.</Text>}
          </View>

          <View style={styles.twoColRow}>
            <View style={styles.twoCol}>
              <Text style={sharedStyles.fieldLabel}>Business type</Text>
              <View style={styles.optionGrid}>
                {BUSINESS_TYPES.map((t) => (
                  <View key={t.value} style={styles.optionGridItem}>
                    <Pill label={t.label} active={businessType === t.value} onPress={() => setBusinessType(t.value)} />
                  </View>
                ))}
              </View>
              {!!docHint && <Text style={styles.fieldNote}>We will ask for your {docHint} certificate and BIR registration next.</Text>}
            </View>

            <View style={styles.twoCol}>
              <Text style={sharedStyles.fieldLabel}>Industry category</Text>
              <CategoryChips category={category} onSelect={setCategory} />
            </View>
          </View>
        </View>
      </FormSection>

      <FormDivider />

      <FormSection heading="Where you operate">
        <View style={styles.twoColRow}>
          <View style={styles.twoCol}>
            <Text style={sharedStyles.fieldLabel}>City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Quezon City"
              placeholderTextColor={color.inkFaint}
              style={styles.input}
            />
          </View>
          <View style={styles.twoCol}>
            <Text style={sharedStyles.fieldLabel}>Province</Text>
            <TextInput
              value={province}
              onChangeText={setProvince}
              placeholder="Metro Manila"
              placeholderTextColor={color.inkFaint}
              style={styles.input}
            />
          </View>
        </View>
      </FormSection>

      <FormDivider />

      <FormSection heading="Business contact">
        <View style={styles.twoColRow}>
          <View style={styles.twoCol}>
            <Text style={sharedStyles.fieldLabel}>Contact person</Text>
            <TextInput
              value={contactPerson}
              onChangeText={setContactPerson}
              placeholder="Maria Santiago"
              placeholderTextColor={color.inkFaint}
              style={styles.input}
            />
            {/* Below the input, not above — keeps this row's input aligned with Mobile
                number's regardless of how many lines either helper text wraps to. */}
            <Text style={[sharedStyles.fieldCaption, { marginTop: space.xs }]}>Who the other business speaks to if you win work or award it.</Text>
          </View>

          <View style={styles.twoCol}>
            <Text style={sharedStyles.fieldLabel}>Mobile number</Text>
            <View style={[styles.input, styles.mobileFieldRow, mobileBad ? styles.inputError : null]}>
              <Text style={styles.mobilePrefix}>+63</Text>
              <TextInput
                value={mobileDigits}
                onChangeText={(v) => setMobileDigits(v.replace(/[^0-9]/g, '').slice(0, 11))}
                placeholder="917 555 0142"
                placeholderTextColor={color.inkFaint}
                keyboardType="phone-pad"
                style={styles.mobileInput}
              />
            </View>
            {mobileBad && <Text style={styles.errorText}>That does not look like a Philippine mobile number — 10 digits after +63.</Text>}
            <Text style={styles.quietNote}>Never shown publicly — only shared after an award.</Text>
          </View>
        </View>
      </FormSection>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: { gap: space.lg },

  /* "what brought you here" — keeps its original weight, unlike the plain sections below */
  intentBlock: { ...elevation.cardRaised, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.md, gap: space.sm },

  fieldNote: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  errorText: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, color: color.danger },
  quietNote: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkFaint },

  input: { marginTop: space.xs, backgroundColor: color.canvas, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: font.body, fontSize: fontSize.base, color: color.ink },
  inputError: { borderColor: color.dangerBorder },

  twoColRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  twoCol: { flexGrow: 1, flexBasis: 200, minWidth: 160 },

  // Reuses styles.input's exact box model (border, radius, background, padding) via style
  // array composition — this row is that same field treatment, not a near-duplicate.
  mobileFieldRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  // Same font as mobileInput/every other field — the previous font.mono on the prefix vs
  // font.body on the typed digits gave the two a different baseline/x-height, which is
  // what actually read as "sits inside it differently" next to plain single-font inputs.
  mobilePrefix: { fontFamily: font.body, fontSize: fontSize.base, lineHeight: lineHeight.base, color: color.inkFaint },
  mobileInput: { flex: 1, minWidth: 0, fontFamily: font.body, fontSize: fontSize.base, lineHeight: lineHeight.base, color: color.ink },

  /* even grid — business type uses this instead of natural tag-wrap, so chips line up in
   * fixed-width columns rather than fragmenting unevenly. */
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },
  optionGridItem: { flexBasis: '48%', flexGrow: 0, flexShrink: 0 },

  /* segmented signup-intent control */
  segmentGroup: { flexDirection: 'row', marginTop: space.sm, backgroundColor: color.surfaceSunken, borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, padding: 2 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.sm, paddingVertical: space.sm, borderRadius: radius.pill },
  segmentActive: { backgroundColor: color.primary },
  segmentLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },
  segmentLabelActive: { fontFamily: font.bodySemi, color: color.onPrimary },
});
