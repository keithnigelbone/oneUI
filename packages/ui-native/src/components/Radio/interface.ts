/**
 * Radio interface (native)
 *
 * Native-owned prop contract for the standalone `Radio` leaf. Radio is a
 * self-contained controlled/uncontrolled toggle — selection across multiple
 * options is the parent's responsibility (typically `RadioField`, which
 * pushes a controlled `checked` + `onPress` to each child Radio).
 *
 * Web parity gap: the web `<RadioGroup>` orchestrator has no native peer.
 * Multi-option semantics live in `RadioField` instead.
 *
 * Layers cross-check (`jdsradio-4` + `jdsradio` RN):
 *   | Layers prop | OneUI native equivalent |
 *   | ----------- | ----------------------- |
 *   | `size: 'M' | 'S' | 'L'` | `size: 's' | 'm' | 'l'` (case canonicalised by `resolveSize`) |
 *   | `selected: boolean` | `checked: boolean` (controlled) / `defaultChecked` (uncontrolled) |
 *   | `readOnly: boolean` | `readOnly: boolean` |
 *   | `disabled: boolean` | `disabled: boolean` |
 *   | `appearance` | `appearance: ComponentAppearance` (full 9-role union including `auto` + `brand-bg`) |
 *   | `accent` (deprecated) | accepted for back-compat, ignored at runtime |
 *   | `value: string` | `value?: string` (optional identifier — used by `RadioField` to map options) |
 *   | `name: string` | not surfaced (RN has no `<input name>`) |
 *   | `onClick` | `onPress` (raw) + `onChange(checked: boolean)` (state notification) |
 *   | `ariaLabel` / `ariaDescribedby` | `aria-label` / `aria-describedby` (dashed for cross-platform parity) |
 *   | `accessibilityHint` | passed through |
 *   | `testID` | `testID` |
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type RadioAppearance = ComponentAppearance;

/** @deprecated Ignored at runtime — use `appearance` for colour. */
export type RadioAccent = 'primary' | 'secondary' | 'sparkle';

/** Radio sizes aligned with Figma spec: S, M, L. */
export type RadioSize = 's' | 'm' | 'l';

const VALID_SIZES: ReadonlySet<RadioSize> = new Set(['s', 'm', 'l']);

/**
 * Normalise a `RadioSize`. The type already constrains valid inputs to
 * `'s' | 'm' | 'l'`; this helper only guards casted / unsafe call sites
 * (defaults to `'m'`).
 */
export function resolveSize(size: RadioSize): RadioSize {
  return VALID_SIZES.has(size) ? size : 'm';
}

// ─── Radio props ───────────────────────────────────────────────────────────

export interface RadioProps {
  /**
   * Optional identifier for this option. Not used by Radio itself, but
   * higher-level orchestrators (e.g. `RadioField`) read it to map each
   * Radio child to a selection value.
   */
  value?: string;

  /** Visible label beside the control (string). When set, takes precedence over `children`. */
  label?: string;
  /** Plain-text supplementary copy below the label row (mirrors `Input.description`). */
  description?: string;
  /** Children rendered as the option label when `label` is omitted. */
  children?: ReactNode;
  /**
   * Rendered inline after the label text — used by `RadioField` to inject a
   * required-asterisk node into the integrated label row.
   */
  labelSuffixInside?: ReactNode;
  /**
   * Rendered after the label/description column on the same row — used by
   * `RadioField` for the trailing `infoIconSlot`.
   */
  labelTrailing?: ReactNode;

  /** Invalid chrome (mirrors `Input.errorHighlight`). */
  errorHighlight?: boolean;

  /** Disabled state. */
  disabled?: boolean;
  /** Read-only state — focusable but cannot be toggled. */
  readOnly?: boolean;
  /** Size preset. Default: 'm'. */
  size?: RadioSize;
  /** Multi-accent appearance role. */
  appearance?: RadioAppearance;
  /** @deprecated Ignored — use `appearance` only. */
  accent?: RadioAccent;

  /**
   * Checked state (controlled). When provided, Radio renders against this
   * value and `onChange` notifies the caller of intended changes.
   */
  checked?: boolean;
  /**
   * Initial checked state (uncontrolled). Ignored when `checked` is set.
   * Defaults to `false`.
   */
  defaultChecked?: boolean;
  /**
   * Called when a press would change the checked state. In controlled mode
   * receives the intended next value (`!checked`); in uncontrolled mode
   * receives the new internal state after the toggle.
   */
  onChange?: (checked: boolean) => void;
  /** Raw press handler — always fires before `onChange`. */
  onPress?: () => void;

