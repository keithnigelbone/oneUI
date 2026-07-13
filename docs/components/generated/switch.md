# Switch Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Immediate binary toggle — state takes effect on change without a submit action.
- **Task contexts**: settings-toggle, feature-flag, live-preference
- **Sentiments**: neutral, positive

## Composition Rules

- **Requires**: label or aria-label
- **Allows**: read-only mode, accent override
- **Forbids**: use in forms requiring explicit submit, replace with Checkbox for non-immediate effects

## Variant Logic

- **default**: use when immediate on/off setting
- **readOnly**: use when display-only permission or system setting

## Relationships and Dependencies

- **Related**: Checkbox, Radio
- **Escalates to**: -
- **Degrades to**: Checkbox
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, appearance + accent dual-role
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: toggle_on, toggle_off
- **Health**: a11y_violations, adoption_rate

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `accent` | `SwitchAccent` | No | - | Accent override for selected fill color. When set, overrides the fill from appearance while keeping appearance's border/context. When not set, fill follows appearance role. |
| `appearance` | `SwitchAppearance` | No | - | Multi-accent appearance role. Interactive checked: explicit role wins; 'auto'/unset resolves to secondary. Interactive unchecked: ignores this prop and uses nearest Surface appearance, then neutral. ReadOnly: neutral in both visual states. |
| `aria-label` | `string` | No | - | Accessible label for switches without a text child. |
| `aria-labelledby` | `string` | No | - | ID of an element that labels the switch. |
| `checked` | `boolean` | No | - | Whether the switch is on (controlled) |
| `children` | `ReactNode` | No | - | Label text |
| `className` | `string` | No | - | Additional class name |
| `data-testid` | `string` | No | - | Stable anchor for QA / e2e — forwarded to the root switch control only (not the label wrapper). |
| `defaultChecked` | `boolean` | No | - | Default state (uncontrolled) |
| `disabled` | `boolean` | No | - | Whether the switch is disabled |
| `id` | `string` | No | - | HTML id attribute |
| `name` | `string` | No | - | Field name for form submission |
| `onCheckedChange` | `(checked: boolean) => void` | No | - | Change handler |
| `readOnly` | `boolean` | No | - | Whether the switch is read-only (visually distinct from disabled) |
| `size` | `SwitchSize` | No | - | Size preset. Default: 'm' |
| `style` | `CSSProperties` | No | - | Inline styles |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { Switch } from '@oneui/ui';

<Switch>Enable notifications</Switch>
```

### Controlled

```tsx
<Switch checked={isOn} onCheckedChange={setIsOn}>Dark mode</Switch>
```

### Recipe Decisions

```json
{
  "component": "Switch",
  "decisions": [
    "Shape"
  ]
}
```
