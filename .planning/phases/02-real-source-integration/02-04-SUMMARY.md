---
phase: 02-real-source-integration
plan: 04
subsystem: api
tags: [convex, schema, persistence, ci-gate, compiled-bundle, append-only, experience-builder]

# Dependency graph
requires:
  - phase: 02-real-source-integration
    plan: 01
    provides: "compile() / RunExperienceResult.bundle (the GEN-06 canonical codegen string)"
  - phase: 02-real-source-integration
    plan: 02
    provides: "REG-04 freshness gate (queryRegistry.freshness.test.ts)"
  - phase: 02-real-source-integration
    plan: 03
    provides: "full assembler-last pipeline producing a compiled bundle on a valid-IR run"
provides:
  - "Additive experienceArtifactVersions.compiledBundle field ({ code, meta? }, v.optional) — durable GEN-06 bundle persistence (D-07, append-only, no migration)"
  - "persistArtifact compiledBundle arg + insert; run-route pass-through of run.bundle for valid-IR runs only"
  - "pnpm ci:gates enforces REG-04 freshness + GEN-06 acceptance via scripts/check-experience-gates.ts (hard-fail on drift/broken compiler)"
affects: [03-sandboxed-preview, 05-production, p3-export]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Additive v.optional Convex field for append-only persistence — existing rows round-trip with no data migration"
    - "Live Convex schema push (npx convex dev --once) BEFORE bundle-persistence verification so generated types regenerate — avoids the stale-type false-positive typecheck (T-02-14)"
    - "tsx CI gate script mirroring check-single-ai-version.ts: runs package test suites via execFileSync, exits non-zero on any failure"

key-files:
  created:
    - scripts/check-experience-gates.ts
  modified:
    - packages/convex/convex/schema.ts
    - packages/convex/convex/experienceRuns.ts
    - apps/platform/src/app/api/experience-lab/run/route.ts
    - package.json

key-decisions:
  - "compiledBundle stored as { code, meta? } even though RunExperienceResult.bundle is a plain codegen string — wrapped as { code: run.bundle } at the route; meta left absent (no compile metadata surfaced by the workflow today), the optional meta field future-proofs P3/P5 without a migration"
  - "Pushed the live Convex schema (npx convex dev --once) before the typecheck verification per the schema note — a typecheck alone passes against stale generated types and would be a false positive (T-02-14)"
  - "Proved the ci:gates hard-fail by temporarily injecting a phantom id into the freshness expected-id derivation (gate exited 1), then reverted via git checkout of that single file"

patterns-established:
  - "Phase-2 enforcement gate: check:experience-gates runs REG-04 freshness + GEN-06 acceptance triad in ci:gates, before typecheck, alongside the intact check:single-ai / smoke:builder gates"

requirements-completed: [GEN-06, REG-04]

# Metrics
duration: 4min
completed: 2026-05-31
---

# Phase 2 Plan 04: Compiled-Bundle Persistence + CI Gate Wiring Summary

**A valid-IR run now persists its GEN-06 canonical compiled bundle additively alongside the IR on `experienceArtifactVersions` (append-only, no migration — D-07), the live Convex schema was pushed before verification so the typecheck is genuine (T-02-14), and `pnpm ci:gates` enforces the REG-04 freshness gate plus the GEN-06 acceptance triad with the single-`ai` invariant intact.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-31T22:52:27Z
- **Completed:** 2026-05-31T22:56:01Z
- **Tasks:** 2
- **Files modified:** 5 (1 created, 4 modified)

