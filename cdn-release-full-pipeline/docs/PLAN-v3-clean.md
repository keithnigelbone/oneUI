# OneUI CDN delivery — v3 (clean PR plan)

> **Doc index:** [`README.md`](./README.md) in this folder.  
> Replaces v2 (`PLAN-final-zip.md` — historical filename; v2 source not kept in repo). The goal of v3 is a PR diff that touches
> **only new files** — no edits to existing engine, hooks, components, or
> token CSS. Zero legacy churn.

## Constraint

The final PR (vs. `main`) must contain only:

1. **New scripts** for building foundation CSS, building per-brand CSS, and
   packing release artefacts.
2. **New package** `@oneui/vite-plugin` (already committed).
3. **New component** `BrandProvider` v2 (already committed).
4. **New files** for fallback (`packages/ui/cdn-bootstrap/jio.css`), CDN folder
   (`cdn-dist/`), consumer example config (`oneui.brands.json.example`). A full
   Vite consumer for manual parity checks lives **outside** this monorepo.

Anything that requires editing a legacy file (engine, hook, CSS, token export)
is explicitly **out of scope**. If a refactor would help long-term, it's
deferred to a follow-up PR.

## Architecture (final)

```
@oneui/ui package (shipped via tarball)
├── dist/ui.css                     ◄── foundation tokens + component CSS Modules
│                                       (single bundle; Cut #1 prepends foundation
│                                       at pack time, consumer imports one file)
├── cdn-bootstrap/jio.css           ◄── one brand baked as offline fallback
└── dist/components, hooks, …       ◄── existing JS build output

CDN (one file per brand per version)
└── brands/<slug>/<version>.css     ◄── per-brand dynamic CSS:
     • Google font @imports
     • @layer brand {
         [data-brand][data-theme]               base brand tokens
         [data-surface-step]                    step-lookup dynamic slice
         [data-appearance]                      appearance redirect
         [data-context-boundary]                boundary reset
         [data-material="transparent"]          transparent material
         [data-Breakpoint][data-6-Density]      brand dimension overrides
         :root { --Button-*, --Card-*, … }      component overrides (theme,
                                                recipe, manual — merged)
       }

Consumer app (local Vite host, not in this repo)
├── oneui.brands.json               ◄── { cdnUrl, brands: { slug: version } }
└── vite.config.ts plugins: [oneui()]
     → at build time, plugin fetches CDN → exposes virtual:oneui-brands
     → BrandProvider dynamic-imports per-brand chunks
     → <style id="oneui-brand-<slug>"> injected, refcounted
```

## What lives where (token-level)


| Slice | Brand-varying? | Goes in |
|---|---|---|
| `@layer base, semantic, theme, density, brand;` (cascade order) | No | foundation.css |
| `--Dimension-fN` static defaults (per platform × density) | No (brand can override via dimension foundation; static defaults still load first) | foundation.css |
| `--Spacing-*`, `--Shape-*`, `--Elevation-*`, `--Border-*`, `--Focus-*` | No | foundation.css |
| V2 typography aliases (`--Display-L-FontSize: var(--Dimension-f7)` …) | No (brand emits *deltas* only) | foundation.css |
| Semantic aliases (`--Text-High` etc.) | No | foundation.css |
| `[data-theme="light/dark"]` base tokens | No | foundation.css |
| `[data-6-Density="compact/open"]` remap | No | foundation.css |
| Materials base variables | No | foundation.css |
| **Step lookup STATIC slice** (Neutral/Positive/Negative/Warning/Informative/Border) | No | foundation.css |
| Step lookup dynamic slice (Primary/Secondary/Tertiary/Quaternary/Sparkle/Brand-Bg/Surface/Text) | **Yes** | brands/&lt;slug&gt;.css |
| Surface context blocks (legacy depth-1) | **Yes** | brands/&lt;slug&gt;.css |
| Appearance redirect | **Yes** | brands/&lt;slug&gt;.css |
| Context boundary | **Yes** | brands/&lt;slug&gt;.css |
| Transparent material | **Yes** | brands/&lt;slug&gt;.css |
| Brand dimension overrides (`[data-Breakpoint][data-6-Density]`) | **Yes** | brands/&lt;slug&gt;.css |
| V2 typography deltas (`displayFSteps`, weight overrides, line-height offsets) | **Yes** | brands/&lt;slug&gt;.css |
| Motion durations | **Yes** | brands/&lt;slug&gt;.css |
| Grid columns / max widths | **Yes** | brands/&lt;slug&gt;.css |
| Ornament CSS properties | **Yes** | brands/&lt;slug&gt;.css |
| Google font @imports | **Yes** | brands/&lt;slug&gt;.css (top) |
| Component theme selections | **Yes** | brands/&lt;slug&gt;.css |
| Component recipe selections | **Yes** | brands/&lt;slug&gt;.css |
| Component manual token overrides | **Yes** | brands/&lt;slug&gt;.css |

