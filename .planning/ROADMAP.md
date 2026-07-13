# Roadmap: Jio AI Experience Builder Lab

## Overview

A brownfield, subsequent-milestone build inside the OneUI Studio BaseUI v4 monorepo. The repo already ships the IR→React compiler, ToV + Design agents, sandboxed render routes, component metadata, and the full Jio token engine — so this is integration work behind 6 isolated `experience-builder-*` packages plus one isolated route, not greenfield invention. The journey: lock the contracts and front-load the HIGH-severity risks while everything is mocked (P1) → swap mocks for real sources and build the deterministic compile path (P2) → close the quality loop with sandboxed preview, validation, visual evaluation, and bounded repair (P3) → add non-web campaign/social output (P4) → harden for production with collaboration, observability, durable persistence, and handoff bundles (P5). The IR is the only source of truth and the repair loop closes around the IR, never around generated JSX — that is what makes "AI cannot bypass the Jio Design System" provable rather than aspirational.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Isolated Foundation** - Contracts-first Lab shell with production-shaped mocks; HIGH-severity pitfalls designed out up front (completed 2026-05-30)
- [x] **Phase 2: Real Source Integration** - Swap mocks for real foundations, registry, and agents; build the IR→AST→React compiler (completed 2026-05-31)
- [x] **Phase 2.1: Close FND-01/FND-04** - Wire brand foundations from Convex into run route → workflow (INSERTED) (completed 2026-06-01)
- [x] **Phase 3: Preview / Eval / Repair** - The indivisible quality loop: sandboxed preview → screenshots → validation → visual scoring → bounded repair → version history (completed 2026-06-01)
- [ ] **Phase 4: Campaign / Social** - Non-web output profiles, Campaign Planner, carousel frames, and PNG/JPG/PDF export (all plans built; automated verification 4/4 passed; pending human UAT — see 04-HUMAN-UAT.md)
- [ ] **Phase 5: Production Readiness** - Collaboration, observability/cost, durable persistence, security hardening, and handoff bundles (started 2026-06-07: contracts, Storybook design-context provider, tldraw local persistence scaffold, durable Convex run lifecycle/status route, Mastra compatibility gate, Storybook MCP/Daytona patch upgrades)

## Phase Details

### Phase 1: Isolated Foundation

**Goal**: As a Jio designer, I want to open an isolated Jio-DS-only Lab, place a prompt card, pick a brand/artifact-type/output-profile, run a mock generation, and watch a valid-IR artifact card appear on the canvas, so that I can prove every contract is production-shaped and every HIGH-severity risk is designed out before any real wiring.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: LAB-01, LAB-02, LAB-03, LAB-04, CANVAS-01, CANVAS-02, CANVAS-03, CANVAS-04, INPUT-01, INPUT-02, INPUT-03, INPUT-04, IR-01, IR-02, IR-03, IR-04, FND-01, FND-03, REG-01, REG-02, REG-03, ORCH-01, ORCH-03, ORCH-04, GEN-01, GEN-08, VAL-01, VAL-02, VAL-03, VER-03
**Success Criteria** (what must be TRUE):

  1. User opens the Experience Builder Lab at a dedicated route, separate from the existing Builder, with a UI composed entirely of Jio DS components and Jio CSS; the existing ExperienceCanvas Builder still boots unchanged (CI import guard + existing-Builder smoke test pass, `pnpm why ai` resolves a single `ai` version).
  2. User places a prompt card on an isolated tldraw canvas, selects a brand/sub-brand, artifact type, and output profile, enters a prompt, runs a mock generation, and a valid-IR artifact card appears on the canvas via a streamed agent event log.
  3. Every artifact is represented as a canonical Jio Experience IR (Zod) with no free-text/HTML/raw-JSX field anywhere in the tree; an adversarial "just give me the HTML" prompt yields valid IR or a gap report, never markup.
  4. The basic AST-level validator blocks Tailwind, non-Jio/external visual imports, and unregistered components; the mock foundation resolver returns a typed foundation gap report (never invented dimensions) when no profile exists, and a foundation-coverage audit documents which non-web profiles Jio actually defines vs assumes.
  5. The mock registry and resolver are production-shaped (match the real metadata/foundation schemas), the separate-origin preview hosting model is decided and documented, and the Mastra↔AI-SDK-v6 compatibility spike is resolved with exact-pinned versions behind one model adapter.

