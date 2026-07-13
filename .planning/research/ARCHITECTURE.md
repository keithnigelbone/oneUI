# Architecture Research

**Domain:** Agentic, IR-based, design-system-constrained generation system (Jio AI Experience Builder Lab)
**Researched:** 2026-05-30
**Confidence:** HIGH (existing codebase verified by direct inspection; Mastra HITL/AI-SDK/storage model verified against current Mastra docs)

---

## Overview

This is a **subsequent-milestone, brownfield** architecture. The Lab is a Mastra-orchestrated, multi-agent pipeline that turns an intent into a canonical **Jio Experience IR**, compiles it to React + Jio CSS, validates compliance, renders sandboxed previews, evaluates visually, and repairs — all constrained to a Storybook-approved component registry and Jio foundation profiles.

The governing architectural decision is **isolation by package, reuse by contract**: six new `packages/experience-builder-*` packages plus one isolated `apps/platform` route group. The Lab never reimplements the brand engine, the codegen, the agents, or Convex — it *calls* them through narrow adapter contracts. The existing `ExperienceCanvas` Builder is untouched.

The single most important invariant is the **IR-centric control loop**: the IR is the only source of truth, and compile → validate → repair is a closed loop *around* the IR, not around generated JSX. Everything else (registry retrieval, foundation resolution, ToV/Design agents) feeds the IR generator; everything downstream (compiler, validator, preview, evaluator, export) consumes or annotates the IR.

---

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────────────┐
│  apps/platform/(experience-lab)   — isolated route group (Jio DS UI only)   │
│  tldraw canvas shell · prompt/artifact/foundation cards · run inspector     │
│  consumes ExperienceBuilderEvent stream (AG-UI style) → live canvas patches │
└───────────────┬──────────────────────────────────────────┬────────────────┘
                │ event stream (SSE/stream)                 │ Convex useQuery (read state)
                ▼                                            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  experience-builder-agents  (Mastra orchestrator — the run engine)          │
│  workflow: intent→resolve→retrieve→ToV→design→plan→IR→compile→validate→     │
│            preview→evaluate→repair→artifact→version  (+ HITL suspend points) │
│  agents = LLM steps (Vercel AI SDK models) · tools = deterministic steps    │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬────────┘
   │          │          │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼          ▼          ▼
┌──────┐  ┌────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────┐ ┌────────┐
│ core │  │registry│ │  (ToV)  │ │  (DCA)   │ │validation│ │preview │ │ export │
│ IR + │  │ query  │ │ existing│ │ existing │ │ compile+ │ │iframe+ │ │ png/   │
│schema│  │ layer  │ │api/voice│ │api/comp. │ │ lint     │ │playwr. │ │pdf/code│
└──┬───┘  └───┬────┘ └────┬────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ └───┬────┘
   │          │           │           │            │           │          │
   ▼          ▼           ▼           ▼            ▼           ▼          ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  REUSE LAYER (existing, do NOT reimplement)                                 │
│  @oneui/shared/engine (surface, cssGen, codegen astToReact, meta/AIContext) │
│  @oneui/ui registry (componentRegistry, jioAlphaCatalog, ASTRenderer)       │
│  Convex (foundations, appearanceConfigs, brandCSSCache, compositions …)     │
│  /internal/render-ast + /internal/render-code (sandboxed render routes)     │
└───────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component (new package) | Responsibility | Implementation |
|---|---|---|
| `experience-builder-core` | Canonical IR schema (Zod), output-profile types, foundation-resolve contracts, event-stream types, IR↔AST mapping, IR version diffing/patching | Pure TS + Zod; framework-agnostic; depends only on `@oneui/shared` types |
| `experience-builder-registry` | Build + query the Storybook-approved component registry; expose `JioComponentRegistryItem[]`; retrieval API | Wraps `@oneui/ui` `componentRegistry` + `jioAlphaCatalog` + `@oneui/shared/meta` |
| `experience-builder-agents` | Mastra workflow, agent definitions, tool wrappers, repair loop, HITL suspend points, event emission | Mastra + `@ai-sdk/anthropic`; adapters into ToV/DCA APIs |
| `experience-builder-validation` | Compliance validator: import allowlist, registry membership, prop/variant/slot validity, token-literal scan, foundation-profile presence; emits `JioValidationResult` | Pure TS; reuses `check:literals` logic + `tokenManifest` + `compositionCodeValidator` |
| `experience-builder-preview` | Compile-to-React tool + sandboxed iframe preview + Playwright screenshot capture | Reuses `astToReact` + `/internal/render-ast`; adds isolated preview origin |
| `experience-builder-export` | PNG/JPG/PDF/code/handoff bundle generation from a frozen artifact version | Playwright + server export workers |
| `apps/platform/(experience-lab)` route | Isolated UI shell, tldraw canvas, run inspector, HITL approval UI | Jio DS components + Jio CSS only; new route group, no shared layout with `(builder)` |

