# Phase 1: Isolated Foundation - Research

**Researched:** 2026-05-30
**Domain:** Contracts-first, isolated, Jio-DS-only AI Experience Builder Lab (Mastra orchestration + IR-as-contract + tldraw canvas) inside an existing Next.js 15 / React 19 / Convex / tldraw monorepo
**Confidence:** HIGH on reuse map, isolation model, and the Mastra↔AI-SDK-v6 compatibility resolution (verified live against npm + Mastra docs this session); MEDIUM on non-web foundation coverage (audit is a P1 deliverable, not yet run) and IR↔AST fidelity for layout constructs.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Request & Run UX**
- **D-01:** Request controls live in a **docked request panel/inspector**, not inline on the prompt card. Reuse the existing `ExperienceCanvas` prop-panel UX pattern (Jio `Select` components, etc.). The prompt card holds the prompt text + acts as the run origin; the panel is its editor.
- **D-02:** The brand / sub-brand selector populates from the **real Jio brands list via a read-only Convex query** — NOT a hardcoded mock. The mock boundary stays at the *foundation resolver*, not the brand list. Brand IDs are real for P2. Read-only ⇒ no isolation risk to the existing Builder (does not touch `FoundationStyleProvider` / foundation injection).
- **D-03:** The output-profile selector is **filtered by the selected artifact type**. The type→profile mapping is encoded in the **output-profile table contract** in `-core` from P1 (P4 builds on it). Invalid type/profile pairings are prevented at the UI, not just rejected downstream.
- **D-04:** The request panel **edits the currently-selected prompt card**; its config is **persisted on the card** (in the IR / canvas object model); **Run** produces a **linked artifact card**. Strong spatial lineage: prompt card → artifact card. Not a global standalone composer.

**Canvas Object-Model Scope**
- **D-05:** Define the **full card / artifact-type union** (8 artifact types: web-ui, app-screen, dashboard, social-post, instagram-carousel, outdoor-display, slide, image; plus foundation-profile / component-reference / evaluation-report / variant-group / export cards) in the **IR + canvas object-model contract now** — production-shaped so later phases just light up renderers. Render only a thin subset in P1.
- **D-06:** Card shapes that get **real renderers in P1**: **prompt card, artifact card, foundation-profile card (including typed gap-report state), component-reference card.** All other union members are defined in the contract but render as a generic placeholder until their phase.
- **D-07:** A single run's related cards (prompt → artifact + foundation-profile + component-reference) are grouped inside a **labeled run-group tldraw frame** ("Run #N"). Reuse tldraw frame shapes. Chosen over arrow/binding connectors and parent-child auto-layout because it scales to variant-groups (P3) and campaign carousels (P4).
- **D-08:** P1 persistence scope: **generation runs (VER-03) AND the generated IR per artifact persist to the `experience*` Convex tables; the tldraw canvas layout (cards/frames/positions) stays ephemeral** (local/session state) in P1.

### Claude's Discretion
- **Mock artifact-card fidelity (CANVAS-04):** P1 artifact card renders a **structured IR-summary** (artifact type, output profile, brand, layout-section / component-instance outline read from the *valid IR*) **plus an IR/JSON inspector toggle**. Does NOT fake a real-DOM preview (that is P3, behind a separate origin).
- **Agent event-stream surfacing (ORCH-03):** A **docked run-inspector panel** (paired with the request panel) shows the streamed `ExperienceBuilderEvent` timeline for the active run; the artifact card reflects a **lightweight status** (running → valid / gap). Chat-style activity feed deferred to P3 (INPUT-05).
- **Gap-report UX (FND-03 / REG-03):** A gap surfaces as the **foundation-profile card flipping to its typed gap-report state** (and the component-reference card for unregistered-component gaps). On a gap, the run **short-circuits to the gap report and produces no artifact card**.
- **Lab entry-point:** A dedicated route group `apps/platform/src/app/(platform)/(experience-lab)/`, reachable from the main platform nav under a clearly-labeled **"Experience Lab"** entry, visibly **distinct** from the existing `(builder)` group. Visible (not dev-hidden).

### Deferred Ideas (OUT OF SCOPE)
- **Chat-style activity feed / chat-based iteration** — P3 (INPUT-05). P1 uses run-inspector timeline.
- **Canvas layout sync to Convex** — deferred (D-08 keeps layout ephemeral); revisit at P5.
- **Real-DOM preview in the artifact card** — P3 (PREV-*). P1 shows structured IR summary.
- **Real `@ag-ui/*` adapter** — P5 only if external-frontend interop is needed (INTEROP-01, v2).
- **Embeddings/RAG component retrieval** — v2 (REG-05); P1/P2 use static typed metadata as the gate.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LAB-01 | Open Lab from a dedicated route, separate from existing Builder | New `(experience-lab)` route group sibling to `(studio)`/`(builder)`; nav entry. Established route-group pattern (STRUCTURE.md § New Platform Page). |
| LAB-02 | Lab UI composed entirely of Jio DS components + Jio CSS (no Tailwind/utility/external kits) | `@oneui/ui` deep-path imports + CSS Modules + token-only styling; `check:literals`/`check:layers` gates apply. Surface Context + Typography V2 mandatory (CLAUDE.md). |
| LAB-03 | Lab code isolated in dedicated packages/route; cannot modify/break existing Builder (CI import guards + smoke test) | "Isolation by package, reuse by contract"; eslint `no-restricted-imports` already present (extend it); existing-Builder smoke test; `pnpm why ai` single-version gate. See **Isolation Architecture**. |
| LAB-04 | README documents how the Lab stays isolated + how to run it | Deliverable doc in `packages/experience-builder-core` or route root. |
| CANVAS-01 | Isolated infinite tldraw canvas as central workspace | New isolated tldraw shell, own editor instance + scoped store; mirror `ExperienceCanvas` shape/frame/panel patterns (do NOT import it). tldraw `^4.5.3` already installed. |
| CANVAS-02 | User can create a prompt card | Custom tldraw `ShapeUtil` (pattern: `ComponentShape.tsx`). |
| CANVAS-03 | Canvas supports the full artifact object model (13-member union) | D-05: full union defined in `-core` IR + canvas object-model contract; thin subset rendered. |
| CANVAS-04 | Artifact card appears after a generation run completes | D-06 + Claude's-discretion structured IR-summary card + IR/JSON inspector. |
| INPUT-01 | Select a Jio brand or sub-brand | D-02: read-only Convex `brands` query (existing `brands.ts`). |
| INPUT-02 | Select an output artifact type | Artifact-type enum in `-core`; Jio `Select`. |
| INPUT-03 | Select a target platform / output profile | D-03: output-profile table in `-core`, filtered by artifact type. |
| INPUT-04 | Enter a text prompt / campaign brief | Prompt card text + docked request panel (D-01). |
| IR-01 | Every artifact represented as canonical Jio Experience IR (Zod) before code | `-core` Zod schema. See **IR Contract Design**. |
| IR-02 | IR schema contains **no** free-text markup / HTML / raw-JSX field | **Critical.** See **IR Contract Design** + **Pitfall: Raw-JSX smuggling**. The existing `ElementASTNode.tag` (raw HTML) MUST NOT be reused in the IR. |
| IR-03 | Map IR ↔ component AST; produce IR diffs/patches | IR→AST translator in `-core` targeting `ComponentASTNode`/`TextASTNode` (NOT `ElementASTNode`); JSON-patch diff/apply. |
| IR-04 | IR captures artifact type, target profile, brand, foundation refs, layout sections, component instances, content, a11y requirements, validation status | IR schema field set. See **IR Contract Design**. |
| FND-01 | Resolve brand/sub-brand, token set, type scale, spacing, surface profile, dimensions, output rules from Jio foundations | Mock resolver shaped to `ThemeConfig` (`buildThemeConfig`) + output-profile table. See **Foundation Resolver**. |
| FND-03 | No profile → typed foundation gap report (never invent dimensions) | `FoundationResolveResult` with first-class gap-report variant; gap-report card state (D-06). |
| REG-01 | Machine-readable registry of approved Jio components | `-registry` adapter over `jioAlphaCatalog` + `componentRegistry` + `@oneui/shared/meta`. See **Registry Adapter**. |
| REG-02 | Generator retrieves candidate components before generating | `queryRegistry()` deterministic filter (mock returns production-shaped items in P1). |
| REG-03 | Only registry-approved components may be emitted; unregistered → component gap report | Allowlist membership (exact lookup); component-reference card gap state. |
| ORCH-01 | Mastra workflow sequences the pipeline | Mastra workflow **skeleton** in `-agents` (steps stubbed; mock IR generator). See **Mastra Workflow**. |
| ORCH-03 | Lab streams an agent event stream to the canvas | Internal `ExperienceBuilderEvent` model + `@mastra/ai-sdk` stream bridge → run-inspector panel. |
| ORCH-04 | Mastra owns orchestration; AI SDK is model-layer-only | Boundary enforced architecturally; no sequencing/repair/HITL in AI SDK callbacks. |
| GEN-01 | Intent agent determines artifact type / output profile / audience / goal | P1 ships as a **mock/stub** step (real LLM in P2); contract shape defined now. |
| GEN-08 | Mock generation workflow producing valid IR ships first | The walking-skeleton path: mock workflow → valid IR → artifact card. |
| VAL-01 | Every artifact validated before ready; result = passed + blocking + warnings + repair suggestions + gaps | `JioValidationResult` shape in `-core`; basic validator in `-validation`. |
| VAL-02 | Validation blocks Tailwind / utility CSS / external visual imports / non-Jio visual imports | Basic AST import-allowlist validator. See **AST Validator**. |
| VAL-03 | Validation blocks unregistered components + invalid props/variants/slots | Registry membership + props/variant/slot check against meta. |
| VER-03 | Generation runs persisted with event/run state | New `experienceRuns` Convex table (D-08). |
</phase_requirements>

