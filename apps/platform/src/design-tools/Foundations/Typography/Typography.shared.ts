/**
 * Typography.shared.ts
 * Shared types for typography foundation components
 */

import type { TypographyStyle, PlatformPreset } from '@oneui/shared';
import {
  type FontCategory,
  type FontScope,
  type FontSelection,
  type FontMetadata,
  type CustomFontData,
  DEFAULT_FONT_SELECTION,
  FONT_COLLECTION,
  FONT_CATEGORY_LABELS,
  STYLE_FONT_MAPPING,
  getFontById,
  getFontByName,
  getFontsByCategory,
  getFontCategoryCounts,
  buildFontFamilyString,
  buildFontFamilyById,
  getGoogleFontsUrl,
  getFontForStyleCategory,
  convertCustomFontToMetadata,
  getUploadedFontId,
  getConvexIdFromFontId,
} from './fonts';

// Re-export font types and utilities
export type { FontCategory, FontScope, FontSelection, FontMetadata, CustomFontData };
export {
  DEFAULT_FONT_SELECTION,
  FONT_COLLECTION,
  FONT_CATEGORY_LABELS,
  STYLE_FONT_MAPPING,
  getFontById,
  getFontByName,
  getFontsByCategory,
  getFontCategoryCounts,
  buildFontFamilyString,
  buildFontFamilyById,
  getGoogleFontsUrl,
  getFontForStyleCategory,
  convertCustomFontToMetadata,
  getUploadedFontId,
  getConvexIdFromFontId,
};

// Platform types for DIN 1450 presets
export type DigitalPlatform = 'mobile' | 'tablet' | 'desktop' | 'tv';
export type PrintPlatform = 'printA4' | 'printBusinessCard' | 'outdoor';
export type Platform = DigitalPlatform | PrintPlatform;

/** Viewing distance parameters for DIN 1450 calculation */
export interface ViewingDistanceParams {
  viewingDistance: number;
  ppi: number;
  pixelDensity: number;
}

export interface DIN1450CalculatorProps {
  platform: Platform;
  /** Initial viewing distance params (from saved config) */
  initialParams?: ViewingDistanceParams;
  customPreset?: PlatformPreset;
  /** Called when platform or params change - includes all values needed for sync */
  onChange: (platform: Platform, baseSize: number, params: ViewingDistanceParams) => void;
  onCustomPresetChange?: (preset: PlatformPreset) => void;
}

export interface TypeScaleEditorProps {
  baseSize: number;
  scaleFactor: number;
  onBaseSizeChange: (size: number) => void;
  onScaleFactorChange: (factor: number) => void;
  /** Font selection for preview (primary/secondary/fallback) */
  fontSelection?: FontSelection;
  /** Set of loaded font IDs for applying fonts */
  loadedFonts?: Set<string>;
  disabled?: boolean;
}

export interface TypographyStyleEditorProps {
  styles: TypographyStyle[];
  onChange: (styles: TypographyStyle[]) => void;
  /** Font selection configuration (optional, for showing font column) */
  fontSelection?: FontSelection;
  /** Set of loaded font IDs (optional, for applying fonts in preview) */
  loadedFonts?: Set<string>;
  /** Per-style font overrides (styleName -> fontId) */
  perStyleFonts?: Record<string, string>;
  /** Callback when per-style font is changed */
  onPerStyleFontChange?: (styleName: string, fontId: string | null) => void;
  disabled?: boolean;
}

export interface WeightMappingProps {
  mapping: Record<string, number>;
  onChange: (mapping: Record<string, number>) => void;
  disabled?: boolean;
}

export interface TypographyFoundationConfig {
  platform: Platform;
  baseSize: number;
  scaleFactor: number;
  /** DIN 1450 viewing distance in cm */
  viewingDistance: number;
  /** Screen PPI */
  ppi: number;
  /** Pixel density (@1x, @2x, @3x) */
  pixelDensity: number;
  styles: TypographyStyle[];
  weightMapping: Record<string, number>;
  fontFamily: string;
  /** Font selection configuration for primary/secondary fonts */
  fontSelection: FontSelection;
  /** Per-style font overrides (styleName -> fontId) */
  perStyleFonts?: Record<string, string>;
}

// Default configuration (desktop preset values from DIN 1450)
export const DEFAULT_TYPOGRAPHY_CONFIG: TypographyFoundationConfig = {
  platform: 'desktop',
  baseSize: 16,
  scaleFactor: 1.125,
  // Desktop viewing distance defaults
  viewingDistance: 60,
  ppi: 96,
  pixelDensity: 1,
  styles: [],
  weightMapping: {
    low: 400,
    medium: 500,
    high: 700,
    black: 900,
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSelection: DEFAULT_FONT_SELECTION,
};

// Scale factor labels
export const SCALE_FACTOR_LABELS: Record<number, string> = {
  1.1: 'Compact (1.10)',
  1.125: 'Default (1.125)',
  1.15: 'Open (1.15)',
};

// Platform labels
export const PLATFORM_LABELS: Record<Platform, string> = {
  mobile: 'Mobile',
  tablet: 'Tablet',
  desktop: 'Desktop',
  tv: 'TV',
  printA4: 'Print A4',
  printBusinessCard: 'Business Card',
  outdoor: 'Outdoor Signage',
};
