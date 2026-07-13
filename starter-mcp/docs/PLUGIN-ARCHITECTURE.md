# One UI Coding Plugin — Architecture (canonical)

> **Status:** canonical. Describes the **single-engine** reality: one MCP server
> (`@jds4/oneui-mcp`) owns both front doors (PRD→code and Figma→code), wrapped in one
> installable **plugin** (manifest name `oneui`, distributed as the "One UI Coding" plugin;
> install with `/plugin install oneui`). 
>
> **Supersedes the old two-engine design.** Earlier revisions of this doc described a second,
> external `figma-codegen` deterministic compiler (a Figma Dev-Mode plugin + bridge-server +
> mcp-server shim) for "Flow B". That has been **replaced** by the in-tool `figma_to_code`
> pipeline, which lives entirely inside `@jds4/oneui-mcp` and reuses the public
> `figma-console-mcp` as a spawned child for extraction. There is now **one engine**.
>
> Companion docs: [`FIGMA-TO-CODE.md`](./FIGMA-TO-CODE.md),
> [`ADDING-A-PLATFORM-PACK.md`](./ADDING-A-PLATFORM-PACK.md), [`INSTALL.md`](../INSTALL.md),
> [`CODEGEN-GAP-REPORT.md`](../CODEGEN-GAP-REPORT.md).

---

## 1. What this is, in one paragraph

The **One UI coding plugin** is a single thing a developer installs into their AI coding agent
(Claude Code today; Cursor/VS Code/Zed via MCP config). It helps the agent build **OneUI/JDS-
compliant apps** (React web + React Native) from either of two inputs — a **PRD / text
description** or a **Figma frame** — and *guarantees* compliance by funnelling every output
through one **validation gate**, `validate_oneui_code`. The plugin is a thin **packaging layer**
over `@jds4/oneui-mcp`; the server's offline, self-contained core is unchanged.

---

## 2. The two front doors + the universal gate

Two ways to produce code, **one** way to certify it — both inside the same MCP server:

| | **Flow A — PRD → code** | **Flow B — Figma → code** |
|---|---|---|
| Input | natural-language PRD / description | a Figma Dev-Mode frame (URL + node-id) |
| Method | the **agent authors** code using OneUI knowledge (skills, catalog, brand tokens, surface rules) | the **`figma_to_code` tool** extracts the frame, refines it, downloads assets, and emits a screen file |
| Engine | `@jds4/oneui-mcp` knowledge tools + the `oneui-build-from-prd` prompt | `@jds4/oneui-mcp` `figma_to_code` (spawns `figma-console-mcp` as a child for extraction) |
| Output | platform code (`.tsx` / `.native.tsx`) | platform code written to disk |
| **Gate** | **`validate_oneui_code`** | **`validate_oneui_code`** |

**The gate is the contract.** Whatever produced the code, it is not "done" until
`validate_oneui_code` returns **"All clear."** The gate reads the **installed** runtime
package's released set, so it certifies against the real platform API, not a guess.

---

## 3. System view

```
┌──────────────────────────────────────────────────────────────────────────┐
│ AI coding agent   (Claude Code · Cursor · VS Code · Zed)                   │
└───────────────┬────────────────────────────────────────────────────────────┘
                │ installs ONE plugin  (oneui)
┌───────────────▼────────────────────────────────────────────────────────────┐
│ oneui plugin   (starter-mcp/)                                                │
│   .claude-plugin/{plugin,marketplace}.json   .mcp.json                       │
│   skills/  (oneui, design-composition, surface, surface-context,             │
│             figma-to-native)                                                 │
│   commands/  (/oneui:build-from-prd · prd · figma-to-native · setup ·        │
│               validate)                                                      │
│   hooks/  (PostToolUse → advisory "run the gate" reminder)                   │
│                                                                              │
│   .mcp.json declares ONE MCP server ↓                                        │
│   ┌────────────────────────────────────────────────────────────────────┐   │
│   │ @jds4/oneui-mcp   (node dist/index.js · stdio · OFFLINE core)        │   │
│   │  • knowledge: skills, components, brands, invariants, surface guide  │   │
│   │  • validate_oneui_code  (THE GATE)                                   │   │
│   │  • lifecycle/registry: setup, versions, native-app CLI               │   │
│   │  • figma_to_code  ──────────── spawns ───────────►  figma-console-mcp │   │
│   │                                                     (child, public npm)│  │
│   └────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
                                          figma-console-mcp ↔ Figma Desktop Bridge
```

`figma_to_code` is the only subsystem that reaches the network / spawns a child / needs
`FIGMA_ACCESS_TOKEN` + Figma Desktop. Everything else is offline.

---

## 4. The common core (platform-agnostic — written once)

