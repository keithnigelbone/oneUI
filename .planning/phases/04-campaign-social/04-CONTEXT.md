# Phase 4: Campaign / Social - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Make non-web (Instagram / campaign / slide / outdoor) output a **first-class** generation path inside the isolated Experience Builder Lab. A Campaign Planner proposes audience + message hierarchy + 3 creative directions → the user picks one at a HITL checkpoint → the foundation resolver produces foundation-backed non-web dimensions / type-scale / safe-areas → carousel frames generate as IR-backed artifacts grouped (ordered) on the canvas with per-frame ToV copy, each running the full Phase-3 quality loop → artifacts export as code (React + Jio CSS) / PNG / JPG / PDF.

**In scope (Phase 4 requirements):** FND-02, CAMP-01, CAMP-02, CAMP-03, CAMP-04, CAMP-05, EXP-01, EXP-02, EXP-03. Mode: **mvp**.

**Out of scope:** EXP-04 handoff bundle (HTML/PPTX/Figma/git) → Phase 5. Collaboration, observability/cost, durable workflow persistence, security-hardening review → Phase 5. Direct social publishing/scheduling (SCHED-01), image-reference input (INPUT-07) → v2. No changes to the IR/compiler codegen ownership, the validator, or the bounded-repair contract — campaign frames flow through the **existing** generate→compile→validate→evaluate→repair loop, never a side path. No modification to the existing `(builder)` Create / ExperienceCanvas feature (hard isolation rule).

</domain>

<decisions>
## Implementation Decisions

### Non-web foundation coverage (FND-02 / CAMP-05)
- **D-01:** **Resolve non-web dimensions from the brand's OneUI Platforms foundation** (`PlatformsFoundationConfig` — `PlatformEntry` / `PlatformBreakpoint` with `viewportWidth` / `viewportHeight` / `units`, including the `print` and `physical` categories that already model fixed-format canvases). This reuses the same per-brand Convex foundation path Phase 02.1 wired for web (`makeConvexFoundationsLoader` → `resolveStep`). **NOT** an external spec table, **NOT** a new foundation concept, and **NOT** the legacy `(builder)/create/lib/social-platforms.ts` `ASSET_DIMENSIONS` constant (that lives in the isolated legacy Builder — consume from the *foundation*, not that constant).
- **D-02:** **Honest gap on missing coverage.** When the brand's Platforms foundation has no entry matching the requested non-web canvas, emit the typed **FND-03 gap report** — the "never invent a dimension" rule is unchanged. CAMP-01's "first-class IG path" works for brands whose Platforms foundation defines those canvases; the fix for a missing one is adding it to the foundation, never hardcoding it in the Lab. The `outputProfileTable` `null`-dimension placeholders (`coverage: 'assumed'`) get filled at run time by resolving against the foundation; `'assumed'` flips to real **per-brand**, only where the foundation defines the canvas.
- **D-03:** **Type scale** for a non-web canvas = DIN-1450 base recomputed for that canvas's viewing distance (the Platforms foundation carries `viewingDistance` / `ppi` / `pixelDensity` per entry) × the brand's relational f-scale. **Safe-area insets** = Jio f-step spacing tokens (`Spacing-N`), never raw px. A platform-mandated margin with no corresponding token is a gap, not a magic number.

### Campaign brief input + Planner HITL (CAMP-01 / CAMP-02 / CAMP-03)
- **D-04:** **Extend the existing prompt card** — no new input card kind. When the artifact-type is `social-post` / `instagram-carousel`, progressively reveal brief fields (audience, objective/goal, channel), mirroring the legacy create feature's audience/tone/objectives/brief shape. One input model; stays inside the frozen object model.
- **D-05:** **HITL via a campaign-plan card.** The planner step **suspends the Mastra workflow** (reuse the Phase-3 suspend/resume + AG-UI event stream) and emits a campaign-plan card showing brief summary + audience + message hierarchy + the 3 creative directions + the recommended one. The user selects a direction → POST the choice → resume the suspended workflow. Frame generation happens **only after** selection.
  - *Planner note:* whether the campaign-plan card reuses the existing `evaluation-report` / generic card slot or adds a card kind is an implementation detail to reconcile against the (otherwise frozen) 13-member object model — keep additions minimal and additive.