## Accomplishments
- Added the additive `compiledBundle: v.optional(v.object({ code: v.string(), meta: v.optional(v.any()) }))` field to `experienceArtifactVersions` — beside `ir`/`validation`. `v.optional` so existing rows round-trip; the IR stays canonical, the bundle is the compiled OUTPUT, never raw markup as a source of truth (T-02-13 mitigated).
- Added a matching `compiledBundle` arg to the `persistArtifact` mutation and included it in the `experienceArtifactVersions` insert (append-only).
- Wired the run route's `persistRun` to pass `run.bundle` through to `persistArtifact` as `{ code: run.bundle }`, only inside the existing `run.outcome === 'artifact' && run.ir` branch — a gap/error run persists no artifact (FND-03).
- Pushed the live Convex schema via `npx convex dev --once` (functions ready, types regenerated) BEFORE the bundle-persistence verification, so the platform typecheck of the new `persistArtifact` arg is genuine and not a stale-type false positive (T-02-14 mitigated).
- Added `scripts/check-experience-gates.ts` (tsx, mirroring `check-single-ai-version.ts`'s shape) that runs the REG-04 freshness test + the GEN-06 compiler acceptance triad and exits non-zero on either failure.
- Added the `check:experience-gates` package.json script and inserted `pnpm check:experience-gates` into the `ci:gates` chain before `typecheck`, alongside the intact `check:single-ai` and `smoke:builder` gates.
- Proved the gate's hard-fail (T-02-15): a temporary phantom-id injection into the freshness expected-id derivation made the gate exit 1; reverted via a targeted `git checkout` of that single file.

## Task Commits

1. **Task 1: Additive compiledBundle field + persistArtifact arg + run-route pass-through, then push the Convex schema** - `5590343d` (feat)
2. **Task 2: Wire the REG-04 freshness gate + GEN-06 acceptance into pnpm ci:gates** - `d395fae2` (chore)

## Files Created/Modified
- `packages/convex/convex/schema.ts` - Additive `compiledBundle` `v.optional(v.object({ code, meta? }))` field on `experienceArtifactVersions` (D-07 persistence).
- `packages/convex/convex/experienceRuns.ts` - `compiledBundle` arg on `persistArtifact` + included it in the artifact-version insert (append-only alongside the IR).
- `apps/platform/src/app/api/experience-lab/run/route.ts` - `persistRun` passes `run.bundle` through as `{ code: run.bundle }` to `persistArtifact`, only for the valid-IR (`outcome === 'artifact' && ir`) branch.
- `scripts/check-experience-gates.ts` - New tsx CI gate running REG-04 freshness + GEN-06 acceptance, exit non-zero on failure (T-02-15 hard-fail).
- `package.json` - `check:experience-gates` script + `ci:gates` chain entry (before `typecheck`, alongside `check:single-ai`/`smoke:builder`).

## Decisions Made
- **`compiledBundle` shape `{ code, meta? }` vs the string `run.bundle`:** the workflow surfaces `RunExperienceResult.bundle` as a plain codegen string (no meta object). The route wraps it as `{ code: run.bundle }`; the schema's optional `meta` field future-proofs P3 sandbox / P5 export metadata without requiring a later migration. The schema spec in the plan was honoured exactly.
- **Live schema push before verification (T-02-14):** ran `npx convex dev --once` so the generated Convex types regenerated with the new field. A `pnpm typecheck` alone would pass against the OLD generated types (a false positive); pushing first makes the platform typecheck of the new `persistArtifact` arg genuine.
- **Hard-fail proof, then revert:** broke the freshness derivation locally (phantom id), confirmed `pnpm check:experience-gates` exited 1, then reverted via `git checkout -- <file>` (the single-file targeted revert, never a blanket reset).

## Deviations from Plan

None — plan executed exactly as written. The `{ code: run.bundle }` wrapping is the intended mapping (the plan's schema spec is `{ code, meta? }` and the workflow exposes the bundle as a string); not a deviation.

## Threat Model Compliance
- **T-02-13** (persisting raw markup as a source of truth): mitigated — `compiledBundle` is the compiled codegen STRING only (`code`), the `ir` field stays canonical structured JSON; the field is additive `v.optional`.
- **T-02-14** (false-positive verification against stale generated types): mitigated — the live Convex schema was pushed (`npx convex dev --once`, functions ready) BEFORE the platform typecheck; the typecheck of the new `persistArtifact` arg is genuine.
- **T-02-15** (registry/compiler drift slipping past CI): mitigated — `check:experience-gates` runs REG-04 + GEN-06 acceptance in `ci:gates`; hard-fail proven by the temporary-break step (exit 1), then reverted.
- **T-02-16** (editing forbidden ExperienceCanvas/(builder)/FoundationStyleProvider): mitigated — `git diff --name-only` across the plan shows no change to those paths; the edited route is the Lab's own file.
- **T-02-17** (npm/pip/cargo installs): accepted — no package installs in this plan.

## Verification Evidence
- `npx convex dev --once` → `Convex functions ready!` (schema validated + types regenerated against the live deployment).
- Platform `tsc --noEmit` → no errors referencing `experience-lab/run`, `compiledBundle`, or `persistArtifact` (genuine post-regeneration typecheck).
- `pnpm check:experience-gates` → REG-04 freshness (5 passed) + GEN-06 compiler acceptance (5 passed), exit 0.
- Hard-fail proof: phantom-id injection → `pnpm check:experience-gates` exit 1; reverted, `grep -c __TEMP_DRIFT_PROOF__` = 0.
- Acceptance greps: `compiledBundle` in schema.ts (1), experienceRuns.ts (3), `bundle` in route.ts (3); `check:experience-gates` in package.json (2); `check:single-ai` (2) + `smoke:builder` (2) intact.
- `git diff --name-only` clean for ExperienceCanvas / (builder) / FoundationStyleProvider.

## User Setup Required
The additive `compiledBundle` field has already been applied to the live Convex deployment (pushed during Task 1 via `npx convex dev --once`). No further action for local dev. Production deployments must run `npx convex deploy` (or the equivalent) so the field reaches the prod deployment before a prod run persists a bundle — the field is additive/optional, so this is non-breaking and requires no data migration.

## Next Phase Readiness
- The GEN-06 compiled bundle is now durable: a valid-IR run persists `{ code }` on `experienceArtifactVersions.compiledBundle`, ready for P3 to sandbox / P5 to export.
- `pnpm ci:gates` now hard-fails on registry drift (REG-04) or a broken compiler (GEN-06 acceptance), making the Phase-2 guarantees enforced rather than conventional.
- Phase 2 (real-source-integration) is complete: FND-04, REG-04, GEN-02/03/04, GEN-05, GEN-06 all delivered and gated.

## Self-Check: PASSED
- `scripts/check-experience-gates.ts` — FOUND
- `packages/convex/convex/schema.ts` compiledBundle — FOUND
- `packages/convex/convex/experienceRuns.ts` compiledBundle — FOUND
- `apps/platform/src/app/api/experience-lab/run/route.ts` compiledBundle pass-through — FOUND
- Commit `5590343d` — FOUND
- Commit `d395fae2` — FOUND

---
*Phase: 02-real-source-integration*
*Completed: 2026-05-31*
