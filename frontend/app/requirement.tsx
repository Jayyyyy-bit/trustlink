import { useLocalSearchParams } from 'expo-router';
import RequirementDetail from '../features/requirement-detail/RequirementDetail';
import {
  mockRequirement,
  mockBuyer,
  mockQuotations,
  mockRespondents,
  mockOwnQuotation,
  mockLedgerEntry,
} from '../features/requirement-detail/mock';

export default function RequirementRoute() {
  const { dev } = useLocalSearchParams<{ dev?: string }>();

  if (dev === 'sealed') {
    return <RequirementDetail state="OWNER_SEALED" requirement={mockRequirement} />;
  }

  if (dev === 'released') {
    return (
      <RequirementDetail
        state="OWNER_RELEASED"
        requirement={mockRequirement}
        quotations={mockQuotations}
        respondents={mockRespondents}
      />
    );
  }

  if (dev === 'submitted') {
    return (
      <RequirementDetail
        state="RESPONDENT"
        requirement={mockRequirement}
        buyer={mockBuyer}
        hasSubmitted
        ownQuotation={mockOwnQuotation}
        ledgerEntry={mockLedgerEntry}
      />
    );
  }

  return (
    <RequirementDetail
      state="RESPONDENT"
      requirement={mockRequirement}
      buyer={mockBuyer}
      hasSubmitted={false}
    />
  );
}