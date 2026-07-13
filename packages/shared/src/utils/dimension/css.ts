/**
 * dimension/css.ts
 *
 * CSS custom-property generators for the dimension + spacing scale plus the
 * `validateDimensionValue` helper. Extracted from `dimension.ts` so callers
 * that just need the scale calculation (Convex, AI agents, image-pipeline
 * tooling) don't pull the CSS-string emitters along for the ride.
 *
 * The parent `dimension.ts` re-exports everything here for backward compat.
 */

import {
  DensityMode,
  ViewportConfig,
  DENSITY_CONFIGS,
  DEFAULT_VIEWPORT_CONFIG,
} from '../platform-config';
import {
  F_SCALE_STEPS,
  SPACING_TOKENS,
  SPACING_TO_FSTEP,
  type FScaleStep,
  type SpacingTokenName,
  isResponsiveStep,
  calculateDimensionAtStep,
  generateClampFormula,
  generateFullDimensionScale,
} from './scale';
import { NEGATIVE_SPACING_SIZES } from '../../data/spacing-aliases';

/**
 * Generate CSS custom property for a dimension step
 */
export function generateDimensionCssProperty(
  step: FScaleStep,
  density: DensityMode = 'default',
  viewport: ViewportConfig = DEFAULT_VIEWPORT_CONFIG,
  fluidScaling: boolean = true,
): string {
  const config = DENSITY_CONFIGS[density];
  const mobileValue = calculateDimensionAtStep(
    config.mobile.baseSize,
    config.mobile.scaleFactor,
    step,
  );
  const desktopValue = calculateDimensionAtStep(
    config.desktop.baseSize,
    config.desktop.scaleFactor,
    step,
  );
  const isResponsive = isResponsiveStep(step);

  const varName = `--Dimension-${step}`;

  if (fluidScaling && isResponsive && mobileValue !== desktopValue) {
    const clamp = generateClampFormula(mobileValue, desktopValue, viewport);
    return `${varName}: ${clamp};`;
  }

  return `${varName}: ${mobileValue}px;`;
}

/**
 * Generate CSS custom property for a spacing token
 */
export function generateSpacingCssProperty(token: SpacingTokenName): string {
  const fStep = SPACING_TO_FSTEP[token];
  if (fStep === 'f2-5') {
    return `--Spacing-${token}: var(--Dimension-f2-5);`;
  }
  return `--Spacing-${token}: var(--Dimension-${fStep});`;
}

export function generateNegativeSpacingCssProperty(token: string): string {
  return `--Spacing-Negative-${token}: calc(var(--Spacing-${token}) * -1);`;
}

/**
 * Generate all dimension CSS custom properties
 */
export function generateDimensionCss(
  density: DensityMode = 'default',
  viewport: ViewportConfig = DEFAULT_VIEWPORT_CONFIG,
): string {
  const lines: string[] = [
    '/* Dimension Scale (f-steps) - Generated from DIN 1450 */',
    `/* Density: ${density} */`,
    `/* Mobile: base=${DENSITY_CONFIGS[density].mobile.baseSize}px, scale=${DENSITY_CONFIGS[density].mobile.scaleFactor} */`,
    `/* Desktop: base=${DENSITY_CONFIGS[density].desktop.baseSize}px, scale=${DENSITY_CONFIGS[density].desktop.scaleFactor} */`,
    '',
  ];

  for (const step of F_SCALE_STEPS) {
    lines.push(generateDimensionCssProperty(step, density, viewport));
  }

  return lines.join('\n');
}

/**
 * Generate all spacing CSS custom properties (as aliases to dimension)
 */
export function generateSpacingCss(): string {
  const lines: string[] = ['/* Spacing Aliases (map to dimension f-steps) */', ''];

  for (const token of SPACING_TOKENS) {
    lines.push(generateSpacingCssProperty(token));
  }
  for (const token of NEGATIVE_SPACING_SIZES) {
    lines.push(generateNegativeSpacingCssProperty(token));
  }

  return lines.join('\n');
}

/**
 * Validate that a value conforms to the dimension scale
 */
export function validateDimensionValue(
  value: number,
  density: DensityMode = 'default',
  tolerance: number = 2,
): { valid: boolean; nearestStep: FScaleStep | null; expectedValue: number | null } {
  const scale = generateFullDimensionScale(density);

  for (const step of scale) {
    if (Math.abs(value - step.mobileValue) <= tolerance) {
      return { valid: true, nearestStep: step.step, expectedValue: step.mobileValue };
    }
    if (Math.abs(value - step.desktopValue) <= tolerance) {
      return { valid: true, nearestStep: step.step, expectedValue: step.desktopValue };
    }
  }

  // Find nearest step for suggestion
  let nearestStep: FScaleStep | null = null;
  let minDiff = Infinity;
  let expectedValue: number | null = null;

  for (const step of scale) {
    const mobileDiff = Math.abs(value - step.mobileValue);
    const desktopDiff = Math.abs(value - step.desktopValue);
    const minStepDiff = Math.min(mobileDiff, desktopDiff);

    if (minStepDiff < minDiff) {
      minDiff = minStepDiff;
      nearestStep = step.step;
      expectedValue = mobileDiff < desktopDiff ? step.mobileValue : step.desktopValue;
    }
  }

  return { valid: false, nearestStep, expectedValue };
}
