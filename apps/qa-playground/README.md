# OneUI Components QA Playground (standalone)

Lightweight **Vite + React** shell for the component QA explorer — independent of `apps/platform` (Next.js). Use this when you deploy QA tooling outside One UI Studio while still consuming **`@oneui/ui`** from the same monorepo or from npm after publish.

## Plan (reference → production)

| Phase | What |
| ----- | ---- |
| **1. Develop here** | Run against workspace packages (`workspace:*`). Iterate on catalog, scenarios, report stubs. |
| **2. Extract** | Copy `apps/qa-playground/` (or only `src/` + config) into your repo. Replace `workspace:*` with published `@oneui/ui`, `@oneui/shared`, `@oneui/tokens` versions (or Git URLs). |
| **3. Scripts** | In this monorepo, npm scripts call `node ../../node_modules/vite/bin/vite.js` so `vite` resolves from the repo root. After extract, use normal `"dev": "vite"` once dependencies install locally. |
| **4. Registry** | `src/catalog/registry.ts` imports `ALL_COMPONENT_METAS` from `@oneui/ui/registry/metaRegistry`. That stays server-safe in theory but runs fully client-side here — bundle size is large; trim or generate JSON at build time if needed. |
| **5. CI / agent** | `pnpm qa:component -- <slug>` (default `--suite=all` ingests `public/qa-reports/<slug>-summary.json`). Open `/c/<slug>` and use **Load Playwright report**. Other slugs: POST Playwright JSON or poll object storage. |
| **6. CI / agent** | Button / Checkbox / Avatar / Stepper / Slider / Touch Slider / Circular Progress Indicator / Bottom Navigation / Pagination / Tabs / Input / Input Dynamic Text: `pnpm qa:button:report` · `pnpm qa:checkbox:report` · `pnpm qa:avatar:report` · `pnpm qa:stepper:report` · `pnpm qa:slider:report` · `pnpm qa:touch-slider:report` · `pnpm qa:circular-progress-indicator:report` · `pnpm qa:bottom-navigation:report` · `pnpm qa:pagination:report` · `pnpm qa:tabs:report` · `pnpm qa:input:report` · `pnpm qa:input-dynamic-text:report` → `public/qa-reports/<slug>-summary.json`. Open `/c/button`, `/c/checkbox`, `/c/avatar`, `/c/stepper`, `/c/slider`, `/c/touch-slider`, `/c/circular-progress-indicator`, `/c/bottom-navigation`, `/c/pagination`, `/c/tabs`, `/c/input`, etc. and use **Load Playwright report**. Aggregate dashboard: `pnpm dashboard:generate` → `/qa-reports/dashboard/index.html`. Other slugs: POST Playwright JSON or poll object storage. |

## Commands (from repo root)

```bash
pnpm dev:qa-playground
```

Default dev server: **http://localhost:5180** — e.g. `pnpm qa:component -- button` → **`http://localhost:5180/c/button`**. If you use **One UI Studio** instead, open **`/components/qa/button`** with `pnpm dev:platform`; the app loads the same JSON via **`GET /api/components-qa/report/button`**.

```bash
pnpm build:qa-playground
```

**Parameterized component QA** (from repo root; Playwright configs start Vite on port 5180 when needed):

```bash
# List registered slugs (auto-discovered from playwright.<slug>.config.ts + button)
pnpm qa:component -- --list

# Full run: functional + a11y specs, then ingest → public/qa-reports/<slug>-summary.json
pnpm qa:component -- icon-button
pnpm qa:component -- pagination --suite=all

# Functional only (*-qa.spec.ts, plus *-figma-matrix.spec.ts when present)
pnpm qa:component -- icon-button --suite=functional

# Accessibility only (*-accessibility.spec.ts, or Accessibility describe in combined specs)
pnpm qa:component -- icon-button --suite=a11y
pnpm qa:component -- icon-button --suite=a11y --open-axe-report

# Every registered component (sequential; summary at end; exit 1 if any failed)
pnpm qa:component -- --all

# Stop on first failure
pnpm qa:component -- --all --fail-fast
```

Examples: `button`, `checkbox`, `slider`, `touch-slider`, `pagination`, `icon-button`, `icon-contained`, `image`, `selectable-button`, `single-text-button`, `icon`, etc.

`--all` runs ~30 Playwright bundles sequentially (can take a long time). Each config reuses the Vite server on port 5180 when possible.

Open `/c/<slug>` — tabs: **Test Scenarios**, **Figma Validation** (where applicable), **Accessibility**, **Functional Tests**.
**Avatar — same pattern** (`e2e/avatar-qa.spec.ts`, `public/qa-reports/avatar-summary.json`):

```bash
pnpm qa:avatar:report
```

**Stepper — same pattern** (`e2e/stepper-qa.spec.ts` + `e2e/stepper-accessibility.spec.ts`, `public/qa-reports/stepper-summary.json`):

```bash
pnpm qa:stepper:report
```

**Slider — same pattern** (`e2e/slider-qa.spec.ts` + `e2e/slider-accessibility.spec.ts`, `public/qa-reports/slider-summary.json`):

```bash
pnpm qa:slider:report
```

**Touch Slider — same pattern** (`e2e/touch-slider-qa.spec.ts` + `e2e/touch-slider-accessibility.spec.ts`, `public/qa-reports/touch-slider-summary.json`):

```bash
pnpm qa:touch-slider:report
```

**Tabs — Playwright functional + accessibility** (`e2e/tabs-qa.spec.ts`, `e2e/tabs-accessibility.spec.ts`, `public/qa-reports/tabs-summary.json`):

