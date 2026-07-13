# Phase 2: Real Source Integration - Research

**Researched:** 2026-05-31
**Domain:** Mastra-orchestrated deterministic compile path — swap P1 mocks for real sources (foundation resolver, registry, ToV/Design adapters), add a new LLM planner + LLM IR Generator (`Output.object`), and an IR→AST→React+Jio CSS compiler — inside the isolated `experience-builder-*` packages of a Next.js 15 / AI-SDK v6 / Convex / tldraw monorepo.
**Confidence:** HIGH for the Mastra/AI-SDK pinned-version API surface (verified against installed `node_modules`), the P1 contracts (read from source), and the REG-04/GEN-06 acceptance mechanics. MEDIUM for the exact ToV/Design adapter shape (the real engine entrypoints are HTTP-route executors, not in-process functions — see the surprise below).

## Summary

Phase 2 is an integration phase, not a greenfield one. The P1 walking skeleton already froze every contract this phase fills: the IR Zod schema, the `FoundationResolveResult` discriminated union, the `queryRegistry` derive-don't-copy adapter, `validateAst`, the `irToAst` mapper, the `ExperienceBuilderEvent` stream, the `experience*` Convex tables, and the `modelAdapter` boundary that is the single place `ai`/`@ai-sdk/*` is touched. Five of the six requirements are **body swaps and additive wiring inside `experience-builder-agents`**, not schema migrations.

Every pinned-version API the CONTEXT.md mandate flagged was verified against the actually-installed packages (`@mastra/core@1.37.1`, `@mastra/ai-sdk@1.4.3`, `ai@6.0.111`, `zod@4.3.6`). All three "Mastra-native run plumbing" features (response caching, run tracing/observability, background tasks) are **real in-package APIs at the pinned version** — but with two important nuances: (1) `MastraServerCache`/`InMemoryServerCache` is a generic KV/list store for stream events, **not** an automatic prompt-keyed LLM response cache — D-05 response-caching must be a thin Lab-owned deterministic memoization layer keyed on canonical inputs, backed by that store; (2) the `observability` config slot expects an `Observability` instance from `@mastra/observability`, **a separate package that is NOT currently installed** (`@mastra/observability@1.14.0` + `@mastra/otel-bridge@1.2.0` exist on npm and are first-party Mastra packages). `Output.object` is confirmed present in `ai@6.0.111`; the Mastra-idiomatic equivalent is `Agent.generate({ structuredOutput: { schema } })`.

**The one genuine surprise** (MEDIUM-confidence area, flagged for the planner): the "real ToV/Design engine functions" named in CONTEXT.md (`voiceCompiler`/`compositionCompiler`) are **deterministic prompt-builders** (they compile brand rules + config into a prompt string), NOT the LLM generation. The actual generation lives in `apps/platform/src/app/api/agent/executors/{voice,design}.ts`, which return a streaming HTTP `Response`, import `ai` directly, depend on `process.env.ANTHROPIC_API_KEY`, and (for design) are coupled to a Convex HTTP client + `@/lib/*` app internals. **The Lab cannot reuse those executors** without breaking isolation and the single-modelAdapter boundary. D-04's thin adapter must instead: call the node-safe deterministic engine pieces from `@oneui/shared/engine` (`compileVoiceRules`, `runToneGuard`, `compileCompositionRules`, `getDefaultCompositionConfig`) to build the prompt + validate, and route the model call through the Lab's own `modelAdapter`. This is still "call the public engine API, internals untouched" — but the reused surface is the prompt-compiler, not the route executor.

