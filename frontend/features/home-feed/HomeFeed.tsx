// features/home-feed/HomeFeed.tsx
// The authenticated business's main feed. One component, phone stack below
// breakpoint.desktop, wide dashboard at/above it — same pattern as RequirementDetail.tsx.
// Rebuilt from docs/design/Trustlink Home Feed.dc.html: same cards, same sections, same
// hierarchy as the design. Literal icon glyphs are dropped in favour of RN-native
// affordances (dots, badges, pills, initials chips) — the precedent RequirementDetail.tsx
// already set, since this project has no react-native-svg dependency.

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import {
  color,
  font,
  fontSize,
  letterSpacing,
  radius,
  space,
  layout,
  breakpoint,
} from '../../components/ui/tokens';
import type {
  Business,
  BusinessId,
  Requirement,
  MessageThread,
  Message,
} from '../../lib/types';
import type { FeedBuyer } from './types';
import { formatCompactCountdown } from './format';
import { ChatWidget } from './components/ChatWidget';
import { CategoryPills } from './components/CategoryPills';
import { ProfileCard } from './components/ProfileCard';
import { ActivityStatsCard } from './components/ActivityStatsCard';
import { CtaBanner } from './components/CtaBanner';
import { RequirementCard } from './components/RequirementCard';
import { MyRequirementRow } from './components/MyRequirementRow';
import { ClosedRequirementRow } from './components/ClosedRequirementRow';
import { ClosingSoonItem } from './components/ClosingSoonItem';
import { HowMatchingWorksCard } from './components/HowMatchingWorksCard';

/* ─── Props ─────────────────────────────────────────── */

export interface HomeFeedProps {
  viewer: Business;
  requirements: Requirement[];
  requirementBuyers: Record<BusinessId, FeedBuyer>;
  myRequirements: Requirement[];
  recentlyClosed: Requirement[];
  messageThreads: MessageThread[];
  /** Keyed by MessageThread.id. Only threads the viewer already holds are ever looked up
   *  here — there is no path in this component that constructs a new thread. */
  messagesByThread: Record<string, Message[]>;
  onSubmitQuotation?: (requirementId: string) => void;
  onPostRequirement?: () => void;
  onSelectRequirement?: (requirementId: string) => void;
}

/* ─── Shared state hook ─────────────────────────────── */

function useHomeFeed(props: HomeFeedProps) {
  const { viewer, requirements } = props;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [sessionQuoted, setSessionQuoted] = useState<Set<string>>(new Set());

  const categoryNames = Array.from(new Set(requirements.map((r) => r.category)));
  const categories = ['All', ...categoryNames].map((name) => ({
    name,
    count: name === 'All' ? requirements.length : requirements.filter((r) => r.category === name).length,
  }));

  const filtered = requirements.filter((r) => categoryFilter === 'All' || r.category === categoryFilter);
  const matchedCount = filtered.filter((r) => r.category === viewer.category).length;
  const resultLabel = `${filtered.length} Open · ${matchedCount} Matched to You`;

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const submitQuotation = (id: string) => {
    setSessionQuoted((prev) => new Set(prev).add(id));
    props.onSubmitQuotation?.(id);
  };

  const closingSoon = requirements
    .map((r) => ({ requirement: r, ...formatCompactCountdown(r.closingAt, now) }))
    .filter((r) => !r.closed && r.hoursLeft < 24)
    .sort((a, b) => a.hoursLeft - b.hoursLeft)
    .slice(0, 4);

  return {
    now,
    categories,
    categoryFilter,
    setCategoryFilter,
    filtered,
    resultLabel,
    saved,
    sessionQuoted,
    toggleSave,
    submitQuotation,
    closingSoon,
  };
}

/* ─── Phone layout ───────────────────────────────────── */

