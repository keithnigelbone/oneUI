# Feature Research

**Domain:** AI experience/UI generation tool, design-system-constrained (registry + IR + validation/repair), multi-format output (web, app, dashboard, social/campaign, outdoor, slides)
**Researched:** 2026-05-30
**Confidence:** MEDIUM-HIGH (comparator features verified via 2026 reviews/docs; Jio-specific differentiators derived from PROJECT.md + execution prompt + MVP spec)

---

## Context: How This Domain Splits

Two distinct product lineages converge on this project, and they have **different feature DNA**:

1. **AI UI generators** (v0, Figma Make, Builder Visual Copilot, tldraw make-real, Galileo/Stitch, Framer AI, Uizard, Anima). Feature gravity: prompt → code/design, iteration via chat, design-system "awareness," preview, export, deploy.
2. **AI campaign/social generators** (Piktochart, Simplified, PostNitro, WaveGen, Lovart). Feature gravity: brief → multi-slide/multi-format assets, brand-kit auto-apply, template libraries, per-frame copy, image export, scheduling.

The Jio Lab deliberately sits at the **intersection** and adds a third axis competitors mostly lack: **provable design-system constraint** (registry-only components, IR-as-contract, validator/repair loop, gap reports instead of invention). That intersection + constraint is the entire competitive thesis — see Differentiators.

**What 2026 comparators converged on (the new baseline):**
- **Registry/design-system context is now mainstream**, not novel. v0 ships custom shadcn registries; Builder Visual Copilot "understands and enforces your design system automatically"; Figma added **custom skills** (Markdown instruction sets encoding team conventions / design-system intent) in May 2026; Figma's own blog frames **MCP servers as the unlock** for on-brand AI output. So "design-system aware" is table stakes in 2026, NOT a differentiator. Jio's differentiator must be **hard, provable, non-bypassable constraint + gap reporting**, not mere "awareness."
- **Agentic workflows + full-stack sandboxes** (v0 Feb 2026: Git, VS Code-style editor, DB, API routes; Builder: parallel agents). The bar moved from "component snippet" to "orchestrated iterative build."
- **Smart variant adaptation** (Figma auto-generates responsive/mobile/tablet from a desktop component). Multi-viewport/format generation is now expected.
- **Multi-format social** (PostNitro/Simplified): brand-kit auto-apply, 100+ templates, per-slide copy, multi-platform export. This is the campaign baseline Phase 4 competes against.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Missing these = the Lab feels broken or toy-like next to v0 / Figma Make / PostNitro.

| Feature | Why Expected | Complexity | Notes / Phase |
|---------|--------------|------------|-------|
| Prompt → artifact (text-to-generate) | Core of every comparator | M | Routes through Mastra workflow → IR → compile. **P1 (mock)** → **P2 (real)** |
| Infinite canvas workspace for arranging/comparing artifacts | tldraw make-real, Figma, all canvas tools | M (reuse-leaning) | tldraw already in repo `^4.5.3`. Isolated shell. **P1** |
| Brand / sub-brand selector | Every brand-aware tool (PostNitro brand kits, v0 registries) | S | Mockable P1, real Convex brands P2. **P1** |
| Output type + target platform/format selector | v0 (web), social tools (post/story/carousel), Figma (responsive) | S | Drives foundation profile resolution. **P1** |
| Live sandboxed preview of generated UI as real DOM (not flattened pixels) | v0/Figma Make render real interactive code; spec mandates iframe not raster | L | CSP-isolated iframe, no auth/session access. **P3** |
| Chat-based / conversational iteration on an artifact | v0, Figma Make, Builder all iterate via NL | M | "Edit through chat or artifact actions." **P2/P3** |
| Multiple variant generation | v0 generates options; Figma smart-variant adaptation | M | "Generate multiple variants" → Variant Group canvas object. **P2/P3** |
| Multi-viewport / responsive output (desktop/mobile/tablet) | Figma smart variant adaptation is now expected | M | Foundation resolver already does per-platform/density. **P3** |
| Export: code (React) + image (PNG/JPG) | v0/Anima export code; social tools export images; v0 GitHub sync | M | Code export P2-ish, image export needs Playwright (P3/P4). **P3-P4** |
| Component/asset reference visible to user | v0 shows components used; design-system tools surface tokens | S | Component reference card + DS reference card on canvas. **P1** |
| Version history per artifact | Standard in agentic builders; spec lists `artifact_versions` | M | Immutable IR + source per version; parent linkage. **P3** |
| Progress / streaming agent activity feedback | v0/Figma stream agent steps; AG-UI event model in spec | M | AG-UI-style event stream → live canvas patches. **P1 (model)** → **P2+ (real)** |
| Image / reference input (upload a reference) | Uizard screenshot-to-design, Figma, v0 image input | M | Listed as input type; can defer real vision use. **P2+** |

