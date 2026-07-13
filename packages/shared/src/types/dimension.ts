/**
 * dimension.ts - Type definitions for the Dimension Scale system
 *
 * These types are used across the platform for:
 * - Dimension scale configuration
 * - Convex database schemas
 * - Component props
 * - Token generation
 */

/**
 * Density mode for dimension/spacing calculations
 */
export type DensityMode = 'compact' | 'default' | 'open';

/**
 * Platform type for responsive calculations
 */
export type PlatformType = 'mobile' | 'desktop';

/**
 * F-Scale step identifier (f-8 to f16)
 */
export type FScaleStep =
  | 'f-8'
  | 'f-7'
  | 'f-6'
  | 'f-5'
  | 'f-4'
  | 'f-3'
  | 'f-2'
  | 'f-1'
  | 'f0'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'f9'
  | 'f10'
  | 'f11'
  | 'f12'
  | 'f13'
  | 'f14'
  | 'f15'
  | 'f16';

/**
 * Canonical numeric spacing token names
 */
export type SpacingTokenName =
  | '0'
  | '0-5'
  | '1'
  | '1-5'
  | '2'
  | '2-5'
  | '3'
  | '3-5'
  | '4'
  | '4-5'
  | '5'
  | '5-5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '12'
  | '14'
  | '16'
  | '18'
  | '20'
  | '24'
  | '28'
  | '32'
  | '40';

export type SpacingFStep = FScaleStep | 'f2-5';

/**
 * Platform-specific configuration
 */
export interface PlatformConfig {
  viewingDistance: number; // cm
  ppi: number; // pixels per inch
  pixelDensity: number; // @1x, @2x, @3x
  baseSize: number; // calculated or override base size
  scaleFactor: number; // scale multiplier
}

/**
 * Dimension configuration for a brand
 */
export interface DimensionConfig {
  brandId?: string;
  density: DensityMode;
  mobile: PlatformConfig;
  desktop: PlatformConfig;
  viewportMin: number; // 360
  viewportMax: number; // 1920
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Single step in the dimension scale
 */
export interface DimensionScaleStep {
  step: FScaleStep;
  stepNumber: number;
  mobileValue: number;
  desktopValue: number;
  isResponsive: boolean;
  spacingToken: SpacingTokenName | null;
}

/**
 * Spacing step with optional responsive values
 */
export interface SpacingStep {
  token: SpacingTokenName;
  fStep: SpacingFStep;
  value: number;
  responsive?: {
    min: number;
    max: number;
    clamp: string;
  };
}

/**
 * Generated dimension scale for a density
 */
export interface GeneratedDimensionScale {
  density: DensityMode;
  steps: DimensionScaleStep[];
  css: string;
}

/**
 * Dimension token for CSS export
 */
export interface DimensionToken {
  name: string; // e.g., "Dimension-f0" or "Spacing-4"
  value: string; // e.g., "16px" or "clamp(...)"
  isResponsive: boolean;
  mobileValue: number;
  desktopValue: number;
}

/**
 * Dimension validation result
 */
export interface DimensionValidationResult {
  valid: boolean;
  nearestStep: FScaleStep | null;
  expectedValue: number | null;
  message?: string;
}

/**
 * Platform parameters for DIN 1450 calculation
 */
export interface DIN1450Params {
  viewingDistance: number; // cm
  ppi: number;
  pixelDensity: number;
  xHeight: number; // typically 0.53
  visualAngle?: number; // degrees, default 0.3
}

/**
 * Result of DIN 1450 base size calculation
 */
export interface DIN1450Result {
  baseSize: number;
  params: DIN1450Params;
  formula: string;
}

/**
 * Dimension system state for UI
 */
export interface DimensionSystemState {
  activeDensity: DensityMode;
  configs: Record<DensityMode, DimensionConfig>;
  generatedScales: Record<DensityMode, GeneratedDimensionScale>;
}

/**
 * Props for dimension scale editor component
 */
export interface DimensionScaleEditorProps {
  density: DensityMode;
  config: DimensionConfig;
  onConfigChange: (config: DimensionConfig) => void;
  showPreview?: boolean;
}

/**
 * Props for spacing preview component
 */
export interface SpacingPreviewProps {
  density: DensityMode;
  highlightedToken?: SpacingTokenName;
  showValues?: boolean;
  showFSteps?: boolean;
}
