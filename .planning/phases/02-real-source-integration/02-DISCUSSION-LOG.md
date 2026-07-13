# Phase 2: Real Source Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-31
**Phase:** 02-real-source-integration
**Areas discussed:** Pipeline & planner, Agent wiring, IR-gen & compiler, Foundation gaps

---

## Pipeline & planner

### IR Generator position

| Option | Description | Selected |
|--------|-------------|----------|
| Assembler-last | Planner → Design → ToV emit a structured spec; IR Generator is a final LLM step assembling valid IR via `Output.object()`. Agents advise; IR-gen commits. | ✓ |
| IR-gen drives | IR Generator is the spine and calls ToV/Design/planner as tools mid-generation (agentic loop). | |
| Design produces IR | Fold IR generation into the Design/Composition agent; ToV fills copy after. | |

**User's choice:** Assembler-last.

### GEN-04 UX/flow planner

| Option | Description | Selected |
|--------|-------------|----------|
| New LLM agent | Net-new lightweight planner agent outputting a structured plan (sections, hierarchy, CTA, screen count) feeding Design + ToV. | ✓ |
| Deterministic step | Non-LLM planning from artifact-type templates + output profile. | |
| Fold into Design | Let the Design agent own flow + hierarchy + layout in one step. | |

**User's choice:** New LLM agent.

### Artifact-type scope

| Option | Description | Selected |
|--------|-------------|----------|
| Web only | Target web-ui end-to-end; everything else gap-reports. | |
| Web + app/dashboard | Build app-screen + dashboard as first-class P2 targets too. | |
| Whatever resolves | Coverage-driven; any profile resolving to real coverage generates. | ✓ (free-text) |

**User's choice:** Whatever resolves (via free text).
**Notes:** User reframed the premise: "Normally our foundations cover any use case... for any dimension the type scale should adapt. That's the logic of our foundations overall." So coverage is platform/dimension-driven, not a fixed blessed-type list. "So far we keep whatever results." Print support (e.g. CMYK/spot color for print) flagged as a possible future addition.

---

## Agent wiring

### Invocation surface

| Option | Description | Selected |
|--------|-------------|----------|
| Direct engine import | Mastra tools import `voiceCompiler`/`compositionCompiler` and call in-process. | |
| Call HTTP routes | Mastra tools fetch `/api/voice/*` and `/api/composition/*`. | |
| Thin adapter pkg | Wrap engine functions behind a Lab-owned typed interface in `experience-builder-agents`. | ✓ (free-text) |

**User's choice:** Thin typed adapters (via free text), plus a directive to use Mastra-native platform features rather than hand-rolling: Workflows as the spine, agents/tools in steps, Observability for traces/validation/quality/debug, Response Caching for repeatable steps, Background Tasks/streaming for long runs, Workspaces/Sandbox providers for safe execution/preview.

### Which Mastra capabilities are in P2

| Option | Description | Selected |
|--------|-------------|----------|
| Response caching | Cache repeatable planner/ToV/Design steps with identical inputs. | ✓ |
| Run tracing | Basic Observability traces per workflow step (full dashboard stays P5). | ✓ |
| Background + streaming | Long runs as background tasks with streamed progress (extends P1 NDJSON stream). | ✓ |
| Sandbox / Workspaces | Safe execution/preview of generated code. | (deferred to P3) |

**User's choice:** Response caching, Run tracing, Background + streaming.
**Notes:** Sandbox/Workspaces deferred to P3 (separate-origin preview work). Claude flagged: verify all Mastra feature availability/naming against pinned `@mastra/core@1.37.1` + `@mastra/ai-sdk@1.4.3`; must not break the single-`ai`-version gate or the AI-SDK-model-layer-only boundary.

---

## IR-gen & compiler

### Retry / repair boundary

| Option | Description | Selected |
|--------|-------------|----------|
| In-gen retry only | Re-prompt the model with the Zod/validator error (≤~3 tries); else error/gap. P3's eval-driven repair loop is separate. | ✓ |
| No retry in P2 | Single structured-output call; any failure surfaces immediately; all retry waits for P3. | |
| Unify with P3 loop | Build the bounded repair loop now and route invalid-IR through it. | |

**User's choice:** In-gen retry only.

### Compiler output

| Option | Description | Selected |
|--------|-------------|----------|
| Codegen string | Emit React + Jio CSS as a string (astToReact/astToPage); durable/exportable/sandbox-feedable. | |
| Runtime render | Hand the AST to ASTRenderer for live in-app render only. | |
| Both | Emit codegen string (durable) AND keep an AST-render path for quick checks. | ✓ |

**User's choice:** Both.
**Notes:** Claude locked the disambiguation: the codegen string is the CANONICAL persisted bundle (P3 sandboxes it, P5 exports it); the AST runtime render is ephemeral internal-convenience only — never persisted, never the export source. IR stays the single source of truth.

### GEN-06 acceptance in P2

| Option | Description | Selected |
|--------|-------------|----------|
| Typecheck + validator | Compile to string, typecheck it, re-run the AST allowlist validator, stable snapshot. No DOM. | ✓ |
| + ephemeral AST render | Above + a jsdom render-without-throwing check. | |
| Snapshot only | Just snapshot-test the codegen string. | |

**User's choice:** Typecheck + validator (+ stable snapshot). Real-DOM render stays P3.

---

## Foundation gaps

### Partial-brand coverage

| Option | Description | Selected |
|--------|-------------|----------|
| System defaults fill | Use configured foundations; engine system defaults fill the rest (as the live engine already does). Gap = genuinely unresolvable, not "used a default". | ✓ |
| Gap on any missing | Treat any unconfigured foundation type as a coverage gap. | |
| Require complete | Only allow brands with all foundation types configured. | |

**User's choice:** System defaults fill.

### REG-04 freshness gate

| Option | Description | Selected |
|--------|-------------|----------|
| Derive, don't copy | Registry derives entirely from `@oneui/shared/meta/generated`; CI test asserts derived === live, hard-fail on ANY divergence. | ✓ |
| Snapshot + fail | Committed snapshot regenerated in CI; fail on diff, human re-blesses. | |
| Warn on additions | Hard-fail only on removed/changed; warn on additions. | |

**User's choice:** Derive, don't copy.

---

## Claude's Discretion

- Per-section vs whole-artifact IR generation granularity (within the roadmap's per-section decomposition mandate).
- Intent/prompt parsing into the planner's input (deterministic vs light LLM pass).
- Model choice for the new planner agent (via `modelAdapter`).
- How the compiled bundle persists in the `experience*` Convex tables (append-only, alongside the IR).

## Deferred Ideas

- Print-specific foundation additions (CMYK/spot color, print color profiles) — future foundation extension, not P2.
- Mastra Sandbox/Workspace providers for safe execution/preview — evaluate in P3 separate-origin preview work.
- Full cost/observability dashboards (beyond basic tracing) — P5 (PROD-02).
- Eval-driven repair loop & visual evaluator — P3.