**Plans:** 6/6 plans complete
**Wave 1**

- [x] 01-01-PLAN.md — experience-builder-core: markup-free IR + object model + contracts + IR↔AST + isolation CI guards

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — experience-builder-registry: queryRegistry adapter over jioAlphaCatalog (exact membership + gap)
- [x] 01-03-PLAN.md — experience-builder-validation: AST allowlist validator + red-team seed

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-04-PLAN.md — experience-builder-agents: Mastra workflow skeleton + mock generation + resolver + Convex experience* tables

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-05-PLAN.md — isolated (experience-lab) route + tldraw canvas + card shapes + Run #N frame + streaming run route

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 01-06-PLAN.md — request/run-inspector panels + nav + README + foundation-coverage audit + preview decision + Builder smoke test

### Phase 2: Real Source Integration

**Goal**: With contracts frozen, the Lab generates a real artifact end-to-end from a real prompt — resolving real Jio foundations, retrieving real Storybook-approved components, producing copy via the existing ToV agent and layout via the existing Design agent, generating valid IR, and compiling it to real React + Jio CSS using only approved imports.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: FND-04, REG-04, GEN-02, GEN-03, GEN-04, GEN-05, GEN-06
**Success Criteria** (what must be TRUE):

  1. User submits a real prompt and the resolver returns real brand/token/type-scale/spacing/surface data from live Jio foundations (via `buildThemeConfig`/Convex), with the mock→real swap requiring no schema migration.
  2. The generator retrieves real Storybook-approved components from `jioAlphaCatalog` metadata, and a CI freshness gate fails if the Lab registry drifts from the live component-metadata source of truth.
  3. The existing Tone-of-Voice agent produces brand-aligned copy and the existing Design/Composition agent chooses layout/hierarchy/composition within Jio constraints, both wired as Mastra tools (their internals untouched).
  4. The IR Generator produces a valid Jio Experience IR from retrieved components + resolved foundations using constrained structured output with retry-on-error-feedback and per-section decomposition, and the compiler converts IR → AST → React + Jio CSS using only approved Jio imports.

**Plans:** 4/4 plans complete

**Wave 1**

- [x] 02-01-PLAN.md — real model seam + real foundation resolver (FND-04) + LLM IR Generator (GEN-05) + IR→React compiler (GEN-06): the walking path
- [x] 02-02-PLAN.md — REG-04 derive-equals-live registry freshness gate (D-10)

**Wave 2** *(blocked on 02-01)*

- [x] 02-03-PLAN.md — assembler-last advisors: planner agent (GEN-04) + ToV adapter (GEN-02) + Design adapter (GEN-03) + deterministic cache, wired into the workflow

**Wave 3** *(blocked on 02-01, 02-02, 02-03)*

- [x] 02-04-PLAN.md — compiled-bundle Convex persistence (GEN-06) + schema push + REG-04/GEN-06 CI gate wiring

**UI hint**: yes

### Phase 02.1: Close FND-01/FND-04: wire brand foundations from Convex into run route → workflow (INSERTED)

**Goal:** Close the end-to-end wiring gap Phase 2 left open: the run route receives a real Convex `brandId` but never uses it server-side, so every real run resolves against empty foundations. Wire run route → fetch the selected brand's (and optional sub-brand's) real foundations from Convex → pass through the Mastra workflow (`resolveStep` via an injected, Convex-free `foundationsLoader`) → resolver produces a real `ThemeConfig`. Closes FND-01 end-to-end and the route-level half of FND-04 that Phase 2 proved only at the resolver unit level. Sub-brand resolution is in scope (optional dependent Select + `applySubBrandAccentsToFoundation` merge).
**Requirements**: FND-01, FND-04
**Depends on:** Phase 2
**Plans:** 2/2 plans complete

**Wave 1**

- [x] 02.1-01-PLAN.md — experience-builder-agents: `FoundationsLoader` contract (Convex-free) + real injected-loader `resolveStep` writing `brandFoundations` + workflow/mapping/sub-brand-merge tests

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02.1-02-PLAN.md — route Convex-backed `makeConvexFoundationsLoader` (Pitfall-1-safe `color?.config` map + sub-brand merge) + `.strict()` body `subBrandConfigId` + dependent sub-brand Select threaded shape → POST → route

