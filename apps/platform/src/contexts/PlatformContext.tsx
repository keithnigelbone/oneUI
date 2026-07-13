/**
 * PlatformContext.tsx
 *
 * Global platform state for:
 * - Current brand selection
 * - Theme (light/dark) — V4 dropped dim mode
 * - Platform (mobile/tablet/desktop/tv) + V2 platform ID
 * - Density (compact/default/open)
 * - Icon set selection
 *
 * Dimension system: Sets data-Breakpoint and data-6-Density on <html>
 * so that scale.css resolves the correct dimension f-step values per
 * breakpoint × density combination.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Brand, IconSetId, BreakpointId, IconVariantPreference, MaterialStylePreference } from '@oneui/shared';
import type { ThemeScope } from '@oneui/ui/components/Platform';
import { useUserPreferencesContext } from './UserPreferencesContext';

export type { BreakpointId };

/**
 * Derive the S/M/L breakpoint from viewport width (unified 619/990 thresholds).
 *
 * This re-encodes the canonical 619/990 ladder that lives in @oneui/shared as
 * `resolveBreakpointRange` (== viewportToBreakpointGroup, which scale.css's
 * @media rules are generated from). Kept as a local copy so the file has no
 * runtime dependency on the shared package during first paint; the [620, 991]
 * literals in the resize handler below mirror the same thresholds.
 */
function getBreakpointFromWidth(width: number): BreakpointId {
  if (width <= 619) return 'S';
  if (width <= 990) return 'M';
  return 'L';
}

/** Lightweight sub-brand config stored in context (mirrors subBrandConfigs Convex table) */
export interface SubBrandConfig {
  id: string;
  parentBrandId: string;
  name: string;
  slug: string;
  primary:   { scaleName: string; baseStep: number };
  secondary: { scaleName: string; baseStep: number };
  sparkle:   { scaleName: string; baseStep: number };
  brandBg: { scaleName: string; backgroundStep: { light: number; dark: number } };
  materials?: {
    materialAssignments?: Record<string, string | undefined>;
  };
}

export interface PlatformContextType {
  // Brand
  currentBrand: Brand | null;
  setBrand: (brand: Brand | null) => void;

  // Sub-brand (theme variant of the current brand)
  currentSubBrand: SubBrandConfig | null;
  setSubBrand: (sub: SubBrandConfig | null) => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Platform/Device (V1 legacy)
  platform: 'mobile' | 'tablet' | 'desktop' | 'tv';
  setPlatform: (
    platform: 'mobile' | 'tablet' | 'desktop' | 'tv'
  ) => void;

  // Active S/M/L breakpoint (unified 619/990 thresholds), derived from real
  // viewport width. Drives `data-Breakpoint` and the studio chrome dimension
  // cascade via scale.css. Should NEVER be touched by the scoped preview
  // machinery below.
  breakpointId: BreakpointId;

  // ─── Scoped preview (Phase 4 Platform rework) ─────────────────────────
  // Previewing a non-Web platform (Mobile Native / Print / Outdoor) updates
  // ONLY the scoped subtree wrapped in <ScopedPlatform>. Studio chrome
  // continues to render at `breakpointId` — the tool UI never rescales.
  //
  // Defaults: previewPlatformId = 'web', previewBreakpointId = current breakpointId.
  previewPlatformId: string;
  previewBreakpointId: string;
  setPreviewPlatform: (platformId: string, breakpointId: string) => void;

  // Density
  density: 'compact' | 'default' | 'open';
  setDensity: (density: 'compact' | 'default' | 'open') => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Icon set
  iconSet: IconSetId;
  setIconSet: (iconSet: IconSetId) => void;
  iconVariant: IconVariantPreference;
  setIconVariant: (variant: IconVariantPreference) => void;
  materialStyle: MaterialStylePreference;
  setMaterialStyle: (style: MaterialStylePreference) => void;

  // Theme scope
  themeScope: ThemeScope;
  setThemeScope: (scope: ThemeScope) => void;

