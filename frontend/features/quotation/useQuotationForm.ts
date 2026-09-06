// features/quotation/useQuotationForm.ts
// FORM local draft state — the respondent's in-progress quotation before sealing.

import { useState } from 'react';
import type { Attachment, Requirement } from '../../lib/types';
import type { QuotationDraftInput } from './QuotationSubmission';
import { formatBudget, num } from './format';

export type PriceMode = 'LINES' | 'TOTAL';
export interface LineItemDraft {
  id: string;
  desc: string;
  qty: string;
  unit: string;
}

export const VALIDITY_OPTIONS = [15, 30, 60, 90];
export const PAYMENT_TERM_OPTIONS = ['50 / 50', '30 / 60 / 10', '20 / 70 / 10', '100% on completion'];

export function useQuotationForm(requirement: Requirement, onSubmit?: (input: QuotationDraftInput) => void) {
  const [priceMode, setPriceMode] = useState<PriceMode>('LINES');
  const [items, setItems] = useState<LineItemDraft[]>([]);
  const [totalOnly, setTotalOnly] = useState('');
  const [lead, setLead] = useState('6');
  const [validity, setValidity] = useState(30);
  const [term, setTerm] = useState(PAYMENT_TERM_OPTIONS[1]);
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);

  const total =
    priceMode === 'LINES' ? items.reduce((a, i) => a + num(i.qty) * num(i.unit), 0) : num(totalOnly);

  const hasBudget = requirement.budgetMin !== null || requirement.budgetMax !== null;
  const overBudget = requirement.budgetMax !== null && total > requirement.budgetMax;
  const budgetNote =
    total === 0
      ? 'Enter your price to continue.'
      : !hasBudget
      ? ''
      : overBudget
      ? `Above the buyer's indicative range of ${formatBudget(requirement.budgetMin, requirement.budgetMax)}.`
      : `Within the buyer's indicative range of ${formatBudget(requirement.budgetMin, requirement.budgetMax)}.`;

  const patchItem = (id: string, key: 'desc' | 'qty' | 'unit', val: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [key]: val } : i)));
  const addItem = () => setItems((prev) => [...prev, { id: `l${Date.now()}`, desc: '', qty: '1', unit: '0' }]);
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const addFile = () =>
    setFiles((prev) => [
      ...prev,
      { id: `f${Date.now()}`, filename: 'New attachment.pdf', sizeBytes: 0, mimeType: 'application/pdf', uri: '' },
    ]);
  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const validUntilDate = new Date(Date.now() + validity * 86_400_000).toISOString();
  const ready = ack1 && ack2 && total > 0;

  const handleSeal = () => {
    if (!ready) return;
    onSubmit?.({
      totalPrice: total,
      leadTimeDays: Math.round(num(lead) * 7),
      paymentTerms: term,
      validityDays: validity,
      notesToBuyer: note,
      attachments: files,
    });
  };

  return {
    priceMode, setPriceMode,
    items, patchItem, addItem, removeItem,
    totalOnly, setTotalOnly,
    lead, setLead,
    validity, setValidity,
    term, setTerm,
    note, setNote,
    files, addFile, removeFile,
    ack1, setAck1, ack2, setAck2,
    total, budgetNote,
    validUntilDate,
    ready,
    handleSeal,
  };
}

export type FormState = ReturnType<typeof useQuotationForm>;
