# SingleTextButton Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Circular single-text action button (max 2 characters, e.g. "Ag", "En"). Attention level drives the visual: high=bold fill, medium=subtle fill, low=ghost. 3 sizes (S/M/L). Shape customisable per brand.
- **Task contexts**: 
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: 
- **Forbids**: 

## Variant Logic

- **high**: use when High
- **medium**: use when Medium
- **low**: use when Low

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
| `children` | `ReactNode` | Yes | - | Text label content — max 2 characters (e.g. "Ag", "En", "A", "12"). This component renders as a circular button; longer text breaks the shape. Text exceeding 2 characters will be truncated in development with a warning. |
| `appearance` | `SingleTextButtonAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. Default: 'auto'. |
| `aria-label` | `string` | No | - | Accessible label for screen readers (optional — children text is visible). |
| `attention` | `SingleTextButtonAttention` | No | - | Attention level — drives the visual variant. high → bold fill (solid accent bg, on-bold-high text) medium → subtle fill (tinted bg, accent text) low → ghost (transparent bg, accent text) Default: 'high'. |
| `className` | `string` | No | - | Additional class name. |
| `condensed` | `boolean` | No | - | Condensed mode: reduces height and padding while keeping the same typography. |
| `disabled` | `boolean` | No | - | Whether the button is disabled. |
| `fullWidth` | `boolean` | No | - | Stretch to fill container width — overrides circular shape. |
| `loading` | `boolean` | No | - | Loading state — shows circular progress indicator replacing the text label. Disables interaction while loading. |
| `onClick` | `() => void` | No | - | Web-only alias for onPress. |
| `onPress` | `() => void` | No | - | onPress property |
| `size` | `SingleTextButtonSize` | No | - | Button size. Default: 'm'. S/M/L only (no XS). |
| `style` | `CSSProperties` | No | - | Inline styles. |
| `type` | `'button' | 'submit' | 'reset'` | No | - | HTML button type attribute. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { SingleTextButton } from '@oneui/ui';

<SingleTextButton />
```

### Recipe Decisions

```json
{
  "component": "SingleTextButton",
  "decisions": [
    "Shape"
  ]
}
```
