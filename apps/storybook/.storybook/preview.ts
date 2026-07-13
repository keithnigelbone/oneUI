import type { Decorator, Preview } from '@storybook/react-vite';
import { withPerformanceMonitor } from '@github-ui/storybook-addon-performance-panel';
import type { BreakpointId, DensityId } from '@oneui/shared';
import { resolveBreakpointRange } from '@oneui/shared';
import { IconProvider, setJioIconLoader } from '@oneui/ui/icons/IconContext';
import { isComponentReleased } from '../../../packages/ui/src/registry/releasedComponents';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import React from 'react';
import { BrandStyleInjector } from './BrandStyleDecorator';

// CSS cascade layers — MUST be first
import '@oneui/tokens/css/layers';

// Token CSS imports - Dimension scale must load BEFORE primitives
import '@oneui/tokens/css/dimensions/scale';
import '@oneui/tokens/css/dimensions/grid';

// Typography — relational f-step aliases (after scale, before primitives)
import '@oneui/tokens/css/typography';

// Primitives and semantic
import '@oneui/tokens/css';
import '@oneui/tokens/css/semantic';

// Theme CSS imports
import '@oneui/tokens/css/light';
import '@oneui/tokens/css/dark';
// dim.css removed — V4 dropped dim mode (light/dark only)

// Density CSS imports (individual to avoid @import resolution issues)
import '@oneui/tokens/css/density/compact';
import '@oneui/tokens/css/density/open';

// Materials CSS imports
import '@oneui/tokens/css/materials';

// Storybook preview styles
import './preview.css';

// Jio icon loader — JSON via Vite (monorepo root is in fs.allow in main.ts)
import jioIconsRaw from '../../../apps/platform/public/jio-icons-data.json';

// Convex client — preview is Vite-bundled, so use import.meta.env
// Check multiple env var names: VITE_CONVEX_URL (.env.local), CONVEX_URL (main.ts env()),
// STORYBOOK_CONVEX_URL (Storybook convention).
//
// STORYBOOK_OFFLINE=1 short-circuits Convex entirely. The offline brand
// provider below loads `@jds/kb-core/brands/<slug>.json` and exposes it on
// globalThis.__JDS_OFFLINE_BRAND__ so the BrandStyleInjector / brand-CSS
// engine can read it the same way live decorators consume foundation data.
const _env = (import.meta as any).env ?? {};
const STORYBOOK_OFFLINE = _env.STORYBOOK_OFFLINE === '1';
const STORYBOOK_OFFLINE_BRAND = (_env.STORYBOOK_OFFLINE_BRAND as string) || 'jio-mobile';
const convexUrl = STORYBOOK_OFFLINE
  ? undefined
  : ((_env.VITE_CONVEX_URL ?? _env.CONVEX_URL ?? _env.STORYBOOK_CONVEX_URL) as string | undefined);
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

// Offline brand provider — fires once at preview boot when STORYBOOK_OFFLINE=1.
// Prefer JSON injected in main.ts (Node, config-time) so the browser bundle
// never imports @jds/kb-core (node:fs). Fall back to loadOfflineBrand.ts for
// local offline dev when kb-core is built.
declare const __STORYBOOK_OFFLINE_BUILD__: 'true' | 'false';
if (STORYBOOK_OFFLINE) {
  const injected = ((_env.STORYBOOK_OFFLINE_BRAND_JSON as string | undefined) ?? '').trim();
  if (injected) {
    try {
      (globalThis as { __JDS_OFFLINE_BRAND__?: unknown }).__JDS_OFFLINE_BRAND__ =
        JSON.parse(injected);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[storybook offline] Failed to parse injected brand snapshot', err);
    }
  } else if (__STORYBOOK_OFFLINE_BUILD__ === 'true') {
    void (async () => {
      try {
        const { loadOfflineBrandSnapshot } = await import('./loadOfflineBrand');
        await loadOfflineBrandSnapshot(STORYBOOK_OFFLINE_BRAND);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[storybook offline] Failed to load brand via kb-core', err);
      }
    })();
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      `[storybook offline] No brand snapshot injected for "${STORYBOOK_OFFLINE_BRAND}" — ` +
        'running without brand styling. (Generate dist/brands/<slug>.json via snapshot-brands.)'
    );
  }
}

