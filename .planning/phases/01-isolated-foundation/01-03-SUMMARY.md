---
phase: 01-isolated-foundation
plan: 03
subsystem: api
tags: [validation, ast, allowlist, alias-resolution, red-team, vitest, security-boundary, contracts]

requires:
  - phase: 01-isolated-foundation (plan 01)
    provides: "@oneui/experience-builder-core — JioValidationResult (VAL-01), Violation/ComponentGap, JioComponentRegistryItem types"
  - phase: 01-isolated-foundation (plan 02)
    provides: "@oneui/experience-builder-registry — getRegistryItem exact-membership lookup + typed component-gap, KNOWN_DRIFT_EXCLUSIONS"
provides:
  - "@oneui/experience-builder-validation package — AST-level compliance validator (VAL-01/02/03)"
  - "validateAst(ast, ctx) → JioValidationResult — the artifact security boundary, structural (alias-resolved), never substring"
  - "Structural Jio-import allowlist (@oneui/ui/components/*) with alias resolution (VAL-02 / Pitfall 4 / T-01-07)"
  - "Raw element-node block (markup defence-in-depth, T-01-08)"
  - "Registry membership + meta prop/variant/slot allowlist with repair suggestions (VAL-03 / T-01-09)"
  - "Literal/token-boundary HOOK skeleton wired to shared BRAND_ALLOWED_REGEX (P3 VAL-04 extends)"
  - "REDTEAM_FIXTURES seed evasion corpus (aliased import, tailwind, raw element, unregistered/known-drift, invalid prop)"
affects: [03-preview-eval-repair, 04-campaign-social, experience-builder-agents]

tech-stack:
  added: [per-package node-env vitest config for experience-builder-validation]
  patterns:
    - "Structural (parse-not-substring) allow/deny: import decision = resolved `source` startsWith Jio prefix; component decision = exact registry lookup. The only regex is the manifest-derived token-boundary classification (never the import/component gate)."
    - "Alias resolution: imports carry { source, imported, local }; the component tree references `local`, mapped back to `source` so `Button as X from shadcn` is caught (T-01-07)."
    - "Defence-in-depth: validator re-blocks raw element nodes the markup-free IR already forbids."
    - "JioValidationResult.parse() on the return value of every branch — provable shape-conformance + auditability (T-01-10)."
    - "Red-team corpus as exported data (REDTEAM_FIXTURES) so P3 extends the array, not rewrites the walk."

key-files:
  created:
    - packages/experience-builder-validation/package.json
    - packages/experience-builder-validation/tsconfig.json
    - packages/experience-builder-validation/vitest.config.ts
    - packages/experience-builder-validation/src/index.ts
    - packages/experience-builder-validation/src/astValidator.ts
    - packages/experience-builder-validation/src/astValidator.test.ts
    - packages/experience-builder-validation/src/fixtures/redteam.ts
  modified:
    - pnpm-lock.yaml
    - .planning/phases/01-isolated-foundation/deferred-items.md

key-decisions:
  - "Validator input is a PARSED, alias-resolved artifact (`ArtifactAst = { imports: ResolvedImport[]; root }`), not a code string. The caller (P2 generator / P3 compiler) parses code → this shape before validation, so the validator never substring-matches (Pitfall 4 satisfied at the type boundary)."
  - "`JioComponentRegistryItemT` imported from `-core` (the contract owner), not re-imported from `-registry` (which only re-exports its own gap/result types)."
  - "Literal/token check is a WARNING-only HOOK in P1 (skeleton); the full literal scan + blocking tightening is deferred to P3 (VAL-04). The hook uses the shared manifest-derived `BRAND_ALLOWED_REGEX` to classify a `var(--Token)` reference — the one acceptable regex, which does NOT make the import/component decision."
  - "Aliased Jio imports (e.g. `Button as PrimaryButton` from a Jio path) are NOT blocked at the import gate — only the source module matters; component-type resolution for Jio-aliased locals is exercised by the generator in P2/P3."

requirements-completed: [VAL-01, VAL-02, VAL-03]

duration: ~25 min active execution
completed: 2026-05-30
---

# Phase 1 Plan 03: Experience Builder Validation Summary

**`@oneui/experience-builder-validation` — the AST-level compliance validator that is the security boundary for the Core Value: `validateAst` walks a parsed, alias-resolved artifact AST, makes every allow/deny decision structurally (import `source` against the `@oneui/ui/components/*` allowlist, component `type` against the exact registry, props/variants/slots against the registry meta), re-blocks raw element nodes as markup defence-in-depth, and returns a `.parse`-verified `JioValidationResult` in every branch — with a seed red-team corpus whose headline case (`import { Button as X } from 'shadcn'`) proves the check is alias-resolved, not substring-based.**

