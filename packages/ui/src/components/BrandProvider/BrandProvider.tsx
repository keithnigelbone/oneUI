/**
 * BrandProvider — v2 (build-time delivery).
 *
 * Pairs with `@oneui/vite-plugin`. At build time the plugin downloads each
 * declared brand's CSS from the CDN into `node_modules/.oneui-cache/` and
 * exposes them as virtual modules; this provider dynamic-imports the active
 * brand's chunk, injects it as a `<style id="oneui-brand-<slug>">`, and swaps
 * on prop change.
 *
 * **Decorations:** When the CDN serves `brands/<slug>/decorations.json`, the
 * plugin caches it next to the CSS and embeds it in the same brand chunk.
 * This provider wraps children in `DecorationProvider` so components like
 * `<Button>` render brand ornaments without an extra wrapper (matches Storybook
 * behaviour when a brand is selected).
 *
 * **ThemeConfig (Surface parity):** `themeConfig.json` is embedded in the brand
 * chunk; this provider supplies it through `BrandFoundationProvider` so
 * `useBrandFoundation()` matches the same object the CSS engine used.
 *
 * **Materials:** `materials.json` carries the Material foundation defaults so
 * `Surface` can inherit brand-level transparent/media defaults without Convex
 * at runtime.
 *
 * **Fonts:** Optional `fonts.json` (typography + uploaded custom fonts subset)
 * is passed to `useBrandFonts` so non-`@import` faces load like Storybook.
 *
 * **Logo:** `branding.json` feeds `BrandLogoContext` for components that read
 * `useBrandLogo()`.
 *
 * **Dimensions:** When `syncDocumentDimensions` is true (default), this
 * provider mirrors the platform shell: viewport → `data-Breakpoint` on
 * `<html>`, and the `density` prop → `data-6-Density` + `data-density`.
 * Nested providers should set `syncDocumentDimensions={false}` so only one
 * layer owns `document.documentElement`.
 *
 * **Icons:** Each provider wraps its subtree in `IconProvider` and registers the
 * icon loader for its `iconSet` (default `jio` → requires `@jds4/oneui-icons-jio`).
 * Nested providers may override `iconSet` (e.g. Reliance brand + `lucide` — install
 * `lucide-react`). Registration is idempotent across parallel/nested providers.
 *
 * Behaviour summary:
 *   - The CSS is selector-scoped under `[data-brand="<slug>"][data-mode="<mode>"]`,
 *     so multiple providers (siblings or nested) coexist without interference.
 *   - Theme switching is cheap — both light + dark live in the same file. We
 *     just flip `data-mode` on the wrapper.
 *   - Brand switching is async: dynamic-import → wait for the chunk → swap the
 *     `<style>` tag. While loading, children still render in the previous
 *     brand (no flash) until the new CSS is in place.
 *   - Nested providers refcount the same brand: two providers using `jio`
 *     share one `<style>` tag, removed only when the last unmounts.
 *   - Fallback: when the plugin is not configured (or a brand isn't in the
 *     manifest), the provider falls back to the bundled jio baseline if
 *     present, otherwise renders unstyled with a console.error.
 */
'use client';

import type { DecorationConfig, IconSetId } from '@oneui/shared';
import { resolveBreakpointRange } from '@oneui/shared';
import type { ThemeConfig } from '@oneui/shared/engine';
import type { ReactNode } from 'react';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { BrandLogoContextValue } from '../../contexts/BrandLogoContext';
import { BrandLogoContext } from '../../contexts/BrandLogoContext';
import { BrandScopeProvider, type BrandScopeValue } from '../../contexts/BrandScopeContext';
import { BrandFoundationProvider } from '../../contexts/BrandFoundationContext';
import {
  MaterialFoundationProvider,
  normalizeMaterialFoundationConfig,
  type MaterialFoundationDefaults,
} from '../../contexts/MaterialFoundationContext';
import { DecorationProvider } from '../../hooks/useDecorationContext';
import { useBrandFonts } from '../../hooks/useBrandFonts';
import { IconProvider } from '../../icons/IconContext';
import { ensureIconSetRegistered } from '../../icons/ensureIconSetRegistered';

export type BrandProviderDensity = 'compact' | 'default' | 'open';

