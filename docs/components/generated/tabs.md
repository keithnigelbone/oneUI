# Tabs Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Accessible tabbed navigation. Uses Base UI Tabs primitive for keyboard navigation, arrow/Home/End keys, and automatic focus management. Three sizes (S/M/L), two orientations (horizontal/vertical). Matching Figma spec: selected tab gets an animated tinted indicator, tinted-accessible label color, and a surface-aware double-ring focus halo. Supports start + end content slots; icon + badge are legacy aliases.
- **Task contexts**: 
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: start, end
- **Forbids**: 

## Variant Logic

- **horizontal**: use when Horizontal
- **vertical**: use when Vertical

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
| `appearance` | `ComponentAppearance` | No | - | Appearance forwarded to all child TabItems. |
| `className` | `string` | No | - | className property |
| `defaultValue` | `TabsValue` | No | - | defaultValue property |
| `onValueChange` | `(value: TabsValue) => void` | No | - | onValueChange property |
| `orientation` | `TabsOrientation` | No | - | orientation property |
| `size` | `TabsSize` | No | - | Size forwarded to all child TabItems. |
| `value` | `TabsValue` | No | - | value property |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `start` | Icon, Avatar, CounterBadge, IndicatorBadge |  |
| `end` | Icon, Avatar, CounterBadge, IndicatorBadge |  |

## Code Snippets

### Basic Usage

```tsx
import { Tabs } from '@oneui/ui';

<Tabs />
```

### Recipe Decisions

```json
{
  "component": "Tabs",
  "decisions": [
    "Shape"
  ]
}
```
