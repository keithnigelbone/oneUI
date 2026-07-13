/**
 * Brand CSS Engine — Shared Types
 *
 * Minimal type definitions for engine functions that need to be framework-agnostic.
 * These mirror the canonical types in @oneui/ui Surfaces module but are self-contained
 * to avoid circular dependencies.
 */

/** A resolved color scale with step→hex mappings */
export interface EngineAvailableScale {
  name: string;
  steps: number[];
  colors?: Array<{ step: number; hex: string; oklch?: string }>;
  baseStep?: number;
}

/**
 * Canonical alias — identical to EngineAvailableScale.
 * Consumers should prefer this name; EngineAvailableScale is kept for backwards compat.
 */
export type AvailableScale = EngineAvailableScale;

/** Color palette: step number → hex string */
export type EngineColorPalette = Record<number, string>;

/** Result of CSS validation */
export interface BrandCSSValidation {
  valid: boolean;
  missing: string[];
  tokenCount: number;
  /** Duplicate token names found (same property declared multiple times) */
  duplicates: string[];
  /** Declarations with empty or invalid values */
  invalidValues: string[];
  /** Interdependency violations (e.g., Surface-Bold without Text-OnBold-High) */
  interdependencyViolations: string[];
  /** Non-fatal warnings (e.g., CSS size or token count exceeding soft limits) */
  warnings: string[];
  /** CSS size in bytes */
  cssSize: number;
}

/** Result of surface context CSS validation (separate from root CSS) */
export interface SurfaceContextCSSValidation {
  valid: boolean;
  tokenCount: number;
  cssSize: number;
  warnings: string[];
  /** Tokens that don't match the brand allowlist */
  disallowedTokens: string[];
}

/** CSS injection mode */
export type InjectionMode = 'none' | 'scoped' | 'global';

// ============================================================================
// Surface Level & Context (Phase 2)
// ============================================================================

/**
 * Surface depth level — maps to Figma's surface emphasis hierarchy.
 *
 * | Level       | Figma Emphasis | Example           |
 * |-------------|----------------|-------------------|
 * | page        | Default        | Root page surface |
 * | container   | Subtle         | Card / section    |
 * | overlay     | Minimal        | Popover/dropdown  |
 * | modal       | (extend)       | Modal / dialog    |
 * | transient   | (extend)       | Tooltip / toast   |
 */
export type SurfaceLevel = 'page' | 'container' | 'overlay' | 'modal' | 'transient';

/**
 * Surface context describing the environment a component renders in.
 * Used by `resolveSurfaceEnvironment()` to map resolved tokens to env tokens.
 */
export interface SurfaceContext {
  /** Appearance role (e.g. "primary", "neutral", "secondary") */
  appearance: string;
  /** Depth level in the surface hierarchy */
  level: SurfaceLevel;
  /** Current theme */
  theme: 'light' | 'dark';
}
