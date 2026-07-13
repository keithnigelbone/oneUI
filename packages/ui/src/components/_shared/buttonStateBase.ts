/**
 * buttonStateBase.ts
 * Shared resolver for the disabled / variant / appearance triplet used by
 * Button, IconButton, and LinkButton. Each component still computes its own
 * numericSize via a role-specific resolver after calling this factory.
 */

import type { ComponentAppearance } from '@oneui/shared';

/** Figma-aligned attention alias shared by Button / IconButton / LinkButton. */
type AttentionLevel = 'high' | 'medium' | 'low';

/**
 * Shared attention → variant map for Button / IconButton / LinkButton.
 * All three components expose the same `'bold' | 'subtle' | 'ghost'`
 * variant union, so the mapping is identical across them.
 */
export const BUTTON_ATTENTION_TO_VARIANT = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
} as const satisfies Record<AttentionLevel, 'bold' | 'subtle' | 'ghost'>;

/** Minimum prop surface required by the shared resolver. */
interface ButtonStateBaseProps {
  attention?: AttentionLevel;
  appearance?: ComponentAppearance;
  disabled?: boolean;
  loading?: boolean;
}

interface ButtonStateBaseResult<V extends string> {
  isDisabled: boolean;
  resolvedVariant: V;
  resolvedAppearance: Exclude<ComponentAppearance, 'auto'>;
}

// Single resolver shared by Button / IconButton / LinkButton state hooks.
export function resolveButtonStateBase<V extends string>(
  props: ButtonStateBaseProps,
  attentionToVariant: Record<AttentionLevel, V>,
  defaultVariant: V,
  parentAppearance: Exclude<ComponentAppearance, 'auto'> | null = null,
): ButtonStateBaseResult<V> {
  const isDisabled = Boolean(props.disabled || props.loading);

  // Visual variant is an internal detail derived solely from `attention`
  // (the public emphasis prop). Components still emit `data-variant` for CSS.
  const resolvedVariant: V =
    props.attention ? attentionToVariant[props.attention] : defaultVariant;

  const resolvedAppearance =
    props.appearance && props.appearance !== 'auto'
      ? (props.appearance as Exclude<ComponentAppearance, 'auto'>)
      : (parentAppearance ?? 'primary');

  return { isDisabled, resolvedVariant, resolvedAppearance };
}
