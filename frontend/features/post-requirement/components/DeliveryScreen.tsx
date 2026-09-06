import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';
import type { Attachment } from '../../../lib/types';
import type { DeliveryProps } from '../PostRequirement';
import { listOut } from '../format';
import { sharedStyles } from '../sharedStyles';
import { ScreenTitle } from './ScreenTitle';
import { SummaryBanner } from './SummaryBanner';
import { FieldLabel } from './FieldLabel';
import { XGlyph } from './XGlyph';
import { AddDashedButton } from './AddDashedButton';

/* STEP 2 — DELIVERY: City/municipality beside site address, start date beside end date,
 * attachments. */

export function DeliveryScreen({ initial, onContinue, reportContinue }: DeliveryProps & { reportContinue: (fn: () => void) => void }) {
  const [city, setCity] = useState(initial?.city ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [windowFrom, setWindowFrom] = useState(initial?.windowFrom ?? '');
  const [windowTo, setWindowTo] = useState(initial?.windowTo ?? '');
  const [attachments, setAttachments] = useState<Attachment[]>(initial?.attachments ?? []);
  const [attempted, setAttempted] = useState(false);

  const windowBad = !!windowFrom && !!windowTo && new Date(windowTo) < new Date(windowFrom);

  const missing: string[] = [];
  if (!city.trim()) missing.push('city / municipality');
  if (!windowFrom || !windowTo) missing.push('a delivery window');

  const ready = missing.length === 0 && !windowBad;

  const addFile = () =>
    setAttachments((prev) => [
      ...prev,
      { id: `f${Date.now()}`, filename: 'New attachment.pdf', sizeBytes: 640_000, mimeType: 'application/pdf', uri: '' },
    ]);
  const removeFile = (id: string) => setAttachments((prev) => prev.filter((f) => f.id !== id));

  const handleContinue = () => {
    if (!ready) {
      setAttempted(true);
      return;
    }
    onContinue({ city: city.trim(), address: address.trim(), windowFrom, windowTo, attachments });
  };
  reportContinue(handleContinue);

  return (
    <View style={styles.stepContent}>
      <ScreenTitle title="Where and when" subtitle="The delivery location and the window respondents should plan around." />
      {attempted && missing.length > 0 && <SummaryBanner message={`Still needed before you continue: ${listOut(missing)}.`} />}

      <View style={{ gap: space.lg }}>
        <View style={styles.twoColRow}>
          <View style={styles.twoCol}>
            <FieldLabel>City / Municipality</FieldLabel>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Calamba"
              placeholderTextColor={color.inkFaint}
              style={sharedStyles.input}
            />
          </View>
          <View style={{ flexGrow: 2, flexBasis: 260, minWidth: 200 }}>
            <FieldLabel optional>Site address</FieldLabel>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Barangay Canlubang, Calamba, Laguna"
              placeholderTextColor={color.inkFaint}
              style={sharedStyles.input}
            />
          </View>
        </View>

        <View>
          <FieldLabel>Delivery window</FieldLabel>
          <View style={styles.dateRangeRow}>
            <TextInput
              value={windowFrom}
              onChangeText={setWindowFrom}
              placeholder="YYYY-MM-DD — start"
              placeholderTextColor={color.inkFaint}
              style={[sharedStyles.input, styles.mono, { flex: 1, minWidth: 140, marginTop: 0 }]}
            />
            <Text style={styles.toLabel}>to</Text>
            <TextInput
              value={windowTo}
              onChangeText={setWindowTo}
              placeholder="YYYY-MM-DD — end"
              placeholderTextColor={color.inkFaint}
              style={[sharedStyles.input, styles.mono, { flex: 1, minWidth: 140, marginTop: 0 }]}
            />
          </View>
          {attempted && windowBad && <Text style={styles.errorText}>The end date is before the start date.</Text>}
        </View>

        <View>
          <FieldLabel optional>Attachments</FieldLabel>
          <View style={sharedStyles.pillGroupWrap}>
            {attachments.map((f) => (
              <View key={f.id} style={styles.fileChip}>
                <Text style={styles.fileChipName} numberOfLines={1}>{f.filename}</Text>
                <Pressable onPress={() => removeFile(f.id)} hitSlop={8}>
                  <XGlyph tone={color.inkFaint} />
                </Pressable>
              </View>
            ))}
            <AddDashedButton label="Add file" onPress={addFile} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: { gap: space.lg },
  twoColRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  twoCol: { flexGrow: 1, flexBasis: 200, minWidth: 180 },
  dateRangeRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap', marginTop: space.xs },
  mono: { fontFamily: font.monoMedium },
  toLabel: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkFaint },
  errorText: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, color: color.danger },
  fileChip: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.xs, maxWidth: 220 },
  fileChipName: { flexShrink: 1, fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
});
