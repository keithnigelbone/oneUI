# Technology Stack

**Analysis Date:** 2026-05-29

## Languages

**Primary:**
- TypeScript 5.7.x — all packages, apps, and scripts; strict mode enabled (`noImplicitAny`, `strictNullChecks`, etc.)
- CSS — design tokens, component styles (CSS Modules; zero Tailwind)

**Secondary:**
- JavaScript (ESM) — a handful of config files (`next.config.js`, ESLint flat config `eslint.config.mjs`)

## Runtime

**Environment:**
- Node.js >=20.0.0 (required by `engines` in root `package.json`; CI uses Node 20; Storybook CI uses Node 24)
- Currently running: v20.19.5

**Package Manager:**
- pnpm 9.15.9 (pinned in `packageManager` field and in all CI workflows)
- Lockfile: `pnpm-lock.yaml` — present and committed

## Monorepo Setup

**Orchestrator:** Turborepo 2.3.4 (`turbo.json`)

**Workspace layout** (`pnpm-workspace.yaml`):
```
packages/
  convex/       @oneui/convex     — Convex backend package (schema + generated API)
  esbuild-plugin/                 — esbuild plugin for OneUI
  icons-jio/                      — Jio icon set
  init/                           — project init scaffolding
  kb-core/      @jds/kb-core      — knowledge base core (brand JSON, offline Storybook)
  kb-rn/                          — knowledge base React Native
  kb-web/                         — knowledge base web
  next-plugin/                    — Next.js plugin for OneUI
  shared/       @oneui/shared     — pure engine: CSS gen, surface stacking, agent prompts
  tokens/       @oneui/tokens     — CSS custom properties and token validators
  ui/           @oneui/ui         — React web component library (headless Base UI)
  ui-native/    @oneui/ui-native  — React Native component library
  ui-native-materials/            — React Native materials variant
  vite-plugin/                    — Vite plugin for OneUI
  webpack-plugin/                 — webpack plugin for OneUI

apps/
  button-figma-validation/        — Playwright + Applitools Figma parity tests
  docs/         @oneui/docs       — Fumadocs-powered documentation site (Next.js, port 3001)
  mobile/       @oneui/mobile     — Expo React Native app
  native-components-sample/       — Native component sample app
  native-sample/                  — Native sample app
  platform/     @oneui/platform   — Main design system studio (Next.js, port 3000)
  qa-playground/@oneui/qa-playground — Playwright + Axe accessibility testing harness
  storybook/    @oneui/storybook  — Storybook 10 component documentation
```

**Turbo tasks:** `build`, `dev`, `test`, `test:a11y`, `typecheck`, `validate:tokens`, `clean`

## Frameworks

**Core (Web Platform):**
- Next.js 15.1.x — `apps/platform/package.json` and `apps/docs/package.json`
  - Default dev: Turbopack (`next dev --turbopack`)
  - Production builds: webpack (memory-optimised, 8 GB cap)
  - App Router (no Pages Router)
  - Vercel deployment target

**Core (Mobile):**
- Expo ~54.0.0 — `apps/mobile/package.json` (`expo start`, `expo start --ios/android`)
- React Native 0.81.5 (pinned via pnpm overrides)

**UI (Headless Primitives):**
- `@base-ui/react` ^1.0.0 — headless primitives (in `@oneui/ui`); never forked
- Radix UI primitives present in Storybook devDependencies for comparison stories only

**Documentation:**
- Storybook 10.3-10.4 — `apps/storybook/` + `@storybook/react-vite`
- Fumadocs 15.8.x — Markdown/MDX documentation site (`apps/docs/`)

**Testing:**
- Vitest 2.x (per-package) / Vitest 4.x (root + shared engine)
- Playwright 1.59.1 — visual and a11y E2E (`apps/qa-playground/`, `apps/button-figma-validation/`)
- `@testing-library/react` 16.x, `@testing-library/user-event` 14.x
- `vitest-axe` 0.1.x — accessibility assertions
- `@axe-core/playwright` 4.11.x — Playwright a11y audits
- `@applitools/eyes-playwright` — Applitools visual regression (`apps/button-figma-validation/`)
- Chromatic 16.7.x — Storybook visual regression CI

**AI / LLM:**
- Vercel AI SDK (`ai` ^6.0.x, `@ai-sdk/anthropic` ^3.0.x, `@ai-sdk/react` ^3.0.x)
- Primary model: `claude-sonnet-4-6` (constant in `packages/shared/src/agent/models.ts`)
- Used for: design composition agent, home chat, voice/tone agent, build agent

## Build Tooling

**Monorepo orchestration:** Turbo 2.3.4

**Component library (`@oneui/ui`):** Vite 6.0.x with `@vitejs/plugin-react` and `vite-plugin-dts` — outputs ESM + CJS + `.d.ts`

**Shared / tokens packages:** tsup 8.x — ESM + CJS dual output

**Platform app:** Next.js built-in (Turbopack in dev, webpack in production)

**Mobile:** Metro 0.83.3 (pinned via pnpm overrides), Babel (`@babel/core`)

**Scripts runner:** `tsx` 4.19.x — runs all TypeScript scripts in `scripts/` directly

**CSS bundling:** CSS Modules (Vite/Next.js native support); no PostCSS transformation layer