**Primary recommendation:** Build all six requirements as additive code inside `experience-builder-agents` (+ the REG-04 freshness test in `experience-builder-registry`, + a `compiledBundle` field on `experienceArtifactVersions`). Centralize every real model call behind P1's `modelAdapter` (Agent + `structuredOutput`/`Output.object`). Wrap the deterministic ToV/Design prompt-compilers as Mastra tools; add the net-new planner agent and the LLM IR Generator as Mastra steps in the existing `createWorkflow().then(...)` spine. Prove GEN-06 with the credential-free triad (tsc + `validateAst` + codegen snapshot) and REG-04 with a derive-equals-live assertion test.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01 (Assembler-last topology):** Pipeline is `intent → resolve(real) → retrieve(real) → UX/flow plan → Design (layout/components) → ToV (copy per section) → IR Generator (assemble → valid IR) → compile → validate`. Planner/Design/ToV **advise** (emit structured spec fragments); the **IR Generator commits** the final IR via `Output.object()`. Agents do NOT each produce IR; the IR Generator does NOT call them mid-generation in a tool loop.
- **D-02 (GEN-04 = new lightweight LLM planner agent):** No existing planner in the repo. Build a net-new lightweight planner agent (Mastra tool + AI-SDK call via `modelAdapter`) taking prompt + artifact type → structured plan (section list, message hierarchy, primary CTA, screen count). Feeds Design + ToV. The one genuinely new agent with an eval surface this phase.
- **D-03 (Coverage-driven artifact-type scope):** No hardcoded allowlist of "blessed" artifact types. Foundations are platform/dimension-driven; type scale + dimensions adapt to the selected platform/output profile by design. Rule: **whatever resolves to real foundation coverage generates; whatever does not gap-reports.** Campaign/social profiles continue to gap-report (foundation coverage unverified until P4), not because of a type allowlist.
- **D-04 (Thin typed adapters):** Lab's Mastra tools call the ToV/Design **engine functions** (`voiceCompiler`/`compositionCompiler` from `@oneui/shared/engine`) **in-process**, wrapped behind a Lab-owned thin typed adapter in `experience-builder-agents`. No HTTP hop, no auth/origin surface, no route-stability coupling. Adapter insulates the Lab from engine internals. Internals untouched — public engine API only.
- **D-05 (Mastra-native run plumbing — in scope for P2):** Use Mastra-native features, not hand-rolled: **Response Caching** (cache repeatable planner/ToV/Design steps with identical inputs — serves determinism + cuts dev cost); **Run Tracing** (Mastra Observability, basic per-step traces; full dashboard stays P5/PROD-02); **Background Tasks + streaming progress** (long runs, extending the P1 NDJSON `ExperienceBuilderEvent` stream). **CAVEAT:** verify each capability's availability/exact API against pinned `@mastra/core@1.37.1` + `@mastra/ai-sdk@1.4.3`; some may be Cloud-only or newer-API; nothing breaks the single-`ai`-version gate or the AI-SDK-model-layer-only boundary (ORCH-04).
- **D-06 (In-gen retry only; repair loop stays P3):** IR Generator owns a generation self-correction loop — on a Zod-parse failure OR an AST-validator failure of the compiled output, re-prompt with the error appended, cap ~2–3 attempts, then emit error/gap. Distinct from P3's eval-driven repair loop (which patches valid-but-low-quality IR after the evaluator scores it, cap N=3). Do NOT unify or pull the repair loop forward.
- **D-07 (Compiler emits both — codegen string is canonical):** GEN-06 emits a React + Jio CSS code string (reuse `astToReact`/`astToPage`, approved `@oneui/ui` + Jio CSS imports only) — the **canonical, persisted compiled bundle** (P3 sandboxes, P5 exports). ALSO keeps the ephemeral `ASTRenderer` runtime-render path for quick internal checks — **internal-convenience only: never persisted, never the export source.** IR remains the single source of truth.
- **D-08 (GEN-06 acceptance without P3 DOM):** Prove the compiler with a deterministic, credential-free, CI-able check: (1) emitted module type-checks + its `@oneui/ui` imports resolve, (2) AST allowlist validator (`validateAst`) passes on the compiled output, (3) codegen string snapshot is stable. No jsdom/browser render in P2.
- **D-09 (System defaults fill partial brands):** Resolve a partially-configured brand with its configured foundations and let the engine's system defaults fill anything unconfigured — exactly as the live platform renders partial brands today. A foundation gap is reserved for a genuinely unresolvable profile/dimension, NOT "the brand used a default."
- **D-10 (REG-04 = derive-don't-copy, hard-fail on any divergence):** Lab registry keeps NO separate hand-maintained component list — derives entirely from `@oneui/shared/meta/generated` at build/query time (P1 already does this). CI freshness gate is a test asserting the derived set **equals** the live meta source, hard-failing on ANY divergence (added/removed/changed component or metadata). Zero hand-maintained drift surface.

### Claude's Discretion
- **Per-section vs whole-artifact IR generation** — roadmap mandates per-section decomposition; the exact section-batching granularity is the planner's call within that constraint.
- **Intent/prompt parsing** — how the raw prompt is parsed into the planner's input (deterministic vs a light LLM pass) is open.
- **Which model the new planner agent uses** — choose via `modelAdapter`; default to the most capable cost-appropriate model.
- **How the compiled bundle persists** in the `experience*` Convex tables (alongside the IR, append-only per Phase-1 D-08) — follow existing `experience*` schema conventions; the bundle is structured/text, never raw markup as a source of truth.

### Deferred Ideas (OUT OF SCOPE)
- **Print-specific foundation additions** (CMYK/spot color, print color profiles) — future foundation-engine extension, not P2.
- **Mastra Sandbox / Workspace providers** for safe execution/preview — evaluate in the P3 separate-origin sandboxed preview work, not now.
- **Full cost/observability dashboards** (beyond basic run tracing) — P5 (PROD-02).
- **Eval-driven repair loop & visual evaluator** — P3; P2 only does in-generation self-correction (D-06).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **FND-04** | Real Jio foundation/token source connected without a schema migration | Body swap inside `foundationResolver.ts`: replace `mockTheme()` with `buildThemeConfig(availableScales, appearanceConfig)` from `@oneui/shared/engine`, fed from the brand's Convex foundations. Return shape (`{ ok: true, theme: ThemeConfig }`) is frozen and already matched by the mock. D-09 maps directly to `buildThemeConfig`'s built-in `ensureNeutralRole`/`synthesizeBrandBgIfMissing` defaults — partial brands resolve, never gap. |
| **REG-04** | CI freshness gate keeps registry in sync with real component metadata source | `queryRegistry` already derives 100% from `JIO_WEB_ALPHA_COMPONENTS` (`@oneui/ui/registry/jioAlphaCatalog`) × `*_GENERATED_PROPS` (`@oneui/shared/meta/generated`). Freshness gate = a Vitest test that re-derives from those sources independently and asserts deep-equality with `queryRegistry()` output, hard-failing on any divergence (D-10). `KNOWN_DRIFT_EXCLUSIONS = ['Modal','Text']` is exported for the gate to read. |
| **GEN-02** | Existing ToV agent (api/voice) integrated to produce brand-aligned copy | Wrap as a Mastra tool. SURPRISE: real entrypoint is an HTTP-route executor — reuse the node-safe pieces `compileVoiceRules` + `runToneGuard` (`@oneui/shared/engine`) for prompt + validation, model call via `modelAdapter`. See "Don't Hand-Roll" + Pitfall A. |
| **GEN-03** | Existing Design/Composition agent (api/composition) integrated to choose layout/hierarchy/composition | Wrap as a Mastra tool reusing `compileCompositionRules` + `getDefaultCompositionConfig` (`@oneui/shared/engine`), model call via `modelAdapter`. Same surprise as GEN-02. |
| **GEN-04** | UX/flow planner agent plans flows/screens/message hierarchy | Net-new lightweight Mastra agent (D-02). Input: prompt + artifactType + resolved coverage. Output (`Output.object`/`structuredOutput`): `{ sections[], messageHierarchy, primaryCTA, screenCount }`. Feeds Design + ToV. The one new eval surface. |
| **GEN-05** | IR Generator agent produces valid Jio Experience IR | LLM step using `Output.object({ schema: JioExperienceIR })` (or `Agent.generate({ structuredOutput })`). Assembles planner+Design+ToV spec fragments into one valid IR. Per-section decomposition (roadmap mandate). In-gen retry (D-06): on Zod-parse OR compiled-AST-validate failure, re-prompt with error, cap ~2–3. Constrain `type` to retrieved `componentId`s (registry enum). |
| **GEN-06** | Compiler converts IR → React + Jio CSS using only approved Jio imports | `irToAst(ir): ASTRoot` → `astToReact`/`astToNextPage` (`@oneui/shared/codegen`) emits the canonical string bundle (D-07). Ephemeral `ASTRenderer` for internal checks only. Acceptance triad (D-08): tsc + `validateAst` + snapshot. Persist bundle on a new `compiledBundle` field of `experienceArtifactVersions`. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Foundation resolution (FND-04) | `experience-builder-agents` (node, server) | `@oneui/shared/engine` (pure `buildThemeConfig`) | Resolver is a Lab-owned step calling a pure engine function; foundation data comes from Convex (backend). Never client. |
| Registry retrieval + freshness (REG-04) | `experience-builder-registry` (pure, node/browser/worker) | CI (Vitest gate) | Pure derivation from meta; gate is a test, not runtime. |
| ToV/Design copy & layout (GEN-02/03) | `experience-builder-agents` Mastra tools (node) | `@oneui/shared/engine` prompt-compilers + `modelAdapter` (model layer) | Orchestration owns sequencing; deterministic prompt-build is pure; the model call is the AI-SDK layer (ORCH-04). |
| UX planner (GEN-04) | `experience-builder-agents` Mastra agent (node) | `modelAdapter` | New agent; LLM call only via the single model seam. |
| IR generation (GEN-05) | `experience-builder-agents` (node) | `modelAdapter` (`Output.object`) + `experience-builder-core` (IR schema) | The commit step; structured output is the AI-SDK layer; schema is the frozen core contract. |
| IR→AST→React compile (GEN-06) | `experience-builder-agents` wiring | `experience-builder-core` (`irToAst`) + `@oneui/shared/codegen` (string emit) + `experience-builder-validation` (`validateAst`) | Compile is pure/deterministic; no model. Persisted to Convex. |
| Run plumbing: cache/trace/background (D-05) | `experience-builder-agents` + Mastra root (`Mastra` instance) | `@mastra/core/{cache,observability,background-tasks}` + `@mastra/ai-sdk` transport | All orchestration concerns — Mastra's domain (ORCH-04). |
| Persist compiled bundle | `packages/convex` (`experienceArtifactVersions`) | — | Single source of truth, append-only. |

## Standard Stack

### Core (all verified present in `node_modules` at the pinned versions)

| Library | Version (installed) | Purpose | Why Standard |
|---------|--------------------|---------|--------------|
| `@mastra/core` | `1.37.1` | Workflow/step/agent/tool primitives + cache + observability + background-tasks subpaths | The orchestration brain (ORCH-04). `[VERIFIED: node_modules/@mastra/core/package.json]` |
| `@mastra/ai-sdk` | `1.4.3` | Bridge Mastra workflow/agent streams → AI-SDK v6 UI stream (`toAISdkStream`, `handleWorkflowStream`, `workflowRoute`) | Stream transport to the Lab UI; already used by P1 `modelAdapter`. `[VERIFIED: node_modules]` |
| `ai` (Vercel AI SDK) | `6.0.111` | Model layer ONLY — `Output.object`, `tool`, `generateText`/`streamText` | `Output` exported with `{ array, choice, json, object, text }`. `[VERIFIED: node -e require('ai').Output]` |
| `@ai-sdk/anthropic` | `3.0.54` | Claude provider (`claude-sonnet-4-6` per `@oneui/shared/agent` `CLAUDE_MODEL`) | The model the existing agents use. `[VERIFIED: node_modules]` |
| `zod` | `4.3.6` | IR schema + structured-output schema + Mastra step schemas | One schema lib across the stack. `@mastra/core` peer-requires `zod ^3.25 || ^4.0` — satisfied. `[VERIFIED: node_modules + peerDependencies]` |

### Supporting (NEW — add only if the relevant D-05 capability is planned)

| Library | Version (npm latest) | Purpose | When to Use |
|---------|---------------------|---------|-------------|
| `@mastra/observability` | `1.14.0` | The `Observability` instance the `Mastra({ observability })` slot requires for run tracing | **NOT currently installed.** Required for D-05 "Run Tracing." First-party Mastra package (same org/publisher as `@mastra/core`, published 2026-05-31). `[VERIFIED: npm view @mastra/observability]` |
| `@mastra/otel-bridge` | `1.2.0` | OpenTelemetry bridge for observability exporters | Optional with `@mastra/observability`; mainly P5. `[VERIFIED: npm view @mastra/otel-bridge]` |

> **Caution (package legitimacy):** these two were tagged `[ASSUMED]` until slopcheck could run; both are clearly legitimate (1.x, official `@mastra` scope, same publisher as the already-trusted `@mastra/core`, fresh 2026 publish). If the planner adds them, gate behind a `checkpoint:human-verify` per the audit table below, and confirm they pull no second `ai` copy (`pnpm why ai` must show one version).

### Reused — already in repo, DO NOT re-add

| Asset | Location | Role in P2 |
|-------|----------|------------|
| `buildThemeConfig(availableScales, appearanceConfig): ThemeConfig \| null` | `@oneui/shared/engine` | FND-04 resolver body. `[VERIFIED: source read]` |
| `compileVoiceRules`, `runToneGuard`, `validateVoiceConfig`, `VoiceConfig` | `@oneui/shared/engine` | GEN-02 prompt build + tone validation (node-safe). `[VERIFIED: engine/index.ts barrel]` |
| `compileCompositionRules`, `getDefaultCompositionConfig`, `CompositionConfig` | `@oneui/shared/engine` | GEN-03 prompt build (node-safe). `[VERIFIED: barrel]` |
| `irToAst(ir, options): ASTRoot` | `@oneui/experience-builder-core` | GEN-06 IR→AST mapper (frozen). `[VERIFIED: source line 92]` |
| `astToReact`, `astToReactComponent`, `astToNextPage`, `astToReactNativeScreen` | `@oneui/shared/codegen` | GEN-06 string emitters (D-07). `importSource` defaults to `@oneui/ui`. `[VERIFIED: source]` |
| `ASTRenderer` (component) | `@oneui/ui/runtime` | D-07 ephemeral internal render only. Strips non-allowed props/layout-override styles. `[VERIFIED: source]` |
| `validateAst(ast, context): JioValidationResult` | `@oneui/experience-builder-validation` | GEN-06 acceptance (D-08) + workflow validate step. `[VERIFIED: index.ts]` |
| `queryRegistry`, `getRegistryItem`, `isRegistered`, `KNOWN_DRIFT_EXCLUSIONS` | `@oneui/experience-builder-registry` | REG-02/03 retrieval + REG-04 gate source. `[VERIFIED: source]` |
| `JioExperienceIR` (Zod), `parseIR`, `JioIRComponentInstance`, `SlotValue` | `@oneui/experience-builder-core` | GEN-05 structured-output schema + markup-free guard. `[VERIFIED: source]` |
| `ExperienceBuilderEvent*` (events contract) | `@oneui/experience-builder-core` | Stream surfacing; `step` is open `z.string()` so new step names need no schema change. `[VERIFIED: source]` |
| `modelAdapter.ts` (`toV6WorkflowStream`, `callModel` seam) | `experience-builder-agents` | The ONLY place `ai`/`@ai-sdk` is touched; `callModel` throws in P1 — P2 implements it. `[VERIFIED: source]` |
| `experienceRuns`, `experienceArtifacts`, `experienceArtifactVersions` | `@oneui/convex` schema | Persist run + IR + (new field) compiled bundle. `[VERIFIED: schema.ts L1977-2040]` |

### Installation

```bash
# Only if D-05 Run Tracing is planned this phase (else defer to P5):
pnpm --filter @oneui/experience-builder-agents add @mastra/observability@1.14.0
# Optional OTel export (mostly P5):
pnpm --filter @oneui/experience-builder-agents add @mastra/otel-bridge@1.2.0
# Everything else (@mastra/core, @mastra/ai-sdk, ai, @ai-sdk/anthropic, zod) is ALREADY installed — do not re-add.
```

**Version verification performed (2026-05-31):**
- `@mastra/core@1.37.1`, `@mastra/ai-sdk@1.4.3`, `ai@6.0.111`, `@ai-sdk/anthropic@3.0.54`, `zod@4.3.6` — all confirmed in `node_modules`.
- `@mastra/observability@1.14.0`, `@mastra/otel-bridge@1.2.0` — confirmed on npm (not yet installed).

## Package Legitimacy Audit

> slopcheck could not be installed in this sandboxed session; the two NEW packages are therefore tagged `[ASSUMED]` and the planner must gate each install behind a `checkpoint:human-verify` task. All other recommended packages are already installed dependencies of the running repo (highest trust).

| Package | Registry | Age/Version | Source Repo | slopcheck | Disposition |
|---------|----------|-------------|-------------|-----------|-------------|
| `@mastra/core` | npm | 1.37.1 (installed) | github.com/mastra-ai/mastra | n/a (installed) | Approved — already a repo dep |
| `@mastra/ai-sdk` | npm | 1.4.3 (installed) | github.com/mastra-ai/mastra | n/a (installed) | Approved — already a repo dep |
| `ai` | npm | 6.0.111 (installed) | github.com/vercel/ai | n/a (installed) | Approved — already a repo dep |
| `@ai-sdk/anthropic` | npm | 3.0.54 (installed) | github.com/vercel/ai | n/a (installed) | Approved — already a repo dep |
| `zod` | npm | 4.3.6 (installed) | github.com/colinhacks/zod | n/a (installed) | Approved — already a repo dep |
| `@mastra/observability` | npm | 1.14.0 (NEW) | github.com/mastra-ai/mastra (`@mastra` scope, same publisher as core) | unavailable → `[ASSUMED]` | Flagged — planner adds `checkpoint:human-verify` before install (only if D-05 tracing planned) |
| `@mastra/otel-bridge` | npm | 1.2.0 (NEW) | github.com/mastra-ai/mastra | unavailable → `[ASSUMED]` | Flagged — planner adds `checkpoint:human-verify` (likely P5, optional in P2) |

**Packages removed due to slopcheck [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** none (the two NEW packages are first-party scoped to the already-trusted `@mastra` org; `[ASSUMED]` only because slopcheck couldn't run, not because of any risk signal).

## Pinned-Version API Verification (the CONTEXT.md D-05 mandate)

> Every claim here was checked by `require`-ing the installed package and listing exports, or by reading the installed `.d.ts`. `[VERIFIED: node_modules @ pinned version]` unless noted.

### `Output.object()` — GEN-05 structured output (CONFIRMED, idiom nuance)

- **`ai@6.0.111` exports `Output`** with members `{ array, choice, json, object, text }`. `Output.object({ schema })` is the v6 idiom; `generateObject` is still exported but deprecated — **do not use** in new code.
- **Two valid paths**, both verified present:
  1. **AI-SDK direct:** `generateText({ model, prompt, output: Output.object({ schema: JioExperienceIR }) })` — lives inside `modelAdapter`/a Mastra tool's `execute`.
  2. **Mastra-idiomatic:** `Agent.generate(messages, { structuredOutput: { schema: JioExperienceIR } })`. The installed agent types expose `StructuredOutputOptions<OUTPUT> = { schema: StandardSchemaWithJSON, model?, instructions?, useAgent?, jsonPromptInjection? }`. Mastra runs an internal "structuring agent" (optionally a cheaper `model`) and validates against the Zod schema. `[VERIFIED: @mastra/core/dist/agent/types.d.ts]`
- **Retry-on-parse-error (D-06):** neither path auto-retries with error feedback. The in-gen loop is **Lab-owned**: catch the Zod `safeParse` failure (use `parseIR`) OR the `validateAst` failure of the compiled output, append the error to the prompt, re-call, cap ~2–3 attempts. Keep this loop inside the IR-generation step (orchestration), not in an AI-SDK callback.
- **Per-section decomposition:** generate the section skeleton (planner output) first, then fill each section's component instances in a bounded `Output.object` (or `Output.array`) call, then assemble — keeps each call within token limits (Pitfall #10) and lets retry target one section. Global coherence is preserved because the planner's section list + message hierarchy is passed as context to every per-section call. Granularity is the planner's discretion (CONTEXT discretion item) within the per-section mandate.

### Response Caching (D-05) — REAL but NOT a prompt cache (IMPORTANT NUANCE)

- `@mastra/core/cache` exports `MastraServerCache` (abstract) and `InMemoryServerCache`. `[VERIFIED]`
- The `Mastra({ cache: MastraServerCache })` slot's documented purpose is *"storing stream events and other temporary data"* — methods are `get/set/delete/clear/listPush/listFromTo/listLength/increment` (a generic KV + list + atomic counter store). `[VERIFIED: cache/base.d.ts]`
- **This is NOT an automatic LLM-response cache keyed on prompt inputs.** There is no built-in "same prompt → cached completion" feature at the pinned version.
- **Recommendation for D-05:** implement response caching as a thin Lab-owned deterministic memoization wrapper around the planner/ToV/Design steps. Key = a stable hash of canonical inputs (`{ brandId, artifactType, outputProfile, prompt, requestedComponents, model }`). Store = an `InMemoryServerCache` (dev) or Convex (durable). This directly serves the P2 determinism goal and is the in-package fallback the CONTEXT caveat asked for. Mirror the repo's existing `cacheKey`/`computeInputHash` pattern (`packages/shared/src/engine/__tests__/cacheKey.test.ts`).

### Run Tracing / Observability (D-05) — REAL but needs a new package

- `@mastra/core/observability` exports tracing primitives (`SpanType`, `getOrCreateSpan`, `wrapMastra`, `createObservabilityContext`, `NoOpObservability`, …). `[VERIFIED]`
- The `Mastra({ observability })` config slot expects an **`Observability` instance from `@mastra/observability`** — a **separate package NOT currently installed** (`@mastra/observability@1.14.0` on npm). `[VERIFIED: mastra/index.d.ts comment + npm view]`
- Without that package, observability falls back to `NoOpObservability` (no traces, no error). **In-package fallback:** the per-step `ExperienceBuilderEvent` stream P1 already emits (`step` started/completed/failed) IS basic per-step tracing for the canvas/debug. The planner can satisfy "basic run traces" with the existing event stream alone and defer the `@mastra/observability` install/full traces to P5 — OR install `@mastra/observability` now behind the human-verify checkpoint. **Recommendation:** treat the existing event stream as the P2 trace surface; install `@mastra/observability` only if richer span trees are explicitly wanted. Full dashboard is P5/PROD-02 regardless.

### Background Tasks + Streaming Progress (D-05) — REAL in-package

- `@mastra/core/background-tasks` exports `BackgroundTaskManager`, `createBackgroundTask`, `BACKGROUND_TASK_WORKFLOW_ID`, `resolveBackgroundConfig`, `backgroundOverrideZodSchema`. `[VERIFIED]`
- `@mastra/ai-sdk` exports `handleWorkflowStream`, `workflowRoute`, `toAISdkStream`, `withMastra` — the v6 streaming transport P1's `modelAdapter.toV6WorkflowStream` already wraps. `[VERIFIED]`
- **Recommendation:** long generation/compile runs use `createBackgroundTask` + stream progress as `ExperienceBuilderEvent`s over the existing v6 transport (extending the P1 NDJSON stream, exactly as D-05 states). No Cloud dependency — these are in-package APIs. The `version: 'v6'` flag must stay pinned in `modelAdapter` (the one place it lives).

### Mastra tool wrapping an in-process engine function (D-04)

- `@mastra/core/tools` exports `createTool` and `Tool`. `[VERIFIED]`
- Signature: `createTool({ id, description, inputSchema: ZodSchema, outputSchema: ZodSchema, execute: async ({ context }) => result })`. Tools are passed to an `Agent({ tools })` or invoked directly inside a workflow step.
- For GEN-02/03 the tool's `execute` calls the deterministic engine prompt-compiler + the Lab `modelAdapter` model call — NOT the `apps/platform` route executor (see Pitfall A / Don't Hand-Roll).

### Single-`ai`-version gate (ORCH-04 / Pitfall #1) — SATISFIABLE

- `@mastra/core@1.37.1` declares **no `ai` dependency or peer-dependency** (it ships its own AI-SDK interop internally). `[VERIFIED: package.json has dep ai: undefined / peer ai: undefined]`
- Therefore `ai@6.0.111` in the repo is used only by `@mastra/ai-sdk` + the Lab `modelAdapter`. The single-`ai`-version invariant is achievable; the planner should keep the CI `pnpm why ai` = one-version check from P1 and confirm adding `@mastra/observability` does not introduce a second `ai`.

## Architecture Patterns

### System Architecture Diagram (the assembler-last pipeline, D-01)

```
prompt-card (brandId, artifactType, outputProfile, prompt, [requestedComponents])
        │
        ▼  [Mastra workflow.then(...) — ORCH-04: all sequencing here]
   ┌──────────┐
   │  intent  │ GEN-01 (P1; carries type/profile)
   └────┬─────┘
        ▼
   ┌──────────────────┐   buildThemeConfig(scales, appearanceConfig)  ──▶ ThemeConfig | gap
   │ resolve (FND-04) │   D-09: system defaults fill partial brands; gap only if unresolvable
   └────┬─────────────┘            │ gap → emit 'gap' event, halt (FND-03)
        ▼
   ┌──────────────────┐   queryRegistry() candidates (REG-02), exact-membership (REG-03)
   │ retrieve (REG-04)│   freshness gate is CI-time, not runtime
   └────┬─────────────┘
        ▼
   ┌──────────────────┐   NEW LLM agent (D-02) via modelAdapter + Output.object
   │ plan (GEN-04)    │──▶ { sections[], messageHierarchy, primaryCTA, screenCount }   [ADVISES]
   └────┬─────────────┘
        ▼
   ┌──────────────────┐   Mastra tool → compileCompositionRules + modelAdapter
   │ design (GEN-03)  │──▶ layout/component spec fragment per section                  [ADVISES]
   └────┬─────────────┘
        ▼
   ┌──────────────────┐   Mastra tool → compileVoiceRules + runToneGuard + modelAdapter
   │ ToV copy (GEN-02)│──▶ copy strings per section (markup-free)                      [ADVISES]
   └────┬─────────────┘
        ▼
   ┌──────────────────────────────┐  Output.object({ schema: JioExperienceIR })  [COMMITS]
   │ IR Generator (GEN-05)        │  per-section decomposition; in-gen retry (D-06, cap ~2–3)
   │   assemble plan+design+copy  │  on Zod fail OR compiled-AST validateAst fail → re-prompt
   └────┬─────────────────────────┘  → valid JioExperienceIRT  | error/gap
        ▼
   ┌──────────────────────────────┐  irToAst(ir) → astToReact/astToNextPage  [canonical string, D-07]
   │ compile (GEN-06)             │  + ephemeral ASTRenderer (internal check only)
   └────┬─────────────────────────┘
        ▼
   ┌──────────────────────────────┐  validateAst(compiledAst, ctx) — allowlist (Pitfall #5)
   │ validate                     │  passed → artifact; else gap
   └────┬─────────────────────────┘
        ▼  persist: experienceRuns + experienceArtifacts + experienceArtifactVersions
        │           (IR + validation + NEW compiledBundle field)
        ▼  stream every step as ExperienceBuilderEvent over @mastra/ai-sdk v6 transport
   tldraw canvas (artifact card)
```

**Advise-vs-commit (D-01) is the load-bearing rule:** the planner/design/ToV steps each write a structured fragment into the run context; the IR Generator is the only step that emits IR, and it never calls those agents mid-generation (no tool loop). This avoids the "every agent emits its own IR / they fight" failure mode the discussion log rejected.

### Recommended Code Placement (all additive, isolation-safe)

```
packages/experience-builder-agents/src/
├── foundationResolver.ts        # FND-04: swap mockTheme() → buildThemeConfig(...)  [EDIT]
├── adapters/
│   ├── voiceAdapter.ts          # GEN-02: compileVoiceRules + runToneGuard + modelAdapter  [NEW]
│   └── designAdapter.ts         # GEN-03: compileCompositionRules + modelAdapter           [NEW]
├── agents/
│   └── plannerAgent.ts          # GEN-04: net-new Mastra agent (Output.object plan)        [NEW]
├── irGenerator.ts               # GEN-05: Output.object IR + per-section + in-gen retry    [NEW]
├── compiler.ts                  # GEN-06: irToAst → astToReact + validateAst acceptance    [NEW]
├── cache.ts                     # D-05: deterministic memoization (canonical-input hash)   [NEW]
├── modelAdapter.ts              # implement callModel(); still the ONLY ai/@ai-sdk touch   [EDIT]
└── workflow.ts                  # add plan/design/copy/compile steps to .then(...) spine    [EDIT]

packages/experience-builder-registry/src/
└── queryRegistry.freshness.test.ts  # REG-04: derive-equals-live gate (D-10)              [NEW]

packages/convex/convex/schema.ts
└── experienceArtifactVersions: add compiledBundle field (string + meta)                    [EDIT]
```

### Pattern: REG-04 freshness gate (derive-equals-live, D-10)

```ts
// Source: derived from packages/experience-builder-registry/src/queryRegistry.ts (read 2026-05-31)
// queryRegistry() already derives from JIO_WEB_ALPHA_COMPONENTS × *_GENERATED_PROPS.
// The gate independently re-derives the EXPECTED set from the same live sources and asserts equality.
import { describe, it, expect } from 'vitest';
import { queryRegistry, KNOWN_DRIFT_EXCLUSIONS } from '../queryRegistry';
import { JIO_WEB_ALPHA_COMPONENTS } from '@oneui/ui/registry/jioAlphaCatalog';

describe('REG-04 registry freshness', () => {
  it('derived registry equals the live catalog minus known-drift, with no extras', () => {
    const live = JIO_WEB_ALPHA_COMPONENTS
      .map((e) => e.name)
      .filter((n) => !KNOWN_DRIFT_EXCLUSIONS.includes(n))
      .sort();
    const derived = queryRegistry().map((i) => i.id).sort();
    expect(derived).toEqual(live); // hard-fail on ANY added/removed/changed component (D-10)
  });
  // Plus per-item prop/variant/slot equality vs *_GENERATED_PROPS to catch metadata drift.
});
```

### Pattern: GEN-06 compiler + credential-free acceptance (D-08)

```ts
// Source: @oneui/experience-builder-core irToAst (L92) + @oneui/shared/codegen astToReact
import { irToAst } from '@oneui/experience-builder-core';
import { astToReactComponent } from '@oneui/shared/codegen';
import { validateAst } from '@oneui/experience-builder-validation';
import { irToArtifactAst } from './workflow'; // existing bridge (Stack→Container remap)

export function compile(ir, ctx) {
  const ast = irToAst(ir);                                  // frozen mapper
  const bundle = astToReactComponent(ast, {                 // canonical string (D-07)
    importSource: '@oneui/ui', componentName: 'GeneratedArtifact',
  });
  const validation = validateAst(irToArtifactAst(ir), ctx); // allowlist (D-08 step 2)
  return { bundle, validation };                            // tsc + snapshot run in CI (D-08 steps 1,3)
}
```

### Anti-Patterns to Avoid
- **Importing `apps/platform/.../executors/{voice,design}.ts` into a Lab package** — breaks isolation (couples to `@/lib/*`, Convex HTTP client, `ai` outside `modelAdapter`) and the ORCH-04 boundary. Reuse the `@oneui/shared/engine` prompt-compilers instead.
- **A second `ai` import path** outside `modelAdapter.ts` — violates Pitfall #1 and the single-version gate.
- **`generateObject`/`streamObject`** — deprecated in v6; use `Output.object`/`structuredOutput`.
- **Persisting the runtime `ASTRenderer` render as the artifact** — D-07: codegen string is canonical; render is ephemeral.
- **Gap-reporting a partial brand** — D-09: `buildThemeConfig`'s `ensureNeutralRole`/`synthesizeBrandBgIfMissing` ARE the system defaults; only a `null` return / unresolvable profile is a gap.
- **Putting the in-gen retry loop in an AI-SDK callback** — D-06 loop is orchestration; it lives in the IR-gen step.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Foundation→ThemeConfig | A new resolver | `buildThemeConfig` (`@oneui/shared/engine`) | Identical return shape to the mock; handles partial-brand defaults (D-09) for free. |
| Brand-voice copy prompt + tone validation | A new ToV prompt | `compileVoiceRules` + `runToneGuard` (`@oneui/shared/engine`) | Node-safe, deterministic, mirrors the live ToV agent; the route executor is NOT reusable (HTTP `Response`, `@/lib`, env-key). |
| Layout/composition prompt | A new design prompt | `compileCompositionRules` + `getDefaultCompositionConfig` (`@oneui/shared/engine`) | Same: reuse the pure prompt-compiler, not the coupled executor. |
| IR→AST | A new mapper | `irToAst` (frozen, `experience-builder-core`) | Already maps sections/instances; handles the `Stack`→`Container` deviation. |
| AST→React string | A new emitter | `astToReact`/`astToNextPage` (`@oneui/shared/codegen`) | Pure, node-safe, defaults to `@oneui/ui` imports — exactly the approved-import constraint. |
| Compliance validation | A new validator | `validateAst` (`experience-builder-validation`) | AST allowlist, not denylist (Pitfall #5); already in the workflow. |
| Component registry | A hand-kept list | `queryRegistry`/`getRegistryItem` (derive-don't-copy) | REG-04/D-10 require zero hand-maintained drift surface. |
| Structured generation | Free-form JSON + `JSON.parse` | `Output.object` / `Agent.structuredOutput` with `JioExperienceIR` | Constrained decoding + the markup-free Zod guard reject smuggled JSX (Pitfall #2). |
| Stream transport | A custom SSE protocol | `@mastra/ai-sdk` v6 (`toV6WorkflowStream` already in `modelAdapter`) | First-party, version-pinned in one place. |
| Background long runs | A custom job queue | `@mastra/core/background-tasks` (`createBackgroundTask`) | In-package; streams progress over the existing event transport. |

**Key insight:** P2 is almost entirely *wiring frozen contracts together*. The high-risk net-new code is exactly three things — the planner agent (GEN-04), the IR Generator's per-section + retry logic (GEN-05/D-06), and the deterministic cache key (D-05). Everything else is a body swap or a `.then(step)` addition.

## Common Pitfalls

### Pitfall A: ToV/Design "engine functions" are not what they sound like (NEW finding, HIGH)
**What goes wrong:** A planner reads D-04 ("call `voiceCompiler`/`compositionCompiler` in-process") and tries to import the real generation engine, discovering it's an HTTP-route executor that returns a `Response`, imports `ai` directly, reads `process.env.ANTHROPIC_API_KEY`, and (design) instantiates a Convex HTTP client + `@/lib` helpers.
**Why it happens:** The names `voiceCompiler`/`compositionCompiler` describe prompt-rule compilers (config→prompt string), not the LLM call. The LLM call lives in `apps/platform/.../executors/`.
**How to avoid:** The Lab adapter calls the node-safe pure pieces (`compileVoiceRules`, `runToneGuard`, `compileCompositionRules`, `getDefaultCompositionConfig`) and makes the model call via the Lab's own `modelAdapter`. Internals untouched, isolation preserved, ORCH-04 honored.
**Warning signs:** A Lab package importing from `apps/platform`, `@/lib/*`, or `ai`/`@ai-sdk` outside `modelAdapter`; a Lab test needing `ANTHROPIC_API_KEY`.

### Pitfall B: Response caching that isn't (D-05 nuance, MEDIUM-HIGH)
**What goes wrong:** Wiring `Mastra({ cache })` and expecting identical prompts to be served from cache. `MastraServerCache` is a stream-event/temp-data KV store, not a prompt cache.
**How to avoid:** Implement an explicit Lab-owned memoization keyed on a canonical-input hash, backed by `InMemoryServerCache`/Convex. Mirror the repo's `cacheKey`/`computeInputHash` pattern.
**Warning signs:** No measurable cache hit-rate; identical prompts still cost a full model call.

### Pitfall C: Observability package missing (D-05 nuance, MEDIUM)
**What goes wrong:** Passing `observability` to `Mastra` without installing `@mastra/observability`; silently falls back to `NoOpObservability` (no traces, no error).
**How to avoid:** Treat the existing `ExperienceBuilderEvent` per-step stream as the P2 trace surface; install `@mastra/observability@1.14.0` (behind human-verify) only if richer spans are explicitly required. Full dashboard is P5.

### Pitfall D: Structured-output truncation / partial IR (Pitfall #10, MEDIUM-HIGH)
**What goes wrong:** A deep nested IR in one `Output.object` call truncates or returns semantically-incomplete-but-parseable IR.
**How to avoid:** Per-section decomposition (roadmap mandate); add semantic-completeness asserts (every section ≥1 instance, every referenced id exists) on top of the Zod parse; in-gen retry with error feedback (D-06). Constrain `type` to retrieved `componentId`s so the model can't hallucinate components (Pitfall #9).
**Warning signs:** Compiler receives IR missing `sections`/`componentInstances`; retry count climbing.

### Pitfall E: IR drift vs registry surfacing at integration (Pitfall #7, MEDIUM-HIGH)
**What goes wrong:** Real metadata contradicts assumptions baked into mocks; `Modal`/`Text` are known-drift and excluded.
**How to avoid:** The REG-04 gate (D-10) plus the existing `getRegistryItem` exact-membership + `KNOWN_DRIFT_EXCLUSIONS` already short-circuit drift to a component gap. The IR Generator must only reference retrieved `componentId`s.

### Pitfall F: Mastra/AI-SDK version (Pitfall #1, now LOW — verified satisfiable)
**What goes wrong (historically):** Mastra ahead/behind the repo's `ai@6`.
**Status:** `@mastra/core@1.37.1` has no `ai` peer/dep; `zod ^3.25||^4.0` peer satisfied by `zod@4.3.6`. The single-version gate is achievable. Keep the P1 `pnpm why ai` CI check; re-verify after adding `@mastra/observability`.

## Code Examples

### FND-04 resolver body swap (D-09 partial-brand defaults)
```ts
// Source: foundationResolver.ts (P1) + buildThemeConfig signature (@oneui/shared/engine, L102)
// Replace mockTheme() with the real call; shape is identical so it's a data swap (FND-04).
import { buildThemeConfig, type ThemeConfigAppearanceInput } from '@oneui/shared/engine';
// availableScales + appearanceConfig come from the brand's Convex foundations.
const theme = buildThemeConfig(availableScales, appearanceConfig);
if (!theme) return foundationGap({ ... });   // genuinely unresolvable → gap (FND-03)
return foundationResolved(theme);             // ensureNeutralRole/synthesizeBrandBg fill defaults (D-09)
```

### GEN-05 IR Generator with in-gen retry (D-06)
```ts
// Source: ai@6 Output.object + experience-builder-core parseIR + validateAst
import { Output, generateText } from 'ai';                    // inside modelAdapter / tool execute only
import { JioExperienceIR, parseIR } from '@oneui/experience-builder-core';
async function generateIR(prompt, schemaContext, maxAttempts = 3) {
  let lastError = '';
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { experimental_output } = await generateText({
      model, prompt: lastError ? `${prompt}\n\nFIX: ${lastError}` : prompt,
      output: Output.object({ schema: JioExperienceIR }),
    });
    const parsed = parseIR(experimental_output);
    if (!parsed.success) { lastError = parsed.error.message; continue; } // retry on Zod fail
    const { validation } = compile(parsed.data, ctx);                    // compiled-AST check
    if (validation.passed) return { ok: true, ir: parsed.data };
    lastError = JSON.stringify(validation.violations);                   // retry on validator fail
  }
  return { ok: false, gap: { reason: lastError } };                      // cap reached → gap (D-06)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `generateObject`/`streamObject` | `Output.object()` inside `generateText`/`streamText`; or `Agent.structuredOutput` | AI SDK v6 (2025-12-22) | Use the unified Output API; deprecated helpers removed eventually. |
| Hand-rolled SSE for agent streams | `@mastra/ai-sdk` `toAISdkStream({ version: 'v6' })` / `handleWorkflowStream` | Mastra 1.x | First-party v6 transport; pin `version: 'v6'` once (P1 `modelAdapter`). |
| Mastra AI-SDK v4/v5 only (Pitfall #1 era) | `@mastra/core@1.37.1` ships AI-SDK interop with no `ai` peer-dep | Mastra 1.37 | The v6 mismatch risk is resolved at the pinned version. |

**Deprecated/outdated:**
- `generateObject`/`streamObject` — replaced by `Output.object`.

## Runtime State Inventory

> Not a rename/refactor/migration phase — this section is informational. P2 is additive wiring; no stored-string rename. The one persistence change is additive (new `compiledBundle` field), append-only per Phase-1 D-08.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `experienceArtifactVersions.ir` (`v.any()`) exists; NO `compiledBundle` field yet | Add `compiledBundle` field (additive, append-only) — code edit, no data migration (existing rows have no bundle, which is valid). |
| Live service config | None — generation is in-process Mastra; no external service config carries P2 state. | None — verified by reading `experience-builder-agents` (no external service clients). |
| OS-registered state | None. | None. |
| Secrets/env vars | Real model calls need `ANTHROPIC_API_KEY` (used by the live agents). P1 `callModel` throws; P2 implements it via `modelAdapter`, reading the key server-side only. | Ensure the key is available to the Lab's Node runtime (never injected into any preview — that's P3). |
| Build artifacts | None stale. | None. |

## Common Mastra Step Names (events contract — additive, no schema change)

The `ExperienceBuilderEvent` `step` field is an open `z.string().min(1)` (`[VERIFIED: contracts/events.ts L36]`). The planner may add new step names — `plan`, `design`, `copy`, `compile` — alongside the P1 set (`intent`, `resolve-foundation`, `retrieve`, `generate-ir`, `validate`) without touching the schema. Emit `started`/`completed`/`failed` per new step for tracing (D-05) and canvas progress.

## Validation Architecture

> nyquist_validation: enabled (no `.planning/config.json` `workflow.nyquist_validation: false` found). Framework = **Vitest** across all packages (per `.planning/codebase/TESTING.md`).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (node env for `experience-builder-*` and `@oneui/shared`; jsdom for `@oneui/ui`) |
| Config file | per-package `vitest.config.ts`; `experience-builder-agents` uses node env |
| Quick run | `pnpm --filter @oneui/experience-builder-agents test` |
| Full suite | `pnpm test` (turbo, all packages) + `pnpm typecheck` + `pnpm ci:gates` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FND-04 | Real `buildThemeConfig` resolves a configured brand → `{ ok: true, theme }`; partial brand fills defaults (D-09); unresolvable → gap | unit (node) | `pnpm --filter @oneui/experience-builder-agents test foundationResolver` | ❌ Wave 0 (extend existing `foundationResolver.test.ts`) |
| REG-04 | Derived registry deep-equals live catalog×meta minus `KNOWN_DRIFT_EXCLUSIONS`; hard-fail on any divergence (D-10) | unit (node) | `pnpm --filter @oneui/experience-builder-registry test freshness` | ❌ Wave 0 (`queryRegistry.freshness.test.ts`) |
| GEN-02 | ToV adapter builds a markup-free copy spec from `compileVoiceRules`+`runToneGuard`; model call mocked | unit (node, mocked model) | `pnpm --filter @oneui/experience-builder-agents test voiceAdapter` | ❌ Wave 0 |
| GEN-03 | Design adapter emits a layout spec fragment via `compileCompositionRules`; model mocked | unit (node, mocked model) | `pnpm --filter @oneui/experience-builder-agents test designAdapter` | ❌ Wave 0 |
| GEN-04 | Planner agent returns a schema-valid plan `{ sections, messageHierarchy, primaryCTA, screenCount }`; model mocked | unit (node, mocked model) | `pnpm --filter @oneui/experience-builder-agents test plannerAgent` | ❌ Wave 0 |
| GEN-05 | IR Generator → `parseIR` succeeds; in-gen retry re-prompts on Zod/validator fail and caps at ~3 (D-06); model mocked to fail-then-succeed | unit (node, mocked model) | `pnpm --filter @oneui/experience-builder-agents test irGenerator` | ❌ Wave 0 |
| GEN-06 | Acceptance triad (D-08): (1) emitted module type-checks, (2) `validateAst` passes, (3) codegen string snapshot stable | unit + tsc + snapshot (node, credential-free, deterministic) | `pnpm --filter @oneui/experience-builder-agents test compiler` + `pnpm typecheck` | ❌ Wave 0 |

### GEN-06 acceptance triad — how each leg runs deterministically (D-08)
1. **Type-check + import resolution:** the compiler writes the emitted module to a fixture path; a test invokes the package's `tsc` (or `vitest` with a type-level assert) to confirm it compiles and `@oneui/ui` imports resolve. `pnpm typecheck` (turbo) already gates the repo — point it at the generated fixture. No browser, no credentials.
2. **AST allowlist validator:** `validateAst(irToArtifactAst(ir), ctx)` must return `passed: true` — reuses the frozen validator; catches Tailwind/literals/unregistered components (Pitfall #5). Pure function, deterministic.
3. **Codegen string snapshot:** Vitest `toMatchSnapshot()` on the `astToReact` output for a fixed IR fixture — proves determinism (same IR → same string). Because the model is mocked/absent in this path, the snapshot is fully stable and credential-free.

### REG-04 freshness gate — determinism (D-10)
A pure Vitest test: re-derive the expected set from `JIO_WEB_ALPHA_COMPONENTS` × `*_GENERATED_PROPS` independently of `queryRegistry`, then `expect(derived).toEqual(live)` on ids AND on per-item props/variants/slots. Any add/remove/change hard-fails. No network, no credentials. Wire into `pnpm ci:gates`.

### Sampling Rate
- **Per task commit:** `pnpm --filter @oneui/experience-builder-agents test` + `pnpm --filter @oneui/experience-builder-registry test`
- **Per wave merge:** `pnpm test && pnpm typecheck`
- **Phase gate:** `pnpm ci:gates` green (includes the new REG-04 gate + GEN-06 acceptance) before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `packages/experience-builder-registry/src/queryRegistry.freshness.test.ts` — REG-04 gate (D-10)
- [ ] Extend `packages/experience-builder-agents/src/foundationResolver.test.ts` — FND-04 real-resolve + partial-brand (D-09)
- [ ] `packages/experience-builder-agents/src/{voiceAdapter,designAdapter,plannerAgent,irGenerator,compiler}.test.ts` — with a shared mocked-model fixture (no `ANTHROPIC_API_KEY` in CI)
- [ ] A shared model-mock helper so GEN-02..05 tests are deterministic and credential-free
- [ ] Wire REG-04 + GEN-06 acceptance into `pnpm ci:gates`

## Security Domain

> `security_enforcement` not explicitly disabled → included. P2 has a narrower surface than P3 (no preview/iframe yet), but two threats are live.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | `JioExperienceIR` markup-free Zod guard (`MarkupFreeString`, `.strict()`, `containsMarkup`) — the trust boundary for untrusted LLM output (Pitfall #2). |
| V6 Cryptography | no | No crypto introduced. |
| V2 Authentication | partial | `ANTHROPIC_API_KEY` read server-side only in `modelAdapter`; never logged, never sent to the client or any future preview. |
| V4 Access Control | no (P3) | Preview-origin isolation is P3. |

### Known Threat Patterns for the P2 stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| LLM smuggles JSX/HTML via IR string fields | Tampering | `MARKUP_PATTERN` refinement on every IR string + `.strict()` objects; reject → gap, never compile (Pitfall #2). |
| LLM names an unregistered/near-match component | Tampering | `getRegistryItem` exact membership → component gap (REG-03); constrain IR `type` to retrieved ids. |
| Model API key leakage into output/logs/preview | Info Disclosure | Key confined to `modelAdapter` server path; never in IR, bundle, events, or canvas. |
| Fabricated dimensions for uncovered profile | Tampering | `foundationResolver` gap arm carries no dimension numbers (FND-03); D-03 coverage-driven. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@mastra/observability@1.14.0` + `@mastra/otel-bridge@1.2.0` are legitimate, install cleanly, and pull no second `ai` copy | Standard Stack / Legitimacy | If they pull a second `ai`, the single-version gate breaks — gate behind `pnpm why ai` check + human-verify. Mitigated: they're first-party `@mastra` scope. |
| A2 | The brand's Convex foundations expose `availableScales` + `appearanceConfig` in the exact shape `buildThemeConfig` expects | FND-04 | If the shape differs, FND-04 needs a small adapter between Convex foundations and `EngineAvailableScale[]`/`ThemeConfigAppearanceInput`. Verify the live platform's resolve path (the platform already calls `buildThemeConfig`, so the mapping exists in the app). |
| A3 | The `compiledBundle` field is the chosen persistence shape (string + meta) on `experienceArtifactVersions` | GEN-06 persistence | Discretion item (CONTEXT) — planner finalizes shape; low risk, additive. |
| A4 | `Output.object` returns parseable output via `experimental_output` at `ai@6.0.111` (exact result-field name) | Code Examples | If the field name differs in 6.0.111, the IR-gen call site needs the correct accessor — confirm against `ai`'s `generateText` return type during planning/implementation. |

## Open Questions (RESOLVED)

1. **Convex foundations → `buildThemeConfig` input mapping (A2).**
   - What we know: the live platform already renders brands via `buildThemeConfig`, so a Convex-foundations→`(availableScales, appearanceConfig)` mapping exists somewhere in `apps/platform`/`@oneui/ui` hooks.
   - What's unclear: whether the Lab can call that mapping node-side, or must replicate the minimal mapping in the resolver.
   - Recommendation: in planning, locate the platform's existing resolve call (likely near `FoundationStyleProvider`/`useBrandCSS`) and reuse its node-safe inputs; do NOT reach into `FoundationStyleProvider` itself (forbidden file).
   - **RESOLVED:** Use the node-safe chain in `packages/shared/src/engine/precompute.ts` (the server-side equivalent of `useBrandCSS`, no React/`FoundationStyleProvider` dependency): `buildAvailableScales(colorConfig, presetSelection)` → `buildThemeConfig(availableScales, appearanceConfig)` (precompute.ts lines 246-249). The resolver sources the three `PrecomputeInput` fields `colorConfig`, `presetSelection`, and `appearanceConfig` (precompute.ts lines 92-94) from the brand's Convex foundations (the `getBrandOverviewData`-shaped record). `buildAvailableScales` + `appearanceConfig` are exported from the `@oneui/shared/engine` barrel (lines 19, 172-173) and are node-safe — the Lab calls them directly; it never imports `FoundationStyleProvider` (forbidden file).

2. **Exact `Output.object` result accessor at `ai@6.0.111` (A4).**
   - Recommendation: confirm `generateText({ output })` return field (`experimental_output` vs `output`) against the installed `ai` types before finalizing the IR-gen task.
   - **RESOLVED:** The accessor is `result.experimental_output` — verified against the installed `ai@6.0.111` types: `GenerateTextResult.experimental_output: InferCompleteOutput<OUTPUT>` (`node_modules/ai/dist/index.d.ts` line 3225). Call `generateText({ model, prompt, output: Output.object({ schema }) })` and read `result.experimental_output`.

3. **Whether to install `@mastra/observability` in P2 or defer (D-05 / Pitfall C).**
   - Recommendation: default to the existing event stream as the P2 trace surface; install only if richer spans are explicitly required. Either way, full dashboard is P5.
   - **RESOLVED:** DEFER `@mastra/observability` to P5. The existing per-step `ExperienceBuilderEvent` stream IS the P2 Run-Tracing surface (D-05 Run-Tracing sub-requirement satisfied in-scope). This is honored by D-05's own locked caveat ("some Mastra Observability/Caching/Background Tasks may be Mastra Cloud-only or newer-API features … verify against pinned versions"): `@mastra/observability@1.14.0` is NOT installed at the pinned `@mastra/core@1.37.1`, so richer `Observability` spans are the genuine P5 (PROD-02) extension, not a P2 omission. No second `ai` copy is pulled (single-`ai`-version gate unaffected).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@mastra/core` | All orchestration | ✓ | 1.37.1 | — |
| `@mastra/ai-sdk` | Stream transport | ✓ | 1.4.3 | — |
| `ai` (Vercel AI SDK) | Model layer (`Output.object`) | ✓ | 6.0.111 | — |
| `@ai-sdk/anthropic` | Claude provider | ✓ | 3.0.54 | — |
| `zod` | Schemas | ✓ | 4.3.6 | — |
| `@mastra/observability` | D-05 run tracing (optional) | ✗ | — | Use existing `ExperienceBuilderEvent` per-step stream as trace surface; defer full observability to P5 |
| `ANTHROPIC_API_KEY` | Real model calls (GEN-02..05) | env-dependent | — | CI tests mock the model (credential-free); runtime needs the key server-side |
| Vitest | All validation | ✓ | repo-wide | — |

**Missing dependencies with no fallback:** none — all blocking deps are installed.
**Missing dependencies with fallback:** `@mastra/observability` (event stream substitutes for P2); `ANTHROPIC_API_KEY` at test time (model mocks substitute).

## Sources

### Primary (HIGH confidence)
- Installed `node_modules` (read 2026-05-31): `@mastra/core@1.37.1` exports (`./cache`, `./observability`, `./background-tasks`, `./agent`, `./tools`, `./workflows`, `./mastra`), `agent/types.d.ts` `StructuredOutputOptions`, `cache/base.d.ts` `MastraServerCache`, `mastra/index.d.ts` config slots; `@mastra/ai-sdk@1.4.3` exports; `ai@6.0.111` `Output.{object,array,choice,json,text}`; `@ai-sdk/anthropic@3.0.54`; `zod@4.3.6`; `@mastra/core` `package.json` peer deps (no `ai`, `zod ^3.25||^4.0`).
- Repo source (read 2026-05-31): `experience-builder-agents/src/{foundationResolver,workflow,modelAdapter,mockGeneration}.ts`; `experience-builder-core/src/ir/{schema,irToAst}.ts` + `contracts/events.ts`; `experience-builder-registry/src/queryRegistry.ts`; `experience-builder-validation/src/index.ts`; `shared/src/engine/{buildThemeConfig,voiceCompiler,compositionCompiler}.ts` + `engine/index.ts` barrel; `shared/src/codegen/{astToReact,astToPage}.ts`; `apps/platform/src/app/api/agent/executors/{voice,design}.ts`; `convex/convex/schema.ts` (experience* tables); `.planning/codebase/TESTING.md`.
- `npm view @mastra/observability` → `1.14.0` (modified 2026-05-31); `npm view @mastra/otel-bridge` → `1.2.0`.

### Secondary (MEDIUM confidence)
- `.planning/research/STACK.md`, `.planning/research/PITFALLS.md` (synthesized prior research, cross-checked against installed packages here).

### Tertiary (LOW confidence)
- None relied upon — all version/API claims verified against installed packages or the live registry.

## Metadata

**Confidence breakdown:**
- Pinned-version API surface (Mastra/AI-SDK): HIGH — verified by `require`-ing installed packages and reading `.d.ts`.
- P1 contracts (IR, resolver, registry, codegen, validate, events, Convex): HIGH — read from source.
- REG-04 + GEN-06 acceptance mechanics: HIGH — derived from the actual `queryRegistry`/`validateAst`/`astToReact` code.
- ToV/Design adapter shape (D-04): MEDIUM — the named "engine functions" are prompt-compilers, not the LLM call; the planner must adopt the prompt-compiler reuse path (Pitfall A).
- Convex foundations → `buildThemeConfig` input mapping: MEDIUM — mapping exists in the live app but its exact node-safe reuse path is unconfirmed (Open Q1).

**Research date:** 2026-05-31
**Valid until:** 2026-06-14 (14 days — Mastra is fast-moving; re-verify the pinned-version API surface if `@mastra/*` is bumped).
