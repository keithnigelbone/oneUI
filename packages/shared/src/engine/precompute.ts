/**
 * precompute.ts
 *
 * Server-side brand CSS precomputation pipeline. Takes foundation data
 * (same shape as getBrandOverviewData) and produces validated CSS strings
 * ready for cache storage or CDN export.
 *
 * This mirrors the client-side useBrandCSS pipeline but runs without React:
 * 1. Build color scales from config + preset selection
 * 2. Build V4 palette data from scales + appearance config
 * 3. Compute single-theme V4 stacking
 * 4. Generate CSS declarations + typography CSS
 * 5. Apply token boundary filtering
 * 6. Validate CSS
 *
 * Used by Convex actions for server-side cache population.
 *
 * Two pipelines coexist:
 * - precomputeBrandCSS: V4 surface algorithm (legacy, kept for rollback safety)
 * - precomputeBrandCSSNew: Next-gen relative-step algorithm (active)
 */

import { buildAvailableScales } from './buildAvailableScales';
import { filterBrandDeclarations } from './tokenBoundary';
import { validateBrandCSS } from './validateBrandCSS';
import { computeInputHash } from './cacheKey';
import { resolveMultiRoleTokenSets } from './surfaceNew';
import {
  generateAppearanceRedirectCSS,
  generateContextBoundaryCSS,
  generateMultiRoleRootCSS,
  generateSurfaceContextCSS,
  generateSurfaceStepLookupCSS,
  generateTransparentMaterialCSS,
} from './cssGenNew';
import { buildThemeConfig } from './buildThemeConfig';
import { generateGridCSS, type BrandGridConfig } from './gridCSS';
import { generateMaterialAssignmentCSS, generateMetallicMaterialCSS } from './materialCSS';
import { generateMotionCSS } from './motionCSS';
import { generateElevationCSS, type ElevationFoundationConfig } from './elevationCSS';
import { generateDimensionCSS } from '../utils/dimensionCSS';
import { migrateLegacyPlatformsConfig } from '../utils/platform-config';
import type { MotionFoundationConfig } from '../utils/motion';
import type { PlatformsFoundationConfig } from '../types/platforms';

// ============================================================================
// Types
// ============================================================================

/** Minimal appearance config shape (matches Convex schema) */
interface AppearanceConfig {
  accentCount: number;
  background: {
    scaleName: string;
    backgroundStep: {
      light: number;
      dark: number;
      dim?: number;
    };
  };
  accents: Array<{
    role: string;
    label: string;
    scaleName: string;
    baseStep: number;
  }>;
  logo?: {
    scaleName: string;
    baseStep: number;
  };
  materials?: {
    materialAssignments?: Record<string, string | undefined>;
  };
}

/** Typography font selection config */
interface FontSelection {
  scope: 'single' | 'dual';
  primaryFontId: string | null;
  secondaryFontId: string | null;
  fallbackFontIds?: string[];
}

/** Typography config (minimal, for CSS generation) */
interface TypographyConfig {
  fontFamily?: string;
  fontSelection?: FontSelection;
  weightMapping?: Record<string, number>;
}

/** Custom font entry (resolved from Convex) */
interface CustomFontEntry {
  _id: string;
  name: string;
  familyName: string;
  fallback: string;
}

/** Input data for precomputation (matches getBrandOverviewData shape) */
export interface PrecomputeInput {
  colorConfig: Record<string, unknown> | null;
  presetSelection: Record<string, unknown> | null;
  appearanceConfig: AppearanceConfig | null;
  typographyConfig: TypographyConfig | null;
  customFonts?: Array<CustomFontEntry | Record<string, unknown>>;
  motionConfig?: MotionFoundationConfig | Record<string, unknown> | null;
  elevationConfig?: ElevationFoundationConfig | Record<string, unknown> | null;
  gridConfig?: BrandGridConfig | Record<string, unknown> | null;
  platformsConfig?: PlatformsFoundationConfig | Record<string, unknown> | null;
  materialConfig?: Record<string, unknown> | null;
  /** Static font family resolver. When not provided, font IDs are used as-is. */
  resolveFontFamily?: (fontId: string) => string;
}

/** Result of precomputation for a single theme */
export interface PrecomputeResult {
  rawCSS: string;
  /** Surface context CSS ([data-surface] blocks). Only present in new algorithm output. */
  contextCSS?: string;
  cssSize: number;
  tokenCount: number;
  inputHash: string;
  isValid: boolean;
  warnings: string[];
}

// ============================================================================
// Helpers
// ============================================================================

