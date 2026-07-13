# Requirements: Jio AI Experience Builder Lab

**Defined:** 2026-05-30
**Core Value:** AI cannot bypass the Jio Design System — every generated artifact is provably composed from real Jio foundations, Jio CSS, and Storybook-approved Jio components.

## v1 Requirements

Full P1–P5 vision. Each maps to a roadmap phase (see Traceability).

### Lab Shell & Isolation (LAB)

- [x] **LAB-01**: User can open the Experience Builder Lab from a dedicated route, separate from the existing Builder
- [x] **LAB-02**: The Lab UI is composed entirely of Jio Design System components and Jio CSS (no Tailwind, utility CSS, or external visual kits)
- [x] **LAB-03**: Lab code is isolated in dedicated packages/route and cannot modify or break the existing ExperienceCanvas Builder (enforced by CI import guards + an existing-Builder smoke test)
- [x] **LAB-04**: A README documents how the Lab stays isolated and how to run it

### Canvas & Object Model (CANVAS)

- [x] **CANVAS-01**: User sees an isolated infinite tldraw canvas as the central workspace
- [x] **CANVAS-02**: User can create a prompt card on the canvas
- [x] **CANVAS-03**: Canvas supports the full artifact object model (web-ui, app-screen, dashboard, social-post, instagram-carousel, outdoor-display, slide, image, plus foundation-profile / component-reference / evaluation-report / variant-group / export cards)
- [x] **CANVAS-04**: An artifact card appears on the canvas after a generation run completes
- [x] **CANVAS-05**: User can group multiple variants of an artifact into a variant group
- [x] **CANVAS-06**: Generated web UIs render as real DOM in a preview frame, not flattened raster (except thumbnails/exports)

### Request Input (INPUT)

- [x] **INPUT-01**: User can select a Jio brand or sub-brand
- [x] **INPUT-02**: User can select an output artifact type
- [x] **INPUT-03**: User can select a target platform / output profile
- [x] **INPUT-04**: User can enter a text prompt or campaign brief
- [x] **INPUT-05**: User can iterate on an existing artifact via chat or artifact actions

### Jio Experience IR (IR)

- [x] **IR-01**: System represents every generated artifact as a canonical Jio Experience IR (Zod schema) before any code is generated
- [x] **IR-02**: The IR schema contains no free-text markup / HTML / raw-JSX field (markup-free contract — the compiler is the only thing that emits JSX)
- [x] **IR-03**: System can map IR ↔ component AST and produce IR diffs/patches
- [x] **IR-04**: IR captures artifact type, target profile, brand, foundation references, layout sections, component instances, content, accessibility requirements, and validation status

### Foundation Resolver & Output Profiles (FND)

- [x] **FND-01**: System resolves brand/sub-brand, token set, type scale, spacing, surface profile, dimensions, and output rules from Jio foundations for a given request
- [ ] **FND-02**: Resolver covers non-web output profiles (Instagram square/portrait/story, carousel, LinkedIn, slide, outdoor/digital display, banner, image export)
- [x] **FND-03**: When no foundation profile exists, generation stops and returns a typed foundation gap report (never invents dimensions/type scales)
- [x] **FND-04**: A production-shaped mock resolver ships first; the real Jio foundation/token source is then connected without a schema migration

### Storybook Component Registry (REG)

- [x] **REG-01**: System exposes a machine-readable registry of Storybook-approved Jio components (id, import path, props schema, variants, slots, states, usage rules, anti-patterns, supported brands/profiles, token dependencies)
- [x] **REG-02**: The generator retrieves candidate components from the registry before generating an artifact
- [x] **REG-03**: Only registry-approved components may be used; an unregistered component cannot be emitted and yields a component gap report
- [x] **REG-04**: A CI freshness gate keeps the registry in sync with the real component metadata source

### Mastra Orchestration & Events (ORCH)

- [x] **ORCH-01**: A Mastra workflow sequences the full generation pipeline (intent → resolve → retrieve → ToV → design → plan → IR → compile → validate → preview → evaluate → repair → version)
- [x] **ORCH-02**: The workflow supports retries, bounded repair loops, and human-in-the-loop suspend/resume checkpoints
- [x] **ORCH-03**: The Lab streams an AG-UI-style agent event stream to the canvas for live updates
- [x] **ORCH-04**: Mastra owns orchestration; the Vercel AI SDK is used only for model calls/streaming/structured output (boundary enforced — no sequencing/repair/HITL logic in AI SDK callbacks)

