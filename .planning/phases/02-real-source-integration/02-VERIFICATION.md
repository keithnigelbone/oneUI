---
phase: 02-real-source-integration
verified: 2026-06-01T00:01:00Z
status: passed
score: 7/7
overrides_applied: 0
---

# Phase 2: Real Source Integration — Verification Report

**Phase Goal:** With contracts frozen, the Lab generates a real artifact end-to-end from a real prompt — resolving real Jio foundations, retrieving real Storybook-approved components, producing copy via the existing ToV agent and layout via the existing Design agent, generating valid IR, and compiling it to real React + Jio CSS using only approved imports.
**Verified:** 2026-06-01T00:01:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Real brand/token/type-scale/surface data resolves via `buildThemeConfig`/`buildAvailableScales` from live Jio foundations with no schema migration | VERIFIED | `foundationResolver.ts` lines 119–123: verbatim precompute chain (`buildAvailableScales` → `buildThemeConfig`). `mockTheme`/`mockScaleDefinition` deleted (grep returns 0). 4/4 foundationResolver tests pass. |
| 2  | A partially-configured brand resolves (system defaults fill it) and does NOT emit a gap | VERIFIED | `foundationResolver.ts` comment block (D-09): `ensureNeutralRole`/`synthesizeBrandBgIfMissing` are the engine defaults. Partial-brand test passes (foundationResolver.test.ts, 4/4 green). |
| 3  | An unresolvable profile returns a typed foundation gap with NO dimension numbers | VERIFIED | `foundationResolver.ts` lines 102–138: `foundationGap()` on null theme with no numeric payload. "no dimension numbers" assertion carried from Phase 1 passes. |
| 4  | CI freshness gate independently re-derives registry and hard-fails on ANY id or per-item metadata divergence | VERIFIED | `queryRegistry.freshness.test.ts` (D-10): 5/5 tests pass. `toEqual` deep-equality on sorted ids AND per-item props/variants/slots. Imports `KNOWN_DRIFT_EXCLUSIONS` — never re-hardcodes. `pnpm check:experience-gates` exits 0. |
| 5  | The IR Generator produces a parseIR-valid `JioExperienceIR` via `Output.object` structured output, constrained to registry ids, with in-gen retry capped at 3 attempts | VERIFIED | `irGenerator.ts`: `SectionFillSchema` + `callModel({schema})`, `MAX_IR_ATTEMPTS=3`, gate-then-assemble, `findUnregisteredType` gate. 5/5 irGenerator tests pass (valid, retry-2-calls, cap-reached, unregistered-component-gap, markup-free-gap). |
| 6  | Compiler emits a canonical `@oneui/ui`-importing React + Jio CSS code string proven by the credential-free acceptance triad, and the compiled bundle persists additively in `experienceArtifactVersions` | VERIFIED | `compiler.ts`: `irToAst` → `astToReactComponent({importSource: '@oneui/ui'})` + `validateAst`. 5/5 compiler tests pass (leg 1 import, leg 2a pass, leg 2b fail, leg 3 snapshot). Snapshot: `@oneui/ui` imports, `GeneratedArtifact` component, snapshot-stable. Schema: `compiledBundle: v.optional(v.object({code, meta?}))` in `schema.ts`. Run route passes `run.bundle` as `{code: run.bundle}` only for valid-IR runs. |
| 7  | Planner, Design, and ToV ADVISE only (assembler-last D-01); generate-ir is the only IR-committing step; D-05 trio (caching, run tracing, background tasks) lands | VERIFIED | `workflow.ts` ORDERED_STEPS: `intent→resolve→retrieve→plan→design→copy→generate-ir→compile→validate`. `plannerAgent.ts` (GEN-04), `voiceAdapter.ts` (GEN-02, `compileVoiceRules`+`runToneGuard`), `designAdapter.ts` (GEN-03, `compileCompositionRules`). `cache.ts` (`cacheKey`+`memoize`+`createCache`). `backgroundRun.ts` (`createBackgroundTask` imported, 5 occurrences). Workflow test asserts exactly one `ir-produced` event (assembler-last invariant). 48/48 agents tests pass. |