---

## Data Flow & IR Lifecycle

### Direction of flow

1. **UI → Orchestrator (command):** User submits prompt/brief/brand/output-profile from the Lab route. A `generation_runs` row is created in Convex; the Mastra workflow starts.
2. **Orchestrator → UI (events):** Mastra emits `ExperienceBuilderEvent`s (AG-UI-style union from the specs). The route subscribes to a streamed channel and translates events into tldraw canvas patches (spawn prompt card → resolving foundation → IR created → artifact card → validation badge → evaluation report card).
3. **Orchestrator → Reuse layer (calls):** Each step calls registry query / foundation resolver / ToV API / DCA API / compiler / validator / preview as deterministic tools or LLM agents.
4. **Persistence:** Convex is the durable store for domain entities (runs, artifacts, versions, validations, evaluations, exports). Mastra's *workflow snapshot* state is runtime/ephemeral and lives in a thin Mastra storage adapter (see Persistence).

### IR lifecycle (the closed loop)

```
[Intent + ResolvedFoundation + RetrievedComponents + ToVContent + DesignPlan]
        │
        ▼  IR Generator agent (LLM, structured output via Zod)
   IR draft (status: pending)  ───────────────► persisted as artifact_version (parent=prev)
        │
        ▼  Compiler tool (deterministic)   IR → AST → React + Jio CSS
   compiled bundle
        │
        ▼  Compliance Validator (deterministic)
   ┌─── passed? ──No──► Repair agent (patch IR, NOT regenerate) ──► recompile ──┐
   │                                                                            │
   Yes                                                          (loop, capped N=3, then HITL)
   │
   ▼  Preview Renderer (sandboxed iframe) + Playwright screenshots
        │
        ▼  Visual Evaluator (LLM-vision, scores compliance/hierarchy/a11y/responsiveness/export-readiness)
   ┌─── score ≥ threshold? ──No──► Design critique → Repair (patch IR) → re-render ──┐
   │                                                                                  │
   Yes                                                              (loop, capped, then HITL)
   │
   ▼  freeze version (immutable) → artifact card on canvas → ready for variants/export
```

**Key lifecycle rules:**
- The IR — never the JSX — is the repair target. Repair emits a **JSON patch against the IR** (`experience-builder-core` owns diff/apply), then recompiles. This keeps repairs auditable, cheap, and version-diffable.
- Every IR mutation produces a new immutable `artifact_version` (stores IR + compiled bundle + preview ref + thumbnail + validation result + evaluation result + parent version + run id). This is the spec's `artifact_versions` requirement and gives free undo/variant branching.
- A failed *foundation* resolution or *missing component* short-circuits the loop and emits a **gap report** (not an invention) — enforcing the Core Value.

---

## Registry Strategy (static metadata vs RAG/embeddings)

**Recommendation: static, typed metadata as the source of truth + a thin retrieval layer; defer embeddings/RAG.** Add a lexical/category filter now; add embeddings only if catalog growth makes the prompt context too large.

**Rationale (HIGH confidence — based on existing repo assets):**
- The repo already has a **machine-readable, typed registry**: `@oneui/ui` `componentRegistry.ts` (name → recipe/tokenManifest/meta/preview), `jioAlphaCatalog.ts` (the approved-alpha allowlist with `surfaceAware`, `multiAccent`, `importPath`, `storyPath`), and `@oneui/shared/meta` (`ComponentMeta`, `deriveSchemaFromMeta` → Zod, `generateAIContext` → LLM markdown, `STORY_EXEMPLARS`). This is exactly the `JioComponentRegistryItem` shape the specs ask for, minus a thin adapter.
- The catalog is on the order of ~50 components — small enough to fit, filtered by category + output-profile, directly into the IR-generator prompt via `generateAIContext`. RAG adds infra (vector store, embedding sync, drift) and a recall-miss failure mode that directly threatens the Core Value: a semantic miss could *omit* an approved component, pushing the model toward inventing one. Deterministic membership is safer for a *constrained* generator.
- **Compliance membership must stay deterministic regardless:** the validator checks `componentId ∈ registry` by exact lookup, never by similarity. Even if retrieval later uses embeddings for *ranking*, the allowlist gate stays static.

