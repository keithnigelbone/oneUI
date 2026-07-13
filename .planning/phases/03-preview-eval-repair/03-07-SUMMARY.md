---
phase: 03-preview-eval-repair
plan: 07
subsystem: preview
tags: [experience-lab, preview, ast-renderer, render-ast, finalizeRun, gap-closure, mastra-workflow]

# Dependency graph
requires:
  - phase: 03-preview-eval-repair (plan 06)
    provides: artifact-card live-iframe lifecycle + run-route VER-01 persistence (PreviewRegion reads previewState.url)
  - phase: 03-preview-eval-repair (plan 02)
    provides: PreviewExecutor seam (RenderInput/RenderResult/PreviewState) + previewStep
provides:
  - "LabAstExecutor: concrete PreviewExecutor that publishes the compiled AST to the /internal/render-ast token cache and returns a live previewState.url (no Playwright/Daytona)"
  - "RenderInput.ast?: unknown — additive optional field so previewStep can hand the already-derived ASTRoot to AST-rendering executors"
  - "Run route injects LabAstExecutor on every runExperienceWorkflow call — preview: started is now always followed by preview: completed (no _unconfiguredExecutor fallback)"
  - "finalizeRun guard: error->artifact promotion requires BOTH ir AND previewState.url, so a run with valid IR but failed/empty preview surfaces as 'gap' instead of a blank artifact card"
affects: [experience-lab, preview, canvas, eval-repair]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AST-handoff preview: previewStep recomputes irToArtifactAst(ctx.ir) (pure, cheap) onto RenderInput.ast; LabAstExecutor publishes it via publishASTForRender and returns /internal/render-ast?token=<uuid>"
    - "Reuse the proven verify-loop render route (/internal/render-ast) for the live canvas iframe — one render surface, no new route, no headless browser at run time"
    - "Outcome-promotion guard requires a live preview URL — prevents a failed preview from being disguised as a successful artifact (T-3-07-PROMO)"

key-files:
  created:
    - "apps/platform/src/app/api/experience-lab/lab-ast-executor.ts"
  modified:
    - "packages/experience-builder-preview/src/PreviewExecutor.ts"
    - "packages/experience-builder-agents/src/workflow.ts"
    - "apps/platform/src/app/api/experience-lab/run/route.ts"

key-decisions:
  - "Reuse /internal/render-ast (the Playwright verify-loop render target) for the live canvas iframe instead of building a new render route — same ASTRenderer inside the real brand CSS cascade, opaque-token handoff via publishASTForRender (60s TTL)."
  - "RenderInput gains ast?: unknown (additive, optional) rather than re-deriving the AST from the bundle string inside each executor — keeps the frozen seam contract intact (IframeCspExecutor and test mocks ignore the new field)."
  - "previewStep recomputes irToArtifactAst(ctx.ir) at preview time (pure function, same IR already validated) rather than threading the validate-step AST through ctx — keeps previewStep self-contained and avoids a ctx schema change."
  - "finalizeRun only promotes error->artifact when previewState.url is present; a valid-IR-but-no-preview run is now honestly a 'gap', matching the canvas expectation (IR tree with a live iframe, never IR tree alone)."

patterns-established:
  - "Concrete PreviewExecutor injected per-run on RunExperienceInput.previewExecutor (mirrors the foundationsLoader conditional-spread), keeping the agents package vendor-free."

requirements-completed: [CANVAS-06, PREV-02]

# Metrics
duration: 12min
completed: 2026-06-01
---

# Phase 3 Plan 07: Live Preview Gap Closure Summary

**The artifact card live-iframe gap is closed: the run route now injects a LabAstExecutor that publishes the compiled AST to the existing /internal/render-ast token cache and returns a non-empty previewState.url, while finalizeRun no longer silently promotes a previewless run to 'artifact' — so a successful generation produces a live iframe inside the real brand CSS cascade, and a failed preview honestly surfaces as a gap.**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-06-01
- **Tasks:** 2
- **Files modified/created:** 4 source files (1 created, 3 modified)

## Accomplishments

- **PREV-02 / RenderInput.ast:** Added an optional `ast?: unknown` field to `RenderInput` (additive, non-breaking — `IframeCspExecutor` and test mocks ignore it). `previewStep` now passes `ast: irToArtifactAst(ctx.ir)` in the `executor.render(...)` call so AST-rendering executors get the already-derived ASTRoot without re-parsing the bundle.
- **finalizeRun promotion fix (T-3-07-PROMO):** The unconditional `error → (ir ? artifact : gap)` promotion is replaced with `ctx.outcome = ctx.ir && ctx.previewState?.url ? 'artifact' : 'gap'`. A run that produced valid IR but failed/empty preview is now a `'gap'`, never a blank artifact card.
- **CANVAS-06 / LabAstExecutor:** New `apps/platform/src/app/api/experience-lab/lab-ast-executor.ts` implements `PreviewExecutor`. `render(input)` no-ops safely when `input.ast` is falsy, otherwise calls `publishASTForRender(input.ast)` and returns `previewState.url = /internal/render-ast?token=<uuid>` with a 60s `expiresAt`. No Playwright, no HTTP, no new dependency.
- **Run-route wiring:** The `POST` handler constructs `const previewExecutor = new LabAstExecutor()` and injects it onto every `runExperienceWorkflow` call (preserving the existing `foundationsLoader` conditional-spread). `preview: started` is now always followed by `preview: completed` — the `_unconfiguredExecutor` stub can no longer be hit.

## Task Commits

1. **Task 1: Extend RenderInput with ast + previewStep AST injection + finalizeRun guard** - `353b8296` (feat)
2. **Task 2: LabAstExecutor + run route wiring** - `36f08262` (feat)

## Files Created/Modified