## Build pipeline (new scripts only)

### `cdn-release-full-pipeline/build/build-foundation-css.ts` (new)

Produces `packages/ui/foundation.css` — one brand-invariant file.

Algorithm:

1. Read in order and concatenate (verbatim, no transformation):
   - `@oneui/tokens/src/css/layers.css`
   - `@oneui/tokens/src/css/dimensions/scale.css`
   - `@oneui/tokens/src/css/dimensions/grid.css`
   - `@oneui/tokens/src/css/typography/typography.css`
   - `@oneui/tokens/src/css/primitives.css`
   - `@oneui/tokens/src/css/semantic.css`
   - `@oneui/tokens/src/css/themes/light.css`
   - `@oneui/tokens/src/css/themes/dark.css`
   - `@oneui/tokens/src/css/density/compact.css`
   - `@oneui/tokens/src/css/density/open.css`
   - `@oneui/tokens/src/css/materials.css`
2. Compute static step-lookup slice once: pick *any* brand from Convex (jio),
   call `buildAvailableScales` → `buildNewPaletteData` → take
   `generateNewStepLookupCSSSplit(palette).staticCSS`. Wrap in `@layer brand { … }`.
   Result is brand-invariant (Neutral/Positive/Negative/Warning/Informative/Border
   steps — same for every brand by construction).
3. Append static-step-lookup output to the concatenation.
4. Write to `packages/ui/foundation.css` (~30–50 KB).

**Cut #1 — single CSS import:** during `pack-release.ts`, foundation.css is
prepended to the existing `dist/ui.css` (the component CSS Module bundle).
Consumers do one import — `import '@oneui/ui/styles'` — and get foundation +
components together. No `./foundation` export needed; the existing `./styles`
export silently includes ~30–50 KB more tokens than before (benign change).

Imports (all existing public exports):

```ts
import { buildAvailableScales } from '@oneui/shared/engine';
import { buildNewPaletteData, generateNewStepLookupCSSSplit } from '@oneui/ui/engine';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex/api';
```

### `cdn-release-full-pipeline/build/build-brand-css.ts` (new — replaces `harvest-brands.ts`)

Produces `cdn-dist/brands/<slug>/<version>.css` + per-brand `manifest.json`.

Pure Node, no Playwright, no headless app.

Algorithm (per brand × theme):

1. `ConvexHttpClient.query(api.foundations.getBrandOverviewData, { brandId })`
2. `ConvexHttpClient.query(api.componentTokenOverrides.getAllBrandComponentData, { brandId })`
3. Build palette: `buildAvailableScales` → `buildNewPaletteData`
4. Generate dynamic slices (mirror of `useBrandCSS.ts` lines 230–400, but as
   plain function calls — no React, no DOM):
   - `generateNewRootCSS(palette, theme)`
   - `generateNewContextCSS(palette, theme)`
   - `generateNewStepLookupCSSSplit(palette).dynamicCSS`
   - `generateNewAppearanceRedirectCSS(palette)`
   - `generateNewContextBoundaryCSS(palette)`
   - `generateNewTransparentCSS(palette, theme)`
   - `generateLogoCSS(palette)`
   - `generateTypographyFontCSSV2(typographyConfig, customFonts)`
   - `generateMotionCSS(motionConfig)`
   - `generateGridCSS(gridConfig)`
   - `generateDimensionCSS(platformsConfig)`
   - `generateGoogleFontImports(typographyConfig)`
   - `generateFontRenderingCSS(typographyV2)`
5. Resolve component overrides:
   - `buildAllComponentCSS(componentData)` → block of `--Component-*` declarations
   - Requires the **CSS-stub loader** (`cdn-release-full-pipeline/build/loaders/register.mjs`) to be
     preloaded via `tsx --import …`. `buildComponentOverrideCSS` transitively
     imports the @oneui/ui component registry, which pulls every component
     module → its `.module.css`; the loader stubs all `.css` imports to an
     empty module so Node doesn't choke on `Unknown file extension ".css"`.
   - Default behaviour: overrides are **on**. Opt out with
     `ONEUI_SKIP_COMPONENT_OVERRIDES=1` (e.g. brand-only smoke test without the
     loader).