**`experience-builder-registry` should:**
1. Adapt existing meta into `JioComponentRegistryItem` (add `supportedOutputProfiles`, `usageRules`, `antiPatterns`, `screenshots` — pull anti-patterns from component `.meta.ts` and DCA rules).
2. Expose `queryRegistry({ category?, outputProfile?, brandId?, intent? })` → filtered list + the generated AI-context markdown.
3. Source-of-truth = `jioAlphaCatalog` (only `status: 'alpha'` components are generatable). Mirrors the spec's "only Storybook-approved components."
4. Optional later: a `getComponentEmbeddings`/`searchSemantic` adapter behind the same interface (Convex already has `compositionEmbeddings`/`contextPackCache` precedent) — additive, never the gate.

---

## Foundation Resolver & Non-Web Output Profiles

The resolver is the bridge from **Jio foundations (web-centric token engine)** to **output-profile-specific render targets** (Instagram square/portrait/story/carousel, LinkedIn, slide, outdoor/banner, image export). It implements the spec's `FoundationResolveInput → FoundationResolveResult` contract.

**How non-web profiles resolve from existing Jio foundations (the reuse is the design):**

| Resolve field | Source in existing engine | Non-web handling |
|---|---|---|
| `tokenSetId` / `colorRoles` / `surfaces` | `buildThemeConfig` + surface engine (`surfaceNew.ts`, `cssGenNew.ts`) per `brandId`/`colorMode` | Identical to web — surfaces/colors are profile-independent; the same brand CSS is injected into the artifact frame |
| `typeScale.roles` | Typography V2 f-step aliases (`--Display-L-FontSize: var(--Dimension-fN)`) | Profile selects a **platform id** (`data-Breakpoint`) + density so the f-scale remaps; large-format (outdoor) selects the largest platform bucket / a dedicated profile entry |
| `spacingScale.roles` | f-scale primitives, per-platform via `scale.css` | Same cascade; profile sets the platform attribute on the frame root |
| `dimensions` (w/h/aspectRatio/fixedFrame) | **NEW data** — not in token engine today | Output-profile table in `experience-builder-core`: `{ instagram-square: 1080×1080, portrait: 1080×1350, story: 1080×1920, carousel: N×(1080×1350), slide: 1920×1080, ... }`. `fixedFrame: true` for social/print, `false` for web |
| `safe areas`, `legibility rules` | **NEW data** — per-profile | Stored in the output-profile table (margin/gutter via `--Spacing-Margin`/`--Spacing-Gutter` where possible; explicit px safe-area only where no token applies, flagged) |
| `exportRules` | **NEW data** — per-profile | `{ format: png\|jpg\|pdf, dpi, colorSpace }` |

**Architecture decision:** the resolver is a **deterministic tool** (not an LLM agent) composed of two parts:
1. A **brand/token resolver** that delegates to the existing engine (`buildThemeConfig` → the same CSS pipeline used by `FoundationStyleProvider`). No reimplementation.
2. An **output-profile registry** (new static data in `experience-builder-core`) that supplies dimensions/aspect/safe-area/export rules the token engine doesn't model. This is the one genuinely *new* foundation concept and the right place for it — it extends, never forks, the foundation layer.

If a requested profile has no entry → emit a **foundation gap report** and stop (Core Value). Mocks in P1 must return this exact `FoundationResolveResult` shape so P2/P4 can swap in real data without contract changes.

**Rendering non-web profiles:** the artifact frame sets the resolved `width/height` + the resolved `data-Breakpoint`/`data-theme`/`data-surface` attributes on a `<Surface>` root, then renders the compiled Jio components inside. Social/print frames are real DOM at fixed dimensions (so text/a11y/CSS are real), screenshotted by Playwright for export — matching the specs' "Jio CSS layout renderer inside artifact frames" rather than raw-canvas pixels.

---

## Mastra Workflow Decomposition

Mastra owns sequencing, shared run state, retries, the repair loop, HITL suspend/resume, and observability. It is **not** the generator — the IR, registry, and validators control correctness (per PROJECT.md Key Decision). Models are called via the **Vercel AI SDK** (`@ai-sdk/anthropic`, already in repo); Mastra is built on top of the AI SDK, so this is a native fit. (Verified: Mastra runs on the AI SDK and supports any AI-SDK model.)

### Agents (LLM steps) vs Tools (deterministic steps)

