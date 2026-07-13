<!-- refreshed: 2026-05-29 -->
# Architecture

**Analysis Date:** 2026-05-29

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                  apps/platform  (Next.js 15 — App Router)               │
│  Studio (brand/foundations/components) | Builder (canvas) | Agents      │
├──────────────────┬──────────────────────┬───────────────────────────────┤
│   @oneui/ui      │  @oneui/ui-native    │   apps/storybook              │
│  Web Components  │  RN Components       │   Component docs + QA         │
│  Base UI +       │  StyleSheet.create   │   Chromatic visual reg.       │
│  CSS Modules     │  + useSurfaceTokens  │                               │
└───────┬──────────┴──────────┬───────────┴───────────────────────────────┘
        │                     │
        ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        @oneui/shared                                   │
│  engine/ (pure functions): surface algorithm, CSS gen, composition,    │
│  voice, parity, color math, token manifest, cache, benchmarks          │
│  types/ · data/ · utils/ · templates/ · meta/ · codegen/ · agent/      │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        @oneui/tokens                                   │
│  CSS custom properties: layers.css → scale.css → typography.css        │
│  → primitives.css → themes (light/dark) → density (compact/open)       │
│  → semantic.css                                                         │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Convex (real-time database + server-side functions)        │
│  packages/convex/convex/  — brand data, foundations, CSS cache,        │
│  composition rules, voice configs, composition embeddings              │
└────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Package / App | Responsibility | Key Path |
|---|---|---|
| `@oneui/tokens` | Raw + semantic CSS custom properties; cascade layer declarations | `packages/tokens/src/css/` |
| `@oneui/shared` | Framework-agnostic engine: surface algorithm, CSS gen, color math, composition + voice compilers, type definitions | `packages/shared/src/` |
| `@oneui/ui` | Web React components (Base UI + CSS Modules); `useBrandCSS` hook; `ASTRenderer` | `packages/ui/src/` |
| `@oneui/ui-native` | React Native component parity; `OneUINativeThemeProvider`; `useSurfaceTokens` | `packages/ui-native/src/` |
| `@oneui/ui-native-materials` | Native materials (glass/blur) token layer | `packages/ui-native-materials/src/` |
| `packages/convex` | Convex query/mutation functions + schema; client barrel `@oneui/convex` | `packages/convex/convex/` |
| `apps/platform` | Next.js 15 design-system platform app — brand editor, foundations, experience builder, agents | `apps/platform/src/` |
| `apps/storybook` | Storybook 10 with `BrandStyleDecorator`; per-brand visual testing | `apps/storybook/` |
| `apps/docs` | Fumadocs MDX documentation site | `apps/docs/src/` |
| `apps/mobile` | Expo app for design preview on device | `apps/mobile/src/` |
| `apps/qa-playground` | Playwright component QA + visual regression | `apps/qa-playground/src/` |
| `@oneui/kb-core` | Typed knowledge-base schemas for brand discovery | `packages/kb-core/src/` |
| `@oneui/kb-web` | Web-platform knowledge-base component definitions | `packages/kb-web/src/` |
| `@oneui/kb-rn` | React Native knowledge-base component definitions | `packages/kb-rn/src/` |

## Pattern Overview

**Overall:** Headless component library + pure-function CSS engine + real-time database

**Key Characteristics:**
- Components are headless Base UI primitives styled via CSS Modules and design tokens only — zero hardcoded pixel values
- Brand identity is injected at runtime as `@layer brand` CSS into a single `<style id="oneui-foundation-tokens">` element
- Token cascade is pure CSS: 5 layers (`base → semantic → theme → density → brand`) with no JavaScript involvement at read time
- Surface context adaptation is CSS-only via `[data-surface]` attribute selectors — zero JS runtime cost per component
- All brand data lives in Convex; the platform app is a real-time subscriber, not a static build

## CSS / Token Cascade

**Layer declaration** (`packages/tokens/src/css/layers.css`):
```css
@layer base, semantic, theme, density, brand;
```

