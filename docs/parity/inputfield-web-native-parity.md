# InputField: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

Top-level text-field aggregator: label / description header, the bordered **Input** shell (4-slot), an optional **InputFeedback** row, and an optional **InputDynamicText** row. Mirrors Figma `.DNA/InputField` (node 4298:6330) — vertical stack with gap `Spacing-1-5`.

**Sources**

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/InputField/InputField.tsx` | `packages/ui-native/src/components/InputField/InputField.native.tsx` |
| Static styles | `packages/ui/src/components/InputField/InputField.module.css` | `packages/ui-native/src/components/InputField/InputField.styles.native.ts` |
| Props / state | `packages/ui/src/components/InputField/InputField.shared.ts` (`InputFieldProps`) | `packages/ui-native/src/components/InputField/interface.ts` (native-owned, **no** `@oneui/ui` import) |
| Stories | `packages/ui/src/components/InputField/InputField.stories.tsx` (+ shared `Input.showcase.tsx`) | `packages/ui-native/src/components/InputField/InputField.showcase.native.tsx` |
| Layers cross-check | (no Layers `jdsinputfield-4/generated/interface.ts`; only `logic.tsx` exists on V4) | `layers-web/libs/react-native/.../jdsinputfield/generated/interface.ts` |

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|-------|
| **Public API surface** | **Aligned** | `label`, `description`, `labelSlot`, `infoIcon`, `infoIconSlot`, `infoIconAriaLabel`, `required`, `invalid`, `error`, `feedback`, `dynamicText`, `helperButton`, `dynamicTextSlot`, plus the full `Input` prop pipe (`size`, `appearance`, `shape`, `attention`, `start*`/`end*`, `value`/`defaultValue`/`onChange`, `disabled`, `readOnly`, `type`, `maxLength`, focus/blur handlers). |
| **Variant enum (`appearance`)** | **Aligned (narrower than `ComponentAppearance`)** | Both: `auto \| primary \| secondary \| neutral \| sparkle \| positive \| negative \| warning \| informative`. No `brand-bg` (web `Input.shared.ts` documents this gap; native mirrors it). |
| **Size enum** | **Aligned** | Web: `8 \| 10 \| 12 \| 's' \| 'm' \| 'l' \| 'small' \| 'medium' \| 'large'`. Native: same union (forwarded straight to `<Input>`). |
| **Attention enum** | **Aligned** | `medium` (outlined) ↔ `high` (filled). Delegated to the bordered `<Input>` paint. |
| **Shape enum** | **Aligned** | `default` (per-size `Shape-2` / `Shape-3`) ↔ `pill` (`Shape-Pill`). |
| **Default appearance** | **Aligned** | `'auto'`/unset → `'secondary'` (matches `useInputState`). |
| **Label header** | **Aligned** | Vertical stack: label row (label + asterisk + info icon) + description, gap `Spacing-0-5`. Native renders the row inside InputField itself rather than delegating to `<Input label>`, so `labelSuffixInside` / `labelTrailing` plumbing is centralised. |
| **Required asterisk** | **Aligned** | Web injects `<span aria-hidden>*</span>` inside `<label>`. Native renders a sibling `<Text accessible={false}>` painted from `Negative.content.tintedA11y`. |
| **Info icon (`infoIcon` + `infoIconAriaLabel`)** | **Aligned (no tooltip on native today)** | Web renders `<Tooltip>` + `<IconButton icon="info" appearance="neutral" attention="low" condensed>`. Native renders the same `IconButton` (inline `InfoGlyph` SVG, mirroring `InputFeedback` default icons), but the tooltip is not yet implemented — `infoTooltipContent` is ignored. Override via `infoIconSlot` for richer behaviour. |
| **`labelSlot`** | **Aligned** | When set, replaces all string-driven label markup. Native still wraps in the `.labelArea` `<View>` so the surrounding gap geometry matches web. |
| **`invalid` / `error`** | **Aligned** | Both flip the bordered shell to negative-bold chrome and render a default `InputFeedback` `variant="negative"` row when `error` is non-empty. `aria-invalid` is treated as an alias for `invalid` (`useInputFieldState`). |
| **`feedback` slot** | **Aligned** | Caller-supplied `<InputFeedback>` element wins over the `error` string shorthand. |
| **Dynamic text row (`dynamicText` / `helperButton` / `dynamicTextSlot`)** | **Aligned** | Native composes `<InputDynamicText>` from the string shorthand pair, sized via `inputSizeToLabelSize(size)` (same rule as web). `dynamicTextSlot` wins outright. |
| **4-slot system** | **Aligned (ReactNode-only on native)** | Forwarded verbatim to the underlying `<Input>` (`start` / `start2` / `end` / `end2`). |
| **Value handling** | **Aligned** | Both expose controlled `value` + uncontrolled `defaultValue`. `onChange(value: string)` is identical. |
| **Disabled / readOnly** | **Aligned** | Delegated to `<Input>`. Native dynamic-text Button receives `disabled` from the field. |
| **Surface context** | **Aligned** | Native `<InputField>` is a plain `<View>` — when wrapped in `<Surface mode="bold">`, every paint (label colour from `neutral.content.high`, asterisk from `negative.content.tintedA11y`, Input border/fill, feedback, dynamic row) resolves through the surface cascade automatically. No per-surface branches required. |
| **Typography** | **Aligned** | Label: `useTypographyTokens('label', 'S\|M\|L', { emphasis: 'medium' })` (web `--Label-S\|M\|L-FontSize/LineHeight`, `--Label-FontWeight-Medium`). Description: `useTypographyTokens('body', 'XS', { emphasis: 'low' })` (web `--Body-XS-*`). |
| **`fullWidth`** | **API-preserved** | Web emits `width: 100%` via `.fullWidth`. Native field already fills `width: '100%'`, so the flag is a no-op cosmetic — kept for prop parity. |
| **`labelAssociation`** | **Web only** | Web defaults to `'field'` (uses Base UI `Field.Root` + `Field.Label`). RN has no `Field.Root` equivalent. Native renders the label as a sibling `<Text>` and forwards a resolved `accessibilityLabel` to the inner `<TextInput>` (visible `label` → screen-reader name by default). |
| **Base UI `Field.Root` / `validate` / `validationMode`** | **Web only** | Form validation is web-only today. Wire `error` / `invalid` from your own validator. |
| **`infoTooltipContent`** | **Web only (today)** | No `<Tooltip>` primitive yet on native. Use `infoIconSlot` to inject a custom popover. |
| **`forwardRef`** | **Web only today** | Web `forwardRef<HTMLInputElement>`. Native exposes no ref API; wrap the bordered `<Input>` in a parent ref + `Pressable.onPress` if you need to drive focus from outside. |
| **`leftAddon` / `rightAddon`** | **Web only (deprecated)** | Native skipped — pass `start` / `end`. |
| **CSS variable overrides (`--InputField-gap` etc.)** | **Web only** | Native consumers customise via `<OneUINativeThemeProvider>` + future `useComponentRecipe('inputField')`. |

---

## 2. Shared contract (manually mirrored)

`interface.ts` is hand-copied from `InputField.shared.ts`:

- Re-exports `InputAppearance` / `InputAttention` / `InputShape` / `InputSize` / `InputLabelSize` / `InputNumericSize` from the native `Input/interface.ts` so consumers can `import type { InputAppearance } from '@oneui/ui-native'`.
- `InputFieldProps` covers every prop in web `InputFieldProps` minus the web-only delegation (`name`-driven form wiring is preserved as an API-parity passthrough, but `validate` / `validationMode` / `onKeyDown` / `data-testid` are dropped).
- `useInputFieldState(props)` — pure resolver:
  - `'auto'` (or unset) appearance → `'secondary'` (web `useInputState` default).
  - Invalid = `invalid || aria-invalid || (error.trim() !== '')`.
  - Info trigger renders only when `infoIcon` is truthy **and** a string `label` is present **and** `labelSlot` is unset (web parity).
  - `feedbackSize` derived from `inputSizeToLabelSize(size)` — same rule as web (S/M/L tier follows the input height).
  - `infoIconAriaLabel` defaults to `'More information'` (web parity copy from `InputField.tsx`).
- `getInputFieldAccessibilityProps(props)` — root-level a11y mapper. The root field is decorative (`accessible: false`); the inner `<Input>` owns its own label / state. `aria-hidden` collapses the entire stack to a hidden subtree.

The state resolver name follows the playbook (`use*State` is a pure function, not a React hook).

---

## 3. Render pipeline ↔ web

| Web stack | Native equivalent |
|-----------|-------------------|
| `<Field.Root>` (Base UI) | `<View style={styles.field}>` — vertical stack, gap `Spacing-1-5`. |
| `labelSlot ?? <Input label … />` | `labelSlot` rendered inside `styles.labelArea`; otherwise the label row + description column are rendered by `InputField` itself. |
| Required asterisk `<span aria-hidden>*</span>` | Inline `<Text style={asteriskStyle} accessible={false}>` — colour from `negative.content.tintedA11y`. |
| Info trigger `<Tooltip><IconButton icon="info" />` | `<IconButton icon={InfoGlyph} appearance="neutral" attention="low" condensed size={…} aria-label={infoIconAriaLabel} />`. Tooltip omitted (RN gap). |
| `<Input ... errorHighlight={invalid} labelAssociation="field" />` | `<Input ... errorHighlight={isInvalid} aria-invalid={isInvalid} />` — label header lives in InputField, so `<Input>` receives no `label` / `description` strings. |
| `feedback ?? <InputFeedback variant="negative" ... feedback_message={error} />` | Same — `feedback` slot wins, otherwise compose from the `error` string. |
| `dynamicTextSlot ?? <InputDynamicText content={dynamicText} end={helperButton} size={labelTier} disabled={disabled} />` | Same composition. |

The native field does **not** pass `label` / `description` strings down to `<Input>` — instead, the bordered shell is consumed in its label-less mode and the field handles the header itself. This is intentional: it keeps the asterisk + info-icon styling under one component and avoids `Input.native.tsx` needing to know about the `required` / `infoIcon` plumbing.

---

## 4. Token cascade ↔ web intermediate variables

Web's `InputField.module.css` is mostly layout. The interesting cascade is the **Input** itself plus the label-stack typography in `FieldLabelStack.module.css`:

| Web token | Native equivalent |
|-----------|-------------------|
| `var(--Label-S/M/L-FontSize)` / `LineHeight` / `--Label-FontWeight-Medium` | `useTypographyTokens('label', 'S/M/L', { emphasis: 'medium' })` |
| `var(--Body-XS-FontSize)` / `LineHeight` / `--Body-FontWeight-Low` | `useTypographyTokens('body', 'XS', { emphasis: 'low' })` |
| `var(--Text-High)` (label) | `useSurfaceTokens('neutral').content.high` |
| `var(--Text-Low)` (description) | `useSurfaceTokens('neutral').content.low` |
| `var(--Negative-TintedA11y)` (asterisk) | `useSurfaceTokens('negative').content.tintedA11y` |
| `var(--Spacing-1-5)` (root gap) | `tokens.spacing['1-5']` |
| `var(--Spacing-0-5)` (label area / row gap) | `tokens.spacing['0-5']` |

Every paint reads from `useSurfaceTokens(role)`. When the field is wrapped in `<Surface mode="bold">`, those tokens automatically resolve against the surrounding surface — same model as Button / Input / InputFeedback.

---

## 5. State machine

| Input | `useInputFieldState` output | Effect |
|-------|----------------------------|--------|
| `appearance="auto"` / unset | `resolvedAppearance: 'secondary'` | `<Input appearance="secondary">` |
| `invalid: true` | `isInvalid: true` | `<Input errorHighlight aria-invalid>` |
| `error: "Bad input"` | `isInvalid: true`, `hasFeedback: true` | `<InputFeedback variant="negative" attention="low" feedback_message="Bad input">` |
| `feedback={<InputFeedback variant="warning" />}` | `hasFeedback: true` | Caller node wins; the `error` shorthand is ignored. |
| `dynamicText="0 / 240"`, `helperButton="Clear"` | `hasDynamicRow: true` | `<InputDynamicText content="0 / 240" end="Clear" size={labelTier} disabled={…} />` |
| `infoIcon: true` + `label: "Email"` | `hasInfoIcon: true` | Renders `IconButton` info trigger; `infoIconSlot` short-circuits with caller content. |
| `labelSlot={<MyLabel/>}` | `hasInfoIcon: false` | Custom label replaces the entire header — info trigger is suppressed (web parity). |

---

## 6. Accessibility

| Behaviour | Web | Native |
|----------|-----|--------|
| Visible label associated with the control | `<Field.Label htmlFor>` / Base UI `Field.Root` | `<Text>` row + auto-resolved `accessibilityLabel` on the inner `<TextInput>` (resolution order: `accessibilityLabel` → `aria-label` → trimmed `label`) |
| Hidden field (decorative) | `aria-hidden` on the root | `aria-hidden` → `accessible: false` + `accessibilityElementsHidden: true` + `importantForAccessibility: 'no-hide-descendants'` |
| Required indicator | `aria-hidden` asterisk + native `required` | `accessible={false}` asterisk + `required` forwarded to the inner `<Input>` |
| Invalid state announced | `aria-invalid` on `<input>` + visible `InputFeedback` | `aria-invalid` passthrough on the inner `<TextInput>` + `errorHighlight` paint + paired `<InputFeedback variant="negative">` |
| Disabled + read-only | `disabled` / `readonly` attrs | `accessibilityState.disabled` for both (RN has no read-only role) |
| Info trigger label | `aria-label="More information"` on `<IconButton>` | Same; resolved from `infoIconAriaLabel` (default `'More information'`) |
| Hint copy | `aria-describedby` → `<InputFeedback id>` | `accessibilityHint` + `aria-describedby` passthrough on the inner `<TextInput>` |

The root `<View>` is intentionally **not** accessible — only the inner `<TextInput>`, label `<Text>`, feedback row, and dynamic-text row carry roles. This matches Input's own pattern (`Pressable accessible={false}` for the bordered wrapper).

---

## 7. Known gaps + future work

| Gap | Why | Workaround |
|-----|-----|------------|
| `<Tooltip>` on the info trigger | No native `Tooltip` primitive in `@oneui/ui-native` today. | Override via `infoIconSlot`; or surface tooltip content as a `description`. |
| `validate` / `validationMode` | Base UI `Field.Root` validation is web-only. | Run validation in your form library and toggle `invalid` / `error` from the result. |
| `ref` / `forwardRef` | Iteration scoped to public render contract first. | Add a parent ref + drive focus via the inner `<Input>` (already a `Pressable`). |
| `--InputField-*` brand override CSS vars | Brand-level component recipes for native land via `useComponentRecipe('inputField')` — not yet wired. | Consume `<OneUINativeThemeProvider>` + `useSurfaceTokens` directly. |
| `leftAddon` / `rightAddon` (deprecated on web) | Not part of the native API. | Pass `start` / `end`. |
| Web `name` form wiring | RN ignores HTML `name` and form-level submission. | Preserved as a passthrough; collect submission via `onChange` / `onSubmit`. |

---

## 8. Showcase parity

The native showcase (`InputField.showcase.native.tsx`) exports the following sections — peer of `InputField.stories.tsx` plus its shared `Input.showcase.tsx` aggregates:

| Section | Web counterpart | Notes |
|---------|----------------|-------|
| `InputFieldDefault` | `Default` story | Single field with label + placeholder. |
| `InputFieldSizes` | `Sizes` / `InputFieldSizes` | S / M / L with leading icon. |
| `InputFieldAttentions` | `Attentions` / `InputFieldAttentions` | medium + high across sizes. |
| `InputFieldAppearances` | `Appearances` / `InputFieldAppearances` | All 8 non-auto roles. |
| `InputFieldShapes` | `Shapes` / `InputFieldShapes` | Default + Pill. |
| `InputFieldStates` | `States` / `InputFieldStates` | Idle / Filled / Disabled / Read-only / Error string / Description / Required. |
| `InputFieldWithSlots` | `WithSlots` / `InputFieldWithSlots` | 4-slot combinations. |
| `InputFieldFullComposition` | `FullComposition` / `InputFieldFullComposition` | Label + description + info icon + required + error + dynamic row. |
| `InputFieldControlled` | (Storybook controls cover this on web) | Round-trips `value` through `onChange`. |
| `InputFieldSurfaceContext` | `SurfaceContext` / `InputFieldSurfaceContext` | Field on `default` / `minimal` / `subtle` / `moderate` / `bold` surfaces. |
| `InputFieldSearch` | `Search` / `InputFieldSearch` | Leading SearchIcon + trailing CloseIcon, pill shape, `attention='high'` row. |

The web `FigmaSlots` story (slot-driven label / feedback / dynamic) is covered implicitly by passing `labelSlot` / `feedback` / `dynamicTextSlot` to `InputField` in any of the above sections; consumers can compose those in app code.

---

## 9. Related guides

- [`input-web-native-parity.md`](./input-web-native-parity.md) — the bordered shell InputField wraps.
- [`inputfeedback-web-native-parity.md`](./inputfeedback-web-native-parity.md) — feedback row.
- [`inputdynamictext-web-native-parity.md`](./inputdynamictext-web-native-parity.md) — dynamic text row.
- [`iconbutton-web-native-parity.md`](./iconbutton-web-native-parity.md) — info trigger primitive.
- [`docs/surface-context-awareness.md`](../surface-context-awareness.md) — why `useSurfaceTokens` is the right peer for `[data-surface]` overrides.
- [`docs/native-component-build-playbook.md`](../native-component-build-playbook.md) — overall workflow this component follows.
