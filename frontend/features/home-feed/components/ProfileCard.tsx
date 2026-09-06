// features/home-feed/components/ProfileCard.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tag, MapPin } from 'lucide-react-native';
import { color, font, fontSize, iconSize, lineHeight, letterSpacing, radius, space } from '../../../components/ui/tokens';
import { AvatarChip, initials } from '../../../components/ui/AvatarChip';
import type { Business } from '../../../lib/types';
import { formatMonthYear, tierLabel, tierProgressionLine } from '../format';
import { FeedButton } from './FeedButton';

function CategoryIcon({ tone = color.primary }: { tone?: string }) {
  return <Tag size={iconSize.sm} color={tone} strokeWidth={1.75} />;
}

function PinIcon({ tone = color.primary }: { tone?: string }) {
  return <MapPin size={iconSize.sm} color={tone} strokeWidth={1.75} />;
}

export function ProfileCard({ viewer }: { viewer: Business }) {
  const name = viewer.displayName ?? viewer.registeredName;
  const tier = viewer.credibility.tier;
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileTopRow}>
        <AvatarChip label={initials(name)} size={44} />
        <View style={{ minWidth: 0, flex: 1 }}>
          <Text style={styles.profileName}>{name}</Text>
          {viewer.credibility.status === 'VERIFIED' && (
            <Text style={styles.profileVerified}>Verified business</Text>
          )}
        </View>
      </View>

      <View style={styles.profileFactList}>
        <View style={styles.profileFactRow}>
          <CategoryIcon />
          <Text style={styles.profileFact}>{viewer.category}</Text>
        </View>
        <View style={styles.profileFactRow}>
          <PinIcon />
          <Text style={styles.profileFact}>{viewer.city}, {viewer.province}</Text>
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileSectionRow}>
          <Text style={styles.microLabel}>Trust tier</Text>
          <Text style={styles.profileSectionValue}>{tierLabel(tier)} of 3</Text>
        </View>
        <View style={styles.tierBarRow}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={[styles.tierBarSegment, tier !== null && n <= tier ? styles.tierBarSegmentFilled : null]} />
          ))}
        </View>
        <Text style={styles.profileSectionCaption}>
          {viewer.credibility.verifiedAt ? `Verified ${formatMonthYear(viewer.credibility.verifiedAt)}` : 'Not yet verified'}
          {viewer.credibility.recheckDueAt ? ` · re-check due ${formatMonthYear(viewer.credibility.recheckDueAt)}.` : '.'}
          {tierProgressionLine(tier) ? ` ${tierProgressionLine(tier)}` : ''}
        </Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileSectionRow}>
          <Text style={styles.microLabel}>Profile completion</Text>
          <Text style={styles.profileSectionValueMono}>{viewer.profileCompletionPct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${viewer.profileCompletionPct}%` }]} />
        </View>
        <Pressable style={styles.profileNextStep} onPress={() => {}}>
          <Text style={styles.profileNextStepLabel}>Add your Mayor&apos;s permit</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: space.lg }}>
        <FeedButton label="View business profile" variant="outline" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: { borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.xl },
  profileTopRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  profileName: { fontFamily: font.display, fontSize: fontSize.md, color: color.ink },
  profileVerified: { marginTop: space.xs, fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.primary },
  profileFactList: { gap: space.sm, marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: color.border },
  profileFactRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  profileFact: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  profileSection: { marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: color.border },
  profileSectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  microLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
  profileSectionValue: { fontFamily: font.display, fontSize: fontSize.sm, color: color.ink },
  profileSectionValueMono: { fontFamily: font.mono, fontSize: fontSize.sm, color: color.ink },
  profileSectionCaption: { marginTop: space.sm, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  tierBarRow: { flexDirection: 'row', gap: space.xs, marginTop: space.sm },
  tierBarSegment: { flex: 1, height: 5, borderRadius: radius.pill, backgroundColor: color.borderFaint },
  tierBarSegmentFilled: { backgroundColor: color.ink },
  progressTrack: { height: 5, borderRadius: radius.pill, backgroundColor: color.borderFaint, marginTop: space.sm, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: color.ink, borderRadius: radius.pill },
  profileNextStep: { marginTop: space.md },
  profileNextStepLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
});
