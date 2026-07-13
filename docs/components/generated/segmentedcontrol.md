# SegmentedControl Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Mutually exclusive segmented control for switching between related views or filters. Wraps Base UI ToggleGroup. Supports track emphasis, attention-driven selected states, equal-width layout, text and icon-only segments, and start (icon) / end (CounterBadge) slots.
- **Task contexts**: navigation, filter, toggle, selection, segmented
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: children
- **Forbids**: 

## Variant Logic

- **high**: use when High
- **medium**: use when Medium
- **low**: use when Low

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
| `children` | `ReactNode` | Yes | - | children property |
| `appearance` | `ComponentAppearance` | No | - | Multi-accent colour role for active segments when attention is `high` or `medium`. `auto` resolves to parent Surface appearance → primary. When attention is `low`, selected segments follow auto(neutral): parent Surface appearance ?? neutral (same as track). |
| `aria-label` | `string` | No | - | aria-label property |
| `aria-labelledby` | `string` | No | - | aria-labelledby property |
| `attention` | `SegmentedControlAttention` | No | - | Drives the SELECTED segment fill prominence. Default: `high`. |
| `className` | `string` | No | - | className property |
| `defaultValue` | `string` | No | - | Uncontrolled initial value |
| `disabled` | `boolean` | No | - | disabled property |
| `equalWidth` | `boolean` | No | - | When true (default), every segment shares equal width. |
| `onValueChange` | `(value: string) => void` | No | - | Called when the selected segment changes |
| `shape` | `SegmentedControlShape` | No | - | shape property |
| `size` | `SegmentedControlSize` | No | - | size property |
| `style` | `CSSProperties` | No | - | style property |
| `trackEmphasis` | `SegmentedControlTrackEmphasis` | No | - | Track (outer container) background prominence. Default: `high`. |
| `type` | `SegmentedControlType` | No | - | `text` (default) or `icon` — icon-only requires `aria-label` on each item. |
| `value` | `string` | No | - | Controlled selected value |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `children` | SegmentedControl.Item |  |

## Code Snippets

### Basic Usage

```tsx
import { SegmentedControl } from '@oneui/ui';

<SegmentedControl />
```

### Recipe Decisions

```json
{
  "component": "SegmentedControl",
  "decisions": [
    "Shape",
    "Track emphasis",
    "Selected attention"
  ]
}
```
