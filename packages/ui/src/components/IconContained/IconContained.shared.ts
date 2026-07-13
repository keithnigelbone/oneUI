/**
 * IconContained.shared.ts
 * Shared types and hooks for IconContained component
 * Used by both web and React Native implementations
 */

import type { CSSProperties, ReactElement } from 'react';
import type { ButtonAppearance } from '../Button/Button.shared';
import type { ComponentIconInput } from '@oneui/shared';

/** Figma-aligned attention levels (maps to visual emphasis) */
export type IconContainedAttention = 'high' | 'medium';

/** Multi-accent appearance roles (same 9 roles as Button + auto) */
export type IconContainedAppearance = ButtonAppearance;

/** IconContained size — t-shirt scale from XS to XL */
export type IconContainedSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface IconContainedProps {
  icon: ComponentIconInput | ReactElement;
  /** Size preset. Default: 'm' */
  size?: IconContainedSize;
  /** Attention level — High (solid bold fill), Medium (subtle tinted fill). Default: 'medium' */
  attention?: IconContainedAttention;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. Default: 'secondary'. */
  appearance?: IconContainedAppearance;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Accessible label for the icon */
  'aria-label'?: string;
}

/**
 * Resolve IconContained state from props — parallel to useAvatarState.
 * Returns resolved size, attention, appearance, and data attributes.
 */
export function useIconContainedState(props: IconContainedProps) {
  const {
    size = 'm',
    attention = 'medium',
    appearance = 'secondary',
    disabled = false,
  } = props;

  const resolvedAttention = attention;
  const resolvedAppearance = appearance === 'auto' || !appearance ? 'primary' : appearance;

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-attention': resolvedAttention,
    'data-appearance': resolvedAppearance,
  };

  return {
    resolvedSize: size,
    resolvedAttention,
    resolvedAppearance,
    isDisabled: disabled,
    dataAttrs,
  };
}
