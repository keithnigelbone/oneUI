---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: verifying
last_updated: "2026-06-07T22:55:00.000Z"
last_activity: 2026-06-07
progress:
  total_phases: 10
  completed_phases: 8
  total_plans: 40
  completed_plans: 40
  percent: 80
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-30)

**Core value:** AI cannot bypass the Jio Design System — every generated artifact is provably composed from real Jio foundations, Jio CSS, and Storybook-approved Jio components.
**Current focus:** Phase 5 — production readiness hardening for the AI Experience Lab

## Current Position

Phase: 5 (production-readiness) — EXECUTING
Plan: Mastra/AI SDK compatibility gate + dependency relink
Status: Mastra compatibility surface is now scripted; AI SDK/Zod lockfile resolutions updated; focused checks pass under Node 22
Last activity: 2026-06-07

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 24
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 6 | - | - |
| 02.1 | 2 | - | - |
| 03 | 6 | - | - |
| 03.1 | 5 | - | - |
| 04.1 | 5 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01 P01 | 25min | 3 tasks | 16 files |
| Phase 01 P02 | 20min | 1 tasks | 6 files |
| Phase 01 P03 | 25min | 1 tasks | 9 files |
| Phase 01 P04 | 30min | 3 tasks | 15 files |
| Phase 01 P05 | 22min | 3 tasks | 19 files |
| Phase 01 P06 | 14min | 3 tasks | 17 files |
| Phase 2 P1 | 23min | 3 tasks | 13 files |
| Phase 2 P2 | 9min | 1 tasks | 1 files |
| Phase 02 P03 | 13min | 4 tasks | 13 files |
| Phase 02 P04 | 4min | 2 tasks | 5 files |
| Phase 02.1 P01 | 4min | 2 tasks | 3 files |
| Phase 02.1 P2 | 7 | 2 tasks | 7 files |
| Phase 03 P07 | 12min | 2 tasks | 4 files |
| Phase 04.1 P01 | 35min | 2 tasks | 10 files |
| Phase 04.1 P02 | 8min | 2 tasks | 3 files |
| Phase 04.1 P03 | 18min | 3 tasks | 15 files |
| Phase 04.1 P04 | 12min | 2 tasks | 4 files |
| Phase 04.1 P05 | 18min | 2 tasks | 5 files |
| Phase 04.2 P01 | 12min | 3 tasks | 6 files |
| Phase 04.2 P02 | ~10min | 2 tasks | 3 files |
| Phase 04.2 P03 | ~10min | 2 tasks | 7 files |
| Phase 04.2 P04 | 25min | 2 tasks | 7 files |
| Phase 04.2 P05 | 25min | 3 tasks | 11 files |
| Phase 04.2 P06 | 30 | 2 tasks | 5 files |

## Accumulated Context

### Roadmap Evolution

