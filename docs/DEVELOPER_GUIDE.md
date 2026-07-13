# Developer Guide

One UI Studio — Multi-brand design system platform for Jio.

---

## Table of Contents

1. [What Is This Project](#1-what-is-this-project)
2. [Prerequisites](#2-prerequisites)
3. [Quick Start](#3-quick-start)
4. [Monorepo Structure](#4-monorepo-structure)
5. [The Foundation Cascade](#5-the-foundation-cascade)
6. [Token System](#6-token-system)
7. [Brand CSS Engine Pipeline](#7-brand-css-engine-pipeline)
8. [Surface Context System](#8-surface-context-system)
9. [Building a Component](#9-building-a-component)
10. [Storybook](#10-storybook)
11. [Convex Backend](#11-convex-backend)
12. [Testing](#12-testing)
13. [Quality Gates](#13-quality-gates)
14. [Common Workflows](#14-common-workflows)
15. [Key Files Quick Reference](#15-key-files-quick-reference)

---

## 1. What Is This Project

One UI Studio is a multi-brand design system platform built for Jio. It supports:

- **7+ brands** (Jio, Tira, and others), each with fully independent color, surface, and typography configurations
- **2 platforms** — React (web) and React Native (mobile)
- **Scale** — 1.4 billion users, 22 languages
- **Distribution model** — Registry (copy components into your project), not npm packages. This means consumers own their component code and can diverge safely.

The system is built on four pillars:

| Pillar | Technology |
|--------|-----------|
| Headless component behaviors | [Base UI](https://base-ui.com/) (never fork primitives) |
| Styling | CSS Modules + design tokens (zero Tailwind, zero inline styles) |
| Token cascade | OkLCH color scales, relational f-step typography, V4 surface algorithm |
| Backend | [Convex](https://convex.dev/) — real-time database, single source of truth for all brand data |

---

## 2. Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Node.js | 20.14.0 | Use `.nvmrc`; `engines` enforces Node 20+ |
| pnpm | 9.0.0 | Enforced. Do not use npm or yarn. |
| Convex account | — | Required to run the backend locally |
| Figma | — | Optional; needed only for Figma MCP integration |

---

## 3. Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd OneUIStudio_BaseUI_v4

# Install all dependencies (workspace-aware)
pnpm install

# Start the web platform app (Next.js)
pnpm dev

# Start Storybook (component documentation)
pnpm storybook

# Start the Convex backend dev server (required for brand data)
npx convex dev

# Start React Native (Expo) — separate terminal
pnpm dev:native
```

### All dev scripts

| Script | What it does |
|--------|-------------|
| `pnpm dev` | Start only the Next.js platform app |
| `pnpm dev:platform` | Same as `pnpm dev`; explicit platform-only dev server |
| `pnpm dev:convex` | Start only the Convex backend |
| `pnpm dev:all` | Start the full Turbo workspace dev stack |
| `pnpm dev:native` | Start React Native (Expo) for `@oneui/ui-native` |
| `pnpm storybook` | Start Storybook 10.2 component browser |
| `pnpm build` | Production build for all packages (Turbo) |
| `pnpm test` | Run all test suites (Turbo) |
| `pnpm typecheck` | TypeScript type-check across all packages |
| `pnpm check:literals` | Scan for hard-coded CSS values (zero tolerance) |
| `pnpm validate:tokens` | Verify all tokens resolve correctly |
| `pnpm check:parity` | Verify web/native token consistency |
| `pnpm check:layers` | Verify CSS `@layer` order is correct |
| `pnpm lint` | Run ESLint across the workspace |
| `pnpm format` | Prettier formatting for all file types |

> Convex must be running (`npx convex dev`) before the platform app or Storybook will show brand data. Without it, the UI renders with fallback/empty states.

---

## 4. Monorepo Structure

The workspace is managed by [Turborepo](https://turbo.build/) with pnpm workspaces.

```
apps/
  platform/         — Next.js platform app (brand configuration UI)
  storybook/        — Storybook 10.2 component documentation

packages/
  ui/               — React components (web), hooks, CSS Modules
  ui-native/        — React Native components
  shared/           — Brand CSS engine (framework-agnostic pure functions)
  tokens/           — CSS token files (layers, primitives, semantic, themes, density)
  convex/           — Convex backend (schema, queries, mutations, actions)
```

### Package detail

| Package | Description |
|---------|-------------|
| `apps/platform` | Next.js 15 app. Brand editors, surface preview, typography editor, platform settings. Uses Convex subscriptions for real-time data. |
| `apps/storybook` | Storybook 10.2. Mirrors platform brand CSS injection. Toolbar addon for brand/platform/density/theme selection. |
| `packages/ui` | All web React components. Each component: headless Base UI wrapper + CSS Modules + `var(--Token-Name)` only. Also contains `useBrandCSS` hook and engine bridge. |
| `packages/ui-native` | React Native equivalents using `tokens.*` objects from a shared token layer. |
| `packages/shared` | Framework-agnostic brand CSS engine. Pure functions only — no React, no DOM. Consumed by `@oneui/ui`, Convex actions, and CLI tools. |
| `packages/tokens` | CSS files that define the token cascade: `layers.css`, `primitives.css`, `semantic.css`, `dimensions/scale.css`, `typography/typography.css`, `themes/`, `density/`. |
| `packages/convex` | Convex schema, queries, mutations, and actions. All brand data lives here. |

---

## 5. The Foundation Cascade

Every component's final visual output is determined by five cascading decisions, resolved in order:

```
Brand → Color / Surface / Typography foundations (stored in Convex)
  → Platform → Breakpoints + density configs (per brand, per platform)
    → Viewport → Discrete per-platform values (no CSS clamp — discrete only)
      → Density → Spacing remapping (compact / default / open)
        → Theme → Surface recomputation (light / dark)
          → Component reads var(--Token-Name) → resolved pixel / color value
```

### CSS layer order

Layer precedence is enforced in `packages/tokens/src/css/layers.css`:

```css
@layer base, semantic, theme, density, brand;
```

This file must be imported **first** before any other CSS. The layer declaration order means later layers in the list win over earlier ones, regardless of DOM insertion order.

| Layer | Files | Role |
|-------|-------|------|
| `base` | `primitives.css`, `dimensions/scale.css`, `typography/typography.css` | Raw token values — lowest precedence |
| `semantic` | `semantic.css` | Contextual aliases (e.g., `--Surface-Bold` → a primitive step) |
| `theme` | `themes/light.css`, `themes/dark.css` | Light/dark mode overrides via `[data-mode="dark"]` |
| `density` | `density/compact.css`, `density/open.css` | Density-specific token shifts via `[data-density="compact"]` |
| `brand` | `<style>` injected at runtime by `useBrandCSS` | Brand overrides — highest precedence, always wins |

### Token resolution order (highest to lowest)

1. Component-level override (`--Button-backgroundColor`)
2. Brand CSS injection (`@layer brand { :root { ... } }` via `useBrandCSS`)
3. Density remapping (`@layer density` via `[data-density="compact"]`)
4. Mode override (`@layer theme` via `[data-mode="dark"]`)
5. Semantic defaults (`@layer semantic` via `semantic.css`)
6. Primitive values (`@layer base` via `primitives.css`)

---

## 6. Token System

### Token types

| Type | Layer | Description |
|------|-------|-------------|
| **Primitive** | `base` | Raw values — OkLCH hex colors, pixel sizes from the f-scale |
| **Semantic** | `semantic` | Contextual aliases — e.g., `--Surface-Bold` maps to a primitive step |
| **Theme** | `theme` | Light/dark overrides that remap semantic tokens for the active theme |
| **Density** | `density` | Compact/open remappings that shift spacing tokens up/down by one f-step |

### Key token categories

| Category | Examples | Notes |
|----------|---------|-------|
| **Surface** | `--Surface-Bold`, `--Surface-Subtle`, `--Surface-Ghost` | 7 surface modes × 9 appearance roles |
| **Text** | `--Text-High`, `--Text-Medium`, `--Text-Low`, `--Text-OnBold-High` | On-surface text tokens |
| **Spacing** | `--Spacing-0`, `--Spacing-0-5` … `--Spacing-40`, `--Spacing-Margin`, `--Spacing-Gutter` | Derived from the f-scale; density-responsive |
| **Shape** | `--Shape-Pill` (9999px), `--Shape-0` … `--Shape-10` | Pill is a standalone constant; numeric sizes derive from f-steps |
| **Typography** | `--Display-L-FontSize`, `--Body-M-LineHeight`, `--Body-FontWeight-High` | Relational f-step aliases; 27 sizes across 6 roles |
| **Dimensions** | `--Dimension-f-8` … `--Dimension-f16` | 25-step modular scale (base = DIN 1450 formula) |

### The f-scale

The f-scale is a 25-step modular dimension scale (steps `f-8` through `f16`) that drives all spacing, typography sizing, and shape radii. Per-platform values are set discretely in `dimensions/scale.css` — no CSS `clamp()` is used. Density remapping shifts tokens one step: compact = -1 step, open = +1 step.

### Zero literals rule

**All styling must use `var(--Token-Name)` on web and `tokens.*` on React Native. No hard-coded colors, pixel values, or other literals anywhere in component code.** The `pnpm check:literals` script enforces this at CI time.

```css
/* Correct */
border-radius: var(--Button-borderRadius, var(--Shape-Pill));
background-color: var(--Button-backgroundColor, var(--Primary-Bold));
padding: var(--Button-paddingVertical, var(--Spacing-1)) var(--Button-paddingHorizontal, var(--Spacing-5));

/* Wrong — fails check:literals */
border-radius: 9999px;
background-color: #ff5500;
padding: 8px 16px;
```

---

## 7. Brand CSS Engine Pipeline

The brand CSS injection pipeline is implemented as **pure functions** in `packages/shared/src/engine/` with a thin React wrapper in `packages/ui/src/hooks/useBrandCSS.ts`.

### Pipeline overview

```
Convex DB → getBrandOverviewData (single batched subscription)
  → FoundationStyleBridge (reads PlatformContext: brand, theme, themeScope)
    → useBrandCSS({ foundationData, theme, injectionMode })
      ├── useMemo #1 (theme-independent)
      │     buildAvailableScales() + palette construction
      │     deps: [colorConfig, presetSelection, appearanceConfig]
      │     stabilized via computeInputHash — skips recompute when hash unchanged
      ├── useMemo #2 (theme-dependent)
      │     computeV4Stacking() + CSS generation + validateBrandCSS() + wrapCSSForInjection()
      │     deps: [paletteData, theme, typographyConfig, decorations]
      │     single-theme only — halves V4 computation cost
      └── useInsertionEffect → <style id="oneui-foundation-tokens"> injected before paint
```

### Engine files

All files are in `packages/shared/src/engine/`:

| File | Role |
|------|------|
| `buildAvailableScales.ts` | Color config → resolved OkLCH color scales for all appearance roles |
| `colorMath.ts` | Hex/RGB conversion, WCAG contrast calculation, alpha blending, luminance |
| `surfaceV4.ts` | V4 surface computation: 7 modes × 9 roles × 9 on-colour tokens per surface |
| `cssGenV4.ts` | V4 CSS generation; also `generateSurfaceContextCSSV4()` for `[data-surface]` blocks |
| `validateBrandCSS.ts` | Structural validation (4 checks) + 50KB / 800-token soft guardrails |
| `wrapCSS.ts` | Three-mode injection wrapping: `none` / `scoped` / `global` (all inside `@layer brand`) |
| `tokenBoundary.ts` | Pre-compiled RegExp allowlist for 24 prefix families — blocks injection of forbidden tokens |
| `tokenManifest.ts` | Canonical token schema — source of truth for the allowlist |
| `cacheKey.ts` | `computeInputHash()` — deterministic hashing for memo stabilization |
| `benchmark.ts` | Pipeline performance measurement (`measureSharedPipeline`) |
| `precompute.ts` | Server-side CSS precomputation pipeline (used by Convex actions) |
| `parityEngine.ts` | Figma ↔ OneUI token parity checking |

### React wrapper

`packages/ui/src/hooks/useBrandCSS.ts` is the only file with React dependency. It orchestrates the three memos and the `useInsertionEffect` injection. Never call engine functions directly from components — always go through this hook.

### Token boundary allowlist

Brand CSS injection is restricted to 24 prefix families. Tokens outside this list are silently filtered by `tokenBoundary.ts`:

```
--Surface-*        --Text-*           --Primary-*        --Secondary-*
--Tertiary-*       --Quaternary-*     --Neutral-*        --Sparkle-*
--Brand-Bg-*       --Positive-*       --Negative-*       --Warning-*
--Informative-*    --Typography-Font-* --Typography-Weight-* --Typography-Size-*
--Border-*         --Display-*        --Headline-*       --Title-*
--Body-*           --Label-*          --Code-*
```

Shape, Spacing, and Dimension tokens are intentionally **not** in the allowlist — they are defined in the token CSS files and are not brand-overridable at runtime.

### Performance targets

| Scenario | Target |
|----------|--------|
| Pipeline (cached, hash unchanged) | < 5ms |
| Pipeline (cold, full computation) | < 10ms |
| Theme toggle (memo #1 skip) | < 5ms |
| CSS size | < 50KB (soft warning) |
| Token count | < 800 (soft warning) |

---

## 8. Surface Context System

Components automatically adapt their token values when placed on a colored or bold surface. This is implemented purely in CSS via `[data-surface]` attribute selectors — no JavaScript runtime cost.

### How it works

The brand CSS injection includes `[data-surface="bold"] { ... }` blocks (and one block per surface mode) inside `@layer brand`. These blocks remap "default context" tokens to their parent-step-relative equivalents for that surface. Component CSS reads the same `var(--Token-Name)` tokens as always — the cascade handles the rest.

```css
/* Generated inside @layer brand by the surface CSS generator */
[data-surface="bold"] {
  --Primary-Bold: <parent-step-relative hex>;   /* fill that stays distinguishable */
  --Primary-Bold-High: <contrasting hex>;       /* on-bold text colour */
  --Primary-High: <contrasting hex>;            /* text inside the bold surface */
  /* ...all role tokens remap for this surface's parent step */
}
```

### The 7 unified surface modes

OneUI uses a single surface vocabulary — no BG/FG split. Every mode is resolved against its parent step so components nest correctly at any depth.

| Mode       | Resolution                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `default`  | Page surface. 2500 light / 200 dark. Ignores parent.                                                                |
| `ghost`    | Same step as parent (still triggers context remapping).                                                             |
| `minimal`  | Parent + 1 step toward contrasting direction.                                                                       |
| `subtle`   | Parent + 2 steps.                                                                                                   |
| `moderate` | Parent + 3 steps.                                                                                                   |
| `bold`     | Role `baseStep` (or `darkerBaseStep` if parent is already dark). Falls back to a large offset if too close to parent. |
| `elevated` | Parent + 1 step toward lighter (capped at 2500).                                                                    |

The same `bold` token fills a hero section background and a primary button — context-awareness just works because every surface is resolved against its parent step.

### Bold context — automatic contrast without an "on-bold" API

Inside `<Surface mode="bold">`, children that reference `--{Role}-Bold` would otherwise render "bold fill on bold background" — invisible. The cascade fixes this automatically: the bold block remaps `--{Role}-Bold` so the inner fill stays distinguishable, and `--{Role}-Bold-High` flips to the contrasting extreme of the inner step. No per-component inversion logic, no separate on-bold token family at the API boundary.

### Usage

```tsx
// Correct — components inside automatically adapt
<Surface mode="bold">
  <Button variant="bold">Fill stays distinguishable</Button>
  <Button variant="subtle">Tinted fill, readable text</Button>
  <Button variant="ghost">Readable text, no fill</Button>
</Surface>

// Also correct — any surface mode triggers the remapping cascade
<Surface mode="subtle">
  <Card>Tinted container; content adapts.</Card>
</Surface>

// Wrong — a raw <div> has no data-surface attribute, so tokens inside do not remap
<div style={{ background: 'var(--Primary-Bold)' }}>
  <Button variant="ghost">Broken — text is dark on dark</Button>
</div>
```

**Rule: whenever placing components on a non-default background (dark sections, colored cards, hero areas), always use `<Surface mode="...">` as the container. Never set background color manually on a div containing interactive components.**

### Picking a mode

| Scenario                                        | Mode         |
| ----------------------------------------------- | ------------ |
| Page surface / reset to default inside a nested context | `mode="default"`  |
| Light tinted card / section                     | `mode="subtle"`   |
| Slightly offset card (just above parent)        | `mode="minimal"`  |
| Stronger tint between subtle and bold           | `mode="moderate"` |
| Dark or colored hero, CTA, banner, filled button | `mode="bold"`    |
| Raised container (shadow/elevation surface)     | `mode="elevated"` |
| Same step as parent, still remap children       | `mode="ghost"`    |

Legacy V4 mode names (`'fg-bold'`, `'bg-subtle'`, `'bg-bold'`, `'fg-minimal'`, `'fg-subtle'`, `'bg-minimal'`) are still accepted by `<Surface>` and normalised to the canonical 7 tokens. They are deprecated — prefer the unified names in new code.

### Key files

| File | Role |
|------|------|
| `packages/shared/src/engine/cssGenNew.ts` | Emits `[data-surface]` blocks per mode inside `@layer brand` |
| `packages/shared/src/engine/surfaceNew.ts` | Parent-step-relative resolution mirroring `OneUIColourTool/packages/core/src/surfaceLogic.ts` |
| `packages/ui/src/hooks/useBrandCSS.ts` | Integrates surface context into memo #2 pipeline |
| `packages/ui/src/components/Surface/` | `<Surface>` component — sets `data-surface` attribute + background |

---

## 9. Building a Component

### Web (React)

1. **Use Base UI** — wrap the appropriate Base UI headless component. Never fork or re-implement behaviors.

2. **CSS Modules** — one `.module.css` file per component. No Tailwind. No inline styles.

3. **Tokens only** — every CSS value must reference a token via `var(--Token-Name)`. The component override token is the outermost fallback, semantic token is the default, and a primitive is the last resort.

```css
/* packages/ui/src/components/MyComponent/MyComponent.module.css */
.root {
  /* Component override → semantic token → primitive fallback */
  border-radius: var(--MyComponent-borderRadius, var(--Shape-2));
  background-color: var(--MyComponent-backgroundColor, var(--Surface-Subtle));
  padding: var(--MyComponent-paddingVertical, var(--Spacing-3))
           var(--MyComponent-paddingHorizontal, var(--Spacing-4-5));
  color: var(--MyComponent-textColor, var(--Text-High));
}
```

4. **Component structure** — follow the Button pattern:

```
packages/ui/src/components/MyComponent/
  MyComponent.shared.ts    — shared types and hooks
  MyComponent.tsx          — web implementation
  MyComponent.native.tsx   — React Native implementation
  MyComponent.module.css   — web styles (tokens only)
  MyComponent.stories.tsx  — Storybook stories (8 types required)
  MyComponent.test.tsx     — unit tests (90% coverage minimum)
```

5. **Never fork Base UI** — if a behavior is missing, open an issue or compose around it.

### React Native

Use `StyleSheet.create()` with `tokens.*` values:

```tsx
import { Pressable, StyleSheet } from 'react-native';
import { tokens } from '../../tokens';

const styles = StyleSheet.create({
  root: {
    borderRadius: tokens.shape['0-5'],
    backgroundColor: tokens.surface.subtle,
    padding: tokens.spacing.xs,
  },
});
```

### Required Storybook stories (8 types)

Every component must have all 8 story types before shipping:

| # | Story type | What it demonstrates |
|---|-----------|---------------------|
| 1 | `Default` | Base usage with minimal props |
| 2 | `Variants` | All visual variants (bold, subtle, ghost, etc.) |
| 3 | `Sizes` | All size options |
| 4 | `States` | Disabled, loading, error, and other interactive states |
| 5 | `WithIcons` | All icon slot combinations |
| 6 | `Interactive` | Play functions using `userEvent` for behavior testing |
| 7 | `Responsive` | Viewport-specific rendering |
| 8 | `Themes` | Side-by-side light/dark comparison |

### Run quality gates before shipping

```bash
pnpm check:literals    # Must be zero violations
pnpm validate:tokens   # Must be 100% resolved
pnpm typecheck         # Must be zero errors
pnpm test              # Must be >= 90% coverage
pnpm test:a11y         # Must be zero critical violations
pnpm check:parity      # Web and native tokens must match
pnpm check:layers      # CSS layer order must be correct
pnpm chromatic         # Visual regression must pass
```

---

## 10. Storybook

Storybook 10.2 runs at `apps/storybook/` and mirrors the platform app's brand styling exactly.

### Three-file architecture

| File | Runs in | Role |
|------|---------|------|
| `manager.tsx` | Manager frame (esbuild) | Toolbar addon: Brand → Platform → Viewport → Density selectors. Fetches Convex data via HTTP API. |
| `BrandStyleDecorator.tsx` | Preview iframe (Vite) | Queries Convex via React hooks, drives `useBrandCSS` with `injectionMode: 'global'`. Injects foundation tokens + component override tokens. |
| `preview.ts` | Preview iframe (Vite) | Decorator chain: ConvexProvider → BrandStyle → PlatformDensity → Theme → Icons. Imports `layers.css` first. |

The Convex URL is injected via `managerHead` script tag (manager frame) and `import.meta.env` (preview iframe).

### Running Storybook

```bash
# Requires Convex to be running for brand data
npx convex dev &
pnpm storybook
```

The toolbar lets you switch:
- **Brand** — any brand stored in Convex (live data)
- **Platform** — Mobile / Tablet / Desktop / TV / Watch
- **Viewport** — maps to platform breakpoints
- **Density** — Compact / Default / Open
- **Theme** — Light / Dark

---

## 11. Convex Backend

Convex is the real-time database and single source of truth for all brand and foundation data.

### Key tables

| Table | Contents |
|-------|---------|
| `brands` | Brand metadata (name, primaryHue, primaryChroma, platformBrandId) |
| `foundations` | Per-brand foundation configs (algorithmVersion, links to other tables) |
| `colorScales` | Custom OkLCH color scale definitions |
| `appearanceConfigs` | Multi-accent role configs (up to 9 roles per brand) |
| `presetColorScaleCollections` | Preset color scale libraries |
| `brandPresetScaleSelections` | Which preset scales a brand is using |
| `dimensionConfigs` | Per-platform dimension/breakpoint configs |
| `brandCSSCache` | Server-side pre-computed CSS cache (keyed by input hash) |
| `brandPublications` | CDN export records |

### Key queries

```typescript
// Batched foundation data — single subscription, no N+1
api.foundations.getBrandOverviewData

// All brands
api.brands.list

// Multi-accent appearance config for a brand
api.appearanceConfigs.getByBrand

// Preset color scale selections
api.presetColorScales.getBrandSelection
```

Convex subscriptions (`useQuery()`) auto-update all connected clients instantly when data changes. No polling, no cache invalidation needed.

### Running the backend

```bash
npx convex dev
```

This starts a local dev server with hot reload. Schema changes in `packages/convex/convex/schema.ts` are pushed automatically.

### Server-side CSS pre-computation

`brandCSSExport.ts` runs as a Convex action to pre-compute brand CSS for CDN delivery. Results are stored in `brandCSSCache` (keyed by `computeInputHash`). The `brandPublish.ts` workflow manages CDN publication.

---

## 12. Testing

### Test suites

| Package | Runner | Environment | Tests |
|---------|--------|-------------|-------|
| `@oneui/shared` | Vitest | Node | 219 tests across 10 files — engine unit tests |
| `@oneui/ui` | Vitest | jsdom | 128 tests — component tests (Button, IconButton, Link, FAB) |

### Running tests

```bash
pnpm test                              # All packages via Turbo
pnpm --filter @oneui/shared test       # Engine tests only
pnpm --filter @oneui/ui test           # Component tests only
```

### Engine test files (`packages/shared/src/engine/__tests__/`)

| File | What it covers |
|------|---------------|
| `validateBrandCSS.test.ts` | Required tokens, value validity, duplicates, interdependencies, edge cases |
| `wrapCSS.test.ts` | Three injection modes, `@layer brand` wrapping |
| `tokenBoundary.test.ts` | Allowlist enforcement, blocked prefixes (Shape/Spacing/Dimension) |
| `tokenManifest.test.ts` | 24 families, unique prefixes, category filtering, appearance role helpers |
| `cacheKey.test.ts` | Deterministic hashing, input sensitivity, null handling |
| `buildAvailableScales.test.ts` | Custom scales, preset scales, multi-scale, empty/null configs |
| `benchmark.test.ts` | Pipeline timings, scale counting, averaged results |
| `surfaceV4.test.ts` | V4 surface computation, mode correctness, on-colour generation |
| `surfaceContext.test.ts` | Surface context CSS generation, `[data-surface]` blocks |
| `surfaceTokenMapping.test.ts` | Token mapping correctness across roles and modes |

### Component test pattern

```typescript
// packages/ui/src/components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => { /* ... */ });
  it('calls onPress when clicked', async () => { /* ... */ });
  it('is disabled when disabled prop is true', () => { /* ... */ });
  it('shows loading state', () => { /* aria-busy="true" */ });
});
```

### Coverage requirement

90% minimum across statements, branches, functions, and lines. Tests below this threshold block the `pnpm test` quality gate.

---

## 13. Quality Gates

All 8 checks must pass before any component or feature ships. These run in CI and can be run locally:

| Command | What it checks | Failure threshold |
|---------|---------------|-------------------|
| `pnpm check:literals` | No hard-coded colors, pixels, or other CSS literal values anywhere in component code | Any violation |
| `pnpm validate:tokens` | All `var(--Token-Name)` references resolve to defined values | Any unresolved token |
| `pnpm typecheck` | TypeScript type-check across the entire workspace | Any error |
| `pnpm test` | All unit and component tests pass | Any failure or coverage < 90% |
| `pnpm test:a11y` | No critical accessibility violations (WCAG AA) | Any critical violation |
| `pnpm check:parity` | Web and React Native token usage is consistent | Any mismatch |
| `pnpm check:layers` | CSS `@layer` declaration order matches `layers.css` everywhere | Any ordering violation |
| `pnpm chromatic` | No unexpected visual regressions in Storybook | Any unaccepted diff |

Before external tester adoption, also follow
[`docs/component-adoption-readiness.md`](component-adoption-readiness.md) for
the focused surface-context, slot, accessibility, Storybook, and performance
readiness checks.

---

## 14. Common Workflows

### Adding a new brand

1. Open the platform app (`pnpm dev`) — navigate to Brands.
2. Create a new brand in the UI — Convex stores it instantly.
3. Configure foundations: color scales, appearance roles, surfaces, typography.
4. Brand CSS is auto-generated by `useBrandCSS` and injected on each save.
5. Preview in Storybook using the Brand toolbar selector.

No code changes are required to add a brand — the system is data-driven.

### Updating design tokens

1. Edit the relevant file in `packages/tokens/src/css/`:
   - Primitive values → `primitives.css`
   - Semantic aliases → `semantic.css`
   - Per-platform dimensions → `dimensions/scale.css`
   - Typography aliases → `typography/typography.css`
   - Theme overrides → `themes/light.css` or `themes/dark.css`
   - Density shifts → `density/compact.css` or `density/open.css`
2. Run `pnpm validate:tokens` to verify all references resolve.
3. Run `pnpm check:layers` to verify import order is unchanged.

### Creating a new component

```bash
# If a generator script exists:
pnpm generate:component MyComponent
```

Or manually:
1. Create the directory under `packages/ui/src/components/MyComponent/`.
2. Implement with Base UI + CSS Modules (tokens only).
3. Add the native implementation in `MyComponent.native.tsx`.
4. Write all 8 Storybook story types.
5. Write tests to 90%+ coverage.
6. Run all 8 quality gates.

### Debugging brand CSS

1. **Check validation output** — `validateBrandCSS` logs warnings to the console in dev mode. Look for missing required tokens, size violations, or duplicate declarations.

2. **Inspect the injected style element** — open DevTools, find `<style id="oneui-foundation-tokens">`. The full computed brand CSS is there.

3. **Check memo stability** — if the brand CSS is recomputing unexpectedly, log `computeInputHash(inputs)` before and after a change. A hash change means the inputs changed; an identical hash with a recompute means the memo deps array is incorrect.

4. **Token not resolving** — check `tokenBoundary.ts` allowlist. If the token prefix is not in the 24 allowed families, it is filtered before injection.

5. **Surface context not adapting** — verify the component is inside a `<Surface mode="...">` (which sets `data-surface`). Check that the brand CSS includes `[data-surface="bold"]` blocks (or whichever mode you are debugging) by inspecting `<style id="oneui-foundation-tokens">`.

### Switching theme scope (Default vs Brand)

The **Theme Scope** setting in the platform app controls which brand's surface/typography data feeds the CSS injection:

| Scope | Surface/Typography source | Dimensions/Fonts source | Use case |
|-------|--------------------------|------------------------|----------|
| Default Theme (`preview`) | One UI Theme brand | One UI Theme brand | Platform tool uses consistent own foundations |
| Brand Theme (`global`) | Brand being edited | One UI Theme brand | Live preview of the brand being configured |

Never set `injectionMode: 'none'` — this silently removes all surface, typography, and stroke tokens from the cascade.

---

## 15. Key Files Quick Reference

| Concern | File |
|---------|------|
| CSS layer order | `packages/tokens/src/css/layers.css` |
| Primitive tokens | `packages/tokens/src/css/primitives.css` |
| Semantic tokens | `packages/tokens/src/css/semantic.css` |
| Dimension / f-scale | `packages/tokens/src/css/dimensions/scale.css` |
| Typography aliases (relational) | `packages/tokens/src/css/typography/typography.css` |
| Light / dark themes | `packages/tokens/src/css/themes/` |
| Density remapping | `packages/tokens/src/css/density/` |
| Brand CSS engine (barrel) | `packages/shared/src/engine/index.ts` |
| Color scale builder | `packages/shared/src/engine/buildAvailableScales.ts` |
| Surface computation | `packages/shared/src/engine/surfaceV4.ts` |
| CSS generation | `packages/shared/src/engine/cssGenV4.ts` |
| CSS validation | `packages/shared/src/engine/validateBrandCSS.ts` |
| CSS injection wrapping | `packages/shared/src/engine/wrapCSS.ts` |
| Token boundary allowlist | `packages/shared/src/engine/tokenBoundary.ts` |
| Token manifest (source of truth) | `packages/shared/src/engine/tokenManifest.ts` |
| Input hash / memo stability | `packages/shared/src/engine/cacheKey.ts` |
| Figma parity engine | `packages/shared/src/engine/parityEngine.ts` |
| V4 stacking bridge (UI layer) | `packages/ui/src/engine/computeV4Stacking.ts` |
| React brand CSS hook | `packages/ui/src/hooks/useBrandCSS.ts` |
| Style injection hook | `packages/ui/src/hooks/useStyleInjection.ts` |
| Surface component | `packages/ui/src/components/Surface/` |
| Component pattern example | `packages/ui/src/components/Button/` |
| Convex schema | `packages/convex/convex/schema.ts` |
| Brand data query (batched) | `packages/convex/convex/foundations.ts` |
| Brand CRUD | `packages/convex/convex/brands.ts` |
| Server-side CSS cache | `packages/convex/convex/brandCSSCache.ts` |
| CDN export workflow | `packages/convex/convex/brandPublish.ts` |
| Platform layout + FOUC fix | `apps/platform/src/app/layout.tsx` |
| Foundation style provider | `apps/platform/src/app/(platform)/layout.tsx` |
| Storybook brand decorator | `apps/storybook/.storybook/BrandStyleDecorator.tsx` |
| Storybook toolbar addon | `apps/storybook/.storybook/manager.tsx` |
| Storybook decorator chain | `apps/storybook/.storybook/preview.ts` |
