# Input: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

Text input control: optional label + description stack, bordered **4-slot** shell (`start` / `start2` / `end` / `end2`), and the text control. Mirrors Figma `.DNA/Input` (node 4306:7247 + 4654:4141) — **3 sizes × 8 appearance roles × 2 attentions × `default | pill` shape**.

**Sources**

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/Input/Input.tsx` | `packages/ui-native/src/components/Input/Input.native.tsx` |
| Static styles | `packages/ui/src/components/Input/Input.module.css` | `packages/ui-native/src/components/Input/Input.styles.native.ts` |
| Props / state | `packages/ui/src/components/Input/Input.shared.ts` (`InputProps`, `useInputState`, `resolveSize`, `inputSizeToLabelSize`) | `packages/ui-native/src/components/Input/interface.ts` (native-owned, **no** `@oneui/ui` import) |
| Stories | `packages/ui/src/components/Input/Input.stories.tsx` + `Input.showcase.tsx` | `packages/ui-native/src/components/Input/Input.showcase.native.tsx` |
| Layers cross-check | `layers-web/libs/react/.../jdsinput-4/generated/interface.ts` | `layers-web/libs/react-native/.../jdsinput/generated/interface.ts` |

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|-------|
| **Public API surface** | **Aligned** | `label`, `description`, `labelSuffixInside`, `labelTrailing`, `size`, `appearance`, `shape`, `attention`, `errorHighlight`, `start`, `start2`, `end`, `end2`, `placeholder`, `value`/`defaultValue`/`onChange`, `disabled`, `readOnly`, `required`, `type`, `maxLength`, focus/blur/submit handlers. |
| **Variant enum (`appearance`)** | **Aligned (narrower than `ComponentAppearance`)** | Both: `auto \| primary \| secondary \| neutral \| sparkle \| positive \| negative \| warning \| informative`. No `brand-bg` (web `Input.shared.ts` documents this gap; native mirrors it). |
| **Size enum** | **Aligned** | Web: `8 \| 10 \| 12 \| 's' \| 'm' \| 'l' \| 'small' \| 'medium' \| 'large'`. Native: same union. `resolveInputSize` normalises to numeric `8 \| 10 \| 12`, dev-warns on legacy aliases. |
| **Attention enum** | **Aligned** | `medium` (outlined) ↔ `high` (filled). Native: `attention='high'` → `role.surfaces.subtle` background + 0px border; focus flips to `Spacing-0-5` accent border. |
| **Shape enum** | **Aligned** | `default` (per-size `Shape-0-5` / `Shape-2` / `Shape-3`) ↔ `pill` (`Shape-Pill`). |
| **Default appearance** | **Aligned** | `'auto'`/unset → `'secondary'` (matches web `useInputState` — Figma default for focus + accent paints). |
| **Label stack** | **Aligned** | Label + description + optional `labelTrailing` on a single row, vertical gap `Spacing-1-5`. Native renders `<Text>` with `useTypographyTokens('label', 'S\|M\|L', { emphasis: 'medium' })`. |
| **`labelSuffixInside`** | **Aligned** | Web inlines after the label string inside the `<label>` element; native appends inside the label `<Text>` so it inherits the same font run. Pass `aria-hidden` decorations only — no inline interactive controls. |
| **`labelTrailing`** | **Aligned** | Web renders a `<span>` after the label; native renders a sibling `<View>` aligned to the row end. Use for `IconButton` controls (e.g. info button) so they're not nested under the label. |
| **`errorHighlight` / `aria-invalid`** | **Aligned** | Web sets `data-invalid` and swaps the stroke to `Negative-Bold` at `Spacing-0-5`. Native pulls `useSurfaceTokens('negative')` and applies the same border treatment. Both honour `aria-invalid={true}` as an alias. |
| **4-slot system** | **Aligned (ReactNode-only on native)** | Web allows any ReactNode (SVG, Icon, IconButton, Avatar, Image, ChipGroup, Text). Native accepts the same shape **plus** raw `string`/`number` for the `start2`/`end2` text slots (rendered as `<Text>` with the body typography). Web-only `SemanticIconName` string slots are unsupported on native (use `<Icon icon={JdsXxx} />` instead). |
| **Slot icon tint** | **Aligned** | Web `.start { color: var(--_inp-default-medium-text) }`. Native publishes the same colour via `ComponentSlotIconContext.Provider`, so nested `<Icon>` inherits without per-callsite forwarding (peer of CSS `currentColor`). |
| **Value handling** | **Aligned** | Both expose controlled `value` + uncontrolled `defaultValue`. `onChange(value: string)` matches the web signature exactly. |
| **`type`** | **Aligned (mapped to RN keyboardType)** | Web `<input type>` → native `resolveTextInputType`: `email` → `email-address`, `number` → `numeric`, `tel` → `phone-pad`, `url` → `url`, `password` flips `secureTextEntry`, `search`/`text` default to plain keyboard. |
| **Disabled / readOnly** | **Aligned** | Web `data-disabled` + `opacity: var(--Disabled-Opacity)` ↔ native `Pressable` disabled + `INPUT_DISABLED_OPACITY` (0.4). RN `TextInput.editable={false}` covers both states. |
| **Focus state** | **Aligned** | Web `:focus-within` flips border to accent + `Spacing-0-5` width. Native tracks focus via `onFocus`/`onBlur` on `TextInput` and re-paints the container. |
| **Surface context** | **Aligned** | Web `[data-surface]` CSS overrides remap `--_inp-*` per surface. Native `useSurfaceTokens(role)` already resolves against the nearest `<Surface>` — same model as Button / Badge / InputFeedback. |
| **Token cascade** | **Aligned** | Web `--_inp-bold` / `--_inp-default-high` / `--_inp-default-medium-stroke` / `--_inp-subtle` → native `role.surfaces.bold` / `role.content.high` / `role.content.medium` / `role.surfaces.subtle`. Same intermediate names, expressed in JS. |
| **Typography** | **Aligned** | Web `var(--Body-S/M/L-*)` ↔ native `useTypographyTokens('body', 'S/M/L', { emphasis: 'low' })`. |
| **Label typography** | **Aligned** | Web `FieldLabelStack.module.css` (label = Label-S/M/L medium) ↔ native `useTypographyTokens('label', 'S/M/L', { emphasis: 'medium' })`. |
| **Pill shape** | **Aligned** | Web `var(--Shape-Pill)` ↔ native `tokens.shape.Pill` (9999). |
| **`shape='default'` radius** | **Aligned** | Confirmed against Figma `.DNA/Input` (2026-07-08): XS/6 → `Shape-1-5` (6px), S/8 → `Shape-2` (8px), M/10 → `Shape-2` (8px), L/12 → `Shape-3` (12px). Three-way disagreement before this: native rendered 2/4/4/8px; web rendered 6/8/8/12px **only with brand CSS injected** (`--Input-borderRadius-6` = `var(--Shape-1-5)`), while the CSS fallback said 2px so Storybook and any no-brand context rendered 2px on XS. The manifest was right all along; its own description ("XS=Shape/0.5") and the CSS fallback were wrong. All three now agree. Pinned by `packages/ui-native/src/components/radius-parity.test.ts`. |
| **`labelAssociation`** | **Web only** | Web allows `'native' \| 'field'` to choose between `<label htmlFor>` + plain `<input>` or Base UI `Field.Label` + `Field.Control`. RN has no `Field.Root` equivalent — native renders the label as plain `<Text>` with `accessibilityRole='text'`. |
| **`fieldErrorSlot` (Feedback)** | **Web only** | Lives on `InputFeedback`, not Input. Documented in [`inputfeedback-web-native-parity.md`](./inputfeedback-web-native-parity.md). |
| **`leftAddon` / `rightAddon`** | **Web only (deprecated)** | Native skipped — pass `start` / `end` directly. |
| **`ref` / `forwardRef`** | **Web only today** | Web `forwardRef<HTMLInputElement>`. Native exposes no ref API in this iteration (additive when needed). |
| **CSS variable overrides** | **Web only** | Web emits `var(--Input-*)` hooks for brand-level customisation (height, padding, border colours). Native consumers customise via brand `useSurfaceTokens` + (future) `useComponentRecipe('input')`. |

---

## 2. Shared contract (manually mirrored)

`interface.ts` is hand-copied from `Input.shared.ts`:

- Enums: `InputAppearance`, `InputSize`, `InputShape`, `InputAttention`, `InputNumericSize`, `InputLabelSize`.
- Iteration tuples: `INPUT_APPEARANCES` (non-auto), `INPUT_SIZES` (t-shirt), `INPUT_NUMERIC_SIZES`, `INPUT_ATTENTIONS`.
- `resolveInputSize(size)` normalises any `InputSize` to `8 | 10 | 12`. Dev-warns on legacy `small`/`medium`/`large`.
- `inputSizeToLabelSize(size)` maps any size to the label-stack tier (`s | m | l`).
- `resolveTextInputType(type)` maps web-aligned `type` to RN `keyboardType` + `secureTextEntry`.
- `useInputState(props)` — pure state resolver: `'auto'` → `'secondary'`, numeric/label sizes, defaulted shape/attention, disabled/readOnly/error flags, label-stack predicate.
- `getInputAccessibilityProps(props, state)` — RN a11y mapper:
  - `aria-hidden` → `accessible: false` + `accessibilityElementsHidden: true` + `importantForAccessibility: 'no-hide-descendants'`.
  - `accessibilityLabel` ← `aria-label` ?? trimmed `label`.
  - `accessibilityState.disabled` ← `isDisabled || isReadOnly` (RN has no read-only role; AT consumers treat read-only as disabled).
  - `aria-describedby` and `aria-invalid` are surfaced verbatim for cross-platform tests.

The state resolver name follows the playbook (`use*State` ≠ a React hook; it's a pure function safe to call outside React, matching web `useInputState`).

---

## 3. Paint pipeline ↔ web intermediate variables

Web's `Input.module.css` declares per-appearance intermediate vars that the surface context engine remaps inside `<Surface>`:

```
.appearancePrimary   { --_inp-bold: var(--Primary-Bold); --_inp-default-medium-stroke: var(--Primary-Stroke-Medium); ... }
.appearanceNegative  { --_inp-bold: var(--Negative-Bold); ... }
```

Native expresses the same cascade in JS:

```tsx
const role = useSurfaceTokens(resolvedAppearance);        // primary / secondary / negative / …
const paint = inputPaintFor({ role, attention, hasFocus, hasError });
//   paint.borderColor   ← role.content.medium    // web --_inp-default-medium-stroke
//   paint.borderColor   ← role.surfaces.bold     // web --_inp-bold  (focus)
//   paint.background    ← role.surfaces.subtle   // web --_inp-subtle (attention='high')
//   paint.textColor     ← role.content.high      // web --_inp-default-high
//   paint.placeholderColor ← role.content.low    // web --_inp-default-low
//   paint.slotColor     ← role.content.medium    // web --_inp-default-medium-text
```

Error state replaces the role with `useSurfaceTokens('negative')` so the border resolves to `Negative-Bold` (matches web `data-invalid`).

Surface context flows automatically: a `<Surface mode="bold">` wrapping the `<Input>` remaps the role tokens, so `role.surfaces.subtle` evaluates against the bold surface's step (peer of web `[data-surface] .appearanceNeutral` overrides).

---

## 4. Size cascade ↔ Figma

| Size | Web rule | Native (`INPUT_SIZE_METRICS`) |
|------|---------|-------------------------------|
| **S (f8)** | `min-height: var(--Spacing-8)`, `padding-horizontal: var(--Spacing-2)`, `padding-vertical: var(--Spacing-0)`, `gap: var(--Spacing-1-5)`, `border-radius: var(--Shape-2)`, icon side `var(--Spacing-4)` | `minHeight: tokens.spacing['8']`, `paddingHorizontal: tokens.spacing['2']`, `paddingVertical: tokens.spacing['0']`, `gap: tokens.spacing['1-5']`, `borderRadius: tokens.shape['1']`, `iconSize: tokens.spacing['4']` |
| **M (f10)** | `min-height: var(--Spacing-10)`, `padding-horizontal: var(--Spacing-3)`, `padding-vertical: var(--Spacing-1-5)`, `gap: var(--Spacing-1-5)`, `border-radius: var(--Shape-2)`, icon side `var(--Spacing-5)` | `minHeight: tokens.spacing['10']`, `paddingHorizontal: tokens.spacing['3']`, `paddingVertical: tokens.spacing['1-5']`, `gap: tokens.spacing['1-5']`, `borderRadius: tokens.shape['1']`, `iconSize: tokens.spacing['5']` |
| **L (f12)** | `min-height: var(--Spacing-12)`, `padding-horizontal: var(--Spacing-4)`, `padding-vertical: var(--Spacing-2)`, `gap: var(--Spacing-2)`, `border-radius: var(--Shape-3)`, icon side `var(--Spacing-6)` | `minHeight: tokens.spacing['12']`, `paddingHorizontal: tokens.spacing['4']`, `paddingVertical: tokens.spacing['2']`, `gap: tokens.spacing['2']`, `borderRadius: tokens.shape['2']`, `iconSize: tokens.spacing['6']` |

Pill shape overrides any per-size radius with `tokens.shape.Pill` (999). Border widths come from `INPUT_BORDER_WIDTH`:

- Idle (medium attention): `tokens.borderWidth.hairline` (1px).
- Focus / Error: `tokens.spacing['0-5']` (matches web `--Spacing-0-5` = 2px at base).
- High attention idle: 0 (filled chrome).

---

## 5. Slots ↔ DOM

| Web | Native |
|-----|--------|
| `<span class={styles.start}>` | `<View style={[styles.slotStart, ICON_SLOT_BY_SIZE[size]]}>` wrapped in `<ComponentSlotIconContext.Provider value={{ color, sizePx }}>` |
| `<span class={styles.start2}>` | `<View style={styles.slotStart2}>` — accepts string/number (rendered as `<Text>` with body typography) or any ReactNode (icon path) |
| `<span class={styles.end2}>` | Symmetric to `start2` |
| `<span class={styles.end}>` | Symmetric to `start` |
| `<input>` / `Field.Control` | `<TextInput>` |

The container itself is a `<Pressable>` so taps on slot whitespace forward focus to the inner `TextInput` (RN doesn't bubble label-click → focus by default). When the control is disabled/readonly the Pressable becomes inert.

---

## 6. Surface context — what changes inside `<Surface mode="bold">`

Web emits a layered cascade inside `[data-surface]`:

1. Border stroke flips from `--Neutral-Stroke-Medium` to `--_inp-default-medium-stroke` (the active role's stroke).
2. `.control` text colour overrides to `--Text-High` (pure on-surface white/black) so the value never gets pre-composited with primary tint.
3. Slot colours override to `--Neutral-High` so icons stay consistent with the label text.
4. `.attentionHigh` fills with `--_inp-subtle` (which itself remaps per surface).

Native achieves the same outcome because **every paint value reads from `useSurfaceTokens(role)`** — the same hook the surface engine uses to compute the `[data-surface]` overrides. The result is identical without any per-surface JS branches.

---

## 7. Known gaps + future work

| Gap | Why | Workaround |
|-----|-----|------------|
| `ref` exposure | Native iteration scoped to public render contract first; adding `forwardRef<TextInput>` is additive. | Wrap in a parent ref + `Pressable.onPress` to drive focus from outside. |
| `labelAssociation='field'` (Base UI `Field.Root`) | No RN equivalent of Base UI form primitives today. | Use `aria-describedby` to point at the `<InputDynamicText>` or `<InputFeedback>` `id` instead. |
| Web `--Input-*` brand override CSS variables | Brand-level component recipes for native land via `useComponentRecipe('input')` — not yet wired. | Consume `<OneUINativeThemeProvider>` and use `useSurfaceTokens` directly. |
| `SemanticIconName` string slots | Native has no semantic icon catalogue yet (gap shared with `InputFeedback`, `Avatar`). | Pass a `ReactNode` (`<Icon icon={JdsHeart} />`) — the slot context publishes the resolved colour + size. |
| `decoration` ornament SVG (per-input edge fill) | Brand decorations on Input not in Figma; reserved for parity with Button if added later. | — |
| RN-only `autoComplete` enum | RN's `autoComplete` enum diverges from the web token list; passthrough is `string` for now. | Consult RN docs (`https://reactnative.dev/docs/textinput#autocomplete`) for the supported set on each platform. |

