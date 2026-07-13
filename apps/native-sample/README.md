# `@oneui/native-sample`

React Native peer of `apps/v4-sample` — an Expo app that exercises every
public surface of `@oneui/ui-native` (`Surface`, `useSurfaceTokens`, the
recipe pipeline, the only shipped component `Button`) on the same brand /
theme / density / appearance switches the web verifier ships.

## Quick start

```bash
pnpm install
pnpm --filter @oneui/native-sample dev    # opens the Expo dev server
pnpm --filter @oneui/native-sample web    # web preview at http://localhost:8081
pnpm --filter @oneui/native-sample ios    # iOS simulator (macOS)
pnpm --filter @oneui/native-sample android
```

`pnpm --filter @oneui/native-sample typecheck` is wired as a quality gate.

## What's in the app

13 drawer routes mirroring the web verifier:

| Route | Verifies |
|---|---|
| Colour palette | 25-step OkLCH ramp resolved for the active appearance |
| Surface tokens | 7 surface tokens × idle / hover / pressed |
| Content tokens | 7 content tokens nested inside each `<Surface>` mode |
| Stroke tokens | `tokens.borderWidth.{hairline, thin}` × `content.strokeMedium / strokeLow` |
| Interaction states | Idle / hover (static) / pressed (live) |
| Component gallery | Button under every surface mode + appearance + size |
| Foundations | Hub linking to Dimensions / Spacings / Shape / Strokes |
| Dimensions | f-step bars, base resolved for active density |
| Spacings | Numeric spacing scale (0 → 40) tile preview |
| Shape | Border-radius scale rendered as rounded views |
| Strokes | Fixed (S → 2XL) + dimension-referenced (3XL → 9XL) widths |
| Demo | Five nested `<Surface>` containers; per-level mode picker |
| Components | List of 60+ web component slugs; only `Button` has a real native preview |

The header (top of every screen) hosts four selectors:

- **Theme** — `light` / `dark` / `dim`
- **Density** — `compact` / `default` / `open`
- **Appearance** — 8 roles (`primary` / `secondary` / `sparkle` / `neutral` / `positive` / `negative` / `informative` / `warning`)
- **Brand** — `myjio1` / `jiocinema` / `jiomart` / `jiohotstar`

`myjio1` uses the JDS-authored OkLCH ramps (indigo / saffron / green /
informative) ported verbatim from `LayersSDL/.../config.json`. The other
three brands feed a single hue/chroma into `generateColorScale` — the
synthesised ramp matches what `@oneui/tokens/css/brands/<brand>.css`
produces on web.

## Architecture

```
App.tsx
  └─ GestureHandlerRootView
       └─ SafeAreaProvider
            └─ PageContextProvider          (theme / density / appearance / brand state)
                 └─ ThemedShell             (builds OneUINativeTheme + mounts navigation)
                      ├─ OneUINativeThemeProvider
                      └─ NavigationContainer
                           └─ Drawer.Navigator
                                ├─ TopBar (header)
                                ├─ ColourPaletteScreen
                                ├─ SurfaceTokensScreen
                                ├─ ...
                                └─ ComponentsStack (NativeStack: List + Detail)
```

Brand → `OneUINativeTheme` flow:

```
PageContext { brand, theme, density }
        │
        ▼
useNativeTheme(brand, theme, density)         ← memoised
        │
        ▼
buildBrandFoundation(brand)                   ← 4 BuildNativeThemeInputs
        │
        ▼
buildNativeTheme(input, ctx)                  ← @oneui/shared/engine
        │
        ▼
OneUINativeTheme  → <OneUINativeThemeProvider>
                    └ rootRoles, themeConfig, rootParentStep
```

## Known gaps (vs `apps/v4-sample`)

- **Live brand source** — web verifier hits Convex for 25 brands; native v1
  ships only the four static seeds. Adding live mode is a separate
  workstream (Convex client + brand fetch hook).
- **Component detail screens** — only `Button` has a real native preview.
  Every other slug shows a "native port pending" panel pointing to
  `apps/v4-sample` for the full reference.
- **Viewport slider** — web's `FoundationsControls` exposes a viewport
  toggle. On native we use `useWindowDimensions().width` (the actual
  device width) so the slider collapses out.
- **DemoPage step labels** — web shows the resolved hex per level; native
  shows the resolved step (matches `useSurfaceContext().parentStep`).
  Adding the hex requires reaching into `themeConfig.appearances[role].
  palette[step]` per level — straightforward when needed.

## Where to find things

- Brand seeds — [`src/brandFoundations.ts`](src/brandFoundations.ts)
- JDS palettes — [`src/jdsPalettes.ts`](src/jdsPalettes.ts) (verbatim from `feat/v4-sample-verifier`)
- Foundation logic — [`src/foundations-core/`](src/foundations-core/) (vendored from `OneUIFoundationsApp`)
- Theme builder — [`src/useNativeTheme.ts`](src/useNativeTheme.ts)
- Shell composition — [`src/ThemedShell.tsx`](src/ThemedShell.tsx)
- Top-bar selectors — [`src/components/TopBar.tsx`](src/components/TopBar.tsx)
- Native registry — [`src/screens/components/nativeRegistry.ts`](src/screens/components/nativeRegistry.ts)

## Companion repos

- Web verifier: [`apps/v4-sample`](../v4-sample/) — one-to-one peer; same
  routes, same selectors, same brand seeds.
- Native components: [`packages/ui-native`](../../packages/ui-native/) —
  the only place `*.native.tsx` lives. Add a new component, ship a
  showcase under `*.showcase.native.tsx`, and the registry picks it up
  once you flip `hasNativeImpl: true` and add a detail-screen branch.
