/**
 * Input interface (native)
 *
 * Single source for the native Input prop contract, state resolver, and
 * accessibility mapper. Native owns its own contract — **no import from
 * `@oneui/ui` web shared modules**. Authored against:
 *
 *   - Web: `packages/ui/src/components/Input/Input.shared.ts` (`InputProps`,
 *     `useInputState`, `resolveSize`, `inputSizeToLabelSize`).
 *   - Web render: `packages/ui/src/components/Input/Input.tsx` (bordered
 *     4-slot shell + Base UI `Input`).
 *   - Layers RN: `jdsinput/generated/interface.ts` (`testID`, `ariaLabel`,
 *     `accessibilityHint`, RN `Pressable` / `TextInput` aliases).
 *
 * Mirrors the Figma model (node 4306:7247 + 4654:4141):
 *   - 4 sizes (XS/S/M/L → f6/f8/f10/f12) driving height, padding, gap, radius.
 *   - 9 appearance roles + `'auto'` (defaults to `'secondary'`, matching web).
 *   - Two attention levels (`'medium'` = outlined; `'high'` = filled).
 *   - 4-slot system (`start`, `start2`, `end`, `end2`).
 *   - `errorHighlight` paints the negative bold stroke on the container.
 *
 * Label / description / required asterisk / info trigger are **not** owned
 * by Input — they live in the higher-level `InputField` aggregator. The
 * bordered shell exposes an `accessibilityLabel` for assistive tech only.
 */

import type { ReactNode } from 'react';
import type {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  TargetedEvent,
  TextInputKeyPressEventData,
  TextInputSubmitEditingEventData,
  ViewStyle,
} from 'react-native';

/**
 * Focus / blur callback payload matching React Native's `TextInputProps.onFocus`
 * / `onBlur` typings. The DOM-style `text` / `eventCount` payload from
 * `TextInputFocusEventData` is **not** delivered to these handlers — RN routes
 * those through `onSubmitEditing` instead.
 */
type InputFocusEvent = NativeSyntheticEvent<TargetedEvent>;

// ============================================================================
// Enums + tuples
// ============================================================================

/**
 * Input appearance — intentionally narrower than `ComponentAppearance` to
 * mirror web's `InputAppearance` (no `'brand-bg'`). To extend, add the
 * `brand-bg` paint here AND in the native role-resolution helper below.
 */
export type InputAppearance =
  | 'auto'
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'sparkle'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'informative';

/**
 * Input sizes aligned with Figma `.DNA/Input` — the t-shirt tiers
 * `'xs' | 's' | 'm' | 'l'` only. Each maps to a numeric f-step
 * (6 / 8 / 10 / 12) internally via `resolveInputSize` for style-table lookups.
 *
 * The numeric f-step values and the legacy `small`/`medium`/`large` aliases are
 * **no longer part of the public API** — only the four t-shirt strings are
 * accepted.
 *
 * Web and native both resolve the four t-shirt tiers to f6 / f8 / f10 / f12.
 */
export type InputSize = 'xs' | 's' | 'm' | 'l';

/** Container shape — default per-size radius (Shape-2 / Shape-3) or `Pill`. */
export type InputShape = 'default' | 'pill';

/**
 * Visual attention — `'medium'` outlined (transparent fill + Stroke-M idle);
 * `'high'` filled (role Subtle background, hidden stroke at rest).
 */
export type InputAttention = 'medium' | 'high';

/** Numeric f-step resolved from `InputSize`. Used by style tables. */
export type InputNumericSize = 6 | 8 | 10 | 12;

/** Label stack header tier — matches `InputDynamicTextSize`. */
export type InputLabelSize = 's' | 'm' | 'l';

export const INPUT_APPEARANCES: readonly Exclude<InputAppearance, 'auto'>[] = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

export const INPUT_SIZES: readonly InputLabelSize[] = ['s', 'm', 'l'];
export const INPUT_NUMERIC_SIZES: readonly InputNumericSize[] = [6, 8, 10, 12];
export const INPUT_ATTENTIONS: readonly InputAttention[] = ['medium', 'high'];