---

## 8. Showcase parity

The native showcase (`Input.showcase.native.tsx`) exports the following sections — peer of `Input.stories.tsx` + `Input.showcase.tsx`:

| Section | Web counterpart | Notes |
|---------|----------------|-------|
| `InputDefault` | `Default` story | Single uncontrolled input, size M. |
| `InputWithLabel` | `WithLabelAndDescription` story | Label + description + email type. |
| `InputSizes` | `InputFieldSizes` | All three sizes (S / M / L) with a `<HeartIcon />` start slot. |
| `InputAttentionLevels` | `InputFieldAttentions` | medium + high across sizes. |
| `InputAppearances` | `InputFieldAppearances` | All 8 non-auto roles. |
| `InputShapes` | `InputFieldShapes` | Default + Pill. |
| `InputStates` | `InputFieldStates` | Idle / Filled / Disabled / Read-only / Error / With description. |
| `InputDisabled` | (collapsed into web `InputFieldStates`) | Emphasised standalone disabled story. |
| `InputWithSlots` | `InputFieldWithSlots` | 4-slot combinations. |
| `InputControlled` | (none — Storybook controls cover this) | Round-trips `value` through `onChange`. |
| `InputSurfaceContext` | `InputFieldSurfaceContext` | Wraps Inputs in `<Surface mode>` × 5 (default / minimal / subtle / moderate / bold). |
| `InputSearch` | `InputFieldSearch` | Leading SearchIcon + trailing CloseIcon, pill shape, including `attention='high'` row. |

