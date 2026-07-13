/**
 * typography.ts
 *
 * Typography utilities for the design system.
 *
 * ARCHITECTURE NOTE: DIN 1450 base calculation and platform viewing parameters
 * belong to the DIMENSION module (`dimension.ts`), not typography. The dimension
 * scale (f0 = base size) drives ALL tokens — spacing, shapes, AND typography.
 * Typography just picks which f-steps to reference.
 *
 * This module contains:
 * - V2 relational typography system (role→f-step mapping, CSS generation)
 * - Legacy V1 functions (deprecated — kept for backward compat)
 *
 * V1 functions delegating to dimension.ts are marked @deprecated.
 * New code should use V2 functions or import from dimension.ts directly.
 */

import {
  DensityMode,
  PlatformParams,
  ExtendedPlatformType,
  DENSITY_CONFIGS,
  EXTENDED_PLATFORM_PARAMS,
} from './platform-config';
import {
  calculateDIN1450BaseSize,
  generateDimensionScale,
  calculateBaseSizeFromParams as dimensionCalculateBaseSizeFromParams,
  FScaleStep,
} from './dimension';

// Re-export platform types for convenience
export type { DensityMode, ExtendedPlatformType };

/**
 * Platform viewing parameters (DIN 1450 based)
 * @deprecated Use PlatformParams from platform-config instead
 */
export interface PlatformPreset {
  name: string;
  viewingDistance: number; // cm
  ppi: number; // pixels per inch
  pixelDensity: number; // device pixel ratio (1x, 2x, 3x)
}

/**
 * Predefined platform presets based on typical usage scenarios
 * Based on DIN 1450 standard for optimal legibility
 *
 * @deprecated Use EXTENDED_PLATFORM_PARAMS from platform-config instead
 */
export const PLATFORM_PRESETS: Record<string, PlatformPreset> = {
  // Digital screens
  mobile: {
    name: 'Mobile',
    viewingDistance: 30, // ~12 inches (arm's length)
    ppi: 458, // iPhone 15 Pro
    pixelDensity: 3,
  },
  tablet: {
    name: 'Tablet',
    viewingDistance: 40, // ~16 inches
    ppi: 264, // iPad Pro
    pixelDensity: 2,
  },
  desktop: {
    name: 'Desktop',
    viewingDistance: 60, // ~24 inches
    ppi: 96, // Standard desktop
    pixelDensity: 1,
  },
  tv: {
    name: 'TV',
    viewingDistance: 300, // ~10 feet (living room)
    ppi: 50, // 4K at 65"
    pixelDensity: 2,
  },
  // Print & Outdoor
  outdoor: {
    name: 'Outdoor Signage',
    viewingDistance: 500, // ~16 feet
    ppi: 72, // Print standard
    pixelDensity: 1,
  },
  printA4: {
    name: 'Print A4',
    viewingDistance: 40, // ~16 inches
    ppi: 300, // High resolution print
    pixelDensity: 1,
  },
  printBusinessCard: {
    name: 'Business Card',
    viewingDistance: 30, // Close reading
    ppi: 300, // High resolution print
    pixelDensity: 1,
  },
};

/**
 * Typography style definition
 */
export interface TypographyStyle {
  name: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number; // percentage (100, 120, 150)
  letterSpacing: number; // percentage
  opticalSize?: number;
  fStep?: FScaleStep; // Corresponding f-scale step
}

/**
 * Type scale configuration
 */
export interface TypeScaleConfig {
  baseSize: number;
  scaleFactor: number; // 1.10 (compact), 1.125 (default), 1.15 (open)
  density?: DensityMode;
}

/**
 * Scale factor presets
 * @deprecated Use DENSITY_CONFIGS from platform-config for platform-specific scale factors
 */
export const SCALE_FACTOR_PRESETS = {
  compact: 1.1,
  default: 1.125,
  open: 1.15,
} as const;

/**
 * Get scale factor for a density mode (mobile values)
 */
export function getScaleFactorForDensity(
  density: DensityMode,
  platform: 'mobile' | 'desktop' = 'mobile'
): number {
  const config = DENSITY_CONFIGS[density];
  return config[platform].scaleFactor;
}

/**
 * Font weight semantic mappings
 */
export const WEIGHT_MAPPING = {
  low: 400, // Body text, descriptions
  medium: 500, // Labels, interactive elements
  high: 700, // Emphasis, titles
  black: 900, // Display, headlines
} as const;

export type SemanticWeight = keyof typeof WEIGHT_MAPPING;

/**
 * Type style positions relative to base (0)
 * @deprecated V1 type scale — use DEFAULT_FSTEP_ASSIGNMENTS from typography-roles.ts instead.
 * V2 uses exact f-step assignments, not fractional positions.
 */
