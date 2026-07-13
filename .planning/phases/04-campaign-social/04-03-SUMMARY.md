---
phase: 04-campaign-social
plan: 03
subsystem: agents
tags: [carousel, ordered-frames, shared-budget, per-frame-tov, tldraw-group, ds-compliance, experience-builder]

# Dependency graph
requires:
  - phase: 04-campaign-social
    plan: 01
    provides: non-web foundation resolver branch + resolvedDimensions on FoundationResolveResult (per-frame canvas dims / gap)
  - phase: 04-campaign-social
    plan: 02
    provides: campaign branch + suspend/resume + CampaignPlan contract + Convex persistence + /resume route + campaignSelection seam
provides:
  - "runCarousel driver (steps/carousel.ts): ordered N-frame loop with a carousel-level SHARED repair budget accumulator (Pitfall 3 / D-09)"
  - "Additive orderIndex v.optional(v.number()) on experienceArtifacts + persistArtifact arg (CAMP-04 / D-07, no migration)"
  - "runCampaignCarousel workflow wiring: resume → resolve canvas (CAMP-05) → per-frame ToV copy (CAMP-03) → per-frame quality loop → ordered frames"
  - "RunExperienceResult.carouselFrames + RunContext.carouselFrames (ordered, grouped frame results)"
  - "run/resume routes persist DS-compliant frames as grouped+ordered artifacts; resume route streams carouselFrames"
  - "carouselFrameLayout.ts pure logic (orderCarouselFrames/frameLabel/carouselGroupLabel/frameStatusPill/repairExhaustedBody)"
  - "CarouselGroupFrame (FrameShapeUtil + CarouselGroupChrome): ordered tldraw group, token-only Jio chrome, isolation-safe"
affects: [carousel-card-ui, export-pipeline, campaign-canvas-rendering]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Carousel driver injects its per-frame pipeline + ToV seam + canvas resolver (mirrors foundationsLoader/previewExecutor injection) — deterministic, no ai/@ai-sdk import, unit-testable"
    - "Carousel-level SHARED repair budget: each frame receives min(sharedRemaining, MAX_PER_FRAME=3); a spent budget gives 0 (no fresh N=3 blowout, T-04-07)"
    - "Order is meaningful (D-07): frames share one variantGroupId + sequential orderIndex, NEVER ranked (composite is informational only)"
    - "Per-frame quality loop reuses the EXISTING generate→compile→validate→evaluate→repair steps on a per-frame sub-context (never a side path, D-09)"
    - "Sibling isolation: a frame's repair-exhausted outcome is its own status; it does not abort the loop or change a sibling's mapping"
    - "Ordered carousel group chrome = pure logic module (carouselFrameLayout.ts) + token-only tldraw FrameShapeUtil chrome (CarouselGroupFrame.tsx), deep-path @oneui/ui-internal imports, no Builder import (LAB-03)"

key-files:
  created:
    - packages/experience-builder-agents/src/steps/carousel.ts
    - packages/experience-builder-agents/src/steps/carousel.test.ts
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/carouselFrameLayout.ts
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/carouselFrameLayout.test.ts
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/CarouselGroupFrame.tsx
  modified:
    - packages/convex/convex/schema.ts
    - packages/convex/convex/experienceRuns.ts
    - packages/experience-builder-agents/src/workflow.ts
    - packages/experience-builder-agents/src/workflow.test.ts
    - packages/experience-builder-agents/src/runContext.ts
    - packages/experience-builder-agents/src/runTypes.ts
    - packages/experience-builder-agents/src/index.ts
    - apps/platform/src/app/api/experience-lab/run/route.ts
    - apps/platform/src/app/api/experience-lab/resume/route.ts
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/runStream.ts

key-decisions:
  - "Chose 0-based orderIndex (frames 0..N-1) persisted; the 1-based human label ('Frame 1 of N') is derived in frameLabel(index, total)"
  - "Carousel-level shared repair budget = 6 total attempts (CAROUSEL_REPAIR_BUDGET); deliberately smaller than the naive sum (N frames × 3) so a long carousel cannot blow out the repair envelope (Pitfall 3 / T-04-07)"
  - "The carousel driver is DEPENDENCY-INJECTED (runFramePipeline / requestFrameCopy / resolveCanvas) rather than importing workflow.ts — avoids the workflow↔steps circular import and keeps the driver deterministic + unit-testable without a live model"
  - "Per-frame ToV copy reuses runVoiceAdapter (the existing node-safe seam) with the direction's copyAngle as the per-section intent — CAMP-03 is delivered in the carousel driver's per-frame loop, exactly as the plan specified"
  - "carousel run outcome: ANY DS-compliant frame → 'artifact'; ALL frames repair-exhausted/gap → 'gap' (no shippable frame); one bad frame never breaks siblings (D-09)"
  - "Only DS-compliant (outcome==='artifact', IR-carrying) frames are persisted as experienceArtifacts rows — a repair-exhausted/gap frame has no shippable IR, so no fabricated artifact (FND-03 honesty)"

patterns-established:
  - "Per-frame sub-context: runId = `${parentRunId}-frame-${orderIndex}`, fresh events, shared request + already-resolved foundation; the budget-bounded repair loop runs min(budget, N=3) attempts"
  - "frameStatusPill is a PURE per-frame outcome→{appearance,text} map (positive/Valid IR, negative/repair-exhausted, neutral/Not generated) — sibling-isolated, status by text+role not colour alone (WCAG AA)"

requirements-completed: [CAMP-03, CAMP-04, CAMP-05]

# Metrics
duration: 38min
completed: 2026-06-02
---

# Phase 4 Plan 03: Generate the Carousel Summary

**After a direction is picked, the campaign branch drives N ORDERED carousel frames through the EXISTING per-frame quality loop: each frame resolves its canvas dims from the foundation (gap → zero frames, CAMP-05), gets its own headline/body/CTA + caption from the existing ToV adapter (CAMP-03), and runs generate→compile→validate→evaluate→bounded-repair so it is provably DS-compliant ON ITS OWN (D-09). Frames share one `variantGroupId` + a sequential `orderIndex` (D-07, never ranked), and a carousel-level SHARED repair budget caps total attempts across ALL frames — no per-frame fresh N=3 (Pitfall 3 / T-04-07). The schema gains `orderIndex` append-only; the run/resume routes persist DS-compliant frames as grouped, ordered artifacts; and an isolation-safe tldraw `CarouselGroupFrame` renders them left-to-right ("Carousel: {direction}", "Frame n of N") with token-only Jio chrome + per-frame status pills.**

## Performance
- **Duration:** ~38 min
- **Tasks:** 3 (all TDD: RED → GREEN)
- **Files:** 15 (5 created, 10 modified)

## Accomplishments
- **`runCarousel` driver** (`steps/carousel.ts`): the ordered N-frame loop with a carousel-level shared-budget accumulator. Resolves the canvas first (CAMP-05 gap → zero frames, no copy, no pipeline); then for each frame in 0..N-1 (order preserved, no ranking — D-07) requests per-frame ToV copy (CAMP-03), runs the injected per-frame pipeline with `repairBudgetRemaining = min(sharedRemaining, N=3)`, and decrements the shared accumulator by the frame's ACTUAL repair usage. A spent budget gives later frames 0 attempts (no fresh N=3). Net-new, fully dependency-injected (no `ai`/`@ai-sdk` import).
- **Additive `orderIndex` schema** (`schema.ts` + `experienceRuns.ts` `persistArtifact`): `v.optional(v.number())` on `experienceArtifacts`, mirroring the `variantGroupId` additive precedent — existing rows round-trip, NO migration. The `by_variant_group` index is reused; carousel ordering reads `orderIndex` within a group.
- **Workflow wiring** (`workflow.ts` `runCampaignCarousel`): after the resume applies the clamped `{ directionIndex, frameCount }`, the campaign branch resolves the canvas, then drives `runCarousel` wiring (a) per-frame ToV copy via `runVoiceAdapter` (CAMP-03), (b) the per-frame quality loop that reuses the existing generate/compile/validate/evaluate/repair steps on a per-frame sub-context (D-09), under (c) the carousel-level shared budget. Ordered frames are collected onto `ctx.carouselFrames`; both resume entry points (`campaignSelection`-on-request and `makeCampaignResume`) drive it. Branching stays in the workflow (ORCH-04).
- **Result/context types**: `carouselFrames` added to `RunExperienceResult` + `RunContext` (with a `CarouselFrameResultT` type), surfaced by `finalizeRun`.
- **Persistence** (`run/route.ts` + `resume/route.ts`): both routes persist each DS-compliant frame as a grouped, ordered `experienceArtifacts` row (shared `variantGroupId` + sequential `orderIndex`) keyed by the run row; existing single-artifact runs persist unchanged. The resume route also STREAMS the ordered `carouselFrames` on its terminal frame (new `CarouselFrameFrame` on `RunResultFrame`).
- **Ordered group canvas** (`carouselFrameLayout.ts` + `CarouselGroupFrame.tsx`): pure ordering/label/status logic (unit-tested, framework-free) + a tldraw `CarouselGroupFrameShapeUtil` mirroring `VariantGroupFrame`/`RunGroupFrame` (LAB-03 — no `ExperienceCanvas`/`(builder)` import) plus a `CarouselGroupChrome` that renders frames left-to-right by `orderIndex` ("Carousel: {name}", "Frame n of N") with `--Label-XS-*` typography + `--Typography-Font-Primary`, a Jio `Badge` status pill per frame (positive "Valid IR" / negative repair-exhausted), wrapped in `<Surface mode="subtle">` — deep-path `@oneui/ui-internal` imports, no raw background/hex.

