// features/business-profile/sharedStyles.ts
// Style primitives used by 3+ of the split-out components — kept here instead of
// duplicated, per the pattern established in features/requirement-detail/sharedStyles.ts.
import { StyleSheet } from 'react-native';
import { color, font, fontSize, lineHeight, radius, space } from '../../components/ui/tokens';

export const sharedStyles = StyleSheet.create({
  sideBlock: { gap: space.sm },
  sideBody: { marginTop: space.sm, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },

  block: { gap: space.md },
  blockHeaderRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: space.md },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  linkText: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.primary },

  editActionsRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  input: { marginTop: space.xs, backgroundColor: color.canvas, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: font.body, fontSize: fontSize.base, color: color.ink },
  mutedSmall: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
});
