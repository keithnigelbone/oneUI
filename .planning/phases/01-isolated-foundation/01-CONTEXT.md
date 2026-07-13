# Phase 1: Isolated Foundation - Context

**Gathered:** 2026-05-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up an **isolated, Jio-DS-only Experience Builder Lab** as the contracts-first foundation for the whole milestone. Deliver: a new isolated route + tldraw canvas shell (separate from the existing `ExperienceCanvas` Builder); the six `experience-builder-{core,registry,agents,validation,preview,export}` packages with **production-shaped contracts** (canonical Jio Experience IR in Zod, output-profile table, mock foundation resolver, mock Storybook component registry, IR↔AST mapping + diff/patch); a Mastra workflow skeleton with an internal `ExperienceBuilderEvent` stream; ToV/Design agent integration *points* (not wired yet); a basic AST-level compliance validator; and a **mock** generation path that produces a valid-IR artifact card on the canvas. This is the **Walking Skeleton** — the thinnest possible end-to-end working slice — with every HIGH-severity risk designed out up front.

**In scope:** isolation guards (CI import guard + existing-Builder smoke test + single `ai` version), markup-free IR contract, AST validator (blocks Tailwind/non-Jio imports/unregistered components), production-shaped mock resolver + registry, foundation-coverage audit, separate-origin preview *decision* (build is P3), Mastra↔AI-SDK-v6 compat spike with exact pins.

**Out of scope (later phases):** real foundation/registry wiring (P2), the IR→React compiler (P2), real ToV/Design agent execution (P2), sandboxed iframe preview + screenshots + full validator + visual evaluator + repair loop + version history (P3), campaign/social profiles + export (P4), collaboration/observability/persistence-hardening (P5).

</domain>

<decisions>
## Implementation Decisions

### Request & Run UX
- **D-01:** Request controls live in a **docked request panel/inspector**, not inline on the prompt card. Reuse the existing `ExperienceCanvas` prop-panel UX pattern (Jio `Select` components, etc.). The prompt card holds the prompt text + acts as the run origin; the panel is its editor.
- **D-02:** The brand / sub-brand selector populates from the **real Jio brands list via a read-only Convex query** — NOT a hardcoded mock. The mock boundary stays at the *foundation resolver*, not the brand list. Brand IDs are therefore real for P2. (Read-only ⇒ no isolation risk to the existing Builder — does not touch `FoundationStyleProvider` / foundation injection.)
- **D-03:** The output-profile selector is **filtered by the selected artifact type** (e.g. `social-post` → IG square/portrait/story/carousel; `web-ui` → desktop/mobile/responsive). The type→profile mapping is encoded in the **output-profile table contract** in `-core` from P1 (P4 builds on it). Invalid type/profile pairings are prevented at the UI, not just rejected downstream.
- **D-04:** The request panel **edits the currently-selected prompt card**; its config is **persisted on the card** (in the IR / canvas object model), and **Run** produces a **linked artifact card**. Strong spatial lineage: prompt card → artifact card. (Not a global standalone composer.)

### Canvas Object-Model Scope
- **D-05:** Define the **full card / artifact-type union** (8 artifact types: web-ui, app-screen, dashboard, social-post, instagram-carousel, outdoor-display, slide, image; plus foundation-profile / component-reference / evaluation-report / variant-group / export cards) in the **IR + canvas object-model contract now** — production-shaped so later phases just light up renderers. Render only a thin subset in P1. (Explicitly NOT a minimal model that defers the union — that would break the P1 "no schema migration later" goal.)
- **D-06:** Card shapes that get **real renderers in P1**: **prompt card, artifact card, foundation-profile card (including its typed gap-report state), component-reference card.** All other union members are defined in the contract but render as a generic placeholder until their phase. This puts the resolver, gap-report path, and registry retrieval all visibly on the canvas in P1.
- **D-07:** A single run's related cards (prompt → artifact + foundation-profile + component-reference) are grouped inside a **labeled run-group tldraw frame** ("Run #N"). Chosen over free-floating arrow/binding connectors and parent-child auto-layout because it scales cleanly to variant-groups (CANVAS-05, P3) and campaign carousels (P4) and gives a natural container for run-level metadata. Reuse tldraw frame shapes.
- **D-08:** P1 persistence scope: **generation runs (VER-03) AND the generated IR per artifact persist to the `experience*` Convex tables; the tldraw canvas layout (cards/frames/positions) stays ephemeral** (local/session state) in P1. Keeps the durable, contract-critical artifacts (runs + IR) real and production-shaped while deferring canvas-sync plumbing.

