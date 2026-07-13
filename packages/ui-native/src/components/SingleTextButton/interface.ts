/**
 * SingleTextButton interface (native)
 *
 * Native-owned prop contract + state resolver + accessibility helpers. Mirrors
 * the web public API in
 * `packages/ui/src/components/SingleTextButton/SingleTextButton.shared.ts`
 * without importing anything from `@oneui/ui`. Layers cross-check is
 * `jdssingletextbutton-4` (React V4) + `jdssingletextbutton` (React Native).
 *
 * Action button (non-toggle) — circular, max 2 characters (e.g. "Ag", "En",
 * "A"). Attention level drives the full visual (high=bold, medium=subtle,
 * low=ghost) — no selected/unselected duality.
 *
 * Layers ↔ OneUI mapping (see docs/parity/SingleTextButton-web-native-parity.md):
 *   | Concept   | OneUI                 | Layers `JDSButtonProps` |
 *   | --------- | --------------------- | ----------------------- |
 *   | Emphasis  | `attention`           | `attention`             |
 *   | Size      | `size` (s/m/l)        | `size` (S/M/L)          |
 *   | Label     | `children` (≤2 chars) | `content` element       |
 *   | Role      | `appearance`          | `appearance`            |
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import {
  buildButtonFamilyPressableAccessibility,
  getButtonFamilyLoadingSpinnerAccessibility,
} from '../../utils/buttonFamilyA11y';
import { BUTTON_ATTENTION_TO_VARIANT, resolveButtonStateBase } from '../../utils/buttonStateBase';

/**
 * Multi-accent appearance roles for SingleTextButton.
 * Widens the shared `ComponentAppearance` with `tertiary` and `quaternary` —
 * the web component wires CSS classes for both, so the native type
 * intentionally exceeds the canonical 9-role set (matches web parity). Native
 * `useSurfaceTokens` gracefully falls back to `primary` for roles a brand
 * hasn't configured, so unmapped roles still paint the brand accent.
 */
export type SingleTextButtonAppearance = ComponentAppearance | 'tertiary' | 'quaternary';

/** Figma attention alias — drives the visual variant (high/medium/low → bold/subtle/ghost). */
export type SingleTextButtonAttention = 'high' | 'medium' | 'low';

/** Resolved visual variant — derived from attention. */
export type SingleTextButtonVariant = 'bold' | 'subtle' | 'ghost';

/** SingleTextButton sizes — S/M/L aligned with Figma spec (no XS). */
export type SingleTextButtonSize = 's' | 'm' | 'l';

/**
 * Map Figma attention values to code variant values. Aliased to the shared
 * button-family map so the whole family stays in lockstep (re-exported here for
 * back-compat with existing imports).
 */
export const SINGLE_TEXT_BUTTON_ATTENTION_TO_VARIANT: Record<
  SingleTextButtonAttention,
  SingleTextButtonVariant
> = BUTTON_ATTENTION_TO_VARIANT;

export interface SingleTextButtonProps {
  /**
   * Text label content — max 2 characters (e.g. "Ag", "En", "A", "12").
   * This component renders as a circular button; longer text breaks the shape.
   * Text exceeding 2 characters is truncated in development with a warning.
   */
  children: ReactNode;

  /** Button size. Default: `'m'`. S/M/L only (no XS). */
  size?: SingleTextButtonSize;
  /**
   * Attention level — drives the visual variant.
   * high → bold fill (solid accent bg, on-bold text)
   * medium → subtle fill (tinted bg, accent text)
   * low → ghost (transparent bg, accent text)
   * Default: `'high'`.
   */
  attention?: SingleTextButtonAttention;
  /** Multi-accent appearance role. `'auto'` resolves to `'primary'`. Default: `'auto'`. */
  appearance?: SingleTextButtonAppearance;
  /** Condensed mode: reduces height and padding while keeping the same typography. */
  condensed?: boolean;
  /** Stretch to fill container width — overrides circular shape. */
  fullWidth?: boolean;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /**
   * Loading state — shows a circular spinner replacing the text label and marks
   * the control **busy** (`aria-busy` / `accessibilityState.busy`). Activation is
   * suppressed while busy, but the button is NOT marked disabled — it only reads
   * as disabled when `disabled` is explicitly set.
   */
  loading?: boolean;

