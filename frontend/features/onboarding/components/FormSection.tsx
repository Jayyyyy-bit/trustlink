// features/onboarding/components/FormSection.tsx

import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, letterSpacing, space, color } from '../../../components/ui/tokens';

export function FormSection({ heading, children }: { heading?: string; children: ReactNode }) {
  return (
    <View style={styles.formSection}>
      {!!heading && <Text style={styles.sectionLabel}>{heading}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: { gap: space.sm },
  sectionLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
});
