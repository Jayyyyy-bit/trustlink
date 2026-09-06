// features/quotation/components/Glyphs.tsx
// Thin wrappers around lucide-react-native icons, grouped here since each call site
// used to import a shape-only glyph from this file — kept as the single place that
// picks icon + size + colour for this feature.
import { X, Check, ChevronDown, Lock } from 'lucide-react-native';
import { color, iconSize } from '../../../components/ui/tokens';

export function XGlyph({ tone }: { tone: string }) {
  return <X size={iconSize.xs} color={tone} strokeWidth={2} />;
}

export function CheckGlyph() {
  return <Check size={iconSize.xs} color={color.onPrimary} strokeWidth={2.5} />;
}

export function ChevronGlyph({ open }: { open: boolean }) {
  return (
    <ChevronDown
      size={iconSize.sm}
      color={color.inkFaint}
      strokeWidth={1.75}
      style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
    />
  );
}

export function LockGlyph() {
  return <Lock size={iconSize.xl} color={color.primary} strokeWidth={1.75} />;
}
