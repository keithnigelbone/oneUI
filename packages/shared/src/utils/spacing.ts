/**
 * spacing.ts
 *
 * Spacing utilities for generating responsive spacing scales.
 *
 * This module provides two modes:
 * 1. **Dimension-based** (recommended): Uses the unified f-scale from dimension.ts
 * 2. **Legacy multiplier-based**: Uses fixed multipliers (for backwards compatibility)
 *
 * The dimension-based approach derives spacing from the DIN 1450 formula,
 * ensuring typography and spacing are harmonically related.
 */

import {
  SPACING_TOKENS as DIMENSION_SPACING_TOKENS,
  SPACING_TO_FSTEP,
  RESPONSIVE_SPACING_TOKENS,
  generateSpacingFromDimension,
  getSpacingValue as getDimensionSpacingValue,
  generateClampFormula,
  isResponsiveSpacingToken,
  generateExtendedSpacingTokens,
  getDynamicSpacingToFStep,
  type SpacingStep as DimensionSpacingStep,
  type FScaleStep,
  type SpacingFStep,
  type DynamicSpacingTokenName,
} from './dimension';
import {
  DensityMode,
  DENSITY_CONFIGS,
  DEFAULT_VIEWPORT_CONFIG,
  getDensityLabel as getPlatformDensityLabel,
  getDensityModes as getPlatformDensityModes,
} from './platform-config';
import { NEGATIVE_SPACING_SIZES } from '../data/spacing-aliases';

// Re-export types and constants from dimension module
export {
  SPACING_TO_FSTEP,
  RESPONSIVE_SPACING_TOKENS,
  isResponsiveSpacingToken,
  generateExtendedSpacingTokens,
  getDynamicSpacingToFStep,
};
export type { FScaleStep, DynamicSpacingTokenName };

/**
 * Canonical numeric spacing token names.
 */
export const SPACING_TOKENS = DIMENSION_SPACING_TOKENS;

export type SpacingTokenName = (typeof SPACING_TOKENS)[number];

// Re-export DensityMode
export type { DensityMode };

/**
 * Legacy: Spacing scale multipliers relative to base (Spacing-4 = 1)
 * @deprecated Use dimension-based calculations instead
 */
const LEGACY_SCALE_MULTIPLIERS: Record<SpacingTokenName, number> = {
  '0': 0,
  '0-5': 0.125,
  '1': 0.25,
  '1-5': 0.375,
  '2': 0.5,
  '2-5': 0.625,
  '3': 0.75,
  '3-5': 0.875,
  '4': 1,
  '4-5': 1.125,
  '5': 1.25,
  '5-5': 1.375,
  '6': 1.5,
  '7': 1.75,
  '8': 2,
  '9': 2.25,
  '10': 2.5,
  '12': 3,
  '14': 3.5,
  '16': 4,
  '18': 4.5,
  '20': 5,
  '24': 6,
  '28': 7,
  '32': 8,
  '40': 10,
};

/**
 * Legacy: Density mode adjustments as multipliers
 * @deprecated Use DENSITY_CONFIGS from platform-config instead
 */
const LEGACY_DENSITY_ADJUSTMENTS: Record<DensityMode, number> = {
  compact: 0.875, // 87.5% of default
  default: 1.0,
  open: 1.125, // 112.5% of default
};

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  baseValue: number; // Spacing-4 value in px (default 16)
  density: DensityMode;
  viewportMin: number; // 360px
  viewportMax: number; // 1920px
  useDimensionScale?: boolean; // Use f-scale (default: true)
  fluidScaling?: boolean; // Use CSS clamp() for responsive tokens (default: true)
}

/**
 * Spacing step with optional responsive values
 */
export interface SpacingStep {
  token: SpacingTokenName | DynamicSpacingTokenName;
  value: number;
  fStep?: SpacingFStep;
  responsive?: {
    min: number;
    max: number;
    clamp?: string;
  };
}

/**
 * Default configuration
 */
export const DEFAULT_SPACING_CONFIG: SpacingConfig = {
  baseValue: 16,
  density: 'default',
  viewportMin: DEFAULT_VIEWPORT_CONFIG.min,
  viewportMax: DEFAULT_VIEWPORT_CONFIG.max,
  useDimensionScale: true,
};

/**
 * Generate spacing scale for a given density mode
 *
 * By default, uses the dimension scale for values.
 * Set useDimensionScale: false for legacy multiplier-based values.
 */
