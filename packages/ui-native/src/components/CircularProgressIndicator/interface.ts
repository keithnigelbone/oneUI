/**
 * CircularProgressIndicator interface (native)
 *
 * Native-owned prop contract + state resolver + accessibility helper. Mirrors
 * the web public API in
 * `packages/ui/src/components/CircularProgressIndicator/CircularProgressIndicator.shared.ts`
 * without importing anything from `@oneui/ui`. Layers cross-check is
 * `jdscircularprogressindicator-4` (React V4) + `jdscircularprogressindicator`
 * (React Native).
 *
 * Layers ↔ OneUI mapping:
 *   | Layers prop | OneUI native equivalent |
 *   | ----------- | ----------------------- |
 *   | `type`      | not surfaced — Layers splits `cpi` vs `spinner`; OneUI uses `variant` |
 *   | `variant`   | `variant: 'determinate' | 'indeterminate'` |
 *   | `size`      | `size: '2XS'..'5XL'` (10-step scale) |
 *   | `appearance`| `appearance: CircularProgressIndicatorAppearance` (alias for `ComponentAppearance` minus tertiary/quaternary) |
 *   | `min`/`max` | identical |
 *   | `value`     | identical |
 *   | `content` (typed element) | `content: 'none' | 'icon' | 'text'` + optional `children` for icon mode |
 *   | `ariaLabel`/`ariaDescribedby`/`ariaLive` | `aria-label` / `aria-describedby` / `aria-live` (dashed, matches web) |
 *   | `testID`    | `testID` |
 */

import type { ReactNode, RefObject } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';

/** T-shirt size presets mapping to spacing dimension tokens. */
export type CircularProgressIndicatorSize =
  | '2XS'
  | 'XS'
  | 'S'
  | 'M'
  | 'L'
  | 'XL'
  | '2XL'
  | '3XL'
  | '4XL'
  | '5XL';

/**
 * CircularProgressIndicator appearance — alias for the canonical 10-entry
 * union (`'auto'` + 9 roles). Tertiary / quaternary are intentionally
 * excluded by the shared type; CPI matches it 1:1.
 */
export type CircularProgressIndicatorAppearance = ComponentAppearance;

/** Determinate or indeterminate variant. */
export type CircularProgressIndicatorVariant = 'determinate' | 'indeterminate';

/** Center content mode. */
export type CircularProgressIndicatorContent = 'none' | 'icon' | 'text';

/** Figma only renders percentage labels at L and above (node 13056:2639). */
export const CPI_LABEL_VISIBLE_SIZES = [
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  '5XL',
] as const satisfies readonly CircularProgressIndicatorSize[];

export type CpiLabelVisibleSize = (typeof CPI_LABEL_VISIBLE_SIZES)[number];

export function isCpiLabelVisible(
  size: CircularProgressIndicatorSize,
): size is CpiLabelVisibleSize {
  return (CPI_LABEL_VISIBLE_SIZES as readonly string[]).includes(size);
}

/** Auto percentage label — Figma renders only at L and above (matches web). */
export function isCpiTextContentVisible(
  content: CircularProgressIndicatorContent,
  size: CircularProgressIndicatorSize,
): boolean {
  return content === 'text' && isCpiLabelVisible(size);
}

/** Icons render at every size when `content="icon"` and `children` is set (web parity). */
export function isCpiIconContentVisible(
  content: CircularProgressIndicatorContent,
  children: ReactNode | undefined,
): boolean {
  return content === 'icon' && children != null;
}

function warnCpiIconWithoutChildren(content: CircularProgressIndicatorContent): void {
  if (content !== 'icon' || process.env.NODE_ENV === 'production') return;
  // eslint-disable-next-line no-console
  console.warn(
    '[CircularProgressIndicator] content="icon" requires `children` (centre icon node).',
  );
}

function warnCpiTextBelowMinimumSize(
  content: CircularProgressIndicatorContent,
  size: CircularProgressIndicatorSize,
): void {
  if (content !== 'text' || isCpiLabelVisible(size) || process.env.NODE_ENV === 'production') {
    return;
  }
  // eslint-disable-next-line no-console
  console.warn(
    `[CircularProgressIndicator] content="text" (auto percentage) only renders at size L and above (Figma). size="${size}" shows the ring only — use size="L" | "XL" | … or content="icon".`,
  );
}

