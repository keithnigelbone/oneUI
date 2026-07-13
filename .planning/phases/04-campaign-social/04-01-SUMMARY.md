---
phase: 04-campaign-social
plan: 01
subsystem: api
tags: [foundation-resolver, platforms-foundation, non-web, dimensions, din1450, experience-builder]

# Dependency graph
requires:
  - phase: 02.1-close-fnd-01-fnd-04
    provides: makeConvexFoundationsLoader → resolveStep brand-foundation wiring + FoundationResolveResult contract
  - phase: 01-isolated-foundation
    provides: outputProfileTable (coverage flags), foundationResolve discriminated union, PlatformsFoundationConfig types, dimension-scales DIN-1450 helpers
provides:
  - "Typed non-web profile → brand-foundation platform/breakpoint map (PROFILE_PLATFORM_MAP + getPlatformTargetForProfile)"
  - "Foundation-backed non-web resolution branch in resolveFoundation: real dims on a hit, typed FND-03 gap on a miss"
  - "FoundationResolveResult success arm extended with optional resolvedDimensions (width/height/units/pixelDensity/safeAreaInsetToken)"
  - "mmToPx exported from @oneui/shared for downstream mm→px conversion (plan 04 raster path)"
affects: [campaign-planner, carousel-frames, export-pipeline, raster-export, pdf-export]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Non-web canvas dimensions resolved exclusively from the brand PlatformsFoundationConfig — never invented (D-01/D-02)"
    - "Lab map carries platform/breakpoint ids only, zero literal dimensions; numbers come from the foundation at resolve time"
    - "Safe-area insets are Jio Spacing-N token names, never raw px margins (D-03)"

key-files:
  created:
    - packages/experience-builder-core/src/profiles/profilePlatformMap.ts
    - packages/experience-builder-core/src/profiles/profilePlatformMap.test.ts
  modified:
    - packages/shared/src/data/dimension-scales.ts
    - packages/experience-builder-core/src/contracts/foundationResolve.ts
    - packages/experience-builder-core/src/index.ts
    - packages/experience-builder-agents/src/foundationResolver.ts
    - packages/experience-builder-agents/src/foundationResolver.test.ts

key-decisions:
  - "billboard-landscape is the one non-web profile resolvable against the default Platforms seed (outdoor/outdoor-billboard-large); ig-*/slide-* stay commented out per D-02"
  - "mm-unit canvases keep mm in resolvedDimensions (not pre-converted); pixelDensity is carried so the export path converts via mmToPx downstream"
  - "Default safe-area inset token = Spacing-4 (f0 anchor, multiplier 1.0), asserted present in DIMENSION_TOKEN_MULTIPLIERS"

patterns-established:
  - "Non-web branch runs BEFORE the web-coverage gate in resolveFoundation (non-web is never coverage:'real')"
  - "Map-miss vs breakpoint-absent are distinct honest gaps with distinct reasons; neither carries a dimension number"

requirements-completed: [FND-02, CAMP-05]

# Metrics
duration: 12min
completed: 2026-06-02
---

# Phase 4 Plan 01: Non-web Foundation Resolver Summary

**Foundation-backed non-web resolution: a typed profile→platform map + a resolveFoundation branch that reads the brand's PlatformsFoundationConfig to return real billboard dimensions + a Spacing-N safe-area token on a hit, and the typed FND-03 gap (no numbers) on a miss.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-06-02T18:53Z
- **Completed:** 2026-06-02T19:00Z
- **Tasks:** 2 (both TDD)
- **Files modified:** 7 (2 created, 5 modified)

## Accomplishments
- Exported `mmToPx` from `@oneui/shared` (was non-exported) so the resolver + raster path can convert mm canvases downstream.
- Added `PROFILE_PLATFORM_MAP` + `getPlatformTargetForProfile` — a typed `OutputProfile → { platformId, breakpointId }` map with the single resolvable-today entry (`billboard-landscape → outdoor/outdoor-billboard-large`) and ig/slide entries left commented per D-02. No literal dimensions anywhere in the map.
- Extended the `FoundationResolveResult` success arm (type + Zod schema + constructor) with an optional `resolvedDimensions` field; the gap arm is untouched (no dimension fields by construction).
- Added the non-web resolution branch to `resolveFoundation`: looks the profile's mapped target up in the brand's `PlatformsFoundationConfig`, computes foundation-backed width/height/units/pixelDensity + a `Spacing-N` safe-area token on a hit (via existing `resolveBreakpointBaseSize` / `DIMENSION_TOKEN_MULTIPLIERS`, no hand-rolled DIN-1450), and returns the typed FND-03 gap on a map-miss OR a breakpoint-absent miss.
- Web resolution is unchanged; the branch is deterministic (no model, no randomness).

