---
phase: 04-campaign-social
plan: 02
subsystem: agents
tags: [campaign-planner, hitl, suspend-resume, anthropic-safe-schema, ds-grounding, convex-persistence, experience-builder]

# Dependency graph
requires:
  - phase: 04-campaign-social
    plan: 01
    provides: non-web foundation resolver branch (resolveFoundation + resolvedDimensions), PROFILE_PLATFORM_MAP / getPlatformTargetForProfile, mmToPx
provides:
  - "CampaignPlanSchema + CreativeDirectionSchema (Anthropic-safe, DS-grounded closed role/surface enums) in @oneui/experience-builder-core"
  - "runCampaignPlanner + campaignPlannerAgent via the single callModel seam (clamped, exactly-3-directions)"
  - "Workflow campaign branch: covered foundation -> runCampaignPlanner -> persist plan -> suspend on suspendPayload"
  - "campaignPlanCheckpoint Mastra step + CampaignResumeSchema (strict, clamped, ORCH-04)"
  - "Append-only campaignPlan field on experienceRuns + setCampaignPlan/getCampaignPlan Convex functions"
  - "/api/experience-lab/resume route that re-hydrates the plan from Convex (not process memory) and re-enters the workflow with the selection"
  - "RequestPanel artifact-type-gated Audience/Objective/Channel brief fields persisted on the prompt card and posted with the run"
  - "ig-square/ig-portrait/ig-carousel now map to the social platform target (resolvable per-brand once seeded, D-02)"
