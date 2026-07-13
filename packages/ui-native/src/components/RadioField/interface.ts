/**
 * RadioField interface (native)
 *
 * Mirrors `packages/ui/src/components/RadioField/RadioField.shared.ts`.
 *
 * Composition shell around `Radio` / `RadioGroup`:
 *   - **Integrated single mode** (no `children`, string `label`): implicit
 *     lone `<Radio>` beside the field label / description (on/off semantics
 *     via `checked` + `onCheckedChange` or `value` / `onValueChange` against
 *     `singleOptionValue`).
 *   - **Multi-option mode** (>=2 `<Radio>` children): renders `label` /
 *     `description` as a fieldset-style header, then a `<RadioGroup>` of
 *     children, then `error` / `feedback`, then `dynamicText`.
 *   - **Plain option mode** (1 `<Radio>` child): no fieldset legend; the
 *     option labels itself.
 *
 * Cross-check: Layers `JDSRadioField`
 * (`libs/react-4/.../jdsradiofield-4` + `libs/react-native/.../jdsradiofield`)
 *
 *   | Layers prop | OneUI native |
 *   | ----------- | ------------- |
 *   | `size: 'M' | 'S' | 'L'` | `size: 's' | 'm' | 'l'` (case canonicalised) |
 *   | `active: boolean` | `checked: boolean` (integrated single mode) or `value: string` (multi mode) |
 *   | `state: 'idle' | 'readOnly' | 'positive' | 'negative'` | `readOnly: boolean` + `invalid: boolean` (or `error: string`) |
 *   | `helperText: string` | folded into `error` (negative) / `feedback` slot / `dynamicText` |
 *   | `appearance` | same union (no `brand-bg`) |
 *   | `label` (typed JSX slot) / `feedback` (typed JSX slot) | string `label` / `description` props + `feedback?: ReactNode` slot |
 *   | `onClick` | `onCheckedChange(next)` (integrated) or `onValueChange(value)` (multi) |
 *   | `ariaLabel` / `ariaDescribedby` | `aria-label` / `aria-describedby` |
 *
 * Web-only props that are intentionally NOT mirrored on native (RN has no
 * BaseUI `Field.Root` counterpart):
 *   - `validationMode: 'onBlur' | 'onChange'`
 *   - `validate: (value: unknown) => string | string[] | null`
 * Drive validation from the host form library and forward `error` /
 * `invalid` to the native RadioField.
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { RadioAppearance, RadioSize } from '../Radio/interface';
import { resolveSize } from '../Radio/interface';

/**
 * Map RadioField S / M / L to numeric f-step (8 / 10 / 12) — same as
 * `radioFieldSizeToInputNumeric` on web. Today the native field has no
 * direct consumer (no `<InputFeedback size={…}>` peer yet) but the helper
 * stays here for API symmetry and to prepare for the upcoming InputFeedback
 * native port.
 */
export function radioFieldSizeToInputNumeric(size?: RadioSize): 8 | 10 | 12 {
  const canonical = resolveSize(size ?? 'm');
  if (canonical === 's') return 8;
  if (canonical === 'l') return 12;
  return 10;
}

export interface RadioFieldProps {
  /** Radio options. Omit for integrated single-mode (label + implicit control). */
  children?: ReactNode;

  /** Group selected value (controlled). Multi mode + integrated single string mode. */
  value?: string;
  /** Group default selected value (uncontrolled). */
  defaultValue?: string;
  /** Group change handler (string value of selected option). */
  onValueChange?: (value: string) => void;

  /**
   * Integrated single mode only — controlled on/off (`true` = selected
   * `singleOptionValue`). Prefer `value` / `onValueChange` when you need the
   * string value directly.
   */
  checked?: boolean;
  /**
   * Integrated single mode only — uncontrolled default on/off. When set,
   * overrides `defaultValue` for the implicit lone option unless `value` is
   * controlled.
   */
  defaultChecked?: boolean;
  /** Integrated single mode — fired when the lone option toggles. */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Form value for the implicit lone Radio when `children` is omitted.
   * Group is "on" when `value === singleOptionValue`, "off" when `value === ''`.
   * @default 'on'
   */
  singleOptionValue?: string;

  /** Mark the field invalid — drives error chrome on the inner Radio(s). */
  invalid?: boolean;

