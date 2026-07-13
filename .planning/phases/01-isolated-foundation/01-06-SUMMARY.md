---
phase: 01-isolated-foundation
plan: 06
subsystem: ui
tags: [experience-lab, request-panel, run-inspector, convex, surface-context, jsdom, isolation, smoke-test, foundation-coverage, preview-decision, jio-ds]

requires:
  - phase: 01-isolated-foundation (plan 05)
    provides: "Isolated (experience-lab) /lab route + scoped tldraw canvas shell + useExperienceLabRun reducer + NDJSON run stream + the five card ShapeUtils + Run #N frame"
  - phase: 01-isolated-foundation (plan 01)
    provides: "@oneui/experience-builder-core — ARTIFACT_TYPES, getValidProfilesForType/outputProfileTable (D-03), ExperienceBuilderEvent union (ORCH-03), OutputProfile types"
provides:
  - "RequestPanel — docked, selection-driven editor for the prompt card (D-01/D-04): brand Select from real Convex brands.list (D-02), 8-type artifact Select, type-filtered output-profile Select (D-03), prompt InputField, single bold-primary Run CTA (INPUT-01..04)"
  - "RunInspectorPanel — docked ExperienceBuilderEvent timeline on a subtle Surface with semantic Badges + Spinner (ORCH-03)"
  - "useExperienceLabRun now exposes the ordered { events, isRunning } stream consumed by the inspector"
  - "scripts/smoke-existing-builder.ts — the LAB-03 isolation gate (existing Builder still boots + imports zero Lab code), wired into ci:gates beside check:single-ai as smoke:builder"
  - "@oneui/ui-internal vitest alias so Lab files importing Jio components via the platform-internal deep path resolve under test"
  - "packages/experience-builder-core/README.md (LAB-04 isolation + run docs)"
  - "packages/experience-builder-core/FOUNDATION-COVERAGE.md (FND-01 defined-vs-assumed audit)"
  - "packages/experience-builder-preview stub + PREVIEW-DECISION.md (separate-origin preview decision)"
  - "packages/experience-builder-export stub package"
affects: [02-real-integration, 03-preview-eval-repair, 04-campaign-social, experience-lab-route]

tech-stack:
  added:
    - "@oneui/experience-builder-preview + @oneui/experience-builder-export workspace stub packages (package.json only; preview ships PREVIEW-DECISION.md)"
  patterns:
    - "Selection-driven docked panel: reads editor.getSelectedShapeIds() via a reactive sideEffects.registerAfterChangeHandler('instance_page_state'|'shape') sync, persists config back with editor.updateShape (mirrors the Builder's PropPanel UX without importing it)"
    - "Type→profile filtering at the UI: output-profile Select options derive from getValidProfilesForType(selectedType); changing the type snaps an now-invalid profile to the first valid one so the card never holds an invalid pair (D-03)"
    - "Single accent moment: exactly one Button variant='bold' appearance='primary' (the Run CTA) lives in the RequestPanel; the canvas toolbar keeps only the neutral add-prompt action"
    - "Run-inspector is a pure view over the ordered event list owned by the run reducer; bg-subtle via <Surface mode='subtle'> (unified 7-token vocab)"
    - "LAB-03 smoke gate proves boot via TS-compiler parse of the Builder route + CanvasContent + a renderable default export, and isolation via an import scan of the Builder tree for zero experience-builder-* / (experience-lab) references"
    - "Token-composed fixed widths: panel width = calc(var(--Spacing-40) * 2) keeps the 320px panel inside the f-step scale (LAB-02 zero-literals)"

key-files:
  created:
    - "apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.module.css"
    - "apps/platform/src/app/(platform)/(experience-lab)/_panels/RunInspectorPanel.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_panels/RunInspectorPanel.module.css"
    - "apps/platform/src/app/(platform)/(experience-lab)/__tests__/requestPanel.test.tsx"
    - "scripts/smoke-existing-builder.ts"
    - "packages/experience-builder-core/README.md"
    - "packages/experience-builder-core/FOUNDATION-COVERAGE.md"
    - "packages/experience-builder-preview/package.json"
    - "packages/experience-builder-preview/PREVIEW-DECISION.md"
    - "packages/experience-builder-export/package.json"
  modified:
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExperienceLabCanvas.tsx (dock both panels, reactive selection, single CTA now in panel)"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExperienceLabCanvas.module.css (dockRight panel layout)"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts (expose events + isRunning)"
    - "apps/platform/vitest.config.ts (@oneui/ui-internal alias)"
    - "package.json (smoke:builder script + ci:gates chain)"
    - ".planning/phases/01-isolated-foundation/deferred-items.md"

