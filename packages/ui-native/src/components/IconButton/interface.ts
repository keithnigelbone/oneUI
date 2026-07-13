/**
 * IconButton interface (native)
 */

import type { ReactElement } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance, IconComponent, SemanticIconName } from '@oneui/shared';
import {
  BUTTON_ATTENTION_TO_VARIANT,
  resolveButtonStateBase,
} from '../../utils/buttonStateBase';
import { buildButtonFamilyPressableAccessibility } from '../../utils/buttonFamilyA11y';

export type IconButtonAppearance = ComponentAppearance;
export type IconButtonAttention = 'high' | 'medium' | 'low';
/** Internal paint mode resolved from {@link IconButtonAttention}. */
export type IconButtonPaintMode = 'bold' | 'subtle' | 'ghost';
export type IconButtonSize =
  | 4
  | 6
  | 8
  | 10
  | 12
  | 14
  | '2xs'
  | 'xs'
  | 's'
  | 'm'
  | 'l'
  | 'xl'
  | 'small'
  | 'medium'
  | 'large';
export type IconButtonLayout = '1:1' | '3:2';

const SIZE_ALIASES: Record<string, number> = {
  '2xs': 4,
  xs: 6,
  s: 8,
  m: 10,
  l: 12,
  xl: 14,
  small: 8,
  medium: 10,
  large: 12,
};

const VALID_SIZES = new Set([4, 6, 8, 10, 12, 14]);

export function resolveIconButtonSize(size: IconButtonSize): number {
  if (typeof size === 'number') {
    if (VALID_SIZES.has(size)) return size;
    return 10;
  }
  return SIZE_ALIASES[size] ?? 10;
}

export interface IconButtonProps {
  icon: SemanticIconName | ReactElement | IconComponent;
  attention?: IconButtonAttention;
  size?: IconButtonSize;
  appearance?: IconButtonAppearance;
  /**
   * When true (default), renders a contained icon chip with background + sized
   * container. When false, renders the bare icon (transparent, icon-sized, no
   * padding) — `condensed` / `layout` / `fullWidth` are ignored. Mirrors web.
   */
  contained?: boolean;
  condensed?: boolean;
  layout?: IconButtonLayout;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  onClick?: () => void;
  'aria-label': string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree';
  style?: ViewStyle;
  /** React Native test identifier (mirrors Layers RN `testID`). */
  testID?: string;
  accessibilityHint?: string;
}

export type IconButtonNativeProps = IconButtonProps;

export function useIconButtonState(props: IconButtonProps) {
  const { isDisabled, resolvedVariant, resolvedAppearance } =
    resolveButtonStateBase<IconButtonPaintMode>(
      {
        attention: props.attention,
        appearance: props.appearance,
        disabled: props.disabled,
        loading: props.loading,
      },
      BUTTON_ATTENTION_TO_VARIANT,
      'bold',
    );

  const numericSize = resolveIconButtonSize(props.size ?? 10);
  const contained = props.contained !== false;
  const resolvedAttention: IconButtonAttention = props.attention ?? 'high';

  const dataAttrs: Record<string, string | undefined> = {
    'data-attention': resolvedAttention,
    'data-appearance': resolvedAppearance,
    'data-size': String(numericSize),
    'data-contained': String(contained),
    // condensed / layout only apply to a contained chip (web parity).
    ...(props.condensed && contained ? { 'data-condensed': '' } : {}),
    ...(props.layout === '3:2' && contained ? { 'data-layout': '3:2' } : {}),
    ...(props.loading ? { 'data-loading': '' } : {}),
  };

  return {
    isDisabled,
    resolvedVariant,
    resolvedAppearance,
    numericSize,
    contained,
    ariaProps: {
      'aria-disabled': isDisabled,
      'aria-busy': props.loading,
      'aria-label': props['aria-label'],
      'aria-expanded': props['aria-expanded'],
    },
    dataAttrs,
  };
}

export function getIconButtonAccessibilityProps(
  props: Pick<
    IconButtonProps,
    | 'aria-label'
    | 'aria-expanded'
    | 'aria-haspopup'
    | 'accessibilityHint'
    | 'loading'
    | 'disabled'
  >,
  state: { isDisabled: boolean },
): ReturnType<typeof buildButtonFamilyPressableAccessibility> {
  return buildButtonFamilyPressableAccessibility(
    {
      isDisabled: state.isDisabled,
      loading: props.loading,
      accessibilityLabel: props['aria-label'],
      accessibilityHint: props.accessibilityHint,
      'aria-expanded': props['aria-expanded'],
      'aria-haspopup': props['aria-haspopup'],
    },
    { role: 'button' },
  );
}
