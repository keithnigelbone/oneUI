# Phase 4 — Multi-Source Coverage Audit

**Audited:** 2026-06-02
**Verdict:** ALL items COVERED — no unplanned items, no phase split needed.

Every GOAL / REQ / RESEARCH / CONTEXT item is mapped to a plan. No silent omissions, no scope reductions ("v1"/"static for now"/"placeholder" language is absent from all four plans).

## GOAL (ROADMAP Phase 4 success criteria)

| # | Success criterion | Covered by |
|---|-------------------|------------|
| 1 | First-class IG/campaign path; resolver returns non-web dims/type-scale/safe-areas or a gap (never invented) | Plan 01 (resolver) + Plan 02 (campaign path entry) |
| 2 | Planner produces brief/audience/hierarchy/3 directions/recommendation; HITL select → per-frame ToV copy | Plan 02 (planner + HITL) + Plan 03 (per-frame ToV) |
| 3 | Carousel frames as IR-backed artifacts grouped on canvas, each resolving foundation dims, within perf budget | Plan 03 |
| 4 | Export as code (React+Jio CSS), PNG/JPG, PDF | Plan 04 |

## REQ (phase requirement IDs)

| ID | Plan(s) |
|----|---------|
| FND-02 | 01 |
| CAMP-05 | 01, 03 |
| CAMP-01 | 02 |
| CAMP-02 | 02 |
| CAMP-03 | 02 (HITL seam) + 03 (per-frame copy) |
| CAMP-04 | 03 |
| EXP-01 | 04 |
| EXP-02 | 04 |
| EXP-03 | 04 |

Coverage: 9/9. Every ID appears in at least one plan's `requirements` frontmatter.

## RESEARCH (features / patterns / pitfalls / stack)

| Item | Covered by |
|------|------------|
| profilePlatformMap (explicit Lab map, Pattern 1) | Plan 01 T1 |
| Extend foundationResolve success arm with resolvedDimensions | Plan 01 T2 |
| Export `mmToPx` (non-exported landmine) | Plan 01 T1 |
| Non-web resolver branch via getDimensionValueFromConfig (Don't Hand-Roll) | Plan 01 T2 |
| CampaignPlanSchema Anthropic-safe + DS-grounded enums (Pattern 3 / Pitfall 2) | Plan 02 T1 |
| runCampaignPlanner via callModel (single seam, ORCH-04) | Plan 02 T1 |
| Brief fields in RequestPanel (Pattern 2) | Plan 02 T3 |
| campaign-plan suspend/resume (Pattern 4) + resume route (Pitfall 4) | Plan 02 T2 |
| Carousel ordered frames + orderIndex (Pattern 5) | Plan 03 T1/T2 |
| Carousel shared budget accumulator (Pitfall 3) | Plan 03 T1 |
| Code/raster/pdf emitters (Pattern 6) | Plan 04 T2/T3/T4 |
| Playwright deviceScaleFactor + viewport parameterization (Pitfall 5) | Plan 04 T3 |
| mm→px raster conversion (Pitfall 6) | Plan 04 T3 |
| pdf-lib install gated by human-verify (Package Legitimacy Audit) | Plan 04 T1/T4 |
| _storage persistence (Don't Hand-Roll) | Plan 04 T5 |

## CONTEXT (D-01..D-13 locked decisions)

| Decision | Plan(s) |
|----------|---------|
| D-01 resolve non-web dims from Platforms foundation | 01 |
| D-02 honest gap on miss | 01 |
| D-03 DIN-1450 type-scale + Spacing-N safe-area | 01 (+ 04 raster) |
| D-04 extend prompt card with brief fields | 02 |
| D-05 HITL via campaign-plan card / suspend-resume | 02 |
| D-06 DS-grounded direction bundle (closed enums) | 02 |
| D-07 ordered carousel group + orderIndex | 03 |
| D-08 planner proposes frame count, clamp 1..10 | 02 (clamp) + 03 (cap) |
| D-09 full quality loop per frame, shared budget, best-of-N=1 | 03 |
| D-10 PNG/JPG re-render at export resolution | 04 |
| D-11 PDF multi-page from ordered rasters | 04 |
| D-12 code export = persisted TSX + Jio CSS | 04 |
| D-13 export card-action menu → _storage → export card | 04 |

All 13 decisions cited. Deferred ideas (EXP-04, SCHED-01, INPUT-07, canvas-preset seeding, per-frame best-of-N, cross-frame eval) are correctly ABSENT from all plans — they are not gaps.

## Exclusions (not gaps)

- EXP-04 handoff bundle → Phase 5 (other phase).
- Direct social publishing/scheduling (SCHED-01), image-reference input (INPUT-07) → v2.
- Seeding standard social/print canvas presets into the Platforms foundation → deferred (D-02 keeps the honest gap).
- Modifying the legacy `(builder)`/`campaignAssets` feature → out of scope (hard isolation; reference-only).
