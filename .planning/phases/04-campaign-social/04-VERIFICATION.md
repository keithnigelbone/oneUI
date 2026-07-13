---
phase: 04-campaign-social
verified: 2026-06-02T23:45:00Z
status: human_needed
score: 4/4 success criteria verified
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 3/4
  gaps_closed:
    - "mm-unit print canvases are converted via mmToPx before the Playwright viewport is set (EXP-02 / SC-4)"
    - "Resume route rejects placeholder brand ID before any Convex query (security / SC-2 HITL path)"
    - "PDF export composes ordered per-frame full-res rasters one frame per page in carousel order (EXP-03 / SC-4)"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "After a social-post/instagram-carousel run suspends with a campaign plan, the canvas should display a campaign-plan card showing the 3 directions with a selection affordance. Select direction 1, enter a frame count, and click 'Generate frames.'"
    expected: "Canvas renders the direction-selection card with 3 distinct creative directions (name/concept/leadRole/surfaceMood per each); the 'Generate frames' button POSTs to /resume with the selected directionIndex and frameCount; canvas then streams and renders the ordered carousel group."
    why_human: "Plan-card UI rendering from suspendPayload.plan and direction-selection CTA wiring are documented as canvas-integration slices in the SUMMARY known stubs section. The canvas reducer/registration that places the plan card and the 'Generate frames' CTA cannot be verified programmatically without running the full stack."
  - test: "On a completed artifact card on the canvas, click the dotdotdot 'Card actions' button. Select 'Export > PNG' from the menu."
    expected: "The export card transitions from 'Preparing PNG export...' (informative) to 'Export ready' (positive) with a 'Download' link. Clicking Download opens the PNG file."
    why_human: "ExportCardActions.tsx is a self-contained component; its integration with a specific artifact card on tldraw (passing versionId/brandId/artifactType/outputProfile from the canvas reducer) is documented as a known canvas-wiring stub in the 04-04 SUMMARY. Cannot verify canvas placement programmatically."
  - test: "In the Lab, select 'Instagram carousel' as the artifact type. Verify the 'Campaign brief' group appears with Audience, Objective, and Channel fields. Fill in values, click 'Run generation,' and confirm the values appear in the network request body."
    expected: "Fields visible only for social-post/instagram-carousel; values POST as audience, objective, channel in the run body; web artifact types hide the group."
    why_human: "Progressive-disclosure behavior requires visual/network inspection. The field values are written to PromptCardShape props and posted with the run, but the actual DOM reveal/hide behavior requires a running browser."
---

# Phase 04: Campaign Social — Re-Verification Report

**Phase Goal:** User generates an on-brand Instagram/campaign artifact from a brief as a first-class path — the Campaign Planner proposes audience, message hierarchy, and 3 creative directions; the user picks one (HITL); the system resolves non-web dimensions/safe-areas from Jio foundations, generates IR-backed carousel frames with per-frame ToV copy, and exports as PNG/JPG/PDF.

**Verified:** 2026-06-02T23:45:00Z
**Status:** human_needed (all 4 success criteria verified; 3 canvas-integration items require human testing)
**Re-verification:** Yes — after gap closure of CR-01, CR-02, and WR-03

---

## Gap Closure Verification

All three blockers from the initial verification (2026-06-02T23:30:00Z) are confirmed closed in the codebase. Commits verified: `63ef6f26` (CR-01), `df36680f` (CR-02), `3284480c` (WR-03).

### Gap 1 (CR-01) — CLOSED

**Truth:** mm-unit print canvases are converted via mmToPx before the Playwright viewport is set (EXP-02 / SC-4).

**Evidence of fix (commit `63ef6f26`):**

1. `foundationResolve.ts` — `ResolvedDimensions` schema now has a required `ppi: z.number()` field (line 81) alongside the separate `pixelDensity: z.number()` field (line 83). The doc comment explicitly states their distinction: "Pixels per inch (72/96/300). Drives `mmToPx` for `units: 'mm'` canvases" vs "Device pixel ratio (1/2/3). Drives the raster `deviceScaleFactor`."

2. `foundationResolver.ts` — `resolveNonWebDimensions` now extracts both fields independently at lines 156–158:
   ```
   const ppi = breakpoint.din1450Override?.ppi ?? platform.ppi;
   const pixelDensity = breakpoint.din1450Override?.pixelDensity ?? platform.pixelDensity;
   ```
   Both are included in the returned `dims` object at line 174.

