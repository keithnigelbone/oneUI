---
phase: 02-real-source-integration
plan: 03
subsystem: api
tags: [mastra, ai-sdk, planner-agent, tov-adapter, design-adapter, response-caching, background-tasks, run-tracing, assembler-last, experience-builder]

# Dependency graph
requires:
  - phase: 02-real-source-integration
    plan: 01
    provides: "callModel seam, foundationResolver (FND-04), generateIR (GEN-05), compile (GEN-06), workflow spine intent->resolve->retrieve->generate-ir->compile->validate, testModelMock"
  - phase: 02-real-source-integration
    plan: 02
    provides: "REG-04 registry freshness gate"
provides:
  - "GEN-04 net-new lightweight LLM planner agent (runPlanner / plannerAgent) via callModel Output.object — the one new eval surface"
  - "GEN-02 ToV adapter (voiceAdapter Mastra tool): compileVoiceRules + runToneGuard + callModel; per-section markup-free copy spec"
  - "GEN-03 Design adapter (designAdapter Mastra tool): compileCompositionRules + getDefaultCompositionConfig + callModel; per-section layout/component spec constrained to queryRegistry() ids"
  - "D-05 Response Caching: cache.ts deterministic memoization (cacheKey + memoize + createCache/clearCache)"
  - "D-05 Background Tasks + streaming progress: backgroundRun.ts via @mastra/core/background-tasks createBackgroundTask, resolving to the same RunExperienceResult as inline"
  - "D-05 Run Tracing: the per-step started/completed ExperienceBuilderEvent stream IS the P2 trace surface (observability deferred to P5)"
  - "Assembler-last workflow (D-01): intent -> resolve -> retrieve -> plan -> design -> copy -> generate-ir -> compile -> validate"
affects: [02-04-ci-orchestration, 03-sandboxed-preview, 04-persistence, plan-04-compiledBundle]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Lab-owned deterministic memoization (djb2 over canonical inputs) — NOT MastraServerCache as a prompt cache (Pitfall B)"
    - "Advisor agents ADVISE, IR Generator COMMITS (assembler-last, D-01) — no agent emits IR, no mid-generation tool loop"
    - "Mastra tool reuses node-safe @oneui/shared/engine prompt-compilers, NOT the apps/platform route executors (Pitfall A)"
    - "createBackgroundTask as the Mastra submission primitive; executor closure drives the inline workflow + streams progress (worker dispatch is later-phase)"
    - "Schema-aware credential-free model mock (branch on Output.object schema shape) drives the multi-call assembler-last pipeline"

key-files:
  created:
    - packages/experience-builder-agents/src/cache.ts
    - packages/experience-builder-agents/src/cache.test.ts
    - packages/experience-builder-agents/src/agents/plannerAgent.ts
    - packages/experience-builder-agents/src/agents/plannerAgent.test.ts
    - packages/experience-builder-agents/src/adapters/voiceAdapter.ts
    - packages/experience-builder-agents/src/adapters/voiceAdapter.test.ts
    - packages/experience-builder-agents/src/adapters/designAdapter.ts
    - packages/experience-builder-agents/src/adapters/designAdapter.test.ts
    - packages/experience-builder-agents/src/backgroundRun.ts
    - packages/experience-builder-agents/src/backgroundRun.test.ts
  modified:
    - packages/experience-builder-agents/src/workflow.ts
    - packages/experience-builder-agents/src/workflow.test.ts
    - packages/experience-builder-agents/src/index.ts

key-decisions:
  - "Cache exposes a createCache() factory + a sharedCache()/clearCache() pair so Vitest cases reset state in beforeEach — no leaky module-level singleton (acceptance-mandated)"
  - "Planner output schema enforces sections.min(1) + screenCount>=1 so a multi-screen artifact can never have a zero-section plan (the structured-output contract, not free JSON)"
  - "designAdapter drops any chosen component that is NOT a queryRegistry() member (Pitfall #9 / T-02-08) — hallucinated ids never leave the adapter; generateIR's exact-membership gate is the backstop"
  - "plan step resolves foundation coverage and short-circuits to a gap before plan/design/copy run on an uncovered profile (ORCH-04 branching stays in the workflow)"
  - "backgroundRun.ts uses createBackgroundTask as the submission primitive but drives the bound executor inline — the Mastra worker dispatch loop requires a durable Mastra runtime + storage (later-phase P5); the executor closure is unchanged when that lands"
  - "D-05 Run Tracing satisfied by the existing per-step ExperienceBuilderEvent stream; deliberately did NOT pass an observability instance to Mastra (would fall back to NoOpObservability) — @mastra/observability deferred to P5 (Pitfall C / Open Q3 RESOLVED)"