```bash
pnpm qa:tabs:report
```

**Input — Playwright functional + accessibility** (`e2e/input-qa.spec.ts`, `e2e/input-accessibility.spec.ts`, `public/qa-reports/input-summary.json`):

```bash
pnpm qa:input:report
```

**Input Dynamic Text — Playwright functional + accessibility** (`e2e/input-dynamic-text-qa.spec.ts`, `e2e/input-dynamic-text-accessibility.spec.ts`, `public/qa-reports/input-dynamic-text-summary.json`):

```bash
pnpm qa:input-dynamic-text:report
```

**Pagination — Playwright functional + keyboard + visual + accessibility** (`e2e/pagination-qa.spec.ts`, `e2e/pagination-accessibility.spec.ts`, `public/qa-reports/pagination-summary.json`):

```bash
pnpm qa:pagination:report
```

**Icon Button · Icon Contained · Image · Selectable Button · Single Text Button** — Figma API validation tab + Playwright bundles:

```bash
pnpm qa:icon-button:report
pnpm qa:icon-contained:report
pnpm qa:image:report
pnpm qa:selectable-button:report
pnpm qa:single-text-button:report
```

Open `/c/icon-button`, `/c/icon-contained`, `/c/image`, `/c/selectable-button`, `/c/single-text-button` — tabs: **Test Scenarios**, **Figma Validation** (API comparison tables + visual grids), **Accessibility**, **Functional Tests**.

**Tests dashboard** (all ingested summaries):

```bash
pnpm dashboard:generate
pnpm dashboard:open
```

### Accessibility — bug-detection mode (not “all green”)

Playwright a11y suites **fail on purpose** until `@oneui/ui` bugs are fixed. See [`docs/KNOWN_A11Y_BUGS.md`](docs/KNOWN_A11Y_BUGS.md).

- Each component has a **BUG-*** story band (`data-section="…-bug-repro"`, intentional misuse).
- Test titles describe **what the test runs** (e.g. `WCAG 2.1 AA axe scan — Default band`, `axe button-name rule — …`, `Keyboard Enter — …`), not pass/fail outcomes.
- Bug ids (`BUG-*`) and showcase `data-section` ids are attached for the dashboard via Playwright annotations, not in the test title.
- Happy-path bands use `[a11y] component band "…"` with `axe.include([data-section="…"])` — no full-page scans.
- `button-name` / `role-img-alt` moderate findings are treated as blocking for those rules.

**Expected today:** `pnpm qa:component -- icon-contained`, `icon-button`, `single-text-button`, and `image` should **not** be green until developers fix the listed bugs. `selectable-button` may pass if no open BUG is filed for that slug.

## Routes

- `/` — catalog (search, filters, cards)
- `/c/:slug` — component detail (test scenarios + report tabs)
- `/qa/dashboard` — **Notion Bug Tracker dashboard** (summary cards, charts, bug explorer)
- `/tools/performance` — perf harness
- `/demo/jio` — Jio consumer sample app

### Notion Bug Tracker dashboard

1. Create a Notion integration and share your Bugs database with it.
2. Add to repo-root `.env.local`:

   ```bash
   NOTION_API_KEY=secret_...
   NOTION_DATABASE_ID=...
   ```

3. Run `pnpm dev:qa-playground` and open **http://localhost:5180/qa/dashboard**.

Expected database properties (override via `NOTION_PROP_*` env vars): **Bug Title**, **Bug Key**, **Bug Status**, **Severity**, **Platform** (multi-select), **Components OneUi v5** (relation), **Category**, **Assignee**, **Reported By**, **Create Date**, **Modified Date**, **Release**.

```bash
NOTION_DATABASE_ID=35f2010de07f8092b17be9835c637aba
NOTION_PROP_COMPONENT=Components OneUi v5 
NOTION_PROP_STATUS=Bug Status
NOTION_USE_CURL=1
```

Without credentials the dashboard shows **demo data** and a configuration banner. The Notion API key never ships to the browser — Vite dev middleware serves `GET /api/notion/bugs`.

## Where component QA code lives (authoritative)

| What | Location |
|------|-----------|
| **This app** (catalog, routes, generic scenarios, tokens) | `apps/qa-playground/src/` |
| **Custom per-component “Stories” canvases** (optional) | `apps/qa-playground/src/components/<slug>/\*QaShowcase.tsx` |
| **Which slugs use a custom canvas** | `apps/qa-playground/src/components/registerComponentShowcases.ts` |
| **Components without a custom file** | Still appear in the catalog; detail view uses **generated** scenarios from `src/lib/qa/buildScenarios.ts` — no folder under `components/` required |
| **Storybook/library showcases** (`*.showcase.tsx` next to components) | `packages/ui/…` — shared with Storybook, **not** part of this Vite app |

Studio (`apps/platform/.../components/qa/`) only **reuses** `@oneui/qa-playground` for the same canvases; **add new QA UI under `apps/qa-playground` only.**

See **`src/components/README.md`** for the folder convention and how to register a new slug.

## Token / theme bootstrap

`src/index.css` mirrors `apps/storybook/.storybook/preview.ts` CSS order (layers → scale → typography → themes …). `RootShell` sets `data-Breakpoint` / density on `<html>` for dimension tokens.

Icons: **`IconProvider`** uses **`lucide`** so semantic icons (e.g. Button `start="heart"`) work without Jio JSON loaders.

## Ownership

This app is intentionally **not** coupled to Convex, middleware, or Studio navigation — only design-system packages.
