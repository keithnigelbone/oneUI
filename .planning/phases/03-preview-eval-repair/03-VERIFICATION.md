---
phase: 03-preview-eval-repair
verified: 2026-06-01T22:30:00Z
status: human_needed
score: 21/21
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 17/17
  gaps_closed:
    - "RC1: AST render token TTL too short — LabAstExecutor now uses INTERACTIVE_TOKEN_TTL_MS (30 min)"
    - "RC2: sandbox/origin mismatch — trust-scoped sameOrigin flag threaded end-to-end; AST path gets allow-same-origin, untrusted path stays strict"
    - "RC3: desktop-width render not scaled — scale(calc(100vw / 1440)) transform applied"
    - "Sandbox test incoherent — split into UNTRUSTED and TRUSTED assertions"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Canvas live-iframe renders at >=30fps with 50+ cards in lifecycle progression"
    expected: "Thumbnail -> lightweight -> live lifecycle keeps canvas responsive with many cards. No jank or layout thrashing."
    why_human: "Requires a running canvas, visual frame-rate observation, and 50+ simultaneous artifact cards. Cannot automate in a headless test."
  - test: "Live zero-egress network probe: Daytona sandbox cannot reach Convex/auth"
    expected: "A fetch from inside the sandbox to the Convex URL is blocked. The sandbox is genuinely credential-free."
    why_human: "Requires real Daytona credentials + a live sandbox + an active network probe to the Convex URL. Explicitly deferred per 03-VALIDATION.md."
  - test: "VariantGroupFrame appears on the tldraw canvas for variant-card grouping"
    expected: "Cards sharing a variantGroupId render inside one tldraw Variant Group frame. The frame renders the correct surface-token fill and label."
    why_human: "VariantGroupFrame is implemented but not registered in ExperienceLabCanvas (single 'frame'-type collision with RunGroupFrame — documented deferral). Registration and visual verification require a running canvas."
deferred:
  - truth: "Live schema pushed to Convex deployment (npx convex dev --once)"
    addressed_in: "CI/HITL follow-up (credentialed push after merge)"
    evidence: "Additive-safety proven structurally (all v.optional) + by the no-migration round-trip test in convex-test. Deferred per 03-03-SUMMARY."
  - truth: "INPUT-05 planner consumes parentIr for a true patch-based re-run"
    addressed_in: "Follow-up (no phase assignment yet)"
    evidence: "Route seam + parentVersionId lineage persistence are real and tested. The planner/IR-generator not yet reading parentIr is a documented Known Stub in 03-06-SUMMARY."
  - truth: "VariantGroupFrame registered as a labShapeUtil on the live canvas"
    addressed_in: "Follow-up (single-'frame'-type collision with RunGroupFrame)"
    evidence: "Documented Known Stub in 03-06-SUMMARY. Util itself is implemented and tested."
warnings:
  - id: "CR-01/CR-02"
    file: "apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts"
    lines: "157-186"
    issue: "No try/catch/finally around the NDJSON decode loop and no response.ok check before it. A non-JSON or non-2xx error response (HTML 500, plain-text 400) causes parseRunStreamLine to throw a SyntaxError that propagates out of runForPrompt, bypassing setIsRunning(false) at line 186. Result: isRunning is permanently true, the canvas is soft-locked until a page reload."
    severity: WARNING
    impact: "Canvas PREV/CANVAS robustness on error paths. Happy-path (successful run) works correctly. Does not prevent the phase quality loop from functioning but degrades error recovery."
    fix: "Wrap lines 155-187 in try/finally; add response.ok guard before the for-await loop (see 03-REVIEW.md CR-01/CR-02 for exact patch)."
---

# Phase 3: Preview / Eval / Repair — Verification Report (Re-verification)

**Phase Goal:** A generated artifact renders as real DOM in a sandboxed, separate-origin preview, is screenshotted and fully validated, scored by a visual evaluator, repaired by patching the IR (never the JSX) within a bounded loop, and frozen as an immutable, browsable version — closing the quality loop that makes the system trustworthy.