### Differentiators (Competitive Advantage)

These align directly with the PROJECT.md Core Value: **"AI cannot bypass the Jio Design System."** This is where the Lab wins.

| Feature | Value Proposition | Complexity | Notes / Phase |
|---------|-------------------|------------|-------|
| **Registry-only component sourcing** (hard constraint) | Comparators *suggest* DS components; v0/Builder still let raw HTML/Tailwind leak. Jio **physically cannot emit** a non-registered component. | M | Storybook-approved registry is the *only* allowed source. Mock P1, real metadata P2. **P1→P2** |
| **Canonical Jio Experience IR as generation contract** (no arbitrary JSX as source of truth) | Comparators generate JSX/code directly → unconstrainable. IR is structured, validatable, diffable, multi-target-compilable. The architectural keystone. | L | Schema → compiler → validator. Enables variants, repair, multi-format from one contract. **P1 (schema) → P2 (compile)** |
| **Compliance validator that blocks Tailwind / external kits / invented components / arbitrary literals** | No comparator enforces "zero non-DS." Inherits repo `check:literals`/`validate:tokens` zero-tolerance ethos applied to *generated* output. | M | Returns blocking violations + warnings + repair suggestions + gaps. Basic P1, full pipeline P3. **P1→P3** |
| **Jio system / foundation / component gap report** (invent NOTHING) | Unique. Where competitors hallucinate a component or color, Jio **stops and reports the gap**. Turns the tool into a DS-coverage feedback engine for the design team. | M | `componentGaps` + `foundationGaps` in validator result. **P2/P3** |
| **Foundation resolver covering non-web profiles** (Instagram/carousel/story/outdoor/slide/banner) from Jio foundations | Social tools use generic templates; Jio resolves dimensions/type-scale/safe-area/spacing **from the brand's own foundation system**. On-brand by construction, not by template. | L | Per-format profile resolution. Web/app/dashboard P2, social/outdoor/slide P4. **P2→P4** |
| **Patch-based repair loop** (validation/eval fail → patch → recompile → revalidate) | v0/Figma regenerate wholesale; Jio applies targeted patches preserving good work. Mirrors existing DCA generate/critique/repair pattern. | L | Mastra owns the loop + HITL checkpoints. **P3** |
| **Visual evaluator scoring** (compliance, hierarchy, a11y, responsiveness, export-readiness, brand fit) | Galileo/v0 don't self-grade against a DS rubric. Jio scores against brand+DS+a11y and feeds repair. | L | Playwright screenshots → multimodal scoring. **P3** |
| **Reuse of existing ToV agent for brand-voice copy** | Generic tools write generic copy; Jio copy is brand-voice-compiled (existing `voiceCompiler`). Carousel captions, CTAs, headlines all on-voice. | M (integration) | Clean contract to `api/voice/*`. Placeholder P1, real P2, campaign use P4. **P1→P4** |
| **Reuse of existing Design/Composition agent** for layout/critique within Jio constraints | DCA already does generate/compile/verify/critique/repair/skills. Lab inherits a *trained* design brain, not a cold-start LLM. | M (integration) | Clean contract to `api/composition/*`. **P1→P2** |
| **Campaign Planner** (brief → audience → message hierarchy → 3 creative directions → per-frame copy) | Social tools do single carousels; Jio plans a *campaign arc* with strategy, multiple directions, recommendation. Marketing-team-grade. | L | First-class artifact path; Variant Group of frames. **P4** |
| **Multi-format from one campaign/IR** (square/portrait/story/carousel/outdoor/slide) | Generate once, retarget across Jio-resolved profiles — competitors re-template per format. | L | IR + foundation profiles make this near-free architecturally. **P4** |
| **Handoff/export bundles** (code, HTML/CSS, PDF/PPTX, Figma handoff) beyond image export | v0 → GitHub; Jio → multi-target including campaign PDF + slide PPTX + design handoff. | L | Per-artifact-type export agent. **P4 (image/PDF) → P5 (PPTX/Figma/git)** |
| **Builder UI itself is 100% Jio DS** (dogfooding) | The tool proves the system by being built from it. Credibility no competitor has. | M (discipline) | CLAUDE.md token/surface/typography rules apply to Lab UI. **P1 (ongoing)** |
| Observability + cost tracking on agent runs | Mastra observability hooks; enterprise concern at Jio scale (1.4B users, 7 brands) | M | **P5** |

