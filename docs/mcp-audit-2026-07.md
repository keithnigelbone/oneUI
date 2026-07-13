# OneUI MCP (`starter-mcp/`) — Audit & Code Review, July 2026

**Subject:** `@jds4/oneui-mcp` v0.1.0-alpha.9 — the OneUI/JDS MCP server, also shipped as the
`oneui` Claude Code plugin ("One UI Coding").
**Branch:** `mcp/audit-hardening` (all fixes referenced below live on this branch).
**Method:** three parallel deep-dives (core server + plugin packaging · Figma design-translation
pipeline · setup/docs/adoption), findings verified against the code, highest-risk items fixed
on this branch, the rest ranked into the backlog below.

---

## 1. Executive summary

The MCP is **architecturally sound**: strict TypeScript, zod input schemas on every tool,
correct stdio hygiene (stderr-only logging), path-traversal guards on snapshot reads, an
offline-first knowledge snapshot with zero runtime monorepo dependency, and a clean
platform-pack seam for future targets. The Figma pipeline's core insight — that OneUI's
`appearance`/`surface` variable-collection *modes* are only readable via the Plugin API, so a
bridge is mandatory — is well-executed.

What undermined it was **everything around the code**: zero automated tests (the smoke test
asserted nothing), a documented install command that has never worked (`/plugin install
oneui-coding` vs manifest name `oneui`), stale counts and a materially wrong TESTING.md, a
personal filesystem path shipped in the published snapshot, a snapshot build script that
silently **destroys** the committed knowledge base when run from a fresh checkout, a latent
semver bug that would have pinned every consumer to `alpha.9` forever starting with the *next*
release, and misleading success messaging in the highest-visibility tool (`figma_to_code`
claiming images are wired when zero downloaded).

This branch fixes all of the above (§5). The remaining risks are ranked in §6 — the top three
backlog items are the PAT echo in `create_oneui_native_app`, the unpinned third-party
`figma-console-mcp@latest` execution path, and a shared-secret handshake for the WS bridge.

---

## 2. What the MCP is (inventory)

| Piece | Count / detail |
|---|---|
| **Tools** | **23** across 7 groups — registry (2: `check_oneui_registry`, `get_registry_setup`), lifecycle web (3: `setup_oneui_project`, `check_oneui_versions`, `update_oneui_packages`), lifecycle native (1: `create_oneui_native_app`), knowledge (6: `search_design_system`, `list_skills`, `get_skill`, `get_skill_reference`, `get_core_invariants`, `get_prd_template`), components (2: `list_components`, `get_component_info`), context (1: `get_project_context`), brands (4: `list_brands`, `get_brand_tokens`, `get_brand_design_spec`, `get_surface_guide`), validator (1: `validate_oneui_code`), Figma (3: `ensure_figma_bridge`, `figma_download_images`, `figma_to_code`) |
| **Prompts** | 2 — `oneui-build-from-prd` (full search→write→validate→self-heal orchestration), `oneui-prd` |
| **Resources** | 7 — 4 fixed URIs (`oneui://invariants`, `surface-guide`, `registry-setup`, `prd-template`) + 3 templates (`skills/{name}`, `components/{slug}`, `brands/{slug}`) |
| **Skills** | 4 baked (`oneui`, `oneui-design-composition`, `surface`, `surface-context`) + 1 plugin-authored (`figma-to-native`) |
| **Slash commands** | 6 — `/oneui:build-from-prd`, `prd`, `figma-to-native`, `setup`, `validate`, `install-rules` |
| **Hooks** | 2 — `SessionStart` (installs the workflow rule, best-effort) + `PostToolUse` advisory validator reminder (never blocks) |
| **Snapshot** | 1.4 MB baked `assets/`: 37 web + 44 native component catalogs, 5 brands (tokens + DESIGN.md specs), invariants, surface guide, 49-entry search corpus. Web generated 2026-07-01, native 2026-07-02 (kb-rn 12.0.0) |
| **Code** | ~8.4k LOC TS in `src/`, strict mode, deps only `@modelcontextprotocol/sdk`, `zod`, `ws`, `@babel/parser` |
| **Distribution** | npm tarball (`releases/*.tgz`) · Claude Code plugin via local-path marketplace · two packed zip flavors (full = esbuild bundle + assets, offline; npm = thin `npx` shell) |
| **CI** | `.github/workflows/starter-mcp.yml` (path-filtered, self-hosted): install → build → **unit tests** → **asserting smoke** (the last two added by this branch) |

