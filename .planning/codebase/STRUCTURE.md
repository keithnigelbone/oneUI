<!-- refreshed: 2026-05-29 -->
# Codebase Structure

**Analysis Date:** 2026-05-29

## Directory Layout

```
oneui-studio/
├── apps/
│   ├── platform/               # Next.js 15 design-system platform (main app)
│   ├── storybook/              # Storybook 10 component docs + Chromatic
│   ├── docs/                   # Fumadocs MDX documentation site
│   ├── mobile/                 # Expo app — device preview
│   ├── native-components-sample/  # Expo sample app for native components
│   ├── native-sample/          # Minimal Expo native test
│   ├── qa-playground/          # Playwright QA + visual regression
│   └── button-figma-validation/# Figma-parity Playwright tests for Button
│
├── packages/
│   ├── tokens/                 # CSS custom properties (design token files)
│   ├── shared/                 # Framework-agnostic engine, types, utils
│   ├── ui/                     # Web React components (@oneui/ui)
│   ├── ui-native/              # React Native components (@oneui/ui-native)
│   ├── ui-native-materials/    # Native materials layer
│   ├── convex/                 # Convex schema + query/mutation functions
│   ├── icons-jio/              # Jio icon set package
│   ├── kb-core/                # Knowledge-base core schemas
│   ├── kb-web/                 # Knowledge-base web component defs
│   ├── kb-rn/                  # Knowledge-base RN component defs
│   ├── init/                   # CLI init tool for registry adoption
│   ├── esbuild-plugin/         # esbuild plugin for CDN build
│   ├── vite-plugin/            # Vite plugin
│   └── webpack-plugin/         # Webpack plugin
│
├── docs/                       # Architecture docs, RFCs, parity reports
├── scripts/                    # Root-level automation scripts (CI gates, codegen)
├── cdn-release-full-pipeline/  # CDN build pipeline (foundation + brand CSS)
├── convex/                     # Root Convex config (points to packages/convex)
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # pnpm workspace: packages/*, apps/*
├── package.json                # Root scripts (dev, build, test, quality gates)
├── tsconfig.json               # Root TypeScript config
└── eslint.config.mjs           # ESLint config
```

## Directory Purposes

### `packages/tokens/`

- **Package name:** `@oneui/tokens`
- **Purpose:** Static CSS custom properties — the foundation layer every component reads from
- **Key files:**
  - `src/css/layers.css` — `@layer base, semantic, theme, density, brand;` must be imported first
  - `src/css/primitives.css` — all `--Dimension-fN`, `--Spacing-*`, `--Shape-*`, `--Motion-*`, `--Elevation-*` values in `@layer base`
  - `src/css/semantic.css` — component aliases (`--Button-Background-Bold: var(--Surface-Bold)`)
  - `src/css/dimensions/scale.css` — 25-step f-scale mapped per `[data-Breakpoint]` × `[data-6-Density]`
  - `src/css/dimensions/grid.css` — grid layout tokens
  - `src/css/themes/light.css` — theme-specific color values
  - `src/css/themes/dark.css` — dark theme overrides
  - `src/css/density/compact.css` — shifts f-steps down 1
  - `src/css/density/open.css` — shifts f-steps up 1
  - `src/css/typography/typography.css` — 27 role-explicit size aliases (`--Body-M-FontSize: var(--Dimension-f0)`)
  - `src/css/materials.css` — glass/blur material tokens

### `packages/shared/`

- **Package name:** `@oneui/shared`
- **Purpose:** Framework-agnostic engine and type system; consumed by web, native, CLI, Convex
- **Key directories:**
  - `src/engine/` — pure-function engine (no React)
  - `src/types/` — canonical TypeScript types for tokens, brands, components, AST
  - `src/data/` — dimension scale tables, font data, typography role definitions
  - `src/utils/` — color math utilities, dimension CSS generators, accessibility helpers
  - `src/meta/` — component schemas, design manifest, AI context generation
  - `src/templates/` — LLM prompt templates (button, form, action, display, input)
  - `src/agent/` — agent context builder, knowledge sources
  - `src/codegen/` — AST-to-page and AST-to-React code generators
  - `src/constants/` — shape system constants