### Phase 3: Preview / Eval / Repair

**Goal**: A generated artifact renders as real DOM in a sandboxed, separate-origin preview, is screenshotted and fully validated, scored by a visual evaluator, repaired by patching the IR (never the JSX) within a bounded loop, and frozen as an immutable, browsable version — closing the quality loop that makes the system trustworthy.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: CANVAS-05, CANVAS-06, INPUT-05, ORCH-02, GEN-07, VAL-04, VAL-05, VAL-06, PREV-01, PREV-02, PREV-03, PREV-04, EVAL-01, EVAL-02, EVAL-03, VER-01, VER-02
**Success Criteria** (what must be TRUE):

  1. Generated web UIs render as real DOM in a sandboxed iframe on a separate origin with strict CSP — the preview cannot read cookies/Convex tokens, each artifact version has an immutable preview URL/state, and the preview lifecycle (thumbnail → lightweight → live iframe) keeps the canvas at ≥30fps with 50+ cards.
  2. The full validation pipeline confirms TypeScript compiles and the preview renders, blocks arbitrary literal color/spacing/type/radius/elevation/motion values via AST allowlists, and catches 100% of a red-team evasion corpus (aliased imports, inline hex, fake `var()`, dynamic classNames).
  3. A Visual Evaluator scores artifacts (objective dimensions via the deterministic validator, subjective hierarchy/composition via rubric + best-of-N), and credential-free Playwright workers screenshot preview frames per output profile.
  4. When validation or evaluation fails, a Repair agent applies patch-based fixes to the IR and recompiles within a hard cap (N=3 + convergence detection + per-run budget); a missing component/profile short-circuits to a gap report instead of looping.
  5. User can iterate on an artifact via chat/actions, group multiple variants into a variant group, and browse the persisted version history (IR, bundle, preview state, thumbnail, validation result, evaluation result, parent version, originating run) in Convex.

**Plans:** 8/8 plans complete

**Wave 1**

- [x] 03-01-PLAN.md — validator tightening: literal-value blocking (VAL-04) + red-team corpus 100% (VAL-05/06)
- [x] 03-02-PLAN.md — experience-builder-preview: PreviewExecutor seam + IframeCspExecutor MVP path + lifecycle (PREV-01/02/03/04, CANVAS-06)
- [x] 03-03-PLAN.md — additive Convex schema + persistArtifact + listVariantGroup (VER-01/02, CANVAS-05)

**Wave 2** *(blocked on Wave 1)*

- [x] 03-04-PLAN.md — evaluate + bounded repair + version-freeze + best-of-N wired into the Mastra workflow (EVAL-01/02/03, ORCH-02, GEN-07, VAL-06)
- [x] 03-05-PLAN.md — DaytonaExecutor prod path behind the seam, install gated by a blocking authenticity checkpoint (PREV-01/04)

**Wave 3** *(blocked on Wave 2)*

- [x] 03-06-PLAN.md — canvas live-iframe + lifecycle, variant frame, version timeline, iterate-on-artifact run route (CANVAS-05/06, PREV-03, VER-02, INPUT-05)

**Wave 4** *(gap closure — UAT)*

- [x] 03-07-PLAN.md — live-preview gap closure: LabAstExecutor wired into the run route + finalizeRun promotion guard + /internal/render-ast reuse (CANVAS-06, PREV-02)

**Wave 5** *(gap closure — post-03-07 UAT re-test)*

- [x] 03-08-PLAN.md — live-preview render fixes: long-TTL AST handoff (RC1) + trust-scoped iframe sandbox (RC2) + scale-to-fit render (RC3) (CANVAS-06, PREV-01, PREV-02)

**UI hint**: yes

### Phase 03.1: Daytona zero-egress render pipeline (INSERTED)