| Step | Type | Why |
|---|---|---|
| Intent | **Agent** | NL → structured intent (artifact type, audience, goal, output profile) |
| Brand/Foundation Resolver | **Tool** | Deterministic lookup over engine + output-profile table |
| Storybook Registry Retrieval | **Tool** | Deterministic filtered query (static membership) |
| Tone of Voice | **Agent (existing)** | Delegate to `/api/voice` (or its executor) |
| Design | **Agent (existing)** | Delegate to `/api/agent` design executor (DCA) |
| UX/Campaign Planner | **Agent** | Plans flows / carousel narrative / message hierarchy |
| IR Generator | **Agent** | Structured output (Zod IR) from all prior context |
| Compiler | **Tool** | `IR → AST → astToReact` (deterministic) |
| Compliance Validator | **Tool** | Deterministic allowlist/prop/token checks |
| Preview Renderer | **Tool** | Sandboxed iframe + Playwright screenshot |
| Visual Evaluator | **Agent (vision)** | Scores screenshots across the spec's dimensions |
| Repair | **Agent** | Emits IR JSON patch from validation+eval findings |
| Export | **Tool** | Deterministic asset/bundle generation |

**Design principle:** maximize deterministic tools, minimize LLM agents. Resolver, registry, compiler, validator, and export are all deterministic — the only places the model has freedom are intent parsing, copy, design plan, IR authoring, and evaluation. This is what makes "AI cannot bypass the design system" enforceable.

### Human-in-the-loop checkpoints (Mastra suspend/resume)

Mastra suspends a workflow as a saved snapshot and resumes from a step id (verified against current Mastra HITL docs). Recommended suspend points:

1. **After Intent + Foundation resolve, before generation** — confirm artifact type / brand / output profile (cheap to correct here; expensive later).
2. **After Design plan, before IR generation** — approve creative direction (especially the campaign "3 directions → pick 1" flow in P4).
3. **On repair-loop exhaustion** — if validation or evaluation can't pass within N=3 auto-iterations, suspend and surface gaps/violations to the user instead of looping or inventing.
4. **Before export** — confirm the frozen version.

The Lab route renders approval UI (Jio DS components) on suspend events and calls resume with the user's decision.

---

## Data Model / Persistence

**Recommendation: yes, use Convex** — it is the repo's single source of truth, already real-time-subscribed by the platform, and the spec's entity list maps cleanly onto new Convex tables. Convex's real-time subscriptions are also the natural transport for streaming run state to the canvas.

**Split persistence (important architectural call):**
- **Convex = durable domain state** (entities below). Read via `useQuery` in the Lab route for live canvas updates.
- **Mastra workflow snapshots = runtime execution state** (suspend/resume state machine). Use a Mastra storage adapter for this — Mastra supports pluggable storage (libSQL/Postgres/Mongo verified). Do **not** force Mastra's internal step-snapshot format into Convex domain tables; instead mirror *meaningful* milestones (run status, IR versions, validations, evaluations) into Convex via tool side-effects/events. This keeps the durable model clean and avoids coupling domain schema to Mastra internals.

### New Convex tables (spec entities → schema)

| Spec entity | Convex table | Notes / key fields |
|---|---|---|
| projects | `experienceProjects` | name, brandId, ownerId |
| canvases | `experienceCanvases` | projectId, tldraw store snapshot ref |
| canvas_shapes | (in tldraw store / `experienceCanvasShapes`) | shape ↔ artifact link |
| artifacts | `experienceArtifacts` | canvasId, artifactType, currentVersionId |
| artifact_versions | `experienceArtifactVersions` | **stores IR + compiled bundle ref + previewRef + thumbnail + validationResult + evaluationResult + parentVersionId + runId** (immutable) |
| generation_runs | `experienceRuns` | status, workflowId, events log, suspendState ref, cost/tokens |
| foundation_profiles | `outputProfiles` (mostly static in `-core`) | mirror only if user-customizable |
| component_registry_items | (static in `-registry`) | source = `jioAlphaCatalog`; mirror to Convex only if per-brand approval needed |
| validation_results | embedded in version (or `experienceValidations`) | `JioValidationResult` |
| evaluation_results | embedded in version (or `experienceEvaluations`) | scores + dimensions |
| exports | `experienceExports` | versionId, format, storage ref |
| comments | `experienceComments` | shapeId thread (P5) |

**Naming-prefix all new tables `experience*`** to keep them visibly isolated from existing `compositions`/`campaigns`/`createProjects` tables (the repo already has `campaigns`/`campaignAssets`/`createProjects` — do not overload them; the Lab is a distinct surface).

