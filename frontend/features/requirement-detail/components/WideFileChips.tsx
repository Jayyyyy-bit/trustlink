// features/requirement-detail/components/WideFileChips.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, space, radius } from '../../../components/ui/tokens';
import type { Attachment } from '../../../lib/types';
import { sharedStyles } from '../sharedStyles';

export function WideFileChips({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) {
    return <Text style={sharedStyles.mutedSmall}>No attachments</Text>;
  }
  return (
    <View style={styles.wideChipsRow}>
      {attachments.map((a) => (
        <View key={a.id} style={styles.fileChip}>
          <Text style={styles.fileChipLabel} numberOfLines={1}>{a.filename}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wideChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  fileChip: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    maxWidth: '100%',
  },
  fileChipLabel: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.inkMuted,
  },
});
