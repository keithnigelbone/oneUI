# `@oneui/ui-native` — Developer Guide

> The React Native peer of `@oneui/ui`. One library, one styling strategy, every component reads from the same Convex brand cascade Storybook does.

---

## 1. What is `ui-native`?

`packages/ui-native/` is OneUI's canonical React Native component library. It ships:

- **A theme runtime** — providers + hooks that turn a `OneUINativeTheme` object into surface-aware role tokens that components read at render time.
- **Wave-1 primitives** — `Button`, `Spinner`, `Badge`, `CounterBadge`, `IndicatorBadge`, `Container`, `Divider`, `Image`, `Logo`, `PaginationDots`, `Separator`.

It does **not** ship:

- Material effects (frosted/glass/metallic). Those live in [`@oneui/ui-native-materials`](../packages/ui-native-materials/) because they need `expo-blur` / `expo-linear-gradient` and aren't part of the brand cascade.
- Higher-order components (forms, dialogs, navigation). Wave-2 work.

### Why this library exists

OneUI on web pre-compiles every CSS rule into a stylesheet and the browser's CSS engine resolves `var(--Token)` at paint time. Per-render JS work is near zero. On RN, there's no CSS engine, so every styling library has to pick a strategy. We benchmarked five on `feat/native-sample-v4` (see commit `5790418f`):

| Strategy | Where styles live | Per-render JS |
|---|---|---|
| `ui-native` (pure JS, original) | Inline objects | High |
| `ui-rnr` (NativeWind) | className → StyleSheet ID via babel | Medium |
| `ui-tamagui` | AOT extraction, defeated by dynamic brand cascade | High |
| `ui-native-unistyles` (v3 + Nitro) | C++ theme registry, real CSS on web | Medium (when Nitro autolinked) |
| **`ui-native-buildtime`** | `StyleSheet.create({…})` hoisted to module scope | **Lowest** |

`StyleSheet.create({…})` at module load registers styles with the native bridge once. Renders pass numeric IDs across the JS↔native bridge instead of style objects. Only the OneUI brand-paint diff (a tiny one-key object) flows through inline style. This is the closest pure-RN analogue to web's profile and the lowest-overhead option that doesn't require a TurboModule.

The buildtime experiment won. `ui-native` is rebuilt on that pattern. The four comparator packages were retired.

---

## 2. Package layout

```
packages/ui-native/
├── package.json                         # Peer deps: react ^19, react-native >=0.76
├── tsconfig.json
└── src/
    ├── index.ts                         # Barrel — theme + 11 components
    ├── theme/
    │   ├── index.ts                     # Re-exports theme APIs
    │   ├── SurfaceContext.tsx           # Provider + Surface + useSurfaceTokens
    │   ├── RecipeContext.tsx            # Per-component recipe overrides
    │   ├── ReduceMotionContext.tsx      # A11y reduce-motion flag
    │   ├── useTypographyTokens.ts       # Per-role typography read
    │   └── defaultTheme.ts              # Bootstrap theme (no Convex needed)
    └── components/<Name>/               # × 11
        ├── <Name>.native.tsx            # Implementation
        ├── <Name>.showcase.native.tsx   # Static fixtures for the sample app
        └── index.ts                     # `export { <Name>, type <Name>Props }`
```

Every `<Name>.native.tsx` follows the same shape — see §6.

---

## 3. The data flow: brand → theme → component

```
Convex `brands` doc          (cloud)
        ↓
useQuery(api.foundations.    (RN runtime)
  getBrandOverviewData)
        ↓
foundationToNativeTheme       (adapter — apps/native-sample/src/utils)
        ↓
buildNativeTheme              (@oneui/shared/engine — pure function)
        ↓
OneUINativeTheme              (object: rootRoles + themeConfig + typography)
        ↓
<OneUINativeThemeProvider     (mounts ThemeContext + SurfaceContext)
   theme={…}>
        ↓
useSurfaceTokens('primary')   (component reads role-resolved tokens)
        ↓
<View style={[                (RN bridge ships numeric IDs + tiny override)
   styles.container,          ← registered at module load
   { backgroundColor:         ← runtime paint from brand
     paint.bg }]} />
```

