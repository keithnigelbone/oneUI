/**
 * InputField interface (native)
 *
 * Single source for the native InputField prop contract, state resolver, and
 * accessibility mapper. Native owns its own contract — **no import from
 * `@oneui/ui` web shared modules**. Authored against:
 *
 *   - Web shared: `packages/ui/src/components/InputField/InputField.shared.ts`
 *     (`InputFieldProps`).
 *   - Web render: `packages/ui/src/components/InputField/InputField.tsx`
 *     (label → Input → feedback → dynamic row aggregator).
 *   - Native Input: `packages/ui-native/src/components/Input/interface.ts`
 *     (`InputProps`, `useInputState`, size / appearance / attention enums).
 *   - Layers RN: `jdsinputfield/generated/interface.ts` (`testID`, label /
 *     input / feedback / dynamicText slot elements).
 *
 * InputField is the aggregator on top of the bordered Input shell:
 *
 *   1. Field root container (vertical stack, gap = Spacing-1-5).
 *   2. Label / description header (string `label` + `description`), with
 *      optional required asterisk + info-icon `labelTrailing`.
 *   3. Bordered `Input` (label is owned by InputField, not delegated).
 *   4. Optional `InputFeedback` (string `error` shorthand or full slot).
 *   5. Optional `InputDynamicText` row (string `dynamicText` / `helperButton`
 *      shorthand or full slot).
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type {
  InputAppearance,
  InputAttention,
  InputFocusEvent,
  InputLabelSize,
  InputNumericSize,
  InputShape,
  InputSize,
} from '../Input/interface';
import { inputSizeToLabelSize, resolveInputSize } from '../Input/interface';
import type { InputFeedbackSize } from '../InputFeedback/interface';

// ============================================================================
// Re-exports (so consumers can import the unions from `./InputField` directly)
// ============================================================================

export type {
  InputAppearance,
  InputAttention,
  InputLabelSize,
  InputNumericSize,
  InputShape,
  InputSize,
};

// ============================================================================
// Props
// ============================================================================

/**
 * Native props for the `InputField` aggregator. Mirrors web `InputFieldProps`
 * minus the web-only delegation (`name`, form `validate`, `validationMode`,
 * `onKeyDown`, HTML-only `id`) which has no React Native equivalent today.
 */
export interface InputFieldProps {
  // --- Label header ---
  /** Label text for the field. */
  label?: string;
  /** Description text below the label row. */
  description?: string;
  /** When `true` with a string `label`, shows the default info control unless `infoIconSlot` is set. */
  infoIcon?: boolean;
  /** Replaces the default info `IconButton` when `infoIcon` is `true`. */
  infoIconSlot?: ReactNode;
  /**
   * Accessible name for the default info `IconButton`. Ignored when
   * `infoIconSlot` is set. Web parity default: `'More information'`.
   */
  infoIconAriaLabel?: string;

  // --- Input core ---
  /**
   * Input size — one of the t-shirt tiers `'xs' | 's' | 'm' | 'l'`.
   * @default 'm'
   */
  size?: InputSize;
  /** Multi-accent appearance role. `'auto'` resolves to `'secondary'`. */
  appearance?: InputAppearance;
  /** Container shape — per-size radius (`'default'`) or fully rounded `'pill'`. */
  shape?: InputShape;
  /** Visual attention — outlined (`'medium'`) or filled (`'high'`). */
  attention?: InputAttention;

  // --- 4-slot system (delegated to Input) ---
  /** Leading slot. */
  start?: ReactNode;
  /** Second leading slot. */
  start2?: ReactNode;
  /** Trailing slot. */
  end?: ReactNode;
  /** Second trailing slot. */
  end2?: ReactNode;

  // --- Value ---
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;

  // --- State ---
  disabled?: boolean;
  readOnly?: boolean;
  /** Required field — adds visible asterisk + a11y `required`. */
  required?: boolean;
  /**
   * Marks the field invalid. When `true`, the bordered Input paints negative
   * stroke chrome and the default feedback row uses `variant="negative"`.
   */
  invalid?: boolean;
  /** Maximum character length. */
  maxLength?: number;

  // --- Form / wiring ---
  id?: string;
  /** Web parity; RN has no field `name` concept but the prop is preserved. */
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  autoComplete?: string;
  autoFocus?: boolean;

  // --- Events ---
  onFocus?: (e: InputFocusEvent) => void;
  onBlur?: (e: InputFocusEvent) => void;

