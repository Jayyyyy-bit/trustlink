// features/requirement-detail/components/WideCloseoutCard.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, space, radius, layout, elevation } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import { ActionButton } from './ActionButton';

export function WideCloseoutCard({
  awarded,
  onCloseWithoutAward,
}: {
  awarded: boolean;
  onCloseWithoutAward?: () => void;
}) {
  return (
    <View style={styles.wideCloseoutCard}>
      <View style={styles.wideCloseoutBody}>
        <Text style={sharedStyles.bodyTextSemi}>{awarded ? 'This requirement is awarded' : 'No suitable quotation?'}</Text>
        <Text style={[sharedStyles.mutedSmall, { marginTop: space.xs }]}>
          {awarded
            ? 'All other respondents were notified that the requirement was awarded to another business.'
            : 'Closing without award notifies every respondent and records the outcome on your public profile. The requirement cannot be reopened.'}
        </Text>
      </View>
      {!awarded && <ActionButton label="Close without award" variant="danger" onPress={onCloseWithoutAward} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wideCloseoutCard: {
    ...elevation.cardRaised,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    flexWrap: 'wrap',
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    paddingVertical: space.lg,
    paddingHorizontal: space.xxl,
  },
  wideCloseoutBody: {
    flex: 1,
    minWidth: layout.factMinWidth,
  },
});
