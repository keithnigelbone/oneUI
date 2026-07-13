---
phase: 03-preview-eval-repair
plan: 02
subsystem: preview
tags: [preview, playwright, token-handoff, separate-origin, csp, lifecycle, seam, vitest]

# Dependency graph
requires:
  - phase: 02-real-integration
    provides: "Compiled React + Jio CSS bundle on experienceArtifactVersions.compiledBundle (GEN-06) — the bundle the executor renders"
  - phase: 01-isolated-foundation
    provides: "PREVIEW-DECISION.md separate-origin/CSP/token-handoff authority; modelAdapter.ts seam idiom; playwrightRenderer.ts capture harness"
provides:
  - "Vendor-free PreviewExecutor seam (D-02): PreviewProfile/RenderInput/RenderResult/render + getPreviewExecutor/setPreviewExecutor test override"
  - "IframeCspExecutor MVP de-risk path: randomUUID 60s-TTL single-use token-handoff + per-profile credential-free Playwright capture"
  - "PREV-03 lifecycle state machine (thumbnail->lightweight->live) + desktop/mobile/fixed profile framing"
  - "Credential-free test suite proving seam injection/restore, previewState immutability, and lifecycle transitions"
affects: [03-04-eval-repair-loop, 03-05-daytona-executor, 03-06-canvas-preview-ux]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dependency-injection-for-tests seam (module-level swappable impl + setX/getX returning restore fn) — mirrors modelAdapter.ts"
    - "Separate-origin token-handoff: in-memory randomUUID Map + TTL, server-side consume, opaque ?t=<uuid> URL"
    - "Vendor isolation via dynamic import('playwright') so the seam + edge builds stay vendor-free"

key-files:
  created:
    - packages/experience-builder-preview/src/PreviewExecutor.ts
    - packages/experience-builder-preview/src/IframeCspExecutor.ts
    - packages/experience-builder-preview/src/lifecycle.ts
    - packages/experience-builder-preview/src/index.ts
    - packages/experience-builder-preview/src/PreviewExecutor.test.ts
    - packages/experience-builder-preview/vitest.config.ts
    - packages/experience-builder-preview/tsconfig.json
  modified:
    - packages/experience-builder-preview/package.json

key-decisions:
  - "PreviewExecutor seam imports ZERO modules — vendor names appear only in doc comments, so the CI import-guard stays clean and the workflow can depend on the seam credential-free"
  - "Playwright is loaded via dynamic import('playwright') inside IframeCspExecutor.capture() only; never a static/top-level import, keeping edge/build environments alive"
  - "Token-handoff uses a single-use token (deleted in render()'s finally) on top of the 60s TTL — tighter than playwrightRenderer.ts which only relies on TTL"
  - "previewState carries only an opaque ?t=<uuid> URL + expiresAt (PREV-02); nothing sensitive ever reaches the preview URL or JS context (PREV-01)"
  - "fixed profile framing set to 1080x1080 (square artboard for social/outdoor); desktop 1440x900 + mobile 390x844 mirror playwrightRenderer.ts DEFAULT_VIEWPORTS"

patterns-established:
  - "Preview seam (D-02): the workflow depends only on the PreviewExecutor interface; IframeCspExecutor now / DaytonaExecutor (Plan 05) drop in via setPreviewExecutor"
  - "Default unconfigured executor rejects with a descriptive error until an impl is injected — fail-loud rather than silent no-op"

requirements-completed: [PREV-01, PREV-02, PREV-03, PREV-04, CANVAS-06]

# Metrics
duration: 18min
completed: 2026-06-01
---

# Phase 03 Plan 02: Preview Executor Seam + IframeCsp MVP Path Summary

**Vendor-free PreviewExecutor seam (D-02) plus an IframeCspExecutor that renders a compiled bundle on a separate, credential-free origin via single-use randomUUID token-handoff and screenshots it per desktop/mobile/fixed profile with dynamic-imported Playwright, fronted by a thumbnail->lightweight->live lifecycle state machine and a green credential-free test suite.**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-06-01T18:55:00Z (approx)
- **Completed:** 2026-06-01T19:17:00Z (approx)
- **Tasks:** 3
- **Files modified:** 8 (7 created, 1 modified)

## Accomplishments
- Net-new `@oneui/experience-builder-preview` package builds, typechecks, and tests green — mirroring the `@oneui/experience-builder-validation` sibling (tsup-free `tsc` typecheck, vitest, `index.ts` barrel).
- `PreviewExecutor.ts` defines the D-02 seam verbatim from RESEARCH Pattern 1 with a `setPreviewExecutor`/`getPreviewExecutor` DI-for-tests override copied from `modelAdapter.ts`. The file contains NO import statements at all — vendor names live only in prose — so the seam is provably vendor-free for the CI import-guard.
- `IframeCspExecutor.ts` reuses the verified `playwrightRenderer.ts` token-handoff + capture harness behind the seam: `publishBundleForRender`/`consumeBundleForRender` over a `randomUUID()` 60s-TTL single-use cache, an opaque `?t=<token>` separate-origin URL, and per-profile credential-free capture (`deviceScaleFactor: 2`, `networkidle`, double-rAF transition-suppression + `document.fonts.ready` brand-CSS settle) via dynamic `import('playwright')`.
- `lifecycle.ts` is a pure, dependency-free PREV-03 state machine (`nextLifecycleState`, `isLiveState`, `framingForProfile`, `DEFAULT_PROFILES`).
- `PreviewExecutor.test.ts` proves PREV-01 (seam injection + restore, credential-free — no env vars, no browser), PREV-02 (previewState immutability + per-version reproducibility), and PREV-03 (lifecycle transitions + per-profile framing). 8/8 tests pass.

