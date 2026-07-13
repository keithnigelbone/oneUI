---
name: figma-to-native
version: 0.2.0
visibility: public
description: >
  Turn a Figma frame into a runnable, visually-verified @oneui/ui-native (React Native)
  screen. Drives figma_to_code(codegen=true) per FIGMA-TO-CODE-WORKFLOW.md, certifies the
  output with validate_oneui_code, then builds it, screenshots it, and compares against the
  Figma frame — hand-authoring fixes for any visual mismatch instead of stopping at a clean
  lint gate. Use this skill whenever building a React Native screen FROM a Figma design (a
  figma.com URL with a node-id), when running /oneui:figma-to-native, or when debugging the
  extract → refine → download-assets → codegen → validate → build → screenshot → fix chain.
  It owns the Figma→RN mapping semantics (Figma size tokens → KB enums, attention → variant,
  surface Modes → <Surface mode>, required a11y string defaults, icon/image wiring), the
  runtime-error fixes that make generated code run without manual edits, and the
  screenshot-diff → hand-fix loop that closes the gap codegen alone can't. For WHICH surface
  level a region earns defer to `surface`; for the [data-surface] remapping mechanism defer
  to `surface-context`; for component-API correctness defer to `oneui`.
---

# Figma → @oneui/ui-native

The OneUI MCP `figma_to_code` tool extracts a Figma frame and (with `codegen=true`)
generates a `@oneui/ui-native` screen written to disk. This skill is how you drive it, how
you read/repair its output so the screen runs and passes the gate, and — critically — how
you verify it actually looks right by building it, screenshotting it, and hand-authoring
fixes for whatever codegen got wrong. `validate_oneui_code` returning clean is necessary
but NOT sufficient: it only proves the code won't crash and doesn't use banned APIs. It says
nothing about whether the screen resembles the Figma frame. Never declare a
figma-to-native task done on a clean validate result alone — always run the build → screenshot
→ compare → fix loop below at least once.

## Prerequisites
- **Figma Desktop** open on the target file with the **Console/Bridge plugin connected**.
- **`FIGMA_ACCESS_TOKEN`** in the MCP env (for image download). No standalone figma-console
  MCP running — `figma_to_code` spawns its own child and a second one steals the bridge port.