## Performance

- **Duration:** ~25 min active execution
- **Completed:** 2026-05-30
- **Tasks:** 1 executed (Task 1, TDD)
- **Files created:** 7 (package source/config + fixtures + test); **modified:** 2 (lockfile, deferred-items.md)
- **Tests:** 21 passing (1 file)

## Accomplishments

- Stood up `@oneui/experience-builder-validation` in the pnpm workspace (deps: `@oneui/experience-builder-core` + `@oneui/experience-builder-registry` workspace + `zod`; `@oneui/shared` dev for the token-boundary; node-env vitest).
- `validateAst(ast, ctx)` walks a **parsed, alias-resolved** `ArtifactAst` (`{ imports: ResolvedImport[]; root }`) and enforces, all **structurally** (Pitfall 4):
  1. **Import allowlist (VAL-02):** every binding's resolved `source` must start with `@oneui/ui/components/`. Built an `alias → source` map in the same pass so the component tree's `local` names resolve back to their module. A non-Jio source is `non-jio-import` blocking.
  2. **Aliased evasion (T-01-07):** `import { Button as X } from 'shadcn'` is caught — the import source flags `non-jio-import`, and the tree's `<X/>` (bound to a non-Jio source) additionally flags `non-jio-component`. A naive `imported`-name allowlist would have waved `Button` through; only alias→source resolution gets it right.
  3. **Markup block (T-01-08):** any `ElementNode` (raw `tag`) anywhere in the tree is `raw-element` blocking — defence-in-depth with the IR's markup-free guarantee — and the walk continues into its children so nested smuggling is also reported.
  4. **Registry membership (VAL-03 / T-01-09):** every `ComponentNode.type` is resolved via the plan-02 `getRegistryItem` exact lookup; unregistered (`FancyHero`) or known-drift (`Modal`) types produce a `componentGap` + `unregistered-component` blocking — never a fuzzy match.
  5. **Prop / variant / slot allowlist (VAL-03):** unknown props and out-of-range enumerated values block with a human-readable **repair suggestion** that lists the valid options (validated against the real Button meta: `variant ∈ {bold,subtle,ghost}`); accessibility/meta props (`aria-*`, `data-ast-*`, `id`, `role`, `children`) are always allowed, mirroring `ASTRenderer`.
  6. **Literal/token-boundary HOOK (skeleton):** a structural hook walks string prop values, classifying `var(--Token)` references via the shared `BRAND_ALLOWED_REGEX` and emitting a **warning** (not yet blocking) for raw colour/size literals. P3 (VAL-04) extends this into the full scan.
- Every branch returns a `JioValidationResult` run through `JioValidationResult.parse()` — provable shape-conformance + auditability (T-01-10).
- `REDTEAM_FIXTURES` seed corpus (aliased non-Jio import, tailwind import, raw element, unregistered component, known-drift component, invalid prop) — exported as data so P3 extends the array. The test suite asserts each fixture is blocked with the expected code and that every result stays contract-conformant.

## Task Commits

1. **Task 1: AST allowlist compliance validator + red-team seed** — `e6dd73b0` (feat, TDD)

## Files Created/Modified

- `packages/experience-builder-validation/package.json` — manifest (core + registry workspace deps, zod; @oneui/shared dev; `test` = `vitest run`)
- `packages/experience-builder-validation/tsconfig.json` — extends repo base, noEmit
- `packages/experience-builder-validation/vitest.config.ts` — node env
- `packages/experience-builder-validation/src/index.ts` — barrel (validateAst + types + REDTEAM_FIXTURES)
- `packages/experience-builder-validation/src/astValidator.ts` — the structural AST validator
- `packages/experience-builder-validation/src/astValidator.test.ts` — 21 tests (happy path, VAL-02 incl. alias, markup, unregistered, prop/variant, red-team corpus)
- `packages/experience-builder-validation/src/fixtures/redteam.ts` — exported seed evasion corpus
- `pnpm-lock.yaml` — workspace link
- `.planning/phases/01-isolated-foundation/deferred-items.md` — appended the recurring pre-existing `@oneui/shared` typecheck-leak note (01-03 row)

## Decisions Made

