// features/requirement-detail/RequirementDetail.tsx
// One component, three states, driven entirely by props. No screens, no tabs.

import { ScrollView, View, useWindowDimensions } from 'react-native';
import { breakpoint } from '../../components/ui/tokens';
import type { Requirement, Business, Quotation, LedgerEntry, RequirementDetailState, BusinessId } from '../../lib/types';
import type { Respondent } from './useOwnerReleased';
import { sharedStyles, stickyOnWeb } from './sharedStyles';

import { Header } from './components/Header';
import { RequirementOverview } from './components/RequirementOverview';
import { RespondentPanel } from './components/RespondentPanel';
import { OwnerSealedPanel } from './components/OwnerSealedPanel';
import { OwnerReleasedPanel } from './components/OwnerReleasedPanel';
import { WideHeader } from './components/WideHeader';
import { WideInfoBand } from './components/WideInfoBand';
import { WideSealedHero } from './components/WideSealedHero';
import { WideScopeCard } from './components/WideScopeCard';
import { WideMyRecordCard } from './components/WideMyRecordCard';
import { WideOwnerControlsCard } from './components/WideOwnerControlsCard';
import { WideRecordCard } from './components/WideRecordCard';
import { WideOwnerReleasedScreen } from './components/WideOwnerReleasedScreen';

/* ─── Props ─────────────────────────────────────────── */

export interface RespondentNotSubmitted {
  state: Extract<RequirementDetailState, 'RESPONDENT'>;
  requirement: Requirement;
  buyer: Business;
  hasSubmitted: false;
  onSubmitQuotation?: () => void;
}

export interface RespondentSubmitted {
  state: Extract<RequirementDetailState, 'RESPONDENT'>;
  requirement: Requirement;
  buyer: Business;
  hasSubmitted: true;
  ownQuotation: Quotation;
  ledgerEntry: LedgerEntry;
  onWithdraw?: () => void;
}

export interface OwnerSealedProps {
  state: Extract<RequirementDetailState, 'OWNER_SEALED'>;
  requirement: Requirement;
}

export interface OwnerReleasedProps {
  state: Extract<RequirementDetailState, 'OWNER_RELEASED'>;
  requirement: Requirement;
  quotations: Quotation[];
  respondents: Record<BusinessId, Respondent>;
  onShortlistToggle?: (quotationId: string) => void;
  onAward?: (quotationId: string) => void;
  onCloseWithoutAward?: () => void;
}

export type RequirementDetailProps =
  | RespondentNotSubmitted
  | RespondentSubmitted
  | OwnerSealedProps
  | OwnerReleasedProps;

/* ─── Root component ────────────────────────────────── */

export default function RequirementDetail(props: RequirementDetailProps) {
  const { requirement } = props;
  const { width } = useWindowDimensions();
  const isWide = width >= breakpoint.desktop;

  if (!isWide) {
    return (
      <ScrollView style={sharedStyles.root} contentContainerStyle={sharedStyles.scrollContent}>
        <View style={sharedStyles.page}>
          <Header requirement={requirement} />
          <RequirementOverview requirement={requirement} />

          {props.state === 'RESPONDENT' && <RespondentPanel {...props} />}
          {props.state === 'OWNER_SEALED' && <OwnerSealedPanel requirement={requirement} />}
          {props.state === 'OWNER_RELEASED' && <OwnerReleasedPanel {...props} />}
        </View>
      </ScrollView>
    );
  }

  if (props.state === 'OWNER_RELEASED') {
    return <WideOwnerReleasedScreen {...props} />;
  }

  return (
    <ScrollView style={sharedStyles.root} contentContainerStyle={sharedStyles.scrollContent}>
      <View style={sharedStyles.pageWide}>
        <WideHeader requirement={requirement} />
        <View style={sharedStyles.columns}>
          <View style={sharedStyles.mainColumn}>
            <WideInfoBand
              requirement={requirement}
              buyer={props.state === 'RESPONDENT' ? props.buyer : null}
              showRespondentFacts={props.state === 'RESPONDENT'}
              showActions={props.state === 'RESPONDENT'}
              showSubmit={props.state === 'RESPONDENT' && !props.hasSubmitted}
              onSubmitQuotation={props.state === 'RESPONDENT' && !props.hasSubmitted ? props.onSubmitQuotation : undefined}
              sealTinted={props.state === 'OWNER_SEALED'}
              countLabel={props.state === 'OWNER_SEALED' ? 'Sealed quotations' : 'Quotations'}
              countCaption="contents sealed"
              sealLine={
                props.state === 'OWNER_SEALED'
                  ? 'You cannot see who has quoted or what they offered. Neither can they. Everything opens together at closing.'
                  : 'Your price stays hidden until closing — from the buyer and from every other business quoting.'
              }
            />
            {props.state === 'OWNER_SEALED' && <WideSealedHero requirement={requirement} />}
            <WideScopeCard requirement={requirement} />
          </View>
          <View style={[sharedStyles.sideColumn, stickyOnWeb]}>
            {props.state === 'RESPONDENT' && props.hasSubmitted && (
              <WideMyRecordCard
                quotation={props.ownQuotation}
                ledgerEntry={props.ledgerEntry}
                onWithdraw={props.onWithdraw}
              />
            )}
            {props.state === 'OWNER_SEALED' && <WideOwnerControlsCard requirement={requirement} />}
            <WideRecordCard requirement={requirement} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
