import { useState } from 'react';
import { useRouter } from 'expo-router';
import Onboarding from '../features/onboarding/Onboarding';
import type { IdentityDraft, OperationsDraft, DocumentsDraft } from '../features/onboarding/Onboarding';
import type { Business, OnboardingStep } from '../lib/types';

export default function OnboardingRoute() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('IDENTITY');
  const [identity, setIdentity] = useState<IdentityDraft | null>(null);
  const [operations, setOperations] = useState<OperationsDraft | null>(null);
  const [documents, setDocuments] = useState<DocumentsDraft | null>(null);

  if (step === 'OPERATIONS' && identity) {
    return (
      <Onboarding
        step="OPERATIONS"
        identity={identity}
        initial={operations ?? undefined}
        onContinue={(draft) => {
          setOperations(draft);
          setStep('DOCUMENTS');
        }}
        onBack={() => setStep('IDENTITY')}
      />
    );
  }

  if (step === 'DOCUMENTS' && identity && operations) {
    return (
      <Onboarding
        step="DOCUMENTS"
        identity={identity}
        operations={operations}
        onSubmit={(draft) => {
          setDocuments(draft);
          setStep('ARRIVAL');
        }}
        onBack={() => setStep('OPERATIONS')}
      />
    );
  }

  if (step === 'ARRIVAL' && identity && operations && documents) {
    // Hashing, verification, and persistence are server-side. This mock stands in for that
    // response — the assembled Business is a placeholder, the same way app/submit-quotation.tsx
    // builds a placeholder Quotation from QuotationDraftInput on submit.
    const business: Business = {
      id: 'biz-pending',
      registeredName: identity.registeredName,
      displayName: null,
      businessType: identity.businessType,
      category: identity.category,
      city: identity.city,
      province: identity.province,
      contactPerson: identity.contactPerson,
      contactMobile: identity.contactMobile,
      capabilities: operations.capabilities,
      serviceAreas: operations.serviceAreas,
      credibility: {
        status: 'PENDING',
        verifiedAt: null,
        recheckDueAt: null,
        tier: null,
        requirementsPosted: 0,
        requirementsAwarded: 0,
        quotationsSubmitted: 0,
        quotationsAwarded: 0,
      },
      profileCompletionPct: 100,
      memberSinceYear: new Date().getFullYear(),
    };
    return <Onboarding step="ARRIVAL" business={business} documents={documents} onEnterApp={() => router.replace('/home')} />;
  }

  return (
    <Onboarding
      step="IDENTITY"
      initial={identity ?? undefined}
      onContinue={(draft) => {
        setIdentity(draft);
        setStep('OPERATIONS');
      }}
    />
  );
}
