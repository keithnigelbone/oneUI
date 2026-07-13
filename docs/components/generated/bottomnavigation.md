# BottomNavigation Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: App-level bottom navigation bar. Accepts 2–5 <BottomNavItem> children with a shared `labelType` (none / 1line / 2line). Supports controlled or uncontrolled active value, multi-accent appearance roles, and an optional top hairline divider.
- **Task contexts**: navigation, nav, bottom-nav, tab-bar, mobile
- **Sentiments**: neutral

## Composition Rules

- **Requires**: children
- **Allows**: 
- **Forbids**: 

## Variant Logic

- **1line**: use when 1 Line
- **2line**: use when 2 Lines
- **none**: use when None

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
| `aria-label` | `string` | Yes | - | Accessible label for the `<nav>` landmark. Required. |
| `children` | `ReactNode` | Yes | - | 2–5 `<BottomNavItem>` children. |
| `appearance` | `BottomNavigationAppearance` | No | - | Multi-accent appearance role applied to all child items. Default: 'primary'. |
| `className` | `string` | No | - | Additional CSS class name. |
| `data-testid` | `string` | No | - | Test id forwarded to the root `<nav>`. |
| `defaultValue` | `string` | No | - | Uncontrolled initial active item value. |
| `labelType` | `BottomNavigationLabelType` | No | - | Label layout for all items. Default: '1line'. |
| `onValueChange` | `(value: string) => void` | No | - | Called when an item is pressed and its `value` becomes active. |
| `showDivider` | `boolean` | No | - | Show the top edge-to-edge divider. Default: true. |
| `style` | `CSSProperties` | No | - | Inline styles. |
| `value` | `string` | No | - | Controlled active item value. Match `value` on a child `<BottomNavItem>`. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `children` | BottomNavItem |  |

## Code Snippets

### Basic Usage

```tsx
import { BottomNavigation } from '@oneui/ui';

<BottomNavigation />
```

### Recipe Decisions

```json
{
  "component": "BottomNavigation",
  "decisions": [
    "Label layout",
    "Item shape"
  ]
}
```
