# Stack Research

**Domain:** Mastra-orchestrated, IR-based, design-system-constrained AI generation system added to an existing Next.js 15 + React 19 + Vercel AI SDK v6 + Convex + tldraw monorepo (Jio AI Experience Builder Lab)
**Researched:** 2026-05-30
**Confidence:** HIGH for Mastra + AI SDK v6 boundary (verified against official docs + npm). MEDIUM for AG-UI adoption recommendation and sandbox/Playwright topology (verified concepts, integration is project-specific).

## Overview

This is a **subsequent milestone** layered onto an existing brownfield monorepo. Almost the entire runtime stack is **reused, not chosen**: Next.js 15, React 19, TypeScript 5.7, pnpm 9 + Turborepo, Convex, tldraw 4.5, and the Vercel AI SDK v6 model layer (`ai@^6`, `@ai-sdk/anthropic@^3`, `@ai-sdk/react@^3`). The repo also already ships the pieces most "AI UI generator" projects have to invent from scratch: an AST/IR → React compiler (`@oneui/shared/codegen` + `ASTRenderer` + `COMPONENT_REGISTRY` with per-leaf prop allow-lists), sandboxed render routes (`/internal/render-ast`, `/internal/render-code`), a component registry with machine-readable metadata (`ComponentName.meta.ts`), and two working agents (ToV `api/voice`, Design/Composition `api/composition`) built on the same compiler/validator/critique/repair pattern this project wants.

The **one genuinely new dependency** is **Mastra** as the orchestration layer. Everything else is integration work or thin additions (a Zod IR schema package, an event-stream model, an isolated tldraw shell, a Playwright eval worker). The single most important architectural decision to get right is the **Mastra ↔ Vercel AI SDK boundary**: Mastra owns the agent graph, workflow sequencing, shared state, step retries, repair loops, suspend/resume (human-in-the-loop), and observability; the AI SDK remains the model-interaction layer (calls, streaming, structured output, tool-call wire format, React hooks). This boundary is well-supported as of Mastra 1.x — Mastra is itself built on top of the Vercel AI SDK, so they are designed to compose rather than compete.

A second decision: the existing **IR→React compile path is the model to extend, not replace**. The MVP spec's "A2UI-like principles" and "Jio Experience IR" map directly onto the repo's existing `ASTNode` → `ASTRenderer` → registry-validated React flow. The recommendation below treats the Jio Experience IR as a higher-level, Zod-validated superset of the existing AST, compiled down through the existing renderer.

## Recommended Stack

### Core Technologies (NEW for this milestone)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `mastra` (CLI) | `1.10.2` (latest) | Scaffolding + local dev playground / studio | Official installer; `create-mastra` wires the bundler, dev server, and observability. Verified on npm 2026-05-30. |
| `@mastra/core` | `1.37.1` (latest) | Agent + workflow + tool + step primitives; `Mastra` root instance | The orchestration brain. Provides `createWorkflow`/`createStep` (with `.then`/`.branch`/`.dountil`/`.parallel`), agents, tools, suspend/resume snapshots for HITL, step retries. **Mastra 1.0 added full AI SDK v6 support** (LanguageModelV3, ToolLoopAgent). Verified via Context7 `/mastra-ai/mastra` + npm. |
| `@mastra/ai-sdk` | `1.4.3` (latest) | Bridge between Mastra agent/workflow streams and AI SDK UI (`useChat`/`useObject`/`useCompletion`) | Provides `handleChatStream`, `toAISdkStream(stream, { version: 'v6' })`, and route handlers that emit AI-SDK-compatible streams. This is the **clean, first-party way to stream Mastra output to a React/Next frontend** without hand-rolling a protocol. Verified via Context7 + npm. |
| `@mastra/observability` + `@mastra/otel-bridge` | latest | Tracing/observability hooks for agents, workflows, tools, repair loops | First-party OpenTelemetry bridge — satisfies the spec's "observability hooks where available" requirement and integrates with existing OTel exporters (P5 cost/observability). Verified via Context7. |
| `zod` | `^4.3.6` (**already in repo**) | Jio Experience IR schema + AI SDK structured-output schema + Mastra step `inputSchema`/`outputSchema`/`resumeSchema`/`suspendSchema` | One schema library across the whole stack. Mastra steps and AI SDK `Output.object()` both consume Zod natively. Already a production dependency — do not add a second validator. |

