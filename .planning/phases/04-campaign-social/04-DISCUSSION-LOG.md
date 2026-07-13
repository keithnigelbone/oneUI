# Phase 4: Campaign / Social - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02
**Phase:** 4-Campaign / Social
**Areas discussed:** Non-web foundation coverage, Campaign brief + Planner HITL, Carousel frames on canvas, Export pipeline

---

## Non-web foundation coverage

### Q1 — How should non-web canvas DIMENSIONS become legitimate without violating "never invent a dimension"?

| Option | Description | Selected |
|--------|-------------|----------|
| Sourced external-platform spec | Treat platform-published canvas sizes as a documented external standard table | |
| Extend Jio foundations | Add a real non-web fixed-aspect + safe-area foundation concept to @oneui/shared/tokens | |
| Keep as honest gaps for now | Leave non-web profiles as gap reports | |

**User's choice:** Other (free text) — "you should consume from the foundations dimension of OneUi, and how is defined there."
**Notes:** Investigated and confirmed OneUI's **Platforms foundation** (`PlatformsFoundationConfig`) already models `print` (A4/Poster) and `physical` (Billboard/Signage) canvases with real width/height/units + DIN-1450 params. Decision: resolve non-web dimensions from the brand's Platforms foundation via the Phase 02.1 Convex path — not an external table, not a new concept, not the legacy `social-platforms.ts` constant.

### Q2 — When a requested non-web canvas isn't defined in the brand's Platforms foundation, what happens?

| Option | Description | Selected |
|--------|-------------|----------|
| Gap report, honest | Emit the typed FND-03 gap; fix is adding the canvas to the foundation | ✓ |
| Seed standard social formats into the foundation | Phase 4 adds standard social/print canvases as foundation data on the system brand | |
| You decide | Defer reconciliation to researcher/planner | |

**User's choice:** Gap report, honest
**Notes:** Keeps "never invent" absolute. `coverage:'assumed'` flips to real per-brand only where the foundation defines the canvas.

### Q3 — Where should TYPE SCALE and SAFE-AREA insets come from?

| Option | Description | Selected |
|--------|-------------|----------|
| Both from foundations, f-step derived | Type = DIN-1450 @ viewing distance × brand f-scale; safe-area = Spacing-N tokens | ✓ |
| Type from foundation, safe-area as sourced platform constant | Type from f-scale; safe zones from platform-published specs | |
| You decide | Defer to researcher | |

**User's choice:** Both from foundations, f-step derived
**Notes:** No raw px, no invented margins; a platform margin with no token = gap.

---

## Campaign brief + Planner HITL

### Q1 — Is a campaign brief a new input surface or the existing prompt card?

| Option | Description | Selected |
|--------|-------------|----------|
| Extend the prompt card | Reveal brief fields (audience/objective/channel) when artifact-type is social/carousel | ✓ |
| New campaign-brief card | Dedicated card kind with structured brief fields | |
| You decide | Defer to planner | |

**User's choice:** Extend the prompt card
**Notes:** One input model; stays inside the frozen 13-member object model.

### Q2 — How should the 3-creative-directions HITL checkpoint surface and resume?

| Option | Description | Selected |
|--------|-------------|----------|
| Plan card with selectable directions | Mastra suspend → campaign-plan card with 3 directions → select → resume | ✓ |
| Inline chat checkpoint | Surface directions in chat/event log; reply to resume | |
| You decide | Defer to planner | |

**User's choice:** Plan card with selectable directions
**Notes:** Reuses Phase-3 suspend/resume + AG-UI event stream; frames generate only after selection.

### Q3 — What should each creative direction contain?

| Option | Description | Selected |
|--------|-------------|----------|
| DS-grounded concept bundle | name + concept + copy angle + role/surface/motif (foundation-grounded) | ✓ |
| Copy-only directions | Differ only by copy angle; visuals left to Design agent | |
| You decide | Defer to planner | |

**User's choice:** DS-grounded concept bundle
**Notes:** No invented colors/fonts — only role/surface/motif selections mapping to existing foundations + Design agent.

---

## Carousel frames on canvas

### Q1 — How should carousel frames be grouped?

| Option | Description | Selected |
|--------|-------------|----------|
| Ordered carousel group | Variant-group frame + explicit order index, render left-to-right | ✓ |
| Reuse variant-group as-is | No explicit order (incidental) | |
| You decide | Defer to planner | |

**User's choice:** Ordered carousel group
**Notes:** Carousel order is meaningful; extend `variantGroupId` pattern + tldraw frame with an order field.

### Q2 — How is frame COUNT decided?

| Option | Description | Selected |
|--------|-------------|----------|
| Planner proposes, user can adjust | Planner recommends from message hierarchy; user overrides; cap ~10 | ✓ |
| User specifies up-front | User enters count; planner fills roles | |
| You decide | Defer to planner | |

**User's choice:** Planner proposes, user can adjust
**Notes:** Default cap ~10 for canvas perf.

### Q3 — How much of the Phase-3 quality loop runs per frame?

| Option | Description | Selected |
|--------|-------------|----------|
| Full loop per frame | Each frame gen→compile→validate→eval→repair; best-of-N=1; shared run budget | ✓ |
| Validate-all, eval the set | Per-frame validate; evaluate carousel as a set | |
| You decide | Defer to planner | |

**User's choice:** Full loop per frame
**Notes:** Each frame provably DS-valid; hard repair cap (N=3) + per-run budget shared across the carousel.

---

## Export pipeline

### Q1 — Raster (PNG/JPG) pixel source?

| Option | Description | Selected |
|--------|-------------|----------|
| Re-render at export resolution | Re-render bundle at full profile dims via Playwright; native size + device-scale | ✓ |
| Reuse existing preview screenshot | Export the eval screenshot | |
| You decide | Defer to planner | |

**User's choice:** Re-render at export resolution
**Notes:** Eval screenshots are sized for scoring, not delivery.

### Q2 — PDF contents + production?

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-page from frame rasters | One frame per PDF page, in carousel order, server-side | ✓ |
| Vector/HTML-to-PDF | Playwright page.pdf for selectable text | |
| You decide | Defer to planner | |

**User's choice:** Multi-page from frame rasters
**Notes:** Same re-rendered rasters as Q1; library choice deferred to research.

### Q3 — Export trigger + code export source?

| Option | Description | Selected |
|--------|-------------|----------|
| Card action menu → export card | ⋮ menu (Code/PNG/JPG/PDF); export card kind + download; Convex storage | ✓ |
| Dedicated export panel | Separate panel/dialog with options | |
| You decide | Defer to planner | |

**User's choice:** Card action menu → export card
**Notes:** Code export = compiler TSX + resolved Jio CSS (no re-gen); server-side in `experience-builder-export`; output to Convex storage.

---

## Claude's Discretion

- Exact `outputProfile` → `PlatformEntry`/`PlatformBreakpoint` matching strategy.
- PDF library selection + raster→PDF composition path.
- Campaign-plan card kind (minimal additive vs reuse generic slot) against the frozen object model.
- Planner default frame-count heuristic + perf cap.
- Planner structured-output schema (respecting Zod 4 ↔ Anthropic gotchas).

## Deferred Ideas

- EXP-04 handoff bundle (HTML/PPTX/Figma/git) — Phase 5.
- Direct social publishing/scheduling (SCHED-01) — v2.
- Image-reference input / image-slot population (INPUT-07) — v2.
- Seeding standard social/print presets into the Platforms foundation — considered, not chosen (honest gap kept).
- Per-frame best-of-N variants for carousels — future quality lever.
- Cross-frame visual-consistency evaluation as a set — considered; per-frame loop chosen.
