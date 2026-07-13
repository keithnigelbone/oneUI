# @jds4/oneui-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server for the **One UI / JDS** design system.

It lets an AI coding agent (Claude Code, Cursor, VS Code, Zed, …) build **React (web)**
products that follow OneUI rules: install/update the packages, load design skills, look up
component APIs, tokens, and brands, and ground every decision in the design system.

> **Scope:** v1 = React web only. Native/RN and the A2UI/AG-UI semantic layer come later.
> **Status:** Phases 0–4 shipped — scaffold, lifecycle tools, knowledge/components/brands, validator (`validate_oneui_code`), and the `/oneui-build-from-prd` orchestration prompt.

## Design principles

- **Self-contained & offline.** Knowledge is a versioned snapshot baked into `assets/`.
  No network, no API keys, no LLM calls inside the server.
- **Zero monorepo dependency at runtime.** The published package imports only
  `@modelcontextprotocol/sdk` + `zod`. Project-lifecycle logic is *vendored* (copied) from
  `@jds4/oneui-init`; the snapshot is generated at authoring time and committed.
- **The coding agent is the LLM.** This server supplies facts, rules, and deterministic
  actions — it never generates UI itself.

## Tools

| Group | Tool |
| --- | --- |
| Registry | `check_oneui_registry`, `get_registry_setup` — connect to the private JDS Azure DevOps feed (**run first**) |
| Lifecycle (web) | `setup_oneui_project`, `check_oneui_versions`, `update_oneui_packages` |
| Lifecycle (native) | `create_oneui_native_app` — emit the `create-oneui-native-app` CLI command for the user to run in their terminal |
| Knowledge | `search_design_system`, `list_skills`, `get_skill`, `get_skill_reference`, `get_core_invariants` |
| Components | `list_components`, `get_component_info` |
| Brands | `list_brands`, `get_brand_tokens`, `get_brand_design_spec`, `get_surface_guide` |
| Validator | `validate_oneui_code` — inline-surface-paint, legacy-token, unknown-prop, hardcoded-font (Babel AST) |

Prompt: `/oneui-build-from-prd` — orchestrates the full search → write → validate → self-heal loop.

> **First-time setup:** the `@jds4/*` packages live on a **private Azure DevOps feed**
> (`JIO-DS-ONE-UI`), not public npm. Run `check_oneui_registry` before any install — it
> detects whether your `.npmrc` is connected to the feed and walks you through the
> registry + PAT setup if not. No Personal Access Token is ever baked or written by the MCP.

Read-only resources mirror the snapshot: `oneui://invariants`, `oneui://surface-guide`,
`oneui://registry-setup`, `oneui://skills/{name}`, `oneui://components/{slug}`, `oneui://brands/{slug}`.

## Develop

```bash
npm install            # installs deps and builds (prepare → tsc)
npm run build:snapshot # regenerate assets/ from the monorepo (authoring-time only)
npm run build          # compile src → dist
node scripts/smoke.mjs # local stdio protocol smoke test
```

## Snapshot

`scripts/build-snapshot.mjs` reads monorepo sources and writes `assets/`:

| Asset | Source |
| --- | --- |
| `skills/` + `skills-index.json` | `.claude/skills/*` |
| `invariants.md` | `packages/shared/src/agent/knowledgeSources.ts` (`CORE_INVARIANTS`) |
| `surface-guide.md` | `docs/surface-context-awareness.md` |
| `components/` + `components-index.json` | `docs/components/generated/*.docs.json` |
| `brand-tokens/` + `brands-index.json` | `cdn-dist/brands/*` |
| `brand-specs/` | `docs/exports/*.DESIGN.md` |
| `native/` (components) | `@jds/kb-rn` via `npm run build:native-snapshot` |
| `search-corpus.json` | all of the above |

The published artifact ships `dist/` + `assets/` only.

## Install as a plugin (recommended)

This package also ships as the **`oneui` Claude Code plugin** ("One UI Coding") — one install
bundles the MCP server with 5 agent-native skills, 6 `/oneui:*` slash commands, and an advisory
validator hook. See **[INSTALL.md](INSTALL.md)** for the full guide. Quick start (local path):

```text
/plugin marketplace add /absolute/path/to/starter-mcp
/plugin install oneui
```

Build first so `dist/` exists: `npm install && npm run build:plugin`.

**Commands:** `/oneui:build-from-prd`, `/oneui:prd`, `/oneui:figma-to-native`, `/oneui:setup`,
`/oneui:validate`, `/oneui:install-rules`.

## Registering as a standalone MCP

For Cursor / VS Code / Zed (or without the plugin). See `TESTING.md` / `INSTALL.md`:

```bash
npm install -g ./releases/jds4-oneui-mcp-0.1.0-alpha.9.tgz

# Claude Code
claude mcp add oneui -- oneui-mcp

# Cursor — add to .cursor/mcp.json
# { "mcpServers": { "oneui": { "command": "oneui-mcp", "args": [] } } }
```