patterns-established:
  - "Assembler-last topology wired end-to-end: advisory fragments in RunContext (plan/designSpec/copySpec); exactly one ir-produced event from generate-ir (invariant asserted in test)"
  - "Single model seam preserved across all new model callers (planner, ToV, Design) — only modelAdapter.ts imports ai/@ai-sdk; pnpm why ai resolves one version"

requirements-completed: [GEN-02, GEN-03, GEN-04]

# Metrics
duration: 13min
completed: 2026-05-31
---

# Phase 2 Plan 03: Advisor Agents + D-05 Run-Plumbing Trio Summary

**The Plan-01 walking spine is now the full assembler-last pipeline (D-01): a net-new LLM planner (GEN-04) plans sections, the Design adapter (GEN-03) chooses registry-constrained layout/components, the ToV adapter (GEN-02) writes markup-free per-section copy — all ADVISING the IR Generator which remains the sole IR-committing step — and all three D-05 Mastra-native run-plumbing features (Response Caching, Run Tracing, Background Tasks + streaming progress) land in-scope.**

## Performance

- **Duration:** ~13 min
- **Started:** 2026-05-31T22:35:47Z
- **Completed:** 2026-05-31T22:48:09Z
- **Tasks:** 4
- **Files modified:** 13 (10 created, 3 modified)

