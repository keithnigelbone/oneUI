/**
 * BrandStyleInjector.tsx
 *
 * Preview-side component that queries Convex for a brand's foundation data
 * AND component-level customizations (recipe selections + token overrides),
 * injecting both as dynamic CSS via <style> tags.
 *
 * Foundation tokens: surfaces, typography, colors (via useBrandCSS)
 * Component tokens: recipe-resolved + manual overrides (via ComponentOverrideInjector)
 *
 * This ensures Storybook is the source of truth for designers — matching
 * exactly what the platform app produces for any given brand.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { useBrandCSS } from '@oneui/ui/hooks/useBrandCSS';
import { DecorationProvider } from '@oneui/ui/hooks/useDecorationContext';
import { BrandLogoContext } from '@oneui/ui/contexts/BrandLogoContext';
import { BrandFoundationProvider } from '@oneui/ui/contexts/BrandFoundationContext';
import type { DecorationConfig, PlatformsFoundationConfig, SubBrandAccentFields } from '@oneui/shared';
import { generateDimensionCSS, applySubBrandAccentsToFoundation } from '@oneui/shared';
import { useStyleInjection } from '@oneui/ui/hooks/useStyleInjection';
import { useBrandFonts } from '@oneui/ui/hooks/useBrandFonts';
import { buildAllComponentCSS, type ComponentOverrideData } from '@oneui/ui/utils/buildComponentOverrideCSS';

const STORYBOOK_STYLE_ID = 'storybook-brand-tokens';
const DIMENSION_STYLE_ID = 'storybook-dimension-tokens';

export function BrandStyleInjector({
  brandId,
  themeVariantId,
  mode = 'light',
  children,
}: {
  brandId: string;
  /** Convex `subBrandConfigs` document id for the active theme variant. */
  themeVariantId?: string;
  mode?: 'light' | 'dark';
  children?: React.ReactNode;
}) {
  const typedBrandId = brandId as Id<'brands'>;

  // Single consolidated query — same as FoundationStyleProvider
  const baseFoundationData = useQuery(api.foundations.getBrandOverviewData, { brandId: typedBrandId });

  // Query brand data for logoSvg (exposed to stories via BrandLogoContext)
  const brandData = useQuery(api.brands.get, { id: typedBrandId });

  // Sub-brand ("sub-theme") config — overrides 4 accent roles (primary/secondary/
  // sparkle/brand-bg) while inheriting all other foundations from the parent brand.
  // Skipped when no sub-brand is selected. Mirrors FoundationStyleProvider.
  const themeVariant = useQuery(
    api.subBrandConfigs.getById,
    themeVariantId ? { id: themeVariantId as Id<'subBrandConfigs'> } : 'skip',
  );

  // Merge the selected sub-brand's accents into the parent foundation BEFORE
  // brand CSS generation, exactly as the platform's FoundationStyleProvider does.
  const foundationData = useMemo(
    () => applySubBrandAccentsToFoundation(baseFoundationData, (themeVariant ?? null) as SubBrandAccentFields | null),
    [baseFoundationData, themeVariant],
  );

  // Extract decoration configs from foundation overview data.
  // Cast placement from Convex string to the union type (validated at write time).
  const decorations: DecorationConfig[] | undefined = foundationData?.decorations as DecorationConfig[] | undefined;

  // Shared hook: null=loading (keep previous), ''=intentionally empty, string=new CSS.
  // themeConfig is the resolved scale data the engine consumed — we forward it
  // through BrandFoundationProvider so primitives like <Surface> can call the
  // brand-accurate engine resolvers (RFC-0003 Phase 1).
  const { cssContent, themeConfig } = useBrandCSS({ foundationData, theme: mode, injectionMode: 'global', decorations });

  // Bridge: hold previous CSS while new data loads so the style tag never goes blank.
  // Initialize from existing DOM content so any pre-injected CSS is preserved on mount.
  const previousCSSRef = useRef<string>(
    typeof document !== 'undefined'
      ? (document.getElementById(STORYBOOK_STYLE_ID) as HTMLStyleElement | null)?.textContent ?? ''
      : ''
  );
  const effectiveCSS = cssContent ?? previousCSSRef.current;
  useEffect(() => {
    if (cssContent !== null) previousCSSRef.current = cssContent;
  }, [cssContent]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (foundationData === undefined) return;
    if (!foundationData) {
      console.warn('[Storybook] No foundation data from Convex for brand', brandId);
      return;
    }
    if (!effectiveCSS) {
      console.warn('[Storybook] Brand CSS pipeline returned empty for', brandId);
      return;
    }
    if (!/--Secondary-Bold:/.test(effectiveCSS) && !/--Primary-Bold:/.test(effectiveCSS)) {
      console.warn('[Storybook] Injected CSS missing role Bold tokens — check foundations in Convex');
    }
  }, [brandId, foundationData, effectiveCSS]);

  // Shared hook: useInsertionEffect + transition blocking + brand-ready signal
  useStyleInjection(STORYBOOK_STYLE_ID, effectiveCSS);

  // ---- Brand Dimension CSS (mirrors FoundationStyleProvider) ----
  const platformsConfig = foundationData?.platforms?.config as PlatformsFoundationConfig | undefined;
  const dimensionCSS = useMemo(() => {
    if (!platformsConfig) return '';
    const blocks = generateDimensionCSS(platformsConfig);
    if (!blocks) return '';
    return `@layer brand {\n${blocks}\n}`;
  }, [platformsConfig]);
  useStyleInjection(DIMENSION_STYLE_ID, dimensionCSS);

  // Load brand fonts so typography CSS tokens resolve to actual downloaded fonts.
  useBrandFonts(foundationData);

  // Build decoration map for component context
  const decorationMap = useMemo(() => {
    const map = new Map<string, DecorationConfig>();
    if (decorations) {
      for (const d of decorations) {
        map.set(d.componentName, d);
      }
    }
    return map;
  }, [decorations]);

  // Provide brand logo data to stories via BrandLogoContext
  const brandLogoValue = useMemo(() => ({
    logoSvg: brandData?.logoSvg ?? undefined,
    brandName: brandData?.name ?? undefined,
  }), [brandData?.logoSvg, brandData?.name]);

  return (
    <BrandFoundationProvider value={themeConfig}>
      <BrandLogoContext.Provider value={brandLogoValue}>
        <DecorationProvider decorations={decorationMap}>
          <ComponentOverrideInjector
            brandId={typedBrandId}
            brandSlug={brandData?.slug}
            brandName={brandData?.name}
          />
          {children}
        </DecorationProvider>
      </BrandLogoContext.Provider>
    </BrandFoundationProvider>
  );
}

