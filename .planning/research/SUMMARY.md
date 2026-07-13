# Project Research Summary

**Project:** Jio AI Experience Builder Lab
**Domain:** Mastra-orchestrated, IR-based, design-system-constrained AI generation system (brownfield, inside OneUI Studio BaseUI v4)
**Researched:** 2026-05-30
**Confidence:** HIGH on architecture + reuse map; MEDIUM-HIGH on stack (one verified version risk); MEDIUM on non-web foundation coverage.

## Executive Summary

This is a **brownfield, subsequent-milestone** build: a design-system-constrained AI generation system layered onto an existing Next.js 15 / React 19 / Convex / tldraw monorepo. The defining finding across all four research streams is that the repo **already ships most of what generic "AI UI generator" projects invent from scratch** — an AST/IR -> React compiler (`@oneui/shared/codegen` + `ASTRenderer` + registry-gated prop allow-lists), sandboxed render routes, machine-readable component metadata, two working agents (ToV, Design/Composition), and the full Jio token/surface/typography engine. The project is therefore **integration work, not greenfield invention**. The single genuinely new dependency is **Mastra** (orchestration); everything else is reused-by-contract behind six isolated `experience-builder-*` packages plus one isolated route. Detail: see [ARCHITECTURE.md](ARCHITECTURE.md), [STACK.md](STACK.md).

The recommended approach is **"isolation by package, reuse by contract,"** with an **IR-centric closed control loop** as the architectural keystone: the Jio Experience IR (Zod) is the *only* source of truth, and compile -> validate -> repair loops around the IR, never around generated JSX. Mastra owns the agent graph, sequencing, repair loops, HITL suspend/resume, and observability; the Vercel AI SDK v6 remains the model layer only (calls, streaming, `Output.object` structured generation) — this boundary is non-negotiable per PROJECT.md. The competitive thesis (per [FEATURES.md](FEATURES.md)) is **hard, provable, non-bypassable design-system constraint + gap reporting** — "design-system aware" became table stakes in 2026, so the Lab wins only on enforcement: it physically cannot emit a non-registered component, blocks Tailwind/literals at the AST level, and emits a Jio gap report rather than inventing anything.

The dominant risks (per [PITFALLS.md](PITFALLS.md)) cluster around four HIGH-severity themes that must be designed for in P1 even though they bite later: (1) **Mastra <-> AI SDK v6 version mismatch** — the repo is *ahead* of Mastra's blessed AI SDK version, so a compatibility spike is the first task; (2) **the LLM smuggling raw JSX** through a loose IR field, collapsing the Core Value; (3) **isolation leakage** breaking the existing Builder via shared-file/dep edits; and (4) **same-origin preview iframes** leaking Convex auth. Each is cheap to prevent by design decision in P1 and expensive to retrofit.

## Key Findings

### Recommended Stack

The runtime stack is **reused, not chosen**. The only net-new core is Mastra. The decision that matters most is the **Mastra <-> AI SDK boundary** (Mastra is built *on top of* the AI SDK, so they compose). Full detail + version table: [STACK.md](STACK.md).

| Piece | Choice | Role / boundary |
|---|---|---|
| Orchestration | `@mastra/core` (pin exact) | Agent graph, `createWorkflow().then/.branch/.dountil/.parallel`, repair loops, suspend/resume (HITL), retries, snapshots. **The orchestration brain.** |
| Stream bridge | `@mastra/ai-sdk` | `handleChatStream` / `toAISdkStream(stream, { version: 'v6' })` -> `useChat`/`useObject` on the Lab UI. Clean first-party way to stream Mastra -> React. |
| Model layer | `ai@^6` + `@ai-sdk/anthropic` + `@ai-sdk/react` (**in repo**) | Model calls + streaming + **structured IR via `Output.object()`** (NOT deprecated `generateObject`). Never the orchestrator. |
| Event model | **Internal `ExperienceBuilderEvent`** (spec section 4.3), AG-UI-*inspired* shapes | P1-P4. Defer real `@ag-ui/*` (pre-1.0, no stable Mastra adapter) to P5 only if external-frontend interop is needed. |
| Sandbox preview | iframe on a **separate origin** + strict CSP + opaque sandbox | Build on existing `/internal/render-ast`; never `allow-scripts`+`allow-same-origin` together; zero auth in preview. |
| Eval worker | `playwright` (**in repo**, `@axe-core/playwright`) | Out-of-band worker (not in Next request path): preview URL -> screenshot -> Visual Evaluator. |
| Schema | `zod@4` (**in repo**) | One lib for IR + AI SDK output + Mastra step schemas. Do not add a second validator. |
| Persistence | Convex (**in repo**) for domain state; Mastra storage adapter for run snapshots | Split persistence — mirror milestones into Convex, don't force snapshots into domain tables. |

