# Button: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

This document compares the **React (web)** and **React Native** Button implementations, explains what the **brand CSS engine** does on web and what replaces it on native, and lists **every intentional or remaining difference** as of the current codebase.

**Primary sources**

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/Button/Button.tsx` | `packages/ui-native/src/components/Button/Button.native.tsx` |
| Layout / static visuals | `packages/ui/src/components/Button/Button.module.css` | `packages/ui-native/src/components/Button/Button.styles.native.ts` |
| Shared props / state | `packages/ui/src/components/Button/Button.shared.ts` | Same module (imported from `@oneui/ui/components/Button/shared`) |
| Uncontained branch | `packages/ui/src/components/LinkButton/LinkButton.tsx` | `packages/ui-native/src/components/LinkButton/LinkButton.native.tsx` |
| Theme / surface | Injected CSS + `[data-surface]` (see below) | `packages/ui-native/src/theme/SurfaceContext.tsx`, `buildNativeTheme` |

**Other primitives:** parity write-ups for LinkButton, Spinner, badges, Divider, Separator, Container, Image, Logo, and PaginationDots live under [`docs/parity/README.md`](parity/README.md).

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|--------|
| **Prop contract** | **Aligned** | Same `ButtonProps` and `useButtonState` from `Button.shared.ts`. |
| **Contained vs uncontained** | **Aligned** | `contained={false}` delegates to `LinkButton` on both platforms. |
| **Variants (bold / subtle / ghost)** | **Aligned** | Same resolution: explicit `variant` or `attention` → `useButtonState`. |
| **Appearances (11 roles + auto)** | **Aligned** | Web: CSS appearance classes remap `--_btn-*`. Native: `useSurfaceTokens(resolvedAppearance)` + `VARIANT_PAINT`. |
| **Sizes (6 / 8 / 10 / 12 + aliases)** | **Aligned** | `resolveSize` shared; native maps to `StyleSheet` rows; web to `[data-size]`. |
| **Condensed / fullWidth** | **Aligned** | Same semantics; native omits condensed padding path when not condensed. |
| **Disabled / loading** | **Mostly aligned** | Opacity constants match; spinner geometry matches. |
| **Start / end slots** | **Different** | Web supports **semantic icon name strings** via `<Icon />`. Native **warns and drops** strings — must pass `ReactNode`. |
| **Decorations (brand ornaments)** | **Mostly aligned** | Both use `DecorationContext` / `useComponentDecoration('Button')`. Web: inline DOM SVG + ghost stroke path. Native: `SvgXml` fill-only; **ghost ornament stroke not ported** (see section 4). |
| **Hover vs press** | **Different by design** | Web: CSS `:hover` and `:active` with **different** tokens. Native: **press only** (`pressed` → `pressedBg`); `hoverBg` exists in paint objects but is **not applied** (touch-first; optional gap for RN Web + `hovered`). |
| **Focus ring** | **Web only** | Web: `focus-visible` box-shadow using `--Surface-Halo-Gap` + `--Focus-Outline`. Native: **no focus halo** on `Pressable` yet. |
| **Typography** | **Intentionally different** | Web: pure token line-height (`--Label-*-LineHeight`). Native: `useTypographyTokens` forces **`ceil(fontSize × 1.25)`** for RN `Text` stability. |
| **Motion** | **Different** | Web: CSS transitions from motion tokens (`Button.module.css`). Native: **tap scale** spring on wrapper `Animated.View`; background cross-fade not token-driven the same way. |
| **Primitive** | **Different** | Web: `@base-ui/react` `Button`. Native: RN `Pressable` + `Text` + `View`. |
| **Density / platform on native theme** | **Partial** | `buildNativeTheme` accepts `density` / `platform` in API; **sample apps** mostly pass light/dark only — full density parity with web CSS remap is a **pipeline** topic, not Button-only. |

---

## 2. What is shared (single source of truth)

### 2.1 `Button.shared.ts` (packages/ui)

- **`ButtonProps`**: `variant`, `attention`, `size`, `appearance`, `contained`, `condensed`, `fullWidth`, `disabled`, `loading`, `onPress` / `onClick`, `start` / `end`, deprecated `leftIcon` / `rightIcon`, `decoration`, `className` (web), `style`, `type`, `children`, `aria-label`, `ref` (web).
- **`useButtonState`**: `isDisabled`, `resolvedVariant`, `resolvedAppearance`, `numericSize`, `ariaProps`, **`dataAttrs`** (`data-variant`, `data-appearance`, `data-size`, optional `data-condensed`, `data-loading`).

**Native behaviour:** `dataAttrs` are **not applied** to the `Pressable` today — they exist for API symmetry and potential future native styling or tests. Web **requires** them so `Button.module.css` attribute selectors apply.

### 2.2 Delegation to `LinkButton`

Both platforms:

1. If `contained === false`, render `LinkButton` with contained-only props stripped.
2. Web uses a typed **`toLinkButtonProps`** mapper and sets **`showUnderline={false}`** (Figma: underline transparent until hover on web).
3. Native spreads rest props with a cast to `LinkButtonProps` and also sets **`showUnderline={false}`** (no hover on native; underline stays off).

---

## 3. What the web “engine” does — and why native does not need CSS injection

### 3.1 Web: brand CSS pipeline (platform app / Storybook)

On web, One UI does **not** hard-code brand colours inside `Button.module.css`. Instead:

1. **`useBrandCSS` / `useBrandCSSNew`** (in `@oneui/ui`, backed by `@oneui/shared/engine`) runs from Convex (or preview) brand foundations.
2. It **generates CSS** (including `@layer brand`) with variables such as `--Primary-Bold`, `--Primary-TintedA11y`, `--Label-M-FontSize`, motion tokens, etc.
3. That CSS is injected into a `<style>` tag so the cascade can update when the brand or theme switches.

**Button’s job on web** is mostly: **emit the right DOM structure and classes**, and consume **`var(--…)`** via the `--_btn-*` indirection layer in `Button.module.css`. The **engine** already decided the numeric / computed values; CSS just references them.

### 3.2 Web: `[data-surface]` surface context

Inside `<Surface mode="bold">`, the engine emits **remapped** role tokens for descendants. `Button.module.css` keeps referencing the **same** variable names (e.g. `--Primary-Bold`); their **computed values** change because of **`[data-surface="…"]`** rules in generated CSS.

So on web, **surface awareness is CSS-only** — no per-component JS for “what colour on this parent?”.

### 3.3 Native: `buildNativeTheme` + context (no injected Button CSS)

On React Native:

1. **`buildNativeTheme`** (`packages/shared/src/engine/buildNativeTheme.ts`) takes the **same class of foundation inputs** as the web pipeline (colour config, appearance config, typography config, custom fonts) and produces a **`OneUINativeTheme`**: resolved **hex strings** per role (`NativeRoleTokens`: surfaces, content, on-bold / on-subtle content, states).

2. **`OneUINativeThemeProvider`** exposes that object. **`useSurfaceTokens(appearance)`** reads the **current** `SurfaceContext` slice (root or nested `<Surface>`).

3. **`<Surface>`** (`SurfaceContext.tsx`) uses the **same surface resolution ideas** as web (`resolveSurface`, `resolveNativeContextRoles`, contrast direction, optional anchor stripping for nested bold — see comments in `SurfaceContext.tsx`). There is **no** `[data-surface]` string in the DOM; the equivalent is **context values** updated when the boundary changes.

**Why native does not need the CSS string engine at runtime**

- RN does not have **`var(--token)`** or a global stylesheet that restyles every `View` when the brand switches. The practical equivalent is: **replace the theme object** (and optionally restart subtrees) and let hooks return **new colours**.
- The **colour math** is still shared (`buildNativeTheme`, `surfaceNew`, palette builders). What is skipped is **CSS generation, injection, and selector-based remapping** — replaced by **JS objects + React context**.

---

## 4. Behaviour and implementation differences (complete list)

### 4.1 Primitives and DOM

| Item | Web | Native |
|------|-----|--------|
| Root control | `@base-ui/react` `Button` | `Pressable` |
| Label node | `<span className={styles.label}>` | `<Text numberOfLines={1}>` |
| Slots | `<span className={styles.start|end}>` | `<View style={SLOT_*_STYLE[size]}>` |
| `type` prop | Passed to `<button>` | Not applicable to `Pressable` |
| `className` | Composed with `clsx` + CSS module | Not supported; use `style` only |

### 4.2 Icons and slots

| Item | Web | Native |
|------|-----|--------|
| `start` / `end` as **string** (semantic icon name) | Resolved via `renderIconNode` → `<Icon name=…>` with `currentColor` | **`resolveSlot`**: logs **dev warning**, returns **`null`** |
| Deprecated `leftIcon` / `rightIcon` string | Same as above | Same warning path |

**Parity gap:** feature parity for **string** icon slots on native requires a native **`Icon`** (or SVG registry) — intentionally deferred.

### 4.3 Styling mechanism

| Item | Web | Native |
|------|-----|--------|
| Static layout | CSS module: padding, min-height, slots, pill radius | `StyleSheet.create` in `Button.styles.native.ts` (documented 1:1 mapping comments vs `Button.module.css`) |
| Colours | `background-color: var(--_btn-bg)` etc. | Inline `backgroundColor` / `color` from `VARIANT_PAINT` + `useSurfaceTokens` |
| Pressed background | `:active` rules in CSS | `Pressable` style callback: `pressed ? paint.pressedBg : paint.bg` |
| Hover background | `:hover` uses **hover** tokens | **`hoverBg` in `VARIANT_PAINT` is unused** in the press callback — no separate hover visual |
| Recipe overrides | CSS vars from recipe pipeline | `useComponentRecipe('button')` + `applyButtonRecipe` (corner radius, uppercase + letterSpacing, horizontal density padding) |

### 4.4 Typography

| Item | Web | Native |
|------|-----|--------|
| Font family | `var(--Button-fontFamily, var(--Label-FontFamily, …))` | `useOneUITheme().typography.fontFamilies.primary` on `Text` |
| Size / weight | Token-driven from brand CSS | `useTypographyTokens('label', SIZE_TO_LABEL[size], { emphasis: 'high' })` |
| Line height | Token `--Label-*-LineHeight` | **Overridden** in `useTypographyTokens`: **`Math.ceil(fontSize × 1.25)`** (RN layout stability) |
| Optical sizing / font variation | CSS vars on `.button` | **Not applied** on native Button label |

### 4.5 Motion and feedback

| Item | Web | Native |
|------|-----|--------|
| Tap scale | CSS `transform` + `--Motion-Tap-Scale-*` + transition | `Animated.spring` on wrapper; `tapScaleFor` in styles module (includes fullWidth bypass, XS chip scale) |
| Colour transitions | `transition: background-color …` | No equivalent cross-fade; instant swap on press |
| Spinner rotation | CSS `@keyframes` | `Animated.loop` + `timing`; duration pinned to **1500ms** in Button styles module to match web’s **1.5s** linear keyframes |
| Reduce motion | Web: media query in CSS / Storybook | `useReduceMotion()` — disables spinner rotation and tap scale |

### 4.6 Focus and accessibility

| Item | Web | Native |
|------|-----|--------|
| Focus-visible halo | **Yes** — dual ring (`--Surface-Halo-Gap`, `--Focus-Outline`) | **Not implemented** on `Pressable` |
| `aria-*` | Via `useButtonState` + Base UI | `aria-label`, `aria-disabled`, `aria-busy` passed where supported |
| `testID` | Not in web `Button.tsx` surface | Native forwards optional **`testID`** on `Pressable` |

### 4.7 Decorations (ornaments)

| Item | Web | Native |
|------|-----|--------|
| Placement | `span` absolutely positioned; `calc(100% - var(--Stroke-S))` alignment | `View` + `Ornament`; `left: '100%'` / `right: '100%'` |
| Fill colour | `fill: var(--_btn-bg)` sync with button fill | `buildOrnamentXml(..., fill)` uses **same** `paint.bg` |
| Ghost + ornament **stroke** | Second SVG path with stroke tokens | **Explicitly not ported** — comment in `Button.native.tsx`: fill-only; follow-up |
| Left mirror + stroke | Separate stroke transform for mirrored geometry | Native mirrors fill via `SvgXml`; **no stroke overlay** |

### 4.8 `data-*` and testing

- Web: **`dataAttrs`** from `useButtonState` spread onto `BaseButton` for styling and state overrides (e.g. Storybook `data-force-state`).
- Native: **not attached** to `Pressable` — styling is not selector-driven.

### 4.9 LinkButton-specific (uncontained)

| Item | Web | Native |
|------|-----|--------|
| Spinner duration token | CSS-driven | Both native **Button** and **LinkButton** spinners use **`useMotion().spinner.rotationMs`** (1500ms default, overridable via theme / `motionOverrides`). |
| Underline | CSS hover behaviour | Transparent underline for subtle/ghost; **no hover reveal** |

---

## 5. What is intentionally “left” (follow-up backlog)

These are **known** gaps or polish items, not unknown drift:

1. **Semantic string icons** on `start` / `end` for native Button (and parity tests that expect icons).
2. **Focus-visible** treatment on native `Pressable` / `Text` (WCAG parity with web).
3. **Separate hover styling** where product wants desktop-style hover on RN Web (optional `Pressable` `hovered` state + `hoverBg`).
4. **Ghost decoration stroke** path on native (match web’s open-path outline).
5. **Unify spinner duration** between `Button.native.tsx` and `LinkButton.native.tsx` if product wants identical timing constants everywhere.
6. **`dataAttrs` on native** if tooling or visual debugging needs the same hooks as web.
7. **Optical sizing / variation settings** on label `Text` if brand typography requires it.

---

## 6. Quick mental model

```text
WEB
Convex foundations → engine generates CSS variables → Button applies classes
→ Browser resolves var(--Primary-*) inside [data-surface] and :hover/:active

