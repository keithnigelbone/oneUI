/**
 * IconButton.shared.ts
 * Shared types and hooks for IconButton component
 * Used by both web and React Native implementations
 */

import type React from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, MouseEventHandler, ReactElement } from 'react';
import type { ComponentIconInput, IconNameInput, ComponentAppearance } from '@oneui/shared';
import { resolveButtonStateBase, BUTTON_ATTENTION_TO_VARIANT } from '../_shared/buttonStateBase';
import { useSurfaceAppearance } from '../Surface';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type IconButtonAppearance = ComponentAppearance;

/** Public emphasis prop — high (bold fill), medium (subtle fill), low (ghost). */
export type IconButtonAttention = 'high' | 'medium' | 'low';

/** Internal visual variant, derived from `attention`. Not a public prop. */
export type IconButtonVariant = 'bold' | 'subtle' | 'ghost';

const VARIANT_TO_ATTENTION: Record<IconButtonVariant, IconButtonAttention> = {
  bold: 'high',
  subtle: 'medium',
  ghost: 'low',
};

/**
 * IconButton sizes — 6 sizes aligned with Figma spec.
 * Each maps to an f-step: 2XS(4), XS(6), S(8), M(10), L(12), XL(14).
 */
export type IconButtonSize =
  | 4 | 6 | 8 | 10 | 12 | 14
  | '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl'
  // Legacy aliases — map to nearest
  | 'small' | 'medium' | 'large';

/** Shape layout variants */
export type IconButtonLayout = '1:1' | '3:2';

/** Map t-shirt aliases to numeric f-step sizes */
const SIZE_ALIASES: Record<string, number> = {
  '2xs': 4,
  'xs': 6,
  's': 8,
  'm': 10,
  'l': 12,
  'xl': 14,
  // Legacy backward compat
  'small': 8,
  'medium': 10,
  'large': 12,
};

/** Valid Figma-aligned numeric sizes */
const VALID_SIZES = new Set([4, 6, 8, 10, 12, 14]);

/** Fallback accessible name from an icon string (semantic or pack id). */
export function formatIconAriaFallback(icon: IconNameInput): string {
  if (icon.startsWith('Ic')) {
    const words = icon.slice(2).match(/[A-Z][a-z]+/g);
    if (words?.length) {
      const label = words.join(' ').toLowerCase();
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
  }
  const spaced = icon.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** @deprecated Use `formatIconAriaFallback`. */
export const formatSemanticIconAriaFallback = formatIconAriaFallback;

/** Ensures icon-only buttons always expose a non-empty accessible name (WCAG 4.1.2). */
export function resolveIconButtonAccessibleLabel(
  ariaLabel: string | undefined,
  icon: ComponentIconInput | ReactElement,
): string {
  const trimmed = ariaLabel?.trim();
  if (trimmed) return trimmed;
  if (typeof icon === 'string' && icon.trim() !== '') {
    return formatIconAriaFallback(icon);
  }
  return 'Icon button';
}

/** Resolve any IconButtonSize value to a numeric f-step */
export function resolveIconButtonSize(size: IconButtonSize): number {
  if (typeof size === 'number') {
    if (VALID_SIZES.has(size)) return size;
    return 10; // fallback to M
  }
  return SIZE_ALIASES[size] ?? 10;
}

export interface IconButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'disabled' | 'onClick' | 'aria-label' | 'style'> {
  /** Semantic name, pack id (`IcCarSide`), icon component, or React element */
  icon: ComponentIconInput | ReactElement;
  /** Emphasis level — high (bold fill), medium (subtle fill), low (ghost). Default high. */
  attention?: IconButtonAttention;
  /** Button size — f-step number or t-shirt alias. Default: 10 (M). */
  size?: IconButtonSize;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. */
  appearance?: IconButtonAppearance;
  /** Condensed mode: reduces container size while keeping same icon size */
  condensed?: boolean;
  /** Shape layout: '1:1' (square, default) or '3:2' (wide rectangle) */
  layout?: IconButtonLayout;
  /**
   * When true (default), renders a contained icon chip with background and sized
   * container. When false, renders icon only — no background, border, or fixed
   * chip size. `condensed`, `fullWidth`, and `layout="3:2"` only apply when
   * `contained={true}`.
   */
  contained?: boolean;
  /** Stretch to fill container width (maintains height). Only when contained=true. */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state — shows circular progress indicator */
  loading?: boolean;
  /** Press/click handler */
  onPress?: () => void;
  /** Web-only alias for onPress */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Required accessibility label (icon-only buttons must have this) */
  'aria-label': string;
  /** Expanded state when the icon button controls collapsible content. */
  'aria-expanded'?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Hook for IconButton state management
 * Shared between web and native implementations
 */
export function useIconButtonState(props: IconButtonProps) {
  const parentAppearance = useSurfaceAppearance();
  const { isDisabled, resolvedVariant, resolvedAppearance } =
    resolveButtonStateBase<IconButtonVariant>(props, BUTTON_ATTENTION_TO_VARIANT, 'bold', parentAppearance);

  const contained = props.contained !== false;

  // Resolve numeric size
  const numericSize = resolveIconButtonSize(props.size ?? 10);

  const dataAttrs: Record<string, string | undefined> = {
    // Lets the Advanced Editor scope per-component colour overrides to the
    // element (not the preview wrapper) so role tokens still remap inside
    // [data-surface] contexts — keeps surface-context adaptation working.
    'data-oneui-component': 'IconButton',
    'data-variant': resolvedVariant,
    'data-attention': VARIANT_TO_ATTENTION[resolvedVariant],
    'data-appearance': resolvedAppearance,
    'data-size': String(numericSize),
    'data-contained': String(contained),
    ...(props.condensed && contained ? { 'data-condensed': '' } : {}),
    ...(props.layout === '3:2' && contained ? { 'data-layout': '3:2' } : {}),
    ...(props.loading ? { 'data-loading': '' } : {}),
  };

  const resolvedAriaLabel = resolveIconButtonAccessibleLabel(props['aria-label'], props.icon);

  return {
    isDisabled,
    resolvedVariant,
    resolvedAppearance,
    inheritedFromSurface: parentAppearance !== null,
    numericSize,
    contained,
    fullWidth: Boolean(props.fullWidth && contained),
    ariaProps: {
      'aria-disabled': isDisabled,
      'aria-busy': props.loading,
      'aria-label': resolvedAriaLabel,
      'aria-expanded': props['aria-expanded'],
    },
    dataAttrs,
  };
}
