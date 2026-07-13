/**
 * PageContext.tsx
 *
 * Stateful context for the surface-checker top bar. Drives theme (light /
 * dark) and the active brand + variant. Brand data is read OFFLINE from the
 * exported snapshots in `src/brand-data/offlineBrandData.generated.ts` — no
 * live Convex connection is required to run the checker.
 *
 * Regenerate the snapshots with:
 *   pnpm --filter @oneui/native-sample export:brands
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { OFFLINE_BRANDS } from './brand-data/offlineBrandData.generated';
import type { ThemeMode } from './tokens';

/** One selectable offline brand snapshot. */
export interface OfflineBrandOption {
  /** Display/lookup name, e.g. `"Jio"`, `"Tira"`, `"One-UI-Theme"`. */
  brand: string;
  /** Variant — `"base"` or a sub-brand name like `"MyJio"`. */
  variant: string;
}

export interface PageContextValue {
  /** Theme mode forwarded to `OneUIBrandProvider` (light / dark). */
  theme: ThemeMode;
  /** Active brand snapshot (brand + variant). */
  brand: OfflineBrandOption;
  /** All exported brand snapshots, from the offline manifest. */
  brands: ReadonlyArray<OfflineBrandOption>;
  setTheme: (theme: ThemeMode) => void;
  setBrand: (brand: OfflineBrandOption) => void;
}

const PageContext = createContext<PageContextValue | null>(null);

/** Default to Jio base if present, otherwise the first exported snapshot. */
function defaultBrand(): OfflineBrandOption {
  const jioBase = OFFLINE_BRANDS.find(
    (b) => b.brand === 'Jio' && b.variant === 'base',
  );
  return jioBase ?? OFFLINE_BRANDS[0] ?? { brand: 'Jio', variant: 'base' };
}

export function PageContextProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [brand, setBrand] = useState<OfflineBrandOption>(defaultBrand);

  const handleSetTheme = useCallback((next: ThemeMode) => setTheme(next), []);
  const handleSetBrand = useCallback(
    (next: OfflineBrandOption) => setBrand(next),
    [],
  );

  const value = useMemo<PageContextValue>(
    () => ({
      theme,
      brand,
      brands: OFFLINE_BRANDS,
      setTheme: handleSetTheme,
      setBrand: handleSetBrand,
    }),
    [theme, brand, handleSetTheme, handleSetBrand],
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePageContext(): PageContextValue {
  const ctx = useContext(PageContext);
  if (!ctx) {
    throw new Error('usePageContext must be used inside <PageContextProvider>.');
  }
  return ctx;
}
