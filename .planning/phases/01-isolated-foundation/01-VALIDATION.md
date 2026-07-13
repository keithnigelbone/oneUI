---
phase: 1
slug: isolated-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-30
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `01-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (all packages); `vitest-axe` for a11y; Playwright reserved for E2E/visual (P3+) |
| **Config file** | New per-package `vitest.config.ts` for each `experience-builder-*` — node env for `-core`/`-validation`/`-registry`/`-agents`; jsdom for the route's component tests (Wave 0) |
| **Quick run command** | `pnpm --filter @oneui/experience-builder-core test` (and per affected package) |
| **Full suite command** | `pnpm test` (turbo, all packages) + `pnpm ci:gates` |
| **Estimated runtime** | ~30s per-package quick; full suite + gates ~3-5 min |

---

## Sampling Rate

- **After every task commit:** Run the affected package's `pnpm --filter @oneui/experience-builder-<pkg> test`
- **After every plan wave:** Run `pnpm test` (turbo) + the LAB-03 isolation CI gate
- **Before `/gsd-verify-work`:** `pnpm ci:gates` green + existing-Builder smoke test + `pnpm why ai` single-version + manual UAT of the walking skeleton
- **Max feedback latency:** ~30 seconds (per-package quick run)

---

## Per-Task Verification Map

> Task IDs are assigned during planning; rows below map each REQ-ID to its test type and command so the planner can attach `<automated>` verify blocks.

| Requirement | Behavior | Test Type | Automated Command | File Exists |
|-------------|----------|-----------|-------------------|-------------|
| IR-01 / IR-04 | Valid IR parses; required fields enforced (type, profile, brand, foundationRefs, sections, instances, content, a11y, status) | unit | `pnpm --filter @oneui/experience-builder-core test` | ❌ W0 |
| IR-02 | **No markup field anywhere**; adversarial "give me HTML" → valid IR or gap, never markup | unit (red-team fixture) | core `ir/schema.test.ts` | ❌ W0 |
| IR-03 | IR↔AST round-trips to `ComponentASTNode`/`TextASTNode` (no `ElementASTNode`); JSON-patch diff/apply | unit | core `ir/irToAst.test.ts`, `ir/patch.test.ts` | ❌ W0 |
| FND-01 / FND-03 | Mock resolver returns `ThemeConfig`-shaped result OR typed gap report | unit | agents/validation resolver test | ❌ W0 |
| REG-01 / REG-02 / REG-03 | `queryRegistry()` returns production-shaped items; unregistered component → gap | unit | registry test | ❌ W0 |
| VAL-01 / VAL-02 / VAL-03 | AST validator blocks non-Jio imports + unregistered components; returns `JioValidationResult` | unit | validation test (allowlist fixtures) | ❌ W0 |
| ORCH-01 / ORCH-03 / ORCH-04 | Mock workflow runs end-to-end; emits `ExperienceBuilderEvent`s; no orchestration logic in AI-SDK callbacks | integration | agents workflow test | ❌ W0 |
| GEN-01 / GEN-08 | Mock generation → valid IR (passes IR schema + basic validator) | integration | agents `mockGeneration.test.ts` | ❌ W0 |
| VER-03 | Run + IR persist to `experience*` Convex tables | integration | convex test / route test | ❌ W0 |
| LAB-01 / LAB-04 / CANVAS-01 / CANVAS-02 / CANVAS-03 / CANVAS-04 | Lab route renders; prompt card creatable; brand/type/profile selectable; artifact card appears | component (jsdom) + manual UAT | route component tests | ❌ W0 |
| INPUT-01 / INPUT-02 / INPUT-03 / INPUT-04 | Request panel edits selected prompt card; config persists on card; Run produces linked artifact | component (jsdom) + manual UAT | route component tests | ❌ W0 |
| LAB-03 | Existing Builder still boots; no `experience-builder-*` import from `(builder)`; single `ai` version | CI gate | eslint import guard + `(builder)` smoke test + `pnpm why ai` check | ❌ W0 |
| LAB-02 | Lab UI is token-only Jio CSS | CI gate | `pnpm check:literals`, `check:layers`, `validate:tokens` (extend scope to Lab) | ✓ (gates exist; scope to Lab) |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/experience-builder-core/vitest.config.ts` + `src/ir/*.test.ts` — IR schema, IR↔AST, patch (IR-01..04)
- [ ] `packages/experience-builder-validation/*.test.ts` — AST allowlist fixtures incl. aliased-import red-team seed (VAL-01..03)
- [ ] `packages/experience-builder-registry/*.test.ts` — production-shape conformance + membership (REG-01..03)
- [ ] `packages/experience-builder-agents/*.test.ts` — mock workflow + event emission (ORCH-01/03/04, GEN-08)
- [ ] `apps/platform/(experience-lab)` component tests (jsdom) — route boots, prompt/artifact cards (LAB-01, CANVAS-01/02/04, INPUT-*)
- [ ] **Isolation CI:** eslint `no-restricted-imports` Lab↔Builder rule + existing-Builder smoke test + `pnpm why ai` gate (LAB-03)
- [ ] Extend `check:literals`/`check:layers`/`validate:tokens` scope to the Lab route + packages (LAB-02)
- [ ] Adversarial "give me HTML" fixture asserting no-markup invariant (IR-02)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Walking-skeleton end-to-end feel | CANVAS-04 / GEN-08 | Visual + interaction judgment on canvas | Open Experience Lab route → place prompt card → pick brand/type/profile → enter prompt → Run → confirm a valid-IR artifact card appears via streamed event log |
| Gap-report UX | FND-03 / REG-03 | Visual confirmation of card flip-to-gap state | Run with a profile/component that has no mock entry → confirm foundation-profile / component-reference card flips to typed gap-report state and NO artifact card is produced |
| Separate-origin preview decision | (P1 decision, built P3) | Documentation artifact, not code | Confirm preview hosting model is decided + written down in P1 deliverable |
| Non-web foundation-coverage audit | FND-01 | Research/documentation deliverable | Confirm `FOUNDATION-COVERAGE.md` documents which non-web profiles Jio defines vs assumes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
