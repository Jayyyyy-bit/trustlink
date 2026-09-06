// features/requirement-detail/components/WideOwnerReleasedScreen.tsx
// Rebuilt from docs/design/Trustlink Requirement Detail.dc.html: same cards, same
// sections, same order, same hierarchy as the design — the prototype's state-switcher
// tabs are the only thing intentionally left out, since those aren't part of the product.

import { View, ScrollView } from 'react-native';
import { space } from '../../../components/ui/tokens';
import type { OwnerReleasedProps } from '../RequirementDetail';
import { useOwnerReleased } from '../useOwnerReleased';
import { sharedStyles, stickyOnWeb } from '../sharedStyles';
import { WideHeader } from './WideHeader';
import { WideInfoBand } from './WideInfoBand';
import { WideReleasedHeaderCard } from './WideReleasedHeaderCard';
import { WideQuotationCard } from './WideQuotationCard';
import { WideCloseoutCard } from './WideCloseoutCard';
import { WideScopeCard } from './WideScopeCard';
import { WideDecisionCard } from './WideDecisionCard';
import { WideIntegrityFlagCard } from './WideIntegrityFlagCard';
import { WideRecordCard } from './WideRecordCard';
import { AwardConfirmationModal } from './AwardConfirmationModal';

export function WideOwnerReleasedScreen(props: OwnerReleasedProps) {
  const { requirement } = props;
  const st = useOwnerReleased(props);
  const decided = st.awardedId !== null;

  return (
    <ScrollView style={sharedStyles.root} contentContainerStyle={sharedStyles.scrollContent}>
      <View style={sharedStyles.pageWide}>
        <WideHeader requirement={requirement} />
        <View style={sharedStyles.columns}>
          <View style={sharedStyles.mainColumn}>
            <WideInfoBand
              requirement={requirement}
              buyer={null}
              showRespondentFacts={false}
              showActions={false}
              showSubmit={false}
              sealTinted={false}
              countLabel="Quotations released"
              countCaption="opened simultaneously"
              sealLine="Every quotation opened together at the closing time. Nobody saw a price before that moment."
            />
            <WideReleasedHeaderCard st={st} requirement={requirement} />
            <View style={{ gap: space.lg }}>
              {st.sorted.map((q) => {
                const predecessor = st.withdrawn.find((w) => w.replacedByQuotationId === q.id) ?? null;
                return (
                  <WideQuotationCard
                    key={q.id}
                    quotation={q}
                    respondent={st.respondents[q.respondentId]}
                    awardLocked={decided}
                    predecessor={predecessor}
                    onToggleShortlist={() => st.handleToggleShortlist(q.id)}
                    onRequestAward={() => st.setAwardTargetId(q.id)}
                  />
                );
              })}
            </View>
            <WideCloseoutCard awarded={decided} onCloseWithoutAward={props.onCloseWithoutAward} />
            <WideScopeCard requirement={requirement} />
          </View>
          <View style={[sharedStyles.sideColumn, stickyOnWeb]}>
            <WideDecisionCard st={st} />
            {st.flaggedCount > 0 && <WideIntegrityFlagCard />}
            <WideRecordCard requirement={requirement} />
          </View>
        </View>
        <AwardConfirmationModal
          visible={st.awardTargetId !== null}
          respondentName={st.awardTargetName}
          onCancel={() => st.setAwardTargetId(null)}
          onConfirm={() => {
            if (st.awardTargetId) st.handleConfirmAward(st.awardTargetId);
          }}
        />
      </View>
    </ScrollView>
  );
}
