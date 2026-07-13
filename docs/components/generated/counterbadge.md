# CounterBadge Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Non-interactive display component showing a numeric count with bold/subtle/ghost variants and multi-accent support.
- **Task contexts**: 
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: 
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
| `value` | `number` | Yes | - | Numeric value to display |
| `appearance` | `CounterBadgeAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. |
| `aria-label` | `string` | No | - | Accessible label for screen readers |
| `attention` | `CounterBadgeAttention` | No | - | Figma attention level — high (bold fill), medium (subtle/tinted fill), low (ghost/transparent). Default: 'high'. |
| `className` | `string` | No | - | Additional class name |
| `data-testid` | `string` | No | - | Test automation id — forwarded to the root `<span role="status">`. |
| `max` | `number` | No | - | Maximum value before showing overflow (e.g., "99+"). Default: 99 |
| `showZero` | `boolean` | No | - | Whether to show the badge when value is 0. Default: false |
| `size` | `CounterBadgeSize` | No | - | CounterBadge size. Default: 'm' |
| `style` | `CSSProperties` | No | - | Inline styles |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { CounterBadge } from '@oneui/ui';

<CounterBadge />
```

### Recipe Decisions

```json
{
  "component": "CounterBadge",
  "decisions": [
    "Shape"
  ]
}
```
