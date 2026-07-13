# Radio Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Single-selection control within a mutually-exclusive option group.
- **Task contexts**: single-select-form, preference-setting, wizard-step
- **Sentiments**: neutral

## Composition Rules

- **Requires**: value prop, RadioGroup parent, label or aria-label
- **Allows**: read-only mode, group-level appearance inheritance
- **Forbids**: standalone use without RadioGroup, multiple selection

## Variant Logic

- **default**: use when standard option in a radio group
- **readOnly**: use when display-only, value shown but cannot change

## Relationships and Dependencies

- **Related**: Checkbox, Switch, RadioGroup
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: RadioGroup, FormField

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, appearance + accent dual-role
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: select
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `string` | Yes | - | Value for this radio item (required) |
| `accent` | `RadioAccent` | No | - | accent property |
| `appearance` | `RadioAppearance` | No | - | Multi-accent appearance role. Controls border, hover, AND fill tokens. `auto` → secondary stack. |
| `aria-describedby` | `string` | No | - | aria-describedby property |
| `aria-invalid` | `boolean | 'true' | 'false'` | No | - | aria-invalid property |
| `aria-label` | `string` | No | - | Accessible label when there is no visible `label` (or when overriding the visible copy). Maps directly to `aria-label` on the underlying radio control. |
| `aria-labelledby` | `string` | No | - | When set, names the control via `aria-labelledby` (e.g. `RadioField` single-option layout where the visible label lives on the field, not on this `Radio`). |
| `checked` | `boolean` | No | - | Whether this option is selected. Selection is owned by the parent **`RadioGroup`** via `value` / `defaultValue` matching this `value`. This prop is accepted for tooling (e.g. Storybook) and is **not** forwarded to the underlying primitive. |
| `children` | `ReactNode` | No | - | children property |
| `className` | `string` | No | - | Additional class name |
| `data-testid` | `string` | No | - | Test automation id — forwarded to the radio control (`BaseRadio.Root`). |
| `description` | `string` | No | - | Supplementary copy below the label row. Maps to `aria-describedby` on the control. |
| `disabled` | `boolean` | No | - | Whether this radio is disabled |
| `errorHighlight` | `boolean` | No | - | Error-state chrome on the wrapper (from `RadioField` when invalid). Standalone `Radio` does not use `errorHighlight`; use `RadioField` for validation UX. |
| `id` | `string` | No | - | HTML id attribute |
| `label` | `string` | No | - | Visible label beside the control. Maps to `aria-label` when the wrapper is a `div`. |
| `labelAssociation` | `'native' | 'field'` | No | native | Render inside `Field.Root` (RadioField) or standalone. |
| `labelWrapper` | `'label' | 'div'` | No | label | Outer wrapper element. Use `'div'` inside a field composition so the visible label is not nested inside a second `<label>`. |
| `readOnly` | `boolean` | No | - | Whether this radio is read-only (focusable but value cannot change) |
| `required` | `boolean` | No | - | HTML required — form validation |
| `size` | `RadioSize` | No | - | Size preset. Default: 'm' |
| `style` | `CSSProperties` | No | - | Inline styles |
| `supplementaryDescribedById` | `string` | No | - | supplementaryDescribedById property |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { Radio, RadioGroup } from '@oneui/ui';

<RadioGroup value={value} onValueChange={setValue}>
  <Radio value="a">Option A</Radio>
  <Radio value="b">Option B</Radio>
</RadioGroup>
```

### Recipe Decisions

```json
{
  "component": "Radio",
  "decisions": [
    "Outer Shape",
    "Dot Shape"
  ]
}
```
