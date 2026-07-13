# figma_to_code — Codegen Fidelity Gap Report

> **Status (2026-07 reconciliation):** this is a point-in-time post-mortem
> (early July 2026), kept as a historical test record. The pipeline has moved
> since it was written — current state of each gap:
>
> | # | Gap | Status |
> |---|-----|--------|
> | 1 | Images blank / no fallback / misleading "props.src set" | ✅ **Fixed** on `mcp/audit-hardening` — /v1/images retry, `matchExistingAssets()` reuse of pre-existing files in `assetsDir`, and the MANDATORY instruction is now emitted only when every image node has a local asset (missing nodes are listed with the exact filename pattern to drop in) |
> | 2 | Typography flat | ✅ **Fixed** in the current pipeline — extract captures `typographyInfo` (fontSize/weight/text-style name, `figmaModesSnippet.ts`), refine carries `RawTypography`, codegen maps via `parseStyleName`/`typographyToTextProps` (`figmaCodegen.ts`) |
> | 3 | Corner radius dropped | ✅ **Fixed** — `cornerRadius` → `borderRadius` via `injectStyle` on Image, surfaces, and structural frames (`figmaCodegen.ts`) |
> | 4 | Badge colour | ➖ Brand-token interpretation, not a codegen bug (unchanged) |
> | 5 | Logo wordmark blank / empty `aria-label` | ⚠️ **Open** (known limitation; icon-name-derived labels still todo) |
>
> The analysis below is unmodified from the original report.

**Subject:** Why automated codegen lands ~80% (here effectively 0%) vs a manual
prompt-driven pass at ~95%, and what to fix in this repo.

**Test case:** node `273:25577`, file `tmx82CJ39pxwNJjOYq0K1x`
("OneUI-References-PluginGen (Copy)"), brand `jio` / subBrand `jionews`.
Generated screen: `mcp-test/src/screens/JioNewsV2.native.tsx` (codegen=true).
Compared against: the refined source tree (saved tool-result) + the Figma design +
the on-device render.

---

## TL;DR — the delta is 3 systematic pipeline gaps + 1 environment issue

| # | Gap | Stage | Severity | Evidence |
|---|-----|-------|----------|----------|
| 1 | **Images render blank** — no `src` on any Image/Avatar | assets + codegen | 🔴 Critical | tree has 10 `assetId`s, **0 downloaded, 0 `src`** |
| 2 | **Typography is flat** — every Text is bare `appearance="neutral"` | extract → codegen | 🔴 High | tree carries **no** `fontSize`/`fontWeight`/`variant`/`size`/`weight` |
| 3 | **Corner radius dropped** — rounded image/card corners lost | codegen | 🟡 Medium | tree has `cornerRadius` ×31; generated TSX emits **no** `borderRadius` |
| 4 | Badge color (green vs Figma blue) | brand tokens | 🟢 Low | tree faithfully says `appearance:"sparkle"` — not a codegen bug |
| 5 | Logo wordmark blank; IconButton `aria-label=""` | known limits | 🟢 Low | no `svgContent`; glyph wordmark not in JDS set |
| — | Red-screen `Cannot find native module 'ExpoLinking'` | **environment** | n/a | duplicate `expo start` processes; not codegen |

A human authoring from the screenshot nails images, type hierarchy, and rounded
corners by eye. Our pipeline drops exactly those three. Close #1–#3 and the gap
largely closes.

---

## Gap 1 — Images render blank (CRITICAL)

### What we emit
Every `<Image>` and the `<Avatar>` are generated **without `src`**, and the
`u()` / `RNImage.resolveAssetSource` helper isn't even imported:

```tsx
<Image accessibilityLabel="Picture of Amber palace, Jaipur, India." interactive={true} width={328} height={437} alt="" />
<Avatar appearance="neutral" size="xl" attention="high" content="image" />   // no src
```

### Root cause (two layers)
1. **REST image render 404'd for this file.** The saved output says
   `Images: 10 found, 0 downloaded` and `Figma /v1/images failed: 404 Not Found`.
   Verified directly:
   - `GET /v1/files/tmx82CJ39pxwNJjOYq0K1x` → **HTTP 404**
   - `GET /v1/files/OCuqSIJHEE29X0pLe13SKU` (the original file) → **HTTP 200**

   The `FIGMA_ACCESS_TOKEN` in `.mcp.json` **has no access to the Copy file**
   (different owner/team, or not shared). So `downloadImages()` returns an empty
   `byId`, and `applyImageSources()` backfills nothing.

2. **Codegen has no fallback when `byId` is empty.** It silently emits src-less
   Images. Worse, the instruction text still claims *"each Image/Avatar node already
   has `props.src` set"* — false on a download failure, which misleads the agent.

