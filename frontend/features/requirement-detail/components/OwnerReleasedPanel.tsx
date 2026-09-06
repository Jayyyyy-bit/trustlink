// features/requirement-detail/components/OwnerReleasedPanel.tsx

import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, lineHeight, space } from '../../../components/ui/tokens';
import type { OwnerReleasedProps } from '../RequirementDetail';
import { formatDateTime } from '../format';
import { useOwnerReleased } from '../useOwnerReleased';
import { SectionLabel } from './SectionLabel';
import { SortBar } from './SortBar';
import { QuotationCard } from './QuotationCard';
import { AwardConfirmationModal } from './AwardConfirmationModal';

export function OwnerReleasedPanel(props: OwnerReleasedProps) {
  const st = useOwnerReleased(props);

  return (
    <View style={{ gap: space.lg }}>
      <SectionLabel>{`${st.visible.length} quotation${st.visible.length === 1 ? '' : 's'} released`}</SectionLabel>
      <SortBar activeKey={st.sortKey} activeDir={st.sortDir} onPress={st.handleSortPress} />
      <View style={{ gap: space.md }}>
        {st.sorted.map((q) => {
          const predecessor = st.withdrawn.find((w) => w.replacedByQuotationId === q.id) ?? null;
          return (
            <QuotationCard
              key={q.id}
              quotation={q}
              respondent={st.respondents[q.respondentId]}
              awardLocked={st.awardedId !== null}
              predecessor={predecessor}
              onToggleShortlist={() => st.handleToggleShortlist(q.id)}
              onRequestAward={() => st.setAwardTargetId(q.id)}
            />
          );
        })}
      </View>
      {st.orphanWithdrawn.length > 0 && (
        <View style={{ gap: space.sm }}>
          <SectionLabel>Withdrawn</SectionLabel>
          {st.orphanWithdrawn.map((w) => (
            <Text key={w.id} style={styles.mutedRow}>
              {w.ref} — withdrawn {w.withdrawnAt ? formatDateTime(w.withdrawnAt) : ''}
            </Text>
          ))}
        </View>
      )}
      <AwardConfirmationModal
        visible={st.awardTargetId !== null}
        respondentName={st.awardTargetName}
        onCancel={() => st.setAwardTargetId(null)}
        onConfirm={() => {
          if (st.awardTargetId) st.handleConfirmAward(st.awardTargetId);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mutedRow: {
    fontFamily: font.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: color.inkFaint,
  },
});
