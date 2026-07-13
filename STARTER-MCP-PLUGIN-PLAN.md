# Plan: Ship `starter-mcp` as a OneUI Coding **Plugin**

> **Status: HISTORICAL (executed).** This plan was implemented — the plugin layer now lives
> in-place inside `starter-mcp/` (`.claude-plugin/`, `.mcp.json`, `commands/`, `skills/`,
> `hooks/`). The canonical description of the shipped architecture is
> [`starter-mcp/docs/PLUGIN-ARCHITECTURE.md`](./starter-mcp/docs/PLUGIN-ARCHITECTURE.md).
> The companion analysis doc (`STARTER-MCP-ANALYSIS.md`) and the `devlens-handoff/` reference
> plugin mentioned below have since been removed from the repo — those references are kept
> as plain text for historical context only. The vendored `figma-codegen-mcp/` directory at
> repo root is the superseded two-engine predecessor, kept intentionally for reference.
>
> **Goal:** turn `@jds4/oneui-mcp` (today: a raw MCP server you hand-wire with `claude mcp add`)
> into a **one-install agent plugin** for Claude Code (and Cursor) that bundles the MCP server +
> agent-native skills + slash commands + a validator hook.
> **Companion:** `STARTER-MCP-ANALYSIS.md` (current-state analysis; removed).
> **Reference template:** the in-repo `devlens-handoff/` plugin (removed) — already a
> working `.claude-plugin` + `.mcp.json` + `commands/` + `skills/` + `agents/` + `hooks/` bundle.

---

## 1. Why (the problem this solves)

The server already does the hard part (offline knowledge, the validator gate, `figma_to_code`). What
it lacks is **distribution and agent-native surfacing**:

| Today (MCP only) | After (plugin) |
|---|---|
| `npm i -g *.tgz` then `claude mcp add` / hand-edit `.cursor/mcp.json` | one `/plugin install` from a marketplace |
| skills reachable only via `get_skill` tool calls | skills auto-loaded as agent-native, model-invocable |
| only the 2 MCP prompts as commands | first-class `/oneui:*` slash commands |
| validator gate runs only when the agent remembers | a `PostToolUse` hook can auto-run the gate |
| no declared prerequisites / env | manifest declares Node, `FIGMA_ACCESS_TOKEN`, Figma Desktop |

**Critical constraint preserved:** the MCP core stays **offline + self-contained**. The plugin is a
packaging layer; it does not change the server's runtime contract (§7 invariant).

---

## 2. Target layout

Create a plugin root. Two viable homes — **decision needed** (§9 Q1):
- **(A)** in-place: add plugin scaffolding *inside* `starter-mcp/` (the npm package and the plugin
  ship together).
- **(B)** sibling: a new `oneui-plugin/` dir at repo root that *references* the built `starter-mcp/dist`
  (mirrors how `devlens-handoff/` wraps `packages/devlens-core`).

Recommended: **(A) in-place** — fewer moving parts, the snapshot/`assets` and `dist` are already in the
package, and `${CLAUDE_PLUGIN_ROOT}` can point straight at `dist/index.js`.

```
starter-mcp/                         ← plugin root (CLAUDE_PLUGIN_ROOT)
├── .claude-plugin/
│   ├── plugin.json                  ← manifest (name, version, author, keywords)
│   └── marketplace.json             ← marketplace entry (for /plugin marketplace add)
├── .mcp.json                        ← declares the "oneui" MCP server (node dist/index.js)
├── commands/                        ← slash commands (.md with frontmatter)
│   ├── build-from-prd.md            ← wraps the existing /oneui-build-from-prd prompt
│   ├── prd.md                       ← wraps /oneui-prd
│   ├── figma-to-native.md           ← NEW: drives figma_to_code (RN) → validate loop
│   ├── setup.md                     ← check_oneui_registry → setup_oneui_project
│   └── validate.md                  ← validate_oneui_code on the current file/selection
├── skills/                          ← agent-native skills (copied from baked assets/skills)
│   ├── oneui/ · oneui-design-composition/ · surface/ · surface-context/
│   └── figma-to-native/             ← NEW skill (the RN extract→map→generate→validate chain)
├── hooks/
│   ├── hooks.json                   ← PostToolUse → run the validator gate on written TSX
│   └── scripts/validate-on-write.mjs
├── src/ · dist/ · assets/ · scripts/ · docs/   ← unchanged MCP package
└── package.json                     ← unchanged (still publishable as @jds4/oneui-mcp)
```

Cursor parity (optional, later): add `.cursor-plugin/` mirroring `.claude-plugin/` — devlens carries
both. v1 targets Claude Code; Cursor users keep the manual `.cursor/mcp.json` path until then.

---

## 3. Deliverables

### A. `.claude-plugin/plugin.json` (manifest)
Mirror devlens's. Fields: `name: "oneui-coding"`, `description` (knowledge + validator gate +
figma→code for OneUI/JDS, React web + React Native), `version` (track the MCP — start `0.1.0`),
`author`, `license: "PROPRIETARY"`, `keywords`.

