# @oneui/native-cdn

Brand-data prefetch CLI for OneUI **React Native**. Fetches each brand's `latest.json` from the CDN, writes it into `node_modules/.oneui-cached/`, and automatically wires the import into your app entry file — giving you instant first paint with zero network dependency on device.

---

## How it works

```
npx oneui-native-cdn prefetch
        │
        ├─► node_modules/.oneui-cached/
        │       ├── index.js         ← generated CJS manifest (registers brand data)
        │       ├── index.d.ts       ← TypeScript declarations (import type-checks)
        │       ├── package.json     ← makes .oneui-cached importable by Metro / Node
        │       └── brand-data/
        │           ├── jio/
        │           │   ├── latest.json
        │           │   └── sub-brands/jiomart/latest.json
        │           └── tira/
        │               └── latest.json
        │
        └─► app/_layout.tsx          ← import '.oneui-cached'; auto-injected (idempotent)
```

When `.oneui-cached` is imported by Metro, `index.js` calls `registerBrandCache()` from `@oneui/ui-native`, populating an in-memory map that `<OneUIBrandProvider>` reads synchronously on first render. The data is baked into the Metro bundle — no fetch, no loading state, no network needed on the device.

**The import is auto-wired** — `prefetch` detects your app entry file and inserts `import '.oneui-cached';` at the top automatically. The injection is idempotent: running `prefetch` again will not add a duplicate line.

```tsx
// String slug → resolved from .oneui-cached automatically
<OneUIBrandProvider brand="jio" theme="jiomart" mode="light">
  <App />
</OneUIBrandProvider>

// Fallback: if .oneui-cached was not prefetched, or the slug isn't in the cache,
// the provider falls back to the bundled Jio default snapshot.
```

---

## Install

```bash
npm install ./vendor/oneui-native-cdn-0.1.0-alpha.3.tgz
```

> The package is distributed as a tgz and installed via a `file:` reference in `package.json`.

---

## The two CDN payload shapes

| File on CDN | Shape | Maps to |
| --- | --- | --- |
| `<brand>/latest.json` | `{ foundation, components? }` → `BrandData` | `brand` prop |
| `<brand>/sub-brands/<sub>/latest.json` | `{ themeData }` → `ThemeData` | `theme` prop |

Sub-brands are accent deltas, not standalone brands. To render a sub-brand, the parent's foundation data and the sub-brand's theme delta are both required — the provider merges them. For a plain parent brand, omit `theme`.

---

## Prefetch (recommended)

### 1. Create `oneui.brands.json` in the app root

```json
{
  "cdnUrl": "https://myjiostatic.cdn.jio.com/JDS/ReactNative",
  "brands": {
    "jio":  { "subBrands": ["jiomart"] },
    "tira": "latest"
  }
}
```

`cdnUrl` is the base **up to (not including) `brand-data`** — the tool appends `/brand-data/<brand>/latest.json`. The config above fetches:

- `…/brand-data/tira/latest.json`
- `…/brand-data/jio/latest.json` **and** `…/brand-data/jio/sub-brands/jiomart/latest.json`

| Field | Required | Description |
| --- | --- | --- |
| `cdnUrl` | yes* | CDN base up to (not including) `brand-data`. |
| `brands.<slug>` | yes | `"latest"` (parent only) or `{ version?, subBrands? }`. |
| `…version` | no | File stem to fetch. Default `"latest"`. |
| `…subBrands` | no | Sub-brand slugs to also fetch as theme deltas. |

\* `cdnUrl` may instead come from `--cdn-url` or the `ONEUI_CDN_URL` env var. `brands` must live in this file.

### 2. Run the prefetch

```bash
npx oneui-native-cdn prefetch
```

