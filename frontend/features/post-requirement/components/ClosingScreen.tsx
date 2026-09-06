import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, radius, space, elevation } from '../../../components/ui/tokens';
import type { ClosingProps } from '../PostRequirement';
import { TIME_OPTIONS, CLOSING_PRESETS } from '../constants';
import { daysFromNowDateString, buildClosingISO, formatDuration, formatDateTime, listOut } from '../format';
import { sharedStyles } from '../sharedStyles';
import { ScreenTitle } from './ScreenTitle';
import { SummaryBanner } from './SummaryBanner';
import { SectionLabel } from './SectionLabel';
import { Pill } from './Pill';

/* STEP 3 — CLOSING: Closing date, closing time, quick duration presets — the highest-weight
 * field on the whole flow, called out once, plainly, as unchangeable after publish. */

export function ClosingScreen({ initial, onContinue, reportContinue }: ClosingProps & { reportContinue: (fn: () => void) => void }) {
  const [closeDate, setCloseDate] = useState(initial?.closeDate ?? '');
  const [closeTime, setCloseTime] = useState(initial?.closeTime ?? '17:00');
  const [attempted, setAttempted] = useState(false);

  const closingAt = buildClosingISO(closeDate, closeTime);
  const closingMs = closeDate ? new Date(closingAt).getTime() - Date.now() : 0;
  const closingInPast = !!closeDate && closingMs <= 0;

  const missing: string[] = [];
  if (!closeDate) missing.push('a closing date');

  const ready = missing.length === 0 && !closingInPast;

  const applyPreset = (days: number) => setCloseDate(daysFromNowDateString(days));

  const handleContinue = () => {
    if (!ready) {
      setAttempted(true);
      return;
    }
    onContinue({ closeDate, closeTime });
  };
  reportContinue(handleContinue);

  const duration = closeDate ? formatDuration(closingMs) : null;
  const urgent = !!closeDate && !closingInPast && closingMs < 48 * 3600_000;
  const leadColor = closingInPast ? color.danger : urgent ? color.danger : color.ink;

  let leadNote = 'Pick a closing date to see how much time businesses will have to quote.';
  if (closeDate && urgent) leadNote = 'Under two days to quote. Most requirements give businesses at least three.';
  else if (closeDate) leadNote = `Businesses will have ${duration} to prepare a quotation.`;

  return (
    <View style={styles.stepContent}>
      <ScreenTitle
        title="Set your quotation closing time"
        subtitle="Once the requirement closes, no new quotations can be submitted and sealed quotations are released simultaneously."
      />
      {attempted && missing.length > 0 && <SummaryBanner message={`Still needed before you continue: ${listOut(missing)}.`} />}
      {attempted && closingInPast && <SummaryBanner message="This closes in the past — pick a later date and time." />}

      <View style={styles.closingCard}>
        <Text style={styles.closingLockNote}>
          <Text style={styles.ackBold}>Closing time cannot be changed after publishing.</Text> Choose a time that gives businesses
          enough room to prepare a competitive quotation.
        </Text>

        <View style={sharedStyles.pillGroupWrap}>
          {CLOSING_PRESETS.map((p) => (
            <Pill key={p.label} label={p.label} active={closeDate === daysFromNowDateString(p.days)} onPress={() => applyPreset(p.days)} />
          ))}
        </View>

        <View style={styles.dateRangeRow}>
          <TextInput
            value={closeDate}
            onChangeText={setCloseDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={color.inkFaint}
            style={[sharedStyles.input, styles.mono, { flex: 1, minWidth: 140, marginTop: 0 }]}
          />
          <View style={sharedStyles.pillGroupWrap}>
            {TIME_OPTIONS.map((t) => (
              <Pill key={t.value} label={t.label} active={closeTime === t.value} onPress={() => setCloseTime(t.value)} />
            ))}
          </View>
        </View>

        <View style={styles.closingStampRow}>
          <View style={{ minWidth: 0 }}>
            <SectionLabel>Quotations open</SectionLabel>
            <Text style={styles.closingStampValue}>{closeDate ? formatDateTime(closingAt) : 'Not set'}</Text>
          </View>
          <View style={styles.closingStampDivider} />
          <View style={{ minWidth: 0 }}>
            <SectionLabel>Time to quote</SectionLabel>
            <Text style={[styles.closingStampValue, { color: leadColor }]}>{closeDate ? (closingInPast ? 'Already closed' : (duration ?? '—')) : '—'}</Text>
          </View>
        </View>

        <Text style={[styles.closingNote, { color: leadColor === color.danger ? color.danger : color.inkMuted }]}>{leadNote}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: { gap: space.lg },
  mono: { fontFamily: font.monoMedium },
  dateRangeRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap', marginTop: space.xs },
  closingCard: { ...elevation.cardRaised, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.lg, gap: space.md, borderLeftWidth: 3, borderLeftColor: color.primary },
  closingLockNote: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  closingStampRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg, flexWrap: 'wrap', paddingTop: space.md, borderTopWidth: 1, borderTopColor: color.borderFaint },
  closingStampDivider: { width: 1, height: 32, backgroundColor: color.border },
  closingStampValue: { marginTop: space.xs, fontFamily: font.display, fontSize: fontSize.md, letterSpacing: letterSpacing.tight, color: color.ink },
  closingNote: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm },
  ackBold: { fontFamily: font.bodySemi, color: color.ink },
});
