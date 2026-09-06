// features/requirement-detail/components/CountdownBadge.tsx

import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, color } from '../../../components/ui/tokens';
import type { ISODateTime } from '../../../lib/types';
import { formatDateTime } from '../format';
import { useCountdown } from '../useCountdown';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';

export function CountdownBadge({ closingAt }: { closingAt: ISODateTime }) {
  const { label, closed } = useCountdown(closingAt);
  return (
    <View style={sharedStyles.block}>
      <SectionLabel>{closed ? 'Closed' : 'Closes in'}</SectionLabel>
      <Text style={[styles.countdown, closed ? styles.countdownClosed : null]}>{label}</Text>
      {!closed && <Text style={sharedStyles.mutedSmall}>{formatDateTime(closingAt)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  countdown: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.xl,
    color: color.primary,
  },
  countdownClosed: {
    color: color.inkMuted,
  },
});
