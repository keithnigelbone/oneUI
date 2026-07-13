# Spinner Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Indeterminate three-arc loading indicator. Renders three distinct role-colored arcs (primary + secondary + sparkle) and adapts on colored surfaces via the [data-surface] system.
- **Task contexts**: loading, progress, indeterminate, spinner, busy
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: 
- **Forbids**: 

## Variant Logic

- **default**: use when Default

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
| `className` | `string` | No | - | Additional class name |
| `label` | `string` | No | - | Accessible label announced by screen readers. Default: 'Loading'. The Spinner always renders with role="progressbar" aria-busy="true". |
| `size` | `SpinnerSize` | No | - | Size preset — maps to spacing dimension tokens. Default: 'M' (20px). |
| `style` | `CSSProperties` | No | - | Inline styles |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { Spinner } from '@oneui/ui';

<Spinner />
```
