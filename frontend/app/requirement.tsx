import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { color, space } from '../components/ui/tokens';
import { ErrorState } from '../components/ui/ErrorState';
import RequirementDetail from '../features/requirement-detail/RequirementDetail';
import { RequirementDetailSkeleton } from '../features/requirement-detail/RequirementDetailSkeleton';
import type { Respondent } from '../features/requirement-detail/useOwnerReleased';
import {
  mockRequirement,
  mockBuyer,
  mockQuotations,
  mockRespondents,
  mockOwnQuotation,
  mockLedgerEntry,
} from '../features/requirement-detail/mock';
import { USE_MOCK_DATA } from '../lib/api/flags';
import { ApiError } from '../lib/api/client';
import { getRequirement } from '../lib/api/requirements';
import { getBusiness } from '../lib/api/businesses';
import { getMyQuotations, withdrawQuotation } from '../lib/api/quotations';
import type { Business, BusinessId, LedgerEntry, Quotation, Requirement } from '../lib/types';

interface LiveData {
  requirement: Requirement;
  quotations: Quotation[] | null; // present only when the response is the owner+released shape
  buyer: Business | null;
  respondents: Record<BusinessId, Respondent>;
  ownQuotation: Quotation | null;
  ledgerEntry: LedgerEntry | null;
}

export default function RequirementRoute() {
  const { dev, ref } = useLocalSearchParams<{ dev?: string; ref?: string }>();
  const router = useRouter();

  const [data, setData] = useState<LiveData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    if (USE_MOCK_DATA || !ref) return;
    setError(null);
    setData(null);
    try {
      const result = await getRequirement(ref);
      const requirement: Requirement = result;
      const released = 'quotations' in result ? result.quotations : null;

      if (released) {
        const respondentIds = Array.from(new Set(released.map((q) => q.respondentId)));
        const businesses = await Promise.all(respondentIds.map((id) => getBusiness(id)));
        const respondents = Object.fromEntries(businesses.map((b) => [b.id, b])) as Record<BusinessId, Respondent>;
        setData({ requirement, quotations: released, buyer: null, respondents, ownQuotation: null, ledgerEntry: null });
        return;
      }

      const [buyer, mine] = await Promise.all([getBusiness(requirement.buyerId), getMyQuotations()]);
      const own = mine.quotations.find((q) => q.requirementId === requirement.id && q.status !== 'WITHDRAWN') ?? null;
      const ledgerEntry = own ? mine.ledgerEntries[own.id] ?? null : null;
      setData({ requirement, quotations: null, buyer, respondents: {}, ownQuotation: own, ledgerEntry });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this requirement.');
    }
  }, [ref]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  if (!USE_MOCK_DATA) {
    if (error) {
      return (
        <View style={{ flex: 1, backgroundColor: color.canvas, padding: space.lg }}>
          <ErrorState message={error} onRetry={() => setReloadToken((n) => n + 1)} />
        </View>
      );
    }

    if (!ref) {
      return (
        <View style={{ flex: 1, backgroundColor: color.canvas, padding: space.lg }}>
          <ErrorState message="No requirement reference given." />
        </View>
      );
    }

    if (!data) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: color.canvas }}>
          <RequirementDetailSkeleton />
        </ScrollView>
      );
    }

    if (dev === 'released' || data.quotations) {
      return (
        <RequirementDetail
          state="OWNER_RELEASED"
          requirement={data.requirement}
          quotations={data.quotations ?? []}
          respondents={data.respondents}
        />
      );
    }

    if (dev === 'sealed') {
      return <RequirementDetail state="OWNER_SEALED" requirement={data.requirement} />;
    }

    if (!data.buyer) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: color.canvas }}>
          <RequirementDetailSkeleton />
        </ScrollView>
      );
    }

    if (data.ownQuotation && data.ledgerEntry) {
      return (
        <RequirementDetail
          state="RESPONDENT"
          requirement={data.requirement}
          buyer={data.buyer}
          hasSubmitted
          ownQuotation={data.ownQuotation}
          ledgerEntry={data.ledgerEntry}
          onWithdraw={async () => {
            try {
              await withdrawQuotation(data.ownQuotation!.ref);
              setReloadToken((n) => n + 1);
            } catch {
              // Withdraw failures surface on retry via the normal error path.
              setReloadToken((n) => n + 1);
            }
          }}
        />
      );
    }

    return (
      <RequirementDetail
        state="RESPONDENT"
        requirement={data.requirement}
        buyer={data.buyer}
        hasSubmitted={false}
        onSubmitQuotation={() => router.push({ pathname: '/submit-quotation', params: { ref: data.requirement.ref } })}
      />
    );
  }

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