## Key Dependencies (Production)

| Package | Version | Purpose |
|---------|---------|---------|
| `@base-ui/react` | ^1.0.0 | Headless accessible primitives (in `@oneui/ui`) |
| `convex` | ^1.39.1 | Realtime backend client |
| `@ai-sdk/anthropic` | ^3.0.54 | Anthropic Claude API via Vercel AI SDK |
| `ai` | ^6.0.111 | Vercel AI SDK core (`streamText`, `UIMessage`) |
| `@supabase/supabase-js` | ^2.101.1 | Supabase client (optional, smoke scripts) |
| `tldraw` | ^4.5.3 | Canvas/artboard in experience builder |
| `@codesandbox/sandpack-react` | ^2.20.0 | In-browser code sandbox for playground |
| `embla-carousel-react` | ^8.5.2 | Carousel component implementation |
| `zod` | ^4.3.6 | Runtime schema validation (shared + platform) |
| `clsx` | ^2.1.0 | Conditional className composition |
| `opentype.js` | ^1.3.4 | Font file parsing for typography metrics |
| `dom-to-svg` | ^0.12.2 | Canvas-to-SVG export |
| `fumadocs-core` / `fumadocs-mdx` | ^15.8.x / ^13.0.x | Documentation site framework |
| `@phosphor-icons/react` | ^2.1.10 | Icon set |
| `@remixicon/react` | ^4.8.0 | Icon set |
| `@tabler/icons-react` | ^3.36.1 | Icon set |
| `lucide-react` | ^0.562.0 | Icon set |
| `hugeicons-react` | ^0.3.0 | Icon set |

## Key Dependencies (Development)

| Package | Version | Purpose |
|---------|---------|---------|
| `turbo` | ^2.3.4 | Monorepo task orchestration |
| `typescript` | ^5.7.2 | Compiler (all packages) |
| `vitest` | ^2.x / ^4.x | Unit and a11y testing |
| `playwright` | ^1.59.1 | E2E and visual testing |
| `chromatic` | ^16.7.0 | Storybook visual regression |
| `@changesets/cli` | ^2.27.0 | Versioning and changelog |
| `prettier` | ^3.4.2 | Code formatting |
| `eslint` | ^9.17.0 | Linting (flat config) |
| `ts-morph` | ^28.0.0 | TypeScript AST analysis (scripts) |
| `@babel/parser` + `@babel/traverse` | ^7.29.x | AST manipulation in `@oneui/shared` |
| `tsup` | ^8.0.0 | Library bundler (`@oneui/shared`, `@oneui/tokens`) |
| `vite` | ^6.0.0 | Component library build (`@oneui/ui`) |
| `tsx` | ^4.19.2 | Direct TypeScript script execution |

## CSS Approach

**Methodology:** CSS Modules exclusively — zero Tailwind, zero Emotion, zero styled-components

**Cascade architecture:** Five `@layer` declarations in `packages/tokens/src/css/layers.css`:
```css
@layer base, semantic, theme, density, brand;
```

**CSS import order** (must be preserved):
1. `@oneui/tokens/css/layers` — layer declarations
2. `@oneui/tokens/css/dimensions/scale` — per-platform f-step values
3. `@oneui/tokens/css` — primitive token values
4. `@oneui/tokens/css/typography` — relational typography aliases
5. `@oneui/tokens/css/semantic` — contextual token mappings
6. `@oneui/tokens/css/light` or `dark` — theme overrides
7. `@oneui/tokens/css/density/*` — density remapping
8. `<style id="oneui-foundation-tokens">` — brand CSS injection (wins all layers)

**Custom properties:** All styling via `var(--Token-Name)` — hard-coded values are a zero-tolerance violation checked by `pnpm check:literals`

**Component CSS files:** Co-located `*.module.css` in `packages/ui/src/components/`

**Brand CSS injection:** Pure-function engine in `packages/shared/src/engine/` computes brand CSS at runtime; injected via `useInsertionEffect` into `<style id="oneui-foundation-tokens">` at `@layer brand`

## Configuration Files

| File | Purpose |
|------|---------|
| `turbo.json` | Monorepo task pipeline |
| `pnpm-workspace.yaml` | Workspace package globs |
| `tsconfig.json` | Root TypeScript config (extended by all packages) |
| `eslint.config.mjs` | ESLint 9 flat config |
| `vercel.json` | Vercel build + deploy config |
| `apps/platform/next.config.js` | Next.js config (Turbopack, webpack, rewrites) |
| `packages/ui/vite.config.ts` | Vite library build config |
| `packages/shared/tsup.config.ts` | tsup build for shared engine |
| `packages/tokens/tsup.config.ts` | tsup build for tokens |

## Platform Requirements

**Development:**
- Node.js >=20.0.0
- pnpm 9.15.9
- macOS/Linux (scripts use bash, `lsof`)
- Convex deployment URL required (`NEXT_PUBLIC_CONVEX_URL`)

**Production:**
- Vercel (platform app) — `apps/platform/.next` output
- GitHub Pages (Storybook) — `apps/storybook/storybook-static/`
- Azure DevOps Artifacts feed — npm package releases (`@jds4/*` scope)
- Expo Application Services (mobile) — React Native / Expo build

---

*Stack analysis: 2026-05-29*
