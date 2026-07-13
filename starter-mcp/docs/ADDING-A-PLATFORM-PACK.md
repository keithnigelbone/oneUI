# Adding a Platform Pack

> How to add a new platform (e.g. SwiftUI, Compose, Flutter) to the OneUI coding plugin. The
> common core is already platform-agnostic; a pack is **additive**. Architecture context:
> [`PLUGIN-ARCHITECTURE.md`](./PLUGIN-ARCHITECTURE.md) §4 (common core) and §5 (the platform-pack
> seam). React (web) is the supported worked example; React Native is wired for knowledge +
> codegen and is the closest template to mirror.
>
> **Single engine.** Everything lives inside `@jds4/oneui-mcp` — there is NO external
> `figma-codegen` compiler / Figma-plugin repo anymore (that two-engine design was superseded).
> Codegen is the in-tool `figma_to_code` pipeline (`src/lib/figmaModesSnippet.ts` → `figmaRefine.ts`
> → `figmaAssets.ts` → `figmaCodegen.ts`). You touch only this package plus your platform's
> component npm package.

A platform pack = **{ codegen slice } + { knowledge/gate slice } + { runtime npm package }**, all
reusing the common core (Figma extraction, refine, validator engine) unchanged.

---

## The seam that already exists

- **`src/lib/platforms.ts`** — the `PlatformPack` registry. `react` is `supported`; `reactnative`
  is `planned` but its knowledge + codegen ARE wired (catalog baked, `figma_to_code` emits
  `@oneui/ui-native`). Each entry declares `runtimePackage`, `pkgSubdir`, `iconsPackage`,
  `tokenSyntax`, `fileExt`, and `assetSubdir`. `resolvePlatform(input, { allowPlanned })` resolves
  input → pack (read-only tools pass `allowPlanned: true`).
- **`src/lib/figmaRefine.ts`** — platform-agnostic; `refineExtraction(raw, platformId)` keys the
  refined tree off `registeredComponentMap(platform)` (the baked catalog for that platform's
  `assetSubdir`). No platform code lives here.
- **`src/lib/figmaModesSnippet.ts`** — platform-agnostic Figma-API extraction (props + variable
  modes + layout + geometry). Shared by all platforms.
- **`src/lib/installedReleased.ts`** — reads the released set from a `pkgSubdir`; falls back to a
  vendored list (`releasedExports.ts` web / `releasedExports.native.ts` RN).
- **`validate_oneui_code`** dispatches by `platform`: shared rules (`validate/shared.ts`) + the
  platform rule-set (`validate/rules.<platform>.ts`).

---

## Step-by-step

### A. Codegen slice — `src/lib/figmaCodegen.ts`
The codegen is in-tool. `generateNativeScreen(refined, opts)` walks the refined tree and emits a
screen file. To add a platform:
1. **Emitter** — generalize/extend `figmaCodegen.ts` for your target's syntax, OR add a sibling
   emitter (e.g. `generateWebScreen` / `generateComposeScreen`) selected by `platformId`. Keep the
   tree-walk (component / surface / structural nodes) shared; vary only the per-platform output
   (import barrel, container tag, token syntax, asset reference, file extension).
2. **Component mapping** — map Figma component names → your platform's **real** component names +
   prop/slot rules, authored against the platform **catalog** (the baked `assets/<subdir>/*.json`),
   never invented. Reuse the existing helpers (`registeredComponentMap`, the prop/enum/size
   normalization in `figmaCodegen.ts`).
3. **Token + value syntax** — map spacing/shape/typography token KEYS to your platform's syntax
   (web `var(--…)`, RN `tokens.*`, etc.) and literal formatting.
4. **Wire selection** — `figma_to_code` (`src/tools/figma.ts`) already branches on `platformId`
   (e.g. `platformSubdir`). Add your branch so `codegen=true` writes the right file/route.

### B. Knowledge/gate slice — `@jds4/oneui-mcp`
1. **`src/lib/platforms.ts`** — fill in your pack entry (`runtimePackage`, `pkgSubdir`,
   `iconsPackage`, `tokenSyntax`, `fileExt`, `assetSubdir`) and set `status: 'supported'` once the
   rest is wired.
2. **Component catalog snapshot** — bake your platform's component catalog into
   `assets/<assetSubdir>/components/*.json` (mirror `scripts/build-native-snapshot.mjs`, which bakes
   the RN catalog from `@jds/kb-rn`). `list_components` / `get_component_info` already select by
   `platform` via `resolvePlatform` + `assetSubdir`.
3. **Released set** — if your runtime package ships release gates
   (`dist/registry/releasedComponents.{mjs,cjs}` + `dist/index.public.d.ts`), `installedReleased.ts`
   reads them via `pkgSubdir`. Otherwise add a vendored fallback (like `releasedExports.native.ts`).
4. **Validator rules** — add `src/tools/validate/rules.<platform>.ts` (mirror `rules.web.ts` /
   `rules.native.ts`) and dispatch it from `validate.ts`. The shared rules (`unknown-prop`,
   `non-released-component`, undefined-component, banned-module imports, font literals) work as-is
   once the catalog + released set are yours; add platform-specific rules (e.g. banned primitives,
   token-syntax rules) for your target.

### C. Runtime package
Your platform's component library (e.g. `@oneui/ui-native`, a future `@jds4/oneui-swiftui`)
published to the JDS feed, shipping the release gates from B.3. Generated code imports from it.

---

## Invariants (do not break)

1. **Map against the platform CATALOG, never guess.** Component/prop/slot names come from the baked
   `assets/<subdir>/*.json` (and the installed package's released set), not from Figma vocabulary.
2. **Output must pass `validate_oneui_code(platform:"<yours>")` → "All clear."** Definition of done.
3. **Reuse the common core; never fork it.** Figma extraction (`figmaModesSnippet.ts`), refine
   (`figmaRefine.ts`), and the validator engine (`validate/shared.ts`) are shared — vary only the
   per-platform emitter, catalog, released set, and rule-set.
4. **Released-only by construction + validator backstop.** Emit only released components; the gate
   (reading the installed package) catches anything that slips through.
5. **Keep `@jds4/oneui-mcp` offline / self-contained** — baked snapshot in `assets/` + a runtime
   read of the installed package. Only `figma_to_code` (and lifecycle/registry) touch the network.

---

## Checklist (tick to ship a pack)
- [ ] codegen emitter handles the platform in `figmaCodegen.ts` (+ `figma.ts` selection branch)
- [ ] component mapping authored from the baked catalog (not guessed)
- [ ] token/value syntax mapped to the platform
- [ ] `platforms.ts` entry filled in + `status: 'supported'`
- [ ] catalog baked into `assets/<assetSubdir>/components/` (snapshot script)
- [ ] released set read via `pkgSubdir` (or vendored fallback added)
- [ ] `validate/rules.<platform>.ts` added + dispatched from `validate.ts`
- [ ] generated output passes `validate_oneui_code(platform:"<yours>")` on a real frame
- [ ] `npm run build` + `node scripts/smoke.mjs` green