**Not in the pnpm workspace** — standalone npm package; `pnpm test` at repo root does not cover
it. Its own CI workflow is the only gate.

---

## 3. Architecture (as verified)

### 3.1 Two front doors, one gate

- **Flow A (PRD → code):** the agent authors code from the baked knowledge (skills, catalog,
  brand tokens) driven by the `oneui-build-from-prd` prompt.
- **Flow B (Figma → code):** `figma_to_code` extracts → refines → downloads assets → generates
  a `.native.tsx` + expo-router route.
- **Both** funnel through `validate_oneui_code` (Babel-AST + line rules, platform-branched
  web/native rule-sets, catalog-driven unknown-prop detection, released-set gating that
  auto-syncs to the installed package).

### 3.2 Figma pipeline

```
figma_to_code(figmaUrl, platform, brand, subBrand)
  → ensureBridge()                       preflight, fail fast
  → buildModesSnippet(nodeId)            Plugin-API snippet string
  → executeSnippet()                     eval'd inside the Figma plugin VM
      backend A (default): spawned figma-console-mcp child, WS 9223–9232
      backend B (ONEUI_FIGMA_BRIDGE_OWN=1): own WS server 9333–9342
  → refineExtraction()                   component matching, spacing→token keys,
                                         typography, icon harvest, heuristics
  → downloadImages()                     REST /v1/images (token-only) + local fallback
  → generateNativeScreen()               1,505-LOC codegen → .native.tsx + route
```

The bridge exists because `resolvedVariableModes` (the `appearance`/`surface` modes) is
Plugin-API-only. Two backends coexist: the third-party `figma-console-mcp` child (default) and
the OneUI-owned bridge (gated). Feature parity gap: `includeRawTree` only works on the
figma-console backend.

### 3.3 Snapshot supply chain

`scripts/build-snapshot.mjs` reads six monorepo sources (`.claude/skills/`, CORE_INVARIANTS,
`docs/surface-context-awareness.md`, `docs/components/generated/*.docs.json`,
`cdn-dist/brands/*`, `docs/exports/*.DESIGN.md`) plus a hand-vendored released-components list.
Regeneration is **manual** — nothing in CI detects drift between the baked snapshot and the
live design system (see finding M-4).

---

## 4. Adoption assessment

A new web developer traverses **~12–14 manual steps** to first success. The critical path is
the private Azure DevOps feed: PAT creation → base64 encode → four placeholder substitutions
across two host forms in `~/.npmrc`. One mismatch silently 401s. This is the highest real-world
stuck point and was compounded by docs that had drifted from reality:

- The **recommended install command did not work** (`/plugin install oneui-coding`; the
  manifest name — what `/plugin install` keys on — is `oneui`). Fixed on this branch.
- **TESTING.md** pointed peer testers at a dead branch, listed a skill that no longer ships,
  omitted two that do, and its "clean" validation snippet was itself invalid (web `Button` has
  no `variant` prop — the web API is `attention`/`appearance`; native `Button` has `variant`
  but no `label`). A tester following it verbatim reports false failures. Fixed.
- **Zero monorepo discoverability**: no mention of the MCP in the root `README.md`,
  `CLAUDE.md`, `AGENTS.md`, or `docs/` (this report is the first). A new team member browsing
  the repo would not learn the MCP exists (backlog A-1).

---

## 5. Fixed on this branch (`mcp/audit-hardening`)

