/**
 * FoundationStyleProvider.tsx
 *
 * Bridges foundation settings (stored in Convex) to live CSS custom properties.
 * When a foundation setting changes, the generated <style> tag updates and
 * components that read var(--Token-Name) reflect the change in real-time.
 *
 * Zero-flicker brand switching:
 *   1. useInsertionEffect injects CSS before ANY DOM mutations
 *   2. previousCSSRef bridge holds old CSS while Convex loads new data (no blank frames)
 *   3. data-brand-switching attribute blocks CSS transitions for one frame
 *
 * Architecture:
 *   Foundation Editor → Convex DB → useQuery subscription → useBrandCSS → <style> injection
 */

'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { useBrandCSS } from '@oneui/ui/hooks/useBrandCSS';
import { DecorationProvider } from '@oneui/ui/hooks/useDecorationContext';
import { BrandFoundationProvider } from '@oneui/ui/contexts/BrandFoundationContext';
import {
  MaterialFoundationProvider,
  normalizeMaterialFoundationConfig,
  type MaterialFoundationDefaults,
} from '@oneui/ui/contexts/MaterialFoundationContext';
import type { InjectionMode } from '@oneui/ui/engine';
import type { DecorationConfig, PlatformsFoundationConfig } from '@oneui/shared';
import { generateDimensionCSS, migrateLegacyPlatformsConfig } from '@oneui/shared';
import { useStyleInjection } from '@oneui/ui/hooks/useStyleInjection';
import { useBrandFonts } from '@oneui/ui/hooks/useBrandFonts';
import { buildAllComponentCSS } from '@oneui/ui/utils/buildComponentOverrideCSS';
import { usePlatformContext, type SubBrandConfig } from '@/contexts/PlatformContext';
import { applySubBrandAccentsToFoundation } from '@oneui/shared';
import { RIBBON_ALIAS_SOURCES } from '@/design-tools/JioRibbon';
import { perfMark } from '@/lib/perfMarks';

// ============================================================================
// Foundation Data Context (eliminates duplicate subscription in layout.tsx)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FoundationDataType = Record<string, any> | undefined | null;

const FoundationDataContext = createContext<FoundationDataType>(undefined);

/**
 * Read the foundation data already fetched by FoundationStyleProvider.
 * Avoids a duplicate useQuery(getBrandOverviewData) subscription.
 */
export function useFoundationData(): FoundationDataType {
  return useContext(FoundationDataContext);
}

