/**
 * platforms.ts
 *
 * Type definitions for the Platforms foundation.
 * Manages breakpoints, density, and DIN 1450 platform parameters per brand.
 */

import type { DensityMode } from '../utils/platform-config';

/**
 * Platform category — decides runtime selection behaviour and the semantic
 * meaning of a platform's breakpoints.
 *
 * - `digital-responsive`: viewport-driven breakpoints auto-switched via matchMedia (Web).
 * - `digital-fixed`: one canonical canvas per device family (Mobile Native, Tablet Native,
 *   Desktop Native, TV Native). Breakpoint selection is manual.
 * - `print`: one platform holding fixed-format variants (A4, Business Card, Poster, ...).
 *   Breakpoints carry width/height/units and optional per-breakpoint DIN 1450 overrides.
 * - `physical`: one platform holding context variants (Billboard, Bus Stop, Indoor Signage,
 *   ...). Breakpoints carry reference canvas dimensions and optional DIN overrides.
 */
export type PlatformCategory =
  | 'digital-responsive'
  | 'digital-fixed'
  | 'print'
  | 'physical';

/**
 * Optional per-breakpoint DIN 1450 override.
 * Print/Physical formats often share a parent viewing distance, but edge cases
 * like Business Cards (~30cm) vs A4 (~40cm) need granular overrides.
 * Any field left undefined inherits from the parent PlatformEntry.
 */
export interface PlatformBreakpointDIN1450Override {
  /** Viewing distance in cm */
  viewingDistance?: number;
  /** Screen / print DPI */
  ppi?: number;
  /** Device pixel ratio (@1x / @2x / @3x) — typically 1 for print */
  pixelDensity?: number;
}

/**
 * A breakpoint within a platform (e.g., Web Mobile 360px, Print A4 Portrait, Billboard).
 * Mirrors Figma "1. Platform" collection modes for digital-responsive platforms,
 * and represents format/context variants for other categories.
 */
export interface PlatformBreakpoint {
  id: string;
  label: string;
  /** Primary sizing axis in px — the only field Web consumers read */
  viewportWidth: number;
  /** Secondary sizing axis — used by print/physical canvases with fixed aspect */
  viewportHeight?: number;
  /** Unit of the width/height fields. Defaults to 'px'. Print variants typically use 'mm'. */
  units?: 'px' | 'mm';
  isActive: boolean;
  /**
   * Optional per-breakpoint DIN 1450 override. When present, the breakpoint's base size
   * is recomputed from these values instead of inheriting the parent platform's.
   */
  din1450Override?: PlatformBreakpointDIN1450Override;
}

/**
 * Density configuration per platform
 * Allows per-brand overrides of the global DENSITY_CONFIGS defaults.
 */
export interface PlatformDensityConfig {
  density: DensityMode;
  mobile: { baseSize: number; scaleFactor: number };
  desktop: { baseSize: number; scaleFactor: number };
}

/**
 * A single platform entry with its full configuration.
 * Combines DIN 1450 viewing distance params, breakpoints, and density.
 */
export interface PlatformEntry {
  id: string;
  label: string;
  description: string;
  isEnabled: boolean;
  /**
   * Platform category — drives runtime breakpoint selection behaviour and the
   * semantic meaning of `breakpoints[]`. Optional for back-compat: legacy stored
   * configs without this field are treated as `digital-responsive`.
   */
  category?: PlatformCategory;
  /**
   * How breakpoints are selected at runtime. Derived from category:
   * `digital-responsive` → `viewport-auto` (matchMedia), everything else → `manual`.
   * Stored explicitly so the runtime doesn't need to re-infer it from the category.
   */
  breakpointSelectionMode?: 'viewport-auto' | 'manual';
  /** DIN 1450 viewing distance in cm */
  viewingDistance: number;
  /** Screen pixels per inch */
  ppi: number;
  /** Device pixel ratio (@1x, @2x, @3x) */
  pixelDensity: number;
  /** Calculated base size from DIN 1450 formula */
  calculatedBaseSize: number;
  /** Breakpoints (any platform can have breakpoints; user can add/remove) */
  breakpoints: PlatformBreakpoint[];
  /** Minimum viewport for responsive interpolation */
  viewportMin: number;
  /** Maximum viewport for responsive interpolation */
  viewportMax: number;
  /** Whether tokens scale fluidly between breakpoints using CSS clamp() */
  fluidScaling: boolean;
  /** Per-density configs for this platform */
  densityConfigs: PlatformDensityConfig[];
}

/**
 * Top-level platforms foundation configuration stored per brand.
 */
export interface PlatformsFoundationConfig {
  platforms: PlatformEntry[];
  defaultPlatform: string;
  defaultDensity: DensityMode;
  /** @deprecated Other foundations now read from platforms directly via Convex queries */
  syncTypography?: boolean;
  /** @deprecated Other foundations now read from platforms directly via Convex queries */
  syncSpacing?: boolean;
}
