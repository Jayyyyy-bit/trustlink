// features/home-feed/components/ChatWidget.tsx
// The messages dock: a list card plus independent conversation windows.
// Web only — same Platform.OS-gated check the sticky sidebar's stickyOnWeb/fixedOnWeb use
// in HomeFeed.tsx, just returning null outright instead of swapping a style, since a
// floating dock has no sensible native/phone equivalent. Fixed to the bottom-right on web
// via fixedOnWeb.
//
// Every item in the dock — the thread-list card and each open conversation — is built the
// same way: a fixed-height header pinned to the bottom edge, with a content pane above it
// whose `height` alone is what GrowPanel animates between 0 (collapsed: the card *is* just
// its header) and DOCK_OPEN_HEIGHT (expanded). Nothing ever slides or repositions; only that
// height changes, so a header never moves relative to the bottom edge it's docked to.
//
// They lay out left-to-right in one row, right edge pinned via the container's own `right`
// offset so the row grows leftward as windows open: conversation windows first (oldest
// furthest left, newest nearest the list), then the thread-list card last, which is why its
// position never shifts as windows come and go. Selecting a thread from the list does not
// touch the list itself — it opens a new conversation window beside it (or re-expands one
// already open), and both stay visible at once; multiple conversations can be open
// side by side.
//
// Each conversation window carries its own collapse and close controls, independent of the
// list card's: collapse just re-targets its GrowPanel height back to 0 without unmounting
// (no data loss — the draft and scroll position are still there when it re-expands), while
// close does the same height animation and then, once it finishes, actually drops the
// window from state via GrowPanel's `onClosed` — the same deferred-unmount idea
// Onboarding.tsx/PostRequirement.tsx use for their outgoing step. `onClosed` also fires after
// an ordinary collapse, so the callers below only act on it when a close was actually in
// flight.
//
// Threads are never created here — the only way one exists is passed in via `threads`,
// which by construction (see MessageThread's doc comment) only ever holds threads a buyer
// and their awarded respondent already share. Plain text only: the composer is a single
// TextInput, no attachment affordance — documents live on the quotation, not the thread.

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import { X, ChevronUp, ChevronDown } from 'lucide-react-native';
import { color, font, fontSize, iconSize, letterSpacing, lineHeight, radius, space } from '../../../components/ui/tokens';
import { AvatarChip, initials } from '../../../components/ui/AvatarChip';
import type { BusinessId, Message, MessageThread } from '../../../lib/types';
import { formatClockTime, timeAgoCompact } from '../format';

const DOCK_OPEN_HEIGHT = 400;
const DOCK_ANIM_MS = 220;

/** `position: 'fixed'` isn't in RN's own Position type and StyleSheet.create silently
 *  drops it, same reason HomeFeed.tsx's stickyOnWeb is merged via the style array instead of
 *  baked into a StyleSheet.create entry. Native has no fixed-to-viewport concept, so it
 *  falls back to absolute (positioned by the nearest positioned ancestor). */
const fixedOnWeb: ViewStyle =
  Platform.OS === 'web' ? ({ position: 'fixed' } as unknown as ViewStyle) : { position: 'absolute' };

function ThreadRow({ thread, now, onPress }: { thread: MessageThread; now: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.threadRow}>
      <AvatarChip label={initials(thread.counterpartyName)} size={30} dark={!thread.unread} />
      <View style={{ flex: 1, minWidth: 0, gap: space.xs }}>
        <View style={styles.alertTopRow}>
          <Text style={[styles.threadName, { fontFamily: thread.unread ? font.bodySemi : font.body }]} numberOfLines={1}>
            {thread.counterpartyName}
          </Text>
          <Text style={styles.alertTime}>{timeAgoCompact(thread.lastMessageAt, now)}</Text>
        </View>
        <Text style={[styles.threadPreview, { color: thread.unread ? color.inkMuted : color.inkFaint }]} numberOfLines={1}>
          {thread.lastMessagePreview}
        </Text>
        <Text style={styles.threadRef}>{thread.requirementRef}</Text>
      </View>
      {thread.unread && <View style={styles.dot} />}
    </Pressable>
  );
}

function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={styles.bubbleText}>{message.body}</Text>
      </View>
      <Text style={styles.bubbleTime}>{formatClockTime(message.sentAt)}</Text>
    </View>
  );
}

function TrustlinkMark() {
  return <View style={styles.dockMark} />;
}

function CloseGlyph() {
  return <X size={iconSize.sm} color={color.inkMuted} strokeWidth={1.75} />;
}

function ChevronGlyph({ up }: { up: boolean }) {
  const Icon = up ? ChevronUp : ChevronDown;
  return <Icon size={iconSize.sm} color={color.inkMuted} strokeWidth={1.75} />;
}

/** Animates only `height`, between 0 and DOCK_OPEN_HEIGHT — no translateY. overflow:hidden
 *  clips the pane away at height 0, which is what makes the header below look like a plain
 *  closed bar. Children stay mounted throughout (collapsing never unmounts), so `onClosed`
 *  — fired once an animation *into* the closed state finishes — doesn't distinguish a
 *  deliberate close from an ordinary collapse; callers that care check their own state. */