### Reused Core (DO NOT re-choose — already in repo)

| Technology | Version (in repo) | Role in this milestone |
|------------|-------------------|------------------------|
| `ai` (Vercel AI SDK core) | `^6.0.111` (npm latest `6.0.193`) | **Model layer only.** Use `streamText`/`generateText` + `Output.object()` for IR generation; `tool()` for tool defs; `createUIMessageStream`/`createUIMessageStreamResponse` for the response wire format Mastra streams into. |
| `@ai-sdk/anthropic` | `^3.0.54` (npm latest `3.0.81`) | Claude model provider passed to Mastra agents (`claude-sonnet-4-6` per `packages/shared/src/agent/models.ts`). |
| `@ai-sdk/react` | `^3.0.113` | `useChat` / `useObject` hooks on the Lab frontend, fed by `@mastra/ai-sdk` route handlers. |
| `tldraw` | `^4.5.3` | Canvas. New **isolated** Lab canvas shell (separate from `ExperienceCanvas`), reusing existing shape/custom-shape patterns. |
| `convex` | `^1.39.1` | Single source of truth for artifacts, versions, generation runs, foundation profiles, registry items, validation/eval results (spec §16 data model). |
| `@oneui/shared/codegen` + `ASTRenderer` + `COMPONENT_REGISTRY` | in repo | The IR→React compiler to **extend**, not replace. Per-leaf prop allow-lists already block LLM-injected props — reuse as the lowest IR-compile layer. |
| `/internal/render-ast`, `/internal/render-code` | in repo | Existing sandboxed render routes — the starting point for the P3 iframe preview origin. |
| `playwright` | `^1.59.1` (devDep, `apps/qa-playground`, `apps/button-figma-validation`) | Screenshot/visual-eval worker for P3/P4. Already configured with `@axe-core/playwright` for a11y scoring. |

### Supporting Libraries (NEW, add only when the relevant phase arrives)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@ag-ui/core` / `@ag-ui/client` | `0.0.x` (pre-1.0, `0.0.54`) | AG-UI typed event protocol over SSE | **Optional / P5.** See "AG-UI decision" below — recommend an **internal event model** for P1–P4, adopt AG-UI types only if you need interop with CopilotKit or external agent UIs. Pre-1.0 version is a risk flag. |
| `@mastra/otel-exporter` + `@opentelemetry/exporter-trace-otlp-http` | latest | Ship traces to an external collector | P5 observability/cost tracking. |
| Playwright server-side worker (Convex action / Node route, not a new lib) | — | Render iframe preview → screenshot → feed Visual Evaluator | P3. Use existing Playwright; run as a separate worker/route, not in the Next.js request path. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `create-mastra` (via `npx mastra@latest`) | Scaffold the Mastra instance | Generates `src/mastra/index.ts` (the `Mastra` root), `agents/`, `workflows/`, `tools/`. Adapt output into a new isolated package (e.g. `packages/experience-builder-agents`) to honour the isolation constraint. |
| Mastra dev playground (`mastra dev`) | Local agent/workflow inspection, run suspended workflows, view traces | Useful during P1–P3 to test the workflow skeleton and repair loop without the full Lab UI. Keep it dev-only. |
| ts-morph / `@babel/parser` (**already in repo**) | Validate generated source (no Tailwind / no non-Jio imports / no literals) | The Compliance Validator should reuse the repo's existing AST analysis + `pnpm check:literals` machinery rather than regex. |

## Installation

```bash
# NEW core orchestration (run in the isolated agents package, e.g. packages/experience-builder-agents)
pnpm add @mastra/core@latest @mastra/ai-sdk@latest

# Observability (P5, optional earlier for dev tracing)
pnpm add @mastra/observability@latest @mastra/otel-bridge@latest

# Scaffolding / dev only
pnpm add -D mastra@latest

# AG-UI types — ONLY if adopting the protocol (see decision below); otherwise skip
# pnpm add @ag-ui/core @ag-ui/client

# Everything else (ai, @ai-sdk/*, zod, tldraw, convex, playwright) is ALREADY installed — do not re-add.
```

