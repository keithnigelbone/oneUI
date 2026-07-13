# Switch: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

This document compares the **React (web)** and **React Native** Switch implementations and lists every intentional or remaining difference.

**Primary sources**

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/Switch/Switch.tsx` | `packages/ui-native/src/components/Switch/Switch.native.tsx` |
| Layout / static visuals | `packages/ui/src/components/Switch/Switch.module.css` | `packages/ui-native/src/components/Switch/Switch.styles.native.ts` |
| Prop contract / state | `packages/ui/src/components/Switch/Switch.shared.ts` | `packages/ui-native/src/components/Switch/interface.ts` |
| A11y helper | implicit (`<BaseSwitch.Root>` → `role="switch"`) | `getSwitchAccessibilityProps` (same module as the props) |
| Surface / theme | Injected CSS + `[data-surface]` cascade | `SurfaceContext.tsx`, `buildNativeTheme`, `useSurfaceTokens` |

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|-------|
| **Default appearance** | **Aligned** | `'auto'` resolves to **secondary** on both platforms. |
| **Sizes (`s\|m\|l`)** | **Aligned** | Track: Spacing-7/9/10. Knob: Spacing-3/4/5. Travel: Spacing-3/4/4. |
| **Checked fill** | **Aligned** | `--{Role}-Bold` ↔ `role.surfaces.bold`. |
| **Unchecked fill** | **Aligned** | Neutral-Subtle ↔ `neutralRole.surfaces.subtle`. |
| **Thumb unchecked** | **Aligned** | `--Surface-Default` (white) ↔ `role.surfaces.default`. |
| **Thumb checked** | **Aligned** | `--{Role}-Bold-TintedA11y` ↔ `role.onBoldContent.tintedA11y`. |
| **Disabled** | **Aligned** | Both apply 0.5 opacity and disable hit testing. |
| **Read-only** | **Simplified on native** | Web shows smaller knob + outline border. Native collapses to neutral, non-interactive. Tracked as follow-up. |
| **Appearances (9 roles + auto)** | **Aligned** | Web: per-role CSS classes remap `--_sw-*` intermediate vars. Native: `useSurfaceTokens(resolvedAppearance)` returns equivalent tokens. |
| **Surface context awareness** | **Aligned** | Web uses `[data-surface]` cascade; native uses `<Surface>` + `useSurfaceTokens`. |
| **Animation** | **Partially aligned** | Web uses CSS `transition` on `background-color`. Native uses `Animated.Value` with spring physics from `useMotion`. Reduce-motion respected. |
| **Controlled / uncontrolled** | **Aligned** | Both support `checked` (controlled) + `defaultChecked` (uncontrolled). |
| **A11y** | **Aligned in intent** | Web → BaseUI `<button role="switch">`. Native → `accessibilityRole: 'switch'`, `accessibilityState: { checked, disabled }`. |
| **Accent override** | **Simplified on native (v1)** | Web CSS supports `accent` remapping fill vars. Native v1 ignores `accent` — fill follows `appearance`. |

---

## 2. Props parity table

| Web prop | Native prop | Notes |
|----------|-------------|-------|
| `checked` | `checked` | Controlled — aligned. |
| `defaultChecked` | `defaultChecked` | Uncontrolled — aligned. |
| `onCheckedChange` | `onCheckedChange` | Aligned. |
| `size` | `size` | `'s'\|'m'\|'l'` + legacy aliases — aligned. |
| `appearance` | `appearance` | Full `ComponentAppearance` — aligned. |
| `accent` | `accent` (prop kept, v1 ignored) | Web CSS remaps fill. Native v1: accent not applied. |
| `disabled` | `disabled` | Aligned. |
| `readOnly` | `readOnly` | Aligned in semantics; visual differs (see §1). |
| `children` (ReactNode) | `children` (string only) | Web supports any ReactNode. Native renders string only. |
| `name` | `name` | Prop kept for symmetry; no form submission on RN. |
| `id` | omit | DOM-only. |
| `aria-label` | `aria-label` | Aligned. |
| `aria-labelledby` | omit | DOM-only (no RN equivalent). |
| `className` | omit | DOM-only. |
| `style` (`CSSProperties`) | `style` (`ViewStyle`) | Platform-specific type. |
| `data-testid` | `testID` | RN convention. |
| `accessibilityHint` | `accessibilityHint` | RN-specific — native only. |
| `aria-hidden` | `aria-hidden` | Native maps to `accessibilityElementsHidden`. |

---

## 3. Token mapping — web CSS var → native token

| Web CSS variable | Native equivalent | Notes |
|-----------------|-------------------|-------|
| `--{Role}-Bold` | `role.surfaces.bold` | Checked track fill |
| `--{Role}-Bold-TintedA11y` | `role.onBoldContent.tintedA11y` | Checked thumb fill |
| `--Neutral-Subtle` | `neutralRole.surfaces.subtle` | Unchecked track fill |
| `--Surface-Default` | `role.surfaces.default` | Unchecked thumb fill |
| `--{Role}-Bold-Hover` | n/a (no hover on RN) | — |
| `--{Role}-Bold-Pressed` | n/a (v1, tracked) | Press state not yet animated |
| `--Neutral-Subtle-Hover` | n/a | — |
| `--Disabled-Opacity` (0.5) | `DISABLED_OPACITY = 0.5` | Intentional literal |
| `--Spacing-7/9/10` | `tokens.spacing['7'/'9'/'10']` | Track width per size |
| `--Spacing-3/4/5` | `tokens.spacing['3'/'4'/'5']` | Knob size per size |
| `--Spacing-0-5` | `tokens.spacing['0-5']` | Track padding |
| `--Shape-Pill` | `tokens.shape.Pill` | Track + thumb border radius |
| `--Body-{S\|M\|L}-FontSize` | `useTypographyTokens('body', '{S\|M\|L}')` | Label typography |

---

## 4. Accessibility — RN mapping

| Prop | Web behaviour | Native mapping |
|------|---------------|----------------|
| `aria-label` | `<button>` `aria-label` | `accessibilityLabel` |
| `children` (string, no `aria-label`) | wrapping `<label>` text | `accessibilityLabel = children` |
| `disabled` | `aria-disabled` | `accessibilityState.disabled = true` |
| `readOnly` | `aria-readonly` | `accessibilityState.disabled = true` + `aria-readonly` prop |
| `checked` | `aria-checked` (true/false) | `accessibilityState.checked` (boolean) |
| `aria-hidden` | rare | `accessibilityElementsHidden = true` + `importantForAccessibility = 'no-hide-descendants'` |

---

## 5. What is intentionally simpler on native (v1)

| Web feature | Native v1 behaviour | Why |
|-------------|---------------------|-----|
| ReadOnly unchecked: transparent track + outline + smaller knob | Non-interactive neutral track | Simplified; tracked as follow-up. |
| `accent` cross-role fill override | Prop accepted but not applied | CSS-only cascade with `--_sw-bold` remapping. Native v1 uses `appearance` only. |
| `:hover` background tint | none | No hover on touch. |
| `:focus-visible` Informative halo | none | RN touch surfaces have no focus indicator. |
| Thumb press-scale (`--_sw-thumb-press-scale: 1.07`) | none (v1) | When press animation lands, use `useMotion` spring. |

---

## 6. Files

| File | Purpose |
|------|---------|
| `packages/ui-native/src/components/Switch/interface.ts` | Props, `useSwitchState`, `getSwitchAccessibilityProps`, `resolveSize`. |
| `packages/ui-native/src/components/Switch/Switch.styles.native.ts` | Static geometry (`StyleSheet.create`), per-size track/knob maps, constants. |
| `packages/ui-native/src/components/Switch/Switch.native.tsx` | Render + animated track/thumb, controlled/uncontrolled state, label. |
| `packages/ui-native/src/components/Switch/Switch.showcase.native.tsx` | Gallery (Default / Sizes / Appearances / States / WithLabel / SurfaceContext / Controlled). |
| `packages/ui-native/src/components/Switch/index.ts` | Barrel — re-exports `Switch`, prop types, state + a11y helpers. |
| `packages/ui-native/src/components/Switch/__tests__/SwitchA11y.test.ts` | Vitest suite for the a11y helper + state resolver. |
| `packages/ui-native/src/components/Switch/Switch.usage.md` | Props table + code examples. |

---

## 7. Open follow-ups

- Implement visual ReadOnly unchecked state (transparent track + outline + smaller knob dot matching web).
- Wire `accent` prop (primary / secondary / sparkle) to apply the cross-role fill override.
- Add thumb press-scale animation (tap → 1.07 scale) using `useMotion` spring.
- Add pressed-state track color flip using `Pressable`'s pressed callback.