// ============================================================================
// Size resolution (web parity — see Input.shared.ts:resolveSize)
// ============================================================================

/** T-shirt tier → numeric f-step used by the style tables. */
const SIZE_ALIASES: Record<InputSize, InputNumericSize> = {
  xs: 6,
  s: 8,
  m: 10,
  l: 12,
};

/**
 * Normalises an `InputSize` to its numeric f-step (`6 | 8 | 10 | 12`) so style
 * tables can always be keyed by the numeric form. Unset → `10` (`'m'`).
 *
 * Only the four t-shirt tiers are supported. Anything else (a stray number or
 * a removed legacy alias from untyped JS callers) falls back to `10` with a
 * dev-mode warning. Unlike web — which coerces `xs` to `s` (8) — native
 * resolves the dedicated XS (f6) tier (Figma parity bug fix).
 */
export function resolveInputSize(size: InputSize | undefined): InputNumericSize {
  if (size == null) return 10;
  const resolved = SIZE_ALIASES[size];
  if (resolved !== undefined) return resolved;
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`Input: size="${size}" is not supported. Use 'xs' | 's' | 'm' | 'l'. Using 'm' instead.`);
  }
  return 10;
}

/** Map numeric f-step → label-stack tier (S / M / L). */
export function inputSizeToLabelSize(size: InputSize | undefined): InputLabelSize {
  const n = resolveInputSize(size);
  if (n <= 8) return 's';
  if (n <= 10) return 'm';
  return 'l';
}

// ============================================================================
// Props
// ============================================================================

/** Subset of RN `TextInput` keyboard types that map cleanly to web `type`. */
export type InputKeyboardType = KeyboardTypeOptions;

export interface InputProps {
  // --- Appearance ---
  /**
   * Input size — one of the t-shirt tiers `'xs' | 's' | 'm' | 'l'`.
   * @default 'm'
   */
  size?: InputSize;
  /**
   * Multi-accent appearance role. `'auto'` resolves to `'secondary'` to match
   * web's `useInputState` (Figma default for focus + slot tints).
   * @default 'auto'
   */
  appearance?: InputAppearance;
  /**
   * Container shape — per-size radius (`'default'`) or fully rounded `'pill'`.
   * @default 'default'
   */
  shape?: InputShape;
  /**
   * Visual attention — outlined (`'medium'`) or filled (`'high'`).
   * @default 'medium'
   */
  attention?: InputAttention;
  /**
   * Error-state chrome on the bordered container. When `true`, the border
   * paints with `Negative-Bold` at `Spacing-0-5`. Pair with visible feedback
   * text (e.g. `<InputFeedback variant="negative" />`) for accessibility.
   */
  errorHighlight?: boolean;

  // --- 4-slot system ---
  /** Leading slot — Icon, IconButton, Avatar, Image, ChipGroup, or Text. */
  start?: ReactNode;
  /** Second leading slot — typically Text (prefix, currency symbol). */
  start2?: ReactNode;
  /** Trailing slot — IconButton, Icon, Button, or Text. */
  end?: ReactNode;
  /** Second trailing slot — Text, Icon, or IconButton. */
  end2?: ReactNode;

  // --- Value ---
  /** Placeholder text. */
  placeholder?: string;
  /** Current value (controlled). */
  value?: string;
  /** Default value (uncontrolled). */
  defaultValue?: string;
  /** Change handler — receives the new value string (no event arg). */
  onChange?: (value: string) => void;
  /** Submit handler — wired to RN `TextInput.onSubmitEditing`. */
  onSubmit?: (value: string) => void;

  // --- State ---
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Whether the input is read-only. */
  readOnly?: boolean;
  /** Whether the control is required (forwarded to a11y; no native effect). */
  required?: boolean;
  /** Maximum character length (RN `TextInput.maxLength`). */
  maxLength?: number;

  // --- Form / wiring ---
  /** RN `TextInput.id`. Mirrors web `<input id>`. */
  id?: string;
  /** Web `name` — included for parity though RN ignores it. */
  name?: string;
  /**
   * Web `type` (`text | email | password | number | tel | url | search`).
   * Maps to `keyboardType` + `secureTextEntry` automatically.
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** RN `autoComplete` passthrough. */
  autoComplete?: string;
  /** RN `autoFocus` passthrough. */
  autoFocus?: boolean;

