---
phase: 03-preview-eval-repair
plan: 08
subsystem: experience-lab-preview
tags: [preview, sandbox, iframe, ttl, scaling, security, CANVAS-06, PREV-01, PREV-02]
requires:
  - "03-07: LabAstExecutor + /internal/render-ast?token route + RenderInput.ast seam"
provides:
  - "Long interactive TTL (30 min) for the Lab AST render token so the live iframe survives the run tail + reloads (RC1)"
  - "Additive PreviewState.sameOrigin trust flag threaded end-to-end → trust-scoped iframe sandbox (RC2)"
  - "Scale-to-fit CSS transform on the render-ast page so desktop-width composition fits the artifact card (RC3)"
affects:
  - "apps/platform Experience Lab live preview"
  - "packages/experience-builder-preview PreviewState contract (additive)"
tech-stack:
  added: []
  patterns:
    - "Trust-scoped iframe sandbox (default-strict, first-party AST path opts into allow-same-origin)"
    - "CSS transform scale-to-fit (scale(calc(100vw / DESIGN_VIEWPORT_WIDTH))) for embedded fixed-design-width render"
    - "Parametrized in-memory token TTL (60s default for capture loop, 30 min for interactive Lab)"
key-files:
  created: []
  modified:
    - apps/platform/src/lib/playwrightRenderer.ts
    - apps/platform/src/app/api/experience-lab/lab-ast-executor.ts
    - packages/experience-builder-preview/src/PreviewExecutor.ts
    - packages/experience-builder-preview/src/IframeCspExecutor.ts
    - packages/experience-builder-preview/src/DaytonaExecutor.ts
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/runStream.ts
    - apps/platform/src/app/api/experience-lab/run/route.ts
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/ArtifactCardShape.tsx
    - apps/platform/src/app/internal/render-ast/page.tsx
    - apps/platform/src/app/(platform)/(experience-lab)/__tests__/versionTimeline.test.tsx
decisions:
  - "sameOrigin is additive + default-absent so untrusted Daytona/IframeCsp paths cannot accidentally relax the sandbox (PREV-01 preserved)"
  - "Long TTL is in-memory only (lost on restart) — minimum-viable fix matching 03-07's reuse-existing-route philosophy; a restart re-runs generation"
  - "Scale factor / design-viewport px treated as layout math (not a design token) per CLAUDE.md; colours/typography stay token-only"
metrics:
  duration: "~25 min"
  completed: "2026-06-01"
  tasks: 3
  files: 11
---

# Phase 3 Plan 08: Live-Preview Gap Closure (RC1 TTL, RC2 sandbox, RC3 scaling) Summary

Closed the post-03-07 UAT gap so the artifact-card live iframe actually renders: a 30-min interactive TTL on the AST render token (RC1), an additive trust-scoped `sameOrigin` sandbox flag wired end-to-end so the first-party AST path loads `allow-scripts allow-same-origin` while the untrusted path stays strict (RC2), and a `scale(calc(100vw / 1440))` transform that fits the desktop-width composition into the ~360px card (RC3).

## What Was Built

### Task 1 — RC1: Long interactive TTL for the AST render token (`22cad44b`)
- `playwrightRenderer.ts`: `publishASTForRender(ast, ttlMs = TOKEN_TTL_MS)` is now parametrized; added exported `INTERACTIVE_TOKEN_TTL_MS = 30 * 60_000`. The 60s default keeps the Playwright `captureASTScreenshots` capture loop unchanged; `consumeASTForRender` still does not delete on a successful read, so reloads re-resolve the same token within the TTL window.
- `lab-ast-executor.ts`: imports + publishes with `INTERACTIVE_TOKEN_TTL_MS` and sets a matching `expiresAt`; removed the now-redundant local `RENDER_TOKEN_TTL_MS` so the 30-min value lives in one place. Header comment updated.

### Task 2 — RC2: Trust-scoped `sameOrigin` sandbox flag end-to-end (`d3f40d35`)
- `PreviewExecutor.ts`: added additive `PreviewState.sameOrigin?: boolean`.
- `lab-ast-executor.ts`: first-party AST path returns `previewState.sameOrigin: true` (safe — our ASTRenderer over a server-derived tree, no untrusted code).
- `IframeCspExecutor.ts` / `DaytonaExecutor.ts`: no behaviour change — confirming comments document that they OMIT `sameOrigin` so they default to strict `allow-scripts` (PREV-01).
- `runStream.ts`: added `RunResultFrame.previewSameOrigin?: boolean`.
- `run/route.ts`: conditional-spread `...(run.previewState?.sameOrigin ? { previewSameOrigin: true } : {})` on the `result` frame.
- `useExperienceLabRun.ts`: threaded `previewSameOrigin` through `placeArtifact` (call site, signature, `artifactProps`).
- `ArtifactCardShape.tsx`: added `previewSameOrigin` to props type / `static props` (`T.boolean`) / `getDefaultProps` (`false`); `PreviewRegion` computes `sandbox = previewSameOrigin ? 'allow-scripts allow-same-origin' : 'allow-scripts'`. Header + inline comments updated to describe the trust-scoped behaviour.

