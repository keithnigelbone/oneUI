# IconContained Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Display an icon within a filled container shape with attention-level emphasis.
- **Task contexts**: status-badge, category-indicator, feature-highlight, list-item-icon
- **Sentiments**: neutral, positive, negative, warning, informative

## Composition Rules

- **Requires**: icon prop (semantic name or React element)
- **Allows**: aria-label for accessibility
- **Forbids**: interactive behaviour (non-interactive display only), text content

## Variant Logic

- **high attention**: use when prominent solid bold fill container
- **medium attention**: use when subtle tinted fill container

## Relationships and Dependencies

- **Related**: Icon, Avatar, IconButton
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: impression
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `icon` | `ComponentIconInput | ReactElement` | Yes | - | icon property |
| `appearance` | `IconContainedAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. Default: 'secondary'. |
| `aria-label` | `string` | No | - | Accessible label for the icon |
| `attention` | `IconContainedAttention` | No | - | Attention level — High (solid bold fill), Medium (subtle tinted fill). Default: 'medium' |
| `className` | `string` | No | - | Additional class name |
| `disabled` | `boolean` | No | - | Disabled state |
| `size` | `IconContainedSize` | No | - | Size preset. Default: 'm' |
| `style` | `CSSProperties` | No | - | Inline styles |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { IconContained } from '@oneui/ui';

<IconContained icon="check" />
```

### Medium Attention

```tsx
<IconContained icon="info" attention="medium" appearance="informative" />
```

### Recipe Decisions

```json
{
  "component": "IconContained",
  "decisions": [
    "Shape"
  ]
}
```