Every box on the left side of the arrow is **pure** — same input, same output, memoise freely. Everything below `OneUINativeThemeProvider` is a React Context subscription, so brand switches re-render only consumers, not the whole tree.

---

## 4. The theme runtime

### 4.1 `<OneUINativeThemeProvider>`

Mount this once near the app root, passing it a `OneUINativeTheme | null`. While the theme is `null` (Convex query in flight, fonts loading) render a fallback — the provider returns the loading state via context.

```tsx
<OneUINativeThemeProvider theme={nativeTheme}>
  <App />
</OneUINativeThemeProvider>
```

Provider sets up four nested contexts (top → bottom):

1. **`ThemeContext`** — holds the full `OneUINativeTheme` so any consumer can read raw theme data via `useOneUITheme()`.
2. **`SurfaceContext`** — the root surface boundary (parentStep = 2500 light / 200 dark). `useSurfaceTokens(role)` reads from here.
3. **`RecipeContext`** — per-component recipe overrides (e.g. `{ button: { cornerRadius: 'pill' } }`).
4. **`ReduceMotionContext`** — surfaces `useReduceMotion()`. Driven by the OS a11y setting via `AccessibilityInfo`.

### 4.2 `<Surface>` and the cascade

Web does context awareness via `[data-surface="bold"]` CSS attribute remapping. Native does it via **explicit Surface components that push a new context**:

```tsx
<Surface mode="bold" appearance="primary">
  {/* descendants see new resolvedRoles, computed at the bold step */}
  <Button>Bold-coloured background, but the button still contrasts</Button>
</Surface>
```

What `<Surface>` does at render:

1. Reads the parent `SurfaceContext` (parentStep + themeConfig).
2. Calls `resolveSurface(mode, parentStep, scale, dir, darkMode)` → child step.
3. Calls `resolveNativeContextRoles(stripAnchors(themeConfig), childStep, darkMode)` → fresh `resolvedRoles` for the child boundary.
4. Pushes a new `SurfaceContext.Provider` with the child state.
5. Paints itself with `palette[childStep]` as `backgroundColor` (except for `mode="ghost"`, which inherits the parent fill).

The `stripAnchors` step is critical and what differentiates this from web. Some roles (primary, secondary, tertiary, quaternary, brand-bg) have `anchorBoldToBaseStep` set on their scale — at the root that pins `--{Role}-Bold` to `scale.baseStep` so brand fills stay recognisable. Inside a non-default surface, leaving the anchor on would make a bold-variant Button render the same step as the surface it sits on (invisible). Stripping the anchor lets `resolveSurface` compute a contrasting offset — mirrors web's `resolveContextTokenSet` semantics ([packages/shared/src/engine/surfaceNew.ts:778](../packages/shared/src/engine/surfaceNew.ts#L778)).

### 4.3 `useSurfaceTokens(role)`

The main hook every component reaches for. Returns a `NativeRoleTokens` object:

```ts
interface NativeRoleTokens {
  surfaces: Record<SurfaceToken, string>;    // default/ghost/minimal/subtle/moderate/bold/elevated
  content: Record<ContentToken, string>;     // high/medium/low/tinted/tintedA11y/strokeMedium/strokeLow
  onBoldContent: Record<ContentToken, string>;   // content tokens resolved against bold surface
  onSubtleContent: Record<ContentToken, string>; // content tokens resolved against subtle surface
  states: Record<StateToken, string>;        // hover/pressed/boldHover/boldPressed/subtleHover/subtlePressed
}
```

Fallback chain when the requested role isn't configured by the active brand:

```
appearance  →  primary  →  neutral
```

