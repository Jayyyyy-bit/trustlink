import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check, Lock } from 'lucide-react-native';
import { color, font, fontSize, iconSize, lineHeight, letterSpacing, radius, space } from '../../../components/ui/tokens';
import type { RequirementDraftInput } from '../PostRequirement';
import { LOCK_ITEMS } from '../constants';
import { formatDateTime } from '../format';
import { SectionLabel } from './SectionLabel';

function CheckGlyph() {
  return <Check size={iconSize.xs} color={color.onPrimary} strokeWidth={2.5} />;
}

export function BeforePublishCard({ draft, ack, onToggleAck }: { draft: RequirementDraftInput; ack: boolean; onToggleAck: () => void }) {
  return (
    <View style={styles.beforePublishCard}>
      <SectionLabel tone={color.danger}>Before you publish</SectionLabel>
      <Text style={styles.beforePublishHeading}>Four things stop being editable the moment you publish.</Text>

      <View style={{ gap: space.md, marginTop: space.lg }}>
        {LOCK_ITEMS.map((l) => (
          <View key={l.name} style={styles.lockRow}>
            <Lock size={iconSize.sm} color={color.danger} strokeWidth={1.75} style={{ marginTop: 3 }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.lockName}>{l.name}</Text>
              <Text style={styles.lockBody}>{l.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable onPress={onToggleAck} style={styles.ackRow}>
        <View style={[styles.checkbox, ack ? styles.checkboxOn : null]}>{ack && <CheckGlyph />}</View>
        <Text style={styles.ackText}>
          I understand that verified businesses in my category and service area will be alerted, that quotations stay sealed until{' '}
          <Text style={styles.ackBold}>{formatDateTime(draft.closingAt)}</Text>, and that scope and specifications, quantity, indicative
          budget, and the closing date and time cannot be changed once I publish.
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  beforePublishCard: { borderWidth: 1, borderColor: color.dangerBorder, borderLeftWidth: 3, borderLeftColor: color.danger, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.lg },
  beforePublishHeading: { marginTop: space.md, fontFamily: font.display, fontSize: fontSize.lg, lineHeight: lineHeight.lg, letterSpacing: letterSpacing.tight, color: color.ink, maxWidth: 460 },
  lockRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  lockName: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  lockBody: { marginTop: 2, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  ackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, marginTop: space.lg, paddingTop: space.md, borderTopWidth: 1, borderTopColor: color.borderFaint },
  checkbox: { width: 18, height: 18, marginTop: 2, borderWidth: 1.4, borderColor: color.border, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: color.primary, borderColor: color.primary },
  ackText: { flex: 1, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  ackBold: { fontFamily: font.bodySemi, color: color.ink },
});
