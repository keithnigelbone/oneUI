# RadioField — Web ↔ Native parity

## Overview

`RadioField` is the **field shell** that pairs `Radio` / `RadioGroup` with the rest of an InputField composition (label, description, helper / dynamic text, feedback / error, optional info icon trigger). Same spirit as `CheckboxField` — same composition contract, different control DNA.

| Concern | Web (`packages/ui/src/components/RadioField`) | Native (`packages/ui-native/src/components/RadioField`) |
|---|---|---|
| Composition contract | `Field.Root` (BaseUI) + `Radio` / `RadioGroup` + optional `InputFeedback` + optional `InputDynamicText` | `<View>` + `Radio` / `RadioGroup` + inline feedback `<Text>` + inline dynamic `<View>` row |
| Multi-option mode | `<fieldset>` + `<legend>` + `RadioGroup` | `<View>` + custom legend row + `RadioGroup` |
| Plain (1 option) | header without legend + `RadioGroup` | Same — header without legend + `RadioGroup` |
| Integrated single | implicit `<Radio>` + `aria-labelledby` to field heading + on/off semantics | Same — implicit `<Radio>` rendered next to the field label, on/off semantics |
| Field validation | `Field.Root` (`validate`, `validationMode`, `Field.Error`) | Host form drives `error` / `invalid` from outside |
| Required asterisk | `labelSuffixInside` injected as a styled `<span>*</span>` | Same — emitted next to the field label/legend |
| Info icon slot | `infoIconSlot` rendered next to the legend | Same |

## Radio vs RadioField

| | `Radio` (+ `RadioGroup`) | `RadioField` |
|---|---|---|
| **What it is** | Atomic option control + the group that owns the selected value. | Composition shell — wraps `Radio` / `RadioGroup` with field chrome (header, helper text, feedback / error, info icon, integrated-single semantics). |
| **API surface** | `value` (required), `appearance`, `size`, `disabled`, `readOnly`, `label`, `description`, `errorHighlight`, `labelSuffixInside`, `labelTrailing`. | Adds `error`, `feedback`, `dynamicText` / `helperButton`, `dynamicTextSlot`, `infoIconSlot`, `required`, `invalid`, `fullWidth`, `value` / `defaultValue` / `onValueChange`, `checked` / `defaultChecked` / `onCheckedChange` (integrated single), `singleOptionValue`, `children`. |
| **Modes** | One: a group + its options. | Three: integrated single, plain (1 option), multi-option (>=2 options). |

## Layers cross-check (`jdsradio-4` / `jdsradiofield-4`)

| Layers prop | OneUI native equivalent |
|---|---|
| `size: 'M' | 'S' | 'L'` | `size: 's' | 'm' | 'l'` |
| `active: boolean` | `checked: boolean` (integrated single) **or** `value: string` (multi mode) |
| `state: 'idle' | 'readOnly' | 'positive' | 'negative'` | `readOnly: boolean` + `invalid: boolean` (or `error: string`) — positive emphasis is folded into `appearance="positive"` |
| `helperText: string` | Folded into `error` (negative shorthand), `feedback?: ReactNode`, or `dynamicText` / `helperButton` |
| `appearance` | Same union (no `brand-bg` on the inner Radio) |
| `label` (typed JSX slot) / `feedback` (typed JSX slot) | `label: string` + `description: string` + `feedback?: ReactNode` slot |
| `onClick` | `onCheckedChange(next)` (integrated) / `onValueChange(value)` (multi/plain) |

## Mode decision

```text
                        RadioField (native)
                        ───────────────────
optionCount === 0 + label string  → integrated single mode
optionCount === 1                 → plain mode (no fieldset)
optionCount >= 2                  → multi-option mode (fieldset + legend)
```

## API map

```text
Integrated single (no children, label set)
    ├── Radio (lone, value === singleOptionValue)
    ├── label / description / asterisk / infoIconSlot   (beside the radio)
    ├── feedback (auto from `error` or custom node)
    └── dynamic  (auto from dynamicText / helperButton or dynamicTextSlot)

Plain (1 child Radio)
    ├── (description + infoIconSlot row)?
    ├── RadioGroup → cloned Radio child
    ├── feedback
    └── dynamic

Multi-option (>=2 child Radios)
    ├── legend
    │     ├── label + asterisk
    │     └── infoIconSlot
    ├── description
    ├── RadioGroup → cloned Radio children (size/appearance/disabled/readOnly forwarded)
    ├── feedback
    └── dynamic
```

## Visual model

