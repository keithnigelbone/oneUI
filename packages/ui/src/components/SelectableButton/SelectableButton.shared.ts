/**
 * SelectableButton.shared.ts
 * Shared types and hooks for SelectableButton component
 */

import type { CSSProperties, ReactNode } from 'react';

import type { ComponentAppearance } from '@oneui/shared';
import { useSurfaceAppearance } from '../Surface';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type SelectableButtonAppearance = ComponentAppearance;

/** Figma attention alias — drives selected visual prominence */
export type SelectableButtonAttention = 'high' | 'medium' | 'low';

/** Selectable button sizes aligned with Figma spec */
export type SelectableButtonSize = 'xs' | 's' | 'm' | 'l';

export interface SelectableButtonProps {
  /** Selected state (controlled). Maps to Toggle pressed. */
  selected?: boolean;
  /** Default selected state (uncontrolled). */
  defaultSelected?: boolean;
  /** Called when selected state changes. */
  onSelectedChange?: (selected: boolean) => void;
  /** Value for use within ToggleGroup. */
  value?: string;

  /** Button size. Default: 'm'. */
  size?: SelectableButtonSize;
  /**
   * Attention level — determines the visual prominence of the SELECTED state.
   * high → bold fill; medium → subtle fill; low → ghost with accent border.
   * The UNSELECTED state is always muted ghost regardless of attention.
   * Default: 'high'.
   */
  attention?: SelectableButtonAttention;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. */
  appearance?: SelectableButtonAppearance;
  /**
   * When true (default), renders a pill container with background, border, and padding.
   * When false, renders inline text/icon only — no background, border, or padding.
   * condensed and fullWidth do not apply when contained=false.
   */
  contained?: boolean;
  /**
   * Condensed mode: reduces height and horizontal padding while keeping the same typography.
   * Only applies when contained=true.
   */
  condensed?: boolean;
  /**
   * Stretch to fill container width.
   * Only applies when contained=true.
   */
  fullWidth?: boolean;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Loading state — disables interaction and shows reduced opacity. */
  loading?: boolean;

  /** Content to render before the label (icon, etc.) */
  start?: ReactNode;
  /** Content to render after the label (icon, etc.) */
  end?: ReactNode;

  /** Text label content */
  children?: ReactNode;
  /** Accessible label for screen readers */
  'aria-label'?: string;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function useSelectableButtonState(props: SelectableButtonProps) {
  const {
    size = 'm',
    attention = 'high',
    appearance,
    contained = true,
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
    'data-contained': String(contained),
    ...(condensed && contained ? { 'data-condensed': '' } : {}),
    ...(loading ? { 'data-loading': '' } : {}),
  };

  return {
    isDisabled,
    resolvedAppearance,
    inheritedFromSurface: parentAppearance !== null,
    dataAttrs,
  };
}
