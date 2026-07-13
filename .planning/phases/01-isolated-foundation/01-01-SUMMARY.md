---
phase: 01-isolated-foundation
plan: 01
subsystem: api
tags: [zod, ir, ast, json-patch, mastra, ai-sdk, eslint, isolation, vitest, contracts]

requires:
  - phase: 01-isolated-foundation (planning)
    provides: PROJECT/ROADMAP/REQUIREMENTS, CONTEXT/RESEARCH/PATTERNS/VALIDATION for phase 1
provides:
  - "@oneui/experience-builder-core package — frozen, importable contracts for plans 02–05"
  - "Markup-free JioExperienceIR Zod schema (IR-01/IR-02/IR-04)"
  - "8 artifact types + full 13-member canvas card-kind union (D-05)"
  - "artifact-type → output-profile table with real web + assumed non-web coverage (D-03)"
  - "FoundationResolveResult discriminated union with first-class typed gap variant (FND-03)"
  - "JioComponentRegistryItem contract derived from JioAlphaComponentCatalogEntry (REG-01)"
  - "JioValidationResult contract (VAL-01)"
  - "ExperienceBuilderEvent discriminated union (ORCH-03)"
  - "irToAst mapper emitting only ComponentASTNode/TextASTNode — no element nodes (IR-03, Pitfall 2)"
  - "Self-contained IR JSON-patch diffIr/applyPatch (IR-03)"
  - "eslint Lab↔Builder isolation boundary (both directions) + scoped single-ai-version CI gate (LAB-03)"
  - "Verified pinned Mastra pair recorded for plan 04 install"
affects: [02-real-integration, 03-preview-eval-repair, 04-campaign-social, 05-production-readiness, experience-builder-agents, experience-builder-registry, experience-builder-validation, experience-lab-route]

tech-stack:
  added: [zod (experience-builder-core dep), per-package vitest node-env config]
  patterns:
    - "Pure-function, framework-agnostic -core module (import type only, JSON-compatible, runs in Node/browser/worker)"
    - "Markup-free contract by construction: no element/tag/rawHtml/html/dangerouslySetInnerHTML field; string leaves refined to reject markup"
    - "Registry-safe IR→AST: enforcement is the ABSENCE of an element case, not a runtime denylist"
    - "First-class typed gap variant (ok:false) instead of fabricated defaults (Pitfall 6)"
    - "Isolation enforced structurally via eslint no-restricted-imports, scoped per file-group (both directions)"
    - "Single-ai-version gate scoped to the Lab subtree, NOT repo-wide (repo legitimately has multiple ai@6)"

key-files:
  created:
    - packages/experience-builder-core/package.json
    - packages/experience-builder-core/tsconfig.json
    - packages/experience-builder-core/vitest.config.ts
    - packages/experience-builder-core/src/index.ts
    - packages/experience-builder-core/src/ir/artifactTypes.ts
    - packages/experience-builder-core/src/ir/schema.ts
    - packages/experience-builder-core/src/ir/irToAst.ts
    - packages/experience-builder-core/src/ir/patch.ts
    - packages/experience-builder-core/src/profiles/outputProfileTable.ts
    - packages/experience-builder-core/src/contracts/foundationResolve.ts
    - packages/experience-builder-core/src/contracts/registryItem.ts
    - packages/experience-builder-core/src/contracts/validation.ts
    - packages/experience-builder-core/src/contracts/events.ts
    - scripts/check-single-ai-version.ts
  modified:
    - eslint.config.mjs
    - package.json

key-decisions:
  - "Mastra pinned pair verified & approved: @mastra/core@1.37.1 + @mastra/ai-sdk@1.4.3 (peer-compatible). Recorded for plan 04 to install verbatim."
  - "Dropped tsconfig rootDir (noEmit:true) so type-only @oneui/shared imports don't trip TS6059 rootDir constraint"
  - "passWithNoTests in vitest config so the Wave-0 empty scaffold passes the 'zero tests OK, exit 0' gate"
  - "@oneui/shared placed in devDependencies (import type only — erased at build, no runtime dep)"

patterns-established:
  - "Markup-free IR: slot/prop/content string leaves all routed through MarkupFreeString refinement"
  - "Strict Zod objects (.strict()) close the unknown-key smuggling channel"
  - "Isolation eslint rule split into Direction A (Builder→Lab) and Direction B (Lab→Builder) file-scoped configs"

requirements-completed: [IR-01, IR-02, IR-03, IR-04, INPUT-02, INPUT-03, CANVAS-03, FND-01, FND-03, REG-01, ORCH-03, ORCH-04, VAL-01, LAB-03]

duration: ~2h (wall clock incl. planning handoff); active execution ~25 min
completed: 2026-05-30
---

# Phase 1 Plan 01: Isolated Foundation Contracts Summary

**`@oneui/experience-builder-core` — a pure-TS contracts package delivering the markup-free Jio Experience IR (Zod), the 13-member artifact/card object model, the output-profile table, four contract types (foundation-resolve with a first-class gap variant, registry item, validation result, event union), a registry-safe IR→AST mapper, and self-contained IR JSON-patch — plus eslint Lab↔Builder isolation and a scoped single-`ai`-version CI gate.**

