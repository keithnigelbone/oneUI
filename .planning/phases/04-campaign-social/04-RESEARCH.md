# Phase 4: Campaign / Social - Research

**Researched:** 2026-06-02
**Domain:** Non-web foundation resolution · campaign-planner structured output + HITL · ordered carousel frames · raster/PDF/code export
**Confidence:** HIGH (codebase-grounded; every seam read in source) / MEDIUM (PDF library choice — verified via current docs, not yet installed)

## Summary

Phase 4 is **almost entirely an extension exercise on existing, well-factored seams** — not new system design. The Mastra workflow (`workflow.ts`), the single model seam (`modelAdapter.callModel`), the foundation resolver (`foundationResolver.ts`), the planner/ToV/Design advisors, the per-frame quality loop (`evaluate.ts`/`repair.ts`), suspend/resume HITL, best-of-N variant grouping, the Playwright capture path, and the append-only Convex `experience*` tables are all in place and exercised today for web profiles. Phase 4 lights up the non-web half.

The single biggest finding: **the non-web dimension-resolution machinery already exists** in `packages/shared/src/data/dimension-scales.ts` as `getDimensionValueFromConfig(config, platformId, breakpointId, density, step)` plus `resolveBreakpointBaseSize` / `getAllAvailableBreakpoints`. The OneUI Platforms foundation already models `print` (A4/A5/Business Card, in mm) and `physical`/`outdoor` (Billboard 1920×1080px, Bus Stop, Indoor Signage) canvases with real `viewportWidth`/`viewportHeight`/`units` + DIN-1450 `viewingDistance`/`ppi`/`pixelDensity`. The hard part is NOT computing type-scale/dimensions from a PlatformEntry — that's solved. The hard part is the **`outputProfile` → `PlatformEntry`/`PlatformBreakpoint` matching strategy**, because the canonical Lab profiles (`ig-square`, `ig-portrait`, `ig-story`, `ig-carousel`, `slide-16x9`, etc.) **do NOT exist in the default Platforms foundation seed** (`platform-config.ts`). The seed defines print + outdoor, but no Instagram/slide canvas. So for most brands today, `ig-*` resolution **honestly produces an FND-03 gap** (exactly D-02's intent) until a brand adds those canvases to its Platforms foundation.

**Primary recommendation:** Build a thin, explicit **Lab mapping table** (`outputProfile → { platformId, breakpointId }`) inside `experience-builder-core`, then extend `foundationResolver.ts` to (1) flip `isCoveredProfile` so non-web profiles are no longer hard-gated, (2) look up the mapped (platformId, breakpointId) in the brand's `PlatformsFoundationConfig`, (3) on a hit, compute dimensions/type-scale/safe-areas via the existing `getDimensionValueFromConfig`/`resolveBreakpointBaseSize` helpers and return them in an **extended success result**, and (4) on a miss (mapping absent OR breakpoint not in the brand's foundation) return the **typed FND-03 gap**. For export, use **pdf-lib** (zero native deps, pure-JS, works in the same Node route as Playwright) to compose full-res rasters into a multi-page PDF; re-render at native size via the existing Playwright capture path with `deviceScaleFactor` set from the foundation's `pixelDensity`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Non-web dimension/type-scale/safe-area resolution | API / Backend (`foundationResolver` + `@oneui/shared` dimension helpers) | — | Foundation-backed, deterministic, no model; must run server-side where Convex foundations load |
| `outputProfile → PlatformEntry/Breakpoint` mapping | API / Backend (`experience-builder-core` config) | — | Pure typed config, like `outputProfileTable.ts` |
| Campaign Planner structured output | API / Backend (`plannerAgent` via `callModel`) | — | Single model seam; orchestration is Mastra's |
| Campaign-plan HITL card + resume | Frontend Server (run route) ↔ Browser (canvas card) | API (Mastra suspend/resume) | AG-UI event stream drives the card; the resume POST re-enters the workflow |
| Carousel frame generation (per-frame quality loop) | API / Backend (Mastra workflow) | — | Reuses generate→compile→validate→evaluate→repair per frame |
| Per-frame ToV copy | API / Backend (`voiceAdapter` via `callModel`) | — | Existing advisor seam |
| Full-res raster re-render (PNG/JPG) | API / Backend (Playwright in Node route) | — | Headless chromium; native-size capture |
| PDF multi-page composition | API / Backend (`experience-builder-export` + pdf-lib) | — | Server-side raster→PDF; pure-JS |
| Code export (TSX + Jio CSS) | API / Backend (`compiler.ts` output, already persisted) | — | No re-generation; read persisted `compiledBundle` |
| Artifact persistence (raster/PDF bytes) | Database / Storage (Convex `_storage` + `experience*` tables) | — | Append-only, mirrors thumbnail upload pattern |
| Export trigger | Browser (card action menu `⋮ → Export`) | Frontend Server (export route) | Card-action UX into the `export` card kind |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FND-02 | Resolver covers non-web output profiles (IG square/portrait/story, carousel, slide, outdoor, image) | Extend `foundationResolver.ts` + new Lab mapping table; reuse `getDimensionValueFromConfig` (already non-web-capable). See **Pattern 1**, **Architecture**. |
| CAMP-01 | Generate IG/campaign artifact from a brief as a first-class path | Extend `RequestPanel` with artifact-type-gated brief fields (D-04); insert planner-HITL + carousel steps into `workflow.ts`. See **Pattern 2/4**. |
| CAMP-02 | Campaign Planner produces brief summary + audience + message hierarchy + 3 directions + recommendation | New `CampaignPlanSchema` (Zod 4, Anthropic-safe) in `plannerAgent.ts`; route via `callModel`. See **Pattern 3** + **Code Examples**. |
| CAMP-03 | User selects a direction (HITL); system generates per-frame headline/body/CTA + caption via ToV | Suspend/resume via Mastra `createStep({ resumeSchema, suspendSchema })` + AG-UI event; per-frame `voiceAdapter` calls. See **Pattern 4**. |
| CAMP-04 | Carousel frames as IR-backed artifacts grouped on canvas | Reuse `variantGroupId` grouping + add `orderIndex`; each frame is a full run through the existing pipeline. See **Pattern 5**. |
| CAMP-05 | Campaign frames resolve dimensions/type-scale/safe-areas from Jio foundations before generation | Same resolver extension as FND-02; resolved dims feed the IR/compile/preview profile. |
| EXP-01 | Export artifact as code (React + Jio CSS) | Read persisted `compiledBundle.code` (no re-gen) + resolved Jio CSS. See **Pattern 6**. |
| EXP-02 | Export social/campaign artifacts as PNG/JPG | Re-render via Playwright at foundation-resolved native size. See **Pattern 6**. |
| EXP-03 | Export campaign assets as PDF | Compose per-frame full-res rasters with **pdf-lib** (one frame/page, carousel order). See **Don't Hand-Roll** + **Code Examples**. |
</phase_requirements>

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Non-web foundation coverage (FND-02 / CAMP-05)**
- **D-01:** Resolve non-web dimensions from the brand's OneUI Platforms foundation (`PlatformsFoundationConfig` — `PlatformEntry` / `PlatformBreakpoint` with `viewportWidth`/`viewportHeight`/`units`, including `print` and `physical` categories). Reuse the same per-brand Convex foundation path Phase 02.1 wired for web (`makeConvexFoundationsLoader` → resolve). NOT an external spec table, NOT a new foundation concept, NOT the legacy `(builder)/create/lib/social-platforms.ts` `ASSET_DIMENSIONS` constant.
- **D-02:** Honest gap on missing coverage. When the brand's Platforms foundation has no entry matching the requested non-web canvas, emit the typed FND-03 gap report. The fix for a missing one is adding it to the foundation, never hardcoding it in the Lab. `outputProfileTable` `null`-dimension placeholders (`coverage: 'assumed'`) get filled at run time by resolving against the foundation; `'assumed'` flips to real per-brand only where the foundation defines the canvas.
- **D-03:** Type scale for a non-web canvas = DIN-1450 base recomputed for that canvas's viewing distance (the Platforms foundation carries `viewingDistance`/`ppi`/`pixelDensity` per entry) × the brand's relational f-scale. Safe-area insets = Jio f-step spacing tokens (`Spacing-N`), never raw px. A platform-mandated margin with no corresponding token is a gap, not a magic number.

