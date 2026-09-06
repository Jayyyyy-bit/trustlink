// features/onboarding/sharedStyles.ts
// A handful of field-typography primitives genuinely shared by 3+ of the step components
// (IdentityScreen, OperationsScreen, DocumentUploadRow) — kept here instead of duplicated.

import { StyleSheet } from 'react-native';
import { font, fontSize, lineHeight, color } from '../../components/ui/tokens';

export const sharedStyles = StyleSheet.create({
  fieldLabel: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  fieldCaption: { marginTop: 2, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
});
