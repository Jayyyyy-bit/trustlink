// features/requirement-detail/components/BareQuotationCount.tsx

import { View, Text, StyleSheet } from 'react-native';
import { font, fontSize, lineHeight, color } from '../../../components/ui/tokens';
import { sharedStyles } from '../sharedStyles';
import { SectionLabel } from './SectionLabel';

export function BareQuotationCount({ count }: { count: number }) {
  return (
    <View style={sharedStyles.block}>
      <SectionLabel>Quotations received</SectionLabel>
      <Text style={styles.countNumber}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  countNumber: {
    fontFamily: font.display,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    color: color.ink,
  },
});