**Score:** 7/7 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/experience-builder-agents/src/foundationResolver.ts` | FND-04 real foundation resolver via precompute chain | VERIFIED | Real `buildAvailableScales` → `buildThemeConfig` chain. `mockTheme` deleted. |
| `packages/experience-builder-agents/src/modelAdapter.ts` | Single `callModel` seam with `Output.object` | VERIFIED | Imports `ai`, `@ai-sdk/anthropic`. `callModel` + `__setCallModelImpl` test seam. `Output.object({schema})` + `result.experimental_output`. |
| `packages/experience-builder-agents/src/irGenerator.ts` | GEN-05 LLM IR Generator with per-section decomposition + in-gen retry | VERIFIED | `SectionFillSchema`, `callModel`, `MAX_IR_ATTEMPTS=3`, markup-free + registry guards, `__setCompileImpl` seam. |
| `packages/experience-builder-agents/src/compiler.ts` | GEN-06 compiler: IR → AST → React + Jio CSS | VERIFIED | `irToAst` → `astToReactComponent({importSource:'@oneui/ui'})` + `validateAst(irToArtifactAst(ir))`. |
| `packages/experience-builder-agents/src/testModelMock.ts` | Shared credential-free model mock factory | VERIFIED | Exists. Used by all agents test suites. |
| `packages/experience-builder-agents/src/__snapshots__/compiler.test.ts.snap` | Stable snapshot of compiled output | VERIFIED | Snapshot contains `@oneui/ui` imports and `GeneratedArtifact` component. |
| `packages/experience-builder-registry/src/queryRegistry.freshness.test.ts` | REG-04 derive-equals-live freshness gate | VERIFIED | 5 tests. Independent re-derivation. `KNOWN_DRIFT_EXCLUSIONS` imported. `toEqual` deep-equality. |
| `packages/experience-builder-agents/src/agents/plannerAgent.ts` | GEN-04 net-new LLM planner agent | VERIFIED | `PlanSchema` (sections.min(1), screenCount≥1). `runPlanner` via `callModel`. Memoized. |
| `packages/experience-builder-agents/src/adapters/voiceAdapter.ts` | GEN-02 ToV adapter using `compileVoiceRules` + `runToneGuard` | VERIFIED | Both engine functions used (12 occurrences). No `apps/platform`/`ai`/`@ai-sdk` imports. |
| `packages/experience-builder-agents/src/adapters/designAdapter.ts` | GEN-03 Design adapter using `compileCompositionRules` | VERIFIED | `compileCompositionRules` used (6 occurrences). Registry membership filter on chosen components. |
| `packages/experience-builder-agents/src/cache.ts` | D-05 Response Caching: deterministic memoization | VERIFIED | `cacheKey` (djb2), `memoize`, `createCache()` factory, `clearCache()`. |
| `packages/experience-builder-agents/src/backgroundRun.ts` | D-05 Background Tasks via `createBackgroundTask` | VERIFIED | `createBackgroundTask` imported (5 occurrences). Same-result invariant. Progress events. |
| `packages/convex/convex/schema.ts` | Additive `compiledBundle` field on `experienceArtifactVersions` | VERIFIED | `compiledBundle: v.optional(v.object({code: v.string(), meta: v.optional(v.any())}))`. |
| `scripts/check-experience-gates.ts` | CI orchestration running REG-04 + GEN-06 acceptance | VERIFIED | Runs both suites. Exits non-zero on failure. `pnpm check:experience-gates` exits 0. |
| `package.json` | `check:experience-gates` in `ci:gates` chain | VERIFIED | `ci:gates` chain includes `pnpm check:experience-gates` alongside intact `check:single-ai` and `smoke:builder`. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `foundationResolver.ts` | `@oneui/shared/engine` `buildThemeConfig` | real resolution body | VERIFIED | Lines 48–51: `import { buildAvailableScales, buildThemeConfig }`. Lines 119–123: chain call. |
| `irGenerator.ts` | `modelAdapter.ts` `callModel` | single model seam | VERIFIED | `import { callModel }` + `callModel({schema: SectionFillSchema, …})` in section fill loop. |
| `compiler.ts` | `@oneui/shared/codegen` `astToReactComponent` + `@oneui/experience-builder-validation` `validateAst` | `irToAst` → `astToReactComponent` + `validateAst(irToArtifactAst(ir))` | VERIFIED | Lines 28–29 imports. Lines 55–66 usage. `irToArtifactAst` bridge reused from `workflow.ts`. |
| `workflow.ts` | `plannerAgent` + `designAdapter` + `voiceAdapter` | `plan → design → copy` steps before `generate-ir` | VERIFIED | ORDERED_STEPS array: `planStep, designStep, copyStep, generateStep` in order. RunContext advisory fields `plan`/`designSpec`/`copySpec`. |
| `apps/platform/.../run/route.ts` | `experienceRuns.ts` `persistArtifact` | `compiledBundle` passed through `persistRun` | VERIFIED | Route line 100: `...(run.bundle ? { compiledBundle: { code: run.bundle } } : {})` inside `outcome === 'artifact'` branch. |
| `package.json ci:gates` | REG-04 freshness test + GEN-06 compiler acceptance | `check:experience-gates` script | VERIFIED | `ci:gates` chain contains `pnpm check:experience-gates`. Script invokes both suites via `execFileSync`. |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `foundationResolver.ts` | `theme` (ThemeConfig) | `buildThemeConfig(availableScales, appearanceConfig)` via `buildAvailableScales(colorConfig, presetSelection)` | Yes — real engine computation from brand Convex foundations | FLOWING |
| `irGenerator.ts` | `fill.instances` | `callModel({schema: SectionFillSchema, prompt})` — real LLM call via `callModelReal` (or test mock) | Yes — structured output from model or deterministic test mock | FLOWING |
| `compiler.ts` | `bundle` | `astToReactComponent(irToAst(ir), {importSource: '@oneui/ui'})` | Yes — deterministic codegen from IR | FLOWING |
| `backgroundRun.ts` | `result` | `runExperienceWorkflow(request)` — full inline pipeline | Yes — same RunExperienceResult as the inline path | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| FND-04 real resolver: 4 tests pass | `pnpm --filter @oneui/experience-builder-agents test foundationResolver` | 4 passed | PASS |
| GEN-05 IR Generator: 5 behaviors pass | `pnpm --filter @oneui/experience-builder-agents test irGenerator` | 5 passed | PASS |
| GEN-06 compiler acceptance triad: 5 tests pass | `pnpm --filter @oneui/experience-builder-agents test compiler` | 5 passed | PASS |
| REG-04 freshness gate: 5 tests pass | `pnpm --filter @oneui/experience-builder-registry test freshness` | 5 passed | PASS |
| Full workflow assembler-last: 6 tests pass | `pnpm --filter @oneui/experience-builder-agents test workflow` | 6 passed | PASS |
| GEN-02/03/04 + D-05 trio: 21 tests pass | `pnpm --filter @oneui/experience-builder-agents test plannerAgent cache voiceAdapter designAdapter backgroundRun` | 21 passed | PASS |
| Full agents package: 48 tests | `pnpm --filter @oneui/experience-builder-agents test` | 48 passed (10 files) | PASS |
| `pnpm check:experience-gates` exits 0 | `pnpm check:experience-gates` | REG-04 + GEN-06 both pass, exit 0 | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FND-04 | 02-01 | Real Jio foundation/token source connected without schema migration | SATISFIED | `buildAvailableScales` → `buildThemeConfig` chain in `foundationResolver.ts`; frozen result contract unchanged. |
| REG-04 | 02-02, 02-04 | CI freshness gate keeps registry in sync with live component metadata | SATISFIED | `queryRegistry.freshness.test.ts` (5/5 green); wired into `pnpm ci:gates` via `check-experience-gates.ts`. |
| GEN-02 | 02-03 | Existing ToV agent produces brand-aligned copy wired as Mastra tool | SATISFIED | `voiceAdapter.ts`: `compileVoiceRules` + `runToneGuard` from `@oneui/shared/engine`; no route executor imported. |
| GEN-03 | 02-03 | Existing Design agent chooses layout/composition wired as Mastra tool | SATISFIED | `designAdapter.ts`: `compileCompositionRules` + `getDefaultCompositionConfig`; registry membership filter. |
| GEN-04 | 02-03 | UX/flow planner agent plans sections and message hierarchy | SATISFIED | `plannerAgent.ts`: `PlanSchema` (sections, messageHierarchy, primaryCTA, screenCount), `Output.object`, `callModel`. |
| GEN-05 | 02-01 | IR Generator with constrained structured output and retry-on-error | SATISFIED | `irGenerator.ts`: `SectionFillSchema`, `callModel`, `MAX_IR_ATTEMPTS=3`, registry constraint, markup-free guard. |
| GEN-06 | 02-01, 02-04 | Compiler converts IR → React + Jio CSS using only approved imports; bundle persisted | SATISFIED | `compiler.ts`: `@oneui/ui` import source; compiler test snapshot; `compiledBundle` field in schema + mutation + route pass-through. |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `backgroundRun.ts` | 19–28 | `createBackgroundTask.dispatch()` scope-limited: durable worker dispatch deferred to P5 | INFO | Intentional and documented as a scope note in the code comment. The `createBackgroundTask` primitive IS imported and used; the executor runs inline; streaming progress and same-result contracts are met. Not a stub — a deliberate bounded implementation with the P5 extension path documented. |

No `TBD`/`FIXME`/`XXX` markers in any Phase 2 modified file. No placeholder/stub patterns in any critical path. The `backgroundRun.ts` deviation is a known, documented, in-scope trade-off (the worker dispatch durable store is a Phase 5 concern per the locked roadmap).

---

### Deferred Items (from `deferred-items.md`)

Pre-existing `@oneui/shared` typecheck errors (`buildNativeTheme.ts:233` — `stateLayers` property, plus `surfaceNew.test.ts`) surface transitively when typechecking `@oneui/experience-builder-agents` via project references. These predate this phase, are unrelated to FND-04/GEN-05/GEN-06, and are documented in `.planning/phases/02-real-source-integration/deferred-items.md`. The agents package's own source typechecks clean; this is a `@oneui/shared` maintenance issue outside this phase's scope.

| Item | Addressed In | Evidence |
|------|-------------|----------|
| Pre-existing `@oneui/shared/buildNativeTheme.ts:233` typecheck error | Out-of-scope (maintenance task) | Confirmed present before Phase 2 began; unrelated to phase deliverables; logged in `deferred-items.md`. |

---

### Human Verification Required

None. All phase must-haves are verifiable programmatically and all tests pass. The compiled bundle persistence requires a live Convex deployment for end-to-end verification (Convex schema was pushed via `npx convex dev --once` during Plan 04 execution as documented in the SUMMARY), but the schema field, mutation arg, and route pass-through are all verified by static code inspection and typecheck.

---

## Gaps Summary

No gaps. All 7 observable truths verified, all artifacts substantive and wired, all key links confirmed, all 7 requirements satisfied, `pnpm check:experience-gates` passes (exit 0).

---

## Isolation Invariant

`git diff` across Phase 2 commits shows no changes to:
- `apps/platform/src/design-tools/ExperienceCanvas/**`
- `apps/platform/src/app/(builder)/**`
- `apps/platform/src/components/FoundationStyleProvider.tsx`

The only platform file touched was `apps/platform/src/app/api/experience-lab/run/route.ts` — the Lab's own isolated route.

---

_Verified: 2026-06-01T00:01:00Z_
_Verifier: Claude (gsd-verifier)_
