import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QuotationSubmission from '../features/quotation/QuotationSubmission';
import type { QuotationDraftInput } from '../features/quotation/QuotationSubmission';
import {
  mockRequirement,
  mockBuyer,
  mockRespondentId,
  mockSubmittedQuotation,
  mockLedgerEntry,
} from '../features/quotation/mock';
import type { Quotation, LedgerEntry } from '../lib/types';

export default function QuotationRoute() {
  const { dev } = useLocalSearchParams<{ dev?: string }>();
  const router = useRouter();

  const [submission, setSubmission] = useState<{ quotation: Quotation; ledgerEntry: LedgerEntry } | null>(
    dev === 'sealed' ? { quotation: mockSubmittedQuotation, ledgerEntry: mockLedgerEntry } : null,
  );

  if (submission) {
    return (
      <QuotationSubmission
        state="SEALED_RECEIPT"
        requirement={mockRequirement}
        buyer={mockBuyer}
        quotation={submission.quotation}
        ledgerEntry={submission.ledgerEntry}
        onWithdraw={() => setSubmission(null)}
        onBack={() => router.back()}
        onTrack={() => {}}
      />
    );
  }

  return (
    <QuotationSubmission
      state="FORM"
      requirement={mockRequirement}
      buyer={mockBuyer}
      onBack={() => router.back()}
      onSubmit={(input: QuotationDraftInput) => {
        // Hashing and ledger recording happen server-side. This mock stands in for that
        // response — the reference, hash, and ledger sequence below are fixed placeholders,
        // never derived from `input` on the device.
        const submittedAt = new Date().toISOString();
        const quotation: Quotation = {
          id: 'q-own',
          ref: 'QT-2026-0511',
          requirementId: mockRequirement.id,
          respondentId: mockRespondentId,
          status: 'SUBMITTED',
          totalPrice: input.totalPrice,
          leadTimeDays: input.leadTimeDays,
          paymentTerms: input.paymentTerms,
          validityDays: input.validityDays,
          notesToBuyer: input.notesToBuyer,
          attachments: input.attachments,
          submittedAt,
          hashTruncated: 'e214f7a2',
          ledgerEntryId: 'led-49102',
          integrity: null,
          withdrawnAt: null,
          replacedByQuotationId: null,
        };
        const ledgerEntry: LedgerEntry = {
          id: 'led-49102',
          sequence: 49102,
          type: 'QUOTATION_SUBMITTED',
          subjectId: quotation.id,
          hash: 'e214f7a2c9b031de56a8f0c37b12de44',
          previousHash: mockLedgerEntry.hash,
          createdAt: submittedAt,
        };
        setSubmission({ quotation, ledgerEntry });
      }}
    />
  );
}
