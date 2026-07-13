---
phase: 04-campaign-social
reviewed: 2026-06-02T22:00:00Z
depth: standard
files_reviewed: 32
files_reviewed_list:
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/carouselFrameLayout.ts
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/CarouselGroupFrame.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExportCardActions.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/runStream.ts
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/PromptCardShape.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts
  - apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.tsx
  - apps/platform/src/app/api/experience-lab/export/route.ts
  - apps/platform/src/app/api/experience-lab/resume/route.ts
  - apps/platform/src/app/api/experience-lab/run/route.ts
  - apps/platform/src/lib/playwrightRenderer.ts
  - packages/convex/convex/experienceRuns.ts
  - packages/convex/convex/schema.ts
  - packages/experience-builder-agents/src/agents/plannerAgent.ts
  - packages/experience-builder-agents/src/foundationResolver.ts
  - packages/experience-builder-agents/src/index.ts
  - packages/experience-builder-agents/src/runContext.ts
  - packages/experience-builder-agents/src/runTypes.ts
  - packages/experience-builder-agents/src/steps/carousel.ts
  - packages/experience-builder-agents/src/workflow.ts
  - packages/experience-builder-core/src/contracts/campaignPlan.ts
  - packages/experience-builder-core/src/contracts/foundationResolve.ts
  - packages/experience-builder-core/src/index.ts
  - packages/experience-builder-core/src/profiles/profilePlatformMap.ts
  - packages/experience-builder-export/src/code.ts
  - packages/experience-builder-export/src/exportDispatch.ts
  - packages/experience-builder-export/src/index.ts
  - packages/experience-builder-export/src/pdf.ts
  - packages/experience-builder-export/src/raster.ts
  - packages/shared/src/data/dimension-scales.ts
findings:
  critical: 2
  warning: 5
  info: 3
  total: 10
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-06-02T22:00:00Z
**Depth:** standard
**Files Reviewed:** 32
**Status:** issues_found

## Summary

Phase 04 delivers the campaign/social path inside the isolated Experience Builder Lab: non-web foundation resolver (04-01), campaign planner + HITL suspend/resume (04-02), carousel frame generation (04-03), and export pipeline (04-04). The architecture is sound — ORCH-04 orchestration ownership, Mastra/AI-SDK separation, append-only Convex schema, credential-free render invariant, and the FND-03 "never fabricate" honesty rule are all properly implemented.

Two blockers require attention before this code ships:

1. **A unit-mismatch bug in the mm→px conversion path** (`raster.ts`) causes mm-unit print canvases to export at wildly wrong pixel dimensions. The `pixelDensity` field (device pixel ratio, e.g. 1, 2, 3) is passed to `mmToPx` where the parameter is `ppi` (pixels per inch, e.g. 96, 300). The result is off by roughly a factor of 50–150 for typical print PPI values.

2. **The resume route does not reject requests for the placeholder brand ID** before reading from Convex. Every real-brand guard in the run/export routes correctly gates on `brandId === PLACEHOLDER_BRAND_ID`, but the resume route omits this guard on the HTTP body, allowing fabricated Convex Id strings to be attempted directly against the database.

Five warnings and three info items are documented below.

---

## Critical Issues

### CR-01: `mmToPx` called with device pixel ratio instead of PPI — wrong export dimensions for mm-unit canvases

**File:** `packages/experience-builder-export/src/raster.ts:98-100`

**Issue:** `mmToPx(mm, ppi)` expects a pixels-per-inch value (e.g. 96 for screen, 300 for print) as its second argument. `exportRaster` passes `dims.pixelDensity` — which is the device pixel ratio (1, 2, 3) carried from `platform.pixelDensity` in the foundation. These are different quantities. For a standard A4 print canvas (210×297 mm) with `pixelDensity = 1` and `ppi = 300`:

- **Correct call:** `mmToPx(210, 300)` → 2480 px (A4 at 300 DPI)
- **Actual call:**  `mmToPx(210, 1)` → 8.3 px — completely wrong

The root cause is that `ResolvedDimensionsT` (in `foundationResolve.ts`) carries only `pixelDensity` and not `ppi`, so the correct per-canvas PPI is silently dropped at the resolver boundary. The `foundationResolver.ts` has access to `platform.ppi` but does not include it in `ResolvedDimensionsT`.

All digital canvases (units: 'px') are unaffected. Only `units: 'mm'` print canvases (A4, Business Card, Poster) trigger this path. This is a silent data-corruption bug — the export route returns a valid image/PDF, just at the wrong resolution.

