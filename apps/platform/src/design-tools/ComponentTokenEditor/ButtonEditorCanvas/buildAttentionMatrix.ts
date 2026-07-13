import type { ButtonVariant, ButtonSize } from '@oneui/ui/components/Button';
import type { ComponentAppearance } from '@oneui/shared';

export type AttentionLevel = 'high' | 'medium' | 'low';

export interface AttentionRow {
  variant: ButtonVariant;
  attention: AttentionLevel;
  label: string;
}

export const DEFAULT_ATTENTION_ROWS: readonly AttentionRow[] = [
  { variant: 'bold', attention: 'high', label: 'High' },
  { variant: 'subtle', attention: 'medium', label: 'Medium' },
  { variant: 'ghost', attention: 'low', label: 'Low' },
] as const;

export interface CellKey {
  appearance: ComponentAppearance;
  variant: ButtonVariant;
  size: ButtonSize;
}

export function cellKeyToString({ appearance, variant, size }: CellKey): string {
  return `${appearance}::${variant}::${size}`;
}

export interface InferredSelectionScope {
  scope: 'global' | 'variant' | 'size' | 'variant-size';
  variant?: ButtonVariant;
  size?: ButtonSize;
  appearance?: ComponentAppearance;
}

export function inferSelectionScope(cells: readonly CellKey[]): InferredSelectionScope {
  if (cells.length === 0) return { scope: 'global' };

  const variants = new Set(cells.map((c) => c.variant));
  const sizes = new Set(cells.map((c) => c.size));
  const appearances = new Set(cells.map((c) => c.appearance));

  const sameVariant = variants.size === 1;
  const sameSize = sizes.size === 1;
  const sameAppearance = appearances.size === 1;

  const variant = sameVariant ? [...variants][0] : undefined;
  const size = sameSize ? [...sizes][0] : undefined;
  const appearance = sameAppearance ? [...appearances][0] : undefined;

  if (sameVariant && sameSize) return { scope: 'variant-size', variant, size, appearance };
  if (sameVariant) return { scope: 'variant', variant, appearance };
  if (sameSize) return { scope: 'size', size, appearance };
  return { scope: 'global', appearance };
}

export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
