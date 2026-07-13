'use client';

import { api } from '@oneui/convex';
import type { Doc, Id } from '@oneui/convex/_generated/dataModel';
import { generateDimensionCSS } from '@oneui/shared';
import type { DecorationConfig, IconFoundationConfig, IconSetId, PlatformsFoundationConfig } from '@oneui/shared';
import { BrandLogoContext } from '@oneui/ui/contexts/BrandLogoContext';
import { DecorationProvider } from '@oneui/ui/hooks/useDecorationContext';
import { useBrandCSS } from '@oneui/ui/hooks/useBrandCSS';
import { useBrandFonts } from '@oneui/ui/hooks/useBrandFonts';
import { useStyleInjection } from '@oneui/ui/hooks/useStyleInjection';
import { IconProvider } from '@oneui/ui/icons/IconContext';
import { buildAllComponentCSS, type ComponentOverrideData } from '@oneui/ui/utils/buildComponentOverrideCSS';
import { ConvexProvider, ConvexReactClient, useQuery } from 'convex/react';
import type { ComponentProps, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DocsBrandContext,
  type DocsBrandContextValue,
  type DocsBrandOption,
  type DocsDensity,
  type DocsTheme,
} from './DocsBrandContext';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

const FOUNDATION_STYLE_ID = 'oneui-foundation-tokens';
const DIMENSION_STYLE_ID = 'oneui-docs-dimension-tokens';
const COMPONENT_STYLE_ID = 'oneui-docs-component-tokens';
const BRAND_STORAGE_KEY = 'oneui-docs:brand-id';
const BRAND_CSS_STORAGE_KEY = 'oneui-docs:brand-css';
const THEME_STORAGE_KEY = 'oneui-docs:theme';
const DENSITY_STORAGE_KEY = 'oneui-docs:density';

const isTheme = (value: string | null): value is DocsTheme => value === 'light' || value === 'dark';
const isDensity = (value: string | null): value is DocsDensity =>
  value === 'compact' || value === 'default' || value === 'open';

function readInitialTheme(): DocsTheme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : 'light';
}

function readInitialDensity(): DocsDensity {
  if (typeof window === 'undefined') return 'default';
  const stored = window.localStorage.getItem(DENSITY_STORAGE_KEY);
  return isDensity(stored) ? stored : 'default';
}

export function DocsProviders({ children }: { children: ReactNode }) {
  if (!convexClient) {
    return <DocsBrandFallback>{children}</DocsBrandFallback>;
  }

  return (
    <ConvexProvider client={convexClient}>
      <LiveDocsBrandProvider>{children}</LiveDocsBrandProvider>
    </ConvexProvider>
  );
}