### Generation Agents & Compiler (GEN)

- [x] **GEN-01**: An Intent agent determines artifact type, output profile, audience, and goal from the request
- [x] **GEN-02**: The existing Tone-of-Voice agent (api/voice) is integrated to produce brand-aligned copy (headlines, body, CTA, captions, carousel narrative)
- [x] **GEN-03**: The existing Design/Composition agent (api/composition) is integrated to choose layout, hierarchy, composition, density, and pattern within Jio constraints
- [x] **GEN-04**: A UX/flow planner agent plans flows, screens, and message hierarchy
- [x] **GEN-05**: An IR Generator agent produces a valid Jio Experience IR using retrieved components and resolved foundations
- [x] **GEN-06**: A compiler converts IR → React + Jio CSS using only approved Jio imports
- [x] **GEN-07**: System can produce multiple variants of an artifact
- [x] **GEN-08**: A mock generation workflow producing valid IR ships first; real agents + real compile are then wired in

### Compliance Validation (VAL)

- [x] **VAL-01**: Every artifact is validated before being marked ready; the result returns passed + blocking violations + warnings + repair suggestions + component/foundation gaps
- [x] **VAL-02**: Validation blocks Tailwind, utility CSS, external visual component libraries, and non-Jio visual imports
- [x] **VAL-03**: Validation blocks components not approved in the registry, and invalid props/variants/slots
- [x] **VAL-04**: Validation blocks arbitrary hard-coded color/spacing/type/radius/elevation/motion values when Jio tokens/foundations exist, and unapproved fonts/icons
- [x] **VAL-05**: Validation operates on the AST with allowlists (not string denylists) and is tested against a red-team evasion corpus
- [x] **VAL-06**: Validation confirms TypeScript compiles and the preview renders

### Preview & Sandbox (PREV)

- [x] **PREV-01**: Generated artifacts render in a sandboxed iframe isolated from the host app (separate origin, strict CSP, no auth/session/Convex access)
- [x] **PREV-02**: Each artifact version has an immutable preview URL/state
- [x] **PREV-03**: Preview supports desktop/mobile/fixed-frame output profiles and a lifecycle (thumbnail → lightweight → live iframe) that bounds canvas cost
- [x] **PREV-04**: Preview frames can be screenshotted by credential-free Playwright workers for evaluation/export

### Self-Contained Bundle (BUNDLE)

