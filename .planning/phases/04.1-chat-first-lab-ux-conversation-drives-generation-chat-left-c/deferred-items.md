# Deferred Items — Phase 04.1

Out-of-scope discoveries logged during execution (NOT fixed — outside the
current task's change surface per the executor SCOPE BOUNDARY rule).

## Pre-existing typecheck errors (confirmed present with Plan 01 changes stashed)

Discovered during Plan 01 Task 2 `pnpm typecheck`. All are in files NOT touched
by Plan 01; confirmed pre-existing by stashing Plan 01 files and re-running.

| File | Error | Notes |
|------|-------|-------|
| `apps/platform/src/app/api/experience-lab/export/route.ts:262` | `Property 'variantGroupId' does not exist on type 'never'` | Last touched in `3284480c fix(04): compose all ordered carousel frames into PDF export`. |
| `apps/platform/src/design-tools/Foundations/Surfaces/SurfaceNewPreview.tsx` (multiple) | `Property 'stateLayers' does not exist on type 'ResolvedTokenSet'` | design-tools (existing Builder area), not the Lab. |
| `apps/platform/src/design-tools/Foundations/Surfaces/SurfaceValidationTable.tsx:385` | `Property 'step'/'opacity' does not exist on type 'number'` | design-tools. |
| `packages/shared/src/engine/buildNativeTheme.ts:233` | `Property 'stateLayers' does not exist on type 'ResolvedTokenSet'` | shared engine. |

## Pre-existing `check:literals` violations (Plan 05, packages/ui — out of scope)

Discovered during Plan 05 Task 2 `pnpm check:literals`. All 6 are in `packages/ui`
components NOT touched by Plan 05 (confirmed: `git status --short` shows no
modifications). The Lab route (`(experience-lab)`) is literal-clean.

| File | Line | Value | Notes |
|------|------|-------|-------|
| `packages/ui/src/components/Image/Image.stories.tsx` | 431 | `width: 600px` (in a `sizes=` media query) | Responsive `sizes` attr — not a CSS literal. |
| `packages/ui/src/components/Image/Image.test.tsx` | 248, 253 | `width: 600px` (in `sizes=` assertion) | Test assertion text. |
| `packages/ui/src/components/Modal/Modal.module.css` | 100, 124 | `width: 767px` (media query breakpoint) | Mobile breakpoint. |
| `packages/ui/src/components/Modal/Modal.stories.tsx` | 487 | `rgba(0` (in a comment) | Comment text, not a value. |

## Pre-existing lint/config warning

| File | Warning | Notes |
|------|---------|-------|
| `apps/platform/vitest.config.ts:14,16` | Duplicate key `@oneui/ui-internal` in the alias object literal | Harmless (same target path), but emits a build warning on every vitest run. |