### Anti-Features (Deliberately NOT Built)

These are in the comparator set but **violate the Core Value** or scope. Documented to prevent drift.

| Feature | Why Requested / Why Comparators Have It | Why Problematic Here | Alternative |
|---------|---------------------|-----------------|-------------|
| **Free-form raw JSX/HTML generation as source of truth** | v0, tldraw make-real, Figma Make all emit raw code | Unconstrainable — the exact thing the Lab exists to prevent. Lets non-DS markup, inline styles, arbitrary literals leak. | **IR is the only source of truth.** Compile IR → React+Jio CSS with approved imports only. |
| **Tailwind / utility CSS / external visual kits in output** | v0 is *trained on Tailwind+shadcn*; it's the default substrate | Hard rule violation. "AI cannot bypass the Jio Design System." | Jio CSS variables/classes + Jio components only. Validator blocks. |
| **Arbitrary theming / generated color-or-type systems** | Galileo/Framer invent palettes & scales from prompts | Jio foundations already define color/type/spacing/surface/radius/elevation/motion. Inventing = bypass. | Resolve from Jio multi-brand foundations; emit foundation gap if missing. |
| **Inventing components when one is missing** | Generators hallucinate plausible components | Produces unbuildable, non-DS artifacts; erodes trust. | **Emit a Jio system/component gap report.** Stop, don't fake. |
| **Full Figma replacement / general design tool** (freehand vector editing, design-from-scratch) | Figma Make, Galileo trend toward "design anything" | Out of scope per PROJECT.md; massive surface area; not the value. | Component-aware AI *generation* canvas backed by real Jio artifacts. |
| **Generic shadcn/Radix components unwrapped** | v0's native vocabulary | Not Jio-approved; bypasses Storybook approval gate. | Only Storybook-approved Jio components (which may wrap Base UI internally). |
| **Flattening generated web UI to static raster on canvas** | Simpler to render; social tools do it | Loses real CSS/layout/a11y/interactive states the spec demands. | Real DOM in sandboxed iframe; raster only for thumbnails/exports. |
| **Vercel AI SDK as the orchestration brain** | It's already in repo and capable | PROJECT.md: it's the *model layer only*; Mastra orchestrates. | Mastra owns workflow/agents/repair/HITL; AI SDK does model calls/streaming. |
| **Real-time multiplayer collaboration early** | Figma/Builder ship it; tldraw sync exists | Premature; deferred to production-readiness. | Defer to **P5** (tldraw sync / Liveblocks / Yjs). |
| **Social scheduling / publishing** (PostNitro-style) | Social generators bundle scheduling | Out of scope — Jio Lab *creates* assets, doesn't run channels. | Export assets; let downstream tools schedule. |
| **Modifying the existing ExperienceCanvas Builder** | Tempting to reuse in place | Hard isolation rule from both docs; breaking it is forbidden. | New isolated `experience-builder-*` packages + isolated route. |

