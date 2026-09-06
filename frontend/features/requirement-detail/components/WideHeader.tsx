// features/requirement-detail/components/WideHeader.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, space, radius } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { formatDate, requirementStatusLabel, requirementStatusTone } from '../format';
import { Badge } from './Badge';

export function WideHeader({ requirement }: { requirement: Requirement }) {
  const tone = requirementStatusTone(requirement.status);
  return (
    <View style={{ gap: space.md }}>
      <View style={styles.widePillRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillLabel}>{requirement.category}</Text>
        </View>
        <Badge label={requirementStatusLabel(requirement.status)} tone={tone} dot />
      </View>
      <Text style={styles.wideTitle}>{requirement.title}</Text>
      <Text style={styles.wideSubtitle}>
        {requirement.publishedAt ? `Posted ${formatDate(requirement.publishedAt)}` : 'Not yet published'}
        {' · '}
        {requirement.deliverySite.address}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  widePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  categoryPill: {
    borderWidth: 1,
    borderColor: color.primaryBorder,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  categoryPillLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.primary,
  },
  wideTitle: {
    fontFamily: font.display,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
  },
  wideSubtitle: {
    fontFamily: font.body,
    fontSize: fontSize.base,
    color: color.inkMuted,
  },
});
