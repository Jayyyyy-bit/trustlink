// features/business-profile/components/InteractionBlock.tsx
import { View, Text } from 'react-native';
import { space } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { ActionButton } from './ActionButton';

export function InteractionBlock({
  isOwner,
  canMessage,
  onMessage,
}: {
  isOwner: boolean;
  canMessage: boolean;
  onMessage?: () => void;
}) {
  return (
    <View style={sharedStyles.sideBlock}>
      <SectionLabel>Interaction</SectionLabel>
      <Text style={sharedStyles.sideBody}>
        {isOwner
          ? 'Another business can message you only after an award exists between you. Until then, everything happens through the requirement.'
          : canMessage
            ? 'You have an award with this business, so direct messages are open.'
            : 'Direct messaging opens once an award exists between the two of you. Until then, everything happens through the requirement.'}
      </Text>
      {!isOwner && (
        <View style={{ marginTop: space.md }}>
          <ActionButton
            label="Message business"
            variant={canMessage ? 'primary' : 'outline'}
            disabled={!canMessage}
            onPress={onMessage}
          />
        </View>
      )}
    </View>
  );
}
