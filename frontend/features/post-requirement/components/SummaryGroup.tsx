import { View } from 'react-native';
import type { ReactNode } from 'react';
import { space } from '../../../components/ui/tokens';
import { SectionLabel } from './SectionLabel';

export function SummaryGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: space.sm }}>
      <SectionLabel>{title}</SectionLabel>
      {children}
    </View>
  );
}
