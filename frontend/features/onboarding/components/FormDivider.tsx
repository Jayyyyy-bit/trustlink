// features/onboarding/components/FormDivider.tsx

import { View, StyleSheet } from 'react-native';
import { color } from '../../../components/ui/tokens';

export function FormDivider() {
  return <View style={styles.formDivider} />;
}

const styles = StyleSheet.create({
  formDivider: { height: 1, backgroundColor: color.borderFaint },
});