affects: [carousel-frames, frame-generation, campaign-plan-card-ui, export-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Campaign planner is DS-grounded via CLOSED enums (leadRole ∈ 9 roles, surfaceMood ∈ 7 surfaces) — the planner cannot invent a visual system (D-06 / T-04-03)"
    - "Number constraints live in .describe() prose + runtime clamp, never Zod number .min/.max/.int (Anthropic structured-output safety)"
    - "Cross-request resume re-hydrates from durable Convex (append-only, keyed by runId), never process-memory cache (Pitfall 4 / A5 / T-04-14)"
    - "Branching/selection lives in the workflow (ORCH-04); the model layer is touched only via callModel"

key-files:
  created:
    - packages/experience-builder-core/src/contracts/campaignPlan.ts
    - packages/experience-builder-core/src/contracts/campaignPlan.test.ts
    - apps/platform/src/app/api/experience-lab/resume/route.ts
  modified:
    - packages/experience-builder-core/src/index.ts
    - packages/experience-builder-core/src/profiles/profilePlatformMap.ts
    - packages/experience-builder-core/src/profiles/profilePlatformMap.test.ts
    - packages/experience-builder-agents/src/agents/plannerAgent.ts
    - packages/experience-builder-agents/src/agents/plannerAgent.test.ts
    - packages/experience-builder-agents/src/runTypes.ts
    - packages/experience-builder-agents/src/runContext.ts
    - packages/experience-builder-agents/src/workflow.ts
    - packages/experience-builder-agents/src/workflow.test.ts
    - packages/experience-builder-agents/src/foundationResolver.test.ts
    - packages/convex/convex/schema.ts
    - packages/convex/convex/experienceRuns.ts
    - apps/platform/src/app/api/experience-lab/run/route.ts
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/runStream.ts
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/useExperienceLabRun.ts
    - apps/platform/src/app/(platform)/(experience-lab)/_canvas/shapes/PromptCardShape.tsx
    - apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.tsx
    - apps/platform/src/app/(platform)/(experience-lab)/_panels/RequestPanel.module.css

key-decisions:
  - "runCampaignPlanner enforces exactly 3 directions by TRIMMING a longer list to the first three and THROWING on fewer than three (a <3-direction plan is not the HITL card contract)"
  - "The campaign branch persists the plan to Convex via an INJECTED persistCampaignPlan callback (mirroring foundationsLoader) so the agents package stays backend-free"
  - "The run route pre-creates the experienceRuns row so the plan is keyed by a real Convex run id; the resume route reads it back by that id"
  - "ig-* profiles were given social-platform map targets (additive to plan-01's frozen map) so a brand that SEEDS the canvas resolves; brands without it still gap honestly (D-02)"
  - "Widened runStep's step.execute param to (a: never) — contravariant — which also cleared the pre-existing Mastra ExecuteFunction/ObservabilityContext deferred typecheck class for workflow.ts"

patterns-established:
  - "isCampaignRun(ctx) keys the branch on artifactType ∈ {social-post, instagram-carousel} — the branch decision is the workflow's, never the model's (ORCH-04)"
  - "A campaign run on a foundation MISS short-circuits to a gap BEFORE the planner runs (reuses plan-01's resolver gap; no model call)"
  - "The resume route clamps the selection at the edge (directionIndex bounded to the plan's directions, frameCount 1..10) AND the workflow clamps again (defence in depth, V5 / T-04-05)"

requirements-completed: [CAMP-01, CAMP-02]

# Metrics
duration: 38min
completed: 2026-06-02
---

# Phase 4 Plan 02: Campaign Path — Plan, Suspend, Resume Summary

**A first-class campaign path: social-post/instagram-carousel runs branch to a DS-grounded campaign planner (Anthropic-safe closed role/surface enums), persist the plan to Convex append-only, and SUSPEND at a campaign-plan checkpoint; a new strict-validated resume route re-hydrates the plan from Convex (never process memory) and re-enters the workflow with the user's clamped direction + frame-count selection. The prompt card reveals token-only Audience/Objective/Channel brief fields only for campaign types; web runs are untouched and orchestration never imports the model layer.**

## Performance
- **Duration:** ~38 min
- **Tasks:** 3 (Tasks 1-2 TDD, Task 3 implementation)
- **Files:** 18 (3 created, 15 modified)

## Accomplishments
- **CampaignPlanSchema + CreativeDirectionSchema** (`campaignPlan.ts`): brief summary + audience + ordered message hierarchy + exactly-3 DS-grounded directions + recommended index + frame count. Every number is a plain `z.number()` (constraints in `.describe()` + runtime clamp) and the role/surface are CLOSED enums (9 appearance roles / 7 surface tokens). The compiled JSON schema contains no `minimum`/`maximum`/`propertyNames` (asserted by test).
- **runCampaignPlanner + campaignPlannerAgent** (`plannerAgent.ts`): runs through the single `callModel` seam (no `ai`/`@ai-sdk` import), memoized on the canonical brief inputs; clamps `recommendedFrameCount` to 1..10 and `recommendedDirectionIndex` to 0..len-1, and enforces exactly three directions (trim extras, throw on too few).
- **Workflow campaign branch** (`workflow.ts`): `isCampaignRun` keys on artifact type; a covered foundation runs the planner then SUSPENDS carrying the plan on `suspendPayload`, persisting it to Convex via the injected `persistCampaignPlan` BEFORE suspend; a foundation MISS short-circuits to a gap before the planner. `campaignPlanCheckpoint` is the Mastra-native equivalent step; `CampaignResumeSchema` is the strict, Anthropic-safe resume body.
- **Convex persistence** (`schema.ts` / `experienceRuns.ts`): additive `campaignPlan: v.optional(v.any())` on the `experienceRuns` row + `setCampaignPlan` (append-only patch) and `getCampaignPlan` (read-back) — no migration, existing rows round-trip.
- **Resume route** (`/api/experience-lab/resume`): strict `{ runId, brandId, directionIndex, frameCount }` body; reads the persisted plan from Convex by `runId` (never process memory), clamps the selection at the edge, re-fetches the brand Platforms foundation, and re-enters the workflow with `campaignSelection`. An unknown/expired runId returns a clear error rather than a fabricated plan.
- **RequestPanel brief fields** (`RequestPanel.tsx` / `.module.css`): artifact-type-gated "Campaign brief" group (Audience/Objective InputField + Channel Select, gated to the type) — token-only, deep-path Jio imports, single bold/primary Run CTA preserved. Values persist on `PromptCardShape` props and post with the run.

## Task Commits
1. **Task 1 (RED): CampaignPlanSchema + Anthropic-safety/DS-enum tests** — `9dc2293b` (test)
2. **Task 1 (GREEN): runCampaignPlanner via callModel** — `490d442d` (feat)
3. **Task 2 (RED): campaign branch + suspend/resume + ig-map tests** — `a66e3c1b` (test)
4. **Task 2 (GREEN): campaign branch, suspend/resume, Convex persistence, resume route** — `53e50ef0` (feat)
5. **Task 3: RequestPanel campaign-brief progressive disclosure** — `5b0444ab` (feat)

## Deviations from Plan

### Auto-fixed / scope-driven

**1. [Rule 3 - Blocking] ig-* profiles given social-platform map targets**
- **Found during:** Task 2 (the "covered + social → planner runs" behavior was untestable because plan-01's frozen `PROFILE_PLATFORM_MAP` left ig-* commented out → every campaign run gapped).
- **Fix:** Added `ig-square`/`ig-portrait`/`ig-carousel` → `{ platformId: 'social', breakpointId: '<id>' }` map entries (additive). This is the D-02 mechanism working as designed: a brand WITHOUT a `social` platform still gaps honestly (the resolver checks the brand's foundation, not the map alone); only a brand that SEEDS the canvas resolves. Updated the plan-01 `profilePlatformMap.test.ts` assertion (ig-* now map to the social target; `ig-story`/`slide-*`/`digital-portrait` stay undefined) and corrected a now-inaccurate comment in `foundationResolver.test.ts`.
- **Files:** `profilePlatformMap.ts`, `profilePlatformMap.test.ts`, `foundationResolver.test.ts`.
- **Commits:** `a66e3c1b`, `53e50ef0`.

**2. [Rule 3 - Blocking] Widened `runStep` param to clear the Mastra typecheck class**
- **Found during:** Task 2 (the new campaign lead-in `runStep(...)` calls hit the same pre-existing Mastra `ExecuteFunction`/`ObservabilityContext` generic mismatch logged in `deferred-items.md`).
- **Fix:** Typed `runStep`'s `step.execute` param as `(a: never)` (contravariant) — the deterministic runner only invokes `execute({ inputData: { ctx } })`, so this is sound. As a bonus it cleared the ENTIRE pre-existing `workflow.ts` deferred typecheck class (was 8 errors), so the agents package now typechecks with only the unrelated `@oneui/shared/buildNativeTheme.ts` error remaining.
- **Files:** `workflow.ts`; updated `deferred-items.md` to mark the class resolved.
- **Commit:** `53e50ef0`.

**3. [Rule 2 - Critical] Run route pre-creates the Convex run row + threads brandPlatforms**
- **Why:** The plan called for persisting the plan keyed by `runId` BEFORE suspend, but the workflow generates its own in-memory `runId`. To key the durable plan by a real `experienceRuns` id the resume route can read, the run route now pre-creates the run row and injects a `persistCampaignPlan` closure bound to that id, surfacing the Convex id on the result frame as `campaignRunId`. It also fetches the brand's Platforms foundation (`getByType`) and threads `brandPlatforms` so the campaign branch can resolve real non-web dims (FND-02) instead of always gapping.
- **Files:** `run/route.ts`, `resume/route.ts`, `runStream.ts`.
- **Commit:** `53e50ef0`.

## Threat Model Coverage
- **T-04-03 (DS grounding):** `CreativeDirectionSchema` uses CLOSED `leadRole`/`surfaceMood` enums — a prompt-injected brief cannot make the planner emit a non-Jio visual system (verified by the "invented role/mood rejected" tests).
- **T-04-04 (resume body):** `/resume` body is `.strict()`; `CampaignResumeSchema` is `.strict()`; selection clamped at the route edge AND in the workflow.
- **T-04-05 (frameCount DoS):** `recommendedFrameCount` + resume `frameCount` clamped to 1..10 at every boundary.
- **T-04-14 (cross-request resume):** plan persisted to Convex append-only keyed by runId BEFORE suspend; the resume route reads it back from Convex (asserted by the "no cache/memoize/makeResume in resume route" grep gate + the Convex-round-trip workflow test); unknown/expired runId errors rather than fabricating a plan.
- **T-04-SC (npm installs):** zero new package installs in this plan.

## Verification
- `pnpm --filter @oneui/experience-builder-core test` — 67 passed (8 files).
- `pnpm --filter @oneui/experience-builder-agents test` — 95 passed (13 files), including 11 plannerAgent + 30 workflow (6 new campaign cases).
- `pnpm --filter @oneui/experience-builder-agents typecheck` — clean except the pre-existing cross-package `@oneui/shared/buildNativeTheme.ts` `stateLayers` error (deferred).
- `pnpm --filter @oneui/convex typecheck` — clean except the same pre-existing `@oneui/shared` error.
- `pnpm --filter @oneui/platform typecheck` — all 18 errors are pre-existing `stateLayers`/`ResolvedTokenSet` in surface-preview files; none in the experience-lab routes/panel/shape/runStream this plan modified.
- `pnpm check:literals` — RequestPanel files clean (the only failures are pre-existing `packages/ui` Modal/stories literals, out of scope).
- `requestPanel.test.tsx` — 15 passed (no regression from the brief-field additions).
- Grep gates: no `ai`/`@ai-sdk` import in `campaignPlan.ts`/`plannerAgent.ts`/`workflow.ts` (the single workflow.ts match is a doc comment stating the rule); resume route has `.strict()`/`directionIndex`/`getCampaignPlan` and NO `cache`/`memoize`/`makeResume`; `campaignPlan: v.optional` + `setCampaignPlan`/`getCampaignPlan` present; RequestPanel uses deep-path imports only, no raw backgrounds; CSS token-only (the single literal-regex match is the file-header rule documentation).

## Deferred Issues
Pre-existing `@oneui/shared` `stateLayers`/`ResolvedTokenSet` typecheck errors (surface-engine area) surfaced again in `@oneui/platform` (`SurfaceNewPreview.tsx`, `SurfaceValidationTable.tsx`) and `buildNativeTheme.ts` — logged in `deferred-items.md`, out of scope (not touched by this plan). The pre-existing `workflow.ts` Mastra typecheck class was RESOLVED by this plan's `runStep` param widening.

## Known Stubs
- Frame generation is intentionally deferred to plan 04-03: the campaign resume branch CAPTURES the user's `{ directionIndex, frameCount }` selection on `ctx.campaignSelection` and proceeds past the checkpoint (surfacing `outcome: 'gap'` for now since no carousel artifact is produced yet). The carousel driver / per-frame ToV copy lands in 04-03 (CAMP-03/CAMP-04). This is the documented MVP slice boundary, not an accidental stub.
- The campaign-plan CARD UI (rendering `suspendPayload.plan` on the canvas + the direction-selection/Generate-frames CTA) is plan 04-03 per UI-SPEC; this plan surfaces the plan + `campaignRunId` on the result frame so 04-03 can consume them.

## Threat Flags
None — no new security-relevant surface beyond the planned trust boundaries (brief text → planner prompt, resume route body), all mitigated above.

## Self-Check: PASSED
- Created files exist: `campaignPlan.ts`, `campaignPlan.test.ts`, `resume/route.ts` — FOUND.
- Commits exist: `9dc2293b`, `490d442d`, `a66e3c1b`, `53e50ef0`, `5b0444ab` — FOUND.
- All touched-package tests green; all grep gates pass; my files typecheck clean (only pre-existing cross-package surface-engine errors remain).

## TDD Gate Compliance
Tasks 1 and 2 followed RED → GREEN (test commit precedes feat commit in git log for each). Task 3 was `tdd="false"` (UI). No REFACTOR commits were needed.

---
*Phase: 04-campaign-social*
*Completed: 2026-06-02*
