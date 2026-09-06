// features/requirement-detail/sharedStyles.ts
// Style primitives and page-frame styles used by more than one component in this
// feature. Styles used by exactly one component live alongside that component instead.

import { Platform, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import {
  color,
  font,
  fontSize,
  lineHeight,
  letterSpacing,
  space,
  radius,
  elevation,
  layout,
} from '../../components/ui/tokens';

/* RN's own style types only know 'absolute' | 'relative' | 'static' for `position` —
 * 'sticky' is a react-native-web extension the type defs don't model. Native ScrollView
 * has no equivalent, so this only applies on web; native just gets a normal flowing column. */
export const stickyOnWeb: ViewStyle =
  Platform.OS === 'web' ? ({ position: 'sticky', top: space.xxl } as unknown as ViewStyle) : {};

export const sharedStyles = StyleSheet.create({
  /* ─── Page frame ───────────────────────────────────── */
  root: {
    flex: 1,
    backgroundColor: color.canvas,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: space.xxl,
  },
  page: {
    width: '100%',
    maxWidth: layout.maxWidth,
    paddingHorizontal: layout.screenPadding,
    gap: space.section,
  },
  pageWide: {
    width: '100%',
    maxWidth: layout.maxWidthWide,
    paddingHorizontal: layout.screenPadding,
    gap: space.section,
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.xxl,
  },
  mainColumn: {
    flex: 3,
    gap: space.lg,
  },
  sideColumn: {
    flex: 1,
    minWidth: layout.sideColumnMinWidth,
    gap: space.lg,
  },

  /* ─── Typography ───────────────────────────────────── */
  bodyText: {
    fontFamily: font.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: color.ink,
  },
  bodyTextSemi: {
    fontFamily: font.bodySemi,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: color.ink,
  },
  mutedSmall: {
    fontFamily: font.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: color.inkMuted,
  },
  mono: {
    fontFamily: font.monoMedium,
  },
  labelValueValue: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.ink,
    textAlign: 'right',
  },

  /* ─── Layout marker ────────────────────────────────── */
  block: {},

  /* ─── Wide card shell ──────────────────────────────── */
  wideCard: {
    ...elevation.cardRaised,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    paddingVertical: space.xl,
    paddingHorizontal: space.xxl,
    gap: space.lg,
  },
  wideDividedSection: {
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: color.borderFaint,
  },
  wideDividedSectionTop: {
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: color.borderFaint,
  },

  /* ─── Facts grid ───────────────────────────────────── */
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xl,
  },
  factsGridItem: {
    flexGrow: 1,
    flexBasis: layout.factMinWidth,
    minWidth: layout.factMinWidth,
  },
  factValue: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: color.ink,
    marginTop: space.xs,
  },
  factValueMuted: {
    fontFamily: font.body,
    color: color.inkMuted,
  },

  /* ─── Avatar / identity chip ───────────────────────── */
  avatarChip: {
    width: space.section,
    height: space.section,
    borderRadius: radius.lg,
    backgroundColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChipLabel: {
    fontFamily: font.display,
    fontSize: fontSize.sm,
    color: color.canvas,
  },
  wideBuyerInfo: {
    flex: 1,
    minWidth: layout.factMinWidth,
    gap: space.xs,
  },
  wideBuyerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  wideBuyerName: {
    fontFamily: font.display,
    fontSize: fontSize.md,
    letterSpacing: letterSpacing.tight,
    color: color.ink,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedTagLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.primary,
  },
  tierPill: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  tierPillLabel: {
    fontFamily: font.monoMedium,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: color.inkMuted,
  },

  /* ─── Misc shared ──────────────────────────────────── */
  wideMetaSpacer: {
    flex: 1,
    minWidth: space.sm,
  },
  wideLinkText: {
    fontFamily: font.bodyMedium,
    fontSize: fontSize.sm,
    color: color.primary,
  },
  sideKeyValueList: {
    gap: space.sm,
  },
});