  // --- Events ---
  onFocus?: (e: InputFocusEvent) => void;
  onBlur?: (e: InputFocusEvent) => void;
  onKeyPress?: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
  /** Lower-level submit event — receives the raw RN event. */
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;

  // --- Styling ---
  /** Additional styles applied to the bordered container `<View>`. */
  style?: ViewStyle;

  // --- React Native specific ---
  /** Test identifier — mirrors Layers RN `testID`. */
  testID?: string;

  // --- Accessibility ---
  /**
   * Accessible name for the input. Required for inputs without an external
   * visible label — assistive tech reads this verbatim. Wrap the Input in
   * `<InputField label="…">` to wire a visible label automatically.
   */
  accessibilityLabel?: string;
  /** Hint describing what activating the input does. */
  accessibilityHint?: string;
  /** Web-aligned alias for `accessibilityLabel`. Kept for parity with web `InputProps`. */
  'aria-label'?: string;
  /** Id of the element that describes the input (web parity). */
  'aria-describedby'?: string;
  /** Marks the input invalid for assistive tech. Pairs with `errorHighlight`. */
  'aria-invalid'?: boolean;
  /** Hide the input from the accessibility tree (decorative inputs). */
  'aria-hidden'?: boolean;
}

/** @deprecated Prefer `InputProps`. */
export type InputNativeProps = InputProps;

// ============================================================================
// State resolver
// ============================================================================

export interface InputState {
  /** Concrete (non-auto) appearance role used for paint resolution. */
  resolvedAppearance: Exclude<InputAppearance, 'auto'>;
  /** Normalised numeric size driving style-table lookups. */
  numericSize: InputNumericSize;
  /** Container shape after defaulting. */
  shape: InputShape;
  /** Attention after defaulting. */
  attention: InputAttention;
  /** Effective disabled flag. */
  isDisabled: boolean;
  /** Effective read-only flag. */
  isReadOnly: boolean;
  /** Whether the bordered container should render error chrome. */
  hasErrorHighlight: boolean;
  /** Whether any of the 4 slots is populated. */
  hasAnySlot: boolean;
}

/**
 * Pure state resolver. Mirrors `useInputState` from web's `Input.shared.ts`:
 *
 *   - `'auto'` (or unset) → `'secondary'` (Figma default for accent paints).
 *   - Size t-shirt tier → numeric f-step.
 *   - `hasErrorHighlight` is true when either `errorHighlight` or
 *     `aria-invalid` is set.
 */
export function useInputState(props: InputProps): InputState {
  const resolvedAppearance: Exclude<InputAppearance, 'auto'> =
    props.appearance == null || props.appearance === 'auto' ? 'secondary' : props.appearance;

  const numericSize = resolveInputSize(props.size);
  const shape: InputShape = props.shape ?? 'default';
  const attention: InputAttention = props.attention ?? 'medium';

  const hasAnySlot =
    props.start != null || props.start2 != null || props.end != null || props.end2 != null;

  return {
    resolvedAppearance,
    numericSize,
    shape,
    attention,
    isDisabled: Boolean(props.disabled),
    isReadOnly: Boolean(props.readOnly),
    hasErrorHighlight: Boolean(props.errorHighlight) || Boolean(props['aria-invalid']),
    hasAnySlot,
  };
}

// ============================================================================
// Type → keyboardType / secureTextEntry mapping
// ============================================================================

const TYPE_TO_KEYBOARD: Partial<Record<NonNullable<InputProps['type']>, KeyboardTypeOptions>> = {
  email: 'email-address',
  number: 'numeric',
  tel: 'phone-pad',
  url: 'url',
};

export interface ResolvedTextInputTypeOptions {
  keyboardType: KeyboardTypeOptions;
  secureTextEntry: boolean;
}

export type { InputFocusEvent };

/**
 * Maps the web-aligned `type` prop to RN `TextInput` props. `password` flips
 * `secureTextEntry` on; `search` falls through to the default `text` keyboard
 * (RN has no dedicated search keyboard outside iOS hardware accessory bar).
 */
