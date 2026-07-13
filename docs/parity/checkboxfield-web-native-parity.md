# CheckboxField — Web ↔ Native parity

## Overview

`CheckboxField` is the **field shell** that pairs the `Checkbox` control with the rest of an InputField composition (label, description, helper / dynamic text, feedback / error, optional info icon trigger). It is **not** a different control — it is the same `Checkbox` rendered inside a layout that mirrors the Figma `.DNA/InputField` stack.

| Concern | Web (`packages/ui/src/components/CheckboxField`) | Native (`packages/ui-native/src/components/CheckboxField`) |
|---|---|---|
| Composition contract | `Field.Root` (BaseUI) + `Checkbox` + optional `InputFeedback` + optional `InputDynamicText` | `<View>` + `Checkbox` + inline feedback `<Text>` + inline dynamic `<View>` row |
| Multi-option mode | `<fieldset>` + `<legend>` + `CheckboxGroup` | `<View>` + custom legend row + own group state (no `CheckboxGroup` peer yet) |
| Field validation | `Field.Root` (`validate`, `validationMode`, `Field.Error`) | Host form drives `error` / `invalid` from outside; no `Field.Root` peer on RN |
| Required asterisk | `labelSuffixInside` injected as a styled `<span>*</span>` | Same — injected into `Checkbox.labelSuffixInside` (or the legend in multi mode) |
| Info icon slot | `infoIconSlot` forwarded to `Checkbox.labelTrailing` | Same — forwarded to `Checkbox.labelTrailing` (single mode) or rendered in legend (multi mode) |

## Checkbox vs CheckboxField

| | `Checkbox` | `CheckboxField` |
|---|---|---|
| **What it is** | Atomic interactive control (the box + optional inline label / description). | Composition shell — wraps `Checkbox` (or a stack of them) with field chrome. |
| **API surface** | `checked`, `indeterminate`, `appearance`, `size`, `disabled`, `readOnly`, `label`, `description`. | Adds `error`, `feedback`, `dynamicText`, `helperButton`, `dynamicTextSlot`, `infoIconSlot`, `required`, `invalid`, `fullWidth`, `groupValue` / `groupDefaultValue` / `onGroupValueChange`, `children`. |
| **When to use** | Single boolean toggle inside a row, list, table cell, or toolbar. No formal field framing. | Inside forms / settings panels — when you need a field header, validation feedback, or grouped multi-option selection. |
| **Children** | None. | Optional. When set, the field switches to **multi-option mode** and treats children as `<Checkbox value="…">` items. |

## Layers cross-check (`jdscheckbox-4` / `jdscheckboxfield-4`)

| Layers prop | OneUI native equivalent |
|---|---|
| `size: 'M' | 'S' | 'L'` | `size: 's' | 'm' | 'l'` (case canonicalised by `Checkbox.resolveSize`) |
| `active: 'checked' | 'unchecked' | 'indeterminate'` | `checked: boolean` + `indeterminate: boolean` (3-state booleans) |
| `state: 'idle' | 'readOnly' | 'positive' | 'negative'` | `readOnly: boolean` + `invalid: boolean` (or `error: string`) — positive emphasis is folded into `appearance="positive"` instead of a separate state |
| `helperText: string` | Folded into `error` (negative shorthand), `feedback?: ReactNode`, or `dynamicText` / `helperButton` — aligned with the InputField composition contract on web |
| `appearance` | Same union (no `brand-bg` / `informative` for the box itself; the field accepts the full `ComponentAppearance`) |
| `label` (typed JSX slot) / `feedback` (typed JSX slot) | `label: string` + `description: string` + `feedback?: ReactNode` slot |
| `onClick` | `onCheckedChange(next)` (single mode) / `onGroupValueChange(values)` (multi mode) — RN-canonical handlers |

## API map

```text
                         CheckboxField (native)
                         ────────────────────────
single mode (no children)
    ├── Checkbox  (label, description, suffix=asterisk, trailing=infoIconSlot)
    ├── feedback  (auto from `error` or custom node)
    └── dynamic   (auto from `dynamicText` / `helperButton` or `dynamicTextSlot`)

multi mode  (children = <Checkbox value="…">)
    ├── legend
    │     ├── label + asterisk
    │     └── infoIconSlot
    ├── description
    ├── multi-options (cloned children with size / appearance / disabled / readOnly forwarded)
    ├── feedback
    └── dynamic
```

## Visual model

