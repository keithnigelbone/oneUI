/**
 * InputFeedback interface (native)
 *
 * Single source for the native InputFeedback prop contract and state
 * resolver. Mirrors the web sub-component at
 * `packages/ui/src/components/Input/internals/InputFeedback.tsx` (no
 * `@oneui/ui` import) and cross-checks against Layers
 * `jdsinputfeedback-4/generated/interface.ts` (React V4) and
 * `jdsinputfeedback/generated/interface.ts` (React Native).
 *
 * Contextual feedback / validation row rendered under an input.
 *
 *   variant   →  semantic colour role: negative | positive | warning | informative
 *   attention →  visual prominence: low (text only) | medium (tinted) | high (filled)
 *   size      →  numeric f-step 8 | 10 | 12 (aliased 's' | 'm' | 'l')
 *
 * Web emits the role + an `aria-live` region; the native peer maps both to
 * RN `accessibilityRole` (`alert` for negative, `status` otherwise) and the
 * `accessibilityLiveRegion` prop.
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Semantic colour role — one per Figma feedback variant. */
export type InputFeedbackVariant = 'negative' | 'positive' | 'warning' | 'informative';

/** Visual attention — low (text-only), medium (tinted fill), high (bold fill). */
export type InputFeedbackAttention = 'low' | 'medium' | 'high';

/**
 * Public feedback sizes — t-shirt only. Matches Figma `.DNA/InputFeedback`
 * (S / M / L). Every internal lookup (padding, radius, icon size, body
 * typography step) is keyed off this same enum.
 */
export type InputFeedbackSize = 's' | 'm' | 'l';

export const INPUT_FEEDBACK_VARIANTS: readonly InputFeedbackVariant[] = [
  'negative',
  'positive',
  'warning',
  'informative',
];

export const INPUT_FEEDBACK_ATTENTIONS: readonly InputFeedbackAttention[] = [
  'low',
  'medium',
  'high',
];

export const INPUT_FEEDBACK_SIZES: readonly InputFeedbackSize[] = ['s', 'm', 'l'];

const VALID_SIZES: ReadonlySet<InputFeedbackSize> = new Set(['s', 'm', 'l']);

/**
 * Normalise an `InputFeedbackSize` — passes through valid t-shirt tokens
 * and falls back to `'m'` for anything else. Provided for parity with the
 * web `resolveFeedbackSize` helper; the type system already constrains the
 * input, so the fallback only fires for casted / unsafe call sites.
 */