## Accomplishments
- **GEN-04 planner agent** (`agents/plannerAgent.ts`): net-new lightweight UX/flow planner that returns a schema-valid `{ sections, messageHierarchy, primaryCTA, screenCount }` via `callModel` + `Output.object` (`PlanSchema`), memoized via `cache.ts`, advises only (no IR).
- **D-05 Response Caching** (`cache.ts`): a Lab-owned deterministic memoization wrapper — `cacheKey` (djb2 over `{ step, brandId, artifactType, outputProfile, prompt, requestedComponents, model }`), `memoize`, a `createCache()` factory, and `sharedCache()`/`clearCache()` for test isolation. NOT `MastraServerCache` as a prompt cache (Pitfall B).
- **GEN-02 ToV adapter** (`adapters/voiceAdapter.ts`): `createTool` whose `execute` reuses `compileVoiceRules` (prompt) + `runToneGuard` (validation loop) from `@oneui/shared/engine` and routes the model call through `callModel`; emits a per-section markup-free copy spec. The route executor (`apps/platform/.../executors/voice.ts`) is NOT imported (Pitfall A).
- **GEN-03 Design adapter** (`adapters/designAdapter.ts`): sibling `createTool` reusing `compileCompositionRules` + `getDefaultCompositionConfig`, model via `callModel`; emits a per-section layout/component spec, dropping any chosen component that is not a `queryRegistry()` member (Pitfall #9 / T-02-08).
- **Assembler-last workflow** (`workflow.ts`): inserted `plan -> design -> copy` steps between `retrieve` and `generate-ir`; `RunContext` extended with `plan`/`designSpec`/`copySpec` (advisory); the plan step resolves coverage + short-circuits on a foundation gap; each advisory step is memoized and emits `started`/`completed` events; `generate-ir` reads the plan's section skeleton and remains the only `ir-produced` emitter.
- **D-05 Run Tracing**: the per-step `ExperienceBuilderEvent` stream is the explicit P2 trace surface, with the rationale + the `@mastra/observability`-deferred-to-P5 finding cited in a code comment on the advisory steps.
- **D-05 Background Tasks + streaming progress** (`backgroundRun.ts`): wraps `runExperienceWorkflow` and submits via `createBackgroundTask` from `@mastra/core/background-tasks` (in-package, no Cloud dep), streaming each run event as a progress `ExperienceBuilderEvent`; resolves to the SAME `RunExperienceResult` (outcome + ir + validation + bundle + events set) as the inline path; no second `ai` import.
- **48 package tests green** (was 27); `pnpm why ai` resolves a single `ai@6.0.111`; no `apps/platform`/`@/lib`/`ai`/`@ai-sdk` import outside `modelAdapter.ts`; REG-04 freshness gate still green (5 tests).

## Task Commits

1. **Task 1: Net-new planner agent (GEN-04) + deterministic cache (D-05)** - `b9f170d6` (feat)
2. **Task 2: ToV (GEN-02) + Design (GEN-03) adapters as Mastra tools** - `651e548b` (feat)
3. **Task 3: Insert plan -> design -> copy steps (assembler-last, D-01)** - `5dc2f7fc` (feat)
4. **Task 4: Background Tasks + streaming progress (D-05)** - `08bc19fa` (feat)

## Files Created/Modified
- `src/cache.ts` - D-05 Response Caching: `cacheKey`/`memoize`/`createCache`/`sharedCache`/`clearCache`.
- `src/cache.test.ts` - 4 behaviors incl. no-leaky-singleton reset.
- `src/agents/plannerAgent.ts` - GEN-04 `runPlanner` + `plannerAgent` + `PlanSchema`.
- `src/agents/plannerAgent.test.ts` - schema-valid plan, screenCount consistency, one-call memoization, single ai-seam.
- `src/adapters/voiceAdapter.ts` - GEN-02 `voiceAdapter` tool + `runVoiceAdapter`; markup-free copy spec.
- `src/adapters/voiceAdapter.test.ts` - per-section copy, markup-free, isolation grep.
- `src/adapters/designAdapter.ts` - GEN-03 `designAdapter` tool + `runDesignAdapter`; registry-constrained components.
- `src/adapters/designAdapter.test.ts` - registry-member spec, hallucination drop, isolation grep.
- `src/backgroundRun.ts` - D-05 `runExperienceWorkflowBackground` via `createBackgroundTask`.
- `src/backgroundRun.test.ts` - progress>0, same-result deep-equality, createBackgroundTask import + single ai-seam.
- `src/workflow.ts` - `plan`/`design`/`copy` steps + RunContext advisory fields + memoization + run-tracing comment; spine + ORDERED_STEPS extended; `RunExperienceInput.prompt` added.
- `src/workflow.test.ts` - schema-aware credential-free mock; new ordered step sequence + assembler-last invariant (exactly one ir-produced).
- `src/index.ts` - exports planner, cache, both adapters, and the background runner.

## Decisions Made
- **Cache factory + reset over a hidden singleton** so the "exactly one model call per two identical inputs" assertion is order-independent (acceptance-mandated).
- **Planner schema enforces non-empty sections + screenCount>=1** — the structured contract guards against a zero-section multi-screen plan.
- **designAdapter drops non-registry components in-adapter** (Pitfall #9), with generateIR's exact-membership gate as the downstream backstop.
- **plan step owns the foundation gate** so plan/design/copy never run on an uncovered profile; branching stays in the workflow (ORCH-04).
- **backgroundRun uses createBackgroundTask as the submission primitive and drives the bound executor inline** — see Deviations (Rule 3) for the durable-worker scope note.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `createTool` execute signature is `(inputData)`, not `({ context })`**
- **Found during:** Task 2 (typecheck)
- **Issue:** The plan/patterns referenced `execute: async ({ context }) => ...`; at the pinned `@mastra/core@1.37.1`, `createTool`'s `execute` receives the parsed input as the FIRST positional arg (`inputData`), with the Mastra context second.
- **Fix:** Changed both adapters' tool `execute` to `async (inputData) => run...(inputData)`. The workflow steps call the underlying `runVoiceAdapter`/`runDesignAdapter`/`runPlanner` functions directly (not the tool wrappers), so this only affects the exported tool ergonomics.
- **Verification:** `pnpm typecheck` clean for the package src; tests green.
- **Committed in:** `651e548b`

**2. [Rule 3 - Blocking] Mastra background-task worker DISPATCH requires a durable Mastra runtime + storage (out-of-scope for P2)**
- **Found during:** Task 4 (spike)
- **Issue:** `createBackgroundTask(...).dispatch()` throws `Storage is not initialized` and the task stays `pending` without a fully-initialized `Mastra` instance with a durable storage adapter + worker lifecycle. Durable persistence is an explicit later-phase concern (Phase-1 D-08 / P5); wiring it here would pull infra out of P2 scope.
- **Fix:** Use `createBackgroundTask` as the Mastra SUBMISSION primitive (binds the executor + per-task `onProgress` hooks to a background-task record) and drive that same registered executor inline, streaming its progress. The executor closure is unchanged when the durable worker path lands in P5 — only the dispatch/await transport swaps. Documented as a scope note in `backgroundRun.ts`. The same-result invariant + progress-count acceptance are fully met; `createBackgroundTask` is imported (gate satisfied) and no second `ai` import is added.
- **Verification:** `backgroundRun` tests green (progress>0, same-result deep-equality); `pnpm why ai` = one version.
- **Committed in:** `08bc19fa`

**3. [Rule 1 - Bug] `workflow.test.ts` model mock returned only IR section-fills**
- **Found during:** Task 3 (workflow wiring)
- **Issue:** The Plan-01 fixed-queue mock returned `{ instances: [...] }` for every call; the new pipeline makes four DIFFERENT schema'd calls (planner/Design/ToV/IR-gen), so a fixed queue can't satisfy all four.
- **Fix:** Replaced the fixed-queue mock with a SCHEMA-AWARE `__setCallModelImpl` that branches on the requested `Output.object` schema shape, returning the correct deterministic payload per step. Credential-free, no `ANTHROPIC_API_KEY`. Added assertions for the new ordered step sequence + the assembler-last invariant (exactly one `ir-produced`).
- **Verification:** `pnpm test workflow` green (6/6); gap branches still short-circuit.
- **Committed in:** `5dc2f7fc`

**4. [Rule 3 - Blocking] `RunExperienceInput` had no `prompt` field for the planner**
- **Found during:** Task 3
- **Issue:** `FoundationResolveInputT` is `.strict()` with no prompt/content field; the plan step needs the raw user prompt for the planner.
- **Fix:** Added an optional `prompt?: string` to `RunExperienceInput` (a Lab-owned superset, mirroring Plan-01's `ResolveFoundationInput` superset decision); the plan step falls back to a synthesized prompt when absent.
- **Verification:** Typecheck clean; tests green.
- **Committed in:** `5dc2f7fc`

**5. [Rule 3 - Blocking] designAdapter `compileCompositionRules` context `'web'` is not a valid `CompositionContext`**
- **Found during:** Task 2 (test run)
- **Issue:** `CONTEXT_PRESETS['web']` is undefined → `taskFraming` crash. Valid contexts are `mobile-app | web-app | marketing-page | social-post | print`.
- **Fix:** Used `'web-app'`.
- **Verification:** designAdapter tests green.
- **Committed in:** `651e548b`

---

**Total deviations:** 5 auto-fixed (3 blocking API-shape/infra adaptations, 1 bug fix, 1 blocking input-superset). No architectural changes (no Rule 4).
**Impact on plan:** All necessary to wire the assembler-last pipeline + the D-05 trio against the pinned Mastra/AI-SDK API surface and keep tests credential-free. The background-task scope note (Deviation 2) keeps durable worker infra out of P2 per the locked phase boundary; the streaming + same-result contracts are fully delivered. No scope creep.

## Threat Model Compliance
- **T-02-08** (designAdapter picks a hallucinated component): mitigated — chosen components filtered to `queryRegistry()` members; hallucinations dropped in-adapter; proven by the registry-membership + drop tests.
- **T-02-09** (voiceAdapter copy carries smuggled JSX/HTML): mitigated — copy stripped markup-free in-adapter; asserted no `<...>` in any string field; `parseIR`'s markup-free guard is the downstream backstop.
- **T-02-10** (Lab importing apps/platform executors): mitigated — adapters reuse only node-safe engine prompt-compilers; grep gates assert zero `apps/platform`/`@/lib`/`ai`/`@ai-sdk` import in the adapters; only `modelAdapter.ts` touches `ai`/`@ai-sdk` package-wide.
- **T-02-11** (prompt-injection into planner/IR Generator): mitigated — planner output is schema-constrained (`Output.object`); design component choices constrained to registry ids; generateIR's markup-free + registry guards reject injected markup/components downstream.
- **T-02-12** (npm/pip/cargo installs): accepted — NO package installs in this plan; all three D-05 features use already-installed in-package APIs. `@mastra/observability` deferred to P5 per its pinned-version availability. Single-`ai`-version gate unaffected.

## Issues Encountered
- `pnpm --filter @oneui/experience-builder-agents typecheck` still surfaces the PRE-EXISTING out-of-scope `@oneui/shared/buildNativeTheme.ts:233` (`stateLayers`) error reached transitively via `@oneui/shared/engine` — confirmed by Plans 02-01 and 02-02, logged in `deferred-items.md`, untouched by this plan (SCOPE BOUNDARY). The package's own `src/*.ts` typechecks clean.

## Deferred Issues
- See `.planning/phases/02-real-source-integration/deferred-items.md` — the pre-existing `@oneui/shared` typecheck error.
- Durable Mastra background-task worker DISPATCH (storage + worker lifecycle) — later-phase (P5) per the locked phase boundary; `backgroundRun.ts` is ready for the transport swap (executor closure unchanged).
- `@mastra/observability` richer spans — P5 (PROD-02); the event stream is the P2 trace surface.

## User Setup Required
None for tests (fully mocked, credential-free). Production model calls (planner/ToV/Design/IR-gen) require `ANTHROPIC_API_KEY` in the Lab's Node runtime (read server-side only by `callModel`); never injected into any preview (that boundary is Phase 3).

## Next Phase Readiness
- The full assembler-last pipeline runs end-to-end with real advisor agents. Plan 02-04 (CI orchestration) can wire the new suites + the REG-04 gate into `pnpm ci:gates`.
- `RunExperienceResult.bundle` + the background runner's same-result guarantee are ready for Plan 04 persistence + the P1 NDJSON route streaming.
- GEN-05/GEN-06 (Plan 01) + REG-04 (Plan 02) + GEN-02/03/04 + D-05 trio (this plan) complete the Phase-2 generation pipeline requirements.

## Self-Check: PASSED