```
[@oneui/native-cdn] prefetching brand-data → node_modules/.oneui-cached
  ✓ jio/latest.json
    ✓ jio/sub-brands/jiomart/latest.json
  ✓ tira/latest.json
[@oneui/native-cdn] 3/3 variant(s) ready → manifest node_modules/.oneui-cached/index.js
[@oneui/native-cdn] ✓ wired import into app/_layout.tsx
```

The CLI auto-detects your entry file (`app/_layout.tsx` → `App.tsx` → `index.tsx`) and inserts:

```ts
// Managed by oneui-native-cdn prefetch — do not remove.
import '.oneui-cached';
```

at the very top. This is idempotent — re-running `prefetch` will not add a duplicate.

Wire it into your scripts so it runs before every dev start:

```jsonc
// package.json
"scripts": {
  "start": "oneui-native-cdn prefetch && expo start",
  "ios":   "oneui-native-cdn prefetch && expo start --ios"
}
```

### 3. Use string slugs in `<OneUIBrandProvider>`

After prefetch, `@oneui/ui-native`'s provider resolves strings directly — the import is already wired by the CLI:

```tsx
import { OneUIBrandProvider } from '@oneui/ui-native';

export default function App() {
  return (
    // brand="jio"      → reads CDN_BRAND_DATA['jio'] from .oneui-cached
    // theme="jiomart"  → reads CDN_THEME_DATA['jio::jiomart'] from .oneui-cached
    // Fallback: if slug not found → DEFAULT_JIO_BRAND_DATA (bundled Jio snapshot)
    <OneUIBrandProvider brand="jio" theme="jiomart" mode="light">
      {/* your app */}
    </OneUIBrandProvider>
  );
}
```

You can also access the manifest accessors directly if you need the raw data:

```tsx
import { getCdnBrandData, getCdnThemeData } from '@oneui/ui-native';

const brandData = getCdnBrandData('jio');            // BrandData | undefined
const themeData = getCdnThemeData('jio', 'jiomart'); // ThemeData | undefined
```

### Object props still work (Convex / offline JSON)

Passing an object bypasses the cache lookup entirely:

```tsx
const foundationData = useQuery(api.foundations.getBrandOverviewData, ...);
const componentData  = useQuery(api.componentTokenOverrides.getAllBrandComponentData, ...);

<OneUIBrandProvider
  brand={{ foundation: foundationData, components: componentData }}
  mode="light"
  loadingFallback={<Spinner />}
>
  {/* your app */}
</OneUIBrandProvider>
```

---

## Runtime fetch (OTA, via `@oneui/native-cdn` directly)

For over-the-air brand updates without a new app build, use `useCdnBrandData` and `OneUICdnProvider` from `@oneui/native-cdn` directly. This is separate from `@oneui/ui-native`'s built-in cache lookup.

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OneUICdnProvider, useCdnBrandData, createAsyncStorageCache } from '@oneui/native-cdn';
import { OneUIBrandProvider } from '@oneui/ui-native';

function Root() {
  return (
    <OneUICdnProvider
      cdnUrl="https://myjiostatic.cdn.jio.com/JDS/ReactNative"
      storage={createAsyncStorageCache(AsyncStorage)}
    >
      <Themed />
    </OneUICdnProvider>
  );
}

