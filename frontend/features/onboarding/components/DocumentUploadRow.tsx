// features/onboarding/components/DocumentUploadRow.tsx

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { X, FileText } from 'lucide-react-native';
import { font, fontSize, iconSize, letterSpacing, space, radius, color } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import type { Attachment } from '../../../lib/types';

function XGlyph({ tone }: { tone: string }) {
  return <X size={iconSize.sm} color={tone} strokeWidth={1.75} />;
}

export function DocumentUploadRow({
  name,
  help,
  required,
  file,
  onCapture,
  onRemove,
}: {
  name: string;
  help: string;
  required: boolean;
  file: Attachment | null;
  onCapture: () => void;
  onRemove: () => void;
}) {
  return (
    <View>
      <View style={styles.cardHeaderRow}>
        <Text style={sharedStyles.fieldLabel}>{name}</Text>
        <View style={[styles.tag, required ? styles.tagRequired : styles.tagOptional]}>
          <Text style={[styles.tagLabel, required ? styles.tagLabelRequired : styles.tagLabelOptional]}>{required ? 'Required' : 'Optional'}</Text>
        </View>
      </View>
      <Text style={sharedStyles.fieldCaption}>{help}</Text>

      {file ? (
        <View style={styles.docFileCard}>
          <View style={styles.docFileIcon}>
            <FileText size={iconSize.md} color={color.inkMuted} strokeWidth={1.75} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.docFileName} numberOfLines={1}>{file.filename}</Text>
            <Text style={styles.docFileMeta}>Photo · {(file.sizeBytes / 1_000_000).toFixed(1)} MB · added just now</Text>
          </View>
          <Pressable onPress={onRemove} style={styles.docFileRemove} hitSlop={8}>
            <XGlyph tone={color.inkFaint} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onCapture} style={styles.docAddButton}>
          <Text style={styles.docAddButtonLabel}>+ Add a photo or file</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeaderRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, flexWrap: 'wrap' },

  tag: { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: space.sm, paddingVertical: 2 },
  tagRequired: { borderColor: color.primaryBorder },
  tagOptional: { borderColor: color.border },
  tagLabel: { fontFamily: font.mono, fontSize: 9, letterSpacing: letterSpacing.label, textTransform: 'uppercase' },
  tagLabelRequired: { color: color.primary },
  tagLabelOptional: { color: color.inkFaint },

  docAddButton: { marginTop: space.sm, alignSelf: 'flex-start', borderWidth: 1, borderStyle: 'dashed', borderColor: color.primaryBorder, backgroundColor: color.primaryFaint, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm },
  docAddButtonLabel: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.primary },
  docFileCard: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, padding: space.sm },
  docFileIcon: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: color.surfaceSunken, alignItems: 'center', justifyContent: 'center' },
  docFileName: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
  docFileMeta: { marginTop: 2, fontFamily: font.mono, fontSize: 10, color: color.inkFaint },
  docFileRemove: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
});
