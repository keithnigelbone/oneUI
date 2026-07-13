---
phase: 03-preview-eval-repair
reviewed: 2026-06-01T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - apps/platform/src/app/(platform)/(experience-lab)/__tests__/versionTimeline.test.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/runStream.ts
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/ArtifactCardShape.tsx
  - apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts
  - apps/platform/src/app/api/experience-lab/lab-ast-executor.ts
  - apps/platform/src/app/api/experience-lab/run/route.ts
  - apps/platform/src/app/internal/render-ast/page.tsx
  - apps/platform/src/lib/playwrightRenderer.ts
  - packages/experience-builder-preview/src/DaytonaExecutor.ts
  - packages/experience-builder-preview/src/IframeCspExecutor.ts
  - packages/experience-builder-preview/src/PreviewExecutor.ts
findings:
  critical: 2
  warning: 4
  info: 3
  total: 9
status: issues_found
---

# Phase 03 (gap-closure slice 03-08): Code Review Report

**Reviewed:** 2026-06-01T00:00:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Reviewed the gap-closure slice (plan 03-08) covering the live-preview sandbox/origin trust boundary (RC2), AST-token TTL handling (RC1), and CSS scale transform (RC3), plus the full NDJSON stream pipeline from run route to canvas reducer.

**RC2 (sandbox trust scoping) is architecturally sound.** The `sameOrigin: true` flag originates exclusively in `LabAstExecutor.render()` and propagates through `run.previewState?.sameOrigin` in the route. User-supplied request bodies cannot forge it; the executor is hardcoded server-side. `PreviewRegion`'s `previewSameOrigin` prop correctly gates `allow-scripts allow-same-origin` vs strict `allow-scripts`. Tests in `versionTimeline.test.tsx` cover the critical untrusted and trusted paths with real DOM assertions. `DaytonaExecutor` and `IframeCspExecutor` correctly omit `sameOrigin` from their `previewState`, so untrusted-path iframes always receive strict `sandbox="allow-scripts"`.

**RC1 (TTL) is correctly wired:** `publishASTForRender` is called with `INTERACTIVE_TOKEN_TTL_MS` (30 min) and `LabAstExecutor.previewState.expiresAt` is derived from the same constant. The interactive token is intentionally not single-use (iframes reload; the Playwright capture path correctly single-uses its token via `finally` delete).

**RC3 (CSS scale) achieves the horizontal goal** — `scale(calc(100vw / 1440))` maps the 1440px design width onto the iframe viewport width. A height-layout artifact exists (see WR-03).

Two blockers exist: an unhandled-rejection / permanent `isRunning=true` state leak in the canvas reducer on non-2xx or malformed responses, and the response status is never checked before the NDJSON decode begins.

---

## Critical Issues

### CR-01: NDJSON stream has no try/catch — `isRunning` permanently stuck on error/bad-JSON responses

**File:** `apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts:157`

**Issue:** The `for await (const frame of readNdjson(response))` loop and all subsequent state-update code have no `try/catch` and no `finally`. The only `setIsRunning(false)` call is at line 186, which is only reached when the loop exits cleanly. If the server returns `400` with a plain-text body (`'Invalid JSON body'`), `parseRunStreamLine` calls `JSON.parse('Invalid JSON body')` which throws a `SyntaxError`. That error propagates out of the async generator and then out of `runForPrompt`, never reaching line 186. Result: `isRunning` is permanently `true`, the prompt card is permanently in `'running'` state, and the canvas is soft-locked until the page reloads. There is no recovery path.

The same scenario occurs when the Next.js runtime returns an HTML 500 page (e.g., during server-side crashes), because `JSON.parse` of an HTML string also throws.

**Fix:** Wrap the stream decode and state dispatch block in `try/finally`:

```typescript
// After the successful fetch try/catch:
try {
  let result: RunResultFrame | null = null;
  let sawGap = false;
  for await (const frame of readNdjson(response)) {
    if (!frame) continue;
    if (isEventFrame(frame)) {
      setEvents((prev) => [...prev, frame.event]);
      if (frame.event.type === 'gap') {
        sawGap = true;
        flipToGapState(editor, prompt, frame.event);
      }
    } else if (isResultFrame(frame)) {
      result = frame;
    }
  }

  if (result && result.outcome === 'artifact' && result.ir && !sawGap) {
    placeArtifact(editor, prompt, result.ir, { /* ... */ });
    setPromptStatus(editor, promptId, 'valid');
  } else if (sawGap || result?.outcome === 'gap') {
    setPromptStatus(editor, promptId, 'gap');
  } else {
    setPromptStatus(editor, promptId, 'error');
  }
  return result;
} catch (err) {
  console.error('[experience-lab] run stream error:', err);
  setPromptStatus(editor, promptId, 'error');
  return null;
} finally {
  setIsRunning(false);
}
```

