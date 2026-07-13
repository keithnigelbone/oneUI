---
phase: 01-isolated-foundation
plan: 02
subsystem: api
tags: [registry, adapter, jioAlphaCatalog, generated-meta, membership, vitest, contracts, isolation]

requires:
  - phase: 01-isolated-foundation (plan 01)
    provides: "@oneui/experience-builder-core — JioComponentRegistryItem contract (Zod), JioRegistryProp"
provides:
  - "@oneui/experience-builder-registry package — deterministic registry adapter (REG-01/REG-02/REG-03)"
  - "queryRegistry(filter?) → production-shaped, catalog-derived JioComponentRegistryItem[] (REG-01/REG-02)"
  - "getRegistryItem(id) → exact-membership lookup with typed component-gap path (REG-03)"
  - "isRegistered(id) exact boolean membership check"
  - "KNOWN_DRIFT_EXCLUSIONS (Modal, Text) — documented, exported exclusion list"
affects: [03-preview-eval-repair, 04-campaign-social, experience-builder-validation, experience-builder-agents]

tech-stack:
  added: [per-package node-env vitest config for experience-builder-registry]
  patterns:
    - "Derive-not-duplicate registry adapter: ids/flags from jioAlphaCatalog, props/variants/slots from @oneui/shared/meta/generated/* (Pitfall 5)"
    - "Node-safe metadata join — import the pure-TS generated *_GENERATED_PROPS arrays, NOT the React-laden componentRegistry barrel"
    - "Exact membership (Map lookup); unregistered/excluded ids return a first-class component-gap variant, never a fuzzy match (REG-03)"
    - "Deep-import boundary: @oneui/ui via @oneui/ui/registry/... only, never the barrel (eslint no-restricted-imports)"

key-files:
  created:
    - packages/experience-builder-registry/package.json
    - packages/experience-builder-registry/tsconfig.json
    - packages/experience-builder-registry/vitest.config.ts
    - packages/experience-builder-registry/src/index.ts
    - packages/experience-builder-registry/src/queryRegistry.ts
    - packages/experience-builder-registry/src/queryRegistry.test.ts
  modified:
    - pnpm-lock.yaml
    - .planning/phases/01-isolated-foundation/deferred-items.md

key-decisions:
  - "Props/variants/slots sourced from @oneui/shared/meta/generated/*_GENERATED_PROPS (pure-TS, node-safe) instead of the componentRegistry barrel, which imports React components + CSS and is not node-env importable. Still the single source of truth (regenerated via `pnpm docs:machine`), satisfying derive-not-duplicate."
  - "Variants derived from the canonical variant-defining prop (variant → fallback attention/appearance) enumerated options; slots derived from ReactNode-typed props. Both trace to generated meta, no parallel list."
  - "states/supportedBrands/supportedProfiles/tokenDependencies/usageRules/antiPatterns default to [] (contract-shaped, never fabricated) — not yet machine-derivable from the alpha catalog; plans 03/04 enrich."
  - "Component-gap descriptor distinguishes reason: 'unregistered' vs 'excluded-known-drift' so the gap-report card can explain why Modal/Text are blocked."

requirements-completed: [REG-01, REG-02, REG-03]

duration: ~20 min active execution
completed: 2026-05-30
---

# Phase 1 Plan 02: Experience Builder Registry Summary

**`@oneui/experience-builder-registry` — a deterministic, pure-TS adapter that exposes the Jio web alpha catalog joined with the real generated component metadata as production-shaped `JioComponentRegistryItem`s, answering `queryRegistry()` membership by EXACT lookup with a typed component-gap path for unregistered components, and excluding known-drift components (Modal, Text) from the generatable set.**

## Performance

- **Duration:** ~20 min active execution
- **Completed:** 2026-05-30
- **Tasks:** 1 executed (Task 1, TDD)
- **Files created:** 6 (package source/config + test); **modified:** 2 (lockfile, deferred-items.md)
- **Tests:** 16 passing (1 file)

## Accomplishments

- Stood up `@oneui/experience-builder-registry` linked into the pnpm workspace (deps: `@oneui/experience-builder-core` workspace + `zod`; `@oneui/ui`/`@oneui/shared` as dev deep-path sources; node-env vitest).
- `queryRegistry(filter?)` returns a fresh, deterministically-ordered `JioComponentRegistryItem[]` derived from `JIO_WEB_ALPHA_COMPONENTS` (ids/importPath/surfaceAware/multiAccent/status) joined with `@oneui/shared/meta/generated/*` (props/variants/slots). Every emitted item validates against the FROZEN `JioComponentRegistryItem` Zod schema from `-core` — proving production-shape conformance, not a look-alike (REG-01/REG-02).
- `getRegistryItem(id)` is an exact `Map` lookup. A registered id returns `{ ok: true, item }`; an unregistered id (`FancyHero`) or a near-miss (`Buton`) returns `{ ok: false, kind: 'component-gap', reason: 'unregistered' }` — never a fuzzy/near match (REG-03 / T-01-04). Embeddings deferred (REG-05).
- `Modal` and `Text` are excluded from the generatable set via the documented, exported `KNOWN_DRIFT_EXCLUSIONS`; looking them up returns a gap with `reason: 'excluded-known-drift'` (CONCERNS.md / Pitfall 5 / T-01-05).
- Every returned `importPath` is asserted to start with `@oneui/ui/components/` — the VAL-02 allowlist source; no non-Jio import path can be smuggled in (T-01-06).
- Deep-import boundary honored: `@oneui/ui` is imported only via `@oneui/ui/registry/jioAlphaCatalog`, never the barrel (`grep -c "from '@oneui/ui'"` = 0); eslint clean.

