# Flutter vs web Storybook — dimension numbers

## Short answer

**Neither implementation is wrong in isolation.** Both use the same `@oneui/shared` foundation:

- **`extractDimensionBlocks` → `getBaseSizesForBreakpoint`** interpolates each density’s base (e.g. compact mobile/desktop `baseSize`) across the platform foundation’s `minViewport` / `maxViewport` at each **active breakpoint width**.
- **`viewportToV2PlatformId(width)`** maps that width to a breakpoint id (`S` … `L`).
- Scale steps are **`base × SCALE_RATIOS`** (so `f-2` is always `0.75×f0`, `f2` is `1.25×f0`, etc.).

Numbers only disagree when **the width used to pick the tier and interpolation** differs.

## Tira example (compact)

| Observation | `f0` | `f-2` (= 0.75×f0) |
|-------------|------|---------------------|
| React (~11.29px) | **15.05px** | Interpolation as at **~768px** (M bucket) |
| Flutter (~11.77px) | **15.70px** | Interpolation as at **~1024px** (L bucket) |

Same ratio math; different **effective width** in the pipeline.

## Web React Storybook

- `PlatformDensityScope` in `apps/storybook/.storybook/preview.ts` sets `data-Breakpoint` from the **preview iframe’s** `window.innerWidth` when the toolbar is “Responsive”.
- `Density.stories.tsx` scopes each column with `data-Breakpoint` + `data-6-Density`; `getComputedStyle` reads `--Dimension-*`.
- Brand CSS uses **`generateDimensionCSS`** (same `extractDimensionBlocks` as Convex). Blocks identical to static tables are not re-emitted; brand-interpolated rows still apply.

## Flutter Storybook

- **`OneUiScope.platformId`** uses `viewportToV2PlatformId(story column width)` when “Responsive” (`_effectiveV2Platform(inner.maxWidth)`).
- That width is the **story column** (after the optional 272px sidebar), not the React **iframe** width.
- Convex **`buildStructuredDimensionContexts`** uses the same TS **`extractDimensionBlocks`**. Flutter reads the context for **`platformId` + density**.

If the story column is **wider** than the React preview iframe, Flutter can sit in **L** while React sits in **M**, shifting every step (~4% for Tira compact).

## React Native (third view)

RN uses **`NativeThemeContext.platform`** (`mobile` | `tablet` | `desktop`) and **`mapNativePlatformToV2DimensionPlatform`** — a **coarse** mapping, not continuous `innerWidth`. That is intentional for devices and is not the same as Storybook iframe semantics.

## Matching numbers

1. Use the **same fixed viewport** on both toolbars (e.g. **768** or **1024**), not “Responsive”; or  
2. Resize so the **iframe width** (web) and **story column width** (Flutter) fall in the same `viewportToV2PlatformId` bucket.

See the Flutter header line: it now prints **story column width in px** when comparing.