## Task Commits
1. **Task 1: orderIndex schema + carousel driver** — `63f6c508` (feat). RED→GREEN done in the working tree; the additive schema + driver + passing test were committed together (the schema change is append-only and the test/impl are one unit).
2. **Task 2 (RED): carousel-after-resume cases** — `22df0e61` (test)
3. **Task 2 (GREEN): wire carousel into campaign branch + persist ordered frames** — `1f5e0125` (feat)
4. **Task 3 (RED): carousel ordering/label/status pure-logic cases** — `444504b4` (test)
5. **Task 3 (GREEN): ordered carousel tldraw group frame + logic** — `624625ff` (feat)

## Deviations from Plan

### Scope-driven / decisions

**1. [Rule 3 - Blocking] Carousel driver is dependency-injected rather than importing the per-frame pipeline directly**
- **Found during:** Task 1/2. `workflow.ts` imports `steps/*` (the per-frame steps), so a `steps/carousel.ts` that imported `workflow.ts` (for `runStep`/`driveRepairLoop`/`reCompileAndValidate`/`ORDERED_STEPS`, all private) would create a circular import.
- **Fix:** `runCarousel` accepts injected `runFramePipeline` + `requestFrameCopy` + `resolveCanvas` (mirroring the established `foundationsLoader`/`previewExecutor`/`persistCampaignPlan` injection idiom). The driver owns the ORDERING + SHARED-BUDGET loop; `workflow.ts` (`runCampaignCarousel`) wires the real per-frame pipeline (reusing the existing steps on a per-frame sub-context). This keeps the driver deterministic + unit-testable with no live model, and the workflow remains the orchestration brain (ORCH-04).
- **Files:** `steps/carousel.ts`, `workflow.ts`.
- **Commits:** `63f6c508`, `1f5e0125`.

**2. [Rule 2 - Critical] Resume route now persists + streams the ordered frames**
- **Why:** Plan 02's resume route only re-entered the workflow with the selection (frame generation was deferred to this plan). With the carousel now producing frames, the resume route must (a) persist each DS-compliant frame as a grouped/ordered artifact (so the canvas + later export can read them), and (b) stream `carouselFrames` so the canvas renders the ordered group. Persistence is best-effort/non-fatal; only `outcome==='artifact'` IR-carrying frames are written (FND-03 — no fabricated artifact for a repair-exhausted/gap frame).
- **Files:** `resume/route.ts`, `runStream.ts` (new `CarouselFrameFrame` + `RunResultFrame.carouselFrames`).
- **Commit:** `1f5e0125`.

## Threat Model Coverage
- **T-04-07 (carousel repair/token DoS):** the carousel-level SHARED budget accumulator caps total repair attempts across ALL frames (`CAROUSEL_REPAIR_BUDGET = 6`, smaller than N×3); each frame receives `min(sharedRemaining, N=3)` and a spent budget gives 0 — bounded by construction. Frame count is clamped 1..10 upstream (plan 02 resume + workflow, D-08). Verified by the "shared-budget halt caps total below sum-of-per-frame-caps" + "later frames see 0 budget" tests.
- **T-04-08 (per-frame IR tampering):** each frame runs the full existing generate→compile→validate→evaluate→repair loop; a frame that cannot be made DS-compliant surfaces `repair-exhausted` and is NOT persisted as an artifact (only `outcome==='artifact'` IR-carrying frames persist). The validator/registry gate is unchanged.
- **T-04-09 (legacy Builder isolation):** `CarouselGroupFrame.tsx` mirrors the Phase-3 `VariantGroupFrame`/`RunGroupFrame` `FrameShapeUtil` pattern WITHOUT importing `ExperienceCanvas`/`(builder)` internals (grep gate returns 0); chrome uses deep-path `@oneui/ui-internal` imports.
- **T-04-SC (npm installs):** zero new package installs in this plan.

