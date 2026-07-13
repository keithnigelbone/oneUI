/**
 * Top-level shell for the Button Figma parity page: optional Convex (same
 * pattern as Storybook preview.ts + BrandStyleInjector), plus a static
 * fixture foundation for deterministic Playwright runs.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient, useQuery } from 'convex/react';
import { api } from '@oneui/convex';

import { ConvexBrandInjector } from './ConvexBrandInjector';
import { FigmaParityBrandRoot } from './FigmaParityBrandRoot';
import toolbarStyles from './parity-toolbar.module.css';

const LS_SOURCE = 'oneui-figma-parity-brand-source';
const LS_BRAND_ID = 'oneui-figma-parity-convex-brand-id';
const LS_THEME = 'oneui-figma-parity-theme';
const JIO_ALPHA_BRAND_SLUG = 'jio-default';

type BrandSource = 'fixture' | 'convex';
type ThemeChoice = 'light' | 'dark';

function readConvexUrl(): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>;
  return (
    env.VITE_CONVEX_URL ??
    env.NEXT_PUBLIC_CONVEX_URL ??
    env.CONVEX_URL ??
    env.STORYBOOK_CONVEX_URL
  );
}

function loadPersistedSource(): BrandSource {
  if (typeof window === 'undefined') return 'fixture';
  const raw = window.localStorage.getItem(LS_SOURCE);
  return raw === 'convex' ? 'convex' : 'fixture';
}

function loadPersistedTheme(): ThemeChoice {
  if (typeof window === 'undefined') return 'light';
  const raw = window.localStorage.getItem(LS_THEME);
  return raw === 'dark' ? 'dark' : 'light';
}

function loadPersistedBrandId(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(LS_BRAND_ID) ?? '';
}

export function FigmaParityApp({ children }: { children: ReactNode }) {
  const convexUrl = useMemo(() => readConvexUrl(), []);
  const convexClient = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [convexUrl],
  );

  if (!convexClient) {
    return <FigmaParityAppWithoutConvex>{children}</FigmaParityAppWithoutConvex>;
  }

  return (
    <ConvexProvider client={convexClient}>
      <FigmaParityAppWithConvex>{children}</FigmaParityAppWithConvex>
    </ConvexProvider>
  );
}

/** No Convex URL — static fixture only (CI / offline). */
function FigmaParityAppWithoutConvex({ children }: { children: ReactNode }) {
  return (
    <>
      <header className={toolbarStyles.toolbar} data-testid="figma-parity-toolbar">
        <div className={toolbarStyles.group}>
          <span className={toolbarStyles.label}>Brand</span>
          <span className={toolbarStyles.label}>Fixture (offline parity)</span>
        </div>
        <p className={toolbarStyles.hint}>
          Set VITE_CONVEX_URL in repo-root .env.local (same as Storybook) to enable the Convex brand
          dropdown and live foundations.
        </p>
      </header>
      <FigmaParityBrandRoot>{children}</FigmaParityBrandRoot>
    </>
  );
}

function FigmaParityAppWithConvex({ children }: { children: ReactNode }) {
  const brands = useQuery(api.brands.list);
  const [source, setSource] = useState<BrandSource>('fixture');
  const [convexBrandId, setConvexBrandId] = useState('');
  const [theme, setTheme] = useState<ThemeChoice>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSource(loadPersistedSource());
    setConvexBrandId(loadPersistedBrandId());
    setTheme(loadPersistedTheme());
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
    if (!brands?.length || !hydrated) return;
    if (!convexBrandId || !brands.some((b) => b._id === convexBrandId)) {
      const jio = brands.find((b) => b.slug === JIO_ALPHA_BRAND_SLUG) ?? brands[0];
      if (jio) setConvexBrandId(jio._id);
    }
  }, [brands, convexBrandId, hydrated]);

  const convexReady = source === 'convex' && Boolean(convexBrandId);

  useEffect(() => {
    if (!hydrated) return;
    const el = document.documentElement;
    if (source === 'convex') {
      el.setAttribute('data-mode', theme);
    } else {
      el.setAttribute('data-mode', 'light');
    }
  }, [source, theme, hydrated]);

  return (
    <>
      <header className={toolbarStyles.toolbar} data-testid="figma-parity-toolbar">
        <div className={toolbarStyles.group}>
          <label className={toolbarStyles.label} htmlFor="parity-brand-source">
            Brand source
          </label>
          <select
            id="parity-brand-source"
            className={toolbarStyles.select}
            value={source}
            onChange={(e) => setSource(e.target.value as BrandSource)}
          >
            <option value="fixture">Fixture (offline parity)</option>
            <option value="convex">Convex (Storybook path)</option>
          </select>
        </div>

        {source === 'convex' && (
          <>
            <div className={toolbarStyles.divider} aria-hidden />
            <div className={toolbarStyles.group}>
              <label className={toolbarStyles.label} htmlFor="parity-convex-brand">
                Brand
              </label>
              <select
                id="parity-convex-brand"
                className={toolbarStyles.select}
                value={convexBrandId}
                onChange={(e) => setConvexBrandId(e.target.value)}
                disabled={!brands?.length}
              >
                {!brands?.length ? <option value="">Loading…</option> : null}
                {brands?.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={toolbarStyles.divider} aria-hidden />
            <div className={toolbarStyles.group}>
              <label className={toolbarStyles.label} htmlFor="parity-theme">
                Theme
              </label>
              <select
                id="parity-theme"
                className={toolbarStyles.select}
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeChoice)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </>
        )}
      </header>

      {source === 'fixture' ? (
        <FigmaParityBrandRoot>{children}</FigmaParityBrandRoot>
      ) : convexReady ? (
        <ConvexBrandInjector brandId={convexBrandId} theme={theme}>
          {children}
        </ConvexBrandInjector>
      ) : (
        <FigmaParityBrandRoot>{children}</FigmaParityBrandRoot>
      )}
    </>
  );
}