**Mastra<->AI SDK boundary (hard rule):** No multi-agent sequencing, repair loop, or HITL logic in AI SDK `streamText` callbacks — those are Mastra workflow definitions. The AI SDK appears only *inside* a Mastra agent's model config or a Mastra tool's `execute`.

### Expected Features

Two product lineages converge here (AI UI generators + AI campaign/social generators); the Lab adds a third axis competitors lack: **provable DS constraint**. Full landscape + competitor matrix: [FEATURES.md](FEATURES.md).

**Table stakes (users expect, or it feels toy-like):**
- Prompt -> artifact on an infinite canvas (tldraw, already in repo)
- Brand/sub-brand + artifact-type + output-profile selectors
- Live **sandboxed real-DOM preview** (not flattened raster)
- Chat-based iteration, multiple variants, multi-viewport output
- Code + image export; component/DS reference visible; version history; streaming agent activity feedback

**Differentiators (the competitive thesis — DS enforcement):**
- **Registry-only component sourcing** (cannot physically emit a non-registered component)
- **Canonical Jio Experience IR** as generation contract (never raw JSX)
- **Compliance validator** that blocks Tailwind / external kits / invented components / arbitrary literals
- **Jio gap reports** (invent NOTHING — stops and reports instead of hallucinating)
- **Foundation resolver for non-web profiles** (carousel/story/outdoor/slide) from Jio foundations
- **Patch-based repair loop** + **visual evaluator scoring**
- **Reuse of existing ToV + Design agents** (a trained design brain, not cold-start)
- **Campaign Planner** (brief -> audience -> 3 directions -> per-frame copy) + **multi-format from one IR**
- The **Lab UI itself is 100% Jio DS** (dogfooding credibility)

**Anti-features (explicitly NOT built — would violate Core Value):**
- Raw JSX/HTML as source of truth - Tailwind/utility CSS/external kits in output - arbitrary generated color/type systems - inventing missing components - full Figma replacement - unwrapped shadcn/Radix - raster-flattening of UI - **AI SDK as orchestrator** - early multiplayer - social scheduling - **touching the existing `ExperienceCanvas`/`(builder)`**.

### Architecture Approach

**Isolation by package, reuse by contract.** Six new `packages/experience-builder-{core,registry,agents,validation,preview,export}` packages + one isolated `apps/platform/(experience-lab)` route group. The Lab *calls* the brand engine, codegen, agents, and Convex through narrow adapters; it never reimplements them and never imports or modifies the existing Builder (one-way dependency graph). Full component map, IR lifecycle, reuse map, and Convex schema: [ARCHITECTURE.md](ARCHITECTURE.md).

**Major components:**
1. **`-core`** — canonical IR (Zod) schema, output-profile table, resolve/registry/validation/event contract types, IR<->AST mapping + IR diff/patch. *Blocks everything; build first.*
2. **`-registry`** — thin adapter over existing `componentRegistry` + `jioAlphaCatalog` + `@oneui/shared/meta` -> `JioComponentRegistryItem` + `queryRegistry()`. **Static typed metadata is the gate; defer embeddings/RAG.**
3. **`-agents`** — the Mastra workflow (intent -> resolve -> retrieve -> ToV -> design -> plan -> IR -> compile -> validate -> preview -> evaluate -> repair -> version), with HITL suspend points. Maximize deterministic *tools*; minimize LLM *agents*.
4. **`-validation`** — AST-based compliance validator (import allowlist, registry membership, prop/variant/slot, token-literal scan) -> `JioValidationResult`. Reuses `check:literals` + `tokenBoundary`/`tokenManifest`.
5. **`-preview`** — compile-to-React + isolated-origin sandboxed iframe + Playwright capture (reuses render routes).
6. **`-export`** — PNG/JPG/PDF/code/handoff bundles from frozen versions.
7. **`(experience-lab)` route** — isolated Jio-DS-only tldraw shell + run inspector + HITL approval UI.

