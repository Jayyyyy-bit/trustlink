// features/business-profile/components/MessageColumn.tsx
import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, space } from '../../../components/ui/tokens';
import { ActionButton } from './ActionButton';

export function MessageColumn({ canMessage, onMessage }: { canMessage: boolean; onMessage?: () => void }) {
  return (
    <View style={styles.messageColumn}>
      <ActionButton label="Message" variant={canMessage ? 'primary' : 'outline'} disabled={!canMessage} onPress={onMessage} />
      <Text style={styles.messageNote}>
        {canMessage ? 'Open — you have an award with them' : 'Opens after an award between you'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageColumn: { alignItems: 'flex-end', gap: space.xs, minWidth: 160 },
  messageNote: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkFaint, textAlign: 'right', maxWidth: 180 },
});
