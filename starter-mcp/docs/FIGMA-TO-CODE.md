# Figma → Code (`figma_to_code`)

> Progress tracker for the `figma-to-code` functionality in `@jds4/oneui-mcp`.
> Owner: design-system tooling. Status as of **2026-06-27**.

## Goal

Add a `figma_to_code` capability to the OneUI MCP: given a Figma frame/component
URL, extract the raw design data a developer reads from **Dev mode → Inspect**
— the **Component Information** panel and the **Modes** (variables) section — and
ultimately turn it into OneUI-compliant code (`@oneui/ui-native` / `@jds4/oneui-react`).

## Required inputs

`figma_to_code(figmaUrl, platform, brand, subBrand, …)` — all four are **required**.

- **platform** — `reactnative` | `react`.
- **brand** / **subBrand** — e.g. `jio` / `myjio`. For **`reactnative`**, the tool
  first (**Step 0**) ensures `oneui.brands.json` contains the brand and lists the
  sub-brand under its `subBrands` (creating the file or updating the entry as
  needed; bare-string entries like `"latest"` are converted to the object form).
  See `src/lib/brandsConfig.ts`.
- **subBrand is the `theme` prop** for `<OneUIBrandProvider brand="<brand>"
  theme="<subBrand>">` in the generated TSX — the tool's output states this and
  the brand/theme to use.

## Architecture decision

