# Slider Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Precision range input. Multi-accent appearance, inside/outside knob styles, optional step ticks, and a value tooltip that follows the thumb.
- **Task contexts**: 
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: start, end
- **Forbids**: 

## Variant Logic

- **continuous**: use when Continuous
- **range**: use when Range

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
| `appearance` | `SliderAppearance` | No | - | Multi-accent appearance role. Default 'auto' → 'secondary'. |
| `aria-label` | `string` | No | - | aria-label property |
| `aria-labelledby` | `string` | No | - | aria-labelledby property |
| `ariaLabels` | `string[]` | No | - | Per-thumb aria-label for range sliders (array indexed by thumb). Falls back to `aria-label` when absent. Use this only in range mode; for single-thumb sliders use `aria-label`. |
| `className` | `string` | No | - | className property |
| `defaultValue` | `number | number[]` | No | - | Default value (uncontrolled). |
| `disabled` | `boolean` | No | - | disabled property |
| `end` | `ReactNode` | No | - | Node rendered at the end of the slider (e.g. an IconButton). 30×30 slot per Figma. |
| `form` | `string` | No | - | form property |
| `formatValue` | `(value: number, index: number) => string` | No | - | Formatter for tooltip value. |
| `knobStyle` | `SliderKnobStyle` | No | - | Knob placement style. Default 'outside'. |
| `largeStep` | `number` | No | - | largeStep property |
| `max` | `number` | No | - | max property |
| `min` | `number` | No | - | min property |
| `minStepsBetweenValues` | `number` | No | - | minStepsBetweenValues property |
| `name` | `string` | No | - | name property |
| `onValueChange` | `(value: number | number[]) => void` | No | - | Called as the user drags. |
| `onValueCommitted` | `(value: number | number[]) => void` | No | - | Called when the user releases / commits the value. |
| `orientation` | `SliderOrientation` | No | - | Orientation. Default 'horizontal'. |
| `readOnly` | `boolean` | No | - | readOnly property |
| `showSteps` | `boolean` | No | - | Render tick marks at every step. |
| `showTooltip` | `SliderTooltipMode` | No | - | Tooltip visibility. Default 'auto' (drag + focus). |
| `snapToSteps` | `boolean` | No | - | When true (default), the thumb snaps to exact step positions. When false, dragging is continuous but tick marks still appear at step positions. |
| `start` | `ReactNode` | No | - | Node rendered at the start of the slider (e.g. an IconButton). 30×30 slot per Figma. |
| `step` | `number` | No | - | step property |
| `stepLabels` | `ReactNode[]` | No | - | Optional labels under step marks. |
| `style` | `CSSProperties` | No | - | style property |
| `value` | `number | number[]` | No | - | Current value (controlled). Number for single thumb, array for range. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `start` |  |  |
| `end` |  |  |

## Code Snippets

### Basic Usage

```tsx
import { Slider } from '@oneui/ui';

<Slider />
```

### Recipe Decisions

```json
{
  "component": "Slider",
  "decisions": [
    "Shape"
  ]
}
```
