# Phase 2: Real Source Integration - Context

**Gathered:** 2026-05-31
**Status:** Ready for planning

<domain>
## Phase Boundary

With the Phase-1 contracts frozen, **swap every mock for its real source and build the deterministic compile path** so the Lab generates a real artifact end-to-end from a real prompt. Concretely:

- **FND-04** — the foundation resolver swaps its mock body for the real `buildThemeConfig` call against the brand's Convex foundations. The `ThemeConfig`-shaped contract is frozen, so this is a **data swap, not a schema migration**.
- **REG-04** — the registry retrieves real Storybook-approved components from `jioAlphaCatalog` / `@oneui/shared/meta`, gated by a CI freshness check.
- **GEN-02 / GEN-03** — the existing Tone-of-Voice agent (`api/voice`) and Design/Composition agent (`api/composition`) are wired as Mastra tools, their internals untouched.
- **GEN-04** — a new UX/flow planner agent plans sections / screens / message hierarchy.
- **GEN-05** — an LLM-backed IR Generator produces a valid `JioExperienceIR` via constrained structured output, per-section decomposition, and retry-on-error-feedback.
- **GEN-06** — a compiler converts IR → AST → React + Jio CSS using only approved Jio imports.

**In scope:** real foundation resolution, real registry retrieval + freshness gate, ToV/Design adapter integration, the new planner agent, the IR Generator (real LLM), the IR→AST→React compiler, and the Mastra-native run plumbing (response caching, run tracing, background/streaming).

**Out of scope (later phases):** sandboxed separate-origin iframe preview, Playwright screenshots, the full validation pipeline, the visual evaluator, the eval-driven repair loop, and version-history browsing (all **P3**); campaign/social output profiles + export (**P4**); collaboration, full cost/observability dashboards, durable persistence hardening, handoff bundles (**P5**).

</domain>

<decisions>
## Implementation Decisions

### Generation pipeline & agents
- **D-01 (Assembler-last topology):** The pipeline is `intent → resolve(real) → retrieve(real) → UX/flow plan → Design (layout/components) → ToV (copy per section) → IR Generator (assemble → valid IR) → compile → validate`. The planner, Design, and ToV agents **advise** — each emits a structured spec fragment (sections, chosen components, layout intent, copy strings). The **IR Generator commits**: it is the final LLM step that assembles those outputs into a valid `JioExperienceIR` via `Output.object()`. The agents do NOT each produce IR, and the IR Generator does NOT call them mid-generation in a tool loop.
- **D-02 (GEN-04 = new lightweight LLM planner agent):** There is no existing planner in the repo (ToV + Design exist; a planner does not). Build a **net-new lightweight planner agent** (Mastra tool + AI-SDK model call via `modelAdapter`) that takes the prompt + artifact type and outputs a structured plan: section list, message hierarchy, primary CTA, screen count. It feeds Design + ToV. This is the one genuinely new agent (with an eval surface) this phase.
- **D-03 (Coverage-driven artifact-type scope):** Do **not** hardcode a list of "blessed" artifact types for P2. Jio foundations are **platform/dimension-driven** — the type scale and dimensions adapt to the selected platform/output profile *by design* (this is normal engine behavior, not an exception). So the rule is: **whatever resolves to real foundation coverage generates; whatever does not gap-reports.** Campaign/social profiles continue to gap-report until P4 only because their foundation coverage is unverified, not because of a type allowlist.