function warnDeterminateWithoutValue(
  variant: CircularProgressIndicatorVariant,
  value: number | undefined,
): void {
  if (variant !== 'determinate' || value != null || process.env.NODE_ENV === 'production') {
    return;
  }
  // eslint-disable-next-line no-console
  console.warn(
    '[CircularProgressIndicator] variant="determinate" requires `value`. Rendering as indeterminate (busy) — pass `value` or use variant="indeterminate".',
  );
}

export interface CircularProgressIndicatorProps {
  /** Determinate shows arc proportional to `value`; indeterminate spins. Default: `'determinate'`. */
  variant?: CircularProgressIndicatorVariant;
  /** Size preset — maps to spacing dimension tokens. Default: `'M'`. */
  size?: CircularProgressIndicatorSize;
  /** Multi-accent appearance role. `'auto'` resolves to `'primary'`. Default: `'auto'`. */
  appearance?: CircularProgressIndicatorAppearance;
  /** Center content: `text` = auto percentage (L+ only); `icon` = `children` (all sizes). Default: `none`. */
  content?: CircularProgressIndicatorContent;
  /**
   * Progress value (required when `variant="determinate"`). When omitted on a
   * determinate instance, the component coerces to indeterminate (web parity).
   */
  value?: number;
  /** Minimum value. Default: 0. */
  min?: number;
  /** Maximum value. Default: 100. */
  max?: number;
  /** Children rendered as icon when content='icon'. */
  children?: ReactNode;
  /** Accessible label for screen readers. */
  'aria-label'?: string;
  /** ID of element that labels this progress indicator (forwarded as accessibilityLabelledBy). */
  'aria-labelledby'?: string;
  /** ID of element that describes this progress indicator. */
  'aria-describedby'?: string;
  /** Politeness for assistive tech announcements (mirrors web `aria-live`). */
  'aria-live'?: 'off' | 'polite' | 'assertive';
  /** Hide from the accessibility tree. */
  'aria-hidden'?: boolean;
  /** Inline native styles for the outermost wrapper. */
  style?: ViewStyle;
  /** Enable entry + exit animations. Default: false (opt-in). Pair with `show` for controlled visibility. */
  animate?: boolean;
  /** Controlled visibility. When `animate` is true, toggling `show` triggers entry or exit. Default: true. */
  show?: boolean;
  /**
   * Override the determinate value-transition duration, in milliseconds.
   * Native peer of web's `--CircularProgressIndicator-valueTransitionDuration`
   * CSS custom property. Set to `0` to make each value update land instantly
   * (continuous tracking pattern — cumulative motion reads as linear). Omit
   * for the default eased transition (~3XL motion-duration).
   */
  valueTransitionDuration?: number;
  /** Describes the result of performing an action. */
  accessibilityHint?: string;
  /** React Native test identifier. */
  testID?: string;
}

/**
 * SVG stroke width (in viewBox units) per size. Identical numbers to the web
 * `SVG_STROKE_MAP` — viewBox is 100x100, ratios derived from Figma pixel
 * strokes / component pixel dimensions.
 */
export const CPI_SVG_STROKE_MAP: Record<CircularProgressIndicatorSize, number> = {
  '2XS': 25,
  XS: 16.67,
  S: 18.75,
  M: 15,
  L: 16.67,
  XL: 12.5,
  '2XL': 15,
  '3XL': 12.5,
  '4XL': 14.29,
  '5XL': 12.5,
};

export const CPI_VIEWBOX = 100;
export const CPI_CENTER = CPI_VIEWBOX / 2;

/** Sizes (>= L) that show the auto percentage label when `content="text"`. */
export const CPI_CONTENT_LABEL_SIZE_RANK: Record<CircularProgressIndicatorSize, number> = {
  '2XS': 0,
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  '2XL': 6,
  '3XL': 7,
  '4XL': 8,
  '5XL': 9,
};

export interface CircularProgressIndicatorState {
  /** Normalized value between 0 and 1. */
  normalizedValue: number;
  /** Percentage value (0-100) for text display. */
  percentage: number;
  /** Whether the indicator is in indeterminate mode. */
  isIndeterminate: boolean;
  /** SVG circle center coordinate. */
  center: number;
  /** SVG circle radius (accounts for stroke width). */
  radius: number;
  /** SVG stroke width in viewBox units. */
  strokeWidth: number;
  /** Circle circumference for dash calculations. */
  circumference: number;
  /** Stroke dash offset for determinate progress arc. */
  dashOffset: number;
  /** Resolved appearance role (never 'auto'). */
  resolvedAppearance: Exclude<CircularProgressIndicatorAppearance, 'auto'>;
  /** Resolved variant after coercing missing value to indeterminate. */
  resolvedVariant: CircularProgressIndicatorVariant;
  /** Resolved size. */
  resolvedSize: CircularProgressIndicatorSize;
  /** Resolved content mode. */
  resolvedContent: CircularProgressIndicatorContent;
  /** Data attributes mirroring web `data-*` selectors (kept for parity tooling). */
  dataAttrs: Record<string, string | undefined>;
}