- Phase 02.1 inserted after Phase 2: Close FND-01/FND-04: wire brand foundations from Convex into run route → workflow (URGENT)
- Phase 03.1 inserted after Phase 3: Daytona zero-egress render pipeline — make the deferred D-01 production preview path actually functional (real self-contained bundle + Playwright-baked image + in-box serve/capture harness) (URGENT)
- Phase 04.1 inserted after Phase 4: Chat-first Lab UX refactor (conversation drives, canvas displays) — planned UX reframe before Production Readiness
- Phase 04.2 inserted after Phase 4: Generation output quality (real planner + Design/ToV advisors, compositional IR layout, real copy) — surfaced in 04.1 UAT; deferred from this slice. Sits before Phase 5 Production Readiness.

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Scope = full P1–P5 vision (foundation → integration → preview/eval/repair → campaign → production).
- Mastra is the orchestration brain; Vercel AI SDK is the model layer only (boundary enforced).
- Reuse existing ToV + Design agents via integration contracts; isolation by package (`experience-builder-*`) + one isolated route.
- Jio Experience IR is the canonical, markup-free contract; repair patches the IR, never the JSX.
- [Phase ?]: Mastra pin verified for plan 04: @mastra/core@1.37.1 + @mastra/ai-sdk@1.4.3 (peer-compatible, no postinstall)
- [Phase ?]: experience-builder-core frozen contracts: markup-free IR (Zod), 13-member object model, output-profile table, 4 contracts, IR<->AST mapper, JSON-patch
- [Phase ?]: Isolation via eslint Lab<->Builder boundary (both directions) + Lab-subtree-scoped single-ai gate in ci:gates
- [Phase ?]: [Phase 1 P02] Registry adapter derives props/variants/slots from @oneui/shared/meta/generated/* (node-safe) instead of the React-laden componentRegistry barrel; ids/flags from jioAlphaCatalog. Single source of truth preserved.
- [Phase ?]: [Phase 1 P03] AST validator is structural (alias-resolved imports + exact registry lookup), never substring (Pitfall 4); input is a parsed ArtifactAst not code text; literal/token check is a warning-only hook deferred to P3 VAL-04
- [Phase ?]: [Phase 1 P04] Mastra installed at exact pins (@mastra/core@1.37.1 + @mastra/ai-sdk@1.4.3); single-ai gate passes
- [Phase ?]: [Phase 1 P04] Orchestration owned by Mastra createWorkflow; AI SDK touched only by modelAdapter.ts pinning version:'v6' (ORCH-04)
- [Phase ?]: [Phase 1 P04] irToArtifactAst bridge normalizes frozen mapper Stack->Container so mock IR passes the validator (GEN-08) without editing frozen -core
- [Phase ?]: [Phase 1 P04] Convex experience* tables append-only; IR persisted as structured JSON (v.any), never markup (D-08/VER-03)
- [Phase ?]: [Phase 1 P05] Isolated (experience-lab) route at /lab (dedicated segment — group-root page.tsx would collide with / home); passthrough layout never touches (builder)/FoundationStyleProvider (eslint boundary + grep clean)
- [Phase ?]: [Phase 1 P05] Node run route streams the batch Mastra workflow's ordered ExperienceBuilderEvent stream as NDJSON frames (event lines + terminal result/IR frame); v6 transport decision stays in the agents package (ORCH-03/ORCH-04)
- [Phase ?]: [Phase 1 P05] Gap events flip a typed foundation/component gap card and short-circuit BEFORE any artifact card is created (FND-03/REG-03), asserted by jsdom tests; LAB-02 enforced by extending check-literals scan root to the Lab route
- [Phase ?]: FND-04: reuse precompute.ts chain (buildAvailableScales -> buildThemeConfig) verbatim; never import FoundationStyleProvider
- [Phase ?]: Resolver input extended as Lab-owned superset (ResolveFoundationInput); frozen core contract unchanged
- [Phase ?]: callModel reads result.experimental_output (ai@6.0.111); single ai/@ai-sdk seam; in-gen retry lives in irGenerator (ORCH-04)
- [Phase 2 P2]: REG-04 freshness gate independently re-derives registry from JIO_WEB_ALPHA_COMPONENTS x *_GENERATED_PROPS so a queryRegistry bug cannot mask drift; toEqual deep-equality hard-fail on ids + per-item props/variants/slots; KNOWN_DRIFT_EXCLUSIONS imported (single source of truth)
- [Phase ?]: Assembler-last pipeline wired (D-01): plan/design/copy advise, generate-ir is the only IR-committing step
- [Phase ?]: D-05 Response Caching is Lab-owned djb2 memoization, NOT MastraServerCache (Pitfall B); Run Tracing = the ExperienceBuilderEvent stream (observability deferred to P5); Background Tasks via createBackgroundTask (durable worker dispatch deferred to P5)
- [Phase ?]: [Phase 2 P4] GEN-06 compiled bundle persists additively on experienceArtifactVersions.compiledBundle ({ code, meta? }, v.optional, append-only, no migration — D-07); live Convex schema pushed before verification (T-02-14)
- [Phase ?]: [Phase 2 P4] pnpm ci:gates enforces REG-04 freshness + GEN-06 acceptance via check:experience-gates (hard-fail proven); single-ai + smoke:builder gates intact
- [Phase ?]: [Phase 02.1 P01] A1 resolved — FoundationsLoader targets public getBrandOverviewData (public client cannot call internalQuery); only place D-06 …Internal naming bends
- [Phase ?]: [Phase 02.1 P01] resolveStep populates ctx.request.brandFoundations from injected loader; null result falls back to engine system defaults (D-08), never a gap; agents package stays backend-free
- [Phase ?]: [Phase 02.1 P02] Convex-backed makeConvexFoundationsLoader injected into runExperienceWorkflow; maps overview.color?.config verbatim (Pitfall 1), merges optional sub-brand via applySubBrandAccentsToFoundation before the map (D-03), targets public getBrandOverviewData (A1).
- [Phase ?]: [Phase 02.1 P02] subBrandConfigId flows end-to-end: dependent sub-brand Select (skip-gated until brand chosen, D-02) -> PromptCardShape optional prop -> POST body -> RunRequestBody.strict() -> loader. FND-01 + route-level FND-04 closed.
- [Phase ?]: [Phase 03 P07] LabAstExecutor reuses /internal/render-ast for the live canvas iframe; RenderInput.ast additive/optional; finalizeRun promotes error->artifact only when previewState.url present.
- [Phase ?]: [Phase 04.1 P01] D-06 locked default held: zero-dependency @mastra/core/storage InMemoryStore memory domain round-trips threads/messages with no Agent binding (A2 validated); Convex experienceChat fallback NOT taken
- [Phase ?]: [Phase 04.1 P01] @mastra/core/storage FilesystemStore implements only the 7 editor domains (not memory) -> store uses InMemoryStore = single-process durability; cross-instance durability deferred to Convex/@mastra/libsql
- [Phase ?]: [Phase 04.1 P01] Conversation route owns the store at the route layer (runtime=nodejs, .strict() Zod) so experience-builder-agents stays storage-free (Pitfall 2); package-legitimacy checkpoint skipped (no new install)
- [Phase ?]: [Phase 04.1 P02] ComposerControlStrip is controlled (onChange lift, no tldraw write); 02.1 sub-brand 'skip'-gate preserved verbatim; type-change emits type+snapped profile in one onChange; UI-SPEC named token aliases mapped to real f-step numeric tokens
- [Phase ?]: [Phase 04.1 P03] Chat-first shell (D-13): ExperienceLabShell threads canvasCallbacks { placeArtifact, flipToGapState } canvas → chat → useLabConversation; the chat hook is the single caller on terminal run frames (D-12)
- [Phase ?]: [Phase 04.1 P03] useLabConversation reuses readNdjson + RunStreamFrame verbatim and POSTs the UNCHANGED RunRequestBody (no new fields/schema); ChatSurface stays headless of transport (no ai/useChat, CHAT-11)
- [Phase ?]: [Phase 04.1 P03] RunTurn branches on result.campaignPlan BEFORE treating a gap as failure (suspend, not refusal); useExperienceLabRun adapted prompt-card-free with viewport-anchored placement, exposing canvasCallbacks
- [Phase ?]: [Phase 04.1 P04] CampaignPlanCard (D-08) posts the EXACT ResumeRequestBody to the UNCHANGED /resume route (clamping stays route-side, T-04.1-10) and hands the resume NDJSON Response to onResolved → existing readNdjson consumer → canvas (D-12); no new Zod schema (Anthropic-safe)
- [Phase ?]: [Phase 04.1 P04] D-09 framework proven with its second consumer — renderLabMessagePart dispatches data-campaign-plan → CampaignPlanCard with the null fall-through intact (CHAT-07), no run-turn refactor
- [Phase ?]: [Phase 04.1 P05] D-02/CHAT-08: useChatCanvasFocus owns turn↔shape linkage in the chat layer; reactive registerAfterChangeHandler with cleanup, no polling; focused artifact seeds the iterate target without changing the .strict() RunRequestBody (T-04.1-13)
- [Phase 04.2 P01]: Wave 0 RED scaffolds pin LAYOUT-01..05, QUAL-01/02/03/04, AGENT-02/03 across 6 test files; no production source touched. Nyquist baseline for Waves 2-5.
- [Phase 04.2 P01]: Lab-route tests (runTurn/canvas) run from apps/platform (app-scoped @oneui/ui-internal alias); AGENT-03 pinned via to-be-added pure HowThisWasBuilt helper to avoid tldraw useEditor mount.
- [Phase ?]: 04.2-02: IR layout primitive is additive-optional on JioIRSection; version stays 1, old flat IRs round-trip with no migration.
- [Phase ?]: 04.2-02: layout primitives compile to real Jio Container/Grid (never invented Stack/Row/Spacer); validator structural-allows Container/Grid while keeping literal hook + exact registry membership for instance children.
- [Phase ?]: 04.2-03: IR Generator emits explicit stack layout primitives per section so irToAst compiles a real Jio Container directly; LAYOUT_TYPE_REMAP retired
- [Phase ?]: 04.2-03: backfillRequiredProps returns {instanceId,propName,isContent} provenance persisted to run metadata for the Plan 04 quality gate (D-08)
- [Phase ?]: 04.2-04: quality is a two-tier GATE — deterministic structural checks (flat-layout/placeholder-content/empty-section-copy) PRIMARY, multimodal vision score SECONDARY at a tunable 3.2 floor (Open Question 2)
- [Phase ?]: 04.2-04: validateIrAndAst fuses IR pre-check + AST validation; persistent failure after N=3 emits a terminal quality GAP (ctx.qualityGap), never a frozen weak artifact (QUAL-06/D-11)
- [Phase ?]: 04.2-04: allowlist-gate vs quality-gate split — compiler internal validateAst skips placeholder-content; workflow quality gate enforces it with Plan-03 provenance (skipPlaceholderContent)
- [Phase ?]: 04.2-05: agentTrace persists additively (v.optional) on experienceArtifactVersions — append-only, no migration, structured agent outputs only (no secrets, T-04.2-11)
- [Phase ?]: 04.2-05: finalizeRun assembleAgentTrace builds the trace from ctx.plan/designSpec/copySpec/ir/validation/evaluation/backfilled; route threads it to persistArtifact + the result frame (AGENT-01 link)
- [Phase ?]: 04.2-05: RunTurn STEP_LABELS enriches the 04.1 ticker with named agent activity lines (AGENT-02); ArtifactCardShape HowThisWasBuilt is a pure jsdom-renderable disclosure with toPlainText markup-strip (AGENT-03/T-04.2-12)
- [Phase ?]: AGENT-04 canvas per-agent cursors: substrate locked as postmessage-rects (data-ir-node-id + rect-only iframe->canvas postMessage; overlay drawn outside the iframe). CSP/separate-origin isolation unchanged.
- [Phase 5 kickoff]: Do not reset the Lab to a generic Agent Starter Kit. Keep the existing OneUI monorepo, Convex foundations, IR-first pipeline, `experience-builder-*` package isolation, Storybook MCP/registry retrieval, tldraw canvas, Mastra orchestration, and Daytona `PreviewExecutor` seam.
- [Phase 5 kickoff]: Node 22 is required for reliable Lab gates; local Node 18 causes Vitest/Rolldown failures (`node:util.styleText` missing).
- [Phase 5 kickoff]: Storybook MCP upgraded to `@storybook/addon-mcp@0.6.0`; Daytona SDK upgraded to `@daytonaio/sdk@0.184.0`. Mastra/AI SDK remain pinned pending compatibility spike.
- [Phase 5 kickoff]: Production JSON contracts added for durable run records, design-context resolution, handoff bundles, sandbox operational checks, and compliance scorers.
- [Phase 5 kickoff]: tldraw v5 local persistence key and sync-schema metadata added for Lab custom shapes plus future presence/review/provenance records.
- [Phase 5 P01]: Experience Lab runs now pre-create one Convex `experienceRuns` row for real brands before Mastra executes, update that same row to `suspended`/`artifact`/`gap`/`error`, preserve prompt/sub-brand/parent/canvas/thread request metadata, and expose `/api/experience-lab/status?runId=...` as the status read side.
- [Phase 5 P02]: Added `pnpm check:mastra-compat` to verify the Mastra/AI SDK API surface the Lab depends on (`createWorkflow`, `createStep`, `createTool`, background task APIs, `toAISdkStream`, AI SDK `generateText`/`Output.object`, Anthropic provider, Zod v4). Lockfile now resolves AI SDK/Anthropic/Zod to latest compatible versions (`ai@6.0.197`, `@ai-sdk/anthropic@3.0.81`, `zod@4.4.3`) while keeping Mastra pinned at `@mastra/core@1.37.1` / `@mastra/ai-sdk@1.4.3` pending a dedicated Mastra major/minor bump branch.

### Pending Todos

- Full `pnpm check:experience-gates` and the platform Experience Lab test slice pass under Node 22; keep using `/opt/homebrew/opt/node@22/bin` until the shell default is upgraded.
- Complete the actual Mastra package bump (`@mastra/core@1.41.0`, `@mastra/ai-sdk@1.4.4`) in a dedicated branch after the compatibility gate is extended to cover durable worker dispatch/replay APIs.
- Add server-side tldraw sync room and register the Lab custom shape/schema contract there.
- Move route-local workflow execution to a true durable background worker/dispatcher once the production deployment target is chosen; the Convex run row + status route are now the durable read/write contract.

### Blockers/Concerns

Front-loaded HIGH-severity risks to resolve in Phase 1 (per research/PITFALLS.md):

- Mastra ↔ AI-SDK-v6 compatibility — empirical install spike required (STACK vs PITFALLS disagree on maturity).
- Non-web foundation coverage unknown — P1 audit gates the P4 campaign path.
- Separate-origin preview feasibility in this infra — decide in P1, build in P3.
- Component-metadata single source of truth — base repo already shows registry/metadata drift (CONCERNS.md).

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-06-03T21:37:40.542Z
Stopped at: Completed 04.2-02-PLAN.md
Resume file: None
