// features/quotation/sharedStyles.ts
// Style primitives used by more than one component in this feature. Styles used by
// exactly one component live alongside that component instead.

import { Platform, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { color, elevation, radius, space } from '../../components/ui/tokens';

export const sharedStyles = StyleSheet.create({
  card: { ...elevation.cardRaised, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.lg, gap: space.sm },
  dividedTop: { marginTop: space.sm, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: color.borderFaint },
});

/** Native has no hover state to transition, so this is a no-op there. */
export const buyerRowHoverTransitionOnWeb: ViewStyle =
  Platform.OS === 'web'
    ? ({ transitionProperty: 'background-color', transitionDuration: '150ms', transitionTimingFunction: 'ease-out' } as unknown as ViewStyle)
    : {};
