// features/onboarding/components/ArrivalScreen.tsx
// ARRIVAL is a confirmation, not a step — no shell, no progress indicator, no slide —
// shaped like the sealed quotation receipt: what was submitted, what happens next, and the
// way in.

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Clock } from 'lucide-react-native';
import { font, fontSize, iconSize, lineHeight, letterSpacing, space, radius, elevation, layout, color } from '../../../components/ui/tokens';
import { businessTypeLabel, listOut, summarizeList, registrationDocSpec, FORM_COLUMN_MAX_WIDTH } from '../format';
import type { ArrivalProps, ArrivalTimelineStep } from '../types';
import { SectionLabel } from './SectionLabel';
import { ActionButton } from './ActionButton';

function ClockGlyph() {
  return <Clock size={iconSize.lg} color={color.primary} strokeWidth={1.75} />;
}

export function ArrivalScreen({ business, documents, onEnterApp }: ArrivalProps) {
  const regSpec = registrationDocSpec(business.businessType);
  const docNames = [`${regSpec.key} certificate`, 'BIR certificate'];
  if (documents.mayorsPermit) docNames.push("Mayor's permit");
  const docsLine = `${listOut(docNames)} · submitted just now`;

  const timeline: ArrivalTimelineStep[] = [
    { title: 'Documents submitted', when: 'Just now', done: true, body: 'Both are with the Trustlink team. You do not need to do anything else.' },
    { title: 'We check them', when: 'Within 1 working day', done: false, body: `Against ${regSpec.key} and BIR records. If something cannot be read or does not match, we tell you exactly what to replace.` },
    { title: 'Verified', when: 'After the check', done: false, body: 'Your profile gains the verified badge and its date, and posting and quoting open. Trust tier is separate — it comes from requirements awarded to you.' },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.arrivalScrollContent}>
      <View style={styles.arrivalPage}>
        <View style={styles.arrivalHero}>
          <View style={styles.arrivalIconCircle}>
            <ClockGlyph />
          </View>
          <View style={styles.arrivalPill}>
            <Text style={styles.arrivalPillLabel}>Pending verification</Text>
          </View>
          <Text style={styles.arrivalTitle}>You are in — we are checking your documents</Text>
          <Text style={styles.arrivalBody}>
            Browse requirements now. Posting a requirement and submitting a quotation open as soon as your documents are checked — usually within one working day.
          </Text>
        </View>

        <View style={styles.card}>
          <SectionLabel>What you submitted</SectionLabel>
          <View style={styles.arrivalIdentityRow}>
            <View style={styles.arrivalAvatar}>
              <Text style={styles.arrivalAvatarLabel}>
                {(business.displayName ?? business.registeredName)
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()}
              </Text>
            </View>
            <View style={{ minWidth: 0, flex: 1 }}>
              <Text style={styles.arrivalBusinessName}>{business.displayName ?? business.registeredName}</Text>
              <Text style={styles.arrivalBusinessMeta}>{businessTypeLabel(business.businessType)} · {business.category}</Text>
            </View>
          </View>

          <View style={styles.arrivalFactsGrid}>
            <View style={styles.arrivalFactRow}>
              <SectionLabel>Based in</SectionLabel>
              <Text style={styles.arrivalFactValue}>{business.city}, {business.province}</Text>
            </View>
            <View style={styles.arrivalFactRow}>
              <SectionLabel>Capabilities</SectionLabel>
              <Text style={styles.arrivalFactValue}>{summarizeList(business.capabilities)}</Text>
            </View>
            <View style={styles.arrivalFactRow}>
              <SectionLabel>Service area</SectionLabel>
              <Text style={styles.arrivalFactValue}>{summarizeList(business.serviceAreas)}</Text>
            </View>
            <View style={styles.arrivalFactRow}>
              <SectionLabel>Contact</SectionLabel>
              <Text style={styles.arrivalFactValue}>{business.contactPerson} · {business.contactMobile}</Text>
            </View>
            <View style={styles.arrivalFactRow}>
              <SectionLabel>Documents</SectionLabel>
              <Text style={styles.arrivalFactValue}>{docsLine}</Text>
            </View>
          </View>

          <View style={styles.arrivalDisclaimerRow}>
            <Text style={styles.arrivalDisclaimer}>
              The verified badge and your trust tier are not part of this record. Verification is a check we carry out; tier is earned from requirements awarded to you. Neither comes from completing this form.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <SectionLabel>What happens next</SectionLabel>
          <View style={{ marginTop: space.sm }}>
            {timeline.map((t, i) => {
              const last = i === timeline.length - 1;
              return (
                <View key={t.title} style={styles.timelineRow}>
                  <View style={styles.timelineRail}>
                    <View style={[styles.timelineDot, t.done ? styles.timelineDotDone : null]} />
                    {!last && <View style={styles.timelineLine} />}
                  </View>
                  <View style={[styles.timelineContent, !last ? { paddingBottom: space.xl } : null]}>
                    <View style={styles.timelineHeaderRow}>
                      <Text style={[styles.timelineTitle, t.done ? styles.timelineTitleDone : null]}>{t.title}</Text>
                      <Text style={styles.timelineWhen}>{t.when}</Text>
                    </View>
                    <Text style={styles.timelineBody}>{t.body}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.footerRow}>
          <ActionButton label="See requirements for you" variant="primary" onPress={onEnterApp} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  arrivalScrollContent: { alignItems: 'center', paddingBottom: space.xxl },
  arrivalPage: { width: '100%', maxWidth: FORM_COLUMN_MAX_WIDTH, paddingHorizontal: layout.screenPadding, paddingTop: space.xxl, gap: space.lg },

  card: { ...elevation.cardRaised, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.md, gap: space.sm },

  arrivalHero: { alignItems: 'center', gap: space.sm, textAlign: 'center' } as ViewStyle,
  arrivalIconCircle: { width: 62, height: 62, borderRadius: radius.pill, backgroundColor: color.primaryFaint, alignItems: 'center', justifyContent: 'center' },
  arrivalPill: { marginTop: space.sm, backgroundColor: color.primary, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  arrivalPillLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.onPrimary },
  arrivalTitle: { textAlign: 'center', fontFamily: font.display, fontSize: fontSize.display, lineHeight: lineHeight.display, letterSpacing: letterSpacing.tight, color: color.ink, maxWidth: 440 },
  arrivalBody: { textAlign: 'center', fontFamily: font.body, fontSize: fontSize.base, lineHeight: lineHeight.base, color: color.inkMuted, maxWidth: 500 },

  arrivalIdentityRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm },
  arrivalAvatar: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: color.ink, alignItems: 'center', justifyContent: 'center' },
  arrivalAvatarLabel: { fontFamily: font.display, fontSize: fontSize.base, color: color.canvas },
  arrivalBusinessName: { fontFamily: font.display, fontSize: fontSize.md, lineHeight: lineHeight.md, letterSpacing: letterSpacing.tight, color: color.ink },
  arrivalBusinessMeta: { marginTop: 2, fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },

  arrivalFactsGrid: { gap: space.sm, marginTop: space.md, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: color.borderFaint },
  arrivalFactRow: { gap: 2 },
  arrivalFactValue: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.ink },

  arrivalDisclaimerRow: { marginTop: space.sm, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: color.borderFaint },
  arrivalDisclaimer: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },

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

  footerRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap' },
});