This mirrors web's CSS cascade — `var(--Sparkle-Bold, var(--Surface-Bold))` resolves at the primary-derived bold surface when sparkle is missing. Without this fallback, unconfigured roles on native used to land on gray neutral, which is why sparkle / tertiary / quaternary looked different from web for brands that don't define those scales.

### 4.4 Other theme hooks

- **`useOneUITheme()`** — full theme object (read sparingly, prefer `useSurfaceTokens`).
- **`useOptionalOneUITheme()`** — same but returns `null` instead of throwing. Use in shared utility code.
- **`useSurfaceContext()`** — current boundary value (`{ parentStep, darkMode, themeConfig, resolvedRoles }`). Power-user escape hatch.
- **`useComponentRecipe('button')`** — recipe selection map for a given component slug. Returns `{}` if no overrides.
- **`useReduceMotion()`** — `true` when the OS a11y flag is set. Components must short-circuit animations when this is true.
- **`useTypographyTokens('label', 'M')`** — returns `{ fontSize, lineHeight, fontWeight, fontFamily }` for a given typography role + size. Used for components that render text.

---

## 5. The build-time StyleSheet pattern

Every component file follows the same shape. Rules:

1. **Module-scope `StyleSheet.create({…})`** — every static value (layout, padding, radius, font sizes from `@oneui/tokens`, alignment, flex props) lives here. RN registers these styles with the native bridge ONCE at module load.

2. **O(1) variant lookup tables** — `const SIZE_STYLE = { 6: styles.size6, 8: styles.size8, … } as const`. Index at render time with `SIZE_STYLE[sizeKey]`. **No `useMemo`** for these: the registered StyleSheet ID is already a stable number.

3. **Runtime paint inline** — `useSurfaceTokens(role)` returns the live colours. Apply via `style={[styles.container, SIZE_STYLE[k], { backgroundColor: paint.bg }]}`. The bridge ships a small one-key object on top of registered IDs.

4. **`useMemo` only for multi-input derived overrides** — e.g. recipe-driven padding that depends on size + variant + density. Never for static lookups.

5. **`useCallback` for Pressable's function-form `style`** — keeps the reference stable so Pressable doesn't re-run the callback unnecessarily.

6. **Press-state colour flips stay in the Pressable callback** — `Animated.Value`-driven bg interpolation was measured as net-negative; do not reintroduce.

7. **Animated transforms (rotate, scale) use `Animated.Value`** with `useNativeDriver: true`. There's no static-style equivalent for animations.

### Why `StyleSheet.create({…})` matters

Without it:

```tsx
// SLOW — allocates a new object every render
<View style={{ width: 8, height: 8, borderRadius: 4, alignItems: 'center' }} />
```

With it (at module scope):

```tsx
const styles = StyleSheet.create({
  outer2XS: { width: 8, height: 8, borderRadius: 4, alignItems: 'center' },
});

// FAST — `styles.outer2XS` is `42` (a number). The native side already has the
// style at ID 42 in its registry. Bridge ships just the integer.
<View style={styles.outer2XS} />
```

For a Button grid with 240 buttons × 8–10 style keys each, this is the difference between thousands of object allocations per measurement and zero.

---

## 6. Component anatomy — Button as the canonical example

[`packages/ui-native/src/components/Button/Button.native.tsx`](../packages/ui-native/src/components/Button/Button.native.tsx) is the reference. Every other Wave-1 component follows the same shape.

### 6.1 Imports

```tsx
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  useButtonState,                          // resolves variant/appearance/size
  type ButtonProps,                        // shared with web
  type ButtonVariant,
} from '@oneui/ui/components/Button/shared';
import { tokens, touchTarget, typography } from '@oneui/tokens';
import {
  useComponentRecipe,                      // brand recipe overrides
  useOneUITheme,                           // for fontFamily
  useReduceMotion,
  useSurfaceTokens,
  type NativeRoleTokens,
} from '../../theme';
```

The `Props` type is imported from the **web package**'s `shared.ts` so native and web stay in lockstep. State resolution hooks (`useButtonState`, `useSpinnerGeometry`, etc.) also live there because they're platform-agnostic.

