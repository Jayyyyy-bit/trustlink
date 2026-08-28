import { useState } from 'react';
import { useRouter } from 'expo-router';
import PostRequirement from '../features/post-requirement/PostRequirement';
import type {
  RequirementDetailsDraft,
  RequirementDeliveryDraft,
  RequirementClosingDraft,
} from '../features/post-requirement/PostRequirement';
import { mockPoster } from '../features/post-requirement/mock';
import type { PostRequirementState, Requirement } from '../lib/types';

export default function PostRequirementRoute() {
  const router = useRouter();
  const [step, setStep] = useState<PostRequirementState>('DETAILS');
  const [details, setDetails] = useState<RequirementDetailsDraft | null>(null);
  const [delivery, setDelivery] = useState<RequirementDeliveryDraft | null>(null);
  const [closing, setClosing] = useState<RequirementClosingDraft | null>(null);

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
      <PostRequirement
        state="REVIEW"
        poster={mockPoster}
        details={details}
        delivery={delivery}
        closing={closing}
        onBack={() => setStep('CLOSING')}
        onPublish={(input) => {
          // Matching, alerting, and ledger recording are server-side. This mock stands in
          // for that response — the reference below is a placeholder, never derived from
          // `input` on the device, the same way app/submit-quotation.tsx assembles a
          // placeholder Quotation from QuotationDraftInput on submit.
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
            deliverySite: {
              name: `${input.deliveryCity} delivery site`,
              address: input.deliveryAddress,
              accessHours: 'Not yet specified',
              accessNote: 'Add access hours and notes any time before closing.',
            },
            deliveryWindow: `${input.deliveryWindowFrom} — ${input.deliveryWindowTo}`,
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
          router.push({ pathname: '/requirement', params: { ref: requirement.ref } });
        }}
      />
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
