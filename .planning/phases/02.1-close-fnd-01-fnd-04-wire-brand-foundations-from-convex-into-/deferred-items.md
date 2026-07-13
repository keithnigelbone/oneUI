# Deferred Items — Phase 02.1

Out-of-scope discoveries logged during execution (not fixed).

## Plan 02.1-01

- **Pre-existing typecheck error in `@oneui/shared`** — `packages/shared/src/engine/buildNativeTheme.ts(233,32): TS2339: Property 'stateLayers' does not exist on type 'ResolvedTokenSet'`. Surfaced by `pnpm --filter @oneui/experience-builder-agents typecheck` (the agents package depends on `@oneui/shared`). Last touched by commit `6d0f22af` ("Align dark surface color parity") — NOT introduced by this plan. Zero typecheck errors in `experience-builder-agents/src`. Out of scope (unrelated package, pre-existing).