NATIVE
Convex foundations → buildNativeTheme() → OneUINativeThemeProvider
→ useSurfaceTokens(appearance) + SurfaceContext for nested surfaces
→ Button applies StyleSheet IDs + inline hex colours + Pressable pressed state
```

**Same brain (shared engine / shared hooks), different skin (CSS vs JS styles).**

---

## 7. Storybook ↔ Native showcase section map

This section maps `packages/ui/src/components/Button/Button.stories.tsx` 1:1 to `packages/ui-native/src/components/Button/Button.showcase.native.tsx`.

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `ButtonDefault` | **Aligned** |
| 2 | `AttentionLevels` | `ButtonAttentionLevels` | **Aligned** |
| 3 | `Sizes` | `ButtonSizes` | **Aligned** — XS / S / M / L |
| 4 | `Condensed` | `ButtonCondensed` | **Aligned** |
| 5 | `Contained` | `ButtonContained` | **Aligned** — `contained=false` delegates to `LinkButton` on both platforms |
| 6 | `SlotPadding` | `ButtonSlotPadding` | **Aligned** |
| 7 | `States` | `ButtonStates` | **Aligned** — Default / Disabled / Loading |
| 7b | `FocusState` | _intentionally skipped_ | **Web-only** — RN touch surfaces have no focus indicator. Tracked under §5.2 of this guide. |
| 8 | `WithSlots` | `ButtonWithSlots` | **Aligned** |
| 9 | `Appearances` | `ButtonAppearances` | **Aligned** — 9-role × 3-attention matrix |
| 10 | `FullWidth` | `ButtonFullWidth` | **Aligned** |
| 11 | `Interactive` | _intentionally skipped_ | **Web-only** — Storybook play function calling `userEvent.click` / `userEvent.keyboard`. Equivalent assertions live in the Button native A11y peer test. |
| 12 | `Responsive` | `ButtonResponsive` | **Aligned** — full-width primary action + Cancel/Confirm row |
| 13 | `Themes` | `ButtonThemes` | **Aligned** — `data-theme` decorator on web; native renders the active provider theme. |
| 14 | `LoadingWithSlots` | `ButtonLoadingWithSlots` | **Aligned** |
| 15 | `SurfaceContext` | `ButtonSurfaceContext` | **Aligned** — 6 surface modes |
| 16 | `Density` | `ButtonDensity` | **Aligned** — density cards on web; native renders the active provider density. |
| 17 | `Motion` | `ButtonMotion` | **Aligned** — Animated.spring scale-down for tap, honours `useReduceMotion` |

## 8. Related reading in this repo

- `docs/ui-native.md` — native package overview (if present in your branch).
- `docs/architecture.md` — web CSS injection and cascade (brand layer, token families).
- `docs/surface-context-awareness.md` — `[data-surface]` mental model; native mirror is `SurfaceContext.tsx`.
- `packages/ui-native/src/components/Button/Button.native.tsx` — inline comments for ornaments, LinkButton, and web parity notes.
- `packages/ui-native/src/components/Button/Button.styles.native.ts` — mapping table to `Button.module.css`.

---

*Generated from static analysis of `packages/ui` and `packages/ui-native`. When you change either Button, update this document or the drift will return.*