  // --- Feedback ---
  /** Shorthand for a negative `InputFeedback` row below the input. */
  error?: string;
  /** Pre-built `InputFeedback` element. Wins over `error` when set. */
  feedback?: ReactNode;

  // --- Dynamic text row ---
  /** Leading copy (trimmed non-empty only). */
  dynamicText?: string;
  /** Trailing action label (trimmed non-empty only). */
  helperButton?: string;
  /**
   * Press handler for the `helperButton` trailing action. Forwarded to the
   * dynamic-text row's `InputDynamicText.onEndClick`. Without this, a
   * `helperButton` renders a visible but non-functional button.
   */
  onHelperPress?: () => void;

  // --- Styling ---
  /** Stretch to fill the parent width (web-parity flag; the field already fills). */
  fullWidth?: boolean;
  /** Additional native styles applied to the root `<View>`. */
  style?: ViewStyle;

  // --- React Native specific ---
  /**
   * Test identifier. Forwarded to the **inner `<Input>` control** so E2E tools
   * (Maestro `tapOn: { id }`, RNTL `getByTestId`) target the actual field. The
   * decorative root wrapper is addressable as `` `${testID}-field` ``.
   */
  testID?: string;

  // --- Accessibility ---
  /**
   * Accessible name forwarded to the inner `<Input>`'s `accessibilityLabel`.
   * When unset, the visible `label` string is used automatically — pass this
   * only when there is no visible `label`, or the screen-reader copy must
   * differ from the visible copy.
   */
  accessibilityLabel?: string;
  /** Hint describing what activating the field does. */
  accessibilityHint?: string;
  /** Web-aligned alias for `accessibilityLabel`. */
  'aria-label'?: string;
  /** Id of the element that describes the field. */
  'aria-describedby'?: string;
  /** Marks the field invalid for assistive tech (alias for `invalid`). */
  'aria-invalid'?: boolean;
  /** Hide the entire stack from the accessibility tree. */
  'aria-hidden'?: boolean;
}

/** @deprecated Prefer `InputFieldProps`. */
export type InputFieldNativeProps = InputFieldProps;

// ============================================================================
// State resolver
// ============================================================================

export interface InputFieldState {
  /** Concrete (non-auto) appearance used for paint resolution. */
  resolvedAppearance: Exclude<InputAppearance, 'auto'>;
  /** Normalised numeric size driving style-table lookups. */
  numericSize: InputNumericSize;
  /** Label-stack header tier (S / M / L) — drives label / info icon sizing. */
  labelSize: InputLabelSize;
  /** Container shape after defaulting. */
  shape: InputShape;
  /** Attention after defaulting. */
  attention: InputAttention;
  /** Effective disabled flag. */
  isDisabled: boolean;
  /** Effective read-only flag. */
  isReadOnly: boolean;
  /** Effective invalid flag — covers `invalid`, `error`, and `aria-invalid`. */
  isInvalid: boolean;
  /** Whether the field has a trimmed string `label`. */
  hasLabel: boolean;
  /** Whether the field has a trimmed string `description`. */
  hasDescription: boolean;
  /** Whether the default info trigger should render. */
  hasInfoIcon: boolean;
  /** Whether a feedback row will render (string `error` or `feedback` node). */
  hasFeedback: boolean;
  /** Whether a dynamic-text row will render. */
  hasDynamicRow: boolean;
  /** Feedback size resolved from the input size (S / M / L). */
  feedbackSize: InputFeedbackSize;
  /** Resolved info icon `aria-label` (defaults to web parity copy). */
  infoIconAriaLabel: string;
  /**
   * Accessible name forwarded to the inner `<Input>`. Resolution order:
   *
   *   1. `accessibilityLabel` (explicit native-style override)
   *   2. `aria-label` (web-aligned alias)
   *   3. trimmed `label` (visible label string)
   *
   * Empty / whitespace-only sources are skipped; `undefined` when nothing
   * resolves so the inner `<TextInput>` falls back to the placeholder.
   */
  resolvedAccessibilityLabel: string | undefined;
}

function isNonEmptyTrimmed(value: string | undefined): value is string {
  return value != null && value.trim() !== '';
}

const DEFAULT_INFO_ARIA_LABEL = 'More information';

/**
 * Pick the first non-empty trimmed string from the argument list.
 * Returns `undefined` if every source is missing or whitespace-only.
 */
function firstNonEmpty(...candidates: Array<string | undefined>): string | undefined {
  for (const candidate of candidates) {
    if (candidate != null && candidate.trim() !== '') return candidate.trim();
  }
  return undefined;
}