> Version pinning note: the repo currently pins `ai@^6.0.111`; npm latest is `6.0.193`. Mastra 1.x requires AI SDK v6 (`LanguageModelV3`). Confirm the resolved `ai` version is ≥ the minimum `@mastra/core@1.37` peer-requires before wiring agents — a minor bump of `ai` may be needed. Run `pnpm why ai` and check `@mastra/core` peer deps after install. (Flagged as the one compatibility item to verify hands-on.)

## Mastra ↔ Vercel AI SDK Boundary (the decision that matters most)

Mastra is **built on top of** the Vercel AI SDK — they compose by design. The split:

| Concern | Owner | Concrete primitive |
|---------|-------|--------------------|
| Agent definitions (instructions, model, tools, memory) | **Mastra** | `new Agent({ model, instructions, tools })` / `ToolLoopAgent` |
| Workflow sequencing (the 13-agent pipeline in spec §11) | **Mastra** | `createWorkflow().then().branch().dountil().parallel().commit()` |
| Shared workflow state across steps | **Mastra** | step `inputSchema`/`outputSchema`, `RequestContext` |
| Step retries | **Mastra** | per-step retry config |
| Repair loops (validate → repair → recompile → re-validate) | **Mastra** | `.dountil(condition)` around the validate/repair steps |
| Human-in-the-loop checkpoints | **Mastra** | `suspend()` / `resume()` + persisted snapshots (`resumeSchema`/`suspendSchema`) |
| Observability / tracing | **Mastra** | `Observability` + `OtelBridge` |
| Persistence of in-flight runs | **Mastra** | snapshots (back them with Convex or Mastra storage) |
| Raw model calls + streaming | **AI SDK** | `streamText` / `generateText` |
| **Structured IR generation** | **AI SDK** | `streamText`/`generateText` + `Output.object({ schema: JioExperienceIR })` |
| Tool-call wire format | **AI SDK** | `tool({ inputSchema, execute })` |
| Streaming to the React frontend | **AI SDK UI** via `@mastra/ai-sdk` bridge | `handleChatStream` / `toAISdkStream(stream, { version: 'v6' })` → `createUIMessageStreamResponse` → `useChat`/`useObject` |

**Hard rule for this project (from PROJECT.md and both spec docs):** the AI SDK is NEVER the orchestration brain. No multi-agent sequencing, no repair loop, and no HITL logic should live in AI SDK `streamText` step callbacks. Those belong in Mastra workflow definitions. The AI SDK appears only *inside* a Mastra agent's model config or *inside* a Mastra tool's `execute`.

### Structured output: use `Output.object`, not `generateObject` (VERIFIED, important)

In **AI SDK v6 (stable, published 2025-12-22)** the standalone `generateObject`/`streamObject` helpers are **deprecated** and slated for removal. The v6 idiom unifies structured output into `generateText`/`streamText` via the `Output` family:

- `Output.object({ schema })` — single structured object (use for one Jio Experience IR)
- `Output.array({ schema })` — arrays (use for carousel frames / variant sets / 3 creative directions)
- `Output.choice(...)` — pick a predefined option (use for artifact-type / output-profile classification in the Intent Agent)

For Anthropic, the SDK implements structured output via a single-tool `tool_use` pattern under the hood; for IR reliability, pair it with: (1) a tight Zod schema, (2) explicit registry-driven enums for `componentId`/`importPath` so the model can only pick approved components, and (3) the existing repair loop to heal invalid IR. Roadmap any code that says "use generateObject" as **use `Output.object` with `streamText`/`generateText`** instead.

## Integration Notes

1. **Isolation packaging.** Per PROJECT.md, create `packages/experience-builder-{core,agents,registry,validation,preview,export}` + an isolated `apps/platform` route. The Mastra `Mastra` root instance lives in `experience-builder-agents`; the IR Zod schema in `experience-builder-core`. Do not touch `ExperienceCanvas` or `(builder)` routes.

2. **Reuse the existing agents as Mastra tools, don't reimplement.** The ToV (`api/voice`) and Design/Composition (`api/composition`) agents already exist with compile/generate/critique/repair/eval endpoints. Wrap each as a Mastra **tool** (`tool({ inputSchema, execute })`) that calls the existing API contract. This satisfies "integrate the existing agents via clean contracts" without forking working code.

3. **IR → React compile reuses `ASTRenderer` + `COMPONENT_REGISTRY`.** The Jio Experience IR (Zod) compiles down to the existing `ASTNode` tree, which the existing renderer maps to real components with per-leaf prop allow-lists. This is the A2UI "renderer maps abstract components to concrete implementations" pattern the repo already implements — extend it, don't introduce Google's A2UI renderer (different component vocabulary, would bypass the Jio registry).