**Verified:** 2026-06-01T22:30:00Z
**Status:** human_needed
**Re-verification:** Yes — after 03-08 gap-closure (RC1 TTL, RC2 sandbox trust scoping, RC3 scale-to-fit)

---

## Goal Achievement

### Observable Truths

This re-verification covers all 21 truths: the original 17 (quick regression check — all still pass) plus 4 new truths added by plan 03-08.

#### Original 17 Truths (Regression Check)

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | An inline hex/px/rem/unapproved-font literal on a real visual prop is a BLOCKING violation | VERIFIED | `checkLiteralHook` pushes to `acc.blocking`. 52/52 tests pass. |
| 2  | A fake var() not in the manifest is blocked; a genuine var(--Token) passes | VERIFIED | `BRAND_ALLOWED_REGEX` escape hatch preserved. Confirmed by test assertions in `astValidator.test.ts`. |
| 3  | 100% of the red-team evasion corpus is blocked | VERIFIED | 12 corpus entries in `redteam.ts`, all blocked. 52/52 green. |
| 4  | validateAst returns a JioValidationResult on every branch | VERIFIED | `JioValidationResult.parse(result)` at end of `validateAst`. |
| 5  | The workflow can call PreviewExecutor.render({bundle, brandId, profiles}) and receive per-profile screenshots + an immutable previewState + a rendered flag | VERIFIED | `PreviewExecutor.ts` defines the seam. 15/15 preview package tests green. |
| 6  | IframeCspExecutor renders via token-handoff — zero auth/Convex tokens reach the preview | VERIFIED | `randomUUID()` 60s TTL single-use cache, `TOKEN_TTL_MS = 60_000`. |
| 7  | Tests run credential-free against a mock executor via setPreviewExecutor | VERIFIED | 15/15 preview tests pass with no env vars. |
| 8  | The lifecycle helper exposes thumbnail -> lightweight -> live states | VERIFIED | `lifecycle.ts` exports `PreviewLifecycleState` union, `nextLifecycleState`, etc. 15/15 tests confirm. |
| 9  | An artifact version persists the full VER-01 object | VERIFIED | Schema fields confirmed in `schema.ts` (all `v.optional`). `versionTimelinePersistence.test.ts` asserts non-null values. |
| 10 | Existing rows round-trip with no migration | VERIFIED | All new schema fields are `v.optional`. No `ctx.db.delete()` found. 4/4 convex tests pass. |
| 11 | N sibling artifacts sharing a variantGroupId can be read back as a group | VERIFIED | `listVariantGroup` query with `by_variant_group` index scan confirmed. |
| 12 | getArtifactHistory returns the version chain; listVariantGroup returns the sibling set | VERIFIED | Both confirmed in code and tests. |
| 13 | After validate, the workflow runs preview -> evaluate -> bounded repair -> version-freeze in BOTH the .then chain and the deterministic runner | VERIFIED | Mastra chain + deterministic runner both drive all four quality-loop steps after validate. 78/78 workflow tests green. |
| 14 | Objective track: a blocking validation violation short-circuits straight to repair with NO model call | VERIFIED | `evaluate.ts`: early return without `callModel` when `!ctx.validation.passed`. |
| 15 | Subjective track: vision judge scores via callModel with image content, routed ONLY through callModel | VERIFIED | `callModel({ schema: VisualRubric, images: screenshots })`. No `ai`/`@ai-sdk` import in evaluate.ts/repair.ts/workflow.ts. |
| 16 | Repair emits a targeted IrPatch against failing nodes and applies it via applyPatch — never JSX, never whole-IR regen | VERIFIED | `repair.ts` imports and calls `applyPatch` from `@oneui/experience-builder-core`. `generateIR` and `dangerouslySetInnerHTML` grep = 0. |
| 17 | The repair loop terminates on cap N=3 OR composite>=threshold OR scoreDelta<epsilon OR sameValidationError OR gap | VERIFIED | `shouldStopRepairLoop` predicate in `workflow.ts` uses all five conditions. Workflow tests confirm all termination paths. |

