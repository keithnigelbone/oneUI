# Phase 3: Preview / Eval / Repair - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the quality loop that makes "AI cannot bypass the Jio Design System" provable rather than aspirational. A generated artifact (from the IR pipeline shipped in Phases 1–2) must: render as real DOM in an **isolated runtime**, be **screenshotted**, be **fully validated** (deterministic, AST-allowlist based), be **scored by a Visual Evaluator**, be **repaired by patching the IR** (never JSX) within a **bounded loop**, and be **frozen as an immutable, browsable version** with variant grouping.

In scope (Phase 3 requirements): CANVAS-05, CANVAS-06, INPUT-05, ORCH-02, GEN-07, VAL-04, VAL-05, VAL-06, PREV-01, PREV-02, PREV-03, PREV-04, EVAL-01, EVAL-02, EVAL-03, VER-01, VER-02. Mode: **mvp**.

Out of scope (later phases): non-web campaign/social output (Phase 4); multi-user collaboration, observability/cost telemetry, durable workflow persistence, security-hardening review, handoff bundle export (Phase 5).
</domain>

<decisions>
## Implementation Decisions

### Preview isolation & screenshot execution (PREV-01 / PREV-04)
- **D-01:** **Daytona is the MVP preview/screenshot/eval execution environment** — not iframe+CSP alone. Rationale: Phase 3 is fundamentally about preview → screenshot → visual evaluation → repair, and the user wants high confidence in generated UI quality from the start. Daytona gives a stronger isolated runtime for rendering the compiled artifact, capturing screenshots, and running eval/repair without exposing the host app, auth/session, or Convex access.
- **D-02:** **Keep a `PreviewExecutor` interface** as the seam. Implement **`DaytonaExecutor` first** (MVP path). Keep **`IframeCspExecutor` as a fallback / local-dev path** (also satisfies PREV-01's "separate origin + strict CSP" wording for local work). The executor abstraction means the isolation backend is swappable.
- **D-03:** **Daytona does NOT relax generation rules and does NOT own React output.** The IR compiler still owns React+Jio-CSS generation. Daytona *only* executes/previews/screenshots the already-compiled, constrained artifact. Daytona is the **runtime confidence layer**, not part of the generation contract. Strict isolation invariant stands: the preview cannot read cookies/Convex tokens/auth/session (PREV-01).
- **D-04:** Preview lifecycle (PREV-03: thumbnail → lightweight → live) and per-profile (desktop/mobile/fixed) framing still apply; the executor renders per output profile. Canvas perf budget (≥30fps, 50+ cards) is a planning/impl concern for the lifecycle, not re-litigated here.

### Quality contract (end-to-end pipeline order — locks the run shape)
- **D-05:** The Phase 3 pipeline MUST follow this 10-step contract:
  1. LLM emits structured **IR only**.
  2. IR references **approved One UI / Jio components only**.
  3. Props, slots, variants, tokens come from the **live registry / Storybook metadata** (single source of truth).
  4. Compiler emits **React + Jio CSS**.
  5. **Typecheck + validator pass** (deterministic).
  6. **Daytona renders** the compiled artifact in isolation.
  7. **Screenshot** captured.
  8. **Visual evaluator** checks component fidelity, hierarchy, spacing, token usage, accessibility, density, brand fit.
  9. **Failed score triggers bounded repair.**
  10. **Approved output is frozen** as a versioned, browsable artifact.

### Visual Evaluator (EVAL-01)
- **D-06:** **Two-track scoring.** Objective dimensions (token usage, component correctness, compile/render, a11y contrast) are **hard pass/fail from the deterministic validator** — a fail short-circuits straight to repair (no LLM call needed). Subjective dimensions (hierarchy, spacing, density, brand fit) are scored by a **multimodal LLM judge** reading the Daytona screenshot against a **rubric (0–5)**.
- **D-07:** **Weighted composite < threshold → repair.** Exact weights/threshold/epsilon are a planning/tuning detail (start simple, make tunable).
- **D-08:** **Best-of-N at generation; the judge ranks and the best variant wins.** (Ties into GEN-07 multi-variant.)

### Repair loop (EVAL-02 / EVAL-03 / ORCH-02)
- **D-09:** Repair emits **targeted JSON-patch ops against the failing IR nodes only** — never whole-IR regeneration, never JSX edits. **Reuse the frozen `experience-builder-core` JSON-patch contract** from Phase 1.
- **D-10:** **Convergence detection:** stop early if the composite score doesn't improve by ≥ epsilon between attempts **OR** the same validation error repeats.
- **D-11:** **Hard cap N=3** + a **per-run token/time budget**. A **missing component / missing profile short-circuits to a gap report immediately** (zero repair attempts) — never loops on an unsatisfiable gap.

### Version history & variants (VER-01 / VER-02 / CANVAS-05 / GEN-07)
- **D-12:** **Extend the existing append-only Convex tables** — do NOT introduce a new variant-group table for the MVP. Add an optional `variantGroupId` on `experienceArtifacts` so N sibling artifacts cluster into a group; versions chain within an artifact via `parentVersionId`.
- **D-13:** `experienceArtifactVersions` carries the full VER-01 version object: `ir`, `bundle`, `previewState`, `thumbnail`, `validationResult`, `evaluationResult`, `parentVersionId?`, `originRunId`. Append-only (consistent with Phase 1/2 D-07/D-08 — no destructive migrations).
- **D-14:** **Canvas UX:** a variant group renders as a **tldraw frame grouping the sibling cards**; version history is a **per-card version timeline panel** (VER-02 browse).

### Claude's Discretion
- Exact evaluator weights, composite formula, pass threshold, and convergence epsilon (start simple + tunable).
- `PreviewExecutor` interface shape and DaytonaExecutor wiring specifics (SDK, sandbox lifecycle, warm-pool vs per-run) — subject to the Daytona feasibility research below.
- Preview lifecycle transition mechanics (thumbnail → lightweight → live) and canvas perf tactics.
- AST allowlist validator internals for VAL-04/05/06 (build on existing AST codegen/validator from Phases 1–2).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` § "Phase 3: Preview / Eval / Repair" — goal + 5 success criteria.
- `.planning/REQUIREMENTS.md` — full text of the 17 Phase 3 requirements (CANVAS-05/06, INPUT-05, ORCH-02, GEN-07, VAL-04/05/06, PREV-01/02/03/04, EVAL-01/02/03, VER-01/02).
- `.planning/PROJECT.md` — core value ("AI cannot bypass the Jio Design System"), hard constraints (Mastra orchestration / AI-SDK model-only; IR canonical; sandboxed previews isolated from host), isolation rules.

### Existing assets this phase builds on
- `apps/platform/src/app/internal/render-ast/` and `apps/platform/src/app/internal/render-code/` — existing sandboxed render routes (the IframeCspExecutor fallback path builds on these).
- `packages/experience-builder-preview/` — net-new (currently empty) — the preview package to build (`PreviewExecutor`, `DaytonaExecutor`, `IframeCspExecutor`).
- `packages/experience-builder-core/` — frozen IR contract + JSON-patch mechanism (reused by the repair loop, D-09).
- `packages/experience-builder-validation/` — AST validator (extend for VAL-04/05/06).
- `packages/experience-builder-agents/` — Mastra workflow; the Phase 3 evaluator + repair agents extend this (the run we proved end-to-end in Phase 02.1).
- `convex/` schema — `experienceArtifacts` + `experienceArtifactVersions` tables already exist (extend per D-12/D-13).
- `.planning/codebase/ARCHITECTURE.md`, `STACK.md`, `INTEGRATIONS.md`, `CONCERNS.md` — codebase maps.

### External / vendor (research targets — see deferred/specifics)
- Daytona — preview/screenshot/eval execution sandbox (MVP isolation backend, D-01). No internal doc yet; needs a research/feasibility pass during planning (SDK, sandbox lifecycle, cost/latency, credential-free Playwright inside the sandbox, network egress controls to enforce no-Convex/no-auth access).
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `render-ast` / `render-code` internal routes: basis for the `IframeCspExecutor` fallback/local-dev path.
- `experience-builder-core` JSON-patch contract: the repair loop patches the IR through this (D-09) — already frozen and tested.
- `experience-builder-validation` AST validator: extend with allowlists for VAL-04 (literal color/spacing/type/radius/elevation/motion blocking) and the VAL-05 red-team corpus.
- Mastra workflow in `experience-builder-agents` (`createWorkflow`/`createStep`): add `evaluate` + `repair` steps after `validate`; the run pipeline is proven (Phase 02.1).
- Convex `experienceArtifacts` / `experienceArtifactVersions` tables: extend (append-only) for VER-01/02 + variant grouping.

### Established Patterns
- **Mastra owns orchestration; Vercel AI SDK is the model layer only** (single `callModel` seam). The multimodal visual judge call MUST go through that seam.
- **Append-only Convex persistence** (D-07/D-08 from prior phases) — versions/variants extend tables, no destructive migration.
- **Zod 4 ↔ Anthropic structured-output gotchas** (learned in 02.1): no integer `min/max` (avoid `.int()`/`.min()` on numbers), no `propertyNames` (use `z.object({}).catchall(...)` not keyed `z.record`). The evaluator's structured rubric output must respect this.
- **IR is the only source of truth; repair patches the IR, never JSX.**

### Integration Points
- New preview package ← consumed by the run route / canvas for rendering + screenshots.
- Evaluator + repair steps ← inserted into the existing Mastra workflow between `validate` and the terminal `version-freeze`.
- Daytona ← invoked by the `DaytonaExecutor` behind `PreviewExecutor`; must be network-isolated from Convex/auth.
</code_context>

<specifics>
## Specific Ideas

- **Daytona is explicitly the chosen MVP execution backend** (the user raised it specifically and asked it not be forgotten). Vercel Sandbox was considered as an alternative microVM option; iframe+CSP is retained as the fallback/local-dev executor. The `PreviewExecutor` seam keeps all three expressible.
- User's framing: "Daytona is the confidence layer for isolated runtime preview, screenshot capture, and visual validation" — it does not change generation rules.
- The 10-step quality contract (D-05) is the user's explicit definition of the end-to-end run and should anchor the plan's task sequence.
</specifics>

<deferred>
## Deferred Ideas

- **Daytona feasibility/cost research** is a planning prerequisite, not a separate capability — the planner should front-load a research/spike task on the Daytona SDK, sandbox lifecycle (warm pool vs per-run), per-preview cost/latency, running credential-free Playwright inside the sandbox, and enforcing network egress isolation (no Convex/auth reachability). If Daytona proves infeasible/over-budget for the MVP, the `PreviewExecutor` seam (D-02) lets the IframeCspExecutor be the MVP path without rework.
- **Vercel Sandbox** as an alternative `PreviewExecutor` implementation — kept as a documented future swap, not built in Phase 3.
- Production hardening of the preview/sandbox (security review), observability/cost telemetry on eval+repair runs, durable persistence of in-flight repair state — Phase 5.
- Non-web output profiles (IG/carousel/outdoor) for preview/eval — Phase 4.

### Reviewed Todos (not folded)
None — no pending todos matched this phase.
</deferred>

---

*Phase: 3-Preview / Eval / Repair*
*Context gathered: 2026-06-01*