---

### CR-02: `response.ok` not checked before NDJSON decode — error bodies silently mis-processed

**File:** `apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts:157`

**Issue:** After a successful `fetch()` (no network error), `readNdjson(response)` is called unconditionally regardless of `response.status`. The run route returns `{ status: 400 }` with either a plain-text body (`'Invalid JSON body'`) or a structured JSON object (`{ error, issues }`). The plain-text path causes `JSON.parse` to throw (see CR-01). The structured-JSON 400 path happens to not crash because `JSON.parse` succeeds on a single JSON object, and the resulting object matches neither `isResultFrame` nor `isEventFrame`, so the loop exits cleanly with `result = null` and `sawGap = false`, hitting the `else` branch which sets `'error'` — correct by coincidence. Any future non-NDJSON error body shape (a Next.js HTML 500 page, a gateway 502) will cause the throw path and the permanent `isRunning=true` state leak described in CR-01.

**Fix:** Add an explicit `ok` guard immediately after the fetch try/catch block:

```typescript
} catch {
  console.error('[experience-lab] run fetch failed');
  setPromptStatus(editor, promptId, 'error');
  setIsRunning(false);
  return null;
}

if (!response.ok) {
  console.error(`[experience-lab] run returned ${response.status}`);
  setPromptStatus(editor, promptId, 'error');
  setIsRunning(false);
  return null;
}
// then: for await (...)
```

---

## Warnings

### WR-01: `uploadThumbnail` does not check `uploadRes.ok` before calling `.json()`

**File:** `apps/platform/src/app/api/experience-lab/run/route.ts:88-90`

**Issue:** After `fetch(uploadUrl, { method: 'POST', ... })`, the code calls `(await uploadRes.json()) as { storageId: Id<'_storage'> }` with no check of `uploadRes.ok`. If the Convex upload URL has expired or the host returns a 4xx, `uploadRes.json()` may succeed (if the error body is JSON) but `storageId` will be `undefined`. The subsequent `convex.query(api.references.getStorageUrl, { storageId: undefined })` then issues an invalid Convex query. The entire `try/catch` in `persistRun` catches the resulting error, so this is non-fatal. However, the thrown error message is `thumbnail upload failed` with no indication that the root cause was `storageId: undefined` rather than a true upload failure, making diagnosis harder than necessary.

**Fix:**

```typescript
const uploadRes = await fetch(uploadUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'image/png' },
  body: png as unknown as BodyInit,
});
if (!uploadRes.ok) {
  throw new Error(
    `Thumbnail upload HTTP ${uploadRes.status} ${uploadRes.statusText}`,
  );
}
const { storageId } = (await uploadRes.json()) as { storageId: Id<'_storage'> };
```

---

### WR-02: Hardcoded fallback credential in middleware — `SITE_PASSWORD ?? 'oneui2026'`

**File:** `apps/platform/src/middleware.ts:30`

**Issue:** `const sitePassword = process.env.SITE_PASSWORD ?? 'oneui2026'` means any deployment that fails to set `SITE_PASSWORD` silently falls back to a string committed in the repository. Anyone who reads the repository source can authenticate against a mis-configured deployment with no credentials. The `/internal/render-ast` route — which serves the first-party AST path and is loaded inside an iframe with `allow-same-origin` (enabling same-origin cookie/storage access) — is behind this middleware. A weak gate is worse than an explicit error, because it creates a false sense of security.

**Fix:** Fail closed when the env var is absent in production:

```typescript
const sitePassword = process.env.SITE_PASSWORD;
if (!sitePassword && process.env.NODE_ENV === 'production') {
  return new Response('Server misconfiguration: SITE_PASSWORD not set', { status: 503 });
}
if (sitePassword && authCookie?.value !== sitePassword) {
  const loginUrl = new URL('/auth', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}
```

---

### WR-03: RC3 CSS scale does not account for layout height — iframe preview shows bottom blank space

**File:** `apps/platform/src/app/internal/render-ast/page.tsx:66-71`

**Issue:** The inner div is given `width: 1440px` and `transform: scale(calc(100vw / 1440))`. CSS `transform` scales the visual rendering but does **not** affect the layout box. At artifact-card preview size (≈ 360px iframe width, 16:9 aspect ratio ≈ 202px height), the scale factor is 0.25. The inner div's layout height remains its unscaled natural value (e.g., 800px for a typical page). The outer div clips overflow via `overflow: hidden` in both axes, but the iframe height is constrained to the card's preview region (≈ 202px). The visible portion is limited to the top `(iframe_height / scale_factor)` = 808px of the design's natural height.

For typical app-screen compositions that are shorter than the viewport (e.g., a hero section at 400px natural height), visual height after scale = 100px, leaving 102px of the iframe as blank `--Surface-Main` background. The horizontal RC3 goal ("visible, not cropped") is met; the vertical behaviour is deterministic but not documented, and for short compositions most of the preview region shows background rather than content.

