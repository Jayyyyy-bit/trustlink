// features/quotation/components/AttachmentLink.tsx
import { useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { color, font, fontSize } from '../../../components/ui/tokens';
import type { Attachment } from '../../../lib/types';
import { buyerRowHoverTransitionOnWeb } from '../sharedStyles';

export function AttachmentLink({ attachment }: { attachment: Attachment }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={() => Linking.openURL(attachment.uri)}
      {...(Platform.OS === 'web' ? { onHoverIn: () => setHovered(true), onHoverOut: () => setHovered(false) } : null)}
      style={buyerRowHoverTransitionOnWeb}
      hitSlop={4}
    >
      <Text style={[styles.sidebarFileLink, hovered ? styles.sidebarFileLinkHovered : null]} numberOfLines={1}>
        {attachment.filename}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sidebarFileLink: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  sidebarFileLinkHovered: { color: color.primary },
});