### 6.2 Module-scope StyleSheet

```tsx
const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', minWidth: touchTarget.min },
  containerFullWidth: { alignSelf: 'stretch', width: '100%' },
  size6:  { minHeight: tokens.dimension.f3, paddingVertical: tokens.spacing['5xs'], … },
  size8:  { … },
  size10: { … },
  size12: { … },
  pill: { borderRadius: tokens.shape.Pill },
  label6: { fontSize: typography.size.xs, lineHeight: 16, fontWeight: '700' },
  // …
});

const SIZE_STYLE = { 6: styles.size6, 8: styles.size8, 10: styles.size10, 12: styles.size12 } as const;
```

### 6.3 Render-path paint resolver

```tsx
interface Paint {
  bg: string; text: string; pressedBg: string; hoverBg: string;
}

const VARIANT_PAINT: Record<ButtonVariant, (role: NativeRoleTokens) => Paint> = {
  bold:   (r) => ({ bg: r.surfaces.bold,   text: r.onBoldContent.high,   pressedBg: r.states.boldPressed,   hoverBg: r.states.boldHover }),
  subtle: (r) => ({ bg: r.surfaces.subtle, text: r.onSubtleContent.tintedA11y, pressedBg: r.states.subtlePressed, hoverBg: r.states.subtleHover }),
  ghost:  (r) => ({ bg: 'transparent',     text: r.content.tintedA11y,         pressedBg: r.states.subtleHover, hoverBg: r.states.subtleHover }),
};
```

Three static functions — `Record` indexing at render is O(1). No allocations beyond the returned `Paint` literal.

### 6.4 The component

```tsx
export function Button(props: ButtonProps): React.ReactElement {
  const { isDisabled, resolvedVariant, resolvedAppearance, numericSize } = useButtonState(props);
  const role  = useSurfaceTokens(resolvedAppearance);
  const paint = VARIANT_PAINT[resolvedVariant](role);
  const labelFontFamily = useOneUITheme().typography.fontFamilies.primary;
  const sizeKey = numericSize as 6 | 8 | 10 | 12;

  const sizeBaseStyle  = SIZE_STYLE[sizeKey];
  const labelBaseStyle = LABEL_STYLE[sizeKey];

  const pressableStyle = useCallback(
    ({ pressed }) => [
      styles.container,
      sizeBaseStyle,
      props.contained ? styles.pill : null,
      props.contained && { backgroundColor: pressed ? paint.pressedBg : paint.bg },
    ],
    [sizeBaseStyle, props.contained, paint.bg, paint.pressedBg],
  );

  const labelStyle = useMemo(
    () => [labelBaseStyle, { color: paint.text, fontFamily: labelFontFamily }],
    [labelBaseStyle, paint.text, labelFontFamily],
  );

  return (
    <Pressable disabled={isDisabled} onPress={props.onPress} style={pressableStyle}>
      <Text style={labelStyle}>{props.children}</Text>
    </Pressable>
  );
}
```

Notice what's **not** here:

- No fresh `StyleSheet.create` per render.
- No object spread of static styles.
- No deep `useMemo` over arrays of registered IDs.

The render path allocates: `paint` (4-key object), `pressableStyle` (returned via stable `useCallback`), `labelStyle` (memoised on its 3 dependencies). That's it.

---

## 7. How `apps/native-sample` wires everything

[`apps/native-sample/`](../apps/native-sample/) is the verification app. Its job: drive every Wave-1 component against live brand data, exactly like Storybook does on web.

### 7.1 Provider stack ([App.tsx](../apps/native-sample/App.tsx))

```tsx
<GestureHandlerRootView>
  <SafeAreaProvider>
    <ConvexProvider client={convexClient}>          {/* websocket to brand backend */}
      <PageContextProvider>                          {/* theme/density/brand selectors */}
        <ThemedShell />
      </PageContextProvider>
    </ConvexProvider>
  </SafeAreaProvider>
</GestureHandlerRootView>
```

