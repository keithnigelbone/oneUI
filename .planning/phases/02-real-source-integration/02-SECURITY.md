# SECURITY — Phase 02: Real Source Integration

**Audit date:** 2026-06-01
**Auditor:** gsd-security-auditor (FORCE stance)
**Register type:** plan-time-authored (`register_authored_at_plan_time: true`) — mitigations VERIFIED present, not a fresh vulnerability scan.
**ASVS Level:** not configured
**block_on:** high
**Result:** SECURED — 14/14 mitigate threats CLOSED, 3/3 accept threats confirmed.

---

## Mitigate threats (14) — all CLOSED

| Threat ID | Category | Evidence (file:line) |
|-----------|----------|----------------------|
| T-02-01 | Tampering (smuggled JSX/HTML via IR string fields) | `packages/experience-builder-core/src/ir/schema.ts:40` `MARKUP_PATTERN` regex + `:50` `.refine(!containsMarkup)` + `.strict()` at `:124,142,163,198`; enforced in `irGenerator.ts:219-223` (parseIR Gate A → continue/gap, never compile). Test `irGenerator.test.ts:147-166` (`<script>` rejected, `compiled===false`). PASS. |
| T-02-02 | Tampering (unregistered/near-match component) | `irGenerator.ts:142-147` (request gate via `getRegistryItem` exact membership), `:228-234` + `findUnregisteredType` `:271-281` (post-parse gate → componentGap). Test `irGenerator.test.ts:123-145` (`FakeWidget` → componentGap, never compiled). PASS. |
| T-02-03 | Info Disclosure (ANTHROPIC_API_KEY leak) | `modelAdapter.ts:26-27,85-97` — key read server-side only by `@ai-sdk/anthropic` inside `callModelReal`; never logged, never written into IR/bundle/events. `callModel` returns only `result.experimental_output`. The single `ai`/`@ai-sdk` import (verified by grep, single-seam). |
| T-02-04 | Tampering (fabricated dimensions for uncovered profile) | `foundationResolver.ts:103-111` (uncovered) + `:129-137` (unresolvable) gap arms carry only `artifactType`/`outputProfile`/`reason` — NO dimension numbers. Test `foundationResolver.test.ts:105-134` asserts gap has no `dimensions`/`width`/`height`/`aspect` keys and no numeric values anywhere. PASS. |
| T-02-05 | Tampering (npm installs / multi-version `ai`) | No new external installs (workspace-link only; `ai@6.0.111`+`@ai-sdk/anthropic` were existing repo deps). Gate `scripts/check-single-ai-version.ts` (Lab-subtree-scoped, ≥2 versions → exit 1) wired into `package.json` `ci:gates`. Confirmed in chain. |
| T-02-06 | Tampering (registry drift) | `queryRegistry.freshness.test.ts:79-152` independent re-derivation (separate `LIVE_GENERATED_PROPS_BY_NAME` + `liveProps/liveVariants/liveSlots`), `:198` `toEqual` deep-equality on ids, `:227-238` per-item props/variants/slots deep-equality, `:36` imports `KNOWN_DRIFT_EXCLUSIONS` (not re-hardcoded). 5 tests PASS. |
| T-02-08 | Tampering (designAdapter unregistered component) | `adapters/designAdapter.ts:82-86,109` filters chosen components to `queryRegistry()` members; hallucinations dropped in-adapter. Test `designAdapter.test.ts:46-64` proves `TotallyFakeComponent` dropped, only registry members survive. PASS. |
| T-02-09 | Tampering (voiceAdapter smuggled JSX/HTML in copy) | `adapters/voiceAdapter.ts:118-123,159-161` `stripToMarkupFree` strips tags before copy leaves adapter. Test `voiceAdapter.test.ts:50-67` asserts no `<...>` in any string field. `parseIR` markup-free guard is the final downstream gate (T-02-01). PASS. |
| T-02-10 | EoP / Info Disclosure (Lab adapter importing apps/platform executors) | Runtime grep: ZERO real `ai`/`@ai-sdk`/`apps/platform`/`@/lib` imports anywhere in `packages/experience-builder-agents/src` except `modelAdapter.ts` (only matches outside are docstrings/test assertions). Isolation grep tests: `designAdapter.test.ts:68-76`, `voiceAdapter.test.ts:71-80`. Adapters reuse node-safe `@oneui/shared/engine` compilers only. PASS. |
| T-02-11 | Spoofing (prompt-injection into emitted code) | Planner schema-constrained: `plannerAgent.ts:43-56,134` `PlanSchema` via `Output.object`. Design ids registry-constrained: `designAdapter.ts:109`. IR Generator markup-free + registry guards reject downstream: `irGenerator.ts:219-234`. All three legs present and tested. PASS. |
| T-02-13 | Tampering (schema persisting raw markup as source of truth) | `packages/convex/convex/schema.ts:2031` `ir: v.any()` stays canonical; `:2042-2047` `compiledBundle: v.optional(v.object({ code: v.string(), meta? }))` is codegen STRING only, additive `v.optional`. Mutation arg + insert: `experienceRuns.ts:102-107,134`. Route passes `{ code: run.bundle }` only in artifact branch. |
| T-02-14 | Repudiation (false-positive verify against stale Convex types) | Process mitigation. `02-04-SUMMARY.md` verification log records `npx convex dev --once → "Convex functions ready!"` (live schema push + type regen) BEFORE the platform typecheck of the new `persistArtifact` arg. Documented as a key-decision and verification-evidence entry. |
| T-02-15 | Tampering (registry/compiler drift past CI) | `scripts/check-experience-gates.ts:40-51` runs REG-04 freshness + GEN-06 compiler acceptance; exits non-zero on either failure. Wired into `package.json` `ci:gates` (confirmed in chain). Hard-fail proven by temporary-break step (02-04-SUMMARY). GEN-06 triad: `compiler.test.ts` (import/`@oneui/ui`, validateAst pass/fail, snapshot) — 5 tests PASS. |
| T-02-16 | EoP (editing forbidden ExperienceCanvas/(builder)/FoundationStyleProvider) | `git diff --name-only 894b160e^..d395fae2` shows ZERO changes to `ExperienceCanvas`, `(builder)`, or `FoundationStyleProvider`. The only `apps/platform` file touched is the Lab's own `app/api/experience-lab/run/route.ts` (in-scope). |