export function resolveTextInputType(
  type: InputProps['type'] | undefined,
): ResolvedTextInputTypeOptions {
  if (type === 'password') {
    return { keyboardType: 'default', secureTextEntry: true };
  }
  if (type && TYPE_TO_KEYBOARD[type]) {
    return { keyboardType: TYPE_TO_KEYBOARD[type] as KeyboardTypeOptions, secureTextEntry: false };
  }
  return { keyboardType: 'default', secureTextEntry: false };
}

// ============================================================================
// Accessibility
// ============================================================================

export interface InputAccessibilityProps {
  accessible: boolean;
  accessibilityRole?: 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    disabled?: boolean;
    readonly?: boolean;
    selected?: boolean;
  };
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  /** Web-aligned aria-describedby — surfaced for cross-platform tests. */
  'aria-describedby'?: string;
  /** Web-aligned aria-invalid — surfaced for cross-platform tests. */
  'aria-invalid'?: boolean;
  /**
   * Web-aligned aria-readonly. On React Native Web this drives the rendered
   * `aria-readonly` attribute so screen readers announce the field as
   * **read-only** (Chrome a11y "Read-only: true") rather than disabled. The
   * `readOnly` boolean prop alone yields a DOM `readonly` attribute but does
   * NOT set `aria-readonly` (see RNW createDOMProps), so the AX flag stays
   * off without this. Native AT also reads `accessibilityState.readonly`.
   */
  'aria-readonly'?: boolean;
}

/**
 * Map props + resolved state to React Native accessibility props **for the
 * `<TextInput>`** itself. The bordered container is decorative — the input
 * carries the role / label / state.
 *
 * Defaults:
 *   - `accessibilityLabel` ← `accessibilityLabel` ?? `aria-label` (trimmed,
 *     empty string treated as absent). When omitted, the screen reader will
 *     fall back to the placeholder; pair the Input with a sibling label
 *     (e.g. `<InputField>`) or pass `accessibilityLabel` explicitly.
 *   - `accessibilityState.disabled` reflects **`disabled` only**. `readOnly` is
 *     NOT announced as disabled — a read-only field stays focusable/readable.
 *     Read-only is conveyed via `accessibilityState.readonly` + `aria-readonly`.
 *     Do **not** pass RN `TextInput.readOnly` — RN maps it to `editable={false}`,
 *     which sets `isEnabled=false` on Android and TalkBack announces "disabled".
 *   - `aria-hidden` collapses the input to a hidden subtree.
 */
export function getInputAccessibilityProps(
  props: Pick<
    InputProps,
    | 'accessibilityLabel'
    | 'accessibilityHint'
    | 'aria-label'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-hidden'
  >,
  state: Pick<InputState, 'isDisabled' | 'isReadOnly'>,
): InputAccessibilityProps {
  if (props['aria-hidden']) {
    return {
      accessible: false,
      accessibilityRole: 'none',
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    };
  }

  const explicit = props.accessibilityLabel ?? props['aria-label'];
  const accessibilityLabel =
    explicit != null && explicit.trim() !== '' ? explicit.trim() : undefined;

  const out: InputAccessibilityProps = {
    accessible: true,
    accessibilityLabel,
    accessibilityHint: props.accessibilityHint,
    accessibilityState: {
      // Only a truly disabled field is announced as disabled. `readOnly` is a
      // distinct state — it stays focusable/readable and is conveyed via
      // `accessibilityState.readonly` + `aria-readonly`, never `disabled`.
      disabled: state.isDisabled,
      ...(state.isReadOnly && !state.isDisabled ? { readonly: true as const } : {}),
    },
  };

  if (props['aria-describedby']) out['aria-describedby'] = props['aria-describedby'];
  if (props['aria-invalid'] != null) out['aria-invalid'] = props['aria-invalid'];

  // Read-only (but not disabled) is announced as read-only, never disabled.
  // A disabled field is inert and announces `disabled` instead, so it does not
  // also claim read-only here.
  if (state.isReadOnly && !state.isDisabled) out['aria-readonly'] = true;

  return out;
}
