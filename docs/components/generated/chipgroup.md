# ChipGroup Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Groups multiple Chip components with shared selection state, keyboard navigation, and layout. Supports single-select (default) and multi-select modes. Propagates size, attention, and appearance to all child Chips.
- **Task contexts**: 
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: children
- **Forbids**: 

## Variant Logic

- **ghost**: use when Low
- **subtle**: use when Medium
- **bold**: use when High

## Relationships and Dependencies

- **Related**: 
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark

## Observability Hooks

- **Track**: 
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | Yes | - | children property |
| `appearance` | `ChipAppearance` | No | - | Appearance propagated to all child Chips. |
| `aria-label` | `string` | No | - | Accessible label for the group element. |
| `aria-labelledby` | `string` | No | - | ID of an element that labels this group. |
| `attention` | `ChipAttention` | No | - | Emphasis level propagated to all child Chips. |
| `className` | `string` | No | - | className property |
| `defaultValue` | `string[]` | No | - | Uncontrolled default selected values. |
| `disabled` | `boolean` | No | - | Disable all chips in the group. |
| `loopFocus` | `boolean` | No | - | Loop keyboard focus from last item back to first. Default: true (Base UI default). |
| `maxSelections` | `number` | No | - | Maximum number of chips that can be selected at once (multi-select only). |
| `multiple` | `boolean` | No | - | Allow multiple chips to be selected simultaneously. Default: false. |
| `onValueChange` | `(value: string[]) => void` | No | - | Called when the selection changes. |
| `orientation` | `'horizontal' | 'vertical'` | No | - | Stack direction. Default: 'horizontal'. |
| `required` | `boolean` | No | - | Prevent deselecting the last selected chip. In controlled mode this blocks the callback; in uncontrolled mode it also prevents the internal state from reaching an empty array. |
| `size` | `ChipSize` | No | - | Size propagated to all child Chips. |
| `style` | `CSSProperties` | No | - | style property |
| `value` | `string[]` | No | - | Controlled selected values (array of chip `value` strings). |
| `wrap` | `boolean` | No | - | Whether chips wrap to the next line. Default: true. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `children` | Chip |  |

## Code Snippets

### Basic Usage

```tsx
import { ChipGroup } from '@oneui/ui';

<ChipGroup />
```

### Recipe Decisions

```json
{
  "component": "ChipGroup",
  "decisions": [
    "Gap density",
    "Wrap behaviour"
  ]
}
```
