/**
 * LinearProgressIndicator.shared.ts
 * Shared types and state hook for LinearProgressIndicator (web + native parity).
 */

import type { CSSProperties } from 'react';

export type LinearProgressIndicatorType = 'determinate' | 'indeterminate';

export type LinearProgressIndicatorSize = 'S' | 'M' | 'L';

export type LinearProgressIndicatorAppearance =
  | 'auto'
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'sparkle'
  | 'negative'
  | 'positive'
  | 'warning'
  | 'informative';

export interface LinearProgressIndicatorProps {
  /** Determinate shows fill proportional to `value`; indeterminate animates the bar. Default: `determinate`. */
  type?: LinearProgressIndicatorType;
  /** Track height preset. Default: `M`. */
  size?: LinearProgressIndicatorSize;
  /** Multi-accent appearance role. Default: `primary`. */
  appearance?: LinearProgressIndicatorAppearance;
  /** Pill ends when true; square ends when false. Default: `true`. */
  roundCaps?: boolean;
  /** Current progress (0–100). Determinate only; ignored when `type="indeterminate"`. Default: `0`. */
  value?: number;
  /** Accessible label for screen readers. */
  'aria-label'?: string;
  /** ID of element that labels this progress indicator. */
  'aria-labelledby'?: string;
  /** Additional class name on the root progress element. */
  className?: string;
  /** Inline styles on the visual root wrapper. */
  style?: CSSProperties;
  /** Optional test hook — forwarded to the visual root wrapper. */
  'data-testid'?: string;
}

export interface LinearProgressState {
  clampedValue: number;
  isIndeterminate: boolean;
  progressValue: number | null;
  resolvedAppearance: Exclude<LinearProgressIndicatorAppearance, 'auto'>;
  dataAttrs: Record<string, string | undefined>;
}

export function clampProgressValue(value: number | undefined, min = 0, max = 100): number {
  const raw = value ?? min;
  return Math.min(max, Math.max(min, raw));
}

export function useLinearProgressState(
  props: LinearProgressIndicatorProps,
): LinearProgressState {
  const {
    type = 'determinate',
    size = 'M',
    appearance = 'primary',
    roundCaps = true,
    value = 0,
  } = props;

  const isIndeterminate = type === 'indeterminate';
  const clampedValue = isIndeterminate ? 0 : clampProgressValue(value);
  const progressValue = isIndeterminate ? null : clampedValue;
  const resolvedAppearance =
    appearance === 'auto' || !appearance ? 'primary' : appearance;

  return {
    clampedValue,
    isIndeterminate,
    progressValue,
    resolvedAppearance,
    dataAttrs: {
      'data-oneui-component': 'LinearProgressIndicator',
      'data-size': size,
      'data-type': type,
      'data-round-caps': roundCaps ? 'true' : 'false',
      'data-appearance': resolvedAppearance,
    },
  };
}
