import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { space } from '../components/ui/tokens';
import { ErrorState } from '../components/ui/ErrorState';
import PostRequirement from '../features/post-requirement/PostRequirement';
import type {
  RequirementDetailsDraft,
  RequirementDeliveryDraft,
  RequirementClosingDraft,
} from '../features/post-requirement/PostRequirement';
import { mockPoster } from '../features/post-requirement/mock';
import { USE_MOCK_DATA } from '../lib/api/flags';
import { ApiError } from '../lib/api/client';
import { createRequirement } from '../lib/api/requirements';
import type { PostRequirementState, Requirement } from '../lib/types';

export default function PostRequirementRoute() {
  const router = useRouter();
  const [step, setStep] = useState<PostRequirementState>('DETAILS');
  const [details, setDetails] = useState<RequirementDetailsDraft | null>(null);
  const [delivery, setDelivery] = useState<RequirementDeliveryDraft | null>(null);
  const [closing, setClosing] = useState<RequirementClosingDraft | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const publishing = useRef(false);

  if (step === 'DELIVERY' && details) {
    return (
      <PostRequirement
        state="DELIVERY"
        poster={mockPoster}
        details={details}
        initial={delivery ?? undefined}
        onContinue={(draft) => {
          setDelivery(draft);
          setStep('CLOSING');
        }}
        onBack={() => setStep('DETAILS')}
      />
    );
  }

  if (step === 'CLOSING' && details && delivery) {
    return (
      <PostRequirement
        state="CLOSING"
        poster={mockPoster}
        details={details}
        delivery={delivery}
        initial={closing ?? undefined}
        onContinue={(draft) => {
          setClosing(draft);
          setStep('REVIEW');
        }}
        onBack={() => setStep('DELIVERY')}
      />
    );
  }

  if (step === 'REVIEW' && details && delivery && closing) {
    return (
      <View style={{ flex: 1 }}>
        <PostRequirement
          state="REVIEW"
          poster={mockPoster}
          details={details}
          delivery={delivery}
          closing={closing}
          onBack={() => setStep('CLOSING')}
          onPublish={async (input) => {
            if (publishing.current) return;
            publishing.current = true;
            setPublishError(null);

            const deliverySite = {
              name: `${input.deliveryCity} delivery site`,
              address: input.deliveryAddress,
              accessHours: 'Not yet specified',
              accessNote: 'Add access hours and notes any time before closing.',
            };
            const deliveryWindow = `${input.deliveryWindowFrom} — ${input.deliveryWindowTo}`;

            if (USE_MOCK_DATA) {
              // Matching, alerting, and ledger recording are server-side. This mock stands in
              // for that response — the reference below is a placeholder, never derived from
              // `input` on the device.
              const requirement: Requirement = {
                id: 'req-new',
                ref: 'RQ-2026-0001',
                buyerId: mockPoster.id,
                status: 'OPEN',
                category: input.category,
                title: input.title,
                scope: input.scope,
                specifications: input.specifications,
                quantity: input.quantity,
                budgetMin: input.budgetMin,
                budgetMax: input.budgetMax,
                deliverySite,
                deliveryWindow,
                attachments: input.attachments,
                closingAt: input.closingAt,
                publishedAt: new Date().toISOString(),
                quotationCount: 0,
                lastQuotationAt: null,
                awardedQuotationId: null,
              };
              setDetails(null);
              setDelivery(null);
              setClosing(null);
              setStep('DETAILS');
              publishing.current = false;
              router.push({ pathname: '/requirement', params: { ref: requirement.ref } });
              return;
            }

            try {
              const requirement = await createRequirement({
                category: input.category,
                title: input.title,
                scope: input.scope,
                specifications: input.specifications,
                quantity: input.quantity,
                budgetMin: input.budgetMin,
                budgetMax: input.budgetMax,
                deliverySite,
                deliveryWindow,
                attachments: input.attachments,
                closingAt: input.closingAt,
              });
              setDetails(null);
              setDelivery(null);
              setClosing(null);
              setStep('DETAILS');
              router.push({ pathname: '/requirement', params: { ref: requirement.ref, dev: 'sealed' } });
            } catch (err) {
              setPublishError(err instanceof ApiError ? err.message : 'Could not publish this requirement. Try again.');
            } finally {
              publishing.current = false;
            }
          }}
        />
        {publishError && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: space.lg, zIndex: 10 }}>
            <ErrorState message={publishError} />
          </View>
        )}
      </View>
    );
  }

  return (
    <PostRequirement
      state="DETAILS"
      poster={mockPoster}
      initial={details ?? undefined}
      onContinue={(draft) => {
        setDetails(draft);
        setStep('DELIVERY');
      }}
    />
  );
}
