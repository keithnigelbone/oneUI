/**
 * playground/template.ts
 *
 * Factory for the Sandpack file map that boots the AI playground iframe.
 * Designed to be **pure data** — no React, no Convex, no Next imports —
 * so it can run on the server side too (e.g. for the verify pipeline's
 * Puppeteer renderer in P4.1).
 *
 * The bundle (`@oneui/playground`) and its CSS are served from the parent
 * app's `/sandpack/` static directory and pulled into the iframe as a
 * virtual node_modules entry. This keeps cold start fast — the bundle is
 * cached by the browser after first load, and Sandpack's bundler resolves
 * `@oneui/playground` from the virtual mount instead of npm.
 *
 * Brand CSS and the user-authored TSX are passed in by the caller and
 * land at `/foundation.css` and `/App.tsx` respectively. Both are mutable
 * via `sandpack.updateFile()` after the iframe has booted.
 */

import type { PlaygroundIconSet } from './icon';
import {
  MSG_THEME,
  MSG_DENSITY,
  MSG_PLATFORM,
  MSG_SELECT,
  JIO_CATALOG_WINDOW_KEY,
} from './messageTypes';

const PLAYGROUND_ICON_SETS: readonly PlaygroundIconSet[] = [
  'lucide', 'jio', 'tabler', 'hugeicons', 'phosphor', 'remix',
];

export interface PlaygroundTemplateInput {
  /** TSX source for `/App.tsx`. Must default-export a React component. */
  appCode: string;
  /** Brand CSS — output of `useBrandCSS(...)`. Wrapped in `@layer brand`
   *  by the engine, so it doesn't need extra wrapping. Pass `''` for the
   *  default page surfaces (no brand active yet). */
  foundationCSS: string;
  /** Pre-built ESM source for `@oneui/playground` — fetched once by the
   *  parent from `/sandpack/oneui-playground.mjs` and threaded in here.
   *  Inlined as a virtual node_modules file so Sandpack's bundler resolves
   *  it locally instead of trying npm. */
  bundleSource: string;
  /** Pre-built CSS for `@oneui/playground` — fetched from
   *  `/sandpack/oneui-playground.css` and inlined the same way as the JS.
   *  Inlining is necessary because Sandpack's iframe runs on a different
   *  origin (e.g. `*.csb.app`) where the parent's `/sandpack/*` path is
   *  unreachable, so a `<link href="/sandpack/...">` would 404. */
  bundleCSS: string;
  /** `data-mode` to set on the iframe `<html>`. */
  theme?: 'light' | 'dark' | 'dim';
  /** `data-density` to set on the iframe `<html>`. */
  density?: 'compact' | 'default' | 'open';
  /** `data-Breakpoint` to set on the iframe `<html>` so the dimension
   *  cascade resolves against the device frame width. */
  platform?: 'S' | 'M' | 'L';
  /** Brand-selected icon set. Threaded into the iframe's IconProvider
   *  at boot. Lucide and Jio are bundled (Jio via `jioCatalog` below);
   *  others fall back to Lucide. Changing iconSet requires an iframe
   *  remount (use `key={iconSet}` on the parent SandpackProvider). */
  iconSet?: PlaygroundIconSet;
  /** Pre-fetched Jio icon catalog (the contents of
   *  `apps/platform/public/jio-icons-data.json`). Inlined as a Sandpack
   *  file so the iframe can read it without a cross-origin fetch. Pass
   *  `undefined` to skip — Jio icons will fall back to Lucide. */
  jioCatalog?: string;
  /** Root-relative public files mirrored into Sandpack's file map so
   *  generated `/playground-assets/...` image URLs can resolve inside the
   *  cross-origin iframe. Callers may include both `/public/...` and
   *  root `/playground-assets/...` keys for compatibility with Sandpack's
   *  static serving behaviour. */
  publicFiles?: Record<string, string>;
}

const PACKAGE_JSON = JSON.stringify(
  {
    name: '@oneui/playground',
    version: '0.0.0',
    type: 'module',
    main: './index.mjs',
    module: './index.mjs',
  },
  null,
  2,
);

interface BuildIndexTsxOptions {
  iconSet: string;
  hasJioCatalog: boolean;
}

