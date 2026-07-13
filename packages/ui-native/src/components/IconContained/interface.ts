/**
 * IconContained interface (native)
 *
 * Mirrors `packages/ui/src/components/IconContained/IconContained.shared.ts`.
 * Same t-shirt size scale (`'xs' | 's' | 'm' | 'l' | 'xl'`), same attention
 * levels (`'high' | 'medium'`), same multi-accent appearance contract.
 *
 * Cross-check: Layers `JDSIconContained` (`libs/react-4/.../jdsiconcontained-4.ts`)
 *   - Layers default `attention='medium'`; OneUI defaults `'high'` (matches web).
 *   - Layers `accent` appearance is omitted — OneUI uses the canonical
 *     `ComponentAppearance` union (9 roles + `'auto'`).
 *
 * Single source for the native IconContained prop contract, state resolver,
 * and accessibility helper — no separate `*A11y.ts`, no `@oneui/ui` import.
 */

import type { ReactElement } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance, IconComponent, SemanticIconName } from '@oneui/shared';

/** Figma-aligned attention levels (maps to visual emphasis). */
export type IconContainedAttention = 'high' | 'medium';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type IconContainedAppearance = ComponentAppearance;

/** IconContained size — t-shirt scale from XS to XL. */
export type IconContainedSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface IconContainedProps {
  /**
   * Icon to display. Accepts a JDS / RN SVG component, an existing
   * `ReactElement`, or a semantic name string. Native does not yet resolve
   * semantic name strings — pass `icon={YourGlyphComponent}` (mirrors the
   * `Button.start` / `Avatar.icon` warning paths).
   */
  icon: SemanticIconName | ReactElement | IconComponent;
  /** Size preset. Default: `'m'`. */
  size?: IconContainedSize;
  /**
   * Attention level — High (solid bold fill), Medium (subtle tinted fill).
   * Default: `'high'` (matches web).
   */
  attention?: IconContainedAttention;
  /** Multi-accent appearance role. `'auto'` resolves to `'primary'`. */
  appearance?: IconContainedAppearance;
  /** Disabled state. */
  disabled?: boolean;
  /** Additional native styles. */
  style?: ViewStyle;
  /** Accessible label for the icon. Recommended for non-decorative use. */
  'aria-label'?: string;
  /** Hide the contained icon from the accessibility tree. */
  'aria-hidden'?: boolean;
  /** Describes the icon for assistive technologies (React Native). */
  accessibilityHint?: string;
  /** React Native test identifier. */
  testID?: string;
}

export type IconContainedNativeProps = IconContainedProps;

/**
 * Resolve IconContained state from props — parallel to `useIconContainedState`
 * in the web shared module. Returns resolved size, attention, appearance,
 * disabled flag, and the cross-platform data attributes used by the web CSS
 * cascade. Native does not consume the data attributes today; they are kept
 * for API symmetry with web and for future selector-based test hooks.
 */
export function useIconContainedState(props: IconContainedProps): {
  resolvedSize: IconContainedSize;
  resolvedAttention: IconContainedAttention;
  resolvedAppearance: Exclude<IconContainedAppearance, 'auto'>;
  isDisabled: boolean;
  dataAttrs: Record<string, string | undefined>;
} {
  const {
    size = 'm',
    attention = 'high',
    appearance,
    disabled = false,
  } = props;

  const resolvedAttention = attention;
  const resolvedAppearance: Exclude<IconContainedAppearance, 'auto'> =
    appearance != null && appearance !== 'auto'
      ? (appearance as Exclude<IconContainedAppearance, 'auto'>)
      : 'primary';

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-attention': resolvedAttention,
    'data-appearance': resolvedAppearance,
  };

  return {
    resolvedSize: size,
    resolvedAttention,
    resolvedAppearance,
    isDisabled: disabled,
    dataAttrs,
  };
}

/**
 * Map IconContained props to React Native accessibility props.
 *
 * IconContained is a non-interactive media element (`role="img"` on web).
 * The native peer mirrors that with `accessibilityRole: 'image'` and only
 * exposes the node when an `aria-label` is provided. `aria-hidden` collapses
 * the subtree from assistive tech entirely.
 */
export function getIconContainedAccessibilityProps(
  props: Pick<IconContainedProps, 'aria-label' | 'aria-hidden' | 'accessibilityHint'>,
  state: { isDisabled: boolean },
): {
  accessible: boolean;
  accessibilityRole: 'image';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: { disabled: boolean };
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
} {
  const ariaHidden = props['aria-hidden'] === true;
  const label = props['aria-label'];
  const accessible = !ariaHidden && Boolean(label);

  return {
    accessible,
    accessibilityRole: 'image',
    accessibilityLabel: label,
    accessibilityHint: props.accessibilityHint,
    accessibilityState: { disabled: state.isDisabled },
    accessibilityElementsHidden: ariaHidden,
    importantForAccessibility: ariaHidden ? 'no-hide-descendants' : undefined,
  };
}