**Goal:** Make the deferred D-01 production preview path actually functional behind the existing `PreviewExecutor` seam. Phase 3 shipped on the first-party `LabAstExecutor` (server-side AST render) and explicitly allowed Daytona to defer (D-02); a live test confirmed `DaytonaExecutor` cannot render because (a) the so-called "compiled bundle" is uncompiled TSX source importing `@oneui/ui`, not a runnable artifact; (b) the in-box `capture.js` harness is referenced but never created/uploaded; (c) nothing serves the artifact on the preview port for the live iframe; and (d) the default sandbox image has no Node/Playwright/Chromium while zero-egress blocks runtime install. This phase makes a generated artifact render as real DOM inside a network-blocked Daytona sandbox and be screenshotted per profile — WITHOUT relaxing generation rules (D-03: the IR compiler still owns React + Jio-CSS codegen; Daytona only executes/previews/screenshots).

**Requirements**: PREV-01, PREV-04, BUNDLE-01
**Depends on:** Phase 3
**Plans:** 5/5 plans complete

**Success Criteria** (what must be TRUE):

  1. A real bundler step produces a SELF-CONTAINED renderable asset from a generated artifact — the TSX source + `@oneui/ui` + React/ReactDOM + brand CSS resolved into a single HTML/JS bundle that mounts and renders with no external imports — replacing the current source-string "bundle" that nothing can render.
  2. A custom Daytona image (Playwright + Chromium baked in at BUILD time, before network-block) is created/registered so the zero-egress (`networkBlockAll`) sandbox can run a headless capture at RUNTIME with no network access (PREV-01 holds).
  3. In-box harness scripts serve the self-contained asset on the preview port (so `getSignedPreviewUrl` returns a working live iframe URL) and screenshot it per profile (PREV-04), printing image bytes back across the boundary with nothing sensitive in the URL.
  4. The full path runs behind the unchanged `PreviewExecutor` seam, selected via the explicit `EXPERIENCE_LAB_PREVIEW_EXECUTOR=daytona` opt-in, and is validated end-to-end against a live Daytona account at a human-verify checkpoint; a preview-infra failure surfaces as a preview error (not "gap — generation refused").

Plans:

- [x] 03.1-01-PLAN.md — Self-contained bundler step (assembleAsset: TSX rewrite + @oneui/ui playground bundle + inlined brand CSS via esbuild) [BUNDLE-01]
- [x] 03.1-02-PLAN.md — Custom Daytona image (Playwright 1.59.1 baked) + named snapshot + in-box harness (capture/serve/probe)
- [x] 03.1-03-PLAN.md — Preview-infra failure surfaces as preview-error (not "gap — generation refused")
- [x] 03.1-04-PLAN.md — Complete DaytonaExecutor.render (asset + snapshot + capture + live serve + signed URL + keep-alive/TTL teardown) + route preview-error card
- [x] 03.1-05-PLAN.md — BLOCKING live human-verify: real Daytona render + live iframe + zero-egress probe (PREV-01/UAT-3) + snapshot reuse

### Phase 4: Campaign / Social

**Goal**: User generates an on-brand Instagram/campaign artifact from a brief as a first-class path — the Campaign Planner proposes audience, message hierarchy, and 3 creative directions; the user picks one (HITL); the system resolves non-web dimensions/safe-areas from Jio foundations, generates IR-backed carousel frames with per-frame ToV copy, and exports as PNG/JPG/PDF.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: FND-02, CAMP-01, CAMP-02, CAMP-03, CAMP-04, CAMP-05, EXP-01, EXP-02, EXP-03
**Success Criteria** (what must be TRUE):

  1. User generates an Instagram/campaign artifact from a campaign brief as a first-class path, and the resolver returns dimensions/type-scale/safe-areas for non-web profiles (IG square/portrait/story, carousel, LinkedIn, slide, outdoor/banner) from Jio foundations — emitting a gap report, never invented dimensions, where coverage is missing.
  2. The Campaign Planner produces a brief summary, target audience, message hierarchy, 3 creative directions, and a recommended direction; the user selects a direction at a HITL checkpoint and the system generates per-frame headline/body/CTA + caption copy via the ToV agent.
  3. The system generates carousel frames as IR-backed artifacts grouped on the canvas, resolving each frame's dimensions/type-scale/safe-areas from Jio foundations before generation, while staying within canvas perf budgets.
  4. User exports an artifact as code (React + Jio CSS), social/campaign artifacts as PNG/JPG, and campaign assets as PDF.

