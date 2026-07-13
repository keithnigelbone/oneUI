/**
 * LinkButton interface (native)
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import {
  BUTTON_ATTENTION_TO_VARIANT,
  resolveButtonStateBase,
} from '../../utils/buttonStateBase';
import { buildButtonFamilyPressableAccessibility } from '../../utils/buttonFamilyA11y';

export type LinkButtonAppearance = ComponentAppearance;
export type LinkButtonAttention = 'high' | 'medium' | 'low';
export type LinkButtonVariant = 'bold' | 'subtle' | 'ghost';
export type LinkButtonSize =
  | 6
  | 8
  | 10
  | 12
  | 'xs'
  | 's'
  | 'm'
  | 'l'
  | 'small'
  | 'medium'
  | 'large';

const SIZE_ALIASES: Record<string, number> = {
  xs: 6,
  s: 8,
  m: 10,
  l: 12,
  small: 8,
  medium: 10,
  large: 12,
};

const VALID_SIZES = new Set([6, 8, 10, 12]);

export function resolveLinkButtonSize(size: LinkButtonSize): number {
  if (typeof size === 'number') {
    if (VALID_SIZES.has(size)) return size;
    return 10;
  }
  return SIZE_ALIASES[size] ?? 10;
}

export interface LinkButtonProps {
  children: ReactNode;
  variant?: LinkButtonVariant;
  attention?: LinkButtonAttention;
  size?: LinkButtonSize;
  appearance?: LinkButtonAppearance;
  start?: ReactNode;
  end?: ReactNode;
  showUnderline?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  onClick?: () => void;
  'aria-label'?: string;
  style?: ViewStyle;
  accessibilityHint?: string;
  testID?: string;
}

export function useLinkButtonState(props: LinkButtonProps) {
  const { isDisabled, resolvedVariant, resolvedAppearance } =
    resolveButtonStateBase<LinkButtonVariant>(props, BUTTON_ATTENTION_TO_VARIANT, 'bold');

  const numericSize = resolveLinkButtonSize(props.size ?? 10);

  const dataAttrs: Record<string, string | undefined> = {
    'data-variant': resolvedVariant,
    'data-appearance': resolvedAppearance,
    'data-size': String(numericSize),
    ...(props.loading ? { 'data-loading': '' } : {}),
    ...(props.showUnderline === false ? { 'data-underline': 'none' } : {}),
  };

  return {
    isDisabled,
    resolvedVariant,
    resolvedAppearance,
    numericSize,
    ariaProps: {
      'aria-disabled': isDisabled,
      'aria-busy': props.loading,
    },
    dataAttrs,
  };
}

export function resolveLinkButtonAccessibilityLabel(
  props: Pick<LinkButtonProps, 'aria-label' | 'children'>,
): string | undefined {
  if (props['aria-label']) return props['aria-label'];
  if (typeof props.children === 'string' || typeof props.children === 'number') {
    return String(props.children);
  }
  return undefined;
}

export interface LinkButtonAccessibilityProps {
  accessible: true;
  focusable: true;
  accessibilityRole: 'link';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: { disabled: boolean; busy: boolean };
  'aria-disabled': boolean;
  'aria-busy': boolean;
}

export function getLinkButtonAccessibilityProps(
  props: Pick<
    LinkButtonProps,
    'aria-label' | 'children' | 'accessibilityHint' | 'loading' | 'disabled'
  >,
  state: { isDisabled: boolean },
): LinkButtonAccessibilityProps {
  const pressable = buildButtonFamilyPressableAccessibility(
    {
      isDisabled: state.isDisabled,
      loading: props.loading,
      accessibilityLabel: resolveLinkButtonAccessibilityLabel(props),
      accessibilityHint: props.accessibilityHint,
    },
    { role: 'link' },
  );
  return {
    accessible: pressable.accessible,
    focusable: pressable.focusable,
    accessibilityRole: 'link',
    accessibilityLabel: pressable.accessibilityLabel,
    accessibilityHint: pressable.accessibilityHint,
    accessibilityState: pressable.accessibilityState,
    'aria-disabled': state.isDisabled,
    'aria-busy': Boolean(props.loading),
  };
}

export const LINK_BUTTON_LOADING_SLOT_A11Y = {
  'aria-hidden': true as const,
};