key-decisions:
  - "Nav entry 'Experience Lab' → /lab was already added in plan 05; this plan reuses it as-is (no second nav touch needed) — the one allowed touch outside the Lab group stays minimal."
  - "The single bold-primary Run CTA moved from the canvas toolbar into the RequestPanel (UI-SPEC: one accent moment per viewport). The toolbar keeps only the neutral 'Add prompt card' action + a status line."
  - "UI-SPEC says 'bg-subtle Surface'; in the current unified 7-token surface vocabulary that is <Surface mode='subtle'> (CLAUDE.md). Used the unified token, not a legacy bg-* mode."
  - "Prompt field uses the project's single-line InputField (not a native multiline textarea) per the 'use project components' rule; the on-card prompt textarea remains the multi-line authoring surface — the panel mirrors it."
  - "Smoke test (LAB-03) proves boot via TS-compiler parse + renderable-default-export check rather than a full Next render, because the Builder route's @/ alias + CSS-module graph cannot resolve in a bare tsx script; pnpm typecheck in ci:gates covers the full Builder graph compile. Verified exit 1 on a synthetic isolation breach."

requirements-completed: [LAB-02, LAB-03, LAB-04, INPUT-01, INPUT-02, INPUT-03, INPUT-04, ORCH-03, FND-01]

metrics:
  duration: 14min
  tasks: 3
  files_created: 11
  files_modified: 6
completed: 2026-05-30
---

# Phase 01 Plan 06: Docked Request + Run-Inspector Panels, Isolation Gate & P1 Docs Summary

**The final P1 slice: two Jio-DS-only docked panels turn the bare canvas round-trip into the full configure → run → inspect experience — a selection-driven request panel (real Convex brands D-02, type→profile filtering D-03, prompt + config persisted on the card D-04, single bold-primary Run CTA) plus a live ExperienceBuilderEvent run-inspector (ORCH-03) — and the LAB-03 existing-Builder smoke gate, the LAB-04 README, the FND-01 foundation-coverage audit, the separate-origin preview decision, and the preview/export stubs close every P1 contract + HIGH-severity risk deliverable.**

## Performance

- **Duration:** ~14 min
- **Started:** 2026-05-30T22:18:00Z
- **Completed:** 2026-05-30T22:32:05Z
- **Tasks:** 3 executed (all `auto`)
- **Files created:** 11 ; **modified:** 6
- **Tests:** 9 new requestPanel jsdom tests (Lab suite 14/14 green); smoke:builder exits 0

## Accomplishments

- **Task 1 — Docked panels + nav.** `RequestPanel.tsx` mirrors the Builder's `PropPanel` UX (selection-driven, Jio-`Select`-driven) WITHOUT importing it: it reads the currently-selected prompt card and persists brand/type/profile/prompt back via `editor.updateShape` (D-01/D-04). The brand `Select` populates from the real read-only `useQuery(api.brands.list)` (D-02/INPUT-01); the artifact-type `Select` lists all 8 types (INPUT-02); the output-profile `Select` options come from `getValidProfilesForType(selectedType)` so invalid pairings are unselectable, and a type change snaps an now-invalid profile to the first valid one (D-03/INPUT-03); the prompt uses `InputField` (INPUT-04). The lone accent moment is one `<Button variant="bold" appearance="primary">Run generation</Button>`. `RunInspectorPanel.tsx` renders the ordered `ExperienceBuilderEvent` timeline (ORCH-03) on a `<Surface mode="subtle">` with semantic Badges + a Spinner for in-progress, and the exact UI-SPEC empty-state copy. Both panels dock into `ExperienceLabCanvas` via a token-only `dockRight` layout; selection is tracked reactively through tldraw `sideEffects` handlers; `useExperienceLabRun` now exposes `{ events, isRunning }`. The "Experience Lab" → `/lab` nav entry (added in plan 05) is reused unchanged.
- **Task 2 — jsdom tests + LAB-03 smoke gate.** `requestPanel.test.tsx` (9 tests) mocks `convex/react` + `@oneui/convex` and the heavy Base UI components as thin doubles that expose `options`/`onChange`, then asserts: brand options render from the mocked query (INPUT-01); output-profile options equal `getValidProfilesForType(type)` with invalid pairings excluded + a type change snapping the profile (INPUT-02/03/D-03); brand/prompt edits persist via `editor.updateShape` (D-04); and the Run CTA fires `onRun` + disables on an empty prompt (INPUT-04). `scripts/smoke-existing-builder.ts` is the LAB-03 gate: it parses the existing `(builder)` route + `CanvasContent` with the TS compiler and confirms a renderable default-export component (boot), and scans the Builder tree for zero `experience-builder-*` / `(experience-lab)` imports (one-way isolation) — verified to exit 1 on a synthetic breach. Wired as `smoke:builder` into `ci:gates` beside `check:single-ai`. Added the missing `@oneui/ui-internal` vitest alias so Lab files resolve under test.
- **Task 3 — P1 docs + stubs.** `README.md` (LAB-04) documents the "isolation by package, reuse by contract" model, the six `experience-builder-*` packages + the `(experience-lab)` route, the MUST-NOT-TOUCH list, the three enforcement gates, and how to run `/lab`. `FOUNDATION-COVERAGE.md` (FND-01/Pitfall 6/A3) enumerates the web profiles as DEFINED (tracing to the real 3 breakpoints `S..L`) vs the non-web profiles as ASSUMED/gap-until-P4, and states explicitly that uncovered profiles return a typed gap report, never invented dimensions. `PREVIEW-DECISION.md` documents the separate-origin preview model (`allow-scripts` WITHOUT `allow-same-origin`, strict CSP + `frame-ancestors`, `postMessage` origin checks, zero auth/Convex tokens, server-side token handoff via the `/internal/render-ast` Pattern 4, credential-free Playwright — decide P1, build P3). The two stub packages link via `pnpm install`.

## Task Commits

1. **Task 1: Docked request + run-inspector panels** — `65b8bf3a` (feat)
2. **Task 2: requestPanel jsdom tests + existing-Builder smoke gate (LAB-03)** — `dc44b0bf` (test)
3. **Task 3: README + foundation-coverage audit + preview decision + stubs** — `d04ed4ab` (docs)

## Decisions Made