export interface BrandProviderProps {
  /**
   * Brand slug. Must be listed in oneui.brands.json + cached by the plugin.
   * Defaults to `'jio'` — the baked Jio fallback ships with the library, so
   * `<BrandProvider>` with no prop and no plugin still renders correctly.
   */
  brand?: string;
  /**
   * Optional theme slug. Themes override 4 accent roles
   * (primary / secondary / sparkle / brand-bg) while inheriting every other
   * foundation from the parent brand. Must be declared in the consumer's
   * oneui.brands.json under the parent brand's `themes` array.
   *
   * **Loading order:** the provider always loads the parent CSS first, then
   * the theme delta. CSS specificity ensures the theme's 4 roles win
   * on theme-wrapped elements while inherited roles cascade from the
   * parent. If the theme chunk fails to load, the provider keeps the
   * parent CSS mounted and surfaces the error via `onThemeError` — the
   * wrapper renders with the parent's accents (visually degrades to parent).
   */
  theme?: string;
  /** Active mode. Flips `[data-mode]` selector inside the brand CSS. */
  mode?: 'light' | 'dark';
  /**
   * When true (default), keeps `data-Breakpoint`, `data-6-Density`, and
   * `data-density` on `document.documentElement` in sync with the viewport
   * and the `density` prop. Set false on nested `BrandProvider` trees.
   */
  syncDocumentDimensions?: boolean;
  /** Written to `data-6-Density` / `data-density` when `syncDocumentDimensions`. */
  density?: BrandProviderDensity;
  /**
   * Icon library for this brand subtree. Default `jio` (requires
   * `@jds4/oneui-icons-jio`). Override per nested provider — e.g.
   * `iconSet="lucide"` with `lucide-react` installed for a Reliance block.
   */
  iconSet?: IconSetId;
  /**
   * When `false`, skips auto-registration of the icon loader for this subtree.
   * Default `true` (unchanged behaviour). Use direct icon imports and register
   * once at app entry: `import '@jds4/oneui-icons-jio/register'`.
   */
  registerIcons?: boolean;
  /** Optional className on the wrapper div. */
  className?: string;
  /** Optional inline style on the wrapper div. */
  style?: React.CSSProperties;
  /** Children rendered inside the branded scope. */
  children: ReactNode;
  /** Fired once the brand's CSS is in the DOM. */
  onBrandLoaded?: (slug: string) => void;
  /** Fired if the brand CSS fails to load (network, missing, etc.). */
  onBrandError?: (slug: string, err: Error) => void;
  /** Fired once the theme's CSS is in the DOM (only when `theme` set). */
  onThemeLoaded?: (parentSlug: string, themeSlug: string) => void;
  /**
   * Fired if the theme CSS fails to load. The parent CSS remains mounted,
   * so the wrapper renders with the parent's accent roles (graceful degrade).
   */
  onThemeError?: (parentSlug: string, themeSlug: string, err: Error) => void;
}

// ─── Style-tag management with refcounting ───────────────────────────────────
//
// Multiple providers may render the same brand at once (sibling or nested).
// We track an in-flight load promise per slug and a mount refcount so the
// <style> tag is added/removed exactly once across the tree.

const styleIdFor = (slug: string) => `oneui-brand-${slug}`;
const themeStyleIdFor = (parent: string, theme: string) => `oneui-brand-${parent}--${theme}`;
const themeCacheKey = (parent: string, theme: string) => `${parent}::${theme}`;

export interface CachedBrandAssets {
  css: string;
  decorations: DecorationConfig[];
  themeConfig: ThemeConfig | null;
  materialsFoundation: MaterialFoundationDefaults;
  branding: BrandLogoContextValue;
  fontsFoundation: Record<string, unknown> | null;
}

const refCounts = new Map<string, number>();
const assetsCache = new Map<string, CachedBrandAssets>();
const pending = new Map<string, Promise<CachedBrandAssets>>();

// Theme variant assets: a theme variant only ships a CSS chunk + (optional) per-sub-
// brand themeConfig. Everything else (decorations / materials / branding /
// fonts) is inherited from the parent, so we only cache the css string here.
interface CachedThemeAssets {
  css: string;
  themeConfig: ThemeConfig | null;
}
const themeRefCounts = new Map<string, number>();      // key = `${parent}::${theme}`
const themeAssetsCache = new Map<string, CachedThemeAssets>();
const themePending = new Map<string, Promise<CachedThemeAssets>>();

// Dedupe the "foundation styles not loaded" warning so multiple BrandProviders
// don't log it once each.
let foundationStylesChecked = false;

function normalizeDecorations(raw: unknown): DecorationConfig[] {
  if (!Array.isArray(raw)) return [];
  return raw as DecorationConfig[];
}

