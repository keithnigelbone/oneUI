# @oneui/vite-plugin

Build-time brand CSS delivery for OneUI. Pairs with `<BrandProvider>` from `@oneui/ui`.

## What it does

1. Reads `oneui.brands.json` (or inline options) to learn which brands the consumer wants.
2. Fetches each brand's assets from the OneUI CDN on every build / dev-server start into a folder per slug under `node_modules/.oneui-cache/brands/<slug>/`:
   - `brand.css`
   - `decorations.json`, `themeConfig.json`, `materials.json`, `branding.json`
   - `fonts.json` (only when the CDN serves it)

   **Sync policy:** always force-fetch from the CDN; on **5xx / network error**, fall back to whatever's in the cache (with a warning). On **404** (CDN intentionally absent), the stale cache file is deleted and the artefact's default is used. Set `offline: true` to skip the network entirely. Brand folders not in `oneui.brands.json` are pruned at startup.
3. Exposes brand manifests in the consumer's bundle graph:
   - `virtual:oneui-brands` — manifest of lazy loaders, one per brand (legacy import; still supported).
   - `@jds4/oneui-react/brand-loader` / `@oneui/ui/brand-loader` — same manifest; **preferred** import path used by `BrandProvider`.
   - `virtual:oneui-brand/<slug>` — code-split JS chunk exporting `default` (CSS string), `decorations`, `themeConfig`, `materialsFoundation`, `branding`, and `fontsFoundation` for `BrandProvider`.
4. `BrandProvider` dynamic-imports the active brand's chunk, injects it as a `<style>` element, and wires `BrandFoundationProvider`, `BrandLogoContext`, `useBrandFonts`, and `DecorationProvider` so CDN consumers track Storybook / platform behaviour.

## Install

```bash
pnpm add -D @oneui/vite-plugin
```

## Configure

### `oneui.brands.json` (project root)

```json
{
  "cdnUrl": "https://myjiostatic.cdn.jio.com/JDS",
  "brands": {
    "jio": "latest",
    "reliance": "latest",
    "tira": "latest"
  }
}
```

- `cdnUrl` — base URL of the OneUI CDN (where `/brands/<slug>/latest.css` lives).
- `brands` — slug → version. `"latest"` or a pinned semver. Each brand listed here is fetched + cached.

### `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { oneui } from '@oneui/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    oneui(),
  ],
});
```

Or pass everything inline (overrides the JSON):

```ts
oneui({
  cdnUrl: 'https://myjiostatic.cdn.jio.com/JDS',
  brands: { jio: 'latest', reliance: 'latest' },
  cacheDir: 'node_modules/.oneui-cache',  // override
  offline: false,                          // never touch the network
})
```

### TypeScript (vite-env.d.ts)

```ts
/// <reference types="@oneui/vite-plugin/client" />
```

## Use at runtime

```tsx
import { BrandProvider, Button, IconProvider } from '@oneui/ui';

function App() {
  const [brand, setBrand] = useState('jio');
  return (
    <IconProvider iconSet="lucide" defaultSize="md">
      <BrandProvider brand={brand} theme="light" density="default">
        <Button onClick={() => setBrand('reliance')}>Switch to Reliance</Button>
      </BrandProvider>
    </IconProvider>
  );
}
```

Brand switch → plugin's pre-bundled chunk loads → `<style id="oneui-brand-reliance">` replaces `<style id="oneui-brand-jio">`. Old chunk stays in browser cache, instant on switch-back.

## Options reference

| Option       | Type                              | Default                                          | Notes                                                            |
| ------------ | --------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| `cdnUrl`     | `string`                          | env `ONEUI_CDN_URL`, then `oneui.brands.json`    | Required.                                                        |
| `brands`     | `Record<string, string>`          | `oneui.brands.json`                              | Slug → version. Required.                                        |
| `configFile` | `string`                          | `./oneui.brands.json`                            | Path relative to project root.                                   |
| `cacheDir`   | `string`                          | `node_modules/.oneui-cache`                      | Where fetched CSS is written.                                    |
| `offline`    | `boolean`                         | `false`                                          | Never throws: reuses cached `.css` when possible, else writes empty placeholders (no network). |

## Notes

- **Resilience:** Wrong `cdnUrl`, HTTP **404** on the version file, or a dead network does **not** crash `vite` / `vite build`. On 404 the stale cache is deleted and the virtual module emits empty CSS; on 5xx / network error the plugin falls back to cached files if present (warning logged). For the `jio` brand, `<BrandProvider>` then loads the **baked snapshot** shipped in `@jds4/oneui-react` so the app still renders branded. Other brands render unstyled with a warning. Sidecars degrade individually (404 → `[]` / `null` / slug fallback).
- The plugin re-fetches every brand on every dev-server start / build — pinning `"latest"` actually picks up the latest tip. If the user bumps a pinned version, the old `brand.css` is wiped before fetch so a transient network failure can't silently serve the previous version's content. Manual cache bust: `rm -rf node_modules/.oneui-cache/`.
- HMR: editing `node_modules/.oneui-cache/manifest.json` invalidates every virtual module. Touching any file under `node_modules/.oneui-cache/brands/<slug>/` (`brand.css`, `decorations.json`, `themeConfig.json`, `materials.json`, `branding.json`, `fonts.json`) invalidates that slug's virtual chunk.
- Brand selection is selector-scoped (`[data-brand="..."][data-mode="..."]`), so nested `<BrandProvider>`s render different brands in the same document. Only the outer provider should set `syncDocumentDimensions` (default `true`) so nested trees pass `syncDocumentDimensions={false}` and avoid fighting over `<html>` attributes.

## Architecture

See **`cdn-release-full-pipeline/docs/README.md`** (index) and **`cdn-release-full-pipeline/docs/PLAN-v3-clean.md`** (v3 CDN + consumer design: folder layout, plugin cache, refcounted styles, fallbacks).
