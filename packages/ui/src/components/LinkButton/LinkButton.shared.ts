/**
 * LinkButton.shared.ts
 * Shared types and hooks for LinkButton component
 * Used by both web and React Native implementations
 *
 * Key distinction: LinkButton is a <button> with link-like styling,
 * NOT a <a> navigation element. Use Link for actual navigation.
 */

import type { CSSProperties, ReactNode, ReactElement } from 'react';
import type { SemanticIconName, ComponentAppearance } from '@oneui/shared';
import { resolveButtonStateBase, BUTTON_ATTENTION_TO_VARIANT } from '../_shared/buttonStateBase';
import { useSurfaceAppearance } from '../Surface';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type LinkButtonAppearance = ComponentAppearance;

/** Public emphasis level. high → bold, medium → subtle, low → ghost. */
export type LinkButtonAttention = 'high' | 'medium' | 'low';

/** Internal visual variant derived from `attention`; surfaced only as `data-variant` for CSS. */
export type LinkButtonVariant = 'bold' | 'subtle' | 'ghost';

/**
 * LinkButton sizes — XS (f6), S (f8), M (f10), L (f12).
 * XS is the Figma Button / "Contained = false" XS variant size (12px
 * font, tight padding, underlined accent text).
 */
export type LinkButtonSize =
  | 6 | 8 | 10 | 12
  | 'xs' | 's' | 'm' | 'l'
  | 'small' | 'medium' | 'large';

/** Map t-shirt aliases to numeric f-step sizes */
const SIZE_ALIASES: Record<string, number> = {
  'xs': 6,
  's': 8,
  'm': 10,
  'l': 12,
  'small': 8,
  'medium': 10,
  'large': 12,
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
  /** Button label text */
  children: ReactNode;
  /** Emphasis level — high (bold), medium (subtle), low (ghost). Drives text color + underline; internal variant + `data-variant` derived from this. */
  attention?: LinkButtonAttention;
  /** Button size — f-step number or t-shirt alias. Default: 10 (M). */
  size?: LinkButtonSize;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. */
  appearance?: LinkButtonAppearance;
  /** Content to render before the label (semantic icon name or custom node) */
  start?: SemanticIconName | ReactNode;
  /** Content to render after the label (semantic icon name or custom node) */
  end?: SemanticIconName | ReactNode;
  /**
   * Whether the underline is visible. Defaults to `true` (LinkButton's
   * classic text-link behaviour). Set to `false` for uses where the
   * component is a text-style CTA without an underline — e.g. when
   * `<Button contained={false}>` delegates here and the Figma spec
   * marks the underline colour as transparent by default.
   * @default true
   */
  showUnderline?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state — shows spinner */
  loading?: boolean;
  /** Press/click handler */
  onPress?: () => void;
  /** Web-only alias for onPress */
  onClick?: () => void;
  /** Accessibility label override */
  'aria-label'?: string;
  'aria-pressed'?: boolean | 'true' | 'false' | 'mixed';
  'aria-expanded'?: boolean | 'true' | 'false';
  'aria-controls'?: string;
  'aria-describedby'?: string;
  'aria-haspopup'?: boolean | 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Test selector passthrough */
  'data-testid'?: string;
}

export function useLinkButtonState(props: LinkButtonProps) {
  const parentAppearance = useSurfaceAppearance();
  const { isDisabled, resolvedVariant, resolvedAppearance } =
    resolveButtonStateBase<LinkButtonVariant>(props, BUTTON_ATTENTION_TO_VARIANT, 'bold', parentAppearance);

  const numericSize = resolveLinkButtonSize(props.size ?? 10);

  const dataAttrs: Record<string, string | undefined> = {
    'data-oneui-component': 'LinkButton',
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
    inheritedFromSurface: parentAppearance !== null,
    numericSize,
    ariaProps: {
      'aria-disabled': isDisabled,
      'aria-busy': props.loading,
    },
    dataAttrs,
  };
}
