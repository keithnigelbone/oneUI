/**
 * buildNativeDimensions.ts — pure resolver for spacing + shape tokens (RN).
 */

import {
  getDimensionValue,
  getGridValue,
  type FStep,
  type BreakpointId,
  type DensityId,
} from '../data/dimension-scales';

// ============================================================================
// Output types
// ============================================================================

export type NativeSpacingKey =
  | '0' | '0-5' | '1' | '1-5' | '2' | '2-5'
  | '3' | '3-5' | '4' | '4-5' | '5' | '5-5'
  | '6' | '7' | '8' | '9' | '10' | '12'
  | '14' | '16' | '18' | '20' | '24' | '28'
  | '32' | '40' | 'Margin' | 'Gutter';

/** Canonical numeric shape scale — mirrors `--Shape-*` in `primitives.css`. */
export type NativeShapeScaleKey =
  | '0' | '0-5' | '1' | '1-5' | '2' | '2-5'
  | '3' | '3-5' | '4' | '4-5' | '5' | '5-5'
  | '6' | '7' | '8' | '9' | '10';

/**
 * @deprecated T-shirt shape keys. Read-side compatibility only — new code must
 * use the numeric keys. `M` is f0 (16px); note this is NOT the same as the
 * lowercase `m` on `tokens.shape` in `@oneui/tokens`, which is 8px.
 * Removed once `pnpm check:shape-tokens` reports an empty allowlist.
 */
export type LegacyNativeShapeKey =
  | 'None'
  | '6XS' | '5XS' | '4XS' | '3XS' | '2XS'
  | 'XS' | 'S' | 'M' | 'L' | 'XL'
  | '2XL' | '3XL' | '4XL' | '5XL' | '6XL';

export type NativeShapeKey = NativeShapeScaleKey | 'Pill' | LegacyNativeShapeKey;

export type NativeSpacing = Record<NativeSpacingKey, number>;
export type NativeShape = Record<NativeShapeKey, number>;

export interface NativeDimensions {
  spacing: NativeSpacing;
  shape: NativeShape;
}

// ============================================================================
// F-step mapping tables (mirror primitives.css)
// ============================================================================

const NUMERIC_SPACING_FSTEPS: Record<
  Exclude<NativeSpacingKey,
    | '5-5'
    | 'Margin' | 'Gutter'
  >,
  FStep
> = {
  '0': 'f-8',
  '0-5': 'f-7',
  '1': 'f-6',
  '1-5': 'f-5',
  '2': 'f-4',
  '2-5': 'f-3',
  '3': 'f-2',
  '3-5': 'f-1',
  '4': 'f0',
  '4-5': 'f1',
  '5': 'f2',
  '6': 'f3',
  '7': 'f4',
  '8': 'f5',
  '9': 'f6',
  '10': 'f7',
  '12': 'f8',
  '14': 'f9',
  '16': 'f10',
  '18': 'f11',
  '20': 'f12',
  '24': 'f13',
  '28': 'f14',
  '32': 'f15',
  '40': 'f16',
};

const SHAPE_FSTEPS: Record<NativeShapeScaleKey, FStep> = {
  '0': 'f-8',
  '0-5': 'f-7',
  '1': 'f-6',
  '1-5': 'f-5',
  '2': 'f-4',
  '2-5': 'f-3',
  '3': 'f-2',
  '3-5': 'f-1',
  '4': 'f0',
  '4-5': 'f1',
  '5': 'f2',
  '5-5': 'f2-5',
  '6': 'f3',
  '7': 'f4',
  '8': 'f5',
  '9': 'f6',
  '10': 'f7',
};

/**
 * @deprecated Legacy t-shirt key → canonical numeric key. Name-preserving:
 * `M` and `'4'` both resolve f0. Delete with `LegacyNativeShapeKey`.
 */
const LEGACY_SHAPE_KEY_ALIASES: Record<LegacyNativeShapeKey, NativeShapeScaleKey> = {
  None: '0',
  '6XS': '0-5',
  '5XS': '1',
  '4XS': '1-5',
  '3XS': '2',
  '2XS': '2-5',
  XS: '3',
  S: '3-5',
  M: '4',
  L: '4-5',
  XL: '5',
  '2XL': '6',
  '3XL': '7',
  '4XL': '8',
  '5XL': '9',
  '6XL': '10',
};

// ============================================================================
// Builder
// ============================================================================

interface BuildOpts {
  /** S/M/L breakpoint. */
  platform?: BreakpointId;
  density?: DensityId;
}

/** Resolve spacing + shape tokens to numeric pixel values for the given context. */
export function buildNativeDimensions({
  platform = 'S',
  density = 'default',
}: BuildOpts = {}): NativeDimensions {
  const spacing = {} as NativeSpacing;
  for (const key in NUMERIC_SPACING_FSTEPS) {
    const k = key as keyof typeof NUMERIC_SPACING_FSTEPS;
    spacing[k] = getDimensionValue(platform, density, NUMERIC_SPACING_FSTEPS[k]);
  }
  spacing['5-5'] = (spacing['5'] + spacing['6']) / 2;
  spacing.Margin = getGridValue(platform, density, 'margin');
  spacing.Gutter = getGridValue(platform, density, 'gutter');

  const shape = { Pill: 9999 } as NativeShape;
  for (const key in SHAPE_FSTEPS) {
    const k = key as NativeShapeScaleKey;
    shape[k] = getDimensionValue(platform, density, SHAPE_FSTEPS[k]);
  }

  // Deprecated t-shirt keys mirror their numeric counterpart. Delete alongside
  // `LegacyNativeShapeKey` once `pnpm check:shape-tokens` allowlist is empty.
  for (const key in LEGACY_SHAPE_KEY_ALIASES) {
    const k = key as LegacyNativeShapeKey;
    shape[k] = shape[LEGACY_SHAPE_KEY_ALIASES[k]];
  }

  return { spacing, shape };
}
