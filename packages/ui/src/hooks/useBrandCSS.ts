/**
 * useBrandCSS.ts
 *
 * Brand CSS React hook — the thin React wrapper around the pure-function
 * engine in `@oneui/shared/engine`. Consumes a brand's foundation data and
 * returns the stylesheet to inject into `<style id="oneui-foundation-tokens">`.
 *
 * Pipeline:
 * 1. Build color scales from preset/custom configs (theme-independent).
 * 2. Build NewPaletteData → ScaleDefinitions (theme-independent, memo #1).
 * 3. Generate root CSS + context CSS + typography + motion + ornaments
 *    (theme-dependent, memo #2).
 * 4. Validate + wrap in `@layer brand`.
 *
 * History note:
 *   Previously shipped as `useBrandCSSNew` while the V4 pre-computed-matrix
 *   hook (`useBrandCSS`) was being phased out. The V4 hook has since been
 *   removed and this file is the single source of truth. If you see old
 *   `useBrandCSSNew` imports still in the tree they're safe to migrate:
 *     import { useBrandCSS } from '@oneui/ui';
 */

'use client';

import { useInsertionEffect, useMemo } from 'react';
import {
  buildAvailableScales,
  computeInputHash,
  computeMotionFingerprint,
  validateBrandCSS,
  validateBrandCSSSignature,
  validateSurfaceContextCSS,
  wrapCSSForInjection,
  generateMotionCSS,
  generateElevationCSS,
  generateGridCSS,
  generateGradientCSS,
  generateMaterialAssignmentCSS,
  generateMetallicMaterialCSS,
  normalizeMetallicMaterials,
  type InjectionMode,
} from '@oneui/shared/engine';
import { generateOrnamentCSSProperties, generateFontRenderingCSS, type DecorationConfig } from '@oneui/shared';
import {
  buildNewPaletteData,
  generateNewRootCSS,
  generateNewContextCSS,
  generateNewStepLookupCSSSplit,
  generateNewAppearanceRedirectCSS,
  generateNewContextBoundaryCSS,
  generateNewTransparentCSS,
} from '../engine/computeNewStacking';
import {
  generateTypographyFontCSS,
  generateTypographyFontCSSV2,
  generateTypographyScriptContextCSS,
  generateGoogleFontImports,
} from '../utils/foundationCSS';

// ============================================================================
// Types
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FoundationData = Record<string, any> | undefined | null;

interface UseBrandCSSOptions {
  foundationData: FoundationData;
  theme: 'light' | 'dark';
  /**
   * Where the generated CSS lands:
   *   - 'global'  — wrap in `@layer brand { :root { ... } }` (app-wide)
   *   - 'scoped'  — wrap under a `[data-brand="…"]` selector (multi-brand preview)
   *   - 'none'    — return an empty string; caller does not intend to inject
   *
   * Defaults to `'none'` so that unmounting the hook is always safe.
   */
  injectionMode?: InjectionMode;
  decorations?: DecorationConfig[];
}

interface UseBrandCSSResult {
  cssContent: string | null;
  /**
   * The brand's resolved `ThemeConfig` — the same value the CSS engine
   * is consuming. Exposed so callers can plug it into
   * `<BrandFoundationProvider>` and let primitives like `<Surface>` call
   * brand-accurate engine resolvers (RFC-0003 Phase 1).
   *
   * `null` while the foundation data is loading or when no brand is in
   * scope (e.g. Storybook with no brand selected).
   */
  themeConfig: import('@oneui/shared/engine').ThemeConfig | null;
}

