/**
 * Icon interface (native)
 *
 * - `IconProps` / `IconNativeProps`: JDS glyph slot API (`@oneui/shared`)
 * - `DesignIconSize`, `IconAppearance`, etc.: Figma spacing-index sizes (web Icon parity)
 */

import type { ReactElement } from 'react';
import type { ViewStyle } from 'react-native';
import type {
  IconComponent,
  IconProps as SharedIconProps,
  SemanticIconName,
} from '@oneui/shared';

/** Figma spacing-index sizes — maps to `tokens.spacing` keys. */
export type DesignIconSize =
  | '2'
  | '2.5'
  | '3'
  | '3.5'
  | '4'
  | '4.5'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '12'
  | '14'
  | '16'
  | '18'
  | '20'
  | '24'
  | '32'
  | '40';

export const ICON_SIZES: readonly DesignIconSize[] = [
  '2',
  '2.5',
  '3',
  '3.5',
  '4',
  '4.5',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
  '24',
  '32',
  '40',
];

export type IconAppearance =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'sparkle'
  | 'negative'
  | 'positive'
  | 'warning'
  | 'informative';

/**
 * Emphasis level — colour prominence on top of the resolved appearance role.
 * Maps 1:1 to web's `IconEmphasis`. Each value selects a `ContentToken` from
 * the surface-resolved role:
 *
 *   high       → role.content.high        (--{Role}-High)
 *   medium     → role.content.medium      (--{Role}-Medium-Text)
 *   low        → role.content.low         (--{Role}-Low)
 *   tinted     → role.content.tinted      (--{Role}-Tinted)
 *   tintedA11y → role.content.tintedA11y  (--{Role}-TintedA11y)
 */
export type IconEmphasis = 'high' | 'medium' | 'low' | 'tinted' | 'tintedA11y';

/**
 * Fold a component's `appearance` (which may include `brand-bg`) to a value
 * the design-system `<Icon>` accepts. `brand-bg` → `primary` mirrors the web
 * fallback in `useIconState` — the Icon glyph scale has no `brand-bg`, so
 * the primary tinted-A11y colour is used in its place.
 */
export function asIconAppearance(role: string): IconAppearance {
  if (role === 'brand-bg') return 'primary';
  return (role as IconAppearance) ?? 'neutral';
}

export interface DesignIconProps {
  /**
   * Glyph to render. One of:
   *
   *   - `SemanticIconName` — semantic name resolved via the registered
   *     `IconProvider` loader (web parity).
   *   - `ReactElement`     — pre-built React element rendered as-is
   *     (web parity).
   *   - `IconComponent`    — RN-only escape hatch for direct JDS / custom
   *     SVG components (e.g. `icon={IcStar}`). The web equivalent is to
   *     wrap the component in JSX (`icon={<IcStar />}`), but passing the
   *     constructor is more ergonomic on native and lets the design-system
   *     `<Icon>` apply its size and color.
   */
  icon: SemanticIconName | ReactElement | IconComponent;
  /**
   * Spacing-index token (`'2'` … `'40'`) — preferred. A pixel `number` is
   * also accepted as an escape hatch for component-internal layouts that
   * compute their own icon side from a per-component scale (Button slot,
   * IconButton container, etc.). Default: `'5'`.
   */
  size?: DesignIconSize | number;
  /** Colour role. Default: `'neutral'`. */
  appearance?: IconAppearance;
  /** Colour prominence. Default: `'high'` (matches web). */
  emphasis?: IconEmphasis;
  style?: ViewStyle;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
  /** React Native test identifier (mirrors Layers RN `testID`). */
  testID?: string;
}

export function useDesignIconState(props: DesignIconProps) {
  const { size = '5', appearance = 'neutral', emphasis = 'high' } = props;

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': typeof size === 'number' ? `${size}` : size,
    'data-appearance': appearance,
    'data-emphasis': emphasis,
  };

  return {
    resolvedSize: size,
    resolvedAppearance: appearance,
    resolvedEmphasis: emphasis,
    dataAttrs,
  };
}

/** JDS / catalog glyph props (`icon={IcAdd}`). */
export type IconProps = SharedIconProps;

export interface IconNativeA11yProps {
  style?: ViewStyle;
}

export type IconNativeProps = IconProps & IconNativeA11yProps;

export function formatIconName(iconName: string): string {
  if (iconName.startsWith('Ic')) {
    const words = iconName.slice(2).match(/[A-Z][a-z]+/g);
    return words ? `${words.join(' ').toLowerCase()} icon` : iconName;
  }
  if (iconName.startsWith('ic_')) {
    const words = iconName.slice(3).split('_');
    return words ? `${words.join(' ').toLowerCase()} icon` : iconName;
  }
  if (/^[a-z][a-zA-Z0-9]*$/.test(iconName)) {
    return iconName.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  }
  return iconName
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .trim();
}

export function getIconShellAccessibilityProps({
  ariaLabel,
  ariaHidden,
  catalogIconName,
  semanticName,
}: {
  ariaLabel?: string;
  ariaHidden?: boolean;
  catalogIconName?: string;
  semanticName?: string;
}): {
  accessible: boolean;
  accessibilityRole: 'image';
  accessibilityLabel?: string;
  accessibilityElementsHidden: boolean;
  importantForAccessibility: 'no-hide-descendants' | 'yes';
} {
  const isHidden = ariaHidden === true;
  const derivedLabel = catalogIconName
    ? formatIconName(catalogIconName)
    : semanticName
      ? formatIconName(semanticName)
      : undefined;
  const label = !isHidden ? (ariaLabel ?? derivedLabel) : undefined;
  const isAccessible = !isHidden && Boolean(label);

  return {
    accessible: isAccessible,
    accessibilityRole: 'image',
    accessibilityLabel: label,
    accessibilityElementsHidden: isHidden || !label,
    importantForAccessibility: isHidden || !label ? 'no-hide-descendants' : 'yes',
  };
}
