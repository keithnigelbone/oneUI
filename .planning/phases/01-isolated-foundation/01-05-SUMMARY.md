---
phase: 01-isolated-foundation
plan: 05
subsystem: ui
tags: [tldraw, canvas, experience-lab, ndjson, streaming, mastra, next-route, jio-ds, surface-context, jsdom]

requires:
  - phase: 01-isolated-foundation (plan 01)
    provides: "@oneui/experience-builder-core — JioExperienceIR, 13-member card-kind union, output-profile table, ExperienceBuilderEvent union, FoundationGap/ComponentGap contracts"
  - phase: 01-isolated-foundation (plan 04)
    provides: "@oneui/experience-builder-agents — runExperienceWorkflow (Mastra) emitting the ExperienceBuilderEvent stream + valid IR / typed gap; toV6WorkflowStream transport seam"
provides:
  - "Isolated (experience-lab) route group: passthrough layout (no shared (builder) layout, no FoundationStyleProvider touch) + /lab page (dynamic ssr:false)"
  - "ExperienceLabCanvas — scoped <Tldraw> shell with its own editor/store; toolbar add-prompt-card + Run CTA; registers Lab shapes + Run #N frame override"
  - "Five tldraw card ShapeUtils (prompt / artifact / foundation-profile / component-reference / generic-placeholder) + RunGroupFrame (Run #N), token-only + Surface-correct"
  - "api/experience-lab/run — Node route (maxDuration, never Edge) delegating to the Mastra workflow + streaming ExperienceBuilderEvents as NDJSON frames (the ONLY app-side Mastra invocation)"
  - "useExperienceLabRun — canvas run reducer: valid-run → artifact card in Run #N frame; gap-run → card flips to typed gap state, zero artifacts (short-circuit)"
  - "runStream.ts — shared NDJSON frame contract (event + terminal result/IR) between route and canvas"
affects: [02-real-integration, 03-preview-eval-repair, 04-campaign-social, experience-lab-route]

tech-stack:
  added:
    - "@oneui/experience-builder-core + @oneui/experience-builder-agents as apps/platform deps (+ vitest aliases)"
  patterns:
    - "Lab isolation by route group + passthrough layout: never imports ExperienceCanvas / FoundationStyleProvider / (builder); enforced by the eslint Lab↔Builder boundary (grep + lint both clean)"
    - "Scoped tldraw shell mirrors the Builder's ShapeUtil<any> + as-never createShape/updateShape casts WITHOUT importing Builder internals"
    - "NDJSON streaming contract: route serialises the workflow's ordered ExperienceBuilderEvent stream as { kind: 'event' } frames + a terminal { kind: 'result', ir } frame (IR is structured JSON, never markup)"
    - "Gap is a first-class branch in the canvas reducer: a gap event flips the typed gap card and short-circuits BEFORE any artifact is created (FND-03/REG-03)"
    - "Run route is the single app-side Mastra touchpoint (ORCH-04); Node runtime, never Edge"
    - "tldraw geometry exempt from zero-literals; all HTMLContainer card chrome is token-only Jio CSS via shared cardChrome.ts fragments + <Surface> for non-default fills (LAB-02)"

key-files:
  created:
    - "apps/platform/src/app/(platform)/(experience-lab)/layout.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/lab/page.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExperienceLabCanvas.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/ExperienceLabCanvas.module.css"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/runStream.ts"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/cardChrome.ts"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/PromptCardShape.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/ArtifactCardShape.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/FoundationProfileCardShape.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/ComponentReferenceCardShape.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/GenericPlaceholderShape.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/_canvas/frames/RunGroupFrame.tsx"
    - "apps/platform/src/app/(platform)/(experience-lab)/__tests__/canvas.test.tsx"
    - "apps/platform/src/app/api/experience-lab/run/route.ts"
  modified:
    - "apps/platform/package.json (EB deps)"
    - "apps/platform/vitest.config.ts (EB aliases)"
    - "apps/platform/src/config/navigation.tsx (Experience Lab nav entry → /lab)"
    - "scripts/check-literals.ts (extend scan root to (experience-lab) — LAB-02)"

