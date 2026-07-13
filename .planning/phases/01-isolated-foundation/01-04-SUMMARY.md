---
phase: 01-isolated-foundation
plan: 04
subsystem: agents
tags: [mastra, ai-sdk, workflow, orchestration, mock-generation, foundation-resolver, convex, persistence, events, vitest]

requires:
  - phase: 01-isolated-foundation (plan 01)
    provides: "@oneui/experience-builder-core — JioExperienceIR schema, irToAst, FoundationResolveResult, ExperienceBuilderEvent union, output-profile table; verified Mastra pin"
  - phase: 01-isolated-foundation (plan 02)
    provides: "@oneui/experience-builder-registry — queryRegistry / getRegistryItem exact membership + typed component gap"
  - phase: 01-isolated-foundation (plan 03)
    provides: "@oneui/experience-builder-validation — validateAst(ArtifactAst, ctx) structural compliance validator"
provides:
  - "@oneui/experience-builder-agents package — the Mastra orchestration brain (Node runtime)"
  - "modelAdapter.ts — sole AI-SDK/@mastra-ai-sdk touchpoint; toV6WorkflowStream pins version: 'v6' (ORCH-04 boundary)"
  - "resolveFoundation(input) — mock resolver: ThemeConfig-shaped success (web) OR typed gap with no dimensions (FND-01/FND-03)"
  - "mockGenerate(input) — deterministic valid-IR generator; gap short-circuit (no IR) for uncovered profile / unregistered component (GEN-01/GEN-08)"
  - "experienceWorkflow (Mastra createWorkflow skeleton) + runExperienceWorkflow runner emitting the ExperienceBuilderEvent stream (ORCH-01/ORCH-03)"
  - "irToArtifactAst bridge — core ASTRoot → validator ArtifactAst, synthesizes Jio imports, normalizes layout wrapper Stack→Container"
  - "Convex experienceRuns / experienceArtifacts / experienceArtifactVersions tables + run/IR persistence functions (VER-03 / D-08)"
affects: [02-real-integration, 03-preview-eval-repair, 04-campaign-social, 05-production-readiness, experience-lab-route]

tech-stack:
  added:
    - "@mastra/core@1.37.1 (exact pin)"
    - "@mastra/ai-sdk@1.4.3 (exact pin)"
    - "per-package node-env vitest config for experience-builder-agents"
  patterns:
    - "AI-SDK access centralized in ONE module (modelAdapter.ts); orchestration module imports @mastra/core/workflows only, never ai/@ai-sdk (ORCH-04)"
    - "Deterministic mock edges: resolver + generator are pure functions, same input → same output, no LLM"
    - "Gap is a first-class branch, not an exception: uncovered profile / unregistered component → typed gap event + zero artifacts"
    - "AST bridge owns import synthesis + layout-wrapper normalization so the frozen irToAst output validates against the registry"
    - "Append-only Convex schema edits; IR persisted as structured JSON (v.any), never a markup string blob (D-08)"

key-files:
  created:
    - packages/experience-builder-agents/package.json
    - packages/experience-builder-agents/tsconfig.json
    - packages/experience-builder-agents/vitest.config.ts
    - packages/experience-builder-agents/src/index.ts
    - packages/experience-builder-agents/src/modelAdapter.ts
    - packages/experience-builder-agents/src/foundationResolver.ts
    - packages/experience-builder-agents/src/foundationResolver.test.ts
    - packages/experience-builder-agents/src/mockGeneration.ts
    - packages/experience-builder-agents/src/mockGeneration.test.ts
    - packages/experience-builder-agents/src/workflow.ts
    - packages/experience-builder-agents/src/workflow.test.ts
    - packages/convex/convex/experienceRuns.ts
  modified:
    - packages/convex/convex/schema.ts
    - packages/convex/convex/_generated/api.d.ts
    - pnpm-lock.yaml

