# LinkButton Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Inline text-styled button that triggers actions — visually resembles a link but is semantically a button.
- **Task contexts**: inline-action, contextual-action, secondary-action
- **Sentiments**: neutral, positive, negative

## Composition Rules

- **Requires**: label text
- **Allows**: start/end icon slots, loading state
- **Forbids**: use for actual page navigation (use Link instead), icon-only content without label

## Variant Logic

- **bold**: use when prominent inline action, colored text
- **subtle**: use when medium-emphasis inline action with underline
- **ghost**: use when low-emphasis inline action, minimal styling

## Relationships and Dependencies

- **Related**: Button, Link, IconButton
- **Escalates to**: -
- **Degrades to**: Link
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: click
- **Health**: a11y_violations, adoption_rate

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | Yes | - | Button label text |
| `appearance` | `LinkButtonAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. |
| `aria-label` | `string` | No | - | Accessibility label override |
| `attention` | `LinkButtonAttention` | No | - | Figma attention alias — maps to variant (high→bold, medium→subtle, low→ghost). `variant` takes precedence. |
| `className` | `string` | No | - | Additional CSS class name |
| `disabled` | `boolean` | No | - | Disabled state |
| `end` | `ReactNode` | No | - | Content to render after the label (icon or spinner) |
| `loading` | `boolean` | No | - | Loading state — shows spinner |
| `onClick` | `() => void` | No | - | Web-only alias for onPress |
| `onPress` | `() => void` | No | - | Press/click handler |
| `showUnderline` | `boolean` | No | true | Whether the underline is visible. Defaults to `true` (LinkButton's classic text-link behaviour). Set to `false` for uses where the component is a text-style CTA without an underline — e.g. when `<Button contained={false}>` delegates here and the Figma spec marks the underline colour as transparent by default. |
| `size` | `LinkButtonSize` | No | - | Button size — f-step number or t-shirt alias. Default: 10 (M). |
| `start` | `ReactNode` | No | - | Content to render before the label (icon or spinner) |
| `style` | `CSSProperties` | No | - | Inline styles |
| `type` | `'button' | 'submit' | 'reset'` | No | - | HTML button type attribute |
| `variant` | `LinkButtonVariant` | No | - | Visual variant affecting text color and underline |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `start` | icon, custom | `iconSize`, `iconGap` |
| `end` | icon, custom | `iconSize`, `iconGap` |
| `loading` | spinner | `disabledOpacity`, `transitionDuration` |

## Code Snippets

### Basic Usage

```tsx
import { LinkButton } from '@oneui/ui';

<LinkButton onClick={handleAction}>View details</LinkButton>
```

### Variants

```tsx
<LinkButton variant="bold">Bold</LinkButton>
<LinkButton variant="subtle">Subtle</LinkButton>
<LinkButton variant="ghost">Ghost</LinkButton>
```

### Recipe Decisions

```json
{
  "component": "LinkButton",
  "decisions": [
    "Shape",
    "Text case"
  ]
}
```