## Summary

Phase 1 is **contracts-first scaffolding**, not feature delivery. The repo already ships almost everything a generic "AI UI generator" invents from scratch: an AST→React compiler (`@oneui/shared/codegen astToReact`), a recursive registry-gated renderer (`ASTRenderer.tsx` with per-leaf prop allowlists and forbidden-style-key stripping), a machine-readable component catalog (`jioAlphaCatalog.ts` + `componentRegistry.ts` + `@oneui/shared/meta`), a token-resolution engine (`buildThemeConfig` + surface/typography pipeline), sandboxed render routes (`/internal/render-ast` with server-side token lookup, never URL-embedded), tldraw `4.5.3` with proven custom-shape/frame patterns (`ComponentShape.tsx`, `OneUIFrameShapeUtil.tsx`), and Convex as the real-time source of truth. The **only net-new dependency is Mastra**. Everything else is *reuse-by-contract behind six isolated `experience-builder-*` packages plus one isolated route*.

The single most important P1 outcome is **production-shaped contracts with every HIGH-severity risk designed out** so P2 is a data-swap, not a migration. Three of those risks are now de-risked by this session's verification: (1) the **Mastra↔AI-SDK-v6 compatibility** is **confirmed supported** — `@mastra/core@1.37.1` ships dual `@ai-sdk/provider-v5`/`@ai-sdk/provider-v6` aliased deps and Mastra 1.0 (stable 2026-01-20) added LanguageModelV3/AI-SDK-v6 support, so the earlier "Mastra only supports v4/v5" worry is stale [VERIFIED: npm + mastra.ai changelog]; (2) the **raw-JSX smuggling vector is concrete** — the existing `componentAST.ts` has an `ElementASTNode` with a raw HTML `tag` field and `astToReact` emits raw `<div>` JSX, so the new IR must NOT reuse `ElementASTNode` and the IR→AST mapping must constrain to `ComponentASTNode` + `TextASTNode` (plus a closed set of layout primitives) only [VERIFIED: codebase]; (3) **registry drift already exists in the base repo** (CONCERNS.md: `check:metadata`, `check:jio-alpha-catalog`, machine-docs gates all failing) so the P1 mock must derive its shape from the single existing metadata source and add a freshness gate in P2.

**Primary recommendation:** Build `experience-builder-core` first (IR Zod schema with zero markup fields + output-profile table + `FoundationResolveResult`/`JioComponentRegistryItem`/`JioValidationResult`/`ExperienceBuilderEvent` types + IR↔AST mapping + JSON-patch diff). Stand up isolation guards (eslint import boundary + existing-Builder smoke test + `pnpm why ai` single-version CI gate) **before any feature code**. Pin `@mastra/core` and `@mastra/ai-sdk` to **exact** versions inside `experience-builder-agents`. Wire a mock-only walking skeleton (isolated route + tldraw shell → prompt card → mock Mastra workflow → valid IR → structured-summary artifact card). Run the non-web foundation-coverage audit and document the separate-origin preview decision as P1 deliverables.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Lab route + nav entry | Frontend Server (Next.js App Router) | Browser | Route group + server layout; isolated from `(builder)`. |
| Infinite canvas + custom shapes/frames | Browser (tldraw client) | — | tldraw is a client-side editor; shapes render in the browser. |
| Brand list selector | API / Backend (Convex query) | Browser | D-02: read-only `brands` query; Convex is SoT. |
| Prompt-card config persistence (IR-on-card) | Browser (ephemeral canvas state) | API (run+IR persisted) | D-08: canvas layout ephemeral; runs + IR durable in Convex. |
| Mock generation workflow / orchestration | API / Backend (Mastra in `-agents`) | — | ORCH-04: Mastra owns sequencing; never the browser. |
| IR schema + IR↔AST + diff/patch | Shared library (`-core`, pure TS) | — | Framework-agnostic; consumed by agents, validation, UI. |
| Component registry query | Shared library (`-registry`) | API (if per-brand approval later) | Static typed metadata is the gate; deterministic membership. |
| Foundation resolution (mock) | API / Backend (`-agents` tool) | Shared (`-core` profile table) | Deterministic tool; mock matches `ThemeConfig` shape. |
| AST compliance validation | Shared library (`-validation`, pure TS) | — | Deterministic AST walk; reuses `tokenManifest`/`check:literals`. |
| Event stream → canvas patches | Frontend Server (stream route) → Browser (reducer) | — | `@mastra/ai-sdk` bridge; canvas applies live patches. |
| Run + IR persistence | API / Backend (Convex `experience*` tables) | — | VER-03 + D-08. |

