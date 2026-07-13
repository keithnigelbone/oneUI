/**
 * CheckboxField interface (native)
 *
 * Mirrors `packages/ui/src/components/CheckboxField/CheckboxField.shared.ts`.
 *
 * Composition shell around `Checkbox`:
 *   - **Single mode** (no `children`): integrated checkbox with field-level
 *     `label` / `description`, optional `infoIconSlot` beside the label,
 *     `error` / `feedback`, and a trailing `dynamicText` row.
 *   - **Multi-option mode** (`children` are `<Checkbox>` items): renders the
 *     `label` / `description` as a fieldset-style header, then the children
 *     (vertically stacked), then `error` / `feedback`, then `dynamicText`.
 *
 * Cross-check: Layers `JDSCheckboxField`
 * (`libs/react-4/.../jdscheckboxfield-4` + `libs/react-native/.../jdscheckboxfield`)
 *
 *   | Layers prop | OneUI native |
 *   | ----------- | ------------- |
 *   | `size: 'M' | 'S' | 'L'` | `size: 's' | 'm' | 'l'` (case canonicalised by `Checkbox.resolveSize`) |
   *   | `active: 'checked' | 'unchecked' | 'indeterminate'` | `selected: boolean` + `indeterminate: boolean` (3-state booleans) |
 *   | `state: 'idle' | 'readOnly' | 'positive' | 'negative'` | `readOnly: boolean` + `invalid: boolean` (or `error: string`) |
 *   | `helperText: string` | folded into `error` (negative) / `feedback` slot / `dynamicText` |
 *   | `label` (typed JSX slot) / `feedback` (typed JSX slot) | string `label` / `description` props + `feedback?: ReactNode` slot |
   *   | `onClick` | `onSelectedChange(next)` (single mode) or `onGroupValueChange(values)` (multi mode) |
 *   | `ariaLabel` / `ariaDescribedby` | `aria-label` / `aria-describedby` (dashed for cross-platform parity) |
 *
 * Web-only props that are intentionally NOT mirrored on native (RN has no
 * BaseUI `Field.Root` counterpart):
 *   - `validationMode: 'onBlur' | 'onChange'`
 *   - `validate: (value: unknown) => string | string[] | null`
 * Use the host form library (Formik / RHF / react-native-paper) to drive
 * validation, then forward `error` / `invalid` to the native CheckboxField.
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type {
  CheckboxAppearance,
  CheckboxSize,
  CheckboxProps,
} from '../Checkbox/interface';

/**
 * Map CheckboxField S / M / L to numeric f-step (8 / 10 / 12) — same as
 * `checkboxFieldSizeToInputNumeric` on web. Today the native field has no
 * direct consumer (no `<InputFeedback size={…}>` peer yet) but the helper
 * stays here for API symmetry and to prepare for the upcoming InputFeedback
 * native port.
 */
export function checkboxFieldSizeToInputNumeric(size?: CheckboxSize): 8 | 10 | 12 {
  // Resolve legacy aliases without re-importing `resolveSize`: the explicit
  // canonical short names short-circuit, the t-shirt aliases collapse.
  const canonical = size === 'small' ? 's'
    : size === 'medium' ? 'm'
    : size === 'large' ? 'l'
    : size ?? 'm';
  if (canonical === 's') return 8;
  if (canonical === 'l') return 12;
  return 10;
}

/** Props owned by `CheckboxField` — not passed through to the inner `Checkbox`. */
type CheckboxFieldCompositionOmit =
  | 'labelSuffixInside'
  | 'labelTrailing'
  | 'errorHighlight'
  | 'label'
  | 'description'
  | 'accent';

export interface CheckboxFieldProps extends Omit<CheckboxProps, CheckboxFieldCompositionOmit> {
  /**
   * Multi-option children — pass standalone `<Checkbox>` items for a
   * grouped field. When set, `label` / `description` render as the field
   * header and `feedback` / `dynamicText` render below the list. Omit for
   * the single integrated mode (label and description beside the control).
   */
  children?: ReactNode;

  /** Multi-option checked values (controlled). Use with `children`. */
  groupValue?: string[];
  /** Multi-option default checked values (uncontrolled). Use with `children`. */
  groupDefaultValue?: string[];
  /** Multi-option change handler. Receives the next list of selected `value`s. */
  onGroupValueChange?: (value: string[]) => void;

  /** Mark the field invalid — drives error chrome on the inner Checkbox(es). */
  invalid?: boolean;

  /** Label text for the field header (multi) or integrated label (single). */
  label?: string;
  /** Description below the label row. */
  description?: string;
  /**
   * Trailing control beside the label (e.g. info `IconButton`, menu, etc.).
   * Mirrors web `infoIconSlot` — forwarded to the inner Checkbox's
   * `labelTrailing` slot in single mode, or rendered next to the legend in
   * multi-option mode.
   */
  infoIconSlot?: ReactNode;

  /** Stretch to fill container width. */
  fullWidth?: boolean;

  /** Mark the field required — renders an asterisk after the label. */
  required?: boolean;

  /** Error message (shorthand for negative feedback row). */
  error?: string;
  /** Custom feedback node — replaces the auto-rendered `error` row. */
  feedback?: ReactNode;

  /**
   * Dynamic text row — pass a custom node. When set, `dynamicText` and
   * `helperButton` are ignored.
   */
  dynamicTextSlot?: ReactNode;
  /** Leading copy for the dynamic text row. */
  dynamicText?: string;
  /**
   * Trailing label for the dynamic text row — rendered as a `Pressable`
   * Text. Pair with `onHelperPress` to wire a handler.
   */
  helperButton?: string;
  /** Handler invoked when `helperButton` is pressed. */
  onHelperPress?: () => void;

  /** Inline native styles for the outer field wrapper. */
  style?: ViewStyle;
}

/** @deprecated Prefer `CheckboxFieldProps`. */
export type CheckboxFieldNativeProps = CheckboxFieldProps;

/**
 * Resolve the runtime decisions used by `CheckboxField.native.tsx`. Mirrors
 * how the web component derives `isInvalid` (either explicit `invalid` or
 * any non-empty `error` string). Multi-option mode is gated on the presence
 * of `children`.
 */
export function useCheckboxFieldState(
  props: Pick<CheckboxFieldProps, 'invalid' | 'error' | 'children' | 'disabled'>,
): {
  isInvalid: boolean;
  isDisabled: boolean;
  isMultiMode: boolean;
} {
  const isInvalid = props.invalid === true || (typeof props.error === 'string' && props.error.trim() !== '');
  return {
    isInvalid,
    isDisabled: props.disabled === true,
    isMultiMode: props.children != null,
  };
}

/**
 * Map CheckboxField props to the field-level RN accessibility props. Used
 * on the outer `<View>` so VoiceOver / TalkBack announces the legend (label
 * + description) once before walking into the individual checkboxes.
 *
 * RN's `accessibilityRole` enum does not include `'group'` (the closest web
 * `role="group"` analogue), so the wrapper relies on `accessible` +
 * `accessibilityLabel` to surface the field name. The inner Checkbox
 * elements still report `accessibilityRole='checkbox'` so the whole
 * grouping reads correctly to assistive tech.
 */
export function getCheckboxFieldAccessibilityProps(
  props: Pick<
    CheckboxFieldProps,
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

export type { CheckboxAppearance, CheckboxSize };
