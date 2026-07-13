---
phase: 01-isolated-foundation
verified: 2026-05-31T00:47:00Z
status: passed
human_approved: 2026-05-31
score: 5/5 must-haves verified
overrides_applied: 0
human_uat_notes: "Both human-UAT items confirmed by the user during UAT. Two fixes applied while testing: mounted PlatformNavigationProvider (PRE-EXISTING shell crash, not Phase 1 — commit b90e33ad) and made the Lab canvas full-bleed (commit 5a3fe2ce)."
re_verification:
  previous_status: gaps_found
  previous_score: 4/5
  gaps_closed:
    - "A generation run + its IR persist to the experience* Convex tables (VER-03)"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Walking-skeleton end-to-end feel"
    expected: "Open /lab route, place a prompt card, pick brand/artifact type/output profile, enter a prompt, click Run, and watch a valid-IR artifact card appear inside a Run #N frame via the streamed event log"
    why_human: "Visual and interaction judgment on canvas behaviour; jsdom tests cover the mechanics but not the perceived fidelity of the streaming animation and card layout"
  - test: "Gap-report UX"
    expected: "Run with a non-web output profile (e.g. instagram-carousel) — the foundation-profile card should flip to its 'Foundation gap' typed-gap state and NO artifact card should be produced"
    why_human: "Visual confirmation of the card-flip animation and the gap copy; jsdom tests cover the state logic but not the visual rendering"
---

# Phase 01: Isolated Foundation — Verification Report

**Phase Goal:** As a Jio designer, I want to open an isolated Jio-DS-only Lab, place a prompt card, pick a brand/artifact-type/output-profile, run a mock generation, and watch a valid-IR artifact card appear on the canvas, so that I can prove every contract is production-shaped and every HIGH-severity risk is designed out before any real wiring.

**Verified:** 2026-05-31T00:47:00Z
**Status:** passed (human-approved 2026-05-31)
**Re-verification:** Yes — after VER-03 gap closure (commit `50dc8d0a`)

---

## VER-03 Gap Closure Summary

**Previous finding:** `apps/platform/src/app/api/experience-lab/run/route.ts` had no Convex client import and called none of the three persistence mutations (`createRun`, `recordRunEvents`, `persistArtifact`), making every run ephemeral despite the Convex schema tables and mutations being fully defined in `packages/convex/convex/experienceRuns.ts`.

**Fix commit:** `50dc8d0a fix(01): wire Convex run persistence into run route (VER-03 gap closure)`

**Wiring verified (route.ts lines 36-106):**

- `ConvexHttpClient` imported from `convex/browser` (line 36)
- `api` imported from `@oneui/convex` (line 37)
- `persistRun()` async helper added (lines 55-106) that calls:
  - `convex.mutation(api.experienceRuns.createRun, ...)` — always first
  - `convex.mutation(api.experienceRuns.recordRunEvents, ...)` — always after
  - `convex.mutation(api.experienceRuns.persistArtifact, ...)` — only when `outcome === 'artifact'` and `run.ir` is present (gap/error runs get run-log only, never a fabricated artifact)
- Persistence is wrapped in `try/catch`; failure is `console.error`'d and returns `null` — the event stream is never blocked or broken
- Two early-exit guards: `!convexUrl` (NEXT_PUBLIC_CONVEX_URL unset) and `input.brandId === PLACEHOLDER_BRAND_ID` (`'jio'`) skip persistence silently
- `X-Experience-Persisted-Run-Id` response header is set when a run was durably stored (line 178)
- `export const runtime = 'nodejs'` is now explicit (line 43) — CR-04 fragility from the initial report is also resolved

**Test coverage verified (`runRoute.test.ts`):**

All 4 tests pass (confirmed by `pnpm --filter @oneui/platform test`):

