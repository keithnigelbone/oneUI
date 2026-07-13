# Phase 3: Preview / Eval / Repair - Research

**Researched:** 2026-06-01
**Domain:** Sandboxed isolated runtime preview (Daytona) + headless screenshot capture (Playwright) + AST allowlist validation + multimodal LLM-as-judge visual scoring + bounded JSON-patch IR repair (Mastra workflow) + append-only Convex version/variant persistence + tldraw canvas frame grouping
**Confidence:** HIGH (existing repo assets verified by direct read; Daytona API verified via official docs + npm; Mastra loop/HITL primitives verified in installed `@mastra/core@1.37.1` type defs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Preview isolation & screenshot execution (PREV-01 / PREV-04)**
- **D-01:** Daytona is the MVP preview/screenshot/eval execution environment — not iframe+CSP alone. Daytona gives a stronger isolated runtime for rendering the compiled artifact, capturing screenshots, and running eval/repair without exposing the host app, auth/session, or Convex access.
- **D-02:** Keep a `PreviewExecutor` interface as the seam. Implement `DaytonaExecutor` first (MVP path). Keep `IframeCspExecutor` as a fallback / local-dev path (also satisfies PREV-01's "separate origin + strict CSP" wording for local work). The executor abstraction means the isolation backend is swappable.
- **D-03:** Daytona does NOT relax generation rules and does NOT own React output. The IR compiler still owns React+Jio-CSS generation. Daytona *only* executes/previews/screenshots the already-compiled, constrained artifact. Daytona is the runtime confidence layer, not part of the generation contract. Strict isolation invariant stands: the preview cannot read cookies/Convex tokens/auth/session (PREV-01).
- **D-04:** Preview lifecycle (PREV-03: thumbnail → lightweight → live) and per-profile (desktop/mobile/fixed) framing still apply; the executor renders per output profile. Canvas perf budget (≥30fps, 50+ cards) is a planning/impl concern for the lifecycle, not re-litigated here.

**Quality contract (10-step end-to-end pipeline order — D-05):**
1. LLM emits structured IR only.
2. IR references approved One UI / Jio components only.
3. Props, slots, variants, tokens come from the live registry / Storybook metadata (single source of truth).
4. Compiler emits React + Jio CSS.
5. Typecheck + validator pass (deterministic).
6. Daytona renders the compiled artifact in isolation.
7. Screenshot captured.
8. Visual evaluator checks component fidelity, hierarchy, spacing, token usage, accessibility, density, brand fit.
9. Failed score triggers bounded repair.
10. Approved output is frozen as a versioned, browsable artifact.

**Visual Evaluator (EVAL-01)**
- **D-06:** Two-track scoring. Objective dimensions (token usage, component correctness, compile/render, a11y contrast) are hard pass/fail from the deterministic validator — a fail short-circuits straight to repair (no LLM call needed). Subjective dimensions (hierarchy, spacing, density, brand fit) are scored by a multimodal LLM judge reading the Daytona screenshot against a rubric (0–5).
- **D-07:** Weighted composite < threshold → repair. Exact weights/threshold/epsilon are a planning/tuning detail (start simple, make tunable).
- **D-08:** Best-of-N at generation; the judge ranks and the best variant wins. (Ties into GEN-07 multi-variant.)

**Repair loop (EVAL-02 / EVAL-03 / ORCH-02)**
- **D-09:** Repair emits targeted JSON-patch ops against the failing IR nodes only — never whole-IR regeneration, never JSX edits. Reuse the frozen `experience-builder-core` JSON-patch contract from Phase 1.
- **D-10:** Convergence detection: stop early if the composite score doesn't improve by ≥ epsilon between attempts OR the same validation error repeats.
- **D-11:** Hard cap N=3 + a per-run token/time budget. A missing component / missing profile short-circuits to a gap report immediately (zero repair attempts) — never loops on an unsatisfiable gap.

**Version history & variants (VER-01 / VER-02 / CANVAS-05 / GEN-07)**
- **D-12:** Extend the existing append-only Convex tables — do NOT introduce a new variant-group table for the MVP. Add an optional `variantGroupId` on `experienceArtifacts` so N sibling artifacts cluster into a group; versions chain within an artifact via `parentVersionId`.
- **D-13:** `experienceArtifactVersions` carries the full VER-01 version object: `ir`, `bundle`, `previewState`, `thumbnail`, `validationResult`, `evaluationResult`, `parentVersionId?`, `originRunId`. Append-only (no destructive migrations).
- **D-14:** Canvas UX: a variant group renders as a tldraw frame grouping the sibling cards; version history is a per-card version timeline panel (VER-02 browse).

### Claude's Discretion
- Exact evaluator weights, composite formula, pass threshold, and convergence epsilon (start simple + tunable).
- `PreviewExecutor` interface shape and DaytonaExecutor wiring specifics (SDK, sandbox lifecycle, warm-pool vs per-run) — subject to the Daytona feasibility research below.
- Preview lifecycle transition mechanics (thumbnail → lightweight → live) and canvas perf tactics.
- AST allowlist validator internals for VAL-04/05/06 (build on existing AST codegen/validator from Phases 1–2).

### Deferred Ideas (OUT OF SCOPE)
- Daytona feasibility/cost research is a planning prerequisite (front-loaded below). If Daytona proves infeasible/over-budget, the `PreviewExecutor` seam (D-02) lets `IframeCspExecutor` be the MVP path without rework.
- Vercel Sandbox as an alternative `PreviewExecutor` implementation — documented future swap, not built in Phase 3.
- Production hardening of the preview/sandbox (security review), observability/cost telemetry on eval+repair runs, durable persistence of in-flight repair state — Phase 5.
- Non-web output profiles (IG/carousel/outdoor) for preview/eval — Phase 4.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CANVAS-05 | User can group multiple variants of an artifact into a variant group | `variantGroupId` on `experienceArtifacts` (D-12); tldraw frame grouping (D-14, Pattern 7). Existing `experienceArtifacts` table read at `schema.ts:2007`. |
| CANVAS-06 | Generated web UIs render as real DOM in a preview frame, not flattened raster | Daytona-hosted live iframe (D-01/D-02) + 3-stage lifecycle (PREV-03). Real-DOM render via existing `/internal/render-ast` (ASTRenderer). |
| INPUT-05 | User can iterate on an existing artifact via chat or artifact actions | New run seeded from `parentVersionId`; reuses run route → workflow seam. Patch-based iteration via `diffIr`/`applyPatch` (`patch.ts`). |
| ORCH-02 | Workflow supports retries, bounded repair loops, and HITL suspend/resume checkpoints | `@mastra/core@1.37.1` verified to expose `.dountil(step, condition)` + `suspend`/`resumeData` in step execute (type defs read directly). |
| GEN-07 | System can produce multiple variants of an artifact | Best-of-N at generation (D-08); judge ranks; siblings clustered via `variantGroupId`. Reuses existing `runExperienceWorkflow` N times or N-fan-out step. |
| VAL-04 | Validation blocks arbitrary literal color/spacing/type/radius/elevation/motion values + unapproved fonts/icons | Extend `checkLiteralHook` skeleton in `astValidator.ts:265` from warning→blocking; classify via `BRAND_ALLOWED_REGEX` token boundary. |
| VAL-05 | Validation operates on AST allowlists + tested against red-team corpus | `REDTEAM_FIXTURES` (`fixtures/redteam.ts`, 6 entries today) — extend with literal/aliased/fake-`var()`/dynamic-className entries. Validator is already structural. |
| VAL-06 | Validation confirms TypeScript compiles and the preview renders | Typecheck step + Daytona render-success signal. Reuses compiler output + executor render result. |
| PREV-01 | Sandboxed iframe isolated (separate origin, strict CSP, no auth/session/Convex) | Daytona `networkBlockAll: true` zero-egress (verified via docs) + existing `PREVIEW-DECISION.md` separate-origin model for `IframeCspExecutor`. |
| PREV-02 | Each artifact version has an immutable preview URL/state | `previewState` on version row (D-13); Daytona `getSignedPreviewUrl(port, expiresInSeconds)` for live frames. |
| PREV-03 | Desktop/mobile/fixed profiles + lifecycle (thumbnail→lightweight→live) | Output profile framing (existing `DEFAULT_VIEWPORTS` in `playwrightRenderer.ts`); lifecycle is a canvas-card render-state machine. |
| PREV-04 | Preview frames screenshotted by credential-free Playwright workers | Existing `captureASTScreenshots`/`captureCodeScreenshots` harness (`playwrightRenderer.ts`) — runs Playwright headless; move into Daytona for full isolation. |
| EVAL-01 | Visual Evaluator scores on compliance, brand fit, hierarchy, layout, component correctness, a11y, responsiveness, content quality, export readiness | Two-track (D-06): deterministic validator + multimodal judge. Existing `composition/verify/route.ts` is the verified judge pattern to mirror. |
| EVAL-02 | Repair agent applies patch-based fixes to IR (not JSX) and recompiles | `diffIr`/`applyPatch` over IR (`patch.ts`); repair step re-enters compile→validate→evaluate. Mirror `composition/repair/route.ts` prompt shape. |
| EVAL-03 | Repair loops bounded (hard cap + convergence + per-run budget); missing component/profile → gap | Mastra `.dountil` with `attempt<3 && improved && !sameError`; gap short-circuit reuses existing `generate-ir` gap branch (`workflow.ts:481`). |
| VER-01 | Versions persisted (IR, bundle, preview state, thumbnail, validation, evaluation, parent, run) | Extend `experienceArtifactVersions` (`schema.ts:2025`) additively per D-13; extend `persistArtifact` mutation (`experienceRuns.ts:89`). |
| VER-02 | User can view version history of an artifact | `getArtifactHistory` query exists (`experienceRuns.ts:173`); add per-card timeline panel (D-14). |
</phase_requirements>

## Summary

Phase 3 closes the quality loop. The single most important finding is that **this repo already contains a working, verified implementation of nearly every hard part of this phase** — just not yet wired into the experience-builder packages. The existing `apps/platform/src/lib/playwrightRenderer.ts` launches headless Chromium, navigates a token-handoff render route (`/internal/render-ast`), waits for fonts + brand-CSS settle, and captures per-viewport PNGs. The existing `apps/platform/src/app/api/composition/verify/route.ts` takes those PNGs, uploads them to Convex storage, and runs a Claude-vision rubric judge — the exact EVAL-01 pattern. The existing `composition/repair/route.ts` is the repair-prompt pattern. The frozen `experience-builder-core/src/ir/patch.ts` already provides `diffIr`/`applyPatch` (RFC-6902-style) for IR-only repair (D-09). The `experience-builder-validation/src/astValidator.ts` already has a `checkLiteralHook` skeleton explicitly marked "full scan deferred to P3 VAL-04". And `@mastra/core@1.37.1` (installed) exposes `.dountil(step, condition)` plus `suspend`/`resumeData` — the bounded-loop and HITL primitives ORCH-02/EVAL-03 require.

The genuinely net-new work is: (1) the `PreviewExecutor` seam + `DaytonaExecutor` in the empty `experience-builder-preview` package; (2) tightening the validator literal hook from warning to blocking and expanding the red-team corpus; (3) inserting `evaluate` + `repair` steps into the Mastra workflow after `validate`; (4) additive Convex schema fields per D-13 + a `variantGroupId`; and (5) tldraw frame-grouping + version-timeline canvas UX.

**Daytona feasibility verdict: GO for MVP, with `IframeCspExecutor` as the de-risking fallback.** The Daytona TypeScript SDK (`@daytonaio/sdk@0.183.0`, published from the official `daytonaio/daytona` repo, no postinstall) supports programmatic create/start/stop/delete/snapshot, sub-90ms warm-pool cold starts, `getSignedPreviewUrl(port)` for live preview frames, and — critically for PREV-01 — `networkBlockAll: true` for a true zero-egress sandbox that *cannot* reach Convex/auth. Per-preview cost is a few cents (≈$0.067/vCPU-hr for a 1-vCPU/1-GiB box; a 30-second eval run ≈ $0.0006). The one open risk is that programmatic CDP-endpoint exposure for connecting Playwright into the Daytona sandbox is a recently-requested feature (GitHub issue #4456); the safe MVP is to run Playwright *inside* the sandbox (where the SDK runs arbitrary processes + has a native screenshot API) rather than connecting to it from outside.

**Primary recommendation:** Build `PreviewExecutor` with `IframeCspExecutor` first (reuses 100% of the existing token-handoff + Playwright harness, ships the lifecycle/eval/repair/version loop end-to-end with zero vendor risk), then add `DaytonaExecutor` as the second implementation behind the same seam (network-isolated production path). Insert `evaluate`/`repair` as Mastra `.dountil`-bounded steps after `validate`. Extend Convex additively. Mirror the proven `composition/verify` + `composition/repair` route patterns, routed through the existing `callModel` seam (Zod-4 `.catchall` gotchas already handled in `irGenerator.ts`).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| IR → React + Jio CSS compile | `experience-builder-agents` (compiler, existing) | — | Generation contract owns codegen; Daytona never compiles (D-03). |
| Deterministic AST validation (VAL-04/05/06) | `experience-builder-validation` (Node, pure) | `experience-builder-agents` (workflow validate step) | Security boundary must be pure + testable; no network, no LLM. |
| Sandboxed render + screenshot (PREV-01/04) | `experience-builder-preview` (`PreviewExecutor`) | Daytona sandbox / Playwright worker (separate origin) | Untrusted-code execution must be a browser/VM-enforced trust boundary, not the Lab origin. |
| Multimodal visual scoring (EVAL-01 subjective track) | `experience-builder-agents` (evaluate step via `callModel`) | Anthropic vision model (model layer only, ORCH-04) | Orchestration owns sequencing; AI SDK is model-only. |
| Bounded repair loop (EVAL-02/03, ORCH-02) | `experience-builder-agents` (Mastra `.dountil` + `patch.ts`) | `experience-builder-core` (`diffIr`/`applyPatch`) | Mastra is the orchestration brain; IR patch contract is frozen + reused. |
| Version + variant persistence (VER-01/02, CANVAS-05) | Convex (`experienceArtifactVersions`, `experienceArtifacts`) | — | Convex is the single source of truth; append-only (D-12/D-13). |
| Variant frame grouping + version timeline UI (CANVAS-05/06, VER-02) | `apps/platform` experience-lab route (tldraw) | `@oneui/ui` Jio components for the panels | Canvas + panel UI is presentation tier; reads Convex via `useQuery`. |
| Preview lifecycle state machine (PREV-03) | `apps/platform` canvas card shape | `experience-builder-preview` (live-frame URL) | Thumbnail→lightweight→live is a per-card render-state concern (perf budget). |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@daytonaio/sdk` | `0.183.0` | Programmatic isolated sandbox lifecycle + zero-egress network policy + signed preview URLs + native screenshot (DaytonaExecutor, D-01) | [VERIFIED: npm registry — but treat as [ASSUMED] per provenance rule] Official TypeScript SDK from `daytonaio/daytona`; only vendor SDK that exposes `networkBlockAll` zero-egress required by PREV-01. Published 2026-05-29. |
| `@mastra/core` | `1.37.1` (installed) | Workflow orchestration: `.dountil` bounded loop, `suspend`/`resumeData` HITL (ORCH-02, EVAL-03) | [VERIFIED: installed type defs at `node_modules/@mastra/core/dist/workflows/workflow.d.ts:227-228`] Already the project's orchestration brain; pinned in Phase 1. |
| `playwright` | `1.59.1` (installed) | Credential-free headless Chromium screenshot capture (PREV-04) | [VERIFIED: installed at `node_modules/playwright/package.json`] Already used by `playwrightRenderer.ts`; repo standard for visual capture. |
| `ai` + `@ai-sdk/anthropic` | `^6.0.111` / `^3.0.54` (installed) | Multimodal vision judge model call ONLY, via `callModel` seam (EVAL-01) | [VERIFIED: STACK.md + `modelAdapter.ts`] Model layer only (ORCH-04). `CLAUDE_VISION_MODEL = claude-sonnet-4-6` supports image input natively. |
| `convex` | `^1.39.1` (installed) | Append-only version/variant persistence + storage for thumbnails/screenshots (VER-01) | [VERIFIED: STACK.md] Single source of truth; `_storage` already used by `renderedScreenshots`. |
| `zod` | `^4.3.6` (installed) | Structured evaluator rubric output schema | [VERIFIED: STACK.md] Repo standard; Zod-4↔Anthropic gotchas already solved (`irGenerator.ts:111`). |
| `tldraw` | `^4.5.3` (installed) | Canvas frame grouping for variants + version-timeline anchoring (CANVAS-05/06, D-14) | [VERIFIED: STACK.md] Existing isolated canvas from Phase 1. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `node:crypto` `randomUUID` | builtin | Short-lived single-use preview tokens | Already used by `playwrightRenderer.ts` token handoff. |
| (none new) | — | The `IframeCspExecutor` path reuses the existing render routes + Playwright harness | MVP de-risk path; no new dependency. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Daytona | Vercel Sandbox (microVM) | Deferred (CONTEXT). Documented future `PreviewExecutor` swap. No `networkBlockAll`-equivalent verified. |
| Daytona | E2B / Modal | Comparable sandbox runners; Daytona chosen by user (D-01). E2B has similar zero-egress but user explicitly picked Daytona. |
| Daytona (MVP) | `IframeCspExecutor` only | The seam (D-02) keeps both. IframeCsp is the local-dev + fallback path; if Daytona over-budget, IframeCsp is the MVP with no rework. |
| `diffIr`/`applyPatch` (frozen) | `fast-json-patch` npm | DON'T — the repo already froze a self-contained RFC-6902 impl in `patch.ts` (D-09). Adding a dep duplicates it and risks drift. |

**Installation:**
```bash
pnpm --filter @oneui/experience-builder-preview add @daytonaio/sdk
# playwright, ai, @ai-sdk/anthropic, convex, zod, tldraw, @mastra/core already installed
```

**Version verification:**
- `@daytonaio/sdk` — `npm view @daytonaio/sdk version` → `0.183.0`, published `2026-05-29`. Repo: `git+https://github.com/daytonaio/daytona.git`. No `postinstall` script (verified via `npm view ... scripts.postinstall` → empty).
- `@mastra/core@1.37.1` — installed; `.dountil`/`.dowhile`/`.branch`/`bail`/`suspend`/`resumeSchema` all present in dist type defs.
- `playwright@1.59.1` — installed (npm latest is `1.60.0`; pin to installed for parity with existing harness).

## Package Legitimacy Audit

> slopcheck was **not installable** in this research environment (`pip install slopcheck` failed, no network/index). Per the graceful-degradation protocol, the new package below is tagged `[ASSUMED]` and the planner MUST gate its install behind a `checkpoint:human-verify` task. Manual registry + repo + postinstall checks were performed and are recorded.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `@daytonaio/sdk` | npm | published 2026-05-29 (v0.183.0; active release train incl. `dev`/`rc`/`alpha` tags) | not retrieved offline | `github.com/daytonaio/daytona` (official monorepo, matches vendor docs domain daytona.io) | unavailable | **Approved-pending-verify** — planner adds `checkpoint:human-verify` before install |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none (manual checks clean: official repo, no postinstall, vendor docs corroborate the package). slopcheck unavailable → `[ASSUMED]` → human-verify gate required.

**Manual checks performed:**
- `npm view @daytonaio/sdk repository.url` → `git+https://github.com/daytonaio/daytona.git` (matches the official vendor's GitHub org referenced throughout daytona.io docs — not a typosquat).
- `npm view @daytonaio/sdk scripts.postinstall` → empty (no install-time code execution).
- Active multi-channel dist-tags (`latest`/`next`/`rc`/`dev`/`alpha`) indicate a maintained, real SDK, not a squat.

## Architecture Patterns

### System Architecture Diagram

```
                         apps/platform — experience-lab route (authenticated, Convex session)
  ┌──────────────────────────────────────────────────────────────────────────────────────┐
  │  tldraw canvas: prompt card → "Run" → run route (POST)                                  │
  │       │                                              ▲ AG-UI event stream (existing)    │
  │       ▼                                              │                                  │
  │  run route handler (Node)  ──── injects foundationsLoader ───▶                          │
  └───────┼──────────────────────────────────────────────────────────────────────────────┘
          ▼
  experience-builder-agents — Mastra workflow (ORCHESTRATION BRAIN, ORCH-04)
  intent → resolve → retrieve → plan → design → copy → generate-ir → compile → validate
                                                                                  │
                                                       ┌──────────────────────────┤ (NEW P3)
                                                       ▼                          │
                                              [objective fail?] ──yes──▶ repair ──┘
                                                       │ no                  ▲ .dountil(N<3 &&
                                                       ▼                     │  improved && !sameErr)
                                          ┌──── preview ────┐                │
                                          │ PreviewExecutor │                │
                                          │  (D-02 seam)    │                │
                                          │  ┌────────────┐ │                │
                                          │  │DaytonaExec │ │  zero-egress   │
                                          │  │ networkBlock│ │ sandbox       │
                                          │  │  All=true   │ │ render IR→DOM │
                                          │  └────────────┘ │ + screenshot  │
                                          │  ┌────────────┐ │                │
                                          │  │IframeCspExec│ │ (fallback:    │
                                          │  │ token-hando│ │  separate     │
                                          │  │ ff + PW    │ │  origin +CSP) │
                                          │  └────────────┘ │                │
                                          └────────┬────────┘                │
                                                   ▼ screenshot PNG          │
                                          evaluate (NEW P3)                  │
                                          ├─ objective: validator pass/fail ─┘ (short-circuit)
                                          └─ subjective: callModel(vision rubric 0–5) → composite
                                                   │ composite ≥ threshold
                                                   ▼
                                          version-freeze (NEW P3)
                                                   │
                                                   ▼
  Convex (append-only)                  experienceArtifactVersions row:
  ┌──────────────────────────────┐      { ir, compiledBundle, previewState, thumbnail (storageId),
  │ experienceArtifacts          │◀─────  validation, evaluation, parentVersionId, runId }
  │  + variantGroupId? (NEW)     │       experienceArtifacts.variantGroupId clusters best-of-N siblings
  └──────────────────────────────┘
                                                   │
                                                   ▼ useQuery(getArtifactHistory)
  Canvas: artifact card (live iframe, lifecycle: thumbnail→lightweight→live)
          variant group = tldraw frame; version timeline = per-card panel
```

### Recommended Project Structure
```
packages/experience-builder-preview/src/
├── index.ts                    # barrel
├── PreviewExecutor.ts          # the D-02 seam (interface + types)
├── DaytonaExecutor.ts          # MVP path: @daytonaio/sdk sandbox lifecycle + screenshot
├── IframeCspExecutor.ts        # fallback/local-dev: token-handoff + Playwright (reuses render routes)
├── lifecycle.ts                # thumbnail → lightweight → live state machine helpers (PREV-03)
└── *.test.ts                   # executor seam tests with a mock executor (credential-free)

packages/experience-builder-agents/src/
├── steps/evaluate.ts           # NEW: two-track scoring (D-06) — validator + vision judge via callModel
├── steps/repair.ts             # NEW: diffIr/applyPatch repair (D-09) + recompile + re-validate
├── evaluatorRubric.ts          # NEW: Zod rubric schema (catchall, no .int min/max) + composite formula (D-07)
└── workflow.ts                 # EXTEND: insert preview → evaluate → .dountil(repair) → version steps

packages/experience-builder-validation/src/
├── astValidator.ts             # EXTEND: checkLiteralHook warning→blocking (VAL-04)
└── fixtures/redteam.ts         # EXTEND: literal/fake-var()/dynamic-className/aliased entries (VAL-05)
```

### Pattern 1: PreviewExecutor seam (D-02)
**What:** A narrow async interface the workflow depends on; implementations are swappable.
**When to use:** Always — the workflow never imports Daytona or Playwright directly.
```typescript
// PreviewExecutor.ts — the seam. NO Daytona/Playwright import here.
export interface PreviewProfile { name: 'desktop' | 'mobile' | 'fixed'; width: number; height: number }

export interface RenderInput {
  /** Compiled React + Jio CSS bundle string OR the AST/IR to render. */
  bundle: string;
  brandId: string;
  profiles: PreviewProfile[];
}
export interface RenderResult {
  /** Per-profile PNG screenshot for the judge (PREV-04). */
  screenshots: Array<{ profile: string; png: Buffer }>;
  /** Immutable live preview URL/state for the canvas card (PREV-02). */
  previewState: { url?: string; expiresAt?: number };
  /** True iff the artifact actually rendered (VAL-06 render-success). */
  rendered: boolean;
}
export interface PreviewExecutor {
  render(input: RenderInput): Promise<RenderResult>;
}
```

### Pattern 2: DaytonaExecutor with zero-egress isolation (D-01, PREV-01)
**What:** Create a network-blocked sandbox, render the bundle inside it, screenshot, expose a signed live URL.
**When to use:** Production / high-confidence path.
```typescript
// DaytonaExecutor.ts — the ONLY module importing @daytonaio/sdk.
// Source: https://www.daytona.io/docs/en/typescript-sdk/sandbox/  +  /network-limits/
import { Daytona } from '@daytonaio/sdk';

export class DaytonaExecutor implements PreviewExecutor {
  private daytona = new Daytona(); // reads DAYTONA_API_KEY server-side only

  async render(input: RenderInput): Promise<RenderResult> {
    // PREV-01: zero-egress sandbox — cannot reach Convex/auth/host session.
    const sandbox = await this.daytona.create({
      networkBlockAll: true,            // [CITED: daytona.io/docs/network-limits] true zero-egress
      // OR networkAllowList: '<cdn-cidr>/32' if Jio fonts/CSS need a pinned CIDR (IPv4 + /N only)
    });
    try {
      // Write the compiled bundle in; run Playwright/headless render INSIDE the box
      // (avoids the not-yet-GA external-CDP path, GitHub issue #4456).
      // Daytona native screenshot API captures per profile.
      // getSignedPreviewUrl(port, expiresInSeconds) → immutable live URL (PREV-02).
      ...
    } finally {
      await sandbox.delete(); // per-run teardown; warm-pool tuning is Claude's discretion (D-02)
    }
  }
}
```
**Cost/latency envelope** [CITED: startuphub.ai, blaxel.ai pricing pages]: ≈$0.0504/vCPU-hr + $0.0162/GiB-hr; 1-vCPU/1-GiB ≈ $0.067/hr. A 30-second eval render ≈ **$0.0006/preview**. Warm-pool cold start **27–90ms** (vendor); per-run create+delete acceptable for MVP, warm-pool/snapshot reuse is a tuning lever.

### Pattern 3: IframeCspExecutor (fallback, reuses existing assets)
**What:** Separate-origin iframe (`allow-scripts` WITHOUT `allow-same-origin`) + strict CSP + short-lived token handoff; screenshots via the existing Playwright harness.
**When to use:** Local dev (no Daytona key) + de-risked MVP path.
```typescript
// IframeCspExecutor.ts — reuses the VERIFIED token-handoff + Playwright harness.
// Source: apps/platform/src/lib/playwrightRenderer.ts (captureASTScreenshots)
//         apps/platform/src/app/internal/render-ast/page.tsx (consumeASTForRender)
//         packages/experience-builder-preview/PREVIEW-DECISION.md (separate-origin model)
// The full controls table (sandbox attrs, CSP, frame-ancestors, postMessage origin
// checks, zero tokens in preview) is already specified in PREVIEW-DECISION.md.
```

### Pattern 4: Bounded repair as a Mastra `.dountil` loop (EVAL-03, ORCH-02)
**What:** Loop `repair → recompile → revalidate → re-evaluate` until converged or capped.
**When to use:** When the composite score is below threshold AND the failure is repairable (not a gap).
```typescript
// workflow.ts — Mastra control flow (VERIFIED present in @mastra/core@1.37.1).
// .dountil(step, condition): runs `step`, then checks `condition`; loops while FALSE.
experienceWorkflow
  .then(compileStep)
  .then(validateStep)
  .then(previewStep)        // NEW — PreviewExecutor.render
  .then(evaluateStep)       // NEW — two-track score (D-06)
  .dountil(repairStep, async ({ inputData }) => {  // NEW — bounded repair (D-10/D-11)
    const c = inputData.ctx;
    return c.halted                       // gap short-circuit → stop (D-11)
      || c.attempt >= 3                   // hard cap N=3 (D-11)
      || c.composite >= c.threshold       // passed → stop
      || c.scoreDelta < c.epsilon         // no improvement → stop (D-10)
      || c.sameValidationError;           // repeated error → stop (D-10)
  })
  .then(versionFreezeStep)  // NEW — persist approved version (D-13)
  .commit();
```
**Note:** the existing `runExperienceWorkflow` drives `ORDERED_STEPS` directly (deterministic, test-safe). The repair loop can be expressed either as the native `.dountil` (for the committed workflow) **and/or** a plain bounded `for` loop in the runner mirroring the existing pattern — keep both in sync exactly as the current file does for `intent→…→validate`.

### Pattern 5: IR-only repair via the frozen patch contract (D-09, EVAL-02)
**What:** Repair produces a NEW IR by patching nodes; never edits JSX, never regenerates whole IR.
```typescript
// Source: packages/experience-builder-core/src/ir/patch.ts (frozen, Phase 1)
import { applyPatch, diffIr, type IrPatch } from '@oneui/experience-builder-core';
// Repair agent emits targeted ops against failing nodes only:
const patch: IrPatch = [
  { op: 'replace', path: '/sections/0/instances/2/props/appearance', value: 'primary' },
];
const repairedIr = applyPatch(failingIr, patch);   // returns a NEW IR (pure)
// recompile(repairedIr) → revalidate → re-evaluate. The IR stays canonical.
```

### Pattern 6: Multimodal vision judge through the callModel seam (EVAL-01 subjective track)
**What:** Send the screenshot + rubric to the vision model, parse a structured 0–5 rubric.
```typescript
// evaluatorRubric.ts — Zod 4 schema RESPECTING the Anthropic gotchas (irGenerator.ts:111).
import { z } from 'zod';
// NO .int()/.min()/.max() on numbers (Anthropic rejects integer min/max).
// NO keyed z.record (emits propertyNames). Use plain z.number() for 0–5 scores.
export const VisualRubric = z.object({
  hierarchy: z.number(),     // 0–5 (range enforced in the PROMPT + clamped after parse)
  spacing: z.number(),
  density: z.number(),
  brandFit: z.number(),
  notes: z.string(),
});
// Routed through the single seam (ORCH-04). The judge is model-only; the
// composite/threshold/repair decision lives in the workflow, never a callback.
// callModel currently uses generateText + Output.object; vision needs an image
// part in `messages` (see composition/verify/route.ts:207 for the verified shape).
```
**Bias mitigation** [CITED: arxiv 2602.02219, emergentmind VLM-as-judge]: use **analytic** (criterion-by-criterion) not holistic scoring; add **negative-weighted anti-pattern criteria** to counter LLM leniency bias; for best-of-N ranking (D-08) randomize variant order and/or score each variant pointwise to avoid position bias (~5% residual bias documented even with explicit instruction).

### Pattern 7: tldraw variant frame + version timeline (CANVAS-05/06, D-14)
**What:** Sibling variants (same `variantGroupId`) render inside one tldraw frame; each card has a version-timeline panel reading `getArtifactHistory`.
**When to use:** After best-of-N produces siblings, or after a repair produces a new version.

### Anti-Patterns to Avoid
- **Rendering untrusted bundle on the Lab origin.** Defeats PREV-01. Always render in Daytona (zero-egress) or a separate-origin iframe (`allow-scripts` WITHOUT `allow-same-origin`). The existing `PREVIEW-DECISION.md` is the authority.
- **Repairing the JSX / regenerating the whole IR.** Violates D-09. Patch IR nodes only via `patch.ts`.
- **Putting the composite/threshold/repair-decision logic in an AI-SDK callback.** Violates ORCH-04. All branching lives in the Mastra workflow.
- **Looping on a gap.** A missing component/profile is unsatisfiable — short-circuit to a gap report with zero repair attempts (D-11), reusing the existing `generate-ir` gap branch.
- **`z.record(z.string(), …)` or `.int().min().max()` in the rubric schema.** Anthropic 400s. Use `z.object({}).catchall(...)` / plain `z.number()` (the lesson is already encoded in `irGenerator.ts`).
- **A new variant-group table.** Violates D-12. Add `variantGroupId` to `experienceArtifacts` instead.
- **Passing CDP from outside into a Daytona sandbox for MVP.** Not yet GA (issue #4456). Run Playwright *inside* the sandbox or use the native screenshot API.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON-patch over IR | Custom diff/apply | `diffIr`/`applyPatch` in `patch.ts` (frozen) | Already RFC-6902-correct, tested, D-09-mandated. |
| Headless screenshot + brand-CSS settle | New Playwright wiring | `captureASTScreenshots`/`captureCodeScreenshots` (`playwrightRenderer.ts`) | Already handles fonts.ready, double-rAF transition-suppression, per-viewport, token handoff. |
| Vision rubric scoring + Convex upload | New route | Mirror `composition/verify/route.ts` | Verified end-to-end: capture → upload to `_storage` → vision judge → persist. |
| Repair prompt shape | New prompt scaffolding | Mirror `composition/repair/route.ts` | Verified self-heal prompt + validation gate. |
| Sandbox isolation / zero-egress | Custom VM/CSP hand-rolling | Daytona `networkBlockAll` (prod) + `PREVIEW-DECISION.md` separate-origin (fallback) | Browser/VM-enforced trust boundary beats hand-rolled policy. |
| Bounded loop + HITL checkpoint | Custom loop state machine | Mastra `.dountil` + `suspend`/`resumeData` | Native in `@mastra/core@1.37.1`; orchestration belongs in Mastra (ORCH-04). |
| Structured model output | Raw JSON parsing | `callModel` + `Output.object` seam | The single ORCH-04 model touchpoint; Zod gotchas already solved. |
| Markup-free / token-boundary regex | New regex | `BRAND_ALLOWED_REGEX` (`@oneui/shared/engine/tokenBoundary`) | The one sanctioned regex — manifest-derived, already imported by the validator. |

**Key insight:** Phase 3 is ~70% integration of existing, verified repo assets and ~30% net-new (the Daytona executor, validator tightening, two new workflow steps, additive schema, canvas UX). The hardest single risk — running untrusted generated code in true isolation — has two independent solutions already available (Daytona zero-egress + the decided separate-origin iframe).

## Runtime State Inventory

> Phase 3 is additive/greenfield within the experience-builder packages — it does not rename or migrate existing runtime state. Inventory included because it touches Convex schema + a vendor sandbox.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `experienceArtifactVersions` currently stores `{ir, validation, parentVersionId, compiledBundle}` (`schema.ts:2025`). New fields (`previewState`, `thumbnail`, `evaluation`, `originRunId`) are **additive `v.optional`** per D-13 — existing rows round-trip with no migration. | Code: extend schema + `persistArtifact` mutation additively. No data migration. |
| Live service config | Daytona is a NEW external service. Requires `DAYTONA_API_KEY` env var (server-side only, never in preview/bundle). Sandbox config (`networkBlockAll`) lives in `DaytonaExecutor` code, not a separate UI/DB. | Add `DAYTONA_API_KEY` to server env. Document in preview README. |
| OS-registered state | None — no OS-level registrations introduced. | None — verified: no Task Scheduler/launchd/pm2 usage in repo for this phase. |
| Secrets/env vars | NEW: `DAYTONA_API_KEY` (Daytona client). EXISTING reused: `ANTHROPIC_API_KEY` (vision judge), `INTERNAL_RENDER_BASE_URL` + `x-internal-render` secret (`playwrightRenderer.ts`/render routes), `NEXT_PUBLIC_CONVEX_URL`. PREV-01 invariant: **none of these may reach the preview/sandbox context.** | Add `DAYTONA_API_KEY` to env + `.env.example`. Verify no secret crosses the isolation boundary. |
| Build artifacts | New package `experience-builder-preview` currently ships only a `package.json` stub + `PREVIEW-DECISION.md`. Adding `src/` requires the package's build (tsup, per monorepo convention) + workspace re-link. | Add build config mirroring sibling experience-builder packages; `pnpm install` to re-link. |

## Common Pitfalls

### Pitfall 1: Daytona external CDP for Playwright is not GA
**What goes wrong:** Plan assumes you connect a local Playwright to the Daytona sandbox via `connect_over_cdp()`.
**Why it happens:** It's a natural mental model, but exposing a CDP URL is an open feature request (GitHub issue #4456), not a stable API.
**How to avoid:** Run Playwright/headless rendering *inside* the sandbox (Daytona runs arbitrary processes + has a native screenshot API), OR use `IframeCspExecutor` + the existing host-side Playwright harness for the MVP. The seam (D-02) makes this choice reversible.
**Warning signs:** Any task spec that says "connect Playwright to the Daytona CDP endpoint."

### Pitfall 2: Zod-4 → Anthropic structured-output rejections in the rubric
**What goes wrong:** The vision judge call 400s on the rubric schema.
**Why it happens:** Zod 4 emits `propertyNames` for keyed `z.record`, and integer `min/max` for `.int().min().max()` — Anthropic rejects both.
**How to avoid:** `z.object({}).catchall(...)` for bags; plain `z.number()` for scores; clamp the 0–5 range after parse + state the range in the prompt. The pattern is already proven in `irGenerator.ts:111`.
**Warning signs:** `400 "property 'propertyNames' is not supported"`.

### Pitfall 3: Secrets leaking into the preview context
**What goes wrong:** Convex/auth tokens reachable from generated code → exfiltration.
**Why it happens:** Rendering on the Lab origin, or passing tokens through the preview URL/body.
**How to avoid:** Daytona `networkBlockAll: true` (cannot phone home); OR separate-origin iframe `allow-scripts` WITHOUT `allow-same-origin` + token-handoff (nothing sensitive in URL). The full controls are in `PREVIEW-DECISION.md`.
**Warning signs:** Any `previewUrl` containing a token/session; `allow-same-origin` on the iframe.

### Pitfall 4: Repair loop that never terminates or oscillates
**What goes wrong:** Repair keeps re-emitting near-identical patches; score plateaus; budget burned.
**Why it happens:** Missing convergence detection (D-10).
**How to avoid:** Stop on ANY of: `attempt >= 3`, `composite >= threshold`, `scoreDelta < epsilon`, or `sameValidationError`. Track the previous composite + previous blocking-error set in the run context.
**Warning signs:** Same blocking violation code in two consecutive attempts.

### Pitfall 5: Validator literal hook still warning-only
**What goes wrong:** VAL-04 "passes" but literals slip through because `checkLiteralHook` only warns.
**Why it happens:** The Phase-1 skeleton (`astValidator.ts:265`) deliberately emits `severity: 'warning'` with a "Full literal scan lands in P3" note.
**How to avoid:** Promote literal violations to `severity: 'blocking'` for VAL-04; extend `VISUAL_LITERAL_RE` to cover radius/elevation/motion/font/icon literals; add corresponding red-team fixtures (currently 6; add fake-`var()`, dynamic className, inline hex on a real visual prop).
**Warning signs:** A red-team fixture for an inline hex passes validation.

### Pitfall 6: Mastra `.dountil` condition polarity
**What goes wrong:** Loop runs zero times or forever because the condition is inverted.
**Why it happens:** `.dountil(step, condition)` runs `step` then loops **while the condition is FALSE** (stops when TRUE) — the opposite of `.dowhile`.
**How to avoid:** The condition returns `true` to STOP. Write it as the *termination* predicate (capped OR passed OR converged OR gap).
**Warning signs:** Repair runs once and stops, or never stops.

## Code Examples

### Mirror the verified vision-judge route (EVAL-01)
```typescript
// Source (VERIFIED in repo): apps/platform/src/app/api/composition/verify/route.ts:207
const { text } = await generateText({
  model: anthropic(CLAUDE_VISION_MODEL),       // claude-sonnet-4-6, vision-native
  system: JUDGE_SYSTEM_PROMPT,                  // rubric instructions, 0–5 per criterion
  messages: [{ role: 'user', content: [
    { type: 'text', text: `Generated screen at viewport ${profile}:` },
    { type: 'image', image: `data:image/png;base64,${png.toString('base64')}` },
    { type: 'text', text: 'Score against the rubric and return JSON.' },
  ]}],
});
// In the Lab this MUST route through callModel (ORCH-04) — add an image-message
// path to the seam rather than importing `ai` in the evaluate step directly.
```

### Existing version-history query to extend (VER-02)
```typescript
// Source (VERIFIED): packages/convex/convex/experienceRuns.ts:173
export const getArtifactHistory = query({
  args: { artifactId: v.id('experienceArtifacts') },
  handler: async (ctx, args) => {
    const artifact = await ctx.db.get(args.artifactId);
    if (!artifact) return null;
    const versions = await ctx.db.query('experienceArtifactVersions')
      .withIndex('by_artifact', q => q.eq('artifactId', args.artifactId)).collect();
    return { artifact, versions };   // P3 adds a sibling `listVariantGroup` query (variantGroupId)
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `srcdoc` iframe + CSP only | Separate-origin OR zero-egress VM sandbox | 2024→2026 | Same-origin `srcdoc` can't fully neutralize exfiltration; browser/VM boundary required (PREVIEW-DECISION). |
| Docker-per-run sandboxing | Warm-pool microVM sandboxes (Daytona ≈27–90ms) | 2025–2026 | Per-preview cost/latency now viable for interactive canvas. |
| Holistic LLM judge score | Analytic rubric + negative anti-pattern weights + order randomization | 2025–2026 | Counters leniency + position bias; matches D-06 per-dimension scoring. |
| String denylist validation | AST allowlist (alias-resolved) | repo Phase 1 | Defeats aliased-import evasion; the project's security boundary. |

**Deprecated/outdated:**
- Relying on substring denylists for compliance — already rejected in `astValidator.ts` (Pitfall 4 / VAL-05).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@daytonaio/sdk@0.183.0` is the correct, legitimate package (slopcheck unavailable; manual repo/postinstall checks clean) | Standard Stack / Package Audit | Wrong package = supply-chain risk. Mitigation: planner gates install behind `checkpoint:human-verify`. |
| A2 | Daytona's native screenshot API + in-sandbox process execution suffices to render IR→DOM and capture per-profile PNGs without external CDP | Pattern 2 / Pitfall 1 | If insufficient, fall back to `IframeCspExecutor` (no rework, D-02 seam). |
| A3 | `networkBlockAll: true` fully prevents the sandbox reaching Convex/auth (PREV-01) | Pattern 2 / Pitfall 3 | If egress leaks, IframeCsp separate-origin remains the isolation guarantee; planner adds a network-isolation verification task. |
| A4 | Jio fonts/CSS the rendered artifact needs are either inlined in the bundle or reachable via a pinned `networkAllowList` CIDR | Pattern 2 | If fonts need arbitrary CDN egress, zero-egress breaks rendering; resolve by bundling fonts or pinning CIDR (IPv4+/N only). |
| A5 | Per-preview Daytona cost (~$0.0006/30s run) is within MVP budget | Summary / Pattern 2 | Pricing is vendor-published; verify against actual account tier (Tier-3/4 needed for runtime network-policy updates). |
| A6 | The vision judge's 0–5 rubric reliably distinguishes pass/repair at a tunable threshold | Pattern 6 / D-07 | Start simple + tunable (D-07); planner ships threshold as config, not hardcoded. |
| A7 | `playwright@1.59.1` (pinned) works headless in the target deploy env for the IframeCsp path | Standard Stack | Existing `playwrightRenderer.ts` already relies on this; low risk. |

## Open Questions (RESOLVED)

1. **RESOLVED: Where does Playwright run for the Daytona path — inside the sandbox or host-side?**
   - RESOLVED: Run Playwright IN-SANDBOX (with Daytona's native screenshot API as the in-box capture path); keep the IframeCsp host-side Playwright harness as the proven fallback. The external-CDP path is NOT used (not GA, issue #4456). Encoded in Plan 05 Task 2 (`DaytonaExecutor`) and Plan 02 (`IframeCspExecutor` fallback).
   - What we knew: external CDP exposure is not GA (issue #4456); Daytona runs processes + has native screenshot.
   - Recommendation (now the decision): default to in-sandbox render + native screenshot, keep IframeCsp host-side Playwright as the proven fallback.

2. **RESOLVED: Does the artifact's brand CSS require network egress (fonts/CDN)?**
   - RESOLVED: Inline fonts/CSS into the preview bundle so `networkBlockAll: true` holds; if a CDN is genuinely required, pin a `networkAllowList` CIDR (IPv4 + /N only). Encoded in Plan 05 Task 2 (Assumption A4).
   - What we knew: brand CSS is injected at runtime; `next/font` is used in the platform.
   - Recommendation (now the decision): inline fonts/CSS into the preview bundle so `networkBlockAll: true` holds; otherwise pin a `networkAllowList` CIDR.

3. **RESOLVED: Best-of-N — N parallel runs or one run with N IR candidates?**
   - RESOLVED: Best-of-N = N parallel `runExperienceWorkflow` runs sharing the already-resolved foundation, siblings clustered via `variantGroupId`; the judge ranks. Encoded in Plan 04 Task 3 (`runVariants`). Tune to a single shared-resolve fan-out later if cost warrants.
   - What we knew: GEN-07 wants multiple variants; the judge ranks (D-08).
   - Recommendation (now the decision): N parallel `runExperienceWorkflow` calls sharing the resolved foundation, cluster siblings via `variantGroupId`.

4. **RESOLVED: Daytona account tier for runtime network-policy updates.**
   - RESOLVED: Set `networkBlockAll` at CREATE time (works on ALL account tiers), avoiding the Tier-3/4 dependency of post-create `updateNetworkSettings`. Encoded in Plan 05 Task 2 + acceptance criterion. The project's account tier is therefore not a blocker.
   - What we knew: `updateNetworkSettings` (post-create policy change) needs Tier 3/4 [CITED: daytona.io/docs/network-limits].
   - Recommendation (now the decision): set `networkBlockAll` at **create** time (works on all tiers) rather than relying on post-create updates.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `playwright` (chromium) | PREV-04 screenshots (IframeCsp path) | ✓ | 1.59.1 (installed) | — |
| `@mastra/core` | ORCH-02 bounded loop + HITL | ✓ | 1.37.1 (installed) | — |
| `ai` + `@ai-sdk/anthropic` | EVAL-01 vision judge | ✓ | 6.0.111 / 3.0.54 | — |
| `convex` | VER-01 persistence + `_storage` | ✓ | 1.39.1 | — |
| `tldraw` | CANVAS-05/06 frame + timeline | ✓ | 4.5.3 | — |
| `@daytonaio/sdk` | D-01 DaytonaExecutor (prod) | ✗ | (to install 0.183.0) | `IframeCspExecutor` (D-02 seam — MVP without it) |
| `DAYTONA_API_KEY` env | DaytonaExecutor auth | ✗ | — | IframeCsp path needs no Daytona key (local dev) |
| `ANTHROPIC_API_KEY` env | vision judge | ✓ (used by existing routes) | — | — |

**Missing dependencies with no fallback:** none (every requirement has a verified in-repo path).
**Missing dependencies with fallback:** `@daytonaio/sdk` + `DAYTONA_API_KEY` — the `IframeCspExecutor` (built from existing assets) is the fallback and is also the recommended de-risk MVP path.

## Validation Architecture

> nyquist_validation is enabled (`config.json` → `workflow.nyquist_validation: true`).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (per-package 2.x; root/shared 4.x) |
| Config file | per-package `vitest.config.ts` (existing experience-builder-* packages already have test suites) |
| Quick run command | `pnpm --filter @oneui/experience-builder-preview test` (and `-agents`, `-validation`) |
| Full suite command | `pnpm test` (root, runs all package suites via turbo) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PREV-01 | Daytona sandbox is zero-egress; preview cannot reach Convex/auth | unit (mock executor) + manual security review | `pnpm --filter @oneui/experience-builder-preview test` | ❌ Wave 0 |
| PREV-02 | Each version has an immutable preview URL/state | unit | `... -preview test -t previewState` | ❌ Wave 0 |
| PREV-03 | desktop/mobile/fixed profiles + lifecycle states | unit | `... -preview test -t lifecycle` | ❌ Wave 0 |
| PREV-04 | credential-free Playwright screenshots per profile | integration (existing harness) | reuse `playwrightRenderer` capture | ✓ (harness exists) |
| VAL-04 | literal color/spacing/type/radius/elevation/motion/font/icon → blocking | unit | `... -validation test -t literal` | ⚠️ extend `astValidator.test.ts` |
| VAL-05 | 100% of red-team corpus blocked | unit | `... -validation test -t redteam` | ⚠️ extend `redteam.ts` (6→N) |
| VAL-06 | TypeScript compiles + preview renders | unit + integration | `... -agents test -t compile-render` | ❌ Wave 0 |
| EVAL-01 | two-track score (objective validator + subjective rubric) | unit (mock callModel) | `... -agents test -t evaluate` | ❌ Wave 0 |
| EVAL-02 | repair patches IR (not JSX), recompiles | unit | `... -agents test -t repair` | ❌ Wave 0 |
| EVAL-03 | bounded loop (cap 3 + convergence + gap short-circuit) | unit | `... -agents test -t repair-bounded` | ❌ Wave 0 |
| ORCH-02 | retries + bounded loop + suspend/resume HITL | unit | `... -agents test -t workflow` (extend existing `workflow.test.ts`) | ⚠️ extend |
| GEN-07 | best-of-N variants produced + ranked | unit | `... -agents test -t variants` | ❌ Wave 0 |
| VER-01 | version persists full object (additive fields) | convex test / unit | extend `experienceRuns` tests | ⚠️ extend |
| VER-02 | version history readable | convex test | `getArtifactHistory` (exists) + `listVariantGroup` | ⚠️ extend |
| CANVAS-05 | variants grouped via `variantGroupId` | unit + UI | schema + canvas test | ❌ Wave 0 |
| CANVAS-06 | real-DOM live iframe (not raster) | integration / manual | manual canvas verification | manual |
| INPUT-05 | iterate existing artifact via chat/action | unit | run seeded from `parentVersionId` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm --filter <touched-package> test`
- **Per wave merge:** `pnpm test` (all experience-builder-* + convex suites)
- **Phase gate:** Full suite green + red-team corpus 100% blocked + manual canvas/preview review before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `packages/experience-builder-preview/src/PreviewExecutor.test.ts` — seam + mock executor (PREV-01/02/03)
- [ ] `packages/experience-builder-agents/src/steps/evaluate.test.ts` — two-track scoring (EVAL-01, mock `callModel`)
- [ ] `packages/experience-builder-agents/src/steps/repair.test.ts` — IR-patch repair + bounded loop (EVAL-02/03)
- [ ] `packages/experience-builder-agents/src/evaluatorRubric.test.ts` — Zod schema + composite formula (D-07)
- [ ] Extend `packages/experience-builder-validation/src/astValidator.test.ts` — literal blocking (VAL-04)
- [ ] Extend `packages/experience-builder-validation/src/fixtures/redteam.ts` — fake-`var()`, dynamic className, inline-hex-on-visual-prop, aliased font/icon (VAL-05)
- [ ] Extend `packages/experience-builder-agents/src/workflow.test.ts` — preview→evaluate→repair→version sequence + gap short-circuit (ORCH-02)
- [ ] Convex test for additive `experienceArtifactVersions` fields + `variantGroupId` round-trip (VER-01)

## Security Domain

> `security_enforcement` not set to false → enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V1 Architecture (trust boundaries) | yes | Untrusted generated code isolated by VM (Daytona zero-egress) or browser SOP (separate-origin iframe). |
| V3 Session Management | yes | Zero auth/session tokens reach preview/sandbox (PREV-01). Token-handoff is short-lived + single-use (`playwrightRenderer.ts` TTL 60s). |
| V4 Access Control | yes | `x-internal-render` secret on render routes; Daytona API key server-side only. |
| V5 Input Validation | yes | AST allowlist validator (alias-resolved, not denylist) — VAL-04/05; markup-free IR Zod refinement. |
| V12 Files & Resources (sandboxing) | yes | iframe `sandbox="allow-scripts"` WITHOUT `allow-same-origin`; strict CSP `default-src/script-src/connect-src`; `frame-ancestors` pinned; `postMessage` origin checks (PREVIEW-DECISION.md). |
| V13 API / SSRF | yes | `networkBlockAll: true` prevents the sandbox making outbound requests (SSRF/exfil mitigation). |
| V6 Cryptography | no | No new crypto; tokens use `node:crypto randomUUID` (existing). |

### Known Threat Patterns for {Daytona/iframe preview + LLM repair}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Preview iframe exfiltrates Convex/auth token (T-01-21, PREVIEW-DECISION) | Information Disclosure | Separate origin / zero-egress; no `allow-same-origin`; zero tokens in preview; credential-free Playwright. |
| Generated code phones home from sandbox | Information Disclosure | `networkBlockAll: true` (Daytona) / CSP `connect-src` lockdown (iframe). |
| Aliased non-Jio import smuggling | Tampering | AST alias-resolution allowlist (existing `astValidator.ts`, red-team corpus). |
| Literal value bypassing token system (VAL-04) | Tampering | Promote literal hook to blocking; structural classification via `BRAND_ALLOWED_REGEX`. |
| Repair loop resource exhaustion | Denial of Service | Hard cap N=3 + per-run token/time budget + convergence detection (D-10/D-11). |
| Markup smuggled in IR string field | Tampering | Markup-free Zod refinement in IR schema (`schema.ts:116`) + raw-element block in validator. |
| API key leakage into IR/bundle/event | Information Disclosure | Keys read server-side only; never written to IR/bundle/event (existing `modelAdapter.ts` invariant). |

## Sources

### Primary (HIGH confidence)
- Repo (direct read): `packages/experience-builder-agents/src/workflow.ts`, `modelAdapter.ts`, `irGenerator.ts`; `packages/experience-builder-core/src/ir/patch.ts`; `packages/experience-builder-validation/src/astValidator.ts` + `fixtures/redteam.ts`; `apps/platform/src/lib/playwrightRenderer.ts`; `apps/platform/src/app/api/composition/verify/route.ts` + `repair/route.ts`; `apps/platform/src/app/internal/render-ast/page.tsx`; `packages/convex/convex/schema.ts:1975-2052` + `experienceRuns.ts`; `packages/experience-builder-preview/PREVIEW-DECISION.md`.
- Installed type defs: `node_modules/@mastra/core/dist/workflows/workflow.d.ts` (`.dountil`/`.dowhile`/`.branch`/`bail`), `.../types.d.ts` (`suspend`/`resumeData`).
- npm: `@daytonaio/sdk@0.183.0` (version, repo URL, empty postinstall), `playwright@1.60.0` latest / `1.59.1` installed.
- Daytona official docs: https://www.daytona.io/docs/en/typescript-sdk/sandbox/ , https://www.daytona.io/docs/en/network-limits/ , https://www.daytona.io/docs/en/snapshots/

### Secondary (MEDIUM confidence)
- Pricing/latency: https://www.startuphub.ai/ai-news/artificial-intelligence/2026/daytona-vs-e2b-vs-modal-vs-vercel-sandbox-2026 , https://blaxel.ai/blog/daytona-dev-environment-pricing-alternatives , https://medium.com/@kacperwlodarczyk/sub-90ms-cloud-code-execution-...
- VLM-as-judge bias mitigation: https://arxiv.org/pdf/2602.02219 , https://www.emergentmind.com/topics/vlm-as-a-judge

### Tertiary (LOW confidence)
- Daytona external CDP exposure status: https://github.com/daytonaio/daytona/issues/4456 (open feature request — informs Pitfall 1).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libs verified installed or via npm/official docs; Daytona SDK confirmed real (manual checks) but tagged `[ASSUMED]` pending slopcheck/human-verify.
- Architecture: HIGH — the integration path reuses verified repo assets; the two net-new steps follow the existing Mastra step pattern; Mastra loop/HITL primitives confirmed in installed type defs.
- Pitfalls: HIGH — most derived from direct code reads + official docs; Daytona CDP/cost are MEDIUM (vendor-published, not account-verified).
- Daytona feasibility: GO with documented fallback. Confidence HIGH that the seam de-risks the vendor; MEDIUM on exact in-sandbox Playwright mechanics (resolved by the front-loaded spike).

**Research date:** 2026-06-01
**Valid until:** 2026-07-01 (30 days; Daytona SDK is on an active release train — re-verify version before install)
