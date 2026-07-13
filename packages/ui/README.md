# @jds4/oneui-react

OneUI Studio React component library — multi-brand design system for Jio (powering 7+ brands, 2 platforms, 1.4B users, 22 languages).

## Install

The fastest path is the init CLI, which detects your bundler, installs the right plugin, and scaffolds the brand config:

```bash
npx @jds4/oneui-init
```

Or install manually:

```bash
npm install @jds4/oneui-react @jds4/oneui-icons-jio

# pick the plugin that matches your bundler
npm install -D @jds4/oneui-vite-plugin     # Vite (also Astro, Remix v2+)
npm install -D @jds4/oneui-webpack-plugin  # CRA / custom Webpack / Gatsby
npm install -D @jds4/oneui-next-plugin     # Next.js
npm install -D @jds4/oneui-esbuild-plugin  # Bun / Remix v1 / custom esbuild
```

## Minimal usage

```tsx
import '@jds4/oneui-react/styles';
import { BrandProvider, Button, Icon } from '@jds4/oneui-react';

export default function App() {
  return (
    <BrandProvider brand="jio">
      <Button attention="high">
        <Icon icon="home" /> Hello, OneUI
      </Button>
      <Icon icon="IcCarSide" size="md" />
    </BrandProvider>
  );
}
```

Install `@jds4/oneui-icons-jio` alongside `@jds4/oneui-react` — `BrandProvider` registers it automatically (default `iconSet="jio"`). For a nested brand block using Lucide, install `lucide-react` and pass `iconSet="lucide"` on that inner provider.

## Without the plugin (Jio only)

You can ship a working app with **just** `@jds4/oneui-react` — no plugin, no `oneui.brands.json`, no CDN. The library bakes a snapshot of the Jio brand and uses it as a fallback:

```tsx
import '@jds4/oneui-react/styles';
import { BrandProvider, Button } from '@jds4/oneui-react';

// brand defaults to "jio"; baked CSS kicks in when no plugin is configured.
<BrandProvider>
  <Button attention="high">Works out of the box</Button>
</BrandProvider>
```

For any brand other than Jio (or if you want the latest CSS rather than the snapshot), install one of the plugins. `BrandProvider` resolves brands via `@jds4/oneui-react/brand-loader` (always build-time safe); plugins override that subpath with CDN manifests — same behaviour as the legacy `virtual:oneui-brands` module.

## With a plugin

The plugin fetches brand CSS + sidecar JSONs from your OneUI CDN at build time, caches them under `node_modules/.oneui-cache/brands/<slug>/`, and exposes them as virtual modules the library imports.

### `oneui.brands.json`

The init CLI writes this; you can edit by hand:

```json
{
  "cdnUrl": "https://myjiostatic.cdn.jio.com/JDS",
  "brands": {
    "jio": "latest",
    "reliance": "latest"
  }
}
```

Use `"latest"` for the moving tip, or pin a specific version (e.g. `"1.0.0"`). The plugin always fetches from the CDN on every dev server start — if the network or CDN is unreachable, it falls back to the cached files. Brands removed from this JSON are pruned from the cache on next start.

### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { oneui } from '@jds4/oneui-vite-plugin';

export default defineConfig({
  plugins: [oneui()], // reads oneui.brands.json
});
```

### Next.js

```js
// next.config.js
const { withOneui } = require('@jds4/oneui-next-plugin');
module.exports = withOneui()({/* your next config */});
```

Turbopack (`next dev --turbo`) is not currently supported by the plugin — use the default webpack mode for dev. Production `next build` works.

### Webpack / CRA

```js
// webpack.config.js
const { oneui } = require('@jds4/oneui-webpack-plugin');
module.exports = {
  plugins: [oneui()],
};
```

CRA users without an eject can plug this in via [craco](https://github.com/dilanx/craco) or [react-app-rewired](https://github.com/timarney/react-app-rewired).

### esbuild (Bun, Remix v1, custom scripts)

```js
// esbuild.config.mjs
import { build } from 'esbuild';
import { oneui } from '@jds4/oneui-esbuild-plugin';

await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  plugins: [oneui()],
});
```

## Surface system (the most important rule)

OneUI is built around context-aware Surfaces. **Never** put a background colour on a raw `<div>` containing OneUI components — wrap with `<Surface mode="...">` instead so components inside re-resolve their tokens against the surface step.

```tsx
// Correct — components inside re-resolve against the bold surface.
<Surface mode="bold">
  <Button attention="high">Stays distinguishable</Button>
  <Button attention="medium">Tinted fill, readable text</Button>
  <Button attention="low">Readable text, no fill</Button>
</Surface>

// Wrong — no [data-surface] = no token remapping.
<div style={{ background: 'var(--Primary-Bold)' }}>
  <Button attention="low">Broken: dark on dark</Button>