See `key-decisions` frontmatter: nav entry reused from plan 05; the single bold-primary CTA lives in the panel; `bg-subtle` → unified `mode="subtle"`; prompt uses the project `InputField`; the smoke gate proves boot via TS-compiler parse + renderable-default-export (full Builder graph compile is covered by `pnpm typecheck` in `ci:gates`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing `@oneui/ui-internal` vitest alias prevented the requestPanel test from running**
- **Found during:** Task 2
- **Issue:** `RequestPanel.tsx` imports Jio components via `@oneui/ui-internal/...` (the platform-local deep-path alias, mapped in tsconfig). `apps/platform/vitest.config.ts` had no such alias, so vite could not resolve the URL even when the component was mocked — the test file failed to transform.
- **Fix:** Added `'@oneui/ui-internal': packages/ui/src` to the vitest config alias map (the same mapping tsconfig uses).
- **Files modified:** `apps/platform/vitest.config.ts`
- **Commit:** `dc44b0bf`

**2. [Rule 3 - Blocking] LAB-03 smoke test cannot full-render the Builder route in a bare tsx script**
- **Found during:** Task 2
- **Issue:** The plan describes the smoke test as "boots/renders the existing `(builder)` canvas route." A runtime `import()` + `react-dom/server` render in a plain tsx script fails because the Builder route depends on the `@/` path alias + CSS-module graph that only Next's webpack resolves (`Cannot find module '@/components/PageLoader'`).
- **Fix:** Implemented the boot proof via the TypeScript compiler API — parse the route `page.tsx` + `CanvasContent.tsx` for syntax integrity and confirm a renderable default-export component — paired with the import-scan isolation check. The full Builder dependency-graph compile is covered by `pnpm typecheck` (already in `ci:gates`). The gate was verified to exit 1 on a synthetic isolation breach.
- **Files modified:** `scripts/smoke-existing-builder.ts`
- **Commit:** `dc44b0bf`

**Total deviations:** 2 auto-fixed (both Rule 3 blocking). No scope creep; no Builder file or frozen contract touched.

## Authentication Gates

None. The brand list is a read-only Convex query; the run path was already wired in plan 05. No package install required model keys (stub packages carry only `typescript`).

## Issues Encountered

- **Pre-existing `@oneui/shared` typecheck failure (`buildNativeTheme.ts:233` `stateLayers`)** surfaces when typechecking `@oneui/experience-builder-core` (it type-imports `@oneui/shared`). Last touched in commit `6d0f22af`, unrelated to this plan; documented in plans 01-01..03. The Lab's own platform sources + the new docs/stub packages add ZERO new errors (`pnpm --filter @oneui/platform exec tsc --noEmit` shows no `(experience-lab)`/`_panels`/`experience-builder-{preview,export,core}` errors). Logged to `deferred-items.md`.
- **6 pre-existing `packages/ui/src` literal violations** (Image/Modal) continue to fail `pnpm check:literals` independently of the Lab. The new `_panels/*.module.css` produce ZERO violations (panel width composed from `calc(var(--Spacing-40) * 2)`). Logged to `deferred-items.md`.

## Known Stubs

Intentional and scoped to P1 — these are the documented future-phase boundaries, not gaps in this plan's goal:
- **`packages/experience-builder-preview`** ships only `package.json` + `PREVIEW-DECISION.md`. The separate-origin preview iframe + Playwright loop is built in P3 (the decision is the P1 deliverable). Documented in PREVIEW-DECISION.md.
- **`packages/experience-builder-export`** ships only `package.json`. Artifact export is built in P4/P5 per the output-profile export rules.
- **`ExperienceLabCanvas` `DEFAULT_BRAND_ID = 'jio'`** placeholder remains for a freshly-added prompt card's initial `brandId`; the docked RequestPanel now lets the user pick a real brand from the Convex query, which overwrites it on selection (D-02). Not a blocking stub — the panel is the real brand-selection surface this plan delivers.

None of these block the plan goal (configure a prompt card in the request panel → run → stream the event timeline → valid-IR artifact or typed gap short-circuit).

## Threat Model Coverage

| Threat ID | Mitigation | Evidence |
|-----------|-----------|----------|
| T-01-19 (Lab panel/nav change breaks the existing Builder) | Existing-Builder smoke test in `ci:gates`; nav entry is additive (reused from plan 05); the read-only brands query never touches `FoundationStyleProvider` | `smoke:builder` exits 0 (boot + zero-Lab-import isolation), verified exit 1 on a synthetic breach; eslint Lab files clean |
| T-01-20 (invalid type→profile pair submitted) | Output-profile Select offers only `getValidProfilesForType(type)`; a type change snaps an invalid profile to a valid one | `requestPanel.test.tsx` asserts offered options == `getValidProfilesForType` and never include a cross-type profile (e.g. `web-desktop` absent for `slide`) |
| T-01-21 (future preview leaks auth/Convex tokens) | PREVIEW-DECISION documents separate origin, `allow-scripts` without `allow-same-origin`, zero tokens in preview; build + review is P3 | `PREVIEW-DECISION.md` (grep `allow-same-origin`, zero-tokens controls table) |
| T-01-22 (foundation resolver invents non-web dimensions) | FOUNDATION-COVERAGE audit documents defined-vs-assumed profiles; uncovered → typed gap, never invented dimensions | `FOUNDATION-COVERAGE.md` (web DEFINED vs non-web ASSUMED tables + gap-report contract) |

## Threat Flags

None — no new auth path or trust boundary. The only data flow added is the read-only browser→Convex `brands.list` query (no write path, no `FoundationStyleProvider` touch); the preview iframe trust boundary is documented-but-not-built (P3).

## Self-Check: PASSED

- Created files verified present: both panels + CSS, requestPanel test, smoke script, README, FOUNDATION-COVERAGE, preview package.json + PREVIEW-DECISION, export package.json.
- Task commits verified in git log: `65b8bf3a`, `dc44b0bf`, `d04ed4ab`.
- `pnpm --filter @oneui/platform exec vitest run "(experience-lab)"` → 14/14 pass (9 new requestPanel + 5 existing canvas).
- `pnpm smoke:builder` → exit 0 (and exit 1 on a synthetic isolation breach).
- `ci:gates` references both `smoke:builder` and `check:single-ai`; `pnpm check:layers` passes; new `_panels` files produce zero `check:literals` violations; eslint Lab files clean.
- Lab platform sources + new packages add zero new typecheck errors.

---
*Phase: 01-isolated-foundation*
*Completed: 2026-05-30*
