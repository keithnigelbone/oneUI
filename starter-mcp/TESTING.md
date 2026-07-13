# OneUI MCP — Peer Testing Guide

> **What you're testing:** `@jds4/oneui-mcp` v0.1.0-alpha.9 — an MCP server that plugs into Claude Code / Cursor / VS Code and helps coding agents build OneUI-compliant React apps.

> **Preferred install:** the package also ships as the `oneui` Claude Code **plugin**
> (MCP server + skills + slash commands + validator hook in one install) — see
> [INSTALL.md](INSTALL.md). The standalone-MCP flow below still works and is what
> Cursor / VS Code users should follow.

## 1. Download the package

Grab `starter-mcp/releases/jds4-oneui-mcp-0.1.0-alpha.9.tgz` from the `dev` branch of this repo (raw file download from GitHub works fine).

## 2. Install it globally

```bash
npm install -g /path/to/jds4-oneui-mcp-0.1.0-alpha.9.tgz
```

Verify the binary is available:

```bash
oneui-mcp --version   # prints nothing (stdio server — expected)
```

---

## 3. Register with your IDE

### Claude Code

```bash
claude mcp add oneui -- oneui-mcp
```

Verify it connected:

```bash
claude mcp list
# should show: oneui  oneui-mcp
```

### Cursor

Create or edit `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "oneui": {
      "command": "oneui-mcp",
      "args": []
    }
  }
}
```

Restart Cursor. The MCP indicator in the bottom bar should show it connected.

### VS Code (with MCP extension)

Create `.vscode/mcp.json`:

```json
{
  "servers": {
    "oneui": {
      "type": "stdio",
      "command": "oneui-mcp",
      "args": []
    }
  }
}
```

---

## 4. Try the tools

Open a chat with your AI agent and run through these in order:

### a) Check what's available
```
List the OneUI components available.
```
The agent should call `list_components` and return 37 released components (WIP components like SegmentedControl / WebHeader / Carousel are intentionally excluded).

### b) Read a component API
```
What props does the Button component accept?
```
Agent should call `get_component_info("Button")` and return props, variants, composition rules.

### c) Validate some code

Ask the agent to validate this intentionally broken snippet:

```tsx
// paste this and ask: "validate this with validate_oneui_code"
import { Button } from '@jds4/oneui-react';
export default function Page() {
  return (
    <div style={{ background: 'var(--Primary-Bold)' }}>
      <span style={{ fontFamily: 'Inter', fontSize: 'var(--Typography-Size-M)' }}>Hello</span>
      <Button badProp="x" variant="bold">Submit</Button>
    </div>
  );
}
```

Expected: **5 issues (3 errors, 2 warnings)**, each with a line/column and fix suggestion:

| Line | Rule | Why |
|---|---|---|
| 4 | `inline-surface-paint` (error) | `background: var(--Primary-Bold)` on a raw `<div>` → should be `<Surface mode="bold">` |
| 5 | `hardcoded-font` (error) | literal `'Inter'` typeface → use `var(--Typography-Font-Text)` so it resolves per brand |
| 5 | `legacy-token` (error) | `--Typography-Size-M` → use the role-explicit `--Body-M-FontSize` |
| 6 | `unknown-prop` (warning) | `badProp` is not a valid `Button` prop |
| 6 | `unknown-prop` (warning) | `variant` is not a valid **web** `Button` prop either — the web Button API uses `attention`/`appearance` (the native Button has `variant`) |

Then confirm a **clean** snippet passes — this should return "All clear":

```tsx
import { BrandProvider, Surface, Button, Text } from '@jds4/oneui-react';
export default function Page() {
  return (
    <BrandProvider brand="jio">
      <Surface mode="bold">
        <Text variant="title" size="M" attention="high">Welcome</Text>
        <Button attention="high">Continue</Button>
      </Surface>
    </BrandProvider>
  );
}
```

> The `hardcoded-font` check enforces JioType-via-token: every text element must route its
> font through a token (`--Typography-Font-Text` / `--Typography-Font-Heading` or a role
> `--*-FontFamily`), never a literal typeface. A literal would pin the font and break brand
> switching. It also warns (`missing-font-family`) when an inline style sets `fontSize` but no
> font token.

### d) Connect to the JDS feed (first-time / new app)

In a **real test app** (not just the MCP), ask the agent to set up OneUI. It should call
`check_oneui_registry` first, because `@jds4/*` lives on a private Azure DevOps feed:

```
Set up OneUI in this project.
```

- **Already connected** (your `.npmrc` points at `JIO-DS-ONE-UI` with a valid PAT) → status
  `connected`, the agent proceeds to install.
- **New to JDS** → status `registry-no-auth` / `not-configured`. The agent should write the
  project `./.npmrc`, point you to create a PAT (Packaging read & write), and show the
  `~/.npmrc` auth block to paste your Base64 token into. It must **not** invent or write a token.
- **No feed access at all** → the agent asks if you can open the feed connect page; if not, it
  stops and routes you to the DS/platform team.

`setup_oneui_project` won't blindly run a doomed install — if you're not connected it reports
`SKIPPED` and points you at `check_oneui_registry`.

### e) Build from a PRD

Use the `/oneui-build-from-prd` prompt in Claude Code:

```
/oneui-build-from-prd
```

Fill in a short PRD like:
> "Login screen with email + password fields, a primary CTA button, and a 'Forgot password' link. Jio brand."

The agent should call `get_core_invariants`, search the knowledge base, pick components, write TSX, run `validate_oneui_code`, and self-heal any issues before returning the final code.

---

## 5. What to look for / report back

| Area | What to check |
|---|---|
| Install | Did `npm install -g` work cleanly? Any peer dep warnings? |
| Registration | Did `claude mcp add` / Cursor config connect without errors? |
| `check_oneui_registry` | Does it correctly detect your feed status (connected / registry-no-auth / not-configured)? Are the PAT + .npmrc steps clear? |
| `list_components` | Do you see 37 *released* components (no WIP like SegmentedControl/WebHeader/Carousel)? Is the intent useful? |
| `list_skills` | Do you see 4 baked skills: `oneui`, `oneui-design-composition`, `surface`, `surface-context`? (The plugin install adds a 5th, `figma-to-native`.) |
| `validate_oneui_code` | Does the WRONG snippet above produce all 5 issues (incl. `hardcoded-font`)? Does the clean snippet pass? |
| WIP components | Importing a WIP component (e.g. `WebHeader`, `SegmentedControl`) from `@jds4/oneui-react` should be flagged `non-released-component`. The released set auto-syncs to your installed package version. |
| Font handling | Ask the agent to build a Jio screen — does generated text use a font token (not a literal), so labels render in JioType Var? |
| Icons | Generated code should use only `<Icon icon="..." />` from `@jds4/oneui-icons-jio` — no hugeicons-react / lucide-react / @phosphor etc. (validator flags `external-icon-import`). |
| `/oneui-build-from-prd` | Does the agent follow the 8-step flow? Does the final TSX pass validation? |
| Any hallucinated tool names | Agent should not call tools that don't exist |
| Cold start | First response should feel instant (< 1s) |

Please share feedback in the PR or directly.

---

## Removing / resetting

```bash
npm uninstall -g @jds4/oneui-mcp

# Claude Code:
claude mcp remove oneui
```