### B. `.claude-plugin/marketplace.json`
Single-plugin marketplace entry (devlens has both a root `marketplace.json` and the plugin entry).
Include: `commands` list (the `/oneui:*` set), `requires: { node: ">=18.0.0" }`, and
`optionalEnvironment`:
- `FIGMA_ACCESS_TOKEN` — required only for `figma_to_code` image download.
- (document Figma Desktop + the bridge plugin as a runtime prerequisite for `figma_to_code`.)

### C. `.mcp.json` (server declaration)
```json
{
  "mcpServers": {
    "oneui": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/dist/index.js"],
      "env": {}
    }
  }
}
```
`${CLAUDE_PLUGIN_ROOT}` resolves to the installed plugin dir — same pattern devlens uses for its core
CLI. Requires `dist/` to be built & shipped in the plugin (it already is; `prepare` runs `tsc`).

### D. Slash commands (`commands/*.md`)
Markdown files with frontmatter (`name`, `description`, optional `disable-model-invocation: true` for
heavy ones), following devlens's `commands/build.md` shape. They are thin orchestration wrappers over
existing tools/prompts — **no new server logic**:
1. **`/oneui:build-from-prd`** — invoke the `oneui-build-from-prd` MCP prompt.
2. **`/oneui:prd`** — invoke the `oneui-prd` MCP prompt.
3. **`/oneui:figma-to-native`** — guided: `figma_to_code(platform:reactnative, codegen:true)` → then
   `validate_oneui_code(platform:native)` → self-heal. (Encodes the workflow this branch has been
   debugging.) Mark `disable-model-invocation: true` (heavy, needs Figma Desktop).
4. **`/oneui:setup`** — `check_oneui_registry` → `setup_oneui_project`.
5. **`/oneui:validate`** — run `validate_oneui_code` on the active file/selection.

### E. Skills (`skills/`)
The 4 baked skills already live in `assets/skills/`. Two options — **decision needed** (§9 Q2):
- **(A)** copy them into a top-level `skills/` at plugin-build time (a small script), so the agent
  loads them natively **and** the MCP still serves them via `get_skill`.
- **(B)** symlink / reference `assets/skills/`.
Recommended **(A) copy** (symlinks are fragile across install mechanisms). Add a `build:plugin-skills`
npm script that copies `assets/skills/*` → `skills/*`.
- **NEW `skills/figma-to-native/SKILL.md`** — the RN extract→map→generate→validate chain, with the
  semantic-mapping reference tables (Figma size tokens → KB enums, attention→variant, surface modes,
  a11y string defaults). Encodes the hard-won fixes from `figmaCodegen.ts`/`figmaRefine.ts`. Defer to
  `surface` / `surface-context` rather than duplicating.

