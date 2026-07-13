---
phase: 04
slug: campaign-social
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-02
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.5 (workspace standard; `turbo test`) |
| **Config file** | per-package `vitest.config.ts` (each `packages/experience-builder-*`; the export package gains one in 04-04 Task 2) |
| **Quick run command** | `pnpm --filter <touched-package> test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | quick (single-package, mocked `__setCallModelImpl`): ~5-15s; full turbo suite: ~90-150s |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter <touched-package> test` (~5-15s)
- **After every plan wave:** Run `pnpm test` (touched packages) (~90-150s)
- **Before `/gsd-verify-work`:** Full suite green + `pnpm typecheck` + `pnpm check:literals` (Lab UI added)
- **Max feedback latency:** ~15s per-task (single-package mocked run); no watch-mode flags

---

## Per-Task Verification Map

> One row per task across all 4 plans. Every requirement (FND-02, CAMP-01..05, EXP-01/02/03) maps to at least one row. Model-touching tests run credential-free via `__setCallModelImpl` (no API key).

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure / Verified Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|----------------------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | FND-02, CAMP-05 | T-04-01 | profile→platform map: covered profile returns target, ig-* returns undefined; mmToPx exported; no literal dims | unit | `pnpm --filter @oneui/experience-builder-core test profilePlatformMap` | ❌ W0 (new) | ⬜ pending |
| 04-01-02 | 01 | 1 | FND-02, CAMP-05 | T-04-01 | non-web hit → resolvedDimensions + Spacing-N safe-area; miss (no map / no breakpoint) → typed FND-03 gap, no numbers; web unchanged | unit | `pnpm --filter @oneui/experience-builder-agents test foundationResolver` | ✅ extend | ⬜ pending |
| 04-02-01 | 02 | 2 | CAMP-02 | T-04-03 | CampaignPlanSchema parses 3 DS-grounded directions; compiles to Anthropic-safe JSON (no minimum/maximum/propertyNames); runCampaignPlanner clamps frameCount 1..10 + index; single callModel seam | unit | `pnpm --filter @oneui/experience-builder-core test campaignPlan && pnpm --filter @oneui/experience-builder-agents test plannerAgent` | ❌ W0 (new) + ✅ extend | ⬜ pending |
| 04-02-02 | 02 | 2 | CAMP-01, CAMP-02 | T-04-04, T-04-05, T-04-14 | campaign branch on social+covered; web unchanged; foundation-miss short-circuits before planner; CampaignPlan persisted to Convex (by runId) before suspend + read-back round-trip; resume reads from Convex (not memory) + clamped selection | unit | `pnpm --filter @oneui/experience-builder-agents test workflow` | ✅ extend | ⬜ pending |
| 04-02-03 | 02 | 2 | CAMP-01 | T-04-03 | brief fields revealed only for social-post/instagram-carousel; token-only, deep-path imports, no raw background (write-through asserted by 04-02-02 run-body test) | typecheck + literals (UI compile gate) | `pnpm --filter @oneui/platform typecheck && pnpm check:literals` | N/A (UI) | ⬜ pending |
| 04-03-01 | 03 | 3 | CAMP-03, CAMP-04, CAMP-05 | T-04-07, T-04-08 | N ordered frames, shared variantGroupId + sequential orderIndex; per-frame ToV copy (CAMP-03); shared budget halts; foundation gap → 0 frames; orderIndex schema additive | unit | `pnpm --filter @oneui/experience-builder-agents test carousel` | ❌ W0 (new) | ⬜ pending |
| 04-03-02 | 03 | 3 | CAMP-03, CAMP-04 | T-04-08 | resume → carousel produces N ordered frames; each persisted with shared variantGroupId + orderIndex; repair-exhausted frame does not fail siblings | unit | `pnpm --filter @oneui/experience-builder-agents test workflow` | ✅ extend | ⬜ pending |
| 04-03-03 | 03 | 3 | CAMP-04 | T-04-09 | orderCarouselFrames sorts ascending; frameLabel "Frame n of N"; carouselGroupLabel "Carousel: {name}"; frameStatusPill maps passed→positive/repair-exhausted→negative; CarouselGroupFrame consumes the helper; no Builder/barrel import | unit | `pnpm --filter @oneui/platform test carouselFrameLayout && pnpm --filter @oneui/platform typecheck` | ❌ W0 (new) | ⬜ pending |
| 04-04-01 | 04 | 4 | EXP-03 | T-04-SC | BLOCKING human-verify: authenticate pdf-lib before install (npm view version + empty postinstall + npmjs.com) | manual checkpoint (non-auto-approvable) | n/a (human-verify gate) | N/A (checkpoint) | ⬜ pending |
| 04-04-02 | 04 | 4 | EXP-01 | — | export package builds + tests; code emitter returns persisted TSX + Jio CSS verbatim; no compiler/generator re-run | unit | `pnpm --filter @oneui/experience-builder-export test code` | ❌ W0 (new) | ⬜ pending |
| 04-04-03 | 04 | 4 | EXP-02 | T-04-10 | raster re-render uses foundation {w,h} + pixelDensity deviceScaleFactor (not eval default / not hardcoded 2); mm canvas via mmToPx; jpg→jpeg; eval screenshots unaffected | unit (mock capture) | `pnpm --filter @oneui/experience-builder-export test raster` | ❌ W0 (new) | ⬜ pending |
| 04-04-04 | 04 | 4 | EXP-03 | T-04-SC | composeCarouselPdf: page count == frame count; per-page size == frame dims; embed order preserved (carousel orderIndex); no page.pdf() | unit | `pnpm --filter @oneui/experience-builder-export test pdf` | ❌ W0 (new) | ⬜ pending |
| 04-04-05a | 04 | 4 | EXP-01, EXP-02, EXP-03 | T-04-11, T-04-13 | dispatchExport routes each kind to exactly its emitter (code/png/jpg/pdf), pdf frames in ascending orderIndex, unknown kind rejected; export route strict + brand-scoped + _storage persist; no campaignAssets/(builder) | unit | `pnpm --filter @oneui/experience-builder-export test exportDispatch && pnpm --filter @oneui/platform typecheck` | ❌ W0 (new) | ⬜ pending |
| 04-04-05b | 04 | 4 | EXP-01, EXP-02, EXP-03 | T-04-13 | ⋮ menu Export ▸ Code/PNG/JPG/PDF; aria-label; export card informative→positive + Download; token-only; no Builder/barrel import (dispatch behavior covered by 04-04-05a) | typecheck + literals (UI compile gate) | `pnpm --filter @oneui/platform typecheck && pnpm check:literals` | N/A (UI) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Sampling continuity check:** No run of 3 consecutive tasks lacks an automated behavioral verify. The two UI-only compile-gate tasks (04-02-03, 04-04-05b) are each immediately adjacent to behavioral tests that cover their logic: 04-02-03's brief-field write-through is asserted by 04-02-02's run-body test; 04-04-05b's dispatch is asserted by 04-04-05a's `exportDispatch` test. The two formerly typecheck-only tasks flagged by the checker (CarouselGroupFrame, export route) now have dedicated behavioral tests (04-03-03 `carouselFrameLayout`, 04-04-05a `exportDispatch`).

