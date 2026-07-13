# Image Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Display an image with aspect ratio presets, loading states, and optional interactive overlay.
- **Task contexts**: content-image, product-photo, thumbnail, hero-banner, gallery-item
- **Sentiments**: neutral

## Composition Rules

- **Requires**: src (required), alt text (required)
- **Allows**: aspect ratio preset, interactive mode with click handler, custom fallback on error
- **Forbids**: decorative images without alt="", interactive mode without aria-label

## Variant Logic

- **static**: use when display-only image content
- **interactive**: use when clickable image with state layer and focus ring

## Relationships and Dependencies

- **Related**: Avatar, Logo
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark

## Observability Hooks

- **Track**: click, impression
- **Health**: a11y_violations, image_load_failure_rate

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `alt` | `string` | Yes | - | Accessible alt text (required) |
| `src` | `string` | Yes | - | Image source URL (required) |
| `aria-label` | `string` | No | - | Accessible label for interactive images |
| `aspectRatio` | `ImageAspectRatio` | No | - | Aspect ratio preset. Default: 'auto' |
| `className` | `string` | No | - | Additional class name |
| `crossOrigin` | `ImageCrossOrigin` | No | - | CORS mode for the image request |
| `decoding` | `ImageDecoding` | No | - | Decode hint for the browser |
| `disabled` | `boolean` | No | - | Reduces opacity. Default: false |
| `draggable` | `boolean` | No | - | Native drag behavior |
| `fallback` | `ReactNode` | No | - | Custom error fallback content (wins over `fallbackSrc`) |
| `fallbackSrc` | `string` | No | - | Fallback image URL when `src` fails and `fallback` is not set |
| `fit` | `ImageObjectFit` | No | - | Figma-aligned alias for `objectFit`. If both `fit` and `objectFit` are set, `fit` wins. |
| `height` | `string | number` | No | - | Container height |
| `interactive` | `boolean` | No | - | When true: state layer overlay + focus ring + clickable. Default: false |
| `loading` | `ImageLoadingStrategy` | No | - | Browser native loading strategy. Default: 'lazy' |
| `lottieAttributes` | `ImageLottieAttributes` | No | - | Optional Lottie/host payload — web: `data-oneui-lottie` JSON on root |
| `objectFit` | `ImageObjectFit` | No | - | CSS object-fit for the image. Default: 'cover' |
| `objectPosition` | `string` | No | - | CSS object-position. Default: 'center' |
| `onClick` | `() => void` | No | - | Web alias for onPress |
| `onError` | `() => void` | No | - | Image error callback |
| `onLoad` | `() => void` | No | - | Image loaded callback |
| `onPress` | `() => void` | No | - | Click handler (interactive only) |
| `sizes` | `string` | No | - | Hint for `srcSet` selection (HTML `sizes`) |
| `srcSet` | `string` | No | - | Responsive image sources (HTML `srcSet`) |
| `style` | `CSSProperties` | No | - | Inline styles |
| `testID` | `string` | No | - | Test id — forwarded as `data-testid` on the web root element. |
| `width` | `string | number` | No | - | Container width |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { Image } from '@oneui/ui';

<Image src="/photo.jpg" alt="Product shot" />
```

### With Aspect Ratio

```tsx
<Image src="/banner.jpg" alt="Hero banner" aspectRatio="16:9" />
```

### Recipe Decisions

```json
{
  "component": "Image",
  "decisions": [
    "Shape"
  ]
}
```
