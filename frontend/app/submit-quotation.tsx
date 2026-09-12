import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { color, space } from '../components/ui/tokens';
import { ErrorState } from '../components/ui/ErrorState';
import QuotationSubmission from '../features/quotation/QuotationSubmission';
import type { QuotationDraftInput } from '../features/quotation/QuotationSubmission';
import { QuotationSubmissionSkeleton } from '../features/quotation/QuotationSubmissionSkeleton';
import {
  mockRequirement,
  mockBuyer,
  mockSubmittedQuotation,
  mockLedgerEntry,
} from '../features/quotation/mock';
import { USE_MOCK_DATA } from '../lib/api/flags';
import { ApiError } from '../lib/api/client';
import { getRequirement } from '../lib/api/requirements';
import { getBusiness } from '../lib/api/businesses';
import { submitQuotation, withdrawQuotation } from '../lib/api/quotations';
import type { Business, LedgerEntry, Quotation, Requirement } from '../lib/types';

export default function QuotationRoute() {
  const { dev, ref } = useLocalSearchParams<{ dev?: string; ref?: string }>();
  const router = useRouter();

  const [context, setContext] = useState<{ requirement: Requirement; buyer: Business } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [submission, setSubmission] = useState<{ quotation: Quotation; ledgerEntry: LedgerEntry } | null>(
    USE_MOCK_DATA && dev === 'sealed' ? { quotation: mockSubmittedQuotation, ledgerEntry: mockLedgerEntry } : null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (USE_MOCK_DATA || !ref) return;
    setError(null);
    setContext(null);
    try {
      const requirement = await getRequirement(ref);
      const buyer = await getBusiness(requirement.buyerId);
      setContext({ requirement, buyer });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this requirement.');
    }
  }, [ref]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  if (!USE_MOCK_DATA) {
    if (submission && context) {
      return (
        <QuotationSubmission
          state="SEALED_RECEIPT"
          requirement={context.requirement}
          buyer={context.buyer}
          quotation={submission.quotation}
          ledgerEntry={submission.ledgerEntry}
          onBack={() => router.back()}
          onTrack={() => router.push('/quotations')}
          onWithdraw={async () => {
            try {
              await withdrawQuotation(submission.quotation.ref);
            } finally {
              setSubmission(null);
            }
          }}
        />
      );
    }

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

    if (!context) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: color.canvas }}>
          <QuotationSubmissionSkeleton />
        </ScrollView>
      );
    }

    return (
      <>
        <QuotationSubmission
          state="FORM"
          requirement={context.requirement}
          buyer={context.buyer}
          onBack={() => router.back()}
          onOpenBuyer={(businessId) => router.push({ pathname: '/business', params: { id: businessId } })}
          onSubmit={async (input: QuotationDraftInput) => {
            setSubmitError(null);
            try {
              // Hashing and ledger recording happen server-side — this is exactly, and only,
              // what the server returned. Never computed or guessed on the device.
              const receipt = await submitQuotation({ requirementRef: context.requirement.ref, ...input });
              const quotation: Quotation = {
                id: receipt.ref,
                ref: receipt.ref,
                requirementId: context.requirement.id,
                respondentId: '',
                status: 'SUBMITTED',
                totalPrice: input.totalPrice,
                leadTimeDays: input.leadTimeDays,
                paymentTerms: input.paymentTerms,
                validityDays: input.validityDays,
                notesToBuyer: input.notesToBuyer,
                attachments: input.attachments,
                submittedAt: receipt.submittedAt,
                hashTruncated: receipt.hashTruncated,
                ledgerEntryId: '',
                integrity: null,
                withdrawnAt: null,
                replacedByQuotationId: null,
              };
              const ledgerEntry: LedgerEntry = {
                id: receipt.ref,
                sequence: receipt.sequence,
                type: 'QUOTATION_SUBMITTED',
                subjectId: receipt.ref,
                hash: receipt.hashTruncated,
                previousHash: null,
                createdAt: receipt.submittedAt,
              };
              setSubmission({ quotation, ledgerEntry });
            } catch (err) {
              setSubmitError(err instanceof ApiError ? err.message : 'Could not submit your quotation. Try again.');
            }
          }}
        />
        {submitError && (
          <View style={{ padding: space.lg, backgroundColor: color.canvas }}>
            <ErrorState message={submitError} />
          </View>
        )}
      </>
    );
  }

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
      onOpenBuyer={() => router.push('/business')}
      onSubmit={(input: QuotationDraftInput) => {
        // Hashing and ledger recording happen server-side. This mock stands in for that
        // response — the reference, hash, and ledger sequence below are fixed placeholders,
        // never derived from `input` on the device.
        const submittedAt = new Date().toISOString();
        const quotation: Quotation = {
          id: 'q-own',
          ref: 'QT-2026-0511',
          requirementId: mockRequirement.id,
          respondentId: 'biz-santiago',
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
