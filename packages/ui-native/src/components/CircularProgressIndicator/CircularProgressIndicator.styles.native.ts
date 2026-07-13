/**
 * CircularProgressIndicator.styles.native.ts
 *
 * RN peer of `CircularProgressIndicator.module.css`. Geometry only — every
 * value resolves from `@oneui/tokens` (`tokens.spacing.*`). Brand paint is
 * applied inline in `CircularProgressIndicator.native.tsx` via
 * `useSurfaceTokens`.
 *
 * Per-size diameter mirrors the web `data-size` block:
 *   2XS→Spacing-2 … 5XL→Spacing-16, identical to Spinner.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { CircularProgressIndicatorSize } from './interface';

/** Diameter (px) per size — matches web's `width: var(--Spacing-N)`. */
export const CPI_SIZE_PX: Record<CircularProgressIndicatorSize, number> = {
  '2XS': tokens.spacing['2'],
  XS: tokens.spacing['3'],
  S: tokens.spacing['4'],
  M: tokens.spacing['5'],
  L: tokens.spacing['6'],
  XL: tokens.spacing['8'],
  '2XL': tokens.spacing['10'],
  '3XL': tokens.spacing['12'],
  '4XL': tokens.spacing['14'],
  '5XL': tokens.spacing['16'],
};

export const styles = StyleSheet.create({
  /** Outer wrapper — shrink-to-fit so the SVG box has a stable square footprint. */
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Absolute-positioned center content layer (label / icon). */
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Label text default alignment (paint + typography applied inline). */
  labelText: {
    textAlign: 'center',
  },
});

export const SIZE_STYLE: Record<CircularProgressIndicatorSize, { width: number; height: number }> = {
  '2XS': { width: CPI_SIZE_PX['2XS'], height: CPI_SIZE_PX['2XS'] },
  XS: { width: CPI_SIZE_PX.XS, height: CPI_SIZE_PX.XS },
  S: { width: CPI_SIZE_PX.S, height: CPI_SIZE_PX.S },
  M: { width: CPI_SIZE_PX.M, height: CPI_SIZE_PX.M },
  L: { width: CPI_SIZE_PX.L, height: CPI_SIZE_PX.L },
  XL: { width: CPI_SIZE_PX.XL, height: CPI_SIZE_PX.XL },
  '2XL': { width: CPI_SIZE_PX['2XL'], height: CPI_SIZE_PX['2XL'] },
  '3XL': { width: CPI_SIZE_PX['3XL'], height: CPI_SIZE_PX['3XL'] },
  '4XL': { width: CPI_SIZE_PX['4XL'], height: CPI_SIZE_PX['4XL'] },
  '5XL': { width: CPI_SIZE_PX['5XL'], height: CPI_SIZE_PX['5XL'] },
};

/**
 * Label typography tier per size — mirrors web's
 * `.root[data-size="L"] .label { font-size: var(--Label-3XS-FontSize); }` etc.
 * Resolved at runtime via `useTypographyTokens('label', SIZE_TO_LABEL[size])`.
 * Sizes below L don't render text — entries are still present for type
 * completeness but the component skips rendering text at those sizes.
 */
export const SIZE_TO_LABEL: Record<CircularProgressIndicatorSize, '3XS' | '2XS' | 'XS' | 'S' | 'M'> = {
  '2XS': '3XS',
  XS: '3XS',
  S: '3XS',
  M: '3XS',
  L: '3XS',
  XL: '2XS',
  '2XL': 'XS',
  '3XL': 'S',
  '4XL': 'S',
  '5XL': 'M',
};

/**
 * Indeterminate animation timings — peers of the web CSS variables:
 *   `--CircularProgressIndicator-rotateDuration` (6000ms)
 *   `--CircularProgressIndicator-trimDuration` (1500ms)
 *
 * Web has THREE independent animation tracks (head, tail, rotate). Native
 * mirrors them with two independent `Animated.Value`s (head + tail) plus a
 * rotation Value — each segment runs as a chained `Animated.sequence` so
 * the Transition easing applies per-segment, exactly like CSS keyframe
 * easing applies between adjacent stops.
 *
 * Head (2 → 100 → 102 over 1500ms, Transition easing per segment):
 *   - 0%      → 76.667%: 2 → 100      (1150ms)
 *   - 76.667% → 100%:    100 → 102    (350ms)   ← modular seam (102 ≡ 2 mod 100)
 *
 * Tail (0 → 0 → 100 over 1500ms, Transition easing on segment 2):
 *   - 0%      → 43.333%: held at 0    (650ms)
 *   - 43.333% → 100%:    0 → 100      (850ms)
 *
 * Cycle duration = 1500ms. After each iteration the value snaps back to
 * the start (head→2, tail→0) and the sequence restarts — same as CSS
 * `animation-iteration-count: infinite`.
 */
export const CPI_INDETERMINATE_ROTATE_MS = 6000;
export const CPI_INDETERMINATE_TRIM_MS = 1500;

interface HeadSegments {
  start: number;
  segment1: { to: number; durationMs: number };
  segment2: { to: number; durationMs: number };
}
interface TailSegments {
  start: number;
  segment1: { holdMs: number };
  segment2: { to: number; durationMs: number };
}

/** Web `--cpi-indeterminate-head` keyframes mapped to per-segment durations. */
export const CPI_HEAD_SEGMENTS: HeadSegments = {
  start: 2,
  segment1: { to: 100, durationMs: 1150 },
  segment2: { to: 102, durationMs: 350 },
};

/** Web `--cpi-indeterminate-tail` keyframes mapped to per-segment durations. */
export const CPI_TAIL_SEGMENTS: TailSegments = {
  start: 0,
  segment1: { holdMs: 650 },
  segment2: { to: 100, durationMs: 850 },
};

/**
 * Entry / exit duration — peer of web `--Motion-Duration-XL` (450 ms). Read at
 * runtime from `useMotion().duration.expressive.xl` when available so brand
 * overrides apply; this number is only the fallback when motion config is
 * absent (e.g. tests that render without `<OneUINativeThemeProvider>`).
 */
export const CPI_ENTRY_EXIT_FALLBACK_MS = 450;

/** Scale targets for entry / exit — mirrors `cpi-enter { scale: 0.93 → 1 }`. */
export const CPI_ENTRY_SCALE_FROM = 0.93;
export const CPI_ENTRY_SCALE_TO = 1;
