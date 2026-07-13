/**
 * Avatar.shared.ts
 * Shared types and hooks for Avatar component
 * Used by both web and React Native implementations
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ButtonAppearance } from '../Button/Button.shared';
import { useSlotParentAppearance } from '../../contexts/SlotParentAppearanceContext';

/** Avatar display content (Figma: Image / icon / text) */
export type AvatarContent = 'image' | 'icon' | 'text';

/** Figma-aligned attention levels (maps to visual emphasis) */
export type AvatarAttention = 'high' | 'medium' | 'low';

/** Multi-accent appearance roles (same 9 roles as Button + auto) */
export type AvatarAppearance = ButtonAppearance;

/**
 * Avatar size — t-shirt scale from 2XS to 2XL + custom (Figma-aligned).
 */
export type AvatarSize =
  | '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | 'custom';

/** Normalise size for `data-size` (identity today; kept for a single call site). */
export function resolveAvatarSize(size: AvatarSize): AvatarSize {
  return size;
}

export interface AvatarProps {
  /** Display content: image, icon, or text (initials). Aligns with Figma property `content`. */
  content?: AvatarContent;
  /** Size preset. Default: 'm' */
  size?: AvatarSize;
  /** Attention level — High (filled), Medium (tinted), Low (transparent). Default: 'high' */
  attention?: AvatarAttention;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. */
  appearance?: AvatarAppearance;
  /** Image source URL (when content is image) */
  src?: string;
  /** Alt text / name used for accessibility and initials extraction */
  alt?: string;
  /** Custom fallback content when image fails or for icon/text content */
  fallback?: ReactNode;
  /** Icon element (when content is icon) */
  icon?: ReactNode;
  /** Custom size in pixels (only when size='custom') */
  customSize?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler — when set, the avatar renders as an interactive Base UI button. */
  onPress?: () => void;
  /** Web alias for `onPress`. */
  onClick?: () => void;
  /** Test automation id — forwarded to the root element. */
  'data-testid'?: string;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Extract initials from a name string (up to 2 characters).
 * Splits on spaces, takes first character of each word.
 */
export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Resolve Avatar state from props — parallel to useButtonState.
 * Returns resolved size, attention, appearance, and data attributes.
 */
export function useAvatarState(props: AvatarProps) {
  const slotParent = useSlotParentAppearance();
  const {
    content = 'image',
    size = 'm',
    attention = 'high',
    appearance,
    disabled = false,
    customSize,
    onPress,
    onClick,
  } = props;

  const isInteractive = !disabled && (onPress != null || onClick != null);

  const resolvedSize = resolveAvatarSize(size);
  const resolvedAttention = attention;
  const resolvedAppearance =
    appearance != null && appearance !== 'auto' ? appearance : (slotParent ?? 'primary');

  const dataAttrs: Record<string, string | undefined> = {
    'data-content': content,
    'data-size': resolvedSize,
    'data-attention': resolvedAttention,
    'data-appearance': resolvedAppearance,
  };

  return {
    resolvedSize,
    resolvedAttention,
    resolvedAppearance,
    isDisabled: disabled,
    isInteractive,
    dataAttrs,
  };
}
