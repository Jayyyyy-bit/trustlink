// features/requirement-detail/components/OwnerSealedPanel.tsx

import { View, Text } from 'react-native';
import { space } from '../../../components/ui/tokens';
import type { Requirement } from '../../../lib/types';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';
import { CountdownBadge } from './CountdownBadge';
import { BareQuotationCount } from './BareQuotationCount';

function SealedExplanation() {
  return (
    <View style={sharedStyles.block}>
      <SectionLabel>Why nothing more is visible</SectionLabel>
      <Text style={sharedStyles.bodyText}>
        Quotations stay sealed until the countdown reaches zero. This stops respondents from seeing
        each other&apos;s pricing and undercutting one another, so the comparison is fair the moment
        it releases. Until then only the count above is shown — no names, figures, or previews.
      </Text>
    </View>
  );
}

function EditabilityList() {
  return (
    <View style={sharedStyles.block}>
      <SectionLabel>Before closing</SectionLabel>
      <View style={{ gap: space.sm }}>
        <Text style={sharedStyles.bodyText}>Can still edit: delivery window, delivery site, attachments.</Text>
        <Text style={sharedStyles.bodyText}>
          Locked: scope, specifications, quantity, indicative budget, closing date — respondents
          have already priced against these.
        </Text>
      </View>
    </View>
  );
}

/** Goes in the side column on the wide layout. */
function OwnerSealedSideContent({ requirement }: { requirement: Requirement }) {
  return (
    <>
      <CountdownBadge closingAt={requirement.closingAt} />
      <BareQuotationCount count={requirement.quotationCount} />
    </>
  );
}

/** Goes in the main column on the wide layout. */
function OwnerSealedMainContent() {
  return (
    <>
      <SealedExplanation />
      <EditabilityList />
    </>
  );
}

export function OwnerSealedPanel({ requirement }: { requirement: Requirement }) {
  return (
    <View style={{ gap: space.xxl }}>
      <OwnerSealedSideContent requirement={requirement} />
      <OwnerSealedMainContent />
    </View>
  );
}