**Import order in** `apps/platform/src/app/layout.tsx`:
1. `@oneui/tokens/css/layers` — must be first
2. `@oneui/tokens/css/dimensions/scale` — 25-step f-scale, 5 platforms × 3 densities
3. `@oneui/tokens/css/dimensions/grid`
4. `@oneui/tokens/css/typography` — role aliases pointing to f-steps
5. `@oneui/tokens/css` — primitives (dimension values, spacing, shape, motion, elevation)
6. `@oneui/tokens/css/semantic` — component aliases (`--Button-Background-Bold: var(--Surface-Bold)`)
7. `@oneui/tokens/css/light` + `@oneui/tokens/css/dark` — theme color values
8. `@oneui/tokens/css/density/compact` + `@oneui/tokens/css/density/open` — density remaps
9. Brand CSS injected at runtime into `#oneui-foundation-tokens` (`@layer brand`)

**Platform + density cascade**: `data-Breakpoint` and `data-6-Density` attributes on `<html>` drive scale.css selectors that remap all `--Dimension-fN` values. Components read `var(--Dimension-fN)` — responsive without a single media query in component CSS.

## Brand CSS Engine Pipeline

The engine lives in `packages/shared/src/engine/` as pure functions with no React dependency.

**Pipeline (triggered by `useBrandCSS` hook in `packages/ui/src/hooks/useBrandCSS.ts`):**

```
Convex foundationData
    │
    ▼
Memo 1 (theme-independent):
  buildAvailableScales()         → EngineAvailableScale[] for each role
  buildThemeConfig()             → ThemeConfig (scale→step mappings)
  buildNewPaletteData()          → NewPaletteData (in packages/ui/src/engine/computeNewStacking.ts)
    │
    ▼
Memo 2 (theme-dependent):
  generateNewRootCSS()           → :root { --Primary-Bold: hex; ... } (20 tokens × N roles)
  generateNewContextCSS()        → [data-surface="bold"] { ... } remapping blocks
  generateNewStepLookupCSSSplit()→ step lookup table (CSS-only component adaptation)
  generateTypographyFontCSSV2()  → --Display-L-FontSize: var(--Dimension-f7) etc.
  generateMotionCSS()            → --Motion-Duration-* overrides
  generateGridCSS()              → --Grid-* per-platform overrides
  validateBrandCSS()             → warnings (size > 50KB, tokens > 800)
  wrapCSSForInjection()          → @layer brand { :root { ... } }
    │
    ▼
useInsertionEffect → document.getElementById('oneui-foundation-tokens').textContent = css
```

**Key engine files:**

| File | Role |
|---|---|
| `packages/shared/src/engine/surfaceNew.ts` | Core surface algorithm — `resolveSurface`, `resolveContent`, `resolveState`, 25-step scale logic |
| `packages/shared/src/engine/cssGenNew.ts` | Transforms `ResolvedTokenSet` → CSS declarations; emits `:root` + `[data-surface]` blocks |
| `packages/shared/src/engine/buildThemeConfig.ts` | Builds `ThemeConfig` from `AppearanceConfig`; shared by web hook, Convex precompute, native theme |
| `packages/shared/src/engine/tokenManifest.ts` | Single source of truth: 28 allowed CSS prefix families |
| `packages/shared/src/engine/tokenBoundary.ts` | Runtime filter — strips any CSS var not in the allowlist |
| `packages/shared/src/engine/validateBrandCSS.ts` | Enforces size/count limits; returns warnings |
| `packages/shared/src/engine/wrapCSS.ts` | `wrapCSSForInjection()` — wraps raw CSS in `@layer brand { :root {} }` or `[data-brand-scope]` |
| `packages/shared/src/engine/cacheKey.ts` | `computeInputHash()` — stable hash for memo stabilization |
| `packages/ui/src/hooks/useBrandCSS.ts` | React hook; 3-memo pipeline + module-level LRU cache (20 entries) |
| `packages/ui/src/engine/computeNewStacking.ts` | Bridge: Convex `AppearanceConfig` → `NewPaletteData` → full CSS gen |
| `apps/platform/src/components/FoundationStyleProvider.tsx` | Platform bridge: Convex `useQuery` → `useBrandCSS` → `useInsertionEffect` |

