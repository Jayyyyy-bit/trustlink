// features/requirement-detail/components/AttachmentList.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, space, radius } from '../../../components/ui/tokens';
import type { Attachment } from '../../../lib/types';
import { formatBytes } from '../format';
import { sharedStyles } from '../sharedStyles';

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) {
    return <Text style={sharedStyles.mutedSmall}>No attachments</Text>;
  }
  return (
    <View style={{ gap: space.sm }}>
      {attachments.map((attachment) => (
        <View key={attachment.id} style={styles.attachmentRow}>
          <Text style={sharedStyles.bodyText} numberOfLines={1}>{attachment.filename}</Text>
          <Text style={sharedStyles.mutedSmall}>{formatBytes(attachment.sizeBytes)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.sm,
  },
});