key-decisions:
  - "Page served at /lab (dedicated segment inside the (experience-lab) group) instead of the group root, because a page.tsx at the group root resolves to / and collides with the existing platform home page (Rule 3 blocking fix; plan listed (experience-lab)/page.tsx without a segment)."
  - "The P1 workflow runner is batch (returns the ordered event array up-front, deterministic mocks, no live model) — so the route serialises that ordered stream as NDJSON frames (one event per line + a terminal result/IR frame) rather than piping a live Mastra stream through toAISdkStream. The v6 transport decision still lives solely in the agents package; this is the same ordered ExperienceBuilderEvent stream the live transport will carry in P2."
  - "Lab shapes mirror the Builder's ComponentShapeUtil pattern of ShapeUtil<any> + as-never editor mutation casts — tldraw's custom-shape generics reject a TLBaseShape with a non-default type literal at the class boundary. The exported per-shape prop/shape TYPES document the real shape and are consumed by the typed canvas reducer."
  - "RunGroupFrame extends FrameShapeUtil and therefore overrides the built-in 'frame' type (same approach as the Builder's OneUIFrameShapeUtil) — Run #N frames are created with type:'frame' + props.name='Run #N' and get the bg-subtle body fill."
  - "Extended check-literals SCAN_ROOTS to (experience-lab) so LAB-02 is actually enforced on the Lab UI (Rule 2 — the gate was previously not scanning the new route). Lab files produce zero violations."

patterns-established:
  - "Isolated Lab route group with a side-effect-free passthrough layout — the stable anchor for the eslint Lab↔Builder boundary."
  - "Shared NDJSON run-stream frame contract (runStream.ts) imported by both the Node route and the browser reducer."
  - "Token-only tldraw card chrome via a shared cardChrome.ts style-fragment module + <Surface> for every non-default fill."

requirements-completed: [LAB-01, LAB-02, CANVAS-01, CANVAS-02, CANVAS-03, CANVAS-04, GEN-08, ORCH-03, FND-03, REG-03]

duration: 22min
completed: 2026-05-30
---

# Phase 01 Plan 05: Isolated Experience Lab Canvas + Streaming Run Route Summary

**The visible payoff slice: an isolated `/lab` tldraw canvas where a prompt card → Run streams `ExperienceBuilderEvent`s from a Node route delegating to the plan-04 Mastra workflow, then either drops a valid-IR artifact card inside a "Run #N" frame or short-circuits to a typed gap-report card — all token-only Jio DS, zero Builder files touched.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-05-30T21:48:35Z
- **Completed:** 2026-05-30T21:10:00Z (approx)
- **Tasks:** 3 executed (all `auto`)
- **Files created:** 15 ; **modified:** 4
- **Tests:** 5 new jsdom tests (platform suite 61/61 green)

## Accomplishments