function DocsBrandFallback({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<DocsTheme>(readInitialTheme);
  const [density, setDensityState] = useState<DocsDensity>(readInitialDensity);

  useDocsRootAttributes(theme, density);

  const value = useMemo<DocsBrandContextValue>(
    () => ({
      brands: [],
      selectedBrandId: null,
      selectedBrandName: 'Base tokens',
      theme,
      density,
      hasConvex: false,
      isBrandReady: false,
      setSelectedBrandId: () => {},
      setTheme: setThemeState,
      setDensity: setDensityState,
    }),
    [density, theme],
  );

  return (
    <IconProvider iconSet="lucide" defaultSize="md">
      <DocsBrandContext.Provider value={value}>{children}</DocsBrandContext.Provider>
    </IconProvider>
  );
}

function LiveDocsBrandProvider({ children }: { children: ReactNode }) {
  const brands = useQuery(api.brands.list);
  const [selectedBrandId, setSelectedBrandIdState] = useState<string | null>(null);
  const [theme, setThemeState] = useState<DocsTheme>(readInitialTheme);
  const [density, setDensityState] = useState<DocsDensity>(readInitialDensity);

  const brandOptions = useMemo(() => {
    const brandDocuments = (brands ?? []) as Doc<'brands'>[];
    const activeBrands = brandDocuments.filter((brand) => brand.status !== 'deprecated');
    return activeBrands.map(toBrandOption);
  }, [brands]);

  useEffect(() => {
    if (brandOptions.length === 0 || selectedBrandId) return;

    const params = new URLSearchParams(window.location.search);
    const requestedBrand = params.get('brand');
    const storedBrandId = window.localStorage.getItem(BRAND_STORAGE_KEY);
    const byRequestedSlug = brandOptions.find((brand) => brand.slug === requestedBrand);
    const byStoredId = brandOptions.find((brand) => brand.id === storedBrandId);
    const jioBrand = brandOptions.find((brand) => brand.slug === 'jio');
    const nextBrand = byRequestedSlug ?? byStoredId ?? jioBrand ?? brandOptions[0];

    setSelectedBrandIdState(nextBrand.id);
  }, [brandOptions, selectedBrandId]);

  useDocsRootAttributes(theme, density);

  const selectedBrand = brandOptions.find((brand) => brand.id === selectedBrandId) ?? null;
  const typedBrandId = selectedBrandId as Id<'brands'> | null;
  const foundationData = useQuery(
    api.foundations.getBrandOverviewData,
    typedBrandId ? { brandId: typedBrandId } : 'skip',
  );
  const brandData = useQuery(api.brands.get, typedBrandId ? { id: typedBrandId } : 'skip');
  const componentData = useQuery(
    api.componentTokenOverrides.getAllBrandComponentData,
    typedBrandId ? { brandId: typedBrandId } : 'skip',
  );
  const iconsConfig = foundationData?.icons?.config as IconFoundationConfig | undefined;
  const docsIconSet = resolveDocsIconSet(iconsConfig?.selectedSet);

  const decorations = foundationData?.decorations as DecorationConfig[] | undefined;
  const { cssContent } = useBrandCSS({
    foundationData: foundationData as Record<string, unknown> | null | undefined,
    theme,
    injectionMode: 'global',
    decorations,
  });
  const effectiveBrandCSS = usePreviousWhileLoading(cssContent, FOUNDATION_STYLE_ID);
  useStyleInjection(FOUNDATION_STYLE_ID, effectiveBrandCSS);

  useEffect(() => {
    if (cssContent !== null) {
      window.localStorage.setItem(BRAND_CSS_STORAGE_KEY, cssContent);
    }
  }, [cssContent]);

  const platformsConfig = foundationData?.platforms?.config as PlatformsFoundationConfig | undefined;
  const dimensionCSS = useMemo(() => {
    if (!platformsConfig) return '';
    const blocks = generateDimensionCSS(platformsConfig);
    return blocks ? `@layer brand {\n${blocks}\n}` : '';
  }, [platformsConfig]);
  useStyleInjection(DIMENSION_STYLE_ID, dimensionCSS);

  const componentCSS = useMemo(() => {
    if (!componentData) return null;
    return buildAllComponentCSS(componentData as ComponentOverrideData) || '';
  }, [componentData]);
  const effectiveComponentCSS = usePreviousWhileLoading(componentCSS, COMPONENT_STYLE_ID);
  useStyleInjection(COMPONENT_STYLE_ID, effectiveComponentCSS);

  useBrandFonts(foundationData);

  const decorationMap = useMemo(() => {
    const map = new Map<string, DecorationConfig>();
    for (const decoration of decorations ?? []) {
      map.set(decoration.componentName, decoration);
    }
    return map;
  }, [decorations]);

  const brandLogoValue = useMemo(
    () => ({
      logoSvg: brandData?.logoSvg ?? undefined,
      brandName: brandData?.name ?? selectedBrand?.name,
    }),
    [brandData?.logoSvg, brandData?.name, selectedBrand?.name],
  );

  const setSelectedBrandId = useCallback((brandId: string) => {
    setSelectedBrandIdState(brandId);
    window.localStorage.setItem(BRAND_STORAGE_KEY, brandId);
    const option = brandOptions.find((brand) => brand.id === brandId);
    syncSearchParam('brand', option?.slug ?? brandId);
  }, [brandOptions]);

  const setTheme = useCallback((nextTheme: DocsTheme) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    syncSearchParam('theme', nextTheme);
  }, []);

  const setDensity = useCallback((nextDensity: DocsDensity) => {
    setDensityState(nextDensity);
    window.localStorage.setItem(DENSITY_STORAGE_KEY, nextDensity);
    syncSearchParam('density', nextDensity);
  }, []);

  const value = useMemo<DocsBrandContextValue>(
    () => ({
      brands: brandOptions,
      selectedBrandId,
      selectedBrandName: selectedBrand?.name ?? 'Loading brand',
      theme,
      density,
      hasConvex: true,
      isBrandReady: cssContent !== null && Boolean(selectedBrandId),
      setSelectedBrandId,
      setTheme,
      setDensity,
    }),
    [brandOptions, cssContent, density, selectedBrand?.name, selectedBrandId, setDensity, setSelectedBrandId, setTheme, theme],
  );

  return (
    <IconProvider iconSet={docsIconSet} defaultSize={iconsConfig?.defaultSize ?? 'md'} strokeWidth={iconsConfig?.strokeWidth}>
      <DocsBrandContext.Provider value={value}>
        <BrandLogoContext.Provider value={brandLogoValue}>
          <DecorationProvider decorations={decorationMap}>
            {children as ComponentProps<typeof DecorationProvider>['children']}
          </DecorationProvider>
        </BrandLogoContext.Provider>
      </DocsBrandContext.Provider>
    </IconProvider>
  );
}

function resolveDocsIconSet(selectedSet: IconSetId | undefined): IconSetId {
  // The Jio set needs a host-provided SVG data loader. The docs app does not
  // ship that loader yet, so use Lucide as the reliable semantic fallback.
  return selectedSet && selectedSet !== 'jio' ? selectedSet : 'lucide';
}

function toBrandOption(brand: Doc<'brands'>): DocsBrandOption {
  return {
    id: brand._id,
    name: brand.name,
    slug: brand.slug,
    status: brand.status,
  };
}

function usePreviousWhileLoading(css: string | null, styleId: string) {
  const previousCSSRef = useRef<string>(
    typeof document !== 'undefined'
      ? (document.getElementById(styleId) as HTMLStyleElement | null)?.textContent ?? ''
      : '',
  );
  const effectiveCSS = css ?? previousCSSRef.current;

  useEffect(() => {
    if (css !== null) previousCSSRef.current = css;
  }, [css]);

  return effectiveCSS;
}

function useDocsRootAttributes(theme: DocsTheme, density: DocsDensity) {
  useEffect(() => {
    const root = document.documentElement;

    const syncPlatform = () => {
      const width = window.innerWidth;
      const breakpoint = width <= 619 ? 'S' : width <= 990 ? 'M' : 'L';
      root.setAttribute('data-Breakpoint', breakpoint);
    };

    root.setAttribute('data-mode', theme);
    root.setAttribute('data-density', density);
    root.setAttribute('data-6-Density', density);
    syncPlatform();
    window.addEventListener('resize', syncPlatform);

    return () => window.removeEventListener('resize', syncPlatform);
  }, [density, theme]);
}

function syncSearchParam(key: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState(null, '', url);
}
