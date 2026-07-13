# IconContained: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

This document compares the **React (web)** and **React Native** IconContained
implementations and lists every intentional or remaining difference as of the
current codebase.

**Primary sources**

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/IconContained/IconContained.tsx` | `packages/ui-native/src/components/IconContained/IconContained.native.tsx` |
| Layout / static visuals | `packages/ui/src/components/IconContained/IconContained.module.css` | `packages/ui-native/src/components/IconContained/IconContained.styles.native.ts` |
| Prop contract / state | `packages/ui/src/components/IconContained/IconContained.shared.ts` | `packages/ui-native/src/components/IconContained/interface.ts` |
| A11y helper | implicit (DOM `role="img"` + `aria-label`) | `getIconContainedAccessibilityProps` (same module as the props) |
| Surface / theme | Injected CSS + `[data-surface]` | `SurfaceContext.tsx`, `buildNativeTheme`, `useSurfaceTokens` |
| Layers cross-check | n/a | `libs/react-4/.../jdsiconcontained-4.ts` (Figma codegen) |

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|--------|
| **Prop contract** | **Aligned** | Same `size`, `attention`, `appearance`, `disabled`, `aria-label`, `icon` shape. Native adds `testID`, `accessibilityHint`, `aria-hidden`. |
| **Default attention** | **Aligned** | `'high'` on both platforms. Layers `JDSIconContained` defaults to `'medium'` — OneUI overrides this to mirror Figma's high-emphasis IconContained samples. |
| **Sizes (`xs|s|m|l|xl`)** | **Aligned** | Container sides: `Spacing-3 / 4 / 5 / 6 / 8`. Icon sides: `Spacing-2 / 2-5 / 3 / 4 / 5`. Web reads `var(--Spacing-N)`; native reads `tokens.spacing['N']`. |
| **Attention (`high|medium`)** | **Aligned** | High → bold fill + on-bold tinted-a11y icon. Medium → subtle fill + content tinted icon. |
| **Appearances (9 roles + auto)** | **Aligned** | Web: per-role CSS classes remap `--_ic-*` intermediate vars. Native: `useSurfaceTokens(resolvedAppearance)` returns the equivalent role tokens directly. `'auto'` → `'primary'` on both. |
| **Surface context awareness** | **Aligned** | Web uses `[data-surface]`; native uses `<Surface>` + `useSurfaceTokens`. Same intent: tokens remap on bold/subtle/etc. parents so the inner fill stays distinguishable. |
| **Shape / corner radius** | **Aligned** | Both default to `Shape-Pill`. Both honour the `IconContained` recipe `cornerRadius` decision (`none|small|medium|large|pill`). Web reads `var(--IconContained-borderRadius)`; native uses `useComponentRecipe('icon-contained')` + `resolveRecipeBorderRadius(decisions, shape)`. |
| **Disabled** | **Aligned** | Both apply `Disabled-Opacity` (0.5) and disable hit testing. |
| **Icon slot** | **Different by design** | Web: `icon` accepts `SemanticIconName | ReactElement`; semantic strings render via `<Icon name=…>`. Native: also accepts `IconComponent` (JDS `react-native` glyph). Semantic name **strings** emit a dev warning and render `null` (mirrors `Button.start` / `Avatar.icon`). |
| **Icon colour propagation** | **Aligned** | Web: `.icon { color: var(--_ic-…) }` cascades to `<svg>` via `currentColor`. Native: `IconContained` provides `ComponentSlotIconContext` (`sizePx`, `color`); nested `<Icon>` reads it. Custom inline `<Svg>` in showcases reads via `useComponentSlotIconContext`. |
| **A11y** | **Aligned in intent, richer on native** | Web emits `<span role="img" aria-label>`. Native maps to `accessibilityRole: 'image'`, `accessibilityLabel`, `accessibilityState: { disabled }`. Native additionally collapses the subtree under `aria-hidden={true}` via `accessibilityElementsHidden` + `importantForAccessibility: 'no-hide-descendants'`, and forwards `accessibilityHint`. |
| **Decoration ornaments** | **n/a** | IconContained has none on either platform. |
| **Hover / press / focus** | **n/a** | Decorative element on both platforms. No focus halo, no press feedback. |
| **Motion** | **n/a** | No transitions tokenized for IconContained. |

---

## 2. What is shared (single source of truth)

### 2.1 `IconContained.shared.ts` (web)

`useIconContainedState` decides:
- `resolvedSize` (default `'m'`)
- `resolvedAttention` (default `'high'`)
- `resolvedAppearance` (`'auto'` / unset → `'primary'`)
- `isDisabled` (default `false`)
- cross-platform `dataAttrs` (`data-size`, `data-attention`, `data-appearance`)

### 2.2 `interface.ts` (native)

Native owns its prop contract and **does not** import from
`@oneui/ui/components/IconContained/shared` (per the parity rule). The native
`useIconContainedState` returns the same shape and the same defaults as web.
`dataAttrs` are kept on the return value for symmetry; they are not currently
attached to the `<View>` because RN styling is not selector-driven.

---

## 3. Token mapping (web CSS → native paint)

| Web (CSS module variable) | Web fallback chain | Native (`NativeRoleTokens`) |
|---------------------------|--------------------|------------------------------|
| `--_ic-bold` | `--{Role}-Bold` → `--Surface-Bold` | `role.surfaces.bold` |
| `--_ic-bold-high` | `--{Role}-Bold-TintedA11y` → `--{Role}-Bold-High` → `--Text-OnBold-High` | `role.onBoldContent.tintedA11y` |
| `--_ic-subtle` | `--{Role}-Subtle` → `--Surface-Subtle` | `role.surfaces.subtle` |
| `--_ic-default-accent` | `--{Role}-Tinted` → `--Text-High` | `role.content.tinted` |

The web `IconContained.module.css` walks a fallback chain because brands may
omit `--{Role}-Bold-TintedA11y`. On native, `buildNativeTheme` already returns
fully-resolved hex strings — the engine performs the equivalent fallback
internally — so the component reads `role.onBoldContent.tintedA11y` directly.

### 3.1 Size table

| Size | Container | Icon glyph |
|------|-----------|------------|
| xs | `Spacing-3` (12) | `Spacing-2` (8) |
| s  | `Spacing-4` (16) | `Spacing-2-5` (10) |
| m  | `Spacing-5` (20) | `Spacing-3` (12) |
| l  | `Spacing-6` (24) | `Spacing-4` (16) |
| xl | `Spacing-8` (32) | `Spacing-5` (20) |

Native reads these as `tokens.spacing['3']` … `tokens.spacing['8']` from
`@oneui/tokens`.

---

## 4. Behaviour and implementation differences (complete list)

### 4.1 Primitives and DOM

| Item | Web | Native |
|------|-----|--------|
| Root | `<span role="img">` | `<View>` (`accessibilityRole: 'image'`) |
| Inner | `<span className={styles.icon}>` | `<View style={[iconWrap, { width, height }]}>` |
| Slot icon | `<Icon name=… />` (strings supported) | `<Icon icon={Component} />` for components/elements; **dev warning + `null`** for semantic name strings |
| `className` | Composed via `clsx` | Not supported; use `style` only |

### 4.2 Styling mechanism

| Item | Web | Native |
|------|-----|--------|
| Static layout | CSS module: `inline-flex`, square sizes via `[data-size]` | `StyleSheet.create({ root, iconWrap })` + per-size `CONTAINER_SIZE` / `ICON_GLYPH_SIZE` lookups |
| Background colour | `background-color: var(--_ic-…)` | Inline `backgroundColor` from `paintFor(resolvedAttention, role)` |
| Icon colour | `.icon { color: var(--_ic-…) }` cascading via `currentColor` | `ComponentSlotIconContext.Provider value={{ sizePx, color }}` wraps the slot; nested `<Icon>` reads it |
| Recipe overrides | CSS vars from recipe pipeline | `useComponentRecipe('icon-contained')` + `resolveRecipeBorderRadius(decisions, shape)` |
| Disabled | `opacity: var(--Disabled-Opacity); pointer-events: none` | `opacity: 0.5` (literal matches `--Disabled-Opacity`); `pointerEvents: 'none'` |

### 4.3 Surface context awareness

Web emits `[data-surface="bold"] { … }` blocks inside `@layer brand`,
remapping every `--{Role}-*` token to the parent-relative resolution.
Native achieves the same via `<Surface>` updating `SurfaceContext`, which
`useSurfaceTokens(role)` reads — so an `IconContained attention="high"`
inside `<Surface mode="bold">` automatically picks the contrasting bold step.

### 4.4 Slot icon contract

| Input | Web | Native |
|-------|-----|--------|
| `ReactElement` | Rendered as-is inside `.icon` | Rendered as-is, wrapped in `ComponentSlotIconContext.Provider` (so nested `<Icon>` adopts the contained slot's `sizePx` + `color`) |
| `IconComponent` (JDS / RN SVG) | Web doesn't have this slot type — semantic strings cover it | Rendered via `<Icon icon={Component} aria-hidden />` inside the slot context |
| `SemanticIconName` (string) | Resolved via `<Icon name=…>` | Dev warning, returns `null` (parity gap shared with Button start/end and Avatar.icon) |

**Parity gap:** semantic-name strings on `icon`. Closing it requires a native
icon registry (or `IconProvider`). Tracked in the broader Button/Avatar slot
backlog — not IconContained-specific.

### 4.5 Accessibility differences

| Item | Web | Native |
|------|-----|--------|
| Required name | `aria-label` recommended; without one, screen readers may speak "image" | Without `aria-label`, the node is `accessible: false` (decorative). With one, `accessibilityRole: 'image'` + `accessibilityLabel`. |
| `aria-hidden` | Browser respects `aria-hidden` on `<span role="img">` | Maps to `accessibilityElementsHidden: true` + `importantForAccessibility: 'no-hide-descendants'` to also drop descendants on Android. |
| Disabled | Visual-only on web | Visual + `accessibilityState: { disabled }` for VoiceOver / TalkBack. |
| Hint | n/a (web) | `accessibilityHint` exposed for native (RN-only API). |

### 4.6 Layers (`JDSIconContained`) reconciliation

| Concept | OneUI | Layers |
|---------|-------|--------|
| Default `attention` | `'high'` | `'medium'` |
| `appearance` | `ComponentAppearance` (9 roles + `'auto'`) | adds `'accent'` (omitted from OneUI) |
| Slot | `icon: SemanticIconName | ReactElement | IconComponent` | `icon: string` (icon name) + optional `children` |
| Surface awareness | Native: `useSurfaceTokens` + `<Surface>` | Layers wraps in `SurfaceScaleLayer surface=fgBold|fgSubtle` |
| `aria-live` | Not emitted (decorative, static) | Optional Layers prop (`ariaLive`) — not modelled in OneUI |

The OneUI native peer follows the OneUI web contract; Layers' enums and
slot names were used only as a Figma cross-check.

---

## 5. Quality gate verification

```bash
pnpm --filter @oneui/ui-native typecheck
pnpm test --filter @oneui/ui-native
pnpm check:literals
pnpm check:parity
```

The native `IconContained` directory satisfies `scripts/check-parity.ts` file
presence and is not subject to the shared-import enforcement (the rule
applies to components that originally imported from
`@oneui/ui/components/<X>/shared`; IconContained is owned via `interface.ts`).

---

## 6. Quick mental model

```text
WEB
brand CSS injects --{Role}-Bold, --{Role}-Bold-TintedA11y, --{Role}-Subtle, …
→ IconContained.module.css points --_ic-bold/--_ic-subtle/--_ic-bold-high
  at the active role variables
→ [data-surface] remaps the same variable names per surface context

NATIVE
buildNativeTheme() → OneUINativeTheme per role
→ useSurfaceTokens(resolvedAppearance) returns the role bag for the current
  Surface boundary
→ paintFor(attention, role) returns { bg, iconColor }
→ <View backgroundColor=bg> + slot context (color=iconColor) for the glyph
```

**Same brain (shared engine / shared shapes), different skin (CSS vs JS).**
