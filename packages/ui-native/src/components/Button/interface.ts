/**
 * Button interface (native)
 *
 * Single source for the native Button prop contract and state resolver.
 * Mirrors Layers `jdsbutton-4/generated/interface.ts` — no import from
 * `@oneui/ui` web shared modules.
 */

import type { ReactElement, ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type {
  ComponentAppearance,
  DecorationConfig,
  SemanticIconName,
} from '@oneui/shared';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type ButtonAppearance = ComponentAppearance;

/** Figma-aligned attention alias (maps to variant). */
export type ButtonAttention = 'high' | 'medium' | 'low';

export type ButtonVariant = 'bold' | 'subtle' | 'ghost';

/**
 * Button sizes aligned with Figma spec: XS (f6), S (f8), M (f10), L (f12).
 * Legacy numeric and t-shirt aliases are still accepted but deprecated.
 */
export type ButtonSize =
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
  | 'large'
  // Deprecated — fallback to nearest XS/S/M/L
  | 7
  | 14
  | 16
  | '2xs'
  | 'xl'
  | '2xl';

const SIZE_ALIASES: Record<string, number> = {
  xs: 6,
  s: 8,
  m: 10,
  l: 12,
  small: 8,
  medium: 10,
  large: 12,
  '2xs': 6,
  xl: 12,
  '2xl': 12,
};

const DEPRECATED_NUMERIC_SIZES: Record<number, number> = {
  7: 8,
  14: 12,
  16: 12,
};

const VALID_SIZES = new Set([6, 8, 10, 12]);

const SIZE_LABELS: Record<number, string> = { 6: 'xs', 8: 's', 10: 'm', 12: 'l' };

import {
  BUTTON_ATTENTION_TO_VARIANT,
  resolveButtonStateBase,
} from '../../utils/buttonStateBase';
import {
  buildButtonFamilyPressableAccessibility,
  getButtonFamilyLoadingSpinnerAccessibility,
} from '../../utils/buttonFamilyA11y';

function warnDeprecatedNumericSize(input: number, fallback: number): void {
  if (process.env.NODE_ENV === 'production') return;
  const label = SIZE_LABELS[fallback] ?? 'm';
  console.warn(
    `Button: size={${input}} is deprecated. Use size={${fallback}} (${label}) instead.`,
  );
}

function resolveNumericSize(size: number): number {
  if (VALID_SIZES.has(size)) return size;
  const fallback = DEPRECATED_NUMERIC_SIZES[size];
  if (fallback === undefined) return 10;
  warnDeprecatedNumericSize(size, fallback);
  return fallback;
}

/** Resolve any ButtonSize value to a numeric f-step. */
export function resolveSize(size: ButtonSize): number {
  if (typeof size === 'number') return resolveNumericSize(size);
  return SIZE_ALIASES[size] ?? 10;
}

/** Base props shared by all Button configurations. */
interface ButtonBaseProps {
  /**
   * Visual variant affecting background and text colors.
   * @default "bold"
   */
  variant?: ButtonVariant;
  /**
   * Figma attention alias — maps to variant (high→bold, medium→subtle, low→ghost).
   * `variant` takes precedence.
   * @default "high"
   */
  attention?: ButtonAttention;
  /**
   * Button size — f-step number or t-shirt alias.
   * @default 10
   */
  size?: ButtonSize;
  /**
   * Multi-accent appearance role. 'auto' resolves to 'primary'.
   * @default "auto"
   */
  appearance?: ButtonAppearance;
  /**
   * Contained (filled pill) vs uncontained (transparent text-link style).
   * @default true
   */
  contained?: boolean;
  /**
   * Condensed mode: reduced height/padding. Only when `contained={true}`.
   * @default false
   */
  condensed?: boolean;
  /**
   * Stretch to fill container width.
   * @default false
   */
  fullWidth?: boolean;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  loading?: boolean;
  onPress?: () => void;
  /** Web parity alias for onPress. */
  onClick?: () => void;
  /** Content before the label. Semantic icon name or custom node. */
  start?: SemanticIconName | ReactNode;
  /** Content after the label. Semantic icon name or custom node. */
  end?: SemanticIconName | ReactNode;
  /** @deprecated Use `start` instead. */
  leftIcon?: SemanticIconName | ReactElement;
  /** @deprecated Use `end` instead. */
  rightIcon?: SemanticIconName | ReactElement;
  /** Direct decoration config — overrides DecorationContext. */
  decoration?: DecorationConfig | null;
  /** Additional native styles. */
  style?: ViewStyle;
  /** Describes the result of performing an action (React Native). */
  accessibilityHint?: string;
  /** ID of the element that describes this button. */
  'aria-describedby'?: string;
  /** Whether the control is expanded (menus, disclosures). */
  'aria-expanded'?: boolean;
  /** Whether activating the control opens a popup. */
  'aria-haspopup'?: boolean | 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree';
  /** ID of the element controlled by this button. */
  'aria-controls'?: string;
  /** Hide the button from the accessibility tree. */
  'aria-hidden'?: boolean;
  /** React Native test identifier. */
  testID?: string;
}

/**
 * Button always renders a visible label. For label-less icon buttons use
 * `<IconButton>`.
 */
export interface ButtonProps extends ButtonBaseProps {
  'aria-label'?: string;
  children: string;
}

/** @deprecated Prefer `ButtonProps` — kept for transitional imports. */
export type ButtonNativeProps = ButtonProps;

export function useButtonState(props: ButtonProps) {
  const { isDisabled, resolvedVariant, resolvedAppearance } = resolveButtonStateBase<ButtonVariant>(
    props,
    BUTTON_ATTENTION_TO_VARIANT,
    'bold',
  );

  const numericSize = resolveSize(props.size ?? 10);

  const dataAttrs: Record<string, string | undefined> = {
    'data-variant': resolvedVariant,
    'data-appearance': resolvedAppearance,
    'data-size': String(numericSize),
    ...(props.condensed ? { 'data-condensed': '' } : {}),
    ...(props.loading ? { 'data-loading': '' } : {}),
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

export function resolveButtonAccessibilityLabel(
  props: Pick<ButtonProps, 'aria-label'>,
): string | undefined {
  return props['aria-label'];
}

export function getButtonAccessibilityProps(
  props: Pick<
    ButtonProps,
    | 'aria-label'
    | 'accessibilityHint'
    | 'aria-describedby'
    | 'aria-expanded'
    | 'aria-controls'
    | 'aria-hidden'
    | 'aria-haspopup'
    | 'loading'
    | 'disabled'
  >,
  state: { isDisabled: boolean },
): ReturnType<typeof buildButtonFamilyPressableAccessibility> {
  return buildButtonFamilyPressableAccessibility(
    {
      isDisabled: state.isDisabled,
      loading: props.loading,
      accessibilityLabel: resolveButtonAccessibilityLabel(props),
      accessibilityHint: props.accessibilityHint,
      'aria-expanded': props['aria-expanded'],
      'aria-haspopup': props['aria-haspopup'],
      'aria-describedby': props['aria-describedby'],
      'aria-controls': props['aria-controls'],
      'aria-hidden': props['aria-hidden'],
    },
    { role: 'button' },
  );
}

export { getButtonFamilyLoadingSpinnerAccessibility };
