import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { space } from '../components/ui/tokens';
import { ErrorState } from '../components/ui/ErrorState';
import Onboarding from '../features/onboarding/Onboarding';
import type { IdentityDraft, OperationsDraft, DocumentsDraft } from '../features/onboarding/Onboarding';
import { USE_MOCK_DATA } from '../lib/api/flags';
import { ApiError } from '../lib/api/client';
import { createBusiness } from '../lib/api/businesses';
import type { Business, OnboardingStep } from '../lib/types';

export default function OnboardingRoute() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('IDENTITY');
  const [identity, setIdentity] = useState<IdentityDraft | null>(null);
  const [operations, setOperations] = useState<OperationsDraft | null>(null);
  const [documents, setDocuments] = useState<DocumentsDraft | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitting = useRef(false);

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
      <View style={{ flex: 1 }}>
        <Onboarding
          step="DOCUMENTS"
          identity={identity}
          operations={operations}
          onSubmit={async (draft) => {
            if (submitting.current) return;
            submitting.current = true;
            setSubmitError(null);

            if (USE_MOCK_DATA) {
              // Hashing, verification, and persistence are server-side. This mock stands in
              // for that response — the assembled Business is a placeholder.
              setBusiness({
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
              });
              setDocuments(draft);
              setStep('ARRIVAL');
              submitting.current = false;
              return;
            }

            try {
              const created = await createBusiness({
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
              });
              setBusiness(created);
              setDocuments(draft);
              setStep('ARRIVAL');
            } catch (err) {
              setSubmitError(
                err instanceof ApiError ? err.message : 'Could not submit your business for verification. Try again.',
              );
            } finally {
              submitting.current = false;
            }
          }}
          onBack={() => setStep('OPERATIONS')}
        />
        {submitError && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: space.lg, zIndex: 10 }}>
            <ErrorState message={submitError} />
          </View>
        )}
      </View>
    );
  }

  if (step === 'ARRIVAL' && business && documents) {
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
