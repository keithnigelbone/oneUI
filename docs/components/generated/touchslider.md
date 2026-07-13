# TouchSlider Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Chunky fingertip-friendly slider. The track is the tap target; the fill represents the value. Ideal for touch devices, TV remotes, and large-target contexts.
- **Task contexts**: 
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: start
- **Forbids**: 

## Variant Logic

- **rounded**: use when Rounded
- **sharp**: use when Sharp

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
| `appearance` | `TouchSliderAppearance` | No | - | appearance property |
| `aria-label` | `string` | No | - | aria-label property |
| `aria-labelledby` | `string` | No | - | aria-labelledby property |
| `className` | `string` | No | - | className property |
| `defaultValue` | `number | number[]` | No | - | defaultValue property |
| `disabled` | `boolean` | No | - | disabled property |
| `form` | `string` | No | - | form property |
| `largeStep` | `number` | No | - | largeStep property |
| `max` | `number` | No | - | max property |
| `min` | `number` | No | - | min property |
| `name` | `string` | No | - | name property |
| `onValueChange` | `(value: number | number[]) => void` | No | - | onValueChange property |
| `onValueCommitted` | `(value: number | number[]) => void` | No | - | onValueCommitted property |
| `orientation` | `TouchSliderOrientation` | No | - | orientation property |
| `progressStyle` | `TouchSliderProgressStyle` | No | - | progressStyle property |
| `readOnly` | `boolean` | No | - | readOnly property |
| `start` | `ReactNode` | No | - | Optional node rendered before the track (e.g. an icon). 30×30 slot. |
| `step` | `number` | No | - | step property |
| `style` | `CSSProperties` | No | - | style property |
| `value` | `number | number[]` | No | - | value property |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `start` |  |  |

## Code Snippets

### Basic Usage

```tsx
import { TouchSlider } from '@oneui/ui';

<TouchSlider />
```

### Recipe Decisions

```json
{
  "component": "TouchSlider",
  "decisions": [
    "Shape"
  ]
}
```
