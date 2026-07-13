# Walking Skeleton — Jio AI Experience Builder Lab

**Phase:** 1
**Generated:** 2026-05-30

## Capability Proven End-to-End

> One sentence: the smallest user-visible capability that exercises the full stack.

A user opens the isolated Experience Lab route, places a prompt card on a tldraw canvas, picks a (real) brand + artifact type + output profile, enters a prompt, clicks "Run generation", and watches a streamed agent event log produce a valid-IR artifact card inside a "Run #N" frame — or, on an uncovered profile/unregistered component, watches the foundation-profile/component-reference card flip to a typed gap-report state with no artifact produced. Every edge is a deterministic mock; the contracts are production-shaped so Phase 2 is a data swap, not a migration.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Isolation model | Six `experience-builder-*` packages + one isolated `(experience-lab)` route group; existing engine/agents/Builder are read-only contracts | "Isolation by package, reuse by contract" — the existing `ExperienceCanvas`/`(builder)` Builder MUST keep booting unchanged (LAB-03, Pitfall 3). |
| Canonical contract | Jio Experience IR (Zod) with ZERO markup fields; IR→AST emits only `ComponentASTNode`/`TextASTNode` (never `ElementASTNode` raw tags) | IR is the only source of truth; the markup-free schema is what makes "AI cannot bypass the DS" provable (IR-02, Pitfall 2). |
| Orchestration brain | Mastra (`@mastra/core` + `@mastra/ai-sdk`, exact pins) in `experience-builder-agents`, Node runtime only | Mastra owns sequencing/branching/HITL/repair; the Vercel AI SDK is the model/stream layer only (ORCH-04). |
| Model layer | Vercel AI SDK `ai@6` behind ONE `modelAdapter` module; `version: 'v6'` for all `@mastra/ai-sdk` stream conversions; P1 makes no real model calls | Centralized boundary + single-`ai`-version CI gate avoid version drift (Pitfall 1). |
| Data layer | Convex `experienceRuns` + `experienceArtifacts` + `experienceArtifactVersions` (runs + IR durable); tldraw canvas layout ephemeral | D-08: durable contract-critical artifacts real, canvas-sync plumbing deferred. Brands read via the existing read-only `brands.list` query (D-02). |
| Component allowlist | `experience-builder-registry` adapter derived from `jioAlphaCatalog`+`componentRegistry`+meta; exact-lookup membership | Single source of truth, drift-proof; Modal/Text excluded (Pitfall 5); embeddings deferred to v2 (REG-05). |
| Validation | AST-based allowlist validator (`experience-builder-validation`) — parse + alias-resolve, never substring | Catches aliased imports / raw element nodes / unregistered components from day one; P3 extends, not rewrites (Pitfall 4). |
| Canvas | tldraw 4.5.3, scoped editor + store, custom `ShapeUtil`s + a `FrameShapeUtil` (Run #N frame); patterns mirrored from `ComponentShape`/`OneUIFrameShapeUtil`, never imported | Proven patterns; isolation preserved (CANVAS-01..04, D-07). |
| Lab UI styling | Jio DS components + Jio CSS only; token-only, zero literals, Surface Context mandatory; deep-path imports (no `@oneui/ui` barrel) | LAB-02 / CLAUDE.md zero-tolerance. |
| Artifact card fidelity | Structured IR summary + IR/JSON inspector toggle — NOT a DOM preview | Claude's discretion; honest about preview capability (real DOM is P3 behind a separate origin). |
| Directory layout | Packages under `packages/experience-builder-{core,registry,agents,validation,preview,export}`; route under `apps/platform/src/app/(platform)/(experience-lab)/` | Repo `STRUCTURE.md` conventions; preview/export are stubs in P1. |

## Stack Touched in Phase 1

- [x] Project scaffold — six new workspace packages (`experience-builder-*`), per-package `vitest.config.ts`, tsconfig, eslint isolation boundary, single-`ai` + smoke-test CI gates
- [x] Routing — isolated `(experience-lab)` route group + nav entry, sibling to `(builder)`
- [x] Database — real read (`brands.list`) AND real write (`experienceRuns`/`experienceArtifacts`/`experienceArtifactVersions` insert)
- [x] UI — interactive prompt card + request panel + Run CTA wired to the streaming run route
- [x] Deployment / full-stack run — `pnpm dev` exercises the Lab route → Node run route → Mastra workflow → Convex round-trip (documented in `packages/experience-builder-core/README.md`)

## Out of Scope (Deferred to Later Slices)

> Anything that is *not* in the skeleton. Be explicit — this list prevents future phases from re-litigating Phase 1's minimalism.

- Real foundation/registry wiring, the IR→React compiler, real ToV/Design agent execution (P2)
- Sandboxed iframe preview + screenshots + full literal/token validator + visual evaluator + repair loop + version history UI (P3) — the separate-origin preview is **decided + documented** in P1, built in P3
- Real LLM model calls (P1 is all deterministic mocks; the `modelAdapter` boundary exists now)
- Canvas layout sync to Convex (P1 layout is ephemeral, D-08; revisit at P5 collaboration)
- Chat-style activity feed / chat-based iteration (P3, INPUT-05; P1 uses the run-inspector timeline)
- Non-web output profiles + Campaign Planner + carousel frames + PNG/JPG/PDF export (P4)
- Collaboration, observability/cost, durable Mastra storage adapter, security-hardening review, handoff bundles (P5)
- Registry freshness CI gate (REG-04, P2 — the mock is shaped for it now)
- Embeddings/RAG component retrieval (v2, REG-05)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- **Phase 2 (Real Source Integration):** swap mock resolver/registry/agents for real Jio foundations (`buildThemeConfig`/Convex), real `jioAlphaCatalog` retrieval, real ToV + Design agents as Mastra tools, and the IR→AST→React compiler — no schema migration.
- **Phase 3 (Preview / Eval / Repair):** sandboxed separate-origin iframe preview (built per the P1 PREVIEW-DECISION), Playwright screenshots, the full AST literal/token validator + red-team corpus, the visual evaluator, the bounded IR-patch repair loop, and version history.
- **Phase 4 (Campaign / Social):** non-web output profiles (closing the FOUNDATION-COVERAGE gaps), Campaign Planner with HITL, IR-backed carousel frames, PNG/JPG/PDF export.
- **Phase 5 (Production Readiness):** tldraw sync collaboration, observability + cost tracking, durable Mastra storage adapter, security-hardening review, handoff bundles.