## Mastra Package Pin (for Plan 04 — RECORD VERBATIM)

> Task 1 was a `blocking-human` supply-chain checkpoint, **pre-cleared by the orchestrator with the human**. Nothing was installed in this plan (the agents package does not exist until plan 04).

**Approved, verified, peer-compatible pinned pair — plan 04 MUST install exactly this:**

- **`@mastra/core@1.37.1`**
- **`@mastra/ai-sdk@1.4.3`**

**Evidence confirmed by orchestrator + human:**
- Both packages are from the official `github.com/mastra-ai/mastra` monorepo.
- Neither package has a `postinstall` script (no out-of-tree network/filesystem execution).
- Maintainer sets are identical across the two packages.
- `@mastra/ai-sdk@1.4.3` peer-requires `@mastra/core >=1.5.0-0 <2.0.0-0` → satisfied by `1.37.1`; and `zod ^3.25.0 || ^4.0.0` → satisfied by the repo's `zod@^4`.
- Resolves RESEARCH Open Question #1 (exact `@mastra/core` + `@mastra/ai-sdk` pair with matching peer range).

## Performance

- **Duration:** active execution ~25 min
- **Completed:** 2026-05-30T21:11:04Z
- **Tasks:** 3 executed (Task 2, 3, 4); Task 1 pre-cleared by orchestrator
- **Files created:** 17 (14 package source/config + script) ; **modified:** 2 (eslint.config.mjs, package.json)
- **Tests:** 57 passing (6 files)

## Accomplishments

- Stood up `@oneui/experience-builder-core` linked into the pnpm workspace (zod dep, node-env vitest, type-only `@oneui/shared`).
- Markup-free `JioExperienceIR` Zod schema: slot/prop/content string leaves all refined to reject `<tag`, `className=`, `class=`, `style=`, `dangerouslySetInnerHTML`; `.strict()` objects reject unknown markup-bearing keys. Adversarial "give me HTML" red-team fixture is rejected.
- Full 13-member object model: 8 artifact types + foundation-profile/component-reference/evaluation-report/variant-group/export (D-05).
- Output-profile table (D-03): web profiles carry real dimensions; non-web profiles structurally present and flagged `coverage: 'assumed'` (no fabricated numbers).
- Four contract types: `FoundationResolveResult` (typed gap variant, no dimension numbers — FND-03), `JioComponentRegistryItem` (REG-01), `JioValidationResult` (VAL-01), `ExperienceBuilderEvent` union (ORCH-03).
- `irToAst` mapper emits only `component`/`text` AST nodes — there is no `element` case (IR-03, Pitfall 2 enforcement by absence).
- Self-contained JSON-patch `diffIr`/`applyPatch` with round-trip + non-mutation tests (IR-03).
- Isolation wired into CI: eslint `no-restricted-imports` Lab↔Builder boundary (both directions, verified firing) + `scripts/check-single-ai-version.ts` scoped to the Lab subtree, appended to `ci:gates`.

## Task Commits

1. **Task 2: Scaffold package + isolation CI guards** — `b4f1874a` (feat)
2. **Task 3: IR schema, artifact/card union, output-profile table + Wave 0 tests** — `d4f741e9` (feat, TDD)
3. **Task 4: Contract types, IR↔AST mapper, JSON-patch + Wave 0 tests** — `cb005994` (feat, TDD)

_Task 1 was a pre-cleared `blocking-human` checkpoint; no commit._

## Files Created/Modified

- `packages/experience-builder-core/package.json` — package manifest (zod, vitest, type-only @oneui/shared)
- `packages/experience-builder-core/tsconfig.json` — extends repo base, noEmit (no rootDir)
- `packages/experience-builder-core/vitest.config.ts` — node env, passWithNoTests
- `packages/experience-builder-core/src/index.ts` — barrel re-exporting all contracts/mappers
- `packages/experience-builder-core/src/ir/artifactTypes.ts` — 8 artifact types + 13-member union
- `packages/experience-builder-core/src/ir/schema.ts` — markup-free JioExperienceIR
- `packages/experience-builder-core/src/ir/irToAst.ts` — registry-safe IR→AST mapper (no element case)
- `packages/experience-builder-core/src/ir/patch.ts` — JSON-patch diffIr/applyPatch
- `packages/experience-builder-core/src/profiles/outputProfileTable.ts` — type→profile table (D-03)
- `packages/experience-builder-core/src/contracts/foundationResolve.ts` — resolve result + gap variant (FND-03)
- `packages/experience-builder-core/src/contracts/registryItem.ts` — JioComponentRegistryItem (REG-01)
- `packages/experience-builder-core/src/contracts/validation.ts` — JioValidationResult (VAL-01)
- `packages/experience-builder-core/src/contracts/events.ts` — ExperienceBuilderEvent union (ORCH-03)
- `scripts/check-single-ai-version.ts` — Lab-subtree-scoped single-ai gate
- `eslint.config.mjs` — added Lab↔Builder isolation no-restricted-imports (both directions)
- `package.json` — added `check:single-ai` script + appended to `ci:gates`
- Test files: `artifactTypes.test.ts`, `schema.test.ts`, `outputProfileTable.test.ts`, `irToAst.test.ts`, `patch.test.ts`, `contracts/contracts.test.ts`, fixture `__fixtures__/validIr.ts`

