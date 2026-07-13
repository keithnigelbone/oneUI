# CheckboxField Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: `Field.Root` + **Checkbox** with integrated `Field.Label` / `Field.Description`, optional `infoIconSlot`, `error` / `feedback`, and native `Field.Error` slot — same composition contract as **InputField** (Figma `.DNA/InputField` stack; control DNA from Checkbox). Colour follows `appearance` on the inner Checkbox.
- **Task contexts**: checkbox, field, form, selection
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: feedback, infoIconSlot
- **Forbids**: 

## Variant Logic

- **checked**: use when Checked
- **unchecked**: use when Unchecked

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
| `appearance` | `CheckboxAppearance` | No | - | Appearance role — border, hover, and checked fill. `auto` → secondary stack. |
| `aria-describedby` | `string` | No | - | For composite fields — links to `Field.Description` etc. |
| `aria-invalid` | `boolean | 'true' | 'false'` | No | - | Invalid state for form validation (exposed on the checkbox control). |
| `aria-label` | `string` | No | - | Accessible label when there is no visible `label` (or when overriding the visible copy). Maps directly to `aria-label` on the underlying checkbox control. When using `CheckboxField`, the visible `Field.Label` provides association automatically — prefer that over `aria-label`. |
| `checked` | `boolean` | No | - | Whether the checkbox is checked (controlled) |
| `children` | `ReactNode` | No | - | Multiple standalone **Checkbox** options. When set, `label` / `description` render as the field header above the list; `feedback` and Omit for a single integrated field (label and description beside the control per Figma). |
| `className` | `string` | No | - | className property |
| `data-testid` | `string` | No | - | Test automation id — forwarded to the checkbox control (`BaseCheckbox.Root`). |
| `defaultChecked` | `boolean` | No | - | Default checked state (uncontrolled) |
| `description` | `string` | No | - | Description below the label row. |
| `disabled` | `boolean` | No | - | Whether the checkbox is disabled |
| `error` | `string` | No | - | Error message (shorthand for `InputFeedback` variant negative). |
| `feedback` | `ReactNode` | No | - | Feedback slot — pass `<InputFeedback … />` or use `error` string. |
| `fullWidth` | `boolean` | No | - | Stretch to fill container width. |
| `groupDefaultValue` | `CheckboxGroupProps['defaultValue']` | No | - | Multi-option default checked values (uncontrolled). Use with `children`. |
| `groupValue` | `CheckboxGroupProps['value']` | No | - | Multi-option checked values (controlled). Use with `children`. |
| `id` | `string` | No | - | HTML id attribute |
| `indeterminate` | `boolean` | No | - | Whether the checkbox is in indeterminate state |
| `infoIconSlot` | `ReactNode` | No | - | Trailing control beside the label (e.g. custom info `IconButton`, menu, or `InputFieldDefaultInfo`). |
| `invalid` | `boolean` | No | - | Mark the field invalid for `Field.Root` and error chrome on the checkbox wrapper. |
| `label` | `string` | No | - | Label text for the field header (multi-option) or integrated checkbox label (single). |
| `labelWrapper` | `'label' | 'div'` | No | label | Outer wrapper element. Use `'div'` inside `CheckboxField` (with `Field.Label`) so the visible label is not nested inside a second `<label>`. |
| `name` | `string` | No | - | Field name for form submission |
| `onCheckedChange` | `(checked: boolean) => void` | No | - | Change handler |
| `onGroupValueChange` | `CheckboxGroupProps['onValueChange']` | No | - | Multi-option change handler. Use with `children`. |
| `readOnly` | `boolean` | No | - | Whether the checkbox is read-only (visually distinct from disabled) |
| `required` | `boolean` | No | - | HTML required — form validation when unchecked |
| `size` | `CheckboxSize` | No | - | Size preset. Default: 'm' |
| `style` | `CSSProperties` | No | - | style property |
| `validate` | `(value: unknown) => string | string[] | null` | No | - | Custom validation — return message(s) or null. |
| `validationMode` | `'onBlur' | 'onChange'` | No | - | Validation mode for `Field.Root`. |
| `value` | `string` | No | - | Value used when inside a CheckboxGroup |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `feedback` | InputFeedback |  |
| `infoIconSlot` | IconButton |  |

## Code Snippets

### Basic Usage

```tsx
import { CheckboxField } from '@oneui/ui';

<CheckboxField />
```

### Recipe Decisions

```json
{
  "component": "CheckboxField",
  "decisions": []
}
```
