# Phase 03.1 — Deferred / Out-of-Scope Items

Discoveries logged during execution that are NOT caused by the current plan's
changes (Rule SCOPE BOUNDARY — do not auto-fix pre-existing failures in
unrelated files). All confirmed present at the phase base commit `a36c8368`.

| Discovered During | File | Issue | Why Out of Scope |
|-------------------|------|-------|------------------|
| 03.1-01 Task 2 | `packages/shared/src/engine/buildNativeTheme.ts:233` | `error TS2339: Property 'stateLayers' does not exist on type 'ResolvedTokenSet'` | Pre-existing at the phase base commit (a36c8368); present in `@oneui/shared` and reproduced by every package that typechecks against it (e.g. `experience-builder-agents`). Not introduced by the bundler change — surfaces in `experience-builder-preview` only because `assembleAsset.ts` now imports the shared engine. Belongs to the `@oneui/shared` native-theme builder, outside this phase's scope fence. |
| 03.1-03 | `packages/experience-builder-agents/src/workflow.ts` | Three `TS2345` errors on the `runStep(versionFreezeStep, ...)` call sites: Mastra `Step` type not assignable to the local `runStep` `{ execute: (a: unknown) => Promise<unknown> }` param (`ExecuteFunctionParams` / `Partial<ObservabilityContext>` mismatch). | Pre-existing Mastra-typing friction in the deterministic runner. Plan 03.1-03 added zero new typecheck errors — the error set is identical before and after the change (only line numbers shifted by the added lines). |
| 03.1-03 | `packages/shared/src/engine/buildNativeTheme.ts:233` | `TS2339: Property 'stateLayers' does not exist on type 'ResolvedTokenSet'` (same as above, reproduced when typechecking `experience-builder-agents`). | Unrelated package (`@oneui/shared`), unrelated subsystem. |
