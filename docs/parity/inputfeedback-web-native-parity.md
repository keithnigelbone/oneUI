# InputFeedback: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

Contextual feedback / validation row rendered under an Input. **3 attention levels × 4 semantic variants × 3 sizes** matching Figma `.DNA/InputFeedback` (node 3450:1388).

**Sources**

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/Input/internals/InputFeedback.tsx` | `packages/ui-native/src/components/InputFeedback/InputFeedback.native.tsx` |
| Static styles | `packages/ui/src/components/Input/internals/InputFeedback.module.css` | `packages/ui-native/src/components/InputFeedback/InputFeedback.styles.native.ts` |
| Props / state | `packages/ui/src/components/Input/Input.shared.ts` (`InputFeedbackProps`, `resolveFeedbackSize`) | `packages/ui-native/src/components/InputFeedback/interface.ts` (native-owned, **no** `@oneui/ui` import) |
| Layers cross-check | `layers-web/libs/react-4/.../jdsinputfeedback-4/logic.tsx` | `layers-web/libs/react-native/.../jdsinputfeedback/generated/interface.ts` |

> **Note:** On web, `InputFeedback` is an *internal* of the Input family (lives under `Input/internals/`). On native we lift it to a top-level component because it has its own behaviour and is reusable outside Input contexts (e.g. inline form-level validation summaries).

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|--------|
| **Public API surface** | **Aligned** | `variant`, `attention`, `size`, `feedback_message`, `customIcon`, `children`, `role`. |
| **Variant enum** | **Aligned** | `negative \| positive \| warning \| informative`. |
| **Attention enum** | **Aligned** | `low \| medium \| high`. Web `low` = text-only; `medium` = subtle tint; `high` = bold fill. Native matches via `useSurfaceTokens(variant)` → `surfaces.subtle` / `surfaces.bold`. |
| **Size enum** | **Narrowed on native** | Web: `8 \| 10 \| 12 \| 's' \| 'm' \| 'l'` (numeric f-step + t-shirt). Native: `'s' \| 'm' \| 'l'` only — numeric inputs are not part of the native public API. `resolveFeedbackSize` maps the t-shirt to numeric f-step internally for the style tables. |
| **`feedback_message` vs `children`** | **Aligned** | `feedback_message.trim()` wins when non-empty; otherwise fall through to `children`. Renderer returns `null` if neither is renderable and `customIcon` is also unset (web returns null when `!hasRenderableMessage && !showFieldErrorSlot`; native uses the icon as the equivalent gate). |
| **Default icons** | **Web only** | Web maps `negative → error`, `positive → checkCircle`, `warning → warning`, `informative → info` via semantic icon names. Native has no semantic catalogue, so callers pass `customIcon={<Icon icon={JdsXxx} />}`. Without `customIcon`, native renders no icon. |
| **`customIcon`** | **Different shape** | Web: `SemanticIconName` string. Native: `ReactNode` — pass the icon component yourself (`<Icon icon={JdsError} />`). String customIcon dev-warns and is dropped. |
| **Colour cascade** | **Aligned** | Web `--_fb-bold` / `--_fb-subtle` / `--_fb-bold-high` per-variant intermediate vars → native `useSurfaceTokens(role)` lookup keyed by `attention`. |
| **Message text colour** | **Aligned** | `low` / `medium` → `pageRole.content.high` (matches web `--Text-High`); `high` → `role.onBoldContent.high`. |
| **Typography** | **Aligned** | Web `Body-XS` for size 8/10, `Body-S` for size 12. Native uses `useTypographyTokens('body', size)` with `emphasis: 'low'`. |
| **Padding / radius scale** | **Aligned** | Web `data-size` selectors → native per-size StyleSheet entries (`PADDING_FILLED` + `RADIUS`). Low attention strips padding to zero. |
| **`role` prop** | **Aligned** | Default `alert` for `negative`, `status` otherwise. `role='none'` opts out of the live region. |
| **`aria-live`** | **Aligned (via `accessibilityLiveRegion`)** | RN's `accessibilityLiveRegion` carries the same semantics — `assertive` for alert, `polite` for status. |
| **`accessibilityRole`** | **Partial** | RN supports `'alert'` natively. There is no RN `'status'` role; live region carries the meaning. |
| **`fieldErrorSlot`** | **Web only** | Wraps Base UI `Field.Error`. React Native has no equivalent form primitive — gap documented; native consumers compute the error string themselves and pass `feedback_message`. |
| **`ref`** | **Web only** | `forwardRef<HTMLDivElement>` on web. Native exposes no ref API today (additive when needed). |
| **`className` / `style`** | **`style` aligned, `className` web only** | Web: `CSSProperties` + `className`. Native: `ViewStyle`. |
| **Surface context** | **Aligned** | Web `[data-surface]` remaps role tokens inside `<Surface>`. Native `useSurfaceTokens(role)` already resolves against the nearest `<Surface>` parent — same model as Button / Badge / Text. |

---

## 2. Shared contract (manually mirrored)

`interface.ts` is hand-copied from `Input.shared.ts`'s feedback section:

- Enums: `InputFeedbackVariant`, `InputFeedbackAttention`, `InputFeedbackSize` (`'s' | 'm' | 'l'`). Style tables (`PADDING_FILLED_STYLE`, `RADIUS_STYLE`, `FEEDBACK_TO_ICON_SIZE`, `SIZE_TO_BODY`) are all keyed off the same t-shirt enum — there is no numeric f-step intermediate on native.
- Iteration tuples: `INPUT_FEEDBACK_VARIANTS`, `INPUT_FEEDBACK_ATTENTIONS`, `INPUT_FEEDBACK_SIZES` (t-shirt only).
- `resolveFeedbackSize('s' | 'm' | 'l')` is an identity-with-fallback (`'m'` for unsafe casts).

The pure state resolver is exposed as `useInputFeedbackState` (native naming convention — see playbook §3). Not a React hook: it's pure and safe to call outside React.

`getInputFeedbackAccessibilityProps(props, state)` is the native-only helper. It:

- Returns `accessible: false` + `accessibilityElementsHidden: true` + `importantForAccessibility: 'no-hide-descendants'` for `aria-hidden`.
- Sets `accessibilityRole='alert'` for negative variants; leaves role unset for `status` (RN convention).
- Sets `accessibilityLiveRegion` per `state.liveRegion`.
- Resolves `accessibilityLabel` from `aria-label` → string `message` content.

---

## 3. Layers ↔ OneUI mapping

| Concept | OneUI (`InputFeedbackProps`) | Layers `JDSInputFeedbackProps` |
|---------|------------------------------|--------------------------------|
| Visual prominence | `attention: low \| medium \| high` | `attention: low \| medium \| high` — same enum |
| Semantic role | `variant: negative \| positive \| warning \| informative` | `variant` — same enum |
| Size | `size: 's' \| 'm' \| 'l'` | `size: 'M' \| 'S' \| 'L'` (Layers uses uppercase t-shirt) |
| Copy | `feedback_message?: string` (preferred) | `text?: string` |
| A11y label | `aria-label` | `ariaLabel` (camelCase) |
| A11y hidden | `aria-hidden` | (no equivalent) |
| Described-by | `aria-describedby` | `ariaDescribedby` (camelCase) |
| Live region | inferred from `role` | `ariaLive` (explicit string) |
| Atomic live | (not implemented) | `ariaAtomic` (Layers-only) |
| Test id | `testID` | `testID` — same |

---

## 4. Implementation differences

| Area | Web | Native |
|------|-----|--------|
| Render primitive | `<div role="...">` with optional `Field.Error` swap | `<View>` + nested `<RNText>` |
| Fill colour | `var(--_fb-subtle)` / `var(--_fb-bold)` per variant CSS module | Inline `backgroundColor` from `useSurfaceTokens(role).surfaces.{subtle,bold}` |
| Icon | `<Icon icon={SemanticIconName} appearance emphasis size />` from `'../../Icon'` | `customIcon` ReactNode passed through; slot-context provider sets size + colour for nested `<Icon>` |
| Message font | `var(--Body-{XS\|S}-FontSize)` + `var(--Body-FontWeight-Low)` + `var(--Body-FontFamily)` | `useTypographyTokens('body', size, { emphasis: 'low' })` |
| Live region | `aria-live="assertive\|polite"` | `accessibilityLiveRegion="assertive\|polite"` |
| Negative role | `role='alert'` (HTML) | `accessibilityRole='alert'` (RN) |
| Status role | `role='status'` (HTML) | `accessibilityLiveRegion='polite'` (no RN `status` role) |
| Empty branch | returns `null` when no message AND no `fieldErrorSlot` | returns `null` when no message AND no `customIcon` |

---

## 5. Known gaps / follow-up backlog

1. **Default semantic icons** — once a JDS semantic-name → `IconComponent` catalogue ships for native, restore per-variant defaults (`negative → JdsError`, etc.) so callers don't have to wire `customIcon` explicitly.
2. **`fieldErrorSlot`** — depends on a native equivalent of Base UI `Field.Error`. Will land alongside the native InputField port.
3. **`ref`** — RN `View` ref isn't forwarded yet. Add when a consumer (measurement, focus management) needs it.
4. **Disabled state** — InputFeedback has no `disabled` prop; consumers signal irrelevance by clearing `feedback_message`.

---

## 6. Related

- [Parity index](./README.md)
- [Text](./text-web-native-parity.md) — shared `useSurfaceTokens` + `useTypographyTokens` pattern
- [Native component build playbook](../native-component-build-playbook.md)
- [`docs/surface-context-awareness.md`](../surface-context-awareness.md) — how `[data-surface]` ↔ `<Surface mode>` keep tokens in lockstep