/**
 * Convex provider decorator - wraps the entire story tree.
 * If the Convex URL is not configured, renders without Convex.
 */
/**
 * WIP tag injector — reads the story title, extracts the component name
 * (last path segment, strips any existing " [WIP]" suffix), and injects the
 * 'wip' tag into context.tags when the component is not in ALLOWED_COMPONENTS.
 * This is the single source of truth for WIP status; individual story files
 * do not need to set tags: ['wip'] manually.
 */
const withWipTag: Decorator = (Story, context) => {
  const segments = (context.title ?? '').split('/');
  const rawName = segments[segments.length - 1] ?? '';
  const componentName = rawName.replace(/\s*\[WIP\]$/, '').trim();
  const isStable = isComponentReleased(componentName);
  if (!isStable && !context.tags.includes('wip')) {
    context.tags = [...context.tags, 'wip'];
  }
  return React.createElement(Story);
};

const withConvex: Decorator = (Story) => {
  if (!convex) {
    return React.createElement(Story);
  }
  return React.createElement(ConvexProvider, { client: convex }, React.createElement(Story));
};

/**
 * Brand style decorator - reads the brand ID from globals (set by the
 * toolbar addon in manager.tsx) and injects dynamic foundation CSS.
 *
 * Loading guard: when a brand is selected, the story wrapper starts hidden
 * and fades in once brand CSS is injected (via data-brand-ready attribute).
 * This prevents the visible flash of base tokens before brand colors load.
 * When no brand is selected, stories render immediately with base tokens.
 */
const withBrandStyle: Decorator = (Story, context) => {
  const brandId = context.globals.brand;
  // Convex theme variant ID (sub-brand config). Distinct from light/dark `mode`.
  const themeVariantId = (context.globals.theme as string) || undefined;
  const rawMode = (context.globals.mode as string) || 'light';
  const mode = rawMode === 'dim' ? 'dark' : rawMode === 'dark' ? 'dark' : 'light';

  // When a brand is selected, the wrapper uses the loading guard class.
  // CSS rule: `.story-wrapper-loading` starts hidden, then
  // `[data-brand-ready] .story-wrapper-loading` reveals it.
  const hasBrand = !!(brandId && convex);

  const storyElement = React.createElement(
    'div',
    { className: hasBrand ? 'story-wrapper story-wrapper-loading' : 'story-wrapper' },
    React.createElement(Story)
  );

  // When a brand is selected, wrap the story inside BrandStyleInjector so that
  // DecorationProvider context propagates to all components in the story tree.
  // Previously, BrandStyleInjector was a sibling of the story — contexts don't
  // propagate to siblings, so buttons never received decoration configs.
  if (hasBrand) {
    return React.createElement(
      BrandStyleInjector,
      { brandId, themeVariantId, mode },
      storyElement
    );
  }

  return storyElement;
};

// Resolve an explicit toolbar breakpoint to a canonical S/M/L id. The toolbar
// value may already be an S/M/L id, or a numeric width (mapped via the shared
// 619/990 ladder so Storybook and the platform app agree). 'responsive' means
// "follow the live viewport" and returns null.
function breakpointFromToolbar(breakpointValue: string): BreakpointId | null {
  if (breakpointValue === 'responsive') return null;
  if (breakpointValue === 'S' || breakpointValue === 'M' || breakpointValue === 'L') {
    return breakpointValue;
  }
  const width = parseInt(breakpointValue, 10);
  if (Number.isNaN(width)) return null;
  return resolveBreakpointRange(width);
}

/**
 * PlatformDensityScope — sets data attributes on <html> for dimension resolution.
 *
 * Mirrors the platform app's PlatformContext.tsx pattern:
 * - Sets data-Breakpoint, data-6-Density, data-density on document.documentElement
 * - scale.css attribute selectors resolve --Dimension-f* at :root
 * - primitives.css / typography.css var() aliases cascade correctly on same element
 * - Brand dimension CSS (@layer brand) overrides scale.css when brand has custom sizes
 *
 * When `breakpointValue === 'responsive'`, the S/M/L breakpoint is derived live
 * from the iframe's own `window.innerWidth` and tracked via matchMedia — so
 * "Responsive" truly follows the Storybook preview viewport, matching the
 * platform app's PlatformContext behavior.
 *
 * IMPORTANT: No inline style overrides on <html>. Inline styles have higher
 * specificity than ANY CSS layer, which would block brand dimension CSS
 * (@layer brand) from overriding the static table values. The CSS layer
 * cascade (base → brand) handles everything correctly.
 */