| Slot | Token (single mode) | Token (multi mode) |
|---|---|---|
| Label text | `--Body-{S/M/L}-FontSize` + `--Body-FontWeight-Medium`, colour `--{Role}-High` | Same, rendered as the legend |
| Description | `--Body-S-FontSize` + `--Body-FontWeight-Low`, colour `--{Role}-Medium-Text` | Same, rendered below legend |
| Required asterisk | Inline `<Text>` with colour `--Negative-High` | Same — emitted as `Checkbox.labelSuffixInside` |
| Error message | `--Negative-High`, body size mapped from field size | Same |
| Helper / dynamic copy | `--Text-Low`, body size mapped from field size | Same |
| Helper button | `--{Role}-TintedA11y` (links into the field's appearance role) | Same |

Native simplification: we render the feedback / dynamic rows inline because the `InputFeedback` and `InputDynamicText` native peers are not yet shipped. When those land, the CheckboxField slots accept them directly without a public-API change (the slots are `ReactNode`). The native layout already mirrors the web order: **control → feedback → dynamic**.

## Sizing

| Field size | Body label | Description | Feedback / dynamic body | Inner Checkbox box |
|---|---|---|---|---|
| `s` | `--Body-S-FontSize` | `--Body-S-FontSize` | `--Body-XS-FontSize` | `Spacing-4` |
| `m` | `--Body-M-FontSize` | `--Body-S-FontSize` | `--Body-S-FontSize` | `Spacing-5` |
| `l` | `--Body-L-FontSize` | `--Body-S-FontSize` | `--Body-M-FontSize` | `Spacing-6` |

`checkboxFieldSizeToInputNumeric(size)` returns `8 / 10 / 12` for `s / m / l` — matches web. Keeps the helper available so the upcoming InputFeedback native peer can size itself the same way without re-implementing the mapping.

## Accessibility

| Concern | Web | Native |
|---|---|---|
| Outer wrapper role | `Field.Root` (no implicit role) | `accessible` + `accessibilityLabel` (RN's `accessibilityRole` enum does not include `'group'`; the inner Checkbox children still announce as `role=checkbox`) |
| Field label | `Field.Label` (linked to control via `for`) | `accessibilityLabel = aria-label ?? label` on the wrapper |
| Description | `Field.Description` (linked via `aria-describedby`) | Forwarded as `accessibilityLabelledBy` when `aria-describedby` is supplied |
| Error message | `Field.Error` + live region | Inline `<Text>` with `accessibilityLiveRegion="polite"` |
| Required | `aria-required` on the control | Forwarded to inner `Checkbox` via `required` (renders the asterisk) |
| Disabled | `Field.Root[data-disabled]` | `accessibilityState.disabled` + opacity dim |
| Helper button | Native `<button>` | `Pressable` with `accessibilityRole="button"` |

## Web-only props (intentionally not mirrored)

RN has no `Field.Root` counterpart, so the following props are **not** ported on native. Drive them from your form library (Formik / React Hook Form / etc.) and forward `error` / `invalid` / `disabled` / `required` to the native CheckboxField:

- `validate: (value: unknown) => string | string[] | null`
- `validationMode: 'onBlur' | 'onChange'`
- `name`, `value`, `id`, `className` — RN has no DOM form / class system
- `labelAssociation` / `labelWrapper` / `labelSuffixInside` (last two are **internal** to web; the asterisk + info-icon slots on native are wired through the same composition vocabulary, not exposed as overrides)

## Multi-option mode — group state

Multi-option mode tracks an array of selected `value`s. Each child `<Checkbox value="…">` is cloned with:

- `size`, `appearance`, `disabled`, `readOnly`, `errorHighlight` forwarded from the field unless the child overrides them.
- `checked` derived from `groupValue.includes(child.value)` unless the child explicitly overrides.
- `onCheckedChange` wrapped so toggling a child both calls the child's own handler (if any) and updates the field's group.

Controlled (`groupValue`) and uncontrolled (`groupDefaultValue`) modes mirror web semantics.

## Showcases

`packages/ui-native/src/components/CheckboxField/CheckboxField.showcase.native.tsx` exports the parity sections wired into the sample app:

- `CheckboxFieldDefault`
- `CheckboxFieldSizes`
- `CheckboxFieldStates`
- `CheckboxFieldRequiredAndError`
- `CheckboxFieldMultiOption`
- `CheckboxFieldWithDynamicText`
- `CheckboxFieldSurfaceContext`
- `CheckboxFieldFullWidth`

## Known gaps / follow-ups

- [ ] Once the native `InputFeedback` and `InputDynamicText` ports land, swap the inline feedback `<Text>` and dynamic row for those components — the slot contract is already `ReactNode`, so no public-API change is needed.
- [ ] Once `CheckboxGroup` ships natively, multi-option mode can delegate group state to it instead of managing the array internally.
- [ ] The `Pressable` on `helperButton` does not yet show a focus / pressed halo — consistent with the rest of the native field surfaces today.