### Fix (in this repo)
- **Primary:** use a token that can see the target file, or run against a file the
  token owns. (For this Copy file, share it with the token's account.)
- **Robustness — `src/lib/figmaAssets.ts` + the `applyImageSources` caller:** when a
  node's `assetId` is missing from `byId` (download failed/empty), **fall back to an
  existing file in `assetsDir`** by matching the slugified `alt`/component name
  (`slugify(alt)-*.png`). This directly supports the user's workflow ("I already
  downloaded the needed images — use them"). Today those pre-downloaded files are
  ignored.
- Only claim `props.src is set` in the instructions when `downloaded > 0`; otherwise
  emit an explicit warning per node ("no asset for <id> — Image will be blank").

---

## Gap 2 — Typography hierarchy is flat (HIGH)

### What we emit
Every text node, regardless of role, is identical:

```tsx
<Text appearance="neutral">{"Thala"}</Text>            // hero display title
<Text appearance="neutral">{"Trending today"}</Text>   // section headline
<Text appearance="neutral">{"20 min ago"}</Text>       // tiny caption
```

A refined-tree Text node is the whole story:

```json
{ "kind": "component", "component": "Text", "text": "Thala", "appearance": "neutral" }
```

### Root cause
**Typography is never extracted.** The entire tree contains **no** `fontSize`,
`fontWeight`, `fontName`, `lineHeight`, `textCase`, `fills`, or text-style-id keys
(grep: 0 matches). So refine/codegen have nothing to map — the loss is at the
**extract** stage (`figmaModesSnippet.ts`), before refine ever runs. The OneUI `Text`
`variant`/`size`/`weight` props therefore default to `body`/`M`/`medium` for
everything → no visual hierarchy. This is the largest *generic* quality gap vs a
manual pass.

### Fix (in this repo)
1. **Extract** (`figmaModesSnippet.ts`): for each TEXT node, capture
   `fontSize`, `fontWeight`/`fontName.style`, and the bound text-style name/id
   (e.g. `title/L`, `body/S`).
2. **Refine** (`figmaRefine.ts`): map those to OneUI `Text` props —
   text-style-name → `variant`+`size` when available, else bucket by `fontSize`
   (e.g. ≥28→`display`, 22–27→`headline`/`title`, 16–21→`body L/M`, ≤14→`label`/`body XS`),
   and `fontWeight` ≥700→`weight="high"`.
3. **Codegen** (`figmaCodegen.ts` Text handler): emit `variant`/`size`/`weight`
   from those refined props.

---

## Gap 3 — Corner radius dropped (MEDIUM)

`cornerRadius` **is** captured in the tree (×31) but the generated TSX emits no
`borderRadius` anywhere — news thumbnails, hero, and poster tiles render with square
corners vs the rounded Figma design.

### Fix
In `figmaCodegen.ts`, when a node/box carries `cornerRadius`, merge
`style={{ borderRadius: <n> }}` onto the emitted Image/Container/Surface (the same
`injectStyle` helper used for the scrim-overlay transparent background can do this).

---

## Gap 4 — Badge color (LOW, not a codegen bug)

The tree resolves these category badges to `appearance:"sparkle"`, `surface:"bold"`,
and our codegen faithfully emits `appearance="sparkle"`. The green vs Figma-blue
difference is a **brand-token interpretation** (Jio's `sparkle` role → green), not a
codegen fault. If the Figma intent is blue, that's an `informative`-role decision in
the design or a brand-token mapping — out of scope for codegen. (We *do* drop the
`surface="bold"` on Badge, but Badge maps surface→`variant`, and the current output
relies on `attention="high"`; low impact.)

---

## Gap 5 — Logo + a11y labels (LOW, known)

- `<Logo … alt="" />` with no `svgContent`/`src` → blank. The Jio wordmark is an inline
  SVG, not a JDS glyph; codegen can't synthesize it. Acceptable known limitation.
- `IconButton aria-label=""` — empty labels. Minor a11y; derive from the icon's
  semantic name when Figma gives none.

---

## Not a codegen issue — environment

The on-device render was a **red screen**: `Cannot find native module 'ExpoLinking'`.
Cause: two competing `expo start` processes (one `--android`, one `--clear`) — the app
bound to a dev client missing the `expo-linking` native module. Resolution: kill the
duplicate, run a single `expo start`, reload. This masks the real codegen output and
should be fixed before judging fidelity on-device.

---

## Recommended fix order

1. **Gap 1 assetsDir fallback** + use an authorized token → images appear. (biggest jump)
2. **Gap 2 typography extraction** → hierarchy returns. (biggest *generic* quality win)
3. **Gap 3 borderRadius** → rounded corners.
4. Env cleanup (single Metro) so on-device verification is trustworthy.
5. Gaps 4–5 are low priority / brand-side.
