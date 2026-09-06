// features/onboarding/types.ts
// Draft shapes and step-prop types, split out of Onboarding.tsx so component files can
// import them without pulling in the root component. Re-exported from Onboarding.tsx so
// external imports (app/onboarding.tsx) don't need to change.

import type { Business, BusinessType, SignupIntent, OnboardingStep, Attachment } from '../../lib/types';

/* Local to onboarding — not shared types. Assembled into a real `Business` by the route
 * only once verification documents are submitted, mirroring QuotationDraftInput. */

export interface IdentityDraft {
  signupIntent: SignupIntent;
  registeredName: string;
  businessType: BusinessType;
  category: string;
  city: string;
  province: string;
  contactPerson: string;
  contactMobile: string;
}

export interface OperationsDraft {
  capabilities: string[];
  serviceAreas: string[];
}

export interface DocumentsDraft {
  /** DTI certificate for a sole proprietorship, SEC certificate otherwise. */
  registrationDoc: Attachment | null;
  birDoc: Attachment | null;
  /** Optional — not needed to get verified, relevant only for reaching Tier 3 sooner. */
  mayorsPermit: Attachment | null;
}

export interface IdentityProps {
  step: Extract<OnboardingStep, 'IDENTITY'>;
  initial?: Partial<IdentityDraft>;
  onContinue: (draft: IdentityDraft) => void;
}

export interface OperationsProps {
  step: Extract<OnboardingStep, 'OPERATIONS'>;
  identity: IdentityDraft;
  initial?: Partial<OperationsDraft>;
  onContinue: (draft: OperationsDraft) => void;
  onBack: () => void;
}

export interface DocumentsProps {
  step: Extract<OnboardingStep, 'DOCUMENTS'>;
  identity: IdentityDraft;
  operations: OperationsDraft;
  onSubmit: (draft: DocumentsDraft) => void;
  onBack: () => void;
}

export interface ArrivalProps {
  step: Extract<OnboardingStep, 'ARRIVAL'>;
  business: Business;
  documents: DocumentsDraft;
  onEnterApp: () => void;
}

export type OnboardingProps = IdentityProps | OperationsProps | DocumentsProps | ArrivalProps;

export type FormStep = Extract<OnboardingStep, 'IDENTITY' | 'OPERATIONS' | 'DOCUMENTS'>;

export interface ArrivalTimelineStep {
  title: string;
  when: string;
  body: string;
  done: boolean;
}