- **Key engine files:**
  - `src/engine/surfaceNew.ts` — 25-step surface algorithm, `resolveSurface`, `resolveContent`, `resolveState`
  - `src/engine/cssGenNew.ts` — `ResolvedTokenSet` → CSS declarations + `[data-surface]` blocks
  - `src/engine/buildThemeConfig.ts` — `AppearanceConfig` → `ThemeConfig` (shared by web, native, Convex)
  - `src/engine/tokenManifest.ts` — 28 allowed CSS prefix families (single source of truth)
  - `src/engine/tokenBoundary.ts` — runtime filter pre-compiled RegExp
  - `src/engine/validateBrandCSS.ts` — size/count warnings
  - `src/engine/wrapCSS.ts` — injection mode wrapping (`@layer brand { :root {} }`)
  - `src/engine/cacheKey.ts` — `computeInputHash()` for memo stabilization
  - `src/engine/colorMath.ts` — hex/RGB, contrast, blending, WCAG utilities
  - `src/engine/compositionCompiler.ts` — DCA rules → LLM system prompt
  - `src/engine/compositionTypes.ts` — `CompositionContext`, `CompositionRule`, `CompositionSkill` types
  - `src/engine/compositionDesignGate.ts` — quality gate for LLM-generated ASTs
  - `src/engine/voiceCompiler.ts` — Voice rules → compiled voice prompt
  - `src/engine/voiceTypes.ts` — `VoiceRule`, `VoiceConfig`, `VoiceContext` types
  - `src/engine/index.ts` — barrel export for engine (framework-agnostic consumers)

### `packages/ui/`

- **Package name:** `@oneui/ui`
- **Purpose:** Web React components; brand CSS hook; AST renderer; component registry
- **Key directories:**
  - `src/components/` — 50+ components, each in its own directory
  - `src/hooks/` — `useBrandCSS.ts`, `useBrandFonts.ts`, `useDocumentTheme.ts`, `usePlatformTokens.ts`, `useStyleInjection.ts`, `useSurfaceTokenVarsNew.ts`
  - `src/engine/` — `computeNewStacking.ts` (bridge from Convex data to CSS gen)
  - `src/contexts/` — `BrandFoundationContext.tsx`, `MaterialFoundationContext.tsx`, `SlotParentAppearanceContext.tsx`
  - `src/registry/` — `componentRegistry.ts`, `metaRegistry.ts`
  - `src/runtime/` — `ASTRenderer.tsx` (recursive LLM AST → React renderer)
  - `src/utils/` — `foundationCSS.ts` (typography font CSS), `buildComponentOverrideCSS.ts`
  - `src/styles/` — shared CSS (resets, a11y, etc.)
  - `src/test-utils/` — render helpers for Vitest
  - `src/icons/` — `Icon.tsx` wrapper
  - `src/playground/` — platform-specific playground components

### `packages/ui-native/`

- **Package name:** `@oneui/ui-native`
- **Purpose:** React Native component parity set
- **Key directories:**
  - `src/components/` — native counterparts (e.g. `Button/Button.native.tsx`)
  - `src/theme/` — `OneUINativeThemeProvider`, `SurfaceContext`, `RecipeContext`, `TypographyLanguageContext`, `defaultTheme.ts`, `foundationToNativeTheme.ts`
  - `src/slots/` — slot helpers
  - `src/utils/` — native utilities

### `packages/convex/`

- **Package name:** `@oneui/convex`
- **Purpose:** Convex database schema + all query/mutation/action functions
- **Key files in `convex/`:**
  - `schema.ts` — full Convex schema (brands, foundations, colorScales, appearanceConfigs, compositionRules, voiceConfigs, compositions, componentTokenOverrides, etc.)
  - `brands.ts` — brand CRUD + `getBrandOverviewData` batch handler
  - `foundations.ts` — foundation create/update/read
  - `colorScales.ts` — color scale management
  - `appearanceConfigs.ts` — multi-accent config
  - `brandCSSCache.ts` — server-side CSS cache reads/writes
  - `brandCSSPrecompute.ts` — Convex action for server-side brand CSS generation
  - `compositionRules.ts` — DCA rule CRUD
  - `compositionSkills.ts` — skill management
  - `voiceConfigs.ts` / `voiceRules.ts` / `voiceSkills.ts` — voice agent data
  - `componentTokenOverrides.ts` — per-brand component shape/token overrides
  - `seed.ts` — seed data for development