6. `wrapCSSForInjection(...)` — existing helper, produces `@layer brand { :root, [data-surface] … }`
7. Scope: replace `:root` → `[data-brand="<slug>"][data-theme="<theme>"]`,
   prefix `[data-surface*=]` and `[data-Breakpoint]` selectors with the brand
   selector. (Reuse `scopeBrandCSS()` from `harvest-brands.ts` verbatim — same
   logic survives.)
8. Merge `light` + `dark` outputs into one file (light first, dark second).
9. Write `cdn-dist/brands/<slug>/<version>.css` + symlink/copy to `latest.css`.
10. Write `cdn-dist/brands/<slug>/manifest.json` with `{ version, bytes, hash, theme: ["light","dark"] }`.

Imports (all existing public exports — no legacy file edits):

```ts
import {
  buildAvailableScales, buildThemeConfig, wrapCSSForInjection,
  generateMotionCSS, generateGridCSS,
} from '@oneui/shared/engine';
import { generateDimensionCSS } from '@oneui/shared';
import { generateFontRenderingCSS } from '@oneui/shared/utils/typography/v2';
import { generateOrnamentCSSProperties } from '@oneui/shared/utils/ornamentSvg';
import {
  buildNewPaletteData,
  generateNewRootCSS, generateNewContextCSS,
  generateNewStepLookupCSSSplit, generateNewAppearanceRedirectCSS,
  generateNewContextBoundaryCSS, generateNewTransparentCSS,
  generateLogoCSS,
} from '@oneui/ui/engine';
import {
  generateTypographyFontCSSV2, generateGoogleFontImports,
} from '@oneui/ui/utils/foundationCSS';
import { buildAllComponentCSS } from '@oneui/ui/utils/buildComponentOverrideCSS';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex/api';
```

Brand selection: read list from `cdn-dist/brands.config.json` (new file, format
`{ "real": ["jio", "reliance", "tira", "swadesh", "one-ui-theme"], "synthetic": 30 }`)
or default to "all real brands" via `api.brands.list`.

### `cdn-release-full-pipeline/cdn-poc/bake-jio-fallback.ts` (already exists, no change)

Reads `cdn-dist/brands/jio/latest.css` → writes `packages/ui/cdn-bootstrap/jio.ts`.
Keep as-is.

### `cdn-release-full-pipeline/build/pack-release.ts` (new)

Produces a single tarball ready for `pnpm pack`.

Algorithm:

1. `pnpm --filter @oneui/ui build` → produces `packages/ui/dist/`
2. `pnpm --filter @oneui/vite-plugin build` → produces `packages/vite-plugin/dist/`
3. Copy `packages/ui/foundation.css` → `packages/ui/dist/foundation.css`
4. Copy `packages/ui/cdn-bootstrap/` → `packages/ui/dist/cdn-bootstrap/`
5. Run `pnpm pack` in `packages/ui` and `packages/vite-plugin` → emit
   `.tgz`s into `release/`.
6. Print SHA256s + sizes.

Optional step 7: zip `release/` + `cdn-dist/` + a `README.md` into
`oneui-release-<version>.zip` for tester handoff.

### `cdn-release-full-pipeline/build/build-all.ts` (new — convenience entrypoint)

```ts
await import('./build-foundation-css');
await import('./build-brand-css');
await import('./bake-jio-fallback');
await import('./pack-release');
```

Wired as `pnpm pack:all` in root `package.json` (the slot `release` is
reserved for the pre-existing Changesets publish flow).

## Consumer flow — final shape (after Cuts #1–#3)

Three places the consumer touches, 5 lines total:

```ts
// vite.config.ts — 3 lines
import { oneui } from '@oneui/vite-plugin';
plugins: [react(), oneui({
  cdnUrl: 'https://myjiostatic.cdn.jio.com/JDS',
  brands: { jio: 'latest' },
})]

// main.tsx — 1 line
import '@oneui/ui/styles';

// App.tsx — 1 wrapper
<BrandProvider brand="jio" theme="light">…</BrandProvider>
```

**Cut #1 — single CSS import.** `dist/ui.css` is built with foundation tokens
prepended to component CSS. Consumers import only `@oneui/ui/styles`.

**Cut #2 — inline plugin options as default.** Plugin precedence: inline
options > `oneui.brands.json` > `ONEUI_CDN_URL` env var. JSON file optional,
recommended only for monorepos / env-specific overrides.

