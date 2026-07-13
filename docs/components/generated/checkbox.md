# Checkbox Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Binary selection control for forms and settings with tri-state (indeterminate) support.
- **Task contexts**: form-field, settings-toggle, multi-select-list, bulk-selection
- **Sentiments**: neutral, positive

## Composition Rules

- **Requires**: label or aria-label
- **Allows**: indeterminate state, read-only mode
- **Forbids**: use as a toggle for non-boolean values

## Variant Logic

- **default**: use when standard form checkbox
- **indeterminate**: use when parent of partially-selected group
- **readOnly**: use when display-only state, value visible but not editable

## Relationships and Dependencies

- **Related**: Switch, Radio, CheckboxGroup
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: CheckboxGroup, FormField

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, appearance + accent dual-role
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: check, uncheck, indeterminate_set
- **Health**: a11y_violations, override_frequency

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `accent` | `CheckboxAccent` | No | - | accent property |
| `appearance` | `CheckboxAppearance` | No | - | Appearance role — border, hover, and checked fill. `auto` → secondary stack. |
| `aria-describedby` | `string` | No | - | For composite fields — links to `Field.Description` etc. |
| `aria-invalid` | `boolean | 'true' | 'false'` | No | - | Invalid state for form validation (exposed on the checkbox control). |
| `aria-label` | `string` | No | - | Accessible label when there is no visible `label` (or when overriding the visible copy). Maps directly to `aria-label` on the underlying checkbox control. When using `CheckboxField`, the visible `Field.Label` provides association automatically — prefer that over `aria-label`. |
| `checked` | `boolean` | No | - | Whether the checkbox is checked (controlled) |
| `children` | `ReactNode` | No | - | children property |
| `className` | `string` | No | - | Additional class name |
| `data-testid` | `string` | No | - | Test automation id — forwarded to the checkbox control (`BaseCheckbox.Root`). |
| `defaultChecked` | `boolean` | No | - | Default checked state (uncontrolled) |
| `description` | `string` | No | - | Supplementary copy below the label row. Maps to `aria-describedby` on the control. |
| `disabled` | `boolean` | No | - | Whether the checkbox is disabled |
| `errorHighlight` | `boolean` | No | - | Error-state chrome on the wrapper (from `CheckboxField` when invalid). Standalone `Checkbox` does not use `errorHighlight`; use `CheckboxField` for validation UX. |
| `id` | `string` | No | - | HTML id attribute |
| `indeterminate` | `boolean` | No | - | Whether the checkbox is in indeterminate state |
| `label` | `string` | No | - | Visible label beside the control. Maps to `aria-label` when the wrapper is a `div`. |
| `labelAssociation` | `'native' | 'field'` | No | native | Render inside `Field.Root` (CheckboxField) or standalone. |
| `labelWrapper` | `'label' | 'div'` | No | label | Outer wrapper element. Use `'div'` inside `CheckboxField` (with `Field.Label`) so the visible label is not nested inside a second `<label>`. |
| `name` | `string` | No | - | Field name for form submission |
| `onCheckedChange` | `(checked: boolean) => void` | No | - | Change handler |
| `readOnly` | `boolean` | No | - | Whether the checkbox is read-only (visually distinct from disabled) |
| `required` | `boolean` | No | - | HTML required — form validation when unchecked |
| `size` | `CheckboxSize` | No | - | Size preset. Default: 'm' |
| `style` | `CSSProperties` | No | - | Inline styles |
| `supplementaryDescribedById` | `string` | No | - | supplementaryDescribedById property |
| `value` | `string` | No | - | Value used when inside a CheckboxGroup |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { Checkbox } from '@oneui/ui';

<Checkbox>Accept terms</Checkbox>
```

### Controlled

```tsx
<Checkbox checked={isChecked} onCheckedChange={setIsChecked}>Option</Checkbox>
```

### Recipe Decisions

```json
{
  "component": "Checkbox",
  "decisions": [
    "Shape"
  ]
}
```