| Slot | Token (header / legend) |
|---|---|
| Label text | `--Body-{S/M/L}-FontSize` + `--Body-FontWeight-Medium`, colour `--{Role}-High` |
| Description | `--Body-S-FontSize` + `--Body-FontWeight-Low`, colour `--{Role}-Medium-Text` |
| Required asterisk | Inline `<Text>` with colour `--Negative-High` |
| Error message | `--Negative-High`, body size mapped from field size |
| Helper / dynamic copy | `--{Role}-Medium-Text`, body size mapped from field size |
| Helper button | `--{Role}-TintedA11y` (links into the field's appearance role) |

Native simplification: feedback / dynamic rows render as inline `<Text>` because the `InputFeedback` / `InputDynamicText` native peers are not yet shipped. Slots accept `ReactNode`, so when the native peers land they drop in without any public-API change.

## Sizing

| Field size | Body label | Description | Feedback / dynamic body | Inner Radio box / dot |
|---|---|---|---|---|
| `s` | `--Body-S-FontSize` | `--Body-S-FontSize` | `--Body-XS-FontSize` | `Spacing-4` / `Spacing-2` |
| `m` | `--Body-M-FontSize` | `--Body-S-FontSize` | `--Body-S-FontSize` | `Spacing-5` / `Spacing-2-5` |
| `l` | `--Body-L-FontSize` | `--Body-S-FontSize` | `--Body-M-FontSize` | `Spacing-6` / `Spacing-3` |

`radioFieldSizeToInputNumeric(size)` returns `8 / 10 / 12` for `s / m / l` — matches web. Kept available so the upcoming native InputFeedback peer can size itself the same way.

## Accessibility

| Concern | Web | Native |
|---|---|---|
| Outer wrapper role | `Field.Root` (no implicit role) | `accessible` + `accessibilityLabel` (RN's `accessibilityRole` enum has no `'group'` analogue; the inner Radios still announce as `role=radio`) |
| Field label | `Field.Label` | `accessibilityLabel = aria-label ?? label` on the wrapper |
| Description | `Field.Description` | Forwarded as `accessibilityLabelledBy` when `aria-describedby` is supplied |
| Error message | `Field.Error` + live region | Inline `<Text>` with `accessibilityLiveRegion="polite"` |
| Required | `aria-required` | Renders the asterisk via `labelSuffixInside`; outer `aria-required` not surfaced (no native `<input>`) |
| Disabled | `Field.Root[data-disabled]` | `accessibilityState.disabled` + opacity dim |
| Helper button | Native `<button>` | `Pressable` with `accessibilityRole="button"` |

## Web-only props (intentionally not mirrored)

RN has no `Field.Root` counterpart, so the following props are **not** ported on native. Drive validation from your form library (Formik / React Hook Form / etc.) and forward `error` / `invalid` / `disabled` / `required` to the native RadioField:

- `validate: (value: unknown) => string | string[] | null`
- `validationMode: 'onBlur' | 'onChange'`
- `name`, `id`, `className` — RN has no DOM form / class system

## Integrated single mode behaviour

| Trigger | Web | Native |
|---|---|---|
| Press unchecked → checked | `value` becomes `singleOptionValue` (default `'on'`) | Same — `effectiveValue` becomes `singleOptionValue`; `onCheckedChange(true)` fires |
| Press checked → checked again | `value` clears to `''` (web suppresses BaseUI's no-op event and dispatches a clear) | Same — handled by `handleIntegratedPress`; `onCheckedChange(false)` fires |
| Controlled `checked` | Sets `value = checked ? sv : ''` | Same |
| Controlled `value` | Wins over `checked` | Same |
| Uncontrolled `defaultChecked` | Folded into `defaultValue = defaultChecked ? sv : ''` | Same |

## Showcases

`packages/ui-native/src/components/RadioField/RadioField.showcase.native.tsx` exports the parity sections wired into the sample app:

- `RadioFieldDefault` (multi)
- `RadioFieldSizes`
- `RadioFieldStates`
- `RadioFieldRequiredAndError`
- `RadioFieldIntegratedSingle`
- `RadioFieldWithDynamicText`
- `RadioFieldSurfaceContext`
- `RadioFieldFullWidth`

## Known gaps / follow-ups

- [ ] Once the native `InputFeedback` and `InputDynamicText` peers land, swap the inline feedback `<Text>` and dynamic row for those typed slots (no public-API change).
- [ ] The web grid layout used by integrated single mode (label + description + feedback all collapsed into a single CSS grid) is rendered as a row + column on native — visually equivalent but uses flex instead of grid.
- [ ] The `Pressable` on `helperButton` does not yet show a focus / pressed halo — consistent with the rest of the native field surfaces today.
