# Phase 01 — Deferred / Out-of-Scope Items

Items discovered during execution that are NOT caused by the current plan's
changes and are therefore out of scope per the executor scope boundary.

| Discovered During | Item | Evidence | Owner |
|-------------------|------|----------|-------|
| 01-01 Task 4 (typecheck) | `@oneui/shared` typecheck fails on `Property 'stateLayers' does not exist on type 'ResolvedTokenSet'` in `packages/shared/src/engine/buildNativeTheme.ts:233` and `src/engine/__tests__/surfaceNew.test.ts:547-550`. | Reproduces on `pnpm --filter @oneui/shared typecheck` independently of any experience-builder change; the offending line is unchanged at git `HEAD~2` (before this plan). | `@oneui/shared` maintainers — pre-existing failure in the base repo. |
| 01-02 Task 1 (typecheck) | Same `@oneui/shared` `stateLayers` failure leaks into `@oneui/experience-builder-registry typecheck` because the adapter type-imports `@oneui/shared` (`PropDescriptor`). | `pnpm --filter @oneui/experience-builder-registry typecheck` reports only `../shared/src/engine/buildNativeTheme.ts(233,32)`; grepping the output for `experience-builder-registry/src` shows no errors in this package's own sources. | `@oneui/shared` maintainers — same pre-existing failure as above. |
| 01-03 Task 1 (typecheck) | Same `@oneui/shared` `stateLayers` failure leaks into `@oneui/experience-builder-validation typecheck` because the validator imports the shared `tokenBoundary` (which transitively type-references the failing `@oneui/shared` engine). | `pnpm --filter @oneui/experience-builder-validation typecheck` reports only `../shared/src/engine/buildNativeTheme.ts(233,32)`; this package's own `src/*` sources typecheck clean. `pnpm --filter @oneui/shared typecheck` reproduces it independently. | `@oneui/shared` maintainers — same pre-existing failure as above. |

These do NOT block the experience-builder-core package: its own sources
typecheck clean (the only errors surfaced are from the sibling `@oneui/shared`
source it type-imports, which already fails on its own).

## Plan 01-05 — pre-existing out-of-scope findings

- **`pnpm check:literals` fails on 6 pre-existing violations in `packages/ui/src`** (Image.stories.tsx, Image.test.tsx, Modal.module.css, Modal.stories.tsx — rgba/literal values). These live in a scan root (`packages/ui/src`) that predates plan 05 and fail on HEAD (73e72632) independently of the Lab. The Lab route files (`(experience-lab)/**`) — newly added to the scan root by this plan — produce ZERO violations. Out of scope per executor SCOPE BOUNDARY (not caused by this task's changes); owned by the @oneui/ui package.

## Plan 01-06 — pre-existing out-of-scope findings

- **`@oneui/shared` `stateLayers` typecheck failure persists** (`buildNativeTheme.ts:233`), surfaced again when typechecking `@oneui/experience-builder-core` (which type-imports `@oneui/shared`). The offending `@oneui/shared` line was last touched in commit `6d0f22af` (unrelated to this plan). The Lab's own platform sources + the new docs/stub packages add ZERO new typecheck errors (`pnpm --filter @oneui/platform exec tsc --noEmit` shows no `(experience-lab)` / `_panels` / `experience-builder-{preview,export,core}` errors). Out of scope per executor SCOPE BOUNDARY; owned by `@oneui/shared` maintainers — same pre-existing failure as plans 01-01..03.
- **6 pre-existing `packages/ui/src` literal violations** (Image/Modal) continue to fail `pnpm check:literals` independently of the Lab. The new `_panels/*.module.css` files produce ZERO violations (panel width composed from `calc(var(--Spacing-40) * 2)`). Owned by `@oneui/ui`.