- **Task 1 — Isolated route + scoped canvas shell + Node run route.** Stood up the `(experience-lab)` route group: a passthrough `layout.tsx` that deliberately does NOT share the `(builder)` layout and never touches `FoundationStyleProvider` (LAB-03 / Pitfall 3), plus a `/lab` page that dynamic-imports the canvas with `ssr:false`. `ExperienceLabCanvas` is a scoped `<Tldraw>` with its own editor/store (mirroring `useCanvasEditor`'s patterns, never the Builder's singleton), a toolbar to add a prompt card (CANVAS-02) and a Run CTA, and registers all Lab shapes + the Run #N frame override. `api/experience-lab/run` is a Node route (`maxDuration = 120`, no Edge) that delegates to the plan-04 `runExperienceWorkflow` and streams its `ExperienceBuilderEvent`s back as NDJSON frames — the single app-side Mastra invocation (ORCH-03/ORCH-04). Added the EB packages as `apps/platform` deps + vitest aliases and the "Experience Lab" nav entry at `/lab` (distinct from the existing Builder).
- **Task 2 — Card shapes + Run #N frame.** Five `ShapeUtil`s under `_canvas/shapes/` with distinct `exp-lab-*` type constants: `PromptCardShape` (run origin + IR-on-card config + editable prompt), `ArtifactCardShape` (structured IR summary — artifactType/targetProfile/brand/section+instance outline — plus an IR/JSON inspector toggle and a Positive "Valid IR" pill; NOT a DOM preview, no `dangerouslySetInnerHTML`), `FoundationProfileCardShape` and `ComponentReferenceCardShape` (normal + typed gap states with the exact UI-SPEC copy "Foundation gap" / "Component not in registry", Warning role), and `GenericPlaceholderShape` (the rest of the 13-member union). `RunGroupFrame` extends `FrameShapeUtil`, patches the body fill to `bg-subtle`, labels "Run #N", and skips the SVG-export machinery. All HTMLContainer chrome is token-only via a shared `cardChrome.ts`; every non-default fill uses `<Surface mode>`.
- **Task 3 — End-to-end wiring + jsdom tests.** `useExperienceLabRun` POSTs the selected prompt card's config, decodes the NDJSON stream line-by-line, and on a VALID run creates (or reuses) a "Run #N" frame and parents the linked artifact card into it (CANVAS-04/D-07); on a GAP event it flips the foundation-profile / component-reference card to its typed gap state and produces NO artifact card (FND-03/REG-03 short-circuit). The jsdom test renders the `/lab` page (LAB-01/CANVAS-01), creates a prompt card (CANVAS-02), and drives mocked valid-run + foundation-gap + component-gap event streams asserting the artifact-in-frame happy path and the zero-artifact short-circuit on both gap kinds. The fetch is injected so no real backend runs.

## Task Commits

1. **Task 1: Isolated route + scoped tldraw shell + Node run route** — `2d324d73` (feat)
2. **Task 2: Card shapes + Run #N frame (token-only, Surface-correct)** — `45aa8531` (feat)
3. **Task 3: Walking-skeleton run wiring + jsdom canvas tests** — `6c7360f1` (feat)

## Decisions Made

See `key-decisions` frontmatter: `/lab` segment to avoid the `/` home-page collision; NDJSON serialisation of the batch P1 workflow's ordered event stream; `ShapeUtil<any>` + as-never casts mirroring the Builder; `RunGroupFrame` overriding the built-in `'frame'` type; extending the check-literals scan root to enforce LAB-02 on the Lab UI.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `(experience-lab)/page.tsx` at the group root collides with the platform home route**
- **Found during:** Task 1
- **Issue:** Next.js route groups add no path segment, so a `page.tsx` directly inside `(experience-lab)` resolves to `/` — colliding with the existing `(platform)/page.tsx` home page (build-breaking duplicate route).
- **Fix:** Served the Lab at a dedicated `/lab` segment: `(experience-lab)/lab/page.tsx`. The isolated `layout.tsx` stays at the group root and wraps the segment. Nav entry + Build-mode `pathPrefixes` updated to `/lab`. The `files_modified` path in the plan listed `(experience-lab)/page.tsx` without a segment; the segment is required for a valid route.
- **Files modified:** `apps/platform/src/app/(platform)/(experience-lab)/lab/page.tsx`, `apps/platform/src/config/navigation.tsx`
- **Commit:** `2d324d73`

**2. [Rule 2 - Critical functionality] `check:literals` was not scanning the Lab route, so LAB-02 was unenforced**
- **Found during:** Task 1
- **Issue:** The UI-SPEC mandates the zero-literals gate be "extended to … the `(experience-lab)` route — LAB-02", but `scripts/check-literals.ts` `SCAN_ROOTS` did not include it, so the gate would trivially pass without ever scanning the new files.
- **Fix:** Added `apps/platform/src/app/(platform)/(experience-lab)` to `SCAN_ROOTS` with a comment noting the tldraw-geometry exemption (the CSS-pattern scanner only flags CSS-style literals / hex colours, never bare JS numbers, so canvas-space geometry is exempt by construction). Lab files produce zero violations.
- **Files modified:** `scripts/check-literals.ts`
- **Commit:** `2d324d73`