key-decisions:
  - "Mastra installed at the EXACT pins cleared by the plan-01 human checkpoint: @mastra/core@1.37.1 + @mastra/ai-sdk@1.4.3 (no caret). Post-install single-ai gate passes — Mastra at these pins pulls NO transitive ai@6 into the Lab subtree, so ≤1 ai@6 holds."
  - "v6 transport version is pinned in exactly one place (AI_SDK_STREAM_VERSION in modelAdapter.ts); toV6WorkflowStream wraps @mastra/ai-sdk toAISdkStream with { from: 'workflow', version: 'v6' }."
  - "The run runner drives the committed Mastra step sequence directly so the run is testable without a live Mastra runtime/transport; the ORDER and the gap BRANCH are defined by the createWorkflow().then(...) skeleton and honoured by the runner."
  - "irToAst (frozen, plan-01) emits the layout-wrapper type name 'Stack', which is NOT a registry id ('Container' is the registered layout primitive). The net-new AST bridge normalizes Stack→Container before validation rather than touching the frozen mapper or its test."

requirements-completed: [ORCH-01, ORCH-03, ORCH-04, GEN-01, GEN-08, FND-01, FND-03, VAL-02, VER-03]

duration: ~30 min active execution
completed: 2026-05-30
---

# Phase 1 Plan 04: Experience Builder Agents + Convex Persistence Summary

**`@oneui/experience-builder-agents` — the Mastra orchestration brain — plus the Convex `experience*` persistence layer. A Mastra `createWorkflow` skeleton sequences mock steps (intent → resolve → retrieve → IR-gen → validate) emitting an `ExperienceBuilderEvent` stream; the deterministic mock generator produces a VALID `JioExperienceIR` that passes both the plan-01 schema and the plan-03 validator; the mock foundation resolver returns a `ThemeConfig`-shaped result or a typed gap with no dimensions; and runs + IR persist durably to three append-only Convex tables. Orchestration is owned entirely by Mastra — the AI SDK is touched only by `modelAdapter.ts`, which pins the `version: 'v6'` transport.**

## Mastra Install (supply-chain checkpoint cleared in plan 01)

Installed verbatim, no caret drift:
- **`@mastra/core@1.37.1`** — confirmed resolved at `node_modules/@mastra/core` = 1.37.1
- **`@mastra/ai-sdk@1.4.3`** — confirmed resolved at `node_modules/@mastra/ai-sdk` = 1.4.3

`@mastra/ai-sdk@1.4.3` peer-requires `@mastra/core >=1.5.0-0 <2.0.0-0` (1.37.1 satisfies) and `zod ^3.25.0 || ^4.0.0` (repo zod@^4 satisfies). The `scripts/check-single-ai-version.ts` gate passes post-install: at these pins Mastra brings no transitive `ai@6` into the Lab subtree, so the "≤1 `ai@6` in the Lab subtree" invariant holds.

## Performance

- **Duration:** ~30 min active execution
- **Completed:** 2026-05-30
- **Tasks:** 3 executed (all `auto`)
- **Files created:** 12 (package source/config/tests + Convex persistence) ; **modified:** 3 (schema.ts, _generated/api.d.ts, pnpm-lock.yaml)
- **Tests:** 16 passing (3 files: foundationResolver, mockGeneration, workflow)

## Accomplishments

- **Task 1 — Package + Mastra + model adapter + resolver.** Stood up `@oneui/experience-builder-agents` (Node-env vitest, the three Lab workspace deps + `@oneui/shared` dev type-only). Installed the exact Mastra pins; single-ai gate green. `modelAdapter.ts` is the ONLY AI-SDK / `@mastra/ai-sdk` touchpoint — exposes `toV6WorkflowStream` (pins `version: 'v6'`) and a `callModel` seam that throws in P1 (no real model). `resolveFoundation` returns a `ThemeConfig`-shaped `{ ok: true, theme }` for `coverage: 'real'` (web) profiles and a typed `{ ok: false, gap }` with NO dimension numbers for `coverage: 'assumed'` (non-web) profiles (FND-03 / Pitfall 6).
- **Task 2 — Mock generator + Mastra workflow.** `mockGenerate` hand-shapes a VALID `JioExperienceIR` from registry-approved component ids; it short-circuits to a foundation gap (uncovered profile) or component gap (unregistered / known-drift id) with NO IR produced. `workflow.ts` is a Mastra `createWorkflow().then(...)` skeleton over five `createStep`s, each emitting the matching `ExperienceBuilderEvent`; the gap branch emits a gap event and completes without an artifact. The `irToArtifactAst` bridge converts the frozen `irToAst` `ASTRoot` into the validator's `ArtifactAst`, synthesizing one Jio import per component type and normalizing the mapper's `Stack` wrapper to the registered `Container`. GEN-08 proven: the generated IR `safeParse`s against `JioExperienceIR` AND `validateAst(irToArtifactAst(ir))` returns `passed: true`.
- **Task 3 — Convex persistence.** Appended three tables to `schema.ts` (`experienceRuns`, `experienceArtifacts`, `experienceArtifactVersions`) — existing table defs byte-unchanged (git diff append-only). `experienceRuns.ts` exports `createRun` / `recordRunEvents` / `persistArtifact` mutations and `getRun` / `listRunsByBrand` / `getArtifactHistory` queries following the `brands.ts` conventions. The IR persists as structured JSON (`v.any()`), never a markup string blob (D-08). `convex codegen` regenerated `_generated/api.d.ts`; the Lab packages + `@oneui/convex` typecheck clean.

