# @oneui/ui-native — Architecture

This document covers the key architectural decisions in the native component library, with particular focus on the Materials pipeline (the most recently added cross-cutting system).

---

## Package structure

```
packages/ui-native/
├── src/
│   ├── theme/                        # Brand provider, surface cascade, contexts
│   │   ├── OneUIBrandProvider.tsx    # Root provider — resolves brand/theme → native theme
│   │   ├── SurfaceContext.tsx        # Surface boundary + token cascade
│   │   ├── MaterialContext.tsx       # Resolved metallic material context + hooks
│   │   ├── materialRenderer.ts       # Renderer injection seam (setMaterialRenderer / getMaterialRenderer)
│   │   ├── foundationToNativeTheme.ts # Foundation JSON → OneUINativeTheme adapter
│   │   └── ...
│   └── components/
│       ├── Button/                   # Metallic auto-swap via tokenRef + role assignment
│       ├── Logo/                     # SVG gradient def injection
│       └── ...
packages/ui-native-materials/         # Optional: expo-linear-gradient renderer implementation
packages/shared/src/engine/
│   ├── materialNative.ts             # Pure resolver — brand config → ResolvedMaterials
│   └── materialSvg.ts                # Pure SVG string helpers — gradient def injection
```

---

## Materials pipeline

### Why a separate package?

`@oneui/ui-native` must stay free of native module dependencies (`expo-linear-gradient` requires a native build step). The **renderer-injection seam** decouples the rendering concern:

- `@oneui/ui-native` defines **what** to render (the `MaterialRenderer` interface) and **when** (when `getMaterialRenderer() != null && roleMaterial != null`).
- `@oneui/ui-native-materials` provides **how** to render (wraps `LinearGradient` from `expo-linear-gradient`).
- Apps opt in by calling `initOneUIMaterials()` once at startup. Without it, the fallback is the solid role Bold token — the app works, it just doesn't shimmer.

### Data flow (Convex → device)

```
Convex brand editor
  └─► getBrandOverviewData (foundation.materialConfig + foundation.materials.config)
        └─► exportBrandData.ts (trimBrandFoundation preserves materialConfig + materials.config)
              └─► brand-data/tira/latest.json
                    └─► OneUIBrandProvider receives BrandData
                          └─► foundationToNativeTheme.ts extracts materialConfig + materialsFoundationConfig
                                └─► @oneui/shared/engine resolveMaterials()
                                      └─► ResolvedMaterials { enabled[], assignments{}, metallic{} }
                                            └─► MaterialContextProvider (React context)
                                                  └─► useBrandMaterial() / useRoleMaterial(appearance)
```

### `resolveMaterials` (shared engine — `materialNative.ts`)

Pure function, no React dependencies:
1. Calls `mergeMaterialConfigWithFoundationConfig` to merge the component-level config with the foundation-level active metals + assignments delta.
2. Calls `normalizeMetallicConfig` to produce a full `MetallicConfig` (fills defaults from `DEFAULT_METALLIC_PRESETS` for any missing fields — e.g. `gradientAngle`, `gradientType`).
3. Calls `getEnabledMetallicPresets` + `normalizeMaterialAssignments` to build the enabled list and assignments map.
4. For each enabled preset, maps the `MetallicPreset` struct into `ResolvedMetallicGradient`:
   - `colors`: 8 hex stops in FILL_STOPS order (`shadow/base/baseLight/highlight/highlight/base/baseLight/shadow`).
   - `locations`: 8 fractional positions (0 → 1).
   - `strokeColors` / `strokeLocations`: 6-stop stroke gradient.
   - `text`: readable text colour on the fill.
   - `strokeColor`: solid stroke fallback.

### MaterialContext (`MaterialContext.tsx`)

```
OneUIBrandProvider
  └─► MaterialContextProvider value={nativeTheme.materials}
        └─► useBrandMaterial()  → ResolvedMaterials | null
        └─► useRoleMaterial(role)  → ResolvedMetallicGradient | null
              (looks up materials.assignments[role], then materials.metallic[preset])
```

### Renderer seam (`materialRenderer.ts`)

```ts
let renderer: MaterialRenderer | null = null;
export const setMaterialRenderer = (r: MaterialRenderer | null) => { renderer = r; };
export const getMaterialRenderer = () => renderer;
```

`initOneUIMaterials()` (from `@oneui/ui-native-materials`) calls `setMaterialRenderer({ renderMetallicFill })` where `renderMetallicFill` wraps `expo-linear-gradient`'s `LinearGradient`.

### Auto-swap in Surface and Button

Both `<Surface mode="bold">` and `<Button attention="high">` follow the same pattern:

```ts
const renderer = getMaterialRenderer();
const roleMaterial = useRoleMaterial(appearance);
const useMetallic = mode === 'bold' && material !== 'none' && renderer != null && roleMaterial != null;
```

Button additionally checks component `tokenRefs` — the brand editor can explicitly map `backgroundColor.bold` to `Material-Metallic-Gold-Fill`. This is the **tokenRef path** (explicit, per-component, highest priority). The **role-assignment path** is the fallback (brand assigns `primary → gold` globally, all bold surfaces in the primary role auto-swap).

---

## SVG metallic paint — Logo (`materialSvg.ts`)

The web platform injects CSS `var(--Material-Metallic-Gold-*)` references into the SVG `<defs>` so the gradient resolves via the CSS cascade. Native has no CSS cascade, so the stop colours must be literal hex values.

`@oneui/shared/engine/materialSvg.ts` is a platform-neutral SVG string manipulation module:

1. **`applyMetallicToSvg(svgContent, preset, gradientId, gradientType, gradientAngle, target, hexStops?)`**
   - Removes white background rects.
   - Replaces `fill`/`stroke` attributes and CSS declarations with `url(#gradientId)`.
   - Delegates to `injectMetallicGradientDef` to append the `<defs>` block.

2. **`injectMetallicGradientDef(svgContent, preset, gradientId, type, angle, hexStops?)`**
   - When `hexStops` is provided (native path): emits `stop-color="#hex"` — literal values from `ResolvedMetallicGradient.colors`.
   - When `hexStops` is omitted (web path): emits `stop-color="var(--Material-Metallic-Gold-Shadow)"` etc. — CSS var refs resolved at runtime by the browser.

Web `Logo.tsx` delegates to `applyMetallicToSvg` without `hexStops` (CSS vars).
Native `Logo.native.tsx` calls `applyMetallicToSvg` with `resolved.colors` from `useBrandMaterial()` (hex literals), falling back to `DEFAULT_METALLIC_PRESETS` if no brand data is available.

---

## Surface cascade (existing system — reference)

```
OneUINativeThemeProvider           ← root boundary at theme.rootParentStep
  └─► <Surface mode="bold">        ← calls resolveSurfaceBoundary(parent, scale, mode)
        ├─ childStep = resolveSurface('bold', parentStep, scale, dir, darkMode)
        ├─ childRoles = resolveNativeContextRoles(themeConfig, childStep, darkMode)
        └─► SurfaceContext.Provider value={childState}
              └─► useSurfaceTokens(appearance) → NativeRoleTokens at childStep
```

Anchors (`anchorBoldToBaseStep`) are stripped inside Surface boundaries so nested bold-variant components don't land on the same step as the surface fill (matching web's `[data-surface]` cascade behaviour).
