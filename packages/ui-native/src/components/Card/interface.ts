/**
 * Card interface (native)
 * Semantic source: packages/ui/src/components/Card/Card.shared.ts
 * Cross-check: Layers jdsCard-4 + jdsCard/generated/interface.ts
 */

import type { ReactNode } from 'react';
import type { ViewStyle, AccessibilityRole } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import type { SurfaceToken } from '@oneui/shared/engine';

export type CardAppearance = ComponentAppearance;
export type SurfaceMode = SurfaceToken;

export interface CardProps {
  /**
   * Surface mode for the card fill. When set, the card becomes a `<Surface>`
   * and children adapt via the resolved appearance context.
   */
  surface?: SurfaceMode;
  /** Appearance role used when `surface` is set (e.g. a secondary-tinted card). */
  appearance?: CardAppearance;
  /** Hover lift + focus halo for clickable cards (on native: Pressable + active opacity/elevation). */
  interactive?: boolean;
  /** Whether the card is disabled (only affects interactive cards). */
  disabled?: boolean;
  /** Additional native styles. */
  style?: ViewStyle;
  /** React Native test identifier. */
  testID?: string;
  /** Describes the result of performing an action (React Native). */
  accessibilityHint?: string;
  /** VoiceOver/TalkBack label. */
  'aria-label'?: string;
  /** Content of the card. */
  children?: ReactNode;
  /** Callback for press events (interactive cards). */
  onPress?: () => void;
  /** Web parity alias for onPress. */
  onClick?: () => void;
}

export function useCardState(props: CardProps) {
  const resolvedAppearance =
    props.appearance === 'auto' || !props.appearance ? 'primary' : props.appearance;

  return {
    resolvedAppearance,
    isInteractive: Boolean(props.interactive && !props.disabled),
    isDisabled: Boolean(props.disabled),
  };
}

export function getCardAccessibilityProps(
  props: Pick<CardProps, 'aria-label' | 'accessibilityHint' | 'interactive' | 'disabled'>,
): {
  accessible: boolean;
  accessibilityRole: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: { disabled: boolean };
} {
  const isInteractive = Boolean(props.interactive && !props.disabled);

  return {
    accessible: true,
    accessibilityRole: isInteractive ? 'button' : 'summary',
    accessibilityLabel: props['aria-label'],
    accessibilityHint: props.accessibilityHint,
    accessibilityState: {
      disabled: Boolean(props.disabled),
    },
  };
}