**Fix:** Add `ppi` to `ResolvedDimensionsT` and thread it through:

```typescript
// packages/experience-builder-core/src/contracts/foundationResolve.ts
export const ResolvedDimensions = z.object({
  width: z.number(),
  height: z.number(),
  units: z.enum(['px', 'mm']),
  pixelDensity: z.number(),
  /** Pixels per inch — required for mm→px conversion (distinct from pixelDensity). */
  ppi: z.number(),
  safeAreaInsetToken: z.string().optional(),
}).strict();
```

```typescript
// packages/experience-builder-agents/src/foundationResolver.ts (line ~153)
const pixelDensity = breakpoint.din1450Override?.pixelDensity ?? platform.pixelDensity;
const ppi = breakpoint.din1450Override?.ppi ?? platform.ppi;
// ...
return { ok: true, dims: { width, height, units, pixelDensity, ppi, safeAreaInsetToken } };
```

```typescript
// packages/experience-builder-export/src/raster.ts (lines 98-100)
const width =
  dims.units === 'mm' ? mmToPx(dims.width, dims.ppi) : dims.width;
const height =
  dims.units === 'mm' ? mmToPx(dims.height, dims.ppi) : dims.height;
```

---

### CR-02: Resume route does not guard against the placeholder brand ID — allows unauthenticated Convex queries with arbitrary brand inputs

**File:** `apps/platform/src/app/api/experience-lab/resume/route.ts:111-300`

**Issue:** Every other route in this phase (run, export) checks `brandId === PLACEHOLDER_BRAND_ID` immediately on the HTTP body and returns a clear error. The resume route checks this guard in the injected `makeConvexFoundationsLoader` (line 73) — which prevents the loader from querying foundations — but does NOT guard against the root Convex queries performed on lines 147-153:

```typescript
campaignPlan = await convex.query(api.experienceRuns.getCampaignPlan, {
  runId: runId as Id<'experienceRuns'>,
});
const runRow = await convex.query(api.experienceRuns.getRun, { ... });
```

Any caller who posts `{ runId: "<any-string>", brandId: "jio", directionIndex: 0, frameCount: 1 }` with the placeholder brand will still hit these Convex queries. While `getCampaignPlan` and `getRun` are read-only, the pattern is inconsistent with the guard contract in sibling routes and violates the documented trust boundary (T-04-04): the body must be rejected at the edge before any Convex call.

Additionally, after a successful `getCampaignPlan`, the route proceeds to call `runExperienceWorkflow(input)` where `input.brandId = 'jio'`. Although `makeConvexFoundationsLoader` returns `null` for that brand, the workflow still runs a full campaign planner call (costing model tokens) before gapping on the foundation check.

**Fix:** Add the placeholder guard immediately after body parsing, before any Convex call:

```typescript
// apps/platform/src/app/api/experience-lab/resume/route.ts
// After safeParse succeeds, before convexUrl check:
if (brandId === PLACEHOLDER_BRAND_ID) {
  return new Response(
    JSON.stringify({ error: 'Cannot resume a run for the unsaved placeholder brand.' }),
    { status: 400, headers: { 'Content-Type': 'application/json' } },
  );
}
```

---

## Warnings

### WR-01: `uploadRes.ok` not checked before parsing JSON — silent failure if Convex storage upload fails

**File:** `apps/platform/src/app/api/experience-lab/export/route.ts:118-124`
**Also:** `apps/platform/src/app/api/experience-lab/run/route.ts:85-91`

**Issue:** Both routes call `await uploadRes.json()` and immediately destructure `{ storageId }` from the result without first checking `uploadRes.ok`. If the Convex storage upload returns a non-2xx response (e.g., quota exceeded, transient failure), the destructure silently yields `storageId = undefined`. In `uploadBytes` (export route), `undefined` is then cast to `Id<'_storage'>` and passed to `persistExport`, which would throw "Argument validation error" inside the Convex mutation rather than surfacing a clear error message. In `uploadThumbnail` (run route), the error is caught by the outer try/catch so it degrades gracefully, but the same fix should be applied for consistency.

**Fix:**
```typescript
// In uploadBytes (export/route.ts) and uploadThumbnail (run/route.ts):
if (!uploadRes.ok) {
  throw new Error(
    `Convex storage upload failed: ${uploadRes.status} ${uploadRes.statusText}`
  );
}
const { storageId } = (await uploadRes.json()) as { storageId: Id<'_storage'> };
```

---

### WR-02: `makeResume` (non-campaign HITL) will throw a Zod error if mistakenly called from a campaign suspend

