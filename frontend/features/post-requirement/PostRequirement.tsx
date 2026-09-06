// features/post-requirement/PostRequirement.tsx
// One component, four steps from PostRequirementState — DETAILS, DELIVERY, CLOSING, REVIEW.
// Each step is a self-contained screen owning its own local draft state (seeded from
// `initial`, reported upward on Continue), the same way Onboarding.tsx's IdentityScreen /
// OperationsScreen / DocumentsScreen each own their draft and call the shared
// `reportContinue` — the route (app/post-requirement.tsx) accumulates the three collected
// drafts step by step, exactly like Onboarding's route accumulates IdentityDraft /
// OperationsDraft / DocumentsDraft. Going back never clears a later step's saved draft, so
// re-entering a step always re-seeds from what was last entered.
//
// Shell (persistent header bar, fixed bottom bar, sliding StepTransition, reportContinue
// wiring the active screen's validated action to the bottom bar's primary button, the
// segmented step indicator) reuses the exact structure and style values from
// features/onboarding/Onboarding.tsx — same shellHeader/shellScroll/shellInner/bottomBar
// treatment, same StepTransition slide+cross-fade mechanic, same FormSection/FormDivider
// field-grouping idiom instead of nested cards. STEP_ORDER now carries all four
// PostRequirementState members; there is no separate local step type.
//
// REVIEW is a read-only summary (What you need / Where and when / Closing) plus a sealed-
// quotations explanation and the existing "Before you publish" lock list — not a mock of
// the respondent-facing page.
//
// Locking rule: what stops being editable on publish (scope and specifications, quantity,
// indicative budget, closing date and time) matches RequirementDetail.tsx's OWNER_SEALED
// EditabilityList verbatim — that component is the established ground truth for what locks.

