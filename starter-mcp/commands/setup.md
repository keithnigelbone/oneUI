---
name: setup
description: Connect the project to the private JDS feed and bootstrap One UI into it. Runs check_oneui_registry first (detects .npmrc feed connection + guides PAT setup) then setup_oneui_project (installs @jds4/oneui-react + icons + bundler plugin, writes oneui.brands.json). Use when starting a fresh OneUI web project. Manual-only because it installs packages.
disable-model-invocation: true
---

# /oneui:setup

Connect to the JDS feed and bootstrap One UI (web).

## Flow
1. **`check_oneui_registry`** (server `oneui`) — detects whether `./.npmrc` / `~/.npmrc` are connected to the private Azure DevOps feed (`JIO-DS-ONE-UI`). If not connected, follow the returned setup steps (registry + PAT). **Never** paste or log a real PAT into chat.
2. Once connected, **`setup_oneui_project`** — detects framework + package manager, installs `@jds4/oneui-react` + `@jds4/oneui-icons-jio` + the bundler plugin (pinned to highest published versions), and writes `oneui.brands.json`.
3. Wire the provider snippet the tool returns (`<BrandProvider brand="jio">` + the `styles` / icons side-effect imports).

## Inputs the user can give inline
- Brands to seed (default `["jio"]`).
- Whether to actually install (vs dry-run).

## Notes
- For a **new React Native app**, use `create_oneui_native_app` instead — it emits a CLI command for the user to run in their own terminal (the PAT stays out of the MCP).
- `check_oneui_versions` / `update_oneui_packages` keep packages current later.

## Related
- `/oneui:build-from-prd` — build once setup is done.
- `check_oneui_registry`, `setup_oneui_project`, `create_oneui_native_app` MCP tools.
