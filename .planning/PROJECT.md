# Jio AI Experience Builder Lab

## What This Is

A Jio-native AI Experience Builder Lab — an **isolated** workspace inside the OneUI Studio monorepo where AI composes, validates, critiques, repairs, and exports design-system-native experiences (web UIs, app screens, dashboards, landing pages, social posts, Instagram carousels, outdoor/digital displays, slides, and campaign assets) using **only** the real Jio Design System foundations, multi-brand tokens, Jio CSS, and Storybook-approved Jio components. Mastra orchestrates the agent workflow, a canonical **Jio Experience IR** is the generation contract, validators + repair loops are the guardrails, and tldraw is the canvas. It is for Jio brand/design/marketing teams who need on-brand, system-compliant experiences generated fast — not a generic "AI-looking" UI generator.

## Core Value

**AI cannot bypass the Jio Design System.** Every generated artifact is provably composed from real Jio foundations, Jio CSS, and Storybook-approved Jio components — no Tailwind, no external visual kits, no invented components, no arbitrary colors/spacing/type/radii/elevation/motion when a Jio token or foundation value exists. If something is missing, the system emits a Jio system gap report instead of inventing it.

## Requirements

### Validated

<!-- Inferred from existing code (brownfield). These are the reusable sources of truth the Lab builds on. -->

- ✓ Multi-brand design-token engine + Jio CSS foundation cascade (`packages/tokens`, `packages/shared/src/engine`) — existing
- ✓ Surface context system, Typography V2 (relational f-scale), per-platform/density foundation resolution via the brand CSS engine — existing
- ✓ 50+ Storybook-documented Jio web components (`packages/ui`) + React Native parity (`packages/ui-native`) — existing
- ✓ tldraw-based ExperienceCanvas with component/container/frame shapes, layers, prop panels, canvas chat (`apps/platform/src/design-tools/ExperienceCanvas`) — existing (**the Builder that must not break**)
- ✓ Tone of Voice Agent: compile/generate/tone-guard/eval (`api/voice/*`, `shared/src/engine/voiceCompiler.ts`) — existing
- ✓ Design Composition Agent (DCA): generate/compile/verify/critique/repair/eval/skills (`api/composition/*`, `shared/src/engine/compositionCompiler.ts`) — existing
- ✓ AST codegen + recursive ASTRenderer + sandboxed render routes (`shared/src/codegen`, `ui/src/runtime/ASTRenderer.tsx`, `app/internal/render-ast`, `render-code`) — existing
- ✓ Convex backend as real-time single source of truth (`packages/convex`) — existing
- ✓ Vercel AI SDK model layer (`ai@^6`, `@ai-sdk/anthropic`, `@ai-sdk/react`) — existing

### Active

<!-- The new Lab. Full P1–P5 vision. All hypotheses until shipped and validated. -->

**Foundation (P1):** ✓ Validated in Phase 1: Isolated Foundation (2026-05-31)
- [x] New isolated Experience Builder Lab route + UI shell built from Jio DS components and Jio CSS only
- [x] Isolated tldraw canvas shell (separate from existing ExperienceCanvas)
- [x] Brand/sub-brand, artifact-type, and output-profile selectors (mockable)
- [x] Canonical Jio Experience IR schema + canvas object model (prompt card, artifact card, foundation profile card, etc.)
- [x] Mock Foundation Resolver and mock Storybook component registry with production-shaped contracts
- [x] Mastra workflow skeleton + AG-UI-style agent event stream model (Mastra pinned `@mastra/core@1.37.1` + `@mastra/ai-sdk@1.4.3` behind one model adapter)
- [x] ToV + Design agent integration points (placeholders wired to existing APIs)
- [x] Basic compliance validator (blocks Tailwind, non-Jio/external visual imports, unregistered components — AST-based)
- [x] Mock generation workflow producing valid IR → artifact card appears on canvas (+ typed foundation-gap path; runs persist to Convex `experience*` tables)
- [x] Deliverable docs: plan, architecture, README documenting isolation (+ FOUNDATION-COVERAGE.md, PREVIEW-DECISION.md)

**Real integration (P2):**
- [ ] Connect real Jio foundations/tokens and real Storybook component metadata to resolver + registry
- [ ] Integrate the existing Tone of Voice Agent for copy
- [ ] Integrate the existing Design/Composition Agent for layout/composition/critique
- [ ] Compile Jio Experience IR → React + Jio CSS using approved imports only

**Preview / eval / repair (P3):**
- [ ] Sandboxed iframe preview rendering of generated artifacts (CSP-isolated, no session/auth access)
- [ ] Playwright screenshots across output profiles
- [ ] Full Jio compliance validation pipeline (TS compiles, preview renders, screenshots generate)
- [ ] Visual evaluator scoring (compliance, hierarchy, a11y, responsiveness, export readiness)
- [ ] Patch-based repair loop + artifact version history

