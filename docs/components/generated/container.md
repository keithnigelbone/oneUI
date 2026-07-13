# Container Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Page-width shell (`fluid` / `fixed` / `full-bleed`) and declarative layout root. On web the node is always `<Surface>` (default `surface="ghost"`) so children get `[data-surface]` token context without an opaque page fill. Omit `layout` for normal block flow; set `layout` to `flex` or `grid` for token-backed flex/grid. Spacing props use spacing scale keys, not raw px.
- **Task contexts**: container, layout, wrapper, page-width, flex, grid, spacing, surface, a2ui
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: children
- **Forbids**: 

## Variant Logic

- **fluid**: use when Fluid
- **fixed**: use when Fixed
- **full-bleed**: use when Full bleed

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
| `align` | `ContainerAlign` | No | - | Maps to `align-items` when `layout` is `flex` or `grid`. |
| `alignSelf` | `ContainerAlign` | No | - | When this `Container` is a flex/grid item, maps to `align-self`. |
| `appearance` | `ComponentAppearance` | No | - | Multi-accent role for the root `<Surface>` — passed through as `appearance` (Surface defaults to `'auto'` when omitted). |
| `as` | `ElementType` | No | - | as property |
| `basis` | `ContainerSizePreset` | No | - | `flex-basis` when `flex` is omitted. |
| `bottom` | `string` | No | - | bottom property |
| `children` | `ReactNode` | No | - | children property |
| `className` | `string` | No | - | className property |
| `columnGap` | `ContainerSpaceKey` | No | - | columnGap property |
| `columns` | `ContainerColumns` | No | - | columns property |
| `direction` | `'row' | 'column'` | No | - | direction property |
| `flex` | `number | string` | No | - | Flex shorthand on the root (`flex`). When set, overrides `grow` / `shrink` / `basis` for that axis bundle — prefer either `flex` or the longhands, not both. |
| `fullWidth` | `boolean` | No | - | Deprecated compatibility hint used by older/generated compositions. Consumed so it does not leak to the DOM as an unknown React prop. |
| `gap` | `ContainerSpaceKey` | No | - | gap property |
| `grow` | `number` | No | - | `flex-grow` when `flex` is omitted. |
| `height` | `ContainerSizePreset` | No | - | height property |
| `justify` | `ContainerJustify` | No | - | justify property |
| `layout` | `ContainerLayoutMode` | No | - | layout property |
| `left` | `string` | No | - | left property |
| `maxHeight` | `ContainerSizePreset` | No | - | maxHeight property |
| `maxWidth` | `string | number | ContainerSizePreset` | No | - | Viewport cap when `variant` is `fixed` (number or non-preset string), or CSS `max-width` / token preset on the element. See {@link resolveContainerMaxWidth}. |
| `minHeight` | `ContainerSizePreset` | No | - | minHeight property |
| `minWidth` | `ContainerSizePreset` | No | - | minWidth property |
| `overflow` | `ContainerOverflow` | No | - | overflow property |
| `padding` | `ContainerSpaceKey` | No | - | padding property |
| `paddingBottom` | `ContainerSpaceKey` | No | - | paddingBottom property |
| `paddingLeft` | `ContainerSpaceKey` | No | - | paddingLeft property |
| `paddingRight` | `ContainerSpaceKey` | No | - | paddingRight property |
| `paddingTop` | `ContainerSpaceKey` | No | - | paddingTop property |
| `paddingX` | `ContainerSpaceKey` | No | - | paddingX property |
| `paddingY` | `ContainerSpaceKey` | No | - | paddingY property |
| `position` | `ContainerPosition` | No | - | position property |
| `right` | `string` | No | - | right property |
| `rowGap` | `ContainerSpaceKey` | No | - | rowGap property |
| `rows` | `number` | No | - | rows property |
| `shrink` | `number` | No | - | `flex-shrink` when `flex` is omitted. |
| `style` | `CSSProperties` | No | - | style property |
| `surface` | `SurfaceToken` | No | - | Surface mode for the **root** element (always `<Surface>` on web). Defaults to `'ghost'` when omitted. Container layout classes and styles are applied on that same node (`data-surface` remapping for children). Native ignores `surface` / `appearance` today. |
| `top` | `string` | No | - | top property |
| `variant` | `ContainerVariant` | No | - | Layout variant. - `fluid` (default): grows with viewport, always applies `--Grid-Margin`. - `fixed`: capped at `--Grid-MaxWidth` per breakpoint, centered. - `full-bleed`: no margin, no cap — edge-to-edge. |
| `width` | `ContainerSizePreset` | No | - | width property |
| `wrap` | `boolean` | No | - | wrap property |
| `zIndex` | `number` | No | - | zIndex property |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `children` |  |  |

## Code Snippets

### Basic Usage

```tsx
import { Container } from '@oneui/ui';

<Container />
```

### Recipe Decisions

```json
{
  "component": "Container",
  "decisions": [
    "Width behavior"
  ]
}
```
