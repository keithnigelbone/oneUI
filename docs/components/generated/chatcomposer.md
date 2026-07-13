# ChatComposer Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Controlled prompt composer with autosizing textarea, optional action slots, display-only model label, and suggestion actions. Enter submits; Shift+Enter inserts a newline.
- **Task contexts**: chat, composer, prompt, textarea, agent
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: leading, leadingInline, trailing
- **Forbids**: 

## Variant Logic

- **default**: use when Default
- **suggestions**: use when Suggestions
- **actions**: use when Action Bar
- **disabled**: use when Disabled

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
| `onChange` | `(next: string) => void` | Yes | - | Fired on every keystroke. |
| `onSubmit` | `(value: string) => void` | Yes | - | Fired when the user submits (Enter without Shift, or send button). |
| `value` | `string` | Yes | - | Controlled textarea value. |
| `autoFocus` | `boolean` | No | - | Autofocus on mount. |
| `className` | `string` | No | - | Additional className for the outer wrapper. |
| `data-testid` | `string` | No | - | Test id for the outer wrapper. |
| `disabled` | `boolean` | No | - | Disables the textarea and the send button. Use for streaming states. |
| `leading` | `ReactNode` | No | - | Leading slot — rendered left-most in the action bar below the textarea. Typical content: a "+" attach button. |
| `leadingInline` | `ReactNode` | No | - | Inline leading content — rendered immediately left of the model chip. Typical content: a mode picker or attachment chip. |
| `maxRows` | `number` | No | - | Max rows before the textarea starts scrolling internally. Default 6. |
| `minRows` | `number` | No | - | Minimum rows — start compact, grow on input. Default 1. |
| `modelLabel` | `string` | No | - | Optional model chip text (display-only). Example: "Opus 4.6". When omitted, nothing is rendered — consumers that don't want a model picker simply pass nothing. |
| `placeholder` | `string` | No | - | Placeholder for the textarea. |
| `suggestions` | `SuggestionChip[]` | No | - | Optional suggestion chips rendered as a horizontal list below the input. When empty or undefined, nothing is rendered. |
| `trailing` | `ReactNode` | No | - | Trailing slot — rendered right-most in the action bar (after the model chip). Typical content: mic + send buttons. |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `leading` | Button, IconButton | `actionGap` |
| `leadingInline` | Button, Chip, custom | `actionGap` |
| `trailing` | Button, IconButton | `actionGap` |

## Code Snippets

### Basic Usage

```tsx
import { ChatComposer } from '@oneui/ui';

<ChatComposer />
```

### Recipe Decisions

```json
{
  "component": "ChatComposer",
  "decisions": []
}
```