### 7.2 Brand selection ([src/hooks/useActiveBrand.ts](../apps/native-sample/src/hooks/useActiveBrand.ts))

```ts
const brands = useQuery(api.brands.list);
// AsyncStorage hydration → resolved → setActiveId → persisted on change
```

Falls back to `Jio` brand on first launch, then any non-system brand, then first brand. Persists to AsyncStorage under `oneui-native-sample:last-brand-id` so launches stay sticky.

### 7.3 Theme builder ([src/useNativeTheme.ts](../apps/native-sample/src/useNativeTheme.ts))

```ts
const foundationData = useQuery(
  api.foundations.getBrandOverviewData,
  brandId ? { brandId } : 'skip',
);

return useMemo(
  () => foundationToNativeTheme(foundationData, theme),
  [foundationData, theme],
);
```

`foundationToNativeTheme` is a thin adapter that unwraps the Convex envelope (`{ color: { config }, appearanceConfig, typography: { config }, customFonts }`) and calls `buildNativeTheme()` from `@oneui/shared/engine`. Pure function — re-runs only when `foundationData` or `theme` change.

### 7.4 Font loading — bundled, app-owned

Fonts are **bundled with the app**, not downloaded at runtime. The library has no opinion about font loading — that's the app's responsibility.

In [`apps/native-sample/App.tsx`](../apps/native-sample/App.tsx):

```ts
import { useFonts } from 'expo-font';

const [fontsReady] = useFonts({
  JioType: require('./assets/fonts/JioTypeVar.ttf'),
});

if (!fontsReady) return <LoadingFallback />;
```

The family name on the left of each entry (e.g. `JioType`) must match what the brand cascade resolves to via `theme.typography.fontFamilies.primary`. If a brand's Convex `customFonts` row says `familyName: 'JioType'`, the component `style={{ fontFamily: 'JioType' }}` looks up the bundled font.

To add another brand font: drop the `.ttf` into [`apps/native-sample/assets/fonts/`](../apps/native-sample/assets/fonts/) and add it to the `useFonts` map. No runtime download, no library hook.

The library previously shipped a `useBrandFonts` hook that downloaded fonts from Convex URLs on the fly. That was over-engineered — bundling is simpler, faster on cold start, and survives offline mode.

### 7.5 Final mount

```tsx
if (!nativeTheme || !fontsReady) return <LoadingFallback />;

return (
  <OneUINativeThemeProvider theme={nativeTheme}>
    <NavigationContainer>
      <Drawer.Navigator>{/* …screens… */}</Drawer.Navigator>
    </NavigationContainer>
  </OneUINativeThemeProvider>
);
```

Every screen below this point uses `useSurfaceTokens(appearance)` and reads brand-resolved tokens at render time. Brand switches in the TopBar are a single `setActiveId(newId)` call — `useQuery` re-fires, foundation data flows through, theme rebuilds, components re-render with new tokens. No remount, no reload.

---

## 8. Environment configuration

`apps/native-sample/.env.local`:

```
EXPO_PUBLIC_CONVEX_URL=https://robust-stoat-734.convex.cloud
```

Same deployment Storybook and the platform app use. Whatever brands you create in the platform app appear in native-sample within seconds (Convex websocket pushes updates live).

To point at a different deployment, edit the URL and restart Metro with `--clear` so the new value bakes into the bundle.

---

## 9. Adding a new component

### Step 1 — Add `index.shared.ts` to `packages/ui/src/components/<Name>/`

```ts
// packages/ui/src/components/<Name>/index.shared.ts
export { use<Name>State } from './<Name>.shared';
export type { <Name>Props } from './<Name>.shared';
```

This is the cross-platform contract. Web's `<Name>.tsx` and native's `<Name>.native.tsx` both import from this path. Without it, the shared-types deep import (`@oneui/ui/components/<Name>/shared`) won't resolve on either platform.

