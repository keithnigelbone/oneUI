# SelectableSingleTextButton Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Text-only toggle button for binary selection — no start/end slots, simpler than SelectableButton.
- **Task contexts**: text-filter-toggle, segmented-text-control, simple-option-selection
- **Sentiments**: neutral, positive

## Composition Rules

- **Requires**: children (text label — required)
- **Allows**: condensed mode, fullWidth, loading state
- **Forbids**: icon slots (use SelectableButton instead), missing text content

## Variant Logic

- **high attention**: use when selected state needs bold fill emphasis
- **medium attention**: use when selected state with subtle tinted fill
- **low attention**: use when selected state with ghost appearance and accent border

## Relationships and Dependencies

- **Related**: SelectableButton, SelectableIconButton, Toggle, ToggleGroup
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
| `children` | `ReactNode` | Yes | - | Text label content — max 2 characters (e.g. "Ag", "En", "A", "12"). This component renders as a circular button; longer text breaks the shape. Text exceeding 2 characters will be truncated in development with a warning. |
| `appearance` | `SelectableSingleTextButtonAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. |
| `aria-label` | `string` | No | - | Accessible label for screen readers (optional — children text is visible) |
| `attention` | `SelectableSingleTextButtonAttention` | No | - | Attention level — determines the visual prominence of the SELECTED state. high → bold fill; medium → subtle fill; low → ghost with accent border. The UNSELECTED state is always muted ghost regardless of attention. Default: 'high'. |
| `className` | `string` | No | - | Additional class name |
| `condensed` | `boolean` | No | - | Condensed mode: reduces height and horizontal padding while keeping the same typography. |
| `data-testid` | `string` | No | - | QA / e2e anchor on the root toggle element |
| `defaultSelected` | `boolean` | No | - | Default selected state (uncontrolled). |
| `disabled` | `boolean` | No | - | Whether the button is disabled. |
| `fullWidth` | `boolean` | No | - | Stretch to fill container width. |
| `loading` | `boolean` | No | - | Loading state — shows circular progress indicator replacing the text label. Disables interaction while loading. |
| `onSelectedChange` | `(selected: boolean) => void` | No | - | Called when selected state changes. |
| `selected` | `boolean` | No | - | Selected state (controlled). Maps to Toggle pressed. |
| `size` | `SelectableSingleTextButtonSize` | No | - | Button size. Default: 'm'. S/M/L only (no XS). |
| `style` | `CSSProperties` | No | - | Inline styles |
| `value` | `string` | No | - | Value for use within ToggleGroup. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { SelectableSingleTextButton } from '@oneui/ui';

<SelectableSingleTextButton>Option</SelectableSingleTextButton>
```

### Controlled

```tsx
<SelectableSingleTextButton selected={isActive} onSelectedChange={setIsActive}>Active</SelectableSingleTextButton>
```

### Recipe Decisions

```json
{
  "component": "SelectableSingleTextButton",
  "decisions": [
    "Shape"
  ]
}
```