**Tier-misassignment guardrails for the planner:** Mastra orchestration and the foundation resolver are **API/backend** (Node runtime, never Edge — Mastra needs Node). Component selection / IR generation logic is **never** in the browser tier. The brand-list query is the *only* real backend touch in P1; everything else generation-side is mocked but lives in the correct (backend) tier so P2 swaps data, not location.

## Standard Stack

### Core (NEW for this milestone — install only in `experience-builder-agents`)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@mastra/core` | pin **exact** `1.37.1` | Agent + workflow + tool + step primitives; the orchestration brain (`createWorkflow().then/.branch/.dountil/.parallel`, suspend/resume snapshots for HITL, step retries) | The one net-new dependency. Mastra is built on the AI SDK and supports v6 (LanguageModelV3) as of 1.0. [VERIFIED: npm `@mastra/core@1.37.1`; mastra.ai changelog 2026-01-20] [ASSUMED: exact-version-pin-is-safe — verify at install] |
| `@mastra/ai-sdk` | pin **exact** `1.4.3` | Bridge: Mastra agent/workflow streams → AI SDK UI (`useChat`/`useObject`); `toAISdkStream(stream, { version: 'v6' })` | First-party Mastra→React streaming; the clean transport for `ExperienceBuilderEvent`. Peers `@mastra/core >=1.5.0 <2.0.0` — **note `1.4.3` predates that floor; verify the matching `@mastra/ai-sdk` build at install** [VERIFIED: npm peer deps; FLAG below]. |

### Reused Core (DO NOT re-choose — already installed)

| Library | Version (resolved) | Role in P1 |
|---------|--------------------|-----------|
| `ai` (Vercel AI SDK) | `6.0.111` + `6.2.2` both present in lockfile | Model layer only. P1 has **no real model calls** (mock generator), but the boundary + adapter module is established now. `Output.object()` (NOT deprecated `generateObject`) is the P2 idiom. [VERIFIED: pnpm-lock.yaml] |
| `@ai-sdk/anthropic` | `3.0.54` | Claude provider (P2 model calls). |
| `@ai-sdk/react` | `3.0.113` | `useChat`/`useObject` on the Lab UI, fed by `@mastra/ai-sdk`. |
| `zod` | `4.3.6` (zod 3.25.76 also present) | IR schema + Mastra step schemas. `@mastra/core` peers `zod ^3.25 \|\| ^4.0` — **`4.3.6` satisfies this** [VERIFIED: npm peer deps]. One schema lib across the stack; do not add a second validator. |
| `tldraw` | `4.5.3` | Isolated Lab canvas. **Do not bump repo-wide.** Mirror `ComponentShape`/`OneUIFrameShapeUtil` patterns; never import them. |
| `convex` | `1.39.1` | `experience*` tables (runs + IR); read-only `brands` query. |
| `@oneui/shared` (`codegen astToReact`, `types/componentAST`, `engine`, `meta`) | in repo | IR→AST compile target (P2); IR↔AST mapping reuses `ComponentASTNode`/`ASTRoot`; `tokenManifest`/`tokenBoundary` for validator; `buildThemeConfig` shape for resolver. |
| `@oneui/ui` (`registry/componentRegistry`, `registry/jioAlphaCatalog`, `runtime/ASTRenderer`) | in repo | Registry source-of-truth; renderer with prop allowlists (the lowest compile/render layer). Import via **deep paths** (`@oneui/ui/components/...`), never the barrel (eslint `no-restricted-imports`). |

### Supporting (NEW — add only when the phase needs it; NOT P1)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@mastra/observability` + `@mastra/otel-bridge` | latest | Tracing/cost hooks | P5 (optionally dev-only earlier). NOT P1. |
| `@ag-ui/core` / `@ag-ui/client` | `0.0.x` (pre-1.0) | AG-UI typed event protocol | P5 only if external-frontend interop needed. **Do NOT add in P1** — use the internal event model. |
| `playwright` (in repo) | `1.59.1` | Screenshot/eval worker | P3. Already configured with `@axe-core/playwright`. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Mastra orchestration | Vercel AI SDK `ToolLoopAgent` only | Rejected — PROJECT.md forbids AI SDK as orchestration brain; spec needs a multi-stage graph + repair loops + HITL. |
| Internal `ExperienceBuilderEvent` model | `@ag-ui/*` protocol | AG-UI is pre-1.0 with no stable Mastra adapter; internal model is zero protocol risk and AG-UI-inspired shapes keep a future adapter thin. |
| Reuse `ComponentASTNode`/`TextASTNode` as IR compile target | Adopt Google A2UI renderer | A2UI uses a generic component vocabulary that would bypass the Jio registry + prop allowlists — defeats the Core Value. Borrow the *flat-adjacency / ID-addressable* ideas only. |
| `zod@4` | Valibot / ArkType | One schema lib already powers AI SDK + Mastra + repo. No second validator. |

**Installation (P1 — agents package only):**
```bash
# Run inside packages/experience-builder-agents (NOT repo root)
pnpm add @mastra/core@1.37.1 @mastra/ai-sdk@1.4.3   # EXACT pins, no ^
# Everything else (ai, @ai-sdk/*, zod, tldraw, convex) is ALREADY installed — do not re-add.
```

**Version verification (run at plan/install time):**
```bash
npm view @mastra/core version          # was 1.37.1 on 2026-05-30
npm view @mastra/ai-sdk version         # was 1.4.3 on 2026-05-30
npm view @mastra/ai-sdk peerDependencies # confirm @mastra/core floor matches the installed pin
pnpm why ai                              # MUST resolve a single ai@6.x in Lab packages
```

## Package Legitimacy Audit

> slopcheck could not be installed in this sandbox (`pip install slopcheck` not run). Per protocol, Mastra packages are tagged `[ASSUMED]` and the planner MUST gate each install behind a `checkpoint:human-verify` task. Registry existence is verified (below) but registry existence alone is not `[VERIFIED]`.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `@mastra/core` | npm | mature (1.x, 1.0 GA 2026-01-20) | high (Mastra is a well-known TS agent framework) | github.com/mastra-ai/mastra | n/a (unavailable) | **Approved with checkpoint** — official Mastra core; verify postinstall + exact version at install. [ASSUMED] |
| `@mastra/ai-sdk` | npm | 1.4.3 | medium | github.com/mastra-ai/mastra | n/a | **Approved with checkpoint** — official Mastra streaming bridge. Verify the build whose `@mastra/core` peer floor matches the installed core pin. [ASSUMED] |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none
**Action for planner:** Insert a `checkpoint:human-verify` task before the Mastra install; run `npm view @mastra/core scripts.postinstall` and `npm view @mastra/ai-sdk scripts.postinstall` and confirm no out-of-tree network/filesystem postinstall. Both are from the official `mastra-ai/mastra` monorepo.

## Architecture Patterns