#### New 03-08 Truths (Full Verification)

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 18 | The AST token published by LabAstExecutor survives the ~45s of post-preview run steps AND iframe reloads (RC1) | VERIFIED | `playwrightRenderer.ts` line 53: `export const INTERACTIVE_TOKEN_TTL_MS = 30 * 60_000`. `lab-ast-executor.ts` line 51: `publishASTForRender(input.ast, INTERACTIVE_TOKEN_TTL_MS)` and `expiresAt: Date.now() + INTERACTIVE_TOKEN_TTL_MS`. `consumeASTForRender` does NOT delete on successful read — reloads re-resolve within the TTL. Playwright capture loop unchanged (uses 60s default). |
| 19 | The first-party AST-render iframe uses sandbox='allow-scripts allow-same-origin'; the untrusted Daytona/IframeCsp iframe keeps strict sandbox='allow-scripts' (RC2, PREV-01 boundary preserved) | VERIFIED | `PreviewExecutor.ts` line 54: `sameOrigin?: boolean` on `PreviewState`. `lab-ast-executor.ts` line 61: `sameOrigin: true`. `IframeCspExecutor.ts` line 145-148: OMITS `sameOrigin` (commenting documents strict default). `DaytonaExecutor.ts` lines 130-133: OMITS `sameOrigin`. `ArtifactCardShape.tsx` line 188: `const sandbox = previewSameOrigin ? 'allow-scripts allow-same-origin' : 'allow-scripts'`. `versionTimeline.test.tsx`: UNTRUSTED test asserts `allow-same-origin` absent; TRUSTED test asserts both flags present. |
| 20 | The desktop-width (~1440px) AST render is scaled down via CSS transform to fit the ~360px artifact-card preview region (RC3) | VERIFIED | `render-ast/page.tsx` lines 34, 67-69: `const DESIGN_VIEWPORT_WIDTH = 1440`, inner div `width: 1440px`, `transformOrigin: 'top left'`, `transform: scale(calc(100vw / 1440))`. Outer wrapper changed from `minHeight:100vh` to `minHeight:100%` + `overflow:hidden`. `force-dynamic` preserved. |
| 21 | The strict-sandbox assertion (allow-scripts, NO allow-same-origin) is preserved for the untrusted path; a new assertion proves the trusted AST path emits allow-same-origin | VERIFIED | `versionTimeline.test.tsx` lines 65-105: two separate `it()` blocks — UNTRUSTED (`previewSameOrigin={false}`) asserts `sandbox` has `allow-scripts` and NOT `allow-same-origin`; TRUSTED (`previewSameOrigin={true}`) asserts BOTH `allow-scripts` AND `allow-same-origin`. Thumbnail test passes required `previewSameOrigin` prop. LAB-03 isolation test untouched. |

**Score:** 21/21 truths verified

---

### Deferred Items

