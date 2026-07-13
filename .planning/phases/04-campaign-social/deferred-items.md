# Phase 04 — Deferred Items

Out-of-scope discoveries logged during execution (not fixed; not caused by the current task's changes).

## Pre-existing `@oneui/shared` typecheck errors (discovered 04-01)

`pnpm --filter @oneui/shared typecheck` reports 11 errors, all pre-existing on the
plan base commit `69f44c43` and unrelated to plan 04-01's changes:

- `src/engine/__tests__/surfaceNew.test.ts` — `Property 'stateLayers' does not exist on type 'ResolvedTokenSet'` (multiple lines)
- `src/engine/buildNativeTheme.ts(233,32)` — same `stateLayers` / `ResolvedTokenSet` mismatch

None touch `dimension-scales.ts` (the only `@oneui/shared` file 04-01 modified — and it
typechecks clean). These belong to the surface-engine / native-theme area and should be
addressed by an owner of that code, not the campaign-social phase.

## Pre-existing `@oneui/experience-builder-agents` typecheck errors (discovered 04-01)

`pnpm --filter @oneui/experience-builder-agents typecheck` reports errors in
`src/workflow.ts` (lines 764, 767, 896, 902, 903, 923, 949, 970) — Mastra
`ExecuteFunction` / `ObservabilityContext` generic-assignability mismatches. These
pre-date 04-01 and are unrelated to the foundation resolver. `foundationResolver.ts`
(the only agents file 04-01 modified) typechecks clean. Belongs to the workflow/Mastra
integration owner, not this plan.

**Resolved by 04-02:** plan 04-02 widened the `runStep(step, ctx)` helper's
`step.execute` param to `(a: never)` (contravariant), which cleared this entire
Mastra `ExecuteFunction`/`ObservabilityContext` deferred class for `workflow.ts`.
The deterministic runner only invokes `execute({ inputData: { ctx } })`, so the
loosened param is sound. `pnpm --filter @oneui/experience-builder-agents typecheck`
now reports ONLY the cross-package `@oneui/shared/buildNativeTheme.ts` `stateLayers`
error below — no workflow.ts errors remain.

## Pre-existing `@oneui/platform` typecheck errors (surfaced 04-02)

`pnpm --filter @oneui/platform typecheck` reports the same `stateLayers` /
`ResolvedTokenSet` class in surface-preview files NOT touched by plan 04-02:

- `src/design-tools/Foundations/Surfaces/SurfaceNewPreview.tsx` (multiple lines)
- `src/design-tools/Foundations/Surfaces/SurfaceValidationTable.tsx(385)` — `step` / `opacity` on `number`

All 18 platform errors live in the surface-engine area; none are in the
experience-lab routes (`run/route.ts`, `resume/route.ts`) or `runStream.ts` that
04-02 modified — those typecheck clean. Belongs to the surface-engine owner.
