import { X } from 'lucide-react-native';
import { iconSize } from '../../../components/ui/tokens';

export function XGlyph({ tone }: { tone: string }) {
  return <X size={iconSize.sm} color={tone} strokeWidth={1.75} />;
}