---

## Feature Dependencies

```
[Foundation Resolver] ──feeds──> [Jio Experience IR]
[Storybook Registry] ──feeds──> [Jio Experience IR]
                                       │
                                       ▼
                          [IR → React+Jio CSS Compiler]
                                       │
                                       ▼
                          [Compliance Validator] ──emits──> [Gap Reports]
                                       │ (pass)
                                       ▼
                          [Sandboxed Preview] ──> [Playwright Screenshots]
                                       │
                                       ▼
                          [Visual Evaluator] ──score too low──┐
                                       │                       ▼
                                       │              [Repair Agent (patch)]
                                       │                       │
                                       └───────recompile───────┘
                                       │ (good)
                                       ▼
                          [Canvas Artifact + Version] ──> [Variant Group] ──> [Export]

[ToV Agent] ──enhances──> [IR.content] (copy/captions/CTA)
[Design Agent] ──enhances──> [IR.layout] (composition/hierarchy/critique)
[Campaign Planner] ──requires──> [Foundation Resolver(social profiles)] + [ToV] + [Variant Group]
[Mastra Workflow] ──orchestrates──> ALL agents + repair loop + HITL
[AG-UI Event Stream] ──drives──> [live canvas patches]
```

### Dependency Notes

- **IR requires both Foundation Resolver and Registry first.** IR references `outputProfileId`, dimensions, type scale (from resolver) and `componentId`/`storybookStoryId` (from registry). Both must exist (even mocked) before IR is meaningful — hence both land in **P1** as production-shaped mocks.
- **Validator requires the Compiler.** Validation operates on compiled React+CSS (imports, props, tokens, literals). Basic structural validation can run on IR alone in P1; full compile-validate needs P2.
- **Preview/Evaluator/Repair form one P3 cluster** — they only make sense together (preview → screenshot → score → patch → re-preview). Splitting them across phases strands half a loop.
- **Campaign Planner depends on social foundation profiles** (carousel/story dimensions, safe areas). The web/app profiles (P2) don't cover these, so Campaign is correctly **P4** after non-web profiles land.
- **Repair loop reuses the existing DCA generate/critique/repair pattern** — integration risk is low because the pattern is proven in `compositionCompiler.ts`.
- **Multi-format output is nearly free once IR + multiple foundation profiles exist** — the same IR retargets to a new profile. This is why the IR investment (L, P1) pays off most in P4.

---

## MVP Definition

### Launch With (P1 — Isolated Foundation, mostly mocked but production-shaped)

- [ ] Isolated Lab route + Jio-DS-only UI shell — proves dogfooding + isolation
- [ ] Isolated tldraw canvas shell (separate from existing Builder) — workspace
- [ ] Brand/sub-brand + artifact-type + output-profile selectors (mockable) — input contract
- [ ] Jio Experience IR schema + canvas object model (prompt/artifact/foundation-profile cards) — the keystone contract
- [ ] Mock Foundation Resolver + mock Storybook registry (production-shaped) — sources of truth, swappable later
- [ ] Mastra workflow skeleton + AG-UI event stream model — orchestration spine
- [ ] ToV + Design agent integration *points* (placeholders) — wiring, not yet real
- [ ] Basic compliance validator (blocks Tailwind, external visual imports, unregistered components) — the constraint, even if shallow
- [ ] Mock generation workflow → valid IR → artifact card on canvas — end-to-end proof

### Add After Validation (P2 — Real Integration)