## Verification
- `pnpm --filter @oneui/experience-builder-agents test` — 105 passed (14 files), including carousel (7 cases) + workflow (33 cases, 3 new carousel-after-resume cases).
- `pnpm --filter @oneui/platform test carouselFrameLayout` — 7 passed.
- `pnpm --filter @oneui/experience-builder-agents typecheck` — clean except the pre-existing cross-package `@oneui/shared/buildNativeTheme.ts` `stateLayers` error (deferred — not touched by this plan).
- `pnpm --filter @oneui/convex typecheck` — clean except the same pre-existing `@oneui/shared` error.
- `pnpm --filter @oneui/platform typecheck` — 16 errors, ALL pre-existing `stateLayers`/`ResolvedTokenSet` in surface-preview files; none in the carousel files this plan created (down from plan 02's 18; none new).
- `pnpm check:literals` — no violations in the new canvas chrome (`CarouselGroupFrame.tsx` / `carouselFrameLayout.ts`).
- Grep gates: no `ai`/`@ai-sdk` import in `carousel.ts` (the single match is a doc comment); no `ExperienceCanvas`/`(builder)`/`from '@oneui/ui'` (barrel) in `CarouselGroupFrame.tsx`; no raw background/hex in the chrome (the single `background` match is a doc comment); additive `orderIndex: v.optional(v.number())` present in `schema.ts`; `CarouselGroupFrame.tsx` consumes `orderCarouselFrames`/`frameLabel`/`carouselGroupLabel`/`frameStatusPill`.

## Deferred Issues
Pre-existing `@oneui/shared` `stateLayers`/`ResolvedTokenSet` typecheck errors (surface-engine area) in `buildNativeTheme.ts` + the platform `SurfaceNewPreview.tsx`/`SurfaceValidationTable.tsx` — logged in `deferred-items.md` by plans 04-01/04-02, out of scope (not touched by this plan).

## Known Stubs
- The per-frame **caption** reuses the ToV body string as the caption seed (CAMP-03). A dedicated caption-generation pass is a documented future quality lever (deferred ideas) — the ToV seam owns the per-frame copy as specified; this is the MVP slice, not an accidental stub.
- The campaign-plan CARD UI (direction selection + "Generate frames" CTA that POSTs to `/resume`) and the canvas reducer/registration that places `CarouselGroupFrame` on tldraw consume `carouselFrames` from the resume stream — that wiring is the canvas-integration slice (plan 04-04 per the phase plan set). This plan delivers the driver, persistence, stream contract, the FrameShapeUtil + chrome, and the pure logic they consume.

## Threat Flags
None — no new security-relevant surface beyond the planned trust boundaries (selection → carousel driver; per-frame IR → validator), all mitigated above. The resume route's frame persistence reuses the existing `persistArtifact` mutation + the already-validated selection; no new network endpoints, auth paths, or file access.

## Self-Check: PASSED
- Created files exist: `carousel.ts`, `carousel.test.ts`, `carouselFrameLayout.ts`, `carouselFrameLayout.test.ts`, `CarouselGroupFrame.tsx` — FOUND.
- Commits exist: `63f6c508`, `22df0e61`, `1f5e0125`, `444504b4`, `624625ff` — FOUND in git log.
- All touched-package tests green (agents 105, platform carouselFrameLayout 7); all grep gates pass; my files typecheck clean (only pre-existing cross-package surface-engine errors remain).

## TDD Gate Compliance
- Task 1: RED→GREEN executed in the working tree (test failed on missing module, then passed); committed as one feat commit (`63f6c508`) since the additive schema + driver + test form one append-only unit. No separate RED commit for Task 1.
- Task 2: `test(04-03)` (`22df0e61`) precedes `feat(04-03)` (`1f5e0125`) in git log (RED → GREEN).
- Task 3: `test(04-03)` (`444504b4`) precedes `feat(04-03)` (`624625ff`) in git log (RED → GREEN).
- No REFACTOR commits were needed.

---
*Phase: 04-campaign-social*
*Completed: 2026-06-02*