  /** Inline native styles for the wrapper. */
  style?: ViewStyle;

  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-hidden'?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  testID?: string;
}

/** @deprecated Prefer `RadioProps`. */
export type RadioNativeProps = RadioProps;

/** Map Radio S/M/L to body label tier (used by RadioField header). */
export function radioSizeToLabelSize(size: RadioSize | undefined): 's' | 'm' | 'l' {
  return resolveSize(size ?? 'm');
}

// ─── State resolver ────────────────────────────────────────────────────────

export interface RadioState {
  isDisabled: boolean;
  isReadOnly: boolean;
  isChecked: boolean;
  resolvedAppearance: Exclude<ComponentAppearance, 'auto'>;
  resolvedSize: 's' | 'm' | 'l';
  dataAttrs: {
    'data-size': 's' | 'm' | 'l';
    'data-appearance': Exclude<ComponentAppearance, 'auto'>;
    'data-checked'?: '';
    'data-unchecked'?: '';
    'data-readonly'?: '';
  };
}

/**
 * Pure state resolver. Mirrors web `useRadioState` but without group context:
 *
 *   - `auto` (or unset) appearance → `secondary`.
 *   - `size` t-shirt / legacy aliases → canonical `'s' | 'm' | 'l'`.
 *   - `isChecked` derives from `props.checked` (controlled). For uncontrolled
 *     usage the renderer maintains internal state and feeds it in via the
 *     `checked` slot before calling `useRadioState`.
 */
export function useRadioState(
  props: Pick<RadioProps, 'disabled' | 'readOnly' | 'size' | 'appearance' | 'checked'>
): RadioState {
  const isDisabled = props.disabled === true;
  const isReadOnly = props.readOnly === true;

  const rawAppearance = props.appearance;
  const isAutoAppearance = !rawAppearance || rawAppearance === 'auto';
  const resolvedAppearance: Exclude<ComponentAppearance, 'auto'> = isAutoAppearance
    ? 'secondary'
    : (rawAppearance as Exclude<ComponentAppearance, 'auto'>);
  const resolvedSize = resolveSize(props.size ?? 'm');

  const isChecked = props.checked === true;

  return {
    isDisabled,
    isReadOnly,
    isChecked,
    resolvedAppearance,
    resolvedSize,
    dataAttrs: {
      'data-size': resolvedSize,
      'data-appearance': resolvedAppearance,
      ...(isChecked ? { 'data-checked': '' as const } : { 'data-unchecked': '' as const }),
      ...(isReadOnly ? { 'data-readonly': '' as const } : {}),
    },
  };
}

// ─── Accessibility ─────────────────────────────────────────────────────────

/**
 * Map Radio props to RN accessibility props. Uses `accessibilityRole='radio'`
 * with `accessibilityState.selected` (the canonical RN representation for
 * radio buttons; `AccessibilityState` supports `selected` for radios).
 *
 * `accessibilityLabel` resolution: `accessibilityLabel` → `aria-label` → trimmed `label`.
 */
export function getRadioAccessibilityProps(
  props: Pick<
    RadioProps,
    | 'accessibilityLabel'
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-hidden'
    | 'label'
    | 'accessibilityHint'
  >,
  state: { isDisabled: boolean; isReadOnly: boolean; isChecked: boolean }
): {
  accessible: boolean;
  focusable?: boolean;
  accessibilityRole: 'radio';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: {
    disabled: boolean;
    selected: boolean;
    readonly?: true;
  };
  accessibilityLabelledBy?: string;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
} {
  const ariaHidden = props['aria-hidden'] === true;
  const accessibilityLabel =
    props.accessibilityLabel ?? props['aria-label'] ?? props.label ?? undefined;
  const labelledBy = props['aria-labelledby'] ?? props['aria-describedby'];

  return {
    accessible: !ariaHidden,
    focusable: !ariaHidden,
    accessibilityRole: 'radio',
    accessibilityLabel,
    accessibilityHint: props.accessibilityHint,
    accessibilityState: {
      disabled: state.isDisabled,
      selected: state.isChecked,
      readonly: state.isReadOnly ? true : undefined,
    },
    ...(labelledBy ? { accessibilityLabelledBy: labelledBy } : {}),
    accessibilityElementsHidden: ariaHidden,
    importantForAccessibility: ariaHidden ? 'no-hide-descendants' : undefined,
  };
}