**Option A — child MCP proxy (chosen).** `oneui-mcp` acts as an MCP *client* of
[`figma-console-mcp`](https://www.npmjs.com/package/figma-console-mcp): it spawns
`npx -y figma-console-mcp@latest` over stdio, connects once (lazily), and proxies
tool calls. This reuses figma-console's battle-tested Figma REST + Desktop Bridge
extraction instead of re-implementing those protocols.

Alternatives considered:

- **Option B — prompt orchestration of two separate MCPs.** Lightest, no new
  deps, but not "inside" oneui-mcp and relies on the agent following steps.
- **Option C — vendor the fetch logic.** Reimplement REST + bridge WebSocket
  protocol locally. Most work, loses upstream updates. Rejected.

### Data sources → figma-console tools (validated against a live frame)

| Inspect panel | How we fetch it | Transport |
| ------------- | --------------- | --------- |
| **Component information** (prop values: size, attention, shape, variant…) | `componentProperties`, read in the `figma_execute` snippet (or `figma_get_component_for_development_deep` for the raw visual tree) | Desktop Bridge plugin |
| **Modes** (`appearance`, `surface`, brand, colour mode…) | `figma_execute` running `node.resolvedVariableModes` / `explicitVariableModes`, resolving collection + mode names via `getVariableCollectionByIdAsync` | Desktop Bridge plugin |

> **Critical finding (validated live):** in OneUI Figma files, `appearance` and
> `surface` are **NOT component props and NOT local variables** — they are
> **variable-collection MODES** (the Dev-mode "Modes" panel). `figma_get_variables`
> and `figma_get_library_variables` return **0** for these files (tokens live in
> unsubscribed remote libraries), so the ONLY reliable path is the Plugin API's
> `resolvedVariableModes` via `figma_execute`. Modes cascade down the tree;
> a node differs only where it sets an `explicitVariableModes` override.

### Data flow

```
figma_to_code(figmaUrl)
  ├─ parse fileKey + nodeId (node-id=273-23740 → 273:23740)
  ├─ (oneui-mcp as MCP client → spawned figma-console child)
  │    └─ figma_execute(buildModesSnippet(nodeId))   → nested hierarchy:
  │         each component → { component (resolved name), props (componentProperties),
  │                            appearance, surface, modeOverrides, children }
  │    └─ [optional] figma_get_component_for_development_deep(nodeId)  → raw visual tree
  └─ return raw JSON  [v1 stops here]
       └─ (planned) map → OneUI components + brand tokens → validate_oneui_code
```

Example (verified on node `273:23740`): `IconButton {appearance:secondary,
surface:bold, props:{size:L, attention:high, shape:1:1}}`; selected
`SegmentedControlItem {appearance:sparkle, surface:bold}`; hero
`Frame {appearance:brandBG, surface:bold}`.

### Step 2 — refine to a TSX-ready tree

The raw hierarchy is refined (`src/lib/figmaRefine.ts`, on by default) into the
shape codegen consumes:

| Node | When | Shape |
| ---- | ---- | ----- |
| `kind:"component"` | name maps to a **registered** OneUI component (from `list_components`, platform default `reactnative` → `getComponentIndex('native')`) | `{component, appearance?, surface?, props?, children?}` |
| `kind:"surface"` | a FRAME whose own explicit override sets a **surface** and is NOT a registered component | `{mode, children?}` → render `<Surface mode=…>` |
| `kind:"node"` | anything else (unregistered component / structural container) | `{name, children?}` — name only, preserves hierarchy |

Rules:
- **Registered components** keep full detail. CONTAINERS (BottomNavigation,
  ChipGroup, Tabs, CheckboxField, RadioField, Card, Banner, Container,
  InputField, Modal, Select, Scrim) keep children; all other registered
  components are **leaf** — internal implementation children are dropped, but the
  icon **glyph name is harvested** into `props.icon` (e.g. `ic_shopping`).
- Figma-internal wrappers (names starting with `.` or `Slot/`, or `SLOT` nodes)
  are **transparent** — children bubble up (removes DNA/slot noise + `X > X` nesting).
- Slot / instance-swap props (node-id values, `SLOT` placeholders) are stripped.
- Layout props (padding/gap/direction) are **deferred** — not captured yet.

Validated on node `273:23740`: 62 KB raw → ~12 KB refined; 60 component nodes,
20 `<Surface>` nodes, 8 name-only; components used: Logo, Input, IconButton,
Avatar, Divider, Text, Image, Button, Badge, BottomNavigation,
BottomNavigationItem — all registered native components. Hero renders as
`Surface(bold) > Surface(minimal) > Image`; product cards as
`Surface(ghost) > Image + Badge + IconButton`.

### Step 3 — image assets (separate tool: `figma_download_images`)

Downloading images is its **own tool** — `figma_to_code` only **detects** images
(it lists each image node id + alt and points to `figma_download_images`); it does
not download. Image nodes in the refined tree carry `assetId` (the figma node id)
so downloaded files can be matched back to the tree.

`figma_download_images(figmaUrl, outDir, …)`:

1. Reads the frame via figma-console (`figma_execute` snippet → refine) to build
   the **image manifest** — `Image` components, `Avatar content=image`, and
   IMAGE-fill nodes. **Icons are NEVER included** — they come from the icon
   library (the glyph name is harvested into `props.icon`, e.g. `ic_shopping`).
2. Renders the nodes via Figma REST **`/v1/images`** (one batched call,
   token-only) and writes the PNGs into **`outDir`** (the path you provide;
   default `assets/figma`, relative to `projectRoot`) — `src/lib/figmaAssets.ts`.
3. Returns a **node-id → saved-path** map so codegen references the local files.

Needs `FIGMA_ACCESS_TOKEN`. Requires the Desktop Bridge for the detection step
(reads the frame via the plugin), like `figma_to_code`.

### Placement / layout (from `figma_execute`)

Every kept node carries a **`layout`** object extracted from Figma auto-layout in
the same `figma_execute` call (no extra round-trip) — so placement is
**deterministic** (no screenshots needed):

| `layout` field | Source (Figma) | → React Native |
| --- | --- | --- |
| `direction` | `layoutMode` HORIZONTAL/VERTICAL | `flexDirection` row/column |
| `gap` | `itemSpacing` | `gap` |
| `padding` | `paddingLeft/Right/Top/Bottom` | `padding*` |
| `justify` | `primaryAxisAlignItems` (MIN/CENTER/MAX/SPACE_BETWEEN) | `justifyContent` |
| `align` | `counterAxisAlignItems` (MIN/CENTER/MAX) | `alignItems` |
| `widthMode`/`heightMode` | `layoutSizingHorizontal/Vertical` (FILL/HUG/FIXED) | `flex:1` / intrinsic / fixed |
| `wrap` | `layoutWrap` WRAP | `flexWrap` |
| `cornerRadius` | `cornerRadius` | `borderRadius` |
| `absoluteBox` | `absoluteBoundingBox` (**non-auto-layout nodes only**) | absolute positioning |

Children are emitted in render order. Carried on `component`, `surface`, and
`node` entries (`src/lib/figmaModesSnippet.ts` `layoutOf()` → `figmaRefine.ts`).

> **Screenshots:** `figma_to_code` does **not** capture screenshots. Placement is
> derived deterministically from `layout` above, and the user can supply their own
> reference screenshots for visual verification — re-rendering them from
> figma-console only made the call heavier. (Removed; the previous
> `figma_capture_screenshot` step and `figmaScreenshots.ts` no longer exist.)

Validated on node `273:23740`: **14 images** (1 Avatar + 13 Image, **0 icons**)
rendered + downloaded as valid PNGs with 0 errors; `Image` nodes got
`src:"assets/figma/picture-of-amber-palace-jaipur-india-323591.png"`.

## Files

| File | Purpose |
| ---- | ------- |
| `src/lib/figmaConsole.ts` | Spawns + connects the figma-console child MCP; `callFigmaConsole()` proxy; `resultToText()` helper; `FIGMA_WS_PORT` pin + `reclaimBridgePort()` + `getBridgeStatus()` / `ensureBridgeConnected()`. **Resilient:** invalidates the cached child on close/error + retries once (respawn), bounded connect timeout, child killed on parent exit, child spawned against the **public npm registry** from a **neutral cwd** (so a consuming project's private `.npmrc` can't 401 the `npx` fetch). |
| `src/lib/figmaBridge.ts` | Backend dispatch: `ownBridgeEnabled()`, `ensureBridge()`, `executeSnippet()` route between the figma-console child and the OneUI-owned bridge based on `ONEUI_FIGMA_BRIDGE_OWN`. |
| `src/lib/figmaBridgeServer.ts` | Phase 2: the OneUI-owned `ws` bridge server (`getOwnBridgeServer()`, `ensureOwnBridge()`) bound to `9333`–`9342`; `EXECUTE_CODE` round-trip to our plugin. |
| `figma-bridge-plugin/` | Phase 2: the OneUI-owned Figma plugin (`manifest.json` w/ `enablePrivatePluginApi`, `code.js` eval handler, `ui.html` WS client). Shipped in package `files[]`; imported once via manifest. |
| `src/lib/figmaModesSnippet.ts` | `buildModesSnippet(nodeId)` — the Plugin-API code run via `figma_execute` to read componentProperties + resolvedVariableModes into a nested hierarchy. |
| `src/lib/figmaRefine.ts` | Step 2: `refineExtraction(raw, platform)` — classify nodes (component/surface/node), leaf/container + icon-harvest + transparent-wrapper rules; collect image manifest; `applyImageSources()`. |
| `src/lib/figmaAssets.ts` | Step 3: `downloadImages()` — render via REST `/v1/images` (token-only) + write PNGs to assetsDir. Icons excluded. |
| `src/tools/figma.ts` | Two tools: **`figma_to_code`** (`figmaUrl`, `platform`, `brand`, `subBrand` required; `refine`, `projectRoot`, `includeRaw`, `includeRawTree`) — brand-ensure + extract + refine + image *detection*; and **`figma_download_images`** (`figmaUrl`, `outDir`, `platform`, `scale`, …) — standalone image download. Shared `extractHierarchy()` + `parseFigmaUrl()` + execute-result unwrap. |
| `src/server.ts` | Registers `registerFigmaTools`. |

### Environment / config knobs

| Var | Purpose |
| --- | ------- |
| `FIGMA_ACCESS_TOKEN` | Figma personal access token. Required for the REST fallback; passed through to the child. |
| `ENABLE_MCP_APPS` | Mirrors figma-console default (`true`). |
| `ONEUI_FIGMA_CONSOLE_PACKAGE` | Override child npm package (default `figma-console-mcp@latest`). |
| `ONEUI_FIGMA_CONSOLE_COMMAND` / `ONEUI_FIGMA_CONSOLE_ARGS` | Override launch command (e.g. a local-git `node dist/local.js`). |
| `ONEUI_FIGMA_WS_PORT` / `FIGMA_WS_PORT` | WS port the spawned child requests (default `9223`, the port the bridge plugin scans first). Pinned so the plugin's first-scan hit is our child, not a stray competitor. |
| `ONEUI_FIGMA_BRIDGE_RECLAIM` | `1` (default) reclaims the pinned port from stray figma-console listeners before spawning; set `0` to disable (logs the competitors instead of killing them). |
| `ONEUI_FIGMA_BRIDGE_OWN` | `1` selects the **OneUI-owned bridge** (Phase 2 — our own WS server + plugin) instead of the figma-console child. Default `0` (figma-console). |
| `ONEUI_FIGMA_BRIDGE_PORT_START` / `_END` | Port range the own bridge binds + the plugin scans (default `9333`–`9342`). |
| `ONEUI_FIGMA_BRIDGE_PORT` | Pin the own bridge to a single explicit port (overrides the range scan). |

## Setup for consumers

1. Set `FIGMA_ACCESS_TOKEN` on the **oneui-mcp** server config (the parent
   process passes it to the spawned child).
2. **Remove any standalone `figma-console` MCP entry** — two figma-console
   servers compete for the Desktop Bridge port (9223–9232). The server now also
   **auto-reclaims** the pinned port (`FIGMA_WS_PORT`, default `9223`) from stray
   figma-console listeners before spawning its child, so a leftover orphan no
   longer silently steals the plugin. Set `ONEUI_FIGMA_BRIDGE_RECLAIM=0` to opt out.
3. Connect the **Figma Desktop Bridge plugin** in Figma Desktop (required for
   deep extraction + variable Modes).
4. **Preflight with `ensure_figma_bridge`.** It probes the connection, reclaims
   the pinned port, waits ~15s for the plugin to reconnect, and reports which file
   is attached / how many competitors were reclaimed / the exact recovery steps.
   `figma_to_code` runs this check itself and **fails fast** (≤~15s) with the
   recovery message if the bridge is down — no more 180s hang.

## Phase 2 — OneUI-owned bridge (opt-in)

The default path spawns the third-party `figma-console-mcp` child. Phase 2 adds a
**OneUI-owned bridge** we control end-to-end — a WebSocket server hosted *inside*
oneui-mcp plus our own minimal Figma plugin — selected with
**`ONEUI_FIGMA_BRIDGE_OWN=1`**. Same `buildModesSnippet`, different transport; the
rest of `figma_to_code` is unchanged.

Why it exists: a deterministic port we own, our own auto-reconnect, and **zero**
`npx`/cloud dependency (no public-registry fetch, no relay). The figma-console
child remains the default and the fallback.

**Components**

| Piece | Where | Role |
|---|---|---|
| Plugin | `figma-bridge-plugin/` (`manifest.json` + `code.js` + `ui.html`) | `enablePrivatePluginApi: true` + `documentAccess: "dynamic-page"`. The UI iframe holds the WS to our server and relays `EXECUTE_CODE`; `code.js` runs the snippet via `eval` of an async IIFE (AsyncFunction is blocked in the sandbox) and reads `resolvedVariableModes`. |
| Server | `src/lib/figmaBridgeServer.ts` | `ws` server bound to the first free port in `9333`–`9342`; `executeCode()` round-trip, `getStatus()`, `ensureOwnBridge()`. Auto-closed on process exit. |
| Dispatch | `src/lib/figmaBridge.ts` | `ensureBridge()` / `executeSnippet()` pick the backend from `ONEUI_FIGMA_BRIDGE_OWN`. |

**One-time setup (per machine)**

1. In Figma **Desktop**: `Plugins → Development → Import plugin from manifest…` and
   pick `node_modules/@jds4/oneui-mcp/figma-bridge-plugin/manifest.json` (the dir
   ships in the package `files[]`).
2. Set `ONEUI_FIGMA_BRIDGE_OWN=1` on the oneui-mcp server config.

**Per session**

1. Open the target file in Figma Desktop. A `figma://` deep link jumps straight to
   it: `figma://file/<fileKey>` (or just open it from the file browser).
2. Run **OneUI Figma Bridge** (`Plugins → Development → OneUI Figma Bridge`). Its UI
   shows `connected (N)` once it reaches our server.
3. `ensure_figma_bridge` / `figma_to_code` work exactly as with figma-console.

> **Honest constraint:** Figma's sandbox forbids launching an in-Figma plugin from
> outside Figma, so the plugin is opened **once per Figma session** — same as
> figma-console. What Phase 2 buys is the deterministic owned port + our own
> reconnect + no third-party dependency, not zero-touch launch.

## Progress

### ✅ Done

- [x] Analysis: figma-console transports (REST vs Desktop Bridge), tool mapping.
- [x] Architecture chosen: Option A (child MCP proxy).
- [x] `src/lib/figmaConsole.ts` — lazy spawn + connect + proxy.
- [x] `src/tools/figma.ts` — `figma_to_code` (raw JSON only), URL parser,
      deep→REST fallback, per-section error tolerance.
- [x] Registered in `src/server.ts`.
- [x] Build clean (`npm run build`).
- [x] Smoke tests: `parseFigmaUrl` cases, server construction, child spawn +
      `tools/list` (110 tools).
- [x] **Discovered + validated** (live bridge, file `tmx82CJ39pxwNJjOYq0K1x`,
      node `273:23740`) that appearance/surface are variable-collection MODES,
      not props/variables — `figma_get_variables` returns 0; modes only come from
      `resolvedVariableModes` via `figma_execute`.
- [x] `src/lib/figmaModesSnippet.ts` — `buildModesSnippet()`; validated to emit a
      clean nested hierarchy (186 kept nodes) with resolved component names, props,
      effective appearance/surface, and explicit mode overrides.
- [x] Rewrote `figma_to_code` to use the snippet via `figma_execute`
      (`includeRawTree` opt-in for the raw deep tree). Build clean.
- [x] **Step 2 — refinement** (`src/lib/figmaRefine.ts`): registered-component
      classification (native index), leaf/container split, icon-glyph harvest,
      transparent wrappers, surface-frame → `<Surface mode>`. Wired into the tool
      (`platform`/`refine`/`includeRaw`). Validated on `273:23740` (62 KB → 12 KB,
      all registered native components). Build clean.
- [x] **Step 3 — image assets** (`src/lib/figmaAssets.ts`): collect image manifest
      (Image/Avatar/IMAGE-fill, **icons excluded**), render via REST `/v1/images`
      (token-only, no bridge), download to `assetsDir`, backfill `props.src`.
      Moved to the standalone **`figma_download_images`** tool (figma_to_code only
      detects images now). Validated on `273:23740`: 14 images, 0 icons, 0 errors.
- [x] **Layout extraction** (`figmaModesSnippet.ts` → `figmaRefine.ts`): per-node
      `layout` from Figma auto-layout → deterministic placement (RN flex).
- [x] **Brand/sub-brand** (`brandsConfig.ts`): figma_to_code requires brand+subBrand
      and ensures them in `oneui.brands.json` for reactnative (subBrand = the
      `<OneUIBrandProvider>` theme).
- [x] **Removed screenshot capture** from figma_to_code (deleted `figmaScreenshots.ts`)
      — users supply their own reference screenshots; re-rendering them made the
      call heavier for no benefit.

### 🔜 Next

- [ ] End-to-end test through the **spawned child** (not the standalone server):
      requires removing the standalone `figma-console` MCP so the bridge attaches
      to oneui-mcp's child (port contention — see Setup). Logic already validated
      via the live tool directly.
- [ ] **Step 3 — codegen**: emit TSX from the refined tree (appearance→`appearance`,
      surface→`<Surface mode>`, props→component props, icon glyphs→`Icon`), then
      `validate_oneui_code` (self-heal loop).
- [ ] Payload-size strategy for very large frames (`maxNodes`/`maxDepth` cap it).
- [ ] Docs in `README.md` + server `instructions` once codegen lands.

### Open questions

- Should `figma_to_code` accept a `platform` (web vs native) to pre-bias codegen?
- Cache child responses per (fileKey, nodeId) within a session?

## Test notes

- Child spawn verified via `getFigmaConsoleClient().listTools()` → 110 tools.
- Token must never be passed on a CLI arg/echoed — read from config into env.
- Modes extraction validated live: root resolved modes + per-node explicit
  overrides correctly produce effective appearance/surface (e.g. BottomNav item
  → surface=ghost; active icon → appearance=primary; hero → appearance=brandBG).
- The spawned-child path can't reach the bridge while a standalone figma-console
  is running (port contention); validated via the live tool instead.