function buildIndexTsx({ iconSet, hasJioCatalog }: BuildIndexTsxOptions): string {
  // Sanity-strip the iconSet so we don't accidentally inject arbitrary
  // strings into the iframe's source. Allowlist comes from the canonical
  // `PlaygroundIconSet` union (re-exported from @oneui/shared).
  const safeSet = (PLAYGROUND_ICON_SETS as readonly string[]).includes(iconSet)
    ? iconSet
    : 'lucide';
  // Jio catalog: when supplied, it lives at /jio-icons-data.json as a
  // Sandpack virtual file. Reading it via fetch from the iframe is fine
  // (the URL resolves through Sandpack's bundler, same origin as the
  // iframe). We stash it on `window.__jioIconCatalog` so the playground
  // Icon component (rendered later by App.tsx) can resolve synchronously.
  const jioCatalogLoad = hasJioCatalog
    ? `import jioCatalog from './jio-icons-data.json';
(window as Record<string, unknown>)['${JIO_CATALOG_WINDOW_KEY}'] = jioCatalog;`
    : '';
  return `import React from 'react';
import { createRoot } from 'react-dom/client';
import { IconProvider } from '@oneui/playground';
import App from './App';
import './oneui-bundle.css';
import './styles.css';
${jioCatalogLoad}

// The iframe's <html> may not have the right data-attributes if Sandpack
// uses its own template. Set them imperatively before mount so the token
// cascade resolves correctly on first paint.
const root = document.documentElement;
if (!root.getAttribute('data-mode')) root.setAttribute('data-mode', 'light');
if (!root.getAttribute('data-density')) root.setAttribute('data-density', 'default');
if (!root.getAttribute('data-6-Density')) root.setAttribute('data-6-Density', root.getAttribute('data-density') ?? 'default');
// Canonical S/M/L breakpoint attribute (drives scale.css + brand grid/dimension
// overrides). Defaults to L (desktop) for the playground viewport.
if (!root.getAttribute('data-Breakpoint')) root.setAttribute('data-Breakpoint', 'L');

// Listen for theme/density/platform changes from the parent. Avoids a
// full iframe remount on toggle — the parent posts \`{ type, value }\`
// and we update the cascade attribute in place. The token CSS @layer
// cascade re-resolves automatically.
window.addEventListener('message', (event) => {
  const msg = event.data as { type?: string; value?: string } | null;
  if (!msg || typeof msg.type !== 'string' || typeof msg.value !== 'string') return;
  if (msg.type === '${MSG_THEME}') document.documentElement.setAttribute('data-mode', msg.value);
  else if (msg.type === '${MSG_DENSITY}') {
    document.documentElement.setAttribute('data-density', msg.value);
    document.documentElement.setAttribute('data-6-Density', msg.value);
  }
  else if (msg.type === '${MSG_PLATFORM}') document.documentElement.setAttribute('data-Breakpoint', msg.value);
});

// Selection bridge: capture clicks on any element that carries the
// \`data-oneui-loc\` attribute (server-side annotator injects them on
// every JSX opening tag) and post the location + tag name back to the
// parent. The parent's CanvasPanel uses this to highlight the clicked
// element and pin it for the next revision prompt. Capture-phase
// listener so component event handlers don't preventDefault().
document.addEventListener('click', (event) => {
  const target = event.target as Element | null;
  if (!target || typeof target.closest !== 'function') return;
  const annotated = target.closest('[data-oneui-loc]') as HTMLElement | null;
  if (!annotated) return;
  // Suppress for inputs / interactive controls so we don't hijack
  // their native behaviour. The user can shift-click to select those.
  const tag = annotated.tagName.toLowerCase();
  const isInteractive = tag === 'button' || tag === 'a' || tag === 'input' || tag === 'textarea' || tag === 'select';
  if (isInteractive && !event.shiftKey) return;
  event.stopPropagation();
  event.preventDefault();
  window.parent?.postMessage(
    {
      type: '${MSG_SELECT}',
      loc: annotated.getAttribute('data-oneui-loc'),
      tag: annotated.getAttribute('data-oneui-component') ?? annotated.tagName,
    },
    '*',
  );
}, true);

const container = document.getElementById('root');
if (!container) throw new Error('No #root in playground iframe.');

// IconProvider wraps the app at the iframe entry so every \`<Icon name="...">\`
// resolves regardless of whether the AI-generated App.tsx wraps it. The
// iconSet here mirrors the brand's selection from PlatformContext —
// templated in by the parent at file-build time; remounting the iframe
// is how we apply changes (rare).
createRoot(container).render(
  <React.StrictMode>
    <IconProvider iconSet="${safeSet}" defaultSize="md">
      <App />
    </IconProvider>
  </React.StrictMode>,
);
`;
}

/**
 * Compose the file map. The two mutable files (`/App.tsx` and
 * `/foundation.css`) sit at known paths so the parent can target them
 * with `sandpack.updateFile()` later.
 */
