// features/post-requirement/sharedStyles.ts
// Style primitives used by 3+ of the split-out step screens.
import { StyleSheet } from 'react-native';
import { color, font, fontSize, radius, space } from '../../components/ui/tokens';

export const sharedStyles = StyleSheet.create({
  input: { marginTop: space.xs, backgroundColor: color.canvas, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: font.body, fontSize: fontSize.base, color: color.ink },
  pillGroupWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },
});
