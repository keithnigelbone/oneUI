# Text Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Inline / block text. Six typography roles with role-specific size scales, canonical multi-accent appearance, attention levels, italic / underline / strikethrough, latin / multi-script font fallback, and line-clamp truncation. Defaults to `span`; set `as` for headings or anchors. When using the `text` prop with the `link` slot, avoid `aria-hidden` on the root unless the link is decorative — the slot remains focusable.
- **Task contexts**: 
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: link
- **Forbids**: 

## Variant Logic

- **display**: use when Display
- **headline**: use when Headline
- **title**: use when Title
- **body**: use when Body
- **label**: use when Label
- **code**: use when Code

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
| `appearance` | `TextAppearance` | No | - | appearance property |
| `aria-hidden` | `boolean` | No | - | aria-hidden property |
| `aria-label` | `string` | No | - | aria-label property |
| `as` | `ElementType` | No | - | as property |
| `attention` | `TextAttention` | No | - | attention property |
| `children` | `ReactNode` | No | - | children property |
| `className` | `string` | No | - | className property |
| `href` | `string` | No | - | When `as="a"`, passed through to the anchor element. |
| `id` | `string` | No | - | Stable document id — for `aria-labelledby` / skip-link targets on headings. |
| `italic` | `boolean` | No | - | italic property |
| `lang` | `string` | No | - | BCP 47 language tag. Also enables matching `:lang(...)` script context. |
| `language` | `TextLanguage` | No | - | language property |
| `link` | `ReactNode` | No | - | link property |
| `maxLines` | `number` | No | - | maxLines property |
| `rel` | `string` | No | - | rel property |
| `script` | `TextScript` | No | - | Explicit script override when language inference is insufficient. |
| `scriptMode` | `TextScriptMode` | No | - | `ui` uses compact UI fonts; `reading` switches to reading fonts + roomier line-height. |
| `size` | `TextSizeBody` | No | - | size property |
| `strikethrough` | `boolean` | No | - | strikethrough property |
| `style` | `CSSProperties` | No | - | style property |
| `tabIndex` | `number` | No | - | Native tab order override when the text node must participate in focus management. |
| `target` | `string` | No | - | target property |
| `text` | `string` | No | - | text property |
| `textAlign` | `TextAlign` | No | - | textAlign property |
| `underline` | `boolean` | No | - | underline property |
| `variant` | `'body'` | No | - | variant property |
| `weight` | `TextWeight` | No | - | weight property |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `link` |  |  |

## Code Snippets

### Basic Usage

```tsx
import { Text } from '@oneui/ui';

<Text />
```
