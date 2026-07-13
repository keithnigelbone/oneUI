# IndicatorBadge Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Non-interactive status/presence indicator dot. Supports multi-accent appearance roles and five sizes.
- **Task contexts**: 
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: 
- **Forbids**: 

## Variant Logic

- **bold**: use when Default

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
| `aria-label` | `string` | Yes | - | Required accessible label describing the indicator status |
| `appearance` | `IndicatorBadgeAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. |
| `className` | `string` | No | - | Additional class name |
| `data-testid` | `string` | No | - | Test automation id — forwarded to the root `<span role="status">`. |
| `size` | `IndicatorBadgeSize` | No | - | IndicatorBadge size. Default: 'm'. |
| `style` | `CSSProperties` | No | - | Inline styles |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { IndicatorBadge } from '@oneui/ui';

<IndicatorBadge />
```

### Recipe Decisions

```json
{
  "component": "IndicatorBadge",
  "decisions": [
    "Shape"
  ]
}
```