function mergeMaterialConfigWithFoundation(
  materialConfig: unknown,
  materialsFoundationConfig: unknown,
): unknown {
  const foundationConfig =
    materialsFoundationConfig
    && typeof materialsFoundationConfig === 'object'
    && !Array.isArray(materialsFoundationConfig)
      ? (materialsFoundationConfig as { activeMetals?: unknown; metallic?: unknown; materialAssignments?: unknown })
      : undefined;
  const foundationMetallic = foundationConfig?.metallic;
  const activeMetals = foundationConfig?.activeMetals;
  const materialAssignments = foundationConfig?.materialAssignments;

  if (!foundationMetallic && !activeMetals && !materialAssignments) return materialConfig;

  const mergedConfig: Record<string, unknown> = {
    ...(materialConfig && typeof materialConfig === 'object' && !Array.isArray(materialConfig)
      ? materialConfig
      : {}),
  };

  if (foundationMetallic) {
    // Foundation overrides are base-only: apply to each material's base variant
    // (index 0) while preserving every additional variant. Values are
    // re-validated downstream by normalizeMetallicMaterials at generation.
    const materials = normalizeMetallicMaterials(materialConfig);
    mergedConfig.metallic = Object.fromEntries(
      Object.entries(materials).map(([preset, material]) => {
        const override =
          foundationMetallic
          && typeof foundationMetallic === 'object'
          && !Array.isArray(foundationMetallic)
            ? (foundationMetallic as Record<string, unknown>)[preset]
            : undefined;
        const validOverride =
          override && typeof override === 'object' && !Array.isArray(override)
            ? (override as Record<string, unknown>)
            : undefined;
        if (!validOverride) return [preset, material];
        return [
          preset,
          {
            variants: material.variants.map((variant, index) =>
              index === 0 ? { ...variant, ...validOverride } : variant,
            ),
          },
        ];
      }),
    );
  }

  if (activeMetals && typeof activeMetals === 'object' && !Array.isArray(activeMetals)) {
    mergedConfig.activeMetals = activeMetals;
  }

  if (materialAssignments && typeof materialAssignments === 'object' && !Array.isArray(materialAssignments)) {
    mergedConfig.materialAssignments = materialAssignments;
  }

  return mergedConfig;
}

function getMaterialsFoundationConfig(foundationData: FoundationData): unknown {
  const materials = foundationData?.materials;
  if (!materials || typeof materials !== 'object' || Array.isArray(materials)) return undefined;
  return 'config' in materials
    ? (materials as { config?: unknown }).config
    : materials;
}

// ============================================================================
// Module-level LRU cache
//
// Each hook instance already memoizes via useMemo, but React's memo is scoped
// to a single component instance. An experience canvas with N sub-brand
// artboards still pays N full pipelines on first mount, and unmount/remount
// cycles (scrolling, theme toggle) pay the cost again.
//
// A small shared LRU flattens those repeat hits. Keys combine every input
// hash used by memo 2 so a cache hit is always semantically equivalent to
// running the pipeline — no correctness risk.
// ============================================================================

const BRAND_CSS_CACHE_LIMIT = 20;
const brandCSSCache = new Map<string, string>();

function getCachedCSS(key: string): string | undefined {
  const hit = brandCSSCache.get(key);
  if (hit === undefined) return undefined;
  // Move-to-front for LRU ordering
  brandCSSCache.delete(key);
  brandCSSCache.set(key, hit);
  return hit;
}

function setCachedCSS(key: string, value: string): void {
  if (brandCSSCache.has(key)) brandCSSCache.delete(key);
  brandCSSCache.set(key, value);
  while (brandCSSCache.size > BRAND_CSS_CACHE_LIMIT) {
    const oldest = brandCSSCache.keys().next().value;
    if (oldest === undefined) break;
    brandCSSCache.delete(oldest);
  }
}

/** Test-only: clear the module cache. Never call in production code. */
export function __clearBrandCSSCacheForTests(): void {
  brandCSSCache.clear();
}

// ============================================================================
// Hook
// ============================================================================