function GrowPanel({
  open,
  onClosed,
  style,
  children,
}: {
  open: boolean;
  onClosed?: () => void;
  style?: ViewStyle;
  children: ReactNode;
}) {
  const height = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(height, { toValue: open ? DOCK_OPEN_HEIGHT : 0, duration: DOCK_ANIM_MS, useNativeDriver: false }).start(({ finished }) => {
      if (finished && !open) onClosed?.();
    });
  }, [open, height, onClosed]);
  return <Animated.View style={[style, { height, overflow: 'hidden' }]}>{children}</Animated.View>;
}

function ThreadListCard({
  threads,
  now,
  open,
  onToggleOpen,
  onSelectThread,
  width,
}: {
  threads: MessageThread[];
  now: number;
  open: boolean;
  onToggleOpen: () => void;
  onSelectThread: (id: string) => void;
  width: number;
}) {
  const unread = threads.filter((t) => t.unread).length;
  return (
    <View style={[styles.dockPanel, { width }]}>
      <GrowPanel open={open}>
        {threads.length === 0 ? (
          <View style={styles.dockEmpty}>
            <Text style={styles.dockEmptyText}>
              No conversations yet. Messaging opens once a requirement you&apos;re part of is awarded.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.dockScroll}>
            {threads.map((t) => (
              <ThreadRow key={t.id} thread={t} now={now} onPress={() => onSelectThread(t.id)} />
            ))}
          </ScrollView>
        )}
      </GrowPanel>

      <Pressable onPress={onToggleOpen} style={[styles.dockBar, open ? styles.dockBarOpen : null]}>
        <TrustlinkMark />
        <Text style={styles.dockBarLabel}>Messages</Text>
        <View style={{ flex: 1 }} />
        {unread > 0 && (
          <View style={styles.chatBadge}>
            <Text style={styles.chatBadgeLabel}>{unread}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

function ConversationWindow({
  thread,
  messages,
  viewerId,
  collapsed,
  closing,
  onToggleCollapse,
  onClose,
  onClosed,
  onSend,
  width,
}: {
  thread: MessageThread;
  messages: Message[];
  viewerId: BusinessId;
  collapsed: boolean;
  closing: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  onClosed: () => void;
  onSend: (body: string) => void;
  width: number;
}) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const open = !collapsed && !closing;

  const handleSend = () => {
    const body = draft.trim();
    if (!body) return;
    onSend(body);
    setDraft('');
  };

  return (
    <View style={[styles.dockPanel, { width }]}>
      {/* onClosed only wired while an actual close is in flight — an ordinary collapse
       *  also animates height to 0, but must not trigger the deferred unmount below. */}
      <GrowPanel open={open} onClosed={closing ? onClosed : undefined}>
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollRef}
            style={styles.dockScroll}
            contentContainerStyle={styles.bubbleList}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} mine={m.senderId === viewerId} />
            ))}
          </ScrollView>
          <View style={styles.composerRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message"
              placeholderTextColor={color.inkFaint}
              style={styles.composerInput}
              multiline
              onSubmitEditing={handleSend}
            />
            <Pressable onPress={handleSend} disabled={!draft.trim()} style={[styles.composerSend, !draft.trim() ? { opacity: 0.4 } : null]}>
              <Text style={styles.composerSendLabel}>Send</Text>
            </Pressable>
          </View>
        </View>
      </GrowPanel>

      <View style={[styles.dockBar, open ? styles.dockBarOpen : null]}>
        <Pressable onPress={onToggleCollapse} hitSlop={8} style={styles.dockHeaderPress}>
          <ChevronGlyph up={open} />
          <View style={{ minWidth: 0 }}>
            <Text style={styles.dockBarLabel} numberOfLines={1}>{thread.counterpartyName}</Text>
            <Text style={styles.dockMeta}>{thread.requirementRef}</Text>
          </View>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={onClose} hitSlop={8}>
          <CloseGlyph />
        </Pressable>
      </View>
    </View>
  );
}

