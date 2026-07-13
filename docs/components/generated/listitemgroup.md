# ListItemGroup Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Stacks <ListItem> children vertically. Optional top edge-to-edge hairline (sectionDivider), inset rounded-card framing (container="inset"), and a uniform inter-row divider style propagated to all children (per-row override wins).
- **Task contexts**: list, group, section, layout
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: children
- **Forbids**: 

## Variant Logic

- **fullWidth**: use when Full Width
- **inset**: use when Inset

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
| `aria-label` | `string` | No | - | Accessible name for the group landmark. |
| `children` | `ReactNode` | No | - | <ListItem> children — maps to Figma's `content` slot. Optional so empty groups are valid. |
| `className` | `string` | No | - | Additional CSS class on the root. |
| `container` | `ListItemGroupContainer` | No | - | Container framing. Default: 'fullWidth'. |
| `divider` | `ListItemGroupDivider` | No | - | Inter-row divider style injected into all <ListItem> children. Matches Figma's `divider` group property (`none` | `full` | `inset`). Per-child `divider` prop overrides the group default. The last row auto-suppresses via `:last-child` so there's no dangling hairline. Default: `'inset'`. |
| `role` | `ListItemGroupRole` | No | - | Group landmark role. Default: 'group'. |
| `sectionDivider` | `boolean` | No | - | Top edge-to-edge hairline above the first row. Default: true. |
| `style` | `CSSProperties` | No | - | Inline styles on the root. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `children` | ListItem |  |

## Code Snippets

### Basic Usage

```tsx
import { ListItemGroup } from '@oneui/ui';

<ListItemGroup />
```

### Recipe Decisions

```json
{
  "component": "ListItemGroup",
  "decisions": [
    "Divider"
  ]
}
```