**Total deviations:** 2 auto-fixed (1 Rule 3 blocking route-collision, 1 Rule 2 critical gate-enforcement). No scope creep; no Builder file or frozen contract touched.

## Authentication Gates

None. The Mastra install was pre-cleared in plans 01/04; this plan only consumes the already-installed workflow runner.

## Issues Encountered

- **Pre-existing `pnpm check:literals` failures in `packages/ui/src` (OUT OF SCOPE):** 6 literal violations in `Image.stories.tsx` / `Image.test.tsx` / `Modal.module.css` / `Modal.stories.tsx`. These live in a scan root (`packages/ui/src`) that predates this plan and fail on HEAD (`73e72632`) independently of the Lab — confirmed by running the gate against the original `check-literals.ts`. The newly-scanned Lab route files produce ZERO violations. Not fixed (owned by `@oneui/ui`); logged to `deferred-items.md`.
- **Repo-wide `pnpm typecheck`** still surfaces the documented `@oneui/shared` failures (plans 01-01..04). The Lab's own sources typecheck clean (`pnpm --filter @oneui/platform exec tsc --noEmit` shows zero `(experience-lab)` / `api/experience-lab` errors).

## Known Stubs

Intentional, scoped to the Walking Skeleton (real model + panels land in P2/plan 06):
- **`ExperienceLabCanvas` brand id** defaults to a constant `'jio'` placeholder — the real brand `Select` (populated from the Convex `brands.list` query, D-02) lands with the docked Request panel in plan 06. The run route accepts any non-empty `brandId`; the mock workflow does not gate on a real brand.
- **No docked Request / Run-Inspector panels** — plan 05 carries the run-origin config on the prompt card itself (D-04) and surfaces a lightweight toolbar status pill; the full panels + live event timeline are plan 06.

Neither stub blocks the plan goal (open Lab → place prompt card → Run → valid-IR artifact in a Run #N frame, or a typed gap short-circuit).

## Threat Model Coverage

| Threat ID | Mitigation | Evidence |
|-----------|-----------|----------|
| T-01-15 (Lab isolation leakage) | Isolated passthrough layout (no shared (builder) layout / FoundationStyleProvider), scoped tldraw store, eslint boundary | `grep` for `ExperienceCanvas`/`FoundationStyleProvider` imports under `(experience-lab)` → 0 (comments only); direct eslint of Lab files → 0 boundary errors |
| T-01-16 (artifact card rendering raw markup) | Artifact card renders a structured IR summary from validated IR fields only; no `dangerouslySetInnerHTML` | `ArtifactCardShape` reads `ir.artifactType`/`targetProfile`/section outline; inspector renders `JSON.stringify(ir)` in a `<pre>`, never injected HTML |
| T-01-17 (gap path silently producing an artifact) | Gap event short-circuits: card flips to typed gap state, NO artifact created | `canvas.test.tsx` foundation-gap + component-gap tests assert `artifacts.length === 0` |
| T-01-18 (run route on Edge / token leak) | Node runtime, `maxDuration` set, no auth/Convex tokens carried | `route.ts` declares `maxDuration` + no `runtime='edge'`; route body only forwards prompt config + event stream |

## Threat Flags

None — no new auth path or trust boundary beyond the documented browser→Node run route (which carries no secrets; preview sandboxing is P3).

## Self-Check: PASSED

- Created files verified present (route, page, layout, canvas, 5 shapes, frame, run hook, runStream, cardChrome, test, run route).
- Task commits verified in git log: `2d324d73`, `45aa8531`, `6c7360f1`.
- `pnpm --filter @oneui/platform test` → 61/61 pass (incl. 5 Lab canvas tests).
- `pnpm --filter @oneui/platform exec tsc --noEmit` → zero `(experience-lab)` / `api/experience-lab` errors.
- `pnpm check:layers` → pass. `check:literals` → zero Lab violations (6 pre-existing `@oneui/ui` violations are out of scope, logged to deferred-items).
- eslint Lab↔Builder boundary → 0 errors on Lab source; isolation grep → 0 forbidden imports.

---
*Phase: 01-isolated-foundation*
*Completed: 2026-05-30*
