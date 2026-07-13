# PaginationDots Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Windowed pagination indicator for carousels and multi-page content. Shows a fixed window of dots that scroll with the active index. Edge dots shrink to signal more content on either side. Supports loop (infinite) and non-loop (end-grow) modes. Fully accessible: roving tabindex, keyboard nav, aria-selected.
- **Task contexts**: pagination, carousel, indicator, navigation, dots
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: 
- **Forbids**: 

## Variant Logic

- **non-loop**: use when Non-loop
- **loop**: use when Loop

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
| `pageCount` | `number` | Yes | - | Total number of pages / items. Required. |
| `activeIndex` | `number` | No | - | Controlled active index. |
| `appearance` | `PaginationDotsAppearance` | No | - | Multi-accent appearance role. `auto` resolves to `primary`. Default: `primary`. |
| `aria-label` | `string` | No | - | Accessible label for the tablist root. |
| `className` | `string` | No | - | Additional class name applied to the root. |
| `data-testid` | `string` | No | - | Stable anchor for Playwright / QA harnesses (applied to the tablist / status root). |
| `defaultActiveIndex` | `number` | No | - | Default active index when uncontrolled. |
| `loop` | `boolean` | No | - | Loop mode. `true` = infinite windowed scroll, window always centered on active, last → 0 wraps seamlessly. `false` = finite sequence, window clamps at the edges, last dot grows full size when the user approaches the end. Default: `false`. |
| `onActiveIndexChange` | `(index: number) => void` | No | - | Fires when the active index changes (via click, keyboard, or controlled update). |
| `readOnly` | `boolean` | No | - | When true, disables all interaction (clicks, keyboard) and renders as a read-only live-region indicator (`role="status"`, `aria-live="polite"`). Use for components that purely mirror a parent carousel's state. |
| `style` | `CSSProperties` | No | - | Inline styles applied to the root. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { PaginationDots } from '@oneui/ui';

<PaginationDots />
```

### Recipe Decisions

```json
{
  "component": "PaginationDots",
  "decisions": [
    "Shape"
  ]
}
```