- `packages/experience-builder-preview/src/PreviewExecutor.ts` — added optional `ast?: unknown` on `RenderInput`
- `packages/experience-builder-agents/src/workflow.ts` — previewStep passes `ast: irToArtifactAst(ctx.ir)`; finalizeRun promotion guarded by `previewState?.url`
- `apps/platform/src/app/api/experience-lab/lab-ast-executor.ts` (new) — `LabAstExecutor` implementing `PreviewExecutor` via `publishASTForRender`
- `apps/platform/src/app/api/experience-lab/run/route.ts` — import + inject `new LabAstExecutor()` on every workflow run

## Decisions Made

See `key-decisions` frontmatter. Notable: reuse the existing `/internal/render-ast` route (the Playwright verify-loop render target) for the live canvas iframe rather than a new route; keep the seam contract frozen by making `ast` additive/optional; promote to `'artifact'` only when a live preview URL exists.

## Deviations from Plan

None — plan executed exactly as written. The three Task-1 edits and the two Task-2 changes match the plan's action steps verbatim (RenderInput field text, previewStep `ast:` injection, finalizeRun guard expression, LabAstExecutor shape, and the route's conditional-spread injection).

## Verification

- `pnpm --filter @oneui/experience-builder-preview typecheck` → **zero errors** (RenderInput extended, clean).
- `pnpm --filter @oneui/experience-builder-agents typecheck` → only **pre-existing out-of-scope** errors (Mastra `Step<...>` `execute` typing at lines 743/746/865/871/872/892/918/939; the `TS2367` at line 764; `buildNativeTheme.ts` `stateLayers`). Confirmed against the `HEAD~1` baseline — `tsc` on the pre-edit `workflow.ts` produces the identical `764` `TS2367`, so it is not introduced here. Zero errors on the edited lines (497-510, 750-758).
- `pnpm --filter @oneui/platform typecheck` → zero errors in `lab-ast-executor.ts` and `run/route.ts`; remaining errors are pre-existing out-of-scope (`SurfaceNewPreview.tsx`, `SurfaceValidationTable.tsx`, shared `buildNativeTheme.ts`, agents `workflow.ts`), matching the prior plan's documented baseline.
- Plan verification greps all pass:
  - `ast?: unknown` present in `PreviewExecutor.ts` (line 42)
  - `ast: irToArtifactAst(ctx.ir)` present in `workflow.ts` previewStep (line 503)
  - `previewState?.url` present in `workflow.ts` finalizeRun (line 758)
  - `LabAstExecutor` / `publishASTForRender` present in `lab-ast-executor.ts`
  - `previewExecutor` / `LabAstExecutor` present in `run/route.ts`

## Pre-existing Out-of-Scope Errors (not touched — SCOPE BOUNDARY)

These typecheck errors exist on the baseline and are unrelated to this plan's two tasks; per the executor scope boundary they were NOT fixed:

- `packages/shared/src/engine/buildNativeTheme.ts(233)` — `ResolvedTokenSet.stateLayers`
- `apps/platform/src/design-tools/Foundations/Surfaces/SurfaceNewPreview.tsx`, `SurfaceValidationTable.tsx` — `stateLayers` / `step`/`opacity`
- `packages/experience-builder-agents/src/workflow.ts` — Mastra `Step<...>` `execute` typing + `TS2367` at line 764 (pre-existing narrowing artifact, confirmed against `HEAD~1`)

## Known Stubs

None introduced. The AST path is fully wired end-to-end (previewStep → `RenderInput.ast` → `LabAstExecutor.publishASTForRender` → `/internal/render-ast?token=<uuid>` → `ArtifactCardShape` PreviewRegion live iframe). `LabAstExecutor` returns `screenshots: []` by design — screenshot capture for this executor is intentionally out of scope (the AST path is screenshot-free; the Playwright/Daytona path owns screenshots). The VER-01 thumbnail upload in the run route is screenshot-driven, so AST-only runs persist without a thumbnail; this is the documented behavior, not a stub blocking the plan goal.

## Threat Flags

None — no new trust boundary beyond the plan's threat model:
- **T-3-07-TOKEN (mitigated):** `previewState.url` carries only a UUID token (no PII, no credentials); the AST is server-derived from the IR; 60s TTL; `/internal/render-ast` retains its existing security gating (localhost-only dev, `x-internal-render` header in prod) — not modified here.
- **T-3-07-PROMO (mitigated):** finalizeRun now requires `previewState.url` to promote error→artifact, preventing a failed/missing preview from being disguised as a successful artifact.
- **T-3-07-SC (accept):** No new packages installed — `LabAstExecutor` uses only the already-installed `@oneui/experience-builder-preview` interface + in-repo `@/lib/playwrightRenderer`.

## Next Phase Readiness

The full quality loop is now user-observable end-to-end on the canvas: a successful run yields a live `/internal/render-ast?token=...` iframe inside the real brand CSS cascade, and a previewless run honestly surfaces as a gap. Ready to proceed to Phase 4 (campaign / social).

---
*Phase: 03-preview-eval-repair*
*Completed: 2026-06-01*

## Self-Check: PASSED
- All created/modified files verified present: `lab-ast-executor.ts`, `PreviewExecutor.ts`, `workflow.ts`, `run/route.ts`, `03-07-SUMMARY.md`.
- Both task commits verified in git log: `353b8296` (Task 1), `36f08262` (Task 2).
- Plan verification greps all pass (`ast?: unknown`, `ast: irToArtifactAst(ctx.ir)`, `previewState?.url`, `LabAstExecutor`/`publishASTForRender`, route `previewExecutor`).
- `@oneui/experience-builder-preview` typecheck clean; agents + platform typechecks show only pre-existing out-of-scope errors (confirmed against `HEAD~1` baseline).