function normalizeThemeConfig(raw: unknown): ThemeConfig | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (!o.appearances || typeof o.appearances !== 'object') return null;
  return raw as ThemeConfig;
}

function normalizeBranding(slug: string, raw: unknown): BrandLogoContextValue {
  if (!raw || typeof raw !== 'object') {
    return { brandName: slug, logoSvg: undefined };
  }
  const o = raw as Record<string, unknown>;
  const brandName = typeof o.brandName === 'string' ? o.brandName : slug;
  const logoSvg = o.logoSvg == null ? undefined : String(o.logoSvg);
  return { brandName, logoSvg: logoSvg || undefined };
}

function normalizeFontsFoundation(raw: unknown): Record<string, unknown> | null {
  if (raw == null || typeof raw !== 'object') return null;
  return raw as Record<string, unknown>;
}

/**
 * Last-resort baked fallback. Only `jio` ships a baked CSS snapshot today
 * (see `packages/ui/cdn-bootstrap/jio.ts`). Returns null for other brands so
 * the caller can decide whether to throw or accept the empty result.
 */
async function loadBakedFallback(slug: string): Promise<CachedBrandAssets | null> {
  if (slug !== 'jio') return null;
  try {
    const fallback = (await import('@oneui/ui/cdn-bootstrap/jio-loader')) as {
      default: string;
      decorations?: unknown;
      themeConfig?: unknown;
      materialsFoundation?: unknown;
      branding?: unknown;
      fontsFoundation?: unknown;
    };
    return {
      css: fallback.default,
      decorations: normalizeDecorations(fallback.decorations),
      themeConfig: normalizeThemeConfig(fallback.themeConfig),
      materialsFoundation: normalizeMaterialFoundationConfig(fallback.materialsFoundation),
      branding: normalizeBranding(slug, fallback.branding),
      fontsFoundation: normalizeFontsFoundation(fallback.fontsFoundation),
    };
  } catch {
    return null;
  }
}

function loadBrandAssets(slug: string): Promise<CachedBrandAssets> {
  if (assetsCache.has(slug)) return Promise.resolve(assetsCache.get(slug)!);
  const existing = pending.get(slug);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const mod = (await import('@oneui/ui/brand-loader')) as {
        brands?: Record<
          string,
          () => Promise<{
            default: string;
            decorations?: unknown;
            themeConfig?: unknown;
            materialsFoundation?: unknown;
            branding?: unknown;
            fontsFoundation?: unknown;
          }>
        >;
      };
      const loader = mod?.brands?.[slug];
      if (loader) {
        const chunk = await loader();
        const css = chunk.default;

        // Empty CSS = plugin ran but CDN was unreachable and no cache existed.
        // The virtual module resolved successfully (so the catch-block fallback
        // below didn't fire), but the brand has no actual CSS to render. Try
        // the baked snapshot as a last resort before handing back an empty
        // brand that would render unstyled.
        if (css.length === 0) {
          const baked = await loadBakedFallback(slug);
          if (baked !== null) {
            // eslint-disable-next-line no-console
            console.warn(
              `[BrandProvider] virtual:oneui-brand/${slug} returned empty CSS (CDN unreachable at build time?); using baked fallback.`,
            );
            assetsCache.set(slug, baked);
            return baked;
          }
          // No baked fallback for this brand — proceed with the empty CSS
          // (consumer sees unstyled brand-scoped content). Surface a warning
          // so this isn't silent.
          // eslint-disable-next-line no-console
          console.warn(
            `[BrandProvider] virtual:oneui-brand/${slug} returned empty CSS and no baked fallback exists for "${slug}". Brand will render unstyled until the CDN serves content.`,
          );
        }

        const decorations = normalizeDecorations(chunk.decorations);
        const themeConfig = normalizeThemeConfig(chunk.themeConfig);
        const materialsFoundation = normalizeMaterialFoundationConfig(chunk.materialsFoundation);
        const branding = normalizeBranding(slug, chunk.branding);
        const fontsFoundation = normalizeFontsFoundation(chunk.fontsFoundation);
        const out: CachedBrandAssets = {
          css,
          decorations,
          themeConfig,
          materialsFoundation,
          branding,
          fontsFoundation,
        };
        assetsCache.set(slug, out);
        return out;
      }
    } catch {
      /* fall through to fallback */
    }

    const baked = await loadBakedFallback(slug);
    if (baked !== null) {
      assetsCache.set(slug, baked);
      return baked;
    }

    throw new Error(
      `[BrandProvider] no loader for brand "${slug}". Install @oneui/vite-plugin and list "${slug}" in oneui.brands.json.`,
    );
  })();

  pending.set(slug, promise);
  promise.finally(() => pending.delete(slug));
  return promise;
}