**Campaign brief input + Planner HITL (CAMP-01 / CAMP-02 / CAMP-03)**
- **D-04:** Extend the existing prompt card — no new input card kind. When artifact-type is `social-post` / `instagram-carousel`, progressively reveal brief fields (audience, objective/goal, channel), mirroring the legacy create feature's audience/tone/objectives/brief shape. One input model; stays inside the frozen object model.
- **D-05:** HITL via a campaign-plan card. The planner step suspends the Mastra workflow (reuse Phase-3 suspend/resume + AG-UI event stream) and emits a campaign-plan card showing brief summary + audience + message hierarchy + the 3 creative directions + the recommended one. The user selects a direction → POST the choice → resume the suspended workflow. Frame generation happens only after selection.
  - *Planner note:* whether the campaign-plan card reuses the existing `evaluation-report` / generic card slot or adds a card kind is an implementation detail to reconcile against the (otherwise frozen) 13-member object model — keep additions minimal and additive.
- **D-06:** Each creative direction is a DS-grounded concept bundle: name + one-line concept + copy angle (tone emphasis fed to the ToV agent) + a Jio-grounded visual emphasis (which appearance role leads, which surface mood, a layout/composition motif the Design agent can honour). No invented colors/fonts/visual systems — only role/surface/motif selections that map to existing foundations + the existing Design agent.

**Carousel frames on canvas (CAMP-04 / CAMP-05)**
- **D-07:** Ordered carousel group. Reuse the Phase-3 tldraw-frame grouping + `variantGroupId` Convex pattern (D-12/D-14), but frames carry an explicit order index (Frame 1→2→3) and render left-to-right in sequence. Add the order field rather than reusing variant grouping unordered.
- **D-08:** Frame count: planner proposes, user adjusts. The Campaign Planner recommends a count from the brief/message hierarchy (e.g. hook → features → proof → CTA), shown on the plan card; the user can override before generation. Default cap (~10) to stay within the canvas perf budget.
- **D-09:** Full quality loop per frame. Every frame independently runs generate → compile → validate → evaluate → bounded-repair so each frame is provably DS-compliant on its own. Default best-of-N = 1 for carousel frames; the Phase-3 hard repair cap (N=3) + per-run token/time budget still apply across the whole carousel (shared budget). Per-frame headline/body/CTA + caption copy via the existing ToV agent (CAMP-03).

**Export pipeline (EXP-01 / EXP-02 / EXP-03)**
- **D-10:** PNG/JPG = re-render at export resolution. Re-render the artifact's compiled bundle at the profile's full foundation-resolved dimensions (e.g. 1080×1080) via the existing Playwright capture path (`playwrightRenderer.ts` / Daytona in-box capture from Phase 3) at native size + device-scale. Do NOT reuse the lower-res evaluation/preview screenshot for delivery.
- **D-11:** PDF = multi-page from ordered frame rasters. Compose the PDF server-side from the per-frame full-res rasters, one carousel/slide frame per page, in carousel order. A single carousel → one ordered multi-page PDF. (Library choice — pdf-lib / pdfkit / Playwright `page.pdf` — left to research; input is the same re-rendered rasters as D-10.)
- **D-12:** Code export (EXP-01) = the compiler's TSX source for that artifact version (no re-generation) bundled with the resolved Jio CSS.
- **D-13:** Trigger + delivery: export is a card action menu (`⋮ → Export ▸ Code / PNG / JPG / PDF`). The result lands as the existing `export` card kind (already in the 13-member object model) plus a downloadable file. Runs server-side in the (currently empty) `experience-builder-export` package; artifacts persisted to Convex storage (mirrors how `campaignAssets.capturedImageStorageId` works today). Append-only persistence consistent with prior phases.

### Claude's / Researcher's Discretion
- Exact `outputProfile` → `PlatformEntry`/`PlatformBreakpoint` matching strategy (by aspect/category vs an explicit Lab mapping table). **→ See Open Question #1; researched recommendation: explicit Lab mapping table.**
- PDF library selection and the precise raster→PDF composition path. **→ Recommendation: pdf-lib. See Don't Hand-Roll + Code Examples.**
- Whether the campaign-plan card is a minimal additive card kind or reuses an existing generic card slot. **→ See Open Question #2.**
- Planner's default frame-count heuristic and the exact perf cap. **→ See Open Question #3.**
- The structured-output schema for the planner agent — must respect the Zod 4 ↔ Anthropic gotchas. **→ See Pattern 3 + Code Examples (Anthropic-safe schema).**

### Deferred Ideas (OUT OF SCOPE)
- EXP-04 handoff bundle (HTML/PPTX/Figma/git handoff) — Phase 5.
- Direct social publishing/scheduling (SCHED-01) — v2.
- Image-reference input (INPUT-07) and image-slot/product-shot population — v2 (the planner produces copy + composition, not product imagery generation).
- Seeding standard social/print canvas presets into the Platforms foundation so CAMP-01 works out-of-the-box for every brand — considered and NOT chosen for mvp (D-02 keeps the honest gap); revisit as a foundation-data task.
- Per-frame best-of-N variants for carousels (default N=1 in D-09) — a future quality lever.
- Cross-frame visual-consistency evaluation of a carousel as a set — considered; per-frame loop chosen (D-09).
</user_constraints>

## Project Constraints (from CLAUDE.md / PROJECT.md)

These have the same authority as locked decisions; research recommends nothing that contradicts them.

- **Jio DS only** — Lab UI and all generated artifacts use Jio components + Jio CSS. No Tailwind/utility CSS/external visual kits. Generated IR → compiler → React + approved `@oneui/ui` imports only.
- **Mastra owns orchestration; Vercel AI SDK is the model layer only.** All sequencing/branching/HITL lives in `workflow.ts`. The only file touching `ai`/`@ai-sdk/*` is `modelAdapter.ts`. Every new model call (campaign planner, per-frame ToV) MUST route through `callModel`. New agent/step modules import NO `ai`/`@ai-sdk`.
- **IR is canonical; never raw JSX as source of truth.** Carousel frames are IR artifacts. Repair patches the IR (`applyPatch`), never JSX.
- **Hard isolation from the legacy `(builder)` Create / `ExperienceCanvas` feature.** Do NOT modify or import from `(builder)/create/*`, `campaigns`/`campaignAssets`/`createProjects` Convex tables, or `social-platforms.ts`. The Lab builds its own path on `experience*` tables. The legacy `ASSET_DIMENSIONS` constant and `campaignAssets.capturedImageStorageId` pattern are **reference-only**.
- **Never invent a dimension** (FOUNDATION-COVERAGE.md / FND-03 / Pitfall 6). A missing foundation value → typed gap, never a fabricated number (e.g. never hardcode `1080×1080`).
- **Token-only styling**, WCAG AA, Surface context for any tinted/dark backgrounds (for the Lab UI you build — plan cards, export menus). Sandboxed previews stay isolated (separate origin / CSP, no auth/session/Convex access).
- **Zod 4 ↔ Anthropic structured-output gotchas** (learned 02.1, enforced in `plannerAgent.ts`/`irGenerator.ts`/`repair.ts`): no integer `min/max`; no `propertyNames`/keyed `z.record`; use `z.object({}).catchall(z.unknown())`. `.int()` AND `.min()` both inject the forbidden bounds in Zod 4 — re-assert invariants in `.describe()` + at runtime instead.