const STYLE_POSITIONS = {
  'Display-L': 6, // f6
  'Display-M': 5, // f5
  'Display-S': 4, // f4
  'Headline-L': 3, // f3
  'Headline-M': 2, // f2
  'Title-L': 1.5, // between f1 and f2
  'Title-M': 1, // f1
  'Title-S': 0.5, // between f0 and f1
  'Label-L': 1, // f1
  'Label-M': 0, // f0 (Base)
  'Label-S': -1, // f-1
  'Body-L': 1, // f1
  'Body-M': 0, // f0 (Base)
  'Body-S': -1, // f-1
} as const;

/**
 * Default weight and line-height for each style category
 */
const STYLE_DEFAULTS: Record<string, { weight: number; lineHeight: number }> = {
  'Display-L': { weight: 900, lineHeight: 100 },
  'Display-M': { weight: 900, lineHeight: 100 },
  'Display-S': { weight: 900, lineHeight: 100 },
  'Headline-L': { weight: 900, lineHeight: 100 },
  'Headline-M': { weight: 700, lineHeight: 110 },
  'Title-L': { weight: 700, lineHeight: 120 },
  'Title-M': { weight: 700, lineHeight: 120 },
  'Title-S': { weight: 700, lineHeight: 120 },
  'Label-L': { weight: 500, lineHeight: 130 },
  'Label-M': { weight: 500, lineHeight: 130 },
  'Label-S': { weight: 500, lineHeight: 130 },
  'Body-L': { weight: 400, lineHeight: 150 },
  'Body-M': { weight: 400, lineHeight: 150 },
  'Body-S': { weight: 400, lineHeight: 150 },
};

/**
 * Map style position to f-scale step
 */
function positionToFStep(position: number): FScaleStep | undefined {
  const rounded = Math.round(position);
  if (rounded >= -8 && rounded <= 12) {
    return `f${rounded}` as FScaleStep;
  }
  return undefined;
}

/**
 * Calculate base font size using DIN 1450 formula
 * @deprecated Use calculateDIN1450BaseSize from dimension.ts — base size is a dimension concern, not typography.
 */
export function calculateBaseSize(
  viewingDistance: number,
  ppi: number,
  pixelDensity: number,
  xHeight: number = 0.53
): number {
  return calculateDIN1450BaseSize(viewingDistance, ppi, pixelDensity, xHeight);
}

/**
 * Calculate base size from a platform preset
 * @deprecated Base size calculation belongs in dimension.ts — use dimension's calculateBaseSizeFromParams.
 */
export function calculateBaseSizeFromPreset(presetName: string): number {
  // First try the new extended platform params
  const extendedPreset = EXTENDED_PLATFORM_PARAMS[presetName as ExtendedPlatformType];
  if (extendedPreset) {
    return calculateBaseSize(
      extendedPreset.viewingDistance,
      extendedPreset.ppi,
      extendedPreset.pixelDensity,
      extendedPreset.xHeight
    );
  }

  // Fall back to legacy presets
  const preset = PLATFORM_PRESETS[presetName];
  if (!preset) {
    throw new Error(`Unknown platform preset: ${presetName}`);
  }

  return calculateBaseSize(preset.viewingDistance, preset.ppi, preset.pixelDensity);
}

/**
 * Calculate base size from platform params
 * @deprecated Use calculateBaseSizeFromParams from dimension.ts instead
 */
export const calculateBaseSizeFromParams = dimensionCalculateBaseSizeFromParams;

/**
 * Get base size for a density mode
 * @deprecated Use DENSITY_CONFIGS from platform-config — base size is a dimension concern.
 */
export function getBaseSizeForDensity(
  density: DensityMode,
  platform: 'mobile' | 'desktop' = 'mobile'
): number {
  const config = DENSITY_CONFIGS[density];
  return config[platform].baseSize;
}

/**
 * Generate a modular type scale
 * @deprecated V1 — in V2, typography sizes are var(--Dimension-fN) aliases. Use DEFAULT_FSTEP_ASSIGNMENTS instead.
 */
export function generateTypeScale(baseSize: number, scaleFactor: number): Map<string, number> {
  const scale = new Map<string, number>();

  for (const [name, position] of Object.entries(STYLE_POSITIONS)) {
    const size = baseSize * Math.pow(scaleFactor, position);
    scale.set(name, Math.round(size));
  }

  return scale;
}

/**
 * Generate type scale using dimension scale
 * @deprecated V1 — in V2, typography sizes are var(--Dimension-fN) aliases.
 */
export function generateTypeScaleFromDimension(
  density: DensityMode = 'default',
  platform: 'mobile' | 'desktop' = 'mobile'
): Map<string, number> {
  const config = DENSITY_CONFIGS[density];
  const { baseSize, scaleFactor } = config[platform];
  const dimensionScale = generateDimensionScale(baseSize, scaleFactor);
  const scale = new Map<string, number>();

  for (const [name, position] of Object.entries(STYLE_POSITIONS)) {
    // For exact integer positions, use the dimension scale
    const rounded = Math.round(position);
    if (position === rounded && rounded >= -8 && rounded <= 12) {
      const fStep = `f${rounded}` as FScaleStep;
      const value = dimensionScale.get(fStep);
      if (value !== undefined) {
        scale.set(name, value);
        continue;
      }
    }

    // For non-integer positions, interpolate
    const size = baseSize * Math.pow(scaleFactor, position);
    scale.set(name, Math.round(size));
  }

  return scale;
}