  onPress?: () => void;
  /** Web parity alias for `onPress`. */
  onClick?: () => void;

  /** Accessible label for screen readers (optional — children text is visible). */
  'aria-label'?: string;
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
  /** React Native test identifier (mirrors Layers RN `testID`). */
  testID?: string;
  /** Inline native styles. */
  style?: ViewStyle;
}

/**
 * Resolve the effective appearance role. Explicit non-`'auto'` `appearance`
 * wins; otherwise a `parentAppearance` (from the surrounding `<Surface>`) is
 * inherited, falling back to `'primary'` — matches web
 * `useSingleTextButtonState`. Pure so it stays unit-testable; the component
 * feeds `parentAppearance` from `useSurfaceAppearance()`.
 */
export function resolveSingleTextButtonAppearance(
  appearance: SingleTextButtonAppearance | undefined,
  parentAppearance?: SingleTextButtonAppearance | null,
): SingleTextButtonAppearance {
  if (appearance && appearance !== 'auto') return appearance;
  return parentAppearance ?? 'primary';
}

/**
 * Resolve runtime decisions for a `<SingleTextButton>`. Mirrors web
 * `useSingleTextButtonState` — attention → variant, `'auto'` → role → `'primary'`,
 * and disabled/loading gating.
 *
 * Pure (no context hooks) so it stays test-friendly and matches the native
 * button-family convention. Surface-role inheritance is layered on in the
 * component via `resolveSingleTextButtonAppearance(appearance, parentAppearance)`.
 */
export function useSingleTextButtonState(props: SingleTextButtonProps): {
  isDisabled: boolean;
  resolvedVariant: SingleTextButtonVariant;
  resolvedAppearance: SingleTextButtonAppearance;
  ariaProps: { 'aria-disabled': boolean; 'aria-busy': boolean | undefined };
  dataAttrs: Record<string, string | undefined>;
} {
  const { size = 'm', attention = 'high', appearance, condensed, disabled, loading } = props;

  // Disabled + variant derivation is shared with the rest of the button family
  // via `resolveButtonStateBase`, so the `isDisabled` formula lives in one
  // reviewed place. Family-wide, `loading` is a busy state (see
  // `ariaProps['aria-busy']`) and the component suppresses activation while busy
  // — it does NOT flip the disabled state / dim styling.
  const { isDisabled, resolvedVariant } = resolveButtonStateBase<SingleTextButtonVariant>(
    { attention, disabled, loading },
    SINGLE_TEXT_BUTTON_ATTENTION_TO_VARIANT,
    'bold',
  );
  // Appearance stays local: SingleTextButton's role set is wider than the shared
  // `ComponentAppearance` (adds `tertiary`/`quaternary`) and inherits from the
  // surrounding `<Surface>` in the component.
  const resolvedAppearance = resolveSingleTextButtonAppearance(appearance);

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-attention': attention,
    'data-variant': resolvedVariant,
    'data-appearance': resolvedAppearance,
    ...(condensed ? { 'data-condensed': '' } : {}),
    ...(loading ? { 'data-loading': '' } : {}),
  };

  return {
    isDisabled,
    resolvedVariant,
    resolvedAppearance,
    ariaProps: {
      'aria-disabled': isDisabled,
      'aria-busy': loading,
    },
    dataAttrs,
  };
}

/**
 * Map SingleTextButton props + state to React Native Pressable accessibility
 * props. `accessibilityRole='button'`, plus disabled / busy state and the
 * shared button-family aria passthroughs.
 */
export function getSingleTextButtonAccessibilityProps(
  props: Pick<
    SingleTextButtonProps,
    | 'aria-label'
    | 'accessibilityHint'
    | 'aria-describedby'
    | 'aria-expanded'
    | 'aria-haspopup'
    | 'aria-controls'
    | 'aria-hidden'
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
      'aria-describedby': props['aria-describedby'],
      'aria-controls': props['aria-controls'],
      'aria-hidden': props['aria-hidden'],
    },
    { role: 'button' },
  );
}

export { getButtonFamilyLoadingSpinnerAccessibility };
