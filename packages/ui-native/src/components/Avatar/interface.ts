/**
 * Avatar interface (native)
 *
 * Mirrors `packages/ui/src/components/Avatar/Avatar.shared.ts`. Native uses
 * the same `content` prop (`'image' | 'icon' | 'text'`) and the same
 * t-shirt size scale (`'2xs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | 'custom'`).
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import { useSlotParentAppearance } from '../../slots/SlotParentAppearanceContext.native';

export type AvatarContent = 'image' | 'icon' | 'text';
export type AvatarAttention = 'high' | 'medium' | 'low';
export type AvatarAppearance = ComponentAppearance;
export type AvatarSize = '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | 'custom';

/** Identity passthrough — kept for symmetry with the web shared API. */
export function resolveAvatarSize(size: AvatarSize): AvatarSize {
  return size;
}

export interface AvatarProps {
  /** Display content. Aligns with Figma `content` property. Default: `'image'`. */
  content?: AvatarContent;
  size?: AvatarSize;
  attention?: AvatarAttention;
  appearance?: AvatarAppearance;
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  icon?: ReactNode;
  customSize?: number;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
  /** React Native test identifier (mirrors Layers RN `testID`). */
  testID?: string;
}

export type AvatarNativeProps = AvatarProps;

export function resolveAvatarIconSlotColor(paint: {
  iconColor?: string;
  textColor: string;
}): string {
  return paint.textColor;
}

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

export function useAvatarState(props: AvatarProps) {
  const slotParent = useSlotParentAppearance();
  const {
    content = 'image',
    size = 'm',
    attention = 'high',
    appearance,
    disabled = false,
  } = props;

  const resolvedSize = resolveAvatarSize(size);
  const resolvedContent = content;
  const resolvedAttention = attention;
  // Mirrors web `Avatar.shared.ts`: explicit role wins, else inherit from a
  // slot-owning parent (Badge / Button / …), else `'primary'`.
  const resolvedAppearance: Exclude<AvatarAppearance, 'auto'> =
    appearance != null && appearance !== 'auto'
      ? (appearance as Exclude<AvatarAppearance, 'auto'>)
      : (slotParent ?? 'primary');

  const dataAttrs: Record<string, string | undefined> = {
    'data-content': resolvedContent,
    'data-size': resolvedSize,
    'data-attention': resolvedAttention,
    'data-appearance': resolvedAppearance,
  };

  return {
    resolvedSize,
    resolvedContent,
    resolvedAttention,
    resolvedAppearance,
    isDisabled: disabled,
    dataAttrs,
  };
}

export function getAvatarAccessibilityProps(
  props: Pick<AvatarProps, 'alt' | 'accessibilityHint'>,
  isDisabled: boolean,
): {
  accessible: true;
  accessibilityRole: 'image';
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityState: { disabled: boolean };
} {
  return {
    accessible: true,
    accessibilityRole: 'image',
    accessibilityLabel: props.alt || 'avatar',
    accessibilityHint: props.accessibilityHint,
    accessibilityState: { disabled: isDisabled },
  };
}