- [ ] Real Jio foundations/tokens + real Storybook component metadata — swap mocks
- [ ] Integrate real ToV agent (copy) + real Design/Composition agent (layout/critique)
- [ ] Compile IR → React + Jio CSS with approved imports only — first real artifacts

### P3 — Preview / Eval / Repair (the quality loop)

- [ ] CSP-isolated sandboxed iframe preview
- [ ] Playwright screenshots across output profiles
- [ ] Full compliance validation pipeline (TS compiles, renders, screenshots)
- [ ] Visual evaluator scoring + patch-based repair loop + version history

### P4 — Campaign / Social

- [ ] Instagram/campaign output profiles (square/portrait/story/carousel) from Jio foundations
- [ ] Campaign Planner (brief → audience → hierarchy → 3 directions → per-frame copy)
- [ ] Carousel frame generation + ToV captions
- [ ] PNG/JPG/PDF export

### P5 — Production Readiness

- [ ] Collaboration, observability, cost tracking, workflow persistence
- [ ] Security hardening + export/handoff bundles (code/HTML/PPTX/Figma/git)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Jio Experience IR contract | HIGH | HIGH | P1 |
| Registry-only component sourcing | HIGH | MEDIUM | P1 |
| Compliance validator (basic→full) | HIGH | MEDIUM→HIGH | P1→P3 |
| Foundation resolver (web→all profiles) | HIGH | HIGH | P1→P4 |
| Prompt → artifact on canvas | HIGH | MEDIUM | P1→P2 |
| ToV + Design agent reuse | HIGH | MEDIUM | P1→P2 |
| Sandboxed live preview | HIGH | HIGH | P3 |
| Visual evaluator + repair loop | HIGH | HIGH | P3 |
| Gap reporting | MEDIUM | MEDIUM | P2/P3 |
| Variant generation | MEDIUM | MEDIUM | P2/P3 |
| Campaign Planner | HIGH | HIGH | P4 |
| Multi-format social export | HIGH | HIGH | P4 |
| Collaboration / observability | MEDIUM | MEDIUM | P5 |
| Handoff bundles (PPTX/Figma/git) | MEDIUM | HIGH | P5 |

---

## Competitor Feature Analysis

| Feature | v0 (Vercel) | Figma Make | Builder Visual Copilot | Social tools (PostNitro/Simplified) | **Jio Lab approach** |
|---------|-------------|------------|------------------------|-------------------------------------|----------------------|
| DS constraint | Custom shadcn registry (soft, leaks Tailwind) | Custom "skills" Markdown (soft, intent-only) | "Understands & enforces" (soft) | Brand-kit auto-apply (templated) | **Hard, validated, non-bypassable; gap reports** |
| Source of truth | Raw React/Tailwind code | Editable code | Real code + components | Template + brand kit | **Canonical IR → compiled, never raw** |
| Multi-format | Web app focus | Responsive variants | Web | Post/story/carousel/multi-platform | **All formats from Jio foundation profiles** |
| Variants | Multiple options | Smart variant adaptation | Parallel agents | Per-slide | **Variant groups from one IR** |
| Validation/repair | None (manual edit) | Manual | Manual | None | **Validator + visual eval + patch repair loop** |
| Campaign strategy | None | None | None | Single carousel, no strategy | **Campaign Planner: brief→audience→3 directions** |
| Preview | Live deploy | Interactive | Live | Image preview | **Sandboxed real-DOM iframe + screenshots** |
| Orchestration | Agentic (built-in) | Agents/skills | Parallel agents | N/A | **Mastra workflows + HITL + repair** |

---

## Open Questions