### Step 2 — Create `packages/ui-native/src/components/<Name>/<Name>.native.tsx`

Follow the Button reference in §6. Build the module-scope StyleSheet, the variant lookup tables, the paint resolver, and the render. Read tokens via `useSurfaceTokens(appearance)`. If you render text, read `useOneUITheme().typography.fontFamilies.primary` for the font.

### Step 3 — Add a showcase

```ts
// packages/ui-native/src/components/<Name>/<Name>.showcase.native.tsx
export function <Name>Sizes(): React.ReactElement { /* … */ }
export function <Name>States(): React.ReactElement { /* … */ }
```

Used by `apps/native-sample/src/screens/ComponentGalleryScreen.tsx` to verify the cascade end-to-end.

### Step 4 — Barrel exports

```ts
// packages/ui-native/src/components/<Name>/index.ts
export { <Name>, type <Name>Props } from './<Name>.native';

// packages/ui-native/src/index.ts (add)
export { <Name>, type <Name>Props } from './components/<Name>';
```

### Step 5 — Add the showcase route to `package.json` exports

```jsonc
{
  "exports": {
    "./showcase/<Name>": "./src/components/<Name>/<Name>.showcase.native.tsx"
  }
}
```

### Step 6 — Verify

```bash
pnpm --filter @oneui/ui-native typecheck
pnpm check:literals
pnpm validate:tokens
pnpm check:parity        # ensures every web component has a native peer
```

---

## 10. Performance envelope

| Metric | Target | Mechanism |
|---|---|---|
| Per-render allocations (Button) | ≤ 4 objects | StyleSheet IDs + memoised arrays |
| Mount time (240 Buttons) | < 350 ms cold, < 250 ms warm | Module-scope StyleSheet registry |
| Brand switch re-render | < 50 ms | Context propagation only — no remount |
| Font load (cold) | < 1 s typical | `expo-font` + cached fingerprint |

`apps/native-sample/src/screens/PerformanceScreen.tsx` runs a 60-Button mount benchmark across 5 iterations (first 2 warmup, last 3 signal). Run-to-run variance ±15% — use it as a tripwire, not absolute truth.

---

## 11. Known gotchas

### 11.1 React 19 type alignment

All workspace packages pin `react@19.1.0` (exact) and `@types/react@~19.1.10`. Any caret `^19.x` pin allows pnpm to hoist a newer minor that breaks `ReactNode` type compatibility with `@react-navigation`. If you add a new package that touches the JSX surface, copy the same pins.

### 11.2 `react-native-worklets` version

`react-native-reanimated@4.1.7` accepts worklets `0.5 - 0.8` but Expo Go SDK 54 ships native worklets `0.5.1`. Without an explicit pin pnpm picks `0.8.x` and the app crashes at mount with a worklets-mismatch error. The fix is a direct dep in `apps/native-sample/package.json`:

```jsonc
"react-native-worklets": "0.5.1"
```

### 11.3 No `useSpacing` / `useTouchTarget`

The feat-branch ui-native exposed density-aware spacing hooks. We removed them because dev's `@oneui/shared/engine` doesn't export `NativeSpacingTokens` / `NativeTouchTargetTokens` types. Components on dev read static spacing from `@oneui/tokens` directly. If you need density-aware spacing later, add the types to shared/engine first.

### 11.4 Materials are in a different package

`TranslucentView` / `FrostedView` / `GlassView` / `MetallicView` live in `@oneui/ui-native-materials`. They're not part of the brand cascade — they use `tokens.material.*` static values from `@oneui/tokens`. If you need them, add `@oneui/ui-native-materials: "workspace:*"` to your app's dependencies and import directly.

### 11.5 `check:parity` will fail until Wave-2 components ship

The parity gate enforces that every web component has a `.native.tsx` peer. Only 11 Wave-1 components are ported. The other ~57 web components are missing native peers — pre-existing state, not a regression. Treat the gate as informational until you commit to bringing the next wave across.

