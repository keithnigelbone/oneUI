# Divider Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Visual separator between sections, list items, or content groups.
- **Task contexts**: section-separation, list-item-separation, content-grouping
- **Sentiments**: neutral

## Composition Rules

- **Requires**: orientation context
- **Allows**: label or icon slot, round caps
- **Forbids**: interactive content, non-separator use

## Variant Logic

- **low attention**: use when subtle content separation (default)
- **medium attention**: use when prominent section boundary
- **high attention**: use when strong separator between major sections

## Relationships and Dependencies

- **Related**: ContentBlock, List
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware
- **Mode**: light, dark

## Observability Hooks

- **Track**: 
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `appearance` | `DividerAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'neutral'. Default: 'auto' |
| `attention` | `DividerAttention` | No | - | Prominence level — drives stroke tier and centre Icon/Text emphasis. Default: 'low' |
| `children` | `ReactNode` | No | - | Centre content — plain string/number (auto-wrapped in Label XS Medium `<Text />`), `<Icon />`, or `<Text />`. Divider merges `appearance` / `attention` onto `Icon` / `Text` when those props are unset on the child. Omit for a bare separator. |
| `className` | `string` | No | - | Additional class name |
| `contentAlign` | `DividerContentAlign` | No | - | Position of the centre content. Default: 'center' |
| `data-testid` | `string` | No | - | Test automation id — forwarded to the root separator element only. |
| `orientation` | `DividerOrientation` | No | - | Component orientation. Default: 'horizontal' |
| `roundCaps` | `boolean` | No | - | Rounded stroke ends. Default: false |
| `size` | `DividerSize` | No | - | Stroke width of the divider. Default: 'm' |
| `style` | `CSSProperties` | No | - | Inline styles |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `children` | ReactNode, Icon, Text |  |

## Code Snippets

### Basic Usage

```tsx
import { Divider } from '@oneui/ui';

<Divider />
```

### With Text

```tsx
import { Divider, Text } from '@oneui/ui';

<Divider content={<Text variant="label" size="S" weight="medium" text="Or" />} />
```

### Vertical

```tsx
<Divider orientation="vertical" />
```