1. `persists a valid-IR run: createRun → recordRunEvents → persistArtifact` — asserts all 3 mutations fire in order with correct args; asserts `X-Experience-Persisted-Run-Id` header is set
2. `persists a gap run as run-log only — no artifact fabricated` — asserts only `createRun` + `recordRunEvents` called; `persistArtifact` absent; status is `'gap'`
3. `skips persistence for the unsaved "jio" placeholder brand, stream still works` — asserts no mutations called; stream body contains `"kind":"result"`
4. `never breaks the stream when Convex is unconfigured` — deletes `NEXT_PUBLIC_CONVEX_URL`; asserts no mutations called; stream intact

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Lab route distinct from existing Builder; UI built from Jio DS + Jio CSS; existing ExperienceCanvas Builder still boots unchanged; CI import guard + smoke test pass; `pnpm why ai` resolves single ai version | VERIFIED | smoke-existing-builder.ts exits 0 (boot + zero Lab imports); check-single-ai-version.ts exits 0; eslint `no-restricted-imports` Lab↔Builder patterns in eslint.config.mjs; grep confirms zero ExperienceCanvas/FoundationStyleProvider imports under `(experience-lab)`; `pnpm check:layers` passes |
| 2 | Prompt card on isolated tldraw canvas; select brand/sub-brand, artifact type, output profile; enter prompt; run mock generation; valid-IR artifact card appears via streamed agent event log | VERIFIED | 14/14 jsdom tests pass (canvas.test.tsx 5 tests + requestPanel.test.tsx 9 tests); PromptCardShape, ArtifactCardShape, RunGroupFrame all registered in ExperienceLabCanvas.tsx; useExperienceLabRun consumes NDJSON event stream and creates artifact-in-frame on valid run; RequestPanel wires useQuery(api.brands.list) + getValidProfilesForType |
| 3 | Every artifact is a canonical Jio Experience IR (Zod) with NO free-text/HTML/raw-JSX field; adversarial "just give me HTML" yields valid IR or gap report, never markup | VERIFIED with known gap (CR-01) | 57/57 core tests pass including adversarial markup-rejection fixture; irToAst emits NO element case (grep confirms zero `kind:'element'` in irToAst.ts); schema.ts uses MarkupFreeString refinement rejecting `<`, `className=`, `style=`, `dangerouslySetInnerHTML` on all string leaves; `.strict()` objects close unknown-key channel. CAVEAT: `applyPatch` (patch.ts:193-198) performs NO Zod re-parse after applying ops — a crafted `replace` patch can smuggle markup back into a previously-valid IR (CR-01 from code review). Not exploitable in P1 mocks (no real LLM, no repair loop), but the boundary is incomplete for P3 repair loop use. Assessed as acceptable P1 walking-skeleton scope (repair loop is P3). |
| 4 | AST-level validator blocks Tailwind/non-Jio imports/unregistered components; mock foundation resolver returns typed gap report (never invented dimensions); foundation-coverage audit documents non-web profiles | VERIFIED with known gap (CR-02) | 21/21 validation tests pass including aliased-import red-team (`Button as X from shadcn` blocked); validateAst returns JioValidationResult in all branches; FOUNDATION-COVERAGE.md exists with "DEFINED" vs "ASSUMED" tables; resolver gap test asserts no numeric dimension fields. CAVEAT: astValidator.ts line 273 token classifier uses `value.replace(/^.*var\(/, '')` which matches a `--Primary-Bold) #ff0000` mixed value as a pure token ref, suppressing the `#ff0000` literal warning (CR-02). Literal hook is WARNING-only in P1 (blocking is P3 scope), so this does not make any blocking validator path incorrect today. Assessed as acceptable P1 scope. |
| 5 | A generation run + its IR persist to the experience* Convex tables (VER-03) | VERIFIED | commit `50dc8d0a`: `persistRun()` in route.ts calls `createRun` → `recordRunEvents` → `persistArtifact` (artifact outcome only); best-effort try/catch; placeholder-brand + missing CONVEX_URL guards; 4/4 runRoute.test.ts tests pass asserting exact mutation call sequence, gap-only path, placeholder skip, and no-Convex-URL stream safety |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/experience-builder-core/src/ir/schema.ts` | JioExperienceIR Zod schema with zero markup fields | VERIFIED | 57 tests pass; no rawHtml/dangerouslySetInnerHTML field definitions |
| `packages/experience-builder-core/src/ir/irToAst.ts` | IR->ComponentASTNode/TextASTNode mapper (no ElementASTNode) | VERIFIED | No `kind:'element'` emission; 57 tests pass |
| `packages/experience-builder-core/src/profiles/outputProfileTable.ts` | artifact-type -> output-profile mapping | VERIFIED | Covers all 8 artifact types; `getValidProfilesForType` used in RequestPanel |
| `packages/experience-builder-core/src/contracts/events.ts` | ExperienceBuilderEvent discriminated union | VERIFIED | 6-variant union; 57 tests pass |
| `scripts/check-single-ai-version.ts` | single ai@6 version CI gate for Lab packages | VERIFIED | Exits 0; wired in ci:gates |
| `packages/experience-builder-registry/src/queryRegistry.ts` | deterministic registry adapter over jioAlphaCatalog + metadata | VERIFIED | 16/16 tests pass; no barrel `@oneui/ui` import; Modal/Text excluded |
| `packages/experience-builder-validation/src/astValidator.ts` | AST allowlist compliance validator returning JioValidationResult | VERIFIED | 21/21 tests pass including all red-team fixtures |
| `packages/experience-builder-validation/src/fixtures/redteam.ts` | aliased-import + markup red-team seed corpus | VERIFIED | REDTEAM_FIXTURES exported; aliased `Button as X from shadcn` blocked |
| `packages/experience-builder-agents/src/workflow.ts` | Mastra workflow skeleton with mock steps + event emission | VERIFIED | `createWorkflow` present; 16/16 agents tests pass; no orchestration in AI-SDK callbacks |
| `packages/experience-builder-agents/src/mockGeneration.ts` | deterministic mock IR generator producing valid IR | VERIFIED | Output safeParse + validateAst both pass (GEN-08 test green) |
| `packages/experience-builder-agents/src/foundationResolver.ts` | mock resolver (ThemeConfig-shaped) with first-class gap variant | VERIFIED | Web profile returns ok:true theme; non-web returns ok:false gap with no dimensions |
| `packages/convex/convex/experienceRuns.ts` | run + IR persistence queries/mutations | VERIFIED | createRun/recordRunEvents/persistArtifact mutations defined AND now called from the run route via ConvexHttpClient. 4/4 runRoute tests confirm the wiring. |
| `apps/platform/src/app/(platform)/(experience-lab)/lab/page.tsx` | isolated Lab entry page (dynamic ssr:false canvas) | VERIFIED | Uses `dynamic(..., { ssr: false })`; does not import ExperienceCanvas or FoundationStyleProvider |
| `apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/PromptCardShape.tsx` | prompt card ShapeUtil (run origin, IR-on-card config) | VERIFIED | ShapeUtil extends; registered in ExperienceLabCanvas |
| `apps/platform/src/app/(platform)/(experience-lab)/_canvas/frames/RunGroupFrame.tsx` | labeled Run #N frame (D-07) | VERIFIED | FrameShapeUtil; bg-subtle fill; registered |
| `apps/platform/src/app/api/experience-lab/run/route.ts` | Node run route delegating to Mastra workflow + streaming events; persists to Convex | VERIFIED | maxDuration=120; `export const runtime = 'nodejs'` now explicit (CR-04 resolved); ConvexHttpClient + api imported; persistRun() calls all 3 mutations best-effort; 4/4 runRoute tests pass |
| `apps/platform/src/app/(platform)/(experience-lab)/__tests__/runRoute.test.ts` | persistence wiring test suite (new — VER-03) | VERIFIED | 4/4 tests pass covering artifact path, gap path, placeholder skip, no-URL skip |
| `apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.tsx` | docked request panel editing selected prompt card | VERIFIED | useQuery(api.brands.list) wired; getValidProfilesForType used; one bold-primary Run CTA |
| `apps/platform/src/app/(platform)/(experience-lab)/_panels/RunInspectorPanel.tsx` | docked event-timeline panel | VERIFIED | ExperienceBuilderEventT typed; Surface mode="subtle" used |
| `packages/experience-builder-core/FOUNDATION-COVERAGE.md` | non-web foundation-coverage audit | VERIFIED | grep: 25 occurrences of "gap"/"assumed"; web DEFINED vs non-web ASSUMED tables present |
| `packages/experience-builder-preview/PREVIEW-DECISION.md` | separate-origin preview hosting decision | VERIFIED | grep: 3 occurrences of "allow-same-origin" specifying it must NOT be set |
| `scripts/smoke-existing-builder.ts` | existing-Builder boot smoke test (isolation gate) | VERIFIED | Exits 0; verified exit 1 on synthetic breach; wired as smoke:builder in ci:gates |
| `packages/experience-builder-core/README.md` | Lab isolation + run docs (LAB-04) | VERIFIED | File exists; documents isolation model, MUST-NOT-TOUCH list, enforcement gates, how to run |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `packages/experience-builder-agents/src/workflow.ts` | `@oneui/experience-builder-validation validateAst` | validation step | VERIFIED | `validateAst` imported and called in the validate step (line 258) |
| `packages/experience-builder-agents/src/workflow.ts` | `@oneui/experience-builder-core ExperienceBuilderEvent` | emitted event stream | VERIFIED | ExperienceBuilderEvent union imported; events emitted per step |
| `apps/platform/src/app/api/experience-lab/run/route.ts` | `@oneui/experience-builder-agents workflow` | POST delegates to runExperienceWorkflow | VERIFIED | `runExperienceWorkflow` imported and called in POST handler |
| `apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExperienceLabCanvas.tsx` | `/api/experience-lab/run` | Run CTA POST + event stream consumption | VERIFIED | useExperienceLabRun POSTs to RUN_ENDPOINT and decodes NDJSON stream |
| `apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/ArtifactCardShape.tsx` | persisted IR from the run | structured IR summary render | VERIFIED | Reads artifactType/targetProfile/brand from IR; JSON inspector via JSON.stringify |
| `apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.tsx` | `api.brands.list` (read-only Convex) | useQuery | VERIFIED | `useQuery(api.brands.list)` on line 91 |
| `apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.tsx` | `@oneui/experience-builder-core outputProfileTable` | type-filtered profile options | VERIFIED | `getValidProfilesForType` imported from `@oneui/experience-builder-core` and used |
| `scripts/smoke-existing-builder.ts` | `(builder)` canvas route | boot smoke test in CI | VERIFIED | Parses (builder)/canvas/page.tsx + CanvasContent.tsx via TS compiler API |
| `packages/convex/convex/experienceRuns.ts` | `experience*` tables in schema.ts | ctx.db.insert | VERIFIED | createRun calls ctx.db.insert('experienceRuns'); mutations defined and correct |
| `apps/platform/src/app/api/experience-lab/run/route.ts` | `packages/convex/convex/experienceRuns.ts` mutations | ConvexHttpClient + api.experienceRuns.* | VERIFIED | ConvexHttpClient imported; persistRun() calls createRun → recordRunEvents → persistArtifact in sequence; 4/4 runRoute tests confirm wiring (VER-03 CLOSED) |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `ArtifactCardShape.tsx` | `props.ir` (JioExperienceIR) | Comes from the NDJSON `{ kind: 'result', ir }` frame emitted by the run route; generated by mockGenerate in workflow | Yes — mock but deterministic valid IR | FLOWING (mock) |
| `RequestPanel.tsx` | `brands` state | `useQuery(api.brands.list)` Convex query | Yes — reads real Convex brands table | FLOWING |
| `RunInspectorPanel.tsx` | `events` prop | Passed from `useExperienceLabRun` hook's accumulated event list | Yes — real event stream from NDJSON decode | FLOWING |
| `experienceRuns` table | run record | Route calls `createRun` mutation via ConvexHttpClient | Yes — writes to real Convex table when brandId is a real brands doc id and NEXT_PUBLIC_CONVEX_URL is set | FLOWING (VER-03 closed) |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Core package tests (IR schema, irToAst, patch, outputProfileTable, contracts, artifactTypes) | `pnpm --filter @oneui/experience-builder-core test` | 57/57 pass | PASS |
| Registry adapter tests (conformance, exact membership, exclusions) | `pnpm --filter @oneui/experience-builder-registry test` | 16/16 pass | PASS |
| Validation tests (allowlist, alias evasion, red-team fixtures) | `pnpm --filter @oneui/experience-builder-validation test` | 21/21 pass | PASS |
| Agents tests (foundationResolver, mockGeneration, workflow event sequence) | `pnpm --filter @oneui/experience-builder-agents test` | 16/16 pass | PASS |
| Platform Lab tests (canvas + requestPanel + runRoute jsdom) | `pnpm --filter @oneui/platform test` | 74/74 pass (18 pre-fix → 74 post-fix; +4 runRoute tests) | PASS |
| VER-03 persistence wiring (artifact path) | runRoute.test.ts #1 | createRun → recordRunEvents → persistArtifact called in order; X-Experience-Persisted-Run-Id set | PASS |
| VER-03 persistence wiring (gap path) | runRoute.test.ts #2 | createRun → recordRunEvents only; persistArtifact absent; status='gap' | PASS |
| VER-03 persistence skip (placeholder brand) | runRoute.test.ts #3 | no mutations called; stream body contains `"kind":"result"` | PASS |
| VER-03 persistence skip (no Convex URL) | runRoute.test.ts #4 | no mutations called; stream intact | PASS |
| Single-ai version gate | `pnpm tsx scripts/check-single-ai-version.ts` | exit 0 | PASS |
| Existing-Builder smoke test | `pnpm tsx scripts/smoke-existing-builder.ts` | exit 0 (boot + zero Lab imports) | PASS |

---

### Probe Execution

No explicit probe scripts defined for this phase. Behavioral spot-checks above serve as the equivalent gate.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| LAB-01 | 01-05 | Lab at dedicated route, separate from Builder | SATISFIED | /lab route exists; isolated layout |
| LAB-02 | 01-05, 01-06 | Lab UI uses Jio DS + Jio CSS only | SATISFIED | check:literals zero violations in Lab; Surface context used throughout |
| LAB-03 | 01-01, 01-06 | Lab isolated; CI import guard + smoke test | SATISFIED | eslint boundary + smoke:builder in ci:gates; both verified |
| LAB-04 | 01-06 | README documents isolation + how to run | SATISFIED | README.md exists |
| CANVAS-01 | 01-05 | Isolated infinite tldraw canvas | SATISFIED | ExperienceLabCanvas with scoped Tldraw |
| CANVAS-02 | 01-05 | User can create a prompt card | SATISFIED | Toolbar add-prompt action; jsdom test covers this |
| CANVAS-03 | 01-01 | Full 13-member artifact object model | SATISFIED | CARD_KINDS = 8 artifact types + 5 non-artifact = 13 |
| CANVAS-04 | 01-05 | Artifact card appears after generation | SATISFIED | jsdom canvas test: valid-run -> artifact-in-frame |
| INPUT-01 | 01-06 | User selects brand/sub-brand | SATISFIED | RequestPanel useQuery(api.brands.list) |
| INPUT-02 | 01-06 | User selects artifact type | SATISFIED | 8-type ArtifactTypeSchema in RequestPanel |
| INPUT-03 | 01-06 | User selects output profile | SATISFIED | getValidProfilesForType filters profiles per type |
| INPUT-04 | 01-06 | User enters prompt | SATISFIED | InputField in RequestPanel; persisted on card |
| IR-01 | 01-01 | Canonical Jio Experience IR (Zod schema) | SATISFIED | JioExperienceIR schema; 57 tests pass |
| IR-02 | 01-01 | No markup/HTML/JSX field in IR | SATISFIED (with P1 caveat) | MarkupFreeString refinements; applyPatch lacks re-validation (CR-01) but repair loop is P3 |
| IR-03 | 01-01 | IR <-> AST mapping; IR patches | SATISFIED | irToAst (no element); diffIr/applyPatch; tests pass |
| IR-04 | 01-01 | IR captures all required fields | SATISFIED | All IR-04 fields present; test asserts required fields |
| FND-01 | 01-06 | System resolves foundations + coverage documented | SATISFIED | FOUNDATION-COVERAGE.md; mock resolver ThemeConfig-shaped |
| FND-03 | 01-04 | Typed foundation gap report when no profile | SATISFIED | ok:false gap variant; no invented dimensions; resolver test |
| REG-01 | 01-01, 01-02 | Machine-readable component registry | SATISFIED | JioComponentRegistryItem schema; queryRegistry from catalog |
| REG-02 | 01-02 | Generator retrieves from registry | SATISFIED | mockGenerate uses queryRegistry; workflow retrieve step |
| REG-03 | 01-02 | Only registry-approved components; gap for unregistered | SATISFIED | getRegistryItem exact lookup; unregistered -> gap; 16 tests |
| ORCH-01 | 01-04 | Mastra workflow sequences pipeline | SATISFIED | createWorkflow with 5 createStep steps; 16 tests |
| ORCH-03 | 01-04, 01-05 | Lab streams agent event stream | SATISFIED | ExperienceBuilderEvent NDJSON; run-inspector panel |
| ORCH-04 | 01-04 | Mastra owns orchestration; AI SDK is model-layer only | SATISFIED | modelAdapter.ts is sole AI-SDK touchpoint; workflow test asserts no orchestration in callbacks |
| GEN-01 | 01-04 | Intent agent (mock) | SATISFIED | intent step in workflow |
| GEN-08 | 01-04 | Mock generation producing valid IR | SATISFIED | mockGenerate output safeParse + validateAst pass; 16 tests |
| VAL-01 | 01-01, 01-03 | Validation returns structured JioValidationResult | SATISFIED | JioValidationResult.parse() called on every branch |
| VAL-02 | 01-03 | Blocks Tailwind/non-Jio imports | SATISFIED | AST-level allowlist; aliased import blocked; 21 tests |
| VAL-03 | 01-03 | Blocks unregistered components/invalid props | SATISFIED | getRegistryItem exact; prop allowlist with repair suggestions |
| VER-03 | 01-04 | Generation runs persist to experience* Convex tables | SATISFIED | commit `50dc8d0a`: persistRun() in route.ts wires ConvexHttpClient + all 3 mutations; 4/4 runRoute.test.ts tests pass |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `packages/experience-builder-core/src/ir/patch.ts` | 193-198 | `applyPatch` returns `doc as unknown as JioExperienceIRT` with no Zod re-validation | Warning (CR-01) | In P3 repair loop, a crafted patch op can inject markup into a previously-valid IR, bypassing all IR-02 / T-01-01 schema guards. Not exploitable in P1 (no real LLM, no repair loop). Accepted as P1 walking-skeleton scope. |
| `packages/experience-builder-validation/src/astValidator.ts` | 273 | `BRAND_ALLOWED_REGEX.test(value.replace(/^.*var\(/, ''))` matches mixed-content `var(--Token) #ff0000` as a pure token ref | Warning (CR-02) | Suppresses literal warnings on mixed token+literal prop values. Literal hook is WARNING-only in P1; blocking literal scan is P3 (VAL-04). Not a blocking path error today. |
| `apps/platform/src/middleware.ts` | 30 | `process.env.SITE_PASSWORD ?? 'oneui2026'` hardcoded fallback | Critical (CR-03) | Any deployment without SITE_PASSWORD configured (staging, preview, Docker) uses the well-known password. Outside P1 Lab scope but present in the codebase. Requires immediate attention by platform maintainer. |
| `apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExperienceLabCanvas.tsx` | 64 | `DEFAULT_BRAND_ID = 'jio'` is not a valid Convex document id | Warning (WR-05) | `canRun` guard uses `Boolean(brandId)` which is truthy for `'jio'`; the Run button enables with an invalid brand ID. Mitigated: the route's persistRun() guard now explicitly skips persistence for `'jio'`, and the RequestPanel lets the user select a real brand. A freshly-added card without panel interaction triggers an ephemeral run (not persisted), which is acceptable P1 behaviour. |
| `apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts` | 133-153 | No `response.ok` check before consuming the NDJSON stream | Warning (CR-06) | HTTP 400/500 error body is parsed as NDJSON frames; a multi-line error JSON could leave `isRunning: true` permanently. |
| `packages/experience-builder-core/src/contracts/events.ts` | 63-71 | `GapEvent` allows both `foundationGap` and `componentGap` to be absent (both `optional()`) | Warning (CR-05) | A conforming GapEvent with neither field is valid; flipToGapState in useExperienceLabRun creates a misleading empty FoundationProfileCardShape. |

**Note:** CR-04 (missing `export const runtime = 'nodejs'`) is resolved — the fix commit added the explicit export.

**Debt marker check:** No `TBD`, `FIXME`, or `XXX` markers found in Lab package source files.

**check:literals failures:** 6 pre-existing violations in `packages/ui/src/components/Image/` and `Modal/` — unrelated to the Lab (these scan roots predate P1). Zero Lab route violations. Not a P1 BLOCKER.

---

### Human Verification Required

### 1. Walking-skeleton end-to-end feel

**Test:** Open the `/lab` route, place a prompt card on the canvas (toolbar), select a brand from the Request Panel dropdown, choose an artifact type and output profile, enter a short prompt, and click "Run generation"
**Expected:** A streaming event log appears in the Run Inspector Panel; a "Run #N" frame appears on the canvas; a valid-IR artifact card (showing artifact type, target profile, brand, component instance outline, and IR/JSON toggle) appears inside the frame
**Why human:** Visual and interaction judgment on canvas behaviour, streaming animation, and card layout fidelity; jsdom tests cover the underlying state mechanics but not the perceived UX

### 2. Gap-report UX

**Test:** In the Request Panel, select a non-web output profile (e.g., `instagram-story`, `slide-16-9`); click "Run generation"
**Expected:** The foundation-profile card flips to its "Foundation gap" typed-gap state with the Warning-role badge; NO artifact card is produced; the Run Inspector shows the gap event in the timeline
**Why human:** Visual confirmation of the card-flip state, the Warning-role badge colour, and the exact copy "Foundation gap"; the jsdom test covers the state logic (`artifacts.length === 0`) but not the visual rendering

---

### Gaps Summary

No gaps remain. VER-03 is closed.

**VER-03 closure evidence:**
- Commit `50dc8d0a` adds `persistRun()` to `apps/platform/src/app/api/experience-lab/run/route.ts`
- `ConvexHttpClient` (from `convex/browser`) and `api` (from `@oneui/convex`) are imported
- `createRun` → `recordRunEvents` → `persistArtifact` are called in that order; `persistArtifact` is gated to `outcome === 'artifact'` (gap/error runs get run-log only)
- Persistence is best-effort (`try/catch`; non-fatal `console.error`) — stream delivery is never blocked
- Placeholder brand (`'jio'`) and missing `NEXT_PUBLIC_CONVEX_URL` are guarded before any Convex client is created
- New test file `apps/platform/src/app/(platform)/(experience-lab)/__tests__/runRoute.test.ts` proves the wiring with 4 dedicated tests; all pass in `pnpm --filter @oneui/platform test`

**CR-01 and CR-02 assessment (unchanged):** Both remain accepted P1 walking-skeleton scope carries. CR-01 (`applyPatch` lacks re-validation) must be addressed in P3 before the repair loop ships. CR-02 (mixed-content token suppression) affects the warning-only literal hook only; blocking literal scan is P3 (VAL-04).

**Remaining items:** 2 human-UAT walking-skeleton checks from the original verification — these are visual/interaction judgments that cannot be resolved programmatically and persist to the human-UAT gate regardless of VER-03 closure.

---

_Verified: 2026-05-31T00:47:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification: VER-03 gap closed by commit `50dc8d0a`_