## Standard Stack

All core dependencies are **already installed and pinned** in the monorepo. The only net-new dependency is the PDF library.

### Core
| Library | Version (verified installed) | Purpose | Why Standard |
|---------|------------------------------|---------|--------------|
| `@mastra/core` | 1.37.1 | Workflow orchestration, `createStep`/`createWorkflow`, suspend/resume | Already the orchestration brain (ORCH-04) `[VERIFIED: node require]` |
| `@mastra/ai-sdk` | 1.4.3 | Mastra→AI-SDK v6 stream transport (`toAISdkStream`) | Already the only transport bridge `[VERIFIED: node require]` |
| `ai` | 6.0.111 | Model layer (`generateText` + `Output.object`) | Pinned; structured output via `experimental_output` `[VERIFIED: node require]` |
| `@ai-sdk/anthropic` | 3.0.54 | Anthropic provider for `callModel` | Pinned `[VERIFIED: node require]` |
| `zod` | 4.3.6 | All schemas (planner output, export contracts) | Zod 4; Anthropic-gotcha rules apply `[VERIFIED: node require]` |
| `playwright` | 1.59.1 | Full-res raster re-render (EXP-02 / D-10) | Already used in `playwrightRenderer.ts` `[VERIFIED: node require]` |
| `convex` | (workspace) | Append-only `experience*` tables + `_storage` for raster/PDF bytes | Established persistence path `[CITED: schema.ts]` |

### Supporting (net-new)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `pdf-lib` | `^1.17.1` (latest stable) | Multi-page raster→PDF composition (EXP-03 / D-11) | The new dependency for `experience-builder-export` — see audit below `[ASSUMED]` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `pdf-lib` | `pdfkit` | pdfkit is stream-based and excellent for from-scratch text/vector PDFs, but its API is imperative-stream and heavier for "embed N full-page rasters." For raster-only page composition, pdf-lib's `embedPng`/`embedJpg` + `addPage([w,h])` + `drawImage` is fewer lines and has no native deps. `[CITED: github.com/Hopding/pdf-lib]` |
| `pdf-lib` | Playwright `page.pdf()` | `page.pdf()` only works in headless Chromium and is print-CSS-driven (paginated HTML), not "stitch fixed-size rasters." It would couple PDF output to a live page render with print media quirks (page breaks, DPI). Since D-10/D-11 already produce per-frame full-res rasters, composing them directly is more deterministic and decouples PDF from the browser. `[CITED: playwright docs]` |
| Re-rendering rasters at export time (D-10) | Reusing the eval/preview screenshot | Explicitly rejected by D-10 — eval screenshots are low-res framing captures (1280×800), not delivery resolution. |

**Installation:**
```bash
# in packages/experience-builder-export
pnpm add pdf-lib
```

**Version verification:** `pdf-lib` was NOT installed at research time (`node require` → NOT INSTALLED). The planner MUST gate its install behind a `checkpoint:human-verify` task (see audit). Verify before install:
```bash
npm view pdf-lib version          # confirm latest stable
npm view pdf-lib scripts.postinstall   # must be empty
```

## Package Legitimacy Audit

> slopcheck was not available in this research environment; per protocol the one net-new package is tagged `[ASSUMED]` and the planner must gate its install behind a `checkpoint:human-verify` task.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `pdf-lib` | npm | ~7 yrs (since 2018) | several M/wk | github.com/Hopding/pdf-lib | not run | **Flagged — planner adds `checkpoint:human-verify` before install** |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none (pdf-lib is a well-known, widely-used, pure-JS library with a real source repo; the `[ASSUMED]` tag is solely because slopcheck could not run here, not a risk signal). The planner should still verify `npm view pdf-lib` + empty postinstall as a one-line gate.

*pdf-lib has zero native dependencies (important: it runs in the same Node route as Playwright without extra build steps). `[CITED: github.com/Hopding/pdf-lib README]`*

## Architecture Patterns

### System Architecture Diagram

```
                       ┌─────────────────────────────────────────────┐
 Browser (canvas)      │  RequestPanel (extended, D-04)              │
   prompt card  ──────▶│  artifact-type-gated brief fields:          │
                       │  audience · objective · channel             │
                       └───────────────────┬─────────────────────────┘
                                            │ POST /api/experience-lab/run
                                            ▼
                       ┌─────────────────────────────────────────────┐
 Node route            │  run route (existing) — injects              │
 (orchestration)       │  foundationsLoader + previewExecutor         │
                       └───────────────────┬─────────────────────────┘
                                            ▼
   ┌────────────────────────── Mastra workflow (workflow.ts) ───────────────────────────┐
   │ intent → resolve → retrieve →                                                       │
   │                                                                                      │
   │   ┌── campaign branch (artifactType ∈ {social-post, instagram-carousel}) ──┐         │
   │   │  resolveFoundation(non-web)  ──miss──▶  FND-03 gap (no artifact)        │         │
   │   │         │ hit (dims/type-scale/safe-area from PlatformEntry)            │         │
   │   │         ▼                                                               │         │
   │   │  campaign-planner step  ──▶  CampaignPlanSchema (brief/audience/        │         │
   │   │         │                     hierarchy/3 directions/recommend/count)   │         │
   │   │         ▼  SUSPEND (AG-UI event → campaign-plan card)                    │         │
   │   │  ╳╳╳ HITL: user picks direction + adjusts frame count ╳╳╳               │         │
   │   │         ▼  RESUME (POST selection)                                       │         │
   │   │  for each frame i in 1..N (ordered):                                     │         │
   │   │     ToV(frame copy) → generate-ir → compile → validate                   │         │
   │   │       → preview → evaluate → bounded-repair (cap N=3, SHARED budget)     │         │
   │   │       → frame artifact { variantGroupId, orderIndex: i }                 │         │
   │   └──────────────────────────────────────────────────────────────────────┘         │
   │                                                                                      │
   │   (web branch unchanged: plan → design → copy → generate → … → version-freeze)       │
   └──────────────────────────────────────────────────────────────────────────────────┘
                                            │
                  ordered frame artifacts persisted (Convex experience* tables)
                                            ▼
                       ┌─────────────────────────────────────────────┐
 Export (card ⋮ menu)  │  experience-builder-export (NEW)             │
                       │   code  → read persisted compiledBundle.code │
                       │   PNG/JPG → Playwright re-render @ native size│
                       │   PDF  → pdf-lib: embed N rasters, 1/page,   │
                       │          carousel order                      │
                       └───────────────────┬─────────────────────────┘
                                            ▼  bytes → Convex _storage
                              export card + downloadable file
```