- **D-06:** **Each creative direction is a DS-grounded concept bundle:** name + one-line concept + copy angle (tone emphasis fed to the ToV agent) + a Jio-grounded visual emphasis — which appearance role leads (primary/sparkle/etc.), which surface mood (bold/subtle), and a layout/composition motif the Design agent can honour. **No invented colors/fonts/visual systems** — only role/surface/motif selections that map to existing foundations + the existing Design agent.

### Carousel frames on canvas (CAMP-04 / CAMP-05)
- **D-07:** **Ordered carousel group.** Reuse the Phase-3 tldraw-frame grouping + `variantGroupId` Convex pattern (D-12/D-14), but frames carry an explicit **order index** (Frame 1→2→3) and render left-to-right in sequence. Carousel order is meaningful (vs interchangeable variants), so add the order field rather than reusing variant grouping unordered.
- **D-08:** **Frame count: planner proposes, user adjusts.** The Campaign Planner recommends a count from the brief/message hierarchy (e.g. hook → features → proof → CTA), shown on the plan card; the user can override before generation. Default cap (~10) to stay within the canvas perf budget.
- **D-09:** **Full quality loop per frame.** Every frame independently runs generate → compile → validate → evaluate → bounded-repair so each frame is provably DS-compliant on its own. Default **best-of-N = 1** for carousel frames (frames are not variants) to bound cost; the Phase-3 hard repair cap (N=3) + per-run token/time budget still apply **across the whole carousel** (shared budget). Per-frame headline/body/CTA + caption copy via the existing ToV agent (CAMP-03).

### Export pipeline (EXP-01 / EXP-02 / EXP-03)
- **D-10:** **PNG/JPG = re-render at export resolution.** Re-render the artifact's compiled bundle at the profile's full foundation-resolved dimensions (e.g. 1080×1080) via the existing Playwright capture path (`playwrightRenderer.ts` / Daytona in-box capture from Phase 3) at native size + device-scale. Do **not** reuse the lower-res evaluation/preview screenshot for delivery.
- **D-11:** **PDF = multi-page from ordered frame rasters.** Compose the PDF server-side from the per-frame full-res rasters, one carousel/slide frame per page, in carousel order. A single carousel → one ordered multi-page PDF. (Library choice — pdf-lib / pdfkit / Playwright `page.pdf` — left to research; input is the same re-rendered rasters as D-10.)
- **D-12:** **Code export (EXP-01)** = the compiler's TSX source for that artifact version (no re-generation) bundled with the resolved Jio CSS.
- **D-13:** **Trigger + delivery:** export is a **card action menu** (`⋮ → Export ▸ Code / PNG / JPG / PDF`). The result lands as the existing `export` card kind (already in the 13-member object model) plus a downloadable file. Runs server-side in the (currently empty) `experience-builder-export` package; artifacts persisted to **Convex storage** (mirrors how `campaignAssets.capturedImageStorageId` works today). Append-only persistence consistent with prior phases.

