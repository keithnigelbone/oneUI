---
phase: 03-preview-eval-repair
plan: 01
subsystem: experience-builder-validation
tags: [validation, security, ast, literals, redteam, VAL-04, VAL-05, VAL-06]
requires:
  - "@oneui/experience-builder-core JioValidationResult contract (frozen)"
  - "@oneui/experience-builder-registry getRegistryItem"
  - "@oneui/shared/engine/tokenBoundary BRAND_ALLOWED_REGEX"
provides:
  - "VAL-04: hardcoded visual literals are BLOCKING (colour/spacing/radius/elevation/motion/font/icon)"
  - "VAL-05: red-team evasion corpus extended to 11 fixtures, 100% blocked"
  - "VAL-06: deterministic structural compliance gate feeding the compile/render path"
affects:
  - "Plan 03-04 (evaluate) consumes validateAst() blocking output"
  - "Repair loop short-circuits on blocking literals with no model call (D-06)"
tech-stack:
  added: []
  patterns:
    - "Literal classification stays structural per-prop; the ONE sanctioned regex (BRAND_ALLOWED_REGEX) classifies token refs, never a string denylist"
    - "Genuine var(--Token) escape hatch: contains var(--) AND manifest-allowed token name passes; fake var(--NotAToken) is blocking"
key-files:
  created:
    - .planning/phases/03-preview-eval-repair/deferred-items.md
  modified:
    - packages/experience-builder-validation/src/astValidator.ts
    - packages/experience-builder-validation/src/fixtures/redteam.ts
    - packages/experience-builder-validation/src/astValidator.test.ts
decisions:
  - "Literal hook promoted from warning-only skeleton to BLOCKING via the existing blocking() builder; code name literal-value-hook unchanged (matches PATTERNS + existing fixtures)"
  - "VISUAL_LITERAL_RE extended for rgba/hsla, decimal px/rem/em, and motion ms/s units; font/icon props flag raw family/slug literals"
  - "Fake var() (token not in BRAND_ALLOWED_REGEX) treated as a smuggled literal — blocking"
metrics:
  duration: ~10min
  completed: 2026-06-01
  tasks: 2
  files: 4
---

# Phase 03 Plan 01: Literal Blocking + Red-Team Corpus Summary

Promoted the AST validator's literal-value hook from a warning-only Phase 1 skeleton to a BLOCKING gate (VAL-04), extended literal coverage to radius/elevation/motion/font/icon, and grew the red-team evasion corpus to 11 structural fixtures that are 100% blocked (VAL-05) — the deterministic half of the Phase 3 quality loop that short-circuits to repair with no model call (D-06).

## What Shipped

- **VAL-04 — literal blocking.** `checkLiteralHook` now pushes BLOCKING violations (via the existing `blocking()` builder) into `acc.blocking` at the `walkNode` call site. `VISUAL_LITERAL_RE` extended to catch `rgba()`/`hsla()`, decimal `px`/`rem`/`em`, and motion `ms`/`s` units. Font/icon props (`fontFamily`/`font`/`icon`) flag raw family names / icon slugs. A fake `var(--NotAToken)` (token not in `BRAND_ALLOWED_REGEX`) is treated as a smuggled literal and blocked; a genuine `var(--Primary-Bold)` passes via the preserved escape hatch. The `literal-value-hook` code name is unchanged.
- **VAL-05 — red-team corpus.** Added 5 evasion fixtures as `ArtifactAst` objects (not string denylists): `inline-hex-on-visual-prop`, `fake-var-token`, `dynamic-classname-literal` (→ `literal-value-hook`); `aliased-non-jio-font-import`, `aliased-non-jio-icon-import` (→ `non-jio-import`). Corpus now 11 fixtures. Added a `redteam`-tagged loop test asserting every fixture's `expectedBlockingCode` appears and zero fixtures leak (all `passed === false`).
- **VAL-06.** The validator still returns a contract-valid `JioValidationResult` (via `JioValidationResult.parse`) on every branch — `passed` iff zero blocking — so the evaluate/compile gate consumes a stable contract.

## How It Was Verified

- `pnpm --filter @oneui/experience-builder-validation test` → 52 passed (was 21; +31 new literal + redteam assertions).
- Token escape-hatch test: `var(--Primary-Bold)` / `var(--Typography-Font-Primary)` are NOT blocking.
- `grep "severity: 'warning'"` on `astValidator.ts` → none (literal hook no longer warning-only).
- `grep "literal-value-hook"` → code name preserved.
- Red-team corpus: 11 fixtures, 100% blocked, zero leaks.

## TDD Gate Compliance

Task 1 followed RED → GREEN: failing literal tests committed first (`51cad5c6`, `test(...)`), then the blocking implementation (`ae72decb`, `feat(...)`). Task 2 added fixtures + the redteam corpus loop (`854ed714`, `test(...)`); the implementation from Task 1 already supported every new vector, so the corpus passed on first run (no separate impl commit needed — fixtures exercise existing behaviour). RED and GREEN gate commits both present.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Test bug] Genuine-token pass assertion used a non-allowed prop**
- **Found during:** Task 1 (GREEN).
- **Issue:** The "does NOT block genuine `var(--Primary-Bold)`" test placed the value on `style`, which is not a Button meta prop, so it failed `passed === true` via an unrelated `invalid-prop` block.
- **Fix:** Moved the value to the always-allowed `className` prop so the assertion isolates the literal hook.
- **Files modified:** `astValidator.test.ts`
- **Commit:** `ae72decb`

## Deferred Issues (out of scope — SCOPE BOUNDARY)

- **Pre-existing typecheck error in `@oneui/shared`:** `packages/shared/src/engine/buildNativeTheme.ts:233 — TS2339 Property 'stateLayers' does not exist on type 'ResolvedTokenSet'`. Not introduced by this plan (validator-only edits); correlates with uncommitted `recipeCornerRadius` working-tree changes at worktree base. Logged to `.planning/phases/03-preview-eval-repair/deferred-items.md`. Zero type errors in the validation package itself.

## Known Stubs

None — the literal hook is now a full blocking scanner, not a stub. The Phase 1 "(Full literal scan lands in P3.)" placeholder note was removed.

## Threat Flags

None — no new security surface introduced. Edits tighten the existing LLM-IR → validator trust boundary per the plan threat model (T-3-01-LIT mitigated by promotion to blocking + manifest allowlist; T-3-01-ALI mitigated by aliased font/icon corpus entries). No package installs (T-3-01-SC n/a).

## Commits

- `51cad5c6` test(03-01): add failing tests for VAL-04 literal blocking
- `ae72decb` feat(03-01): promote literal hook to blocking, extend literal coverage (VAL-04/VAL-06)
- `854ed714` test(03-01): extend red-team corpus to 100% blocked (VAL-05)

## Self-Check: PASSED

- FOUND: packages/experience-builder-validation/src/astValidator.ts
- FOUND: packages/experience-builder-validation/src/fixtures/redteam.ts
- FOUND: packages/experience-builder-validation/src/astValidator.test.ts
- FOUND: .planning/phases/03-preview-eval-repair/deferred-items.md
- Commits 51cad5c6, ae72decb, 854ed714 present in git log.