**IR lifecycle (the closed loop):** IR draft -> compiler (deterministic) -> validator -> (fail -> **repair patches the IR, not JSX** -> recompile, capped N=3 then HITL) -> sandboxed preview + screenshots -> visual evaluator -> (low score -> critique -> repair -> re-render) -> freeze immutable version. A missing component/profile **short-circuits to a gap report**, never the repair loop.

**Reuse map (call vs build):** CALL = brand engine `buildThemeConfig`, `astToReact`, ToV `api/voice`, Design `api/composition`, `check:literals`/`tokenBoundary`, `/internal/render-*`, tldraw, Convex. BUILD = IR schema + IR<->AST translator, output-profile table (the *only* new foundation data), `JioComponentRegistryItem` adapter, Mastra workflow, isolated canvas shell, `experience*` Convex tables.

### Critical Pitfalls

Top HIGH-severity items (full list of 12 + recovery + checklists: [PITFALLS.md](PITFALLS.md)). Phase = where to *address*.

1. **Mastra <-> AI SDK v6 mismatch (P1)** — repo is on `ai@6`, Mastra historically blessed v4/v5. **Avoid:** run an install compat spike *first*, pin exact versions in Lab packages, centralize all model calls behind one adapter, CI-fail if `pnpm why ai` resolves >1 version. *(Note: STACK.md found Mastra 1.x claims v6 support; PITFALLS.md flags it as still-risky. Reconciled below — verify hands-on.)*
2. **LLM free-builds raw JSX (P1 schema -> P2/P3 enforce)** — **Avoid:** IR schema has **no** free-text/HTML/`rawHtml`/`children:string` field; compiler is the only thing that emits JSX; any LLM string with `<`/`className`/`style=` is a hard fail; adversarial "give me HTML" tests must yield IR or a gap report.
3. **Isolation leakage breaks the existing Builder (P1, all phases)** — **Avoid:** new code only in `experience-builder-*` + one route; treat ToV/DCA/engine as read-only contracts; pin Lab's tldraw independently; never touch `FoundationStyleProvider` / set `injectionMode:'none'`; CI import guards + existing-Builder smoke test.
4. **Same-origin preview leaks auth (decide P1, build P3, harden P5)** — **Avoid:** separate preview origin, `allow-scripts` *without* `allow-same-origin`, strict CSP + `frame-ancestors`, `postMessage` with verified origin, zero auth/Convex tokens in preview, credential-free Playwright workers.
5. **Validator false negatives (P1 basic -> P3 full)** — **Avoid:** validate on the **AST** not strings; **allowlists not denylists** (imports in registry, custom props in live token manifest, components in registry); block all literals; maintain a red-team evasion corpus (aliased shadcn import, inline hex, fake `var()`, dynamic classNames).
6. **Non-converging / costly repair loops (P3)** — **Avoid:** hard cap (N=3) enforced by Mastra state; convergence detection; missing-component/profile -> gap branch (not the loop); per-run token/screenshot/wall-clock budget; validate (deterministic) before invoking the LLM judge.
7. **IR drift vs real component registry (P1 contract -> P2 wire)** — **Avoid:** derive the registry from the single existing metadata source-of-truth; make the P1 mock **production-shaped to the real schema**; add a registry-freshness CI gate. *(CONCERNS.md shows this drift already exists in the base repo — Modal/Text meta, catalog slugs.)*
8. **Foundation resolver invents non-web dimensions (P1 audit -> P4)** — **Avoid:** P1 foundation-coverage audit (which profiles Jio actually defines vs the docs assume); "profile not found" is a first-class typed result -> gap report; no agent may synthesize dimensions.

## Implications for Roadmap

Research strongly converges on a **5-phase shape** (matching PROJECT.md P1-P5). The ordering is dependency-driven: `-core`/IR blocks everything; the preview/eval/repair trio is one indivisible cluster; campaign depends on verified non-web profiles.