### Agent wiring
- **D-04 (Thin typed adapters):** The Lab's Mastra tools call the ToV/Design **engine functions** (`voiceCompiler` / `compositionCompiler` from `@oneui/shared/engine`) **in-process**, wrapped behind a Lab-owned thin typed adapter in `experience-builder-agents`. No HTTP hop, no auth/origin surface, no coupling to route stability. The adapter insulates the Lab from engine internals (Lab depends on a contract it controls). Internals stay untouched — only the public engine API is called.
- **D-05 (Mastra-native run plumbing — in scope for P2):** Use Mastra-native platform features rather than hand-rolling:
  - **Response Caching** — cache repeatable planner / ToV / Design steps when inputs are identical (serves the determinism goal + cuts dev cost).
  - **Run Tracing** (Mastra Observability) — basic per-step traces (resolve/retrieve/plan/design/copy/IR-gen/compile) for debugging. The *full* cost/observability dashboard stays P5 (PROD-02).
  - **Background Tasks + streaming progress** — long generation/compile runs, extending the P1 NDJSON `ExperienceBuilderEvent` stream.
  - **CAVEAT (research before planning):** verify each Mastra capability's availability/exact API name against the pinned **`@mastra/core@1.37.1` + `@mastra/ai-sdk@1.4.3`** — some "Mastra Observability/Caching/Background Tasks" may be Mastra Cloud-only or newer-API features. Nothing here may break the single-`ai`-version gate or the AI-SDK-is-model-layer-only boundary (ORCH-04).

### IR Generator & compiler
- **D-06 (In-gen retry only; repair loop stays P3):** The IR Generator owns a **generation self-correction loop** — on a Zod-parse failure or an AST-validator failure of the compiled output, re-prompt the model with the error appended, cap ~2–3 attempts, then emit an error/gap if still invalid. This is distinct from P3's **eval-driven repair loop** (which patches a *valid-but-low-quality* IR after the evaluator scores it, cap N=3). Do not unify them or pull the repair loop forward.
- **D-07 (Compiler emits both — codegen string is canonical):** GEN-06 emits a **React + Jio CSS code string** (reuse `astToReact` / `astToPage`, approved `@oneui/ui` + Jio CSS imports only) — this is the **canonical, persisted compiled bundle** that P3 sandboxes and P5 exports. It ALSO keeps the ephemeral `ASTRenderer` runtime-render path for quick internal checks, but that render is **internal-convenience only: never persisted, never the export source.** The IR remains the single source of truth; the codegen bundle is the durable compiled output.
- **D-08 (GEN-06 acceptance without P3 DOM):** Because real-DOM rendering is P3, P2 proves the compiler with a **deterministic, credential-free, CI-able** check: (1) the emitted module **type-checks** and its `@oneui/ui` imports resolve, (2) the **AST allowlist validator passes** on the compiled output (no Tailwind / literals / unregistered components), and (3) the **codegen string snapshot is stable.** No jsdom/browser render in P2.

