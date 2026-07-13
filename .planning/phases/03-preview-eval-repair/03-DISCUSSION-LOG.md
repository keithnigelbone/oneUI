# Phase 3: Preview / Eval / Repair - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 3-Preview / Eval / Repair
**Areas discussed:** Preview isolation + screenshot exec, Visual Evaluator design, Repair loop control, Version history + variants

---

## Preview isolation + screenshot execution

| Option | Description | Selected |
|--------|-------------|----------|
| iframe + separate-origin + CSP | PREV-01 as written; render-ast/render-code exist; lightest | |
| Vercel Sandbox | Ephemeral Firecracker microVM; native to Vercel; heavier | |
| Daytona | Sandbox/dev-env execution; new vendor | |
| iframe now, sandbox-ready seam | Ship iframe MVP behind a PreviewExecutor interface, sandbox as future swap | |

**User's choice:** Daytona as the MVP execution env (overriding the presented options).
**Notes:** First reply: "but add Daytona please." On clarification (Daytona now vs future swap), chose **Daytona as the MVP execution env** with rationale: Phase 3 is about preview/screenshot/visual-eval/repair and they want high confidence in generated UI quality from the start. Architecture locked: keep `PreviewExecutor` interface; implement `DaytonaExecutor` first; keep `IframeCspExecutor` as fallback/local-dev. Daytona only executes/previews/screenshots the compiled artifact — does NOT relax generation rules, IR compiler still owns React output. Supplied a 10-step end-to-end quality contract (see CONTEXT.md D-05).

---

## Visual Evaluator design

| Option | Description | Selected |
|--------|-------------|----------|
| Two-track: deterministic gate + LLM visual judge | Objective dims hard-gated by validator; subjective dims LLM-judged 0–5; best-of-N | ✓ |
| LLM-judge-primary | One multimodal model scores all dims; validator only gates compile+token | |
| Deterministic-first, LLM judge phased | MVP deterministic + heuristics; subjective judge fast-follow | |

**User's choice:** Two-track: deterministic gate + LLM visual judge.
**Notes:** Validator fail → immediate repair (no LLM). Subjective composite < threshold → repair. Best-of-N at generation, judge ranks.

---

## Repair loop control

| Option | Description | Selected |
|--------|-------------|----------|
| Targeted IR JSON-patch + score-delta convergence | JSON-patch failing IR nodes (frozen core contract); converge on Δscore<epsilon or repeated error | ✓ |
| Whole-section regeneration | Re-generate failing section IR from scratch | |
| Hybrid: patch first, escalate to regen | Patch then escalate by attempt 2 | |

**User's choice:** Targeted IR JSON-patch + score-delta convergence.
**Notes:** Never JSX. N=3 cap + per-run budget. Missing component/profile → immediate gap, no loop.

---

## Version history + variants

| Option | Description | Selected |
|--------|-------------|----------|
| Extend existing tables: variantGroupId + version chain | Add variantGroupId on experienceArtifacts; versions chain via parentVersionId; tldraw frame + timeline UX | ✓ |
| First-class variantGroups table | Dedicated variantGroups entity | |
| Derive groups from originRun | No explicit field; derived at query time | |

**User's choice:** Extend existing tables: variantGroupId + version chain.
**Notes:** Append-only (consistent with prior phases). Variant group = tldraw frame of sibling cards; history = per-card version timeline panel.

## Claude's Discretion

- Evaluator weights / composite formula / pass threshold / convergence epsilon (start simple + tunable).
- PreviewExecutor interface shape + Daytona sandbox lifecycle specifics (pending feasibility research).
- Preview lifecycle transition mechanics + canvas perf tactics.
- AST allowlist validator internals (VAL-04/05/06), building on existing validation package.

## Deferred Ideas

- Daytona feasibility/cost/latency + network-egress-isolation research — planning prerequisite (front-load as research/spike).
- Vercel Sandbox as a documented future PreviewExecutor swap.
- Preview/sandbox security hardening, observability/cost telemetry, durable in-flight repair state — Phase 5.
- Non-web output-profile preview/eval — Phase 4.