### 11.6 `INTENTIONAL-LITERAL` markers in Button

Button has line-height values (16, 18, 20, 22) and Badge has padding values (4, 2) that don't have direct token equivalents. The `INTENTIONAL-LITERAL` comment in those files silences `pnpm check:literals` and documents why. Don't remove unless you've ported them to tokens.

---

## 12. Quick reference: when to reach for what

| If you need to… | Use… |
|---|---|
| Read the live brand colour for a role | `useSurfaceTokens(appearance).surfaces.bold` etc. |
| Read brand font for text | `useOneUITheme().typography.fontFamilies.primary` |
| Render text with a typed role | `useTypographyTokens('label', 'M')` |
| Wrap a coloured region | `<Surface mode="bold" appearance="primary">` |
| Per-component brand customisation | `useComponentRecipe('button')` |
| Respect OS reduce-motion | `useReduceMotion()` |
| Read the raw theme | `useOneUITheme()` (sparingly) |
| Read the current boundary | `useSurfaceContext()` (power user) |

---

## 13. File map

| File | Purpose |
|---|---|
| [`packages/ui-native/src/theme/SurfaceContext.tsx`](../packages/ui-native/src/theme/SurfaceContext.tsx) | Provider, `<Surface>`, `useSurfaceTokens` |
| [`packages/ui-native/src/theme/RecipeContext.tsx`](../packages/ui-native/src/theme/RecipeContext.tsx) | Per-component recipe overrides |
| [`packages/ui-native/src/theme/ReduceMotionContext.tsx`](../packages/ui-native/src/theme/ReduceMotionContext.tsx) | OS a11y reduce-motion flag |
| [`packages/ui-native/src/theme/useTypographyTokens.ts`](../packages/ui-native/src/theme/useTypographyTokens.ts) | Per-role typography hook |
| [`packages/ui-native/src/components/Button/Button.native.tsx`](../packages/ui-native/src/components/Button/Button.native.tsx) | Canonical buildtime pattern reference |
| [`packages/shared/src/engine/buildNativeTheme.ts`](../packages/shared/src/engine/buildNativeTheme.ts) | Pure function: `BuildNativeThemeInput` → `OneUINativeTheme` |
| [`packages/shared/src/engine/surfaceNew.ts`](../packages/shared/src/engine/surfaceNew.ts) | `resolveSurface`, `resolveTokenSet`, `resolveContextTokenSet` |
| [`packages/shared/src/engine/buildNativeTypography.ts`](../packages/shared/src/engine/buildNativeTypography.ts) | Typography role/size → `NativeTypeStyle` |
| [`apps/native-sample/App.tsx`](../apps/native-sample/App.tsx) | Provider stack, Convex URL boot |
| [`apps/native-sample/src/useNativeTheme.ts`](../apps/native-sample/src/useNativeTheme.ts) | Convex query → `buildNativeTheme` |
| [`apps/native-sample/assets/fonts/`](../apps/native-sample/assets/fonts/) | App-bundled brand fonts (registered in `App.tsx` via `useFonts`) |
| [`apps/native-sample/src/hooks/useActiveBrand.ts`](../apps/native-sample/src/hooks/useActiveBrand.ts) | AsyncStorage-backed brand selection |
| [`apps/native-sample/src/ThemedShell.tsx`](../apps/native-sample/src/ThemedShell.tsx) | Final mount: provider + drawer nav |

---

## 14. Related docs

- [`architecture.md`](architecture.md) — full system architecture (web + native)
- [`surface-context-awareness.md`](surface-context-awareness.md) — the 7-token surface model, applies on both platforms
- [`fouc-prevention.md`](fouc-prevention.md) — web FOUC prevention (native equivalent is the `fontsReady` gate)
- [`perf-harness.md`](perf-harness.md) — brand-CSS pipeline benchmark (web)
- [`storybook-platform-sync.md`](storybook-platform-sync.md) — Storybook addon that reads from the same Convex deployment