**Cut #3 — no postinstall, no source modification.** `@oneui/ui` ships with
zero install-time scripts. Plugin handles all fetching at vite startup
(`configResolved`).

| | Postinstall fetch | Vite-time fetch (chosen) |
|---|---|---|
| Knows brand config on first install | ❌ json doesn't exist yet | ✅ |
| Survives `pnpm install --ignore-scripts` | ❌ | ✅ |
| Picks up config changes | ❌ requires re-install | ✅ next vite start |
| Install latency | Adds 1–5 s | 0 |
| Failure visibility | Silent | Loud at vite startup |
| One fetcher (no drift) | ❌ two | ✅ one |

Plugin safety layers: in-memory cache → disk cache at
`node_modules/.oneui-cache/brands/<slug>.css` → bundled
`@oneui/ui/cdn-bootstrap/jio.css` fallback for the jio slot.

**No package modifies `vite.config.ts` at install time.** Ecosystem convention
(shadcn / Tailwind / Mantine / MUI all follow it).

## Follow-up (post-v3): `@oneui/cli init`

Separate package, separate PR. Provides `npx @oneui/cli init` that creates a
starter `oneui.brands.json`, prints (does not auto-write) the vite.config.ts
and main.tsx snippets, optionally seeds an example BrandProvider in
`src/App.tsx`. Same pattern as `shadcn-ui init` / `tailwindcss init`. Out of
scope for v3.

## File changes — exhaustive list

### New files

```
cdn-release-full-pipeline/build/
  ├── build-foundation-css.ts    NEW
  ├── build-brand-css.ts          NEW
  ├── pack-release.ts             NEW
  ├── build-all.ts                NEW
  └── scopeBrandCSS.ts            NEW — extracted from harvest-brands.ts
cdn-release-full-pipeline/docs/
  ├── README.md                   Index — start here
  ├── PLAN-v3-clean.md            This file (v3 clean PR plan)
  └── visual-parity-and-release-plan.md  Parity + release roadmap

cdn-release-full-pipeline/cdn-poc/
  ├── bake-jio-fallback.ts        EXISTING — keep
  └── serve.ts                    Local static CDN for cdn-dist/

packages/vite-plugin/             NEW (already committed)
packages/ui/cdn-bootstrap/        NEW (already committed)
packages/ui/src/components/BrandProvider/  REWRITTEN (already committed)
packages/ui/foundation.css        NEW — generated by build-foundation-css.ts
                                   (gitignored; produced by release script)
cdn-release-full-pipeline/oneui.brands.json.example  NEW (already committed)
cdn-dist/                         NEW — output dir (gitignored)
```

### Existing files touched

```
package.json                      MINIMAL — add scripts: "release", "build:foundation",
                                  "build:brands", "pack:all"
.gitignore                        MINIMAL — add cdn-dist/, packages/ui/foundation.css,
                                  release/
```

That's it. No engine, hook, component, token CSS, or `packages/ui/package.json`
edits (Cut #1 prepends foundation into the existing `./styles` bundle, so no
new export path is needed).

### Files to DELETE (cleanup, optional in this PR)

```
cdn-release-full-pipeline/cdn-poc/harvest-brands.ts     Replaced by build-brand-css.ts
cdn-release-full-pipeline/cdn-poc/build-cdn.ts          Superseded
cdn-release-full-pipeline/cdn-poc/sanity.ts             Superseded
cdn-release-full-pipeline/cdn-poc/serve.ts              Superseded (kept if useful for local CDN testing)
apps/brand-css-harvester/             Whole headless Vite app — no longer needed
```

(Keep these for now if you want incremental migration; delete in a follow-up PR.)

## Pipeline checklist (what gets done in this PR)

- [ ] `cdn-release-full-pipeline/build/scopeBrandCSS.ts` — extracted scoping helper
- [ ] `cdn-release-full-pipeline/build/build-foundation-css.ts` — concat + static-step-lookup
- [ ] `cdn-release-full-pipeline/build/build-brand-css.ts` — Node-direct engine calls, replaces harvester
- [ ] `cdn-release-full-pipeline/build/pack-release.ts` — copy + pack
- [ ] `cdn-release-full-pipeline/build/build-all.ts` — orchestrator
- [ ] root `package.json` add scripts (1-line additions)
- [ ] root `.gitignore` add output dirs
- [ ] Bake fresh `cdn-dist/brands/<slug>/latest.css` using the new script (verify
      byte-identical surface remap vs. current harvester output for jio — sanity)
