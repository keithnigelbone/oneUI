---
phase: 03-preview-eval-repair
plan: 03
subsystem: convex-persistence
tags: [convex, schema, persistence, versioning, variant-group, append-only]
requires:
  - "experienceArtifacts / experienceArtifactVersions tables (Phase 1 — D-08)"
  - "compiledBundle additive v.optional pattern (the no-migration precedent)"
provides:
  - "experienceArtifacts.variantGroupId + by_variant_group index (CANVAS-05 / D-12)"
  - "experienceArtifactVersions D-13 version object: previewState, thumbnail (_storage), evaluation, originRunId (VER-01)"
  - "persistArtifact extended with variantGroupId + D-13 fields (append-only)"
  - "listVariantGroup query — sibling artifacts by variantGroupId (CANVAS-05)"
  - "getArtifactHistory unchanged (VER-02 version-chain read)"
  - "convex-test harness + vitest edge-runtime config for @oneui/convex"
affects:
  - "Plan 03-04 (version-freeze step writes the D-13 object via persistArtifact)"
  - "Plan 03-06 (timeline + variant-frame UI reads getArtifactHistory + listVariantGroup)"
tech-stack:
  added:
    - "convex-test ^0.0.53 (official Convex testing harness, devDep)"
    - "@edge-runtime/vm ^5.0.0 (edge-runtime VM for convex-test, devDep)"
    - "vitest ^4.1.5 (devDep, pinned to repo version)"
  patterns:
    - "Append-only Convex persistence — all new fields v.optional, existing rows round-trip, no migration"
    - "withIndex scan query (listVariantGroup mirrors listRunsByBrand)"
    - "convex-test t.run seed + t.mutation/t.query round-trip"
key-files:
  created:
    - "packages/convex/convex/experienceRuns.test.ts"
    - "packages/convex/vitest.config.ts"
    - "packages/convex/tsconfig.json"
  modified:
    - "packages/convex/convex/schema.ts"
    - "packages/convex/convex/experienceRuns.ts"
    - "packages/convex/package.json"
    - "pnpm-lock.yaml"
decisions:
  - "Live schema push (npx convex dev --once) deferred to orchestrator/CI — no deployment credentials in the isolated worktree, and pushing from a parallel worktree would mutate the shared dev deployment mid-wave. Additive-safety is proven structurally (all v.optional) + by the no-migration round-trip test instead."
  - "Added a package-level typecheck script (tsc -p .) + tsconfig to @oneui/convex (the plan's verify command referenced a typecheck script that did not exist)."
metrics:
  duration: "~11 min"
  completed: "2026-06-01"
  tasks: 3
  commits: 3
---

# Phase 3 Plan 03: Convex Version Persistence + Variant Grouping Summary

Extended the append-only Convex persistence so a fully-evaluated artifact version (the D-13 object: `previewState`, `thumbnail`, `evaluation`, `originRunId`) is durable and browsable (VER-01/VER-02), and best-of-N siblings cluster into a variant group via an additive `variantGroupId` + `by_variant_group` index with a new `listVariantGroup` query (CANVAS-05) — every change additive `v.optional`, zero migration, proven by a convex-test round-trip suite.

## What Was Built