### `apps/platform/`

- **Package name:** `@oneui/platform`
- **Purpose:** Next.js 15 App Router design-system platform
- **Key structure:**

```
apps/platform/src/
├── app/
│   ├── layout.tsx                    # Root layout: CSS imports, blocking FOUC script, html attributes
│   ├── (platform)/
│   │   ├── layout.tsx                # Platform shell layout (sidebar nav, brand provider)
│   │   ├── page.tsx                  # Home / brand selection
│   │   ├── (studio)/                 # Design studio route group
│   │   │   ├── brand/                # Brand overview + sub-brands
│   │   │   ├── foundations/          # color, surfaces, typography, dimension, elevation, motion,
│   │   │   │                         #   grid, shapes, strokes, platforms, materials, icons, decorations
│   │   │   ├── components/           # Per-component token editor pages
│   │   │   └── agents/               # design-composition + tone-of-voice agent UIs
│   │   ├── (builder)/                # Experience builder route group
│   │   │   ├── canvas/               # Canvas list + view
│   │   │   └── create/               # Experience builder (tldraw canvas)
│   │   └── chat/                     # AI chat interface
│   ├── api/
│   │   ├── composition/              # compile, generate, critique, repair, verify, eval endpoints
│   │   ├── voice/                    # compile, generate, eval, tone-guard, sdk endpoints
│   │   ├── agent/                    # context-pack + executors
│   │   ├── skills/                   # auto-link, draft, review, sync
│   │   ├── canvas/                   # generate, explore-directions
│   │   ├── reference/                # analyze, search
│   │   ├── chat/                     # AI chat
│   │   └── auth/figma/               # Figma OAuth
│   ├── auth/                         # Auth page
│   └── internal/                     # render-ast + render-code debug routes
│
├── components/
│   ├── FoundationStyleProvider.tsx   # Bridge: Convex → useBrandCSS → <style> injection
│   ├── AppPreloader.tsx              # Brand CSS cache restore on mount
│   └── foundation/                  # Shared foundation UI components
│
├── contexts/
│   ├── PlatformContext.tsx           # Brand, theme, platform, density global state
│   ├── UserPreferencesContext.tsx    # User pref persistence
│   ├── PlatformNavigationContext.tsx # Navigation state
│   ├── ComponentControlsContext.tsx  # Component inspector state
│   └── VoicePlaygroundContext.tsx    # Voice agent playground
│
├── design-tools/
│   ├── Foundations/
│   │   ├── Color/                    # ColorScaleGenerator, LightnessScaleEditor, etc.
│   │   ├── Surfaces/                 # SurfaceNewPreview, SurfaceValidationTable
│   │   └── Typography/               # Typography editor components
│   ├── ExperienceCanvas/             # tldraw-based experience builder (artboards, shapes, panels)
│   ├── Brand/                        # AccentConfig, CreateBrand flows
│   ├── ComponentTokenEditor/         # Per-component token override editor
│   ├── FigmaParity/                  # Figma-to-implementation parity tools
│   ├── JioRibbon/                    # JioRibbon marketing component editor
│   └── ContentBlock/                 # ContentBlock foundation context
│
├── providers/
│   └── ConvexClientProvider.tsx      # Wraps app with ConvexReactClient
│
├── hooks/                            # Platform-specific hooks
├── utils/                            # Platform utilities
├── lib/                              # Shared lib (tldraw helpers, etc.)
├── generated/
│   ├── component-docs/               # Generated component documentation JSONs
│   └── design-md/                    # Generated design.md exports
└── convex/
    └── _generated/                   # Convex auto-generated API types
```

### `apps/storybook/`

- **Package name:** `@oneui/storybook`
- **Purpose:** Storybook 10 for component documentation and Chromatic visual regression
- **Key files:**
  - `.storybook/main.ts` — Storybook config, addons
  - `.storybook/preview.ts` — global decorators + parameters
  - `.storybook/BrandStyleDecorator.tsx` — injects brand CSS in stories via `useBrandCSS`
  - `.storybook/preview.css` — must include `data-brand-switching` transition-suppression rule
  - `src/stories/` — additional cross-component stories

Stories co-located with components: `packages/ui/src/components/*/ComponentName.stories.tsx`

### `apps/docs/`