## Decisions Made

- Verified/approved Mastra pin `@mastra/core@1.37.1` + `@mastra/ai-sdk@1.4.3` (see top section).
- `@oneui/shared` as a dev (type-only) dependency — the package has no runtime dependency on shared.
- Dropped `rootDir` from tsconfig (safe under `noEmit: true`) so type-only cross-package imports do not trip TS6059.
- `passWithNoTests` in vitest config to satisfy the Wave-0 scaffold "exit 0 with zero tests" gate.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vitest 4 exits non-zero on empty suite**
- **Found during:** Task 2 (scaffold verify)
- **Issue:** `vitest run` exits 1 with "No test files found", failing the "zero tests OK, exit 0" acceptance gate before any test exists.
- **Fix:** Added `passWithNoTests: true` to `vitest.config.ts`.
- **Verification:** `pnpm --filter @oneui/experience-builder-core test` exits 0.
- **Committed in:** `b4f1874a` (Task 2 commit)

**2. [Rule 1 - Bug] Markup smuggling possible via component prop string values**
- **Found during:** Task 3 (RED test for `dangerouslySetInnerHTML` in a prop string)
- **Issue:** `IRPropValue` used a plain `z.string()`, so a prop like `label: "...dangerouslySetInnerHTML..."` or `<div>` bypassed the IR-02 markup-free invariant (only slots/content were guarded).
- **Fix:** Routed `IRPropValue` string leaves through `MarkupFreeString`, closing the prop channel.
- **Verification:** Adversarial prop test now passes; all 35 Task-3 tests green.
- **Committed in:** `d4f741e9` (Task 3 commit)

**3. [Rule 3 - Blocking] tsconfig rootDir rejects type-only @oneui/shared imports**
- **Found during:** Task 4 (typecheck)
- **Issue:** `rootDir: ./src` caused TS6059 because type-importing `@oneui/shared` pulls sibling source files outside the package's rootDir.
- **Fix:** Removed `rootDir` (no effect under `noEmit: true`).
- **Verification:** Package's own sources typecheck clean.
- **Committed in:** `cb005994` (Task 4 commit)

**4. [Rule 1 - Bug] irToAst section props typed `surfaceMode?: undefined`**
- **Found during:** Task 4 (typecheck)
- **Issue:** A ternary producing `{ surfaceMode } | {}` widened to an optional-undefined prop incompatible with `Record<string, ASTSerializableValue>`.
- **Fix:** Built the props object imperatively, assigning `surfaceMode` only when present.
- **Verification:** Package typecheck clean; irToAst tests green.
- **Committed in:** `cb005994` (Task 4 commit)

---

**Total deviations:** 4 auto-fixed (2 Rule 1 bugs, 2 Rule 3 blocking). All necessary for correctness/the markup-free invariant. No scope creep.

## Issues Encountered

- **Pre-existing `@oneui/shared` typecheck failure (OUT OF SCOPE):** `packages/shared/src/engine/buildNativeTheme.ts:233` (and `surfaceNew.test.ts`) reference `stateLayers` on `ResolvedTokenSet`, which fails `tsc`. Confirmed pre-existing (`pnpm --filter @oneui/shared typecheck` fails independently; the line is unchanged at git HEAD before this plan). The experience-builder-core package's OWN sources typecheck clean. Logged to `.planning/phases/01-isolated-foundation/deferred-items.md`. Not fixed (sibling package's responsibility).

## Known Stubs

- Output-profile table non-web entries carry `coverage: 'assumed'` with `dimensions: null` by design (P1 honesty rule / Pitfall 6): they are structurally present so P4 lights up renderers, and deliberately avoid fabricated dimensions. This is an intentional, documented placeholder resolved in P4 (campaign/social), not a defect.

## User Setup Required

None — no external service configuration required in this plan. (Mastra packages are verified but NOT installed until plan 04.)

## Next Phase Readiness

- Contracts package is frozen and importable — plans 02–05 consume `@oneui/experience-builder-core` as the canonical source of truth.
- Plan 04 must install `@mastra/core@1.37.1` + `@mastra/ai-sdk@1.4.3` verbatim; the single-`ai` gate will start doing real work once Mastra + `ai` land in `experience-builder-agents`.
- Isolation guards are live in `ci:gates`; both eslint directions verified firing.
- Pre-existing `@oneui/shared` typecheck failure should be addressed by the shared maintainers so the repo-wide `pnpm typecheck` gate is clean.

## Self-Check: PASSED

- All key files verified present (schema.ts, irToAst.ts, outputProfileTable.ts, events.ts, check-single-ai-version.ts).
- All task commits verified in git log: `b4f1874a`, `d4f741e9`, `cb005994`.

---
*Phase: 01-isolated-foundation*
*Completed: 2026-05-30*
