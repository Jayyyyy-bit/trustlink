// features/business-profile/components/Divider.tsx
import { View, StyleSheet } from 'react-native';
import { color } from '../../../components/ui/tokens';

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: { height: 1, backgroundColor: color.borderFaint },
});
