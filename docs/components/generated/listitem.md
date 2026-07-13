# ListItem Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Single row in a list. Renders a title (Label-M) and optional supportText (Body-S) with start/end slots for icons/avatars/badges/chevrons. Supports 4 start slot sizes (S/M/L/XL), 2 end sizes (S/M), three selected levels (false / medium / high), multi-accent appearance roles, bottom divider (none/full/inset), and an inset rounded-card container.
- **Task contexts**: list, row, menu, navigation, item
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: start, end
- **Forbids**: 

## Variant Logic

- **default**: use when Default
- **medium**: use when Selected (Medium)
- **high**: use when Selected (High)

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
| `title` | `ReactNode` | Yes | - | Primary line. Rendered as Label-M-High. |
| `appearance` | `ListItemAppearance` | No | - | Multi-accent appearance role. Default: 'primary'. |
| `aria-label` | `string` | No | - | Accessible name — required when `title` is non-textual. |
| `className` | `string` | No | - | Additional CSS class name on the root. |
| `container` | `ListItemContainer` | No | - | Container variant. Default: 'fullWidth'. |
| `disabled` | `boolean` | No | - | Disable interaction + apply reduced-opacity token. |
| `divider` | `ListItemDivider` | No | - | Bottom hairline style. Default: 'none'. Auto-suppresses when the row is the last child. |
| `end` | `ReactNode` | No | - | Trailing content (chevron / icon). |
| `endSize` | `ListItemEndSize` | No | - | Trailing slot size. Default: 'M'. |
| `href` | `string` | No | - | When set, renders as `<a>`. |
| `onClick` | `(e: MouseEvent<HTMLElement>) => void` | No | - | When set (and no href), renders as `<button type="button">`. |
| `selected` | `ListItemSelected` | No | - | Selected emphasis. Default: false. `'high'` triggers `[data-surface="bold"]` self-remap. |
| `slotAlignment` | `ListItemSlotAlign` | No | - | Slot vertical alignment. Default: 'centre'. When supportText is absent, the row single-lines regardless. |
| `start` | `ReactNode` | No | - | Leading content (icon / avatar / badge). |
| `startSize` | `ListItemSlotSize` | No | - | Leading slot size. Default: 'M'. |
| `style` | `CSSProperties` | No | - | Inline styles on the root. |
| `supportStart` | `ReactNode` | No | - | Small inline decorative slot rendered BEFORE the support text (matches Figma `.ListItem.Slot.Default.Content`). Follows the support text colour. |
| `supportText` | `ReactNode` | No | - | Optional secondary line below title. Rendered as Body-S-Low. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `start` | Icon, Avatar, Badge, CounterBadge, IndicatorBadge |  |
| `end` | Icon, IconButton |  |

## Code Snippets

### Basic Usage

```tsx
import { ListItem } from '@oneui/ui';

<ListItem />
```

### Recipe Decisions

```json
{
  "component": "ListItem",
  "decisions": [
    "Row density",
    "Divider"
  ]
}
```
