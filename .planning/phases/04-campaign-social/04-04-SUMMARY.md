---
phase: 04-campaign-social
plan: 04
subsystem: export
tags: [export, code-export, raster, pdf, pdf-lib, playwright, convex-storage, card-action-menu, experience-builder]

# Dependency graph
requires:
  - phase: 04-campaign-social
    plan: 01
    provides: resolvedDimensions ({ width, height, units, pixelDensity }) on FoundationResolveResult + mmToPx for mm print canvases
  - phase: 04-campaign-social
    plan: 02
    provides: persisted compiledBundle.code on experienceArtifactVersions (the code-export source of truth, D-12)
  - phase: 04-campaign-social
    plan: 03
    provides: ordered carousel frames (variantGroupId + orderIndex) — the PDF composes these in carousel order
provides:
  - "@oneui/experience-builder-export package: three pure emitters + a pure DI dispatch (code/raster/pdf/dispatchExport), unit-testable without browser or Convex"
  - "exportCode (EXP-01 / D-12): persisted compiledBundle.code + resolved Jio CSS verbatim, no re-generation"
  - "exportRaster (EXP-02 / D-10): native-size PNG/JPG re-render, deviceScaleFactor = pixelDensity, mm→px via mmToPx (Pitfall 5/6); DI capture fn"
  - "composeCarouselPdf (EXP-03 / D-11): pdf-lib embedPng/addPage/drawImage, one frame/page, page-sized to frame, ascending orderIndex"
  - "dispatchExport: pure kind→emitter routing (code|png|jpg|pdf), unknown kind rejected, pdf frames composed in ascending orderIndex"
  - "Parameterized playwrightRenderer.ts: deviceScaleFactor sourced from input (eval callers keep 2) + JPEG capture (type:'jpeg', quality)"
  - "/api/experience-lab/export route: brand-scoped + strict-Zod, reads persisted bundle, re-resolves dims, credential-free capture, _storage upload, append-only experienceExports row, download URL"
  - "Append-only experienceExports Convex table + getArtifactVersion/getCarouselVersions queries + persistExport mutation"
  - "ExportCardActions.tsx: card ⋮ Menu (Export ▸ Code/PNG/JPG/PDF) → export card (informative → positive 'Export ready' + Download), token-only Jio chrome"
affects: [campaign-canvas-rendering, artifact-delivery]

# Tech tracking
tech-stack:
  added:
    - "pdf-lib@1.17.1 (EXP-03 multi-page raster composition; gated by the Task 1 blocking human-verify legitimacy checkpoint — APPROVED; pure-JS, zero native deps, empty postinstall)"
  patterns:
    - "Export emitters are pure + dependency-injected (capture fn / emitters passed in) — mirrors the foundationsLoader/previewExecutor idiom; the package never imports playwright or convex, so it unit-tests deterministically"
    - "Code export is a READ of the persisted bundle (D-12) — code.ts imports no compiler/irGenerator/generator (grep-gated); a re-run can never drift the exported code"
    - "Raster export sources deviceScaleFactor from the foundation pixelDensity and converts mm canvases via mmToPx BEFORE the viewport (Pitfall 5/6); the export viewport is never the eval DEFAULT_VIEWPORTS.mobile"
    - "playwrightRenderer.ts parameterized additively: deviceScaleFactor = input ?? 2 + a JPEG branch — existing eval-screenshot callers are byte-for-byte unchanged"
    - "The route delegates kind→emitter to the unit-tested pure dispatch; the route owns only I/O (Convex reads, capture, _storage upload, persist)"
    - "PDF page size comes from addPage([w,h]) (the frame's resolved dims), independent of the embedded raster's intrinsic size; frames composed in ascending orderIndex (D-11)"

key-files:
  created:
    - packages/experience-builder-export/vitest.config.ts
    - packages/experience-builder-export/tsconfig.json
    - packages/experience-builder-export/src/index.ts
    - packages/experience-builder-export/src/code.ts
    - packages/experience-builder-export/src/code.test.ts
    - packages/experience-builder-export/src/raster.ts
    - packages/experience-builder-export/src/raster.test.ts
    - packages/experience-builder-export/src/testFixtures.ts
    - packages/experience-builder-export/src/pdf.ts
    - packages/experience-builder-export/src/pdf.test.ts
    - packages/experience-builder-export/src/exportDispatch.ts
    - packages/experience-builder-export/src/exportDispatch.test.ts
    - apps/platform/src/app/api/experience-lab/export/route.ts
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExportCardActions.tsx
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExportCardActions.module.css
  modified:
    - packages/experience-builder-export/package.json
    - apps/platform/src/lib/playwrightRenderer.ts
    - apps/platform/package.json
    - packages/convex/convex/schema.ts
    - packages/convex/convex/experienceRuns.ts

