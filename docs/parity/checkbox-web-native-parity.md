# Checkbox: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

This document compares the **React (web)** and **React Native** Checkbox
implementations and lists every intentional or remaining difference as of the
current codebase.

**Primary sources**

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/Checkbox/Checkbox.tsx` | `packages/ui-native/src/components/Checkbox/Checkbox.native.tsx` |
| Layout / static visuals | `packages/ui/src/components/Checkbox/Checkbox.module.css` | `packages/ui-native/src/components/Checkbox/Checkbox.styles.native.ts` |
| Prop contract / state | `packages/ui/src/components/Checkbox/Checkbox.shared.ts` | `packages/ui-native/src/components/Checkbox/interface.ts` |
| A11y helper | implicit (`<BaseCheckbox.Root>` → `role="checkbox"`) | `getCheckboxAccessibilityProps` (same module as the props) |
| Recipe | `Checkbox.recipe.ts` (`cornerRadius`) | `useComponentRecipe('checkbox')` + `resolveRecipeBorderRadius` |
| Surface / theme | Injected CSS + `[data-surface]` cascade | `SurfaceContext.tsx`, `buildNativeTheme`, `useSurfaceTokens` |
| Layers cross-check | n/a | `libs/react-4/.../jdscheckbox-4.ts` + `libs/react-native/.../jdscheckbox` |

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|--------|
| **Tri-state model** | **Aligned** | Unchecked / checked / indeterminate (`mixed` for assistive tech). |
| **Default appearance** | **Aligned** | `'auto'` resolves to **secondary** stack on both platforms (border + fill). |
| **Sizes (`s\|m\|l`)** | **Aligned** | Box: `Spacing-4 / 5 / 6` (16/20/24). Icon: `Spacing-3 / 4 / 4-5` (12/16/18). Radii (default): `Shape-1 / 1-5 / 2` (4/6/8). Web reads `var(--Spacing-N)` / `var(--Shape-N)`; native reads `tokens.spacing['N']` + `theme.shape.{NativeShapeKey}` (density-aware). |
| **Attention / fill** | **Aligned** | Checked / indeterminate fill = `--_cb-bold` ↔ `role.surfaces.bold`. Indicator colour = `--_cb-bold-high` ↔ `role.onBoldContent.tintedA11y`. Unchecked border = `--_cb-default-medium-stroke` ↔ `role.content.strokeMedium`. |
| **Read-only fill** | **Aligned** | Both platforms collapse the role onto `--_cb-default-high` (web) / `role.content.high` (native) for both border and fill. Press / hover are suppressed. |
| **Disabled** | **Aligned** | Both apply `--Disabled-Opacity` (0.5) and disable hit testing. RN reports `accessibilityState.disabled = true`. |
| **Appearances (9 roles + auto)** | **Aligned** | Web: per-role CSS classes remap eight `--_cb-*` intermediate vars. Native: `useSurfaceTokens(resolvedAppearance)` returns the equivalent role tokens directly. |
| **Surface context awareness** | **Aligned** | Web uses `[data-surface]` cascade; native uses `<Surface>` + `useSurfaceTokens`. Inner checkbox stays distinguishable on bold/subtle/elevated parents. |
| **Recipe (`cornerRadius`)** | **Aligned** | Both honour `none / small / medium / large / pill` decisions. Web emits `--Checkbox-borderRadius-{s\|m\|l}`; native overrides the per-size default with `resolveRecipeBorderRadius(decisions, shape)`. |
| **Indicator glyphs (check / minus)** | **Different rendering, identical visual** | Web: `<Icon name="check"/>` + `<Icon name="remove"/>` resolved by the active brand icon set. Native: inline `react-native-svg` paths matching the Material check / minus glyphs (semantic name resolution for "check" / "remove" is not yet wired in `@oneui/ui-native/icons`; visual is identical at default size). |
| **A11y** | **Aligned in intent, richer on native** | Web → BaseUI `<input type="checkbox">` with `role="checkbox"` + `aria-checked` (`true` / `false` / `mixed`). Native → `accessibilityRole: 'checkbox'`, `accessibilityState: { checked: boolean \| 'mixed', disabled }`. Native additionally accepts `accessibilityHint`, `aria-hidden` → `accessibilityElementsHidden` + `importantForAccessibility`, and forwards `aria-describedby` as `accessibilityLabelledBy`. |
| **Hover / focus / pressed states** | **Web only** | Web emits `:hover`, `:focus-visible`, `:active` and a 2-layer Informative focus halo. Native ports the **press tint** (background flips to `--_cb-bold-pressed` / subtle pressed via Pressable's pressed state) but has no hover or focus indicator (RN touch surfaces have no focus). |
| **Tap-scale + indeterminate↔checked rotation crossfade** | **Web only (v1)** | Web's "scale 1.07 on press + indicator rotation crossfade" choreography is **not** mirrored on native today. Native does an instant opacity flip; the static visual still matches. Tracked as a follow-up. |
| **Field stack (`labelAssociation`, `labelWrapper`, `labelSuffixInside`, `labelTrailing`, `supplementaryDescribedById`, `errorHighlight`)** | **Partially mirrored** | Native exposes `label`, `description`, `labelSuffixInside`, `labelTrailing`, `value`, and `errorHighlight` (border tint) — enough for `CheckboxField` (native) to inject the required asterisk, info-icon trigger, and group `value`. `labelAssociation` / `labelWrapper` / `supplementaryDescribedById` are web DOM concerns (BaseUI `<Field.Root>` → `<label>` vs `<div>` wrapping) with no native counterpart and are not exposed on RN. |
| **Form attributes (`name`, `value`, `required`, `id`, `data-testid`, `className`)** | **Web-only** | Native uses `testID`. Form integration is delegated to RN form libraries. |
| **Decoration ornaments** | **n/a** | Checkbox has no decoration ornaments on either platform. |

---

## 2. What is shared (single source of truth)

### 2.1 `Checkbox.shared.ts` (web)

`useCheckboxState` decides:

- `isDisabled` / `isReadOnly`
- `resolvedAppearance` (`'auto'` / unset → `'secondary'`)
- `resolvedSize` canonical `'s' | 'm' | 'l'`
- cross-platform `ariaProps` (`aria-disabled`, `aria-readonly`)
- `dataAttrs` (`data-size`, `data-appearance`, `data-readonly`)

### 2.2 `interface.ts` (native)

Native owns its prop contract and **does not** import from
`@oneui/ui/components/Checkbox/shared` (per the parity rule). `useCheckboxState`
returns the same shape with the same defaults, and additionally encodes the
visual state in `dataAttrs`:

- `data-checked` / `data-unchecked` / `data-indeterminate` mirror BaseUI's
  data attributes so the resolver shape stays platform-symmetric, even though
  RN styling is not selector-driven.

### 2.3 Layers cross-check

| Concept | OneUI (`CheckboxProps`) | Layers `JDSCheckboxProps` |
|---------|-------------------------|----------------------------|
| Selected state | `checked` (bool) + `indeterminate` (bool) | `selected` (bool) + `indeterminate` (bool) |
| Size | `'s' \| 'm' \| 'l'` | `'S' \| 'M' \| 'L'` (case different) |
| Appearance | `ComponentAppearance` (9 roles + auto) | subset (no `brand-bg`) |
| Accent | `accent` (deprecated, ignored) | `accent` (still used) |
| Press | `onPress` (RN convention) + `onCheckedChange` | `onClick` only |
| Aria props | `aria-label`, `aria-describedby`, `aria-invalid`, `aria-hidden` | `ariaLabel`, `ariaDescribedby`, `ariaDisabled`, camelCase |
| Test hook | `testID` | `testID` |

OneUI exposes the canonical web vocabulary (`'aria-label'`, `'aria-describedby'`)
on native too so component code reads identically across platforms.

---

## 3. Visual model — how `appearance` drives both border and fill

Web `Checkbox.module.css` exposes eight intermediate variables and remaps all
of them per appearance class. Native maps the same variables onto the
`NativeRoleTokens` shape:

| Web intermediate var | Used for | Native equivalent |
|----------------------|----------|--------------------|
| `--_cb-default-medium-stroke` | Unchecked border | `role.content.strokeMedium` |
| `--_cb-default-hover` | Unchecked hover bg | n/a (no hover on RN) |
| `--_cb-default-pressed` | Unchecked pressed bg | `role.states.subtlePressed` |
| `--_cb-default-high` | Read-only fill / border | `role.content.high` |
| `--_cb-bold` | Checked fill / border | `role.surfaces.bold` |
| `--_cb-bold-high` | Indicator colour (also read-only indicator) | `role.onBoldContent.tintedA11y` |
| `--_cb-bold-hover` | Checked hover bg | n/a |
| `--_cb-bold-pressed` | Checked pressed bg | `role.states.boldPressed` |

Inside `<Surface mode="bold">`, `useSurfaceTokens('secondary')` returns
already-remapped values, so the on-bold-secondary-bold fill stays
distinguishable from the surface fill — same outcome as the web `[data-surface]`
cascade.

---

## 4. Sizing (geometry stays in lockstep)

| Size | Box | Icon | Default radius |
|------|-----|------|----------------|
| `s` | `Spacing-4` (16) | `Spacing-3` (12) | `Shape-1` (4) ← `theme.shape['1']` |
| `m` | `Spacing-5` (20) | `Spacing-4` (16) | `Shape-1-5` (6) ← `theme.shape['1-5']` |
| `l` | `Spacing-6` (24) | `Spacing-4-5` (18) | `Shape-2` (8) ← `theme.shape['2']` |

The 6 px radius for size `m` is not addressable via the static lowercase
`tokens.shape.*` map (which jumps from 4 to 8). The native peer reaches into
the density-aware `theme.shape` (`buildNativeTheme()` → `NativeShape`) for all
three radii so the values stay correct under platform / density changes.

`Recipe.cornerRadius` (`none / small / medium / large / pill`) overrides the
per-size default via `resolveRecipeBorderRadius(decisions, shape)`.

---

## 5. Accessibility — RN tri-state mapping

| Prop | Web behaviour | Native mapping |
|------|---------------|----------------|
| `aria-label` | `<input>` `aria-label` | `accessibilityLabel` |
| `label` (no `aria-label`) | implicit via wrapping `<label>` | falls back to `accessibilityLabel = label` |
| `aria-describedby` | `<input>` `aria-describedby` | `accessibilityLabelledBy` |
| `aria-invalid` | `<input>` `aria-invalid` (validation) | exposed on the prop type for forwarding; not currently mapped to RN a11y (no public RN equivalent) — pair with `errorHighlight` for visible chrome |
| `aria-hidden` | n/a (decorative checkbox is rare) | `accessibilityElementsHidden = true` + `importantForAccessibility = 'no-hide-descendants'` |
| `disabled` | `<input>` `disabled` + `aria-disabled` | `accessibilityState.disabled = true`, `disabled` prop on `Pressable` |
| `readOnly` | `aria-readonly` | `disabled = true` on `Pressable` (no toggle) + visible "high" fill chrome to disambiguate from disabled |
| `indeterminate` | `aria-checked="mixed"` | `accessibilityState.checked = 'mixed'` |
| `checked` (controlled) / `defaultChecked` (uncontrolled) | controlled props on BaseUI | controlled / uncontrolled internal state with the same fallback chain |

---

## 6. What's intentionally simpler on native (v1)

| Web feature | Native v1 behaviour | Why |
|-------------|---------------------|-----|
| Press scale (1.0 → 1.07) | Static — no scale | Matches the "v1, no animation choreography" gates the playbook prefers; tracked as a follow-up. |
| Indicator scale-burst on check | Instant opacity flip | Same reason. |
| `check` ↔ `minus` rotation crossfade | Instant glyph swap | Same reason. |
| `:focus-visible` Informative halo | none | RN touch surfaces have no focus indicator. |
| `:hover` background tint | none | No hover on touch. |
| Reduced-motion `@media` override | n/a (no motion to reduce yet) | When animation lands, gate it behind `useReduceMotion()`. |

When animation is added, follow Button's pattern (`useMotion()` for spring
tuning, `useReduceMotion()` for the opt-out, and `useNativeDriver` for any
transform / opacity loop).

---

## 7. Files

| File | Purpose |
|------|---------|
| `packages/ui-native/src/components/Checkbox/interface.ts` | Props, `useCheckboxState`, `getCheckboxAccessibilityProps`, `resolveSize`. |
| `packages/ui-native/src/components/Checkbox/Checkbox.styles.native.ts` | Static layout (`StyleSheet.create`), per-size `BOX_SIZE` / `ICON_GLYPH_SIZE` maps, `STROKE_M_WIDTH`, `DISABLED_OPACITY`. |
| `packages/ui-native/src/components/Checkbox/Checkbox.native.tsx` | Render + `paintFor` + `defaultRadiusFor`, controlled / uncontrolled state, inline check / minus SVGs. |
| `packages/ui-native/src/components/Checkbox/Checkbox.showcase.native.tsx` | Story matrix mirror (Default / Sizes / States / Accents / Appearances / ReadOnly / WithLabel / SurfaceContext / Themes / Interactive). |
| `packages/ui-native/src/components/Checkbox/index.ts` | Barrel — re-exports `Checkbox`, prop / state types, `useCheckboxState`, `getCheckboxAccessibilityProps`, `resolveSize`. |
| `packages/ui-native/src/components/Checkbox/CheckboxA11y.test.ts` | Vitest suite for the a11y helper + state resolver. |

---

## 8. Open follow-ups

- Wire native semantic icon resolution for `'check'` / `'remove'` so the
  inline glyphs in `Checkbox.native.tsx` can be replaced by `<Icon name=…>`.
- Port the press-scale + rotation crossfade choreography (web's
  `Motion` story) using `useMotion` + `useNativeDriver`.
- Decide whether to support the integrated `Field` stack
  (`labelAssociation="field"`) on native, or document that the field
  helpers are web-only.
- Surface the `aria-invalid` value in a way RN surfaces (e.g. via the
  `accessibilityValue` prop) once the convention is settled across the
  ui-native components.
