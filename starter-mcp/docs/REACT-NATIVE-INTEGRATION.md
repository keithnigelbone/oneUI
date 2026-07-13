# React Native Platform Support — Codebase Reference

> Working notes for adding **React Native (`@oneui/ui-native`)** support to `@jds4/oneui-mcp`.
> The MCP today serves **React (web)** only. This doc captures what every file in `src/` does
> and flags what is platform-neutral vs. React-hardcoded vs. the designed extension seam.

## Background

- **`starter-mcp` (`@jds4/oneui-mcp`)** — an offline, self-contained MCP server. It feeds an AI
  coding agent facts + deterministic actions for building **React web** apps with `@jds4/oneui-react`.
  Its "React starter kit" support is **not a template** — it is `setup_oneui_project`, which
  *patches an existing project* (detect Vite/Next → install → write `oneui.brands.json` → return snippets).
- **`packages/create-oneui-native-app`** — a different model: a `npx`-style CLI that
  **generates a brand-new Expo Router app from a template directory** (`templates/default/`), using
  the `@oneui/*` scope (`@oneui/ui-native`, `@oneui/native-cdn`, `@oneui/icons-jio-native`).

So the two "starter kits" are architecturally opposite: **patch-existing (web)** vs **generate-new (RN)**.

## File-by-file breakdown

Legend: ✅ neutral (reuse as-is) · 🟡 neutral code / web-flavored content · ⚠️ partly React-hardcoded · ❌ fully React-web · 🎯 the platform seam.

### Entry & wiring

| File | What it does | RN impact |
|---|---|---|
| `src/index.ts` | Bin entrypoint. Connects the server to **stdio** transport (how `npx -y @jds4/oneui-mcp` is launched by Claude Code/Cursor). Logs to stderr only — stdout is the MCP channel. | ✅ Neutral |
| `src/server.ts` | `createServer()` — builds the `McpServer`, writes the **instructions** string the agent reads, registers all 6 tool groups + prompts + resources. | ⚠️ Instructions hardcode "build **React (web)** apps" and `@jds4/*`. Needs RN-aware wording (or per-platform). |

### Tools (`src/tools/`) — agent-callable capabilities

| File | Tools exposed | What it does | RN impact |
|---|---|---|---|
| `tools/registry.ts` | `check_oneui_registry`, `get_registry_setup` | Detects connection to the **private Azure DevOps feed**, scaffolds project `.npmrc` (never a PAT), emits setup steps. Mandatory first step before any install. | ⚠️ Feed is `JIO-DS-ONE-UI` for `@jds4/*`. RN packages are `@oneui/*` on a **different feed** (`jio-dsp.../JIO-DS-OneUI-Native`). Needs platform-aware feed identity. |
| `tools/lifecycle.ts` | `setup_oneui_project`, `check_oneui_versions`, `update_oneui_packages` | **Patches an existing project**: detect framework+PM → install `@jds4/oneui-react` → write `oneui.brands.json` → return `<BrandProvider>` snippets. | ❌ Fully React-web. RN's model is *generate a new Expo app* — doesn't fit "patch existing". New `create_oneui_native_app` tool belongs here. |
| `tools/knowledge.ts` | `search_design_system`, `list_skills`, `get_skill`, `get_skill_reference`, `get_core_invariants` | Serves baked design-system knowledge (skills, invariants, surface guide) via keyword search + direct reads. | 🟡 Code neutral — content (`assets/`) is web-flavored. Needs RN skills/invariants in the snapshot. |
| `tools/components.ts` | `list_components`, `get_component_info` | Lists released components + full API. Filters baked catalog to what the **installed package actually exports** (auto-syncs to version). | ⚠️ Hardcodes `@jds4/oneui-react` in description/footer; uses default React `pkgSubdir`. Needs a `platform` arg → resolve pack. |
| `tools/brands.ts` | `list_brands`, `get_brand_tokens`, `get_brand_design_spec`, `get_surface_guide` | Serves brand palettes (9 roles, 25-step OkLCH), design specs, surface guide. | 🟡 Mostly neutral — brands are platform-agnostic. RN consumes tokens as `tokens.*` objects vs CSS vars; token *shape* may differ. |
| `tools/validate.ts` | `validate_oneui_code` | 6 checks on TSX: inline surface paint, legacy tokens, unknown props (Babel AST), hardcoded fonts, external icon imports, non-released components. **Already platform-aware** via `resolvePlatform`. | ⚠️ Seam wired, but rules are CSS/`var(--…)`-based (regex on `background:`, `font-family`, `--Token`). RN uses `tokens.*` + StyleSheet — needs an RN ruleset keyed off `pack.tokenSyntax`. |
| `tools/util.ts` | — | Helpers: `text()`, `errorText()`, `json()`, `defaultProjectRoot()`. | ✅ Neutral |

