# SelectableIconButton Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Icon-only toggle button for compact binary selection with configurable shape layout.
- **Task contexts**: toolbar-toggle, icon-filter, compact-option-selection, grid-view-toggle
- **Sentiments**: neutral, positive

## Composition Rules

- **Requires**: icon prop, aria-label (required — icon-only)
- **Allows**: condensed mode, 3:2 layout variant, loading state
- **Forbids**: text content (use SelectableButton instead), missing aria-label

## Variant Logic

- **high attention**: use when selected state needs bold fill emphasis
- **medium attention**: use when selected state with subtle tinted fill
- **low attention**: use when selected state with ghost appearance and accent border

## Relationships and Dependencies

- **Related**: SelectableButton, SelectableSingleTextButton, IconButton, Toggle, ToggleGroup
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
| `aria-label` | `string` | Yes | - | Required accessibility label (icon-only buttons must have this) |
| `icon` | `ComponentIconInput | ReactElement` | Yes | - | icon property |
| `appearance` | `SelectableIconButtonAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. |
| `attention` | `SelectableIconButtonAttention` | No | - | Attention level — determines the visual prominence of the SELECTED state. high → bold fill; medium → subtle fill; low → ghost with accent border. The UNSELECTED state is always muted ghost regardless of attention. Default: 'high'. |
| `className` | `string` | No | - | Additional CSS class name |
| `condensed` | `boolean` | No | - | Condensed mode: reduces container size while keeping same icon size |
| `contained` | `boolean` | No | - | When true (default), renders a contained icon button with background, border, and sized container. When false, renders just the icon without container — no background, border, or fixed size. condensed and fullWidth do not apply when contained=false. |
| `data-testid` | `string` | No | - | Test ID for testing |
| `defaultSelected` | `boolean` | No | - | Default selected state (uncontrolled). |
| `disabled` | `boolean` | No | - | Whether the button is disabled. |
| `fullWidth` | `boolean` | No | - | Stretch to fill container width. Only applies when contained=true. |
| `loading` | `boolean` | No | - | Loading state — shows circular progress indicator |
| `onSelectedChange` | `(selected: boolean) => void` | No | - | Called when selected state changes. |
| `selected` | `boolean` | No | - | Selected state (controlled). Maps to Toggle pressed. |
| `shape` | `SelectableIconButtonShape` | No | - | Shape proportion: '1:1' (square, default) or '2:3' (wide rectangle) |
| `size` | `SelectableIconButtonSize` | No | - | Button size — f-step number or t-shirt alias. Default: 10 (M). |
| `style` | `CSSProperties` | No | - | Inline styles |
| `value` | `string` | No | - | Value for use within ToggleGroup. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { SelectableIconButton } from '@oneui/ui';

<SelectableIconButton icon="star" aria-label="Favourite" />
```

### Controlled

```tsx
<SelectableIconButton icon="bookmark" selected={isSaved} onSelectedChange={setIsSaved} aria-label="Save" />
```

### Recipe Decisions

```json
{
  "component": "SelectableIconButton",
  "decisions": [
    "Shape"
  ]
}
```