/** Generate typography font CSS declarations (simplified, no font registry dependency) */
function generateTypographyFontCSS(
  config: TypographyConfig | null,
  customFonts?: Array<CustomFontEntry | Record<string, unknown>>,
  resolveFontFamily?: (fontId: string) => string,
): string {
  if (!config) return '';

  const declarations: string[] = [];

  const resolve = (fontId: string): string => {
    // Check custom (uploaded) fonts first
    if (fontId.startsWith('uploaded-') && customFonts) {
      const convexId = fontId.replace('uploaded-', '');
      const cf = customFonts.find(f => (f as CustomFontEntry)._id === convexId) as CustomFontEntry | undefined;
      if (cf) {
        const name = cf.name.includes(' ') ? `'${cf.name}'` : cf.name;
        return `${name}, ${cf.fallback}`;
      }
    }
    // Use provided resolver or fall back to raw ID
    return resolveFontFamily ? resolveFontFamily(fontId) : fontId;
  };

  const hasPrimaryFamily = Boolean(config.fontSelection?.primaryFontId || config.fontFamily);
  if (config.fontSelection?.primaryFontId) {
    const family = resolve(config.fontSelection.primaryFontId);
    // Emit canonical Text + deprecated Body/Primary aliases (mirror foundationCSS.ts).
    // Without --Typography-Font-Text, role tokens (--Body-FontFamily, etc.) stay
    // pinned to the base layer Inter fallback in scoped injection mode.
    declarations.push(`--Typography-Font-Text: ${family};`);
    declarations.push(`--Typography-Font-Body: ${family};`);    // deprecated alias
    declarations.push(`--Typography-Font-Primary: ${family};`); // deprecated alias
  } else if (config.fontFamily) {
    declarations.push(`--Typography-Font-Text: ${config.fontFamily};`);
    declarations.push(`--Typography-Font-Body: ${config.fontFamily};`);    // deprecated alias
    declarations.push(`--Typography-Font-Primary: ${config.fontFamily};`); // deprecated alias
  }

  if (config.fontSelection?.secondaryFontId) {
    const family = resolve(config.fontSelection.secondaryFontId);
    declarations.push(`--Typography-Font-Heading: ${family};`);
    declarations.push(`--Typography-Font-Display: ${family};`);   // deprecated alias
    declarations.push(`--Typography-Font-Secondary: ${family};`); // deprecated alias
  }

  if (config.fontSelection?.fallbackFontIds?.length) {
    declarations.push(`--Typography-Font-Script: ${resolve(config.fontSelection.fallbackFontIds[0])};`);
  }

  // Re-declare per-role FontFamily tokens at brand scope so they re-substitute
  // --Typography-Font-Text at this scope (instead of inheriting :root's Inter).
  // V2 secondary-slot mappings override these later in the declaration list.
  if (hasPrimaryFamily) {
    declarations.push(`--Display-FontFamily: var(--Typography-Font-Text);`);
    declarations.push(`--Headline-FontFamily: var(--Typography-Font-Text);`);
    declarations.push(`--Title-FontFamily: var(--Typography-Font-Text);`);
    declarations.push(`--Body-FontFamily: var(--Typography-Font-Text);`);
    declarations.push(`--Label-FontFamily: var(--Typography-Font-Text);`);
  }

  if (config.weightMapping) {
    const weightMap: Record<string, string> = {
      low: '--Typography-Weight-Regular',
      medium: '--Typography-Weight-Medium',
      high: '--Typography-Weight-Bold',
      black: '--Typography-Weight-Extrabold',
    };

    for (const [key, tokenName] of Object.entries(weightMap)) {
      const value = config.weightMapping[key];
      if (value !== undefined) {
        declarations.push(`${tokenName}: ${value};`);
      }
    }
  }

  return declarations.join('\n  ');
}

function filterScopedBrandCSS(css: string): string {
  if (!css) return '';

  const lines = css.split('\n');
  const declarations: string[] = [];
  const lineIndices: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('--')) {
      declarations.push(trimmed);
      lineIndices.push(i);
    }
  }

  if (declarations.length === 0) return css.trim();

  const allowed = new Set(filterBrandDeclarations(declarations));
  const filteredLines: string[] = [];
  let declIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    if (declIdx < lineIndices.length && i === lineIndices[declIdx]) {
      if (allowed.has(declarations[declIdx])) {
        filteredLines.push(lines[i]);
      }
      declIdx++;
    } else {
      filteredLines.push(lines[i]);
    }
  }

  return filteredLines.join('\n').trim();
}

// ============================================================================
// Main Pipeline
// ============================================================================

/**
 * Precompute brand CSS for a single theme using the next-gen surface algorithm.
 *
 * Server-side equivalent of the client-side useBrandCSS pipeline with the new
 * relative-step algorithm. Same input shape, same output shape — drop-in
 * replacement for precomputeBrandCSS.
 *
 * Differences from V4 pipeline:
 * - Uses buildScaleDefinition + resolveMultiRoleTokenSets instead of
 *   computeSurfaceModesV4 per-role
 * - Uses generateFullCSS for root + context CSS in one pass
 * - Produces ~20 new tokens per role plus ~25 V4-compat aliases per role
 * - Generates [data-surface] context blocks (minimal, subtle, moderate, bold, elevated)
 */