### Claude's Discretion
The following areas were intentionally left to Claude. Decisions below stand unless the planner/researcher surfaces a reason to revisit:

- **Mock artifact-card fidelity (CANVAS-04 + Walking Skeleton end-state):** The P1 artifact card renders a **structured IR-summary** — artifact type, output profile, brand, and the layout-section / component-instance outline read from the *valid IR* — plus an **IR/JSON inspector toggle** for transparency. It does NOT fake a real-DOM preview (that is P3, behind a separate origin). Rationale: satisfies "a valid-IR artifact card appears" and gives a real "one real UI interaction" for the Walking Skeleton without lying about preview capability.
- **Agent event-stream surfacing (ORCH-03):** A **docked run-inspector panel** (paired with the request panel) shows the streamed `ExperienceBuilderEvent` timeline for the active run; the artifact card reflects a **lightweight status** (running → valid / gap). A chat-style activity feed is deferred to when chat-based iteration lands (P3, INPUT-05).
- **Gap-report UX (FND-03 / REG-03):** A gap surfaces as the **foundation-profile card flipping to its typed gap-report state** (and the component-reference card for unregistered-component gaps). On a gap, the run **short-circuits to the gap report and produces no artifact card** — mirrors the architecture rule "missing component/profile → gap report, never the repair loop."
- **Lab entry-point / discoverability:** A dedicated route group `apps/platform/src/app/(platform)/(experience-lab)/`, reachable from the main platform nav under a clearly-labeled **"Experience Lab"** entry, visibly **distinct** from the existing `(builder)` group. Visible (not dev-hidden) because dogfooding credibility matters, but unmistakably separate from the existing Builder.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning artifacts (read first)
- `.planning/PROJECT.md` — Core Value, locked Key Decisions, constraints, out-of-scope
- `.planning/REQUIREMENTS.md` — the 30 Phase-1 REQ-IDs + traceability
- `.planning/ROADMAP.md` § Phase 1 — goal, mode (mvp), success criteria
- `.planning/research/SUMMARY.md` — synthesized research; reuse map, IR lifecycle, HIGH pitfalls, phase rationale