- [ ] Verify `--Button-*` (and other `--Component-*`) tokens are present in
      `cdn-dist/brands/<slug>/latest.css` (proof the CSS-stub loader fired and
      component overrides were merged). Quick check:
      `grep -c -- '--Button-' cdn-dist/brands/jio/latest.css` (expect > 0).
- [ ] Bake fresh `packages/ui/cdn-bootstrap/jio.ts` from new harvester output
- [ ] Verify the out-of-repo consumer needs only `import '@oneui/ui/styles'` (no separate
      foundation import — Cut #1)
- [ ] Verify the consumer: brand switch works, dark/light works, typography roles
      render at correct sizes (`<Body>`, `<Display>`), spacing tokens resolve.
- [ ] Commit cleanup: drop `harvest-brands.ts`, `apps/brand-css-harvester/`,
      `cdn-release-full-pipeline/cdn-poc/build-cdn.ts`, `sanity.ts`

## CDN consumer parity vs Storybook (verification snapshot)

The following was **verified** on the static CDN + `@oneui/vite-plugin` + `BrandProvider` path:

- **`cdn-dist/brands/<slug>/`**: each real brand ships **`latest.css`** + **`decorations.json`** + **`themeConfig.json`** + **`branding.json`** + optional **`fonts.json`** + **`manifest.json`** (URLs + byte sizes for sidecars in the per-brand manifest).
- **Ornament CSS order** in `build-brand-css.ts` matches `useBrandCSS`: `[typographyCSS, surfaceCSS, ornamentCSS, motionCSS, logoCSS]`. Swadesh emits `--Button-ornament-*` in both light and dark scoped blocks.
- **Plugin**: `syncCache` writes CSS + sidecars together (`Promise.all` on full miss); cache-hit **backfill** when any `*.decorations.json`, `*.themeConfig.json`, `*.branding.json`, or `*.fonts.json` is missing; per-brand virtual module embeds `decorations`, `themeConfig`, `branding`, `fontsFoundation`; HMR invalidates on changes to any of those cache files; `client.d.ts` documents the chunk surface.
- **`BrandProvider`**: loads the full brand chunk; **`BrandFoundationProvider`** receives **`themeConfig`**; **`BrandLogoContext`** receives **`branding`**; **`useBrandFonts`** receives optional **`fontsFoundation`**; **`DecorationProvider`** receives ornaments; **`syncDocumentDimensions`** (default `true`) mirrors **`data-Breakpoint`** / **`data-6-Density`** / **`data-density`** on **`<html>`** (nested providers use **`syncDocumentDimensions={false}`**).
- **Nested brands**: separate `<style id="oneui-brand-<slug>">` per slug + selector scoping + nested provider subtrees; refcount shared slug.
- **Fallbacks**: Jio `cdn-bootstrap` path uses empty sidecar defaults; older plugin chunks missing new exports deserialize to null / slug fallbacks; HTTP **404** on optional JSON → defaults.

**Remaining host responsibility:**

| Storybook / platform | CDN consumer |
|----------------------|--------------|
| **`IconProvider`** | App shell must wrap **`IconProvider`** if default icon resolution is required (same as any non-CDN app). |
| **Live component overrides** | Baked into **`latest.css`** at build time — can **stale** vs Convex until CDN is rebuilt. |

**Release coupling:** New **`@oneui/ui`** `BrandProvider` expects the new plugin’s chunk shape; older fields remain optional on types so mixed versions degrade gracefully where possible.

### Progress snapshot (order-of-magnitude)

| Area | Approx. done | Notes |
|------|----------------|-------|
| **CDN bake pipeline** (`build-brand-css`, `cdn-dist/`) | **~95%** | Pure Node path; optional follow-ups: CI upload, gzip, hash attestation. |
| **`@oneui/vite-plugin` + `BrandProvider`** | **~90%** | Fetch/cache/embed + dimension sync + foundation/logo/fonts/decorations; optional: stricter offline seed for CI. |
| **Consumer sample (external Vite app)** | **~85%** | Rich showcase + docs; `pnpm build` needs a reachable CDN **or** warmed `.oneui-cache` + `ONEUI_VITE_OFFLINE=1`. |
| **End-to-end “same as Storybook” for an arbitrary screen** | **~75–90%** | **High** when the same brand revision is baked into CDN CSS and the host adds `IconProvider` + same `data-theme` / density behaviour. **Lower** where Storybook still depends on Convex live data, ad-hoc decorators, or unpublished component overrides. |

**Storybook coverage (component folders vs `*.stories.tsx` under `packages/ui/src/components`):** about **47 / 73 ≈ 64%** of folders have at least one story file (some components have multiple story modules; a few folders are non-visual helpers). This is **documentation / QA coverage**, not “CDN parity %”.

**Overall CDN initiative (v3 clean + consumer path):** roughly **~85–90%** complete for the technical slice described in this plan; remaining work is mostly release engineering, CI, and optional hardening (offline bundle, hash verify).

## Out of scope (follow-up PRs)

1. **Extract `generateBrandCSS()` as a shared pure function** — useBrandCSS and
   build-brand-css would both call it. Eliminates code duplication. Requires
   touching `useBrandCSS.ts`, so deferred.
2. **CI release pipeline** — GitHub Actions running `pnpm pack:all` on tag push,
   publishing to npm, uploading `cdn-dist/` to S3/CDN.
3. **Hash verification on plugin fetch** — plugin already computes hash but
   doesn't verify against a CDN-side manifest.
4. **CDN-side gzip** — ops change on `myjiostatic.cdn.jio.com`. 305 KB → ~30 KB.
5. **Storybook BrandStyleInjector migration to v2 plugin model** — requires
   teaching storybook about build-time brand selection.
6. **Postinstall fetch script** — fully-offline `pnpm install` flow per
   `PLAN-final-zip.md` § 3.2.
7. ~~**`BrandFoundationProvider` + serialised `ThemeConfig`**~~ — **Done** (`themeConfig.json` + virtual embed + `BrandProvider`).
8. ~~**`useBrandFonts` parity**~~ — **Done** when `fonts.json` is emitted; still relies on `@import` for Google-font-only brands.
9. ~~**`BrandLogoContext` + `branding.json`**~~ — **Done**.
10. ~~**`<html>` platform / density**~~ — **Done** via `syncDocumentDimensions` + `density` on `BrandProvider` (opt out for nested trees).
11. **Hash verification on CDN fetch** — overlap with item 3; extend to decorations
    file if manifests list hashes.

## Risk register

| Risk | Mitigation |
|---|---|
| Node-side build emits CSS that drifts from runtime `useBrandCSS` | The build script calls the EXACT same engine functions (`generateNewRootCSS`, `generateNewStepLookupCSSSplit`, etc.) as `useBrandCSS`. The composition logic is duplicated. Mitigation: a sanity test that bakes one brand both ways (harvester + direct) and byte-compares. Run once to validate, then delete harvester. |
| Some engine function indirectly imports a React or DOM module | Verify in CI by importing into a plain `tsx` script. If any function does, treat as a bug to fix in a follow-up — the engine is supposed to be pure. |
| Foundation.css too big for inline shipping | Targeting 30–50 KB raw, 8–12 KB gzipped. Acceptable. |
| `dist/ui.css` grows by ~30–50 KB after Cut #1 prepends foundation | Acceptable. Foundation tokens must ship with components anyway — splitting them was an artefact. Existing consumers of `@oneui/ui/styles` see slightly fatter CSS, no breaking change. |
| Component override CSS contains role-scoped tokens that bypass surface remapping | `buildAllComponentCSS` already guards this (see file docstring). No new risk. |
| Component registry traversal in Node crashes on `.module.css` imports | CSS-stub loader (`cdn-release-full-pipeline/build/loaders/css-stub.mjs`) intercepts every `.css` URL in the `load` hook and serves `export default {};`. Wired via `tsx --import ./cdn-release-full-pipeline/build/loaders/register.mjs` in both `build:brand-css` and `pack:all`. Loader scope is the build process only; it does not affect Vite/Storybook. |

## Comparison vs. v2 (PLAN-final-zip.md)

| Aspect | v2 (harvester) | v3 (clean) |
|---|---|---|
| Per-brand CSS source | Playwright + headless Vite app | Pure Node engine calls |
| Legacy file edits | Several (PR review burden) | Two (`.gitignore`, `package.json` exports) |
| Component overrides shipped | No | Yes (merged into brand CSS) |
| Static step-lookup slice shipped | No (in CDN per-brand, duplicated × N brands) | Yes (in `foundation.css`, shipped once) |
| Brand CSS size on CDN | 305 KB / brand | ~180 KB / brand (static slice removed) |
| Foundation CSS size | n/a (not shipped) | ~30–50 KB once per app |
| Per-brand build time | ~7 s (Playwright cold start + page nav per theme) | ~50 ms (one engine call per theme) |
| Time to bake 35 brands | ~4 min | ~3 s |
