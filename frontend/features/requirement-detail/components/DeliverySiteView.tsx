// features/requirement-detail/components/DeliverySiteView.tsx

import { View, Text } from 'react-native';
import { space } from '../../../components/ui/tokens';
import type { DeliverySite } from '../../../lib/types';
import { sharedStyles } from '../sharedStyles';

export function DeliverySiteView({ site }: { site: DeliverySite }) {
  return (
    <View style={{ gap: space.xs }}>
      <Text style={sharedStyles.bodyTextSemi}>{site.name}</Text>
      <Text style={sharedStyles.bodyText}>{site.address}</Text>
      <Text style={sharedStyles.mutedSmall}>{site.accessHours}</Text>
      <Text style={sharedStyles.mutedSmall}>{site.accessNote}</Text>
    </View>
  );
}