## Task Commits

1. **Task 1: Scaffold agents package, install pinned Mastra, model adapter + mock foundation resolver** — `2f039b3f` (feat)
2. **Task 2: Mock IR generator + Mastra workflow skeleton with ExperienceBuilderEvent stream** — `638336cf` (feat)
3. **Task 3: Convex experience* tables + run/IR persistence (VER-03)** — `ba05c991` (feat)

## Decisions Made

- See `key-decisions` frontmatter: exact Mastra pins; single v6-version pin point; testable direct-step run runner honouring the committed workflow order/branch; `Stack→Container` normalization in the net-new bridge rather than editing the frozen mapper.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Frozen `irToAst` emits layout-wrapper type `Stack`, which is not a registry id**
- **Found during:** Task 2 (wiring the validator into the workflow)
- **Issue:** `@oneui/experience-builder-core`'s `irToAst` (frozen in plan 01, with a test asserting `section.type === 'Stack'`) wraps every section in a `Stack` component and the root in a `Container`. `Container` IS a registered Jio component but `Stack` is NOT (`getRegistryItem('Stack')` → `unregistered`). Any IR → AST → validator path would therefore be blocked with `unregistered-component`, making GEN-08 impossible without touching the frozen contract.
- **Fix:** The net-new `irToArtifactAst` bridge (this plan) normalizes the mapper's `Stack` layout-wrapper to the registered `Container` (the registered layout primitive serving the same role) while building the validator `ArtifactAst`. The frozen mapper and its test are untouched. Documented inline.
- **Files modified:** `packages/experience-builder-agents/src/workflow.ts`
- **Commit:** `638336cf`

**2. [Rule 1 - Bug] Mock section `surfaceMode` produced an invalid `Container` prop**
- **Found during:** Task 2 (first validator run blocked)
- **Issue:** `mockGenerate` initially set `surfaceMode: 'default'` on the IR section. `irToAst` copies a section's `surfaceMode` onto its layout-wrapper component's props, but the registered `Container` declares no `surfaceMode` prop, so `validateAst` (correctly) flagged `invalid-prop` and GEN-08 failed.
- **Fix:** Dropped `surfaceMode` from the mock section (it is optional in the IR). Surface context will be expressed via an explicit `Surface` instance in P2+. Documented inline.
- **Files modified:** `packages/experience-builder-agents/src/mockGeneration.ts`
- **Commit:** `638336cf`

**3. [Rule 3 - Blocking] Mock component-instance literal type too narrow for `JioIRComponentInstanceT[]`**
- **Found during:** Task 2 (own-source typecheck)
- **Issue:** The inferred `slots` literal (`{ children: string } | {}`) did not satisfy `Record<string, SlotValueT>` when assigned to the IR's `instances`, producing TS2322 (runtime was already correct — tests passed).
- **Fix:** Typed the instances array as `JioIRComponentInstanceT[]` and the `slots` object as `Record<string, SlotValueT>` explicitly.
- **Files modified:** `packages/experience-builder-agents/src/mockGeneration.ts`
- **Commit:** `638336cf`

---

**Total deviations:** 3 auto-fixed (2 Rule 3 blocking, 1 Rule 1 bug). All necessary to make the walking-skeleton happy path validate against the frozen contracts. No scope creep; the frozen `-core` mapper/test and existing Convex tables were not modified.

## Authentication Gates

None. The Mastra install was the only supply-chain concern, and it was pre-cleared by the plan-01 `blocking-human` checkpoint; this plan installed the already-approved exact pins.

