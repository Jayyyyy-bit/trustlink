// components/ui/AppHeader.tsx
// Top navigation chrome: logo, search, primary nav (with count badges), account block.
// Mounted once by app/_layout.tsx so every post-login screen gets it — screens themselves
// never render their own header. Extracted from features/home-feed/HomeFeed.tsx, which
// used to own a local copy.

import type { ComponentType } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  color,
  font,
  fontSize,
  letterSpacing,
  space,
  radius,
  layout,
  breakpoint,
} from './tokens';
import { AvatarChip, initials } from './AvatarChip';
import type { Business, TrustTier } from '../../lib/types';

function tierLabel(tier: TrustTier | null): string {
  return tier === null ? 'Unrated' : `Tier ${tier}`;
}

/* ─── Nav icons ──────────────────────────────────────
 * Simple shape-built glyphs — no icon library, same precedent as HomeFeed.tsx's
 * CategoryIcon/PinIcon/BookmarkIcon (borders, dots, lines; no react-native-svg dep). */

type IconProps = { tone: string };

function HouseIcon({ tone }: IconProps) {
  return (
    <View style={styles.iconStack}>
      <View style={[styles.houseRoof, { borderBottomColor: tone }]} />
      <View style={[styles.houseBody, { borderColor: tone }]} />
    </View>
  );
}

function DocumentIcon({ tone }: IconProps) {
  return (
    <View style={[styles.docBody, { borderColor: tone }]}>
      <View style={[styles.docLine, { backgroundColor: tone }]} />
      <View style={[styles.docLine, { backgroundColor: tone, width: 5 }]} />
    </View>
  );
}

function CalendarIcon({ tone }: IconProps) {
  return (
    <View style={styles.iconStack}>
      <View style={styles.calendarHangerRow}>
        <View style={[styles.calendarHanger, { backgroundColor: tone }]} />
        <View style={[styles.calendarHanger, { backgroundColor: tone }]} />
      </View>
      <View style={[styles.calendarBody, { borderColor: tone }]}>
        <View style={[styles.calendarHeaderLine, { backgroundColor: tone }]} />
      </View>
    </View>
  );
}

function SavedIcon({ tone }: IconProps) {
  return <View style={[styles.bookmark, { borderColor: tone }]} />;
}

function BellIcon({ tone }: IconProps) {
  return (
    <View style={styles.iconStack}>
      <View style={[styles.bellDome, { borderColor: tone }]} />
      <View style={[styles.bellBase, { backgroundColor: tone }]} />
      <View style={[styles.bellClapper, { backgroundColor: tone }]} />
    </View>
  );
}

interface NavItem {
  label: string;
  href: string;
  Icon: ComponentType<IconProps>;
  badge?: number;
}

export interface AppHeaderProps {
  viewer: Business;
  /** Unread alert count shown on the Alerts nav item's badge. */
  alertCount?: number;
}

export default function AppHeader({ viewer, alertCount = 0 }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWide = width >= breakpoint.desktop;
  const name = viewer.displayName ?? viewer.registeredName;

  const primaryNav: NavItem[] = [
    { label: 'Home', href: '/home', Icon: HouseIcon },
    { label: 'My Quotations', href: '/quotations', Icon: DocumentIcon },
    { label: 'My Requirements', href: '/requirements', Icon: CalendarIcon },
    { label: 'Saved', href: '/saved', Icon: SavedIcon },
  ];
  const alertsNav: NavItem = { label: 'Alerts', href: '/alerts', Icon: BellIcon, badge: alertCount };

  const renderNavItem = (item: NavItem) => {
    const active = pathname === item.href;
    const tone = active ? color.ink : color.inkMuted;
    return (
      <Pressable key={item.label} style={[styles.navItem, active ? styles.navItemActive : null]} onPress={() => router.push(item.href)}>
        <View style={styles.navIconWrap}>
          <item.Icon tone={tone} />
          {!!item.badge && (
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeLabel}>{item.badge}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.navLabel, active ? styles.navLabelActive : null]}>{item.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark} />
            <Text style={styles.logoText}>Trustlink</Text>
          </View>
        </View>

        <View style={styles.headerCenter}>
          <View style={styles.searchField}>
            <TextInput
              placeholder="Search requirements or businesses"
              placeholderTextColor={color.inkFaint}
              style={styles.searchInput}
            />
          </View>
        </View>

        <View style={styles.headerRight}>
          {isWide && <View style={styles.navRow}>{primaryNav.map(renderNavItem)}</View>}

          {renderNavItem(alertsNav)}

          <View style={styles.profileChip}>
            <AvatarChip label={initials(name)} size={32} />
            <View style={{ minWidth: 0 }}>
              <Text style={styles.profileChipName} numberOfLines={1}>{name}</Text>
              <Text style={styles.profileChipTier}>Verified · {tierLabel(viewer.credibility.tier)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: color.canvas,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    zIndex: 50,
  },
  headerRow: {
    width: '100%',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flexWrap: 'wrap',
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  headerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: space.md, flexWrap: 'wrap' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logoMark: { width: 18, height: 18, borderRadius: radius.pill, borderWidth: 1.5, borderColor: color.primary },
  logoText: { fontFamily: font.display, fontSize: fontSize.base, color: color.ink },
  searchField: { width: '100%', minWidth: 140, maxWidth: 340, backgroundColor: color.surfaceSunken, borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.sm },
  searchInput: { fontFamily: font.body, fontSize: fontSize.sm, color: color.ink },

  /* nav items: icon above label, count badge pinned to the icon, underline on active */
  navRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xs },
  navItem: { alignItems: 'center', paddingHorizontal: space.sm, paddingTop: space.xs, paddingBottom: space.sm, gap: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  navItemActive: { borderBottomColor: color.ink },
  navIconWrap: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  navLabel: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  navLabelActive: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.ink },
  navBadge: { position: 'absolute', top: -5, right: -7, minWidth: 14, height: 14, borderRadius: radius.pill, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  navBadgeLabel: { fontFamily: font.mono, fontSize: 9, lineHeight: 10, color: color.onPrimary },

  /* icon glyphs */
  iconStack: { alignItems: 'center' },
  houseRoof: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  houseBody: { width: 9, height: 6, marginTop: -1, borderWidth: 1.3 },
  docBody: { width: 10, height: 13, borderWidth: 1.2, borderRadius: 1.5, alignItems: 'center', justifyContent: 'center', gap: 2 },
  docLine: { width: 6, height: 1.2, borderRadius: 1 },
  calendarHangerRow: { flexDirection: 'row', justifyContent: 'space-between', width: 8, marginBottom: 1 },
  calendarHanger: { width: 1.3, height: 3, borderRadius: 1 },
  calendarBody: { width: 13, height: 11, borderWidth: 1.2, borderRadius: 1.5, paddingTop: 2 },
  calendarHeaderLine: { height: 1.2, marginHorizontal: 1.5 },
  bookmark: { width: 9, height: 12, borderWidth: 1.3, borderRadius: 1 },
  bellDome: { width: 10, height: 8, borderWidth: 1.3, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomLeftRadius: 1, borderBottomRightRadius: 1 },
  bellBase: { width: 12, height: 1.3, marginTop: 1, borderRadius: 1 },
  bellClapper: { width: 2.5, height: 2.5, marginTop: 1, borderRadius: 2 },

  profileChip: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minWidth: 0 },
  profileChipName: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
  profileChipTier: { fontFamily: font.mono, fontSize: 10, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.primary },
});