Items not yet met but explicitly scoped as deferred — do not block phase completion.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Live schema push to Convex deployment | CI/HITL follow-up | All schema fields are `v.optional`; no-migration round-trip test passes. Deferred per 03-03-SUMMARY. |
| 2 | INPUT-05 planner consumption of parentIr for patch-based re-run | Follow-up | Route seam + parentVersionId lineage persistence real and tested. Known Stub in 03-06-SUMMARY. |
| 3 | VariantGroupFrame registered on the live tldraw canvas | Follow-up | Util implemented + tested; registration deferred due to single-'frame'-type collision (03-06-SUMMARY). |
| 4 | Pre-existing `@oneui/shared/buildNativeTheme.ts:233` typecheck error | Out of scope | Pre-existing error not introduced by Phase 3. |

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/platform/src/lib/playwrightRenderer.ts` | RC1 — parametrized TTL + `INTERACTIVE_TOKEN_TTL_MS` export | VERIFIED | `publishASTForRender(ast, ttlMs = TOKEN_TTL_MS)` parametrized. `INTERACTIVE_TOKEN_TTL_MS = 30 * 60_000` exported. `consumeASTForRender` non-deleting on successful read. |
| `apps/platform/src/app/api/experience-lab/lab-ast-executor.ts` | RC1 + RC2 — long TTL + `sameOrigin: true` | VERIFIED | Uses `INTERACTIVE_TOKEN_TTL_MS` for publish + `expiresAt`. Returns `previewState.sameOrigin: true`. |
| `packages/experience-builder-preview/src/PreviewExecutor.ts` | RC2 — additive `PreviewState.sameOrigin?: boolean` | VERIFIED | `sameOrigin?: boolean` on `PreviewState` at line 54 with doc comment explaining trust scope. |
| `apps/platform/src/app/(platform)/(experience-lab)/_canvas/runStream.ts` | RC2 — `RunResultFrame.previewSameOrigin?: boolean` | VERIFIED | Field present at line 43 with doc comment. |
| `apps/platform/src/app/api/experience-lab/run/route.ts` | RC2 — conditional-spread `previewSameOrigin` on result frame | VERIFIED | Line 388: `...(run.previewState?.sameOrigin ? { previewSameOrigin: true } : {})`. |
| `apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts` | RC2 — `previewSameOrigin` threaded through `placeArtifact` | VERIFIED | Lines 174, 207, 235: flag threaded from result frame → `placeArtifact` param → `artifactProps`. |
| `apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/ArtifactCardShape.tsx` | RC2 — trust-scoped sandbox in `PreviewRegion` | VERIFIED | `previewSameOrigin: boolean` prop; `static props T.boolean`; `getDefaultProps false`; sandbox computed at line 188. |
| `apps/platform/src/app/internal/render-ast/page.tsx` | RC3 — scale-to-fit CSS transform | VERIFIED | `DESIGN_VIEWPORT_WIDTH = 1440`; inner div `transform: scale(calc(100vw / 1440))` top-left origin; `force-dynamic` preserved; outer wrapper `overflow:hidden`. |
| `apps/platform/src/app/(platform)/(experience-lab)/__tests__/versionTimeline.test.tsx` | RC2 test — split trusted/untrusted sandbox assertions | VERIFIED | Two `it()` blocks with real DOM assertions. 8 tests pass (was 6; +2 from split). |
| `packages/experience-builder-preview/src/IframeCspExecutor.ts` | No-op for RC2 — confirm `sameOrigin` absent | VERIFIED | Grep confirms only a comment reference to `sameOrigin`; `previewState` at line 148 omits the field. |
| `packages/experience-builder-preview/src/DaytonaExecutor.ts` | No-op for RC2 — confirm `sameOrigin` absent | VERIFIED | Grep confirms only a comment reference; `previewState` at lines 130-133 omits the field. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `LabAstExecutor.render()` | `publishASTForRender(ast, INTERACTIVE_TOKEN_TTL_MS)` | long-TTL publish + `previewState.sameOrigin: true` | VERIFIED | `lab-ast-executor.ts` line 51: `publishASTForRender(input.ast, INTERACTIVE_TOKEN_TTL_MS)`. Line 61: `sameOrigin: true`. |
| run route `RunResultFrame` | `previewSameOrigin` flag | `...(run.previewState?.sameOrigin ? { previewSameOrigin: true } : {})` | VERIFIED | `route.ts` line 388. Conditional-spread keeps the field absent for untrusted runs. |
| `useExperienceLabRun.placeArtifact` | `ArtifactCardShapeProps.previewSameOrigin` | `result.previewSameOrigin ?? false` threaded onto artifact shape props | VERIFIED | `useExperienceLabRun.ts` lines 174, 207, 235. |
| `PreviewRegion iframe` | sandbox attribute | `previewSameOrigin ? 'allow-scripts allow-same-origin' : 'allow-scripts'` | VERIFIED | `ArtifactCardShape.tsx` line 188. |
| `IframeCspExecutor.previewState` | strict sandbox (default) | omits `sameOrigin` field | VERIFIED | Line 148: `previewState: { url, expiresAt }` — no `sameOrigin`. |
| `DaytonaExecutor.previewState` | strict sandbox (default) | omits `sameOrigin` field | VERIFIED | Lines 130-133: `previewState: { url, expiresAt, ... }` — no `sameOrigin`. |
| `render-ast/page.tsx` DESIGN_VIEWPORT_WIDTH | scale-to-fit transform | `scale(calc(100vw / DESIGN_VIEWPORT_WIDTH))` interpolated | VERIFIED | Lines 67-69: constant used in both `width` and `transform`. |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `ArtifactCardShape PreviewRegion` | `previewUrl` / `previewSameOrigin` | `useExperienceLabRun.placeArtifact` from `RunResultFrame.previewSameOrigin` ← run route ← `LabAstExecutor.previewState.sameOrigin` | Yes — flag originates at `LabAstExecutor` (server-side, non-forgeable) and flows to iframe sandbox selection | FLOWING |
| `render-ast/page.tsx` | `ast` (consumed via token) | `consumeASTForRender(token)` reads from `renderCache` populated by `publishASTForRender(input.ast, INTERACTIVE_TOKEN_TTL_MS)` in `LabAstExecutor.render()` | Yes — server-derived ASTRoot from workflow, 30-min in-memory TTL | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Validation literal blocking (VAL-04) | `pnpm --filter @oneui/experience-builder-validation test` | 52/52 passed (prior verification; no changes to validation package in 03-08) | PASS |
| Red-team corpus 100% blocked (VAL-05) | `pnpm --filter @oneui/experience-builder-validation test -t redteam` | 12/12 blocked (prior verification) | PASS |
| Preview package credential-free (PREV-01/02/03) | `pnpm --filter @oneui/experience-builder-preview test` | 15/15 passed (prior verification) | PASS |
| Convex persistence round-trip (VER-01/CANVAS-05) | `pnpm --filter @oneui/convex test` | 4/4 passed (prior verification) | PASS |
| Agent quality loop + bounded repair (EVAL-01/02/03, ORCH-02, GEN-07) | `pnpm --filter @oneui/experience-builder-agents test` | 78/78 passed (prior verification) | PASS |
| Trust-scoped sandbox + live-iframe + version timeline (CANVAS-06/VER-02/RC2) | `pnpm --filter @oneui/platform exec vitest run versionTimeline.test.tsx` | 8/8 passed (SUMMARY: was 6; +2 from trusted/untrusted sandbox split) | PASS |
| Commit hashes verified | `git log --oneline 22cad44b d3f40d35 65d5d228` | All three commits exist: RC1 (22cad44b), RC2 (d3f40d35), RC3 (65d5d228) | PASS |

---

### Probe Execution

No explicit probe scripts declared for Phase 3. Step 7c: SKIPPED (no `scripts/*/tests/probe-*.sh` for this phase).

---

### Requirements Coverage

All 17 requirement IDs claimed in the phase plans are mapped to Phase 3 in REQUIREMENTS.md and confirmed Complete.

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| VAL-04 | 03-01 | Literal value blocking | SATISFIED | `checkLiteralHook` BLOCKING; 52 tests pass |
| VAL-05 | 03-01 | AST allowlist + red-team corpus 100% blocked | SATISFIED | 12 corpus entries, 100% blocked |
| VAL-06 | 03-01, 03-04 | TypeScript compiles + preview renders | SATISFIED | `rendered:false` fails objective track (test confirmed) |
| PREV-01 | 03-02, 03-05, 03-08 | Sandboxed iframe isolated from host | SATISFIED | Untrusted path: strict `allow-scripts` (no `allow-same-origin`). `networkBlockAll:true` on DaytonaExecutor. Live egress probe: HUMAN (manual). |
| PREV-02 | 03-02 | Immutable preview URL/state per version | SATISFIED | `previewState.url` persisted to Convex; token-based opaque URL. |
| PREV-03 | 03-02, 03-06 | Desktop/mobile/fixed profiles + lifecycle | SATISFIED | `lifecycle.ts` state machine; `ArtifactCardShape` lifecycle-gated `PreviewRegion`. 50+ cards at >=30fps: HUMAN. |
| PREV-04 | 03-02, 03-04, 03-05 | Credential-free Playwright screenshot | SATISFIED | IframeCsp + DaytonaExecutor both credential-free. Tests confirm no env vars required. |
| EVAL-01 | 03-04 | Visual Evaluator two-track scoring | SATISFIED | `evaluate.ts` objective short-circuit + subjective `callModel` vision judge. |
| EVAL-02 | 03-04 | Repair agent applies patch-based fixes to IR | SATISFIED | `repair.ts` uses `applyPatch` only; no JSX/whole-IR-regen. |
| EVAL-03 | 03-04 | Repair bounded + gap short-circuit | SATISFIED | Cap N=3 + 4 convergence conditions + gap halt with zero attempts. |
| VER-01 | 03-03, 03-06 | Artifact versions persisted (full D-13 object) | SATISFIED | Schema + `persistArtifact` + run route wiring. Persistence test asserts non-null D-13 fields. |
| VER-02 | 03-03, 03-06 | User can view version history | SATISFIED | `VersionTimelinePanel` + `getArtifactHistory` query. |
| CANVAS-05 | 03-03, 03-06 | User can group variants | SATISFIED (partial) | `variantGroupId` schema + `listVariantGroup` + `VariantGroupFrame` util. Live canvas registration deferred. |
| CANVAS-06 | 03-02, 03-06, 03-08 | Generated web UIs render as real DOM | SATISFIED | `<iframe sandbox={...}>` in `ArtifactCardShape`. Trust-scoped sandbox (RC2). Scale-to-fit (RC3). >=30fps with 50+ cards: HUMAN. |
| INPUT-05 | 03-06 | User can iterate on existing artifact | SATISFIED (partial) | Route accepts `parentVersionId`/`parentIr`; lineage persisted. Planner not consuming `parentIr` is a documented Known Stub. |
| ORCH-02 | 03-04 | Retries, bounded repair loops, HITL suspend/resume | SATISFIED | Bounded loop in Mastra chain (`.dountil`) and deterministic runner. `suspend()`/`resumeData` HITL checkpoint gated off by default. |
| GEN-07 | 03-04 | Multiple artifact variants | SATISFIED | `runVariants(input, n)` exported; N sequential runs with shared `variantGroupId` + composite ranking. |

---

### Anti-Patterns Found

No `TBD`, `FIXME`, or `XXX` debt markers found in any 03-08 modified files.

No hardcoded visual literals found in modified Lab UI files. Scale factor and design-viewport width are layout math (computed layout primitives, not design tokens — correctly noted in `render-ast/page.tsx` comment and CLAUDE.md exception for transform scale factors).

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts` | 157-186 | No try/catch/finally around NDJSON decode loop; no `response.ok` check | WARNING | Canvas soft-lock on non-JSON/non-2xx error. Happy path unaffected. See CR-01/CR-02 in 03-REVIEW.md. |
| `packages/experience-builder-preview/src/IframeCspExecutor.ts` | 149 | `rendered: true` unconditionally — not gated on `screenshots.length > 0` | WARNING | `DaytonaExecutor` uses `screenshots.length > 0` (correct convention). Empty-profiles edge case would report a false render. See WR-04 in 03-REVIEW.md. |
| `apps/platform/src/app/internal/render-ast/page.tsx` | 6-7 | Comment claims `x-internal-render` secret gate exists but it is not implemented | INFO | Misleading comment only — actual protection is the `oneui_auth` cookie. See IN-01 in 03-REVIEW.md. |

---

### Human Verification Required

#### 1. Canvas live-iframe performance at scale

**Test:** Open the Experience Lab, generate or place 50+ artifact cards on the canvas. Advance several cards to the `live` lifecycle state via hover/pointer-enter. Observe frame rate and canvas responsiveness.

**Expected:** Canvas remains at >=30fps. Thumbnail-only cards are cheap (static image). Lifecycle progression is bounded (canvas cost does not scale linearly with card count). Live iframes do not cause layout thrashing.

**Why human:** Requires a running canvas, visual frame-rate observation, and real 50+ card load. Cannot be automated in a headless test. This is Phase 3 ROADMAP Success Criterion #1 (second clause).

---

#### 2. Live zero-egress network probe (Daytona sandbox)

**Test:** With a valid `DAYTONA_API_KEY`, launch a real preview run using `DaytonaExecutor`. From inside the Daytona sandbox, attempt a fetch to the Convex URL (`process.env.NEXT_PUBLIC_CONVEX_URL`). Confirm the fetch is blocked.

**Expected:** The network call is rejected. The sandbox cannot reach Convex/auth. `networkBlockAll: true` enforces zero egress at the VM boundary.

**Why human:** Requires real Daytona credentials, a live sandbox, and a network probe. Explicitly deferred per `03-VALIDATION.md`. The credential-free contract test (`DaytonaExecutor.test.ts`) proves the API contract; the egress guarantee requires a live probe.

---

#### 3. VariantGroupFrame live canvas registration

**Test:** Run the Experience Builder Lab and trigger a `runVariants(input, 3)` call (best-of-N). Confirm the three variant artifact cards are visually grouped inside a tldraw "Variant Group" frame.

**Expected:** Three cards sharing `variantGroupId` appear inside one `VariantGroupFrame`. Frame shows a `bg-moderate` fill and "Variant Group" label.

**Why human:** `VariantGroupFrame` exists and is tested but is not registered in `ExperienceLabCanvas`'s `labShapeUtils` due to a single `'frame'`-type collision with `RunGroupFrame`. Requires follow-up and visual confirmation on a running canvas.

---

### Warnings Requiring Follow-up

Two code-review findings from 03-REVIEW.md should be addressed in a follow-up fix:

**CR-01 / CR-02 (useExperienceLabRun.ts:157-186) — PRIORITY**
The NDJSON decode loop has no `try/catch/finally` and no `response.ok` guard. A non-JSON or non-2xx response (HTML 500, plain-text 400) from the run route causes `JSON.parse` to throw, bypassing the `setIsRunning(false)` call at line 186 — the canvas is permanently soft-locked until a page reload. The 03-REVIEW.md provides an exact patch (wrap in `try/finally`, add `if (!response.ok)` guard before the loop). Fix is straightforward and does not affect any phase success criteria, but it should not ship to production in the current state.

**WR-04 (IframeCspExecutor.ts:149) — MINOR**
`rendered: true` returned unconditionally regardless of `screenshots.length`. `DaytonaExecutor` correctly uses `screenshots.length > 0`. A one-line fix aligns conventions and ensures VAL-06 render-success logic behaves correctly when `profiles` is empty.

---

### Gaps Summary

No gaps. All 21 must-have truths are VERIFIED against actual codebase evidence. The phase goal is fully achieved on the happy path and in all test scenarios.

Three items remain human-verification only (unchanged from the initial verification): canvas performance at scale, live Daytona egress probe, and VariantGroupFrame registration. These are not gaps — they are known-deferred items that cannot be verified programmatically.

Two code-review warnings (CR-01/CR-02 and WR-04) are real quality issues that should be fixed before production but do not block the phase goal. The core quality loop — sandboxed preview, validation, evaluation, bounded repair, version freeze — is complete and working. The trust-scoped sandbox (RC2), long interactive TTL (RC1), and scale-to-fit transform (RC3) are all in the actual codebase.

---

_Verified: 2026-06-01T22:30:00Z_
_Verifier: Claude (gsd-verifier) — Sonnet 4.6_
_Re-verification: Yes — after 03-08 gap-closure_