/**
 * Resolve runtime decisions for a `<CircularProgressIndicator>`. Mirrors
 * web `useCircularProgressState` exactly — same clamping, same SVG geometry,
 * same `'auto' → 'primary'` fallback.
 */
export function useCircularProgressIndicatorState(
  props: CircularProgressIndicatorProps,
): CircularProgressIndicatorState {
  const {
    variant = 'determinate',
    size = 'M',
    appearance = 'auto',
    content = 'none',
    value,
    min = 0,
    max = 100,
  } = props;

  const isIndeterminate = variant === 'indeterminate' || value == null;
  const resolvedVariant: CircularProgressIndicatorVariant = isIndeterminate
    ? 'indeterminate'
    : 'determinate';

  const clampedValue = Math.min(max, Math.max(min, value ?? min));
  const range = max - min;
  const normalizedValue = range > 0 ? (clampedValue - min) / range : 0;
  const percentage = Math.round(normalizedValue * 100);

  const strokeWidth = CPI_SVG_STROKE_MAP[size];
  const radius = (CPI_VIEWBOX - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = isIndeterminate ? 0 : circumference * (1 - normalizedValue);

  const resolvedAppearance: Exclude<CircularProgressIndicatorAppearance, 'auto'> =
    appearance === 'auto' || !appearance ? 'primary' : appearance;

  if (content === 'icon' && props.children == null) {
    warnCpiIconWithoutChildren(content);
  }
  if (content === 'text') {
    warnCpiTextBelowMinimumSize(content, size);
  }
  warnDeterminateWithoutValue(variant, value);

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-variant': resolvedVariant,
    'data-appearance': resolvedAppearance,
    'data-content': content,
  };

  return {
    normalizedValue,
    percentage,
    isIndeterminate,
    center: CPI_CENTER,
    radius,
    strokeWidth,
    circumference,
    dashOffset,
    resolvedAppearance,
    resolvedVariant,
    resolvedSize: size,
    resolvedContent: content,
    dataAttrs,
  };
}

/**
 * Map CircularProgressIndicator props + state to React Native accessibility
 * props. Uses `accessibilityRole='progressbar'`, `accessibilityValue`
 * (analog of `aria-valuemin/max/now`), and `accessibilityState.busy` for
 * indeterminate mode (matches Spinner / Progress conventions).
 */
export function getCircularProgressIndicatorAccessibilityProps(
  props: Pick<
    CircularProgressIndicatorProps,
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-live'
    | 'aria-hidden'
    | 'accessibilityHint'
    | 'min'
    | 'max'
  >,
  state: Pick<
    CircularProgressIndicatorState,
    'isIndeterminate' | 'percentage'
  >,
): {
  accessible: boolean;
  accessibilityRole: 'progressbar';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: { busy: boolean };
  accessibilityValue?: { min: number; max: number; now: number };
  accessibilityLabelledBy?: string;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
} {
  const ariaHidden = props['aria-hidden'] === true;
  const labelledBy = props['aria-labelledby'] ?? props['aria-describedby'];
  const min = props.min ?? 0;
  const max = props.max ?? 100;

  // Map aria-live 'off' to RN 'none'; pass through 'polite' / 'assertive'.
  const liveRaw = props['aria-live'];
  const accessibilityLiveRegion: 'none' | 'polite' | 'assertive' | undefined =
    liveRaw === 'off' ? 'none' : liveRaw;

  return {
    accessible: !ariaHidden,
    accessibilityRole: 'progressbar',
    accessibilityLabel: props['aria-label'],
    accessibilityHint: props.accessibilityHint,
    accessibilityState: { busy: state.isIndeterminate },
    ...(state.isIndeterminate
      ? {}
      : { accessibilityValue: { min, max, now: state.percentage } }),
    ...(labelledBy ? { accessibilityLabelledBy: labelledBy } : {}),
    ...(accessibilityLiveRegion ? { accessibilityLiveRegion } : {}),
    accessibilityElementsHidden: ariaHidden,
    importantForAccessibility: ariaHidden ? 'no-hide-descendants' : undefined,
  };
}

/** @internal — kept for parity with web's `useRef<SVGCircleElement>`. */
export type CircularIndicatorRef = RefObject<unknown>;
