// features/requirement-detail/components/RequirementOverview.tsx
// Shared requirement overview (all three states), rendered as atomic blocks so the
// wide layout could route them to different columns while the phone layout composes
// them in this same original order.

import { View, Text, StyleSheet } from 'react-native';
import { space } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { formatBudget } from '../format';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { SpecTable } from './SpecTable';
import { DeliverySiteView } from './DeliverySiteView';
import { AttachmentList } from './AttachmentList';

function ScopeBlock({ requirement }: { requirement: Requirement }) {
  return (
    <View style={sharedStyles.block}>
      <SectionLabel>Scope</SectionLabel>
      <Text style={sharedStyles.bodyText}>{requirement.scope}</Text>
    </View>
  );
}

function SpecificationsBlock({ requirement }: { requirement: Requirement }) {
  return (
    <View style={sharedStyles.block}>
      <SectionLabel>Specifications</SectionLabel>
      <SpecTable rows={requirement.specifications} />
    </View>
  );
}

function QuantityBudgetRow({ requirement }: { requirement: Requirement }) {
  return (
    <View style={styles.rowBlock}>
      <View style={styles.blockHalf}>
        <SectionLabel>Quantity</SectionLabel>
        <Text style={sharedStyles.bodyText}>{requirement.quantity}</Text>
      </View>
      <View style={styles.blockHalf}>
        <SectionLabel>Indicative budget</SectionLabel>
        <Text style={sharedStyles.bodyText}>{formatBudget(requirement.budgetMin, requirement.budgetMax)}</Text>
      </View>
    </View>
  );
}

function DeliveryWindowBlock({ requirement }: { requirement: Requirement }) {
  return (
    <View style={sharedStyles.block}>
      <SectionLabel>Delivery window</SectionLabel>
      <Text style={sharedStyles.bodyText}>{requirement.deliveryWindow}</Text>
    </View>
  );
}

function DeliverySiteBlock({ requirement }: { requirement: Requirement }) {
  return (
    <View style={sharedStyles.block}>
      <SectionLabel>Delivery site</SectionLabel>
      <DeliverySiteView site={requirement.deliverySite} />
    </View>
  );
}

function AttachmentsBlock({ requirement }: { requirement: Requirement }) {
  return (
    <View style={sharedStyles.block}>
      <SectionLabel>Attachments</SectionLabel>
      <AttachmentList attachments={requirement.attachments} />
    </View>
  );
}

export function RequirementOverview({ requirement }: { requirement: Requirement }) {
  return (
    <View style={{ gap: space.xxl }}>
      <ScopeBlock requirement={requirement} />
      <SpecificationsBlock requirement={requirement} />
      <QuantityBudgetRow requirement={requirement} />
      <DeliveryWindowBlock requirement={requirement} />
      <DeliverySiteBlock requirement={requirement} />
      <AttachmentsBlock requirement={requirement} />
    </View>
  );
}

const styles = StyleSheet.create({
  rowBlock: {
    flexDirection: 'row',
    gap: space.xl,
  },
  blockHalf: {
    flex: 1,
  },
});
