# SelectableButton Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Toggle button with text label and optional start/end slots for binary selection within groups.
- **Task contexts**: filter-toggle, option-selection, segmented-control, toolbar-toggle
- **Sentiments**: neutral, positive

## Composition Rules

- **Requires**: children (text label) or aria-label
- **Allows**: start/end slots (icon, badge), contained/uncontained mode, condensed mode, fullWidth
- **Forbids**: use for navigation (use Button instead), nested interactive elements

## Variant Logic

- **high attention**: use when selected state needs bold fill emphasis
- **medium attention**: use when selected state with subtle tinted fill
- **low attention**: use when selected state with ghost appearance and accent border

## Relationships and Dependencies

- **Related**: SelectableIconButton, SelectableSingleTextButton, Button, Toggle, ToggleGroup
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: ToggleGroup

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: select, deselect
- **Health**: a11y_violations, adoption_rate

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `appearance` | `SelectableButtonAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. |
| `aria-label` | `string` | No | - | Accessible label for screen readers |
| `attention` | `SelectableButtonAttention` | No | - | Attention level — determines the visual prominence of the SELECTED state. high → bold fill; medium → subtle fill; low → ghost with accent border. The UNSELECTED state is always muted ghost regardless of attention. Default: 'high'. |
| `children` | `ReactNode` | No | - | Text label content |
| `className` | `string` | No | - | Additional class name |
| `condensed` | `boolean` | No | - | Condensed mode: reduces height and horizontal padding while keeping the same typography. Only applies when contained=true. |
| `contained` | `boolean` | No | - | When true (default), renders a pill container with background, border, and padding. When false, renders inline text/icon only — no background, border, or padding. condensed and fullWidth do not apply when contained=false. |
| `defaultSelected` | `boolean` | No | - | Default selected state (uncontrolled). |
| `disabled` | `boolean` | No | - | Whether the button is disabled. |
| `end` | `ReactNode` | No | - | Content to render after the label (icon, etc.) |
| `fullWidth` | `boolean` | No | - | Stretch to fill container width. Only applies when contained=true. |
| `loading` | `boolean` | No | - | Loading state — disables interaction and shows reduced opacity. |
| `onSelectedChange` | `(selected: boolean) => void` | No | - | Called when selected state changes. |
| `selected` | `boolean` | No | - | Selected state (controlled). Maps to Toggle pressed. |
| `size` | `SelectableButtonSize` | No | - | Button size. Default: 'm'. |
| `start` | `ReactNode` | No | - | Content to render before the label (icon, etc.) |
| `style` | `CSSProperties` | No | - | Inline styles |
| `value` | `string` | No | - | Value for use within ToggleGroup. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `start` | Icon |  |
| `end` | Icon |  |

## Code Snippets

### Basic Usage

```tsx
import { SelectableButton } from '@oneui/ui';

<SelectableButton>Option A</SelectableButton>
```

### Controlled

```tsx
<SelectableButton selected={isSelected} onSelectedChange={setIsSelected}>Filter</SelectableButton>
```

### Recipe Decisions

```json
{
  "component": "SelectableButton",
  "decisions": [
    "Shape"
  ]
}
```