**Injection modes:**
- `'global'` — wraps in `@layer brand { :root { ... } }` (app-wide, used by platform)
- `'scoped'` — wraps under `[data-brand-scope]` (multi-brand canvas preview)
- `'none'` — returns `''` (hook is mounted but CSS not active); **NEVER set this in production**

**LRU cache**: Module-level `Map<string, string>` with 20-entry cap in `useBrandCSS.ts`. Keyed on color + palette + typography + motion hash. Flattens repeat pipeline cost across N artboards and unmount/remount cycles.

## Surface Context System

Surface context adaptation is CSS-only. Components do NOT read JavaScript state per render.

**How it works:**
1. `<Surface mode="bold">` renders `<div data-surface="bold">` with `data-surface` attribute
2. Brand CSS engine emits `[data-surface="bold"] { --Primary-Bold: <remapped-hex>; ... }` blocks in `@layer brand`
3. Any component inside reads `var(--Primary-Bold)` — CSS cascade resolves to the remapped value automatically

**Surface component** (`packages/ui/src/components/Surface/Surface.tsx`):
- Maintains `SurfaceStepContext` (React context) for nested Surface step computation (RFC-0003)
- Uses `resolveSurfaceStep()` from `@oneui/shared/engine` to derive numeric step relative to parent
- Sets `data-surface` attribute and `--env-surface-step` CSS var on the container div

**7 surface tokens:**
- `default` — page root (2500 light / 200 dark), ignores parent
- `ghost` — same step as parent (still triggers context remapping)
- `minimal` — parent ± 1 step
- `subtle` — parent ± 2 steps
- `moderate` — parent ± 3 steps
- `bold` — role `baseStep` (or fallback offset of 700 if too close to parent)
- `elevated` — parent + 1 step toward lighter (capped at 2500)

**Focus halo** — all interactive components must use `--Surface-Halo-Gap` (not `--Surface-Main`) as the inner gap ring color so it adapts inside Surface containers. Generated in `cssGenNew.ts`.

## Component Model

**Web components** (`packages/ui/src/components/`):
- Headless via `@base-ui/react` primitives — never fork primitive behaviors
- Styled with CSS Modules (`.module.css`) + `var(--Token-Name)` only
- Role-agnostic intermediate CSS variables pattern (e.g. `--_btn-bold`, `--_btn-subtle`) remapped by appearance classes
- Each component has a canonical file set:
  - `ComponentName.tsx` — React implementation
  - `ComponentName.module.css` — token-only CSS
  - `ComponentName.shared.ts` — shared prop types + state
  - `ComponentName.meta.ts` — `ComponentMeta` for registry + AI agents
  - `ComponentName.tokens.ts` — `ComponentTokenManifest` for per-brand overrides
  - `ComponentName.recipe.ts` — `ComponentRecipeDefinition` for shape/appearance overrides
  - `ComponentName.stories.tsx` — 8 required Storybook stories
  - `ComponentName.test.tsx` — Vitest unit + accessibility tests
  - `ComponentName.showcase.tsx` — optional branded preview
  - `index.ts` — barrel export

**Native components** (`packages/ui-native/src/components/`):
- Prop contract via `interface.ts` per component (canonical native API)
- Build-time styling with `StyleSheet.create()` — numeric IDs across JS↔native bridge
- Dynamic brand paint via `useSurfaceTokens(appearance)` from `packages/ui-native/src/theme/SurfaceContext.tsx`
- Parity with web checked by `pnpm check:parity`

**Component registry** (`packages/ui/src/registry/componentRegistry.ts`):
- Central map of component name → `{ recipe, tokenManifest, meta, preview }`
- Used by Storybook, ASTRenderer, and the platform editor