export function buildPlaygroundFiles(input: PlaygroundTemplateInput): Record<string, { code: string }> {
  const theme = input.theme ?? 'light';
  const density = input.density ?? 'default';
  const platform = input.platform ?? 'L';

  return {
    '/package.json': {
      code: JSON.stringify(
        {
          name: 'oneui-playground-iframe',
          version: '0.0.0',
          main: '/index.tsx',
          dependencies: {
            react: '^18.3.0',
            'react-dom': '^18.3.0',
          },
        },
        null,
        2,
      ),
    },

    // Sandpack injects this as the iframe's index.html. We set the
    // root data-attributes here so the token cascade resolves correctly
    // before React mounts. Brand CSS comes in via `/foundation.css`.
    '/public/index.html': {
      code: `<!DOCTYPE html>
<html lang="en" data-mode="${theme}" data-density="${density}" data-6-Density="${density}" data-Breakpoint="${platform}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OneUI Playground</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
    },

    '/index.tsx': {
      code: buildIndexTsx({
        iconSet: input.iconSet ?? 'lucide',
        hasJioCatalog: Boolean(input.jioCatalog),
      }),
    },

    '/App.tsx': { code: input.appCode },

    // Jio icon catalog (optional). Conditionally included so brands not
    // using the Jio set don't pay the ~830KB iframe boot cost.
    ...(input.jioCatalog
      ? { '/jio-icons-data.json': { code: input.jioCatalog } }
      : {}),

    // Public image assets. Keep both Sandpack public-folder and root-path
    // variants available; the playground Image wrapper also resolves local
    // asset URLs back to the parent app origin when Sandpack serves a
    // cross-origin iframe.
    ...Object.fromEntries(
      Object.entries(input.publicFiles ?? {}).map(([path, code]) => [path, { code }]),
    ),

    // Token CSS bundle, inlined as a Sandpack file. This carries the
    // `@layer base|semantic|theme|density` declarations + all the token
    // values from `@oneui/tokens`. Inlined (not <link>'d) because the
    // Sandpack iframe runs on a different origin where the parent's
    // `/sandpack/*` path is unreachable.
    '/oneui-bundle.css': { code: input.bundleCSS },

    '/styles.css': {
      code: `/* Brand CSS. Mutable — parent updates this file via
   sandpack.updateFile('/foundation.css', css) which is then re-imported
   here. The @import keeps Sandpack's CSS bundler aware of the dependency. */
@import url('./foundation.css');

html, body, #root { margin: 0; padding: 0; min-height: 100vh; }
body { background: var(--Surface-Main, #fff); color: var(--Text-High, #000); }
`,
    },

    '/foundation.css': { code: input.foundationCSS },

    // Virtual node_modules entry. Sandpack's bundler resolves
    // `@oneui/playground` to this mount instead of fetching from npm.
    // The bundle is large (~18MB raw, ~3.5MB gzipped) but inlined here
    // because Sandpack's bundler can't handle external URL re-exports —
    // the source has to resolve locally. The parent fetches once and
    // caches across versions; only `/App.tsx` and `/foundation.css` get
    // updated on subsequent generations.
    '/node_modules/@oneui/playground/package.json': { code: PACKAGE_JSON },
    '/node_modules/@oneui/playground/index.mjs': { code: input.bundleSource },
  };
}

/**
 * Default `App.tsx` shown before any AI generation has run. Uses real
 * `@oneui/playground` components so designers see something credible
 * the moment they flip the renderer flag, not a hello-world.
 */
export const DEFAULT_PLAYGROUND_APP_TSX = `import { Surface, Button } from '@oneui/playground';

export default function App() {
  return (
    <Surface mode="default" as="main" style={{ minHeight: '100vh', padding: 'var(--Spacing-7)' }}>
      <h1 style={{ margin: 0, fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Headline-L-FontSize)', lineHeight: 'var(--Headline-L-LineHeight)', fontWeight: 'var(--Headline-L-FontWeight)' }}>
        OneUI Playground
      </h1>
      <p style={{ marginTop: 'var(--Spacing-3)', color: 'var(--Primary-Medium-Text)', fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Body-M-FontSize)', lineHeight: 'var(--Body-M-LineHeight)', fontWeight: 'var(--Body-FontWeight-Low)' }}>
        Ask the agent to build something — your composition will render here.
      </p>
      <Surface mode="subtle" as="section" style={{ marginTop: 'var(--Spacing-5)', padding: 'var(--Spacing-5)', borderRadius: 'var(--Shape-4)' }}>
        <Button appearance="primary">Start composing</Button>
      </Surface>
    </Surface>
  );
}
`;
