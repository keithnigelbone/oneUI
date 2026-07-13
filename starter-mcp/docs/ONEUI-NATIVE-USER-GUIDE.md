# OneUI Native — End-User Guide

How to scaffold a React Native (Expo) app with **OneUI Native** (`@oneui/ui-native`),
discover components, read their real APIs, and validate your code — all through the
**OneUI MCP** (`@jds4/oneui-mcp`).

> **How you use the MCP:** you don't call tools directly. You talk to your AI agent
> (Claude) in plain language; the agent runs the matching MCP tool and relays the
> result. Each section below gives the **plain-language prompt** to say, the
> **underlying MCP tool**, and — for app setup — the **exact terminal commands** the
> MCP hands you.

---

## 0. Prerequisites

The OneUI Native packages live on a **private Azure DevOps feed**
(`JIO-DS-OneUI-Native`). You need a **Personal Access Token (PAT)** with
**Packaging: Read** before installing anything.

- **Feed connect page:** <https://jio-dsp.visualstudio.com/DS-Assets/_artifacts/feed/JIO-DS-OneUI-Native/connect>
- **Create a PAT:** <https://jio-dsp.visualstudio.com/_usersSettings/tokens> → Packaging → **Read**

Keep that PAT handy. You'll either paste it into a terminal (terminal mode) or hand it
to the agent (AI mode) — your choice in step 1.

---

## 1. Create the OneUI Native app

**Prompt to say:**
> "Create a OneUI native app called `my-app`."

**MCP tool:** `create_oneui_native_app`

The tool **always asks first** which path you want — you pick one:

| Mode | Token cost | Who runs it | Your PAT |
| --- | --- | --- | --- |
| **Terminal** | Zero extra tokens | You, in your own terminal | Never leaves your machine |
| **AI** | Consumes tokens | The agent | Shared with the agent |

### 1A. Terminal mode (recommended)

Say: **"terminal mode"**. The MCP returns the full command list below — run each
step yourself in the directory where you want the app created.