</div>
```

Surface modes: `default` · `ghost` · `minimal` · `subtle` · `moderate` · `bold` · `elevated`. See the in-repo docs for the full algorithm.

## Icons

Install `@jds4/oneui-icons-jio` for the default `iconSet="jio"`. `BrandProvider` registers loaders automatically — no manual `import '@jds4/oneui-icons-jio/register'`. Use `<Icon icon="close" />` (semantic) or `<Icon icon="IcCarSide" />` (catalog id). Six icon sets are supported (`jio`, `lucide`, `tabler`, `hugeicons`, `phosphor`, `remix`); install the matching peer package and set `iconSet` on a nested `BrandProvider`. Icon loading is **independent of the CDN plugin** — Jio works with or without a plugin. See [RFC 0005](../../docs/rfcs/0005-icon-tree-shaking-static-analysis.md) for compile-cost mitigations and known Lucide/Tabler + Webpack/Next limitations.

### Skipping icon registration (smaller bundles)

If you only use **direct** icon imports (`import { IcHome } from '@jds4/oneui-icons-jio'`) and never semantic `<Icon icon="…" />`, opt out of the loader graph:

```tsx
<BrandProvider registerIcons={false}>
  …
</BrandProvider>
```

Register once at app entry when you still need semantic icons in part of the tree:

```ts
import '@jds4/oneui-icons-jio/register';
```

## Compile budget (Next.js / Webpack)

A typical app that imports from the root barrel and uses default `BrandProvider` may compile roughly:

| Source | ~modules |
| ------ | -------- |
| `@jds4/oneui-icons-jio` register path | ~3,000 |
| `@base-ui/react` (transitive) | ~776 |
| `@jds4/oneui-react` preserveModules dist | ~715 |

**Mitigations:** prefer subpath imports (`@jds4/oneui-react/components/Button`) over the root barrel; set `registerIcons={false}` when using direct icon components only; add `transpilePackages: ['@jds4/oneui-react', '@jds4/oneui-icons-jio']` in `next.config.js` when needed.

## Storybook

The full component catalog lives in the OneUI Studio Storybook (internal). Every component documented there is exported from this package under the same name.

## Versioning & releases

Versions follow semver. Releases go through Changesets — published to the private Azure DevOps Artifacts feed `JioDS`. The CDN data and the npm packages can be updated independently.

## Upgrading from `0.1.0-alpha.9` → `0.1.0-alpha.10`

**Summary:** Typical apps (plugin + `BrandProvider` + `@jds4/oneui-react/styles`) upgrade by bumping the version. No import-path or config rewrites are required.

### What changed

| Area | alpha.9 | alpha.10 | Action for consumers |
| ---- | ------- | -------- | -------------------- |
| React | Bundled as a dependency of `@jds4/oneui-react` | **Peer dependency only** | Ensure `react` and `react-dom` `^18 \|\| ^19` are direct dependencies in your app. Run `npm ls react` — you should see **one** copy. This fixes the “Invalid hook call” / duplicate-React issues many teams hit. |
| Brand loading | `virtual:oneui-brands` | Same virtual module **plus** `@jds4/oneui-react/brand-loader` subpath | **No change** if you use the plugin and never import the virtual module yourself. Optional: prefer `brand-loader` in custom tooling. |
| Icons | `BrandProvider` always registered Jio loaders | New `registerIcons={false}` opt-out | **No change** unless you want a smaller bundle and use direct icon imports only (see [Skipping icon registration](#skipping-icon-registration-smaller-bundles)). |
| Next.js | — | `transpilePackages` recommended | Add `transpilePackages: ['@jds4/oneui-react']` (and `@jds4/oneui-icons-jio` if installed) in `next.config.js`. |
| `@jds4/oneui-icons-jio` | Monolithic internal manifest | Category-based chunks (internal) | **No change** — public exports (`/register`, package root) are unchanged. |

### Breaking changes

None for documented public APIs. The only migration that affects real apps:

1. **Declare React in your app** — `@jds4/oneui-react` no longer installs its own `react` / `react-dom`. If your `package.json` already lists them (normal for any React app), you are done.
2. **Next.js consumers** — add `transpilePackages` if the build fails to compile `@jds4/oneui-react` preserve-modules output.

### Still supported (no rewrite needed)

- `import { Button } from '@jds4/oneui-react'`
- `import { Button } from '@jds4/oneui-react/components/Button'`
- `withOneui()` / `oneui()` plugins and `oneui.brands.json`
- `import 'virtual:oneui-brands'` in app code
- `<BrandProvider brand="jio">` with default icon registration

### Optional improvements (not required to upgrade)

```tsx
// Smaller bundles when you only use Lucide / direct icon imports:
<BrandProvider iconSet="lucide" registerIcons={false}>
```

```js
// next.config.js
transpilePackages: ['@jds4/oneui-react', '@jds4/oneui-icons-jio'],
```

See [`CHANGELOG.md`](./CHANGELOG.md) for the full release note.