### Recommended Project Structure
```
packages/experience-builder-core/src/
├── profiles/
│   ├── outputProfileTable.ts          # existing — flip 'assumed' handling per-brand at runtime
│   └── profilePlatformMap.ts          # NEW — outputProfile → { platformId, breakpointId } Lab map
├── contracts/
│   ├── foundationResolve.ts           # existing — EXTEND success arm with resolvedDimensions
│   └── campaignPlan.ts                # NEW — CampaignPlan Zod schema (Anthropic-safe)

packages/experience-builder-agents/src/
├── foundationResolver.ts              # EXTEND — non-web branch via profilePlatformMap + dimension helpers
├── agents/
│   └── plannerAgent.ts                # EXTEND — add runCampaignPlanner + CampaignPlanSchema
├── steps/
│   └── carousel.ts                    # NEW — per-frame loop driver (reuses evaluate/repair)
└── workflow.ts                        # EXTEND — campaign branch + campaign-plan suspend/resume

packages/experience-builder-export/src/    # was empty stub
├── index.ts
├── code.ts                            # EXP-01: bundle compiledBundle.code + resolved Jio CSS
├── raster.ts                          # EXP-02: Playwright re-render @ native size
└── pdf.ts                             # EXP-03: pdf-lib multi-page composition

apps/platform/src/app/api/experience-lab/
├── run/route.ts                       # EXTEND — campaign brief fields + campaign-plan resume
└── export/route.ts                    # NEW — server-side export trigger → _storage
```

### Pattern 1: Non-web foundation resolution (the spine — D-01/D-02/D-03)

**What:** Extend `resolveFoundation` so non-web profiles resolve dimensions/type-scale/safe-areas from the brand's `PlatformsFoundationConfig` instead of hard-gating to a gap.

**When to use:** Every campaign/social/slide/outdoor run.

**Key facts (verified in source):**
- `getDimensionValueFromConfig(config, platformId, breakpointId, density, step)` in `packages/shared/src/data/dimension-scales.ts` **already** computes f-step values for non-web platforms (`print`/`physical`/`digital-fixed`) from a `PlatformsFoundationConfig`. It applies per-breakpoint DIN-1450 overrides via `resolveBreakpointBaseSize`. This is the type-scale engine D-03 needs — do NOT reinvent. `[VERIFIED: dimension-scales.ts:493-538]`
- `PlatformBreakpoint` carries `viewportWidth`/`viewportHeight`/`units` (`'px'|'mm'`) — the dimension source D-01 mandates. `mmToPx` (in the same file) converts mm canvases to CSS px at a given ppi. `[VERIFIED: platforms.ts:48-63, dimension-scales.ts:559-561]`
- The default Platforms foundation seed (`platform-config.ts`) defines `print` (A4/A5/Business Card in mm) and `outdoor`/`physical` (Billboard `1920×1080px`, Bus Stop, Indoor Signage). It does **NOT** define Instagram/slide canvases. `[VERIFIED: platform-config.ts:362-414]`
- Therefore: outdoor/print profiles can resolve to real foundation dims for a default brand; `ig-*`/`slide-*` profiles resolve to a **gap** unless the brand added those canvases (this is D-02 working as designed).
- Safe-area insets (D-03) = pick a Jio f-step `Spacing-N` token (multipliers in `DIMENSION_TOKEN_MULTIPLIERS`, `dimension-scales.ts:74-101`) resolved at the canvas's base size — never a raw px margin. If a platform mandates a margin with no matching token, that's a gap.