**Plans:** 4/4 plans complete

**Wave 1**

- [x] 04-01-PLAN.md — non-web foundation resolution: profile→platform map + resolver dims/type-scale/safe-area branch + honest gap (FND-02, CAMP-05)

**Wave 2** *(blocked on Wave 1)*

- [x] 04-02-PLAN.md — campaign brief fields + Anthropic-safe DS-grounded planner + campaign-plan suspend/resume HITL + resume route (CAMP-01, CAMP-02, CAMP-03)

**Wave 3** *(blocked on Wave 2)*

- [x] 04-03-PLAN.md — ordered carousel driver (shared repair budget, per-frame ToV, orderIndex) + workflow wiring + tldraw group frame (CAMP-04, CAMP-05)

**Wave 4** *(blocked on Wave 3)*

- [x] 04-04-PLAN.md — export package (code/PNG/JPG/PDF, gated pdf-lib) + native-size Playwright re-render + export route → _storage + card-action menu (EXP-01, EXP-02, EXP-03)

**UI hint**: yes

### Phase 04.2: Generation output quality: real planner + Design/ToV advisors, compositional layout in the Jio Experience IR (containers/stacks/grids not a flat instance list), and meaningful real copy so generated artifacts read as genuine product UIs composed from real Jio components and foundations (INSERTED)

**Goal:** Generated web-ui / landing artifacts read as genuine product UIs composed from real Jio components and foundations — compositional layout (containers/stacks/grids, not a flat instance pile) expressed as first-class IR layout primitives, real prompt-grounded copy from the threaded Planner + Design + ToV advisors (no placeholder backfill surfacing), quality enforced as a gate (deterministic structural checks primary + multimodal threshold secondary + bounded IR-patch repair + terminal quality-gap), and a multi-agent transparency layer (persisted agent traces, named chat activity lines, an expandable "How this was built" card, and per-agent canvas cursors). Depth-first on web-ui/landing as the proof-point; generalization to other artifact types may carry to a follow-on phase.
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, LAYOUT-05, QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06, AGENT-01, AGENT-02, AGENT-03, AGENT-04
**Depends on:** Phase 4
**Plans:** 6/6 plans complete

Plans:
**Wave 1**

- [x] 04.2-01-PLAN.md — Wave 0 failing-test scaffolds (layout-node parse/compile, quality-gate codes, advisor threading, backfill provenance)

**Wave 2** *(blocked on Wave 1)*

- [x] 04.2-02-PLAN.md — IR layout primitive end-to-end: JioIRLayoutNode schema (D-01..D-04) + irToAst → Container/Grid + validator structural-allow (LAYOUT-01..05)

**Wave 3** *(blocked on Wave 2)*

- [x] 04.2-03-PLAN.md — advisor threading into IR assembly + copy grounding + backfill provenance (QUAL-01/02/03, D-05/D-07/D-08)

### Phase 5: Production Readiness

**Goal:** Harden the Lab for production without replacing the existing OneUI platform: durable run state, broader Storybook MCP retrieval, tldraw collaboration, Mastra observability/evals, Daytona operational probes, security policy, and handoff bundles.

**Started work:**

- [x] Stabilization: Node 22 verification path identified; GEN-06 compiler snapshot blessed for `Container layout="flex"`; duplicate platform Vitest alias removed.
- [x] Contracts: production schemas for `ExperienceRunRecord`, `DesignContextResolution`, `ExperienceHandoffBundle`, `SandboxOperationalCheck`, and `ComplianceScore`.
- [x] Retrieval: Storybook MCP helper broadened into a design-context provider with registry fallback and missing-component gaps.
- [x] Canvas: tldraw v5 local persistence key and sync-schema contract for Lab custom shapes plus future presence/review/provenance records.
- [x] Durable run read/write model: real-brand runs pre-create one Convex `experienceRuns` row, preserve prompt/sub-brand/parent/canvas/thread metadata, update to suspended/terminal states, and expose `/api/experience-lab/status`.
- [x] Mastra compatibility gate: `pnpm check:mastra-compat` verifies the current workflow/tools/background-task/AI-SDK/Zod API surface and reports npm latest deltas; AI SDK/Anthropic/Zod now resolve to latest compatible versions in the lockfile.
- [x] Dependencies: `@storybook/addon-mcp@0.6.0` and `@daytonaio/sdk@0.184.0`.
- [ ] Collaboration: server-side tldraw sync room with matching custom shape/custom record schema registration.
- [ ] Durable orchestration: extend the compatibility gate for durable worker dispatch/replay APIs, then bump Mastra packages and move route-local execution behind a production background dispatcher/replay store.
- [ ] Operations: Daytona snapshot CI, zero-egress staging probe, TTL cleanup monitor, observability/cost traces, RBAC/rate limits, handoff bundle UI.