export function resolveFeedbackSize(size: InputFeedbackSize): InputFeedbackSize {
  return VALID_SIZES.has(size) ? size : 'm';
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Native `accessibilityRole` enum we honour. Web allows the full ARIA
 * vocabulary via the `role` prop; the React Native subset that maps cleanly
 * is `'alert' | 'status' | 'none'`.
 */
export type InputFeedbackRole = 'alert' | 'status' | 'none';

export interface InputFeedbackProps {
  /** Semantic variant — drives default icon and role colours. */
  variant?: InputFeedbackVariant;
  /** Visual attention — low (text only), medium (tint + stroke), high (filled). */
  attention?: InputFeedbackAttention;
  /** Feedback size — S/M/L (f8 / f10 / f12). */
  size?: InputFeedbackSize;
  /**
   * Figma `feedback_message` — primary string copy for the feedback row.
   * When omitted, `children` is used (backward compatible with web).
   */
  feedback_message?: string;
  /**
   * Optional icon node — replaces the variant-default icon. Pass a JDS or
   * RN-SVG component (e.g. `<Icon icon={JdsError} size="4" />`). Web
   * accepted a semantic icon name string; native has no semantic catalogue,
   * so callers supply the component directly.
   */
  customIcon?: ReactNode;
  /** Fallback / rich content when `feedback_message` is not set. */
  children?: ReactNode;
  /**
   * Native accessibility role.
   * Defaults: `'alert'` for `negative`, `'status'` otherwise.
   */
  role?: InputFeedbackRole;
  /** Additional native styles applied to the root `<View>`. */
  style?: ViewStyle;
  /** Describes the result of activating an interactive element (RN). */
  accessibilityHint?: string;
  /** React Native test identifier. */
  testID?: string;
  /** Accessible name override; falls back to `feedback_message` / `children`. */
  'aria-label'?: string;
  /** Hide from the accessibility tree (decorative feedback). */
  'aria-hidden'?: boolean;
  /** Id of the element this feedback describes (web parity). */
  'aria-describedby'?: string;
}

/** @deprecated Prefer `InputFeedbackProps`. */
export type InputFeedbackNativeProps = InputFeedbackProps;

// ---------------------------------------------------------------------------
// State resolver
// ---------------------------------------------------------------------------

export interface InputFeedbackState {
  resolvedVariant: InputFeedbackVariant;
  resolvedAttention: InputFeedbackAttention;
  /** Normalised t-shirt size driving every style table lookup. */
  resolvedSize: InputFeedbackSize;
  /** Whether the row has visible copy. `null` → renderer returns null. */
  hasMessage: boolean;
  /** Resolved message — string copy from `feedback_message` or `children`. */
  message: ReactNode;
  /** Effective `accessibilityRole`. */
  role: InputFeedbackRole;
  /** Effective `accessibilityLiveRegion`. */
  liveRegion: 'assertive' | 'polite' | 'none';
}

/**
 * Pure state resolver. Mirrors the inline logic of the web component:
 *   - empty message → `hasMessage: false` (renderer returns null)
 *   - negative → role 'alert' + assertive live region
 *   - others → role 'status' + polite live region
 *   - `role` prop overrides the default; live-region follows the chosen role
 */
export function useInputFeedbackState(props: InputFeedbackProps): InputFeedbackState {
  const {
    variant = 'negative',
    attention = 'low',
    size = 'm',
    feedback_message,
    children,
    role: roleOverride,
  } = props;

  const resolvedSize = resolveFeedbackSize(size);

  const message: ReactNode =
    feedback_message != null && feedback_message.trim() !== ''
      ? feedback_message.trim()
      : children;

  const hasMessage = hasRenderableMessage(message);

  const role: InputFeedbackRole =
    roleOverride ?? (variant === 'negative' ? 'alert' : 'status');

  const liveRegion: 'assertive' | 'polite' | 'none' =
    role === 'alert' ? 'assertive' : role === 'status' ? 'polite' : 'none';

  return {
    resolvedVariant: variant,
    resolvedAttention: attention,
    resolvedSize,
    hasMessage,
    message,
    role,
    liveRegion,
  };
}

function hasRenderableMessage(message: ReactNode): boolean {
  if (message == null) return false;
  if (typeof message === 'string' || typeof message === 'number') {
    return String(message).trim() !== '';
  }
  if (typeof message === 'boolean') return false;
  return true;
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export interface InputFeedbackAccessibilityProps {
  accessible: boolean;
  accessibilityRole?: 'alert' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityLiveRegion?: 'assertive' | 'polite' | 'none';
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  /** Web-aligned aria-describedby — surfaced for cross-platform tests. */
  'aria-describedby'?: string;
}

/**
 * Map props + resolved state to React Native accessibility props.
 *
 * `accessibilityRole`: RN supports `'alert'` natively; `'status'` is exposed
 * via the live region rather than a dedicated role, so we set `liveRegion`
 * and leave the role unspecified. `aria-hidden` collapses everything to a
 * hidden subtree.
 */
export function getInputFeedbackAccessibilityProps(
  props: InputFeedbackProps,
  state: Pick<InputFeedbackState, 'role' | 'liveRegion' | 'message'>,
): InputFeedbackAccessibilityProps {
  if (props['aria-hidden']) {
    return {
      accessible: false,
      accessibilityRole: 'none',
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    };
  }

  const label =
    props['aria-label'] ?? (typeof state.message === 'string' ? state.message : undefined);

  const out: InputFeedbackAccessibilityProps = {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: props.accessibilityHint,
    accessibilityLiveRegion: state.liveRegion,
  };

  if (state.role === 'alert') out.accessibilityRole = 'alert';
  if (props['aria-describedby']) out['aria-describedby'] = props['aria-describedby'];

  return out;
}
