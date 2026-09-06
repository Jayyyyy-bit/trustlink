// features/business-profile/components/OperateBlock.tsx
import { View, Text } from 'react-native';
import { space } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { StaticChip } from './Chips';

export function OperateBlock({ serviceAreas, isOwner }: { serviceAreas: string[]; isOwner: boolean }) {
  return (
    <View style={sharedStyles.sideBlock}>
      <SectionLabel>{isOwner ? 'Where you operate' : 'Where they operate'}</SectionLabel>
      <View style={[sharedStyles.chipsWrap, { marginTop: space.md }]}>
        {serviceAreas.map((a) => <StaticChip key={a} label={a} outline />)}
      </View>
      <Text style={sharedStyles.sideBody}>
        {isOwner
          ? 'Where you accept delivery and site work. Requirements here are recommended to you.'
          : 'Where this business accepts delivery and site work.'}
      </Text>
    </View>
  );
}