### Resources & prompts

| File | What it does | RN impact |
|---|---|---|
| `src/resources.ts` | Read-only `oneui://` URIs (invariants, surface-guide, registry-setup, skills, components, brands) — same knowledge as tools, by URI. | 🟡 Neutral code; serves the same web-flavored snapshot. |
| `src/prompts.ts` | `/oneui-build-from-prd` slash command — orchestrates the full workflow (invariants → search → components → brand → write TSX → validate → self-heal). | ❌ Hardcodes React import skeleton (`@jds4/oneui-react/styles`, `<BrandProvider>`) + CSS-var rules. Needs an RN variant (`@oneui/ui-native`, `OneUIBrandProvider`, `tokens.*`). |

### Lib (`src/lib/`) — the engine

| File | What it does | RN impact |
|---|---|---|
| `lib/platforms.ts` | **THE SEAM.** `PlatformPack` registry. Single source of truth for platform package names. `react` = supported; `reactnative` = **`planned` placeholder with TODOs**. `resolvePlatform()` gates callers. | 🎯 Master switch. Fill real `@oneui/*` names + flip to `supported`. |
| `lib/framework.ts` | Vendored `@jds4/oneui-init`: detect Next/Vite/Webpack/esbuild + PM, install specs, write `oneui.brands.json`, paste-in config snippets, `<BrandProvider>` wiring, run install. | ❌ Entirely React-web (no Metro/Expo). RN needs a parallel module (the `create-oneui-native-app` scaffold logic vendored here). |
| `lib/installedReleased.ts` | Reads installed package's release gates from `node_modules` (which components/exports are public) so catalog auto-syncs to the user's version. **Already takes `pkgSubdir`** (platform-aware). | ✅ Plumbing ready — pass `reactnative` pkgSubdir. Assumes RN package ships `dist/registry/releasedComponents` + `dist/index.public.d.ts` (verify). |
| `lib/npm.ts` | npm registry queries (highest published version, not `latest` tag), version resolution/pinning, update commands. `ONEUI_PACKAGES` is a **fixed React list**. | ⚠️ `ONEUI_PACKAGES` needs the `@oneui/*` set, or derive from the active pack. Query logic itself is neutral. |
| `lib/registry.ts` | Azure DevOps feed detection + `.npmrc` templates + PAT guidance for `JIO-DS-ONE-UI`. No secrets baked. | ⚠️ Feed identity is `@jds4`-specific. RN `@oneui/*` is a different feed — needs platform-aware feed config. |
| `lib/releasedExports.ts` | Vendored fallback allowlist of importable `@jds4/oneui-react` names (validator fallback when package not installed). | ⚠️ React-specific list. RN needs its own vendored set from `@oneui/ui-native`'s public barrel. |
| `lib/search.ts` | Offline keyword search (TF scoring + title/tag boosts) over the corpus. No network/embeddings. | ✅ Neutral — searches whatever corpus is baked. |
| `lib/snapshot.ts` | Reads the baked `assets/` snapshot (manifest, skills, components, brands, invariants, corpus). The only bridge to offline knowledge. | 🟡 Neutral reader. Bake an RN `assets/` slice or make paths platform-scoped. |
| `lib/paths.ts` | Resolves the `assets/` dir relative to compiled `dist/`. | ✅ Neutral |

## Three buckets for RN