## Task Commits

1. **Task 1: Scaffold registry package + queryRegistry adapter over jioAlphaCatalog** — `3ef9166a` (feat, TDD)

## Files Created/Modified

- `packages/experience-builder-registry/package.json` — manifest (core workspace dep, zod; @oneui/ui + @oneui/shared dev deep-path sources; `test` = `vitest run`)
- `packages/experience-builder-registry/tsconfig.json` — extends repo base, noEmit
- `packages/experience-builder-registry/vitest.config.ts` — node env
- `packages/experience-builder-registry/src/index.ts` — barrel re-exporting the adapter API + gap types
- `packages/experience-builder-registry/src/queryRegistry.ts` — the deterministic adapter (`queryRegistry`, `getRegistryItem`, `isRegistered`, `KNOWN_DRIFT_EXCLUSIONS`)
- `packages/experience-builder-registry/src/queryRegistry.test.ts` — 16 tests (conformance, Jio-only imports, exact membership, exclusion, traceability, filters)
- `pnpm-lock.yaml` — workspace link for the new package
- `.planning/phases/01-isolated-foundation/deferred-items.md` — appended the recurring pre-existing `@oneui/shared` typecheck-leak note

## Decisions Made

- **Metadata source = generated props, not the componentRegistry barrel.** The plan named `componentRegistry` as a join source, but `@oneui/ui/registry/componentRegistry` eagerly imports React components, recipes, and CSS modules and is not importable in a node-env adapter/test. The pure-TS `@oneui/shared/meta/generated/*_GENERATED_PROPS` arrays are the machine-generated projection of the same component APIs (regenerated via `pnpm docs:machine`), so deriving props/variants/slots from them preserves the derive-not-duplicate invariant (Pitfall 5) while staying node-safe. Verified via a throwaway probe test before committing.
- **Variants** = enumerated options of the canonical variant prop (`variant`, fallback `attention`/`appearance`); **slots** = names of `ReactNode`-typed props. Both trace to generated meta.
- **Empty-but-present fields.** `states`, `supportedBrands`, `supportedProfiles`, `tokenDependencies`, `usageRules`, `antiPatterns` default to `[]` — the contract requires them; they are not yet machine-derivable from the alpha catalog, and are deliberately left empty (never fabricated). Plans 03/04 enrich.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] componentRegistry barrel is not node-env importable**
- **Found during:** Task 1 (designing the metadata join)
- **Issue:** The plan's `<action>` named `componentRegistry` (component refs) as a join source, but `@oneui/ui/registry/componentRegistry` imports React components + recipes + CSS, which a node-env vitest adapter/test cannot load — it would break the package's own test gate.
- **Fix:** Joined the catalog with the pure-TS, node-safe `@oneui/shared/meta/generated/*_GENERATED_PROPS` arrays (the same machine-generated metadata projection) instead of the React-laden barrel. A throwaway probe test confirmed both `jioAlphaCatalog` and the generated meta import cleanly in node-env.
- **Verification:** 16 tests pass under `environment: 'node'`; traceability tests assert ids/flags trace to the catalog and Button variants trace to generated meta.
- **Committed in:** `3ef9166a`

---

**Total deviations:** 1 auto-fixed (Rule 3 blocking). Necessary to keep the adapter node-safe while honoring derive-not-duplicate. No scope creep — same single source of truth, node-safe projection.

## Issues Encountered

- **Pre-existing `@oneui/shared` typecheck failure (OUT OF SCOPE):** `pnpm --filter @oneui/experience-builder-registry typecheck` reports only `packages/shared/src/engine/buildNativeTheme.ts:233` (`Property 'stateLayers' does not exist on type 'ResolvedTokenSet'`), which leaks in because the adapter type-imports `@oneui/shared` (`PropDescriptor`). This is the same failure documented in plan 01-01; it reproduces on `pnpm --filter @oneui/shared typecheck` alone. Grepping the typecheck output for `experience-builder-registry/src` shows zero errors in this package's own sources. Logged to `deferred-items.md` (01-02 row). Not fixed (sibling package responsibility).

## Known Stubs

- `states` / `supportedBrands` / `supportedProfiles` / `tokenDependencies` / `usageRules` / `antiPatterns` are emitted as `[]` for every item. This is intentional: the contract requires the fields, the alpha catalog + generated props do not yet carry this data, and fabricating values would violate the honesty rule (Pitfall 6). Plans 03 (validation) and 04 (generator) enrich these once the data source exists. Not a defect.
- Catalog entries without a generated-meta file (Surface, Container, Grid, Carousel) surface with empty `props`/`variants`/`slots` — still derived from the catalog (id/importPath/flags), never fabricated. They become richer when their `*.generated.ts` is added upstream.

## Threat Flags

None — no new network endpoints, auth paths, file-access patterns, or schema changes introduced. The adapter is a pure-TS read-only projection over existing in-repo metadata.

## Self-Check: PASSED

- Created files verified present: `package.json`, `tsconfig.json`, `vitest.config.ts`, `src/index.ts`, `src/queryRegistry.ts`, `src/queryRegistry.test.ts`.
- Task commit `3ef9166a` verified in git log.
- `pnpm --filter @oneui/experience-builder-registry test` → 16/16 pass.
- `grep -c "from '@oneui/ui'" src/queryRegistry.ts` → 0 (deep-paths only).
- git diff touched only `packages/experience-builder-registry/` + lockfile + deferred-items.md.

---
*Phase: 01-isolated-foundation*
*Completed: 2026-05-30*
