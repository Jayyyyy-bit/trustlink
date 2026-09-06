// features/quotation/QuotationSubmission.tsx
// One component, two states, driven entirely by props — same pattern as
// RequirementDetail.tsx. FORM is the pricing form with the requirement's scope pinned
// beside it; SEALED_RECEIPT is the full-screen teaching moment after sealing, not a toast.
// Rebuilt from docs/design/Trustlink Quotation Submission.dc.html: same sections, same
// order, same sealing language.
//
// Hashing and ledger recording are server-side. This component only ever displays
// `quotation.hashTruncated` / `ledgerEntry.sequence` as given by props — it never derives
// or recomputes a hash on the device.

import { StyleSheet, ScrollView, View, Platform, useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import { color, space, layout, breakpoint } from '../../components/ui/tokens';
import type {
  Business,
  BusinessId,
  Requirement,
  Quotation,
  LedgerEntry,
  Attachment,
  QuotationSubmissionState,
} from '../../lib/types';
import { useQuotationForm } from './useQuotationForm';
import { Breadcrumb } from './components/Breadcrumb';
import { TitleBlock } from './components/TitleBlock';
import { ScopeSidebarCard } from './components/ScopeSidebarCard';
import { ClosingBanner } from './components/ClosingBanner';
import { PriceSection } from './components/PriceSection';
import { TermsSection } from './components/TermsSection';
import { NotesAttachmentsSection } from './components/NotesAttachmentsSection';
import { SealSection } from './components/SealSection';
import { ReceiptHero } from './components/ReceiptHero';
import { ReceiptCard } from './components/ReceiptCard';
import { WhySafeCard } from './components/WhySafeCard';
import { TimelineCard } from './components/TimelineCard';
import { ReceiptActions } from './components/ReceiptActions';

/* ─── Props ─────────────────────────────────────────── */

/** What the respondent enters. Everything else on Quotation (ref, hash, ledger entry,
 *  submittedAt, integrity…) is assigned server-side once this is submitted. */
export interface QuotationDraftInput {
  totalPrice: number;
  leadTimeDays: number;
  paymentTerms: string;
  validityDays: number;
  notesToBuyer: string;
  attachments: Attachment[];
}

interface FormProps {
  state: Extract<QuotationSubmissionState, 'FORM'>;
  requirement: Requirement;
  buyer: Business;
  onSubmit?: (input: QuotationDraftInput) => void;
  onSaveDraft?: () => void;
  onBack?: () => void;
  onOpenBuyer?: (businessId: BusinessId) => void;
}

interface SealedReceiptProps {
  state: Extract<QuotationSubmissionState, 'SEALED_RECEIPT'>;
  requirement: Requirement;
  buyer: Business;
  quotation: Quotation;
  ledgerEntry: LedgerEntry;
  onWithdraw?: () => void;
  onBack?: () => void;
  onTrack?: () => void;
}

export type QuotationSubmissionProps = FormProps | SealedReceiptProps;

const RECEIPT_MAX_WIDTH = 880;

/* ─── FORM: layout ──────────────────────────────────── */

const stickyOnWeb: ViewStyle =
  Platform.OS === 'web' ? ({ position: 'sticky', top: space.xxl } as unknown as ViewStyle) : {};

function FormScreen(props: FormProps) {
  const { requirement, buyer } = props;
  const st = useQuotationForm(requirement, props.onSubmit);
  const { width } = useWindowDimensions();
  const isWide = width >= breakpoint.desktop;

  const sections = (
    <>
      <ClosingBanner requirement={requirement} />
      <PriceSection requirement={requirement} st={st} />
      <TermsSection requirement={requirement} st={st} />
      <NotesAttachmentsSection st={st} isWide={isWide} />
      <SealSection requirement={requirement} st={st} onSaveDraft={props.onSaveDraft} />
    </>
  );

  if (!isWide) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <Breadcrumb requirement={requirement} onBack={props.onBack} />
          <TitleBlock requirement={requirement} buyer={buyer} />
          <ScopeSidebarCard requirement={requirement} buyer={buyer} onOpenBuyer={props.onOpenBuyer} />
          <View style={{ gap: space.lg }}>{sections}</View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <View style={styles.pageWide}>
        <Breadcrumb requirement={requirement} onBack={props.onBack} />
        <TitleBlock requirement={requirement} buyer={buyer} />
        <View style={styles.columnsWide}>
          <View style={styles.mainColumn}>{sections}</View>
          <View style={[styles.sideColumn, stickyOnWeb]}>
            <ScopeSidebarCard requirement={requirement} buyer={buyer} onOpenBuyer={props.onOpenBuyer} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* ─── SEALED_RECEIPT ────────────────────────────────── */

function ReceiptScreen(props: SealedReceiptProps) {
  const { requirement, buyer, quotation, ledgerEntry } = props;
  const canWithdraw = quotation.status === 'SUBMITTED';
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <View style={styles.receiptPage}>
        <ReceiptHero requirement={requirement} buyer={buyer} />
        <ReceiptCard requirement={requirement} quotation={quotation} ledgerEntry={ledgerEntry} />
        <WhySafeCard />
        <TimelineCard requirement={requirement} quotation={quotation} />
        <ReceiptActions onTrack={props.onTrack} onBack={props.onBack} onWithdraw={props.onWithdraw} canWithdraw={canWithdraw} />
      </View>
    </ScrollView>
  );
}

/* ─── Root component ────────────────────────────────── */

export default function QuotationSubmission(props: QuotationSubmissionProps) {
  if (props.state === 'SEALED_RECEIPT') {
    return <ReceiptScreen {...props} />;
  }
  return <FormScreen {...props} />;
}

/* ─── Styles ─────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  scrollContent: { alignItems: 'center', paddingVertical: space.lg },

  page: { width: '100%', maxWidth: layout.maxWidth, paddingHorizontal: layout.screenPadding, gap: space.md },
  pageWide: { width: '100%', maxWidth: layout.maxWidthDashboard, paddingHorizontal: layout.screenPadding, gap: space.md },
  receiptPage: { width: '100%', maxWidth: RECEIPT_MAX_WIDTH, paddingHorizontal: layout.screenPadding, gap: space.lg },

  columnsWide: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xl },
  mainColumn: { flex: 3, gap: space.md },
  sideColumn: { flex: 1, minWidth: layout.sideColumnMinWidth, gap: space.md },
});