function PlatformDensityScope({
  density,
  breakpointValue,
  story: Story,
}: {
  density: DensityId;
  breakpointValue: string;
  story: React.ComponentType;
}) {
  // When an explicit breakpoint is picked, resolve the S/M/L tier statically.
  // When 'responsive', track the iframe's real viewport width so the cascade
  // reflects the actual preview size (mirrors PlatformContext.tsx).
  const [liveViewportBreakpoint, setLiveViewportBreakpoint] = React.useState<BreakpointId>(() => {
    if (typeof window === 'undefined') return 'L';
    return resolveBreakpointRange(window.innerWidth);
  });

  React.useLayoutEffect(() => {
    if (breakpointValue !== 'responsive' || typeof window === 'undefined') return;
    const update = () => setLiveViewportBreakpoint(resolveBreakpointRange(window.innerWidth));
    update();
    // Listen on the same 619/990 ladder PlatformContext.tsx uses.
    const breakpoints = [620, 991];
    const mediaQueries = breakpoints.map((bp) => window.matchMedia(`(min-width: ${bp}px)`));
    mediaQueries.forEach((mq) => mq.addEventListener('change', update));
    return () => {
      mediaQueries.forEach((mq) => mq.removeEventListener('change', update));
    };
  }, [breakpointValue]);

  const breakpoint: BreakpointId = breakpointFromToolbar(breakpointValue) ?? liveViewportBreakpoint;

  React.useLayoutEffect(() => {
    const root = document.documentElement;
    // Canonical data-Breakpoint="S|M|L" drives the dimension cascade; an explicit
    // toolbar breakpoint wins over the live viewport (see breakpointFromToolbar).
    root.setAttribute('data-Breakpoint', breakpoint);
    root.setAttribute('data-6-Density', density);
    root.setAttribute('data-density', density);
  }, [breakpoint, density]);

  return React.createElement(
    'div',
    {
      className: 'platform-scope',
      'data-density': density,
    },
    React.createElement(Story)
  );
}

/**
 * Combined platform + density decorator.
 * Reads breakpoint and density from globals (set by the unified toolbar addon
 * in manager.tsx). The `platform` global drives which breakpoints are offered
 * in the toolbar (see manager.tsx), but the V2 platform ID used for dimension
 * resolution is derived entirely from the selected breakpoint (or the live
 * viewport when 'responsive').
 */
const withPlatformAndDensity: Decorator = (Story, context) => {
  const density = (context.globals.density || 'default') as DensityId;
  const breakpointValue = (context.globals.breakpoint as string) || 'responsive';

  return React.createElement(PlatformDensityScope, {
    key: `${density}-${breakpointValue}`,
    density,
    breakpointValue,
    story: Story,
  });
};

/** Jio icon loader for Storybook — icons built on-demand and cached. */
const jioIconsData = jioIconsRaw as Record<string, { v: string; d: string }>;
const jioComponentCache: Record<string, any> = {};

function loadJioIconForStorybook(name: string): Promise<any> {
  if (jioComponentCache[name]) return Promise.resolve(jioComponentCache[name]);
  const iconData = jioIconsData[name];
  if (!iconData) return Promise.resolve(null);
  const SvgIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) =>
    React.createElement('svg', {
      ref,
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: iconData.v,
      ...props,
      dangerouslySetInnerHTML: { __html: iconData.d },
    })
  );
  SvgIcon.displayName = `JioIcon_${name}`;
  jioComponentCache[name] = SvgIcon;
  return Promise.resolve(SvgIcon);
}

// Register Jio loader at module load time (before any story renders)
setJioIconLoader(loadJioIconForStorybook);

/**
 * Icon provider decorator - wraps stories with IconProvider
 * Uses Jio icon set (loaded from jio-icons-data.json via Storybook staticDirs)
 */
const withIcons: Decorator = (Story) => {
  return React.createElement(IconProvider, {
    iconSet: 'jio',
    defaultSize: 'md',
    children: React.createElement(Story),
  });
};

