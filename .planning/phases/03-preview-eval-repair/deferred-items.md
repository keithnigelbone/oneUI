# Deferred Items — Phase 03 Preview/Eval/Repair

Out-of-scope discoveries logged during execution (not fixed — see SCOPE BOUNDARY).

## Pre-existing typecheck error in @oneui/shared (surfaced in plans 03-01 and 03-03)

- **File:** `packages/shared/src/engine/buildNativeTheme.ts:233`
- **Error:** `TS2339: Property 'stateLayers' does not exist on type 'ResolvedTokenSet'`
- **Status:** Pre-existing — `@oneui/shared` fails its OWN `tsc --noEmit` on this independently
  (also fails in `src/engine/__tests__/engineDrift.test.ts` and `surfaceNew.test.ts`).
- **Found during:**
  - Plan 03-01, Task 1 — `pnpm --filter @oneui/experience-builder-validation typecheck`.
  - Plan 03-03 — the new `@oneui/convex` package-level `typecheck` (`tsc -p .`) transitively
    follows the `@oneui/shared` import in the pre-existing `convex/__tests__/tokenGenerators.test.ts`,
    so `tsc` typechecks the imported `@oneui/shared` source and reports its pre-existing error.
  - Plan 03-04 — `pnpm --filter @oneui/experience-builder-agents typecheck` transitively follows
    the `@oneui/shared/agent` import (CLAUDE_VISION_MODEL) into the shared source. The agents
    package's own `src/` has ZERO type errors (verified by filtering tsc output to
    `packages/experience-builder-agents/src`).
- **Why deferred:** The error is in the `@oneui/shared` dependency's native-theme builder, not in any
  file modified by these plans. It correlates with the uncommitted `recipeCornerRadius` /
  `ComponentThemeContext` working-tree changes present at worktree base (`git status` at spawn).
  Plan 03-01 edits are validator-only and introduce zero new type errors; the convex functions +
  the new `experienceRuns.test.ts` typecheck clean. Fixing the shared package's native theme is out
  of scope for VAL-04/05/06 and the schema/persistence slice.
- **Recommended owner:** the `@oneui/shared` engine — align `ResolvedTokenSet` with `stateLayers`.

## Pre-existing platform typecheck errors (surfaced in plan 03-06)

`pnpm --filter @oneui/platform typecheck` reports errors in files NOT modified by Plan 06
(verified clean in `git status --short`). Left untouched per SCOPE BOUNDARY:

- **`packages/experience-builder-agents/src/workflow.ts`** (9 errors) — Mastra `createStep` /
  `ExecuteFunctionParams` `unknown` typing mismatch around the evaluate / version-freeze steps.
  Pre-existing on the Wave 1/2 base; the agents package surfaces it transitively when the platform
  app typechecks. Unrelated to the Plan 06 canvas/route slice.
- **`apps/platform/src/design-tools/Foundations/Surfaces/SurfaceNewPreview.tsx`** (13 errors) and
  **`SurfaceValidationTable.tsx`** (2 errors) — pre-existing design-tools surface typing errors in
  the legacy Foundations editor, unrelated to the Experience Lab.

Plan 06's own files (`ArtifactCardShape.tsx`, `VariantGroupFrame.tsx`, `cardChrome.ts`,
`runStream.ts`, `useExperienceLabRun.ts`, `VersionTimelinePanel.tsx`, `run/route.ts`) typecheck
clean.
