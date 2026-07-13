# RadioField Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: `Field.Root` + **RadioGroup** with optional `Field.Label` / `Field.Description`, `infoIconSlot`, `error` / `feedback`, and native `Field.Error` slot — same shell as **InputField** / **CheckboxField**. Integrated single mode has no `Radio` children; colour follows **`appearance`** on inner radios.
- **Task contexts**: radio, field, form, selection
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: children, feedback, infoIconSlot
- **Forbids**: 

## Variant Logic

- **default**: use when Default

## Relationships and Dependencies

- **Related**: 
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: 
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `appearance` | `RadioAppearance` | No | - | Multi-accent appearance role for all children. |
| `aria-describedby` | `string` | No | - | Optional description id(s) for the radiogroup (e.g. field description). |
| `aria-label` | `string` | No | - | When there is no string `label`, sets the radiogroup accessible name. |
| `checked` | `boolean` | No | - | Integrated single mode only — controlled on/off (`true` = selected `singleOptionValue`). Prefer `value` / `onValueChange` when you need the string value directly. |
| `children` | `ReactNode` | No | - | `Radio` options. Omit for integrated single-option field (label + implicit control). |
| `className` | `string` | No | - | className property |
| `defaultChecked` | `boolean` | No | - | Integrated single mode only — uncontrolled default on/off. When set, overrides `defaultValue` for the implicit lone option unless `value` is controlled. |
| `defaultValue` | `string` | No | - | Default selected value (uncontrolled) |
| `description` | `string` | No | - | description property |
| `disabled` | `boolean` | No | - | Whether the group is disabled |
| `error` | `string` | No | - | error property |
| `feedback` | `ReactNode` | No | - | feedback property |
| `fullWidth` | `boolean` | No | - | fullWidth property |
| `infoIconSlot` | `ReactNode` | No | - | Trailing control beside the label (custom info trigger or `InputFieldDefaultInfo`). |
| `invalid` | `boolean` | No | - | Mark the field invalid for `Field.Root`. |
| `label` | `string` | No | - | label property |
| `name` | `string` | No | - | Field name for form submission |
| `omitLayoutWrapper` | `boolean` | No | - | When true, the group root does not apply the default flex layout (use with `display: contents` class for grid embedding). |
| `onCheckedChange` | `(checked: boolean) => void` | No | - | Integrated single mode — fired when the lone option toggles (in addition to `onValueChange`). |
| `onValueChange` | `(value: string) => void` | No | - | Called when value changes |
| `orientation` | `'vertical' | 'horizontal'` | No | - | Layout orientation. Default: 'vertical' |
| `readOnly` | `boolean` | No | - | Whether the group is read-only (focusable but value cannot change) |
| `required` | `boolean` | No | - | When true with a string `label`, shows the required asterisk in the label row. |
| `singleOptionValue` | `string` | No | - | Form value for the implicit lone **Radio** when `children` is omitted (default `'on'`). Group is “on” when `value === singleOptionValue`, “off” when `value === ''`. |
| `size` | `RadioSize` | No | - | Size preset for all children. Default: 'm' |
| `style` | `CSSProperties` | No | - | style property |
| `validate` | `(value: unknown) => string | string[] | null` | No | - | validate property |
| `validationMode` | `'onBlur' | 'onChange'` | No | - | validationMode property |
| `value` | `string` | No | - | Selected value (controlled) |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `children` | Radio |  |
| `feedback` | InputFeedback |  |
| `infoIconSlot` | IconButton |  |

## Code Snippets

### Basic Usage

```tsx
import { RadioField } from '@oneui/ui';

<RadioField />
```

### Recipe Decisions

```json
{
  "component": "RadioField",
  "decisions": []
}
```
