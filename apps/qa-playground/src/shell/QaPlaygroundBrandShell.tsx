/**
 * Convex + fixture brand switching for the QA Playground.
 * Toolbar mirrors Storybook manager: Brand → Sub-theme → Platform → Viewport → Density + Theme.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient, useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import type { DensityId } from '@oneui/shared';
import type { SelectOption } from '@oneui/ui/components/Select';
import { IconContained } from '@oneui/ui/components/IconContained';

import { QaBrandFoundationRoot } from './QaBrandFoundationRoot';
import { QaConvexBrandInjector } from './QaConvexBrandInjector';
import { QaPlatformDensityScope } from './QaPlatformDensityScope';
import {
  QaPlaygroundToolbar,
  breakpointSelectOptions,
  densitySelectOptions,
  platformSelectOptions,
  subBrandSelectOptions,
} from './QaPlaygroundToolbar';
import toolbarStyles from './qa-brand-toolbar.module.css';
import {
  LS_BRAND_ID,
  LS_BREAKPOINT,
  LS_DENSITY,
  LS_PLATFORM,
  LS_SOURCE,
  LS_SUB_BRAND_ID,
  LS_THEME,
  loadPersistedBrandId,
  loadPersistedBreakpoint,
  loadPersistedDensity,
  loadPersistedPlatform,
  loadPersistedSource,
  loadPersistedSubBrandId,
  loadPersistedTheme,
  resolvePlatformsConfig,
  useSyncPlatformGlobals,
  type BrandSource,
  type ThemeChoice,
} from './qaPlaygroundToolbarState';

const JIO_ALPHA_BRAND_SLUG = 'jio-default';

function readConvexUrl(): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>;
  return (
    env.VITE_CONVEX_URL ??
    env.NEXT_PUBLIC_CONVEX_URL ??
    env.CONVEX_URL ??
    env.STORYBOOK_CONVEX_URL
  );
}

function selectLeadingIcon(name: 'palette') {
  return (
    <span className={toolbarStyles.selectLeadingIcon}>
      <IconContained icon={name} size="xs" attention="medium" appearance="primary" aria-hidden />
    </span>
  );
}

export function QaPlaygroundBrandShell({ children }: { children: ReactNode }) {
  const convexUrl = useMemo(() => readConvexUrl(), []);
  const convexClient = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [convexUrl],
  );

  if (!convexClient) {
    return <QaPlaygroundBrandShellWithoutConvex>{children}</QaPlaygroundBrandShellWithoutConvex>;
  }

  return (
    <ConvexProvider client={convexClient}>
      <QaPlaygroundBrandShellWithConvex>{children}</QaPlaygroundBrandShellWithConvex>
    </ConvexProvider>
  );
}

function useHideBrandToolbar(): boolean {
  const { pathname } = useLocation();
  return pathname.startsWith('/storybook');
}

function QaPlaygroundBrandShellWithoutConvex({ children }: { children: ReactNode }) {
  const hideToolbar = useHideBrandToolbar();
  const [platformId, setPlatformId] = useState(loadPersistedPlatform);
  const [breakpoint, setBreakpoint] = useState(loadPersistedBreakpoint);
  const [density, setDensity] = useState(loadPersistedDensity);
  const [hydrated, setHydrated] = useState(false);

  const platformsConfig = resolvePlatformsConfig(null);
  const { enabledPlatforms, activeBreakpoints, availableDensities } = useSyncPlatformGlobals({
    platformsConfig,
    platformId,
    breakpoint,
    density,
    setPlatformId,
    setBreakpoint,
    setDensity,
  });

  useEffect(() => {
    setPlatformId(loadPersistedPlatform());
    setBreakpoint(loadPersistedBreakpoint());
    setDensity(loadPersistedDensity());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LS_PLATFORM, platformId);
    window.localStorage.setItem(LS_BREAKPOINT, breakpoint);
    window.localStorage.setItem(LS_DENSITY, density);
  }, [platformId, breakpoint, density, hydrated]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
    <>
      {!hideToolbar ? (
        <>
          <QaPlaygroundToolbar
            source="fixture"
            onSourceChange={() => {}}
            showConvexBrandControls={false}
            brandOptions={[]}
            convexBrandId=""
            onConvexBrandChange={() => {}}
            subBrandOptions={[{ value: '', label: 'Base brand' }]}
            subBrandId=""
            onSubBrandChange={() => {}}
            platformOptions={platformSelectOptions(enabledPlatforms)}
            platformId={platformId}
            onPlatformChange={setPlatformId}
            breakpointOptions={breakpointSelectOptions(activeBreakpoints)}
            breakpoint={breakpoint}
            onBreakpointChange={setBreakpoint}
            densityOptions={densitySelectOptions(availableDensities)}
            density={density}
            onDensityChange={setDensity}
            theme="light"
            onThemeChange={() => {}}
          />
          <p className={toolbarStyles.hint}>
            Set NEXT_PUBLIC_CONVEX_URL or VITE_CONVEX_URL in repo-root .env.local (same as
            Storybook) for the Convex brand dropdown, sub-themes, and live foundations.
          </p>
        </>
      ) : null}
      <QaPlatformDensityScope density={density as DensityId} breakpointValue={breakpoint}>
        <QaBrandFoundationRoot>{children}</QaBrandFoundationRoot>
      </QaPlatformDensityScope>
    </>
  );
}

function QaPlaygroundBrandShellWithConvex({ children }: { children: ReactNode }) {
  const hideToolbar = useHideBrandToolbar();
  const brands = useQuery(api.brands.list);
  const [source, setSource] = useState<BrandSource>('fixture');
  const [convexBrandId, setConvexBrandId] = useState('');
  const [subBrandId, setSubBrandId] = useState('');
  const [theme, setTheme] = useState<ThemeChoice>('light');
  const [platformId, setPlatformId] = useState('');
  const [breakpoint, setBreakpoint] = useState('responsive');
  const [density, setDensity] = useState('default');
  const [hydrated, setHydrated] = useState(false);

  const convexReady = source === 'convex' && Boolean(convexBrandId);
  const typedBrandId = convexBrandId as Id<'brands'>;

  const foundationOverview = useQuery(
    api.foundations.getBrandOverviewData,
    convexReady ? { brandId: typedBrandId } : 'skip',
  );
  const subBrands = useQuery(
    api.subBrandConfigs.getByParentBrand,
    convexReady ? { parentBrandId: typedBrandId } : 'skip',
  );

  const platformsConfig = resolvePlatformsConfig(
    convexReady ? (foundationOverview?.platforms?.config ?? null) : null,
  );

  const { enabledPlatforms, activeBreakpoints, availableDensities } = useSyncPlatformGlobals({
    platformsConfig,
    platformId,
    breakpoint,
    density,
    setPlatformId,
    setBreakpoint,
    setDensity,
  });

  useEffect(() => {
    setSource(loadPersistedSource());
    setConvexBrandId(loadPersistedBrandId());
    setSubBrandId(loadPersistedSubBrandId());
    setTheme(loadPersistedTheme());
    setPlatformId(loadPersistedPlatform());
    setBreakpoint(loadPersistedBreakpoint());
    setDensity(loadPersistedDensity());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LS_SOURCE, source);
  }, [source, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LS_THEME, theme);
  }, [theme, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (convexBrandId) window.localStorage.setItem(LS_BRAND_ID, convexBrandId);
    else window.localStorage.removeItem(LS_BRAND_ID);
  }, [convexBrandId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (subBrandId) window.localStorage.setItem(LS_SUB_BRAND_ID, subBrandId);
    else window.localStorage.removeItem(LS_SUB_BRAND_ID);
  }, [subBrandId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LS_PLATFORM, platformId);
    window.localStorage.setItem(LS_BREAKPOINT, breakpoint);
    window.localStorage.setItem(LS_DENSITY, density);
  }, [platformId, breakpoint, density, hydrated]);

  useEffect(() => {
    if (!brands?.length || !hydrated) return;
    if (!convexBrandId || !brands.some((b) => b._id === convexBrandId)) {
      const jio = brands.find((b) => b.slug === JIO_ALPHA_BRAND_SLUG) ?? brands[0];
      if (jio) setConvexBrandId(jio._id);
    }
  }, [brands, convexBrandId, hydrated]);

  useEffect(() => {
    if (!subBrands || !hydrated) return;
    if (subBrandId && !subBrands.some((s) => s._id === subBrandId)) {
      setSubBrandId('');
    }
  }, [subBrands, subBrandId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const el = document.documentElement;
    if (source === 'convex') {
      el.setAttribute('data-mode', theme);
    } else {
      el.setAttribute('data-mode', 'light');
    }
  }, [source, theme, hydrated]);

  const brandOptions: SelectOption<string>[] = useMemo(() => {
    if (!brands?.length) {
      return [{ value: '', label: 'Loading…', disabled: true }];
    }
    return brands.map((b) => ({
      value: b._id,
      label: b.name,
      icon: selectLeadingIcon('palette'),
    }));
  }, [brands]);

  const onBrandChange = (id: string) => {
    setConvexBrandId(id);
    setSubBrandId('');
  };

  const body = (
    <QaPlatformDensityScope density={density as DensityId} breakpointValue={breakpoint}>
      {source === 'fixture' ? (
        <QaBrandFoundationRoot>{children}</QaBrandFoundationRoot>
      ) : convexReady ? (
        <QaConvexBrandInjector brandId={convexBrandId} subBrandId={subBrandId || undefined} theme={theme}>
          {children}
        </QaConvexBrandInjector>
      ) : (
        <QaBrandFoundationRoot>{children}</QaBrandFoundationRoot>
      )}
    </QaPlatformDensityScope>
  );

  return (
    <>
      {!hideToolbar ? (
        <QaPlaygroundToolbar
          source={source}
          onSourceChange={setSource}
          showConvexBrandControls={source === 'convex'}
          brandOptions={brandOptions}
          convexBrandId={convexBrandId}
          onConvexBrandChange={onBrandChange}
          subBrandOptions={subBrandSelectOptions(subBrands ?? [])}
          subBrandId={subBrandId}
          onSubBrandChange={setSubBrandId}
          platformOptions={platformSelectOptions(enabledPlatforms)}
          platformId={platformId}
          onPlatformChange={setPlatformId}
          breakpointOptions={breakpointSelectOptions(activeBreakpoints)}
          breakpoint={breakpoint}
          onBreakpointChange={setBreakpoint}
          densityOptions={densitySelectOptions(availableDensities)}
          density={density}
          onDensityChange={setDensity}
          theme={theme}
          onThemeChange={setTheme}
        />
      ) : null}
      {body}
    </>
  );
}