export function ChatWidget({
  threads,
  messagesByThread,
  viewerId,
  now,
}: {
  threads: MessageThread[];
  messagesByThread: Record<string, Message[]>;
  viewerId: BusinessId;
  now: number;
}) {
  const [listOpen, setListOpen] = useState(false);
  const [openThreadIds, setOpenThreadIds] = useState<string[]>([]);
  const [collapsedThreadIds, setCollapsedThreadIds] = useState<Set<string>>(new Set());
  const [closingThreadIds, setClosingThreadIds] = useState<Set<string>>(new Set());
  const [sentByThread, setSentByThread] = useState<Record<string, Message[]>>({});
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(320, width - 40);

  const toggleList = () => setListOpen((v) => !v);

  const openThread = (id: string) => {
    setOpenThreadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setCollapsedThreadIds((prev) => (prev.has(id) ? new Set([...prev].filter((x) => x !== id)) : prev));
    setClosingThreadIds((prev) => (prev.has(id) ? new Set([...prev].filter((x) => x !== id)) : prev));
  };
  const toggleCollapseThread = (id: string) =>
    setCollapsedThreadIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const requestCloseThread = (id: string) => setClosingThreadIds((prev) => new Set(prev).add(id));
  const finalizeCloseThread = (id: string) => {
    setOpenThreadIds((prev) => prev.filter((t) => t !== id));
    setClosingThreadIds((prev) => new Set([...prev].filter((x) => x !== id)));
  };

  const sendMessage = (threadId: string, body: string) => {
    const message: Message = {
      id: `m-local-${Date.now()}`,
      threadId,
      senderId: viewerId,
      body,
      sentAt: new Date().toISOString(),
      read: true,
    };
    setSentByThread((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), message] }));
  };

  if (Platform.OS !== 'web') return null;

  return (
    <View style={[styles.chatWidget, fixedOnWeb]} pointerEvents="box-none">
      {openThreadIds.map((id) => {
        const thread = threads.find((t) => t.id === id);
        if (!thread) return null;
        return (
          <ConversationWindow
            key={id}
            thread={thread}
            messages={[...(messagesByThread[id] ?? []), ...(sentByThread[id] ?? [])]}
            viewerId={viewerId}
            collapsed={collapsedThreadIds.has(id)}
            closing={closingThreadIds.has(id)}
            onToggleCollapse={() => toggleCollapseThread(id)}
            onClose={() => requestCloseThread(id)}
            onClosed={() => finalizeCloseThread(id)}
            onSend={(body) => sendMessage(id, body)}
            width={panelWidth}
          />
        );
      })}

      <ThreadListCard
        threads={threads}
        now={now}
        open={listOpen}
        onToggleOpen={toggleList}
        onSelectThread={openThread}
        width={panelWidth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  /* messages dock — one bordered card, flush to the bottom-right corner. dockPanel is the
   * whole card (content pane + bar); its rounded top corners read correctly whether the
   * pane above is open or collapsed to nothing, since the bar's own edges never carry a
   * radius of their own */
  dockPanel: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: 'hidden' },
  dockScroll: { flex: 1 },
  dockMeta: { fontFamily: font.mono, fontSize: 10, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
  dockEmpty: { padding: space.xl },
  dockEmptyText: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted, textAlign: 'center' },

  alertTopRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  alertTime: { fontFamily: font.mono, fontSize: fontSize.micro, color: color.inkFaint },

  threadRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, padding: space.md, borderBottomWidth: 1, borderBottomColor: color.borderFaint },
  threadName: { flex: 1, fontSize: fontSize.sm, color: color.ink },
  threadPreview: { fontFamily: font.body, fontSize: fontSize.sm },
  threadRef: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },

  /* conversation view */
  bubbleList: { padding: space.md, gap: space.sm },
  bubbleRow: { alignSelf: 'flex-start', maxWidth: '82%', gap: 2 },
  bubbleRowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm },
  bubbleTheirs: { backgroundColor: color.surfaceSunken },
  bubbleMine: { backgroundColor: color.primaryFaint, borderWidth: 1, borderColor: color.primaryBorder },
  bubbleText: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.ink },
  bubbleTime: { fontFamily: font.mono, fontSize: 10, color: color.inkFaint },

  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, padding: space.md, borderTopWidth: 1, borderTopColor: color.border },
  composerInput: { flex: 1, minHeight: 36, maxHeight: 80, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: font.body, fontSize: fontSize.sm, color: color.ink },
  composerSend: { backgroundColor: color.primary, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm },
  composerSendLabel: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.onPrimary },

  /* dock row — right edge pinned via `right`, grows leftward as conversation windows open;
   * every item (conversation windows, then the list card) shares the bottom edge */
  chatWidget: { right: space.xl, bottom: 0, flexDirection: 'row', alignItems: 'flex-end', gap: space.md, zIndex: 80 },
  /* dock bar/header — fixed-height row pinned to the bottom of dockPanel, its top border
   * only drawn while the pane above it is expanded so it reads as one divider, not a
   * doubled edge */
  dockBar: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md },
  dockBarOpen: { borderTopWidth: 1, borderTopColor: color.border },
  dockBarLabel: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.ink },
  dockMark: { width: 14, height: 14, borderRadius: radius.pill, borderWidth: 1.5, borderColor: color.primary },
  dockHeaderPress: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: 1, minWidth: 0 },
  chatBadge: { backgroundColor: color.primary, borderRadius: radius.pill, paddingHorizontal: space.xs, paddingVertical: 1, minWidth: 16, alignItems: 'center' },
  chatBadgeLabel: { fontFamily: font.mono, fontSize: fontSize.micro, color: color.onPrimary },

  dot: { width: 7, height: 7, borderRadius: radius.pill },
});