## Accept threats (3) — confirmed legitimate

| Threat ID | Plan | Disposition | Confirmation |
|-----------|------|-------------|--------------|
| T-02-07 | 02 | accept — no installs, pure test | `02-02` `tech-stack.added: []`; freshness gate is a pure deterministic Vitest over already-installed sources. Legitimate. |
| T-02-12 | 03 | accept — no installs, in-package APIs only | `02-03` `tech-stack.added: []`; all D-05 features use in-package APIs (`cache.ts`, existing event stream, `@mastra/core/background-tasks`). `@mastra/observability` deferred to P5 per pinned-version availability. Single-`ai`-version gate unaffected. Legitimate. |
| T-02-17 | 04 | accept — no installs | `02-04` `tech-stack.added: []`; only schema field + CI gate script + route pass-through. Legitimate. |

---

## Verification runs (live, this audit)

- `pnpm --filter @oneui/experience-builder-agents test irGenerator foundationResolver designAdapter voiceAdapter compiler` → 5 files / 20 tests PASS.
- `pnpm --filter @oneui/experience-builder-registry test freshness` → 5 tests PASS.
- Single-seam grep: ZERO real `ai`/`@ai-sdk` imports outside `modelAdapter.ts`; ZERO `apps/platform`/`@/lib` imports in adapters.
- `ci:gates` chain contains `check:single-ai`, `check:experience-gates`, `smoke:builder`.
- `git diff --name-only` across phase commits: no forbidden-file changes.

## Unregistered flags

None. No SUMMARY contains a `## Threat Flags` section; all four SUMMARY files are accounted for and every threat in the register resolves to CLOSED or confirmed-accepted. No new attack surface appeared during implementation without a threat mapping.

## Notes / residual observations (non-blocking)

- The repo lockfile resolves multiple `ai@5.x`/`ai@6.x` versions globally; this is expected and explicitly out of scope for the single-ai gate, which is deliberately scoped to the `@oneui/experience-builder-*` subtree (see `check-single-ai-version.ts` rationale). Not a gap.
- T-02-14 is a one-time process mitigation (schema push before verification). Its evidence is the recorded execution in `02-04-SUMMARY.md`; it cannot be re-run idempotently at audit time and is not re-executed here. Verified by documentation of a completed action, consistent with its disposition.
