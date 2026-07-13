/**
 * dimension.ts
 *
 * Core dimension scale system based on DIN 1450 standard.
 * This module generates the f-scale (f-8 to f16) that serves as the
 * single source of truth for ALL dimension tokens including:
 * - Typography sizes
 * - Spacing values
 * - Component dimensions
 *
 * Shared constants, types and pure calculation helpers live in `./dimension/scale`
 * to avoid a circular dependency with `./dimension/css` (which needs those helpers
 * to generate CSS properties, and was previously imported back here for re-export).
 */

import {
  DensityMode,
  ViewportConfig,
  DENSITY_CONFIGS,
  DEFAULT_VIEWPORT_CONFIG,
} from './platform-config';

import type { DensityScaleConfig, PlatformParams } from './platform-config';

// Import shared scale items for internal use. They are also re-exported at the
// bottom of the file so all existing `import ... from './dimension'` callers
// keep working without changes.
import {
  F_SCALE_STEPS,
  type FScaleStep,
  SPACING_TOKENS,
  type SpacingTokenName,
  type SpacingFStep,
  SPACING_TO_FSTEP,
  FSTEP_TO_SPACING,
  RESPONSIVE_F_STEPS,
  getStepNumber,
  getStepName,
  isResponsiveStep,
  calculateDimensionAtStep,
  generateDimensionScale,
  type DimensionScaleStep,
  generateFullDimensionScale,
  generateClampFormula,
} from './dimension/scale';

// Re-export everything so existing callers keep working.
export {
  F_SCALE_STEPS,
  type FScaleStep,
  SPACING_TOKENS,
  type SpacingTokenName,
  type SpacingFStep,
  SPACING_TO_FSTEP,
  FSTEP_TO_SPACING,
  RESPONSIVE_F_STEPS,
  getStepNumber,
  getStepName,
  isResponsiveStep,
  calculateDimensionAtStep,
  generateDimensionScale,
  type DimensionScaleStep,
  generateFullDimensionScale,
  generateClampFormula,
} from './dimension/scale';

// ── dimension.ts-only exports ─────────────────────────────────────────────────

/**
 * Dynamic spacing token type retained for API stability; spacing tokens are numeric-only.
 */
export type DynamicSpacingTokenName = SpacingTokenName;

/**
 * Responsive spacing tokens (XS and above)
 */
export const RESPONSIVE_SPACING_TOKENS: SpacingTokenName[] = [
  '3', '3-5', '4', '4-5', '5', '5-5', '6', '7', '8', '9',
];

/**
 * Generate spacing token names.
 */
export function generateExtendedSpacingTokens(
  _extraStepsDown: number = 0,
  _extraStepsUp: number = 0,
): DynamicSpacingTokenName[] {
  return [...SPACING_TOKENS];
}

/**
 * Get the f-step for a dynamic spacing token.
 */
export function getDynamicSpacingToFStep(token: DynamicSpacingTokenName): SpacingFStep {
  return SPACING_TO_FSTEP[token];
}

/**
 * Check if a spacing token is responsive.
 */
export function isResponsiveSpacingToken(token: SpacingTokenName): boolean {
  return RESPONSIVE_SPACING_TOKENS.includes(token);
}

/**
 * DIN 1450 base size calculation.
 *
 * @param viewingDistance - Distance between eye and screen in cm
 * @param ppi - Pixels per inch of the display
 * @param pixelDensity - Device pixel ratio (@1x, @2x, @3x)
 * @param xHeight - x-height ratio of the typeface (0.53 for JioType)
 */
export function calculateDIN1450BaseSize(
  viewingDistance: number,
  ppi: number,
  pixelDensity: number,
  xHeight: number = 0.53,
): number {
  const visualAngleRadians = (0.3 * Math.PI) / 180;
  const characterHeightCm = viewingDistance * Math.tan(visualAngleRadians);
  const physicalPixels = (characterHeightCm / 2.54) * ppi;
  const cssPixels = physicalPixels / pixelDensity;
  return Math.round(cssPixels / xHeight);
}

/**
 * Calculate base size from platform parameters.
 */
export function calculateBaseSizeFromParams(params: PlatformParams): number {
  return calculateDIN1450BaseSize(
    params.viewingDistance,
    params.ppi,
    params.pixelDensity,
    params.xHeight,
  );
}

/**
 * Spacing step with optional responsive values.
 */
export interface SpacingStep {
  token: SpacingTokenName | DynamicSpacingTokenName;
  fStep: SpacingFStep;
  value: number;
  responsive?: {
    min: number;
    max: number;
    clamp: string;
  };
}

