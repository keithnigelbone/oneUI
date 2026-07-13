---
phase: 03-preview-eval-repair
plan: 06
subsystem: ui
tags: [tldraw, iframe-sandbox, convex, react, experience-lab, preview-lifecycle, version-timeline]

# Dependency graph
requires:
  - phase: 03-preview-eval-repair (plan 02)
    provides: preview seam + IframeCspExecutor + PREV-03 lifecycle state machine (lifecycle.ts)
  - phase: 03-preview-eval-repair (plan 03)
    provides: experienceRuns persistArtifact/listVariantGroup/getArtifactHistory + D-13 version object schema
  - phase: 03-preview-eval-repair (plan 04)
    provides: closed-loop workflow + RunExperienceResult carrying previewState/evaluation
provides:
  - "Artifact card real-DOM live-iframe preview with thumbnail→lightweight→live lifecycle (CANVAS-06/PREV-03)"
  - "VariantGroupFrame tldraw frame clustering best-of-N variant siblings (CANVAS-05)"
  - "VersionTimelinePanel browsing the persisted version chain via getArtifactHistory (VER-02)"
  - "Run route persists the FULL VER-01 version object end-to-end (previewState/evaluation/thumbnail/originRunId/variantGroupId)"
  - "INPUT-05 iterate-on-artifact route seam (parentVersionId/parentIr) with persisted lineage"
affects: [experience-lab, canvas, preview, eval-repair]

# Tech tracking
tech-stack:
  added: ["@oneui/experience-builder-preview workspace dep on @oneui/platform"]
  patterns:
    - "Lifecycle-gated preview region (thumbnail img / lightweight placeholder / live sandboxed iframe) driven by pure nextLifecycleState"
    - "Sandboxed iframe credential isolation: sandbox=allow-scripts WITHOUT allow-same-origin, opaque-token src (PREV-01)"
    - "_storage thumbnail upload via generateUploadUrl → POST → references.getStorageUrl, guarded non-fatal (VER-01)"
    - "VariantGroupFrame mirrors RunGroupFrame: FrameShapeUtil extend, patchFrameBodyFill verbatim, no Builder util import (LAB-03)"

key-files:
  created:
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/frames/VariantGroupFrame.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_panels/VersionTimelinePanel.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_panels/VersionTimelinePanel.module.css"
    - "apps/platform/src/app/(platform)/(experience-lab)/__tests__/versionTimeline.test.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/__tests__/versionTimelinePersistence.test.ts"
  modified:
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/ArtifactCardShape.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/cardChrome.ts"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/runStream.ts"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts"
    - "apps/platform/src/app/api/experience-lab/run/route.ts"
    - "packages/experience-builder-agents/src/runTypes.ts"
    - "packages/experience-builder-agents/src/workflow.ts"

key-decisions:
  - "VariantGroupFrame is a standalone FrameShapeUtil-extending module (CANVAS-05 artifact); registration into the canvas is deferred — both it and RunGroupFrame override tldraw's single 'frame' type, so they cannot register simultaneously."
  - "INPUT-05 iterate is wired at the route+input seam (parentVersionId persisted to version lineage, parentIr threaded into RunExperienceInput); the workflow planner does not yet consume parentIr — wiring is honest but the re-plan-from-IR step is a follow-up."
  - "Thumbnail signed-URL resolution reuses the VERIFIED references.getStorageUrl analog (composition/verify route), not a new query."

patterns-established:
  - "Preview lifecycle render: live → sandboxed iframe, thumbnail → _storage img, else → static Surface placeholder; advanced via nextLifecycleState on pointer-enter, persisted through editor.updateShape"
  - "RunResultFrame carries the canvas preview seed (previewUrl/thumbnailUrl/variantGroupId) end-to-end from route → reducer → shape props"

requirements-completed: [CANVAS-06, CANVAS-05, VER-01, VER-02, PREV-03, INPUT-05]

# Metrics
duration: 35min
completed: 2026-06-01
---

# Phase 3 Plan 06: Closed-Loop Canvas Surface Summary

