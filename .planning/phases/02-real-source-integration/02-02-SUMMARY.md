---
phase: 02-real-source-integration
plan: 02
subsystem: testing
tags: [registry, freshness-gate, vitest, derive-dont-copy, ci-gate, metadata-drift]

# Dependency graph
requires:
  - phase: 01-isolated-foundation
    provides: "queryRegistry derive-don't-copy adapter + exported KNOWN_DRIFT_EXCLUSIONS; @oneui/ui/registry/jioAlphaCatalog + @oneui/shared/meta/generated/* metadata source of truth"
provides:
  - "REG-04 derive-equals-live registry freshness gate (queryRegistry.freshness.test.ts) — independently re-derives the expected registry from live catalog x generated meta and hard-fails on ANY id or per-item metadata divergence (D-10)"
affects: [02-04-ci-orchestration, registry, generation-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Independent re-derivation gate: re-implement the adapter's derivation in the test (separate GENERATED_PROPS map + liveProps/liveVariants/liveSlots) so a bug in queryRegistry cannot mask drift"
    - "Single-source-of-truth exclusions: import KNOWN_DRIFT_EXCLUSIONS, never re-hardcode ['Modal','Text']"

key-files:
  created:
    - packages/experience-builder-registry/src/queryRegistry.freshness.test.ts
  modified: []

key-decisions:
  - "Re-derive props/variants/slots independently from imported *_GENERATED_PROPS (mirroring deriveProps/deriveVariants/deriveSlots semantics) rather than calling queryRegistry's own helpers, so a regression in the adapter cannot hide a divergence"
  - "Drift-exclusion sanity check enforces the converse invariant (excluded ids must NEVER be generatable) instead of requiring catalog membership — Modal/Text are a forward guard and are not present in the live catalog today"

patterns-established:
  - "REG-04 freshness gate: toEqual deep-equality on sorted ids + per-item props/variants/slots; pure, deterministic, credential-free; wired into pnpm ci:gates in Plan 04"

requirements-completed: [REG-04]

# Metrics
duration: 9min
completed: 2026-05-31
---

# Phase 2 Plan 02: Registry Freshness Gate Summary

**REG-04 derive-equals-live CI freshness gate that independently re-derives the Lab registry from the live Jio catalog x generated metadata and hard-fails on any added/removed/changed component id or per-item props/variants/slots divergence (D-10).**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-05-31T23:28:00Z
- **Completed:** 2026-05-31T23:30:10Z
- **Tasks:** 1
- **Files modified:** 1 created

## Accomplishments
- Added `queryRegistry.freshness.test.ts` — a pure, deterministic, credential-free Vitest gate (5 tests, all green) that closes the registry/metadata drift surface flagged in `.planning/codebase/CONCERNS.md`.
- The gate independently re-derives the EXPECTED registry from `JIO_WEB_ALPHA_COMPONENTS` x the `*_GENERATED_PROPS` meta (re-implemented derivation in the test), so a bug inside `queryRegistry`'s own join cannot mask a divergence.
- Hard-fails (`toEqual` deep-equality) on ANY added/removed/changed component id AND on ANY per-item props/variants/slots metadata divergence.
- Reads `KNOWN_DRIFT_EXCLUSIONS` from the exported constant (single source of truth) — `['Modal','Text']` is never re-hardcoded in the test.

## Task Commits

1. **Task 1: REG-04 derive-equals-live registry freshness gate (D-10)** - `6de263f1` (test)

## Files Created/Modified
- `packages/experience-builder-registry/src/queryRegistry.freshness.test.ts` - The REG-04 freshness gate. Imports the same `*_GENERATED_PROPS` arrays and `JIO_WEB_ALPHA_COMPONENTS` the adapter uses, re-derives props/variants/slots independently, and asserts `queryRegistry()` deep-equals the live-derived expectation on ids and per-item metadata.

## Decisions Made
- **Independent re-derivation over trusting the adapter:** the test re-implements `deriveProps`/`deriveVariants`/`deriveSlots` semantics and re-declares the catalog-name -> generated-meta map locally, satisfying the plan's "a bug in queryRegistry cannot mask a divergence" requirement.
- **Drift-exclusion invariant adjusted to match real design:** an initial sanity assertion required `Modal`/`Text` to be present in the live catalog; they are not (the exclusions are a defensive forward guard). The assertion now enforces the meaningful invariant — excluded ids must never appear in the generatable registry — plus a dedicated leak test.

## Deviations from Plan

None - plan executed exactly as written. (The drift-exclusion assertion adjustment described above was a within-task correction of my own first draft, not a deviation from the plan's specified action; the four plan-mandated assertions — id deep-equality, per-item metadata deep-equality, imported exclusions, credential-free — were authored as specified.)

## Issues Encountered
- **Self-introduced over-strict sanity assertion:** my first draft asserted `KNOWN_DRIFT_EXCLUSIONS` members exist in the live catalog. They don't (Modal/Text are a forward guard, absent today). Fixed by asserting the converse — excluded ids are never generatable. Resolved before commit; all 5 tests green.
- **Two self-introduced TypeScript errors** (readonly-array cast + literal-union `Set.has`) fixed by widening to `readonly JioAlphaComponentCatalogEntry[]` and typing the sets as `Set<string>`. The freshness test now typechecks clean.

### Out-of-scope (not fixed)
- A PRE-EXISTING typecheck error in `packages/shared/src/engine/buildNativeTheme.ts:233` (`Property 'stateLayers' does not exist on type 'ResolvedTokenSet'`) surfaces when typechecking the registry package via project references. The file is untouched by this plan and the error was already logged in `deferred-items.md` (Plan 02-01). Out of scope per the Scope Boundary.

## User Setup Required
None - no external service configuration required. The gate makes no network call and requires no `ANTHROPIC_API_KEY`.

## Next Phase Readiness
- The REG-04 gate is ready to be wired into `pnpm ci:gates` in Plan 04 (CI orchestration), per the plan's verification note.
- The Lab registry is now provably in sync with the live component-metadata source of truth; any future drift hard-fails this test.

## Self-Check: PASSED
- `packages/experience-builder-registry/src/queryRegistry.freshness.test.ts` — FOUND
- Commit `6de263f1` — FOUND
- `pnpm test freshness` — 5 passed

---
*Phase: 02-real-source-integration*
*Completed: 2026-05-31*
