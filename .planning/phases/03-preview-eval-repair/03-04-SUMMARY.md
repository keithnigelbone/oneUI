---
phase: 03-preview-eval-repair
plan: 04
subsystem: api
tags: [mastra, vercel-ai-sdk, vision-judge, ir-patch, repair-loop, hitl, zod, best-of-n]

requires:
  - phase: 03-preview-eval-repair (Plan 03-01)
    provides: astValidator (now-blocking deterministic validator — objective track, D-06)
  - phase: 03-preview-eval-repair (Plan 03-02)
    provides: PreviewExecutor seam + IframeCspExecutor (screenshot the rubric judge reads)
  - phase: 01-isolated-foundation
    provides: frozen IR-patch contract (applyPatch/diffIr, D-09), modelAdapter callModel seam (ORCH-04), Mastra workflow skeleton
provides:
  - Two-track Visual Evaluator (objective short-circuit + subjective multimodal rubric judge)
  - IR-patch repair step via the frozen applyPatch contract with gap short-circuit
  - preview→evaluate→bounded-repair→version-freeze loop wired in both the committed Mastra chain and the deterministic runner
  - Best-of-N variant generation + composite ranking under a shared variantGroupId
  - ORCH-02 HITL suspend/resume checkpoint at non-convergence (Mastra suspend()/resumeData)
affects: [convex-persistence, experience-lab-canvas, version-timeline, campaign-social]

tech-stack:
  added: ["@oneui/experience-builder-preview as agents dependency"]
  patterns:
    - "Two-track scoring: deterministic objective gate short-circuits before any model call (D-06)"
    - "Vision judge routed through the single callModel seam via an optional images[] arg (ORCH-04)"
    - "Bounded loop termination predicate returns TRUE to STOP (cap/composite/scoreDelta/sameValidationError/gap)"
    - "HITL suspend/resume: decision branching owned by the workflow, gated off by default"
    - "Run-context/run-types extracted to a shared module to break the workflow↔steps import cycle"

key-files:
  created:
    - packages/experience-builder-agents/src/evaluatorRubric.ts
    - packages/experience-builder-agents/src/steps/evaluate.ts
    - packages/experience-builder-agents/src/steps/repair.ts
    - packages/experience-builder-agents/src/runContext.ts
    - packages/experience-builder-agents/src/runTypes.ts
    - packages/experience-builder-agents/src/steps/evaluate.test.ts
    - packages/experience-builder-agents/src/steps/repair.test.ts
  modified:
    - packages/experience-builder-agents/src/modelAdapter.ts
    - packages/experience-builder-agents/src/workflow.ts
    - packages/experience-builder-agents/src/index.ts
    - packages/experience-builder-agents/src/workflow.test.ts
    - packages/experience-builder-agents/src/backgroundRun.test.ts
    - packages/experience-builder-agents/package.json

key-decisions:
  - "Reuse the frozen StepEvent/GapEvent union (new step ids preview/evaluate/repair/version-freeze) rather than mutate the frozen ExperienceBuilderEvent schema in core"
  - "Split RunContext/RunExperienceInput/Result into runContext.ts + runTypes.ts to let the per-step modules share types without a circular import back into workflow.ts"
  - "Keep runExperienceWorkflow returning RunExperienceResult (autonomous default-off path unchanged); add a dedicated runExperienceWorkflowHitl returning a live SuspendedRun handle"
  - "A 'suspended' run reports 'gap' on the wire RunCompletedEvent (frozen union) while the RESULT carries outcome:'suspended' + suspendPayload"

patterns-established:
  - "Pattern: objective-track short-circuit — a blocking validation (or rendered:false, VAL-06) pins composite below threshold with NO model call"
  - "Pattern: repair emits a targeted IrPatch (small op array) applied via applyPatch — pure new IR, never JSX, never whole-IR regen"
  - "Pattern: runVariants(input,n) = N sequential runs sharing resolved foundation, ranked best→worst by composite"

requirements-completed: [EVAL-01, EVAL-02, EVAL-03, ORCH-02, GEN-07, PREV-04, VAL-06]

