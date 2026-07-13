# Radio: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

This document compares the **React (web)** and **React Native** Radio + RadioGroup implementations and lists every intentional or remaining difference as of the current codebase.

**Primary sources**

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/Radio/Radio.tsx` | `packages/ui-native/src/components/Radio/Radio.native.tsx` |
| Layout / static visuals | `packages/ui/src/components/Radio/Radio.module.css` | `packages/ui-native/src/components/Radio/Radio.styles.native.ts` |
| Prop contract / state | `packages/ui/src/components/Radio/Radio.shared.ts` | `packages/ui-native/src/components/Radio/interface.ts` |
| A11y helper | implicit (BaseUI Radio.Root → `role="radio"`) | `getRadioAccessibilityProps` (same module as the props) |
| Recipe | `Radio.recipe.ts` (`cornerRadius` + `dotShape`) | `useComponentRecipe('radio')` + `resolveRecipeBorderRadius` |
| Surface / theme | Injected CSS + `[data-surface]` cascade | `SurfaceContext.tsx`, `buildNativeTheme`, `useSurfaceTokens` |
| Layers cross-check | n/a | `libs/react-4/.../jdsradio-4.ts` + `libs/react-native/.../jdsradio` |

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|--------|
| **Selection model** | **Aligned** | Web: BaseUI `<RadioGroup value>` + child `<Radio value>`. Native: `<RadioGroup value>` keeps state in `RadioGroupContext`; child `<Radio>` reads `value === group.value` via `useRadioState`. |
| **Default appearance** | **Aligned** | `'auto'` resolves to **secondary** stack on both platforms (border + fill). |
| **Sizes (`s/m/l`)** | **Aligned** | Box: `Spacing-4 / 5 / 6` (16/20/24). Dot: `Spacing-2 / 2-5 / 3` (8/10/12) — 50% ratio. Web reads `var(--Spacing-N)`; native reads `tokens.spacing['N']`. |
| **Default radius** | **Aligned** | Both default to `Shape-Pill` (circular). Recipe `cornerRadius` overrides per-size; native applies the recipe-derived radius and computes the dot radius via the same `max(0, boxRadius - (boxSize - dotSize) / 2)` formula. |
| **Attention / fill** | **Aligned** | Checked fill = `--_rd-bold` ↔ `role.surfaces.bold`. Indicator dot = `--_rd-bold-high` ↔ `role.onBoldContent.tintedA11y`. Unchecked border = `--_rd-default-medium-stroke` ↔ `role.content.strokeMedium`. |
| **Read-only fill** | **Aligned** | Both collapse the role onto `--_rd-default-high` (web) / `role.content.high` (native) for both border and fill. Press / hover are suppressed. |
| **Disabled** | **Aligned** | Both apply `--Disabled-Opacity` (0.5) and disable hit testing. RN reports `accessibilityState.disabled = true`. |
| **Appearances (9 roles + auto)** | **Aligned** | Web: per-role CSS classes remap eight `--_rd-*` intermediate vars. Native: `useSurfaceTokens(resolvedAppearance)` returns the equivalent role tokens directly. |
| **Surface context awareness** | **Aligned** | Web uses `[data-surface]` cascade; native uses `<Surface>` + `useSurfaceTokens`. Inner radio stays distinguishable on bold/subtle/elevated parents. |
| **Recipe (`cornerRadius` + `dotShape`)** | **Partially aligned** | Web honours both `cornerRadius` and `dotShape` decisions independently. Native today uses `cornerRadius` only — the dot radius is derived from the box radius using the same formula web uses for the default cascade. Independent `dotShape` override is tracked as a v2 follow-up (would need a recipe-side helper to expose dot tokens to native). |
| **Indicator dot** | **Aligned visually, simplified animation** | Web: scale-burst (2 → 1) + asymmetric opacity fade with motion offset. Native: opacity-only fade (consistent with native Checkbox v1 simplification). |
| **A11y** | **Aligned in intent, richer on native** | Web → BaseUI `<input type="radio">` with `role="radio"` + `aria-checked`. Native → `accessibilityRole: 'radio'`, `accessibilityState: { selected: boolean, disabled }`. Native additionally accepts `accessibilityHint`, `aria-hidden` → `accessibilityElementsHidden` + `importantForAccessibility`, and forwards `aria-labelledby` / `aria-describedby` as `accessibilityLabelledBy`. |
| **Hover / focus / pressed states** | **Web only** | Web emits `:hover`, `:focus-visible`, `:active` and a 2-layer Informative focus halo. Native ports the **press tint** (background flips to bold-pressed / subtle-pressed via `Pressable`'s pressed state) but has no hover or focus indicator (RN touch surfaces have no focus). |
| **Press-scale (1.07) + scale-burst** | **Web only (v1)** | Native uses an opacity-only press model. Static visual matches; dynamic choreography is simplified. Tracked as a follow-up. |
| **Group orientation** | **Aligned** | `vertical` (default) and `horizontal`. Web uses `flex-direction`; native uses the same `flexDirection` token gap. |
| **`omitLayoutWrapper`** | **Aligned** | Both skip the default flex wrapper — used by `RadioField` integrated single mode. |
| **Field-stack helpers (`labelAssociation`, `labelWrapper`, `labelSuffixInside`, `labelTrailing`, `supplementaryDescribedById`, `errorHighlight`)** | **Partially mirrored** | Native exposes `label`, `description`, `labelSuffixInside`, `labelTrailing`, `errorHighlight`, plus the convention that `children` becomes the option label when `label` is omitted. `labelAssociation` / `labelWrapper` / `supplementaryDescribedById` are web DOM concerns (BaseUI `<Field.Root>` → `<label>` vs `<div>` wrapping) with no native counterpart. |
| **Form attributes (`name`, `required`, `id`, `data-testid`, `className`)** | **Web only** | Native uses `testID`. Form integration is delegated to RN form libraries (RHF / Formik). |
| **Decoration ornaments** | **n/a** | Radio has no decoration ornaments on either platform. |

---

## 2. What is shared (single source of truth)

### 2.1 `Radio.shared.ts` (web)

`useRadioState` decides:
- `isDisabled` / `isReadOnly` (with parent `RadioGroup` context fallback)
- `resolvedAppearance` (`'auto'` / unset → `'secondary'`)
- `resolvedSize` canonical `'s' | 'm' | 'l'`
- cross-platform `ariaProps` (`aria-disabled`, `aria-readonly`)
- `dataAttrs` (`data-size`, `data-appearance`)

### 2.2 `interface.ts` (native)

Native owns its prop contract and **does not** import from `@oneui/ui/components/Radio/shared` (per the parity rule). `useRadioState` returns the same shape with the same defaults, plus:
- `isChecked` derived from `RadioGroup.value === radio.value` via `RadioGroupContext`.
- Visual data attributes (`data-checked` / `data-unchecked` / `data-readonly`) for cross-platform mirroring even though RN styling is not selector-driven.

### 2.3 Layers cross-check

| Concept | OneUI (`RadioProps`) | Layers `JDSRadioProps` |
|---------|----------------------|-------------------------|
| Selected state | derived from group `value` (no per-Radio prop) | `selected: boolean` |
| Size | `'s' \| 'm' \| 'l'` | `'S' \| 'M' \| 'L'` (case different) |
| Appearance | `ComponentAppearance` (9 roles + auto) | subset (no `brand-bg`) |
| Accent | `accent` (deprecated, ignored) | `accent` (still used) |
| Press | `onPress` (RN convention) + `RadioGroup.onValueChange` | `onClick` only |
| Aria props | `aria-label`, `aria-describedby`, `aria-labelledby`, `aria-invalid`, `aria-hidden` | `ariaLabel`, `ariaDescribedby`, `ariaDisabled`, camelCase |
| Test hook | `testID` | `testID` |

---

## 3. RadioGroup state semantics

| Concern | Web | Native |
|---|---|---|
| Controlled | `<RadioGroup value defaultValue onValueChange>` + BaseUI `RadioGroup` | `<RadioGroup value>` skips internal state; `onValueChange` fires on every child press |
| Uncontrolled | `defaultValue` + BaseUI handles state | `defaultValue` initialises an internal `useState`; `onValueChange` still fires |
| Group → child wiring | React context (`RadioGroupContext`) | React context (`RadioGroupContext`) |
| Child press | dispatches BaseUI internal event | calls `groupCtx.onChildSelect(value)` which updates internal state + invokes `onValueChange` |
| Read-only | Suppresses all child presses | Same — `groupCtx.readOnly` short-circuits `onChildSelect` |

---

## 4. Showcases

`packages/ui-native/src/components/Radio/Radio.showcase.native.tsx` exports the parity sections wired into the sample app:

- `RadioSizes`
- `RadioStates`
- `RadioAppearances`
- `RadioReadOnly`
- `RadioWithLabel`
- `RadioGroupExample`
- `RadioSurfaceContext`
- `RadioInteractive`

---

## 5. Known gaps / follow-ups

- [ ] Independent `dotShape` recipe override is not exposed on native today — the dot radius derives from the box radius. Track a `useComponentRecipeShape('radio', 'dotShape')` helper for v2.
- [ ] Press-scale + scale-burst animation choreography is simplified to opacity-only (consistent with v1 Checkbox). Add motion tokens once the animation system is finalised.
- [ ] Web focus halo (Informative-Bold) has no native counterpart. RN touch surfaces have no focus indicator; once we wire `useReduceMotion` + a focus-visible analogue this can be added behind a feature flag.
