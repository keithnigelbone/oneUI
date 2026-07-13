---
name: figma-to-native
version: 0.1.0
visibility: public
description: >
  Turn a Figma frame into a runnable @oneui/ui-native (React Native) screen with the
  OneUI MCP's figma_to_code pipeline, then certify it with validate_oneui_code. Use this
  skill whenever building a React Native screen FROM a Figma design (a figma.com URL with
  a node-id), when running /oneui:figma-to-native, or when debugging the extract → refine →
  download-assets → codegen → validate chain. It owns the Figma→RN mapping semantics
  (Figma size tokens → KB enums, attention → variant, surface Modes → <Surface mode>,
  required a11y string defaults, icon/image wiring) and the runtime-error fixes that make
  generated code run without manual edits. For WHICH surface level a region earns defer to
  `surface`; for the [data-surface] remapping mechanism defer to `surface-context`; for
  component-API correctness defer to `oneui`.
---

# Figma → @oneui/ui-native

The OneUI MCP `figma_to_code` tool extracts a Figma frame and (with `codegen=true`)
generates a `@oneui/ui-native` screen written to disk. This skill is how you drive it and
how you read/repair its output so the screen runs and passes the gate.

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

## Invocation
```
figma_to_code(
  figmaUrl,                      // must include ?node-id=...
  platform: "reactnative",
  brand, subBrand,               // subBrand = the <OneUIBrandProvider theme=...> value
  codegen: true,
  outDir: "src/screens",
  route: true,                   // also write src/app/<kebab>.tsx
)
```

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

## Known fidelity gaps (review before declaring done — see CODEGEN-GAP-REPORT.md)
- Images render blank if `FIGMA_ACCESS_TOKEN` can't see the file (use an authorized token /
  shared file). Reference image content ONLY via the downloaded assets.
- Typography hierarchy and corner radius are only partially extracted today.
- Logo wordmark + empty IconButton `aria-label` are known low-priority limits.
