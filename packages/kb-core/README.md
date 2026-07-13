# @jds/kb-core

> Shared knowledge-base core. Strict, exact-version peerDep target for every
> `@jds/kb-<sdk>` package.

JDS's vendor-neutral KB. Ships the vocabulary every per-SDK package and every
AI code-generation tool agrees on: 11 colour roles, 7 surface modes, the
typography / spacing / shape / motion / elevation token vocabularies, brand
foundations, structured core invariants, the composition compiler, shared
JSON-Schema fragments, three independent semver stamps, and the per-package
KBManifest shape.

## What ships in `dist/`

| Path | Purpose |
|---|---|
| `dist/index.{mjs,cjs,d.ts}` | TS API surface (types + constants + helpers) |
| `dist/invariants.json` | Structured `CoreInvariants` for non-TS consumers |
| `dist/brands/<slug>.json` | Per-release brand snapshot (produced by `scripts/snapshot-brands.ts`) |
| `dist/brands/_index.json` | Bundle hash + slugs + `brandSetVersion` |

## Three independent version stamps

| Field | Lives on | Bumps when |
|---|---|---|
| `schemaVersion` | every component meta file | KB *shape* contract changes (additive fields = minor; field removal = major) |
| `kbVersion` | per-package `manifest.json` | content changes (component added, token added, schema patch) |
| `brandSetVersion` | per-package `manifest.json` + every `dist/brands/<slug>.json` | brand snapshot bundle changes |

Consumers compare independently:
- `schemaVersion` major mismatch → enter federation / capability-matching mode.
- `kbVersion` minor mismatch → warn on capability divergence, degrade gracefully.
- `brandSetVersion` any change → invalidate the brand cache; re-fetch.

## Hybrid drift strategy

Every `@jds/kb-<sdk>` package depends on this core as:

- **(a) Hard pinned peerDep** — `"@jds/kb-core": "5.0.0-wip.0"` (NOT a caret).
- **(b) Defensive stamp** — every `kb-<sdk>/dist/manifest.json` echoes `commonKbVersion`; consumers assert equality across installed kb-* packages and refuse on mismatch.
- **(c) Lock-step CI publish** — Changesets release in this monorepo bumps every kb-* together. No partial releases.

## Tooling that consumes this KB

The JDS KB exposes structured contracts that any AI code-generation tool can
consume. Tools currently known to integrate:

- **DevLens** (`devlens-mobile-sdlc`) — Jio's design-to-code plugin for Claude
  Code and Cursor. Auto-detects `@oneui/*` projects, inherits brand selection
  from `oneui.config.json`, runs verify loops against the original Figma
  reference. Recommended for Jio app development.
  Install: `claude /plugin install devlens-mobile-sdlc`.
  Repo: <https://github.com/Shireesh1-Shukla_jplgit/Devlens>
  (Jio internal GHE — accessible to anyone discovering this README from inside the Jio EMU SSO.)
- **(others)** — open a PR to be listed.

## Build

```bash
pnpm --filter @jds/kb-core build   # tsup + post-build emit-invariants
pnpm --filter @jds/kb-core test    # vitest smoke + composition compiler + snapshot projection
```

## Surfaces exposed via package `exports`

- `@jds/kb-core` — types + constants + helpers
- `@jds/kb-core/types/*` — individual type modules (deep imports allowed)
- `@jds/kb-core/composition` — the `compileComposition` compiler
- `@jds/kb-core/schemas` — reusable JSON-Schema fragments (forbidden patterns + per-component shared blocks)
- `@jds/kb-core/invariants.json` — the structured invariants as flat JSON
- `@jds/kb-core/brands/<slug>` — per-brand snapshot JSON
- `@jds/kb-core/manifest.json` — the package's KBManifest