---

## Reuse Map (call vs reimplement)

| New component | CALL (reuse) | REIMPLEMENT / NEW |
|---|---|---|
| Foundation Resolver | `@oneui/shared/engine` `buildThemeConfig` + the brand-CSS pipeline (same one `FoundationStyleProvider`/`useBrandCSS` use); Convex `foundations`/`appearanceConfigs`/`colorScales`/`brandCSSCache` | Output-profile table (dimensions/aspect/safe-area/export rules) — the only new foundation data |
| Registry | `@oneui/ui` `componentRegistry.ts`, `jioAlphaCatalog.ts`; `@oneui/shared/meta` `ComponentMeta`/`deriveSchemaFromMeta`/`generateAIContext`/`STORY_EXEMPLARS` | Thin `JioComponentRegistryItem` adapter + `queryRegistry()` filter |
| ToV agent | `/api/voice` executors / `voiceCompiler` (existing) | Mastra tool wrapper only |
| Design agent | `/api/agent` design executor + `compositionCompiler`/`compositionDesignGate`/`compositionASTNormalizer` (existing DCA) | Mastra tool wrapper only |
| Compiler | `@oneui/shared/codegen` `astToReact` / `astToPage`; IR→AST mapping uses the same `ComponentASTNode`/`ASTRoot` types | IR→AST translator in `-core` |
| Compliance Validator | `check:literals` logic, `tokenManifest`/`tokenBoundary`, `compositionCodeValidator` (existing) | `JioValidationResult` aggregation + registry-membership + import-allowlist + output-dimension checks |
| Preview Renderer | `/internal/render-ast` + `/internal/render-code` routes; `ASTRenderer` + `COMPONENT_REGISTRY` | Isolated preview origin + CSP/iframe sandbox + Playwright capture |
| Canvas | tldraw (`^4.5.3` already installed); patterns from `ExperienceCanvas` (do not import/modify it) | New isolated tldraw shell + new shape utils in the route |
| Orchestration | — | Mastra (the one net-new dependency) + Vercel AI SDK (`ai@^6`, `@ai-sdk/anthropic`) as model layer |
| Persistence | Convex client + schema patterns | New `experience*` tables; Mastra storage adapter for snapshots |

**Hard rule from PROJECT.md:** never import from / modify `apps/platform/src/design-tools/ExperienceCanvas/*` or the `(builder)` route. Copy/adapt patterns into the new route; keep the dependency graph one-way (Lab → reuse layer, never Lab ↔ existing Builder).

---

## Suggested Build Order (maps to the 5 phases)

**Phase 1 — Isolated foundation (contracts first, mocks behind them):**
1. `experience-builder-core`: IR Zod schema, output-profile table, `FoundationResolveResult`/`JioComponentRegistryItem`/`JioValidationResult`/`ExperienceBuilderEvent` types, IR↔AST mapping + IR patch/diff.
2. `experience-builder-registry`: adapter over existing meta → mock-shaped `queryRegistry`.
3. Isolated `(experience-lab)` route + tldraw shell + prompt/artifact/foundation cards (Jio DS components only).
4. `experience-builder-agents`: Mastra workflow skeleton, event stream, mock generation producing valid IR → artifact card.
5. `experience-builder-validation`: basic validator (block Tailwind / non-Jio imports / unregistered components).
6. New `experience*` Convex tables (runs, artifacts, versions).

> Dependency note: `-core` blocks everything (it owns the IR + contracts). Build it first. The route + Mastra skeleton can develop in parallel against `-core` mocks.

**Phase 2 — Real source integration:** wire resolver to `buildThemeConfig`/Convex; registry to real `jioAlphaCatalog`; ToV + DCA Mastra tool wrappers; implement IR→AST→`astToReact` compiler.

**Phase 3 — Preview / eval / repair:** sandboxed iframe preview (reuse render routes) + Playwright screenshots; full `JioValidationResult` pipeline; vision evaluator; **IR-patch repair loop**; version history (already modeled in P1 schema).

**Phase 4 — Campaign / social:** output-profile table entries for IG/carousel/slide/outdoor; Campaign Planner agent (3 directions → HITL pick); per-frame IR generation; ToV captions; PNG/JPG/PDF export.

**Phase 5 — Production readiness:** collaboration (tldraw sync), observability/cost (Mastra hooks + `experienceRuns`), workflow persistence (Mastra storage adapter), CSP/security hardening, handoff bundles.