**File:** `packages/experience-builder-agents/src/workflow.ts:1078-1113`

**Issue:** `makeResume` unconditionally calls `ResumeDecisionSchema.parse(decision)` (line 1084). Its public signature accepts `ResumeDecisionT | CampaignResumeT`. If a caller accidentally invokes the non-campaign resume handle (returned from `runExperienceWorkflowHitl`) with a `CampaignResumeT` payload `{ directionIndex, frameCount }`, the parse will throw a Zod `ZodError` rather than a user-facing error. The two resume paths (`makeResume` for non-convergence HITL, `makeCampaignResume` for campaign plans) are different closures on different code paths, so this is unlikely in production, but the inconsistency is fragile.

The `SuspendedRun.resume` type contract (`ResumeDecisionT | CampaignResumeT`) implies either kind is accepted, but `makeResume` rejects `CampaignResumeT` at runtime.

**Fix:** Narrow the signature of `makeResume` to remove the campaign type, or add a runtime discriminant check:

```typescript
// Option A — narrow the signature
function makeResume(ctx: RunContext): (decision: ResumeDecisionT) => Promise<RunExperienceResult | SuspendedRun>
```

Or, if the union signature is kept for the SuspendedRun interface, add a discriminant guard at the top of `makeResume`:

```typescript
if ('directionIndex' in (decision as object)) {
  throw new Error('makeResume received a campaign selection; use makeCampaignResume for campaign runs');
}
```

---

### WR-03: PDF export produces a single-page PDF even for multi-frame carousels — undocumented partial behavior at a public API boundary

**File:** `apps/platform/src/app/api/experience-lab/export/route.ts:251-264`

**Issue:** The comment on line 252 says "compose this version's frame (and any ordered carousel siblings)" but the code only ever adds a single frame to the `PdfFrameJob[]` array. The `getCarouselVersions` query (implemented and tested in `experienceRuns.ts`) is never called by the route. A user exporting a 5-frame carousel as PDF will receive a 1-page document.

The SUMMARY acknowledges this as a known stub but the export route comment is actively misleading — it implies multi-frame PDF works. The route should either implement the multi-frame path or explicitly reject PDF exports for carousel artifacts with a 422.

**Fix:** Either implement the multi-frame path:
```typescript
// After resolvedDimensions is set for pdf kind:
const versionRow2 = await convex.query(api.experienceRuns.getArtifactVersion, {
  versionId: versionId as Id<'experienceArtifactVersions'>,
});
const groupId = (versionRow2?.artifact as { variantGroupId?: string } | null)?.variantGroupId;
let frames: PdfFrameJob[] = [...];
if (groupId) {
  const siblings = await convex.query(api.experienceRuns.getCarouselVersions, {
    variantGroupId: groupId,
  });
  // build frames from siblings...
}
```

Or guard clearly:
```typescript
// In the pdf branch, after fetching versionRow:
// For now: single-frame PDF only; multi-carousel PDF is a known future enhancement.
```

---

### WR-04: `pixelDensity = 0` or negative from the foundation would cause a zero-size or negative viewport in the raster emitter

**File:** `packages/experience-builder-export/src/raster.ts:105`

**Issue:** `const deviceScaleFactor = dims.pixelDensity;` is passed directly to the Playwright `newContext({ deviceScaleFactor })`. Playwright requires `deviceScaleFactor > 0`. If a brand's Platforms foundation contains a zero or negative pixelDensity (which `ResolvedDimensions` schema does not guard against — it uses `z.number()` with no minimum), Playwright will throw and the export will fail with an opaque browser error rather than a clear validation failure.

Similarly, `mmToPx(mm, 0)` would produce 0px width/height if the ppi/pixelDensity were 0.

**Fix:** Add a runtime guard in `exportRaster`:
```typescript
if (!Number.isFinite(deviceScaleFactor) || deviceScaleFactor <= 0) {
  throw new Error(
    `exportRaster: invalid deviceScaleFactor ${deviceScaleFactor} — pixelDensity must be > 0`
  );
}
```

And add `z.number().positive()` to `pixelDensity` in `ResolvedDimensions` (this is safe — `positive()` does not emit Anthropic-rejected `minimum`/`maximum` for number-type schema fields, only for integer-type fields).

---

### WR-05: `consumeASTForRender` and `consumeCodeForRender` do not delete on successful read — in-memory token survives for its full TTL

**File:** `apps/platform/src/lib/playwrightRenderer.ts:74-91`