**Fix (if full proportional fit is desired):** Shrink the layout height to match the visual footprint after scaling:

```typescript
style={{
  width: `${DESIGN_VIEWPORT_WIDTH}px`,
  // Without this, layout height remains unscaled and the iframe shows blank below content.
  // height: 0 + paddingBottom collapses the layout box to the visual scaled height.
  transformOrigin: 'top left',
  transform: `scale(calc(100vw / ${DESIGN_VIEWPORT_WIDTH}))`,
}}
```

Because `transform: scale(S)` shrinks visuals but not layout, the standard fix is to follow the transform with a negative `margin-bottom` equal to `(1 - S) * naturalHeight`. Since natural height is not known statically, document the current behaviour explicitly if intentional top-crop is acceptable.

---

### WR-04: `IframeCspExecutor` returns `rendered: true` unconditionally — inconsistent with `DaytonaExecutor`

**File:** `packages/experience-builder-preview/src/IframeCspExecutor.ts:148-150`

**Issue:** `return { screenshots, previewState: { url, expiresAt }, rendered: true }` is emitted regardless of whether any screenshots were captured. If `input.profiles` is empty (which `RenderInput` allows — no minimum-length constraint on `profiles: PreviewProfile[]`), the capture loop runs zero iterations, `screenshots` is `[]`, but `rendered: true` is still set. Downstream consumers that gate logic on `rendered` (e.g., VAL-06 render-success, thumbnail upload guard) will believe a render occurred when none did.

`DaytonaExecutor` correctly uses `rendered: screenshots.length > 0` at line 137, establishing the intended convention.

**Fix:**

```typescript
return {
  screenshots,
  previewState: { url, expiresAt },
  rendered: screenshots.length > 0,
};
```

---

## Info

### IN-01: Misleading security comment in `render-ast/page.tsx` — `x-internal-render` secret is not implemented

**File:** `apps/platform/src/app/internal/render-ast/page.tsx:6-7`

**Issue:** The module docstring states "gated by an `x-internal-render` secret when deployed". No such check exists in this file, the middleware, or any route handler. The route is protected only by the `oneui_auth` cookie in `middleware.ts`. This is adequate for the current use case (same-origin iframe sends the cookie automatically), but the comment creates a false expectation that an independent second gate exists. A future developer who reads only this file's docstring may remove the middleware cookie check while believing the secret-header gate still protects the route.

**Suggestion:** Remove or correct the comment to accurately describe the actual security model: the `oneui_auth` cookie checked by `middleware.ts`.

---

### IN-02: `ArtifactCardBody` suppresses `PreviewRegion` entirely when both URL props are empty — "Preview loading…" placeholder is unreachable

**File:** `apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/ArtifactCardShape.tsx:274`

**Issue:** The guard `{(shape.props.previewUrl || shape.props.thumbnailUrl) && <PreviewRegion .../>}` means a freshly-created card with both defaults as empty strings never renders the preview region, including the "Preview loading…" placeholder defined inside `PreviewRegion`'s fallback branch. Users see no visual indication that a preview is pending for newly-placed artifact cards. The "Preview loading…" text (line 225) is dead code for this common case.

**Suggestion:** Remove the outer URL guard and let `PreviewRegion` handle the empty-URL case via its own branch logic — it already falls through to the placeholder when lifecycle is not `'live'` or `'thumbnail'` with a valid URL.

---

### IN-03: `versionTimeline.test.tsx` LAB-03 isolation check fails-with-error (not fails-with-assertion) when a file is missing

**File:** `apps/platform/src/app/(platform)/(experience-lab)/__tests__/versionTimeline.test.tsx:223-233`

**Issue:** The LAB-03 isolation loop calls `readFileSync(join(labRoot, rel), 'utf8')` for each listed file with no guard. If a file moves or is deleted before the test suite is updated, `readFileSync` throws `ENOENT`. Vitest reports this as an error (red), not a test failure (also red), but the distinction matters: a future refactor could relocate `VariantGroupFrame.tsx` or `VersionTimelinePanel.tsx` and the isolation invariant would disappear silently, appearing only as a test error rather than a clear "isolation check failed" message.

**Suggestion:** Guard each `readFileSync` with an `existsSync` check and emit a descriptive `expect` failure:

```typescript
import { existsSync, readFileSync } from 'node:fs';
// ...
for (const rel of LAB_FILES) {
  const filePath = join(labRoot, rel);
  expect(existsSync(filePath), `LAB-03: file not found: ${rel}`).toBe(true);
  const src = readFileSync(filePath, 'utf8');
  // ... existing assertions
}
```

---

_Reviewed: 2026-06-01T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
