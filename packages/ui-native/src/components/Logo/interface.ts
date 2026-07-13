/**
 * Logo interface (native)
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type {
  LogoMaterial,
  LogoMaterialTarget,
  MetallicGradientType,
} from '@oneui/shared/engine';

export type LogoVariant = 'mark' | 'full';
/** Canonical size tokens (CSS / RN style tables). */
export type LogoSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'custom';
/** Figma t-shirt labels and other accepted aliases before canonicalisation. */
export type LogoSizeInput = LogoSize | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'CUSTOM';
export type LogoContentMode = 'children' | 'svg' | 'image' | 'empty';

const LOGO_SIZE_ALIASES: Record<string, LogoSize> = {
  xs: 'xs',
  s: 's',
  m: 'm',
  l: 'l',
  xl: 'xl',
  custom: 'custom',
  XS: 'xs',
  S: 's',
  M: 'm',
  L: 'l',
  XL: 'xl',
  CUSTOM: 'custom',
};

const VALID_LOGO_SIZES: ReadonlySet<LogoSize> = new Set([
  'xs',
  's',
  'm',
  'l',
  'xl',
  'custom',
]);

/**
 * Normalises `size` to canonical lowercase tokens. Accepts Figma-style
 * `XS` | `S` | `M` | `L` | `XL` | `CUSTOM`. Unknown values warn in
 * development and fall back to `'m'`.
 */
export function resolveLogoSize(size?: LogoSizeInput): LogoSize {
  if (size == null) return 'm';
  const resolved = LOGO_SIZE_ALIASES[size];
  if (resolved != null && VALID_LOGO_SIZES.has(resolved)) return resolved;
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      `[Logo] size="${String(size)}" is not supported. Use 'xs' | 's' | 'm' | 'l' | 'xl' | 'custom' (Figma: XS–XL, CUSTOM). Using 'm' instead.`,
    );
  }
  return 'm';
}

export type { LogoMaterial, LogoMaterialTarget, MetallicGradientType };

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSizeInput;
  /** Required when `size="custom"` — positive pixel dimension for the logo box. */
  customSize?: number;
  children?: ReactNode;
  src?: string;
  svgContent?: string;
  /**
   * Metallic material paint for inline SVG content (`svgContent` mode only).
   * Raster (`src`) and children-mode logos are not affected.
   * When provided, the brand's resolved gradient stops are injected into the SVG
   * `<defs>` so the mark renders in the metallic finish at runtime.
   */
  material?: LogoMaterial;
  /** SVG paint channels that receive the metallic gradient. Default: `'fill-stroke'`. */
  materialTarget?: LogoMaterialTarget;
  /** Gradient style for the metallic paint server. Default: `'linear'`. */
  materialGradientType?: MetallicGradientType;
  /** Gradient direction angle in degrees. Default: `135`. */
  materialGradientAngle?: number;
  /**
   * Accessible name for the brand mark. Meaningful text exposes an `image` role;
   * `""` or whitespace-only values hide decorative logos from screen readers.
   */
  alt: string;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: ReactNode;
  /** When true, logo is tappable (requires `onPress` or `onClick` and meaningful `alt`). */
  interactive?: boolean;
  /** Disables press handling and reduces opacity. Default: `false`. */
  disabled?: boolean;
  /** Press handler when `interactive` is true. */
  onPress?: () => void;
  /** Web alias for `onPress` — accepted for Figma/API symmetry. */
  onClick?: () => void;
  style?: ViewStyle;
  accessibilityHint?: string;
  testID?: string;
}

export type LogoNativeProps = LogoProps;
export type LogoNativeA11yProps = Pick<LogoProps, 'accessibilityHint' | 'testID'>;

/** Dev-only: decorative `alt` hides the logo from assistive tech — warn regardless of `interactive`. */
function warnLogoDecorativeAlt(alt: string): void {
  if (process.env.NODE_ENV === 'production' || !isLogoDecorative(alt)) return;
  // eslint-disable-next-line no-console
  console.warn(
    '[Logo] alt is empty or whitespace-only — this logo is hidden from screen readers. Pass a meaningful alt unless the logo is intentionally decorative.',
  );
}

function warnLogoInteractiveMisconfiguration(
  props: Pick<LogoProps, 'alt' | 'interactive' | 'onPress' | 'onClick'>,
  isInteractive: boolean,
): void {
  if (!isInteractive || process.env.NODE_ENV === 'production') return;
  const hasHandler = props.onPress != null || props.onClick != null;
  if (!hasHandler) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Logo] interactive={true} requires `onPress` or `onClick`. Rendering as static.',
    );
  }
}

export function useLogoState(props: LogoProps) {
  const {
    variant = 'mark',
    size,
    children,
    svgContent,
    src,
    interactive = false,
    disabled = false,
  } = props;
  const resolvedSize = resolveLogoSize(size);
  const isInteractive = interactive && !disabled;
  warnLogoDecorativeAlt(props.alt);
  warnLogoInteractiveMisconfiguration(props, isInteractive);

  const contentMode: LogoContentMode = children
    ? 'children'
    : svgContent
      ? 'svg'
      : src
        ? 'image'
        : 'empty';

  const dataAttrs: Record<string, string | undefined> = {
    'data-variant': variant,
    'data-size': resolvedSize,
    'data-interactive': isInteractive ? 'true' : undefined,
  };

  return {
    contentMode,
    resolvedVariant: variant,
    resolvedSize,
    isInteractive,
    isDisabled: disabled,
    dataAttrs,
  };
}

/** True when the logo should render as a pressable control. */
export function isLogoPressable(
  props: Pick<LogoProps, 'alt' | 'onPress' | 'onClick'>,
  state: Pick<ReturnType<typeof useLogoState>, 'isInteractive'>,
): boolean {
  if (!state.isInteractive || isLogoDecorative(props.alt)) return false;
  return props.onPress != null || props.onClick != null;
}

export const LOGO_DECORATIVE_A11Y = {
  accessible: false,
  importantForAccessibility: 'no-hide-descendants' as const,
  accessibilityElementsHidden: true,
};

/** Empty or whitespace-only `alt` — decorative (hidden from assistive tech). */
export function isLogoDecorative(alt: string): boolean {
  return alt.trim().length === 0;
}

export type LogoAccessibilityProps =
  | {
      accessible: true;
      accessibilityRole: 'button' | 'image';
      accessibilityLabel: string;
      accessibilityHint?: string;
    }
  | typeof LOGO_DECORATIVE_A11Y;

export function getLogoAccessibilityProps(
  props: Pick<LogoProps, 'alt' | 'accessibilityHint' | 'onPress' | 'onClick'>,
  state: Pick<ReturnType<typeof useLogoState>, 'isInteractive'> & {
    isPressable?: boolean;
  },
): LogoAccessibilityProps {
  if (isLogoDecorative(props.alt)) {
    return LOGO_DECORATIVE_A11Y;
  }
  const isPressable =
    state.isPressable ?? isLogoPressable(props, { isInteractive: state.isInteractive });
  return {
    accessible: true,
    accessibilityRole: isPressable ? 'button' : 'image',
    accessibilityLabel: props.alt.trim(),
    accessibilityHint: props.accessibilityHint,
  };
}