### Foundation gaps & registry freshness
- **D-09 (System defaults fill partial brands):** For a real, partially-configured brand, resolve with the brand's configured foundations and let the **engine's system defaults fill anything unconfigured** — exactly as the live platform already renders partially-configured brands today. A **foundation gap is reserved for a genuinely unresolvable profile/dimension**, NOT for "the brand used a default." This keeps the resolver consistent with real engine behavior instead of gap-reporting brands that work fine in production.
- **D-10 (REG-04 = derive-don't-copy, hard-fail on any divergence):** The Lab registry keeps **no separate hand-maintained component list** — it **derives entirely from `@oneui/shared/meta/generated`** at build/query time (P1 already did this for props/variants/slots). The CI freshness gate is a test asserting the derived set **equals** the live meta source, **hard-failing on ANY divergence** (added / removed / changed component or metadata). Zero hand-maintained drift surface — directly addresses the Modal/Text-meta + catalog-slug drift flagged in `.planning/codebase/CONCERNS.md`.

### Claude's Discretion
The following were left to the planner/researcher; decisions below stand unless research surfaces a reason to revisit:
- **Per-section vs whole-artifact IR generation** — the roadmap mandates per-section decomposition; the exact section-batching granularity is the planner's call within that constraint.
- **Intent/prompt parsing** — how the raw prompt is parsed into the planner's input (deterministic vs a light LLM pass) is open.
- **Which model the new planner agent uses** — choose via `modelAdapter`; default to the most capable cost-appropriate model.
- **How the compiled bundle persists** in the `experience*` Convex tables (alongside the IR, append-only per D-08 of Phase 1) — follow existing `experience*` schema conventions; the bundle is structured/text, never raw markup as a source of truth.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning artifacts (read first)
- `.planning/PROJECT.md` — Core Value, locked Key Decisions, constraints, out-of-scope
- `.planning/REQUIREMENTS.md` — Phase-2 REQ-IDs (FND-04, REG-04, GEN-02, GEN-03, GEN-04, GEN-05, GEN-06) + traceability
- `.planning/ROADMAP.md` § Phase 2 — goal, mode (mvp), success criteria
- `.planning/phases/01-isolated-foundation/01-CONTEXT.md` — frozen Phase-1 contracts and decisions this phase builds on (esp. mock boundary at the resolver, D-02 real brand list, D-08 persistence scope)
- `.planning/research/SUMMARY.md` — synthesized research; reuse map, IR lifecycle, HIGH pitfalls

### Architecture & approach (the keystone)
- `.planning/research/ARCHITECTURE.md` — "isolation by package, reuse by contract"; six-package map; IR↔AST; Convex `experience*` schema shape
- `.planning/research/STACK.md` — version table; Mastra↔AI-SDK boundary; `@mastra/core@1.37.1`, `@mastra/ai-sdk@1.4.3`, `ai@^6`, `zod@4`
- `.planning/research/PITFALLS.md` — esp. #1 Mastra/AI-SDK v6, #2 raw-JSX smuggling, #5 validator false-negatives, #7 registry drift, #8 invented non-web dims

### Codebase maps (existing repo — reuse vs not-touch)
- `.planning/codebase/CONCERNS.md` — documented registry/metadata drift (Modal/Text meta, catalog slugs) that REG-04 must close
- `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `.planning/codebase/INTEGRATIONS.md`, `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/STACK.md`, `.planning/codebase/TESTING.md`

### Reuse-by-contract source files (CALL / SWAP-INTO, do not reimplement)
- `packages/shared/src/engine/buildThemeConfig.ts` — the real foundation resolution target for FND-04 (the mock resolver's success arm already matches its `ThemeConfig` shape)
- `packages/shared/src/engine/voiceCompiler.ts` + `apps/platform/src/app/api/voice/` — ToV agent engine to wrap behind a thin adapter (GEN-02)
- `packages/shared/src/engine/compositionCompiler.ts` + `apps/platform/src/app/api/composition/` — Design/Composition agent engine to wrap behind a thin adapter (GEN-03)
- `packages/shared/src/codegen/astToReact.ts` + `astToPage.ts` — the codegen string emitters that back the GEN-06 compiler (D-07)
- `packages/ui/src/runtime/ASTRenderer.tsx` — recursive AST→React runtime renderer (D-07 ephemeral internal path only)
- `packages/shared/src/meta/` (`jioAlphaCatalog`, generated metadata) — the single source of truth the registry derives from (REG-04, D-10)
- `packages/experience-builder-core/` — frozen IR, IR↔AST mapper, output-profile table, contracts (treat as read-only contract)
- `packages/experience-builder-agents/` — Mastra workflow + mock resolver/generator + `modelAdapter.ts` (where the real swaps + new planner + adapters land)
- `packages/experience-builder-registry/` — `queryRegistry` adapter (where REG-04 freshness gate attaches)
- `packages/experience-builder-validation/` — `validateAst` (re-run on compiled output for GEN-06 acceptance, D-08)
- `packages/convex/convex/schema.ts` — `experience*` tables (persist compiled bundle alongside IR, append-only)

### Repo rules (apply to Lab UI *and* generated artifacts)
- `CLAUDE.md` — zero-tolerance literals, token-only styling, Surface Context mandate, Typography V2 tokens, WCAG AA, AI-SDK/Mastra boundary, isolation rules
- `docs/surface-context-awareness.md` — surface model the compiled artifacts must honor

### MUST-NOT-TOUCH (isolation boundary)
- `apps/platform/src/design-tools/ExperienceCanvas/` and the `(platform)/(builder)/` route group — existing Builder; must keep booting unchanged
- `apps/platform/src/components/FoundationStyleProvider.tsx` — never modify; never set `injectionMode: 'none'`
- ToV/Design engine internals (`voiceCompiler` / `compositionCompiler`) — call the public API only; do not edit

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`buildThemeConfig`** already produces the exact `ThemeConfig` the mock resolver's success arm asserts — FND-04 is a body swap inside `foundationResolver.ts`, not a contract change.
- **`voiceCompiler` / `compositionCompiler`** in `@oneui/shared/engine` are the in-process engine functions behind the `/api/voice` and `/api/composition` routes — the thin adapters call these directly (D-04).
- **`astToReact` / `astToPage`** are existing codegen string emitters; the GEN-06 compiler reuses them rather than inventing a new emitter (D-07).
- **`@oneui/shared/meta/generated`** is the node-safe metadata source the P1 registry adapter already derives from — REG-04's gate asserts the derived registry still equals it (D-10).
- **`modelAdapter.ts`** (P1) is the ONLY place the AI SDK is touched (v6 pinned) — the new planner + IR Generator route their model calls through it.

### Established Patterns
- Mastra `createWorkflow().then(...)` is the orchestration spine (P1); new real steps + agents slot into it as Mastra steps/tools. ORCH-04 invariant: all sequencing/branching lives in the workflow, never in an AI-SDK callback.
- The P1 NDJSON `ExperienceBuilderEvent` stream is the surfacing mechanism; background/streaming progress (D-05) extends it.
- Gap-first rule (P1): missing profile/component → typed gap report, never a fabricated value, never the repair loop. D-09 refines it: "used a system default" is NOT a gap.
- Monorepo conventions: token-only styling, `check:literals` gate, eslint Lab↔Builder boundary both directions, single-`ai`-version CI gate.

### Integration Points
- `experience-builder-agents/src/foundationResolver.ts` — swap mock body for `buildThemeConfig` (FND-04).
- `experience-builder-registry` — attach the REG-04 CI freshness gate (derive-don't-copy assertion test).
- `experience-builder-agents` — new thin ToV/Design adapters, new planner agent, real IR Generator, GEN-06 compiler wiring.
- `packages/convex/convex/schema.ts` `experience*` tables — persist the compiled bundle alongside the IR (append-only).
- CI — add the registry freshness gate + GEN-06 typecheck/validator/snapshot acceptance to existing gates.

</code_context>

<specifics>
## Specific Ideas

- **Determinism is a first-class goal** for P2: same prompt + brand + type/profile should produce a stable result. Response caching (D-05) and the snapshot-based GEN-06 acceptance (D-08) both serve this.
- The **IR Generator uses `Output.object()`**, NOT the deprecated `generateObject` (carried from Phase 1).
- The **codegen bundle, not the runtime render, is the artifact** — P3 mounts the bundle on a separate origin; the runtime render is only an internal sanity check (D-07).
- Foundation behavior must **mirror the live engine**: partially-configured brands render via system defaults, they do not gap-report (D-09).

</specifics>

<deferred>
## Deferred Ideas

- **Print-specific foundation additions** (CMYK / spot color, print color profiles) — a future foundation-engine extension if/when print output is pursued; not Phase 2.
- **Mastra Sandbox / Workspace providers** for safe execution/preview of generated code — evaluate as part of the Phase-3 separate-origin sandboxed preview work, not now.
- **Full cost/observability dashboards** (beyond basic run tracing) — Phase 5 (PROD-02).
- **Eval-driven repair loop & visual evaluator** — Phase 3; P2 only does in-generation self-correction (D-06).

</deferred>

---

*Phase: 02-real-source-integration*
*Context gathered: 2026-05-31*