## Task Commits

Each task was committed atomically (TDD: test → feat):

1. **Task 1 (RED): profile→platform map + mmToPx test** - `ad8a872b` (test)
2. **Task 1 (GREEN): export mmToPx + add typed map** - `3d56cf89` (feat)
3. **Task 2 (RED): non-web branch + resolvedDimensions tests** - `c3121c2b` (test)
4. **Task 2 (GREEN): non-web resolver branch** - `38f2ebad` (feat)

## Files Created/Modified
- `packages/shared/src/data/dimension-scales.ts` - `mmToPx` changed from non-exported to `export function` (signature/body unchanged).
- `packages/experience-builder-core/src/profiles/profilePlatformMap.ts` - new typed map module (ids only, no dimensions).
- `packages/experience-builder-core/src/profiles/profilePlatformMap.test.ts` - hit/undefined/valid-key/mmToPx tests.
- `packages/experience-builder-core/src/contracts/foundationResolve.ts` - `ResolvedDimensions` schema + optional `resolvedDimensions` on success arm + constructor.
- `packages/experience-builder-core/src/index.ts` - barrel export for `profilePlatformMap`.
- `packages/experience-builder-agents/src/foundationResolver.ts` - non-web branch (`isNonWebProfile`, `resolveNonWebDimensions`, `brandPlatforms` input).
- `packages/experience-builder-agents/src/foundationResolver.test.ts` - 3 new behavior cases + outdoor fixtures.

## Decisions Made
- The plan referenced `packages/shared/src/data/platform-config.ts`; the seed actually lives at `packages/shared/src/utils/platform-config.ts`. Verified the outdoor seed there: `outdoor` platform / `outdoor-billboard-large` breakpoint (1920×1080, units px) — used as the verified `breakpointId` rather than guessing.
- `@oneui/shared` re-exports `dimension-scales` via `export *`, so exporting `mmToPx` makes it reachable from the barrel with no extra wiring.
- Removed a re-export of `OutputProfileSchema` from `profilePlatformMap.ts` to avoid an `export *` name collision in the core barrel (it is already exported from `outputProfileTable`).

## Deviations from Plan
None - plan executed exactly as written. (The only adjustment was reading the platform-config seed from its real `utils/` path instead of the `data/` path named in the plan; no behavior change.)

## Issues Encountered
- The worktree shipped without `node_modules`; ran `pnpm install` (offline-preferred, reused cache) before tests could run. No package changes — this plan adds zero installs (T-04-SC).

## Deferred Issues
Pre-existing typecheck errors in files NOT touched by this plan were discovered and logged to `.planning/phases/04-campaign-social/deferred-items.md` (out of scope per the scope boundary):
- `@oneui/shared`: `buildNativeTheme.ts` + `surfaceNew.test.ts` — `stateLayers`/`ResolvedTokenSet` mismatch.
- `@oneui/experience-builder-agents`: `workflow.ts` — Mastra `ExecuteFunction`/`ObservabilityContext` generic mismatches.

All files modified by 04-01 typecheck clean; all touched-package test suites pass (core 61, agents 83).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The campaign branch can now ask "what are this canvas's real dimensions?" and get either foundation-resolved dims or an honest gap — the contract every later slice (planner, carousel, export) builds on.
- `mmToPx` is exported and `pixelDensity` is carried, so plan 04's raster/export path can convert mm canvases at full resolution.
- Only `billboard-landscape` resolves today; lighting up ig-*/slide-* is a foundation-seeding task (D-02), not a code change here.

## TDD Gate Compliance
Both tasks followed RED → GREEN. Gate commits verified in git log: `test(04-01)` precedes `feat(04-01)` for each task. No REFACTOR commits were needed.

## Self-Check: PASSED
- Created files exist: `profilePlatformMap.ts`, `profilePlatformMap.test.ts` — FOUND.
- Commits exist: `ad8a872b`, `3d56cf89`, `c3121c2b`, `38f2ebad` — FOUND.
- All touched-package tests green; all grep gates pass; no literal non-web dimensions in map or resolver.

## Threat Surface Scan
No new security-relevant surface introduced. The non-web branch reads trusted per-brand foundation data already loaded via the Phase 02.1 Convex path and emits only canvas geometry + a token name (T-04-02 accept). No new network endpoints, auth paths, file access, or schema changes. Zero package installs (T-04-SC mitigated). T-04-01 (never fabricate a dimension on a miss) is enforced — grep gate confirms no literal `108x`/`192x` dims in the resolver, and the gap arm carries no dimension field.

---
*Phase: 04-campaign-social*
*Completed: 2026-06-02*