### Phase 1: Isolated Foundation (contracts first, production-shaped mocks)
**Rationale:** `-core` (IR + all contract types) blocks every other package; isolation guards and the four HIGH pitfalls (#1-#5, #7, #8) are cheapest to prevent now. Mocks are fine, but contracts must match real schemas so P2 is a data swap, not a migration.
**Delivers:** IR Zod schema (no markup fields) + output-profile table + IR<->AST mapping + diff/patch (`-core`); registry adapter mock; isolated tldraw shell + Jio-DS UI; Mastra workflow skeleton + internal event stream; ToV/Design integration *points*; basic AST allowlist validator; mock generation -> valid IR -> artifact card; `experience*` Convex tables.
**Addresses:** infinite canvas, selectors, IR contract, registry-only sourcing (mock), basic validator, dogfooded UI.
**Avoids:** #1 (compat spike + pinning), #2 (markup-free IR), #3 (CI import guards + smoke test), #4 (decide separate-origin model), #5 (AST validator), #7 (production-shaped mock), #8 (foundation-coverage audit).

### Phase 2: Real Source Integration
**Rationale:** With contracts frozen, swap mocks for real sources and build the deterministic compile path.
**Delivers:** resolver -> `buildThemeConfig`/Convex; registry -> real `jioAlphaCatalog` metadata + freshness gate; ToV + DCA Mastra tool wrappers; **IR -> AST -> `astToReact` compiler**; constrained structured generation with retry-on-error-feedback + per-section decomposition.
**Uses:** `@oneui/shared/engine`, `astToReact`, `api/voice`, `api/composition`, `Output.object`.
**Avoids:** #7 (real-metadata wiring), #9 (constrained component selection), #10 (structured-output reliability).

### Phase 3: Preview / Eval / Repair (the quality loop — indivisible)
**Rationale:** Preview -> screenshot -> score -> patch -> re-preview only make sense together; splitting strands half the loop.
**Delivers:** CSP-isolated separate-origin iframe preview; Playwright screenshots per profile; full `JioValidationResult` pipeline + red-team corpus; visual evaluator (objective via validator, subjective via rubric + best-of-N); **patch-based repair loop** with caps/convergence/gap-branch; version history; preview lifecycle (thumbnail/live-iframe cap).
**Avoids:** #4 (sandbox security), #5 (full validator), #6 (loop caps), #11 (canvas iframe perf), #12 (judge variance).

### Phase 4: Campaign / Social
**Rationale:** Multi-format is nearly free once IR + multiple foundation profiles exist — but depends on a *verified* set of resolvable non-web profiles (P1 audit gates this).
**Delivers:** IG/carousel/story/slide/outdoor output-profile entries; Campaign Planner (brief -> audience -> hierarchy -> 3 directions -> HITL pick -> per-frame copy via ToV); carousel frame generation; PNG/JPG/PDF export.
**Avoids:** #8 (gap report, never invented dims), #11 (carousels multiply frames — stress-test perf first).

### Phase 5: Production Readiness
**Rationale:** Cross-cutting hardening best layered once the loop is proven.
**Delivers:** collaboration (tldraw sync), observability + cost tracking (Mastra hooks + `experienceRuns`), Mastra storage-adapter persistence, security hardening, handoff bundles (code/HTML/PPTX/Figma/git), optional `@ag-ui/*` adapter if external interop is needed.

### Phase Ordering Rationale
- `-core`/IR is a hard dependency for the compiler, validator, registry, and events — it must land first (P1).
- Real integration (P2) cannot precede production-shaped contracts (P1) without forcing a schema migration.
- Preview/eval/repair is one P3 cluster by dependency, not three phases.
- Campaign (P4) is gated on the P1 non-web foundation audit and P2 compile path.
- The HIGH pitfalls are front-loaded into P1 *decisions* even where the *implementation* lands later (#4 hosting, #8 audit).

### Research Flags

**Likely need `--research-phase` during planning:**
- **Phase 1:** Mastra install/compat spike is empirical — verify exact `ai`/`@ai-sdk/*` peer ranges and whether v6 actually works (STACK and PITFALLS disagree on maturity). Also: Mastra snapshot storage backend choice, and the foundation-coverage audit.
- **Phase 2:** Does Storybook/`.meta.ts` expose enough machine-readable props/slots/anti-patterns to populate `JioComponentRegistryItem`, or is a hand-authored layer needed? IR->AST mapping fidelity vs current `ComponentASTNode`.
- **Phase 3:** Sandbox origin strategy (dedicated subdomain vs `srcdoc`+CSP) needs a security review; evaluator scoring rubric design; cost/latency budget for the full loop.
- **Phase 4:** Real non-web foundation coverage (likely surfaces many gaps — gap-reporting may itself be a P4 deliverable).

**Standard / lower-research:**
- **Phase 5** is mostly well-trodden integration (observability hooks, export workers) — research only the AG-UI maturity check.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Versions verified live on npm + Context7; the one open risk is the Mastra<->AI-SDK-v6 compatibility (STACK reads it as supported in Mastra 1.x; PITFALLS reads it as still-risky) — must be settled by a P1 install spike. |
| Features | MEDIUM-HIGH | Comparator features verified against 2026 reviews/docs; Jio differentiators derived from project docs. Stable. |
| Architecture | HIGH | Existing codebase verified by direct inspection; reuse map and IR lifecycle grounded in real files; Mastra HITL/storage model verified against current docs. |
| Pitfalls | MEDIUM-HIGH | Domain reasoning cross-checked against Mastra/AI-SDK/tldraw/iframe-security sources and the repo's own CONCERNS.md; some forward-looking risks are MEDIUM. |

**Overall confidence:** HIGH for *what to build and how to structure it*; MEDIUM on two empirical unknowns (Mastra/AI-SDK v6, non-web foundation coverage) that the P1 spikes resolve.

### Gaps to Address
- **Mastra + AI SDK v6 compatibility (HIGH impact):** STACK and PITFALLS disagree on maturity. -> P1 install spike; `pnpm why ai`; pin exact; decide v5-isolated vs v6-with-shims. *Single highest-leverage validation item.*
- **Non-web foundation coverage:** Do Jio foundations define IG/carousel/outdoor/slide profiles at all? -> P1 coverage audit; if not, gap-reporting becomes a P4 deliverable and may require foundation-team work outside this milestone.
- **Component-metadata single source of truth:** CONCERNS.md shows multiple drifting registry contracts in the base repo. -> P1 derive from one source; add freshness gate; fix/exclude known-drift components (Modal, Text).
- **Separate preview origin feasibility:** Is a distinct subdomain/deployment actually available in this infra? -> decide P1; determines whether the secure sandbox model is even achievable.
- **Mastra snapshot storage backend** (libSQL vs Postgres vs Convex-backed) and **per-run cost ceiling** (sizes repair-loop caps) — both P1 spikes.

## Sources

### Primary (HIGH confidence)
- Existing codebase, direct inspection — `@oneui/shared/codegen astToReact`, `componentRegistry`/`jioAlphaCatalog`, `generateAIContext`, Convex schema, `api/{agent,voice,composition}`, `/internal/render-*`, `.planning/codebase/{ARCHITECTURE,STRUCTURE,CONCERNS}.md`
- npm registry (2026-05-30) — `@mastra/core@1.37.1`, `@mastra/ai-sdk@1.4.3`, `mastra@1.10.2`, `ai@6.0.193`, `@ai-sdk/anthropic@3.0.81`
- Context7 `/mastra-ai/mastra` — workflows, suspend/resume, AI-SDK bridge, observability
- vercel.com/blog/ai-sdk-6 — AI SDK 6 stable, `Output.object/array/choice`, `generateObject` deprecation
- Mastra official docs — HITL/suspend-resume, AI-SDK frameworks, storage backends
- Project docs — `.planning/PROJECT.md`, MVP tech spec, full execution prompt, CLAUDE.md

### Secondary (MEDIUM confidence)
- CopilotKit AG-UI docs — Mastra->AG-UI is custom SSE; no stable first-party adapter
- 2026 comparator reviews — v0, Figma Make/skills, Builder Visual Copilot, PostNitro/Simplified, Galileo/Stitch, tldraw make-real
- GitHub mastra-ai/mastra #10602 (AI SDK v6 support) + tldraw #5245 (frame-render perf)
- iframe-sandbox / CSP / postMessage security articles; LLM structured-output failure-rate studies
- Google A2UI — concept reference (flat-adjacency, streaming IR), not adopted as runtime

### Tertiary (LOW confidence — needs validation)
- `@ag-ui/core@0.0.54` maturity for P5 interop — re-check for 1.0 + Mastra adapter
- Anthropic structured-output reliability on large nested IR — validate empirically in P2

---
*Research completed: 2026-05-30*
*Ready for roadmap: yes*
