// features/requirement-detail/components/Header.tsx

import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, lineHeight, letterSpacing, color, space } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { requirementStatusLabel, requirementStatusTone } from '../format';
import { SectionLabel } from './SectionLabel';
import { Badge } from './Badge';

export function Header({ requirement }: { requirement: Requirement }) {
  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.headerTopRow}>
        <SectionLabel>{requirement.category}</SectionLabel>
        <Badge label={requirementStatusLabel(requirement.status)} tone={requirementStatusTone(requirement.status)} />
      </View>
      <Text style={styles.title}>{requirement.title}</Text>
      <Text style={styles.ref}>{requirement.ref}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: font.display,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
  },
  ref: {
    fontFamily: font.mono,
    fontSize: fontSize.sm,
    color: color.inkFaint,
  },
});