/**
 * Generate complete typography styles
 * @deprecated V1 — in V2, typography sizes are var(--Dimension-fN) aliases. Use getAllTypographyEntries() instead.
 */
export function generateTypographyStyles(baseSize: number, scaleFactor: number): TypographyStyle[] {
  const sizeScale = generateTypeScale(baseSize, scaleFactor);
  const styles: TypographyStyle[] = [];

  for (const [name, fontSize] of sizeScale.entries()) {
    const defaults = STYLE_DEFAULTS[name] || { weight: 400, lineHeight: 150 };
    const position = STYLE_POSITIONS[name as keyof typeof STYLE_POSITIONS];

    styles.push({
      name,
      fontSize,
      fontWeight: defaults.weight,
      lineHeight: defaults.lineHeight,
      letterSpacing: 0, // Default, can be customized
      opticalSize: fontSize > 24 ? 20 : undefined, // Optical sizing for larger text
      fStep: positionToFStep(position),
    });
  }

  return styles;
}

/**
 * Generate typography styles for a density mode
 * @deprecated V1 — in V2, typography adapts to density automatically via dimension f-steps.
 */
export function generateTypographyStylesForDensity(
  density: DensityMode = 'default',
  platform: 'mobile' | 'desktop' = 'mobile'
): TypographyStyle[] {
  const config = DENSITY_CONFIGS[density];
  const { baseSize, scaleFactor } = config[platform];
  return generateTypographyStyles(baseSize, scaleFactor);
}

/**
 * Get semantic weight value
 */
export function getWeightValue(semantic: SemanticWeight): number {
  return WEIGHT_MAPPING[semantic];
}

/**
 * Get the nearest semantic weight for a numeric value
 */
export function getNearestSemanticWeight(numericWeight: number): SemanticWeight {
  const weights = Object.entries(WEIGHT_MAPPING) as [SemanticWeight, number][];
  let nearest: SemanticWeight = 'low';
  let minDiff = Math.abs(numericWeight - WEIGHT_MAPPING.low);

  for (const [semantic, value] of weights) {
    const diff = Math.abs(numericWeight - value);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = semantic;
    }
  }

  return nearest;
}

/**
 * Format typography style to CSS
 */
export function styleToCss(style: TypographyStyle): string {
  const lines = [
    `font-size: ${style.fontSize}px;`,
    `font-weight: ${style.fontWeight};`,
    `line-height: ${style.lineHeight}%;`,
    `letter-spacing: ${style.letterSpacing}%;`,
  ];

  if (style.opticalSize) {
    lines.push(`font-optical-sizing: auto;`);
  }

  return lines.join('\n');
}

/**
 * Format typography style to CSS token references
 */
export function styleToTokenCss(styleName: string): string {
  const tokenName = styleName.replace('-', '');
  return `
font-size: var(--Typography-Size-${tokenName});
font-weight: var(--Typography-Weight-${tokenName});
line-height: var(--Typography-LineHeight-${tokenName});
letter-spacing: var(--Typography-LetterSpacing-${tokenName});
`.trim();
}

/**
 * Validate scale factor
 */
export function isValidScaleFactor(factor: number): boolean {
  return factor >= 1.05 && factor <= 1.5;
}

/**
 * Calculate the font size at a specific scale position
 */
export function getSizeAtPosition(baseSize: number, scaleFactor: number, position: number): number {
  return Math.round(baseSize * Math.pow(scaleFactor, position));
}

/**
 * Get all style names
 */
export function getStyleNames(): string[] {
  return Object.keys(STYLE_POSITIONS);
}

/**
 * Get style category (Display, Headline, Title, Label, Body)
 */
export function getStyleCategory(
  styleName: string
): 'Display' | 'Headline' | 'Title' | 'Label' | 'Body' {
  const category = styleName.split('-')[0];
  return category as 'Display' | 'Headline' | 'Title' | 'Label' | 'Body';
}

/**
 * Get style position (scale step relative to base)
 */
export function getStylePosition(styleName: string): number | undefined {
  return STYLE_POSITIONS[styleName as keyof typeof STYLE_POSITIONS];
}

/**
 * Get style's corresponding f-step
 */
export function getStyleFStep(styleName: string): FScaleStep | undefined {
  const position = getStylePosition(styleName);
  if (position === undefined) return undefined;
  return positionToFStep(position);
}


// ============================================================================
// V2 RELATIONAL TYPOGRAPHY SYSTEM (extracted to ./typography/v2.ts)
// Re-exported here so existing callers keep working unchanged. New code
// should import from `@oneui/shared/utils/typography/v2` directly when only
// the V2 surface is needed — that avoids pulling the legacy V1 helpers in.
// ============================================================================
export * from './typography/v2';