function mountStyle(slug: string, css: string): void {
  if (typeof document === 'undefined') return;
  const id = styleIdFor(slug);
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    el.setAttribute('data-oneui-brand', slug);
    document.head.appendChild(el);
  }
  if (el.textContent !== css) el.textContent = css;
}

function acquire(slug: string): void {
  refCounts.set(slug, (refCounts.get(slug) ?? 0) + 1);
}

function release(slug: string): void {
  const next = (refCounts.get(slug) ?? 0) - 1;
  if (next <= 0) {
    refCounts.delete(slug);
    if (typeof document !== 'undefined') {
      document.getElementById(styleIdFor(slug))?.remove();
    }
  } else {
    refCounts.set(slug, next);
  }
}

// ─── Theme variant chunk loading ─────────────────────────────────────────────────
//
// Theme variant chunks are registered in the vite-plugin virtual module under
// `themes["<parentSlug>::<themeSlug>"]`. The loader returns the theme variant
// delta CSS plus an optional theme variant-specific themeConfig (palette differs
// from the parent for the 4 overridden roles).
function loadThemeAssets(parent: string, theme: string): Promise<CachedThemeAssets> {
  const key = themeCacheKey(parent, theme);
  if (themeAssetsCache.has(key)) return Promise.resolve(themeAssetsCache.get(key)!);
  const existing = themePending.get(key);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const mod = (await import('@oneui/ui/brand-loader')) as {
        themes?: Record<
          string,
          () => Promise<{ default: string; themeConfig?: unknown }>
        >;
      };
      const loader = mod?.themes?.[key];
      if (!loader) {
        throw new Error(
          `[BrandProvider] no loader for theme variant "${parent}/${theme}". `
          + `Add it to oneui.brands.json: { "brand": "${parent}", "themes": ["${theme}"] }`,
        );
      }
      const chunk = await loader();
      const out: CachedThemeAssets = {
        css: chunk.default,
        themeConfig: normalizeThemeConfig(chunk.themeConfig),
      };
      themeAssetsCache.set(key, out);
      return out;
    } finally {
      themePending.delete(key);
    }
  })();

  themePending.set(key, promise);
  return promise;
}

function mountThemeStyle(parent: string, theme: string, css: string): void {
  if (typeof document === 'undefined') return;
  const id = themeStyleIdFor(parent, theme);
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    el.setAttribute('data-oneui-brand', parent);
    el.setAttribute('data-oneui-theme', theme);
    // Insert AFTER the parent's style tag so the delta sits later in the
    // cascade — equal-specificity wins go to the later rule, which matches
    // the theme variant. (Selector specificity already differs by one attribute,
    // so order is belt-and-braces.)
    const parentEl = document.getElementById(styleIdFor(parent));
    if (parentEl?.parentNode) {
      parentEl.parentNode.insertBefore(el, parentEl.nextSibling);
    } else {
      document.head.appendChild(el);
    }
  }
  if (el.textContent !== css) el.textContent = css;
}

function acquireTheme(parent: string, theme: string): void {
  const key = themeCacheKey(parent, theme);
  themeRefCounts.set(key, (themeRefCounts.get(key) ?? 0) + 1);
}

function releaseTheme(parent: string, theme: string): void {
  const key = themeCacheKey(parent, theme);
  const next = (themeRefCounts.get(key) ?? 0) - 1;
  if (next <= 0) {
    themeRefCounts.delete(key);
    if (typeof document !== 'undefined') {
      document.getElementById(themeStyleIdFor(parent, theme))?.remove();
    }
  } else {
    themeRefCounts.set(key, next);
  }
}

function toDecorationMap(list: DecorationConfig[]): Map<string, DecorationConfig> {
  const map = new Map<string, DecorationConfig>();
  for (const d of list) {
    if (d?.componentName) map.set(d.componentName, d);
  }
  return map;
}

