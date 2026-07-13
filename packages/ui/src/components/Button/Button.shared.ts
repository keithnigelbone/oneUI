/**
 * Button.shared.ts
 * Shared types and hooks for Button component
 * Used by both web and React Native implementations
 */

import type React from 'react';
import type { CSSProperties, ReactNode, ReactElement } from 'react';
import type {
  ComponentIconInput,
  SemanticIconName,
  DecorationConfig,
  ComponentAppearance,
} from '@oneui/shared';
import { resolveButtonStateBase, BUTTON_ATTENTION_TO_VARIANT } from '../_shared/buttonStateBase';
import { useSurfaceAppearance } from '../Surface';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type ButtonAppearance = ComponentAppearance;

/** Public emphasis level. high → bold fill, medium → subtle fill, low → ghost. */
export type ButtonAttention = 'high' | 'medium' | 'low';

/** Internal visual variant derived from `attention`; surfaced only as `data-variant` for CSS. */
export type ButtonVariant = 'bold' | 'subtle' | 'ghost';

/**
 * Button sizes aligned with Figma spec: XS (f6), S (f8), M (f10), L (f12).
 * Legacy numeric and t-shirt aliases are still accepted but deprecated.
 */
export type ButtonSize =
  | 6 | 8 | 10 | 12
  | 'xs' | 's' | 'm' | 'l'
  | 'small' | 'medium' | 'large'
  // Deprecated — will warn in dev and fallback to nearest XS/S/M/L
  | 7 | 14 | 16
  | '2xs' | 'xl' | '2xl';

/** Map t-shirt aliases (and legacy names) to numeric f-step sizes */
const SIZE_ALIASES: Record<string, number> = {
  'xs': 6,
  's': 8,
  'm': 10,
  'l': 12,
  // Legacy backward compat
  'small': 8,
  'medium': 10,
  'large': 12,
  // Deprecated aliases — map to nearest XS/S/M/L
  '2xs': 6,
  'xl': 12,
  '2xl': 12,
};

/** Deprecated numeric sizes → nearest XS/S/M/L fallback */
const DEPRECATED_NUMERIC_SIZES: Record<number, number> = {
  7: 8,
  14: 12,
  16: 12,
};

/** Valid Figma-aligned numeric sizes */
const VALID_SIZES = new Set([6, 8, 10, 12]);

/** Map numeric f-step → t-shirt label (used by deprecation warnings only) */
const SIZE_LABELS: Record<number, string> = { 6: 'xs', 8: 's', 10: 'm', 12: 'l' };

function warnDeprecatedNumericSize(input: number, fallback: number): void {
  if (process.env.NODE_ENV === 'production') return;
  const label = SIZE_LABELS[fallback] ?? 'm';
  console.warn(
    `Button: size={${input}} is deprecated. Use size={${fallback}} (${label}) instead.`
  );
}

function resolveNumericSize(size: number): number {
  if (VALID_SIZES.has(size)) return size;
  const fallback = DEPRECATED_NUMERIC_SIZES[size];
  if (fallback === undefined) return 10;
  warnDeprecatedNumericSize(size, fallback);
  return fallback;
}

/** Resolve any ButtonSize value to a numeric f-step */
export function resolveSize(size: ButtonSize): number {
  if (typeof size === 'number') return resolveNumericSize(size);
  return SIZE_ALIASES[size] ?? 10;
}

/** Base props shared by all Button configurations */
interface ButtonBaseProps {
  /**
   * Emphasis level — high (bold fill), medium (subtle/tinted fill), low (ghost, text-only).
   * Drives the visual treatment; the component derives the internal variant + `data-variant` from this.
   * @default "high"
   * @brandOverridable
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
   * Whether the button renders in its contained form (filled pill with a
   * state-layer wrapper) or its uncontained form (transparent, underlined,
   * text-link style). Mirrors the Figma `Contained` variant property on the
   * Button component set. Props that only make sense for the contained form
   * (`condensed`, `fullWidth`, `decoration`) are ignored when
   * `contained={false}`.
   *
   * @default true
   * @brandOverridable
   */
  contained?: boolean;
  /**
   * Condensed mode: reduces height and horizontal padding while keeping the same typography.
   * Use for dense layouts, inline actions, and compact UI areas. NOT the same as using a smaller size.
   * Only applies when `contained={true}`.
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
  /** Web-only alias for onPress */
  onClick?: () => void;
  /** Content before the label. Pass a semantic icon name (string) for automatic color-inheriting
   *  icon rendering, or any ReactNode for custom content. */
  start?: SemanticIconName | ReactNode;
  /** Content after the label. Pass a semantic icon name (string) for automatic color-inheriting
   *  icon rendering, or any ReactNode for custom content. */
  end?: SemanticIconName | ReactNode;
  /**
   * @deprecated Use `start` prop instead. Kept for backward compatibility.
   */
  leftIcon?: ComponentIconInput | ReactElement;
  /**
   * @deprecated Use `end` prop instead. Kept for backward compatibility.
   */
  rightIcon?: ComponentIconInput | ReactElement;
  /** Direct decoration config — overrides DecorationContext.
   *  Use in Storybook stories or tests where context may not propagate. */
  decoration?: DecorationConfig | null;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Test selector passthrough */
  'data-testid'?: string;
}

/**
 * Button always renders a visible label. For label-less icon buttons use
 * the dedicated `<IconButton>` primitive — same appearance/variant/size
 * surface, optimized for square hit targets and aria-label semantics.
 */
export interface ButtonProps extends ButtonBaseProps {
  'aria-label'?: string;
  'aria-pressed'?: boolean | 'true' | 'false' | 'mixed';
  'aria-expanded'?: boolean | 'true' | 'false';
  'aria-controls'?: string;
  'aria-describedby'?: string;
  'aria-haspopup'?: boolean | 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  children: ReactNode;
}

export function useButtonState(props: ButtonProps) {
  const parentAppearance = useSurfaceAppearance();
  const { isDisabled, resolvedVariant, resolvedAppearance } = resolveButtonStateBase<ButtonVariant>(
    props,
    BUTTON_ATTENTION_TO_VARIANT,
    'bold',
    parentAppearance
  );

  // Resolve numeric size from any accepted format
  const numericSize = resolveSize(props.size ?? 10);

  const dataAttrs: Record<string, string | undefined> = {
    'data-oneui-component': 'Button',
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
    inheritedFromSurface: parentAppearance !== null,
    numericSize,
    ariaProps: {
      'aria-disabled': isDisabled,
      'aria-busy': props.loading,
    },
    dataAttrs,
  };
}