---

## Wave 0 Requirements

- [x] `packages/experience-builder-core/src/profiles/profilePlatformMap.test.ts` — map → covered/gap (FND-02) [04-01 T1]
- [x] Extend `foundationResolver.test.ts` for non-web hit/miss + gap (FND-02/CAMP-05) [04-01 T2]
- [x] `packages/experience-builder-core/src/contracts/campaignPlan.test.ts` — Anthropic-safe schema shape (CAMP-02) [04-02 T1]
- [x] Extend `plannerAgent.test.ts` for runCampaignPlanner clamps (CAMP-02) [04-02 T1]
- [x] Extend `workflow.test.ts` for campaign branch + Convex plan persist/round-trip + resume (CAMP-01/02) [04-02 T2]
- [x] `packages/experience-builder-agents/src/steps/carousel.test.ts` — ordered frames, shared budget, per-frame ToV, gap → 0 (CAMP-03/04/05) [04-03 T1]
- [x] `apps/platform/.../_canvas/carouselFrameLayout.test.ts` — ordering/label/status pure logic (CAMP-04) [04-03 T3]
- [x] `packages/experience-builder-export/vitest.config.ts` + `test` script (package currently has only `typecheck`) [04-04 T2]
- [x] `packages/experience-builder-export/src/{code,raster,pdf}.test.ts` — three emitters (EXP-01/02/03) [04-04 T2/T3/T4]
- [x] `packages/experience-builder-export/src/exportDispatch.test.ts` — kind→emitter dispatch (EXP-01/02/03) [04-04 T5a]
- [x] Shared fixtures: a brand Platforms foundation (outdoor/print seeded) + an unseeded ig profile (gap path) — built inline in the resolver/workflow tests
- [x] Reuse `__setCallModelImpl` (modelAdapter.ts) for all planner/ToV mocks — no new framework install

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| pdf-lib legitimacy (authenticity gate) | EXP-03 | Supply-chain authentication of an `[ASSUMED]` package before install — non-auto-approvable | 04-04 Task 1 checkpoint: `npm view pdf-lib version` + `npm view pdf-lib scripts.postinstall` (empty) + npmjs.com page + source repo |
| Campaign-plan HITL card renders + direction selection resumes workflow | CAMP-02 / CAMP-03 | Requires live AG-UI event stream + suspend/resume across UI + Convex plan round-trip | Run a campaign brief end-to-end; verify plan card shows brief/audience/hierarchy/3 directions + recommended; select one; confirm frames generate after selection (resume reads plan from Convex) |
| Carousel frames grouped + ordered on canvas within perf budget | CAMP-04 | Visual/perf behavior on tldraw canvas (ordering logic itself is unit-tested in 04-03-03) | Generate a carousel; verify left-to-right ordered frames in one group; check canvas perf budget ≤10 frames |
| Exported PNG/JPG at full foundation-resolved resolution; PDF multi-page in carousel order | EXP-02 / EXP-03 | Binary artifact fidelity (dimensions/page-size logic is unit-tested; final byte fidelity is visual) | Export a carousel; verify raster dimensions == profile dims and PDF page count == frame count in order |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (UI compile-gate tasks are adjacent to covering behavioral tests; the checkpoint is a manual gate)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < ~15s per-task (single-package mocked run)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete
