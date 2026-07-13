# Chip Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Compact interactive label for filtering, tagging, or selecting values.
- **Task contexts**: filter-selection, tag-display, multi-select, categorisation
- **Sentiments**: neutral, positive, informative

## Composition Rules

- **Requires**: label text or aria-label
- **Allows**: start slot (icon, avatar, badge), end slot (icon, counter)
- **Forbids**: multi-line text content

## Variant Logic

- **bold**: use when selected/active state in filter groups
- **subtle**: use when suggested or pre-selected options
- **ghost**: use when unselected filter options (default)

## Relationships and Dependencies

- **Related**: ChipGroup, Button, Badge
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: ChipGroup

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: select, deselect
- **Health**: adoption_rate, a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `appearance` | `ChipAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'secondary'. |
| `aria-label` | `string` | No | - | Accessible label for screen readers |
| `attention` | `ChipAttention` | No | - | Emphasis level — high (filled when selected), medium (tinted when selected), low (outlined). Default: 'high'. |
| `children` | `ReactNode` | No | - | Text label content |
| `className` | `string` | No | - | Additional class name |
| `data-testid` | `string` | No | - | QA / automation hook on the root toggle button |
| `defaultSelected` | `boolean` | No | - | Default selected state (uncontrolled). Defaults to true. |
| `disabled` | `boolean` | No | - | Whether the chip is disabled. |
| `end` | `ReactNode` | No | - | Content to render after the label (Icon, Avatar, CounterBadge, IndicatorBadge) |
| `onSelectedChange` | `(selected: boolean, eventDetails?: unknown) => void` | No | - | Called when selected state changes. |
| `selected` | `boolean` | No | - | Selected state (controlled). Maps to Toggle pressed. |
| `size` | `ChipSize` | No | - | Chip size. Default: 'm'. |
| `start` | `ReactNode` | No | - | Content to render before the label (Icon, Avatar, CounterBadge, IndicatorBadge) |
| `style` | `CSSProperties` | No | - | Inline styles |
| `value` | `string` | No | - | Value for use within ToggleGroup. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `start` | Icon, Avatar, CounterBadge, IndicatorBadge |  |
| `end` | Icon, Avatar, CounterBadge, IndicatorBadge |  |

## Code Snippets

### Basic Usage

```tsx
import { Chip } from '@oneui/ui';

<Chip>Label</Chip>
```

### Selectable Chip

```tsx
<Chip attention="high" selected>Active Filter</Chip>
```

### Recipe Decisions

```json
{
  "component": "Chip",
  "decisions": [
    "Shape"
  ]
}
```
