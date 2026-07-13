# Installing the One UI Coding Plugin

The `oneui` plugin (the "One UI Coding" plugin — its manifest name, and therefore its
install name, is `oneui`) bundles the `@jds4/oneui-mcp` server with agent-native skills,
slash commands, and an advisory validator hook. One install gives the agent the whole
capability — knowledge, the `validate_oneui_code` gate, and `figma_to_code`.

> **Plugin root:** the `starter-mcp/` directory (it holds `.claude-plugin/`, `.mcp.json`,
> `commands/`, `skills/`, `hooks/`, and the built `dist/` + `assets/`).

---

## What's in the plugin

| Piece | Count | Where |
|---|---|---|
| MCP server (`oneui`) | 23 tools, 2 prompts, 7 resources (4 fixed + 3 templated) | `dist/index.js` via `.mcp.json` |
| Skills (agent-native) | 5 — `oneui`, `oneui-design-composition`, `surface`, `surface-context`, `figma-to-native` | `skills/` |
| Slash commands | 6 — `/oneui:build-from-prd`, `/oneui:prd`, `/oneui:figma-to-native`, `/oneui:setup`, `/oneui:validate`, `/oneui:install-rules` | `commands/` |
| Hooks | 1 advisory `PostToolUse` validator reminder | `hooks/` |

---

## Prerequisites

- **Node ≥ 18**.
- The `@jds4/*` (web) / `@oneui/*` (native) runtime packages live on the **private
  JIO-DS-ONE-UI Azure DevOps feed** — connect your `.npmrc` first (run `/oneui:setup` →
  `check_oneui_registry`, which walks you through the registry + PAT). No PAT is ever baked
  into the plugin.
- **`figma_to_code` only:** Figma Desktop running with the **Console/Bridge plugin
  connected**, and **`FIGMA_ACCESS_TOKEN`** set in the environment (for image download).
  Do not run a standalone `figma-console` MCP at the same time — the tool spawns its own
  child and a second one competes for the bridge port.

---

## Build (once, before installing locally)

The plugin runs the compiled server at `${CLAUDE_PLUGIN_ROOT}/dist/index.js`, so build it:

```bash
cd starter-mcp
npm install         # installs deps + runs prepare → tsc → dist/
npm run build:plugin  # copies baked skills → skills/ and sanity-checks the manifests
```

`dist/` is `.gitignore`d, so for a **git-source** marketplace you must either commit `dist/`
or run a build step on install. For **local-path** install (below), `dist/` already exists
on disk after the build.

---

## Install — Claude Code (local path, recommended for internal use)

```text
/plugin marketplace add /absolute/path/to/OneUiStudio_Base_v4/starter-mcp
/plugin install oneui
```

The marketplace file is `.claude-plugin/marketplace.json`; the plugin's `source` is `./`
(the `starter-mcp` dir itself). After install, confirm:
- the `oneui` MCP server connects (23 tools list);
- the 5 skills appear;
- `/oneui:build-from-prd`, `/oneui:prd`, `/oneui:figma-to-native`, `/oneui:setup`,
  `/oneui:validate`, `/oneui:install-rules` are available.

Set the Figma token for `figma_to_code` (per your Claude Code env mechanism):

```bash
export FIGMA_ACCESS_TOKEN=figd_...
```

---

## Install — Cursor / VS Code / Zed (MCP only, until plugin parity ships)

These editors don't yet consume the Claude plugin format. Wire the MCP server directly:

```jsonc
// Cursor: .cursor/mcp.json  (VS Code / Zed: their MCP config)
{
  "mcpServers": {
    "oneui": {
      "command": "node",
      "args": ["/absolute/path/to/OneUiStudio_Base_v4/starter-mcp/dist/index.js"],
      "env": { "FIGMA_ACCESS_TOKEN": "figd_..." }
    }
  }
}
```

You get the 23 tools + the 2 MCP prompts (`oneui-build-from-prd`, `oneui-prd`). The skills are
still reachable via the `get_skill` tool. A `.cursor-plugin/` manifest for first-class Cursor
install is a planned follow-up.

---

## Distributing the plugin to others

Two packaged flavors, both produced by `scripts/pack-plugin.mjs` into `releases/`:

### Flavor 1 — self-contained zip (offline, recommended for internal sharing)
```bash
npm run pack:plugin          # → releases/oneui-coding-plugin-<ver>-full.zip
```
Bundles the compiled server (`dist/`) + baked snapshot (`assets/`) + the plugin shell.
Its `.mcp.json` runs the **local** server (`node ${CLAUDE_PLUGIN_ROOT}/dist/index.js`), so it
needs **no registry to run** (only the JDS feed to install `@jds4/*` into the user's app).

Recipient:
```text
unzip oneui-coding-plugin-<ver>-full.zip
/plugin marketplace add ./oneui-coding-plugin
/plugin install oneui
```

### Flavor 2 — thin / npm-backed zip
```bash
npm run pack:plugin:npm      # → releases/oneui-coding-plugin-<ver>-npm.zip
```
Ships only the plugin shell (manifests, commands, skills, hooks) — no `dist/`/`assets/`. Its
`.mcp.json` runs `npx -y @jds4/oneui-mcp`, so the server + snapshot come from the registry at
runtime. **Requires** `@jds4/oneui-mcp` to be published somewhere the recipient's `.npmrc` can
reach (the `@jds4` scope → the JDS feed, or public npm). Smaller (~0.1 MB vs ~0.5 MB) and
auto-updates when a new server version is published.

Recipient (after their `.npmrc` maps the `@jds4` scope):
```text
unzip oneui-coding-plugin-<ver>-npm.zip
/plugin marketplace add ./oneui-coding-plugin
/plugin install oneui
```

> **Which to use?** Offline / pinned / no-publish → **full**. Centrally-published server you want
> everyone to track automatically → **npm**. Both install identically once added.

## Standalone MCP (no plugin)

The package is still independently usable as an npm MCP:

```bash
npm install -g ./releases/jds4-oneui-mcp-0.1.0-alpha.9.tgz
claude mcp add oneui -- oneui-mcp
```

---

## Verify

```bash
cd starter-mcp
node scripts/smoke.mjs   # spawns the server over stdio, lists tools, calls a couple offline
```

Offline check: with the network off, all knowledge/validator tools + skills work; only
`figma_to_code` and the lifecycle/registry tools need network.

---

## Troubleshooting

- **Server doesn't connect** → `dist/index.js` missing; run `npm run build`.
- **`figma_to_code` hangs / no bridge** → ensure Figma Desktop + the Console/Bridge plugin are
  running and only ONE figma-console process exists; check `FIGMA_ACCESS_TOKEN`.
- **`npx figma-console-mcp` 401s** → a project `.npmrc` is pinning a private default registry;
  the child forces the public npm registry, but verify network access on first run.
- **Install/setup blocked** → not connected to the JDS feed; run `/oneui:setup`.
