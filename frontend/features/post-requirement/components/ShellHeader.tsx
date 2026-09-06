import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font, fontSize, layout, space } from '../../../components/ui/tokens';
import type { PostRequirementState } from '../../../lib/types';

/* Persistent shell header: breadcrumb, outside the scroll area. Same structural role as
 * Onboarding's shellHeader (full-width bar, bottom border, screenPadding) — content is a
 * breadcrumb here since this screen already sits inside the app shell's own AppHeader,
 * mounted once by app/_layout.tsx. */

export function ShellHeader({ step, onExit }: { step: PostRequirementState; onExit?: () => void }) {
  return (
    <View style={styles.shellHeader}>
      <View style={styles.breadcrumbRow}>
        <Pressable onPress={onExit} hitSlop={6}>
          <Text style={styles.breadcrumbLink}>My Requirements</Text>
        </Pressable>
        <Text style={styles.breadcrumbSep}>/</Text>
        <Text style={[styles.breadcrumbLink, step !== 'REVIEW' ? styles.breadcrumbCurrent : null]}>New requirement</Text>
        {step === 'REVIEW' && (
          <>
            <Text style={styles.breadcrumbSep}>/</Text>
            <Text style={styles.breadcrumbCurrent}>Review and publish</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shellHeader: { width: '100%', paddingHorizontal: layout.screenPadding, paddingVertical: space.lg, backgroundColor: color.canvas, borderBottomWidth: 1, borderBottomColor: color.border },
  breadcrumbRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  breadcrumbLink: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkFaint },
  breadcrumbSep: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkFaint },
  breadcrumbCurrent: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
});
