# Platform Audit — June 2026

> Full-platform audit of OneUI Studio as the centralization point for multi-brand
> design system generation. Covers foundations, the definition → generation →
> injection pipeline, the components section and edit mode, materials, the agent
> layer, and local-dev performance. Each finding links to the remediation that
> shipped with this audit (commits on `codex/checkbox-readonly-dark-mode`, June 2026).

## Executive summary

The architecture is sound: definition (foundation editors) → Convex → pure-function
engine (`@oneui/shared/engine`) → validated `@layer brand` injection is well-built,
real-time, and well-tested. The audit found **no structural problems** — instead a
set of *unfinished pipelines* (configs saved but never consumed, theme decisions
emitted but never read), a minimal brand overview, and avoidable local-dev startup
latency. All four prioritized workstreams were fixed in this pass.

| # | Finding | Status |
|---|---------|--------|
| 1 | Card/Container shape pipeline was phantom (emitted, never consumed) | **Fixed** — real `Card` component + studio chrome adoption |
| 2 | Elevation foundation saved but never emitted as CSS | **Fixed** — `generateElevationCSS` + allowlist + hook/precompute wiring |
| 3 | Shapes page read-only; deprecated `shapeConfigs` table | **Fixed** — Brand Shape Language tab; table reads removed |
| 4 | Edit mode hand-wired for 16 of 50+ components | **Fixed** — registry-driven generic editor + showcase route |
| 5 | Local dev load: preloader font-wait, query competition, icon loader duplication | **Fixed** + instrumentation added |
| 6 | Brand overview minimal (label-only rows, no completeness) | **Fixed** — preview tiles + completeness meter |
| 7 | Agents: should they migrate to Mastra? | **No action needed** — already on Mastra (see below) |

## Findings in detail

### 1. Card/Container shape — phantom pipeline (fixed)

The global theme's **Cards family** (`packages/shared/src/componentThemes.ts`,
decisions: shapeLanguage / elevationLevel / strokeEmphasis / surfaceTone / density)
resolved into `--Card-*` custom properties via `buildComponentOverrideCSS`, but
`packages/ui/src/components/Card/` contained *only* `Card.tokens.ts` — no component.
Only two platform CSS modules consumed `--Card-borderRadius`.

**Decision record — Container is NOT the card.** `Container.recipe.ts` documents
itself as a pure width shell (fluid/fixed/full-bleed; all recipe options resolve to
`[]`; padding from `--Grid-Margin`). Pointing the cards family at Container would
conflate layout boundary with surface treatment. Container intentionally has no
radius.

