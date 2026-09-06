// features/onboarding/components/DocumentsScreen.tsx

import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, lineHeight, space, color } from '../../../components/ui/tokens';
import type { Attachment } from '../../../lib/types';
import { registrationDocSpec, listOut } from '../format';
import type { DocumentsProps } from '../types';
import { ScreenTitle } from './ScreenTitle';
import { SummaryBanner } from './SummaryBanner';
import { FormSection } from './FormSection';
import { FormDivider } from './FormDivider';
import { DocumentUploadRow } from './DocumentUploadRow';

export function DocumentsScreen({ identity, onSubmit, reportContinue }: DocumentsProps & { reportContinue: (fn: () => void) => void }) {
  const regSpec = registrationDocSpec(identity.businessType);
  const [registrationDoc, setRegistrationDoc] = useState<Attachment | null>(null);
  const [birDoc, setBirDoc] = useState<Attachment | null>(null);
  const [mayorsPermit, setMayorsPermit] = useState<Attachment | null>(null);
  const [attempted, setAttempted] = useState(false);

  function capture(kind: 'registration' | 'bir' | 'permit') {
    const tag = kind === 'registration' ? regSpec.key : kind === 'bir' ? 'BIR' : 'PERMIT';
    const file: Attachment = {
      id: `doc-${kind}-${Date.now()}`,
      filename: `IMG_${Date.now()}_${tag}.jpg`,
      sizeBytes: 2_400_000,
      mimeType: 'image/jpeg',
      uri: '',
    };
    if (kind === 'registration') setRegistrationDoc(file);
    else if (kind === 'bir') setBirDoc(file);
    else setMayorsPermit(file);
  }

  const missing: string[] = [];
  if (!registrationDoc) missing.push(`your ${regSpec.key} certificate`);
  if (!birDoc) missing.push('your BIR registration');
  const ready = missing.length === 0;

  const handleSubmit = () => {
    if (!ready) {
      setAttempted(true);
      return;
    }
    onSubmit({ registrationDoc, birDoc, mayorsPermit });
  };

  reportContinue(handleSubmit);

  return (
    <View style={styles.stepContent}>
      <ScreenTitle title="Verify your business" />
      {attempted && missing.length > 0 && <SummaryBanner message={`Add ${listOut(missing)} to submit.`} />}
      <FormSection heading="Documents">
        <View style={{ gap: space.lg }}>
          <DocumentUploadRow
            name={regSpec.name}
            help={regSpec.help}
            required
            file={registrationDoc}
            onCapture={() => capture('registration')}
            onRemove={() => setRegistrationDoc(null)}
          />
          <FormDivider />
          <DocumentUploadRow
            name="BIR certificate of registration"
            help="Form 2303. We read your TIN from it — no need to type it anywhere."
            required
            file={birDoc}
            onCapture={() => capture('bir')}
            onRemove={() => setBirDoc(null)}
          />
          <FormDivider />
          <DocumentUploadRow
            name="Mayor's permit"
            help="Not needed to get verified. Businesses that add it later can reach Tier 3 sooner."
            required={false}
            file={mayorsPermit}
            onCapture={() => capture('permit')}
            onRemove={() => setMayorsPermit(null)}
          />
        </View>
      </FormSection>

      <Text style={styles.quietNote}>
        Your documents are seen by the Trustlink team who check them, and by nobody else. They are never shown on your profile — only the fact that you were verified, and the date.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: { gap: space.lg },
  quietNote: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkFaint },
});
