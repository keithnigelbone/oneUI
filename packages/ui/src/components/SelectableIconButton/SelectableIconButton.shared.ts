/**
 * SelectableIconButton.shared.ts
 * Shared types and hooks for SelectableIconButton component
 */

import type { CSSProperties, ReactElement } from 'react';
import type { ComponentIconInput, ComponentAppearance } from '@oneui/shared';
import { useSurfaceAppearance } from '../Surface';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type SelectableIconButtonAppearance = ComponentAppearance;

/** Figma attention alias — drives selected visual prominence */
export type SelectableIconButtonAttention = 'high' | 'medium' | 'low';

/**
 * SelectableIconButton sizes — 6 sizes aligned with Figma spec.
 * Each maps to an f-step: 2XS(4), XS(6), S(8), M(10), L(12), XL(14).
 */
export type SelectableIconButtonSize =
  | 4 | 6 | 8 | 10 | 12 | 14
  | '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl';

/** Shape proportion variants (Figma: "shape") */
export type SelectableIconButtonShape = '1:1' | '2:3';

/** Map t-shirt aliases to numeric f-step sizes */
const SIZE_ALIASES: Record<string, number> = {
  '2xs': 4,
  'xs': 6,
  's': 8,
  'm': 10,
  'l': 12,
  'xl': 14,
};

/** Valid Figma-aligned numeric sizes */
export const VALID_SIZES = new Set([4, 6, 8, 10, 12, 14]);

/** Resolve any SelectableIconButtonSize value to a numeric f-step */
export function resolveSelectableIconButtonSize(size: SelectableIconButtonSize): number {
  if (typeof size === 'number') {
    if (VALID_SIZES.has(size)) return size;
    return 10; // fallback to M
  }
  return SIZE_ALIASES[size] ?? 10;
}

export interface SelectableIconButtonProps {
  icon: ComponentIconInput | ReactElement;
  /** Selected state (controlled). Maps to Toggle pressed. */
  selected?: boolean;
  /** Default selected state (uncontrolled). */
  defaultSelected?: boolean;
  /** Called when selected state changes. */
  onSelectedChange?: (selected: boolean) => void;
  /** Value for use within ToggleGroup. */
  value?: string;
  /**
   * Attention level — determines the visual prominence of the SELECTED state.
   * high → bold fill; medium → subtle fill; low → ghost with accent border.
   * The UNSELECTED state is always muted ghost regardless of attention.
   * Default: 'high'.
   */
  attention?: SelectableIconButtonAttention;
  /** Button size — f-step number or t-shirt alias. Default: 10 (M). */
  size?: SelectableIconButtonSize;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. */
  appearance?: SelectableIconButtonAppearance;
  /** Condensed mode: reduces container size while keeping same icon size */
  condensed?: boolean;
  /** Shape proportion: '1:1' (square, default) or '2:3' (wide rectangle) */
  shape?: SelectableIconButtonShape;
  /**
   * When true (default), renders a contained icon button with background, border, and sized container.
   * When false, renders just the icon without container — no background, border, or fixed size.
   * condensed and fullWidth do not apply when contained=false.
   */
  contained?: boolean;
  /**
   * Stretch to fill container width.
   * Only applies when contained=true.
   */
  fullWidth?: boolean;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Loading state — shows circular progress indicator */
  loading?: boolean;
  /** Required accessibility label (icon-only buttons must have this) */
  'aria-label': string;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Hook for SelectableIconButton state management
 */
export function useSelectableIconButtonState(props: SelectableIconButtonProps) {
  const {
    attention = 'high',
    size = 10,
    appearance,
    condensed,
    shape,
    contained = true,
    fullWidth,
    loading,
    disabled,
  } = props;

  const isDisabled = disabled || loading;

  const parentAppearance = useSurfaceAppearance();
  // Resolve appearance: 'auto' or unset → parentAppearance ?? 'primary'
  const resolvedAppearance =
    appearance && appearance !== 'auto'
      ? appearance
      : (parentAppearance ?? 'primary');

  // Resolve numeric size
  const numericSize = resolveSelectableIconButtonSize(size);

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': String(numericSize),
    'data-attention': attention,
    'data-contained': String(contained),
    ...(condensed && contained ? { 'data-condensed': '' } : {}),
    ...(shape === '2:3' ? { 'data-shape': '2:3' } : {}),
    ...(loading ? { 'data-loading': '' } : {}),
  };

  return {
    isDisabled,
    resolvedAppearance,
    inheritedFromSurface: parentAppearance !== null,
    numericSize,
    contained,
    fullWidth: fullWidth && contained,
    dataAttrs,
  };
}