duration: 22min
completed: 2026-06-01
---

# Phase 3 Plan 04: Close the Quality Loop Summary

**Two-track Visual Evaluator (deterministic objective short-circuit + multimodal rubric judge via the single callModel seam) driving a bounded IR-patch repair loop with gap short-circuit, best-of-N ranking, and a Mastra suspend/resume HITL checkpoint — all orchestrated in Mastra with the AI SDK as model-layer-only.**

## Performance

- **Duration:** ~22 min
- **Completed:** 2026-06-01
- **Tasks:** 4 (all TDD)
- **Files modified:** 13 (7 created, 6 modified) in `@oneui/experience-builder-agents`

## Accomplishments

- **EVAL-01 / D-06 / D-07 — two-track evaluator.** `evaluatorRubric.ts` exports an Anthropic-safe `VisualRubric` (plain `z.number()` scores) plus a config-tunable weighted `composite()` + `threshold`/`epsilon`. `steps/evaluate.ts` short-circuits the objective track (blocking validation or `rendered:false` → composite below threshold, NO model call) and otherwise runs the subjective multimodal judge via the new vision path on `callModel`.
- **EVAL-02 / D-09 / D-11 — IR-patch repair.** `steps/repair.ts` emits a targeted `IrPatch` through the frozen `applyPatch` contract (pure new IR; never JSX, never whole-IR regen), short-circuits component/foundation gaps with zero attempts, and exposes the `sameValidationError` convergence signal.
- **ORCH-02 / EVAL-03 / GEN-07 / VAL-06 — the loop + variants.** `workflow.ts` inserts `previewStep → evaluateStep → .dountil(repairStep) → repairCheckpoint → versionFreezeStep` in BOTH the committed Mastra chain and the deterministic runner, with the termination predicate (cap N=3 / composite≥threshold / scoreDelta<epsilon / sameValidationError / gap). `runVariants(input,n)` ranks best-of-N under a shared `variantGroupId`.
- **ORCH-02 (second half) — HITL.** A Mastra `suspend()`/`resumeSchema` checkpoint suspends a non-converging run when `hitl:true`; `resume({accept|repair-again|abandon})` branches deterministically in the workflow. Default-off keeps the autonomous runner unchanged.

## Task Commits

1. **Task 1: evaluatorRubric + vision callModel path + two-track evaluate** - `5b99960c` (feat)
2. **Task 2: IR-patch repair step + gap short-circuit** - `b4549479` (feat)
3. **Task 3: wire preview→evaluate→bounded-repair→version-freeze + best-of-N** - `52cab798` (feat)
4. **Task 4: HITL suspend/resume checkpoint** - `fb523d51` (feat)

_TDD note: each task's failing-test + implementation landed together in a single feat commit (the step/schema and its credential-free test are co-authored)._

## Files Created/Modified

- `evaluatorRubric.ts` — Anthropic-safe `VisualRubric` Zod schema + `composite`/`threshold`/`epsilon` config (D-07).
- `steps/evaluate.ts` — two-track scoring step; objective short-circuit (no model call) + subjective vision judge via `callModel`.
- `steps/repair.ts` — `repairStep` (targeted `IrPatch` via `applyPatch`, gap short-circuit) + `updateSameValidationError` (D-10 signal).
- `runContext.ts` / `runTypes.ts` — extracted `RunContext` + run input/result types so steps share them without a cycle.
- `modelAdapter.ts` — extended `callModel` with an optional `images[]` vision/image-message path (defaults to `CLAUDE_VISION_MODEL`); still the sole `ai`/`@ai-sdk` importer.
- `workflow.ts` — new `previewStep`/`versionFreezeStep`/`repairCheckpoint`; `.dountil` bounded loop + mirrored runner; `runVariants`; `runExperienceWorkflowHitl` + `SuspendedRun`.
- `index.ts` — barrel exports for the new steps, rubric, `runVariants`, HITL entry point, and types.
- `workflow.test.ts` / `backgroundRun.test.ts` — extended for the new pipeline (mock `PreviewExecutor`, rubric/patch mock branches).

## Decisions Made

