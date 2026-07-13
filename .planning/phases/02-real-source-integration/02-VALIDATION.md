---
phase: 02
slug: real-source-integration
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-31
validated: 2026-06-01
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (node env for `experience-builder-*`; jsdom for `@oneui/ui`) |
| **Config file** | per-package `vitest.config.ts` (see `.planning/codebase/TESTING.md`) |
| **Quick run command** | `pnpm --filter <package> test` |
| **Full suite command** | `pnpm test && pnpm typecheck` |
| **Phase gate** | `pnpm ci:gates` (now incl. `check:experience-gates` = REG-04 + GEN-06 acceptance) |

---

## Sampling Rate

- **After every task commit:** `pnpm --filter @oneui/experience-builder-agents test` (+ `... -registry test` for Plan 02)
- **After every plan wave:** `pnpm test && pnpm typecheck`
- **Before `/gsd-verify-work`:** `pnpm ci:gates` green
- **Max feedback latency:** ~60s per package quick-run

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| P01-T1 | 02-01 | 1 | FND-04 | T-02-03/04 | Real foundations resolve; D-09 partial-brand defaults; gap has no dimensions; key confined to seam | unit (node) | `pnpm --filter @oneui/experience-builder-agents test foundationResolver` | ✅ 4 tests | ✅ green |
| P01-T2 | 02-01 | 1 | GEN-05 | T-02-01/02 | Output.object IR; in-gen retry+cap; registry-constrained ids; markup rejected | unit (node, mocked model) | `pnpm --filter @oneui/experience-builder-agents test irGenerator` | ✅ 5 tests | ✅ green |
| P01-T3 | 02-01 | 1 | GEN-06 | — | tsc + validateAst + snapshot triad; @oneui/ui imports only | unit + tsc + snapshot (node) | `pnpm --filter @oneui/experience-builder-agents test compiler && pnpm --filter @oneui/experience-builder-agents typecheck` | ✅ 5 tests + snap | ✅ green |
| P02-T1 | 02-02 | 1 | REG-04 | T-02-06 | Derive-equals-live deep-equality; hard-fail on any divergence (D-10) | unit (node) | `pnpm --filter @oneui/experience-builder-registry test freshness` | ✅ 5 tests | ✅ green |
| P03-T1 | 02-03 | 2 | GEN-04 | T-02-11 | Schema-valid plan via Output.object; deterministic cache one-call memoization | unit (node, mocked model) | `pnpm --filter @oneui/experience-builder-agents test plannerAgent cache` | ✅ 5+7 tests | ✅ green |
| P03-T2 | 02-03 | 2 | GEN-02, GEN-03 | T-02-08/09/10 | Node-safe engine reuse (no executor/@lib/ai import); markup-free copy; registry-constrained design | unit (node, mocked model) | `pnpm --filter @oneui/experience-builder-agents test voiceAdapter designAdapter` | ✅ 3+3 tests | ✅ green |
| P03-T3 | 02-03 | 2 | GEN-02, GEN-03, GEN-04 | T-02-11 | Assembler-last: plan/design/copy advise, only generate-ir commits IR; per-step event stream = D-05 Run-Tracing surface | unit (node) | `pnpm --filter @oneui/experience-builder-agents test workflow` | ✅ 6 tests | ✅ green |
| P03-T4 | 02-03 | 2 | GEN-04 (D-05) | T-02-12 | D-05 Background Tasks: createBackgroundTask emits >=1 progress ExperienceBuilderEvent and resolves to the same result as the inline path | unit (node, mocked model) | `pnpm --filter @oneui/experience-builder-agents test backgroundRun` | ✅ 3 tests | ✅ green |
| P04-T1 | 02-04 | 3 | GEN-06 | T-02-13/14/16 | Additive compiledBundle; live schema push before verify; no forbidden-file edit | unit + convex push + tsc | `(cd packages/convex && npx convex dev --once); pnpm --filter @oneui/convex typecheck` | ✅ field + persist | ✅ green (schema push manual — see below) |
| P04-T2 | 02-04 | 3 | REG-04, GEN-06 | T-02-15 | ci:gates enforces REG-04 + GEN-06 acceptance; single-ai intact | gate script | `pnpm check:experience-gates` | ✅ wired | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

> Per-REQ Validation Architecture detail in `02-RESEARCH.md` § Validation Architecture — esp. the credential-free GEN-06 acceptance triad (tsc + `validateAst` + codegen snapshot, D-08) and the REG-04 derive-equals-live gate (D-10).

---

## Wave 0 Requirements

Created before/at the start of execution (no watch mode; all credential-free):

- [x] `packages/experience-builder-agents/src/testModelMock.ts` — shared deterministic, credential-free model mock (Plan 01 Task 1) — prerequisite for all GEN-02..05 tests
- [x] Extend `packages/experience-builder-agents/src/foundationResolver.test.ts` — FND-04 real-resolve + D-09 partial-brand + unresolvable gap (Plan 01 Task 1)
- [x] `packages/experience-builder-agents/src/irGenerator.test.ts` — GEN-05 Output.object + retry/cap + registry-constraint + markup-reject (Plan 01 Task 2)
- [x] `packages/experience-builder-agents/src/compiler.test.ts` — GEN-06 acceptance triad (Plan 01 Task 3)
- [x] `packages/experience-builder-registry/src/queryRegistry.freshness.test.ts` — REG-04 gate (Plan 02 Task 1)
- [x] `packages/experience-builder-agents/src/{plannerAgent,cache,voiceAdapter,designAdapter,backgroundRun}.test.ts` (Plan 03 — backgroundRun.test.ts covers the D-05 Background-Tasks progress + same-result assertion)
- [x] `scripts/check-experience-gates.ts` + wire into `pnpm ci:gates` (Plan 04 Task 2)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Convex schema applied to live deployment | GEN-06 persistence | Convex schema applies on `npx convex dev`/deploy, not on type-check (type-check uses stale generated types — false positive) | Run `npx convex dev --once` (or deploy) after the schema edit, BEFORE bundle-persistence verification (Plan 04 Task 1) |

*All other phase behaviors have automated, credential-free verification (model mocked in CI).*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated (audited 2026-06-01)

---

## Validation Audit 2026-06-01

State A audit — existing VALIDATION.md verified against executed artifacts. All 10 mapped tasks re-confirmed against the live test suites (no auditor spawn needed; zero gaps).

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

**Evidence (run 2026-06-01):**
- `@oneui/experience-builder-agents test` → **48 passed** (10 files): foundationResolver 4, irGenerator 5, compiler 5 (+snapshot), plannerAgent 5, cache 7, voiceAdapter 3, designAdapter 3, workflow 6, backgroundRun 3, mockGeneration 7.
- `@oneui/experience-builder-registry test` → **21 passed** (2 files; freshness gate 5).
- `pnpm check:experience-gates` → REG-04 freshness (5) + GEN-06 acceptance triad (5), **exit 0**; wired into `ci:gates`.

Every Per-Task Map row resolved to a green, credential-free automated test. The single Manual-Only item (live Convex schema push for GEN-06 persistence) remains correctly manual — it requires a live deployment, not automatable in CI. Phase is **NYQUIST-COMPLIANT**.