---

## Architectural Patterns

### Pattern: IR-as-contract, deterministic edges
**What:** LLM agents only ever *author or annotate the IR*; every transform touching real Jio code (resolve, compile, validate, export) is a deterministic tool. **When:** any design-system-constrained generator. **Trade-off:** more upfront schema work; in return the design system is unbypassable and repairs are diffable.

### Pattern: Repair-by-patch, not regenerate
**What:** repair emits a JSON patch against the IR, recompiles, re-validates. **Trade-off:** needs a stable IR diff/apply in `-core`; pays back in cost, determinism, and clean version history.

### Pattern: Split persistence (domain in Convex, run-state in Mastra storage)
**What:** durable entities in Convex; ephemeral workflow snapshots in a Mastra storage adapter, with milestones mirrored into Convex via events. **Trade-off:** two stores to reason about; avoids coupling the durable schema to orchestrator internals.

### Pattern: Output-profile table as the foundation extension point
**What:** the *only* new foundation concept (dimensions/aspect/safe-area/export) lives in one static table; everything else reuses the token engine. **Trade-off:** none significant — it's the minimal honest extension that keeps "don't invent foundations" true.

---

## Anti-Patterns to Avoid

- **Generating JSX as the source of truth.** Violates the Core Value and breaks repair/version. Always IR-first.
- **RAG as the compliance gate.** Membership must be exact lookup; a semantic miss can drop an approved component and tempt invention.
- **Forking the brand/surface engine for social/print.** Surfaces/colors/type are profile-independent; only dimensions/safe-areas are new.
- **Forcing Mastra step snapshots into domain tables.** Couples schema to orchestrator internals; mirror milestones instead.
- **Touching `ExperienceCanvas` / `(builder)`.** Hard isolation rule; copy patterns, never import or modify.
- **`<div style={{ background }}>` in generated artifacts or the Lab UI.** Must use `<Surface mode>` so `[data-surface]` remapping applies (repo CLAUDE.md mandate applies to generated output too).

---

## Scalability Considerations

| Concern | Small (demo) | Team usage | Heavy campaign batches |
|---|---|---|---|
| Registry retrieval | static list in prompt | static + category filter | add embedding ranking (additive, gate stays static) |
| Preview rendering | on-demand iframe | lifecycle (thumbnail far / live near / suspend offscreen, per spec §15) | dedicated preview origin + worker pool |
| Screenshots/export | inline Playwright | Playwright workers | queue (Inngest/Trigger.dev) + object storage |
| Workflow state | Mastra in-memory/libSQL | Mastra Postgres adapter | same + Convex milestone mirror |

---

## Sources

- Existing codebase (direct inspection, HIGH): `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `packages/shared/src/codegen/astToReact.ts`, `packages/ui/src/registry/{componentRegistry,jioAlphaCatalog}.ts`, `packages/shared/src/meta/generateAIContext.ts`, `packages/convex/convex/schema.ts`, `apps/platform/src/app/api/{agent,voice,composition}/*`, `apps/platform/src/app/internal/{render-ast,render-code}`.
- Project docs (HIGH): `.planning/PROJECT.md`; `jio_ai_experience_builder_mvp_tech_specs.md` §§3,8,9,10,11,12,13,16; `jio_experience_builder_full_execution_prompt.md`.
- Mastra HITL / suspend-resume (MEDIUM, official docs): https://mastra.ai/docs/workflows/human-in-the-loop , https://mastra.ai/docs/workflows/suspend-and-resume
- Mastra + Vercel AI SDK / storage backends (MEDIUM, official docs/blog): https://mastra.ai/blog/using-ai-sdk-with-mastra , https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk

---

## Open Questions

- **Mastra storage adapter choice** in this repo: libSQL (simplest) vs Postgres vs a Convex-backed custom adapter. Needs a P1 spike — affects deployment.
- **Exact IR→AST mapping fidelity:** does the existing `ComponentASTNode`/`astToReact` cover all IR slot/section/layout constructs, or does the IR need a richer layout model than the current AST? Verify against `componentAST.ts` in P1.
- **Output-profile token coverage:** which safe-area/large-format values genuinely have no Jio token and must be explicit px (and thus flagged) — needs a foundation audit in P4.
- **Sandbox origin strategy:** dedicated preview subdomain vs `srcdoc` iframe + CSP — security review needed in P3.
- **Per-brand component approval:** is `jioAlphaCatalog` global, or do some brands approve different component subsets (drives whether `component_registry_items` needs a Convex table)?
