import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { color, space } from '../components/ui/tokens';
import { ErrorState } from '../components/ui/ErrorState';
import MyQuotations from '../features/my-quotations/MyQuotations';
import { MyQuotationsSkeleton } from '../features/my-quotations/MyQuotationsSkeleton';
import { mockQuotations, mockRequirements, mockBuyers } from '../features/my-quotations/mock';
import { USE_MOCK_DATA } from '../lib/api/flags';
import { ApiError } from '../lib/api/client';
import { getMyQuotations, withdrawQuotation, type MyQuotationsData } from '../lib/api/quotations';
import type { Quotation } from '../lib/types';

export default function MyQuotationsRoute() {
  const router = useRouter();
  const [data, setData] = useState<MyQuotationsData | null>(
    USE_MOCK_DATA ? { quotations: mockQuotations, requirements: mockRequirements, buyers: mockBuyers, ledgerEntries: {} } : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    if (USE_MOCK_DATA) return;
    setError(null);
    try {
      setData(await getMyQuotations());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your quotations.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas, padding: space.lg }}>
        <ErrorState message={error} onRetry={() => setReloadToken((n) => n + 1)} />
      </View>
    );
  }

  if (!data) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: color.canvas }}>
        <MyQuotationsSkeleton />
      </ScrollView>
    );
  }

  return (
    <MyQuotations
      quotations={data.quotations}
      requirements={data.requirements}
      buyers={data.buyers}
      onBack={() => router.back()}
      onOpenRequirement={(requirementId) => {
        const ref = data.requirements[requirementId]?.ref;
        if (ref) router.push({ pathname: '/requirement', params: { ref } });
      }}
      onResubmit={(requirementId) => {
        const ref = data.requirements[requirementId]?.ref;
        if (ref) router.push({ pathname: '/submit-quotation', params: { ref } });
      }}
      onWithdraw={async (quotationId) => {
        if (USE_MOCK_DATA) {
          const withdrawnAt = new Date().toISOString();
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  quotations: prev.quotations.map((q: Quotation) =>
                    q.id === quotationId ? { ...q, status: 'WITHDRAWN', withdrawnAt } : q,
                  ),
                }
              : prev,
          );
          return;
        }
        const target = data.quotations.find((q) => q.id === quotationId);
        if (!target) return;
        try {
          await withdrawQuotation(target.ref);
          setReloadToken((n) => n + 1);
        } catch (err) {
          setError(err instanceof ApiError ? err.message : 'Could not withdraw this quotation.');
        }
      }}
    />
  );
}