function BrandProviderTree({
  fontsFoundation,
  themeConfig,
  materialsFoundation,
  logoValue,
  decorationMap,
  iconSet,
  children,
  error,
}: {
  fontsFoundation: Record<string, unknown> | null;
  themeConfig: ThemeConfig | null;
  materialsFoundation: MaterialFoundationDefaults;
  logoValue: BrandLogoContextValue;
  decorationMap: Map<string, DecorationConfig>;
  iconSet: IconSetId;
  children: ReactNode;
  error: Error | null;
}) {
  useBrandFonts(fontsFoundation);

  return (
    <IconProvider iconSet={iconSet}>
      <MaterialFoundationProvider value={materialsFoundation}>
        <BrandFoundationProvider value={themeConfig}>
          <BrandLogoContext.Provider value={logoValue}>
            <DecorationProvider decorations={decorationMap}>
              {error ? null : children}
              {error ? (
                <div
                  style={{
                    padding: 'var(--Spacing-3)',
                    color: 'var(--Negative-Bold)',
                    fontFamily: 'var(--Typography-Font-Primary)',
                    fontSize: 'var(--Body-S-FontSize)',
                    lineHeight: 'var(--Body-S-LineHeight)',
                    fontWeight: 'var(--Body-FontWeight-Low)',
                  }}
                >
                  BrandProvider error: {error.message}
                </div>
              ) : null}
            </DecorationProvider>
          </BrandLogoContext.Provider>
        </BrandFoundationProvider>
      </MaterialFoundationProvider>
    </IconProvider>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BrandProvider({
  brand = 'jio',
  theme,
  mode = 'light',
  syncDocumentDimensions = true,
  density = 'default',
  iconSet = 'jio',
  registerIcons = true,
  className,
  style,
  children,
  onBrandLoaded,
  onBrandError,
  onThemeLoaded,
  onThemeError,
}: BrandProviderProps) {
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [decorations, setDecorations] = useState<DecorationConfig[]>([]);
  const [parentThemeConfig, setParentThemeConfig] = useState<ThemeConfig | null>(null);
  const [variantThemeConfig, setVariantThemeConfig] = useState<ThemeConfig | null>(null);
  const [materialsFoundation, setMaterialsFoundation] = useState<MaterialFoundationDefaults>(
    () => normalizeMaterialFoundationConfig(null),
  );
  const [branding, setBranding] = useState<BrandLogoContextValue>({});
  const [fontsFoundation, setFontsFoundation] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const previousBrandRef = useRef<string | null>(null);
  const previousThemeRef = useRef<{ parent: string; theme: string } | null>(null);
  const instanceId = useId();

  // Theme variant's themeConfig (when present) wins so <Surface> + components
  // resolve from the theme variant's palette. Falls back to parent.
  const themeConfig = variantThemeConfig ?? parentThemeConfig;

  const decorationMap = useMemo(() => toDecorationMap(decorations), [decorations]);

  useLayoutEffect(() => {
    if (registerIcons !== false) {
      void ensureIconSetRegistered(iconSet);
    }
  }, [iconSet, registerIcons]);

  useLayoutEffect(() => {
    if (!syncDocumentDimensions || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-density', density);
    root.setAttribute('data-6-Density', density);
  }, [syncDocumentDimensions, density]);

  // One-time check on mount: warn if the consumer forgot
  // `import '@jds4/oneui-react/styles'`. We probe `--Spacing-2` which is part
  // of foundation primitives and must resolve to a non-empty value for
  // anything in @jds4/oneui-react to render correctly. Module-level flag so
  // multiple BrandProviders share one warning.
  useEffect(() => {
    if (typeof window === 'undefined' || foundationStylesChecked) return;
    foundationStylesChecked = true;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--Spacing-2')
      .trim();
    if (value.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(
        '[@jds4/oneui-react] Foundation styles not detected on <html>. '
        + 'Did you forget `import "@jds4/oneui-react/styles";` in your app entry? '
        + 'Components will render without spacing / typography / colour tokens.',
      );
    }
  }, []);

  useEffect(() => {
    if (!syncDocumentDimensions || typeof window === 'undefined') return;
    // Resolve the S/M/L tier from the canonical 619/990 ladder and set
    // data-Breakpoint="S|M|L" so scale.css @media overrides + brand grid/
    // dimension overrides apply (matches the platform app). See gridCSS.ts.
    const update = () => {
      document.documentElement.setAttribute(
        'data-Breakpoint',
        resolveBreakpointRange(window.innerWidth),
      );
    };
    update();
    const breakpoints = [620, 991];
    const mediaQueries = breakpoints.map((bp) => window.matchMedia(`(min-width: ${bp}px)`));
    const handler = () => update();
    mediaQueries.forEach((mq) => mq.addEventListener('change', handler));
    return () => {
      mediaQueries.forEach((mq) => mq.removeEventListener('change', handler));
    };
  }, [syncDocumentDimensions]);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    loadBrandAssets(brand)
      .then(({ css, decorations: deco, themeConfig: tc, materialsFoundation: mf, branding: br, fontsFoundation: ff }) => {
        if (cancelled) return;
        mountStyle(brand, css);
        acquire(brand);

        if (previousBrandRef.current && previousBrandRef.current !== brand) {
          release(previousBrandRef.current);
        }
        previousBrandRef.current = brand;
        setDecorations(deco);
        setParentThemeConfig(tc);
        setMaterialsFoundation(mf);
        setBranding(br);
        setFontsFoundation(ff);
        setActiveBrand(brand);
        onBrandLoaded?.(brand);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(err);
        onBrandError?.(brand, err);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  // Theme variant load — sequential after parent. Runs only once `activeBrand`
  // matches the requested `brand` (i.e. parent CSS is in the DOM). On failure
  // we keep the parent mounted (graceful degrade) and surface via callback.
  useEffect(() => {
    if (activeBrand !== brand) return;
    if (!theme) {
      // Theme variant cleared — release the previous one if any.
      if (previousThemeRef.current) {
        releaseTheme(previousThemeRef.current.parent, previousThemeRef.current.theme);
        previousThemeRef.current = null;
      }
      setActiveTheme(null);
      setVariantThemeConfig(null);
      return;
    }

    let cancelled = false;

    loadThemeAssets(brand, theme)
      .then(({ css, themeConfig: tc }) => {
        if (cancelled) return;
        mountThemeStyle(brand, theme, css);
        acquireTheme(brand, theme);

        const prev = previousThemeRef.current;
        if (prev && (prev.parent !== brand || prev.theme !== theme)) {
          releaseTheme(prev.parent, prev.theme);
        }
        previousThemeRef.current = { parent: brand, theme };
        setVariantThemeConfig(tc);
        setActiveTheme(theme);
        onThemeLoaded?.(brand, theme);
      })
      .catch((err) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error(`[BrandProvider] theme variant "${brand}/${theme}" failed to load — falling back to parent accents.`, err);
        // Release the previous theme variant (if any) so the cascade goes back to
        // pure parent. Do NOT throw — the parent is still mounted and usable.
        if (previousThemeRef.current) {
          releaseTheme(previousThemeRef.current.parent, previousThemeRef.current.theme);
          previousThemeRef.current = null;
        }
        setActiveTheme(null);
        setVariantThemeConfig(null);
        onThemeError?.(brand, theme, err);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrand, brand, theme]);

  useEffect(() => {
    return () => {
      if (previousBrandRef.current) release(previousBrandRef.current);
      if (previousThemeRef.current) {
        releaseTheme(previousThemeRef.current.parent, previousThemeRef.current.theme);
      }
    };
  }, []);

  if (!activeBrand && !error) return null;

  const wrapperBrand = activeBrand ?? brand;
  const scopeValue: BrandScopeValue = {
    brand: wrapperBrand,
    // Mirror the wrapper <div> below: only advertise the theme once its delta
    // CSS is actually mounted (`activeTheme`). While the theme chunk is in
    // flight — or after a failed load — we omit it so portals fall back to the
    // parent's accents instead of carrying a `data-theme` no CSS targets.
    theme: activeTheme ?? undefined,
    mode,
    instanceId,
  };

  return (
    <BrandScopeProvider value={scopeValue}>
      <div
        data-brand={wrapperBrand}
        // Only set data-theme when its CSS is actually mounted. While the
        // theme variant chunk is in flight (or after a failed load), we render
        // with the parent attribute only so the cascade falls back cleanly to
        // parent accents instead of leaving the wrapper with a dangling
        // attribute that no CSS targets.
        {...(activeTheme ? { 'data-theme': activeTheme } : {})}
        data-mode={mode}
        data-oneui-brand-instance={instanceId}
        className={className}
        style={{ display: 'contents', ...style }}
      >
        <BrandProviderTree
          fontsFoundation={fontsFoundation}
          themeConfig={themeConfig}
          materialsFoundation={materialsFoundation}
          logoValue={branding}
          decorationMap={decorationMap}
          iconSet={iconSet}
          error={error}
        >
          {children}
        </BrandProviderTree>
      </div>
    </BrandScopeProvider>
  );
}
