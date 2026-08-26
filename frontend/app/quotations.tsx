import { useState } from 'react';
import { useRouter } from 'expo-router';
import MyQuotations from '../features/my-quotations/MyQuotations';
import { mockQuotations, mockRequirements, mockBuyers } from '../features/my-quotations/mock';
import type { Quotation } from '../lib/types';

export default function MyQuotationsRoute() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);

  return (
    <MyQuotations
      quotations={quotations}
      requirements={mockRequirements}
      buyers={mockBuyers}
      onBack={() => router.back()}
      onOpenRequirement={() => router.push('/requirement')}
      onResubmit={() => router.push('/submit-quotation')}
      onWithdraw={(quotationId) => {
        // Ledger recording is server-side. This mock stands in for that response — it
        // only flips local state so the withdrawn row moves group immediately.
        const withdrawnAt = new Date().toISOString();
        setQuotations((prev) =>
          prev.map((q) => (q.id === quotationId ? { ...q, status: 'WITHDRAWN', withdrawnAt } : q)),
        );
      }}
    />
  );
}
