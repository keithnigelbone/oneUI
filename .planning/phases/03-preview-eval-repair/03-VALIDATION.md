---
phase: 3
slug: preview-eval-repair
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-01
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (workspace standard; per-package configs) |
| **Config file** | per-package `vitest.config.ts` (Plan 02 Task 1 adds the config for `experience-builder-preview`) |
| **Quick run command** | `pnpm --filter <package> test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~60-120s full suite (per-package quick runs < 30s) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter <touched-package> test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite green + red-team corpus 100% blocked + manual canvas/preview + live-egress probe
- **Max feedback latency:** ~30s per-package quick run

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | VAL-04, VAL-06 | T-3-01-LIT | Literal color/spacing/type/radius/elevation/motion/font/icon is BLOCKING; genuine var(--Token) passes | unit | `pnpm --filter @oneui/experience-builder-validation test -t literal` | ⚠️ extend | ⬜ pending |
| 3-01-02 | 01 | 1 | VAL-05 | T-3-01-ALI | 100% of red-team corpus (incl. aliased font/icon, fake var(), dynamic className) blocked | unit | `pnpm --filter @oneui/experience-builder-validation test -t redteam` | ⚠️ extend | ⬜ pending |
| 3-02-01 | 02 | 1 | PREV-01, PREV-02 | T-3-02-EXFIL | PreviewExecutor seam has no vendor import; previewState immutable | unit | `pnpm --filter @oneui/experience-builder-preview typecheck` | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 1 | PREV-03, PREV-04, CANVAS-06 | T-3-02-TOKEN | Separate-origin token-handoff (no token in URL); per-profile credential-free capture; lifecycle states | unit | `pnpm --filter @oneui/experience-builder-preview test` | ❌ W0 | ⬜ pending |
| 3-02-03 | 02 | 1 | PREV-01, PREV-02, PREV-03 | T-3-02-CRED | Credential-free mock executor; previewState immutability; lifecycle transitions | unit | `pnpm --filter @oneui/experience-builder-preview test -t PreviewExecutor` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 1 | VER-01, CANVAS-05 | T-3-03-MIG | Additive v.optional fields; existing rows round-trip; no destructive migration | unit | `pnpm --filter @oneui/convex typecheck` | ⚠️ extend | ⬜ pending |
| 3-03-02 | 03 | 1 | VER-01, VER-02, CANVAS-05 | T-3-03-LEAK | persistArtifact full version object; listVariantGroup; no destructive patch | unit | `pnpm --filter @oneui/convex typecheck` | ⚠️ extend | ⬜ pending |
| 3-03-03 | 03 | 1 | VER-01, VER-02, CANVAS-05 | T-3-03-MIG | Round-trip + variant-group + version-chain read-back | unit | `pnpm --filter @oneui/convex test -t variantGroup` | ❌ W0 | ⬜ pending |
| 3-04-01 | 04 | 2 | EVAL-01 | T-3-04-ORCH, T-3-04-400 | Two-track scoring; objective fail short-circuits with NO model call; vision via callModel only; Anthropic-safe Zod | unit | `pnpm --filter @oneui/experience-builder-agents test -t evaluate` | ❌ W0 | ⬜ pending |
| 3-04-02 | 04 | 2 | EVAL-02, EVAL-03 | T-3-04-JSX | Repair patches IR via applyPatch (no JSX/regen); gap short-circuits zero attempts | unit | `pnpm --filter @oneui/experience-builder-agents test -t repair` | ❌ W0 | ⬜ pending |
| 3-04-03 | 04 | 2 | ORCH-02 (bounded-loop half), EVAL-03, GEN-07, PREV-04, VAL-06 | T-3-04-DOS | Bounded repair loop (cap 3 / convergence / gap short-circuit); best-of-N ranked; preview render-success feeds VAL-06 | unit | `pnpm --filter @oneui/experience-builder-agents test -t workflow` | ⚠️ extend | ⬜ pending |
| 3-04-04 | 04 | 2 | ORCH-02 (HITL half) | T-3-04-HITL | Mastra `suspend()`/`resumeData` HITL checkpoint at non-convergence; resume decision (accept/repair-again/abandon) branched in the workflow; gated off by default | unit | `pnpm --filter @oneui/experience-builder-agents test -t hitl` | ❌ W0 | ⬜ pending |
| 3-05-01 | 05 | 2 | PREV-01 | T-3-05-SC | `@daytonaio/sdk` authenticity verified at blocking human checkpoint before install | manual | checkpoint:human-verify (npmjs/repo/postinstall) | n/a | ⬜ pending |
| 3-05-02 | 05 | 2 | PREV-01, PREV-04 | T-3-05-EGRESS, T-3-05-CDP | networkBlockAll at create time; single vendor importer; no external CDP; finally teardown | unit | `pnpm --filter @oneui/experience-builder-preview typecheck` | ❌ W0 | ⬜ pending |
| 3-05-03 | 05 | 2 | PREV-01 | T-3-05-KEY | Mocked SDK; create({networkBlockAll:true}); finally teardown; no secret leak | unit | `pnpm --filter @oneui/experience-builder-preview test -t DaytonaExecutor` | ❌ W0 | ⬜ pending |
| 3-06-01 | 06 | 3 | CANVAS-06, PREV-03, CANVAS-05 | T-3-06-IFRAME, T-3-06-ISO | Live iframe (allow-scripts, no allow-same-origin); lifecycle; isolated variant frame | unit | `pnpm --filter @oneui/platform typecheck` | ❌ W0 | ⬜ pending |
| 3-06-02 | 06 | 3 | VER-01, VER-02, INPUT-05 | T-3-06-LIT | persistArtifact CALL wired with previewState/evaluation/thumbnail(_storage)/originRunId/variantGroupId (VER-01 end-to-end, non-null); timeline via getArtifactHistory; iterate seeds from parentVersionId; token-only | unit | `pnpm --filter @oneui/platform test -t versionTimeline` | ❌ W0 | ⬜ pending |
| 3-06-03 | 06 | 3 | CANVAS-05, CANVAS-06, VER-02 | T-3-06-ISO | jsdom lifecycle-iframe + timeline + variant; Builder isolation intact | unit | `pnpm --filter @oneui/platform test -t "versionTimeline\|canvas"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/experience-builder-preview/vitest.config.ts` + `tsconfig.json` — test/build config for the net-new preview package (Plan 02 Task 1)
- [ ] `packages/experience-builder-preview/src/PreviewExecutor.test.ts` — seam + mock executor (PREV-01/02/03) (Plan 02 Task 3)
- [ ] `packages/experience-builder-preview/src/DaytonaExecutor.test.ts` — mocked-SDK contract (PREV-01) (Plan 05 Task 3)
- [ ] `packages/experience-builder-agents/src/steps/evaluate.test.ts` — two-track scoring (EVAL-01) (Plan 04 Task 1)
- [ ] `packages/experience-builder-agents/src/steps/repair.test.ts` — IR-patch repair + gap short-circuit (EVAL-02/03) (Plan 04 Task 2)
- [ ] `packages/experience-builder-agents/src/evaluatorRubric.ts` tests — Zod schema + composite (D-07) (Plan 04 Task 1)
- [ ] Extend `packages/experience-builder-validation/src/astValidator.test.ts` — literal blocking (VAL-04) (Plan 01 Task 1)
- [ ] Extend `packages/experience-builder-validation/src/fixtures/redteam.ts` — new evasion entries (VAL-05) (Plan 01 Task 2)
- [ ] Extend `packages/experience-builder-agents/src/workflow.test.ts` — preview→evaluate→repair→version sequence + bounded loop + gap (ORCH-02) (Plan 04 Task 3)
- [ ] Extend `packages/experience-builder-agents/src/workflow.test.ts` — `suspend()`/`resumeData` HITL checkpoint at non-convergence + default-off (ORCH-02 HITL half) (Plan 04 Task 4)
- [ ] `packages/convex/convex/experienceRuns.test.ts` — additive fields + variantGroupId round-trip (VER-01) (Plan 03 Task 3)
- [ ] `apps/platform/.../__tests__/versionTimeline.test.tsx` — canvas live-iframe + timeline + variant (CANVAS-06/VER-02) (Plan 06 Task 3)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Daytona sandbox enforces zero network egress (cannot reach Convex/auth) | PREV-01 | Requires a live sandbox + network probe; vendor account dependent | Launch a preview, attempt a fetch to the Convex URL from inside the sandbox, confirm it is blocked |
| `@daytonaio/sdk` package authenticity / postinstall safety | D-01/D-02 | slopcheck unavailable offline; vendor trust gate | Manual repo + postinstall review at the `checkpoint:human-verify` task (Plan 05 Task 1) before install |
| Live-iframe real-DOM preview renders on the canvas at ≥30fps with 50+ cards | CANVAS-06/PREV-03 | Requires a running canvas + visual frame-rate observation | Open the Lab, generate 50+ cards, confirm thumbnail→lightweight→live lifecycle keeps the canvas responsive |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (Plan 05 Task 1 is the mandated blocking human checkpoint)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s per-package
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
