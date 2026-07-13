/**
 * dimension/scale.ts
 *
 * Shared constants, types, and pure calculation functions for the f-scale.
 * Extracted to break the circular dependency between `dimension.ts` (which
 * re-exports CSS generators for backward-compat) and `dimension/css.ts`
 * (which needs these utilities to generate CSS properties).
 *
 * Both `../dimension.ts` and `./css.ts` import from here.
 */

import {
  DensityMode,
  ViewportConfig,
  DENSITY_CONFIGS,
  DEFAULT_VIEWPORT_CONFIG,
} from '../platform-config';

// ── F-Scale steps ────────────────────────────────────────────────────────────

/**
 * F-Scale step names (f-8 to f16 = 25 steps).
 * f0 is the base; positive steps are larger, negative steps are smaller.
 */
export const F_SCALE_STEPS = [
  'f-8',
  'f-7',
  'f-6',
  'f-5',
  'f-4',
  'f-3',
  'f-2',
  'f-1',
  'f0',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'f10',
  'f11',
  'f12',
  'f13',
  'f14',
  'f15',
  'f16',
] as const;

export type FScaleStep = (typeof F_SCALE_STEPS)[number];

// ── Spacing token names ───────────────────────────────────────────────────────

/** Canonical numeric spacing token names. */
export const SPACING_TOKENS = [
  '0',
  '0-5',
  '1',
  '1-5',
  '2',
  '2-5',
  '3',
  '3-5',
  '4',
  '4-5',
  '5',
  '5-5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
  '24',
  '28',
  '32',
  '40',
] as const;

export type SpacingTokenName = (typeof SPACING_TOKENS)[number];
export type SpacingFStep = FScaleStep | 'f2-5';

/** Mapping from numeric spacing tokens to f-scale steps. */
export const SPACING_TO_FSTEP: Record<SpacingTokenName, SpacingFStep> = {
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

/** Reverse mapping from f-steps to Spacing tokens. */
export const FSTEP_TO_SPACING: Partial<Record<SpacingFStep, SpacingTokenName>> = {
  'f-8': '0',
  'f-7': '0-5',
  'f-6': '1',
  'f-5': '1-5',
  'f-4': '2',
  'f-3': '2-5',
  'f-2': '3',
  'f-1': '3-5',
  f0: '4',
  f1: '4-5',
  f2: '5',
  'f2-5': '5-5',
  f3: '6',
  f4: '7',
  f5: '8',
  f6: '9',
  f7: '10',
  f8: '12',
  f9: '14',
  f10: '16',
  f11: '18',
  f12: '20',
  f13: '24',
  f14: '28',
  f15: '32',
  f16: '40',
};

/** Responsive f-steps (f-1 and above — values interpolate between mobile/desktop). */
export const RESPONSIVE_F_STEPS: FScaleStep[] = [
  'f-1',
  'f0',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'f10',
  'f11',
  'f12',
  'f13',
  'f14',
  'f15',
  'f16',
];

// ── Pure calculation helpers ──────────────────────────────────────────────────

/**
 * Get the numeric step value from an f-step name.
 * f0 = 0, f1 = 1, f-1 = -1, etc.
 */
export function getStepNumber(step: FScaleStep): number {
  const index = F_SCALE_STEPS.indexOf(step);
  return index - 8; // f0 is at index 8
}

/** Get the f-step name from a numeric step value. */
export function getStepName(stepNumber: number): FScaleStep | null {
  const index = stepNumber + 8;
  if (index < 0 || index >= F_SCALE_STEPS.length) return null;
  return F_SCALE_STEPS[index];
}

/** Check if an f-step is responsive (should use clamp()). */
export function isResponsiveStep(step: FScaleStep): boolean {
  return RESPONSIVE_F_STEPS.includes(step);
}

/**
 * Calculate dimension value at a specific f-step.
 *
 * Uses the exponential formula: `baseSize * scaleFactor^step`.
 */
export function calculateDimensionAtStep(
  baseSize: number,
  scaleFactor: number,
  step: FScaleStep,
): number {
  const stepNumber = getStepNumber(step);
  if (stepNumber === -8) return 0;
  const value = baseSize * Math.pow(scaleFactor, stepNumber);
  return Math.max(1, Math.round(value));
}

/**
 * Generate complete dimension scale for a given base and scale factor.
 */
export function generateDimensionScale(
  baseSize: number,
  scaleFactor: number,
): Map<FScaleStep, number> {
  const scale = new Map<FScaleStep, number>();
  for (const step of F_SCALE_STEPS) {
    scale.set(step, calculateDimensionAtStep(baseSize, scaleFactor, step));
  }
  return scale;
}

/** Dimension scale step with both mobile and desktop values. */
export interface DimensionScaleStep {
  step: FScaleStep;
  stepNumber: number;
  mobileValue: number;
  desktopValue: number;
  isResponsive: boolean;
  spacingToken: SpacingTokenName | null;
}

/**
 * Generate full dimension scale with mobile and desktop values.
 */
export function generateFullDimensionScale(
  density: DensityMode = 'default',
): DimensionScaleStep[] {
  const config = DENSITY_CONFIGS[density];
  const mobileScale = generateDimensionScale(config.mobile.baseSize, config.mobile.scaleFactor);
  const desktopScale = generateDimensionScale(config.desktop.baseSize, config.desktop.scaleFactor);

  return F_SCALE_STEPS.map((step) => ({
    step,
    stepNumber: getStepNumber(step),
    mobileValue: mobileScale.get(step)!,
    desktopValue: desktopScale.get(step)!,
    isResponsive: isResponsiveStep(step),
    spacingToken: FSTEP_TO_SPACING[step] ?? null,
  }));
}

/**
 * Generate CSS clamp() formula for responsive dimension.
 *
 * Creates a linear interpolation between mobile and desktop values
 * based on viewport width.
 */
export function generateClampFormula(
  mobileValue: number,
  desktopValue: number,
  viewport: ViewportConfig = DEFAULT_VIEWPORT_CONFIG,
): string {
  const { min: viewportMin, max: viewportMax } = viewport;
  const slope = (desktopValue - mobileValue) / (viewportMax - viewportMin);
  const intercept = mobileValue - slope * viewportMin;
  const slopeVw = (slope * 100).toFixed(4);
  const interceptPx = intercept.toFixed(2);
  return `clamp(${mobileValue}px, calc(${interceptPx}px + ${slopeVw}vw), ${desktopValue}px)`;
}