- **Package name:** `@oneui/docs`
- **Purpose:** Fumadocs MDX documentation website
- **Key directories:**
  - `src/app/` — Next.js app router pages
  - `content/docs/` — MDX documentation source files

### `scripts/` (root)

Quality gates and automation. All invoked from root `package.json`:

| Script | Purpose |
|---|---|
| `check-literals.ts` | Zero hardcoded values gate |
| `check-spacing-tokens.ts` | Spacing token usage |
| `check-layer-order.ts` | CSS layer ordering |
| `check-parity.ts` | Web ↔ native component parity |
| `check-metadata.ts` | Slot naming (RFC-0001) + component metadata |
| `bench-pipeline.ts` | Brand CSS pipeline benchmark |
| `check-perf.ts` | Perf regression gate vs `perf-baseline.json` |
| `validate:tokens` | Token resolution via `@oneui/tokens` |
| `generate-component.ts` | Scaffold new component with all required files |
| `audit-component-files.ts` | Verify all components have required file set |
| `generate-machine-docs.ts` | Generate machine-readable component docs |
| `extract-component-meta.ts` | Extract component meta for AI agents |
| `export-all-designmd.ts` | Export design.md for all components |
| `lint-designmd.ts` | Lint design.md files |

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (`Button.tsx`, `Button.module.css`, `Button.stories.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (`useBrandCSS.ts`)
- Utilities: `camelCase.ts` (`colorMath.ts`, `buildThemeConfig.ts`)
- Tests: `ComponentName.test.tsx` or `engineFile.test.ts`
- Native components: `ComponentName.native.tsx`
- Component CSS: `ComponentName.module.css`

**Directories:**
- Components: `PascalCase/` matching export name (`Button/`, `Surface/`)
- Shared utilities: `camelCase/` (`colorScale/`, `dimension/`)

**Package names:**
- `@oneui/tokens`, `@oneui/shared`, `@oneui/ui`, `@oneui/ui-native`, `@oneui/convex`
- `@oneui/platform`, `@oneui/storybook`, `@oneui/docs`, `@oneui/mobile`

## Where to Add New Code

### New Web Component

1. Create directory: `packages/ui/src/components/ComponentName/`
2. Required files (use `pnpm scaffold:component` to generate):
   - `ComponentName.tsx` — implementation using `@base-ui/react` + CSS Modules
   - `ComponentName.module.css` — token-only CSS (no literals)
   - `ComponentName.shared.ts` — prop types + shared logic
   - `ComponentName.meta.ts` — `ComponentMeta` for registry
   - `ComponentName.tokens.ts` — `ComponentTokenManifest`
   - `ComponentName.recipe.ts` — `ComponentRecipeDefinition`
   - `ComponentName.stories.tsx` — minimum 8 stories
   - `ComponentName.test.tsx` — Vitest unit + a11y tests
   - `index.ts` — barrel export
3. Register in `packages/ui/src/registry/componentRegistry.ts`
4. Export from `packages/ui/src/index.ts`
5. Add native counterpart at `packages/ui-native/src/components/ComponentName/`

### New Native Component

1. Create directory: `packages/ui-native/src/components/ComponentName/`
2. Required files:
   - `interface.ts` — canonical native prop contract
   - `ComponentName.native.tsx` — implementation using `StyleSheet.create()` + `useSurfaceTokens()`
   - `index.ts` — export
3. Export from `packages/ui-native/src/index.ts`
4. Verify parity with `pnpm check:parity`

### New Foundation Tokens

- Static token values → `packages/tokens/src/css/primitives.css` (in `@layer base`)
- Semantic aliases → `packages/tokens/src/css/semantic.css` (in `@layer semantic`)
- Typography role aliases → `packages/tokens/src/css/typography/typography.css`
- If the new token should be brand-injectable, add its prefix to `packages/shared/src/engine/tokenManifest.ts`

### New Platform Page / Route

- Studio page (brand editing): `apps/platform/src/app/(platform)/(studio)/[section]/page.tsx`
- Builder page: `apps/platform/src/app/(platform)/(builder)/[section]/page.tsx`
- API endpoint: `apps/platform/src/app/api/[section]/route.ts`
- Design tool components: `apps/platform/src/design-tools/[ToolName]/`

### New Convex Function

- Add function to relevant file in `packages/convex/convex/` (e.g. `brands.ts`, `foundations.ts`)
- If a new table is needed, add to `packages/convex/convex/schema.ts`
- Re-export from `packages/convex/src/index.ts`

### New Stories

Co-located with the component: `packages/ui/src/components/ComponentName/ComponentName.stories.tsx`

Minimum 8 stories required (validated by `pnpm audit:component-files`):
1. Default
2. Appearances (primary, secondary, neutral, etc.)
3. Sizes
4. States (disabled, loading, error)
5. Surface context (inside `<Surface mode="bold">`)
6. With start/end slots
7. Dark mode variant
8. Interactive / with handlers

### New Tests

- Unit/a11y: co-located at `packages/ui/src/components/ComponentName/ComponentName.test.tsx`
- Engine tests: `packages/shared/src/engine/__tests__/engineFile.test.ts`
- Platform page tests: `apps/platform/src/app/(platform)/_layout/__tests__/`
- E2E / QA: `apps/qa-playground/e2e/`
- Figma parity: `apps/button-figma-validation/e2e/`

## Key Files Reference

### Entry Points

| File | Purpose |
|---|---|
| `packages/ui/src/index.ts` | `@oneui/ui` barrel export (prefer subpath imports for build performance) |
| `packages/shared/src/index.ts` | `@oneui/shared` barrel export |
| `packages/shared/src/engine/index.ts` | `@oneui/shared/engine` — framework-agnostic engine barrel |
| `packages/ui-native/src/index.ts` | `@oneui/ui-native` barrel export |
| `packages/tokens/src/css/layers.css` | First import in every CSS consumer |
| `apps/platform/src/app/layout.tsx` | Platform root layout — CSS imports, FOUC script, `<html>` attributes |

### Configuration Files

| File | Purpose |
|---|---|
| `pnpm-workspace.yaml` | pnpm workspace definition |
| `turbo.json` | Turborepo task pipeline |
| `tsconfig.json` | Root TypeScript config (extended by packages) |
| `eslint.config.mjs` | Root ESLint config |
| `packages/tokens/src/css/layers.css` | CSS cascade layer order |
| `apps/platform/next.config.ts` | Next.js 15 config |
| `apps/storybook/.storybook/main.ts` | Storybook config |

### Critical Architecture Files

| File | Purpose |
|---|---|
| `packages/ui/src/hooks/useBrandCSS.ts` | React hook — 3-memo pipeline + LRU cache |
| `packages/ui/src/engine/computeNewStacking.ts` | Bridge: `AppearanceConfig` → CSS gen |
| `packages/shared/src/engine/surfaceNew.ts` | Surface algorithm (25-step relative resolution) |
| `packages/shared/src/engine/cssGenNew.ts` | Token set → CSS declarations + `[data-surface]` blocks |
| `packages/shared/src/engine/tokenManifest.ts` | 28 allowed CSS prefix families |
| `packages/shared/src/engine/buildThemeConfig.ts` | Shared `ThemeConfig` builder |
| `packages/ui/src/components/Surface/Surface.tsx` | Surface context provider + `data-surface` attribute |
| `apps/platform/src/components/FoundationStyleProvider.tsx` | Convex → CSS injection bridge |
| `apps/platform/src/contexts/PlatformContext.tsx` | Global brand/theme/platform/density state |
| `packages/ui/src/registry/componentRegistry.ts` | Central component registry |
| `packages/ui/src/runtime/ASTRenderer.tsx` | LLM AST → React renderer |

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents
- Generated: Yes (by `/gsd-map-codebase` command)
- Committed: Yes

**`packages/convex/convex/_generated/`:**
- Purpose: Convex auto-generated API types from schema
- Generated: Yes (by `npx convex dev`)
- Committed: Yes (needed for TypeScript)

**`apps/platform/src/generated/`:**
- Purpose: Generated component docs + design.md exports
- Generated: Yes (by `pnpm docs:machine` + `pnpm designmd:export:all`)
- Committed: Yes

**`docs/components/generated/`:**
- Purpose: Generated per-component machine docs
- Generated: Yes
- Committed: Yes

**`apps/storybook/storybook-static/`:**
- Purpose: Built Storybook static output
- Generated: Yes
- Committed: No (build artifact)

---

*Structure analysis: 2026-05-29*