### System Architecture Diagram (P1 — mock walking skeleton)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  apps/platform/(experience-lab)  — isolated route group, Jio-DS-only UI        │
│                                                                                │
│   [Nav: "Experience Lab"] ── distinct from (builder) ──────────────────────┐  │
│                                                                            │  │
│   ┌────────────────────┐   docked request panel (D-01)   ┌──────────────┐ │  │
│   │ tldraw canvas shell│◄──edits selected prompt card────│ Request Panel│ │  │
│   │ (own editor + store│   brand(Select)·type·profile    │ + Run button │ │  │
│   │  CANVAS-01)        │                                 └──────┬───────┘ │  │
│   │                    │   docked run-inspector panel           │ Run     │  │
│   │  ┌───────┐  ┌─────┐│◄──ExperienceBuilderEvent timeline──┐   │         │  │
│   │  │prompt │  │artif││   (ORCH-03)                        │   ▼         │  │
│   │  │ card  │─►│card ││                                    │  POST /api/ │  │
│   │  └───────┘  └─────┘│   inside "Run #N" frame (D-07)     │  exp-lab/run│  │
│   │  ┌──────────┐      │                                    │   │         │  │
│   │  │foundation│      │                                    │   │         │  │
│   │  │profile/  │ (gap)│                                    │   │         │  │
│   │  │comp-ref  │      │                                    │   │         │  │
│   │  └──────────┘      │                                    │   │         │  │
│   └────────┬───────────┘                                    │   │         │  │
│            │ useQuery (read brands D-02; read run/IR D-08)   │   │         │  │
└────────────┼────────────────────────────────────────────────┼───┼─────────┘
             │                                                  │   │ stream (SSE via @mastra/ai-sdk)
             ▼                                                  │   ▼
