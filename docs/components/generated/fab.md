# FAB Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Floating Action Button — elevated primary action that lifts above the page. Circular when no label is present; pill-shaped when extended with a label. Supports 3 sizes (small/medium/large), 3 variants (primary/secondary/surface), and optional on-screen fixed positioning.
- **Task contexts**: action, fab, floating, cta, elevated
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: 
- **Forbids**: 

## Variant Logic

- **primary**: use when Primary
- **secondary**: use when Secondary
- **surface**: use when Surface

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
| `icon` | `ComponentIconInput | ReactElement` | Yes | - | Icon to display |
| `aria-label` | `string` | No | - | Accessibility label (required if no label prop) |
| `className` | `string` | No | - | Additional CSS class name |
| `data-testid` | `string` | No | - | Test ID for testing |
| `disabled` | `boolean` | No | - | Disabled state |
| `label` | `ReactNode` | No | - | Optional label text (creates extended FAB) |
| `loading` | `boolean` | No | - | Loading state |
| `onPress` | `() => void` | No | - | Press/click handler |
| `position` | `FABPosition` | No | - | Position on screen (only applies when position="fixed") |
| `size` | `FABSize` | No | - | Size affecting dimensions |
| `style` | `CSSProperties` | No | - | Inline styles (primarily for Storybook positioning) |
| `variant` | `FABVariant` | No | - | Visual variant affecting colors |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { FAB } from '@oneui/ui';

<FAB />
```

### Recipe Decisions

```json
{
  "component": "FAB",
  "decisions": [
    "Shape",
    "Elevation"
  ]
}
```