### F. Validator hook (`hooks/hooks.json` + script)
A `PostToolUse` hook that, after the agent writes a `.tsx`/`.native.tsx`, runs the validator gate and
surfaces issues inline — automating the "always validate" rule the prompt currently asks the agent to
remember. Mirror devlens's `hooks/` (a `hooks.json` mapping events → `${CLAUDE_PLUGIN_ROOT}/hooks/
scripts/*.mjs`). The script shells the gate (e.g. a tiny stdio call to the server, or a CLI shim).
Keep it **advisory** (non-blocking) in v1 to avoid fighting the agent mid-edit.

### G. Docs
1. **Rewrite [docs/PLUGIN-ARCHITECTURE.md](starter-mcp/docs/PLUGIN-ARCHITECTURE.md)** — it describes
   the superseded two-engine (oneui-mcp + external figma-codegen) design. Replace with the **single
   engine** reality (oneui-mcp owns Flow A *and* Flow B via in-tool `figma_to_code`) + this plugin
   packaging.
2. **New `INSTALL.md`** — `/plugin marketplace add` → `/plugin install oneui-coding`, env setup
   (`FIGMA_ACCESS_TOKEN`), Figma Desktop prerequisite, and the private-feed `.npmrc` note.
3. Update `README.md` "Registering with a coding agent" to lead with the plugin install.

---

## 4. What does NOT change (guardrails)

- **No change to `src/` server logic** — the plugin is pure packaging. Tools, prompts, resources,
  the snapshot, and the platform-pack seam stay exactly as analyzed.
- **MCP stays offline/self-contained** — `dist/` + `assets/` only; the published `@jds4/oneui-mcp`
  npm package remains independently installable (`bin: oneui-mcp`).
- **Secrets** — no PAT/token is ever baked into the plugin; `FIGMA_ACCESS_TOKEN` is read from the
  environment, the JDS feed PAT flows through the existing `.npmrc` mechanism only.
- **The gate is still the contract** — commands and the hook route through `validate_oneui_code`;
  they don't reimplement validation.

---

## 5. Critical files

| File | Action |
|---|---|
| `starter-mcp/.claude-plugin/plugin.json` | **new** — manifest |
| `starter-mcp/.claude-plugin/marketplace.json` | **new** — marketplace entry + env/requires |
| `starter-mcp/.mcp.json` | **new** — declares `oneui` server via `${CLAUDE_PLUGIN_ROOT}/dist/index.js` |
| `starter-mcp/commands/*.md` | **new** — 5 slash commands wrapping existing tools/prompts |
| `starter-mcp/skills/*` | **new** — copied from `assets/skills/` + new `figma-to-native` |
| `starter-mcp/hooks/hooks.json` + `hooks/scripts/validate-on-write.mjs` | **new** — advisory validator hook |
| `starter-mcp/scripts/build-plugin.mjs` | **new** — copies skills, validates manifest, ensures `dist/` built |
| `starter-mcp/scripts/build-snapshot.mjs` | **edit** — add `figma-to-native` to `SKILL_ALLOWLIST` so the new skill is also baked + searchable |
| `starter-mcp/package.json` | **edit** — add `files` entries (`.claude-plugin`, `commands`, `skills`, `hooks`, `.mcp.json`) + `build:plugin` script |
| `starter-mcp/docs/PLUGIN-ARCHITECTURE.md` | **rewrite** — single-engine reality |
| `starter-mcp/README.md` | **edit** — lead with plugin install |

---

## 6. Reuse (don't reinvent)

- **Plugin scaffold shape** — copy structure from `devlens-handoff/.claude-plugin/`,
  `devlens-handoff/.mcp.json`, `commands/`, `hooks/` (reference plugin since removed from the repo).
- **Slash-command frontmatter** — `devlens-handoff/commands/build.md` was the template (removed).
- **Skills baking** — `build-snapshot.mjs` already bakes `assets/skills/`; the new plugin skills just
  ride the same allowlist + a copy step.
- **The two prompts** already encode the build workflow — commands wrap them, no rewrite.

---

## 7. Build & verification

1. **Build:** `cd starter-mcp && npm run build` (tsc → `dist/`) + `npm run build:snapshot` (re-bake
   assets incl. the new skill) + `npm run build:plugin` (copy skills, sanity-check manifests).
2. **Manifest valid:** `plugin.json` + `marketplace.json` parse; `commands` list matches files in
   `commands/`.
3. **MCP boots via plugin path:** `node ${PLUGIN_ROOT}/dist/index.js` handshakes (reuse
   `scripts/smoke.mjs`).
4. **Install dry-run:** `/plugin marketplace add <path>` then `/plugin install oneui-coding` in Claude
   Code; confirm the `oneui` server connects, the 21 tools list, the skills appear, and `/oneui:*`
   commands are present.
5. **End-to-end:** `/oneui:figma-to-native <url>` with Figma Desktop + bridge + `FIGMA_ACCESS_TOKEN`
   → writes `.native.tsx` → hook runs `validate_oneui_code(platform:native)` → "All clear" (or
   self-heals). This is the workflow the current branch has been hardening.
6. **Offline check:** with the network off, all knowledge/validator tools + skills still work (only
   `figma_to_code` + lifecycle/registry need network).

---

## 8. Phasing

- **Phase 1 (packaging only):** plugin.json + marketplace.json + .mcp.json + copy the 4 existing
  skills + the 2 prompt-wrapping commands. Ships the existing capability as a one-install plugin. No
  behavior change. *(Lowest risk — do this first.)*
- **Phase 2 (workflow commands + hook):** `/oneui:figma-to-native`, `/oneui:setup`, `/oneui:validate`
  + the advisory validator hook.
- **Phase 3 (new skill + docs):** `figma-to-native` skill, PLUGIN-ARCHITECTURE.md rewrite, INSTALL.md,
  Cursor `.cursor-plugin/` parity.

---

## 9. Decisions needed before building

1. **Plugin home** — in-place inside `starter-mcp/` (recommended) vs a sibling `oneui-plugin/` dir?
2. **Skills** — copy `assets/skills/` → top-level `skills/` at build time (recommended) vs reference
   in place?
3. **Hook posture** — advisory (warn-only, recommended for v1) vs blocking (reject the edit until the
   gate passes)?
4. **Marketplace distribution** — internal-only path (like devlens, gated by the private feed) vs a
   git-repo marketplace source? Affects the `source` block in `marketplace.json`.

---

## 10. Out of scope (follow-ups)

- Finishing the RN platform pack (validator token rules, new-app lifecycle) — tracked in
  [docs/ADDING-A-PLATFORM-PACK.md](starter-mcp/docs/ADDING-A-PLATFORM-PACK.md), independent of packaging.
- `figma_to_code` codegen-fidelity gaps (images/typography/corner-radius) —
  [CODEGEN-GAP-REPORT.md](starter-mcp/CODEGEN-GAP-REPORT.md).
- Cursor/VS Code/Zed first-class plugin parity beyond the `.cursor-plugin/` manifest.
