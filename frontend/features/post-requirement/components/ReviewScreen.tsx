import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { space } from '../../../components/ui/tokens';
import type { ReviewProps } from '../PostRequirement';
import { buildDraftInput, formatBudget, formatWindow, formatDateTime } from '../format';
import { ScreenTitle } from './ScreenTitle';
import { SummaryBanner } from './SummaryBanner';
import { FormDivider } from './FormDivider';
import { SummaryGroup } from './SummaryGroup';
import { SummaryLine } from './SummaryLine';
import { SummaryBlock } from './SummaryBlock';
import { SealedExplanationCard } from './SealedExplanationCard';
import { BeforePublishCard } from './BeforePublishCard';

/* STEP 4 — REVIEW: A read-only summary grouped as What you need / Where and when / Closing,
 * a sealed-quotations explanation, and the existing lock list + acknowledgment. */

export function ReviewScreen({
  details,
  delivery,
  closing,
  onPublish,
  reportContinue,
}: ReviewProps & { reportContinue: (fn: () => void) => void }) {
  const [ack, setAck] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const draft = buildDraftInput(details, delivery, closing);

  const handlePublish = () => {
    if (!ack) {
      setAttempted(true);
      return;
    }
    onPublish(draft);
  };
  reportContinue(handlePublish);

  const specText = draft.specifications.length > 0
    ? draft.specifications.map((s) => `${s.label}: ${s.value}`).join('\n')
    : '';
  const attachmentsText = draft.attachments.length > 0 ? draft.attachments.map((a) => a.filename).join(', ') : 'None';
  const locationText = draft.deliveryCity + (draft.deliveryAddress ? `, ${draft.deliveryAddress}` : '');

  return (
    <View style={styles.stepContent}>
      <ScreenTitle title="Review and publish" subtitle="Check the details below, then publish." />

      <View style={{ gap: space.lg }}>
        <SummaryGroup title="What you need">
          <SummaryLine label="Category" value={draft.category} />
          <SummaryLine label="Title" value={draft.title} />
          <SummaryBlock label="Scope" value={draft.scope} />
          {!!specText && <SummaryBlock label="Specifications" value={specText} />}
          <SummaryLine label="Quantity" value={draft.quantity} />
          <SummaryLine label="Indicative budget" value={formatBudget(draft.budgetMin, draft.budgetMax)} />
        </SummaryGroup>

        <FormDivider />

        <SummaryGroup title="Where and when">
          <SummaryLine label="Location" value={locationText} />
          <SummaryLine label="Delivery window" value={formatWindow(draft.deliveryWindowFrom, draft.deliveryWindowTo)} />
          <SummaryLine label="Attachments" value={attachmentsText} />
        </SummaryGroup>

        <FormDivider />

        <SummaryGroup title="Closing">
          <SummaryLine label="Closes" value={formatDateTime(draft.closingAt)} />
        </SummaryGroup>
      </View>

      <SealedExplanationCard closingAt={draft.closingAt} />

      <BeforePublishCard draft={draft} ack={ack} onToggleAck={() => setAck((v) => !v)} />
      {attempted && !ack && <SummaryBanner message="Confirm the statement above to publish." />}
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: { gap: space.lg },
});
