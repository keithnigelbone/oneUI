# Image — Web ↔ Native parity

This document compares the **React (web)** and **React Native** Image implementations, mapping every Storybook story onto a native showcase section and listing each intentional / remaining difference.

| Area | Web | Native |
|---|---|---|
| Component | `packages/ui/src/components/Image/Image.tsx` | `packages/ui-native/src/components/Image/Image.native.tsx` |
| Static visuals | `Image.module.css` | `Image.styles.native.ts` |
| Prop contract / state | `Image.shared.ts` | `interface.ts` (locally owned per the native build playbook) |
| Stories / showcase | `Image.stories.tsx` | `Image.showcase.native.tsx` |

## 1. Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `ImageDefault` | **Aligned** |
| 2 | `AspectRatios` | `ImageAspectRatios` | **Aligned** — full 12-ratio set incl. `auto`, `1:2`, `2:1`, `2:3`, `9:21`, `21:9` |
| 3 | `ObjectFitModes` | `ImageObjectFitModes` | **Partially aligned** — native renders the four canonical RN modes (`cover`/`contain`/`fill`/`none`); the extended CSS keywords (`scale-down` / `inherit` / `initial` / `revert` / `revert-layer` / `unset`) are web-only and intentionally skipped (the native section calls this out inline) |
| 4 | `States` | `ImageStates` | **Aligned** — Default / Interactive / Disabled / Default-fallback |
| 5 | `WithFallback` | `ImageWithFallback` | **Aligned** — Valid / default / custom React node / `fallbackSrc` URL |
| 6 | `Interactive` | `ImageInteractive` | **Aligned** (no play function on native — Pressable handles tap dispatching) |
| 7 | `Responsive` | `ImageResponsive` | **Aligned** — 100% / 75% / 50% widths via percentage strings |
| 8 | `CornerRadius` | `ImageCornerRadius` | **Aligned** in shape (1:1 / 16:9 / 4:3 stripes) — native uses the t-shirt shape scale (`xs`/`s`/`m`/`l`/`xl`/`2xl`/`3xl`) which has fewer steps than the web 25-step f-scale; same progression direction |
| 9 | `WebHtmlAttributes` | (omitted) | **Web-only** — `srcSet`, `sizes`, `loading`, `crossOrigin`, `decoding`, `draggable`, `lottieAttributes`, `fit`-vs-`objectFit` precedence are all HTML `<img>` concerns. The `fit` precedence rule is mirrored on native (see § 3 below); the rest have no native counterpart |
| — | (no web story) | `ImageGallery` | **Native-only extra** — tile-grid layout used by the sample app's gallery preview |

## 2. Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `src` | ✅ | ✅ | required string |
| `alt` | ✅ | ✅ | required, becomes `accessibilityLabel` on native |
| `aspectRatio` | ✅ | ✅ | Full 12-value union mirrored |
| `interactive` | ✅ | ✅ | Wraps in `Pressable` on native |
| `disabled` | ✅ | ✅ | Native applies `opacity: --Image-disabledOpacity` (0.5) |
| `fit` | ✅ | ✅ | Alias for `objectFit`; `fit` wins when both supplied (mirrors web `Image.tsx`). Figma's `container` normalises to `contain` on native |
| `objectFit` | ✅ | ✅ | Native: `cover` / `contain` / `fill` / `none` map to `RNImage.resizeMode` |
| `objectPosition` | ✅ | ⚠️ | Accepted on native props for API symmetry but currently a no-op (RN has no equivalent of CSS `object-position`) |
| `loading` | ✅ | ⚠️ | Accepted on native props; no-op (RN images are eager) |
| `srcSet` | ✅ | ❌ | Web-only HTML attribute |
| `sizes` | ✅ | ❌ | Web-only HTML attribute |
| `crossOrigin` | ✅ | ❌ | Web-only |
| `decoding` | ✅ | ❌ | Web-only |
| `draggable` | ✅ | ❌ | Web-only |
| `lottieAttributes` | ✅ | ❌ | Web-only — JSON-serialised to `data-oneui-lottie` on the root |
| `width`, `height` | ✅ | ✅ | Number → px, string → percentage / dimension |
| `onPress` | ✅ | ✅ | Same name on both platforms |
| `onClick` | ✅ | ✅ | Accepted as alias on native |
| `onLoad`, `onError` | ✅ | ✅ | Forwarded from `RNImage` |
| `fallback` (ReactNode) | ✅ | ✅ | Wins over `fallbackSrc` |
| `fallbackSrc` (string) | ✅ | ✅ | When the primary `src` errors and no `fallback` node is supplied, native swaps to the fallback URL once. If that also fails, the neutral fallback paint shows |
| `style` | ✅ | ✅ | `CSSProperties` → `ViewStyle` |
| `className` | ✅ | ❌ | Web-only |
| `aria-label` | ✅ | ✅ | Forwarded to `accessibilityLabel` on native |
| `testID` | ✅ | ✅ | Web emits `data-testid`, native uses RN's `testID` |