- **Registry source of truth:** Does Storybook story metadata expose enough machine-readable props/slots/variants/anti-patterns to populate `JioComponentRegistryItem`, or does the registry need a separate hand-authored/Convex-stored layer per component? (Affects P2 cost and gap-report fidelity.) Needs phase-specific research at P2.
- **IR ↔ existing AST codegen:** Repo already has AST codegen + `ASTRenderer` + sandboxed render routes. Is Jio Experience IR a *new* layer above AST, or does it compile *to* the existing AST? Reuse vs. parallel system is a P1/P2 architecture decision (likely belongs in ARCHITECTURE.md).
- **Non-web foundation coverage:** Do Jio foundations *actually* define Instagram/carousel/outdoor/slide profiles today, or will P4 surface many foundation gaps? If the latter, gap-reporting becomes a P4 deliverable in itself. Needs P4 research.
- **Evaluator scoring rubric:** How is "Jio compliance score" computed beyond binary validation — heuristic, multimodal LLM judge, or both? Affects P3 repair-loop convergence and cost.
- **Mastra ↔ Convex ↔ Vercel AI SDK integration:** Mastra is net-new; how it persists workflow state (Convex vs. Mastra storage) and streams AG-UI events into tldraw needs a P1/P2 integration spike. (Likely a PITFALLS/ARCHITECTURE concern.)
- **Cost/latency of the full loop:** generate → compile → render → screenshot → evaluate → repair is multi-model, multi-roundtrip. Acceptable interactive latency target undefined. P3 concern.

## Sources

- [v0 Design Systems docs](https://v0.app/docs/design-systems) · [Vercel: AI-powered prototyping with design systems](https://vercel.com/blog/ai-powered-prototyping-with-design-systems) · [shadcn/ui Registry Starter](https://vercel.com/templates/next.js/shadcn-ui-registry-starter) · [v0 2026 guide (NxCode)](https://www.nxcode.io/resources/news/v0-by-vercel-complete-guide-2026)
- [Figma AI in 2026 (LogRocket)](https://blog.logrocket.com/ux-design/figma-ai-2026-quick-overview/) · [Figma AI Design Systems Generator (Figma Make)](https://www.figma.com/solutions/ai-design-systems-generator/) · [Design Systems & AI: Why MCP Servers Are The Unlock (Figma Blog)](https://www.figma.com/blog/design-systems-ai-mcp/) · [Figma April 2026 step forward (DEV)](https://dev.to/spookuspookus/figma-made-a-huge-step-forward-in-ai-design-april-2026-1cin)
- [Builder.io Visual Copilot 2.0](https://www.builder.io/blog/visual-copilot-2) · [Builder.io AI Code Generation](https://www.builder.io/blog/ai-code-generation)
- [tldraw make-real](https://github.com/tldraw/make-real) · [makereal.tldraw.com](https://makereal.tldraw.com/)
- [Galileo AI / Google Stitch review (Banani)](https://www.banani.co/blog/galileo-ai-features-and-alternatives) · [Best AI UI/UX tools 2026 (Phenomenon/Reboot)](https://thebossmagazine.com/post/ai-ui-ux-design-tools-2026-comparison/) · [12 Best AI Design Tools 2026 (SimilarLabs)](https://similarlabs.com/blog/best-ai-design-tools)
- [PostNitro AI carousel](https://postnitro.ai/blog/post/instagram-carousel-maker) · [Simplified AI carousel](https://simplified.com/ai-carousel-generator) · [Piktochart AI carousel](https://piktochart.com/ai-instagram-carousel-generator/)
- [MCP ecosystem 2026 (WorkOS)](https://workos.com/blog/everything-your-team-needs-to-know-about-mcp-in-2026) · [MCP server ecosystem (codeongrass)](https://codeongrass.com/blog/mcp-server-ecosystem-integration-layer-ai-agents-2026/)
- Project context: `.planning/PROJECT.md`, `jio_experience_builder_full_execution_prompt.md`, `jio_ai_experience_builder_mvp_tech_specs.md`

---
*Feature research for: Jio AI Experience Builder Lab (design-system-constrained, IR-based, multi-format AI generation)*
*Researched: 2026-05-30*