### Claude's / Researcher's Discretion
- Exact `outputProfile` → `PlatformEntry`/`PlatformBreakpoint` matching strategy (by aspect/category vs an explicit Lab mapping table) given how the Platforms foundation is seeded per-brand.
- PDF library selection and the precise raster→PDF composition path.
- Whether the campaign-plan card is a minimal additive card kind or reuses an existing generic card slot, holding the frozen-object-model constraint.
- Planner's default frame-count heuristic and the exact perf cap.
- The structured-output schema for the planner agent (brief/audience/hierarchy/directions) — must respect the Zod 4 ↔ Anthropic gotchas learned in 02.1 (no integer `min/max`, no `propertyNames`/keyed `z.record`; use `.catchall(...)`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` § "Phase 4: Campaign / Social" — goal + 4 success criteria.
- `.planning/REQUIREMENTS.md` — full text of FND-02, CAMP-01..05, EXP-01/02/03.
- `.planning/PROJECT.md` — core value ("AI cannot bypass the Jio Design System"), hard constraints (Mastra orchestration / AI-SDK model-only; IR canonical; sandboxed previews isolated), isolation rules; Key Decision "Foundation resolver must cover non-web profiles."

### Non-web foundation coverage (the central decision — D-01..03)
- `packages/experience-builder-core/FOUNDATION-COVERAGE.md` — the P1 audit that deferred non-web coverage to P4; the "never invent a dimension" rule and the DEFINED-vs-ASSUMED matrix. **MUST read.**
- `packages/experience-builder-core/src/profiles/outputProfileTable.ts` — the artifact-type → output-profile table; `coverage: 'assumed'` / `null`-dimension placeholders to fill from the foundation.
- `packages/shared/src/types/platforms.ts` — `PlatformsFoundationConfig` / `PlatformEntry` / `PlatformBreakpoint` / `PlatformCategory` (`digital-responsive` | `digital-fixed` | `print` | `physical`) — the foundation dimension source (width/height/units + DIN-1450 viewing-distance params).
- `packages/shared/src/data/dimension-scales.ts` — f-step scale, platform ids, DIN-1450 base; the spacing-token → multiplier basis for safe-area insets.
- `packages/convex/convex/schema.ts` § `dimensionConfigs` / platforms foundation storage + `foundations` table — how the Platforms foundation is persisted per brand.
- `packages/experience-builder-core/src/contracts/foundationResolve.ts` — `FoundationResolveResult` discriminated union (the typed gap variant for D-02).

### Foundation resolution wiring (reuse the Phase 02.1 path)
- `packages/experience-builder-agents/src/foundationResolver.ts` + `subBrandFoundationsLoader.ts` — the resolver to extend for non-web profiles.
- `apps/platform/src/app/api/experience-lab/run/route.ts` — `makeConvexFoundationsLoader`; the run route that injects the Convex-backed loader.
- `.planning/phases/02.1-close-fnd-01-fnd-04-wire-brand-foundations-from-convex-into-/02.1-CONTEXT.md` — how brand foundations flow Convex → workflow.

### Campaign planner + HITL + carousel (CAMP-01..05)
- `packages/experience-builder-agents/src/workflow.ts` — the Mastra workflow + suspend/resume + finalizeRun; where the planner/HITL/carousel steps insert.
- `packages/experience-builder-agents/src/agents/plannerAgent.ts` — existing planner agent to extend for campaign briefs/directions.
- `packages/experience-builder-agents/src/adapters/voiceAdapter.ts` + `designAdapter.ts` — ToV (per-frame copy/caption) + Design (layout/motif per direction) integration seams.
- `packages/experience-builder-agents/src/steps/evaluate.ts` + `repair.ts` — the per-frame quality loop (D-09).
- `apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.tsx` — the prompt card / request panel to extend with brief fields (D-04).
- `apps/platform/src/app/(platform)/(experience-lab)/_panels/VersionTimelinePanel.tsx` — the variant-group/version canvas patterns to mirror for the ordered carousel group (D-07).
- `.planning/phases/03-preview-eval-repair/03-CONTEXT.md` — D-12/D-14 variant grouping (`variantGroupId`, tldraw frame), suspend/resume, best-of-N, repair caps to reuse.

### Export (EXP-01/02/03)
- `packages/experience-builder-export/` — net-new (empty) — the package to build (code/PNG/JPG/PDF emitters).
- `apps/platform/src/lib/playwrightRenderer.ts` — the verified Playwright capture loop to reuse for full-res raster export (D-10).
- `packages/experience-builder-agents/src/compiler.ts` — emits the TSX source consumed by code export (D-12).
- `packages/experience-builder-preview/PREVIEW-DECISION.md` + `DaytonaExecutor.ts` — the in-box capture path (alternative raster source); `.planning/phases/03.1-.../03.1-CONTEXT.md` for the self-contained bundle.
- `packages/convex/convex/schema.ts` § `campaignAssets` (`capturedImageStorageId`/`capturedImageUrl`) — the existing pattern for storing rendered raster output in Convex storage (reference only — that's the legacy feature's table; the Lab uses its own append-only `experience*` tables + Convex `_storage`).

### Codebase maps
- `.planning/codebase/ARCHITECTURE.md`, `STACK.md`, `INTEGRATIONS.md`, `CONCERNS.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **OneUI Platforms foundation** (`PlatformsFoundationConfig`, `packages/shared/src/types/platforms.ts`): already models `print` (A4/Poster/Business Card) and `physical` (Billboard/Bus Stop/Signage) canvases with real `viewportWidth`/`viewportHeight`/`units` + per-entry DIN-1450 params — the foundation-backed source for non-web dimensions (D-01).
- **Phase 02.1 foundation loader path** (`makeConvexFoundationsLoader` → `resolveStep`): the Convex→workflow brand-foundation wiring to extend for non-web profiles, no schema migration.
- **Phase-3 quality loop** (`steps/evaluate.ts`, `steps/repair.ts`, bounded caps, best-of-N): run per frame (D-09).
- **Variant grouping** (`variantGroupId` + tldraw frame, Phase 3 D-12/D-14): extend with an order index for the ordered carousel group (D-07).
- **Playwright capture** (`playwrightRenderer.ts` + Daytona in-box capture): full-res raster export source (D-10/D-11).
- **ToV + Design adapters** (`voiceAdapter.ts`, `designAdapter.ts`): per-frame copy/caption + per-direction layout/motif (reuse, internals untouched).
- **Mastra suspend/resume + AG-UI event stream** (`workflow.ts`): the HITL machinery for the campaign-plan checkpoint (D-05).

### Established Patterns
- **Mastra owns orchestration; Vercel AI SDK is the model layer only** (single `callModel`/`modelAdapter` seam). The planner + per-frame ToV calls go through that seam.
- **IR is the only source of truth; repair patches the IR, never JSX.** Campaign frames are IR artifacts.
- **Append-only Convex persistence** — versions/variants/exports extend tables, no destructive migration.
- **Zod 4 ↔ Anthropic structured-output gotchas** (from 02.1): no integer `min/max`, no `propertyNames`/keyed `z.record`; use `z.object({}).catchall(...)`. The planner's structured output must respect this.
- **"Never invent" honesty rule** (FOUNDATION-COVERAGE.md): a missing foundation value → typed gap, never a fabricated number.

### Integration Points
- Foundation resolver ← extended to read the Platforms foundation for non-web profiles; gap variant on miss.
- Planner + carousel + per-frame loop ← inserted into the existing Mastra workflow (planner suspends for HITL; frames generate after resume).
- Prompt card / RequestPanel ← extended with brief fields (artifact-type-gated).
- New `experience-builder-export` package ← consumed by a card action menu; raster via Playwright, PDF composed server-side, code from the compiler; output to Convex storage.

</code_context>

<specifics>
## Specific Ideas

- **User directive (load-bearing):** non-web dimensions must be **consumed from the OneUI foundations dimension definition** — i.e. the Platforms foundation, "how it is defined there" — not from a Lab-owned constant or an external spec table. This is the spine of D-01.
- There is an **existing, separate** campaign/social feature in the repo (`(builder)/create`, Convex `campaigns`/`campaignAssets`/`createProjects`/`createAssets`, `social-platforms.ts`). It is the **isolated legacy Builder** — useful as a reference for dimension values and the capture/store pattern, but **must not be modified or depended on**; the Lab builds its own isolated path.
- Carousel narrative shape used as the working example: hook → feature → feature → proof → CTA.

</specifics>

<deferred>
## Deferred Ideas

- **EXP-04 handoff bundle** (HTML/PPTX/Figma/git handoff) — Phase 5.
- **Direct social publishing/scheduling** (SCHED-01) — v2.
- **Image-reference input** for style/layout (INPUT-07) and image-slot/product-shot population — v2 / out of this phase's brief (the planner produces copy + composition, not product imagery generation).
- **Seeding standard social/print canvas presets into the Platforms foundation** so CAMP-01 works out-of-the-box for every brand — considered and *not* chosen for the mvp (D-02 keeps the honest gap); revisit as a foundation-data task if too many brands lack non-web canvases.
- **Per-frame best-of-N variants** for carousels (default N=1 in D-09) — a future quality lever.
- **Cross-frame visual-consistency evaluation** of a carousel as a set — considered; per-frame loop chosen (D-09).

### Reviewed Todos (not folded)
None — no pending todos matched this phase.

</deferred>

---

*Phase: 4-Campaign / Social*
*Context gathered: 2026-06-02*