| # | Commit | What & why |
|---|---|---|
| 1 | `chore(mcp)` lockfile + `npm ci` | No committed lockfile → non-reproducible CI installs. Root `.gitignore` swallows `package-lock.json`; re-included via `starter-mcp/.gitignore`. |
| 2 | `test(mcp)` vitest harness | **0 → 69 unit tests** (URL parsing, snapshot traversal guards, search ranking, web+native validator rules, figmaRefine mapping, asset matching, bridge origin policy, npm helpers) + the smoke test now **asserts** (exact 23-tool set, prompts, resources, server name/version, non-error offline calls; 60s watchdog) and CI runs `npm test`. |
| 3 | `fix(mcp/docs)` | Install name `oneui-coding`→`oneui`; tool count 21→23 and command count 5→6 everywhere; TESTING.md refresh (branch, counts, skills, both snippets); license `PROPRIETARY`→`UNLICENSED` aligned; dead links in `STARTER-MCP-PLUGIN-PLAN.md` de-linked and the doc marked historical. `build:plugin` now **fails** on any "N tools"/"N slash commands" prose drift and on version/license mismatch across the three manifests — the counts police themselves from now on. |
| 4 | `fix(mcp)` version single-sourcing | `SERVER_VERSION` was hardcoded in `src/server.ts` (4 places total held the version). Now read from `package.json` via a layout-independent walk-up; verified in both the compiled and esbuild-bundled layouts. |
| 5 | `fix(mcp/assets)` redaction + snapshot preflight | Personal machine path (`/Users/…/OneUIColourTool 2/…`, `~/Downloads/…`) shipped in `assets/surface-guide.md` + `search-corpus.json`; redacted in the source doc and both generated copies. **Worse finding while fixing:** `build-snapshot.mjs` starts by `rmSync`-ing the *entire* committed `assets/`, then rebuilds — but `cdn-dist/brands` isn't committed, so a naive run on a fresh checkout destroyed the brands, component catalog, and skills (reproduced during this audit). A preflight now verifies all sources and aborts *before* any destruction. |
| 6 | `fix(mcp/figma)` image pipeline | Closes Gap 1 of `CODEGEN-GAP-REPORT.md`: `/v1/images` + per-image downloads retry on transient failures; nodes that can't be downloaded are matched against files already in `assetsDir` (exact previous-run names, then slug-prefix hand-placed files); and `figma_to_code` no longer *unconditionally* claims "each Image/Avatar node already has `props.src` set" — the claim is emitted only when every image node has a local asset, otherwise each missing node is listed with the exact filename to drop in. |
| 7 | `fix(mcp/lifecycle)` spawn + semver | `update_oneui_packages` spawned `cmd.split(' ')` — now argv arrays end-to-end with strict npm-name validation on user-supplied packages. **Latent release-blocker found by the new tests:** `compareSemver` compared prerelease parts lexicographically, so `alpha.10` ranked *below* `alpha.9` — the very next `@jds4/*` release would have been invisible to `setup_oneui_project`/`update_oneui_packages`, pinning every consumer to alpha.9. Fixed per semver §11.4 with regression tests. |
| 8 | `fix(mcp/bridge)` WS hardening | Browser pages can open `ws://127.0.0.1:<port>` regardless of same-origin policy and, with last-write-wins socket adoption, feed forged extraction into codegen. Now: non-loopback addresses rejected, `http(s)` Origins that aren't figma.com rejected (the plugin iframe sends no/`null` Origin and keeps working), 2 MB `maxPayload`, message-shape validation. |
| 9 | `docs(mcp)` gap report reconciled | Typography + corner-radius gaps were already fixed in the pipeline but the report still claimed them open; annotated with current status, original analysis preserved. |

### 5.1 Second pass — backlog items also fixed on this branch

The contained, low-risk backlog items were implemented in the same branch (test count is now **75**):