- **Reuse as-is (neutral):** `index.ts`, `tools/util.ts`, `lib/paths.ts`, `lib/search.ts`, `lib/snapshot.ts`, `lib/installedReleased.ts` (already param'd).
- **The seam, designed for you:** `lib/platforms.ts` — flip `reactnative` to supported with real `@oneui/*` names. `validate.ts` already consumes it; `components.ts` / `lifecycle.ts` need to start consuming it.
- **React-hardcoded, needs an RN counterpart:** `lib/framework.ts` (→ vendor the Expo scaffold), `prompts.ts`, `lib/registry.ts` (different feed), `lib/npm.ts` (different package list), `lib/releasedExports.ts`, plus the `assets/` content and `server.ts` instructions.

## Two things to confirm before building

1. **Package scope / feed mismatch.** The `reactnative` pack in `platforms.ts` *guesses*
   `@jds4/oneui-react-native`, but the real RN starter uses `@oneui/ui-native` +
   `@oneui/icons-jio-native` + `@oneui/native-cdn` on the **`JIO-DS-OneUI-Native` feed** — a different
   scope and feed than the `@jds4` web side. Both `platforms.ts` and `registry.ts` need correcting.
2. **RN's starter is "generate-new", not "patch-existing."** Web `setup_oneui_project` adds OneUI into
   a detected Vite/Next project. RN has no such step — `create-oneui-native-app` generates a whole Expo
   app from a template. So RN gets a **new tool** (`create_oneui_native_app`), not a `platform` flag on
   `setup_oneui_project`.

## Chosen integration approach

**Vendor the Expo template + scaffold logic into the MCP** (decided) — mirrors how `framework.ts`
already vendors `@jds4/oneui-init`. Keeps the MCP offline and self-contained. Cost: the template lives
in two places and needs a sync step (`scripts/sync-native-template.mjs`) from
`packages/create-oneui-native-app/templates/default/`.

### Planned work (incremental slices)

1. **Flip the pack** — fix `lib/platforms.ts` `reactnative` entry with real `@oneui/*` names, set `status: 'supported'`.
2. **New tool `create_oneui_native_app`** — vendor `templates/reactnative-default/` + the deterministic
   scaffold functions (`copySync` + `renameDotfiles` + `applyProjectName` + `buildNpmrc`), with the PAT
   as a **parameter** (the CLI's raw-mode TTY prompt cannot run over MCP stdio).
3. **Thread `platform` arg** into `components.ts`, `prompts.ts`, and the version tools in `lifecycle.ts`;
   resolve package names via `resolvePlatform` instead of the literal `@jds4/oneui-react`.
4. **RN catalog snapshot** — bake an RN `assets/` slice (RN component docs at
   `node_modules/@oneui/ui-native/docs/components/`, `tokens.*` token shape) or add per-platform `importPath`.
5. **RN validator ruleset** — `tokens.*` / StyleSheet rules instead of CSS-var regex, keyed off `pack.tokenSyntax`.
6. **Write `docs/ADDING-A-PLATFORM-PACK.md`** — referenced from `platforms.ts` and `validate.ts` but missing.

Smallest shippable first cut: steps 1–3.

---

## Native component catalog — source of truth (DECIDED)

The native catalog is generated from **`@jds/kb-rn`** (`packages/kb-rn`) — the design system's
purpose-built "knowledge base for AI codegen". It is the better-shaped source than parsing
`*.usage.md`: structured `propsSchema`, RN-correct `importPath`, plus `a11y`, `renderHints`,
`tokens`, and forbidden-pattern annotations (`x-jds-severity`).

- **Build kb-rn first:** `pnpm --filter @jds/kb-core build && pnpm --filter @jds/kb-rn build`
  → emits `packages/kb-rn/dist/{manifest.json, components/<Name>.json, schemas/}`.
- **Caveats:** kb-rn is WIP (schema `5.0.0-wip.0`) and covers **10 components** today
  (Button, Surface, Text, Icon, Card, BottomNav, TabBarItem, SearchBar, Input, Banner) —
  a curated *design-intent* roster, not the full 33-component `@oneui/ui-native` surface. As
  kb-rn grows, re-run the native snapshot generator to pick up new components.

The web vs native props genuinely differ (e.g. Checkbox web `checked`/`defaultChecked` vs native
`selected`/`defaultSelected`/`onSelectedChange`; Button web `onClick`/`type`/`className`/CSSProperties
vs native `onPress`/`testID`/ViewStyle), so the native catalog must NOT reuse the web JSON.

## Status — component tools slice (DONE)

`list_components` / `get_component_info` now serve both platforms via a `platform` arg
(default `react`). Implemented:

1. **`scripts/build-native-snapshot.mjs`** — adapts kb-rn `dist/` → `assets/native/`
   (`components-index.json` + `components/<slug>.json`, `importPath: '@oneui/ui-native'`).
   npm script: `build:native-snapshot`.
2. **`lib/platforms.ts`** — `reactnative` pack filled with real `@oneui/*` names + `assetSubdir: 'native'`;
   added `assetSubdir` to `PlatformPack`; `resolvePlatform(input, { allowPlanned })` lets read-only
   tools use a `planned` pack. Status stays `planned` (validator RN rules + lifecycle not yet wired).
3. **`lib/snapshot.ts`** — `getComponentIndex(subdir)` / `getComponent(slug, subdir)` are platform-aware
   (default `''` = web, backward compatible).
4. **`tools/components.ts`** — both tools take `platform`, resolve the pack (`allowPlanned: true`),
   read the platform catalog, and print the pack's `runtimePackage`.

Verified: `react` → 37 web components; `reactnative` → 10 native components with RN-correct props;
unknown platform rejected; web output unchanged. `tsc` clean.

**Note — RN auto-sync is a no-op today:** `@oneui/ui-native` ships no `dist/registry/releasedComponents.*`
or `dist/index.public.d.ts`, so `getInstalledReleasedComponents` returns null for RN and the full baked
catalog is always served (correct, just not version-synced). Revisit if the package starts shipping gates.

## Status — validator slice (DONE)

`validate_oneui_code` is now one tool with **platform-branched rule-sets** (refactored from a single
web-only file). The `platform` arg selects which rules run (default `react`; `reactnative` enabled via
`resolvePlatform(..., { allowPlanned: true })`).

```
src/tools/validate.ts              ← the tool: resolve pack → pick rule-set → run → format
src/tools/validate/shared.ts       ← types, AST walk, parse, unknown-prop (catalog-driven, takes
                                       assetSubdir), non-released (takes released set + pkg), font-literal
                                       extraction, banned-import helper, markdown formatter
src/tools/validate/rules.web.ts    ← inline-surface-paint(var), legacy-token, web fonts, web icon ban
src/tools/validate/rules.native.ts ← literal-color (kb-rn FORBIDDEN_COLOR_LITERAL), forbidden-rn-primitive
                                       (only View/ScrollView from 'react-native'), native fonts, native icon ban
src/lib/releasedExports.native.ts  ← vendored @oneui/ui-native barrel (177 names, from src/index.ts) —
                                       the RN non-released fallback (RN ships no gate files)
```

**Shared across platforms:** `unknown-prop` (reads the platform catalog via `assetSubdir`) and
`non-released-component` (reads the platform barrel). **Per-platform:** everything else.

Verified: web flags var-paint / legacy-token / web-icon / Inter / unknown-prop; native flags
react-native primitive imports / literal #colour / native-icon / JioType / unknown-prop against the RN
catalog. A real ui-native component absent from kb-rn's catalog (e.g. `Avatar`) is NOT false-flagged as
non-released (vendored barrel covers the full 39-component surface); only genuinely-missing names are.
`tsc` clean.

**Follow-up:** could promote kb-rn's per-prop `x-jds-severity` annotations (already in the native catalog
JSON) into catalog-driven forbidden-prop findings — richer than the regex literal-color rule.

---

## Status — create-app lifecycle slice (DONE)

Slice 2 (`create_oneui_native_app`) is wired — `create-oneui-native-app` is integrated into the MCP as a
**terminal-CLI emitter**, NOT an in-process scaffolder.

**Why not vendor the template / scaffold in-process?** It was prototyped (vendored template + Node-only
scaffold logic) and then dropped. The standalone CLI is the single source of truth for the starter, and
its dist is fully self-contained (tsup `noExternal: [/./]` bundles every dep), so `npx` only needs to fetch
the CLI tarball from the feed. Re-implementing the scaffold in the MCP would duplicate the template and the
file logic and require a sync step. Driving the real CLI keeps one source of truth.

**Why emit, not execute?** The CLI's PAT prompt is a hidden raw-mode TTY read. MCP's stdio IS the protocol
channel — there is no terminal to the human — so the MCP can neither host the prompt nor run the CLI
interactively. The tool therefore returns the exact command for the **user to run in their own terminal**,
where the prompt works and the PAT never passes through the MCP or the agent. (Same shape as
`get_registry_setup`, which emits steps rather than performing them.)

```
src/lib/nativeCli.ts    ← native feed constants (JIO-DS-OneUI-Native), isValidProjectName,
                           detectNativeRegistry (scans ~/.npmrc + project .npmrc for real feed auth),
                           buildCreateCommand (npx --registry=<feed> create-oneui-native-app@latest <name>),
                           nativeUserNpmrcAuthBlock (placeholder connect block)
src/tools/lifecycle.ts  ← registers create_oneui_native_app: validate name → detect feed auth →
                           build command → return markdown (connect steps if not yet connected,
                           the npx command, post-run steps). Returns text only; never spawns the CLI.
src/server.ts           ← instructions tell the agent to present the command for the USER to run.
```

Command form (the CLI lives on the private feed, so `--registry` points npx at it; auth comes from the
user's `~/.npmrc` connect block):

```bash
npx --registry=https://jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native/npm/registry/ \
  create-oneui-native-app@latest myapp
```

Design decisions:

- **No PAT ever flows through the MCP.** The tool takes no `pat` param; the CLI prompts for it in the user's
  terminal. The MCP only *reads* `.npmrc` files to report whether feed auth already exists (never writes one).
- **Native feed is distinct** from the `@jds4` web feed: `JIO-DS-OneUI-Native` (constants in `nativeCli.ts`,
  separate from the web-specific `registry.ts`).
- `platforms.ts` `reactnative` stays `status: 'planned'`; this tool references the pack's package names for
  its description but does not gate on `resolvePlatform` (it's a standalone emitter, not a web-style patch).

Verified: `create_oneui_native_app` appears in `tools/list`; emits connect steps when no feed auth is
detected and the bare command when it is; rejects invalid names; never spawns the CLI. `tsc` clean.

## `validate_oneui_code` in plain terms

### The one-sentence version

It's a **spell-checker for design-system code.** The AI writes some UI code, this tool reads it and points
out anything that breaks the OneUI rules — before that code ever reaches you.

### Why it exists

When an AI agent generates a screen, it can quietly do things that look fine but are wrong for OneUI —
hardcode a color, use a font that won't switch with the brand, import a component that doesn't actually
exist in the published package, or pull in a random icon library. None of these throw an obvious error;
they just silently produce off-brand or broken UI.

So the MCP gives the agent a checker it's told to run on every piece of code it writes. The agent writes
code → calls `validate_oneui_code` → gets a list of problems → fixes them → re-checks → only then shows
you the result. It's a self-correction loop.

### What it actually checks

You hand it the code and say which platform (`react` for web, `reactnative` for mobile). It returns a tidy
table: line number, severity (error/warning), and a plain-English fix for each issue. The things it looks for:

- **Made-up props** — e.g. putting `checked` on a Button that doesn't have one. It knows the real props
  because it cross-references the component catalog we built.
- **Components that don't exist** — importing something the published library doesn't actually ship, so the
  import would fail.
- **Hardcoded colors** — a literal `#fff` instead of letting the brand system pick the color.
- **Hardcoded fonts** — typing `"Inter"` instead of using a brand token, which would break when you switch
  brands.
- **Wrong icon libraries** — pulling in `lucide-react` etc. instead of the official OneUI icons.
- **Platform mistakes** — on React Native, importing raw `Text`/`TouchableOpacity` from React Native instead
  of the OneUI versions.

### The web vs native part (what we just built)

The rules differ by platform. A "hardcoded color" on web looks like `background: var(--…)` in CSS; on mobile
it looks like `backgroundColor: '#fff'` in a style object. Same spirit, totally different shape. So the tool
now has **two rule-books** — one for web, one for React Native — and picks the right one based on the
`platform` you pass. A few checks (like "made-up props" and "component doesn't exist") are shared, just
pointed at the right platform's catalog.

### The mental model

Think of it as the **gate at the end of the AI's workflow**: invariants → pick components → write code →
**validate (this)** → fix → ship. It doesn't write anything itself — it only judges code that already exists
and tells the agent how to fix it. That's why it pairs with `list_components`/`get_component_info` (which
tell the agent what's allowed); validate is the enforcement step that catches what slipped through.