- **Task 1 — Additive schema (`3c788a6f`):** On `experienceArtifacts`, added `variantGroupId: v.optional(v.string())` (D-12 — NO new variant table) and the `by_variant_group` index. On `experienceArtifactVersions`, added the D-13 version object: `previewState: v.optional(v.any())`, `thumbnail: v.optional(v.id('_storage'))`, `evaluation: v.optional(v.any())`, `originRunId: v.optional(v.id('experienceRuns'))`. All additive `v.optional`, mirroring the existing `compiledBundle` no-migration pattern; `parentVersionId` + `by_artifact` untouched.
- **Task 2 — persistArtifact + listVariantGroup (`038fdeab`):** Threaded `variantGroupId` into the `experienceArtifacts` insert and the four D-13 fields into the `experienceArtifactVersions` insert, preserving the 3-step pattern (identity → version → wire current-version pointer) and the append-only invariant (no `.delete`, no destructive patch on existing versions). Added a `listVariantGroup({ variantGroupId })` query scanning via `by_variant_group` (mirroring `listRunsByBrand`'s `withIndex`). `getArtifactHistory` unchanged.
- **Task 3 — Tests + harness (`d58f1314`):** Created `experienceRuns.test.ts` (convex-test): full D-13 persist + `getArtifactHistory` read-back (VER-01/VER-02), a no-new-fields round-trip (append-only safety), and a two-sibling `listVariantGroup` group read with a negative control (CANVAS-05). Added the `convex-test` + `@edge-runtime/vm` + `vitest` devDeps, `vitest.config.ts` (`environment: 'edge-runtime'`), a package `tsconfig.json`, and a `typecheck` script.

## Verification

- `pnpm --filter @oneui/convex test` — **4/4 passing** (3 new + 1 pre-existing tokenGenerators). `test -t variantGroup` also green.
- Convex functions + the new test file typecheck **clean** (`tsc -p .`). The only remaining `tsc` error is a pre-existing `@oneui/shared/buildNativeTheme.ts` `stateLayers` type error, transitively pulled in via the pre-existing `tokenGenerators.test.ts` import — out of scope (see Deferred Issues).
- Acceptance greps all pass: `variantGroupId`/`by_variant_group` present in both files, all three D-13 fields under `experienceArtifactVersions`, `.delete(` count = 0 (append-only), every new field `v.optional`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Missing `typecheck` script + tsconfig for `@oneui/convex`**
- **Found during:** Task 1 verification.
- **Issue:** The plan's verify command `pnpm --filter @oneui/convex typecheck` referenced a script that did not exist; the package had no tsconfig either.
- **Fix:** Added a `typecheck` script (`tsc --noEmit -p .`) and a package `tsconfig.json` extending the root config with `types: ['node', 'vite/client']` (node for convex's `process` usage, vite/client for `import.meta.glob`).
- **Files:** `packages/convex/package.json`, `packages/convex/tsconfig.json`. **Commit:** `d58f1314`.

**2. [Rule 3 — Blocking] Test harness + vitest config absent**
- **Found during:** Task 3.
- **Issue:** `convex-test`, `@edge-runtime/vm`, and `vitest` were not dependencies of `@oneui/convex`, and the package had no vitest config; the worktree had no `node_modules`. The official Convex testing guidelines mandate `convex-test` + `@edge-runtime/vm` + `environment: 'edge-runtime'`.
- **Fix:** Verified both packages are legitimate official packages on npm (`convex-test@0.0.53`, `@edge-runtime/vm@5.0.0`) — named in the project's own `convex/_generated/ai/guidelines.md`, peer `convex ^1.32.0` (compatible with installed 1.39.1). Added them as devDeps, created `vitest.config.ts`, ran `pnpm install` (full workspace setup, not a name-substitution). Tests pass.
- **Files:** `packages/convex/package.json`, `packages/convex/vitest.config.ts`, `pnpm-lock.yaml`. **Commit:** `d58f1314`.
- Note: package legitimacy was confirmed against the project's own guidelines and `npm view` before adding — not a hallucinated/substituted name.

### Decision (no checkpoint — credential/isolation constraint)

**Live schema push deferred to orchestrator/CI.** Task 3 acceptance lists `npx convex dev --once`. The isolated worktree has no `CONVEX_DEPLOYMENT` credentials (the `.env.local` files live only in the main checkout), and `convex codegen` likewise requires a deployment. Pushing from a parallel-execution worktree would also mutate the shared dev deployment mid-wave (isolation violation). The substantive guarantee of that step — "applies the additive schema without a destructive-migration prompt" — is fully established by: all new fields being `v.optional` (grep-verified), the passing no-migration round-trip test (persist without new fields → read back clean), and convex-test successfully loading and operating against `schema.ts`. The live push belongs to the credentialed orchestrator/CI after merge.

## Deferred Issues

- **Pre-existing `@oneui/shared` typecheck error** (`packages/shared/src/engine/buildNativeTheme.ts:233` — `TS2339 stateLayers`). `@oneui/shared` fails its own `tsc` on this independently (also in its `engineDrift`/`surfaceNew` tests). Surfaced here only because the convex `tsc -p .` transitively follows the `@oneui/shared` import in the pre-existing `tokenGenerators.test.ts`. Out of scope (different package, unrelated to this slice). Logged in `.planning/phases/03-preview-eval-repair/deferred-items.md`.

## Known Stubs

None. `previewState` / `evaluation` are intentionally `v.any()` structured-JSON containers (per D-13) populated by downstream plans 03-04 (version-freeze) and 03-06 (UI); the persistence contract for them is complete and tested here.

## Self-Check: PASSED

- Files exist: `schema.ts` ✓, `experienceRuns.ts` ✓, `experienceRuns.test.ts` ✓, `vitest.config.ts` ✓, `tsconfig.json` ✓, `package.json` ✓.
- Commits exist: `3c788a6f` ✓, `038fdeab` ✓, `d58f1314` ✓.
- Tests: 4/4 pass. Convex + test files typecheck clean.