### Architecture & approach (the keystone)
- `.planning/research/ARCHITECTURE.md` — "isolation by package, reuse by contract"; six-package map; IR↔AST; Convex `experience*` schema shape
- `.planning/research/STACK.md` — version table; Mastra↔AI-SDK boundary; `@mastra/core`, `@mastra/ai-sdk`, `ai@^6`, `zod@4`
- `.planning/research/FEATURES.md` — table-stakes vs differentiators (DS enforcement)
- `.planning/research/PITFALLS.md` — 12 pitfalls + recovery; the 4 HIGH themes to design out in P1 (#1 Mastra/AI-SDK v6, #2 raw-JSX smuggling, #3 isolation leakage, #4 same-origin preview, #5 validator false-negatives, #7 registry drift, #8 invented non-web dims)

### Codebase maps (existing repo — what to reuse vs not touch)
- `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `.planning/codebase/INTEGRATIONS.md`, `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/STACK.md`, `.planning/codebase/TESTING.md`

### Repo rules (apply to Lab UI *and* generated artifacts)
- `CLAUDE.md` — zero-tolerance literals, token-only styling, Surface Context mandate, Typography V2 tokens, WCAG AA, isolation note for experience-builder components
- `docs/surface-context-awareness.md` — surface model (for generated artifacts + Lab UI compliance)

### Reuse-by-contract source files (CALL, do not reimplement)
- `packages/shared/src/codegen/` — AST→React / AST→page generators (basis for the P2 IR→React compiler)
- `packages/ui/src/runtime/ASTRenderer.tsx` — recursive AST→React renderer
- `packages/ui/src/registry/componentRegistry.ts` + `packages/shared/src/meta/` (`jioAlphaCatalog`, `generateAIContext`) — single source of truth for the registry adapter (`JioComponentRegistryItem`)
- `packages/shared/src/engine/buildThemeConfig.ts` — foundation resolution target for P2 (mock must match its shape)
- `packages/shared/src/engine/tokenManifest.ts` + `tokenBoundary.ts` — allowlist source for the AST validator's literal/import checks (reuse `check:literals`)
- `apps/platform/src/app/api/voice/` and `apps/platform/src/app/api/composition/` — existing ToV + Design agents (integration *points* only in P1; read-only contracts)
- `apps/platform/src/app/internal/render-ast/` + `render-code/` — sandboxed render routes (basis for P3 preview)
- `packages/convex/convex/schema.ts` — schema to extend with `experience*` tables

### MUST-NOT-TOUCH (isolation boundary)
- `apps/platform/src/design-tools/ExperienceCanvas/` and the `(platform)/(builder)/` route group — the existing Builder; read-only reference, must keep booting unchanged
- `apps/platform/src/components/FoundationStyleProvider.tsx` — never modify; never set `injectionMode: 'none'`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **tldraw `^4.5.3`** already in repo — custom shapes, frames, prop panels demonstrated by `ExperienceCanvas`. The Lab pins its own tldraw usage but mirrors the shape/frame/panel patterns. Run-group frames (D-07) reuse tldraw frame shapes.
- **AST codegen + `ASTRenderer` + `/internal/render-*`** — the compile + render machinery already exists; P1 only defines the IR↔AST contract, P2/P3 wire it.
- **`componentRegistry` + `jioAlphaCatalog` + `@oneui/shared/meta`** — the registry mock must be *production-shaped to these* (CONCERNS.md flags existing drift: Modal/Text meta, catalog slugs — derive from one source, add a freshness gate in P2).
- **`buildThemeConfig` / brand engine** — the mock foundation resolver's output must match `ThemeConfig` shape so P2 is a data swap, not a migration.
- **Convex** is the real-time single source of truth; brands list is a read-only query (D-02); add `experience*` tables (D-08) following `packages/convex/convex/schema.ts` conventions.
- **Vercel AI SDK (`ai@^6`, `@ai-sdk/anthropic`, `@ai-sdk/react`)** already present — model layer only; structured IR via `Output.object()` (NOT deprecated `generateObject`).

### Established Patterns
- New web code follows monorepo conventions (`STRUCTURE.md` § "Where to Add New Code"): packages under `packages/`, routes under `apps/platform/src/app/(platform)/...`, CSS Modules + token-only styling, no literals (`check:literals` gate).
- Route groups: existing `(studio)` and `(builder)`; the Lab adds a sibling `(experience-lab)` group (Claude's-discretion entry-point decision).
- Surface Context + Typography V2 + zero-literal rules from `CLAUDE.md` apply to the Lab's own UI.

### Integration Points
- **Convex schema** (`packages/convex/convex/schema.ts`) — new `experience*` tables for runs + IR.
- **Platform nav** — new "Experience Lab" entry pointing at the isolated route group.
- **ToV/Design agents** (`api/voice`, `api/composition`) — P1 defines the integration contract/placeholder; no execution.
- **CI** — import-guard + existing-Builder smoke test + `pnpm why ai` single-version gate (isolation pitfall #3, #1).

</code_context>

<specifics>
## Specific Ideas

- The IR schema must have **no** free-text/HTML/`rawHtml`/`children:string` field; an adversarial "just give me the HTML" prompt must yield valid IR or a gap report, never markup (PITFALLS #2). The compiler is the only thing that ever emits JSX.
- The mock generation workflow must produce a **valid IR** that passes the basic AST validator and the markup-free contract — the artifact card only appears for valid IR (gap → gap-report card, no artifact).
- Validator operates on the **AST with allowlists** (imports in registry, components in registry, no literals) — never string denylists (PITFALLS #5).
- All four HIGH-severity pitfalls are P1 *decisions* even where implementation lands later: separate preview origin is **decided + documented** in P1 (built P3); the non-web **foundation-coverage audit** is a P1 deliverable.

</specifics>

<deferred>
## Deferred Ideas

- **Chat-style activity feed / chat-based iteration** — deferred to P3 (INPUT-05). P1 uses a run-inspector timeline panel.
- **Canvas layout sync to Convex** — deferred (P1 keeps layout ephemeral, D-08); revisit with collaboration (P5, PROD-01).
- **Real-DOM preview in the artifact card** — P3 (PREV-*); P1 shows a structured IR summary.
- **Real `@ag-ui/*` adapter** — P5 only if external-frontend interop is needed (INTEROP-01, v2).
- **Embeddings/RAG component retrieval** — v2 (REG-05); P1/P2 use static typed metadata as the gate.

None of these were scope creep — they are real future-phase items surfaced while clarifying P1 boundaries.

</deferred>

---

*Phase: 01-isolated-foundation*
*Context gathered: 2026-05-30*