**Campaign / social (P4):**
- [ ] Instagram/campaign output profiles (square/portrait/story/carousel) resolved from Jio foundations
- [ ] Campaign Planner producing briefs, audiences, message hierarchy, 3 creative directions, per-frame copy
- [ ] Carousel frame generation + caption copy via ToV agent
- [ ] PNG/JPG/PDF export of campaign assets

**Production readiness (P5):**
- [ ] Collaboration, observability, cost tracking, workflow persistence
- [ ] Security hardening + export/handoff bundles (code/HTML/PPTX/Figma handoff)

### Out of Scope

- Modifying, refactoring, or breaking the existing Builder (`ExperienceCanvas` / `(builder)` routes) — hard isolation rule from both docs
- Generic AI UI generation (Tailwind, utility CSS, unwrapped shadcn/Radix, external visual kits, arbitrary themes) — violates Core Value
- Full Figma replacement — MVP is a component-aware AI generation canvas, not a design-tool clone
- Inventing components, dimensions, type scales, or output rules when missing — must emit Jio system/foundation gap reports instead
- Real-time multiplayer collaboration before P5 — deferred to production-readiness phase
- Using Vercel AI SDK as the orchestration brain — it is the model-interaction layer only; Mastra orchestrates

## Context

- **Brownfield monorepo:** OneUI Studio BaseUI v4 — pnpm workspaces + Turborepo, Next.js 15 / React 19 / TypeScript, Convex backend. Codebase map at `.planning/codebase/`.
- **Already present:** tldraw `^4.5.3`, Vercel AI SDK (`ai@^6`, `@ai-sdk/anthropic`, `@ai-sdk/react`), an existing tldraw Builder (`ExperienceCanvas`), Tone-of-Voice agent (`api/voice`), Design/Composition agent (`api/composition`), AST codegen + sandboxed render routes, the full Jio token/surface/typography engine.
- **Net-new dependency:** **Mastra** is not installed — it is the one major new orchestration dependency this project introduces.
- **Reuse strategy:** Existing ToV + Design agents and tldraw patterns are reused via clean integration contracts; the Lab stays isolated and does not reimplement working agents.
- **Working branch:** `experiencebuilder`.
- **Apply existing rules:** CLAUDE.md zero-tolerance literal/token rules, Surface Context mandate, Typography V2 tokens, and WCAG AA apply to the Lab UI and to all generated artifacts.

## Constraints

- **Tech stack**: Jio Design System components + Jio CSS only — both for the builder UI and for all generated artifacts. No Tailwind, utility CSS, or external visual component libraries.
- **Orchestration**: Mastra owns agent definitions, workflow sequencing, shared state, tool calls, retries, repair loops, and human-in-the-loop checkpoints — but is NOT the UI generator.
- **Model layer**: Vercel AI SDK for model calls, streaming, structured outputs, tool calling, React/Next integration — not the orchestration brain.
- **Generation contract**: Jio Experience IR is canonical; never arbitrary JSX as the source of truth. Compile IR → React + Jio CSS with approved imports only.
- **Isolation**: Must not modify or break the existing Builder. New `packages/experience-builder-*` packages + an isolated route inside `apps/platform`, adapted to existing monorepo conventions.
- **Source of truth**: Convex + real Jio foundations + Storybook. Mocks allowed in P1, but contracts must be production-shaped so they can connect to real sources later.
- **Accessibility**: WCAG AA mandatory for builder UI and generated output (inherits repo zero-tolerance rules).
- **Security**: Sandboxed previews must run isolated from main app; generated code cannot access user auth/session data (CSP + iframe sandboxing).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Scope = full P1–P5 vision | User-confirmed horizon (foundation → integration → preview/eval/repair → campaign → production) | — Pending |
| Mastra as orchestration layer | Chosen in execution prompt; coordinates agents/workflows/repair/HITL while IR + registry + validators control correctness | — Pending |
| Reuse existing ToV + Design agents via integration points | Don't reimplement working agents; Lab calls clean contracts and reuses tldraw patterns | — Pending |
| Adapt isolation to monorepo conventions | `packages/experience-builder-{core,agents,registry,validation,preview,export}` + isolated `apps/platform` route, vs docs' literal `apps/studio` | — Pending |
| Jio Experience IR as canonical contract | Prevent arbitrary JSX; enforce DS compliance via structured, validatable schema | — Pending |
| Vercel AI SDK = model layer only | Already in repo; Mastra is the orchestration brain | — Pending |
| Foundation resolver must cover non-web profiles | Jio foundations are source of truth for Instagram/carousel/outdoor/slide/banner output rules, not just web | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-01 — Phase 3 (Preview / Eval / Repair) complete: the indivisible quality loop is wired end-to-end — credential-free sandboxed preview (IframeCsp MVP + Daytona prod executor behind one seam) → screenshot → two-track evaluation (blocking deterministic validator + subjective multimodal rubric) → bounded IR-patch repair → best-of-N ranking → append-only version persistence, surfaced on the canvas (live iframe, variant frame, version timeline, iterate). 17/17 must-haves verified; 3 manual-verification items tracked in 03-HUMAN-UAT.md; code-review findings (CR-01..04) tracked in 03-REVIEW.md.*
