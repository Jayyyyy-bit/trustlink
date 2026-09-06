// features/quotation/components/BuyerIdentityRow.tsx
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { color, font, fontSize, radius, space } from '../../../components/ui/tokens';
import { AvatarChip, initials } from '../../../components/ui/AvatarChip';
import type { Business, BusinessId } from '../../../lib/types';
import { buyerRowHoverTransitionOnWeb } from '../sharedStyles';
import { VerifiedTierTag } from './VerifiedTierTag';

export function BuyerIdentityRow({ buyer, onOpenBuyer }: { buyer: Business; onOpenBuyer?: (businessId: BusinessId) => void }) {
  const buyerName = buyer.displayName ?? buyer.registeredName;
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={() => onOpenBuyer?.(buyer.id)}
      {...(Platform.OS === 'web' ? { onHoverIn: () => setHovered(true), onHoverOut: () => setHovered(false) } : null)}
      style={[styles.sidebarBuyerRow, buyerRowHoverTransitionOnWeb, hovered ? styles.sidebarBuyerRowHovered : null]}
    >
      <AvatarChip label={initials(buyerName)} size={32} />
      <Text style={[styles.sidebarBuyerName, hovered ? styles.sidebarBuyerNameHovered : null]}>{buyerName}</Text>
      <VerifiedTierTag tier={buyer.credibility.tier} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sidebarBuyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
    marginHorizontal: -space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.lg,
  },
  sidebarBuyerRowHovered: { backgroundColor: color.surfaceSunken },
  sidebarBuyerName: { fontFamily: font.display, fontSize: fontSize.sm, color: color.ink },
  sidebarBuyerNameHovered: { color: color.primary },
});