/**
 * Pure state resolver. Mirrors `InputField.tsx`:
 *
 *   - `'auto'` (or unset) appearance → `'secondary'` (web `useInputState` default).
 *   - `invalid` is the OR of `invalid` / `aria-invalid` / non-empty `error`.
 *   - The default info trigger renders only when `infoIcon` is `true` AND a
 *     string `label` is present (web parity).
 *   - The feedback row renders when either `error` (non-empty) or `feedback`
 *     is set; the dynamic-text row renders when `dynamicText` or
 *     `helperButton` (non-empty) is set.
 *   - `resolvedAccessibilityLabel` falls back from `accessibilityLabel` →
 *     `aria-label` → trimmed `label`, so callers that pass only a visible
 *     `label="…"` automatically get a screen-reader name forwarded to the
 *     inner `<Input>`.
 */
export function useInputFieldState(props: InputFieldProps): InputFieldState {
  const resolvedAppearance: Exclude<InputAppearance, 'auto'> =
    props.appearance == null || props.appearance === 'auto' ? 'secondary' : props.appearance;

  const numericSize = resolveInputSize(props.size);
  const labelSize = inputSizeToLabelSize(props.size);
  const shape: InputShape = props.shape ?? 'default';
  const attention: InputAttention = props.attention ?? 'medium';

  const hasLabel = isNonEmptyTrimmed(props.label);
  const hasDescription = isNonEmptyTrimmed(props.description);
  const hasErrorString = isNonEmptyTrimmed(props.error);

  const isInvalid =
    Boolean(props.invalid) || Boolean(props['aria-invalid']) || hasErrorString;

  const hasInfoIcon = Boolean(props.infoIcon) && hasLabel;

  const hasFeedback = hasErrorString || props.feedback != null;

  const hasDynamicRow =
    isNonEmptyTrimmed(props.dynamicText) || isNonEmptyTrimmed(props.helperButton);

  const feedbackSize: InputFeedbackSize = labelSize;

  const resolvedAccessibilityLabel = firstNonEmpty(
    props.accessibilityLabel,
    props['aria-label'],
    props.label,
  );

  return {
    resolvedAppearance,
    numericSize,
    labelSize,
    shape,
    attention,
    isDisabled: Boolean(props.disabled),
    isReadOnly: Boolean(props.readOnly),
    isInvalid,
    hasLabel,
    hasDescription,
    hasInfoIcon,
    hasFeedback,
    hasDynamicRow,
    feedbackSize,
    infoIconAriaLabel: props.infoIconAriaLabel ?? DEFAULT_INFO_ARIA_LABEL,
    resolvedAccessibilityLabel,
  };
}

// ============================================================================
// Accessibility
// ============================================================================

export interface InputFieldAccessibilityProps {
  /** The root container is decorative — only the inner Input carries focus. */
  accessible: boolean;
  accessibilityRole?: 'none';
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

/**
 * Map props + resolved state to React Native a11y props **for the root
 * field `<View>`**. The bordered Input itself owns its own
 * `accessibilityLabel` / `accessibilityState` / live regions; this helper
 * only handles the `aria-hidden` opt-out at the field boundary so an entire
 * decorative field can be collapsed.
 */
export function getInputFieldAccessibilityProps(
  props: Pick<InputFieldProps, 'aria-hidden'>,
): InputFieldAccessibilityProps {
  if (props['aria-hidden']) {
    return {
      accessible: false,
      accessibilityRole: 'none',
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    };
  }
  return { accessible: false };
}

// ============================================================================
// Inner Input prop forwarding
// ============================================================================

/**
 * The subset of `InputFieldProps` that forward 1:1 to the bordered `Input`
 * shell. Used in the renderer to keep the prop pipe explicit and let
 * TypeScript verify the cross-component contract.
 */
export type InputFieldToInputProps = Pick<
  InputFieldProps,
  | 'size'
  | 'appearance'
  | 'shape'
  | 'attention'
  | 'start'
  | 'start2'
  | 'end'
  | 'end2'
  | 'placeholder'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onSubmit'
  | 'disabled'
  | 'readOnly'
  | 'required'
  | 'maxLength'
  | 'id'
  | 'name'
  | 'type'
  | 'autoComplete'
  | 'autoFocus'
  | 'onFocus'
  | 'onBlur'
  | 'accessibilityHint'
  | 'aria-label'
  | 'aria-describedby'
>;
