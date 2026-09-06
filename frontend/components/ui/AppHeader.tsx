// components/ui/AppHeader.tsx
// Top navigation chrome: logo, search, primary nav (with count badges), account block.
// Mounted once by app/_layout.tsx so every post-login screen gets it — screens themselves
// never render their own header. Extracted from features/home-feed/HomeFeed.tsx, which
// used to own a local copy.

import { View, Text, TextInput, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { House, FileText, Calendar, Bookmark, Bell, Search, type LucideIcon } from 'lucide-react-native';
import {
  color,
  font,
  fontSize,
  letterSpacing,
  space,
  radius,
  layout,
  breakpoint,
  iconSize,
} from './tokens';
import { AvatarChip, initials } from './AvatarChip';
import type { Business, TrustTier } from '../../lib/types';

function tierLabel(tier: TrustTier | null): string {
  return tier === null ? 'Unrated' : `Tier ${tier}`;
}

interface NavItem {
  label: string;
  href: string;
  Icon: LucideIcon;
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
    { label: 'Home', href: '/home', Icon: House },
    { label: 'My Quotations', href: '/quotations', Icon: FileText },
    { label: 'My Requirements', href: '/requirements', Icon: Calendar },
    { label: 'Saved', href: '/saved', Icon: Bookmark },
  ];
  const alertsNav: NavItem = { label: 'Alerts', href: '/alerts', Icon: Bell, badge: alertCount };

  const renderNavItem = (item: NavItem) => {
    const active = pathname === item.href;
    const tone = active ? color.ink : color.inkMuted;
    return (
      <Pressable key={item.label} style={[styles.navItem, active ? styles.navItemActive : null]} onPress={() => router.push(item.href)}>
        <View style={styles.navIconWrap}>
          <item.Icon size={iconSize.md} color={tone} strokeWidth={1.75} />
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
            <Search size={iconSize.sm} color={color.inkFaint} strokeWidth={1.75} />
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
  searchField: { flexDirection: 'row', alignItems: 'center', gap: space.sm, width: '100%', minWidth: 140, maxWidth: 340, backgroundColor: color.surfaceSunken, borderWidth: 1, borderColor: color.border, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.sm },
  searchInput: { flex: 1, fontFamily: font.body, fontSize: fontSize.sm, color: color.ink },

  /* nav items: icon above label, count badge pinned to the icon, underline on active */
  navRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xs },
  navItem: { alignItems: 'center', paddingHorizontal: space.sm, paddingTop: space.xs, paddingBottom: space.sm, gap: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  navItemActive: { borderBottomColor: color.ink },
  navIconWrap: { width: iconSize.md, height: iconSize.md, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  navLabel: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  navLabelActive: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.ink },
  navBadge: { position: 'absolute', top: -5, right: -7, minWidth: 14, height: 14, borderRadius: radius.pill, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  navBadgeLabel: { fontFamily: font.mono, fontSize: 9, lineHeight: 10, color: color.onPrimary },

  profileChip: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minWidth: 0 },
  profileChipName: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
  profileChipTier: { fontFamily: font.mono, fontSize: 10, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.primary },
});