3. `raster.ts` — Lines 103–105 now use `dims.ppi` for `mmToPx` and `dims.pixelDensity` for `deviceScaleFactor` separately:
   ```
   const width  = dims.units === 'mm' ? mmToPx(dims.width,  dims.ppi) : dims.width;
   const height = dims.units === 'mm' ? mmToPx(dims.height, dims.ppi) : dims.height;
   const deviceScaleFactor = dims.pixelDensity;
   ```

4. `raster.test.ts` — The mm-canvas test fixture is corrected to `{ width: 210, height: 297, units: 'mm', ppi: 300, pixelDensity: 1 }` with explicit assertions that `vp.width === mmToPx(210, 300)` (~2480px), that `vp.width !== mmToPx(210, 1)` (~8px — the CR-01 bug regression guard), that `vp.width > 2000`, that the raw mm numbers 210/297 are NOT used, and that `deviceScaleFactor === 1` (not 300). The fixture correctly separates the two fields.

**Status: VERIFIED**

---

### Gap 2 (CR-02) — CLOSED

**Truth:** Resume route rejects placeholder brand ID before any Convex query (security / SC-2 HITL path).

**Evidence of fix (commit `df36680f`):**

`resume/route.ts` line 134 now has:
```typescript
if (brandId === PLACEHOLDER_BRAND_ID) {
  return new Response(
    JSON.stringify({ error: 'Cannot resume from the unsaved placeholder brand.' }),
    { status: 400, headers: { 'Content-Type': 'application/json' } },
  );
}
```

Guard placement confirmed by grep line numbers:
- `safeParse` at line 119
- `result.data` destructure at line 126
- `PLACEHOLDER_BRAND_ID` guard at line 134
- `convex.query(getCampaignPlan)` at line 160

The guard at line 134 precedes the convexUrl check (line 144) and ALL Convex queries. This matches the sibling run/export route pattern.

**Status: VERIFIED**

---

### Gap 3 (WR-03) — CLOSED

**Truth:** PDF export composes ordered per-frame full-res rasters one frame per page in carousel order (EXP-03 / SC-4).

**Evidence of fix (commit `3284480c`):**

`export/route.ts` PDF branch (lines 255–297) now:

1. Reads `artifactRow?.variantGroupId` (populated from `getArtifactVersion`'s returned `artifact`) at line 262.
2. When `variantGroupId` is present, calls `convex.query(api.experienceRuns.getCarouselVersions, { variantGroupId })` at line 265.
3. Maps the sibling rows into a `PdfFrameJob[]` array (lines 268–278), one per ordered sibling, using each sibling's `compiledBundle.code` and shared `resolvedDimensions`.
4. Falls back to a single-frame PDF only when `variantGroupId` is absent OR the query returns nothing (lines 285–296).

`getCarouselVersions` in `experienceRuns.ts` (lines 294–314) queries `experienceArtifacts` via `by_variant_group` index, reads each artifact's `currentVersionId`, and returns results sorted by `orderIndex` ascending — correct carousel order.

**Status: VERIFIED**

---

## Goal Achievement (Updated)

### Observable Truths (Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC-1 | Non-web resolver returns foundation-backed dimensions/type-scale/safe-areas or typed gap (FND-02) | VERIFIED | `getPlatformTargetForProfile` used in `foundationResolver.ts:122`; ppi + pixelDensity both extracted and included in `ResolvedDimensionsT`; gap returned on map-miss and breakpoint-absent |
| SC-2 | Campaign Planner produces brief/audience/messageHierarchy/3 directions/recommended direction; HITL suspend/resume + per-frame ToV copy (CAMP-01/02/03) | VERIFIED | `CampaignPlanSchema`, `runCampaignPlanner`, `campaignPlanCheckpoint`, `CampaignResumeSchema` all exist; resume route guards before Convex queries (CR-02 closed); clamping at both route and workflow |
| SC-3 | Carousel frames as IR-backed artifacts on canvas, grouped and ordered, foundation-resolved dims before generation (CAMP-04/05) | VERIFIED | `runCarousel` driver with shared budget; `orderIndex` in Convex schema; `CarouselGroupFrame.tsx` renders ordered group; gap short-circuits to 0 frames |
| SC-4 | Exports as code/PNG/JPG/PDF (EXP-01/02/03) | VERIFIED | EXP-01 (code): verbatim persisted bundle. EXP-02 (raster): CR-01 closed — `mmToPx` uses `dims.ppi`, `deviceScaleFactor` uses `dims.pixelDensity`. EXP-03 (PDF): WR-03 closed — `getCarouselVersions` called; one `PdfFrameJob` per ordered sibling |

**Score:** 4/4 success criteria verified

---

## Required Artifacts (Updated)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/experience-builder-core/src/contracts/foundationResolve.ts` | ResolvedDimensions with ppi + pixelDensity | VERIFIED | `ppi: z.number()` and `pixelDensity: z.number()` as distinct fields; doc comment explicitly distinguishes PPI from device ratio |
| `packages/experience-builder-agents/src/foundationResolver.ts` | ppi extracted alongside pixelDensity | VERIFIED | Lines 156–158: `const ppi = breakpoint.din1450Override?.ppi ?? platform.ppi` and separate `pixelDensity` extraction; both included in returned dims |
| `packages/experience-builder-export/src/raster.ts` | mmToPx uses ppi, deviceScaleFactor uses pixelDensity | VERIFIED | Lines 103–105: `mmToPx(dims.width, dims.ppi)` for px conversion; `dims.pixelDensity` for `deviceScaleFactor`; both paths clearly separated |
| `packages/experience-builder-export/src/raster.test.ts` | mm-canvas fixture uses ppi:300, pixelDensity:1 (distinct) | VERIFIED | Fixture: `ppi: 300, pixelDensity: 1`; assertions: `vp.width === mmToPx(210, 300)`, `vp.width !== mmToPx(210, 1)`, `vp.width > 2000`, `deviceScaleFactor === 1` |
| `apps/platform/src/app/api/experience-lab/resume/route.ts` | PLACEHOLDER_BRAND_ID guard before Convex queries | VERIFIED | Guard at line 134, before convexUrl check (line 144) and getCampaignPlan query (line 160) |
| `apps/platform/src/app/api/experience-lab/export/route.ts` | PDF branch calls getCarouselVersions for multi-frame | VERIFIED | Lines 262–297: reads `artifactRow.variantGroupId`, calls `getCarouselVersions`, builds `PdfFrameJob[]` from ordered siblings; single-frame fallback only when group absent |
| `packages/convex/convex/experienceRuns.ts` | getCarouselVersions returns ordered siblings | VERIFIED | Lines 294–314: queries by_variant_group index, reads each currentVersionId, sorts ascending by orderIndex |
| `packages/experience-builder-core/src/profiles/profilePlatformMap.ts` | typed OutputProfile→{platformId,breakpointId} map | VERIFIED | (unchanged from initial verification) |
| `packages/experience-builder-core/src/contracts/campaignPlan.ts` | Anthropic-safe CampaignPlanSchema | VERIFIED | (unchanged) |
| `packages/experience-builder-agents/src/agents/plannerAgent.ts` | runCampaignPlanner via callModel | VERIFIED | (unchanged) |
| `packages/convex/convex/schema.ts` | campaignPlan + orderIndex fields | VERIFIED | (unchanged) |
| `packages/experience-builder-agents/src/steps/carousel.ts` | ordered per-frame loop with shared budget | VERIFIED | (unchanged) |
| `apps/platform/src/app/(platform)/(experience-lab)/_canvas/CarouselGroupFrame.tsx` | ordered tldraw group frame | VERIFIED | (unchanged) |
| `packages/experience-builder-export/src/code.ts` | EXP-01 code emitter, no re-gen | VERIFIED | (unchanged) |
| `packages/experience-builder-export/src/pdf.ts` | EXP-03 ordered multi-page PDF emitter | VERIFIED | `composeCarouselPdf` handles N frames; route now supplies N frames via `getCarouselVersions` |
| `packages/experience-builder-export/src/exportDispatch.ts` | pure kind→emitter dispatch | VERIFIED | (unchanged) |
| `apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.tsx` | artifact-type-gated brief fields | VERIFIED | (unchanged) |

---

## Key Link Verification (Updated)

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `foundationResolver.ts` | `profilePlatformMap.ts` | `getPlatformTargetForProfile` | WIRED | (unchanged) |
| `foundationResolver.ts` | `dimension-scales.ts` | `getDimensionValueFromConfig` | WIRED | (unchanged) |
| `plannerAgent.ts` | `modelAdapter.ts` | `callModel` | WIRED | (unchanged) |
| `workflow.ts` | `campaignPlan.ts` | `campaignPlan\|CampaignPlan` | WIRED | (unchanged) |
| `resume/route.ts` | `experienceRuns.ts` | `getCampaignPlan` | WIRED | Guard now precedes query (CR-02 closed) |
| `resume/route.ts` | `workflow.ts` | `campaignSelection` | WIRED | (unchanged) |
| `workflow.ts` | `carousel.ts` | `runCarousel` | WIRED | (unchanged) |
| `carousel.ts` | `voiceAdapter.ts` | `requestFrameCopy` (DI seam) | WIRED | (unchanged) |
| `export/route.ts` | `experience-builder-export` | `dispatchExport` | WIRED | (unchanged) |
| `raster.ts` | `mmToPx` | mm→px conversion | WIRED | CR-01 closed: `mmToPx(dims.width, dims.ppi)` — correct PPI argument |
| `export/route.ts` | `experienceRuns.ts` | `getCarouselVersions` | WIRED | WR-03 closed: called when `variantGroupId` present; builds multi-frame PdfFrameJob array |
| `export/route.ts` | Convex `_storage` | `generateUploadUrl → storageId` | WIRED | (unchanged) |

---

## Data-Flow Trace (Level 4) — Updated

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `raster.ts` | `resolvedDimensions.ppi` | `foundationResolver.ts` → `platform.ppi` | YES — ppi extracted from brand's Platforms foundation | FLOWING |
| `raster.ts` | `resolvedDimensions.pixelDensity` | `foundationResolver.ts` → `platform.pixelDensity` | YES — device ratio extracted separately from ppi | FLOWING |
| `pdf.ts` / `composeCarouselPdf` | `frames[]` | `export/route.ts` → `getCarouselVersions` | YES for multi-frame carousels — N frames from ordered sibling artifacts | FLOWING |
| `CarouselGroupFrame.tsx` | `frames` prop | `carouselFrames` from resume stream | YES — ordered carousel frames from workflow result | FLOWING |
| `exportCode` | `compiledBundle.code` | persisted `experienceArtifactVersions.compiledBundle.code` | YES — verbatim read, no re-generation | FLOWING |

---

## Remaining Warnings Assessment (WR-01/02/04/05 and IN-01/02/03)

The four remaining Warnings and three Info items from the code review (04-REVIEW.md) were NOT addressed in the gap-closure commits. All are assessed as non-blockers for the phase goal:

**WR-01** (`uploadRes.ok` not checked before JSON parse in `uploadBytes` and `uploadThumbnail`): A resilience gap — if Convex storage returns a non-2xx response, `storageId` silently becomes `undefined` and a Convex argument-validation error is thrown downstream. The error IS caught by the outer try/catch and surfaces as HTTP 500. The happy path is unaffected. Resilience improvement but not a correctness blocker for the phase goal.

**WR-02** (`makeResume` accepts `ResumeDecisionT | CampaignResumeT` in its type signature but only parses `ResumeDecisionT` at runtime): In production, `makeResume` is returned by the non-campaign HITL path; the campaign path returns `makeCampaignResume`. The resume route calls `runExperienceWorkflow` which selects the correct closure. Cross-contamination requires deliberately calling the wrong closure, which the current route wiring cannot trigger. Not a production correctness risk.

**WR-04** (no guard for `pixelDensity <= 0` in `raster.ts`): A defensive validation gap. Real foundations from the platform UI cannot produce zero or negative `pixelDensity` — the field is set from `platform.pixelDensity` in the brand's Platforms foundation, which the UI validates. No blockers for valid data paths.

**WR-05** (`consumeCodeForRender` / `consumeASTForRender` do not delete on successful read): The Playwright capture loop's `finally` blocks at lines 134 and 170 perform the authoritative token delete post-capture. A second concurrent read of the same random-UUID token is an extremely low-probability scenario. Not a correctness blocker.

**IN-01/02/03**: Informational — `noopener` vs `noopener,noreferrer`, brand ownership cross-check, and `frameLabel(x, 0)` latent string. None affect phase goal achievement.

---

## Requirements Coverage (Updated)

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FND-02 | 04-01 | Resolver covers non-web output profiles | SATISFIED | profilePlatformMap + non-web resolver branch; ppi+pixelDensity both threaded; gap-on-miss |
| CAMP-01 | 04-02 | First-class campaign path | SATISFIED | `isCampaignRun` branch; social-post/instagram-carousel takes campaign path |
| CAMP-02 | 04-02 | Campaign Planner output (brief/audience/messageHierarchy/3 directions/recommended) | SATISFIED | `runCampaignPlanner` + `CampaignPlanSchema`; exactly-3-direction enforcement |
| CAMP-03 | 04-03 | HITL direction selection + per-frame ToV copy | SATISFIED | `campaignPlanCheckpoint` suspend/resume; `runVoiceAdapter` per frame in carousel driver |
| CAMP-04 | 04-03 | Carousel frames as IR-backed artifacts grouped on canvas | SATISFIED | `orderIndex`/`variantGroupId` schema; `runCarousel` driver; `CarouselGroupFrame.tsx` |
| CAMP-05 | 04-01/04-03 | Campaign frames resolve dims/type-scale/safe-areas from Jio foundations | SATISFIED | `resolveFoundation` non-web branch called before generation; gap → 0 frames |
| EXP-01 | 04-04 | Code export (React + Jio CSS) | SATISFIED | `exportCode` returns persisted bundle verbatim |
| EXP-02 | 04-04 | PNG/JPG export at native size | SATISFIED | CR-01 closed: `mmToPx(dims.width, dims.ppi)`; `deviceScaleFactor = dims.pixelDensity` |
| EXP-03 | 04-04 | PDF export for campaign assets | SATISFIED | WR-03 closed: `getCarouselVersions` called; N-frame PDF composed in carousel order |

---

## Anti-Patterns (Updated)

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `export/route.ts:123` | `uploadRes.ok` not checked before `uploadRes.json()` (WR-01) | WARNING | Silent storageId=undefined on Convex storage failure → Convex validation error instead of clear HTTP 500 |
| `workflow.ts:1080-1084` | `makeResume` accepts `CampaignResumeT` in type signature but parses only `ResumeDecisionT` (WR-02) | WARNING | Would throw Zod error if wrong resume closure called; current route wiring cannot trigger this |
| `raster.ts:110` | No guard for `pixelDensity <= 0` before Playwright `deviceScaleFactor` (WR-04) | WARNING | Playwright throws opaque error on invalid deviceScaleFactor; valid foundations unaffected |
| `playwrightRenderer.ts:84-91` | `consumeCodeForRender` / `consumeASTForRender` do not delete on successful read (WR-05) | WARNING | Token survives TTL; extremely low-probability race; `finally` deletes post-capture |
| `ExportCardActions.tsx:197` | `window.open` uses `noopener` not `noopener,noreferrer` (IN-01) | INFO | Referer header sent to Convex storage on download |
| `export/route.ts:167-170` | `versionId` cast without brand ownership check (IN-02) | INFO | Cross-brand artifact export possible for authenticated users in same org |
| `carouselFrameLayout.ts:45-47` | `frameLabel(index, 0)` produces "Frame 1 of 0" (IN-03) | INFO | Latent; `.map()` never calls it with total=0 |

No `TBD`, `FIXME`, or `XXX` markers found in phase-modified files.

---

## Human Verification Required

### 1. Carousel direction-selection UI

**Test:** After a social-post/instagram-carousel run suspends with a campaign plan, the canvas should display a campaign-plan card showing the 3 directions with a selection affordance. Select direction 1, enter a frame count, and click "Generate frames."

**Expected:** The canvas renders the direction-selection card with 3 distinct creative directions (name/concept/leadRole/surfaceMood per each); the "Generate frames" button POSTs to `/resume` with the selected `directionIndex` and `frameCount`; the canvas then streams and renders the ordered carousel group.

**Why human:** The plan-card UI rendering from `suspendPayload.plan` and the direction-selection CTA wiring are documented as canvas-integration slices in the SUMMARY known stubs section (04-02 + 04-03). The canvas reducer/registration that places the plan card and the "Generate frames" CTA cannot be verified programmatically without running the full stack.

### 2. ExportCardActions placement on tldraw canvas

**Test:** On a completed artifact card on the canvas, click the `...` "Card actions" button. Select "Export > PNG" from the menu.

**Expected:** The export card transitions from "Preparing PNG export..." (`informative`) to "Export ready" (`positive`) with a "Download" link. Clicking Download opens the PNG file.

**Why human:** `ExportCardActions.tsx` is a self-contained component; its integration with a specific artifact card on tldraw (passing `versionId`/`brandId`/`artifactType`/`outputProfile` from the canvas reducer) is documented as a known canvas-wiring stub in the 04-04 SUMMARY. Cannot verify canvas placement programmatically.

### 3. RequestPanel brief fields round-trip

**Test:** In the Lab, select "Instagram carousel" as the artifact type. Verify the "Campaign brief" group appears with Audience, Objective, and Channel fields. Fill in values, click "Run generation," and confirm the values appear in the network request body.

**Expected:** Fields visible only for social-post/instagram-carousel; values POST as `audience`, `objective`, `channel` in the run body; web artifact types hide the group.

**Why human:** Progressive-disclosure behavior requires visual/network inspection. The field values are written to `PromptCardShape` props and posted with the run, but the actual DOM reveal/hide behavior requires a running browser.

---

_Verified: 2026-06-02T23:45:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification after gap closure: CR-01 (63ef6f26), CR-02 (df36680f), WR-03 (3284480c)_