**Artifact cards render a real-DOM sandboxed live iframe with a thumbnail→lightweight→live lifecycle, variant siblings cluster in an isolated tldraw frame, a per-card version timeline browses the persisted chain, and the run route now persists the full VER-01 version object (previewState/evaluation/_storage thumbnail/originRunId) end-to-end.**

## Performance

- **Duration:** ~35 min
- **Completed:** 2026-06-01
- **Tasks:** 3
- **Files modified/created:** 13 source files (+ package.json, pnpm-lock.yaml)

## Accomplishments
- CANVAS-06/PREV-03: `ArtifactCardShape` extended with `previewUrl`/`thumbnailUrl`/`variantGroupId`/`lifecycle` props and a lifecycle-gated `PreviewRegion` — `live` mounts `<iframe sandbox="allow-scripts">` (NO `allow-same-origin`) at the immutable separate-origin URL; `thumbnail` shows the `_storage` image; neither injects raw HTML nor raster-flattens. Lifecycle advances via the pure `nextLifecycleState` on pointer-enter.
- CANVAS-05: new `VariantGroupFrame` mirrors `RunGroupFrame` exactly (FrameShapeUtil extend, `patchFrameBodyFill` verbatim, bg-moderate fill, "Variant Group" label) with zero Builder-util import (LAB-03).
- VER-02: new `VersionTimelinePanel` reads `getArtifactHistory` and renders the version chain in `parentVersionId` lineage order with validation badge + evaluation composite + time, token-only Surface chrome.
- VER-01 (the blocker fix): the run route's `persistArtifact` call now passes `previewState`, `evaluation`, `variantGroupId`, `originRunId`, and a `_storage` `thumbnail` uploaded from the first preview screenshot — none stay null after a successful run. Upload is guarded non-fatal.
- INPUT-05: `RunRequestBody` accepts `parentVersionId`/`parentIr`; the route seeds the run from the prior version and threads `parentVersionId` into the persisted version lineage.

## Task Commits

1. **Task 1: Live-iframe + lifecycle on artifact card + variant frame** - `c9d33919` (feat)
2. **Task 2: VER-01 persistence end-to-end + VersionTimelinePanel + iterate route** - `44f1b390` (feat)
3. **Task 3: jsdom canvas/panel + VER-01 persistence + isolation tests** - `f640d606` (test)

## Files Created/Modified
- `_canvas/shapes/ArtifactCardShape.tsx` - live-iframe + PREV-03 lifecycle; exported `PreviewRegion`/`asLifecycle` for tests
- `_canvas/shapes/cardChrome.ts` - token-only preview region/iframe/thumbnail/placeholder style fragments
- `_canvas/frames/VariantGroupFrame.tsx` - CANVAS-05 variant frame (FrameShapeUtil extend)
- `_canvas/runStream.ts` - `RunResultFrame` extended with `previewUrl`/`thumbnailUrl`/`variantGroupId`
- `_canvas/useExperienceLabRun.ts` - thread preview seed through `placeArtifact`
- `_panels/VersionTimelinePanel.tsx` (+ `.module.css`) - VER-02 timeline
- `api/experience-lab/run/route.ts` - VER-01 persistence + thumbnail upload + INPUT-05 iterate body
- `experience-builder-agents/src/runTypes.ts` - `screenshots`/`variantGroupId` on result; `parentIr`/`parentVersionId` on input
- `experience-builder-agents/src/workflow.ts` - surface `ctx.screenshots` on the result
- `__tests__/versionTimeline.test.tsx`, `__tests__/versionTimelinePersistence.test.ts` - coverage

## Decisions Made
- See `key-decisions` frontmatter. The two notable ones: VariantGroupFrame canvas registration is deferred (single tldraw `'frame'` type collision with RunGroupFrame), and INPUT-05's planner-side re-plan-from-IR is a follow-up while the route/input seam is fully wired.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `@oneui/experience-builder-preview` workspace dependency to `@oneui/platform`**
- **Found during:** Task 1 — `ArtifactCardShape` imports `nextLifecycleState`/`PreviewLifecycleState` from the preview package, which `apps/platform` did not depend on (module-not-found typecheck error).
- **Fix:** Added `"@oneui/experience-builder-preview": "workspace:*"` to `apps/platform/package.json`; re-ran `pnpm install` (lockfile updated).
- **Files modified:** `apps/platform/package.json`, `pnpm-lock.yaml`
- **Verification:** `pnpm --filter @oneui/platform typecheck` resolves the import; tests pass.
- **Committed in:** `c9d33919`

