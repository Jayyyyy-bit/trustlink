// features/requirement-detail/components/AwardConfirmationModal.tsx

import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { color, radius, space, layout, elevation } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { ActionButton } from './ActionButton';

export function AwardConfirmationModal({
  visible,
  respondentName,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  respondentName: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <SectionLabel>Confirm award</SectionLabel>
          <Text style={sharedStyles.bodyTextSemi}>
            {respondentName ? `Award ${respondentName}?` : 'Award this quotation?'}
          </Text>
          <Text style={sharedStyles.bodyText}>
            All other quotations for this requirement move to Not Selected.
          </Text>
          <Text style={sharedStyles.bodyText}>
            This is irreversible and is recorded on the ledger.
          </Text>
          <Text style={sharedStyles.mutedSmall}>
            Trustlink does not handle payment, delivery, or contracts — the two parties settle directly.
          </Text>
          <View style={styles.modalActions}>
            <View style={styles.modalActionButton}>
              <ActionButton label="Cancel" variant="text" onPress={onCancel} />
            </View>
            <View style={styles.modalActionButton}>
              <ActionButton label="Confirm" variant="primary" onPress={onConfirm} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: color.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  modalCard: {
    ...elevation.cardRaised,
    width: '100%',
    maxWidth: layout.maxWidth - layout.screenPadding * 2,
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    gap: space.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.sm,
  },
  modalActionButton: {
    flex: 1,
  },
});
