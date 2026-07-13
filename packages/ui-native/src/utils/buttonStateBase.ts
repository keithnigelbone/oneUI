/**
 * Shared disabled / variant / appearance resolver for native button-family components.
 */

import type { ComponentAppearance } from '@oneui/shared';

export type ButtonFamilyAttention = 'high' | 'medium' | 'low';

export const BUTTON_ATTENTION_TO_VARIANT = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
} as const satisfies Record<ButtonFamilyAttention, 'bold' | 'subtle' | 'ghost'>;

type ResolvedAppearance = Exclude<ComponentAppearance, 'auto'>;

export function resolveButtonStateBase<V extends string>(
  props: {
    variant?: V;
    attention?: ButtonFamilyAttention;
    appearance?: ComponentAppearance;
    disabled?: boolean;
    loading?: boolean;
  },
  attentionToVariant: Record<ButtonFamilyAttention, V>,
  defaultVariant: V,
): {
  isDisabled: boolean;
  resolvedVariant: V;
  resolvedAppearance: ResolvedAppearance;
} {
  // `disabled` is the ONLY thing that marks the control disabled across the
  // whole button family. `loading` is a *busy* state (surfaced via `aria-busy`);
  // components suppress activation while busy themselves (e.g. an
  // `isInteractionBlocked = isDisabled || loading` guard) so a spinner can't be
  // re-pressed — but a loading button is not dimmed / `accessibilityState.disabled`.
  const isDisabled = Boolean(props.disabled);

  const resolvedVariant: V =
    props.variant ?? (props.attention ? attentionToVariant[props.attention] : defaultVariant);

  const resolvedAppearance: ResolvedAppearance =
    props.appearance === 'auto' || !props.appearance
      ? 'primary'
      : (props.appearance as ResolvedAppearance);

  return { isDisabled, resolvedVariant, resolvedAppearance };
}
