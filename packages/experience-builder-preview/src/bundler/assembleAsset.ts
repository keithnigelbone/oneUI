/**
 * assembleAsset.ts — BUNDLE-01.
 *
 * The missing foundation of the Daytona render path. Turns the compiler's
 * generated artifact (TSX source that imports `@oneui/ui`) into ONE
 * self-contained HTML asset that mounts and renders with zero network access.
 *
 * Per D-03 the bundler does NOT regenerate codegen: it consumes the compiler's
 * TSX (`import { Button } from '@oneui/ui'; export function GeneratedArtifact()`)
 * as input, rewrites the `@oneui/ui` import to the pre-built playground bundle,
 * supplies a real React/ReactDOM runtime, inlines the brand CSS for `brandId`,
 * and esbuilds a wrapper to a single HTML string (RESEARCH Pattern 1 + 2).
 *
 * Scope fence: this module NEVER imports the Daytona SDK — the vendor import
 * lives only in `DaytonaExecutor.ts` (CI import-guard).
 */

// NOTE: esbuild is loaded at RUNTIME via `require_('esbuild')` inside
// assembleAsset() — NOT a static `import`. esbuild ships a native platform
// binary (`@esbuild/<platform>/bin/esbuild`); a static import pulls that binary
// into the Next/Turbopack module graph for the `/api/experience-lab/run` route
// and the bundler dies trying to parse it ("invalid utf-8 sequence"). A
// createRequire() require is left as a real Node require at runtime (the same
// reason `require_.resolve('react/...')` below is safe), so the binary never
// enters the bundle. `serverExternalPackages` in next.config.js is the second
// layer of defence. Keep this a runtime require.
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { precomputeBrandCSSNew, wrapCSSForInjection } from '@oneui/shared/engine';
// `PrecomputeInput` isn't re-exported from the engine barrel — import the type
// from the submodule (the package exposes `./engine/*`).
import type { PrecomputeInput } from '@oneui/shared/engine/precompute';

const require_ = createRequire(import.meta.url);
const __dirnameLocal = dirname(fileURLToPath(import.meta.url));

/** The virtual-module specifier the artifact's `@oneui/ui` import is rewritten to. */
const ONEUI_BUNDLE_SPECIFIER = 'oneui-bundle';

/** The component name `compile()` always emits (compiler.ts GENERATED_ARTIFACT_NAME). */
const GENERATED_ARTIFACT_NAME = 'GeneratedArtifact';

/**
 * Input shape. A subset of the frozen `RenderInput` seam (do NOT change the
 * seam): the compiler's TSX `bundle`, the artifact's `brandId`, and the
 * optional parsed `ast` (currently unused — the bundler consumes the TSX, not
 * the AST, per D-03).
 */
export interface AssembleAssetInput {
  /** The compiler's generated TSX source (imports `@oneui/ui`). */
  bundle: string;
  /** The artifact's brand id — drives the inlined brand CSS. */
  brandId: string;
  /** Real precomputed foundation CSS from the host app, when available. */
  brandCss?: string;
  /** Optional parsed AST. Unused here (D-03); accepted for seam compatibility. */
  ast?: unknown;
}

/**
 * Rewrite the artifact's `@oneui/ui` import source to the playground virtual
 * module so esbuild resolves the component library against the pre-built
 * bundle (RESEARCH Pattern 1 — never re-bundle `@oneui/ui` per run). React /
 * ReactDOM are left to resolve to the real monorepo copies.
 */