## Task Commits

1. **Task 1: Scaffold package config + PreviewExecutor seam (PREV-01/02)** - `bd8896ea` (feat)
2. **Task 2: IframeCspExecutor token-handoff capture + lifecycle state machine (PREV-03/04, CANVAS-06)** - `becb7820` (feat)
3. **Task 3: Credential-free seam + previewState + lifecycle tests (PREV-01/02/03)** - `dd66a945` (test)

## Files Created/Modified
- `packages/experience-builder-preview/src/PreviewExecutor.ts` - The D-02 seam: PreviewProfile/RenderInput/RenderResult/PreviewExecutor + getPreviewExecutor/setPreviewExecutor (vendor-free; zero imports).
- `packages/experience-builder-preview/src/IframeCspExecutor.ts` - MVP executor: single-use randomUUID 60s-TTL token-handoff + per-profile credential-free Playwright capture via dynamic import.
- `packages/experience-builder-preview/src/lifecycle.ts` - PREV-03 thumbnail->lightweight->live state machine + desktop/mobile/fixed framing.
- `packages/experience-builder-preview/src/index.ts` - Barrel mirroring the validation package; re-exports the seam, executor, and lifecycle.
- `packages/experience-builder-preview/src/PreviewExecutor.test.ts` - Credential-free Wave-0 gap-closure suite (8 tests).
- `packages/experience-builder-preview/vitest.config.ts` - Node-env vitest config mirroring the validation sibling.
- `packages/experience-builder-preview/tsconfig.json` - Extends root, noEmit, src include.
- `packages/experience-builder-preview/package.json` - Added main/types/exports, test scripts, devDeps (@types/node, playwright, vitest); upgraded the P1 stub description.

## Decisions Made
- Seam contains zero import statements (vendor names only in comments) so the import-guard is satisfied without needing a regex carve-out.
- Single-use token (deleted in `render()`'s `finally`) layered on the 60s TTL — strictly tighter than the analog's TTL-only model.
- `previewState` is keyed reproducibly per version in the test mock to demonstrate PREV-02 immutability without depending on a live executor.
- A default unconfigured executor rejects with a descriptive error (fail-loud) rather than silently returning an empty result.

## Deviations from Plan

None - plan executed exactly as written. The Task 2 `<verify>` block named `pnpm ... test`, but its tests are authored in Task 3 (the plan's own dependency order); Task 2 was gated on `typecheck` + its acceptance-criteria greps, and the full `test` gate ran green after Task 3. No code or scope changed as a result.

## Issues Encountered
None. `pnpm install --filter` resolved the new devDeps (`@types/node`, `playwright`, `vitest`) entirely from the existing workspace lockfile — `downloaded 0` — confirming the threat-register `T-3-02-SC: accept` holds (no new package introduced; the Daytona supply-chain gate remains Plan 05).

## Threat Model Coverage
- **T-3-02-EXFIL / T-3-02-TOKEN (Information Disclosure):** token-handoff uses a single-use opaque `randomUUID()` with 60s TTL, server-side `consumeBundleForRender` only, and an opaque `?t=<uuid>` URL on a configurable separate `previewOrigin` (never the Lab origin). The sandbox/CSP headers themselves live on the P3 render route per PREVIEW-DECISION.md.
- **T-3-02-CRED (Information Disclosure):** Playwright contexts are credential-free; no auth/Convex context is passed to the preview origin. Tests assert `process.env.DAYTONA_API_KEY` is undefined while the suite runs.
- **T-3-02-SC (Tampering):** no new package installed (accept disposition holds).

## User Setup Required
None - no external service configuration required. (`PREVIEW_ORIGIN` env is optional; defaults to a localhost dev origin. A dedicated separate preview-origin deployment + CSP headers are the P3 render-route's concern.)

## Next Phase Readiness
- The eval/repair loop (Plan 04) can inject a mock executor via `setPreviewExecutor` and assert on `screenshots`/`previewState`/`rendered` with no Daytona key or live browser.
- The Daytona production executor (Plan 05) drops in behind the identical seam.
- The canvas preview UX (Plan 06) can drive the `lifecycle.ts` state machine and read the immutable `previewState.url` from a rendered version.
- Concern: the separate preview-origin render route + CSP headers + iframe host component are NOT built in this plan (explicitly P3 render-route scope per PREVIEW-DECISION.md); IframeCspExecutor assumes such a route exists at `previewOrigin + renderPath`.

## Self-Check: PASSED
- All 8 created/modified files verified present on disk.
- All 3 task commits (`bd8896ea`, `becb7820`, `dd66a945`) verified in git log.
- Seam confirmed vendor-free (zero import statements; vendor names only in prose).
- `pnpm --filter @oneui/experience-builder-preview test` 8/8 green credential-free; `typecheck` zero errors.

---
*Phase: 03-preview-eval-repair*
*Completed: 2026-06-01*