**Step 1 — Get a PAT** (one-time): see [Prerequisites](#0-prerequisites).

**Step 2 — Write `.npmrc`.** Paste this whole block into your terminal. It prompts for
the token type, reads the PAT with input hidden, and writes `.npmrc`:

```bash
printf 'Token format — type "raw" or "base64" [base64]: '; read FMT
printf 'Paste your PAT (input hidden): '; stty -echo; read PAT; stty echo; printf '\n'
if [ "$FMT" = "raw" ]; then PW=$(printf '%s' "$PAT" | base64 | tr -d '\n'); else PW="$PAT"; fi
cat > .npmrc <<EOF
registry=https://jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native/npm/registry/
always-auth=true

; begin auth token
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native/npm/registry/:username=JIO-DSP
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native/npm/registry/:_password=$PW
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native/npm/registry/:email=npm requires email to be set but doesn't use the value
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native/npm/:username=JIO-DSP
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native/npm/:_password=$PW
//jio-dsp.pkgs.visualstudio.com/_packaging/JIO-DS-OneUI-Native/npm/:email=npm requires email to be set but doesn't use the value
; end auth token
EOF
unset PAT PW FMT
echo "Wrote .npmrc"
```

- Press **Enter** for `base64` (paste an already-encoded token), or type **`raw`**
  (paste the token exactly as Azure DevOps shows it — the script base64-encodes it).

**Step 3 — Generate the app:**

```bash
npx @oneui/create-native-app my-app
```

**Step 4 — After it finishes:**

```bash
rm .npmrc                          # bootstrap auth only — my-app/.npmrc carries feed auth
cd my-app
npx oneui-native-cdn prefetch      # fetch brand data (also runs on dev start)
npm run ios                        # or: npm run android
```

> Edit `oneui.brands.json` to add brands/sub-brands, then re-run `npm run prefetch`.

### 1B. AI mode

Say: **"AI mode"** and provide **all three** inputs — the MCP requires them:

1. **App name** (e.g. `my-app`)
2. **PAT** (the token)
3. **PAT type** — `raw` or `base64` (you must state which)

The agent then:

1. Writes the bootstrap `.npmrc` for you.
2. Runs the generator **unattended** — the CLI's prompts (token type → token) are
   pre-answered via stdin, so you type nothing:
   ```bash
   npx @oneui/create-native-app my-app <<'ONEUI_PAT_EOF'
   1            # 1 = raw, 2 = base64
   <your-PAT>
   ONEUI_PAT_EOF
   ```
3. Cleans up the bootstrap `.npmrc`, runs `prefetch`, and tells you how to launch.

> If the generator ever needs an interactive terminal the agent can't drive, it falls
> back and hands you the command to run in terminal mode.

---

## 2. List all components

**Prompt to say:**
> "List all OneUI **native** components."

**MCP tool:** `list_components`

| Param | Value to use |
| --- | --- |
| `platform` | **`reactnative`** (required for native — default is `react`/web) |
| `filter` | optional substring/tag, e.g. `"input"`, `"navigation"` |
| `projectRoot` | optional; defaults to the current directory |

Returns every native component available for your installed `@oneui/ui-native`
version, each with a one-line intent. To narrow down:

> "List OneUI native components matching `nav`."

---

## 3. Get a component's API

**Prompt to say:**
> "Show me the **native** API for `Button`." &nbsp; (or any component name)

**MCP tool:** `get_component_info`

| Param | Value to use |
| --- | --- |
| `name` | component name or slug, e.g. `Button` / `button` |
| `platform` | **`reactnative`** |
| `section` | one of `all` (default), `props`, `variants`, `composition`, `examples` |
| `projectRoot` | optional; defaults to current directory |

Examples:

> "Get the `props` for the native `Input` component."
> "Show `examples` for the native `BottomNavigation`."

**To get info for _all_ components:** first run [list_components](#2-list-all-components)
to get the names, then ask for each one's API — e.g.
> "Go through every native component and give me its props."

---

## 4. Validate OneUI Native code

**Prompt to say:**
> "Validate this React Native screen against OneUI." &nbsp;(paste/point at your TSX)

**MCP tool:** `validate_oneui_code`

| Param | Value to use |
| --- | --- |
| `tsx` | the TSX source (full file or the relevant component) |
| `platform` | **`reactnative`** |
| `projectRoot` | optional; defaults to current directory |

What it checks (React Native rule-set):

- **Unknown props** — a prop not in the component's API for the native platform.
- **Non-released components** — importing something not exported by `@oneui/ui-native`.
- Plus the native-specific rules (e.g. only `View` / `ScrollView` allowed from
  `react-native`; everything else must come from `@oneui/ui-native`).

Run it **after writing any TSX** and fix all issues before shipping.

---

## 5. Download Figma images

Pull every image in a Figma frame into your repo as local assets — so generated
screens reference real files, not remote Figma URLs or placeholders.

**Prompt to say:**
> "Download the images from this Figma frame into `src/assets/figma`:
> `https://www.figma.com/design/<key>/<name>?node-id=273-23740`"

**MCP tool:** `figma_download_images`

| Param | Value to use |
| --- | --- |
| `figmaUrl` | the Figma **frame/component URL** (must include a `node-id`) |
| `outDir` | where to write the images (relative to `projectRoot`, or absolute). Default `assets/figma` |
| `nodeId` | optional; overrides the node id parsed from the URL (colon form, e.g. `273:23740`) |
| `projectRoot` | optional; defaults to the current directory |
| `platform` | **`reactnative`** (default) — identifies `Image`/`Avatar` nodes |
| `scale` | optional render scale `1`–`4` (default `2`) |
| `maxNodes` / `maxDepth` | optional traversal caps (defaults `600` / `16`) |

What it does:

- Reads the frame via the **Figma Desktop Bridge** and collects every image asset
  — `Image` components, `Avatar content=image`, and nodes with IMAGE fills.
- **Icons are never downloaded** — they come from the icon library, so use the
  `<Icon>` component (the glyph name is available as the `icon` prop in the
  `figma_to_code` output, e.g. `ic_shopping`).
- Renders them via Figma's REST API and writes the PNGs into `outDir`, returning a
  **node-id → saved-path** map so you can wire each image into your code.

**Prerequisites:**

- **`FIGMA_ACCESS_TOKEN`** must be set on the OneUI MCP server (used to render +
  download). Without it the tool reports the images but downloads nothing.
- The **Figma Desktop Bridge** plugin must be connected to the OneUI MCP. The
  server pins its bridge port via **`FIGMA_WS_PORT`** (default `9223`, the port the
  plugin scans first) and **auto-reclaims** that port from stray `figma-console`
  instances, so port contention is handled for you. If extraction still can't reach
  the bridge, run **`ensure_figma_bridge`** — it probes the connection, reclaims the
  port, waits ~15s for the plugin to reconnect, and reports the exact recovery steps
  (open the file in Figma Desktop → run the bridge plugin → wait ~3s).
  - *Advanced:* set `ONEUI_FIGMA_BRIDGE_OWN=1` to use the **OneUI-owned bridge**
    (our own WS server + plugin, a deterministic port with no third-party
    dependency) instead of figma-console. Import `figma-bridge-plugin/manifest.json`
    once in Figma Desktop. See `docs/FIGMA-TO-CODE.md` § Phase 2.

> **Relationship to `figma_to_code`:** `figma_to_code` extracts the component
> tree + props + appearance/surface and captures screenshots, but it does **not**
> download images — it only **detects** them and points here. Run
> `figma_download_images` as the separate step that fetches the assets; match each
> downloaded file to the design via the node id (the `figma_to_code` tree carries
> the same id in `assetId`).

---

## Tool quick reference

| What you want | Say to the agent | MCP tool | Key params |
| --- | --- | --- | --- |
| Scaffold a native app | "Create a OneUI native app called X" | `create_oneui_native_app` | `mode` (`terminal`\|`ai`), `pat`, `patFormat` |
| List native components | "List all OneUI native components" | `list_components` | `platform: reactnative` |
| Read a component API | "Show the native API for X" | `get_component_info` | `name`, `platform: reactnative`, `section` |
| Validate native TSX | "Validate this RN code" | `validate_oneui_code` | `tsx`, `platform: reactnative` |
| Download Figma images | "Download images from this frame into X" | `figma_download_images` | `figmaUrl`, `outDir`, `platform: reactnative` |
| Check feed connection | "Am I connected to the JDS feed?" | `check_oneui_registry` | — |
| Get a brand's tokens | "Get the `jio` brand tokens" | `get_brand_tokens` | brand slug |

> **Always pass `platform: "reactnative"`** for native work — every component/validate
> tool defaults to `react` (web). The exact string is `reactnative` (no hyphen).

---

## Notes

- **`@oneui/ui-native` is the only UI source.** From `react-native` you may use only
  `View` and `ScrollView` as layout wrappers; all other UI comes from
  `@oneui/ui-native`.
- The generated app's own `.npmrc` (written by the CLI) carries feed auth for future
  installs — keep it out of version control.
- The bootstrap `.npmrc` you create in step 2 holds your PAT in plaintext; step 4
  deletes it. If you stop early, delete it manually.
