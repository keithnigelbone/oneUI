# @jds/kb-rn

> **[WIP]** — feat/kb-split-v5.0. Schema in iteration with downstream tooling teams.

JDS knowledge-base for React Native. Consumed by AI code-generation tools to
emit idiomatic RN code that matches OneUI design system rules without
re-deriving them.

## Layout

```
src/
  defineComponent.ts          — single chokepoint with typed convenience
  index.ts                    — exports + ALL_COMPONENTS ordered roster
  components/
    JDSButton.ts              — full prop schema, x-jds-suggestion annotations
    JDSSurface.ts             — colour-boundary primitive
    JDSText.ts                — typography primitive
    JDSIcon.ts                — semantic icon primitive
    JDSCard.ts                — composite container with fixed slots
    JDSBottomNav.ts           — variadic 2..5 of TabBarItem
    JDSTabBarItem.ts          — fixed-slots icon + label + optional badge
    JDSSearchBar.ts           — composite input primitive
    JDSInput.ts               — labelled text input
    JDSBanner.ts              — inline status banner
scripts/
  generate-json.mjs           — emits manifest.json + per-component JSON + isolated props schemas
  verify-token-claims.mjs     — build-time gate asserting meta.tokens matches the impl
__tests__/
  JDSButton.schema.test.ts    — AJV compile + validation smoke
```

## For AI agent consumers

The `dist/` artefacts ship a stable contract any AI code-generation tool can
consume:

| Path | Purpose |
|---|---|
| `dist/index.{mjs,cjs,d.ts}` | TS API for callers that prefer typed imports |
| `dist/manifest.json` | `KBManifest` — read at session start for the component roster + `commonKbVersion` cross-SDK drift check |
| `dist/components.json` | Flat array of all metas |
| `dist/components/<Name>.json` | Per-component meta (full) |
| `dist/schemas/<Name>.props.schema.json` | Isolated JSON Schema fragment — AJV-compilable |

See [`packages/kb-core/README.md`](../kb-core/README.md) §  *Tooling that consumes this KB*
for the list of known integrations.

## Build

```bash
pnpm --filter @jds/kb-rn build         # tsup + generate-json
pnpm --filter @jds/kb-rn test          # ajv compile + validation smoke
pnpm --filter @jds/kb-rn verify:tokens # post-build: token-claim integrity gate
```

## Strict peerDep on `@jds/kb-core`

Hybrid drift strategy:

- **(a)** `peerDependencies: { "@jds/kb-core": "5.0.0-wip.0" }` — pinned exact.
- **(b)** `commonKbVersion` stamped on `manifest.json`; consumers cross-verify
  across every installed `@jds/kb-*` package at session start and refuse on mismatch.
- **(c)** lock-step Changesets release in CI keeps every kb-* in sync.
