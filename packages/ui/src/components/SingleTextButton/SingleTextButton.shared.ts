/**
 * SingleTextButton.shared.ts
 * Shared types and hooks for SingleTextButton component.
 *
 * Action button (non-toggle) sibling of SelectableSingleTextButton.
 * Circular, max 2 characters. Attention level drives the full visual
 * (high=bold, medium=subtle, low=ghost) — no selected/unselected duality.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import { useSurfaceAppearance } from '../Surface';

/**
 * Multi-accent appearance roles for SingleTextButton.
 * Widens the shared ComponentAppearance with `tertiary` and `quaternary` —
 * SingleTextButton wires CSS classes for both (.appearanceTertiary /
 * .appearanceQuaternary in the module), so the local type intentionally
 * exceeds the canonical 9-role set.
 */
export type SingleTextButtonAppearance = ComponentAppearance | 'tertiary' | 'quaternary';

/** Figma attention alias — drives the visual variant (high/medium/low → bold/subtle/ghost). */
export type SingleTextButtonAttention = 'high' | 'medium' | 'low';

/** Resolved visual variant — derived from attention. */
export type SingleTextButtonVariant = 'bold' | 'subtle' | 'ghost';

/** SingleTextButton sizes — S/M/L aligned with Figma spec (no XS). */
export type SingleTextButtonSize = 's' | 'm' | 'l';

/** Map Figma attention values to code variant values. */
const ATTENTION_TO_VARIANT: Record<SingleTextButtonAttention, SingleTextButtonVariant> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

export interface SingleTextButtonProps {
  /**
   * Text label content — max 2 characters (e.g. "Ag", "En", "A", "12").
   * This component renders as a circular button; longer text breaks the shape.
   * Text exceeding 2 characters will be truncated in development with a warning.
   */
  children: ReactNode;

  /** Button size. Default: 'm'. S/M/L only (no XS). */
  size?: SingleTextButtonSize;
  /**
   * Attention level — drives the visual variant.
   * high → bold fill (solid accent bg, on-bold-high text)
   * medium → subtle fill (tinted bg, accent text)
   * low → ghost (transparent bg, accent text)
   * Default: 'high'.
   */
  attention?: SingleTextButtonAttention;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. Default: 'auto'. */
  appearance?: SingleTextButtonAppearance;
  /**
   * Condensed mode: reduces height and padding while keeping the same typography.
   */
  condensed?: boolean;
  /** Stretch to fill container width — overrides circular shape. */
  fullWidth?: boolean;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /**
   * Loading state — shows circular progress indicator replacing the text label.
   * Disables interaction while loading.
   */
  loading?: boolean;

  onPress?: () => void;
  /** Web-only alias for onPress. */
  onClick?: () => void;

  /** Accessible label for screen readers (optional — children text is visible). */
  'aria-label'?: string;
  /** Additional class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
  /** HTML button type attribute. */
  type?: 'button' | 'submit' | 'reset';
}

export function useSingleTextButtonState(props: SingleTextButtonProps) {
  const {
    size = 'm',
    attention = 'high',
    appearance,
    condensed,
    disabled,
    loading,
  } = props;

  const isDisabled = disabled || loading;

  const resolvedVariant: SingleTextButtonVariant = ATTENTION_TO_VARIANT[attention];

  const parentAppearance = useSurfaceAppearance();
  const resolvedAppearance =
    appearance && appearance !== 'auto'
      ? appearance
      : (parentAppearance ?? 'primary');

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-attention': attention,
    'data-variant': resolvedVariant,
    ...(condensed ? { 'data-condensed': '' } : {}),
    ...(loading ? { 'data-loading': '' } : {}),
  };

  return {
    isDisabled,
    resolvedVariant,
    resolvedAppearance,
    inheritedFromSurface: parentAppearance !== null,
    dataAttrs,
    ariaProps: {
      'aria-disabled': isDisabled,
      'aria-busy': loading,
    },
  };
}