## Issues Encountered

- **Pre-existing `@oneui/shared` typecheck failure (OUT OF SCOPE):** repo-wide `pnpm typecheck` fails only inside `@oneui/shared` (`buildNativeTheme.ts:233` + `engine/__tests__/*` referencing `stateLayers` / `step` on `ResolvedTokenSet`). These are the same failures documented in plans 01-01/02/03; they leak into the agents/validation packages only because those type-import `@oneui/shared`. Every Lab package's OWN sources (`experience-builder-agents/src/*`) and `@oneui/convex` typecheck clean (0 errors). Not fixed (sibling package's responsibility); already logged in `deferred-items.md`.

## Known Stubs

All stubs below are intentional and central to this plan's premise (Walking Skeleton — every edge is a deterministic mock; the real LLM/model lands in P2):
- **`modelAdapter.callModel()`** throws — there is no real model in P1. The transport seam (`toV6WorkflowStream`) is real and wired; the model-call seam is a documented P2 swap.
- **`foundationResolver.mockTheme()`** returns a deterministic greyscale `ThemeConfig`-shaped placeholder palette. P2 replaces the body with `buildThemeConfig` against the brand's Convex foundations — the SHAPE is unchanged (FND-04 data swap). NOTE: these are palette colours (engine domain), not artifact output dimensions; the Pitfall-6 prohibition (never invent output dimensions for an uncovered profile) is fully honoured — the gap arm carries no dimensions.
- **`mockGenerate`** is a deterministic hand-shaped IR, not LLM output (GEN-01/GEN-08 by design).

None of these prevent the plan's goal (a provably-valid backend round-trip with orchestration ownership); they are the explicitly-scoped P1 mock edges, resolved in P2.

## Threat Model Coverage

All five `mitigate` dispositions in the plan's STRIDE register are implemented and test-covered:

| Threat ID | Mitigation | Evidence |
|-----------|-----------|----------|
| T-01-11 (orchestration in an AI-SDK callback) | All sequencing/branching in the Mastra workflow; model adapter is the sole AI-SDK touch | `workflow.test.ts` ORCH-04 structural tests: `workflow.ts` imports no `ai`/`@ai-sdk`; `modelAdapter.ts` has no `createWorkflow`/`createStep`/`.then`/`.branch` |
| T-01-12 (mock generator emitting invalid/markup IR) | `mockGenerate` output passes IR schema + `validateAst`; gap inputs short-circuit | `mockGeneration.test.ts` GEN-08 (schema + validator pass) + gap-short-circuit tests |
| T-01-13 (resolver inventing non-web dimensions) | Uncovered profile → typed gap, no numeric dimension fields | `foundationResolver.test.ts` asserts no `dimensions`/`width`/`height`/`aspect` and no numeric value on the gap |
| T-01-14 (modifying existing Convex tables) | Append-only schema edits | `git diff packages/convex/convex/schema.ts` shows zero content-deletion lines; existing defs byte-unchanged |
| T-01-SC (Mastra install supply chain) | Exact pins cleared by plan-01 checkpoint; single-ai gate re-run post-install | `node_modules/@mastra/*` = 1.37.1 / 1.4.3; `check-single-ai-version.ts` exits 0 |

## Threat Flags

None — no new network endpoints or auth paths introduced in this plan. The agents package is a pure-Node orchestration + mock library; the Convex functions follow the existing `brands.ts` mutation/query pattern. (The HTTP run route that invokes Mastra is a later plan; this plan delivers only the workflow + persistence functions.)

## Self-Check: PASSED

- Created files verified present: `modelAdapter.ts`, `foundationResolver.ts`, `mockGeneration.ts`, `workflow.ts`, all three test files, `packages/convex/convex/experienceRuns.ts`.
- Task commits verified in git log: `2f039b3f`, `638336cf`, `ba05c991`.
- `pnpm --filter @oneui/experience-builder-agents test` → 16/16 pass.
- `pnpm tsx scripts/check-single-ai-version.ts` → exit 0.
- `grep -c createWorkflow workflow.ts` = 3 (≥1); `grep -c "'v6'" modelAdapter.ts` = 4 (≥1).
- `grep -c experience... schema.ts` = 10 (≥3); schema diff append-only (zero deletions).

---
*Phase: 01-isolated-foundation*
*Completed: 2026-05-30*
