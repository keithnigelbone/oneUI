# Tooltip Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Floating hover / focus label that attaches to a trigger element. Supports the Figma position alias (top/topStart/topEnd/...), Base UI side+align, controlled/uncontrolled open state, arrow, portal, and configurable delay.
- **Task contexts**: tooltip, hint, popup, hover, overlay
- **Sentiments**: neutral

## Composition Rules

- **Requires**: children, content
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
| `children` | `ReactNode` | Yes | - | The trigger element the tooltip attaches to |
| `content` | `ReactNode` | Yes | - | Text or content displayed inside the tooltip |
| `align` | `TooltipAlign` | No | - | Alignment along the side axis |
| `arrow` | `boolean` | No | - | Whether to show the arrow/tip pointing to the trigger |
| `closeDelay` | `number` | No | - | Delay before hiding (ms) |
| `defaultOpen` | `boolean` | No | - | Default open state (uncontrolled) |
| `delay` | `number` | No | - | Delay before showing (ms) |
| `disabled` | `boolean` | No | - | Whether tooltip is disabled |
| `hoverable` | `boolean` | No | - | Whether the tooltip contents can be hovered without closing |
| `maxWidth` | `number | string` | No | - | Maximum width of the tooltip; when set, copy wraps inside that width (default popup is single-line nowrap). |
| `onOpenChange` | `(open: boolean) => void` | No | - | Called when the tooltip opens or closes |
| `open` | `boolean` | No | - | Whether the tooltip is open (controlled) |
| `portal` | `boolean` | No | - | Reserved for API compatibility. The popup always uses Base UI’s default `Tooltip.Portal` target (`document.body`). Custom portal containers were removed because they reliably clip inside overflow/transform ancestors. |
| `position` | `TooltipPosition` | No | - | Convenience position prop matching Figma API. Maps to side+align internally. If both `position` and `side` are provided, `side`/`align` take precedence. |
| `side` | `TooltipSide` | No | - | Which side of the trigger to position against |
| `sideOffset` | `number` | No | - | Distance from the trigger in pixels |
| `subtle` | `boolean` | No | - | Force subtle motion (Motion Foundations a11y level): faster Subtle durations/easings and opacity-only animation — no transform/translate. Use this to preview reduced motion without changing OS settings. `prefers-reduced-motion: reduce` triggers the same path automatically. |
| `trigger` | `TooltipTrigger` | No | - | How the tooltip is triggered |
| `zIndex` | `number` | No | - | Custom z-index for the tooltip |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `children` |  |  |
| `content` | Text, Icon |  |

## Code Snippets

### Basic Usage

```tsx
import { Tooltip } from '@oneui/ui';

<Tooltip />
```

### Recipe Decisions

```json
{
  "component": "Tooltip",
  "decisions": [
    "Shape",
    "Padding density"
  ]
}
```