function rewriteOneUIImport(tsx: string): string {
  return tsx.replace(
    /from\s*['"]@oneui\/ui['"]/g,
    `from '${ONEUI_BUNDLE_SPECIFIER}'`,
  );
}

/**
 * Locate the CI-built playground ESM bundle (`pnpm build:playground` output).
 * Returned only when present so the prod path reuses the real 18MB bundle.
 */
function findPlaygroundBundle(): string | null {
  // packages/experience-builder-preview/src/bundler -> packages/ui/dist/playground
  const candidate = resolve(
    __dirnameLocal,
    '../../../ui/dist/playground/oneui-playground.mjs',
  );
  return existsSync(candidate) ? candidate : null;
}

/** Read the CI-built playground token CSS if present (sibling of the mjs). */
function findPlaygroundCss(): string | null {
  const candidate = resolve(
    __dirnameLocal,
    '../../../ui/dist/playground/oneui-playground.css',
  );
  return existsSync(candidate) ? readFileSync(candidate, 'utf8') : null;
}

/**
 * esbuild plugin that resolves the rewritten `oneui-bundle` specifier.
 *
 * Prod path: resolve to the CI-built `oneui-playground.mjs` (everything but
 * React already inlined). When that artifact is absent (unit tests without a
 * `build:playground` step), fall back to a deterministic virtual module that
 * exposes every named component as a placeholder React component via a Proxy —
 * keeping the asset self-contained and the bundle output byte-stable without
 * pulling the 18MB dist into the test.
 */
function oneuiBundlePlugin(playgroundMjs: string | null, virtualResolveDir: string) {
  return {
    name: 'oneui-bundle-resolver',
    setup(buildApi: {
      onResolve: (
        opts: { filter: RegExp },
        cb: (args: { path: string }) =>
          | { path: string }
          | { path: string; namespace: string }
          | undefined,
      ) => void;
      onLoad: (
        opts: { filter: RegExp; namespace: string },
        cb: () => { contents: string; loader: 'js'; resolveDir: string },
      ) => void;
    }) {
      buildApi.onResolve({ filter: new RegExp(`^${ONEUI_BUNDLE_SPECIFIER}$`) }, () => {
        if (playgroundMjs) return { path: playgroundMjs };
        return { path: ONEUI_BUNDLE_SPECIFIER, namespace: 'oneui-bundle-virtual' };
      });
      buildApi.onLoad(
        { filter: /.*/, namespace: 'oneui-bundle-virtual' },
        () => ({
          // resolveDir anchors the virtual module's own `import 'react'` to the
          // workspace React copy (virtual namespaces have no implicit dir).
          resolveDir: virtualResolveDir,
          // A namespace Proxy: any named export resolves to a placeholder React
          // component (renders its children in a <div data-oneui-stub>). This is
          // a deterministic stand-in ONLY when the real bundle isn't built; the
          // prod path always resolves to oneui-playground.mjs above.
          contents: `import * as React from 'react';
const placeholder = (name) => {
  const C = (props) => React.createElement('div', { 'data-oneui-stub': name }, props && props.children);
  C.displayName = name;
  return C;
};
const cache = new Map();
const handler = {
  get(_t, prop) {
    if (typeof prop !== 'string') return undefined;
    if (prop === '__esModule') return true;
    if (prop === 'default') return handler.get(_t, 'OneUI');
    if (!cache.has(prop)) cache.set(prop, placeholder(prop));
    return cache.get(prop);
  },
};
const ns = new Proxy({}, handler);
module.exports = ns;
`,
          loader: 'js',
        }),
      );
    },
  };
}

/**
 * Force every React import in the assembled asset through the preview package's
 * runtime. The prebuilt playground bundle lives under `packages/ui`, whose
 * local dependency links can resolve a different React copy in dev worktrees.
 */
function reactRuntimePlugin() {
  return {
    name: 'react-runtime-resolver',
    setup(buildApi: {
      onResolve: (
        opts: { filter: RegExp },
        cb: (args: { path: string }) => { path: string },
      ) => void;
    }) {
      buildApi.onResolve({ filter: /^react(?:\/.*)?$/ }, (args) => ({
        path: require_.resolve(args.path),
      }));
      buildApi.onResolve({ filter: /^react-dom(?:\/.*)?$/ }, (args) => ({
        path: require_.resolve(args.path),
      }));
    },
  };
}

/**
 * Generate the brand `@layer brand` CSS string SERVER-SIDE via the pure engine
 * (RESEARCH Pattern 2 — never the `useBrandCSS` React hook). Falls back to the
 * engine's built-in scales/neutral role when no per-brand foundation config is
 * supplied, so the asset always carries a real `@layer brand` block (which is
 * also the PREV-01 zero-egress proof surface — all CSS inlined, no fetch).
 */
function generateBrandLayerCss(brandId: string): string {
  // Deterministic per brandId. A real foundation loader is wired by the
  // DaytonaExecutor caller (Plan 04); here we use the engine defaults so the
  // asset is self-contained and the output is byte-stable for a given brandId.
  const input: PrecomputeInput = {
    colorConfig: null,
    presetSelection: null,
    appearanceConfig: {
      accentCount: 1,
      background: { scaleName: 'Neutral', backgroundStep: { light: 2500, dark: 200 } },
      accents: [{ role: 'primary', label: 'Primary', scaleName: 'Neutral', baseStep: 1300 }],
    },
    typographyConfig: null,
  };

  const { rawCSS, contextCSS } = precomputeBrandCSSNew(input, 'light');
  // wrapCSSForInjection emits `@layer brand { :root { ... } }` (+ context blocks).
  const wrapped = wrapCSSForInjection(rawCSS, 'global', contextCSS);
  // Always carry an @layer brand wrapper, even if the engine produced no decls
  // for a degenerate brand — the brand id is recorded as a stable comment.
  if (wrapped) return wrapped;
  return `@layer brand {\n  :root {\n    /* brand: ${brandId} (engine defaults) */\n  }\n}`;
}

/**
 * Token CSS for the `<style id="oneui-tokens">` block. Prefers the CI-built
 * `oneui-playground.css` (the full token cascade); otherwise emits the canonical
 * `@layer` declaration so cascade order is correct. NEVER `<link>`s a CDN
 * (Pitfall 4 / PREV-01) — all token CSS is inlined.
 */
function tokenCss(): string {
  const playgroundCss = findPlaygroundCss();
  if (playgroundCss) return playgroundCss;
  return '@layer base, semantic, theme, density, brand;';
}

/**
 * The Daytona asset is a real website document, not the platform app shell.
 * Keep page-level vertical scrolling enabled and establish a root Surface
 * context so generated sections inherit the same cascade Storybook uses.
 */
function previewDocumentCss(): string {
  return `html {
  min-height: 100%;
  background: var(--Surface-Fill-Default, var(--Surface-Main));
}

body {
  min-height: 100%;
  margin: var(--Spacing-0, 0);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: auto;
  background: var(--Surface-Fill-Default, var(--Surface-Main));
  color: var(--Text-High);
  font-family: var(--Typography-Font-Primary);
  font-size: var(--Body-M-FontSize);
  line-height: var(--Body-M-LineHeight);
  font-weight: var(--Body-FontWeight-Low);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

#root {
  min-height: 100vh;
  width: 100%;
  isolation: isolate;
}`;
}

/**
 * Assemble a generated artifact into ONE self-contained HTML string.
 *
 * Pipeline (RESEARCH Pattern 1 + 2):
 *   1. Rewrite the artifact's `@oneui/ui` import to the `oneui-bundle` alias.
 *   2. Build an esbuild ENTRY that imports real React + createRoot, imports the
 *      artifact, and renders `GeneratedArtifact` into `#root`.
 *   3. esbuild.build({ stdin, bundle, write:false, format:'iife', minify }) with
 *      the alias resolved to the pre-built playground bundle.
 *   4. Generate + inline the brand CSS for `brandId` server-side.
 *   5. Emit one HTML string with token CSS, brand CSS, `#root`, and the iife.
 */
export async function assembleAsset(input: AssembleAssetInput): Promise<string> {
  const { bundle, brandId } = input;

  // Runtime require (see top-of-file note): keeps esbuild's native binary out of
  // the Next/Turbopack module graph. `typeof import('esbuild')` is a type-only
  // construct (erased at build) so it gives `build` its real type without
  // creating a traced static import.
  const { build } = require_('esbuild') as typeof import('esbuild');

  const rewritten = rewriteOneUIImport(bundle);
  const playgroundMjs = findPlaygroundBundle();

  // esbuild ENTRY: real React runtime + the artifact + mount into #root.
  const entry = `import * as React from 'react';
import { createRoot } from 'react-dom/client';
${rewritten}
const __el = document.getElementById('root');
if (__el) createRoot(__el).render(React.createElement(${GENERATED_ARTIFACT_NAME}));
`;

  // The preview package root (…/experience-builder-preview) and the worktree
  // root node_modules — both anchor esbuild's resolution of react/react-dom to
  // the workspace copies (RESEARCH Assumption A2).
  const previewPkgRoot = resolve(__dirnameLocal, '../..');
  const reactPkgDir = dirname(require_.resolve('react/package.json'));
  const workspaceNodeModules = resolve(reactPkgDir, '..');

  const result = await build({
    stdin: {
      contents: entry,
      // Resolve react / react-dom against the preview package's deps.
      resolveDir: previewPkgRoot,
      loader: 'tsx',
      sourcefile: 'entry.tsx',
    },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    jsx: 'automatic',
    // Minify whitespace/syntax but PRESERVE identifiers so the artifact name
    // (`GeneratedArtifact`) and `createRoot` stay referenceable/inspectable —
    // the asset stays compact while remaining debuggable and assertable.
    minifyWhitespace: true,
    minifySyntax: true,
    minifyIdentifiers: false,
    // Deterministic output (no embedded timestamps/paths beyond the inputs).
    legalComments: 'none',
    logLevel: 'silent',
    plugins: [reactRuntimePlugin(), oneuiBundlePlugin(playgroundMjs, previewPkgRoot)],
    // Resolve bare 'react' / 'react-dom/client' to the workspace copies even
    // for imports originating in a virtual namespace module (RESEARCH A2).
    nodePaths: [workspaceNodeModules],
  });

  const js = result.outputFiles[0].text;

  const brandLayerCss = input.brandCss?.trim() || generateBrandLayerCss(brandId);
  const tokens = tokenCss();
  const documentCss = previewDocumentCss();

  // One self-contained HTML document. All CSS inlined (no <link>, no CDN). The
  // <html> carries the foundation data attributes the cascade expects.
  return `<!doctype html>
<html data-theme="light" data-density="default" data-Breakpoint="L" suppressHydrationWarning>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style id="oneui-tokens">${tokens}</style>
<style id="oneui-foundation-tokens">${brandLayerCss}</style>
<style id="oneui-preview-document">${documentCss}</style>
</head>
<body data-surface="default" data-surface-step="2500" data-appearance="primary">
<div id="root"></div>
<script>${js}</script>
</body>
</html>
`;
}
