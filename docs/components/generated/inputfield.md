# InputField Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Text input field: `Field.Root` + **Input** (`Field.Label` / `Field.Description` for label-stack copy, `Field.Control` for the `<input>`, 4-slot shell), then `InputFeedback` (including native `Field.Error` when there is no string `error` / custom `feedback`), and DynamicText. Default info uses `IconButton` + `Tooltip` (override with `infoIconSlot`). Optional `labelSlot` replaces string `label` / `description`.
- **Task contexts**: input, field, text, form, text-field, validation
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: labelSlot, start, start2, end, end2, feedback, dynamicTextSlot, dynamicText, helperButton
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
| `appearance` | `InputAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. |
| `aria-label` | `string` | No | - | Accessible label for standalone usage (no visible label). Maps directly to `aria-label` on the underlying `<input>`. When using `InputField`, the visible `Field.Label` provides association automatically — prefer that over `aria-label`. |
| `attention` | `InputAttention` | No | - | Visual attention — 'medium' (outlined, default) or 'high' (filled neutral background). |
| `autoComplete` | `string` | No | - | Autocomplete attribute |
| `autoFocus` | `boolean` | No | - | Autofocus attribute |
| `className` | `string` | No | - | Additional class name |
| `data-testid` | `string` | No | - | Forwarded to the native `<input>` (QA / tests). |
| `defaultValue` | `string` | No | - | Default value (uncontrolled) |
| `description` | `string` | No | - | Description text below the label row (ignored when `labelSlot` is set) |
| `disabled` | `boolean` | No | - | Whether the input is disabled |
| `dynamicText` | `string` | No | - | Leading copy (trimmed non-empty string only). Ignored when `dynamicTextSlot` is set. |
| `dynamicTextSlot` | `ReactNode` | No | - | Dynamic text row slot — pass `<InputDynamicText … />`. When set, `dynamicText` and `helperButton` are ignored. |
| `end` | `ReactNode` | No | - | Trailing content slot — IconButton, Icon, Button, or Text |
| `end2` | `ReactNode` | No | - | Second trailing content slot — Text, Icon, or IconButton |
| `error` | `string` | No | - | Error message to display (shorthand for InputFeedback variant="negative") |
| `feedback` | `ReactNode` | No | - | Feedback slot — pass `<InputFeedback … />` or leave unset and use `error` string. |
| `fullWidth` | `boolean` | No | - | Stretch to fill container width |
| `helperButton` | `string` | No | - | Trailing action label (trimmed non-empty string only); renders as `Button` attention low + condensed. Ignored when `dynamicTextSlot` is set. |
| `id` | `string` | No | - | HTML id attribute for the input element |
| `infoIcon` | `boolean` | No | - | When true with a string `label`, shows the default info control unless `infoIconSlot` is set. |
| `infoIconAriaLabel` | `string` | No | - | Accessible name for the default info `IconButton`. Ignored when `infoIconSlot` is set. |
| `infoIconSlot` | `ReactNode` | No | - | Replaces the default tooltip + info `IconButton` when `infoIcon` is true. |
| `infoTooltipContent` | `ReactNode` | No | - | Tooltip content for the default info control. Ignored when `infoIconSlot` is set. |
| `invalid` | `boolean` | No | - | Mark the field invalid for `Field.Root` and error chrome on the bordered control. |
| `label` | `string` | No | - | Label text for the field (ignored when `labelSlot` is set) |
| `labelSlot` | `ReactNode` | No | - | Label slot — custom node (same `Field.Root`) replacing string `label` / `description` / default info props when set. When set, `label`, `description`, `infoIcon`, and default info props are ignored. |
| `maxLength` | `number` | No | - | Maximum character length (native `maxLength` parity). |
| `name` | `string` | No | - | Field name for form submission |
| `onBlur` | `(e: FocusEvent<HTMLInputElement>) => void` | No | - | Blur event handler |
| `onChange` | `(value: string) => void` | No | - | Change handler — receives the new value string |
| `onFocus` | `(e: FocusEvent<HTMLInputElement>) => void` | No | - | Focus event handler |
| `onKeyDown` | `(e: KeyboardEvent<HTMLInputElement>) => void` | No | - | Keydown event handler |
| `placeholder` | `string` | No | - | Placeholder text |
| `readOnly` | `boolean` | No | - | Whether the input is read-only |
| `required` | `boolean` | No | - | Whether the control is required (native `required` on the `<input>`). |
| `shape` | `InputShape` | No | - | Shape of the input field |
| `size` | `InputSize` | No | - | Input size — f-step number or t-shirt alias (`xs` / `s` / `m` / `l`). Default: 10 (M). |
| `start` | `ReactNode` | No | - | Leading content slot — Icon, IconButton, Avatar, Image, ChipGroup, or Text |
| `start2` | `ReactNode` | No | - | Second leading content slot — Text (prefix, currency symbol) |
| `style` | `CSSProperties` | No | - | Inline styles |
| `type` | `string` | No | - | Input type (text, email, password, number, tel, url, search) |
| `validate` | `(value: unknown) => string | string[] | null` | No | - | Custom validation function |
| `validationMode` | `'onBlur' | 'onChange'` | No | - | Validation mode |
| `value` | `string` | No | - | Current value (controlled) |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `start` | icon, iconButton, avatar, image, chipGroup, text, custom | `iconSize` |
| `start2` | text |  |
| `end` | iconButton, icon, button, text, custom | `iconSize` |
| `end2` | text, icon, iconButton |  |

## Code Snippets

### Basic Usage

```tsx
import { InputField } from '@oneui/ui';

<InputField />
```

### Recipe Decisions

```json
{
  "component": "InputField",
  "decisions": [
    "Shape"
  ]
}
```
