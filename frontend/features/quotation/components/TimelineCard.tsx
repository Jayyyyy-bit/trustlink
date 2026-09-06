// features/quotation/components/TimelineCard.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, lineHeight, space, radius } from '../../../components/ui/tokens';
import type { Quotation, Requirement } from '../../../lib/types';
import { formatDateTime } from '../format';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';

interface TimelineStep {
  title: string;
  when: string;
  body: string;
  done: boolean;
}

function buildTimeline(requirement: Requirement, quotation: Quotation): TimelineStep[] {
  return [
    {
      title: 'Quotation sealed',
      when: formatDateTime(quotation.submittedAt),
      done: true,
      body: 'Recorded and locked. You will find it under My Quotations, marked Sealed.',
    },
    {
      title: 'Quotations open',
      when: formatDateTime(requirement.closingAt),
      done: false,
      body: 'Every quotation on this requirement opens at once. Yours goes to the buyer with its fingerprint checked. We will alert you.',
    },
    {
      title: 'Buyer reviews',
      when: 'After closing',
      done: false,
      body: 'The buyer compares price, lead time, terms, and trust tier. You may be shortlisted — you will be alerted either way.',
    },
    {
      title: 'Award',
      when: "Buyer's decision",
      done: false,
      body: 'If you win, contact details are exchanged and you deal with the buyer directly. Trustlink does not handle payment or contracts.',
    },
  ];
}

export function TimelineCard({ requirement, quotation }: { requirement: Requirement; quotation: Quotation }) {
  const steps = buildTimeline(requirement, quotation);
  return (
    <View style={sharedStyles.card}>
      <SectionLabel>What happens next</SectionLabel>
      <View style={{ marginTop: space.sm }}>
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <View key={s.title} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={[styles.timelineDot, s.done ? styles.timelineDotDone : null]} />
                {!last && <View style={styles.timelineLine} />}
              </View>
              <View style={[styles.timelineContent, !last ? { paddingBottom: space.xl } : null]}>
                <View style={styles.timelineHeaderRow}>
                  <Text style={[styles.timelineTitle, s.done ? styles.timelineTitleDone : null]}>{s.title}</Text>
                  <Text style={styles.timelineWhen}>{s.when}</Text>
                </View>
                <Text style={styles.timelineBody}>{s.body}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineRow: { flexDirection: 'row', gap: space.lg },
  timelineRail: { width: 12, alignItems: 'center' },
  timelineDot: { width: 11, height: 11, borderRadius: radius.pill, borderWidth: 2, borderColor: color.border, backgroundColor: color.canvas, marginTop: space.xs },
  timelineDotDone: { backgroundColor: color.primary, borderColor: color.primary },
  timelineLine: { flex: 1, width: 1.5, backgroundColor: color.border, marginTop: space.xs },
  timelineContent: { flex: 1, minWidth: 0 },
  timelineHeaderRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, flexWrap: 'wrap' },
  timelineTitle: { fontFamily: font.bodyMedium, fontSize: fontSize.base, color: color.inkMuted },
  timelineTitleDone: { fontFamily: font.bodySemi, color: color.ink },
  timelineWhen: { fontFamily: font.mono, fontSize: fontSize.sm, color: color.inkFaint },
  timelineBody: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
});
