/**
 * buildNativeTheme.ts
 *
 * Pure builder that turns foundation data into a typed, React Native-ready
 * theme object. Mirrors the data path of `useBrandCSS` (web) up to the point
 * where CSS strings would be generated — and stops there. Native consumers
 * read tokens off the theme directly; no CSS round trip.
 *
 * The engine functions used here are the same ones the web pipeline uses
 * (`buildAvailableScales`, `buildPaletteFromScale`, `buildScaleDefinition`,
 * `resolveMultiRoleTokenSets`), so colour resolution stays bit-identical
 * with web. Surface context (`<Surface mode="bold">` etc.) is resolved at
 * render time inside the native Surface component using
 * `resolveContextTokenSet` — the theme exposes the raw `ThemeConfig` for
 * that purpose.
 */

import { buildAvailableScales } from './buildAvailableScales';
import {
  APPEARANCE_ROLES,
  resolveMultiRoleTokenSets,
  type ThemeConfig,
  type MultiRoleTokenSets,
  type ResolvedTokenSet,
  type SurfaceToken,
  type ContentToken,
  type StateToken,
} from './surfaceNew';
import {
  computeInputHash,
  computeMotionFingerprint,
  computeElevationFingerprint,
} from './cacheKey';
import {
  buildThemeConfig,
  type ThemeConfigAppearanceInput,
} from './buildThemeConfig';
import {
  buildNativeTypography,
  type NativeTypography,
  type NativeTypographyConfig,
  type NativeCustomFontDescriptor,
} from './buildNativeTypography';
import {
  buildNativeMotion,
  type NativeMotionConfigInput,
  type ResolvedNativeMotion,
} from './buildNativeMotion';
import {
  buildNativeElevation,
  type NativeElevationConfigInput,
  type ResolvedNativeElevation,
} from './buildNativeElevation';
import {
  buildNativeDimensions,
  type NativeSpacing,
  type NativeShape,
} from './buildNativeDimensions';
import { hexToRgbTuple } from './colorMath';
import { resolveMaterials, type ResolvedMaterials } from './materialNative';

// ============================================================================
// Inputs
// ============================================================================

/**
 * Minimal appearance config shape (matches Convex schema). Re-export of the
 * shared `ThemeConfigAppearanceInput` so native consumers don't need a
 * separate import path.
 */
export type NativeAppearanceConfig = ThemeConfigAppearanceInput;

/**
 * Input shape for `buildNativeTheme`.
 *
 * Matches the relevant fields of the Convex `getBrandOverviewData` payload —
 * native consumers can pass that document straight in. Unused fields
 * (typography V2, motion config, grid, decorations) are reserved for future
 * resolution; today they fall back to the static defaults from
 * `@oneui/tokens` where not supplied via Convex rows (`motionConfigs`,
 * `elevationConfigs`).
 */
export interface BuildNativeThemeInput {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colorConfig: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presetSelection?: any;
  appearanceConfig?: NativeAppearanceConfig | null;
  /** Typography V2 config (from `foundations[type='typography'].config`). */
  typographyConfig?: NativeTypographyConfig | null;
  /** Custom uploaded fonts (from `customFonts` in `getBrandOverviewData`). */
  customFonts?: NativeCustomFontDescriptor[];
  /**
   * Motion row from Convex `motionConfigs` (`baseDuration` + `easings`).
   * When omitted, Jio defaults from `buildNativeMotion(null)` apply.
   */
  motionConfig?: NativeMotionConfigInput;
  /**
   * Elevation row from Convex `elevationConfigs` (`levels` array).
   * When omitted, Jio defaults from `buildNativeElevation(null)` apply.
   */
  elevationConfig?: NativeElevationConfigInput | null;
  /**
   * Raw `materialConfig` from the Convex `materialConfigs` table row (metallic
   * preset overrides). When omitted, `DEFAULT_METALLIC_PRESETS` apply.
   */
  materialConfig?: unknown;
  /**
   * Raw `foundation.materials.config` from `getBrandOverviewData` — carries
   * `materialAssignments`, `activeMetals`, and per-preset stop overrides.
   */
  materialsFoundationConfig?: unknown;
}

/**
 * Active rendering context for the theme. Mirrors the cascade controls on
 * web (theme + density + platform).
 */
export interface NativeThemeContext {
  theme: 'light' | 'dark';
  /** Reserved — full density-aware token sets land in a follow-up. */
  density?: 'compact' | 'default' | 'open';
  /** Reserved — responsive overrides land in a follow-up. */
  platform?: 'mobile' | 'tablet' | 'desktop';
}

// ============================================================================
// Output: OneUINativeTheme
// ============================================================================

/**
 * Per-role resolved colour tokens, ready for direct use in `StyleSheet`.
 * Most values are hex strings. State-layer values may be rgba strings because
 * they represent translucent overlays.
 */