  // Platform brand (the brand whose settings always apply to the tool UI)
  platformBrandId: string | undefined;
  setPlatformBrandId: (id: string | undefined) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(
  undefined
);

export interface PlatformProviderProps {
  children: React.ReactNode;
  defaultBrand?: Brand | null;
}

export const PlatformProvider: React.FC<PlatformProviderProps> = ({
  children,
  defaultBrand = null,
}) => {
  const { prefs, updatePref } = useUserPreferencesContext();

  const [currentBrand, setCurrentBrand] = useState<Brand | null>(defaultBrand);
  const [currentSubBrand, setCurrentSubBrandState] = useState<SubBrandConfig | null>(null);
  // Initialize from localStorage (same pattern as themeScope below) so useBrandCSS
  // generates the correct theme CSS before Convex delivers prefs. Without this,
  // Vercel's 200-500ms Convex latency window uses theme:'light' regardless of
  // the user's actual preference, injecting wrong brand CSS until prefs arrive.
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = localStorage.getItem('oneui-studio:theme');
      if (stored === 'dim') return 'dark';
      return (stored === 'light' || stored === 'dark') ? stored : 'light';
    } catch { return 'light'; }
  });
  const [platform, setPlatformState] = useState<
    'mobile' | 'tablet' | 'desktop' | 'tv'
  >('desktop');
  const [density, setDensityState] = useState<'compact' | 'default' | 'open'>('default');
  const [breakpointId, setBreakpointId] = useState<BreakpointId>(
    () => (typeof window !== 'undefined' ? getBreakpointFromWidth(window.innerWidth) : 'L')
  );
  // Scoped preview state — defaults to Web + the current real viewport so
  // previews start at parity with the studio chrome. Never writes to the DOM
  // directly; read by <ScopedPlatform> wrappers that apply attributes to a
  // subtree only.
  const [previewPlatformId, setPreviewPlatformId] = useState<string>('web');
  const [previewBreakpointId, setPreviewBreakpointId] = useState<string>(
    () => (typeof window !== 'undefined' ? getBreakpointFromWidth(window.innerWidth) : 'L')
  );
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [iconSet, setIconSetState] = useState<IconSetId>('jio');
  const [iconVariant, setIconVariantState] = useState<IconVariantPreference>('outline');
  const [materialStyle, setMaterialStyleState] = useState<MaterialStylePreference>('outlined');
  // Brand Theme is now the only runtime mode. Coerce legacy local values so
  // old Default Theme cache cannot take over after route changes or reloads.
  const [themeScope, setThemeScopeState] = useState<ThemeScope>(() => {
    if (typeof window === 'undefined') return 'global';
    try {
      const stored = localStorage.getItem('oneui-studio:theme-scope');
      if (stored !== 'global') {
        localStorage.setItem('oneui-studio:theme-scope', 'global');
        localStorage.removeItem('oneui-studio:brand-css');
        localStorage.removeItem('oneui-studio:brand-css-meta');
      }
    } catch { /* localStorage unavailable */ }
    return 'global';
  });
  const [platformBrandId, setPlatformBrandIdState] = useState<string | undefined>(undefined);

  // Single hydration effect: runs when Convex-backed userPreferences resolves
  // from undefined → loaded. Applies theme/density/themeScope/platformBrandId/
  // iconSet in one batch. Brand + sub-brand are resolved at the layout level
  // where the brand list is available. Runs exactly once per session via a ref.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current || prefs === null) return;
    hydratedRef.current = true;

    if (prefs.theme === 'light' || prefs.theme === 'dark') {
      setThemeState(prefs.theme);
      document.documentElement.setAttribute('data-mode', prefs.theme);
    }

    if (prefs.density === 'compact' || prefs.density === 'default' || prefs.density === 'open') {
      setDensityState(prefs.density);
      document.documentElement.setAttribute('data-density', prefs.density);
      document.documentElement.setAttribute('data-6-Density', prefs.density);
    } else {
      document.documentElement.setAttribute('data-density', 'default');
      document.documentElement.setAttribute('data-6-Density', 'default');
    }

    if (prefs.themeScope && prefs.themeScope !== 'global') {
      updatePref({ themeScope: 'global' });
    }
    setThemeScopeState('global');
    document.documentElement.setAttribute('data-theme-scope', 'global');

    if (prefs.platformBrandId) {
      setPlatformBrandIdState(prefs.platformBrandId);
    }

    if (prefs.iconSet) {
      setIconSetState(prefs.iconSet as IconSetId);
    }
  }, [prefs, updatePref]);

  // Breakpoint detection: track viewport width → set data-Breakpoint (canonical)
  // on <html>. scale.css resolves dimensions via @media without JS, so this is
  // for JS-awareness + ScopedPlatform consistency.
  useEffect(() => {
    const update = () => {
      const bp = getBreakpointFromWidth(window.innerWidth);
      setBreakpointId(prev => (prev === bp ? prev : bp));
      document.documentElement.setAttribute('data-Breakpoint', bp);
    };

    // Set initial value (blocking script may have already set it, but sync React state)
    update();

    // matchMedia at the unified S/M/L thresholds (619/990 → breakpoints at 620/991).
    const breakpoints = [620, 991];
    const mediaQueries = breakpoints.map((bp) => window.matchMedia(`(min-width: ${bp}px)`));
    const handler = () => update();

    mediaQueries.forEach((mq) => mq.addEventListener('change', handler));
    return () => {
      mediaQueries.forEach((mq) => mq.removeEventListener('change', handler));
    };
  }, []);

  // Keep data-mode on <html> in sync with React state. Next.js's root Server
  // Component always renders data-mode="light"; React reconciliation during
  // client-side navigation can reset the attribute. The blocking script and
  // hydration effect each set it once, but neither re-fires on navigation.
  // This effect re-applies the correct value whenever theme state changes
  // (including the very first render, where the lazy initializer already
  // provides the localStorage value so data-mode is never wrong).
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', theme);
  }, [theme]);

  // Memoized setters. All persistence routes through `updatePref` which
  // writes a synchronous localStorage shadow copy (for the FOUC blocking
  // script) and debounces the Convex upsert. Single source of truth — no
  // more drift between localStorage and Convex.
  const setSubBrand = useCallback((sub: SubBrandConfig | null) => {
    setCurrentSubBrandState(sub);
    updatePref({ lastOpenedSubBrandId: sub?.id ?? null });
  }, [updatePref]);

  const setBrand = useCallback((brand: Brand | null) => {
    setCurrentBrand(brand);
    // Clear sub-brand when brand changes — sub-brands are brand-scoped
    setCurrentSubBrandState(null);
    if (brand?.slug) {
      document.documentElement.setAttribute('data-brand', brand.slug);
    } else {
      document.documentElement.removeAttribute('data-brand');
    }
    // One atomic upsert covers both the new brand and the cleared sub-brand,
    // so Convex sees a single consistent state change.
    updatePref({
      lastOpenedBrandId: brand?.id ?? null,
      lastOpenedSubBrandId: null,
    });
    // brand-logo-svg is used by the blocking FOUC script but is NOT part of
    // the userPreferences Convex schema — keep it as a direct localStorage
    // write so the cache stays fresh for the next reload.
    try {
      if (brand?.logoSvg) {
        localStorage.setItem('oneui-studio:brand-logo-svg', brand.logoSvg);
      } else {
        localStorage.removeItem('oneui-studio:brand-logo-svg');
      }
    } catch {
      /* localStorage not available */
    }
  }, [updatePref]);
  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-mode', newTheme);
    updatePref({ theme: newTheme });
  }, [updatePref]);

  const setPlatform = useCallback((newPlatform: 'mobile' | 'tablet' | 'desktop' | 'tv') => setPlatformState(newPlatform), []);
  const setDensity = useCallback((newDensity: 'compact' | 'default' | 'open') => {
    setDensityState(newDensity);
    document.documentElement.setAttribute('data-density', newDensity);
    document.documentElement.setAttribute('data-6-Density', newDensity);
    updatePref({ density: newDensity });
  }, [updatePref]);
  const setSidebarCollapsed = useCallback((collapsed: boolean) => setSidebarCollapsedState(collapsed), []);
  const setIconSet = useCallback((newIconSet: IconSetId) => {
    setIconSetState(newIconSet);
    updatePref({ iconSet: newIconSet });
  }, [updatePref]);
  const setIconVariant = useCallback((variant: IconVariantPreference) => {
    setIconVariantState(variant);
  }, []);
  const setMaterialStyle = useCallback((style: MaterialStylePreference) => {
    setMaterialStyleState(style);
  }, []);
  const setThemeScope = useCallback((_scope: ThemeScope) => {
    setThemeScopeState('global');
    document.documentElement.setAttribute('data-theme-scope', 'global');
    updatePref({ themeScope: 'global' });
  }, [updatePref]);

  const setPreviewPlatform = useCallback((platformId: string, breakpointId: string) => {
    setPreviewPlatformId(platformId);
    setPreviewBreakpointId(breakpointId);
    // Persist last preview selection so the picker remembers it across reloads.
    try {
      localStorage.setItem('oneui-studio:preview-platform', `${platformId}::${breakpointId}`);
    } catch { /* ignore */ }
  }, []);

  // Hydrate persisted preview selection on mount. Validates that both parts
  // of the stored `platformId::breakpointId` tuple are non-empty and match
  // the `[a-z0-9-]` character class we use for generated ids. This guards
  // against a hand-edited / corrupted localStorage entry silently feeding
  // garbage into `data-Breakpoint`, which would otherwise render an element
  // with a broken dimension cascade.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('oneui-studio:preview-platform');
      if (!stored) return;
      const [pid, bpid] = stored.split('::');
      // Reject anything that isn't two non-empty, alphanumeric-plus-hyphen
      // segments. Matches the id shape produced by platform-config.ts presets
      // and the custom-platform builder.
      const validId = /^[A-Za-z0-9][A-Za-z0-9-]*$/;
      if (pid && bpid && validId.test(pid) && validId.test(bpid)) {
        setPreviewPlatformId(pid);
        setPreviewBreakpointId(bpid);
      } else {
        // Invalid payload — remove it so we don't keep re-reading garbage.
        localStorage.removeItem('oneui-studio:preview-platform');
      }
    } catch { /* localStorage not available */ }
  }, []);

  const setPlatformBrandId = useCallback((id: string | undefined) => {
    setPlatformBrandIdState(id);
    updatePref({ platformBrandId: id ?? null });
  }, [updatePref]);

  // Memoize context value to prevent unnecessary re-renders.
  // No mounted guard needed — the inline <script> in layout.tsx ensures
  // the DOM already has the correct data-mode/data-density before hydration.
  const value = useMemo<PlatformContextType>(
    () => ({
      currentBrand,
      setBrand,
      currentSubBrand,
      setSubBrand,
      theme,
      setTheme,
      platform,
      setPlatform,
      breakpointId,
      previewPlatformId,
      previewBreakpointId,
      setPreviewPlatform,
      density,
      setDensity,
      sidebarCollapsed,
      setSidebarCollapsed,
      iconSet,
      setIconSet,
      iconVariant,
      setIconVariant,
      materialStyle,
      setMaterialStyle,
      themeScope,
      setThemeScope,
      platformBrandId,
      setPlatformBrandId,
    }),
    [
      currentBrand,
      currentSubBrand,
      theme,
      platform,
      breakpointId,
      previewPlatformId,
      previewBreakpointId,
      density,
      sidebarCollapsed,
      iconSet,
      iconVariant,
      materialStyle,
      themeScope,
      platformBrandId,
      setBrand,
      setSubBrand,
      setTheme,
      setPlatform,
      setPreviewPlatform,
      setDensity,
      setSidebarCollapsed,
      setIconSet,
      setIconVariant,
      setMaterialStyle,
      setThemeScope,
      setPlatformBrandId,
    ]
  );

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};

export function usePlatformContext(): PlatformContextType {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error(
      'usePlatformContext must be used within a PlatformProvider'
    );
  }
  return context;
}