4. **Streaming topology.** Next.js route handler → `@mastra/ai-sdk` `handleChatStream` / workflow stream → `createUIMessageStreamResponse` → `useChat`/`useObject` on the Lab UI. Project the workflow's lifecycle events (`workflow.started`, `agent.started`, `ir.created`, `canvas.patch`, …) onto this stream so the tldraw canvas updates live.

5. **Sandboxed preview (P3).** Render generated React in an iframe served from a **separate origin** (or `sandbox`-attribute iframe without `allow-same-origin` so it gets an opaque origin). Send a per-iframe `Content-Security-Policy` (`frame-src`/`frame-ancestors`); never combine `allow-scripts` + `allow-same-origin` on the same sandbox (that defeats isolation). Generated code must have **no access to Convex auth/session** — enforce via opaque origin + `postMessage` with strict target-origin + sender validation. Build on the existing `/internal/render-*` routes but move them to an isolated preview origin. Use immutable, version-keyed preview URLs (spec §15).

6. **Playwright eval worker (P3/P4).** Run Playwright **out of band** (a worker / Convex action / dedicated Node route), not inside the Next.js request lifecycle: load the immutable preview URL → screenshot per output profile → hand pixels to the Visual Evaluator agent. Reuse existing `@axe-core/playwright` for the a11y dimension of the eval score.

7. **AG-UI decision.** As of 2026, Mastra does **not** ship a stable first-party AG-UI adapter package; the documented Mastra→AG-UI path is custom SSE plumbing (manually emitting `RUN_STARTED`/`TEXT_MESSAGE_CONTENT`/`STATE_DELTA`). AG-UI (`@ag-ui/*`) is also still **pre-1.0** (`0.0.54`). **Recommendation: build the internal `ExperienceBuilderEvent` model from the spec (§4.3) for P1–P4** — it is exactly what `@mastra/ai-sdk` streaming + a small typed reducer on the canvas needs, with zero protocol risk. Keep event *names/shapes* AG-UI-inspired so a future AG-UI/CopilotKit adapter is a thin mapping if external-frontend interop is ever needed (P5).

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Mastra for orchestration | Vercel AI SDK agent loop only (`ToolLoopAgent`) | Only if the workflow were a single-agent tool loop. Rejected: spec requires a 13-stage graph, repair loops, HITL suspend/resume, and shared state — that is Mastra's job, and PROJECT.md forbids AI SDK as the orchestration brain. |
| Mastra workflows | LangGraph / CrewAI / Temporal / Inngest | Mastra is TypeScript-native, AI-SDK-native, and already aligns with the chosen model layer. LangGraph is Python-first; Temporal/Inngest are heavier general-purpose orchestrators without agent primitives. Use Inngest/Trigger.dev later only if you outgrow Mastra snapshots for long-running durable runs (P5). |
| `Output.object` (AI SDK v6) | `generateObject`/`streamObject` | Deprecated in v6 — do not use in new code. |
| Internal `ExperienceBuilderEvent` model | AG-UI protocol (`@ag-ui/*`) | Adopt AG-UI only when you need to plug an external/3rd-party agent frontend (e.g. CopilotKit) — P5+. Pre-1.0; not worth the dependency for P1–P4. |
| Extend existing `ASTRenderer`/registry | Google A2UI React renderer | A2UI is a good *mental model* but uses a generic component vocabulary; adopting its renderer would bypass the Jio registry + prop allow-lists that enforce the Core Value. Borrow the flat-adjacency, streaming, ID-addressable IR *ideas*, not the runtime. |
| Reuse `zod@4` | Add Valibot / ArkType | One schema lib already powers AI SDK + Mastra + the repo. No reason to add another. |
| Reuse Convex for state/persistence | Postgres + S3 + pgvector (spec §7 generic suggestion) | Spec §7 lists generic options "or existing" — the repo's existing Convex is the answer for DB, real-time, and run/version persistence. |

## What NOT to Use

