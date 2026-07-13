/**
 * SelectableSingleTextButton.shared.ts
 * Shared types and hooks for SelectableSingleTextButton component
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import { useSurfaceAppearance } from '../Surface';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type SelectableSingleTextButtonAppearance = ComponentAppearance;

/** Figma attention alias — drives selected visual prominence */
export type SelectableSingleTextButtonAttention = 'high' | 'medium' | 'low';

/** SelectableSingleTextButton sizes — S/M/L (no XS) aligned with Figma spec */
export type SelectableSingleTextButtonSize = 's' | 'm' | 'l';

export interface SelectableSingleTextButtonProps {
  /**
   * Text label content — max 2 characters (e.g. "Ag", "En", "A", "12").
   * This component renders as a circular button; longer text breaks the shape.
   * Text exceeding 2 characters will be truncated in development with a warning.
   */
  children: ReactNode;

  /** Selected state (controlled). Maps to Toggle pressed. */
  selected?: boolean;
  /** Default selected state (uncontrolled). */
  defaultSelected?: boolean;
  /** Called when selected state changes. */
  onSelectedChange?: (selected: boolean) => void;
  /** Value for use within ToggleGroup. */
  value?: string;

  /** Button size. Default: 'm'. S/M/L only (no XS). */
  size?: SelectableSingleTextButtonSize;
  /**
   * Attention level — determines the visual prominence of the SELECTED state.
   * high → bold fill; medium → subtle fill; low → ghost with accent border.
   * The UNSELECTED state is always muted ghost regardless of attention.
   * Default: 'high'.
   */
  attention?: SelectableSingleTextButtonAttention;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. */
  appearance?: SelectableSingleTextButtonAppearance;
  /**
   * Condensed mode: reduces height and horizontal padding while keeping the same typography.
   */
  condensed?: boolean;
  /** Stretch to fill container width. */
  fullWidth?: boolean;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /**
   * Loading state — shows circular progress indicator replacing the text label.
   * Disables interaction while loading.
   */
  loading?: boolean;

  /** Accessible label for screen readers (optional — children text is visible) */
  'aria-label'?: string;
  /** QA / e2e anchor on the root toggle element */
  'data-testid'?: string;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function useSelectableSingleTextButtonState(props: SelectableSingleTextButtonProps) {
  const {
    size = 'm',
    attention = 'high',
    appearance,
    condensed,
    disabled,
    loading,
  } = props;

  const isDisabled = disabled || loading;

  const parentAppearance = useSurfaceAppearance();
  // Resolve appearance: 'auto' or unset → parentAppearance ?? 'primary'
  const resolvedAppearance =
    appearance && appearance !== 'auto'
      ? appearance
      : (parentAppearance ?? 'primary');

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-attention': attention,
    ...(condensed ? { 'data-condensed': '' } : {}),
    ...(loading ? { 'data-loading': '' } : {}),
  };

  return {
    isDisabled,
    resolvedAppearance,
    inheritedFromSurface: parentAppearance !== null,
    dataAttrs,
  };
}
