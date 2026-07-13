# Stepper Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Numeric input control with increment and decrement buttons for bounded integer values.
- **Task contexts**: quantity-selection, numeric-form-field, pagination-control
- **Sentiments**: neutral, positive, warning

## Composition Rules

- **Requires**: numeric value context
- **Allows**: min/max constraints, custom step, shift multiplier, error state
- **Forbids**: non-numeric values, string entry

## Variant Logic

- **high**: use when primary quantity input requiring high emphasis
- **medium**: use when default quantity field (most common use)
- **low**: use when de-emphasised numeric control

## Relationships and Dependencies

- **Related**: Button, FormField, NumberInput
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, appearance + accent dual-role
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: increment, decrement, manual_input
- **Health**: a11y_violations, out_of_range_frequency

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `accent` | `StepperAccent` | No | - | Accent override for fill color at high attention. When set, overrides the fill from appearance while keeping appearance's context. When not set, fill follows appearance role. |
| `appearance` | `StepperAppearance` | No | - | Multi-accent appearance role. Controls all tokens. `'auto'` or omit: inherit nearest `<Surface>` effective role (see `useSurfaceAppearance`), else `'secondary'` when outside any Surface (same pattern as Badge, different root fallback). |
| `attention` | `StepperAttention` | No | - | Attention level controls visual weight. Default: 'medium' |
| `className` | `string` | No | - | Additional class name |
| `condensed` | `boolean` | No | - | Whether to use condensed height. Default: false |
| `data-testid` | `string` | No | - | Test ID |
| `defaultValue` | `number` | No | - | Default value (uncontrolled) |
| `direction` | `StepperDirection` | No | - | Visual direction. Default: 'ltr' keeps decrement left and increment right; 'rtl' mirrors the visual order. |
| `disabled` | `boolean` | No | - | Whether the stepper is disabled |
| `end` | `StepperControlSlot` | No | - | Optional increment control (right in LTR, left in RTL). Same rules as {@link StepperProps.start}. Omitted: default add icon. `partProps.incrementButton.render` overrides. **Semantics:** this slot always drives **increase** behaviour. |
| `error` | `boolean` | No | - | Whether the stepper is in error state |
| `max` | `number` | No | - | Maximum allowed value |
| `min` | `number` | No | - | Minimum allowed value |
| `onChange` | `(event: SyntheticEvent | null, value: number | null) => void` | No | - | Change handler — Base UI standard signature |
| `partProps` | `{ root?: ComponentPropsWithRef<'div'>; input?: ComponentPropsWithRef<'input'>; incrementButton?: ComponentPropsWithRef<'button'>; decrementButton?: ComponentPropsWithRef<'button'>; }` | No | - | Props for internal Base UI parts. Use for primitive-level overrides, not public content slots. |
| `readOnly` | `boolean` | No | - | Whether the stepper is read-only |
| `required` | `boolean` | No | - | Whether the field is required |
| `shiftMultiplier` | `number` | No | - | Jump by larger amount when holding Shift. Maps to Base UI's largeStep. |
| `size` | `StepperSize` | No | - | Size preset. Default: 'm' |
| `start` | `StepperControlSlot` | No | - | Optional decrement control (left in LTR, right in RTL). Must be a **single `<IconButton />` element** whose root accepts merged props and ref from the NumberField. Uses Base UI `render` on `Decrement`. Omitted: default remove icon. `partProps.decrementButton.render` overrides. **Semantics:** this slot always drives **decrease** behaviour (not “leading” in the abstract). |
| `step` | `number` | No | - | Step increment. Default: 1 |
| `style` | `CSSProperties` | No | - | Inline styles |
| `value` | `number | null` | No | - | Controlled value |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `start` | IconButton |  |
| `end` | IconButton |  |

## Code Snippets

### Basic Usage

```tsx
import { Stepper } from '@oneui/ui';

<Stepper defaultValue={1} min={0} max={10} />
```

### Controlled

```tsx
<Stepper value={qty} onChange={(_, v) => setQty(v ?? 0)} min={1} max={99} />
```

### Recipe Decisions

```json
{
  "component": "Stepper",
  "decisions": [
    "Shape"
  ]
}
```
