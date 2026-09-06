// features/requirement-detail/components/WideOwnerControlsCard.tsx

import { View, Text } from 'react-native';
import { space } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { ActionButton } from './ActionButton';

const LOCKED_FIELDS = ['Scope and specifications', 'Quantities', 'Closing date and time', 'Cancellation'];

export function WideOwnerControlsCard({ requirement }: { requirement: Requirement }) {
  return (
    <View style={sharedStyles.wideCard}>
      <SectionLabel>Owner controls</SectionLabel>
      <ActionButton label="Edit contact and site notes" variant="outline" onPress={() => {}} />
      <View style={sharedStyles.wideDividedSectionTop}>
        <SectionLabel>Locked until closing</SectionLabel>
        <View style={{ gap: space.sm, marginTop: space.sm }}>
          {LOCKED_FIELDS.map((field) => (
            <Text key={field} style={sharedStyles.mutedSmall}>{field}</Text>
          ))}
        </View>
        <Text style={[sharedStyles.mutedSmall, { marginTop: space.sm }]}>
          {requirement.quotationCount} business{requirement.quotationCount === 1 ? '' : 'es'} have priced against
          these terms, so they cannot change. Cancellation is available only before the first quotation arrives.
        </Text>
      </View>
    </View>
  );
}
