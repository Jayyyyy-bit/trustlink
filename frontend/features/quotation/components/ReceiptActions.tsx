// features/quotation/components/ReceiptActions.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, lineHeight, space } from '../../../components/ui/tokens';
import { ActionButton } from './ActionButton';

export function ReceiptActions({
  onTrack,
  onBack,
  onWithdraw,
  canWithdraw,
}: {
  onTrack?: () => void;
  onBack?: () => void;
  onWithdraw?: () => void;
  canWithdraw: boolean;
}) {
  return (
    <View>
      <View style={styles.receiptActionsRow}>
        <ActionButton label="Track in My Quotations" variant="primary" onPress={onTrack} />
        <ActionButton label="Back to opportunities" variant="outline" onPress={onBack} />
        <View style={{ flex: 1, minWidth: 8 }} />
        {canWithdraw && <ActionButton label="Withdraw quotation" variant="danger" onPress={onWithdraw} />}
      </View>
      <Text style={styles.withdrawCaption}>
        Withdrawing removes your quotation from this requirement. The record of it stays, and you may submit a new
        price until closing.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  receiptActionsRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap' },
  withdrawCaption: { marginTop: space.sm, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkFaint },
});
