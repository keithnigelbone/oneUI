/**
 * InputDynamicText interface (native)
 *
 * Semantic source: `packages/ui/src/components/Input/internals/InputDynamicText.tsx`
 *   + `packages/ui/src/components/Input/Input.shared.ts` (`InputDynamicTextProps`,
 *   `InputLabelSize`).
 * Cross-check: Layers `jdsinputdynamictext/generated/interface.ts`.
 *
 * Mirrors Figma `.DNA/DynamicText/S | M | L` (4257:45866, 4257:45674, 4257:45854):
 * an optional leading copy paragraph (Body / Text-Medium) and an optional
 * trailing `Button` (`attention="low"`, `condensed`). Native owns its own prop
 * contract — no import from `@oneui/ui` web shared modules.
 */
import type { ViewStyle } from 'react-native';

/** Figma-aligned row sizes (matches the field label stack header tier). */
export type InputDynamicTextSize = 's' | 'm' | 'l';

/** Subset of ARIA live-region values supported on the leading copy. */
export type InputDynamicTextAriaLive = 'off' | 'polite' | 'assertive';

export interface InputDynamicTextProps {
  /**
   * Leading copy (Body / Text-Medium). Rendered when non-empty after trim;
   * the helper row hides entirely if both `content` and `end` are empty.
   */
  content?: string;
  /**
   * Trailing action label — rendered with `<Button>` (`attention="low"`,
   * `condensed`, size follows `size`). Shown when non-empty after trim.
   */
  end?: string;
  /**
   * Figma row size: S, M, or L. Maps the leading copy to Body XS / S / M
   * and the trailing Button to the matching `s | m | l` size.
   * @default "m"
   */
  size?: InputDynamicTextSize;
  /**
   * Disables the trailing Button and dims the leading copy to Text-Low.
   * @default false
   */
  disabled?: boolean;
  /**
   * Live region for the leading copy (e.g. character count updates).
   * Maps to React Native `accessibilityLiveRegion`.
   */
  'aria-live'?: InputDynamicTextAriaLive;
  /** Handler for the trailing `Button` (no event arg — matches web `Button.onClick`). */
  onEndClick?: () => void;
  /** Optional override for the trailing control accessible name. */
  endAriaLabel?: string;
  /** Optional accessibility hint forwarded to the trailing `Button`. */
  accessibilityHint?: string;
  /** Additional native styles applied to the row container. */
  style?: ViewStyle;
  /** React Native test identifier (mirrors Layers RN `testID`). */
  testID?: string;
}

/** @deprecated Prefer `InputDynamicTextProps`. */
export type InputDynamicTextNativeProps = InputDynamicTextProps;

function isNonEmptyString(value: string | undefined): value is string {
  return value != null && value.trim() !== '';
}

/**
 * Resolves the row's render state from the raw props. Mirrors the web
 * component's empty-string trim + `null` early-return semantics.
 */
export function useInputDynamicTextState(props: InputDynamicTextProps): {
  size: InputDynamicTextSize;
  hasContent: boolean;
  hasEnd: boolean;
  /** When `true`, the row should still render but right-align the trailing slot. */
  trailingOnly: boolean;
  /** When `true`, the component renders nothing — both slots are empty. */
  isEmpty: boolean;
  /** Boolean disabled state with a stable default. */
  isDisabled: boolean;
} {
  const size: InputDynamicTextSize = props.size ?? 'm';
  const hasContent = isNonEmptyString(props.content);
  const hasEnd = isNonEmptyString(props.end);
  return {
    size,
    hasContent,
    hasEnd,
    trailingOnly: !hasContent && hasEnd,
    isEmpty: !hasContent && !hasEnd,
    isDisabled: !!props.disabled,
  };
}

const ARIA_TO_RN_LIVE: Record<InputDynamicTextAriaLive, 'none' | 'polite' | 'assertive'> = {
  off: 'none',
  polite: 'polite',
  assertive: 'assertive',
};

/**
 * Maps the supported `aria-live` web vocabulary onto the React Native
 * `accessibilityLiveRegion` enum.
 */
export function resolveAccessibilityLiveRegion(
  value: InputDynamicTextAriaLive | undefined,
): 'none' | 'polite' | 'assertive' | undefined {
  if (!value) return undefined;
  return ARIA_TO_RN_LIVE[value];
}

/**
 * Accessibility props for the leading copy `<Text>` node. The leading copy
 * acts as a description for the input, so it's surfaced as `role="text"` with
 * an optional live region; the trailing Button owns its own a11y contract.
 */
export function getInputDynamicTextAccessibilityProps(
  props: Pick<InputDynamicTextProps, 'aria-live'>,
): {
  accessible: true;
  accessibilityRole: 'text';
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
} {
  const liveRegion = resolveAccessibilityLiveRegion(props['aria-live']);
  return {
    accessible: true,
    accessibilityRole: 'text',
    ...(liveRegion ? { accessibilityLiveRegion: liveRegion } : {}),
  };
}