- An Expo / RN project with `@oneui/ui-native` + `@oneui/icons-jio-native` installed and an
  `oneui.brands.json` (the tool's Step 0 ensures the brand + subBrand entry).

## The pipeline (what each step produces)
1. **Extract** — resolved component props (`componentProperties`) + variable **Modes**
   (`appearance`, `surface`, brand, colour mode), visible text, token-based layout
   (direction/gap/padding as spacing-token keys + cornerRadius), and geometry.
2. **Refine** — classify nodes: `kind:"component"` (registered OneUI component),
   `kind:"surface"` (a frame whose Mode sets a surface → `<Surface mode>`), `kind:"node"`
   (structural wrapper → `<View>`). Leaf components drop internal children but **harvest the
   icon glyph** name. Image/Avatar nodes are marked for download.
3. **Download images** — Figma REST renders each Image/Avatar node → writes to `assetsDir`,
   backfills `props.src`. Icons are NEVER downloaded — they come from the icon library.
4. **Codegen** — emit `<ScreenName>.native.tsx` (+ optional expo-router route), importing
   only `@oneui/ui-native` components. Token-only; no literals.
5. **Validate** — `validate_oneui_code(code, platform:"reactnative")`; self-heal to clean.
6. **Build, screenshot, compare, hand-fix** — this is not optional polish, it's step 6 of the
   pipeline. See "Build, screenshot & hand-fix loop" below. Skipping it means shipping a
   screen nobody has looked at next to the design it was supposed to match.

## Invocation
Always run with `codegen: true` — this is the canonical form (see
`FIGMA-TO-CODE-WORKFLOW.md` §5 in the target repo for the full worked example):
```
figma_to_code(
  figmaUrl,                      // must include ?node-id=...
  platform: "reactnative",
  brand, subBrand,               // subBrand = the <OneUIBrandProvider theme=...> value
  codegen: true,                 // pipeline writes the .native.tsx — do not run codegen:false
                                  // "extract only + hand-author from scratch" unless the user
                                  // explicitly asks for manual authoring (see workflow §5b.B)
  outDir: "src/screens",
  route: true,                   // also write src/app/<kebab>.tsx
  setIndex: true,                // point src/app/index.tsx at the new route so it boots
                                  // straight into the screen for screenshotting
  projectRoot: "<absolute path to the target RN project>",
)
```
`codegen:false` (extract-only, hand-author the whole screen from the refined tree) is a
distinct, user-invoked path documented in `FIGMA-TO-CODE-WORKFLOW.md` §5b.B — don't default
to it. The default for `/oneui:figma-to-native` and any "build this Figma screen" request is
always `codegen:true`.

## Mapping semantics (Figma → @oneui/ui-native)

### Attention level → variant (the core mapping)
| Figma attention | Variant | Fill / text |
|---|---|---|
| High | `bold` | role `Bold` fill, `Bold-High` text |
| Medium | `subtle` | role `Subtle` fill, `TintedA11y` text |
| Low | `ghost` | transparent fill, `TintedA11y` text |

### Surface Modes → `<Surface mode>` (not inline backgrounds)
A frame whose resolved Mode sets a surface becomes `<Surface mode="default|ghost|minimal|
subtle|moderate|bold|elevated">`. NEVER emit a `<View style={{ backgroundColor }}>` for a
tinted region — children only remap inside a `[data-surface]`/`<Surface>` container. Pick the
level with the `surface` skill; understand the remapping with `surface-context`.

### Size tokens → KB enums
Figma sends short size tokens; some KB components use word forms. Expand before matching:
`S → small`, `M → medium`, `L → large`, `XL → extra large`, `2XL → extra extra large`.
Match KB enums case-insensitively and emit the KB's canonical casing.

### Booleans
Figma toggle values `"On"/"Off"` (and `"true"/"false"`) → `prop={true|false}`.

### Icons
A glyph node (`ic_*`, possibly in a child's `component` field) → `icon={<Icon icon="ic_name" />}`.
The Icon component prop is **`icon`**, not `name`. Initialise the set once:
`import * as JioIcons from '@oneui/icons-jio-native'; JioIcons.initJioNativeIcons();`

### Images / Avatars
`@oneui/ui-native` Image/Avatar take `src` as a URL string, not an RN asset number. Resolve
the downloaded asset:
```tsx
import { Image as RNImage } from 'react-native';
function u(mod: number): string { return RNImage.resolveAssetSource(mod).uri; }
// ...
<Image src={u(require('../../assets/figma/<file>.png'))} alt="" />
```
`require()` paths MUST be relative to the screen file and start with `./` or `../` (Metro
rejects project-root-relative paths).

### Required a11y strings (prevents runtime `.trim()` crashes)
Components that call `.trim()` on a required a11y string (e.g. `Logo` on `alt`,
`BottomNavigation` on `aria-label`) crash if it's `undefined`. When Figma omits them, emit
the prop as `""` — but ONLY for the a11y allowlist (`alt`, `aria-label`, `aria-labelledby`,
`aria-describedby`). Do NOT blanket-emit `""` for other strings (e.g. `children`).

## React Native structural rules (runtime, not lint)
- **`<View>` must be imported** from `react-native` whenever used.
- **No bare text nodes in `<View>`.** A space before an inline `{/* comment */}` on the
  opening-tag line is a text literal and crashes with "Text strings must be rendered within a
  `<Text>` component." Put comments on their own child line:
  ```tsx
  <View>
    {/* Name */}
    ...children
  </View>
  ```
- Only `View` / `ScrollView` RN primitives are allowed by the native validator; everything
  else is a OneUI component.

## Self-heal loop
After codegen, read the result's **Codegen warnings** + refined tree, then run
`validate_oneui_code(platform:"reactnative")` and fix:
- `unknown-prop` → remove/rename via `get_component_info(name)`.
- `literal-color` / `hardcoded-font` → replace with `tokens.*`.
- forbidden RN primitive / banned icon lib → swap to the OneUI component / icon library.
Re-validate until "All clear", then confirm the app wraps the screen in
`<OneUIBrandProvider brand="..." theme="<subBrand>">`.

This loop only proves the file is well-formed OneUI code. It does NOT prove the screen
matches the Figma frame — proceed to the build/screenshot loop next; don't stop here.

## Build, screenshot & hand-fix loop (mandatory — run at least once)

`validate_oneui_code` is a lint gate, not a design review. Codegen routinely produces code
that passes validation but looks wrong: wrong surface level picked, an appearance role that
resolves to the wrong brand colour, a rail that clips its last card, a scrim-less dark image
with unreadable overlaid text, a spacing token mis-scaled. The only way to catch these is to
look at the rendered screen next to the design. Do this every time, not just when something
seems off:

1. **Build & launch.**
   ```bash
   npm run android          # = oneui-native-cdn prefetch && expo start --android
   # or: npm run ios
   ```
   Reload after edits with `r` in the Expo CLI, or `adb -s <device> shell input keyevent 82`
   for the dev menu. If images come up blank after an asset change, clear the Metro cache:
   `npx expo start -c`.

2. **Screenshot the running screen.**
   ```bash
   adb -s <device> exec-out screencap -p > /tmp/screen-actual.png
   ```
   (iOS Simulator: `xcrun simctl io booted screenshot /tmp/screen-actual.png`.)

3. **Get the Figma reference.** Use the Figma MCP's `get_screenshot` (or the design context
   already returned by `figma_to_code`) for the same node-id, so you're comparing the actual
   target frame, not a memory of it.

4. **Compare and enumerate concrete mismatches** — read both images and list what's actually
   different, e.g.:
   - wrong surface/appearance (a section that should read as a bold brand banner rendering
     as plain default background)
   - wrong colour role resolution (badge/accent showing the bundled default instead of the
     brand colour — check the brand cache / `theme` prop before assuming it's a token bug)
   - clipped or missing content (horizontal rail height hard-set instead of hugging content;
     last card cut off)
   - missing scrim/overlay causing unreadable text on an image
   - wrong spacing scale (gaps/padding visibly too tight or too loose vs the frame)
   - missing or wrong icon/image (blank image tile, generic icon standing in for a specific
     glyph)
   - typography mismatch (wrong variant/size/weight relative to the Figma text style)

5. **Hand-author the fix directly in the generated `.native.tsx`.** This is a normal code
   edit, not a pipeline change — fix the specific screen file using the mapping semantics
   above (surface modes, attention→variant, token-only spacing/colour). Re-run
   `validate_oneui_code` after every edit so a visual fix doesn't reintroduce a lint issue.

6. **Rebuild, re-screenshot, re-compare.** Repeat steps 1–5 until the rendered screen and the
   Figma frame agree on layout, colour roles, and content — there's no fixed numeric
   threshold, but treat "surface/colour roles look categorically wrong" or "content is
   missing/clipped" as blocking, not cosmetic.

7. **Completion contract (mandatory).** Cap this loop at **5 iterations** of steps 1–6. On
   each pass, either the mismatches shrink or they don't:
   - **Converged** (screen and frame agree on layout/colour/content) → done, report what was
     fixed.
   - **Not converged after 5 iterations** → do NOT silently declare the task complete. Report
     `NEEDS_HUMAN_INPUT` with the specific remaining blockers instead. A blocker is only
     legitimate after you've made **at least 3 distinct fix attempts** targeting different
     causes (not 3 retries of the same guess), and falls into one of:
     - the Figma node/file is inaccessible (404, wrong node-id, unauthorized token),
     - the design uses a feature the platform genuinely can't render (an animation/shader/
       blend mode with no OneUI or RN equivalent),
     - a missing primitive whose fix is an architecture decision (e.g. adopting a new
       charting/animation library), not a screen-level edit,
     - the mismatch has visibly plateaued across iterations despite different fixes tried.
   - Forbidden as a blocker: device/simulator dimension differences, minor icon-fidelity
     gaps, or safe-area offsets — those are fixable in the screen and don't excuse stopping.
   - Never use "it's close enough" or "validate_oneui_code is clean" as a substitute for
     actually reaching convergence or reporting `NEEDS_HUMAN_INPUT`.

8. **If a mismatch is systemic** (the same wrong mapping shows up across multiple screens —
   e.g. every `appearance="primary"` badge rendering the wrong brand colour, or every
   full-bleed rail clipping its last item), that's a pipeline bug, not a one-off. Fix it in
   `starter-mcp/src/lib/figmaCodegen.ts` (or the relevant lib file) so future `figma_to_code`
   runs don't regenerate the same defect — see "Notes on iterating" in
   `FIGMA-TO-CODE-WORKFLOW.md`. Hand-fixing the same class of bug screen-by-screen without
   ever touching the pipeline just means re-doing the same fix on the next screen.

Never report a figma-to-native task complete without having done at least one full pass of
this loop. If the target project has no working emulator/simulator or the Figma MCP
screenshot tool isn't available, say so explicitly instead of declaring success on
`validate_oneui_code` alone.

## Known fidelity gaps (review before declaring done — see CODEGEN-GAP-REPORT.md)
- Images render blank if `FIGMA_ACCESS_TOKEN` can't see the file (use an authorized token /
  shared file). Reference image content ONLY via the downloaded assets.
- Typography hierarchy and corner radius are only partially extracted today.
- Logo wordmark + empty IconButton `aria-label` are known low-priority limits.