- **Parsed input, not code string.** The validator's input is the structured `ArtifactAst` (imports already parsed into `{ source, imported, local }` + a typed component tree). This is what makes the Pitfall-4 "AST not regex" guarantee a type-level invariant rather than a runtime hope — the validator literally cannot substring-match a code string because it never receives one.
- **`JioComponentRegistryItemT` from `-core`.** The registry package re-exports only its own gap/result types; the item contract lives in `-core` (its owner), so the validator imports the type from there.
- **Literal hook is warning-only in P1.** The full literal/token scan (blocking) is P3 VAL-04. The hook is wired now (with the shared token-boundary regex) so P3 tightens severity rather than adding a new pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `JioComponentRegistryItemT` not exported from `-registry`**
- **Found during:** Task 1 (typecheck)
- **Issue:** The validator initially type-imported `JioComponentRegistryItemT` from `@oneui/experience-builder-registry`, which only re-exports its own `GetRegistryItemResult`/`JioComponentGap` types — causing `TS2305` and cascading implicit-any/`{}`-typed `item.props` errors.
- **Fix:** Imported `JioComponentRegistryItemT` from `@oneui/experience-builder-core` (the contract owner) alongside the other contract types; kept `GetRegistryItemResult` from `-registry`.
- **Verification:** Package's own sources typecheck clean; all 21 tests green.
- **Committed in:** `e6dd73b0`

---

**Total deviations:** 1 auto-fixed (Rule 3 blocking). Necessary import-source correction; no scope creep.

## Issues Encountered

- **Pre-existing `@oneui/shared` typecheck failure (OUT OF SCOPE):** `pnpm --filter @oneui/experience-builder-validation typecheck` reports only `../shared/src/engine/buildNativeTheme.ts(233,32)` (`Property 'stateLayers' does not exist on type 'ResolvedTokenSet'`), which leaks in because the validator imports the shared `tokenBoundary` module. This is the identical failure documented in 01-01 and 01-02; it reproduces on `pnpm --filter @oneui/shared typecheck` alone, and this package's own `src/*` sources typecheck clean. Logged to `deferred-items.md` (01-03 row). Not fixed (sibling package responsibility).

## Known Stubs

- **Literal/token-boundary check is a warning-only skeleton.** By design (plan scope): P1 lands the AST-walk hook + the shared token-boundary wiring; the full literal scan and blocking tightening are P3 (VAL-04). Documented in the source and the decisions above — intentional, not a defect.
- **`ValidateAstContext` (brandId / outputProfile) is reserved.** Accepted but not yet consumed; P3 will scope per-brand / per-profile component support. Contract-shaped, never fabricated.
- **Slot enforcement is partial.** The walk validates props and enumerated variants fully; positional-child→named-slot mapping is a skeleton (only flags components that declare named slots but not `children`). Full slot resolution is P3.

## Threat Flags

None — no new network endpoints, auth paths, file-access patterns, or schema changes introduced. The validator is a pure-TS, read-only function over a parsed artifact.

## Threat Model Coverage

All four `mitigate` dispositions in the plan's STRIDE register are implemented and test-covered:

| Threat ID | Mitigation | Evidence |
|-----------|-----------|----------|
| T-01-07 (aliased non-Jio import) | Alias→source resolution; `non-jio-import` + `non-jio-component` | `redteam.ts` `aliased-non-jio-import` + test "blocks the ALIASED form" |
| T-01-08 (raw element / markup) | `raw-element` blocking on any ElementNode | tests "blocks a raw <div>" + "blocks a nested raw element" |
| T-01-09 (unregistered / invalid prop) | exact registry lookup + meta allowlist + repair suggestion | tests "unregistered-component", "known-drift", "invalid prop", "invalid variant" |
| T-01-10 (auditable result) | `JioValidationResult.parse()` on every branch | test "always returns a JioValidationResult-conformant object" + red-team conformance |

## Self-Check: PASSED

- Created files verified present: `package.json`, `tsconfig.json`, `vitest.config.ts`, `src/index.ts`, `src/astValidator.ts`, `src/astValidator.test.ts`, `src/fixtures/redteam.ts`.
- Task commit `e6dd73b0` verified in git log.
- `pnpm --filter @oneui/experience-builder-validation test` → 21/21 pass (incl. every red-team fixture).
- `grep -nE "\.includes\(|\.indexOf\(|RegExp\(" src/astValidator.ts` → only array-membership (`meta.values.includes`) + the manifest-derived token-boundary classification; the import/component decision is structural (`aliasToSource.get` + `startsWith` + `getRegistryItem`).
- git diff touched only `packages/experience-builder-validation/` + lockfile + deferred-items.md.

---
*Phase: 01-isolated-foundation*
*Completed: 2026-05-30*