- Reused the frozen `ExperienceBuilderEvent` union (new `step` ids + existing `gap`) instead of mutating the frozen core schema — keeps the contract stable for the route/canvas.
- Extracted `runContext.ts`/`runTypes.ts` to break the workflow↔steps import cycle (steps need `RunContext`; workflow imports steps).
- Kept `runExperienceWorkflow` returning a plain `RunExperienceResult` (no breaking signature change); added `runExperienceWorkflowHitl` returning the resumable `SuspendedRun` so the autonomous default-off path stays deterministic.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Wired `@oneui/experience-builder-preview` as an agents dependency**
- **Found during:** Task 3 (preview step needs the `PreviewExecutor` seam).
- **Issue:** The agents package did not depend on the preview package, so `getPreviewExecutor()` could not be imported.
- **Fix:** Added `@oneui/experience-builder-preview: workspace:*` to `package.json` and ran `pnpm install`.
- **Files modified:** `packages/experience-builder-agents/package.json`, `pnpm-lock.yaml`.
- **Verification:** Workspace symlink restored; full agents test suite green.
- **Committed in:** `5b99960c`.

**2. [Rule 3 - Blocking] Updated `backgroundRun.test.ts` fixture for the new mandatory preview/evaluate steps**
- **Found during:** Task 3 (the new preview step made a pre-existing test reach an unconfigured executor → `error`).
- **Issue:** `backgroundRun.test.ts` called `runExperienceWorkflow` without injecting a `previewExecutor`, and its schema-aware model mock lacked rubric/patch branches.
- **Fix:** Injected a credential-free mock executor on the test request and added the `VisualRubric`/`RepairPatch` branches to the mock.
- **Files modified:** `packages/experience-builder-agents/src/backgroundRun.test.ts`.
- **Verification:** `pnpm --filter @oneui/experience-builder-agents test` — 78/78 green.
- **Committed in:** `52cab798`.

---

**Total deviations:** 2 auto-fixed (both Rule 3 - blocking). No scope creep — both were required to complete the wiring.

## Issues Encountered

- A scoped `pnpm install --filter` (run to link the new preview dependency) pruned other workspace `node_modules` symlinks, breaking cross-package module resolution in unrelated test files. Resolved with a full `pnpm install` to restore all workspace symlinks. No code change required.

## Deferred Issues

- **Pre-existing `@oneui/shared` typecheck error** (`buildNativeTheme.ts:233 — stateLayers on ResolvedTokenSet`) surfaces transitively through `pnpm --filter @oneui/experience-builder-agents typecheck` because tsc follows the `@oneui/shared/agent` import. The agents package's own `src/` has ZERO type errors (verified by filtering tsc output). Out of scope per SCOPE BOUNDARY; logged in `deferred-items.md`.

## Threat Surface

All `<threat_model>` mitigations applied: bounded loop (T-3-04-DOS), workflow-owned branching with the single ai-seam intact (T-3-04-ORCH, verified `check:single-ai` green), IR-patch-only repair (T-3-04-JSX, grep-asserted), Anthropic-safe Zod schemas (T-3-04-400), HITL resume validated against a Zod `resumeSchema` and branched in the workflow (T-3-04-HITL). No new security surface introduced beyond the planned threat register.

## Next Phase Readiness

- The full quality loop runs end-to-end credential-free; ready for Convex persistence (`previewState`/`evaluation`/`variantGroupId` on `experienceArtifactVersions`, D-12/D-13) and the canvas live-preview/version-timeline work.
- `runExperienceWorkflowHitl` returns a `SuspendedRun` handle the route/canvas can surface as an HITL prompt; the Daytona production executor (Plan 05) drops in behind the same `PreviewExecutor` seam.

---
*Phase: 03-preview-eval-repair*
*Completed: 2026-06-01*

## Self-Check: PASSED

- All 7 created files exist on disk.
- All 4 task commits present in git history (`5b99960c`, `b4549479`, `52cab798`, `fb523d51`).
- `pnpm --filter @oneui/experience-builder-agents test` — 78/78 green.
- `pnpm check:single-ai` + `pnpm check:experience-gates` — green.
