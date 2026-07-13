# Avatar Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Display a user or entity representation as image, icon, or text initials.
- **Task contexts**: user-profile, contact-list, comment-attribution, navigation-header
- **Sentiments**: neutral, positive

## Composition Rules

- **Requires**: alt text for accessibility
- **Allows**: image src, icon element, text initials via alt
- **Forbids**: interactive content within avatar

## Variant Logic

- **image**: use when user has a profile photo
- **icon**: use when generic entity or placeholder representation
- **text**: use when no image available, display initials

## Relationships and Dependencies

- **Related**: IconContained, Image
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: impression
- **Health**: a11y_violations, image_load_failure_rate

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `alt` | `string` | No | - | Alt text / name used for accessibility and initials extraction |
| `appearance` | `AvatarAppearance` | No | - | Multi-accent appearance role. 'auto' resolves to 'primary'. |
| `attention` | `AvatarAttention` | No | - | Attention level — High (filled), Medium (tinted), Low (transparent). Default: 'high' |
| `className` | `string` | No | - | Additional class name |
| `content` | `AvatarContent` | No | - | Display content: image, icon, or text (initials). Aligns with Figma property `content`. |
| `customSize` | `number` | No | - | Custom size in pixels (only when size='custom') |
| `data-testid` | `string` | No | - | Test automation id — forwarded to the root element. |
| `disabled` | `boolean` | No | - | Disabled state |
| `fallback` | `ReactNode` | No | - | Custom fallback content when image fails or for icon/text content |
| `icon` | `ReactNode` | No | - | Icon element (when content is icon) |
| `onClick` | `() => void` | No | - | Web alias for `onPress`. |
| `onPress` | `() => void` | No | - | Click handler — when set, the avatar renders as an interactive Base UI button. |
| `size` | `AvatarSize` | No | - | Size preset. Default: 'm' |
| `src` | `string` | No | - | Image source URL (when content is image) |
| `style` | `CSSProperties` | No | - | Inline styles |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { Avatar } from '@oneui/ui';

<Avatar src="/photo.jpg" alt="Jane Doe" />
```

### Text Initials

```tsx
<Avatar content="text" alt="Jane Doe" />
```

### Recipe Decisions

```json
{
  "component": "Avatar",
  "decisions": [
    "Shape"
  ]
}
```