function Themed() {
  const { brandData, themeData, status, error } = useCdnBrandData('jio', 'jiomart');

  if (status === 'error') return <ErrorView error={error} />;

  return (
    <OneUIBrandProvider
      brand={brandData}
      theme={themeData}
      mode="light"
      loadingFallback={<Spinner />}
    >
      {/* your app */}
    </OneUIBrandProvider>
  );
}
```

**`useCdnBrandData(brand, variant?, options?)`** returns:

| Field | Meaning |
| --- | --- |
| `brandData` | `BrandData \| undefined` → `brand` prop |
| `themeData` | `ThemeData \| null` → `theme` prop |
| `status` | `'loading' \| 'success' \| 'error'` |
| `source` | `'cache' \| 'network' \| undefined` |
| `error` | latest failure (set even while cache is shown) |
| `refetch()` | force a fresh revalidation |

Options: `cdnUrl`, `version` (`'latest'`), `storage`, `cachePrefix` (`'oneui-cdn:'`), `revalidate` (`true`), `enabled` (`true`).

> **Hybrid:** prefetch for instant first paint, then use `useCdnBrandData` to pull fresh data over the air.

### Cache adapters

| Adapter | Use when |
| --- | --- |
| `createMemoryStorage()` *(default)* | dev / testing (no cold-start persistence) |
| `createAsyncStorageCache(AsyncStorage)` | most apps (Expo + bare CLI) |
| `createFileSystemCache(backend)` | apps without AsyncStorage (`expo-file-system` / `react-native-fs`) |

---

## CLI reference

```
oneui-native-cdn prefetch [options]
```

| Flag | Default | Description |
| --- | --- | --- |
| `--cdn-url <url>` | config / `ONEUI_CDN_URL` | CDN base (overrides config). |
| `--config <file>` | `oneui.brands.json` | Brand config path. |
| `--cache-dir <dir>` | `node_modules/.oneui-cached` | Output directory. |
| `--out <file>` | `<cache-dir>/index.js` | Generated manifest path. |
| `--offline` | off | Skip the network; use existing cache only. |
| `--no-inject` | off | Skip auto-injection of `import '.oneui-cached';` into the entry file. Add it manually when this flag is set. |
| `--entry <file>` | auto-detected | Override the app entry file to inject into (relative to cwd). Auto-detection order: `app/_layout.tsx` → `App.tsx` → `index.tsx`. |

**Resilience:** `404` → skip that brand (stale cache removed); `5xx` / network error → reuse cache with a warning; never throws, so a transient outage won't break `expo start`.

Programmatic API: `import { prefetchBrandData } from '@oneui/native-cdn/prefetch'`.

---

## Generated manifest shape

The generated `node_modules/.oneui-cached/index.js` (CJS) exports:

```ts
// index.d.ts — also generated for TypeScript consumers
export declare const CDN_BRAND_DATA: Record<string, unknown>;
export declare const CDN_THEME_DATA: Record<string, unknown>;
export declare const CDN_BRANDS: Array<{ brand: string; variant: string }>;
export declare function getCdnBrandData(brand: string): unknown | undefined;
export declare function getCdnThemeData(brand: string, variant?: string): unknown | undefined;
```

On import, `index.js` calls `registerBrandCache(CDN_BRAND_DATA, CDN_THEME_DATA)` from `@oneui/ui-native`, which populates the in-memory map that `OneUIBrandProvider` reads when a string slug is passed. Metro statically detects `import '.oneui-cached'` in the entry file and bundles the manifest into the app.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `cdnUrl not set` | Add `cdnUrl` to `oneui.brands.json`, pass `--cdn-url`, or set `ONEUI_CDN_URL`. |
| `no brands configured` | Add a `brands` map to `oneui.brands.json`. |
| `command not found: oneui-native-cdn` | Run via `npx oneui-native-cdn prefetch`. |
| Brand data not updating | Re-run `npx oneui-native-cdn prefetch` and restart Metro with `--clear`. |
| `✗ <brand>/latest.json` in output | URL 404'd or wasn't valid JSON — check the slug and `cdnUrl`. |
| String slug falls back to Jio default | Either `prefetch` hasn't been run, or the slug doesn't match what's in `oneui.brands.json`. |
| Auto-inject didn't find the entry file | Use `--entry <path>` to specify it manually, e.g. `--entry src/App.tsx`. |
| Duplicate `import '.oneui-cached'` | The injection is idempotent — this should not happen. If seen, check that only one import statement is present and remove the duplicate manually. |
| TS error `Cannot find module '.oneui-cached'` | Re-run `npx oneui-native-cdn prefetch` to regenerate `index.d.ts`, then restart your TS server. |
