// features/quotation/components/ScopeSidebarCard.tsx
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, font, fontSize, lineHeight, letterSpacing, space, radius, elevation } from '../../../components/ui/tokens';
import type { Business, BusinessId, Requirement } from '../../../lib/types';
import { formatBudget } from '../format';
import { SectionLabel } from './SectionLabel';
import { ChevronGlyph } from './Glyphs';
import { BuyerIdentityRow } from './BuyerIdentityRow';
import { FactBlock } from './FactBlock';
import { AttachmentLink } from './AttachmentLink';

export function ScopeSidebarCard({
  requirement,
  buyer,
  onOpenBuyer,
}: {
  requirement: Requirement;
  buyer: Business;
  onOpenBuyer?: (businessId: BusinessId) => void;
}) {
  const [showSpec, setShowSpec] = useState(false);
  const [showScope, setShowScope] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  return (
    <View style={styles.sidebarCard}>
      <SectionLabel>What you are pricing</SectionLabel>
      <Text style={styles.sidebarTitle}>{requirement.title}</Text>

      <BuyerIdentityRow buyer={buyer} onOpenBuyer={onOpenBuyer} />

      <View style={styles.sidebarFacts}>
        <FactBlock label="Indicative budget" value={formatBudget(requirement.budgetMin, requirement.budgetMax)} />
        <FactBlock label="Needed by" value={requirement.deliveryWindow} />
        <FactBlock label="Location" value={requirement.deliverySite.address} />
      </View>

      <View style={styles.sidebarDivided}>
        <SectionLabel>Scope</SectionLabel>
        <Text style={styles.sidebarScopeText} numberOfLines={showScope ? undefined : 2}>{requirement.scope}</Text>
        <Pressable onPress={() => setShowScope((v) => !v)} hitSlop={4}>
          <Text style={styles.sidebarMoreLink}>{showScope ? 'Less' : 'More'}</Text>
        </Pressable>
      </View>

      <View style={styles.sidebarDivided}>
        <Pressable onPress={() => setShowSpec((v) => !v)} style={styles.specDisclosureRow} hitSlop={4}>
          <SectionLabel>Specification</SectionLabel>
          <ChevronGlyph open={showSpec} />
        </Pressable>
        {showSpec && (
          <View style={styles.specTable}>
            {requirement.specifications.map((row, i) => (
              <View key={row.label} style={[styles.specRow, i % 2 === 1 ? styles.specRowAlt : null]}>
                <Text style={styles.specKey}>{row.label}</Text>
                <Text style={styles.specValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {requirement.attachments.length > 0 && (
        <View style={styles.sidebarDivided}>
          <Pressable onPress={() => setShowAttachments((v) => !v)} style={styles.specDisclosureRow} hitSlop={4}>
            <SectionLabel>Buyer attachments</SectionLabel>
            <ChevronGlyph open={showAttachments} />
          </Pressable>
          {showAttachments && (
            <View style={{ gap: space.sm, marginTop: space.sm }}>
              {requirement.attachments.map((a) => (
                <AttachmentLink key={a.id} attachment={a} />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarCard: { ...elevation.cardRaised, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.md, gap: space.sm },
  sidebarTitle: { fontFamily: font.display, fontSize: fontSize.md, lineHeight: lineHeight.md, letterSpacing: letterSpacing.tight, color: color.ink },
  sidebarFacts: { gap: space.sm, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: color.borderFaint },
  sidebarDivided: { paddingTop: space.sm, borderTopWidth: 1, borderTopColor: color.borderFaint },
  sidebarScopeText: { marginTop: space.sm, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  sidebarMoreLink: { marginTop: space.xs, fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.primary },
  specDisclosureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  specTable: { marginTop: space.sm, borderWidth: 1, borderColor: color.borderFaint, borderRadius: radius.lg, overflow: 'hidden' },
  specRow: { padding: space.sm, borderBottomWidth: 1, borderBottomColor: color.borderFaint },
  specRowAlt: { backgroundColor: color.surfaceSunken },
  specKey: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkFaint },
  specValue: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
});
