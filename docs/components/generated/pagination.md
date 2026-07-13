# Pagination Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Composite numbered page navigator. Renders prev/next + first/last buttons, a windowed list of page numbers, and ellipses where gaps exist — the standard MUI / shadcn / Ant Design pattern, adapted to OneUI tokens, surface-context-awareness, and the high/medium/low attention vocabulary. Uncontrolled by default (`defaultPage`); pass `page` + `onPageChange` for controlled mode. WAI-ARIA navigation landmark with roving-tabindex keyboard navigation and a polite live region announcing page changes.
- **Task contexts**: pagination, pages, navigation, navigator, page-numbers, next, previous, list, table, carousel
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: 
- **Forbids**: 

## Variant Logic

- **high**: use when High (bold chip)
- **medium**: use when Medium (subtle chip)
- **low**: use when Low (ghost chip)

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
| `totalPages` | `number` | Yes | - | Total number of pages. Required. Values < 1 render nothing. |
| `appearance` | `PaginationAppearance` | No | - | Multi-accent appearance role for page chips and nav controls. `'auto'` resolves to `'primary'`. |
| `aria-label` | `string` | No | - | Accessible label for the navigation landmark. Default `"Pagination"`. |
| `attention` | `PaginationAttention` | No | - | Emphasis level for the **selected** page chip only — `high` (bold fill), `medium` (tinted fill), `low` (ghost). Inactive page chips stay ghost with high-emphasis numeral colour; nav + ellipsis stay ghost + low attention. Default `'medium'`. |
| `boundaryCount` | `number` | No | - | Number of always-visible page numbers at the very start AND the very end of the sequence. Default `1` (i.e. always render page 1 and page N). Set to `0` to hide them. |
| `className` | `string` | No | - | Additional class name applied to the root. |
| `data-testid` | `string` | No | - | Test ID. |
| `defaultPage` | `number` | No | - | Default current page (1-based) when uncontrolled. Default `1`. |
| `disabled` | `boolean` | No | - | Disable the entire control. |
| `onPageChange` | `(page: number) => void` | No | - | Fires whenever the active page changes (click, keyboard, controlled update). |
| `page` | `number` | No | - | Controlled current page (1-based). |
| `showFirstLast` | `boolean` | No | - | Show the "first page" / "last page" jump buttons. Default `false`. |
| `showPrevNext` | `boolean` | No | - | Show the "previous page" arrow button. Default `true`. |
| `siblingCount` | `number` | No | - | Number of always-visible page numbers immediately around the current page. Default `1` (i.e. show one page on each side of `current`). |
| `size` | `PaginationSize` | No | - | T-shirt size for page chips, nav `IconButton`s, and ellipsis. Default `'M'`. |
| `style` | `CSSProperties` | No | - | Inline styles. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { Pagination } from '@oneui/ui';

<Pagination />
```

### Recipe Decisions

```json
{
  "component": "Pagination",
  "decisions": [
    "Shape",
    "Default attention (selected page)"
  ]
}
```