  /** Label text for the field header (multi) or integrated label (single). */
  label?: string;
  /** Description below the label row. */
  description?: string;
  /** Trailing control beside the label (e.g. info IconButton). */
  infoIconSlot?: ReactNode;

  /** Stretch to fill container width. */
  fullWidth?: boolean;
  /** Mark the field required — renders an asterisk after the label. */
  required?: boolean;

  /** Group-level disabled. */
  disabled?: boolean;
  /** Group-level read-only. */
  readOnly?: boolean;
  /** Size preset (forwarded to all options). */
  size?: RadioSize;
  /** Appearance role (forwarded to all options). */
  appearance?: RadioAppearance;
  /** Layout orientation. Default: 'vertical'. */
  orientation?: 'vertical' | 'horizontal';

  /** Error message (shorthand for negative feedback row). */
  error?: string;
  /** Custom feedback node — replaces the auto-rendered `error` row. */
  feedback?: ReactNode;

  /** Dynamic text row — pass a custom node. */
  dynamicTextSlot?: ReactNode;
  /** Leading copy for the dynamic text row. */
  dynamicText?: string;
  /** Trailing label for the dynamic text row — rendered as a `Pressable` Text. */
  helperButton?: string;
  /** Handler invoked when `helperButton` is pressed. */
  onHelperPress?: () => void;

  /** Inline native styles for the outer field wrapper. */
  style?: ViewStyle;

  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  accessibilityHint?: string;
  testID?: string;
}

/** @deprecated Prefer `RadioFieldProps`. */
export type RadioFieldNativeProps = RadioFieldProps;

/**
 * Resolve runtime decisions for `RadioField.native.tsx`. Mirrors the web
 * `isInvalid` derivation (explicit `invalid` or any non-empty `error`).
 */
export function useRadioFieldState(
  props: Pick<
    RadioFieldProps,
    'invalid' | 'error' | 'children' | 'disabled' | 'label'
  >,
): {
  isInvalid: boolean;
  isDisabled: boolean;
  isMultiOptionMode: boolean;
  isPlainOptionMode: boolean;
  isIntegratedSingleMode: boolean;
  optionCount: number;
} {
  const isInvalid =
    props.invalid === true ||
    (typeof props.error === 'string' && props.error.trim() !== '');

  // Count direct child elements without re-walking the React tree here —
  // the field component does the actual flattening with `Children` to also
  // unwrap `<Fragment>`. This helper is used for tests + the data-attribute
  // story; the component itself derives its mode from the live count after
  // flattening.
  const childArray = Array.isArray(props.children) ? props.children : props.children != null ? [props.children] : [];
  const optionCount = childArray.length;

  const isMultiOptionMode = optionCount > 1;
  const isPlainOptionMode = optionCount === 1;
  const isIntegratedSingleMode =
    optionCount === 0 && typeof props.label === 'string' && props.label.trim() !== '';

  return {
    isInvalid,
    isDisabled: props.disabled === true,
    isMultiOptionMode,
    isPlainOptionMode,
    isIntegratedSingleMode,
    optionCount,
  };
}

/**
 * Map RadioField props to the field-level RN accessibility props applied on
 * the outer `<View>` wrapper.
 */
export function getRadioFieldAccessibilityProps(
  props: Pick<
    RadioFieldProps,
    'aria-label' | 'aria-describedby' | 'aria-hidden' | 'label' | 'accessibilityHint'
  >,
  state: { isInvalid: boolean; isDisabled: boolean },
): {
  accessible: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: { disabled: boolean };
  accessibilityLabelledBy?: string;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
} {
  const ariaHidden = props['aria-hidden'] === true;
  const accessibilityLabel = props['aria-label'] ?? props.label ?? undefined;
  return {
    accessible: !ariaHidden,
    accessibilityLabel,
    accessibilityHint: props.accessibilityHint,
    accessibilityState: { disabled: state.isDisabled },
    ...(props['aria-describedby']
      ? { accessibilityLabelledBy: props['aria-describedby'] }
      : {}),
    accessibilityElementsHidden: ariaHidden,
    importantForAccessibility: ariaHidden ? 'no-hide-descendants' : undefined,
  };
}

export type { RadioAppearance, RadioSize };
