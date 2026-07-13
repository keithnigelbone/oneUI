# Native motion pipeline

This document describes how motion tokens reach React Native components and how they stay aligned with web `primitives.css` and Convex `motionConfigs`.

## Data flow

1. **Convex** — `foundations:getBrandOverviewData` loads the `motionConfigs` and `elevationConfigs` rows for the brand (when present) and returns `motionConfig` / `elevationConfig` alongside colour, typography, and appearance data (`packages/convex/convex/foundations.ts`).
2. **App glue** — `foundationToNativeTheme` maps that payload into `buildNativeTheme({ …, motionConfig, elevationConfig })` (`apps/native-sample`, `apps/native-components-sample`, `apps/mobile`).
3. **Engine** — `buildNativeMotion` / `buildNativeElevation` in `@oneui/shared/engine` produce `OneUINativeTheme.motion` and `OneUINativeTheme.elevation`. Durations and offsets use `computeMotionScale` (same 1.5× ladder as web). Easings include both a CSS string and a parsed `[x1,y1,x2,y2]` tuple for `Easing.bezier` on RN.
4. **Theme provider** — `<OneUINativeThemeProvider>` supplies the theme; `<MotionProvider>` receives `baseMotion={theme?.motion ?? null}` and merges optional `motionOverrides` (`packages/ui-native/src/theme/SurfaceContext.tsx`, `MotionContext.tsx`).
5. **Components** — `useMotion()` returns the merged bundle (tap scales, springs, spinner `rotationMs`, duration/offset ladders, distances, easings).

## Caching

`meta.brandHash` includes fingerprints for motion and elevation inputs so memoised theme consumers refresh when those rows change.

## Elevation

`useElevation()` reads `OneUINativeTheme.elevation` (per-level iOS shadow summary + Android elevation hint). The first UI component to apply shadows is left to product/design; the resolver is ready for cards, dialogs, or elevated surfaces.

## Legacy `@oneui/tokens` `tokens.motion.duration`

The discreet/expressive object in `packages/tokens/src/index.ts` is legacy for non–theme-aware paths. Native UI inside `OneUINativeThemeProvider` should use **`useMotion()`** so brand `baseDuration` and easings apply.