function PhoneHomeFeed(props: HomeFeedProps) {
  const st = useHomeFeed(props);
  const { viewer, myRequirements, recentlyClosed, requirementBuyers, messageThreads, messagesByThread } = props;

  return (
    <View style={styles.root}>
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <View style={styles.page}>
        <CategoryPills categories={st.categories} active={st.categoryFilter} onSelect={st.setCategoryFilter} />
        <ProfileCard viewer={viewer} />
        <ActivityStatsCard viewer={viewer} />
        <CtaBanner onPostRequirement={props.onPostRequirement} />

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Business Opportunities</Text>
          <Text style={styles.microLabel}>{st.resultLabel}</Text>
        </View>
        <View style={{ gap: space.md }}>
          {st.filtered.map((r) => (
            <RequirementCard
              key={r.id}
              requirement={r}
              buyer={requirementBuyers[r.buyerId]}
              viewer={viewer}
              now={st.now}
              saved={st.saved.has(r.id)}
              quoted={st.sessionQuoted.has(r.id)}
              onToggleSave={() => st.toggleSave(r.id)}
              onSubmitQuotation={() => st.submitQuotation(r.id)}
              onSelect={() => props.onSelectRequirement?.(r.id)}
            />
          ))}
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Your requirements</Text>
            <Pressable onPress={() => {}}><Text style={styles.manageAllLink}>Manage all</Text></Pressable>
          </View>
          <View style={{ gap: space.md }}>
            {myRequirements.map((r) => (
              <MyRequirementRow key={r.id} requirement={r} now={st.now} />
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Recently closed on Trustlink</Text>
            <Text style={styles.microLabel}>Last 7 days</Text>
          </View>
          <Text style={styles.mutedSmall}>
            Outcomes are published once a buyer closes a requirement, so you can see what actually gets awarded in
            your category.
          </Text>
          <View style={{ gap: space.md, marginTop: space.sm }}>
            {recentlyClosed.map((r) => (
              <ClosedRequirementRow key={r.id} requirement={r} buyerName={requirementBuyers[r.buyerId]?.displayName ?? requirementBuyers[r.buyerId]?.registeredName ?? ''} now={st.now} />
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.microLabel}>Closing within 24 hours</Text>
          <View>
            {st.closingSoon.map(({ requirement }) => (
              <ClosingSoonItem
                key={requirement.id}
                requirement={requirement}
                buyerName={requirementBuyers[requirement.buyerId]?.displayName ?? requirementBuyers[requirement.buyerId]?.registeredName ?? ''}
                now={st.now}
                onSelect={() => props.onSelectRequirement?.(requirement.id)}
              />
            ))}
          </View>
        </View>

        <HowMatchingWorksCard />
      </View>
    </ScrollView>
    <ChatWidget threads={messageThreads} messagesByThread={messagesByThread} viewerId={viewer.id} now={st.now} />
    </View>
  );
}

/* ─── Wide layout ─────────────────────────────────────
 * Reproduces docs/design/Trustlink Home Feed.dc.html's structure directly: left sidebar
 * (profile + stats), centre column (CTA, feed, your requirements, recently closed), right
 * sidebar (closing-soon rail, how-matching), floating messages widget. Capped at
 * layout.maxWidthDashboard (1760) — wider than RequirementDetail.tsx's two-column
 * layout.maxWidthWide, since a three-column dashboard needs the extra room, and wider
 * than the source design's own 1720px so the three columns use more of the window on
 * large screens.
 *
 * The top nav chrome (logo, search, primary nav, account block) lives in AppHeader,
 * mounted once above this screen by app/_layout.tsx — it is not part of this component.
 * The category filter row lives in page content (not the header), and on web sticks to
 * the top of this screen's own scroll area — which sits directly below AppHeader — once
 * the user scrolls past it. Its resting position is 0 (nothing else above it in this
 * scroll area); the sidebar, which docks beneath the filter row, derives its offset from
 * the filter row's measured height via onLayout instead of a hardcoded constant. */

const stickyOnWeb: ViewStyle =
  Platform.OS === 'web' ? ({ position: 'sticky', top: 0 } as unknown as ViewStyle) : {};

function WideHomeFeed(props: HomeFeedProps) {
  const st = useHomeFeed(props);
  const { viewer, myRequirements, recentlyClosed, requirementBuyers, messageThreads, messagesByThread } = props;
  const [categoryHeight, setCategoryHeight] = useState(0);
  const sidebarTop: ViewStyle = Platform.OS === 'web' ? { top: categoryHeight } : {};

  return (
    <View style={styles.root}>
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContentWide}>
      <View
        style={[styles.categorySticky, stickyOnWeb]}
        onLayout={(e) => setCategoryHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.pageWide}>
          <CategoryPills categories={st.categories} active={st.categoryFilter} onSelect={st.setCategoryFilter} />
        </View>
      </View>

      <View style={styles.pageWide}>
        <View style={styles.columnsWide}>
          <View style={[styles.sideColumn, stickyOnWeb, sidebarTop]}>
            <ProfileCard viewer={viewer} />
            <ActivityStatsCard viewer={viewer} />
          </View>

          <View style={styles.mainColumnWide}>
            <CtaBanner onPostRequirement={props.onPostRequirement} />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Business Opportunities</Text>
              <Text style={styles.microLabel}>{st.resultLabel}</Text>
            </View>
            <View style={{ gap: space.md }}>
              {st.filtered.map((r) => (
                <RequirementCard
                  key={r.id}
                  requirement={r}
                  buyer={requirementBuyers[r.buyerId]}
                  viewer={viewer}
                  now={st.now}
                  saved={st.saved.has(r.id)}
                  quoted={st.sessionQuoted.has(r.id)}
                  onToggleSave={() => st.toggleSave(r.id)}
                  onSubmitQuotation={() => st.submitQuotation(r.id)}
                  onSelect={() => props.onSelectRequirement?.(r.id)}
                />
              ))}
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Your requirements</Text>
                <Pressable onPress={() => {}}><Text style={styles.manageAllLink}>Manage all</Text></Pressable>
              </View>
              <View style={{ gap: space.md }}>
                {myRequirements.map((r) => (
                  <MyRequirementRow key={r.id} requirement={r} now={st.now} />
                ))}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Recently closed on Trustlink</Text>
                <Text style={styles.microLabel}>Last 7 days</Text>
              </View>
              <Text style={styles.mutedSmall}>
                Outcomes are published once a buyer closes a requirement, so you can see what actually gets awarded
                in your category.
              </Text>
              <View style={{ gap: space.md, marginTop: space.sm }}>
                {recentlyClosed.map((r) => (
                  <ClosedRequirementRow key={r.id} requirement={r} buyerName={requirementBuyers[r.buyerId]?.displayName ?? requirementBuyers[r.buyerId]?.registeredName ?? ''} now={st.now} />
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.sideColumn, stickyOnWeb, sidebarTop]}>
            <View style={styles.statsCard}>
              <Text style={styles.microLabel}>Closing within 24 hours</Text>
              <View>
                {st.closingSoon.map(({ requirement }) => (
                  <ClosingSoonItem
                    key={requirement.id}
                    requirement={requirement}
                    buyerName={requirementBuyers[requirement.buyerId]?.displayName ?? requirementBuyers[requirement.buyerId]?.registeredName ?? ''}
                    now={st.now}
                    onSelect={() => props.onSelectRequirement?.(requirement.id)}
                  />
                ))}
              </View>
            </View>
            <HowMatchingWorksCard />
          </View>
        </View>
      </View>
    </ScrollView>
    <ChatWidget threads={messageThreads} messagesByThread={messagesByThread} viewerId={viewer.id} now={st.now} />
    </View>
  );
}

/* ─── Root component ────────────────────────────────── */

export default function HomeFeed(props: HomeFeedProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= breakpoint.desktop;
  return isWide ? <WideHomeFeed {...props} /> : <PhoneHomeFeed {...props} />;
}

/* ─── Styles ─────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  scrollContent: { paddingBottom: space.section },
  scrollContentWide: { paddingBottom: space.section },
  page: { width: '100%', paddingHorizontal: layout.screenPadding, gap: space.lg, paddingTop: space.lg },
  pageWide: { width: '100%', maxWidth: layout.maxWidthDashboard, marginHorizontal: 'auto', paddingHorizontal: layout.screenPadding },
  categorySticky: { backgroundColor: color.canvas, borderBottomWidth: 1, borderBottomColor: color.border, zIndex: 40 },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xxl, paddingVertical: space.xl },
  sideColumn: { flex: 1, minWidth: layout.sideColumnMinWidth, maxWidth: 340, gap: space.lg },
  mainColumnWide: { flex: 3, minWidth: 0, gap: space.lg },
  sectionBlock: { gap: space.md, marginTop: space.xl, paddingTop: space.xl, borderTopWidth: 1, borderTopColor: color.border },

  /* section headers */
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md },
  sectionHeading: { fontFamily: font.display, fontSize: fontSize.xl, color: color.ink },
  manageAllLink: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  microLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
  mutedSmall: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },

  /* closing-soon side panel wrapper (wide layout only — the phone layout uses sectionBlock) */
  statsCard: { borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, padding: space.xl },
});