/**
 * Sets `data-mode` on `<html>` for the static token cascade (light.css / dark.css).
 * Uses the `mode` global — not `theme`, which is reserved for brand theme variants.
 */
const withDocumentMode: Decorator = (Story, context) => {
  const raw = (context.globals.mode as string) || 'light';
  const mode = raw === 'dim' ? 'dark' : raw === 'dark' ? 'dark' : 'light';

  function DocumentModeScope() {
    React.useLayoutEffect(() => {
      if (typeof document === 'undefined') return;
      document.documentElement.setAttribute('data-mode', mode);
    }, [mode]);
    return React.createElement(Story);
  }

  return React.createElement(DocumentModeScope);
};

// Plain `Preview` default export — required for the Storybook 10 docs renderer
// to register correctly.
//
// `@github-ui/storybook-addon-performance-panel`: the addon preset only
// registers the manager panel (`managerEntries`). It does not merge preview
// decorators, so `withPerformanceMonitor` must be listed here or the
// Performance tab stays inactive.
//
// Why not `definePreview({ addons: [...] })` for this addon: that pattern can
// skip the framework's docs renderer injection and break /docs/ routes.
const preview: Preview = {
  // Storybook 10: initialGlobals sets starting values for all toolbar-driven globals.
  initialGlobals: {
    brand: '',
    theme: '',
    mode: 'light',
    platform: '',
    breakpoint: 'responsive',
    density: 'default',

    backgrounds: {
      value: 'surface',
    },
  },
  // All toolbar controls (brand, platform, breakpoint, density) are managed
  // by the unified toolbar addon in manager.tsx. We declare them here as
  // globalTypes so the preview decorators can read context.globals.*.
  // No toolbar config — the addon handles the UI.
  globalTypes: {
    brand: {
      name: 'Brand',
      description: 'Brand selection (controlled by toolbar addon)',
    },
    theme: {
      name: 'Theme',
      description: 'Brand theme variant (Convex sub-brand config; driven by brand toolbar)',
    },
    mode: {
      name: 'Mode',
      description: 'Light / dark visual mode',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    platform: {
      name: 'Platform',
      description: 'Platform (driven by brand)',
    },
    breakpoint: {
      name: 'Breakpoint',
      description: 'Viewport breakpoint (driven by platform)',
    },
    density: {
      name: 'Density',
      description: 'Density mode (driven by brand)',
    },
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
        ],
      },
    },
    backgrounds: {
      options: {
        surface: { name: 'canvas surface', value: 'var(--Surface-Main)' },
        subtle: { name: 'canvas subtle (not Surface context)', value: 'var(--Surface-Subtle)' },
        bold: { name: 'canvas bold (not Surface context)', value: 'var(--Surface-Bold)' },
      },
    },
    options: {
      storySort: {
        order: [
          'Components',
          [
            'Navigation',
            [
              'Carousel',
              [
                'Docs',
                'Overview',
                'Platform Presets',
                'Adoption Matrix',
                [
                  'Desktop',
                  [
                    'Docs',
                    'Default',
                    'Pagination',
                    'Pagination On Media',
                    'Selection Rail',
                    'Selection Rail On Media',
                    'Full Width',
                    'Aspect Ratios',
                  ],
                ],
                [
                  'Tablet',
                  [
                    'Docs',
                    'Default',
                    'Pagination',
                    'Pagination On Media',
                    'Selection Rail',
                    'Selection Rail On Media',
                    'Full Width',
                    'Aspect Ratios',
                  ],
                ],
                [
                  'Mobile',
                  [
                    'Docs',
                    'Default',
                    'Pagination',
                    'Pagination On Media',
                    'Selection Rail',
                    'Selection Rail On Media',
                    'Selection Rail Overflow',
                    'Full Width',
                    'Aspect Ratios',
                  ],
                ],
              ],
            ],
            '*',
          ],
        ],
      },
    },
  },
  decorators: [
    withPerformanceMonitor,
    withWipTag,
    withIcons,
    withBrandStyle,
    withPlatformAndDensity,
    withDocumentMode,
    withConvex,
  ],
};

// Spread onto a literal default export so SB 10 can statically read `tags` (warns on
// `export default preview` alone when experimentalComponentsManifest is enabled).
export default { tags: [], ...preview };