**ASTRenderer** (`packages/ui/src/runtime/ASTRenderer.tsx`):
- Maps `ASTNode` trees to real React components via `COMPONENT_REGISTRY`
- Per-leaf prop allow-lists prevent LLM output from injecting layout-breaking props
- Used by experience builder canvas and `/internal/render-ast` route

## State Management

No global state library (no Redux, no Zustand). State is layered:

1. **Server/persistent state** — Convex real-time database; accessed via `useQuery`/`useMutation` from `convex/react`
2. **Platform global state** — `PlatformContext` (`apps/platform/src/contexts/PlatformContext.tsx`) holds current brand, theme (light/dark), platform ID (`data-Breakpoint`), density, icon set
3. **Foundation data context** — `FoundationDataContext` inside `FoundationStyleProvider.tsx` exposes `useFoundationData()` to prevent duplicate Convex subscriptions
4. **Surface step context** — `SurfaceStepContext` in `Surface.tsx` propagates numeric step for nested surface resolution (RFC-0003)
5. **Component-local state** — `useState`/`useReducer` within components
6. **CSS-driven "state"** — surface context, platform responsiveness, density are pure CSS attribute selectors on `<html>` — no JS state involved at render time

**Convex subscription path:**
```
Convex DB → useQuery(api.brands.getBrandOverviewData) → FoundationStyleProvider
→ useBrandCSS → useInsertionEffect → <style id="oneui-foundation-tokens">
```

## Design Composition Agent (DCA)

The composition system (`packages/shared/src/engine/composition*.ts`) mirrors the voice engine pattern:

- `compositionTypes.ts` — types for `CompositionRule`, `CompositionSkill`, `CompositionContext` (mobile-app, web-app, marketing-page, social-post)
- `compositionCompiler.ts` — pure function: rules + brand config + component metadata → LLM system prompt
- `compositionValidator.ts` — validates rule payloads
- `compositionDesignGate.ts` — quality gates for LLM-generated composition ASTs
- `compositionASTNormalizer.ts` — normalizes AST output from LLM
- API routes: `apps/platform/src/app/api/composition/` (compile, generate, critique, repair, verify, eval)

## Voice Agent

Mirrors composition engine pattern:

- `packages/shared/src/engine/voiceCompiler.ts` — rules + brand config → compiled voice prompt
- `packages/shared/src/engine/voiceTypes.ts` — `VoiceRule`, `VoiceConfig`, `VoiceContext` types
- `packages/shared/src/engine/voiceToneGuard.ts` — tone-of-voice gate (eval)
- API routes: `apps/platform/src/app/api/voice/` (compile, generate, eval, tone-guard)

## Layers and Data Flows

### Foundation Edit → Live CSS Update

```
User edits color in platform app
  → Convex mutation (e.g., colorScales.updateColorScale)
  → Convex real-time subscription updates foundationData in FoundationStyleProvider
  → useBrandCSS Memo 1 hash changes → Memo 2 regenerates CSS
  → useInsertionEffect injects new CSS into #oneui-foundation-tokens
  → Browser repaints with new token values
  → All components referencing var(--Primary-Bold) etc. update instantly
```

### FOUC Prevention (6-layer system)

1. `<style id="oneui-foundation-tokens">` placeholder in `<head>` before blocking script
2. Blocking inline `<script>` in `<head>` restores `data-theme`, `data-density`, `data-Breakpoint` and cached brand CSS from `localStorage` before any paint
3. `FoundationStyleProvider` bridges Convex → CSS with a `previousCSSRef` (holds old CSS while new loads — no blank frames)
4. `data-brand-switching` attribute on `<html>` suppresses CSS transitions for one frame during brand switch
5. `@layer` ordering guarantees brand CSS always wins over base tokens regardless of `<style>` insertion order
6. `next/font/google` with `display: 'optional'` for fallback font (no reflow on cached load)

## Architectural Constraints

