/**
 * PageContext.tsx
 *
 * Stateful context for theme / density / appearance / brand (Convex).
 * Used by `native-components-sample` — same shape as `apps/native-sample`
 * so `useNativeTheme` + component showcases stay aligned.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useActiveBrand, type SubBrandConfig, type NativeBrand } from './hooks/useActiveBrand';
import {
  useBrandDataSource,
  type BrandDataSource,
} from './hooks/useBrandDataSource';
/** Keep in sync with keys in offlineBrandData.generated.ts. */
const OFFLINE_BRAND_NAMES = ['jio', 'native-test', 'one-ui-theme', 'reliance', 'swadesh', 'tira'];
import { useTypographyLanguagePreference } from './hooks/useTypographyLanguagePreference';
import type { TypographyLocale } from '@oneui/ui-native/theme';
import type { Appearance, Density, LibraryName, ThemeMode } from './tokens';

export type PageBrand = NativeBrand;

export type { SubBrandConfig, BrandDataSource };

export interface PageContextValue {
  theme: ThemeMode;
  density: Density;
  appearance: Appearance;
  /** Convex brand document id, or `null` while bootstrapping. */
  brandId: string | null;
  /** Full list of brands from Convex, or `undefined` while loading. */
  brands: PageBrand[] | undefined;
  /** Sub-brand variants for the active brand, or `undefined` while loading. */
  subBrands: SubBrandConfig[] | undefined;
  /** Active sub-brand id, or `null` when showing the base brand. */
  subBrandId: string | null;
  /** Active UI library renderer (Library selector chip). Default: `'native'`. */
  library: LibraryName;
  /** Typography locale for `OneUIBrandProvider` (Layers `language` switchable). */
  language: TypographyLocale;
  /** Where foundation + component overrides are loaded from. */
  brandDataSource: BrandDataSource;
  setTheme: (theme: ThemeMode) => void;
  setDensity: (density: Density) => void;
  setAppearance: (appearance: Appearance) => void;
  setBrandId: (brandId: string) => void;
  setSubBrandId: (subBrandId: string | null) => void;
  setLibrary: (library: LibraryName) => void;
  setLanguage: (language: TypographyLocale) => void;
  setBrandDataSource: (source: BrandDataSource) => void;
}

const PageContext = createContext<PageContextValue | null>(null);

export function PageContextProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const { brandDataSource, setBrandDataSource } = useBrandDataSource();
  const { brands, activeId, setActiveId, subBrands, activeSubBrandId, setActiveSubBrandId } =
    useActiveBrand(brandDataSource, OFFLINE_BRAND_NAMES);
  const { language, setLanguage } = useTypographyLanguagePreference();

  const [theme, setTheme] = useState<ThemeMode>('light');
  const [density, setDensity] = useState<Density>('default');
  const [appearance, setAppearance] = useState<Appearance>('primary');
  const [library, setLibrary] = useState<LibraryName>('native');

  const handleSetTheme = useCallback((next: ThemeMode) => setTheme(next), []);
  const handleSetDensity = useCallback((next: Density) => setDensity(next), []);
  const handleSetAppearance = useCallback(
    (next: Appearance) => setAppearance(next),
    [],
  );
  const handleSetLibrary = useCallback(
    (next: LibraryName) => setLibrary(next),
    [],
  );

  const value = useMemo<PageContextValue>(
    () => ({
      theme,
      density,
      appearance,
      brandId: activeId,
      brands,
      subBrands,
      subBrandId: activeSubBrandId,
      library,
      language,
      brandDataSource,
      setTheme: handleSetTheme,
      setDensity: handleSetDensity,
      setAppearance: handleSetAppearance,
      setBrandId: setActiveId,
      setSubBrandId: setActiveSubBrandId,
      setLibrary: handleSetLibrary,
      setLanguage,
      setBrandDataSource,
    }),
    [
      theme,
      density,
      appearance,
      activeId,
      brands,
      subBrands,
      activeSubBrandId,
      library,
      language,
      brandDataSource,
      handleSetTheme,
      handleSetDensity,
      handleSetAppearance,
      setActiveId,
      setActiveSubBrandId,
      handleSetLibrary,
      setLanguage,
      setBrandDataSource,
    ],
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePageContext(): PageContextValue {
  const ctx = useContext(PageContext);
  if (!ctx) {
    throw new Error(
      'usePageContext must be used inside <PageContextProvider>.',
    );
  }
  return ctx;
}
