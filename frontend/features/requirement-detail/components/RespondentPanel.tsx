// features/requirement-detail/components/RespondentPanel.tsx

import { View } from 'react-native';
import { space } from '../../../components/ui/tokens';
import type { RespondentNotSubmitted, RespondentSubmitted } from '../RequirementDetail';
import { CredibilityBlockView } from './CredibilityBlockView';
import { CountdownBadge } from './CountdownBadge';
import { BareQuotationCount } from './BareQuotationCount';
import { SealedRecordPanel } from './SealedRecordPanel';
import { ActionButton } from './ActionButton';

/** All of RESPONDENT's content lives in the side column on the wide layout. */
function RespondentSideContent(props: RespondentNotSubmitted | RespondentSubmitted) {
  const { requirement, buyer } = props;
  return (
    <>
      <CredibilityBlockView label="Posted by" business={buyer} />
      <CountdownBadge closingAt={requirement.closingAt} />
      <BareQuotationCount count={requirement.quotationCount} />
      {props.hasSubmitted ? (
        <SealedRecordPanel
          quotation={props.ownQuotation}
          ledgerEntry={props.ledgerEntry}
          onWithdraw={props.onWithdraw}
        />
      ) : (
        <ActionButton label="Submit quotation" variant="primary" onPress={props.onSubmitQuotation} />
      )}
    </>
  );
}

export function RespondentPanel(props: RespondentNotSubmitted | RespondentSubmitted) {
  return (
    <View style={{ gap: space.xxl }}>
      <RespondentSideContent {...props} />
    </View>
  );
}