**Shipped:** a real `Card` component (`packages/ui/src/components/Card/`) whose
geometry reads `--Card-borderRadius/borderWidth/boxShadow/padding/gap` with
manifest-default fallbacks; default fill from `--Card-backgroundColor`, or
`surface="subtle|bold|elevated|…"` to render as a `<Surface>` so children adapt via
the `[data-surface]` cascade. `PreviewCard` (popup radius) and `FoundationCard`
(the studio's own card chrome) now follow `--Card-*` too, so the studio previews
the active brand's card language live. A Cards section was added to the global
`ComponentThemePreview`.

### 2. Elevation — saved but never consumed (fixed)

`/foundations/elevation` persisted `{ baseOpacity, darkModeMultiplier }` via
`upsertByType`, but no engine generator consumed it; `--Elevation-1..5` stayed
static in `primitives.css`. Worse, `--Elevation-` was **not** in the
`tokenManifest.ts` allowlist, so even emitted CSS would have been stripped by
`tokenBoundary`/`validateBrandCSS`.

**Shipped:** `packages/shared/src/engine/elevationCSS.ts` (`generateElevationCSS`,
mirrors the `motionCSS.ts` contract — `''` when unconfigured so static fallbacks
stay active). `--Elevation-` added to the token manifest as a new `elevation`
category. `useBrandCSS` wires the config into the composite cache key and the
`rawCSS` join; the server precompute paths (`brandCSSPrecompute`, `brandCSSExport`)
pass `elevationConfig` for cache parity. The foundation page now uses the shared
`elevationLevelToBoxShadow`, so editor preview and injected CSS cannot drift.

### 3. Shapes — read-only page, deprecated table (fixed)

**Decision record — shapes stay system-constant.** `--Shape-*` values derive from
dimension f-steps (density/platform responsive) and remain boundary-protected;
raw per-brand overrides would break layout integrity. Brand shape *intent* is
expressed through the component-theme `shapeLanguage` decisions, which already had
a complete working pipeline.

**Shipped:** a "Brand Shape Language" tab on `/foundations/shapes` that reads/writes
the same `componentThemeSelections` as the Global Component Theme page (per-family:
actions / inputs / display / cards), with live option previews.
`tokenGenerators.generateShapeTokens` no longer reads the deprecated `shapeConfigs`
table (Shape-Pill is a fixed 9999px constant).

**Deprecation plan:** `shapeConfigs` has zero reads/writes left; the schema comment
marks it for removal. Drop the table in a *later* deploy cycle (never remove table +
code in the same deploy). `elevationConfigs` (legacy, separate from the
`foundations` row) is still returned by `getBrandOverviewData` as `elevationConfig`
for native paths — consolidate when the native pipeline reads `elevation.config`.

### 4. Edit mode — generalized (fixed)

16 components had hand-wired edit pages; each duplicated ~80 lines of identical
Convex wiring. The `[component]/editor` route was already generic except a
per-slug preview `switch`.

**Shipped:**
- `getComponentPreview` falls back to the registry `previewComponent` (then to the
  real `component`) before "coming soon" — Tabs, Slider, Badge, PaginationDots and
  ~16 more get a working advanced editor with zero per-component code.
- `components/lib/useComponentEditorWiring.ts` — the shared Convex block
  (overrides + recipe selections queries, save/clear handlers). Existing pages can
  migrate opportunistically.
- `components/lib/GenericComponentPageContent.tsx` + dynamic
  `components/[component]/page.tsx` — registry-driven showcase (meta header,
  preview, generated docs when present, PropertyPanel) for every manifest-bearing
  slug without a bespoke page. Static segments keep the 16 bespoke pages winning.

**Next batch candidates:** migrate the existing static showcase pages without edit
mode (slider, tabs, fab, badge, select) onto `useComponentEditorWiring` +
PropertyPanel; add `previewComponent` entries for Container/Card/FAB.

### 5. Performance — local dev load (fixed + measure-first)

Corrections to common assumptions, verified during the audit:

- `agentChat.listThreads` was *already* gated to Home mode — but Home is the cold-load
  default, so it still competed with shell-critical queries. Now also deferred until
  the `oneui:app-ready` handshake.
- Icon packs were *already* lazy-loaded — the problem was **duplicate registration**:
  `initJioIcons.ts` re-registered the same five loaders as `initIconSetLoaders.ts`
  (and its weaker version won). Now a single registration path (promise cache +
  phosphor name fallbacks).
- tldraw (~2 MB) and sandpack are route-isolated under `(experience-lab)` /
  `internal/render-code` with dynamic imports; in dev, Turbopack compiles route
  subtrees on demand, so they do **not** cost studio cold loads. No action.

**Shipped:**
- `AppReadyPreloader` no longer waits 200 ms + ≤800 ms for the brand font. It
  dismisses as soon as shell data is ready **and** brand CSS is injected
  (`data-brand-ready` attribute from `useStyleInjection`, MutationObserver + 1 s
  safety valve). The font warms in parallel; `font-display: swap` covers cold CDNs.
  Worst-case ~1 s of artificial delay removed.
- `apps/platform/src/lib/perfMarks.ts` — dev-only startup marks
  (nav-start → brands → foundations → CSS injected → app-ready) printed as a
  console table on app-ready. **Use this first** to decide any further work: if
  first render is seconds after nav-start, Turbopack compile of the transpiled
  source packages (`@oneui/ui`, `@oneui/tokens`, `@oneui/shared`) dominates and the
  next lever is pre-building those packages for dev; if render is fast and
  app-ready lags, it's data/handshake.

**Not done (candidates, in order):** pre-build the three transpiled workspace
packages; route-level code-split of the AdvancedEditor import chain; Convex
query-resolution timing marks.

### 6. Brand overview — minimal (fixed)

Shape/Elevation/Motion rows were label-only; Grid and Materials were absent; no
completeness signal. Now: live shape-language swatches (reading the injected
`--Button/--Card/--InputField` radius vars — zero queries), elevation sample tiles
via the shared formula, motion easing-curve SVG + base duration, grid column bars,
metallic gradient swatches, and a "Brand definition N%" meter strip computed from
`stats.configured` + agent configs. No new Convex subscriptions.

### 7. Agents — Mastra verdict: already there (no action)

The orchestration layer (`packages/experience-builder-agents`) runs entirely on
**Mastra** (`@mastra/core` 1.37): `createWorkflow()` owns sequencing, branching,
and HITL; advisors (planner, voice, design adapters), IR generation, evaluation,
and repair are Mastra steps/tools. The only bespoke seam is `modelAdapter.ts`
(Vercel AI SDK `Output.object` → Anthropic) — an intentional isolation point
(ORCH-04), not debt. Migrating the thin API-route handlers or Convex queries into
Mastra would add complexity without benefit. The one optional improvement: replace
the lab conversation store's `InMemoryStore` with a persistent Mastra store
(libsql/postgres) when durability matters.

## Pipeline integrity map (post-fix)

| Foundation | Editor saves | Engine consumes | Notes |
|---|---|---|---|
| Color / Appearance | ✓ | ✓ | surface stacking, root + context CSS |
| Typography (V2) | ✓ | ✓ | relational f-step aliases |
| Dimension / Platforms | ✓ | ✓ | `generateDimensionCSS`, separate style element |
| Motion | ✓ | ✓ | `motionCSS.ts` |
| **Elevation** | ✓ | **✓ (this audit)** | `elevationCSS.ts`, theme-dependent |
| Grid | ✓ | ✓ | `gridCSS.ts` |
| Materials | ✓ | ✓ | metallic + assignments |
| Icons | ✓ | n/a | registry selection, no CSS |
| Decorations | ✓ | ✓ | ornament CSS vars |
| **Shapes** | **✓ (this audit, via theme selections)** | ✓ | tokens stay system-constant |
| Strokes | read-only | static | by design |
| Component themes (cards family) | ✓ | **✓ (this audit)** | real Card + chrome adoption |

## Known pre-existing issues (out of scope, not introduced here)

- `pnpm typecheck` failures in `(experience-lab)`/`api/experience-lab` (tldraw
  ShapeUtil `indicator`, Convex `experienceRuns` table types, zod v3/v4 conflict in
  `plannerAgent` referencing a sibling repo) — all present in the uncommitted
  working tree before this audit.
- 7 failing tests in `surfaceNew.test.ts` (content-extreme expectations) and
  `knowledgeSources.test.ts` at branch HEAD.
- 16 `check:literals` violations in Image/Modal/Surface stories.