export function generateSpacingScale(
  baseValue: number,
  density: DensityMode = 'default',
  useDimensionScale: boolean = true
): Map<SpacingTokenName, number> {
  const scale = new Map<SpacingTokenName, number>();

  if (useDimensionScale) {
    // Use dimension-based calculation
    const config = DENSITY_CONFIGS[density];
    for (const token of SPACING_TOKENS) {
      // Use mobile values for the map (responsive is handled separately)
      const value = getDimensionSpacingValue(token, density, 'mobile');
      scale.set(token, value);
    }
  } else {
    // Legacy: Use multiplier-based calculation
    const densityMultiplier = LEGACY_DENSITY_ADJUSTMENTS[density];
    const adjustedBase = baseValue * densityMultiplier;

    for (const token of SPACING_TOKENS) {
      const multiplier = LEGACY_SCALE_MULTIPLIERS[token];
      const value = Math.round(adjustedBase * multiplier);
      scale.set(token, value);
    }
  }

  return scale;
}

/**
 * Generate spacing scale with responsive values for larger tokens
 *
 * Uses the dimension scale to calculate proper mobile/desktop values
 * with clamp() formulas for responsive interpolation.
 */
export function generateResponsiveSpacingScale(config: SpacingConfig): SpacingStep[] {
  const { density, viewportMin, viewportMax, useDimensionScale = true, fluidScaling = true } = config;

  if (useDimensionScale) {
    // Use dimension-based responsive calculation
    const dimensionSteps = generateSpacingFromDimension(density, { min: viewportMin, max: viewportMax }, fluidScaling);

    return dimensionSteps.map((step): SpacingStep => ({
      token: step.token,
      value: step.value,
      fStep: step.fStep,
      responsive: step.responsive
        ? {
            min: step.responsive.min,
            max: step.responsive.max,
            clamp: step.responsive.clamp,
          }
        : undefined,
    }));
  }

  // Legacy: Use multiplier-based calculation
  const { baseValue } = config;
  const densityMultiplier = LEGACY_DENSITY_ADJUSTMENTS[density];
  const adjustedBase = baseValue * densityMultiplier;
  const steps: SpacingStep[] = [];

  for (const token of SPACING_TOKENS) {
    const multiplier = LEGACY_SCALE_MULTIPLIERS[token];
    const value = Math.round(adjustedBase * multiplier);
    const isResponsive = RESPONSIVE_SPACING_TOKENS.includes(token);

    if (isResponsive) {
      // Legacy: Calculate responsive range (scale up to 1.4x at max viewport)
      const scaleFactor = 1 + (1920 - viewportMin) / (1920 * 2);
      const maxValue = Math.round(value * scaleFactor);

      steps.push({
        token,
        value,
        responsive: {
          min: value,
          max: maxValue,
          clamp: generateClampFormula(value, maxValue, { min: viewportMin, max: viewportMax }),
        },
      });
    } else {
      steps.push({ token, value });
    }
  }

  return steps;
}

/**
 * Get spacing value for a token
 *
 * @param token - Spacing token name
 * @param baseValue - Base value in px (only used in legacy mode)
 * @param density - Density mode
 * @param platform - Platform type for dimension-based values
 * @param useDimensionScale - Use dimension scale (default: true)
 */
export function getSpacingValue(
  token: SpacingTokenName,
  baseValue: number = 16,
  density: DensityMode = 'default',
  platform: 'mobile' | 'desktop' = 'mobile',
  useDimensionScale: boolean = true
): number {
  if (useDimensionScale) {
    return getDimensionSpacingValue(token, density, platform);
  }

  // Legacy calculation
  const densityMultiplier = LEGACY_DENSITY_ADJUSTMENTS[density];
  const multiplier = LEGACY_SCALE_MULTIPLIERS[token];
  return Math.round(baseValue * densityMultiplier * multiplier);
}

/**
 * Convert spacing value to CSS custom property reference
 */
export function spacingToTokenCss(token: SpacingTokenName): string {
  return `var(--Spacing-${token})`;
}

/**
 * Generate CSS custom properties for spacing scale
 *
 * When useDimensionScale is true (default), generates aliases to dimension tokens.
 * When false, generates direct values using legacy multipliers.
 */