| Ref | Commit | What & why |
|---|---|---|
| H-1 | `fix(mcp/lifecycle)` PAT no-echo | `create_oneui_native_app` `mode:"ai"` printed the base64 PAT verbatim in the tool result (→ agent transcript/logs). Now both auth files are written to disk and step 3 is a single `mv` of a staged scoped `.npmrc`; the visible preview is token-redacted. `strict-ssl=false` retained pending confirmation of the feed's TLS (see M-6 below). |
| H-2 | `fix(mcp/figma)` pin figma-console | `npx -y figma-console-mcp@latest` → pinned `@1.34.0` (today's behavior unchanged; no more unreviewed upstream drift on cold start). Still overridable via `ONEUI_FIGMA_CONSOLE_PACKAGE`. |
| M-2 | `fix(mcp/snapshot)` skill-drift warning | `build-snapshot.mjs` now captures the prior skill names before the wipe and prints an added/removed diff after re-baking, so a regen can't silently ship the wrong skill set. (The allowlist itself still needs reconciling by whoever runs the next regen with `cdn-dist` present — the warning makes that unmissable.) |
| M-5 | `docs` discoverability | The MCP is now referenced from the root `README.md` (new "AI coding (MCP plugin)" section + doc rows) and `CLAUDE.md` Project Knowledge, linking `INSTALL.md` and this report. |
| L-4 | `fix(mcp/validate)` iterative walkAST | The recursive AST walker could stack-overflow and crash `validate_oneui_code` on a pathologically deep file. Rewritten as an explicit-stack iterative DFS (same pre-order/sibling visit order); test walks a 50k-deep tree without throwing. |

---

## 6. Findings & remediation backlog (ranked)

> **Status:** H-1, H-2, M-2, M-5, and L-4 were **fixed on this branch** (§5.1) — struck through
> below with the resolution. What remains open is M-1, M-3, M-4, M-6, and L-1/L-2/L-3/L-5.

### High

- ~~**H-1 · PAT echoed into the agent transcript.**~~ **FIXED (§5.1).** The tool now writes
  both auth files to disk and returns a token-redacted preview + a single `mv`; the base64 PAT
  no longer appears in the tool result. Follow-on **M-6** covers the `strict-ssl=false` part.
- ~~**H-2 · Unpinned third-party code execution.**~~ **FIXED (§5.1).** `figma-console-mcp`
  pinned to `@1.34.0`. The strategic follow-on remains open: promote the OneUI-owned bridge
  (gated behind `ONEUI_FIGMA_BRIDGE_OWN=1`) to default and drop the third-party dependency
  entirely — this also closes the `includeRawTree` parity gap by design rather than accident.

### Medium

- **M-1 · Bridge local-process impersonation.** After this branch's hardening, a malicious
  *local* process can still connect to the own-bridge WS and impersonate the plugin (or, in
  the other direction, a rogue local WS server on 9333–9342 can capture the plugin, which
  connects to **every** live port in the range and `eval`s whatever arrives —
  `figma-bridge-plugin/ui.html` + `code.js`). *Fix sketch:* server mints a session token,
  `ensure_figma_bridge` surfaces it, user pastes it into the plugin UI once per session;
  plugin echoes it in `HELLO` and the server drops unauthenticated sockets; the plugin should
  also connect to at most one verified server, not broadcast to all. *(Deferred — needs a
  plugin-UI change; kept out of the audit branch to avoid altering field UX.)*
- ~~**M-2 · Skills allowlist drift.**~~ **PARTIALLY FIXED (§5.1).** `build-snapshot.mjs` now
  prints a loud added/removed diff on any skill-set change at regen time. Still open: the
  allowlist itself (`['oneui','design-composition','surface-context','figma-to-native']`) does
  not match the committed baked names (`oneui, oneui-design-composition, surface,
  surface-context`) — reconcile it against `.claude/skills/` when running the next regen with
  `cdn-dist` present (the warning now makes any drift unmissable).
- **M-3 · Stale committed release artifact.** `releases/jds4-oneui-mcp-0.1.0-alpha.9.tgz`
  (tracked despite `*.tgz` being gitignored) predates every fix on this branch. Cut
  `0.1.0-alpha.10` (the semver fix in §5 commit 7 makes the resolver actually see it) and
  refresh the tarball + packed zips as one release action. There is **no publish CI** —
  packaging is manual; consider a tag-triggered job that builds, tests, packs both flavors, and
  attaches artifacts. *(Release action — for the maintainer, not a code change.)*
- **M-4 · No snapshot-drift detection.** The baked catalog is only as fresh as the last manual
  `build:snapshot`. A cheap CI signal: a job on the *monorepo* side that hashes the six source
  inputs and fails (or notifies) when they diverge from a hash stamped into
  `assets/manifest.json`. The vendored released-components list (`scripts/released-components.mjs`
  vs `packages/ui/src/registry/releasedComponents.ts`) deserves the same check —
  a WIP component leaking into the released set defeats the validator's core promise.
- **M-6 · `strict-ssl=false` in the generated native `.npmrc`** (`src/lib/nativeCli.ts`).
  Disabling TLS verification for a *credentialed* feed invites a MITM on the PAT. Retained for
  now because it may be load-bearing for the feed's corporate TLS setup (self-signed cert /
  proxy) — confirm whether it is actually required and remove it if not. Split out of H-1
  because it needs environment knowledge this audit couldn't verify.