| Concern | Where | What it does |
|---|---|---|
| MCP framework | `src/server.ts` | registers tools / prompts / resources over stdio |
| Knowledge | `src/tools/{knowledge,components,brands,context}.ts` + `src/lib/snapshot.ts` | serves the baked `assets/` snapshot (offline) |
| **Validator engine** | `src/tools/validate.ts` + `validate/{shared,rules.web,rules.native}.ts` | Babel AST walk; shared rules + platform rule-sets |
| Figma pipeline | `src/lib/{figmaConsole,figmaModesSnippet,figmaRefine,figmaAssets,figmaCodegen}.ts` | extract → refine → download → codegen |
| Registry / lifecycle | `src/lib/{registry,npm,framework,nativeCli}.ts` | private-feed onboarding, install, native-app CLI |
| **Platform seam** | `src/lib/platforms.ts` | the `PlatformPack` registry — the only place platform specifics live |

**Core rule:** platform specifics are *data* (in `platforms.ts` + the per-platform `assets/`
catalog + the installed package's released set), never forked code paths.

---

## 5. The platform-pack seam

A platform is described by a `PlatformPack` entry, not a code fork. Each declares its runtime
package, `node_modules` subdir (for the released-set read), icons package, token syntax, file
extension, and which `assets/` subdir holds its catalog.

| Pack | Status | Runtime pkg | Tokens | Catalog |
|---|---|---|---|---|
| `react` (web) | **supported** | `@jds4/oneui-react` | `var(--Token)` | `assets/components/` |
| `reactnative` | **planned*** | `@oneui/ui-native` | `tokens.*` | `assets/native/components/` |

\* RN component **knowledge is wired** (catalog baked + served), and `figma_to_code` already
emits `@oneui/ui-native`. What remains to flip RN to `supported`: finishing the RN-specific
validator token rules and the new-app lifecycle. See [`ADDING-A-PLATFORM-PACK.md`](./ADDING-A-PLATFORM-PACK.md).

---

## 6. The plugin packaging layer

The plugin adds **distribution + agent-native surfacing** on top of the MCP — no server logic
changes:

- **`.claude-plugin/plugin.json`** — manifest (name `oneui`, version, keywords).
- **`.claude-plugin/marketplace.json`** — marketplace entry; `source: "./"` (the `starter-mcp`
  dir is the plugin root); declares commands + `optionalEnvironment.FIGMA_ACCESS_TOKEN`.
- **`.mcp.json`** — declares the `oneui` server as `node ${CLAUDE_PLUGIN_ROOT}/dist/index.js`.
- **`commands/*.md`** — 5 slash commands that orchestrate existing tools/prompts (thin wrappers).
- **`skills/*`** — the 4 baked knowledge skills (copied from `assets/skills/` by
  `scripts/build-plugin.mjs`) + the plugin-authored `figma-to-native` skill.
- **`hooks/`** — an advisory `PostToolUse` hook reminding the agent to run the gate after writing
  OneUI TSX (non-blocking in v1).

Build: `npm run build` (tsc → `dist/`) → `npm run build:plugin` (assemble + validate the layer).
The package remains independently publishable as `@jds4/oneui-mcp` (`bin: oneui-mcp`).

---

## 7. How a request flows end-to-end

```
FLOW B (Figma → code):
  agent → /oneui:figma-to-native → figma_to_code(url, reactnative, brand, subBrand, codegen:true)
        → (oneui-mcp spawns figma-console child) extract → refine → download assets → codegen
        → writes <Screen>.native.tsx (+ route)
        → validate_oneui_code(code, "reactnative")   [THE GATE]   → "All clear" ✅ (else self-heal)

FLOW A (PRD → code):
  agent → /oneui:build-from-prd → get_core_invariants → search/get_skill → get_component_info
        → get_brand_tokens → AUTHOR code
        → validate_oneui_code(code, platform)         [THE GATE]   → "All clear" ✅
```

Both terminate at the same gate.

---

## 8. Invariants (read before extending)

1. **Every output must pass `validate_oneui_code`.** That is the definition of done.
2. **`@jds4/oneui-mcp` stays offline / self-contained** — baked `assets/` snapshot + a runtime
   read of the installed package. Only `figma_to_code` and the lifecycle/registry tools touch
   the network.
3. **Platform specifics are data, not forked code** — extend via `platforms.ts` + a baked
   catalog + the released set; never branch core behavior.
4. **The plugin is packaging only** — commands/skills/hooks route through existing tools; they
   never reimplement the server.
5. **No secrets baked** — `FIGMA_ACCESS_TOKEN` from env; the JDS-feed PAT flows only through the
   `.npmrc` mechanism (terminal mode keeps it out of the MCP entirely).

---

## 9. Current status

| Piece | Status |
|---|---|
| Knowledge + validator engine (`@jds4/oneui-mcp`) | ✅ shipped |
| React (web) pack | ✅ supported end-to-end (gate + catalog + released set) |
| `figma_to_code` (extract → refine → assets → codegen) | ✅ in-tool; RN codegen active (fidelity gaps tracked in [CODEGEN-GAP-REPORT.md](../CODEGEN-GAP-REPORT.md)) |
| React Native pack | ◑ knowledge wired; validator token rules + new-app lifecycle pending |
| Plugin packaging (manifests, commands, skills, hook) | ✅ this revision |
| Cursor/VS Code/Zed first-class plugin parity | ❌ planned (`.cursor-plugin/` follow-up) |
| External `figma-codegen` two-engine compiler | ⛔ superseded / removed from the architecture |