export function useBrandCSS({
  foundationData,
  theme,
  injectionMode,
  decorations,
}: UseBrandCSSOptions): UseBrandCSSResult {
  const resolvedMode: InjectionMode = injectionMode ?? 'none';

  const colorConfig = foundationData?.color?.config;
  const presetSelection = foundationData?.presetSelection;
  const appearanceConfig = foundationData?.appearanceConfig;
  const typographyConfig = foundationData?.typography?.config;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customFonts = foundationData?.customFonts as any;
  const motionConfig = foundationData?.motion?.config;
  const elevationConfig = foundationData?.elevation?.config;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridConfig = (foundationData as any)?.grid?.config;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gradientsConfig = (foundationData as any)?.gradients?.config;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawMaterialConfig = (foundationData as any)?.materialConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialsFoundationConfig = getMaterialsFoundationConfig(foundationData);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialConfig = useMemo(
    () => mergeMaterialConfigWithFoundation(
      rawMaterialConfig,
      materialsFoundationConfig,
    ),
    [rawMaterialConfig, materialsFoundationConfig],
  );

  // Convex hands down a freshly-allocated `foundationData` on every subscription
  // tick. Using the raw ref in `compositeCacheKey`'s deps would invalidate the
  // LRU on every render even when content is identical; using it in the per-
  // section hash deps adds noise without changing their string output. Reduce
  // to a primitive presence bit; the sub-field deps already carry the content.
  const hasFoundation = foundationData != null;

  // Stable hash of color + appearance inputs
  const colorHash = useMemo(
    () => hasFoundation ? computeInputHash(colorConfig, appearanceConfig) : null,
    [hasFoundation, colorConfig, appearanceConfig],
  );
  const paletteHash = useMemo(
    () => colorHash ? `${colorHash}:${JSON.stringify(presetSelection ?? null)}` : null,
    [colorHash, presetSelection],
  );

  // Top-level V2 typography fallback. Some brands store the V2 config at
  // `foundationData.typographyV2` instead of nested under `typography.config`.
  // It must feed into both the cache hash and every downstream V2 read.
  const topLevelTypographyV2 = (foundationData as { typographyV2?: unknown } | null | undefined)?.typographyV2;

  // Stable hash for typography
  const typographyHash = useMemo(
    () => hasFoundation
      ? computeInputHash(null, null, typographyConfig)
        + ':' + JSON.stringify(topLevelTypographyV2 ?? null)
        + ':' + JSON.stringify(customFonts ?? null)
      : null,
    [hasFoundation, typographyConfig, topLevelTypographyV2, customFonts],
  );

  // Stable hash for motion
  const motionHash = useMemo(
    () => hasFoundation ? computeMotionFingerprint(motionConfig) : null,
    [hasFoundation, motionConfig],
  );

  // Stable hash for elevation config — only the two fields that affect CSS
  // output (levels geometry is recomputed from the canonical formula).
  const elevationHash = useMemo(
    () => (elevationConfig
      ? `${elevationConfig.baseOpacity}:${elevationConfig.darkModeMultiplier}`
      : ''),
    [elevationConfig],
  );

  // Stable hash for grid config
  const gridHash = useMemo(
    () => (gridConfig ? JSON.stringify(gridConfig) : ''),
    [gridConfig],
  );

  // Stable hash for gradients config
  const gradientsHash = useMemo(
    () => (gradientsConfig ? JSON.stringify(gradientsConfig) : ''),
    [gradientsConfig],
  );

  // Stable hash for material effects config
  const materialHash = useMemo(
    () => (materialConfig ? JSON.stringify(materialConfig) : ''),
    [materialConfig],
  );

  // Stable hash for decorations
  const decorationsHash = useMemo(
    () => decorations?.length ? JSON.stringify(decorations) : '',
    [decorations],
  );

  // Memo 1 (theme-independent): Build color scales → NewPaletteData
  const paletteData = useMemo(() => {
    if (!hasFoundation) return null;
    const availableScales = buildAvailableScales(colorConfig, presetSelection);
    return buildNewPaletteData(availableScales, appearanceConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteHash]);

  // Composite cache key — only identical foundation inputs share a cache slot.
  // NOTE: foundationData is intentionally NOT a dep — it churns reference on
  // every Convex tick. The per-section hashes are the complete fingerprint.
  const compositeCacheKey = useMemo(() => {
    if (!hasFoundation || resolvedMode === 'none') return null;
    if (!paletteHash || !typographyHash || motionHash === null) return null;
    return [
      resolvedMode,
      theme,
      paletteHash,
      typographyHash,
      motionHash,
      elevationHash,
      gridHash,
      gradientsHash,
      materialHash,
      decorationsHash,
    ].join('|');
  }, [hasFoundation, resolvedMode, theme, paletteHash, typographyHash, motionHash, elevationHash, gridHash, gradientsHash, materialHash, decorationsHash]);

  // Memo 2 (theme-dependent): Surface CSS + typography + motion → validated + wrapped
  const cssContent = useMemo((): string | null => {
    if (resolvedMode === 'none') return '';
    if (!hasFoundation) return null;

    // Module cache hit: skip the entire pipeline. Result is byte-identical.
    if (compositeCacheKey) {
      const cached = getCachedCSS(compositeCacheKey);
      if (cached !== undefined) return cached;
    }

    // 1. Surface root CSS (new algorithm)
    const surfaceCSS = paletteData
      ? generateNewRootCSS(paletteData, theme)
      : '';

    // 1b. Surface context CSS ([data-surface] remapping blocks).
    // Legacy depth-1 path — kept for halo-gap and focus-outline emission
    // and as a fallback for components still keyed on data-surface mode.
    const surfaceContextCSS = paletteData
      ? generateNewContextCSS(paletteData, theme)
      : '';

    // 1b''. Step-keyed surface lookup ([data-surface-step="N"]) — RFC-0003.
    // Only the dynamic slice (Primary, Secondary, Tertiary, Quaternary,
    // Sparkle, Brand-Bg, Surface, Text) flows through this per-brand
    // injection path; the brand-invariant slice (Neutral, Positive,
    // Negative, Warning, Informative, Border) is hoisted to a shared
    // <style id="oneui-static-step-tokens"> by the useInsertionEffect at
    // the bottom of this hook, written once and never replaced on brand
    // switch. ~40% smaller injection per brand load —
    // see `surface_lookup_css_optimization_architecture.md` §Static/Dynamic.
    // Theme-agnostic: contains both light + dark, with [data-mode] overlay
    // blocks for per-role *-Default tokens.
    const surfaceStepLookupCSS = paletteData
      ? generateNewStepLookupCSSSplit(paletteData).dynamicCSS
      : '';

    // 1b'. Context boundary CSS ([data-context-boundary] reset block).
    // Inverse of the surface cascade: re-pins every role's tokens to their
    // root-only Fill-* equivalents so a component can opt children out of
    // surface adaptation (e.g. CounterBadge / IndicatorBadge inside a Badge
    // slot keep their own role colour). Theme-independent.
    const contextBoundaryCSS = paletteData
      ? generateNewContextBoundaryCSS(paletteData)
      : '';

    // 1b''''. Per-appearance content redirect (RFC-0003 Item D).
    // [data-appearance="<role>"] blocks remap --Text-* aliases to the
    // active role's content tokens. Theme-independent. Once-per-role
    // (~3 KB total). Emitted AFTER step lookup so descendants reading
    // --Text-High inside an appearance="secondary" Surface get
    // secondary's content at the surface step, not primary's.
    const appearanceRedirectCSS = paletteData
      ? generateNewAppearanceRedirectCSS(paletteData)
      : '';

    // 1c. Transparent material CSS ([data-material="transparent"] blocks)
    const transparentMaterialCSS = paletteData
      ? generateNewTransparentCSS(paletteData, theme)
      : '';

    // 2. Typography CSS (V2 or V1 auto-detect — unchanged from V4 hook)
    // V2 config may live nested under typography.config or top-level on foundationData.
    const resolvedTypographyV2 = typographyConfig?.typographyV2 ?? topLevelTypographyV2;
    // Merged shape every V2-aware generator expects (typography CSS + Google Font imports).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mergedTypographyConfig: any = resolvedTypographyV2 || typographyConfig
      ? { ...(typographyConfig ?? {}), typographyV2: resolvedTypographyV2 }
      : null;
    const typographyCSS = resolvedTypographyV2
      ? generateTypographyFontCSSV2(mergedTypographyConfig, customFonts)
      : generateTypographyFontCSS(typographyConfig as any, customFonts);

    // 3. Ornament CSS
    let ornamentCSS = '';
    if (decorations?.length) {
      const declarations: string[] = [];
      for (const d of decorations) {
        const props = generateOrnamentCSSProperties(
          d.componentName, d.svgContent, d.aspectRatio, d.mirror, d.placement
        );
        for (const [prop, value] of Object.entries(props)) {
          declarations.push(`${prop}: ${value};`);
        }
      }
      ornamentCSS = declarations.join('\n  ');
    }

    // 4. Motion CSS
    const motionCSS = generateMotionCSS(motionConfig ?? null);

    // 4a. Elevation CSS (--Elevation-0..5 overrides; '' when unconfigured so
    // the static primitives.css fallbacks stay active)
    const elevationCSS = generateElevationCSS(elevationConfig ?? null, theme);

    // 4b. Material effect CSS
    const materialCSS = generateMetallicMaterialCSS(materialConfig ?? null);
    const materialAssignmentCSS = generateMaterialAssignmentCSS(appearanceConfig ?? null, materialConfig ?? null);

    // 4c. Logo color override (single declaration, theme-independent)
    const logoCSS = paletteData?.logoCSS ?? '';

    // 4d. Gradient CSS (--Gradient-{n} fills + --Gradient-{n}-On on-colors;
    // '' when the brand has no gradients configured). Flat brand-level tokens,
    // theme-independent — no [data-surface] remapping.
    const gradientCSS = generateGradientCSS(gradientsConfig ?? null);

    const rawCSS = [typographyCSS, surfaceCSS, ornamentCSS, motionCSS, elevationCSS, materialCSS, materialAssignmentCSS, logoCSS, gradientCSS].filter(Boolean).join('\n  ');
    if (!rawCSS) return '';

    // 5. Validate root CSS
    //    Hot path gets the O(n) signature check only — full structural
    //    validation (required tokens, duplicates, invalid values, interdeps)
    //    runs in dev mode and in the server-side precompute/CI paths.
    //    Moving the full validator off the hot path protects the <5ms p95
    //    envelope when brands, sub-brands, and theme toggles multiply work.
    const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

    const signature = validateBrandCSSSignature(rawCSS);
    if (!signature.valid) {
      if (isDev) {
        const reasonDetail = signature.missingToken
          ? `${signature.reason} (${signature.missingToken})`
          : signature.reason ?? 'unknown';
        console.warn(`[useBrandCSS] Signature check failed — ${reasonDetail}`);
      }
      return '';
    }

    if (isDev) {
      const validation = validateBrandCSS(rawCSS);
      if (!validation.valid) {
        const details: string[] = [];
        if (validation.missing.length) details.push(`missing: ${validation.missing.join(', ')}`);
        if (validation.duplicates.length) details.push(`duplicates: ${validation.duplicates.join(', ')}`);
        if (validation.invalidValues.length) details.push(`invalid values: ${validation.invalidValues.length}`);
        if (validation.interdependencyViolations.length) details.push(`interdependency: ${validation.interdependencyViolations.join('; ')}`);
        console.warn(
          `[useBrandCSS] Full validation failed (${validation.tokenCount} tokens) —`,
          details.join(' | '),
        );
        // Signature passed so we still inject — surface structural issues as
        // developer warnings rather than failing the render.
      }

      // 6. Validate surface context CSS (warn only, dev-only)
      if (surfaceContextCSS) {
        const contextValidation = validateSurfaceContextCSS(surfaceContextCSS);
        if (!contextValidation.valid) {
          console.warn(
            `[useBrandCSS] Surface context CSS has disallowed tokens:`,
            contextValidation.disallowedTokens,
          );
        }
      }
    }

    // 7. Font rendering quality block (global `html { ... }`, only when brand opts in)
    const renderingCSS = resolvedTypographyV2 ? generateFontRenderingCSS(resolvedTypographyV2) : '';

    // 8. Script-context typography blocks (`[data-script]` and `:lang(...)`)
    const typographyScriptCSS = resolvedTypographyV2
      ? generateTypographyScriptContextCSS(resolvedTypographyV2)
      : '';

    // 9. Grid CSS (per-platform --Grid-Columns + --Grid-MaxWidth overrides)
    const gridCSS = generateGridCSS(gridConfig ?? null);

    // Compose additional blocks (surface context + boundary + transparent
    // material + rendering + grid) for wrapCSSForInjection. The boundary
    // block follows the surface-context blocks so its declarations win
    // when an element carries both `data-surface` and `data-context-boundary`
    // (which is the explicit "ignore the outer surface" intent).
    // Order matters: surfaceStepLookupCSS comes AFTER surfaceContextCSS so
    // step-keyed declarations override mode-keyed ones at depth ≥ 2 (equal
    // specificity, later source order wins). contextBoundaryCSS comes after
    // both so an explicit data-context-boundary still defeats the cascade.
    const additionalBlocks = [
      surfaceContextCSS,
      surfaceStepLookupCSS,
      appearanceRedirectCSS,
      contextBoundaryCSS,
      transparentMaterialCSS,
      renderingCSS,
      typographyScriptCSS,
      gridCSS,
    ].filter(Boolean).join('\n');

    const wrapped = wrapCSSForInjection(rawCSS, resolvedMode, additionalBlocks || undefined);

    // Prepend @import for any Google Fonts so the fetch starts at CSS-injection
    // time (useInsertionEffect), not via the deferred <link> in useGoogleFonts.
    // See generateGoogleFontImports JSDoc for the race condition this fixes.
    const googleFontImports = generateGoogleFontImports(mergedTypographyConfig);
    const finalCSS = googleFontImports ? `${googleFontImports}\n${wrapped}` : wrapped;

    if (compositeCacheKey) setCachedCSS(compositeCacheKey, finalCSS);
    return finalCSS;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteData, typographyHash, motionHash, elevationHash, gridHash, gradientsHash, materialHash, decorationsHash, theme, resolvedMode, compositeCacheKey]);

  // Static (brand-invariant) step-lookup slice — Neutral / Positive /
  // Negative / Warning / Informative / Border. Same output across all
  // brands, so it can live in a shared <style> element written once per
  // session and survive every brand switch unchanged. Engine WeakMap
  // already caches by themeConfig identity → recomputing per-render is a
  // hash lookup, not a real recompute.
  const staticStepLookupCSS = useMemo(() => {
    if (!paletteData) return '';
    return generateNewStepLookupCSSSplit(paletteData).staticCSS;
  }, [paletteData]);

  // Inject the static slice into <style id="oneui-static-step-tokens">.
  // Idempotent on content — if multiple hook instances mount (e.g. nested
  // sub-brand decorators) they all converge on the same string, so the
  // textContent check elides redundant writes. Wrapped in `@layer brand`
  // to win the cascade against base/semantic/density layers, matching the
  // dynamic slice's layer placement (wrapCSSForInjection does the same).
  useInsertionEffect(() => {
    if (typeof document === 'undefined' || !staticStepLookupCSS) return;
    const wrapped = `@layer brand {\n${staticStepLookupCSS}\n}`;
    let el = document.getElementById(
      'oneui-static-step-tokens',
    ) as HTMLStyleElement | null;
    if (el && el.textContent === wrapped) return;
    if (!el) {
      el = document.createElement('style');
      el.id = 'oneui-static-step-tokens';
      document.head.appendChild(el);
    }
    el.textContent = wrapped;
  }, [staticStepLookupCSS]);

  // Expose the resolved themeConfig so callers can populate
  // <BrandFoundationProvider> and let primitives like <Surface> use
  // brand-accurate engine resolvers. `null` when foundation isn't loaded.
  const themeConfig = paletteData?.themeConfig ?? null;

  return { cssContent, themeConfig };
}