**Wave 4** *(blocked on Waves 2+3)*

- [x] 04.2-04-PLAN.md — quality gate: deterministic structural checks (primary) + tuned multimodal threshold (secondary) + terminal quality-gap (QUAL-04/05/06, D-09/D-10/D-11)

**Wave 5** *(blocked on Wave 4)*

- [x] 04.2-05-PLAN.md — transparency a/b/d: append-only Convex agent trace + enriched chat step lines + "How this was built" card (AGENT-01/02/03, D-06a/b/d)

**Wave 6** *(blocked on Wave 5)*

- [x] 04.2-06-PLAN.md — D-06c canvas agent cursors: decision-checkpointed mapping substrate + additive overlay (or justified deferral) (AGENT-04)

### Phase 04.1: Chat-first Lab UX: conversation drives generation (chat left), canvas displays generated UIs, inline interactive plan card, built from Jio DS components, engine reused as read-only contracts, Lab isolation preserved (INSERTED)

**Goal:** The Experience Builder Lab is chat-first — a persistent left-hand conversation drives generation while the right-hand tldraw canvas displays the generated artifacts, the campaign-plan HITL renders as an inline interactive card, and the existing generation engine / IR / validators / repair / run+resume routes are reused verbatim as read-only contracts with Lab isolation preserved.
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, CHAT-08, CHAT-09, CHAT-10, CHAT-11
**Depends on:** Phase 4
**Plans:** 5/5 plans complete
Plans:
**Wave 1**

- [x] 04.1-01-PLAN.md — Wave 0 test fixtures + Mastra-memory conversation store (D-05/D-06)
- [x] 04.1-02-PLAN.md — Composer control strip: lifted brand/sub-brand/type/profile selectors (D-07)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04.1-03-PLAN.md — Left/right shell + ChatSurface host + streaming run turn + canvas adaptation (D-01/D-11/D-12/D-13)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 04.1-04-PLAN.md — Inline interactive campaign-plan card + inline-card framework (D-08/D-09/D-10)
- [x] 04.1-05-PLAN.md — Chat <-> canvas two-way selection binding + focused-artifact indicator (D-02)

### Phase 5: Production Readiness

**Goal**: The Lab is production-ready — multiple users collaborate on a canvas, every run emits observability + cost data, workflow state is durably persisted, the preview/sandbox passes a security-hardening review, and users can export full handoff bundles (code/HTML/PPTX/Figma/git).
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: EXP-04, PROD-01, PROD-02, PROD-03, PROD-04
**Success Criteria** (what must be TRUE):

  1. Multiple users can collaborate on a canvas via tldraw sync without disturbing the isolation of the existing Builder.
  2. Workflow runs emit observability + cost-tracking data (tokens, screenshots, wall-clock per run) surfaced on the canvas, and workflow state is durably persisted via a Mastra storage adapter.
  3. The Lab passes a security-hardening review covering preview isolation, CSP, and no credential leakage into preview or Playwright workers.
  4. User exports a handoff bundle (HTML/PPTX/Figma/git handoff) from a frozen artifact version.

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 2.1 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Isolated Foundation | 6/6 | Complete    | 2026-05-31 |
| 2. Real Source Integration | 4/4 | Complete   | 2026-05-31 |
| 2.1. Close FND-01/FND-04 (INSERTED) | 2/2 | Complete    | 2026-06-01 |
| 3. Preview / Eval / Repair | 8/8 | Complete   | 2026-06-01 |
| 4. Campaign / Social | 4/4 | Pending UAT | 2026-06-02 |
| 5. Production Readiness | 0/TBD | Not started | - |