┌──────────────────────────────┐         ┌─────────────────────┴─────────────────┐
│ Convex (existing SoT)         │         │ experience-builder-agents (Mastra)     │
│  brands (read-only)           │◄────────│  workflow SKELETON:                    │
│  + NEW experienceRuns         │ persist │  intent(mock)→resolve(mock)→retrieve   │
│  + NEW experienceArtifacts    │ run+IR  │   (mock)→IR-gen(mock)→validate(basic)  │
│  + NEW experienceArtifact     │         │  emits ExperienceBuilderEvent          │
│    Versions (IR per artifact) │         └───┬───────┬───────┬───────┬───────────┘
└──────────────────────────────┘             │       │       │       │
                                              ▼       ▼       ▼       ▼
                              ┌───────────────────────────────────────────────────┐
                              │ experience-builder-{core,registry,validation}      │
                              │  core: IR Zod (NO markup) + profile table + types  │
                              │        + IR↔AST map + JSON-patch diff              │
                              │  registry: queryRegistry() over jioAlphaCatalog    │
                              │  validation: AST allowlist (imports/components)    │
                              └───────────────────────┬───────────────────────────┘
                                                      │ reuse-by-contract (read-only)
                                                      ▼
                              ┌───────────────────────────────────────────────────┐
                              │ REUSE LAYER (existing — call, never modify)         │
                              │  @oneui/shared: codegen astToReact, componentAST,   │
                              │    engine buildThemeConfig, tokenManifest, meta     │
                              │  @oneui/ui: jioAlphaCatalog, componentRegistry,     │
                              │    runtime/ASTRenderer (deep imports only)          │
                              │  Convex brands.ts; /internal/render-ast (P3 basis)  │
                              └───────────────────────────────────────────────────┘
   ✗ MUST NOT TOUCH: ExperienceCanvas/*, (builder) route, FoundationStyleProvider
```

In P1 the workflow steps are mock/deterministic stubs that produce a hand-shaped *valid IR*; no real LLM, resolver, or compiler runs. The artifact card renders a structured IR summary (Claude's discretion), not a DOM preview.

### Recommended Package Structure

```
packages/
├── experience-builder-core/          # BUILD FIRST — blocks everything
│   ├── src/
│   │   ├── ir/
│   │   │   ├── schema.ts              # JioExperienceIR Zod schema (NO markup fields)
│   │   │   ├── artifactTypes.ts       # 8-type artifact union + card union (D-05)
│   │   │   ├── irToAst.ts             # IR → ComponentASTNode/TextASTNode (NO ElementASTNode raw tag)
│   │   │   └── patch.ts               # JSON-patch diff/apply over IR (IR-03)
│   │   ├── profiles/outputProfileTable.ts   # type→profile map (D-03) + dimensions/safe-area/export
│   │   ├── contracts/
│   │   │   ├── foundationResolve.ts    # FoundationResolveInput/Result (+ gap variant)
│   │   │   ├── registryItem.ts         # JioComponentRegistryItem (production-shaped)
│   │   │   ├── validation.ts           # JioValidationResult
│   │   │   └── events.ts               # ExperienceBuilderEvent union (AG-UI-inspired)
│   │   └── index.ts
├── experience-builder-registry/      # adapter over jioAlphaCatalog + meta → queryRegistry()
├── experience-builder-agents/        # Mastra root + workflow skeleton + event emission (Node)
├── experience-builder-validation/    # AST allowlist validator → JioValidationResult
├── experience-builder-preview/       # (stub in P1; P3 owns iframe + Playwright)
├── experience-builder-export/        # (stub in P1; P4/P5)
└── ...

apps/platform/src/app/(platform)/(experience-lab)/
├── layout.tsx                        # isolated layout — NO shared (builder) layout
├── page.tsx                          # Lab entry
├── _canvas/                          # tldraw shell, scoped editor + store
│   ├── ExperienceLabCanvas.tsx
│   ├── shapes/PromptCardShape.tsx    # custom ShapeUtil (pattern: ComponentShape.tsx)
│   ├── shapes/ArtifactCardShape.tsx
│   ├── shapes/FoundationProfileCardShape.tsx   # incl. gap-report state (D-06)
│   ├── shapes/ComponentReferenceCardShape.tsx
│   ├── shapes/GenericPlaceholderShape.tsx      # all other union members (D-06)
│   └── frames/RunGroupFrame.tsx      # labeled "Run #N" (D-07; reuse tldraw frame)
├── _panels/RequestPanel.tsx          # docked (D-01); Jio Select etc.
├── _panels/RunInspectorPanel.tsx     # docked event timeline (ORCH-03)
└── api or route → app/api/experience-lab/run/route.ts   # Node runtime; Mastra entry
```

### Pattern 1: IR-as-contract, deterministic edges
**What:** LLM agents only ever author/annotate the IR; every transform touching real Jio code (resolve, compile, validate) is a deterministic tool. **When:** any DS-constrained generator. In P1, *all* edges are deterministic mocks — the LLM doesn't run yet, which is the safest possible walking skeleton.

### Pattern 2: Isolation by package, reuse by contract
**What:** New code lives only in `experience-builder-*` + one route group. Existing engine/agents/registry are read-only contracts (call public APIs via deep imports). **Why:** monorepos make cross-package edits frictionless — and dangerous (CONCERNS.md: one edit to `surfaceNew.ts` affects all brands/components/themes).

### Pattern 3: tldraw custom shape + frame (reuse, don't import)
**What:** Each card is a `ShapeUtil` subclass; run grouping is a tldraw frame. The repo's `ComponentShape.tsx` (custom `ShapeUtil` + `Rectangle2d` geometry + `HTMLContainer`) and `OneUIFrameShapeUtil.tsx` (extends tldraw `FrameShapeUtil`) are the **patterns to copy into the Lab**, with the Lab's own scoped editor/store. **Anti-pattern:** importing `ExperienceCanvas` internals or reusing its store singleton (Pitfall: isolation leakage).
```tsx
// Source: pattern mirrored from apps/platform/src/design-tools/ExperienceCanvas/ComponentShape.tsx
import { ShapeUtil, HTMLContainer, Rectangle2d, T, type RecordProps } from 'tldraw';
// Lab shapes import from @oneui/ui DEEP paths, NEVER the (builder) ContainerShape/FrameContext.
```

### Pattern 4: Server-side artifact handoff (preview decision basis)
**What:** `/internal/render-ast` already resolves the AST via a short-lived server-side token (`consumeASTForRender(token)`), gated by an `x-internal-render` secret, with nothing sensitive in the URL. **This is the right basis for the P3 separate-origin preview** and the model to document as the P1 separate-origin decision: previews are served from a distinct origin, fed a server-resolved bundle, never carry auth/Convex tokens, and use `allow-scripts` WITHOUT `allow-same-origin`. [VERIFIED: codebase render-ast/page.tsx]

### Anti-Patterns to Avoid
- **Reusing `ElementASTNode` (raw HTML `tag`) in the IR.** It is a markup-smuggling channel (IR-02). The IR has no element/tag/rawHtml/`children:string` field; IR→AST emits only `ComponentASTNode` + `TextASTNode` + a *closed, named* set of layout primitives (e.g. `Container`/`Grid`/`Surface` registry components), never arbitrary tags.
- **`<div style={{ background }}>` in Lab UI or generated artifacts.** Must use `<Surface mode>` so `[data-surface]` remapping applies (CLAUDE.md mandate applies to generated output too).
- **Bumping repo-wide tldraw/`ai`/shared deps to serve the Lab.** Pin in Lab packages; never touch root.
- **Touching `FoundationStyleProvider` or setting `injectionMode:'none'`.** Scope a separate provider to the Lab route if brand CSS is needed.
- **A second `ai` version in Lab packages.** CI must fail if `pnpm why ai` resolves >1 version (it already resolves 6.0.111 + 6.2.2 — the Lab must converge on one).
- **RAG/embeddings as the compliance gate.** Membership is exact lookup; defer embeddings (REG-05, v2).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AST → React/JSX codegen | A new compiler | `@oneui/shared/codegen` `astToReact` / `astToReactComponent` | Already pure, Node-safe, JSON-AST in → JSX out. P2 compile target. |
| Recursive AST → React render | A new renderer | `@oneui/ui/runtime` `ASTRenderer` | Has per-leaf prop allowlists + forbidden-style-key stripping (blocks `width`/`className` drift) — this IS part of the enforcement. |
| Component metadata / props / slots | A parallel registry | `jioAlphaCatalog` + `componentRegistry` + `@oneui/shared/meta` (`deriveSchemaFromMeta`, `generateAIContext`) | Single source of truth; a parallel one drifts immediately (CONCERNS.md proves drift already exists). |
| Foundation/token resolution | A new token resolver | `buildThemeConfig` (mock must match its `ThemeConfig` output) | Mock→real is a data swap in P2, not a migration (FND-04). |
| Literal / token-boundary checks | New regex scanner | `tokenManifest.ts` / `tokenBoundary.ts` + `check:literals` philosophy | The 22-family allowlist is already the boundary; reuse it AST-side. |
| Sandboxed render endpoint | A new preview route from scratch | `/internal/render-ast` (server-side token handoff) | Already does secret-gated, no-URL-leak AST handoff — basis for P3. |
| Canvas custom shapes / frames | A new canvas engine | tldraw `4.5.3` + `ShapeUtil`/`FrameShapeUtil` patterns | Patterns proven in `ComponentShape`/`OneUIFrameShapeUtil`. |
| Mastra→React streaming protocol | A hand-rolled SSE protocol | `@mastra/ai-sdk` `toAISdkStream(stream, { version: 'v6' })` | First-party; zero protocol risk; AG-UI-inspired internal event shapes ride on it. |
| Import-boundary enforcement | A custom script | eslint `no-restricted-imports` (already configured) + existing-Builder smoke test | Extend the existing rule with Lab↔Builder boundaries. |

**Key insight:** P1 builds almost no machinery — it builds **contracts and adapters** around machinery that already exists. The work is schema design, type contracts, isolation guards, and a mock wiring path — not a generation engine.

## Runtime State Inventory

> P1 is greenfield (new packages + new route + new Convex tables), but it overlays an existing system. The relevant inventory is "what existing runtime state must P1 NOT disturb" plus "what new state P1 introduces."

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Existing Convex tables (brands, foundations, compositions, campaigns, createProjects, etc.) — P1 only **reads** `brands` (D-02) and **adds** new `experience*` tables. | Add `experienceRuns` + `experienceArtifacts` + `experienceArtifactVersions` to `schema.ts`; do not modify existing table definitions. Run `npx convex dev` to regenerate `_generated`. |
| Live service config | None new. Convex deployment URL (`NEXT_PUBLIC_CONVEX_URL`) already configured. | None. |
| OS-registered state | None. | None — verified: no scheduled tasks / daemons in scope. |
| Secrets / env vars | `ANTHROPIC_API_KEY` exists (used by existing agents). P1 mock path needs **no** model key. P3 preview will need a render secret (the `/internal/render-ast` `x-internal-render` pattern exists). | None for P1. Document the future preview-secret in the separate-origin decision. |
| Build artifacts / installed packages | New packages must be added to `pnpm-workspace.yaml` (`packages/*` glob already covers them). `convex/_generated` regenerates on schema change. `@oneui/ui/dist` already built. | After creating each `experience-builder-*` package, `pnpm install` to link the workspace; regenerate Convex types after schema edits. |

**Canonical question — after every file is added, what runtime systems still reference old state?** Nothing is renamed in P1; the only durable new state is the three `experience*` Convex tables. The risk is *additive coupling* (Pitfall 3), not stale cached state.

## Common Pitfalls

### Pitfall 1: Mastra ↔ AI SDK v6 — now SUPPORTED, but still pin exact
**What goes wrong:** Earlier project research (PITFALLS.md #1) flagged Mastra as v4/v5-only against the repo's `ai@6`. **This is now stale.** **Why it's resolved:** `@mastra/core@1.37.1` ships dual `@ai-sdk/provider-v5` + `@ai-sdk/provider-v6` aliased deps and Mastra 1.0 (stable 2026-01-20) added LanguageModelV3/AI-SDK-v6 support [VERIFIED: npm + mastra.ai changelog]. **Residual risk:** the repo already resolves **two** `ai` versions (6.0.111 and 6.2.2) and two `zod` versions in the lockfile — a Lab install could pull a third or duplicate. **How to avoid:** pin `@mastra/core`/`@mastra/ai-sdk` exact; centralize model calls behind one adapter module; CI-fail if `pnpm why ai` resolves >1 version in Lab packages; pass `version: 'v6'` to all `@mastra/ai-sdk` stream conversions. **Warning signs:** peer warnings naming `ai`; stream deltas in the wrong shape; `@mastra/ai-sdk@1.4.3` peer floor (`@mastra/core >=1.5.0`) mismatching the installed core pin — **verify the matching `@mastra/ai-sdk` build at install** (see Open Questions).

### Pitfall 2: LLM (or schema) smuggles raw JSX/HTML — the concrete vector exists today
**What goes wrong:** A `string`-typed `children`/`content`/`rawHtml` field becomes a JSX smuggling channel; the Core Value collapses. **Why it happens here specifically:** the existing `componentAST.ts` already has `ElementASTNode { tag: string; props; children }` and `astToReact` emits raw `<div>`/`<span>` JSX from it [VERIFIED: codebase]. If the IR or IR→AST mapping reuses `ElementASTNode`, the door is wide open. **How to avoid:** (1) IR schema has **no** field that can carry markup — slots accept only `JioIRComponentInstance[]` or escaped plain-text strings; (2) IR→AST emits only `ComponentASTNode` + `TextASTNode` + a closed, named set of layout-primitive components (Container/Grid/Surface from the registry), **never `ElementASTNode` with an arbitrary tag**; (3) treat any IR string containing `<`/`className`/`style=` as a hard validation failure; (4) ship an adversarial test ("just give me the HTML") asserting the pipeline yields valid IR or a gap report, never markup. **Warning signs:** IR nodes with `componentId: 'raw'`/`'html'`/`'div'`; the compiler needing `dangerouslySetInnerHTML`.

### Pitfall 3: Isolation leakage breaks the existing Builder
**What goes wrong:** A shared-file edit (`surfaceNew.ts`, `componentRegistry.ts`), a repo-wide dep bump, a second tldraw store colliding with `ExperienceCanvas`'s, or wrapping/reordering `FoundationStyleProvider` silently breaks brands/components/themes. **How to avoid:** new code only in `experience-builder-*` + the `(experience-lab)` route; treat ToV/DCA/engine as read-only; pin Lab tldraw independently; scope the Lab editor/store self-contained; never touch `FoundationStyleProvider`; extend eslint `no-restricted-imports` so `(builder)`/`ExperienceCanvas` cannot import `experience-builder-*` and Lab packages cannot deep-import `(builder)` internals; smoke-test the existing Builder route in CI on every Lab PR. **Warning signs:** git diff touches files outside `experience-builder-*`/`(experience-lab)`; `pnpm why tldraw` shows a changed root version.

### Pitfall 4: Validator false negatives (basic validator must still be AST-based)
**What goes wrong:** A regex/substring validator misses aliased imports (`import { Button as X } from 'shadcn'`), inline-style literals, fake `var(--made-up)`, dynamic class names. **How to avoid even in P1's *basic* validator:** operate on the **AST** (parse imports, resolve aliases, walk component types); use **allowlists** — every import path ∈ registry `importPath` set, every component ∈ `jioAlphaCatalog`, every prop/variant ∈ meta; defer the full literal/token scan + red-team corpus to P3 but build the AST-walk skeleton now so P3 extends, not rewrites. **Warning signs:** the validator is regex-only with no parse step.

### Pitfall 5: Registry drift baked into the mock
**What goes wrong:** P1 mock registry shape diverges from real metadata → P2 floods with "valid IR, invalid against real components." CONCERNS.md shows drift **already exists** (`check:metadata` fails on Modal/Text slots; `check:jio-alpha-catalog` has 21 missing slugs; 15 machine-docs drifts). **How to avoid:** derive `JioComponentRegistryItem` from the single existing metadata source (`jioAlphaCatalog` + `componentRegistry` + `@oneui/shared/meta`), not a hand-authored parallel; make the P1 mock production-shaped; exclude known-drift components (Modal, Text) from the generatable set until fixed; defer the freshness CI gate to P2 (REG-04) but shape for it now. **Warning signs:** the Lab registry has fields the real meta lacks.

### Pitfall 6: Foundation resolver invents non-web dimensions
**What goes wrong:** The resolver fabricates a 1080×1080 IG profile + arbitrary type scale (the foundations are web/density/viewport-shaped — `data-Breakpoint`, 3 breakpoints). **How to avoid in P1:** (1) run the **foundation-coverage audit** — enumerate which output profiles Jio foundations actually define vs which the docs assume; document the delta as a first-class gap-report deliverable; (2) `FoundationResolveResult` makes "profile not found" a typed first-class variant that short-circuits to a gap-report card (D-06/FND-03), never a silent default; (3) the output-profile *table* in `-core` holds dimensions/aspect/safe-area/export rules — the one honest new foundation concept — but P1 only needs web + enough structure to prove the gap path. **Warning signs:** resolver returns round numbers (1080) that don't trace to a token; no gap reports ever emitted.

## Code Examples

### IR slot field — markup-free (the IR-02 invariant)
```ts
// Source: derived from PITFALLS #2 + componentAST.ts inspection. ILLUSTRATIVE shape.
// A slot is EITHER child component instances OR escaped plain text — never markup.
const SlotValue = z.union([
  z.array(z.lazy(() => JioIRComponentInstance)),  // nested instances
  z.string(),                                      // escaped text only; validator rejects </< /style=
]);
// FORBIDDEN (do not add): rawHtml, html, tag, dangerouslySetInnerHTML, children:string-of-markup
```

### IR → AST mapping target (no raw element tags)
```ts
// Source: packages/shared/src/types/componentAST.ts (VERIFIED)
// IR component instance → ComponentASTNode ONLY. Layout primitives are REGISTRY components.
// NEVER emit ElementASTNode { tag: 'div' } from the IR compiler — that bypasses the registry.
import type { ComponentASTNode, TextASTNode, ASTRoot } from '@oneui/shared';
```

### Existing renderer enforcement (reuse, don't rebuild)
```tsx
// Source: packages/ui/src/runtime/ASTRenderer.tsx (VERIFIED)
// Per-leaf prop allowlists + FORBIDDEN_LEAF_STYLE_KEYS (width/height/display/position...) are
// stripped before spread — this is part of the DS enforcement the validator complements.
```

### Mastra → AI SDK v6 stream (the boundary; P1 wires the mock through it)
```ts
// Source: STACK.md + mastra.ai/reference/ai-sdk; VERIFIED v6 support
// toAISdkStream(stream, { version: 'v6' }) → createUIMessageStreamResponse → useChat/useObject
// In P1 the workflow emits ExperienceBuilderEvents from MOCK steps over this same transport.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AI SDK `generateObject` / `streamObject` | `streamText`/`generateText` + `Output.object()` | AI SDK 6 stable (2025-12-22) | P2 IR generation uses `Output.object`; do NOT write `generateObject` in new code. [CITED: vercel.com/blog/ai-sdk-6] |
| Mastra supports AI SDK v4/v5 only | Mastra 1.0 supports AI SDK v6 (LanguageModelV3) | Mastra 1.0 GA 2026-01-20 | Lab can use the repo's `ai@6` with Mastra; pin exact. [VERIFIED: mastra.ai changelog + npm dual-provider deps] |
| AG-UI as the event protocol | Internal `ExperienceBuilderEvent` (AG-UI-inspired) | now (AG-UI still pre-1.0 `0.0.54`) | No `@ag-ui/*` dep in P1–P4. |

**Deprecated/outdated:**
- PITFALLS.md #1's "Mastra is v4/v5-only" — **superseded** by Mastra 1.0 v6 support (this session's verification). The pin-exact + single-`ai`-version guidance still stands.
- `generateObject`/`streamObject` (AI SDK) — deprecated in v6.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Exact pins `@mastra/core@1.37.1` + `@mastra/ai-sdk@1.4.3` interoperate cleanly with the repo's `ai@6` | Standard Stack | MEDIUM — install spike may reveal a needed `@mastra/ai-sdk` version whose `@mastra/core` peer floor (`>=1.5.0`) matches; resolve at install. |
| A2 | `@mastra/ai-sdk@1.4.3` is the right companion build for `@mastra/core@1.37.1` | Standard Stack / Pitfall 1 | MEDIUM — peer floor `>=1.5.0 <2.0.0` printed by npm suggests `1.4.3` may NOT be the matching build for `core@1.37`. **Verify `npm view @mastra/ai-sdk versions` and pick the build whose `@mastra/core` peer matches `1.37.1`** before pinning. |
| A3 | Jio foundations do NOT define non-web output profiles (IG/outdoor/slide) | Foundation Resolver / Pitfall 6 | HIGH for P4, LOW for P1 — P1 only needs the gap path; the audit confirms/refutes. |
| A4 | The existing `ComponentASTNode`/`ASTRoot` can represent all IR layout/section/slot constructs the Lab needs | IR↔AST | MEDIUM — if the IR needs a richer layout model than the current AST, IR→AST needs extension (verify against `componentAST.ts` during `-core` build). |
| A5 | A genuinely separate preview origin is deployable in this infra (Vercel) | Preview decision | MEDIUM — decision is P1, build is P3; if only same-origin is possible, the secure-sandbox model must be redesigned. |
| A6 | Mastra runs on the Node runtime in a Next.js route (not Edge) | Mastra Workflow | LOW — well-established; ensure the run route opts out of Edge. |
| A7 | The brand-list read-only query needs no auth that the Lab lacks | INPUT-01 / D-02 | LOW — `brands.ts` is an existing public-ish query behind the site password gate. |

## Open Questions (RESOLVED)

1. **`@mastra/ai-sdk` ↔ `@mastra/core` exact pairing.** npm shows `@mastra/ai-sdk@1.4.3` peers `@mastra/core >=1.5.0 <2.0.0` — but `@mastra/core@1.37.1` is `>=1.5.0`, so `1.4.3` of the *bridge* may be a stale tag. **Recommendation:** at install, run `npm view @mastra/ai-sdk versions --json` and choose the latest `@mastra/ai-sdk` whose published peer range includes `@mastra/core@1.37.1`; pin both exact. This is the single highest-leverage P1 install-spike item. **(RESOLVED — Plan 01-01 Task 1: blocking-human supply-chain checkpoint records the exact `@mastra/core` + `@mastra/ai-sdk` version pair before Plan 01-04 installs.)**
2. **Two `ai` versions already in the lockfile (6.0.111 + 6.2.2).** The Lab's single-version CI gate must define *scope* — likely "within `experience-builder-*` + the Lab route's resolution tree," not repo-wide (the repo already has two). Decide the gate's exact assertion. **(RESOLVED — Plan 01-01 Task 4: gate asserts a single `ai` version within the Lab subtree resolution, not repo-wide.)**
3. **Mastra snapshot storage backend** (libSQL vs Postgres vs Convex-backed). P1 only needs a skeleton; even in-memory is fine for the mock. Decide before P3 HITL. **Recommendation:** defer; note in README. **(RESOLVED — deferred by design: in-memory for P1, documented in the Plan 01-06 LAB-04 README; revisit before P3 HITL.)**
4. **Non-web foundation coverage** — the audit's actual result. **Recommendation:** run as a P1 task; output a `FOUNDATION-COVERAGE.md` listing defined-vs-assumed profiles. **(RESOLVED — Plan 01-06 Task 3 produces FOUNDATION-COVERAGE.md listing defined-vs-assumed profiles.)**
5. **Separate preview origin feasibility on Vercel** — distinct subdomain/deployment vs `srcdoc`+CSP. **Recommendation:** document the decision (separate origin, `/internal/render-ast` token-handoff basis) in P1; security review in P3. **(RESOLVED — Plan 01-06 Task 3 produces PREVIEW-DECISION.md documenting the separate-origin model; security review deferred to P3.)**

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | Mastra runtime, build | ✓ | v20.19.5 (repo requires >=20) | — |
| pnpm + Turborepo workspace | All packages | ✓ | pnpm 9.x | — |
| tldraw | Canvas (CANVAS-01..04) | ✓ | 4.5.3 (in repo) | — |
| `ai` / `@ai-sdk/*` | Model layer (P2; boundary now) | ✓ | ai 6.0.111/6.2.2, anthropic 3.0.54, react 3.0.113 | — |
| `zod` | IR schema | ✓ | 4.3.6 (satisfies Mastra peer) | — |
| `convex` | runs/IR persistence (VER-03) | ✓ | 1.39.1 | — |
| `@mastra/core` | orchestration | ✗ (not installed) | target 1.37.1 | None — net-new install (gated by checkpoint). |
| `@mastra/ai-sdk` | stream bridge | ✗ (not installed) | target — verify pairing | None — net-new install. |
| `ANTHROPIC_API_KEY` | real model calls | ✓ (env, used by existing agents) | — | P1 mock path needs none. |
| slopcheck | package legitimacy audit | ✗ | — | All Mastra pkgs `[ASSUMED]`; planner gates with `checkpoint:human-verify`. |

**Missing dependencies with no fallback:** `@mastra/core`, `@mastra/ai-sdk` — net-new installs; both required to wire even the mock workflow over the AI-SDK stream transport.
**Missing dependencies with fallback:** model API key (mock path needs none in P1); slopcheck (degrade to `[ASSUMED]` + human-verify checkpoint).

## Validation Architecture

> `nyquist_validation` config key not located in `.planning/config.json` during this session (file may be absent); per spec, treated as **enabled**. Section included so a VALIDATION.md can be derived.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (all packages); `vitest-axe` for a11y; Playwright for E2E/visual (P3+) |
| Config file | New per-package `vitest.config.ts` for each `experience-builder-*` (node env for `-core`/`-validation`/`-registry`/`-agents`; jsdom for the route's component tests) — Wave 0 |
| Quick run command | `pnpm --filter @oneui/experience-builder-core test` (and per package) |
| Full suite command | `pnpm test` (turbo, all packages) + `pnpm ci:gates` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| IR-01/IR-04 | Valid IR parses; required fields enforced (type, profile, brand, foundationRefs, sections, instances, content, a11y, status) | unit | `pnpm --filter @oneui/experience-builder-core test` | ❌ Wave 0 |
| IR-02 | **No markup field anywhere**; adversarial "give me HTML" → valid IR or gap, never markup | unit (red-team fixture) | core `ir/schema.test.ts` | ❌ Wave 0 |
| IR-03 | IR↔AST round-trips to `ComponentASTNode`/`TextASTNode` (no `ElementASTNode`); JSON-patch diff/apply | unit | core `ir/irToAst.test.ts`, `ir/patch.test.ts` | ❌ Wave 0 |
| FND-01/FND-03 | Mock resolver returns `ThemeConfig`-shaped result OR typed gap report | unit | agents/validation resolver test | ❌ Wave 0 |
| REG-01/02/03 | `queryRegistry()` returns production-shaped items; unregistered component → gap | unit | registry test | ❌ Wave 0 |
| VAL-01/02/03 | AST validator blocks non-Jio imports + unregistered components; returns `JioValidationResult` | unit | validation test (allowlist fixtures) | ❌ Wave 0 |
| ORCH-01/03/04 | Mock workflow runs end-to-end; emits `ExperienceBuilderEvent`s; no orchestration logic in AI-SDK callbacks | integration | agents workflow test | ❌ Wave 0 |
| GEN-08 | Mock generation → valid IR (passes IR schema + basic validator) | integration | agents `mockGeneration.test.ts` | ❌ Wave 0 |
| VER-03 | Run + IR persist to `experience*` Convex tables | integration | convex test / route test | ❌ Wave 0 |
| LAB-01/CANVAS-01/02/04 | Lab route renders; prompt card creatable; artifact card appears | component (jsdom) + manual UAT | route component tests | ❌ Wave 0 |
| LAB-03 | Existing Builder still boots; no `experience-builder-*` import from `(builder)`; single `ai` version | CI gate | eslint import guard + `(builder)` smoke test + `pnpm why ai` check | ❌ Wave 0 |
| LAB-02 | Lab UI is token-only Jio CSS | CI gate | `pnpm check:literals`, `check:layers`, `validate:tokens` (extend scope to Lab) | ✓ (gates exist; scope to Lab) |

### Sampling Rate
- **Per task commit:** the affected package's `pnpm --filter @oneui/experience-builder-<pkg> test`
- **Per wave merge:** `pnpm test` (turbo) + the LAB-03 isolation CI gate
- **Phase gate:** `pnpm ci:gates` green + existing-Builder smoke test + `pnpm why ai` single-version + manual UAT of the walking skeleton before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `packages/experience-builder-core/vitest.config.ts` + `src/ir/*.test.ts` — IR schema, IR↔AST, patch (IR-01..04)
- [ ] `packages/experience-builder-validation/*.test.ts` — AST allowlist fixtures incl. aliased-import red-team seed (VAL-01..03)
- [ ] `packages/experience-builder-registry/*.test.ts` — production-shape conformance + membership (REG-01..03)
- [ ] `packages/experience-builder-agents/*.test.ts` — mock workflow + event emission (ORCH-01/03/04, GEN-08)
- [ ] `apps/platform/(experience-lab)` component tests (jsdom) — route boots, prompt/artifact cards (LAB-01, CANVAS-01/02/04)
- [ ] **Isolation CI:** eslint `no-restricted-imports` Lab↔Builder rule + existing-Builder smoke test + `pnpm why ai` gate (LAB-03)
- [ ] Extend `check:literals`/`check:layers`/`validate:tokens` scope to the Lab route + packages (LAB-02)
- [ ] Adversarial "give me HTML" fixture asserting no-markup invariant (IR-02)

## Security Domain

> `security_enforcement` config not located this session; treated as enabled. P1 has limited attack surface (no untrusted code execution yet — preview is P3), but two items matter now.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V1 Architecture | yes | Isolation-by-package; one-way dependency graph; preview separate-origin **decision** documented now. |
| V4 Access Control | partial | Lab behind existing site-password middleware; brand query read-only. |
| V5 Input Validation | yes | `zod@4` IR schema + AST allowlist validator are the input-validation boundary. The IR is untrusted LLM output (from P2) — validate before compile. |
| V12 / sandboxing (preview) | decided P1, built P3 | Separate origin, `allow-scripts` WITHOUT `allow-same-origin`, strict CSP + `frame-ancestors`, `postMessage` origin checks, zero auth/Convex tokens in preview, credential-free Playwright workers. Basis: `/internal/render-ast` server-side token handoff. |
| Supply chain | yes | Mastra packages `[ASSUMED]` → `checkpoint:human-verify` before install; verify postinstall scripts; single `ai` version gate. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Raw JSX/HTML smuggled through IR (`ElementASTNode`/`rawHtml`) | Tampering / Elevation | Markup-free IR schema; IR→AST emits only registry components + text; AST validator rejects markup strings (Pitfall 2). |
| Non-Jio import / unregistered component in output | Tampering | AST import-allowlist + registry membership (basic validator P1, full P3). |
| Isolation leakage breaking the existing Builder | Denial of Service (to existing app) | eslint import guard + existing-Builder smoke test + no repo-wide dep bumps (Pitfall 3). |
| Preview iframe reaching auth/Convex token | Information Disclosure | Separate origin, no `allow-same-origin`, no secrets in preview (decided P1; built P3). |
| Malicious/slopsquatted Mastra-adjacent package | Supply chain | Human-verify checkpoint + postinstall inspection before install. |

## Sources

### Primary (HIGH confidence)
- Existing codebase, direct inspection (this session): `packages/shared/src/types/componentAST.ts` (the `ElementASTNode` raw-tag vector), `packages/shared/src/codegen/astToReact.ts`, `packages/ui/src/runtime/ASTRenderer.tsx` (prop allowlists + forbidden style keys), `packages/ui/src/registry/jioAlphaCatalog.ts`, `packages/ui/src/registry/componentRegistry.ts`, `apps/platform/src/app/internal/render-ast/page.tsx` (server-side token handoff), `apps/platform/src/design-tools/ExperienceCanvas/{ComponentShape,OneUIFrameShapeUtil}.tsx`, `packages/convex/convex/schema.ts` (table inventory), `eslint.config.mjs` (`no-restricted-imports`), `pnpm-lock.yaml` (ai 6.0.111+6.2.2, zod 3+4, tldraw 4.5.3).
- npm registry (this session, 2026-05-30): `@mastra/core@1.37.1` (peer `zod ^3.25||^4.0`; deps include `@ai-sdk/provider-v5` + `@ai-sdk/provider-v6` aliases), `@mastra/ai-sdk@1.4.3` (peer `@mastra/core >=1.5.0 <2.0.0`), `mastra@1.10.2`.
- Project planning artifacts: `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `phases/01-isolated-foundation/01-CONTEXT.md`.
- Project research: `.planning/research/{SUMMARY,ARCHITECTURE,STACK,PITFALLS}.md`; codebase maps `{STRUCTURE,CONCERNS,INTEGRATIONS,TESTING}.md`.
- `CLAUDE.md` — zero-literal/token rules, Surface Context mandate, Typography V2, isolation note.

### Secondary (MEDIUM confidence)
- mastra.ai changelog 2026-01-20 + Mastra 1.0 announcement — AI SDK v6 / LanguageModelV3 / ToolLoopAgent support [WebSearch, cross-checked against npm dual-provider deps].
- vercel.com/blog/ai-sdk-6 — `Output.object` replaces deprecated `generateObject` (via project STACK.md).

### Tertiary (LOW confidence — needs validation)
- Exact `@mastra/ai-sdk` build matching `@mastra/core@1.37.1` peer floor — verify at install (Open Question 1).
- Non-web Jio foundation coverage — P1 audit deliverable (A3).

## Metadata

**Confidence breakdown:**
- Standard stack / Mastra compatibility: HIGH — verified live against npm (dual provider-v5/v6 deps) + Mastra changelog; one residual pairing question flagged.
- Architecture / reuse map / isolation: HIGH — grounded in direct file inspection; `ElementASTNode` markup vector confirmed in source.
- IR↔AST fidelity: MEDIUM — current AST may need a richer layout model (A4); resolve during `-core` build.
- Foundation coverage (non-web): MEDIUM — audit not yet run (A3); P1 only needs the gap path.
- Pitfalls: HIGH for the four front-loaded (Mastra, raw-JSX, isolation, validator); MEDIUM for forward-looking preview/foundation items.

**Research date:** 2026-05-30
**Valid until:** ~2026-06-13 (14 days — Mastra is on pre-2.0 velocity; re-verify the exact pin pairing if planning slips).