import { useRef } from 'react';
import type { ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { color, layout, space } from '../../components/ui/tokens';
import type { Business, Attachment, ISODateTime, SpecRow, PostRequirementState } from '../../lib/types';

import { ShellHeader } from './components/ShellHeader';
import { BottomBar } from './components/BottomBar';
import { StepTransition } from './components/StepTransition';
import { DetailsScreen } from './components/DetailsScreen';
import { DeliveryScreen } from './components/DeliveryScreen';
import { ClosingScreen } from './components/ClosingScreen';
import { ReviewScreen } from './components/ReviewScreen';

/* ─── Draft shapes ───────────────────────────────────────
 * One draft per step, assembled into a real `Requirement` by the route only once REVIEW
 * publishes — the same shape Onboarding's IdentityDraft/OperationsDraft/DocumentsDraft are
 * assembled into a `Business` only once DOCUMENTS submits. */

export interface RequirementDetailsDraft {
  category: string;
  title: string;
  scope: string;
  specifications: SpecRow[];
  quantity: string;
  budgetMin: number | null;
  budgetMax: number | null;
}

export interface RequirementDeliveryDraft {
  city: string;
  address: string;
  windowFrom: string; // "YYYY-MM-DD"
  windowTo: string;   // "YYYY-MM-DD"
  attachments: Attachment[];
}

export interface RequirementClosingDraft {
  closeDate: string; // "YYYY-MM-DD"
  closeTime: string; // one of TIME_OPTIONS' values
}

/** The three step drafts combined into what the route needs to assemble a `Requirement`. */
export interface RequirementDraftInput {
  category: string;
  title: string;
  scope: string;
  specifications: SpecRow[];
  quantity: string;
  budgetMin: number | null;
  budgetMax: number | null;
  deliveryCity: string;
  deliveryAddress: string;
  deliveryWindowFrom: string;
  deliveryWindowTo: string;
  attachments: Attachment[];
  closingAt: ISODateTime;
}

export interface DetailsProps {
  state: Extract<PostRequirementState, 'DETAILS'>;
  poster: Business;
  initial?: Partial<RequirementDetailsDraft>;
  onContinue: (draft: RequirementDetailsDraft) => void;
}

export interface DeliveryProps {
  state: Extract<PostRequirementState, 'DELIVERY'>;
  poster: Business;
  details: RequirementDetailsDraft;
  initial?: Partial<RequirementDeliveryDraft>;
  onContinue: (draft: RequirementDeliveryDraft) => void;
  onBack: () => void;
}

export interface ClosingProps {
  state: Extract<PostRequirementState, 'CLOSING'>;
  poster: Business;
  details: RequirementDetailsDraft;
  delivery: RequirementDeliveryDraft;
  initial?: Partial<RequirementClosingDraft>;
  onContinue: (draft: RequirementClosingDraft) => void;
  onBack: () => void;
}

export interface ReviewProps {
  state: Extract<PostRequirementState, 'REVIEW'>;
  poster: Business;
  details: RequirementDetailsDraft;
  delivery: RequirementDeliveryDraft;
  closing: RequirementClosingDraft;
  onBack: () => void;
  onPublish: (draft: RequirementDraftInput) => void;
}

export type PostRequirementProps = DetailsProps | DeliveryProps | ClosingProps | ReviewProps;

/** Caps the scrollable step column — same value Onboarding.tsx's shellInner uses. */
const FORM_CONTENT_MAX_WIDTH = 680;

/* ─── Root component ─────────────────────────────────
 * Same shape as Onboarding's root: renders the persistent shell (header, scroll area,
 * fixed bottom bar) once — the same `PostRequirement` instance across every step change,
 * since the route always renders this same component with a new `state` prop rather than
 * swapping components. Only StepTransition's children (the active step's fields) get
 * swapped and animated; the primary action's actual handler lives inside whichever screen
 * is mounted, exposed to the persistent bottom bar via `reportContinue`. */

export default function PostRequirement(props: PostRequirementProps) {
  const primaryRef = useRef<() => void>(() => {});
  // StepTransition keeps the departing screen mounted briefly as a "ghost" for its slide-
  // out animation (see StepTransition above). That ghost is a fresh mount of the same
  // screen component, so it re-runs reportContinue(handleContinue) too — with stale props
  // and reset local state — which would otherwise clobber primaryRef right after the real
  // incoming screen registered itself correctly. currentStepRef always holds the true
  // current step (set synchronously at the top of every real render, before the ghost's
  // effect-deferred mount can fire), so a ghost's registration — captured for a step that
  // no longer matches — is ignored instead of overwriting the live handler.
  const currentStepRef = useRef<PostRequirementState>(props.state);
  currentStepRef.current = props.state;

  const makeReportContinue = (step: PostRequirementState) => (fn: () => void) => {
    if (currentStepRef.current === step) {
      primaryRef.current = fn;
    }
  };

  let content: ReactNode;
  let leftLabel = '';
  let onLeft: (() => void) | undefined;
  let primaryLabel: string;
  let onExit: (() => void) | undefined;

  switch (props.state) {
    case 'DETAILS':
      content = <DetailsScreen {...props} reportContinue={makeReportContinue('DETAILS')} />;
      primaryLabel = 'Continue';
      break;
    case 'DELIVERY':
      content = <DeliveryScreen {...props} reportContinue={makeReportContinue('DELIVERY')} />;
      leftLabel = 'Back';
      onLeft = props.onBack;
      primaryLabel = 'Continue';
      break;
    case 'CLOSING':
      content = <ClosingScreen {...props} reportContinue={makeReportContinue('CLOSING')} />;
      leftLabel = 'Back';
      onLeft = props.onBack;
      primaryLabel = 'Review requirement';
      break;
    case 'REVIEW':
      content = <ReviewScreen {...props} reportContinue={makeReportContinue('REVIEW')} />;
      leftLabel = 'Back to edit';
      onLeft = props.onBack;
      primaryLabel = 'Publish requirement';
      onExit = props.onBack;
      break;
  }

  return (
    <View style={styles.root}>
      <ShellHeader step={props.state} onExit={onExit} />
      <ScrollView style={styles.shellScroll} contentContainerStyle={styles.shellScrollContent}>
        <View style={styles.shellInner}>
          <StepTransition step={props.state}>{content}</StepTransition>
        </View>
      </ScrollView>
      <BottomBar
        step={props.state}
        onLeft={onLeft}
        leftLabel={leftLabel}
        onPrimary={() => primaryRef.current()}
        primaryLabel={primaryLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  shellScroll: { flex: 1 },
  shellScrollContent: { alignItems: 'center' },
  shellInner: { width: '100%', maxWidth: FORM_CONTENT_MAX_WIDTH, paddingHorizontal: layout.screenPadding, paddingTop: space.xxxl, paddingBottom: space.xxxl },
});