export function generateSpacingCss(config: SpacingConfig): string {
  const { useDimensionScale = true } = config;

  if (useDimensionScale) {
    // Generate aliases to dimension tokens
    const lines: string[] = ['/* Spacing Aliases (map to Dimension f-steps) */'];

    for (const token of SPACING_TOKENS) {
      const fStep = SPACING_TO_FSTEP[token];
      if (fStep === 'f2-5') {
        lines.push(`--Spacing-${token}: var(--Dimension-f2-5);`);
        continue;
      }
      lines.push(`--Spacing-${token}: var(--Dimension-${fStep});`);
    }
    for (const token of NEGATIVE_SPACING_SIZES) {
      lines.push(`--Spacing-Negative-${token}: calc(var(--Spacing-${token}) * -1);`);
    }

    return lines.join('\n');
  }

  // Legacy: Generate direct values
  const steps = generateResponsiveSpacingScale(config);
  const lines: string[] = ['/* Spacing Scale (legacy multiplier-based) */'];

  for (const step of steps) {
    if (step.responsive?.clamp) {
      lines.push(`--Spacing-${step.token}: ${step.responsive.clamp};`);
    } else {
      lines.push(`--Spacing-${step.token}: ${step.value}px;`);
    }
  }
  for (const token of NEGATIVE_SPACING_SIZES) {
    const step = steps.find((candidate) => candidate.token === token);
    if (!step) continue;
    if (step.responsive?.clamp) {
      lines.push(`--Spacing-Negative-${token}: calc(${step.responsive.clamp} * -1);`);
    } else {
      lines.push(`--Spacing-Negative-${token}: ${step.value === 0 ? 0 : -step.value}px;`);
    }
  }

  return lines.join('\n');
}

/**
 * Check if a value meets touch target requirements
 */
export function meetsTouchTarget(value: number, platform: 'mobile' | 'desktop' = 'mobile'): boolean {
  const minTarget = platform === 'mobile' ? 44 : 24;
  return value >= minTarget;
}

/**
 * Get the minimum spacing token that meets touch target
 */
export function getMinTouchTargetToken(
  baseValue: number = 16,
  density: DensityMode = 'default',
  platform: 'mobile' | 'desktop' = 'mobile'
): SpacingTokenName | null {
  const minTarget = platform === 'mobile' ? 44 : 24;

  for (const token of SPACING_TOKENS) {
    const value = getSpacingValue(token, baseValue, density, platform);
    if (value >= minTarget) {
      return token;
    }
  }

  return null;
}

/**
 * Validate spacing configuration
 */
export function validateSpacingConfig(config: Partial<SpacingConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.baseValue !== undefined) {
    if (config.baseValue < 8 || config.baseValue > 32) {
      errors.push('Base value must be between 8 and 32 pixels');
    }
  }

  if (config.viewportMin !== undefined && config.viewportMax !== undefined) {
    if (config.viewportMin >= config.viewportMax) {
      errors.push('Viewport min must be less than viewport max');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get density mode label
 */
export function getDensityLabel(density: DensityMode): string {
  return getPlatformDensityLabel(density);
}

/**
 * Get all density modes
 */
export function getDensityModes(): DensityMode[] {
  return getPlatformDensityModes();
}

/**
 * Get f-step for a spacing token
 */
export function getSpacingFStep(token: SpacingTokenName): SpacingFStep {
  return SPACING_TO_FSTEP[token];
}

/**
 * Compare spacing values between legacy and dimension-based approaches
 * Useful for migration validation
 */
export function compareSpacingApproaches(
  density: DensityMode = 'default',
  baseValue: number = 16
): Array<{
  token: SpacingTokenName;
  legacy: number;
  dimension: number;
  difference: number;
  percentDiff: number;
}> {
  const results: Array<{
    token: SpacingTokenName;
    legacy: number;
    dimension: number;
    difference: number;
    percentDiff: number;
  }> = [];

  for (const token of SPACING_TOKENS) {
    const legacy = getSpacingValue(token, baseValue, density, 'mobile', false);
    const dimension = getSpacingValue(token, baseValue, density, 'mobile', true);
    const difference = dimension - legacy;
    const percentDiff = legacy === 0 ? 0 : Math.round((difference / legacy) * 100);

    results.push({
      token,
      legacy,
      dimension,
      difference,
      percentDiff,
    });
  }

  return results;
}