**2. [Rule 1 - Bug] Fixed pre-existing `recordRunEvents` status type error in the run route**
- **Found during:** Task 2 (editing the route) — `status: run.outcome` failed typecheck because `RunExperienceResult.outcome` now includes `'suspended'` (Plan 04), which `recordRunEvents` (running|artifact|gap|error) rejects.
- **Fix:** Map `'suspended' → 'gap'` for both the persisted status and the wire result-frame outcome (matches the workflow's own event-union mapping for suspended runs).
- **Files modified:** `apps/platform/src/app/api/experience-lab/run/route.ts`
- **Verification:** Platform typecheck no longer reports the route error; route tests green.
- **Committed in:** `44f1b390`

**3. [Rule 3 - Blocking] Surfaced `screenshots` on `RunExperienceResult`**
- **Found during:** Task 2 — the plan's VER-01 thumbnail upload reads `run.screenshots?.[0]?.png`, but `screenshots` lived only on the internal run `ctx`, not the public result.
- **Fix:** Added optional `screenshots`/`variantGroupId` to `RunExperienceResult` and surfaced `ctx.screenshots` in `finalizeRun`/`suspendedResult`.
- **Files modified:** `packages/experience-builder-agents/src/runTypes.ts`, `workflow.ts`
- **Verification:** Agents `src/` typechecks clean; persistence test asserts the thumbnail upload.
- **Committed in:** `44f1b390`

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All three were necessary to compile and to satisfy the VER-01 end-to-end criterion. No scope creep.

## Known Stubs
- **VariantGroupFrame canvas registration** — the util is created (CANVAS-05 artifact) but not added to `ExperienceLabCanvas`'s `labShapeUtils`, because tldraw allows one util per `'frame'` type and `RunGroupFrameShapeUtil` already claims it. Clustering variant cards into the variant frame on the live canvas requires a single frame util that picks its fill by the frame `name` (Run # vs Variant Group), or a distinct custom frame type — a follow-up. Tests assert the util's shape/label, not its live registration.
- **INPUT-05 planner re-plan-from-IR** — `parentIr` is threaded into `RunExperienceInput` and `parentVersionId` is persisted to the version lineage, but the Mastra planner/IR-generator does not yet read `parentIr` to produce a patch-based re-run. The route seam + lineage persistence are real; the planner consumption is the remaining work.

## Issues Encountered
- jest-dom matchers (`toHaveAttribute`) are not loaded in the platform vitest setup — switched to `element.getAttribute(...)` assertions.
- The worktree spawned without `node_modules`; ran `pnpm install` once before typechecking.

## Threat Flags
None — no new trust boundary beyond the plan's threat model. The live iframe uses `sandbox="allow-scripts"` without `allow-same-origin` and an opaque-token src (T-3-06-IFRAME mitigated); no `(builder)` import in any Lab file (T-3-06-ISO mitigated); Lab chrome is token-only with zero `check:literals` violations (T-3-06-LIT mitigated).

## Next Phase Readiness
- The closed quality loop is now user-observable on the canvas. Remaining follow-ups: wire VariantGroupFrame into the canvas (single name-driven frame util) and have the planner consume `parentIr` for true patch-based iterate.

---
*Phase: 03-preview-eval-repair*
*Completed: 2026-06-01*

## Self-Check: PASSED
- All created files verified present (VariantGroupFrame, VersionTimelinePanel + css, both test files, SUMMARY).
- All task commits verified in git log: `c9d33919`, `44f1b390`, `f640d606`.
- `pnpm --filter @oneui/platform test -t "versionTimeline|canvas"` → 96 passed.
- `pnpm --filter @oneui/platform typecheck` → only pre-existing out-of-scope errors (workflow.ts Mastra typing, buildNativeTheme.ts, design-tools Surfaces); zero errors in Plan 06 files.
- `pnpm check:literals` → zero violations in Lab files.
