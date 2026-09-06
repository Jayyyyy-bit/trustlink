// features/onboarding/Onboarding.tsx
// One component, four states from OnboardingStep — same discriminated-union pattern as
// QuotationSubmission.tsx. IDENTITY / OPERATIONS / DOCUMENTS collect a business profile
// draft across three steps behind a shared shell: a header bar with the Trustlink mark and
// a three-segment progress indicator, a single centered form column (fields pair up at wide
// widths, stack on phone), and a fixed bottom bar carrying Back/Continue. Step changes slide
// horizontally (StepTransition) — forward exits left/enters from the right, Back reverses
// it. ARRIVAL is a confirmation, not a step — no shell, no progress indicator, no slide —
// shaped like the sealed quotation receipt: what was submitted, what happens next, and the
// way in.
//
// Rebuilt from docs/design/Trustlink Onboarding.dc.html, restructured to spec: city and
// province move into IDENTITY (they describe the business, not its operations), the
// welcome screen is cut, and ARRIVAL only ever renders PENDING VERIFICATION — OnboardingStep
// has no rejected / incomplete / correction variant, so this component doesn't invent one.
// Route (app/onboarding.tsx) owns the step machine and assembles the final `Business` from
// the collected drafts, the same way app/submit-quotation.tsx assembles `Quotation` from
// `QuotationDraftInput` on submit.

import { useRef, type ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { color, layout, space } from '../../components/ui/tokens';
import { BrandMark } from './components/BrandMark';
import { BottomBar } from './components/BottomBar';
import { StepTransition } from './components/StepTransition';
import { IdentityScreen } from './components/IdentityScreen';
import { OperationsScreen } from './components/OperationsScreen';
import { DocumentsScreen } from './components/DocumentsScreen';
import { ArrivalScreen } from './components/ArrivalScreen';
import { FORM_CONTENT_MAX_WIDTH } from './format';
import type { OnboardingProps } from './types';

export type {
  IdentityDraft,
  OperationsDraft,
  DocumentsDraft,
  OnboardingProps,
} from './types';

/* ─── Root component ─────────────────────────────────
 * Renders the persistent shell (header, scroll area, fixed bottom bar) once — it's the
 * same `Onboarding` instance across every step change, since app/onboarding.tsx always
 * renders this same component with a new `step` prop rather than swapping components. Only
 * StepTransition's children (the active screen's title + fields) get swapped and animated;
 * Continue's actual handler lives inside whichever screen is mounted, so it's exposed to
 * the persistent bottom bar via `reportContinue`, called during that screen's render to
 * keep a ref up to date — Back and the Continue label don't need this, since both are
 * derivable directly from `props` here. */

export default function Onboarding(props: OnboardingProps) {
  const continueRef = useRef<() => void>(() => {});
  const reportContinue = (fn: () => void) => {
    continueRef.current = fn;
  };

  if (props.step === 'ARRIVAL') {
    return <ArrivalScreen {...props} />;
  }

  let content: ReactNode;
  switch (props.step) {
    case 'IDENTITY':
      content = <IdentityScreen {...props} reportContinue={reportContinue} />;
      break;
    case 'OPERATIONS':
      content = <OperationsScreen {...props} reportContinue={reportContinue} />;
      break;
    case 'DOCUMENTS':
      content = <DocumentsScreen {...props} reportContinue={reportContinue} />;
      break;
  }

  const onBack = 'onBack' in props ? props.onBack : undefined;
  const continueLabel = props.step === 'DOCUMENTS' ? 'Submit for verification' : 'Continue';

  return (
    <View style={styles.root}>
      <View style={styles.shellHeader}>
        <BrandMark />
      </View>

      <ScrollView style={styles.shellScroll} contentContainerStyle={styles.shellScrollContent}>
        <View style={styles.shellInner}>
          <StepTransition step={props.step}>{content}</StepTransition>
        </View>
      </ScrollView>

      <BottomBar step={props.step} onBack={onBack} onContinue={() => continueRef.current()} continueLabel={continueLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },

  /* top header — mark + wordmark only, far left of the viewport. Full-width bar with a
   * bottom border, matching the fixed bottom bar's treatment (not capped to the form). */
  shellHeader: {
    width: '100%',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: space.lg,
    backgroundColor: color.canvas,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },

  /* scrollable form — capped narrower than the header/bottom bars so paired fields read
   * comfortably instead of stretching edge to edge. Generous paddingTop so the heading
   * doesn't sit flush against the header bar. */
  shellScroll: { flex: 1 },
  shellScrollContent: { alignItems: 'center' },
  shellInner: {
    width: '100%',
    maxWidth: FORM_CONTENT_MAX_WIDTH,
    paddingHorizontal: layout.screenPadding,
    paddingTop: space.xxxl,
    paddingBottom: space.xxxl,
  },
});