function getScaleValueForSpacing(scale: Map<FScaleStep, number>, fStep: SpacingFStep): number {
  if (fStep === 'f2-5') {
    return (scale.get('f2')! + scale.get('f3')!) / 2;
  }
  return scale.get(fStep)!;
}

/**
 * Generate spacing scale from dimension scale.
 */
export function generateSpacingFromDimension(
  density: DensityMode = 'default',
  viewport: ViewportConfig = DEFAULT_VIEWPORT_CONFIG,
  fluidScaling: boolean = true,
): SpacingStep[] {
  const config = DENSITY_CONFIGS[density];
  const mobileScale = generateDimensionScale(config.mobile.baseSize, config.mobile.scaleFactor);
  const desktopScale = generateDimensionScale(config.desktop.baseSize, config.desktop.scaleFactor);

  const steps: SpacingStep[] = [];

  for (const token of SPACING_TOKENS) {
    const fStep = SPACING_TO_FSTEP[token];
    const mobileValue = getScaleValueForSpacing(mobileScale, fStep);
    const desktopValue = getScaleValueForSpacing(desktopScale, fStep);
    const isResponsive = isResponsiveSpacingToken(token);

    if (fluidScaling && isResponsive && mobileValue !== desktopValue) {
      steps.push({
        token,
        fStep,
        value: mobileValue,
        responsive: {
          min: mobileValue,
          max: desktopValue,
          clamp: generateClampFormula(mobileValue, desktopValue, viewport),
        },
      });
    } else {
      steps.push({ token, fStep, value: mobileValue });
    }
  }

  return steps;
}

/**
 * Generate spacing scale from a custom base size.
 */
export function generateSpacingFromCustomBase(
  baseSize: number,
  density: DensityMode = 'default',
  viewport: ViewportConfig = DEFAULT_VIEWPORT_CONFIG,
  extraStepsDown: number = 0,
  extraStepsUp: number = 0,
  fluidScaling: boolean = true,
): SpacingStep[] {
  const config = DENSITY_CONFIGS[density];
  const scale = generateDimensionScale(baseSize, config.mobile.scaleFactor);
  const desktopBase = Math.round(baseSize * (config.desktop.baseSize / config.mobile.baseSize));
  const desktopScale = generateDimensionScale(desktopBase, config.desktop.scaleFactor);
  const allTokens = generateExtendedSpacingTokens(extraStepsDown, extraStepsUp);

  const steps: SpacingStep[] = [];

  for (const token of allTokens) {
    const fStep = getDynamicSpacingToFStep(token);
    const fStepNumber = fStep === 'f2-5' ? 2.5 : getStepNumber(fStep);

    let value: number;
    let desktopValue: number;

    if (fStep === 'f2-5' || scale.has(fStep)) {
      value = getScaleValueForSpacing(scale, fStep);
      desktopValue = getScaleValueForSpacing(desktopScale, fStep);
    } else {
      value = Math.max(0, Math.round(baseSize * Math.pow(config.mobile.scaleFactor, fStepNumber)));
      desktopValue = Math.max(
        0,
        Math.round(desktopBase * Math.pow(config.desktop.scaleFactor, fStepNumber)),
      );
    }

    const isResponsive = fStepNumber >= -1;

    if (fluidScaling && isResponsive && value !== desktopValue) {
      steps.push({
        token,
        fStep,
        value,
        responsive: {
          min: value,
          max: desktopValue,
          clamp: generateClampFormula(value, desktopValue, viewport),
        },
      });
    } else {
      steps.push({ token, fStep, value });
    }
  }

  return steps;
}

/**
 * Get spacing value for a token at a specific density.
 */
export function getSpacingValue(
  token: SpacingTokenName,
  density: DensityMode = 'default',
  platform: 'mobile' | 'desktop' = 'mobile',
): number {
  const config = DENSITY_CONFIGS[density];
  const { baseSize, scaleFactor } = config[platform];
  const fStep = SPACING_TO_FSTEP[token];
  if (fStep === 'f2-5') {
    return (
      calculateDimensionAtStep(baseSize, scaleFactor, 'f2') +
      calculateDimensionAtStep(baseSize, scaleFactor, 'f3')
    ) / 2;
  }
  return calculateDimensionAtStep(baseSize, scaleFactor, fStep);
}

// ============================================================================
// CSS generators (in ./dimension/css.ts)
// Re-exported here so existing callers keep working unchanged. New code
// should import from `@oneui/shared/utils/dimension/css` directly.
// ============================================================================
export {
  generateDimensionCssProperty,
  generateSpacingCssProperty,
  generateDimensionCss,
  generateSpacingCss,
  validateDimensionValue,
} from './dimension/css';