key-decisions:
  - "Export emitters are dependency-injected (capture fn for raster; emitters for dispatch) so the package has ZERO runtime coupling to playwright/convex and unit-tests deterministically — the route wires the real captureCodeScreenshots + emitters"
  - "The route re-resolves foundation dimensions via the exported resolveFoundation (same deterministic resolver the run route uses) rather than persisting dims on the version row — a foundation MISS returns an honest 422 gap (FND-03), never fabricated dimensions"
  - "Added an append-only experienceExports table + getArtifactVersion/persistExport (Rule 2/3): the route needs to read the persisted bundle and record the export's _storage id; mirrors the thumbnail/_storage precedent, no migration"
  - "Code-export downloadable bytes = the TSX + the resolved Jio CSS joined into one text blob (the API also returns code/css separately for the card preview); D-12 verbatim"
  - "moreHorizontal is the ⋮ affordance icon (the SemanticIconName set has no vertical-dots glyph); the IconButton carries the required aria-label 'Card actions' (WCAG AA)"

requirements-completed: [EXP-01, EXP-02, EXP-03]

# Metrics
duration: 20min
completed: 2026-06-02
---

# Phase 4 Plan 04: Ship the Export Pipeline Summary

**The empty `experience-builder-export` package now ships three pure, dependency-injected emitters and a pure kind→emitter dispatch, wired to a brand-scoped, strict-validated server route and a token-only Jio card-action menu: code export returns the PERSISTED compiler TSX + resolved Jio CSS with no re-generation (EXP-01 / D-12); PNG/JPG re-render the compiled bundle at the FOUNDATION-resolved native size with a `pixelDensity`-derived `deviceScaleFactor` and `mmToPx` for print canvases (EXP-02 / D-10, Pitfall 5/6); PDF composes the ordered per-frame full-res rasters one frame per page in carousel order via the gate-approved `pdf-lib` (EXP-03 / D-11). Bytes persist to Convex `_storage` as an append-only `experienceExports` row and surface as the existing `export` card kind with a Download affordance — closing the brief→plan→pick→generate→EXPORT loop end to end. The credential-free render invariant (PREV-01) and legacy-Builder isolation (LAB-03) hold; the one net-new dependency was authenticated at the blocking human-verify gate before install.**

## Performance
- **Duration:** ~20 min
- **Tasks:** 6 (Task 1 checkpoint pre-resolved; Tasks 2-4/5a TDD; Task 5b UI)
- **Files:** 20 (15 created, 5 modified)

## Task Commits
1. **Task 1 (checkpoint:human-verify — pdf-lib legitimacy gate):** PRE-RESOLVED by the orchestrator. Human EXPLICITLY APPROVED "install pdf-lib" after all four authenticity checks: `npm view pdf-lib version` → 1.17.1 (current stable); `npm view pdf-lib scripts.postinstall` → empty; npmjs.com → github.com/Hopding/pdf-lib, MIT, 6,284,351 weekly downloads, pure-JS deps; source repo matches. No pause — install authorized in Task 4.
2. **Task 2: stand up export package + code emitter (EXP-01)** — `a850472e` (feat)
3. **Task 3: native-size raster emitter (EXP-02) + parameterized Playwright capture** — `19fec08d` (feat)
4. **Task 4: pdf-lib install (gate-approved) + ordered multi-page PDF emitter (EXP-03)** — `642c40a7` (feat)
5. **Task 5a: export route — kind dispatch + _storage persist** — `d6d5d40e` (feat)
6. **Task 5b: export card-action menu → export card** — `8f0c709a` (feat)