## 3. Behaviour parity

### `fit` vs `objectFit` precedence

```ts
// resolveObjectFit (interface.ts) — mirrors web Image.tsx
return normalizeObjectFit(props.fit ?? props.objectFit);
```

Same precedence on both platforms. Native additionally maps Figma's `fit="container"` to `contain` before `RNImage.resizeMode` lookup.

### Fallback cascade

| Order | Web | Native |
|---|---|---|
| 1 | Render `<img src={src}>` | Render `<RNImage source={{ uri: src }}>` |
| 2 | If `fallback` node + load error → render the node | Same |
| 3 | If `fallbackSrc` URL + load error → swap `<img src>` | Swap RN `<RNImage source>` once |
| 4 | If everything fails → default icon background | Neutral fallback paint (`role.surfaces.minimal`) |

The native default-fallback step does not yet ship with a built-in icon (web does — a generic image-placeholder glyph). Tracked as a v2 follow-up; today the empty container with the neutral surface paint is the native default state. Use the `fallback` slot to supply a custom error treatment.

### Container background

Both platforms paint **transparent** while the image is loading, then flip to `Neutral.surfaces.minimal` (`var(--Image-fallbackBackground, var(--Neutral-Minimal))` on web) once the load fails — keeping the layout box visible without flashing a placeholder during normal loads.

### Disabled

| | Value | Source |
|---|---|---|
| Web | `opacity: var(--Image-disabledOpacity, var(--Disabled-Opacity, 0.5))` | `Image.module.css` |
| Native | `opacity: 0.5` | `DISABLED_OPACITY` in `Image.styles.native.ts` (matches the same fallback) |

### Pressed state

| | Value | Source |
|---|---|---|
| Web | `opacity: var(--Image-pressedOpacity, 0.85)` on `:active` | `Image.module.css` |
| Native | `opacity: 0.85` on `Pressable` `pressed` | `PRESSED_OPACITY` in styles |

## 4. Accessibility

| Concern | Web | Native |
|---|---|---|
| Static image | `<img alt={alt}>` | `<View role="img" aria-label={alt}>` |
| Interactive image | `<button aria-label={alt}>...</button>` (focusable, Enter/Space) | `<Pressable role="button" aria-label={alt}>` (tap) |
| Disabled | Removes `tabIndex`, drops the button role | Pressable disabled via `isInteractive = interactive && !disabled` |
| Custom label | `aria-label` overrides `alt` | Same — `aria-label` wins, falls through to `alt` |

## 5. Known gaps / follow-ups

- [ ] Default fallback icon — native shows a neutral background only; web renders a generic image-placeholder glyph. Once the native icon resolver gains a `media-image-broken` glyph, paint it inside the fallback branch.
- [ ] `objectPosition` — accepted as a prop for API symmetry but no-op on RN. Could be approximated with `transform: [{ translateX }, { translateY }]` once we wire alignment-aware resize.
- [ ] `loading` strategy — accepted but no-op (RN is eager). When we add an `expo-image` adapter we can honour `lazy` via `cachePolicy` / `priority`.
- [ ] Extended CSS object-fit keywords (`scale-down`, `inherit`, `initial`, `revert`, `revert-layer`, `unset`) — web-only by definition.
- [ ] HTML responsive image attributes (`srcSet`, `sizes`) — web-only. Native equivalent would be the `expo-image` adapter mentioned above.