**Issue:** Both `consumeASTForRender` and `consumeCodeForRender` check expiry but do NOT delete the entry from `renderCache` on a successful read. The `finally` block in `captureASTScreenshots`/`captureCodeScreenshots` deletes the token post-capture (lines 134, 170), but the `consume*` functions themselves are called from external routes (e.g., `/internal/render-ast`, `/internal/render-code`). If the render route is called multiple times (e.g., due to an iframe refresh or a race condition), the cached payload is served again — which is the documented intent for the interactive path.

However, for the Playwright capture path the token is published at 60s TTL with a `finally` delete. A race between a second browser navigation and the `finally` delete could serve the cached payload to an unexpected request. This is low severity for the capture loop (the token is random UUID) but inconsistent with the stated "single-use deletes its token" intent in the comment at line 57.

**Fix:** For the Playwright capture loop, mark the entry as consumed on first read so concurrent navigations cannot serve it:

```typescript
export function consumeCodeForRender(token: string): string | null {
  const entry = renderCache.get(token);
  if (!entry || entry.expiresAt < Date.now() || entry.payload.kind !== 'code') {
    if (entry && entry.expiresAt < Date.now()) renderCache.delete(token);
    return null;
  }
  // Single-use for the capture path; interactive path re-publishes with INTERACTIVE_TOKEN_TTL_MS.
  // Callers that need multi-read (iframe reloads) should re-publish rather than re-consume.
  renderCache.delete(token);
  return entry.payload.code;
}
```

Note: if the interactive path (30-min TTL) relies on repeat reads, the two paths should publish tokens differently (e.g. a `persist: true` flag) to avoid the single-use delete breaking the interactive iframe case.

---

## Info

### IN-01: `window.open` uses `noopener` but not `noreferrer` — platform URL leaked to storage provider in Referer header

**File:** `apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExportCardActions.tsx:197`

**Issue:** `window.open(phase.downloadUrl, '_blank', 'noopener')` opens a Convex signed `_storage` URL. Without `noreferrer`, the browser sends a `Referer` header containing the platform's current URL to the storage server. While the storage provider (Convex) already knows the URL since it generated the signed URL, the missing `noreferrer` is a minor information-disclosure deviation from best practice.

**Fix:**
```typescript
window.open(phase.downloadUrl, '_blank', 'noopener,noreferrer');
```

---

### IN-02: `versionId` in export route is cast directly to `Id<'experienceArtifactVersions'>` without ownership validation

**File:** `apps/platform/src/app/api/experience-lab/export/route.ts:167-170`

**Issue:** The export route validates that `brandId` is not the placeholder but does not verify that the requested `versionId` actually belongs to `brandId`. An authenticated user who knows a `versionId` from another brand's artifact could export it by supplying their own `brandId` in the request body. The `getArtifactVersion` query returns the version regardless of brand; the route only cross-checks that the version exists, not that its `brandId` matches the request.

This is a data isolation gap rather than an authentication bypass (both brands presumably belong to the same organization in the current deployment model), but it violates the brand-scope invariant the route claims (ASVS V4 comment).

**Fix:** After reading `versionRow`, verify the artifact's brand matches the request:
```typescript
const artifactBrandId = (versionRow?.artifact as { brandId?: string } | null)?.brandId;
if (artifactBrandId && artifactBrandId !== brandId) {
  return new Response(
    JSON.stringify({ error: 'Version does not belong to the specified brand.' }),
    { status: 403, headers: { 'Content-Type': 'application/json' } },
  );
}
```

---

### IN-03: `frameLabel` returns "Frame 1 of 0" when called with `total = 0` — defensive guard missing

**File:** `apps/platform/src/app/(platform)/(experience-lab)/_canvas/carouselFrameLayout.ts:45-47`

**Issue:** `frameLabel(index, total)` returns `` `Frame ${index + 1} of ${total}` ``. If `total = 0` (e.g., from an empty `frames` array, which is possible when all frames are repair-exhausted/gap), the label reads "Frame 1 of 0", which is semantically invalid. The `CarouselGroupChrome` derives `total = ordered.length` which would be 0 for an empty carousel. The chrome still renders the outer `<Surface>` and heading without any frame pills, but if `frameLabel` were called with `total = 0` it would produce a confusing label.

Currently `frameLabel` is only called inside the `.map()` over `ordered`, so if `ordered.length === 0` it is never called — the bug is latent rather than active.

**Fix:** Add a guard:
```typescript
export function frameLabel(index: number, total: number): string {
  if (total <= 0) return `Frame ${index + 1}`;
  return `Frame ${index + 1} of ${total}`;
}
```

---

_Reviewed: 2026-06-02T22:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
