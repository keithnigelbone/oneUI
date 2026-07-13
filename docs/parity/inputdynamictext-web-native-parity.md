# InputDynamicText: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

InputDynamicText is the helper row that sits below an `Input` and surfaces
character counts, hints, and a single trailing affordance (e.g. "Clear",
"Show", "Helper Button"). Figma node: `.DNA/DynamicText` (S / M / L —
`4257:45866`, `4257:45674`, `4257:45854`).

## Primary sources

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/Input/internals/InputDynamicText.tsx` | `packages/ui-native/src/components/InputDynamicText/InputDynamicText.native.tsx` |
| Layout / static visuals | `packages/ui/src/components/Input/internals/InputDynamicText.module.css` | `packages/ui-native/src/components/InputDynamicText/InputDynamicText.styles.native.ts` |
| Prop contract / state | `packages/ui/src/components/Input/Input.shared.ts` (`InputDynamicTextProps`, `InputLabelSize`) | `packages/ui-native/src/components/InputDynamicText/interface.ts` |
| A11y helper | implicit (`<p aria-live>` + `<Button aria-label>`) | `getInputDynamicTextAccessibilityProps` + `resolveAccessibilityLiveRegion` in the same module as the props |
| Surface / theme | Injected CSS + `[data-surface]` cascade | `SurfaceContext.tsx`, `buildNativeTheme`, `useSurfaceTokens('primary')` |
| Layers cross-check | n/a | `libs/react-native/.../jdsinputdynamictext/generated/interface.ts` |

> **Web file location** — InputDynamicText is an `internals/` peer of `Input` on
> web, so `pnpm check:parity` does not enforce a top-level native file for it.
> The native component still lives at the canonical
> `packages/ui-native/src/components/InputDynamicText/` per the playbook so
> downstream apps can import it directly.

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|--------|
| **Prop shape** | **Aligned** | `content`, `end`, `size`, `disabled`, `aria-live`, `onEndClick`, `endAriaLabel` available on both. Native adds `testID` and `accessibilityHint` (forwarded to the trailing Button); native omits web-only `className`, `id`, `style: CSSProperties` (replaced by `ViewStyle`). |
| **Empty-state** | **Aligned** | Both render nothing when neither `content` nor `end` is non-empty after `String.trim()`. |
| **Sizes (`s | m | l`)** | **Aligned** | Web reads `var(--Body-{XS|S|M}-FontSize/LineHeight)`; native reads the same tier via `useTypographyTokens('body', 'XS'|'S'|'M', { emphasis: 'low' })`. Native applies the standard `Math.ceil(fontSize × 1.25)` line-height stabilisation. |
| **Layout** | **Aligned** | Row, `space-between`, gap `--Spacing-1-5` (6) on web → `tokens.spacing['1-5']` on native. When only `end` is populated, both flip to `flex-end`. Size `l` keeps a `min-height: var(--Spacing-6)` (24) on the leading copy on both platforms. |
| **Leading copy colour** | **Aligned** | Web uses `--Text-Medium` / `--Text-Low` (disabled). Native reads `useSurfaceTokens('primary').content.medium` / `.low` — the same role aliases the web tokens come from. |
| **Surface context awareness** | **Aligned** | Web `[data-surface]` cascade and native `useSurfaceTokens('primary')` both remap the content colour inside `<Surface mode="bold | subtle | …">` without per-component logic. |
| **Trailing action** | **Aligned** | Web renders `<Button attention="low" condensed size={…}>`; native delegates to `<Button>` from `@oneui/ui-native` with the same props (size mapping `s→s, m→m, l→l`). |
| **Disabled** | **Aligned** | Both dim the leading copy to `Text-Low` / `content.low` and pass `disabled` to the trailing Button. RN reports `accessibilityState.disabled = true` on the Button via the underlying `Pressable`. |
| **Live region (`aria-live`)** | **Aligned in intent** | Web sets `aria-live` directly on the leading `<p>`; native maps it to `accessibilityLiveRegion` (`off`→`none`, `polite`→`polite`, `assertive`→`assertive`) on the leading `<Text>`. |
| **Trailing accessible name (`endAriaLabel`)** | **Aligned** | Both forward to the trailing Button as its accessible label. |
| **Recipe / cornerRadius overrides** | **Web only** | Web honours `--InputDynamicText-*` per-component CSS overrides for font-family, size, line-height, etc. Native does not surface a recipe layer for this row today — it inherits the Button's recipe + the project typography theme. |
| **Hover / focus** | **Web only** | The trailing Button uses native press tint on RN; web adds hover + focus halo via the Button stack. |

---

## 2. Layers cross-check

`libs/react-native/.../jdsinputdynamictext/generated/interface.ts` describes the
Figma codegen contract:

```ts
export interface JDSInputDynamicTextProps {
  size?: 'M' | 'L' | 'S';
  content?: React.ReactElement<JDSTextProps>;
  end?: React.ReactElement<JDSButtonProps>;
  ariaLive?: string;
  ariaAtomic?: string;
  custom?: string;
  testID?: string;
}
```

OneUI keeps the **product API from web** (`InputDynamicTextProps` in
`Input.shared.ts`) as the source of truth and only borrows Layers concepts that
do not exist on web:

| Concept | OneUI (`InputDynamicTextProps`) | Layers `JDSInputDynamicTextProps` |
|---------|----------------------------------|------------------------------------|
| Size | lowercase `'s' | 'm' | 'l'` | uppercase `'S' | 'M' | 'L'` |
| Leading copy | `content: string` | `content: React.ReactElement<JDSTextProps>` (typed slot) |
| Trailing action | `end: string` + `onEndClick` + `endAriaLabel` | `end: React.ReactElement<JDSButtonProps>` (typed slot) |
| Live region | `'aria-live'?: 'off' | 'polite' | 'assertive'` | `ariaLive?: string` (free-form) |
| `aria-atomic` | not exposed | `ariaAtomic?: string` |
| Test hook | `testID` (RN only) | `testID` |

The native interface follows OneUI's typed-string slot model (matches web
behaviour and keeps the integration story for `Input` straightforward); the
Layers `content` / `end` element-slot form is not exposed.

---

## 3. Visual model

### Leading copy

| Property | Web (`InputDynamicText.module.css`) | Native (`InputDynamicText.native.tsx`) |
|----------|--------------------------------------|----------------------------------------|
| Font family | `var(--Body-FontFamily, var(--Typography-Font-Primary, inherit))` | `useTypographyTokens('body', …, { emphasis: 'low' }).fontFamily` |
| Font weight | `var(--Body-FontWeight-Low)` | same — supplied by the typography hook |
| Font size (S) | `var(--Body-XS-FontSize)` | `useTypographyTokens('body', 'XS', { emphasis: 'low' }).fontSize` |
| Font size (M) | `var(--Body-S-FontSize)` | `useTypographyTokens('body', 'S', { emphasis: 'low' }).fontSize` |
| Font size (L) | `var(--Body-M-FontSize)` | `useTypographyTokens('body', 'M', { emphasis: 'low' }).fontSize` |
| Line height | `var(--Body-{XS|S|M}-LineHeight)` | `Math.ceil(fontSize × 1.25)` via the typography hook (native stabilisation) |
| Min height (L only) | `var(--Spacing-6)` (24) | `tokens.spacing['6']` (24) |
| Colour (default) | `var(--Text-Medium)` | `useSurfaceTokens('primary').content.medium` |
| Colour (disabled) | `var(--Text-Low)` | `useSurfaceTokens('primary').content.low` |
| Word break | `word-break: break-word` | RN `Text` wraps on word boundaries by default; no manual override needed |

### Trailing action

The trailing slot is a real OneUI Button on both platforms:

- Web: `<Button type="button" attention="low" condensed size={s|m|l} … />`
- Native: `<Button attention="low" condensed size={s|m|l} … />`

`attention="low"` → `variant="ghost"` (transparent fill, `content.tintedA11y`
text on both web and native). `condensed` collapses the Button's vertical
padding to match the inline helper-row baseline.

---

## 4. Public API

`InputDynamicTextProps` (native):

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `content` | `string` | — | Leading copy. Hidden when empty after trim. |
| `end` | `string` | — | Trailing action label. Hidden when empty after trim. |
| `size` | `'s' | 'm' | 'l'` | `'m'` | Matches the field label stack header tier. |
| `disabled` | `boolean` | `false` | Dims leading copy + disables the Button. |
| `'aria-live'` | `'off' | 'polite' | 'assertive'` | — | Mapped to `accessibilityLiveRegion`. |
| `onEndClick` | `() => void` | — | Trailing Button press handler (no event arg). |
| `endAriaLabel` | `string` | — | Override the trailing Button's accessible name. |
| `accessibilityHint` | `string` | — | Forwarded to the trailing Button (RN). |
| `style` | `ViewStyle` | — | Merged onto the row container. |
| `testID` | `string` | — | RN test identifier. |

`useInputDynamicTextState(props)` exposes the resolved size, slot flags
(`hasContent`, `hasEnd`, `trailingOnly`, `isEmpty`), and a normalised
`isDisabled`.

`getInputDynamicTextAccessibilityProps({ 'aria-live' })` returns the
RN-ready descriptor for the leading `<Text>` (`accessibilityRole: 'text'` +
optional `accessibilityLiveRegion`).

---

## 5. Known gaps (do not fake)

- No recipe / token overrides surface (`--InputDynamicText-*`) on native. Wire
  through `useComponentRecipe('inputDynamicText')` if/when the recipe ships.
- No hover or focus states — RN has neither concept; both states are
  intentionally web-only.
- Web uses `<p aria-live>` for the leading copy; native equivalent is `<Text>`
  with `accessibilityLiveRegion`. The trailing Button retains its own a11y
  contract on both platforms.

---

## 6. Quality gates

```
pnpm --filter @oneui/ui-native typecheck
pnpm test --filter @oneui/ui-native -- InputDynamicTextA11y
pnpm check:literals
pnpm check:parity
```

Manual QA: render the showcase exports in `apps/native-components-sample` (or
`pnpm dev:native`) on a default surface AND inside `<Surface mode="bold">` to
verify content recoloring through the surface cascade.