/**
 * Queries all component recipe selections and token overrides for a brand,
 * resolves them using the component registry, and injects the resulting
 * CSS custom properties via useStyleInjection (same useInsertionEffect phase
 * as foundation CSS, eliminating inter-frame lag).
 */
const COMPONENT_STYLE_ID = 'storybook-component-tokens';

function ComponentOverrideInjector({
  brandId,
  brandSlug,
  brandName,
}: {
  brandId: Id<'brands'>;
  brandSlug?: string;
  brandName?: string;
}) {
  const componentData = useQuery(
    api.componentTokenOverrides.getAllBrandComponentData,
    { brandId }
  );

  const cssContent = useMemo(() => {
    if (!componentData) return null;
    return (
      buildAllComponentCSS(componentData as ComponentOverrideData, {
        brandSlug: brandSlug ?? null,
        brandName: brandName ?? null,
      }) || ''
    );
  }, [componentData, brandSlug, brandName]);

  // Hold previous CSS during brand switch (same bridge pattern as BrandStyleInjector)
  const previousRef = useRef('');
  const effectiveCSS = cssContent ?? previousRef.current;
  useEffect(() => {
    if (cssContent !== null) previousRef.current = cssContent;
  }, [cssContent]);

  // Shared hook: useInsertionEffect + transition blocking (same phase as foundation CSS)
  useStyleInjection(COMPONENT_STYLE_ID, effectiveCSS);

  return null;
}