- ~~**M-5 · Zero monorepo discoverability.**~~ **FIXED (§5.1)** — MCP now referenced from root
  `README.md` + `CLAUDE.md`, linking `INSTALL.md` and this report.

### Low

- **L-1 · `figmaCodegen.ts` monolith (1,505 LOC).** Registry, prop validation, typography
  mapping, layout, absolute positioning, scroll wrapping, footer splitting, and file I/O in
  one file. It works and is now partially test-covered upstream (refine), but each new Figma
  pattern lands another special case. Split along the existing stage seams (registry/props ·
  text · layout/absolute · emit/io) before the next feature, not after.
- **L-2 · Heuristic watch-list.** The visual-drift hot spots are name/geometry heuristics:
  `looksLikeHorizontalNav` (w/h ≥ 2.5 + all-Text), `groupHorizontalRuns`, `splitAbsolute`'s
  geometric-overlap fallback, `hasDarkeningScrim`/`overlayDark`, `FULL_SPAN_PX = 320`,
  fontSize buckets. Each is individually reasonable; collectively they're where per-screen
  fidelity bugs will keep coming from. When one misfires, prefer adding extract-stage signal
  (real Figma properties) over widening the heuristic.
- **L-3 · Two snapshot-version schemes.** Web manifest `snapshotVersion: 0.1.0` vs native
  `1.0.0`, and `designSystem.version: "1"` is uninformative. Unify and stamp something
  traceable (source commit hash, generation date is already there).
- ~~**L-4 · `validate/shared.ts` `walkAST` recursion**~~ **FIXED (§5.1)** — rewritten as an
  iterative explicit-stack DFS; a pathological file can no longer stack-overflow the tool.
- **L-5 · Vendored `figma-codegen-mcp/` at repo root** (113 files, ~14.5k LOC, WS 3002/HTTP
  3001 two-engine design). Zero references anywhere; `docs/PLUGIN-ARCHITECTURE.md` explicitly
  supersedes it. **Kept intentionally per owner decision** — noted here so nobody mistakes it
  for the live pipeline; the only unique IP inside is the SDL component JSONs and the
  Compose/SwiftUI generators under `plugin/src/`.

---

## 7. Quality gates now in place (how to keep it green)

```bash
cd starter-mcp
npm ci                  # reproducible install (lockfile committed)
npm run build           # tsc strict
npm test                # 75 unit tests (vitest)
node scripts/smoke.mjs  # MCP protocol assertions: 23 tools by name, 2 prompts,
                        #   4 fixed resources + 3 templates, name/version, tool calls
npm run build:plugin    # manifest consistency: names, versions, licenses,
                        #   "N tools"/"N slash commands" prose claims
npm run pack:plugin     # full-flavor bundle (proves bundled-layout version resolve)
```

All of the above run in CI (`starter-mcp.yml`) except the pack step. The intentional friction:
**adding/removing a tool now fails smoke + build:plugin** until `scripts/expected-tools.mjs`
and the docs are updated together — count drift can't silently return.

Guardrails to respect:

- **Never run `npm run build:snapshot` outside the monorepo with `cdn-dist/` present** — the
  preflight will stop you, but the underlying wipe-then-rebuild design remains (see M-2 before
  the next regen).
- Web `Button` has **no `variant`** prop; native `Button` has no `label`. The validator
  catalogs are the source of truth, not muscle memory from the other platform.

---

## 8. Verdict

**Adopt-ready.** Both High findings (H-1 PAT echo, H-2 unpinned execution) plus the contained
Medium/Low items (M-2, M-5, L-4) are now fixed on this branch alongside the original nine — 75
tests, all gates green. The one remaining pre-adoption action is a **release action, not a code
change**: cut `0.1.0-alpha.10` and refresh the committed tarball/zips (M-3), now unblocked by
the semver fix. What stays open is deliberately deferred: the bridge auth token (M-1, needs a
plugin-UI change), snapshot-drift CI (M-4, monorepo-side), the `strict-ssl` question (M-6, needs
feed-TLS knowledge), and the codegen refactor (L-1). The foundation was always good; the failure
pattern was *process* (no tests, no consistency checks, manual snapshot/publish) rather than
design — and the new self-policing gates convert most of that class of regression from "silent"
to "CI-red".