- **Tailwind / utility CSS / external visual component kits** — in BOTH the Lab UI and all generated artifacts. Hard Core-Value violation; the Compliance Validator must block these (no `tailwind`, no non-Jio visual imports, no unregistered components, no literals).
- **`generateObject` / `streamObject`** — deprecated in AI SDK v6. Use `streamText`/`generateText` + `Output.object()`.
- **Vercel AI SDK as the orchestration layer** — explicitly forbidden by PROJECT.md. It is the model layer only.
- **A second canvas / forking `ExperienceCanvas`** — build an isolated tldraw shell; do not modify the existing Builder.
- **`allow-scripts` + `allow-same-origin` together on the preview iframe** — defeats sandboxing; an attacker can remove the sandbox. Use opaque-origin sandbox or a separate origin.
- **AG-UI (`@ag-ui/*`) as a P1 dependency** — pre-1.0, no stable Mastra adapter; use the internal event model first.
- **Inventing tokens/components/dimensions/type-scales** when a Jio foundation value exists — emit a Jio system/foundation gap report instead (spec §2, §8).
- **Running Playwright inside the Next.js request path** — run it as an out-of-band worker.

## Open Questions / Flags for Validation

1. **`ai` version bump** — confirm `@mastra/core@1.37` peer-deps are satisfied by the repo's pinned `ai@^6.0.111` (npm latest `6.0.193`). A minor `ai` bump may be required. HIGH-impact, easy to verify with `pnpm why ai` post-install. *(Could not verify exact peer range without installing.)*
2. **Mastra snapshot storage backend** — Mastra persists suspend/resume snapshots; decide whether to back them with Mastra's own storage or with Convex (preferred for single-source-of-truth + the spec §16 `generation_runs` table). Needs a phase-specific spike.
3. **Edge vs Node runtime** — Mastra + Playwright + OTel need the Node runtime; ensure the Lab's API routes opt out of Edge. (Convex functions are separate.)
4. **Structured-output reliability with Anthropic + large IR** — Anthropic structured output goes through `tool_use`; very large Jio Experience IR objects may need streaming (`streamText` + `Output.object`) + the repair loop rather than one-shot `generateText`. Validate empirically in P2.
5. **AG-UI maturity by P5** — re-check `@ag-ui/*` for a 1.0 + first-party Mastra adapter before committing to it for external-frontend interop.

## Sources

- Context7 `/mastra-ai/mastra` — workflows (`createWorkflow`/`createStep`, suspend/resume snapshots, `bail`), Next.js integration (`handleChatStream`, `toAISdkStream` v6), observability (`@mastra/observability`, `@mastra/otel-bridge`). HIGH.
- npm registry (`npm view`, 2026-05-30) — `mastra@1.10.2`, `@mastra/core@1.37.1`, `@mastra/ai-sdk@1.4.3`, `ai@6.0.193`, `@ai-sdk/anthropic@3.0.81`, `@ag-ui/core@0.0.54`. HIGH (live versions).
- https://vercel.com/blog/ai-sdk-6 — AI SDK 6 stable 2025-12-22; `Output.object/array/choice/json/text`; `ToolLoopAgent`/`Agent`; unification of `generateObject` into `generateText`. HIGH (official).
- https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk + Mastra changelog 2026-01-20 — Mastra built on Vercel AI SDK; v6 support, `version: 'v6'` conversion. HIGH (official).
- https://github.com/mastra-ai/mastra/issues/10602 + npm `@mastra/ai-sdk` — AI SDK v6 support status. MEDIUM-HIGH.
- https://www.copilotkit.ai/ag-ui + https://www.copilotkit.ai/blog/how-to-add-a-frontend-to-any-mastra-agent-using-ag-ui-protocol — AG-UI = event-based SSE protocol; Mastra integration is custom SSE plumbing, no stable first-party adapter. MEDIUM.
- https://developers.googleblog.com/a2ui-v0-9-generative-ui/ + https://a2ui.org/ — A2UI flat-adjacency, streaming, ID-addressable IR; renderer-maps-abstract-to-concrete pattern. MEDIUM (concept reference, not adopted as runtime).
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/sandbox + iframe-sandbox security articles — opaque-origin sandbox, never `allow-scripts`+`allow-same-origin`, CSP `frame-src`/`frame-ancestors`, postMessage origin validation. MEDIUM-HIGH.

---
*Stack research for: Mastra-orchestrated IR-based AI generation in an existing Next.js 15 / AI SDK v6 / Convex / tldraw monorepo*
*Researched: 2026-05-30*