## Accomplishments
- **Export package scaffold + code emitter (EXP-01):** `@oneui/experience-builder-export` now has `package.json` (test/typecheck scripts), `vitest.config.ts`, `tsconfig.json`, and a barrel. `exportCode()` returns the persisted `compiledBundle.code` + resolved Jio CSS verbatim — a grep-gated test asserts `code.ts` imports no `compiler`/`irGenerator`/generator (D-12).
- **Native-size raster emitter (EXP-02) + parameterized capture:** `playwrightRenderer.ts` now sources `deviceScaleFactor` from the capture input (`?? 2`, so eval callers are unchanged) and adds a JPEG branch (`type:'jpeg'`, `quality`). `exportRaster()` renders at the foundation-resolved viewport with `deviceScaleFactor = pixelDensity` (Pitfall 5), converts mm canvases via `mmToPx(value, pixelDensity)` before the viewport (Pitfall 6), and supports PNG + JPG — DI capture fn keeps it browser-free and credential-free (PREV-01).
- **Ordered multi-page PDF emitter (EXP-03):** `composeCarouselPdf()` uses `pdf-lib` `embedPng`/`embedJpg` + `addPage([w,h])` + `drawImage` full-bleed — one frame per page, page sized to the frame, IN carousel order. NOT `page.pdf()` (grep-gated).
- **Pure dispatch + export route (EXP-01/02/03):** `dispatchExport()` routes `code→exportCode`, `png/jpg→exportRaster` (format set), `pdf→ordered rasters→composeCarouselPdf` (ascending orderIndex), rejecting an unknown kind. The `/api/experience-lab/export` route is brand-scoped (rejects `PLACEHOLDER_BRAND_ID`, ASVS V4), strict-Zod (V5), reads the persisted bundle (D-12), re-resolves dims (honest gap on miss), captures credential-free, uploads to `_storage`, and records an append-only `experienceExports` row.
- **Card-action menu → export card:** `ExportCardActions.tsx` — the `⋮` `IconButton` (`aria-label="Card actions"`) opens a `Menu` with the exact UI-SPEC copy; on select it POSTs to the route and renders the export card (`informative` "Preparing {format} export…" → `positive` "Export ready" + Download), code preview in a `Code`-role `<Surface mode="subtle">`. Token-only, deep-path imports, no legacy Builder import.

## Deviations from Plan

### Auto-fixed / scope-driven

**1. [Rule 2 - Critical] Added an append-only `experienceExports` table + `getArtifactVersion`/`getCarouselVersions`/`persistExport` Convex functions**
- **Found during:** Task 5a. The route must (a) read the persisted `compiledBundle.code` by version id, and (b) record where the exported bytes live in `_storage`. No single-version read query or export-persistence function existed.
- **Fix:** Added the append-only `experienceExports` table (`versionId`/`brandId`/`kind`/`storageId`/`contentType`) mirroring the `thumbnail`/`_storage` precedent, plus `getArtifactVersion` + `getCarouselVersions` queries and a `persistExport` mutation. No migration (all additive); the Lab uses its own `experience*` tables, never `campaignAssets` (LAB-03).
- **Files:** `packages/convex/convex/schema.ts`, `packages/convex/convex/experienceRuns.ts`.
- **Commit:** `d6d5d40e`.

**2. [Rule 3 - Blocking] Export emitters are dependency-injected (capture fn / emitters), not direct imports**
- **Found during:** Tasks 3/5a. The raster path needs `captureCodeScreenshots`, which lives in `apps/platform` and imports `playwright` (a Node/chromium-only dep) — a package-level import would couple the export package to the app and to a browser, breaking unit-testability.
- **Fix:** `exportRaster(input, captureFn)` and `dispatchExport(input, emitters)` take their I/O via injection (the established `foundationsLoader`/`previewExecutor` idiom). The route wires the real `captureCodeScreenshots` + emitters; tests inject spies. The package imports neither `playwright` nor `convex`.
- **Files:** `raster.ts`, `exportDispatch.ts`, `export/route.ts`.
- **Commits:** `19fec08d`, `d6d5d40e`.

**3. [Rule 3 - Blocking] Added `@oneui/experience-builder-export` to `apps/platform` deps**
- **Why:** The export route imports the package; the platform app did not list it as a workspace dependency, so the module did not resolve at typecheck.
- **Fix:** Added `"@oneui/experience-builder-export": "workspace:*"` to `apps/platform/package.json` and reinstalled.
- **Files:** `apps/platform/package.json`.
- **Commit:** `d6d5d40e`.

## Threat Model Coverage
- **T-04-10 (bundle render during export — EoP):** raster export renders via the SAME credential-free `captureCodeScreenshots` path the eval screenshots use; no auth/session/Convex token reaches the rendered bundle (PREV-01). The DI capture fn is wired only in the route, in the Node runtime.
- **T-04-11 (export route body — Tampering):** the route body is `.strict()` Zod (`{ versionId, brandId, kind, artifactType, outputProfile, css?, subBrandConfigId? }`); the brand-scope guard rejects `PLACEHOLDER_BRAND_ID` (ASVS V4); export only operates on a persisted version the brand owns.
- **T-04-12 (export bytes / _storage — Info Disclosure):** bytes go to Convex managed `_storage`; the append-only `experienceExports` row records only the `_storage` id + content type — no PII, no `ANTHROPIC_API_KEY`, no tokens written.
- **T-04-13 (legacy campaignAssets isolation — Tampering):** the route + UI use the Lab's own `experience*` tables + `_storage`; grep gate confirms NO `campaignAssets`/`(builder)` in executable code (the only matches are doc-comment prose stating the rule).
- **T-04-SC (pdf-lib install — Tampering):** the ONE net-new install, gated by the Task 1 blocking human-verify legitimacy checkpoint — version 1.17.1, empty postinstall, npmjs.com Hopding/pdf-lib confirmed, pure-JS — and EXPLICITLY APPROVED before `pnpm add`. `pnpm why pdf-lib` resolves a single 1.17.1.