- [x] **BUNDLE-01**: A Lab-server bundler step turns a generated artifact (the compiler's TSX source importing `@oneui/ui`) plus React/ReactDOM, the pre-built `@oneui/ui` playground bundle, and the brand CSS for the artifact's `brandId` into a SINGLE self-contained HTML asset that mounts and renders with NO external imports or network fetches — so a zero-egress sandbox can render it. The bundler does NOT regenerate the artifact (D-03: the IR compiler still owns React + Jio-CSS codegen); it only assembles an executable asset.

### Visual Evaluation & Repair (EVAL)

- [x] **EVAL-01**: A Visual Evaluator scores artifacts on Jio compliance, brand fit, hierarchy, layout, component correctness, accessibility, responsiveness, content quality, and export readiness
- [x] **EVAL-02**: When validation or evaluation fails, a Repair agent applies patch-based fixes to the IR (not the JSX) and recompiles
- [x] **EVAL-03**: Repair loops are bounded (hard cap + convergence detection + per-run budget); a missing component/profile short-circuits to a gap report instead of looping

### Versioning & Persistence (VER)

- [x] **VER-01**: Artifact versions are persisted (IR, generated bundle, preview state, thumbnail, validation result, evaluation result, parent version, originating run) in Convex
- [x] **VER-02**: User can view the version history of an artifact
- [x] **VER-03**: Generation runs are persisted with their event/run state

### Campaign & Social (CAMP)

- [ ] **CAMP-01**: User can generate an Instagram/campaign artifact from a campaign brief as a first-class path
- [ ] **CAMP-02**: The Campaign Planner produces a brief summary, target audience, message hierarchy, 3 creative directions, and a recommended direction
- [ ] **CAMP-03**: User can select a creative direction (HITL); the system generates per-frame headline/body/CTA + caption copy via the ToV agent
- [ ] **CAMP-04**: System generates carousel frames as IR-backed artifacts grouped on the canvas
- [ ] **CAMP-05**: Campaign frames resolve dimensions/type scale/safe areas from Jio foundations before generation

### Export & Handoff (EXP)

- [ ] **EXP-01**: User can export an artifact as code (React + Jio CSS)
- [ ] **EXP-02**: User can export social/campaign artifacts as PNG/JPG
- [ ] **EXP-03**: User can export campaign assets as PDF
- [ ] **EXP-04**: User can export a handoff bundle (HTML/PPTX/Figma/git handoff)

### Production Readiness (PROD)

- [ ] **PROD-01**: Multiple users can collaborate on a canvas (tldraw sync)
- [ ] **PROD-02**: Workflow runs emit observability + cost-tracking data
- [ ] **PROD-03**: Workflow state is durably persisted via a Mastra storage adapter
- [ ] **PROD-04**: The Lab passes a security-hardening review (preview isolation, CSP, no credential leakage)

### Chat-first Lab UX (CHAT)

- [x] **CHAT-01**: A persistent chat conversation on the left of the Lab drives generation (prompt entry + run trigger); the on-canvas prompt card is retired as the entry surface (D-01)
- [x] **CHAT-02**: The tldraw canvas on the right displays generated artifacts and retains foundation-profile / component-reference / gap-report info shapes (D-01, D-03, D-04)
- [x] **CHAT-03**: A composer control strip exposes brand / sub-brand / artifact-type / output-profile selectors, set once and reused per turn, preserving the 02.1 sub-brand skip-gate (D-07)
- [x] **CHAT-04**: The conversation is one linear thread per session, persisted across reloads via Mastra memory; on reopen the thread + linked Convex artifacts restore (D-05, D-06)
- [x] **CHAT-05**: Each run renders as a streaming assistant turn with an in-place step ticker collapsing to a summary, with expandable full event detail (D-11, D-13)
- [x] **CHAT-06**: The campaign-plan HITL renders as an inline interactive Jio-DS card; selecting a direction + frame count resumes the suspended workflow via the unchanged resume route (D-08, D-10)
- [x] **CHAT-07**: A reusable inline-card framework lets any HITL/confirm moment render a Jio-DS card in chat that posts an action back to continue the workflow (D-09)
- [x] **CHAT-08**: Canvas-artifact selection <-> chat focus is a two-way binding; chat visibly indicates the focused artifact and follow-ups target it (D-02)
- [x] **CHAT-09**: Run failures / gaps flip the streaming turn to an inline headline AND drop the detailed gap-report card on the canvas (D-12)
- [x] **CHAT-10**: The Lab layout is left chat + right canvas; both docked panels (RequestPanel, RunInspectorPanel) are retired as docks (D-13)
- [x] **CHAT-11**: All chat UI, composer, and inline cards are composed from Jio-DS components + Jio CSS only (LAB-02), in the isolated route with no (builder)/ExperienceCanvas import (LAB-03)

## v2 Requirements

Deferred beyond this milestone. Tracked but not in the current roadmap.

### Input

- **INPUT-06**: Voice input for prompts/briefs
- **INPUT-07**: Image reference input (style/layout reference)

### Registry

- **REG-05**: Embeddings/RAG-based component retrieval (v1 uses static typed metadata as the gate)

### Interop

- **INTEROP-01**: First-party `@ag-ui/*` adapter for external-frontend interoperability (revisit once AG-UI reaches 1.0 + has a stable Mastra adapter)

### Collaboration

- **COLLAB-01**: Live presence / cursors / comment threads beyond basic tldraw sync
- **SCHED-01**: Direct social-media publishing/scheduling of generated campaign assets

## Out of Scope

Explicitly excluded. Anti-features that would violate the Core Value, plus hard boundaries.

| Feature | Reason |
|---------|--------|
| Raw JSX/HTML as the source of truth | IR is canonical; arbitrary executable UI bypasses DS enforcement |
| Tailwind / utility CSS / external visual kits / unwrapped shadcn/Radix in output | Violates Jio-DS-only Core Value |
| Arbitrary generated color/type/spacing systems | Foundations are the source of truth; literals are blocked |
| Inventing missing components or foundation profiles | Must emit a Jio system/foundation gap report instead |
| Full Figma replacement | MVP is a component-aware AI generation canvas, not a design-tool clone |
| Raster-flattening of generated web UI | Must render real DOM (except thumbnails/exports) |
| Vercel AI SDK as the orchestration brain | AI SDK is the model layer only; Mastra orchestrates |
| Modifying/refactoring the existing ExperienceCanvas / (builder) | Hard isolation rule — the existing Builder must not break |

## Traceability

Finalized phase mapping (roadmapper, 2026-05-30). Each requirement maps to exactly one phase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAB-01 | Phase 1 | Complete |
| LAB-02 | Phase 1 | Complete |
| LAB-03 | Phase 1 | Complete |
| LAB-04 | Phase 1 | Complete |
| CANVAS-01 | Phase 1 | Complete |
| CANVAS-02 | Phase 1 | Complete |
| CANVAS-03 | Phase 1 | Complete |
| CANVAS-04 | Phase 1 | Complete |
| CANVAS-05 | Phase 3 | Complete |
| CANVAS-06 | Phase 3 | Complete |
| INPUT-01 | Phase 1 | Complete |
| INPUT-02 | Phase 1 | Complete |
| INPUT-03 | Phase 1 | Complete |
| INPUT-04 | Phase 1 | Complete |
| INPUT-05 | Phase 3 | Complete |
| IR-01 | Phase 1 | Complete |
| IR-02 | Phase 1 | Complete |
| IR-03 | Phase 1 | Complete |
| IR-04 | Phase 1 | Complete |
| FND-01 | Phase 1 | Complete |
| FND-02 | Phase 4 | Pending |
| FND-03 | Phase 1 | Complete |
| FND-04 | Phase 2 | Complete |
| REG-01 | Phase 1 | Complete |
| REG-02 | Phase 1 | Complete |
| REG-03 | Phase 1 | Complete |
| REG-04 | Phase 2 | Complete |
| ORCH-01 | Phase 1 | Complete |
| ORCH-02 | Phase 3 | Complete |
| ORCH-03 | Phase 1 | Complete |
| ORCH-04 | Phase 1 | Complete |
| GEN-01 | Phase 1 | Complete |
| GEN-02 | Phase 2 | Complete |
| GEN-03 | Phase 2 | Complete |
| GEN-04 | Phase 2 | Complete |
| GEN-05 | Phase 2 | Complete |
| GEN-06 | Phase 2 | Complete |
| GEN-07 | Phase 3 | Complete |
| GEN-08 | Phase 1 | Complete |
| VAL-01 | Phase 1 | Complete |
| VAL-02 | Phase 1 | Complete |
| VAL-03 | Phase 1 | Complete |
| VAL-04 | Phase 3 | Complete |
| VAL-05 | Phase 3 | Complete |
| VAL-06 | Phase 3 | Complete |
| PREV-01 | Phase 3 | Complete |
| PREV-02 | Phase 3 | Complete |
| PREV-03 | Phase 3 | Complete |
| PREV-04 | Phase 3 | Complete |
| BUNDLE-01 | Phase 03.1 | Complete |
| EVAL-01 | Phase 3 | Complete |
| EVAL-02 | Phase 3 | Complete |
| EVAL-03 | Phase 3 | Complete |
| VER-01 | Phase 3 | Complete |
| VER-02 | Phase 3 | Complete |
| VER-03 | Phase 1 | Complete |
| CAMP-01 | Phase 4 | Pending |
| CAMP-02 | Phase 4 | Pending |
| CAMP-03 | Phase 4 | Pending |
| CAMP-04 | Phase 4 | Pending |
| CAMP-05 | Phase 4 | Pending |
| EXP-01 | Phase 4 | Pending |
| EXP-02 | Phase 4 | Pending |
| EXP-03 | Phase 4 | Pending |
| EXP-04 | Phase 5 | Pending |
| CHAT-01 | Phase 04.1 | Complete |
| CHAT-02 | Phase 04.1 | Complete |
| CHAT-03 | Phase 04.1 | Complete |
| CHAT-04 | Phase 04.1 | Complete |
| CHAT-05 | Phase 04.1 | Complete |
| CHAT-06 | Phase 04.1 | Complete |
| CHAT-07 | Phase 04.1 | Complete |
| CHAT-08 | Phase 04.1 | Complete |
| CHAT-09 | Phase 04.1 | Complete |
| CHAT-10 | Phase 04.1 | Complete |
| CHAT-11 | Phase 04.1 | Complete |
| PROD-01 | Phase 5 | Pending |
| PROD-02 | Phase 5 | Pending |
| PROD-03 | Phase 5 | Pending |
| PROD-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 79 total
- Mapped to phases: 79
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-30*
*Last updated: 2026-05-30 after roadmap finalization (5-phase shape)*
