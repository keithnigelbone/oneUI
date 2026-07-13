# Badge Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Non-interactive display component used to highlight status, provide notifications, or categorize content. Supports start/end slots for icons and sub-badges.
- **Task contexts**: 
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: start, end
- **Forbids**: 

## Variant Logic

- **bold**: use when High
- **subtle**: use when Medium
- **ghost**: use when Low

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
| `appearance` | `BadgeAppearance` | No | - | Multi-accent appearance role. `'auto'` or omit: inherit nearest `<Surface>` effective role, else `sparkle`. |
| `aria-label` | `string` | No | - | Accessible label for screen readers |
| `attention` | `BadgeAttention` | No | - | Figma attention level — high (bold fill), medium (tinted fill), low (transparent). Default: 'high'. |
| `children` | `ReactNode` | No | - | Text content displayed inside the badge |
| `className` | `string` | No | - | Additional class name |
| `data-testid` | `string` | No | - | Test selector passthrough |
| `end` | `ReactNode` | No | - | Content to render after the label (icon, avatar, counter badge, indicator badge) |
| `size` | `BadgeSize` | No | - | Badge size. Default: 'm'. |
| `start` | `ReactNode` | No | - | Content to render before the label (icon, avatar, counter badge, indicator badge) |
| `style` | `CSSProperties` | No | - | Inline styles |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `start` | Icon, Avatar, CounterBadge, IndicatorBadge |  |
| `end` | Icon, Avatar, CounterBadge, IndicatorBadge |  |

## Code Snippets

### Basic Usage

```tsx
import { Badge } from '@oneui/ui';

<Badge />
```

### Recipe Decisions

```json
{
  "component": "Badge",
  "decisions": [
    "Shape"
  ]
}
```
