// features/quotation/components/NotesAttachmentsSection.tsx
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { color, font, fontSize, lineHeight, space, radius } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import type { FormState } from '../useQuotationForm';
import { StepLabel } from './StepLabel';
import { AddDashedButton } from './AddDashedButton';
import { XGlyph } from './Glyphs';

export function NotesAttachmentsSection({ st, isWide }: { st: FormState; isWide: boolean }) {
  const notes = (
    <>
      <Text style={styles.fieldLabel}>Notes to the buyer</Text>
      <Text style={styles.fieldCaption}>
        Inclusions, exclusions, assumptions, or anything that explains your price. Read only after closing.
      </Text>
      <TextInput
        value={st.note}
        onChangeText={st.setNote}
        multiline
        numberOfLines={3}
        placeholder="e.g. Shop fabrication at our Cabuyao plant, erection sequenced in two phases so the east racking bay stays live."
        placeholderTextColor={color.inkFaint}
        style={styles.noteInput}
      />
      <Text style={styles.noteCount}>{st.note.length} characters</Text>
    </>
  );

  const attachments = (
    <>
      <Text style={styles.fieldLabel}>Attachments</Text>
      <Text style={styles.fieldCaption}>
        Method statements, bills of quantities, certificates, past work. Sealed with the rest of your quotation.
      </Text>
      <View style={styles.filesRow}>
        {st.files.map((f) => (
          <View key={f.id} style={styles.fileChip}>
            <Text style={styles.fileChipName} numberOfLines={1}>{f.filename}</Text>
            <Pressable onPress={() => st.removeFile(f.id)} hitSlop={8}>
              <XGlyph tone={color.inkFaint} />
            </Pressable>
          </View>
        ))}
        <AddDashedButton label="Add file" onPress={st.addFile} />
      </View>
    </>
  );

  return (
    <View style={sharedStyles.card}>
      <StepLabel n="03" label="Notes and attachments" />

      {isWide ? (
        <View style={styles.notesAttachmentsRow}>
          <View style={styles.notesAttachmentsCol}>{notes}</View>
          <View style={styles.notesAttachmentsDivider} />
          <View style={styles.notesAttachmentsCol}>{attachments}</View>
        </View>
      ) : (
        <>
          <View>{notes}</View>
          <View style={sharedStyles.dividedTop}>{attachments}</View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
  fieldCaption: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },

  notesAttachmentsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.lg },
  notesAttachmentsCol: { flex: 1, minWidth: 0 },
  notesAttachmentsDivider: { width: 1, alignSelf: 'stretch', backgroundColor: color.borderFaint },
  noteInput: { marginTop: space.xs, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, padding: space.sm, fontFamily: font.body, fontSize: fontSize.base, lineHeight: lineHeight.base, color: color.ink, textAlignVertical: 'top' },
  noteCount: { marginTop: space.xs, textAlign: 'right', fontFamily: font.body, fontSize: fontSize.sm, color: color.inkFaint },
  filesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  fileChip: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.xs, maxWidth: 220 },
  fileChipName: { flexShrink: 1, fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
});
