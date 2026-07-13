# CircularProgressIndicator Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Circular progress arc. Determinate variant renders an arc proportional to `value`; indeterminate renders a spinning animation. Optional center content (icon or auto percentage). 10 t-shirt sizes. Multi-accent appearance roles.
- **Task contexts**: progress, loading, spinner, circular, indicator
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: 
- **Forbids**: 

## Variant Logic

- **determinate**: use when Determinate
- **indeterminate**: use when Indeterminate

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
| `animate` | `boolean` | No | - | Enable entry + exit animations. Default: false (opt-in). Pair with `show` for controlled visibility. |
| `appearance` | `CircularProgressIndicatorAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. Default: 'secondary'. |
| `aria-label` | `string` | No | - | Accessible label for screen readers |
| `aria-labelledby` | `string` | No | - | ID of element that labels this progress indicator |
| `children` | `ReactNode` | No | - | Children rendered as icon when content='icon' |
| `className` | `string` | No | - | Additional class name |
| `content` | `CircularProgressIndicatorContent` | No | - | Center content: 'none'=empty, 'icon'=render children as icon, 'text'=auto percentage label. Default: 'none'. |
| `data-testid` | `string` | No | - | Optional test hook — forwarded to the root visual container (the ring wrapper). |
| `material` | `CircularProgressIndicatorMaterial` | No | - | Metallic material for the active arc. `'none'` (default) uses the role colour; any metal swaps the arc stroke for the brand metallic gradient. |
| `max` | `number` | No | - | Maximum value. Default: 100. |
| `min` | `number` | No | - | Minimum value. Default: 0. |
| `show` | `boolean` | No | - | Controlled visibility. When `animate` is true, toggling `show` triggers entry or exit. Default: true. |
| `size` | `CircularProgressIndicatorSize` | No | - | Size preset — maps to spacing dimension tokens. Default: 'M'. |
| `style` | `CSSProperties` | No | - | Inline styles |
| `value` | `number` | No | - | Current progress value (determinate only) |
| `variant` | `CircularProgressIndicatorVariant` | No | - | Determinate shows arc proportional to value; indeterminate shows spinning animation. Default: 'determinate'. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { CircularProgressIndicator } from '@oneui/ui';

<CircularProgressIndicator />
```

### Recipe Decisions

```json
{
  "component": "CircularProgressIndicator",
  "decisions": [
    "Center content"
  ]
}
```