The web `InputFieldSlotsComposition`, `InputFieldFullComposition`, `InputFeedbackShowcase`, `InputDynamicTextShowcase` stories belong to the wider InputField family — those land in their own components (`InputFeedback` and `InputDynamicText` are already shipped on native).

---

## 9. Accessibility checklist

| Behaviour | Web | Native |
|----------|-----|--------|
| Visible label associated with the control | `<label htmlFor>` / Base UI `Field.Label` | `<Text>` row + `accessibilityLabel` on the `<TextInput>` (RN convention) |
| Hidden input (decorative) | `aria-hidden` + `display: none` | `aria-hidden` → `accessibilityElementsHidden: true` + `importantForAccessibility: 'no-hide-descendants'` |
| Invalid state announced | `aria-invalid` + visible feedback | `aria-invalid` passthrough + `errorHighlight` paint + paired `<InputFeedback variant="negative">` |
| Disabled + read-only | `disabled` / `readonly` attrs | `accessibilityState.disabled` for both (RN has no read-only role) |
| Hint copy | `aria-describedby` → `<p id>` | `accessibilityHint` + `aria-describedby` passthrough |
| Required field | `required` attr + visible asterisk | `required` prop (forwarded to a11y; pair with `labelSuffixInside="*"`) |

---

## 10. Related guides

- [`button-web-native-parity.md`](./button-web-native-parity.md) — token cascade reference for the `.appearance*` / `surfaces.*` paint mapping.
- [`inputfeedback-web-native-parity.md`](./inputfeedback-web-native-parity.md) — paired feedback row under an Input.
- [`inputdynamictext-web-native-parity.md`](./inputdynamictext-web-native-parity.md) — paired helper row under an Input.
- [`docs/surface-context-awareness.md`](../surface-context-awareness.md) — why `useSurfaceTokens` is the right peer for `[data-surface]` overrides.
- [`docs/native-component-build-playbook.md`](../native-component-build-playbook.md) — overall workflow this component follows.