### Task 3 — RC3: Scale-to-fit + coherent sandbox test (`65d5d228`)
- `render-ast/page.tsx`: added `DESIGN_VIEWPORT_WIDTH = 1440`; outer wrapper changed from `minHeight:100vh` to `minHeight:100%` + `width:100%` + `overflow:hidden`; inner wrapper renders at `1440px` width with `transform-origin: top left` and `transform: scale(calc(100vw / 1440))` so the composition fits the iframe viewport without cropping. `force-dynamic` preserved (RC1 reload re-resolution depends on it); colours/typography stay token-only.
- `versionTimeline.test.tsx`: split the single live-iframe test into UNTRUSTED (`previewSameOrigin={false}` → strict, NO `allow-same-origin`, PREV-01) and TRUSTED (`previewSameOrigin={true}` → both `allow-scripts` AND `allow-same-origin`, RC2) cases; thumbnail test now passes the new required prop. Top-of-file doc comment updated. LAB-03 isolation test untouched and still green.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree had no `node_modules`**
- **Found during:** Task 1 verification (`tsc: command not found`).
- **Issue:** The freshly-spawned worktree had no installed dependencies, so no typecheck/test could run.
- **Fix:** Ran `pnpm install --prefer-offline` (materializes existing workspace deps from the shared store — NOT a new-package install, so the Rule 3 package-manager exclusion does not apply). Verified the lockfile and all `package.json` files were unchanged afterward (no churn committed).
- **Files modified:** none (install only).
- **Commit:** n/a (no source change).

## Verification Evidence

- `pnpm --filter @oneui/experience-builder-preview typecheck` → clean (PreviewState extended).
- `pnpm --filter @oneui/platform typecheck` → only the documented 03-07 baseline errors remain (`workflow.ts` Mastra Step typing, `buildNativeTheme.ts` / `SurfaceNewPreview.tsx` / `SurfaceValidationTable.tsx` `stateLayers`). ZERO errors in any of the 11 touched files; confirmed via filtered grep on each task.
- `pnpm --filter @oneui/platform exec vitest run versionTimeline.test.tsx` → 8 passed (was 6; +2 from the trusted/untrusted split + new trusted assertion). Trusted path asserts `allow-same-origin` present; untrusted asserts it absent.
- Done-criteria greps all matched: `ttlMs` + `INTERACTIVE_TOKEN_TTL_MS` in playwrightRenderer/lab-ast-executor; `sameOrigin?: boolean` in PreviewExecutor; `sameOrigin: true` in lab-ast-executor; `previewSameOrigin` in runStream.ts / run/route.ts / useExperienceLabRun.ts / ArtifactCardShape.tsx; `allow-same-origin` in ArtifactCardShape; `DESIGN_VIEWPORT_WIDTH` + `scale(calc(100vw / 1440))` in render-ast page; IframeCsp/Daytona carry only comment references (no `sameOrigin` field set).

## Pre-existing Out-of-Scope Errors (not touched — SCOPE BOUNDARY)

Identical to the 03-07-SUMMARY documented baseline; none introduced by this plan:
- `packages/shared/src/engine/buildNativeTheme.ts` — `ResolvedTokenSet.stateLayers`
- `apps/platform/src/design-tools/Foundations/Surfaces/SurfaceNewPreview.tsx`, `SurfaceValidationTable.tsx` — `stateLayers` / `step` / `opacity`
- `packages/experience-builder-agents/src/workflow.ts` — Mastra `Step<...>` `execute` typing + `TS2367` at line 764

## Isolation (LAB-03)

Every edited file is inside `packages/experience-builder-preview/*` or the isolated `(experience-lab)` route / `internal/render-ast` render target. No `(builder)` / `ExperienceCanvas` file touched. The LAB-03 isolation test in `versionTimeline.test.tsx` still passes.

## Known Stubs

None. The `sameOrigin` flag is additive and defaults to strict, so untrusted executors are unaffected and no placeholder data flows to UI.

## Self-Check: PASSED

- Created files: none (plan modifies only).
- All 11 modified files exist and contain the planned changes (verified by edits + greps above).
- Commits exist: `22cad44b` (Task 1), `d3f40d35` (Task 2), `65d5d228` (Task 3).