export interface NativeRoleTokens {
  surfaces: Record<SurfaceToken, string>;
  content: Record<ContentToken, string>;
  /** Content colours resolved against this role's `bold` surface. */
  onBoldContent: Record<ContentToken, string>;
  /** Content colours resolved against this role's `subtle` surface. */
  onSubtleContent: Record<ContentToken, string>;
  states: Record<StateToken, string>;
  stateLayers: Record<StateToken, string>;
}

/**
 * The complete theme object delivered to React Native components. Components
 * never read directly from it — they go through `useOneUITheme()` and
 * `useSurfaceTokens()`.
 */
export interface OneUINativeTheme {
  meta: {
    theme: 'light' | 'dark';
    density: 'compact' | 'default' | 'open';
    platform: 'mobile' | 'tablet' | 'desktop';
    /** Stable hash of `colorConfig + appearanceConfig + theme`. Use for cache keys. */
    brandHash: string;
    /** Names of roles actually configured for this brand. */
    configuredRoles: string[];
  };

  /**
   * Raw engine inputs — needed by `<Surface>` to resolve context tokens at
   * render time using the same algorithm web uses for `[data-surface]`.
   */
  themeConfig: ThemeConfig;
  rootParentStep: number;
  darkMode: boolean;

  /**
   * Pre-resolved tokens at the page (root) surface for every configured
   * role. Components that don't sit under a `<Surface>` read from here.
   */
  rootRoles: Record<string, NativeRoleTokens>;

  /**
   * Resolved typography tokens (font sizes, line heights, weights, families)
   * for all 25 sizes across the 6 roles. Mirrors the web `--{Role}-{Size}-*`
   * CSS variable surface as numeric React Native values.
   */
  typography: NativeTypography;

  /**
   * Resolved motion primitives (durations, offsets, easings, distances) plus
   * RN-only tap-scale / spring / spinner tuning. Mirrors web `--Motion-*` CSS.
   */
  motion: ResolvedNativeMotion;

  /**
   * Resolved elevation levels for RN `shadow*` / `elevation` consumers.
   */
  elevation: ResolvedNativeElevation;

  /** Resolved spacing tokens (numeric pixel values). Mirrors `--Spacing-*`. */
  spacing: NativeSpacing;
  /** Resolved shape tokens (numeric pixel values). Mirrors `--Shape-*`. */
  shape: NativeShape;

  /**
   * Resolved material gradient data (metallic presets + role assignments).
   * `null` when no material configuration is present for this brand.
   * Exposed via `MaterialContext` / `useBrandMaterial()` / `useRoleMaterial()`.
   */
  materials: ResolvedMaterials | null;
}

// ============================================================================
// Flattening — ResolvedTokenSet → NativeRoleTokens (hex-only)
// ============================================================================

function flattenRoleTokens(set: ResolvedTokenSet): NativeRoleTokens {
  const flatHex = <K extends string>(
    record: Record<K, { hex: string } | { blendedHex: string; hex: string }>,
  ): Record<K, string> => {
    const out = {} as Record<K, string>;
    for (const key in record) {
      const entry = record[key] as { hex?: string; blendedHex?: string };
      // Content tokens carry both `hex` and `blendedHex`; the blended value is
      // already composited against the parent surface and is the one a render
      // target should paint. Surface and state tokens have only `hex`.
      out[key] = (entry.blendedHex ?? entry.hex) as string;
    }
    return out;
  };

  const flatLayer = <K extends string>(
    record: Record<K, { hex: string; opacity: number }>,
  ): Record<K, string> => {
    const out = {} as Record<K, string>;
    for (const key in record) {
      const entry = record[key];
      if (entry.opacity <= 0) {
        out[key] = 'transparent';
      } else if (entry.opacity >= 1) {
        out[key] = entry.hex;
      } else {
        const [r, g, b] = hexToRgbTuple(entry.hex);
        out[key] = `rgba(${r}, ${g}, ${b}, ${entry.opacity.toFixed(3).replace(/\.?0+$/, '')})`;
      }
    }
    return out;
  };

  return {
    surfaces: flatHex(set.surfaces),
    content: flatHex(set.content),
    onBoldContent: flatHex(set.onBoldContent),
    onSubtleContent: flatHex(set.onSubtleContent),
    states: flatHex(set.states),
    stateLayers: flatLayer(set.stateLayers),
  };
}