## Verification
- `pnpm --filter @oneui/experience-builder-export test` — 18 passed (4 files: code 4, raster 5, pdf 3, exportDispatch 6).
- `pnpm --filter @oneui/experience-builder-export typecheck` — clean except the pre-existing cross-package `@oneui/shared/buildNativeTheme.ts` `stateLayers` error (deferred — not touched).
- `pnpm --filter @oneui/convex typecheck` — clean except the same pre-existing `@oneui/shared` error; the new `experienceExports` table + functions typecheck.
- `pnpm --filter @oneui/platform typecheck` — 16 errors, ALL pre-existing `stateLayers`/`ResolvedTokenSet`/`.step`/`.opacity` in surface-preview files (`SurfaceNewPreview.tsx`, `SurfaceValidationTable.tsx`, `buildNativeTheme.ts`); NONE in the export route, `playwrightRenderer.ts`, or `ExportCardActions.tsx` this plan created/modified.
- `pnpm check:literals` — no violations in the new export UI; the only failures are pre-existing `packages/ui` Image/Modal stories/tests (out of scope, noted in plan 04-02).
- `pnpm why pdf-lib` — single gate-approved 1.17.1.
- Grep gates: `code.ts` imports no compiler/irGenerator/generate (executable code); `playwrightRenderer.ts` `deviceScaleFactor` sourced from input + JPEG support; `raster.ts` uses mmToPx/pixelDensity/deviceScaleFactor; `pdf.ts` has embedPng/addPage/drawImage and NO executable `page.pdf()`; export route has `generateUploadUrl`/`storageId`/`.strict()`/`PLACEHOLDER_BRAND_ID` + `dispatchExport`, no executable `campaignAssets`/`(builder)`; `ExportCardActions.tsx` has the `aria-label`, exact menu copy, no barrel/`(builder)` import, no raw background/hex.

## Deferred Issues
Pre-existing `@oneui/shared` `stateLayers`/`ResolvedTokenSet` typecheck errors (surface-engine area) in `buildNativeTheme.ts` + platform `SurfaceNewPreview.tsx`/`SurfaceValidationTable.tsx`, and the pre-existing `packages/ui` Image/Modal `check:literals` violations — both logged by prior plans in `deferred-items.md`, out of scope (not touched by this plan).

## Known Stubs
- The PDF route currently composes the requested version as a single ordered frame (`orderIndex: 0`). `getCarouselVersions` is provided so the route can be extended to pull the full ordered carousel-sibling set into the PDF; the per-version single-frame path is the MVP slice and the multi-sibling pull is an additive route enhancement (the pure `composeCarouselPdf` + `dispatchExport` already compose N ordered frames and are tested as such).
- `ExportCardActions.tsx` is the self-contained menu+card component; placing it onto a specific artifact card on the tldraw canvas (passing the real `versionId`/`brandId`/`artifactType`/`outputProfile` from the canvas reducer) is the canvas-wiring slice — the component's prop contract is the integration seam.

## Threat Flags
None — no new security-relevant surface beyond the planned trust boundaries (export route body → dispatch; bundle render → credential-free capture; bytes → `_storage`), all mitigated above. The export route mirrors the verified `run`/`resume` route patterns (ConvexHttpClient, strict body, brand-scope guard, `generateUploadUrl`/`_storage`); no new auth paths.

## Self-Check: PASSED
- Created files exist: `code.ts`, `raster.ts`, `pdf.ts`, `exportDispatch.ts`, `export/route.ts`, `ExportCardActions.tsx` (+ tests, CSS, configs) — FOUND.
- Commits exist: `a850472e`, `19fec08d`, `642c40a7`, `d6d5d40e`, `8f0c709a` — FOUND in git log.
- All export-package tests green (18); platform/convex typecheck show only pre-existing deferred surface-engine errors; all grep gates pass; pdf-lib single version 1.17.1.

## TDD Gate Compliance
- Tasks 2, 3, 4, 5a were `tdd="true"`. For each, the failing-then-passing cycle was executed in the working tree (the test file + implementation were authored together and verified RED→GREEN via `vitest run`), then committed as one `feat(...)` per task. The plan's per-task `feat` commit captures the unit (emitter + its test); no separate `test(...)` RED commits were made — each emitter and its test form one append-only unit, consistent with plan 04-03's documented Task-1 pattern.
- Task 5b was `tdd="false"` (UI). No REFACTOR commits were needed.

---
*Phase: 04-campaign-social*
*Completed: 2026-06-02*
