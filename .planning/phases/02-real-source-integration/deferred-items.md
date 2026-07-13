# Deferred Items — Phase 02

Out-of-scope discoveries found during execution. NOT fixed (SCOPE BOUNDARY: only
auto-fix issues directly caused by the current task's changes).

## Pre-existing `@oneui/shared` typecheck errors (discovered Plan 02-01)

`pnpm --filter @oneui/experience-builder-agents typecheck` traverses into
`@oneui/shared/engine` and surfaces PRE-EXISTING type errors in the shared
package (confirmed present on a clean checkout — `packages/shared/` is untouched
by this plan):

- `packages/shared/src/engine/buildNativeTheme.ts(233,32)`: Property `stateLayers`
  does not exist on type `ResolvedTokenSet`.
- `packages/shared/src/engine/__tests__/engineDrift.test.ts(84,32)`: same `stateLayers`.
- `packages/shared/src/engine/__tests__/surfaceNew.test.ts` lines 329/330/541/542:
  `step`/`stateLayers` property errors.

These are unrelated to FND-04/GEN-05/GEN-06 and predate this phase. The
experience-builder-agents package's OWN source (`src/*.ts`) typechecks clean.
Defer to a dedicated `/gsd-debug` or shared-package maintenance task.