- **Threading:** Single-threaded JavaScript event loop. No workers for the CSS pipeline.
- **Global state:** `brandCSSCache` (module-level `Map`) in `useBrandCSS.ts` is the only non-React module-level mutable state in the engine.
- **Circular imports:** `@oneui/ui` imports from `@oneui/shared/engine` (one-way); `apps/platform` imports from `@oneui/ui` and `@oneui/convex` (one-way).
- **CSS layer ordering:** `@layer brand` injection via `useInsertionEffect` always lands after `layers.css` declares the layer order — guaranteed correct cascade regardless of DOM insert position.
- **Token boundary:** 28 CSS prefix families are enforced at runtime by `tokenBoundary.ts`; any property outside this allowlist is stripped before injection. The allowlist is derived from `tokenManifest.ts` — update the manifest to extend it.

## Anti-Patterns

### Using `<div style={{ background }}>` instead of `<Surface mode="...">`

**What happens:** A raw `<div>` with a background color contains interactive components.
**Why it's wrong:** No `data-surface` attribute is emitted, so `[data-surface]` remapping blocks in `@layer brand` never apply. Components inside read pre-remap token values, rendering invisible or mis-contrasted.
**Do this instead:** Use `<Surface mode="bold">` (or the appropriate mode). The Surface component sets `data-surface="bold"` and triggers CSS remapping for every descendant component.

### Reading `--Surface-Main` in focus halo CSS

**What happens:** `box-shadow: 0 0 0 2px var(--Surface-Main)` used as the gap ring.
**Why it's wrong:** `--Surface-Main` is hardcoded to the page background. Inside a `<Surface>` container, it creates a visible colored "hole" that breaks the focus indicator design.
**Do this instead:** `box-shadow: 0 0 0 var(--Stroke-XL) var(--Surface-Halo-Gap, var(--Surface-Main))` — `--Surface-Halo-Gap` is remapped per `[data-surface]` block in the engine.

### Legacy typography tokens in new component CSS

**What happens:** `font-size: var(--Typography-Size-M)` in new component code.
**Why it's wrong:** Legacy `--Typography-Size-*` and `--Typography-Weight-*` tokens are emitted only for backward-compatibility and carry no brand-customizable line-height pairing.
**Do this instead:** Use `--Body-M-FontSize` / `--Body-M-LineHeight` / `--Body-FontWeight-Low` (role-explicit unified tokens).

### Setting `injectionMode: 'none'` on `useBrandCSS`

**What happens:** The hook is mounted but returns `''`, no CSS injects.
**Why it's wrong:** Surface tokens, typography role tokens, and stroke tokens are only emitted by the brand CSS engine — they have no static fallback. Setting `'none'` silently deletes all surface-context adaptation.
**Do this instead:** Always use `'global'` or `'scoped'` mode. `'none'` is only correct during tests that explicitly verify the empty-CSS case.

## Error Handling

**Strategy:** Fail-safe with warnings, not exceptions.

**Patterns:**
- `validateBrandCSS()` returns `BrandCSSValidation` with `warnings[]` array rather than throwing
- `useBrandCSS` returns `cssContent: null` while loading (not yet resolved) vs `''` (intentional empty). Callers must use `??` not `||`
- Token boundary filtering silently strips disallowed properties instead of aborting injection
- Convex queries return `undefined` while loading — `FoundationStyleProvider` uses `previousCSSRef` to keep old CSS active while new data loads

## Cross-Cutting Concerns

**Logging:** `console.warn` only for `validateBrandCSS` violations and engine diagnostics. No logging library.
**Validation:** `pnpm check:literals` (no hardcoded values), `pnpm validate:tokens` (all tokens resolve), `pnpm check:layers` (CSS layer order), `pnpm check:parity` (web ↔ native), `pnpm check:metadata` (slot naming via RFC-0001)
**Authentication:** Convex auth used for platform access. Figma OAuth at `apps/platform/src/app/api/auth/figma/`

---

*Architecture analysis: 2026-05-29*