export function precomputeBrandCSSNew(
  input: PrecomputeInput,
  theme: 'light' | 'dark',
): PrecomputeResult {
  const inputHash = computeInputHash(
    input.colorConfig,
    input.appearanceConfig,
    input.typographyConfig,
    {
      motion: input.motionConfig ?? null,
      elevation: input.elevationConfig ?? null,
      grid: input.gridConfig ?? null,
      platforms: input.platformsConfig ?? null,
      materials: input.materialConfig ?? null,
    },
  );

  // 1. Build color scales
  const availableScales = buildAvailableScales(input.colorConfig, input.presetSelection);

  // 2. Build ThemeConfig from scales + appearance config
  const themeConfig = buildThemeConfig(availableScales, input.appearanceConfig ?? null);
  let surfaceCSS = '';
  let contextCSS = '';
  let stepLookupCSS = '';
  let appearanceRedirectCSS = '';
  let contextBoundaryCSS = '';
  let transparentMaterialCSS = '';

  // Fixed root parent steps: 2500 (light) / 200 (dark) — the luminance anchors.
  // The database backgroundStep is a V4 artifact; the new algorithm uses fixed extremes.
  const darkMode = theme === 'dark';
  const outerParentStep = darkMode ? 200 : 2500;

  if (themeConfig) {
    // 3. Generate root CSS using brand's actual background step
    const multiRole = resolveMultiRoleTokenSets(themeConfig, outerParentStep, darkMode);
    const rootCSS = generateMultiRoleRootCSS(multiRole, theme);
    // Generate context CSS using brand's actual background step
    const contextCSSRaw = generateSurfaceContextCSS(themeConfig, outerParentStep, darkMode);
    const stepLookupCSSRaw = generateSurfaceStepLookupCSS(themeConfig);
    const appearanceRedirectCSSRaw = generateAppearanceRedirectCSS(themeConfig);
    const contextBoundaryCSSRaw = generateContextBoundaryCSS(themeConfig);
    const transparentMaterialCSSRaw = generateTransparentMaterialCSS(themeConfig, darkMode);
    const result = { rootCSS, contextCSS: contextCSSRaw };

    // 4. Apply token boundary filtering to root CSS
    if (result.rootCSS) {
      const rootDeclarations = result.rootCSS
        .split('\n')
        .map(d => d.trim())
        .filter(Boolean);
      const filteredRoot = filterBrandDeclarations(rootDeclarations);
      surfaceCSS = filteredRoot.join('\n  ');
    }

    // 5. Apply token boundary filtering to scoped CSS blocks. These blocks
    // mirror the client useBrandCSS pipeline and must travel with cached/CDN CSS.
    contextCSS = filterScopedBrandCSS(result.contextCSS);
    stepLookupCSS = filterScopedBrandCSS(stepLookupCSSRaw);
    appearanceRedirectCSS = filterScopedBrandCSS(appearanceRedirectCSSRaw);
    contextBoundaryCSS = filterScopedBrandCSS(contextBoundaryCSSRaw);
    transparentMaterialCSS = filterScopedBrandCSS(transparentMaterialCSSRaw);
  }

  // 6. Generate typography CSS
  const typographyCSS = generateTypographyFontCSS(
    input.typographyConfig,
    input.customFonts,
    input.resolveFontFamily,
  );

  // 7. Generate motion and selector-scoped layout CSS
  const motionCSS = generateMotionCSS(input.motionConfig as Parameters<typeof generateMotionCSS>[0]);
  const elevationCSS = generateElevationCSS(
    input.elevationConfig as Parameters<typeof generateElevationCSS>[0],
    theme,
  );
  const gridCSS = generateGridCSS(input.gridConfig as Parameters<typeof generateGridCSS>[0]);
  const materialCSS = generateMetallicMaterialCSS(input.materialConfig ?? null);
  const materialAssignmentCSS = generateMaterialAssignmentCSS(input.appearanceConfig ?? null, input.materialConfig ?? null);
  const dimensionCSS = input.platformsConfig
    ? generateDimensionCSS(migrateLegacyPlatformsConfig(input.platformsConfig as PlatformsFoundationConfig))
    : '';

  // 8. Combine and validate
  const rawCSS = [typographyCSS, motionCSS, elevationCSS, materialCSS, materialAssignmentCSS, surfaceCSS].filter(Boolean).join('\n  ');
  const additionalCSS = [
    contextCSS,
    stepLookupCSS,
    appearanceRedirectCSS,
    contextBoundaryCSS,
    transparentMaterialCSS,
    dimensionCSS,
    gridCSS,
  ].filter(Boolean).join('\n');

  if (!rawCSS && !additionalCSS) {
    return {
      rawCSS: '',
      cssSize: 0,
      tokenCount: 0,
      inputHash,
      isValid: true,
      warnings: [],
    };
  }

  const validation = rawCSS ? validateBrandCSS(rawCSS) : { valid: true, tokenCount: 0, warnings: [] as string[] };

  return {
    rawCSS,
    contextCSS: additionalCSS || undefined,
    cssSize: new TextEncoder().encode(rawCSS + additionalCSS).length,
    tokenCount: validation.tokenCount,
    inputHash,
    isValid: validation.valid,
    warnings: validation.warnings,
  };
}
