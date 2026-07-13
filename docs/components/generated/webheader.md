# WebHeader Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Responsive web navigation header with primary nav bar, secondary nav tabs, mobile drawer, search, and scroll-based show/hide.
- **Task contexts**: header, navigation, nav, topbar, menu, responsive, drawer, search
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: logo, avatar, end, children, start, end
- **Forbids**: 

## Variant Logic

- **default**: use when Default
- **transparent**: use when Transparent
- **glass**: use when Glass

## Relationships and Dependencies

- **Related**: 
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark

## Observability Hooks

- **Track**: 
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | Yes | - | PrimaryNav + SecondaryNav children |
| `aria-label` | `string` | No | - | Accessible name for the banner landmark. Only apply when this `WebHeader` is the top-level page banner (i.e. a direct child of `<body>`, not nested inside another sectioning element). Pass a short descriptor such as "Main site header" when the default implicit banner name is not descriptive enough. Note: do NOT set this when the header is rendered inside a `<section>`, `<article>`, `<main>`, `<nav>`, or `<aside>` — nesting strips the implicit `banner` role and `aria-label` becomes a prohibited attribute on the now role-less `<header>`. |
| `aria-labelledby` | `string` | No | - | IDREF of a visible element that labels the banner landmark. |
| `breakpoint` | `WebHeaderBreakpoint` | No | - | Override breakpoint (auto-detected by default) |
| `className` | `string` | No | - | Additional class name |
| `style` | `CSSProperties` | No | - | Inline styles |
| `variant` | `WebHeaderVariant` | No | - | Header variant controlling position and background |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `logo` | Logo |  |
| `avatar` | Avatar |  |
| `end` | IconButton |  |
| `children` | HeaderItem |  |
| `start` | Icon, Avatar, CounterBadge, IndicatorBadge |  |
| `end` | Icon, Avatar, CounterBadge, IndicatorBadge |  |

## Code Snippets

### Basic Usage

```tsx
import { WebHeader } from '@oneui/ui';

<WebHeader />
```

### Recipe Decisions

```json
{
  "component": "WebHeader",
  "decisions": [
    "Item Shape",
    "Active Indicator"
  ]
}
```
