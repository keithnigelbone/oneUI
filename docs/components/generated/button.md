# Button Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Trigger a single user action with clear emphasis and accessible states.
- **Task contexts**: form-submission, destructive-action, navigation, inline-action
- **Sentiments**: positive, warning, destructive

## Composition Rules

- **Requires**: label or aria-label, interactive button root
- **Allows**: leftIcon, rightIcon, loading spinner
- **Forbids**: table content, image-only content without aria-label

## Variant Logic

- **bold**: use when single primary action per view, high emphasis CTA; pair with secondary action as subtle or ghost
- **subtle**: use when secondary action with visible affordance
- **ghost**: use when low-attention inline action, toolbar-like controls; avoid when primary action in dense workflows

## Relationships and Dependencies

- **Related**: IconButton, ToggleButton
- **Escalates to**: Dialog, ConfirmationDialog
- **Degrades to**: TextLink
- **Groups with**: ButtonGroup, Toolbar

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile, web
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: click, impression, abandonment
- **Health**: adoption_rate, override_frequency, a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `appearance` | `ButtonAppearance` | No | auto | Multi-accent appearance role. 'auto' resolves to 'primary'. |
| `attention` | `ButtonAttention` | No | high | Emphasis level — high (bold fill), medium (subtle/tinted fill), low (ghost, text-only). Drives the visual treatment; the component derives the internal variant + `data-variant` from this. |
| `className` | `string` | No | - | Additional class name |
| `condensed` | `boolean` | No | false | Condensed mode: reduces height and horizontal padding while keeping the same typography. Use for dense layouts, inline actions, and compact UI areas. NOT the same as using a smaller size. Only applies when `contained={true}`. |
| `contained` | `boolean` | No | true | Whether the button renders in its contained form (filled pill with a state-layer wrapper) or its uncontained form (transparent, underlined, text-link style). Mirrors the Figma `Contained` variant property on the Button component set. Props that only make sense for the contained form (`condensed`, `fullWidth`, `decoration`) are ignored when `contained={false}`. |
| `data-testid` | `string` | No | - | Test selector passthrough |
| `decoration` | `DecorationConfig | null` | No | - | Direct decoration config — overrides DecorationContext. Use in Storybook stories or tests where context may not propagate. |
| `disabled` | `boolean` | No | false | disabled property |
| `end` | `SemanticIconName | ReactNode` | No | - | Content after the label. Pass a semantic icon name (string) for automatic color-inheriting icon rendering, or any ReactNode for custom content. |
| `fullWidth` | `boolean` | No | false | Stretch to fill container width. |
| `leftIcon` | `ComponentIconInput | ReactElement` | No | - | leftIcon property |
| `loading` | `boolean` | No | false | loading property |
| `onClick` | `() => void` | No | - | Web-only alias for onPress |
| `onPress` | `() => void` | No | - | onPress property |
| `rightIcon` | `ComponentIconInput | ReactElement` | No | - | rightIcon property |
| `size` | `ButtonSize` | No | 10 | Button size — f-step number or t-shirt alias. |
| `start` | `SemanticIconName | ReactNode` | No | - | Content before the label. Pass a semantic icon name (string) for automatic color-inheriting icon rendering, or any ReactNode for custom content. |
| `style` | `CSSProperties` | No | - | Inline styles |
| `type` | `'button' | 'submit' | 'reset'` | No | - | HTML button type attribute |
| `aria-label` | `string` | No | - | Accessible label override. Button always has a visible text label; for label-less icon buttons use <IconButton>. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `start` | icon, avatar, badge, custom | `iconSizeStart`, `iconGapStart` |
| `end` | icon, chevron, badge, custom | `iconSizeEnd`, `iconGapEnd` |
| `loading` | spinner | `disabledOpacity`, `transitionDuration` |

## Code Snippets

### Basic Usage

```tsx
import { Button } from '@oneui/ui';

<Button>Click me</Button>
```

### Variants

```tsx
<Button variant="bold">Primary</Button>
<Button variant="subtle">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
```

### Recipe Decisions

```json
{
  "component": "Button",
  "decisions": [
    "Shape",
    "Text case",
    "Horizontal padding"
  ]
}
```