function flattenMultiRole(
  multiRole: MultiRoleTokenSets,
): Record<string, NativeRoleTokens> {
  const out: Record<string, NativeRoleTokens> = {};
  for (const [role, set] of Object.entries(multiRole.roles)) {
    out[role] = flattenRoleTokens(set);
  }
  return out;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Build a `OneUINativeTheme` from foundation data + render context.
 *
 * Pure function. Memoize against `meta.brandHash` to skip recomputation when
 * the same brand+theme combination is requested again — same caching shape as
 * `useBrandCSS` on web.
 */
export function buildNativeTheme(
  input: BuildNativeThemeInput,
  context: NativeThemeContext,
): OneUINativeTheme | null {
  const {
    colorConfig,
    presetSelection,
    appearanceConfig,
    typographyConfig,
    customFonts,
    motionConfig,
    elevationConfig,
    materialConfig,
    materialsFoundationConfig,
  } = input;
  const { theme, density = 'default', platform = 'mobile' } = context;

  const availableScales = buildAvailableScales(colorConfig, presetSelection);
  const themeConfig = buildThemeConfig(availableScales, appearanceConfig ?? null);
  if (!themeConfig) return null;

  const darkMode = theme === 'dark';
  // Same root anchors useBrandCSS uses: 2500 (white) / 200 (dark).
  const rootParentStep = darkMode ? 200 : 2500;

  const multiRole = resolveMultiRoleTokenSets(themeConfig, rootParentStep, darkMode);
  const rootRoles = flattenMultiRole(multiRole);

  // Native maps `platform: 'mobile'` to the S dimension breakpoint and
  // `'tablet'` to M. Desktop is supported for completeness but not
  // typically reached on RN; falls back to L.
  const dimensionPlatform =
    platform === 'tablet' ? 'M' : platform === 'desktop' ? 'L' : 'S';

  const typography = buildNativeTypography({
    config: typographyConfig ?? null,
    customFonts: customFonts ?? [],
    platform: dimensionPlatform,
    density,
  });

  const motion = buildNativeMotion(motionConfig ?? null);
  const elevation = buildNativeElevation(elevationConfig ?? null);
  const { spacing, shape } = buildNativeDimensions({
    platform: dimensionPlatform,
    density,
  });

  // Brand hash must invalidate when any input that affects token resolution
  // changes — including typography config and uploaded fonts. Without this,
  // memoised consumers would serve stale type tokens after a typography-only
  // edit. Fonts are fingerprinted by their content-hash-stable URLs.
  const fontFingerprint = (customFonts ?? [])
    .map((f) => `${f._id}:${f.familyName}:${f.fileUrl}`)
    .sort()
    .join('|');
  const brandHash =
    computeInputHash(colorConfig, appearanceConfig ?? null) +
    ':' +
    computeInputHash(typographyConfig ?? null, fontFingerprint) +
    ':' +
    computeMotionFingerprint(motionConfig ?? null) +
    ':' +
    computeElevationFingerprint(elevationConfig ?? null) +
    ':' +
    theme +
    ':' +
    density +
    ':' +
    dimensionPlatform;

  const materials =
    materialConfig != null || materialsFoundationConfig != null
      ? resolveMaterials(materialConfig, materialsFoundationConfig)
      : null;

  return {
    meta: {
      theme,
      density,
      platform,
      brandHash,
      configuredRoles: Object.keys(themeConfig.appearances),
    },
    themeConfig,
    rootParentStep,
    darkMode,
    typography,
    motion,
    elevation,
    spacing,
    shape,
    rootRoles,
    materials,
  };
}

/**
 * Resolve role tokens at an arbitrary parent step. Used by `<Surface>` to
 * compute its own context's tokens without re-running scale construction.
 *
 * Returns `null` if `themeConfig` is missing the requested role — callers
 * should fall back to the parent surface's tokens.
 */
export function resolveNativeContextRoles(
  themeConfig: ThemeConfig,
  parentStep: number,
  darkMode: boolean,
): Record<string, NativeRoleTokens> {
  const multiRole = resolveMultiRoleTokenSets(themeConfig, parentStep, darkMode);
  return flattenMultiRole(multiRole);
}

// ============================================================================
// Token-boundary validator
// ============================================================================

export interface NativeThemeValidation {
  valid: boolean;
  /**
   * Role names present in `theme.meta.configuredRoles` that are NOT in the
   * canonical `APPEARANCE_ROLES` allowlist. Unknown roles fall through
   * `useSurfaceTokens`'s neutral fallback and may indicate a Convex data
   * corruption or a manually constructed theme object.
   */
  violations: string[];
}

/**
 * Native equivalent of the web brand-CSS prefix allowlist (`tokenBoundary.ts`):
 * checks every configured role against the canonical 9-entry
 * `APPEARANCE_ROLES` set. Pure function; never throws. Callers opt in to
 * enforcement.
 */
export function validateNativeTheme(theme: OneUINativeTheme): NativeThemeValidation {
  const allowed = new Set<string>(APPEARANCE_ROLES);
  const violations = theme.meta.configuredRoles.filter((role) => !allowed.has(role));
  return { valid: violations.length === 0, violations };
}