function applySubBrandAccents(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseData: Record<string, any> | undefined | null,
  currentSubBrand: SubBrandConfig | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> | undefined | null {
  return applySubBrandAccentsToFoundation(baseData, currentSubBrand);
}

// ============================================================================
// Component
// ============================================================================

/**
 * FoundationStyleBridge reads PlatformContext and renders the style provider.
 * This component must be placed inside PlatformProvider.
 */
// fallow-ignore-next-line complexity
export function FoundationStyleBridge({ children }: { children: React.ReactNode }) {
  const { currentBrand, theme, platformBrandId, currentSubBrand } = usePlatformContext();

  // One-time synchronous read of cached brand ID to eliminate query waterfall.
  // useRef initializer runs once per mount — safe in SSR (window check) and HMR.
  const cachedBrandId = useRef<string | undefined>(
    typeof window !== 'undefined'
      ? localStorage.getItem('oneui-studio:last-brand-id') ?? undefined
      : undefined
  );

  // Use real brandId when available, fall back to cached ID to start query immediately
  const editingBrandId = (currentBrand?.id ?? cachedBrandId.current) as Id<'brands'> | undefined;

  // Brand CSS is always the active editing brand. Fall back to the platform
  // brand only while the active brand is still resolving on a cold load.
  const injectionBrandId = editingBrandId ?? (platformBrandId as Id<'brands'> | undefined);

  return (
    <FoundationStyleProvider
      brandId={editingBrandId}
      injectionBrandId={injectionBrandId}
      theme={theme}
      injectionMode="global"
      platformBrandId={platformBrandId as Id<'brands'> | undefined}
      currentSubBrand={currentSubBrand}
    >
      {children}
    </FoundationStyleProvider>
  );
}

interface FoundationStyleProviderProps {
  /** The brand being edited — exposed via FoundationDataContext for editor pages */
  brandId: Id<'brands'> | undefined;
  /** The brand whose surface/typography CSS is injected globally */
  injectionBrandId: Id<'brands'> | undefined;
  theme: 'light' | 'dark';
  /** CSS injection mode: 'global' (full app) or 'scoped' (preview panels) */
  injectionMode: InjectionMode;
  /** The platform brand whose dimension CSS + fonts are always applied to the tool UI */
  platformBrandId: Id<'brands'> | undefined;
  /** Active sub-brand — overrides appearance (primary/secondary/sparkle/brand-bg) in CSS injection */
  currentSubBrand: SubBrandConfig | null;
  children: React.ReactNode;
}

/** localStorage key for cached brand CSS */
const BRAND_CSS_CACHE_KEY = 'oneui-studio:brand-css';
const BRAND_CSS_META_KEY = 'oneui-studio:brand-css-meta';

/** Singleton style element ID — same ID used by the blocking script in layout.tsx */
const STYLE_ELEMENT_ID = 'oneui-foundation-tokens';
/** Separate style element for dimension overrides (always active, independent of theme scope) */
const DIMENSION_STYLE_ID = 'oneui-dimension-overrides';
/** Style element for component token overrides (follows the active global theme brand) */
const COMPONENT_OVERRIDE_STYLE_ID = 'oneui-component-overrides';

/**
 * Bridge between useBrandCSS's tri-state return and the style-injection effect.
 *
 * useBrandCSS returns:
 *   null   → data loading; hold previous CSS so the style tag never blanks.
 *   ''     → intentional clear when injectionMode='none'. Otherwise a transient
 *            pathological return (signature failure, empty rawCSS) that MUST
 *            also hold previous — committing '' to the ref turns the bridge
 *            into a one-way valve where every subsequent null tick collapses
 *            to '', permanently clearing the cascade until a fresh real CSS
 *            string arrives. (Reproduces as "brand theme reverts to default"
 *            on Vercel after left-nav clicks.)
 *   string → real CSS; inject and advance the bridge.
 *
 * Initializes from existing DOM content so the blocking script's pre-injected
 * CSS is preserved across React mount.
 */
// fallow-ignore-next-line complexity
function useBrandCSSBridge(cssContent: string | null, injectionMode: InjectionMode): string {
  const previousCSSRef = useRef<string>(
    typeof document !== 'undefined'
      ? (document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null)?.textContent ?? ''
      : ''
  );
  const shouldHoldPrevious = shouldHoldPreviousFoundation(cssContent, injectionMode);
  useEffect(() => {
    if (shouldHoldPrevious) return;
    previousCSSRef.current = cssContent ?? '';
  }, [cssContent, shouldHoldPrevious]);
  return shouldHoldPrevious ? previousCSSRef.current : (cssContent ?? '');
}

function shouldHoldPreviousFoundation(
  cssContent: string | null,
  injectionMode: InjectionMode,
): boolean {
  const isIntentionalClear = injectionMode === 'none';
  return cssContent === null || (cssContent === '' && !isIntentionalClear);
}

function useMaterialFoundationBridge(
  config: MaterialFoundationDefaults,
  shouldHoldPrevious: boolean,
): MaterialFoundationDefaults {
  const previousConfigRef = useRef<MaterialFoundationDefaults>(config);
  useEffect(() => {
    if (shouldHoldPrevious) return;
    previousConfigRef.current = config;
  }, [config, shouldHoldPrevious]);
  return shouldHoldPrevious ? previousConfigRef.current : config;
}

// fallow-ignore-next-line complexity
export function FoundationStyleProvider({ brandId, injectionBrandId, theme, injectionMode, platformBrandId, currentSubBrand, children }: FoundationStyleProviderProps) {

  // Editing brand subscription — exposed to editor pages via FoundationDataContext
  const editingFoundationData = useQuery(
    api.foundations.getBrandOverviewData,
    brandId ? { brandId } : 'skip'
  );

  // Injection brand subscription — drives surface/typography CSS.
  // When injectionBrandId === brandId, Convex deduplicates automatically (no extra cost).
  const injectionFoundationData = useQuery(
    api.foundations.getBrandOverviewData,
    injectionBrandId ? { brandId: injectionBrandId } : 'skip'
  );

  const foundationData = useMemo(
    () => applySubBrandAccents(injectionFoundationData, currentSubBrand),
    [injectionFoundationData, currentSubBrand],
  );

  // Injection brand decorations — used for CSS generation (ornament CSS vars in @layer brand).
  const injectionDecorations: DecorationConfig[] | undefined = foundationData?.decorations as DecorationConfig[] | undefined;
  const rawMaterialFoundationConfig = useMemo(
    () => normalizeMaterialFoundationConfig(foundationData?.materials?.config),
    [foundationData?.materials?.config],
  );

  // Editing brand decorations — used for DecorationProvider context so the
  // AdvancedEditor can detect per-component ornament assignments and show controls.
  const editingDecorations: DecorationConfig[] | undefined = editingFoundationData?.decorations as DecorationConfig[] | undefined;

  // Shared hook: transforms foundation data → CSS declarations.
  // Returns null while data is loading (keep previous CSS), '' for intentional empty.
  // themeConfig is the resolved scale data the engine consumed — forwarded
  // via BrandFoundationProvider so primitives like <Surface> can call the
  // brand-accurate engine resolvers (RFC-0003 Phase 1).
  const { cssContent, themeConfig } = useBrandCSS({ foundationData, theme, injectionMode, decorations: injectionDecorations });

  const effectiveCSS = useBrandCSSBridge(cssContent, injectionMode);
  const materialFoundationConfig = useMaterialFoundationBridge(
    rawMaterialFoundationConfig,
    shouldHoldPreviousFoundation(cssContent, injectionMode),
  );

  // ---- CSS Injection (shared hook: useInsertionEffect + transition blocking + brand-ready signal) ----
  useStyleInjection(STYLE_ELEMENT_ID, effectiveCSS);

  // Startup timing — dev-only, records first availability of each CSS layer.
  useEffect(() => {
    if (effectiveCSS) perfMark('foundation-css');
  }, [effectiveCSS]);

  // ---- JioRibbon colour aliases ----
  // Mirror --{Role}-Bold values under --JioRibbon-color{N} so the ribbon
  // reacts to brand/sub-brand changes but is immune to [data-surface] remapping
  // (only standard role prefixes are in the surface token allowlist).
  // fallow-ignore-next-line complexity
  const ribbonAliasCSS = useMemo(() => {
    if (!effectiveCSS) return '';
    const decls: string[] = [];
    for (const { alias, pattern } of RIBBON_ALIAS_SOURCES) {
      const m = effectiveCSS.match(pattern);
      if (m) decls.push(`${alias}: ${m[1].trim()};`);
    }
    if (decls.length === 0) return '';
    return `@layer brand { :root { ${decls.join(' ')} } }`;
  }, [effectiveCSS]);
  useStyleInjection('oneui-ribbon-aliases', ribbonAliasCSS);

  // ---- localStorage Cache ----
  // Cache brand CSS for instant restoration on next page load.
  const lastCachedRef = useRef('');
  // fallow-ignore-next-line complexity
  useEffect(() => {
    // null means data is loading — don't touch the cache yet
    if (cssContent === null) return;
    try {
      if (cssContent && cssContent !== lastCachedRef.current) {
        localStorage.setItem(BRAND_CSS_CACHE_KEY, cssContent);
        localStorage.setItem(BRAND_CSS_META_KEY, JSON.stringify({
          brandId: brandId ?? '',
          injectionBrandId: injectionBrandId ?? '',
          theme,
          injectionMode,
          ts: Date.now(),
        }));
        lastCachedRef.current = cssContent;
      } else if (!cssContent && lastCachedRef.current) {
        // Brand deselected or mode switched to 'none' — clear cache
        localStorage.removeItem(BRAND_CSS_CACHE_KEY);
        localStorage.removeItem(BRAND_CSS_META_KEY);
        lastCachedRef.current = '';
      }
    } catch {
      // localStorage not available — no caching
    }
  }, [cssContent, brandId, injectionBrandId, theme, injectionMode]);

  // ---- Platform Brand Subscription (always active) ----
  // Only fetches the `platforms` foundation (1 indexed DB read) instead of the
  // full getBrandOverviewData (8+ reads). All we need here is the dimension config.
  const platformPlatformsFoundation = useQuery(
    api.foundations.getByType,
    platformBrandId ? { brandId: platformBrandId, type: 'platforms' as const } : 'skip'
  );

  // ---- Platform Brand Dimension CSS (always active) ----
  const platformPlatformsConfigRaw = platformPlatformsFoundation?.config as PlatformsFoundationConfig | undefined;
  const platformPlatformsConfig = useMemo(
    () => platformPlatformsConfigRaw?.platforms
      ? migrateLegacyPlatformsConfig(platformPlatformsConfigRaw)
      : platformPlatformsConfigRaw,
    [platformPlatformsConfigRaw],
  );
  // Compact hash of only the fields that affect dimension CSS — avoids recomputation
  // on every Convex heartbeat where the object reference changes but values are identical.
  const platformDimensionHash = useMemo(() => {
    if (!platformPlatformsConfig?.platforms?.length) return '';
    return JSON.stringify(
      platformPlatformsConfig.platforms.map(p => ({
        e: p.isEnabled,
        d: p.densityConfigs?.map(dc => ({ n: dc.density, m: dc.mobile?.baseSize, dk: dc.desktop?.baseSize })),
        b: p.breakpoints?.filter(bp => bp.isActive).map(bp => bp.viewportWidth),
      }))
    );
  }, [platformPlatformsConfig]);
  const dimensionCSS = useMemo(() => {
    if (!platformDimensionHash || !platformPlatformsConfig) return '';
    const blocks = generateDimensionCSS(platformPlatformsConfig);
    if (!blocks) return '';
    // @layer brand: overrides @layer base (scale.css static values)
    return `@layer brand {\n${blocks}\n}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformDimensionHash]);
  useStyleInjection(DIMENSION_STYLE_ID, dimensionCSS);

  // ---- Component Token Overrides (active theme brand) ----
  // Component tokens = association between CSS vars (--Button-*) and foundation tokens.
  // Source of truth: Convex overrides win, manifest defaults fill gaps.
  // This ensures ALL Button properties are always bound to a foundation token.
  //
  // The active brand drives component shape, recipe, and manual token choices.
  const componentOverrideBrandId = injectionBrandId;
  const componentData = useQuery(
    api.componentTokenOverrides.getAllBrandComponentData,
    componentOverrideBrandId ? { brandId: componentOverrideBrandId } : 'skip'
  );

  /** Slug/name for retail geometry patches (e.g. Tira capsule Buttons) aligned with nativeTheme. */
  const injectionBrandMeta = useQuery(api.brands.get, injectionBrandId ? { id: injectionBrandId } : 'skip');

  const componentOverrideCSS = useMemo(() => {
    if (!componentData) return '';
    return (
      buildAllComponentCSS(componentData, {
        brandSlug: injectionBrandMeta?.slug ?? null,
        brandName: injectionBrandMeta?.name ?? null,
      }) || ''
    );
  }, [componentData, injectionBrandMeta?.slug, injectionBrandMeta?.name]);
  useStyleInjection(COMPONENT_OVERRIDE_STYLE_ID, componentOverrideCSS);
  useEffect(() => {
    if (componentOverrideCSS) perfMark('component-override-css');
  }, [componentOverrideCSS]);

  // Load fonts for the active brand CSS injected globally.
  useBrandFonts(foundationData ?? null);

  // Build decoration map for component context.
  // Editors configure decorations for the active editing brand; the same brand
  // now drives the global CSS injection path.
  const decorationMap = useMemo(() => {
    const map = new Map<string, DecorationConfig>();
    if (editingDecorations) {
      for (const d of editingDecorations) {
        map.set(d.componentName, d);
      }
    }
    return map;
  }, [editingDecorations]);

  // IMPORTANT: return `undefined` (not `null`) when the query is still loading or skipped.
  // The preloader in (platform)/layout.tsx checks `foundationData === undefined` to gate
  // app-ready — returning `null` collapses the distinction between "loading" and "no data",
  // causing the preloader to fire before brand CSS is injected (visually: unstyled flash).
  const contextData = useMemo(
    () => editingFoundationData === undefined
      ? undefined
      : applySubBrandAccents(editingFoundationData ?? null, currentSubBrand),
    [editingFoundationData, currentSubBrand],
  );

  return (
    <FoundationDataContext.Provider value={contextData}>
      <MaterialFoundationProvider value={materialFoundationConfig}>
        <BrandFoundationProvider value={themeConfig}>
          <DecorationProvider decorations={decorationMap}>
            {children}
          </DecorationProvider>
        </BrandFoundationProvider>
      </MaterialFoundationProvider>
    </FoundationDataContext.Provider>
  );
}