**The matching strategy (Discretion → recommendation): explicit Lab mapping table.** A by-aspect/category heuristic is fragile (multiple canvases share `1:1`; aspect alone can't pick A4 vs a square IG post). An explicit `outputProfile → { platformId, breakpointId }` const mirrors the existing `outputProfileTable.ts` pattern, is type-checked, and makes the "covered vs gap" decision a clean lookup. The map's targets (`platformId`/`breakpointId`) are matched against the brand's actual `config.platforms[*].breakpoints[*].id`; if the brand doesn't have that breakpoint → FND-03 gap.

### Pattern 2: Extend the prompt card with brief fields (D-04)

**What:** Artifact-type-gated progressive disclosure in `RequestPanel.tsx` — when `artifactType ∈ {social-post, instagram-carousel}`, reveal `audience` / `objective` / `channel` fields. The run-route body schema (`RunRequestBody` in `run/route.ts`) and `RunExperienceInput` (`runTypes.ts`) gain optional brief fields. No new card kind. `[CITED: run/route.ts:283-308, runTypes.ts:45-88]`

**Anti-pattern:** Adding a separate "campaign-brief" card kind — violates the frozen 13-member object model (D-04). The fields ride the existing prompt card.

### Pattern 3: Campaign Planner structured output (CAMP-02 / D-06)

**What:** A new `runCampaignPlanner` (alongside `runPlanner`) returning a `CampaignPlanSchema` via `callModel`. The schema MUST follow the established Anthropic-safe rules already proven in `plannerAgent.ts` and `irGenerator.ts`.

**Anthropic + Zod-4 schema rules (load-bearing, verified in three existing files):**
- No `.int()` and no `.min()`/`.max()` on numbers — both inject `minimum`/`maximum`, which Anthropic structured output rejects (`400 invalid_request_error`). State "whole number ≥ 1" in `.describe()`; clamp at runtime (`Math.max(1, Math.round(x))`). `[VERIFIED: plannerAgent.ts:65-67, 157]`
- No keyed `z.record(z.string(), …)` — emits `propertyNames`, rejected. Use `z.object({}).catchall(z.unknown())` for arbitrary bags. `[VERIFIED: irGenerator.ts:116-122]`
- `z.array(...).min(1)` on arrays appears to be used safely in existing schemas (`PlanSchema.sections.min(1)`) — array length constraints are accepted; the prohibition is specifically on integer/number `minimum`/`maximum`. The 3-directions requirement can use `.length(3)` cautiously, but **safer to describe "exactly 3" in prose + validate at runtime** to avoid any array-bound grammar surprise. `[VERIFIED: plannerAgent.ts:45]` / `[ASSUMED]` for `.length(3)` safety — see Assumptions A1.
- Anthropic best practice for complex nested schemas (current docs): flatten where possible, make fields required not optional (each optional field ~doubles grammar state space), write rich `.describe()` text (the single biggest reliability lever), keep nesting shallow. The 3-direction bundle is nested but shallow (1 level) — fine. `[CITED: platform.claude.com/docs/.../structured-outputs]`

**D-06 grounding:** Each direction's `visualEmphasis` must be a **closed enum of existing foundation values**, not free text — `leadRole: z.enum(['primary','secondary','neutral','sparkle','positive','negative','warning','informative','brand-bg'])` (the 9 appearance roles from CLAUDE.md), `surfaceMood: z.enum(['bold','subtle','default','minimal','moderate','elevated','ghost'])` (the 7 surface tokens), and a `layoutMotif` constrained to motifs the Design adapter honours. This prevents the planner inventing a visual system.

### Pattern 4: Campaign-plan HITL via Mastra suspend/resume (D-05)

**What:** Reuse the exact suspend/resume machinery already in `workflow.ts` (`repairCheckpoint` uses `createStep({ resumeSchema, suspendSchema, execute: async ({ resumeData, suspend }) => ... })`). A new `campaignPlanCheckpoint` step suspends after the planner runs, surfaces the plan via an AG-UI event, and resumes on the user's direction+frame-count selection. `[VERIFIED: workflow.ts:601-690]`

**Key mechanics (verified):**
- Suspend: `return suspend({ runId, reason })`; set `ctx.suspended/outcome='suspended'/suspendPayload`. `[VERIFIED: workflow.ts:648-657]`
- Resume: when `resumeData` is present, branch in the workflow (ORCH-04) — never in a model callback. The deterministic runner mirror is `makeResume(ctx)` returning a `SuspendedRun` handle. `[VERIFIED: workflow.ts:642-645, 940-974]`
- The run route serialises events as NDJSON and the `RunResultFrame` carries `suspendPayload` for `outcome:'suspended'` runs (currently mapped to wire `'gap'`). The campaign-plan card needs the plan in this payload. `[VERIFIED: run/route.ts:384-417, runTypes.ts:132-138]`
- **Resume endpoint gap:** there is NO existing `/api/experience-lab/resume` route — the current HITL is only the non-converging-repair checkpoint, surfaced but resumed in-process. Phase 4 must add a resume route (or extend the run route) that re-enters the suspended workflow with the user's selection. `[VERIFIED: no resume route in api/experience-lab]` This is a genuine net-new seam, flagged in Open Question #2.

**ORCH-03 event-union extension:** The `ExperienceBuilderEvent` discriminated union (`events.ts`) has 6 variants and NO campaign-plan event. To stream the plan to the canvas you either (a) add a `campaign-plan` event variant (additive to the union — low risk, mirrors how the union is "frozen but additive"), or (b) ride the existing `suspendPayload` on the result frame. Recommendation: carry the plan on `suspendPayload` (no union change) and add one additive event only if live streaming of the plan is required mid-run. `[VERIFIED: events.ts:87-94]`

### Pattern 5: Ordered carousel frames (D-07/D-09)

**What:** Each frame is a full run through the existing pipeline; frames share a `variantGroupId` and add an `orderIndex`. Reuse `runVariants`' grouping idea (`nextVariantGroupId`, shared `brandFoundations`) but ordered and with best-of-N=1 per frame. `[VERIFIED: workflow.ts:980-1037]`

**Schema impact (append-only, no migration):** `experienceArtifacts` already has `variantGroupId`. Add an optional `orderIndex: v.optional(v.number())` to `experienceArtifacts` (or `experienceArtifactVersions`) — additive `v.optional` so existing rows round-trip, exactly like `variantGroupId` was added. `[CITED: schema.ts:2007-2027]`

**Shared budget (D-09):** the repair cap (`MAX_REPAIR_ATTEMPTS = 3`, `attempt >= 3` in `shouldStopRepairLoop`) is currently per-run. For a carousel the cap + token/time budget must be **shared across all frames**. This means a carousel-level budget accumulator on the carousel driver, decremented per frame's repair attempts — a net-new bounded-loop wrapper around the existing per-frame loop. `[VERIFIED: workflow.ts:577-590, 747-769]`

### Pattern 6: Export pipeline (EXP-01/02/03)

**What:** Build out the empty `experience-builder-export` package with three emitters.
- **Code (EXP-01/D-12):** read the persisted `experienceArtifactVersions.compiledBundle.code` (the compiler's TSX, already stored — `run/route.ts:182`) + the resolved Jio CSS. No re-generation. `[VERIFIED: schema.ts:2050-2055, run/route.ts:182]`
- **PNG/JPG (EXP-02/D-10):** re-render the compiled bundle via the existing Playwright `captureCodeScreenshots`/`captureASTScreenshots` path at native foundation-resolved size. Set viewport to the resolved `{width,height}` and `deviceScaleFactor` from the foundation's `pixelDensity` (NOT the hardcoded `deviceScaleFactor: 2`). For JPG use `page.screenshot({ type: 'jpeg', quality })`. `[VERIFIED: playwrightRenderer.ts:156-211]`
- **PDF (EXP-03/D-11):** pdf-lib — for each frame raster in `orderIndex` order: `embedPng` (or `embedJpg`), `addPage([w,h])`, `drawImage` full-bleed; `doc.save()` → bytes. See Code Examples.
- **Persistence (D-13):** upload bytes to Convex `_storage` via the existing `generateUploadUrl` → POST → `{ storageId }` pattern (mirrors `uploadThumbnail` in `run/route.ts:75-92`), record on an append-only export row. Surface as the `export` card kind. `[VERIFIED: run/route.ts:75-92]`

### Anti-Patterns to Avoid
- **Hardcoding `1080×1080` for IG** — Pitfall 6 violation. If the brand's foundation lacks the canvas, gap. The legacy `ASSET_DIMENSIONS` (1080×1080 etc.) is reference-only and lives in the isolated legacy Builder.
- **A by-aspect heuristic for profile→platform matching** — multiple canvases share an aspect (1:1 IG square vs a custom square); use the explicit map.
- **Putting any branching/selection logic in a model callback** — ORCH-04. Direction selection branches in the workflow.
- **`page.pdf()` for raster stitching** — couples PDF to print-CSS pagination; compose rasters directly.
- **Reusing the eval screenshot for delivery** — D-10 forbids; re-render at native size.
- **Importing from `(builder)/create/*` or the `campaign*` Convex tables** — hard isolation.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Non-web dimension/type-scale computation | A new DIN-1450 calculator or dimension table | `getDimensionValueFromConfig` / `resolveBreakpointBaseSize` (`dimension-scales.ts`) | Already non-web-capable; reinventing risks drifting from serialized brand data (`din1450.ts` warns against this explicitly) |
| mm→px conversion for print canvases | Manual `* 96/25.4` | `mmToPx` (`dimension-scales.ts`) | Standard CSS px density, already rounded for JSON stability |
| Suspend/resume HITL state machine | A custom pause/poll mechanism | Mastra `createStep({ resumeSchema, suspendSchema })` + the `makeResume`/`SuspendedRun` pattern | Already built and tested for repair HITL |
| Variant/group clustering on canvas | A new grouping table | `variantGroupId` + `by_variant_group` index (add `orderIndex`) | Append-only, no migration |
| Raster→PDF composition | Manual PDF byte writing or print-CSS pagination | `pdf-lib` (`embedPng`/`embedJpg` + `addPage` + `drawImage`) | Zero native deps, deterministic, runs in the same Node route |
| Headless render + screenshot | A new browser harness | `playwrightRenderer.ts` capture path | Verified, handles font/brand-CSS settle + double-rAF |
| Convex blob persistence | A new storage path | `generateUploadUrl` → POST → `_storage` (mirror `uploadThumbnail`) | Established VER-01 pattern |
| The single model call | A direct `ai`/`@ai-sdk` import in a new agent | `callModel` seam | ORCH-04 boundary — the only allowed touchpoint is `modelAdapter.ts` |

**Key insight:** Phase 4's risk is NOT building new machinery — it's drifting from existing seams. Almost everything needed exists; the work is wiring the non-web branch and the export emitters onto verified contracts. The one genuinely new library is `pdf-lib`.

## Runtime State Inventory

> Not a rename/refactor phase — but it adds persisted state. The relevant inventory is the additive Convex schema surface.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `experienceArtifacts` / `experienceArtifactVersions` rows; carousel needs `orderIndex` | Additive `v.optional(v.number())` — append-only, no migration |
| Stored data (export) | Raster/PDF/code bytes | Upload to Convex `_storage`; add an append-only export row (or reuse a version field) — mirror thumbnail pattern |
| Live service config | None — no external service config embeds Phase-4 state | None — verified: campaign uses in-repo Mastra + Convex only |
| OS-registered state | None | None — verified: no OS registrations |
| Secrets/env vars | `ANTHROPIC_API_KEY` (existing, read by `@ai-sdk/anthropic`); `EXPERIENCE_LAB_PREVIEW_EXECUTOR`/`DAYTONA_API_KEY` (existing) | None new required for mvp |
| Build artifacts | `experience-builder-export` currently a stub (only `package.json`, `typecheck` script, no `src/`) | Create `src/`, add `pdf-lib` dep, add build/test scripts |

## Common Pitfalls

### Pitfall 1: Inventing IG dimensions when the foundation lacks the canvas
**What goes wrong:** Tempting to hardcode `1080×1080` so "the IG path just works."
**Why it happens:** The default Platforms seed has no IG canvas, and the legacy `ASSET_DIMENSIONS` constant sits right there with `1080×1080`.
**How to avoid:** D-02 — emit the typed FND-03 gap. The honest fix is adding the canvas to the brand's Platforms foundation, not the Lab.
**Warning signs:** Any literal pixel dimension in `foundationResolver.ts` or the profile map; `coverage` flipping to `'real'` statically (it must flip per-brand at runtime only on a real foundation hit).

### Pitfall 2: Zod-4 number/integer bounds re-breaking Anthropic structured output
**What goes wrong:** Adding `.int().min(3).max(3)` to the directions array or `frameCount`, producing a `400 invalid_request_error`.
**Why it happens:** Zod 4 injects `minimum`/`maximum` for both `.int()` and `.min()`; Anthropic rejects them on integer types.
**How to avoid:** Plain `z.number()`; describe the constraint; clamp/validate at runtime — exactly as `plannerAgent.ts:65-67,157` already does.
**Warning signs:** New `.int()`/`.min()`/`.max()`/keyed `z.record` in any `callModel` schema.

### Pitfall 3: Per-run repair budget not shared across carousel frames
**What goes wrong:** Each of 10 frames gets its own N=3 repair budget → 30 repair attempts → cost/time blowout.
**Why it happens:** `shouldStopRepairLoop`/`MAX_REPAIR_ATTEMPTS` are per-run by construction.
**How to avoid:** D-09 — a carousel-level budget accumulator the per-frame loops decrement.
**Warning signs:** No carousel-level attempt/token counter; frame loops calling `driveRepairLoop` with independent caps.

### Pitfall 4: Resume route doesn't exist
**What goes wrong:** Planner suspends; there's no endpoint to resume with the user's direction selection.
**Why it happens:** Today's only HITL (non-converging-repair) is surfaced but resumed in-process; the route streams the suspend payload but never accepts a resume POST.
**How to avoid:** Add `/api/experience-lab/resume` (or a resume branch on the run route) that re-enters the suspended workflow. Note: the deterministic in-memory `SuspendedRun` handle (`makeResume`) does not survive across HTTP requests — Phase 4 needs the run state to be re-hydratable (re-run planner deterministically from cached inputs, then apply the selection), since durable Mastra storage (PROD-03) is explicitly Phase-5.
**Warning signs:** Assuming the in-memory `SuspendedRun.resume` closure can be called from a second HTTP request.

### Pitfall 5: Playwright export at wrong resolution / device scale
**What goes wrong:** Export PNG comes out at 1280×800 (eval default) or at `deviceScaleFactor: 2` regardless of canvas.
**Why it happens:** `captureCodeScreenshots` defaults to `DEFAULT_VIEWPORTS.mobile` and hardcodes `deviceScaleFactor: 2`.
**How to avoid:** D-10 — pass the foundation-resolved `{width,height}` viewport and derive `deviceScaleFactor` from the platform's `pixelDensity`. A 1080×1080 IG post at @1x is 1080 device px; at @2x it's 2160 — match the foundation, don't guess.
**Warning signs:** Export viewport equals an eval viewport; `deviceScaleFactor` literal.

### Pitfall 6: mm-canvas print profiles silently mis-sizing rasters
**What goes wrong:** A4 (`210×297mm`) rendered as 210×297 px.
**Why it happens:** `viewportWidth` is in `units: 'mm'` for print breakpoints; raster export needs px.
**How to avoid:** Convert with `mmToPx` at the canvas's ppi (A4 print is ppi:300) before setting the Playwright viewport.
**Warning signs:** Raster export reads `viewportWidth` without checking `units`.

## Code Examples

### Lab profile → platform/breakpoint map (NEW, `profilePlatformMap.ts`)
```ts
// Source: pattern mirrors outputProfileTable.ts (verified) — typed const lookup.
import type { OutputProfile } from './outputProfileTable';

/** Targets are matched against the brand's PlatformsFoundationConfig
 *  platforms[*].id + breakpoints[*].id. A profile absent here, or whose
 *  target breakpoint the brand's foundation lacks, resolves to an FND-03 gap. */
export const PROFILE_PLATFORM_MAP: Partial<
  Record<OutputProfile, { platformId: string; breakpointId: string }>
> = {
  // outdoor IS in the default seed (platform-config.ts:386-414) → resolvable today
  'billboard-landscape': { platformId: 'outdoor', breakpointId: 'outdoor-billboard-large' },
  // ig-* / slide-* are NOT in the default seed → gap until a brand adds the canvas (D-02)
  // 'ig-square': { platformId: 'social', breakpointId: 'ig-square' },  // only when seeded per-brand
};
```

### Extended foundation-resolve success arm (`foundationResolve.ts`)
```ts
// Source: extends the existing discriminated union (verified foundationResolve.ts).
export type FoundationResolveResult =
  | { ok: true; theme: ThemeConfig;
      // NEW (D-03): foundation-resolved canvas dims + safe-area, present for non-web.
      resolvedDimensions?: { width: number; height: number; units: 'px' | 'mm';
                             pixelDensity: number;
                             safeAreaInsetToken?: string /* e.g. 'Spacing-4' */ } }
  | { ok: false; gap: FoundationGapT };
```

### Anthropic-safe CampaignPlan schema (`campaignPlan.ts`)
```ts
// Source: rules verified in plannerAgent.ts + irGenerator.ts. No .int()/.min()/.max()
// on numbers; no keyed z.record; rich .describe(); closed enums for DS grounding.
import { z } from 'zod';

const APPEARANCE_ROLES = ['primary','secondary','neutral','sparkle','positive',
  'negative','warning','informative','brand-bg'] as const;
const SURFACE_MOODS = ['default','ghost','minimal','subtle','moderate','bold','elevated'] as const;

export const CreativeDirectionSchema = z.object({
  name: z.string().min(1),
  concept: z.string().min(1).describe('One-line concept for this direction.'),
  copyAngle: z.string().min(1).describe('Tone emphasis fed to the ToV agent.'),
  leadRole: z.enum(APPEARANCE_ROLES).describe('Which Jio appearance role leads. No invented colors.'),
  surfaceMood: z.enum(SURFACE_MOODS).describe('Which Jio surface mood dominates.'),
  layoutMotif: z.string().min(1).describe('A composition motif the Design agent can honour.'),
});

export const CampaignPlanSchema = z.object({
  briefSummary: z.string().min(1),
  audience: z.string().min(1),
  // ordered most→least prominent (mirrors PlanSchema.messageHierarchy, verified safe)
  messageHierarchy: z.array(z.string().min(1)).min(1),
  // EXACTLY 3 — stated in prose + validated at runtime, NOT a fragile array bound.
  directions: z.array(CreativeDirectionSchema)
    .describe('Provide exactly three distinct creative directions.'),
  recommendedDirectionIndex: z.number()
    .describe('0-based index of the recommended direction; a whole number 0..2.'),
  // frame count: plain number; clamp 1..10 at runtime (D-08). NO .min()/.max().
  recommendedFrameCount: z.number()
    .describe('Recommended carousel frame count; a whole number, typically 3..6, max 10.'),
});
export type CampaignPlanT = z.infer<typeof CampaignPlanSchema>;
// runtime guards: directions.length must be 3; recommendedFrameCount = clamp(round, 1, 10);
// recommendedDirectionIndex = clamp(round, 0, directions.length - 1).
```

### PDF multi-page composition from ordered rasters (`pdf.ts`)
```ts
// Source: pdf-lib README API (github.com/Hopding/pdf-lib). Zero native deps.
import { PDFDocument } from 'pdf-lib';

/** frames: full-res PNG buffers already ordered by carousel orderIndex (D-11). */
export async function composeCarouselPdf(
  frames: Array<{ png: Buffer; width: number; height: number }>,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const f of frames) {
    const img = await doc.embedPng(f.png);            // or embedJpg for JPEG
    const page = doc.addPage([f.width, f.height]);    // one frame per page
    page.drawImage(img, { x: 0, y: 0, width: f.width, height: f.height });
  }
  return doc.save();                                  // → bytes for Convex _storage
}
```

### Native-size raster re-render (EXP-02 / D-10)
```ts
// Source: extends captureCodeScreenshots (verified playwrightRenderer.ts:156-211).
// Pass foundation-resolved viewport + pixelDensity-derived deviceScaleFactor.
const captures = await captureCodeScreenshots({
  code: compiledBundle.code,
  viewports: [{ width: resolved.width, height: resolved.height, label: outputProfile }],
  // NOTE: deviceScaleFactor is currently hardcoded to 2 in capturePath — Phase 4
  // must parameterize it to resolved.pixelDensity (Pitfall 5).
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Anthropic JSON via prompt-only "respond in JSON" | Constrained-decoding structured outputs (grammar-compiled schema) | 2025 | Schema is enforced; but over-complex/over-optional schemas hit "Schema too complex" 400s — keep shallow, required, well-described `[CITED: platform.claude.com structured-outputs]` |
| `page.pdf()` for any PDF | Direct raster→PDF via pdf-lib for image composition | stable | Decouples PDF from browser print-CSS; deterministic `[CITED: pdf-lib README]` |
| AI SDK v5 stream protocol | AI SDK **v6** (`ai@6.0.111`); transport pinned `version:'v6'` | this repo | `toV6WorkflowStream` is the only bridge; `experimental_output` is the verified structured accessor `[VERIFIED: modelAdapter.ts]` |

**Deprecated/outdated:**
- The legacy `(builder)/create` campaign feature (`campaigns`/`campaignAssets` tables, `social-platforms.ts`, HTML/CSS string assets) — **reference-only**, hard-isolated; do not extend.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `z.array(...).length(3)` is Anthropic-safe (only number `minimum`/`maximum` are rejected, not array bounds) | Pattern 3 | LOW — recommendation already falls back to prose + runtime validation, which is provably safe (the existing `PlanSchema` uses `.min(1)` on arrays without issue) |
| A2 | `pdf-lib` is the right choice and installs cleanly with no native deps in the export package | Standard Stack | LOW — well-known pure-JS lib; planner gates install behind human-verify; pdfkit is the documented fallback |
| A3 | Adding `orderIndex` as `v.optional(v.number())` requires no Convex migration | Pattern 5 | LOW — mirrors exactly how `variantGroupId`/`compiledBundle`/eval fields were added append-only (verified in schema.ts) |
| A4 | The campaign-plan can ride `suspendPayload` without adding a new `ExperienceBuilderEvent` variant | Pattern 4 | MEDIUM — if live mid-run plan streaming is required, one additive event variant is needed; resolved by Open Question #2 |
| A5 | A resume route can re-hydrate suspended run state by deterministically re-running the planner from cached/memoized inputs (no durable Mastra storage in mvp) | Pitfall 4 | MEDIUM — relies on planner determinism via `cache.ts` memoization; if model nondeterminism breaks this, mvp may need to persist the plan payload to Convex before suspend |

## Open Questions

1. **`outputProfile → PlatformEntry/Breakpoint` matching — explicit map vs aspect heuristic?**
   - What we know: an explicit typed map (Pattern 1) is the recommended, type-safe approach mirroring `outputProfileTable.ts`. The default seed covers `outdoor`/`print` but not IG/slide.
   - What's unclear: the exact `platformId`/`breakpointId` a per-brand foundation will use for IG canvases (no convention exists yet, since none are seeded).
   - Recommendation: ship the explicit map covering `billboard-landscape`/`digital-portrait` (real today) + `slide-*` if any brand seeds them; leave IG entries commented until a brand seeds the canvas, so IG honestly gaps (D-02). Decide the IG `platformId` naming convention with the user (e.g. a `social` platform vs adding IG breakpoints under an existing platform).

2. **Campaign-plan card: new card kind, reuse `evaluation-report`, or `suspendPayload`-only?**
   - What we know: the 13-member object model is frozen-but-additive; `suspendPayload` can carry the plan without a union change.
   - What's unclear: whether product wants the plan to live as a persistent canvas card (argues for a minimal additive kind) or a transient HITL prompt (argues for `suspendPayload`).
   - Recommendation: start with `suspendPayload` + the existing generic card slot for the prompt; add a minimal additive `campaign-plan` card kind only if the plan must persist as a first-class canvas object. Confirm with user.

3. **Default frame-count heuristic + perf cap.**
   - What we know: D-08 sets a ~10 cap; the working narrative is hook → feature → feature → proof → CTA (5).
   - What's unclear: exact default and per-frame canvas-perf ceiling.
   - Recommendation: default 5 (the narrative example), hard cap 10, clamped at runtime; planner proposes within that range. Confirm cap against the tldraw canvas perf budget.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node runtime | All agents/export (server-side) | ✓ | — | none needed |
| `playwright` + chromium | EXP-02 raster re-render | ✓ (pkg) | 1.59.1 | Daytona in-box capture (PREV path) |
| `pdf-lib` | EXP-03 PDF | ✗ | — | `pdfkit` (heavier) |
| Convex `_storage` | Export persistence | ✓ | workspace | none needed |
| `ANTHROPIC_API_KEY` | Planner + ToV model calls | env-gated | — | test mock (`__setCallModelImpl`) for tests |

**Missing dependencies with no fallback:** none (blocking-free for mvp).
**Missing dependencies with fallback:** `pdf-lib` (fallback `pdfkit`). Install gated behind human-verify per audit.

## Validation Architecture

> nyquist_validation is enabled (`config.json: nyquist_validation: true`).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 (workspace; `turbo test`) `[VERIFIED: package.json]` |
| Config file | per-package (e.g. `vitest.config.*`); root `test` → `turbo test` |
| Quick run command | `pnpm --filter @oneui/experience-builder-agents test` |
| Full suite command | `pnpm test` (turbo, all packages) |

The Lab packages already have dense, credential-free unit tests (`workflow.test.ts`, `plannerAgent.test.ts`, `foundationResolver.test.ts`, `evaluate.test.ts`, `repair.test.ts`, `compiler.test.ts`). The `__setCallModelImpl` test seam (modelAdapter.ts) lets every model-touching test run deterministically with NO API key — Phase 4 tests reuse it.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FND-02 | Non-web profile with foundation hit → resolved dims; miss → FND-03 gap (no dims) | unit | `pnpm --filter @oneui/experience-builder-agents test foundationResolver` | ❌ Wave 0 (extend existing) |
| FND-02 | `getDimensionValueFromConfig` non-web branch produces foundation dims | unit | `pnpm --filter @oneui/shared test dimension-scales` | ✅ (extend) |
| CAMP-01 | `social-post`/`instagram-carousel` run takes the campaign branch | unit | `pnpm --filter @oneui/experience-builder-agents test workflow` | ✅ (extend) |
| CAMP-02 | `runCampaignPlanner` returns schema-valid plan (3 directions, DS-grounded enums) via mocked `callModel` | unit | `pnpm --filter @oneui/experience-builder-agents test plannerAgent` | ✅ (extend) |
| CAMP-02 | `CampaignPlanSchema` produces Anthropic-safe JSON-schema (no integer min/max, no propertyNames) | unit | new schema test (assert compiled JSON schema) | ❌ Wave 0 |
| CAMP-03 | Suspend on plan; resume with direction → per-frame ToV copy generated | unit | `pnpm --filter @oneui/experience-builder-agents test workflow` | ✅ (extend) |
| CAMP-04 | N frames produced, shared `variantGroupId`, sequential `orderIndex` | unit | new `carousel.test.ts` | ❌ Wave 0 |
| CAMP-04 | Each frame independently passes validate (DS-compliant) | unit | reuse compiler/validate tests per frame | ✅ (extend) |
| CAMP-05 | Frame dims resolved before generation; gap short-circuits with zero frames | unit | `foundationResolver` + `workflow` campaign branch | ❌ Wave 0 |
| EXP-01 | Code export = persisted `compiledBundle.code` + Jio CSS, no re-gen | unit | new `experience-builder-export` `code.test.ts` | ❌ Wave 0 |
| EXP-02 | Raster re-render uses foundation `{w,h}` + `pixelDensity` deviceScaleFactor | unit (mock capture) | new `raster.test.ts` | ❌ Wave 0 |
| EXP-03 | `composeCarouselPdf` emits one page/frame in order, page size = frame dims | unit | new `pdf.test.ts` (assert page count + sizes) | ❌ Wave 0 |
| EXP-03 | mm canvas converted via `mmToPx` before raster | unit | `pdf`/`raster` test | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm --filter <touched-package> test`
- **Per wave merge:** `pnpm test` (full turbo suite)
- **Phase gate:** full suite green + `pnpm typecheck` + `pnpm check:literals` (Lab UI you add) before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `packages/experience-builder-core/src/contracts/campaignPlan.test.ts` — Anthropic-safe schema shape (covers CAMP-02)
- [ ] `packages/experience-builder-core/src/profiles/profilePlatformMap.test.ts` — map → covered/gap (FND-02)
- [ ] `packages/experience-builder-agents/src/steps/carousel.test.ts` — ordered frames, shared budget (CAMP-04)
- [ ] `packages/experience-builder-export/src/{code,raster,pdf}.test.ts` — three emitters (EXP-01/02/03)
- [ ] `packages/experience-builder-export/vitest.config.ts` + add `test` script (package currently has only `typecheck`)
- [ ] Extend `foundationResolver.test.ts` / `workflow.test.ts` for the non-web + campaign branches
- [ ] Reuse `__setCallModelImpl` (modelAdapter.ts) for all planner/ToV mocks — no new framework install

## Security Domain

> `security_enforcement: true` (config.json). Scoped to what Phase 4 introduces.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Phase 4 adds no new auth surface; run/export routes are app-internal |
| V3 Session Management | no | No new sessions |
| V4 Access Control | yes (light) | Export route must enforce the same brand-scoping as run route; previews stay sandboxed (no auth/session/Convex token into preview — PREV-01, unchanged) |
| V5 Input Validation | yes | Brief fields + resume selection validated with Zod (`RunRequestBody.strict()` pattern). Resume direction index bounded at runtime |
| V6 Cryptography | no | No crypto introduced — never hand-roll |
| V12 File/Resource | yes | Export bytes go to Convex `_storage` (managed); PDF/raster generated server-side from the brand's own compiled bundle — no user-supplied file ingestion in mvp (INPUT-07 image input is deferred) |

### Known Threat Patterns for {Node export + Playwright + LLM structured output}
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Generated bundle executing in a credentialed context during raster export | Elevation of Privilege | Render in the same sandboxed/credential-free path the eval screenshots use (no auth/session/Convex token) — PREV-01/PREV-04 |
| Prompt-injected brief steering the planner to invent non-Jio visuals | Tampering | DS-grounded closed enums in `CreativeDirectionSchema` (D-06) + the validator/registry gate downstream (VAL-02/03/04) catch any non-Jio output |
| Oversized/abusive frame count or repair loop (resource exhaustion) | Denial of Service | Hard frame cap (~10, D-08) + shared carousel repair/token/time budget (D-09) |
| Malformed resume payload re-entering the workflow | Tampering | Strict Zod validation of the resume body; bounded direction index; branch only in the workflow (ORCH-04) |
| Secret leakage in IR/bundle/event/export | Information Disclosure | `ANTHROPIC_API_KEY` is server-only (read by `@ai-sdk/anthropic`), never written to IR/bundle/event (verified pattern in modelAdapter.ts/workflow.ts) — preserve for export rows |

## Sources

### Primary (HIGH confidence)
- Codebase (read in full this session): `workflow.ts`, `plannerAgent.ts`, `voiceAdapter.ts`, `designAdapter.ts`, `modelAdapter.ts`, `foundationResolver.ts`, `foundationResolve.ts`, `outputProfileTable.ts`, `events.ts`, `artifactTypes.ts`, `runTypes.ts`, `evaluate.ts`, `repair.ts` (head), `compiler.ts` (head), `playwrightRenderer.ts`, `dimension-scales.ts`, `platforms.ts`, `din1450.ts`, `platform-config.ts`, `run/route.ts`, `schema.ts` (experience* + campaign* + platforms), `FOUNDATION-COVERAGE.md`, `social-platforms.ts` (reference-only)
- Installed versions verified via `node require(...).version`: mastra/core 1.37.1, mastra/ai-sdk 1.4.3, ai 6.0.111, @ai-sdk/anthropic 3.0.54, zod 4.3.6, playwright 1.59.1; pdf-lib/pdfkit NOT installed
- Anthropic structured outputs — platform.claude.com/docs/en/build-with-claude/structured-outputs (complexity limits, descriptive fields, flatten/required guidance)

### Secondary (MEDIUM confidence)
- pdf-lib — github.com/Hopding/pdf-lib (embedPng/embedJpg/addPage/drawImage, zero native deps)
- Joyfill "Comparing open source PDF libraries (2025 edition)"; ironpdf PDFKit alternatives (pdf-lib vs pdfkit tradeoffs for raster composition)

### Tertiary (LOW confidence)
- General PDF library comparison blogs (Nutrient, Medium) — used only to corroborate the pdf-lib-vs-pdfkit framing, not for API specifics

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all core deps verified installed; only pdf-lib unverified-by-install (gated)
- Non-web resolution architecture: HIGH — the resolution helpers + Platforms foundation read directly in source; gap behavior matches D-02 exactly
- Planner schema / Anthropic gotchas: HIGH — rules verified across three existing files
- HITL resume route: MEDIUM — suspend/resume machinery verified; cross-request resume route is a genuine net-new seam (Pitfall 4 / A5)
- Export (PDF lib choice): MEDIUM — pdf-lib API cited from official README, not yet exercised in repo
- Pitfalls: HIGH — each traces to a verified source line

**Research date:** 2026-06-02
**Valid until:** 2026-07-02 (stable; codebase-grounded). Re-verify pdf-lib version + Anthropic schema-complexity limits if planning slips > 30 days.
