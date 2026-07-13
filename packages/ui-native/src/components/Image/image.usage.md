# Image

## Overview

The `Image` component displays remote or local images with aspect-ratio presets, resize modes, optional interactivity, and fallback handling. It mirrors the portable subset of the web `Image` API — web-only props (`srcSet`, `sizes`, `crossOrigin`, `lottieAttributes`) are intentionally not surfaced on native.

Native implementation: `Image.native.tsx` · contract: `interface.ts` · showcase: `Image.showcase.native.tsx`

## Import

```typescript
import { Image } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so surface tokens resolve correctly when using custom fallback content.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `src` | `string` | — | Image source URL (required) |
| `alt` | `string` | — | Accessible alt text; used as `accessibilityLabel` (required) |
| `aspectRatio` | `'auto' \| '1:1' \| '1:2' \| '2:1' \| '2:3' \| '3:2' \| '3:4' \| '4:3' \| '9:16' \| '16:9' \| '9:21' \| '21:9'` | `'auto'` | Aspect ratio preset |
| `interactive` | `boolean` | `false` | When true: state-layer overlay + tappable wrapper |
| `disabled` | `boolean` | `false` | Reduces opacity |
| `fit` | `'cover' \| 'contain' \| 'container' \| 'fill' \| 'none'` | — | Figma-aligned alias for `objectFit`; wins when both are set. Figma's `container` maps to `contain` |
| `objectFit` | `'cover' \| 'contain' \| 'fill' \| 'none'` | `'cover'` | Resize mode for the inner image |
| `objectPosition` | `string` | — | Accepted for API symmetry; currently a no-op on native |
| `loading` | `'auto' \| 'lazy' \| 'eager'` | — | Browser loading strategy; no-op on native (RN images are eager) |
| `width` | `string \| number` | — | Container width — number = px, string = percentage |
| `height` | `string \| number` | — | Container height |
| `onPress` | `() => void` | — | Press handler (interactive only) |
| `onClick` | `() => void` | — | Web alias for `onPress` — both fire when set |
| `onLoad` | `() => void` | — | Image-loaded callback |
| `onError` | `() => void` | — | Image-error callback |
| `fallback` | `ReactNode` | — | Custom error fallback (wins over `fallbackSrc`) |
| `fallbackSrc` | `string` | — | Fallback image URL when `src` fails and no `fallback` is provided |
| `style` | `ViewStyle` | — | Inline styles on the outer container |
| `aria-label` | `string` | — | Override accessible name (defaults to `alt`) |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Default image

```tsx
import React from 'react';
import { Image } from '@oneui/ui-native';

function ImageDefault() {
  return (
    <Image
      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop"
      alt="Mountain landscape"
      aspectRatio="16:9"
      width={320}
    />
  );
}
```

### Aspect ratios

```tsx
import React from 'react';
import { Image } from '@oneui/ui-native';

function ImageAspectRatios() {
  return (
    <>
      <Image src="https://example.com/photo.jpg" alt="Square" aspectRatio="1:1" width={120} />
      <Image src="https://example.com/photo.jpg" alt="Wide" aspectRatio="16:9" width={200} />
      <Image src="https://example.com/photo.jpg" alt="Portrait" aspectRatio="9:16" width={100} />
    </>
  );
}
```

### Object fit modes

Native supports four canonical modes: `cover`, `contain`, `fill`, `none`.

```tsx
import React from 'react';
import { Image } from '@oneui/ui-native';

function ImageObjectFit() {
  return (
    <>
      <Image src="https://example.com/portrait.jpg" alt="Cover" aspectRatio="1:1" width={150} objectFit="cover" />
      <Image src="https://example.com/portrait.jpg" alt="Contain" aspectRatio="1:1" width={150} objectFit="contain" />
    </>
  );
}
```

### Interactive image

Set `interactive` and provide `onPress` (or `onClick`) for a tappable image with `accessibilityRole="button"`.

```tsx
import React from 'react';
import { Image } from '@oneui/ui-native';

function ImageInteractive() {
  return (
    <Image
      src="https://example.com/photo.jpg"
      alt="Clickable image"
      aspectRatio="16:9"
      width={320}
      interactive
      onPress={() => console.log('pressed')}
    />
  );
}
```

### Fallback handling

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Image } from '@oneui/ui-native';

function ImageFallback() {
  return (
    <>
      <Image
        src="https://invalid.example/broken.png"
        alt="Default fallback"
        aspectRatio="16:9"
        width={200}
      />
      <Image
        src="https://invalid.example/broken.png"
        alt="Custom fallback"
        aspectRatio="16:9"
        width={200}
        fallback={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>No image</Text>
          </View>
        }
      />
      <Image
        src="https://invalid.example/broken.png"
        alt="URL fallback"
        aspectRatio="16:9"
        width={200}
        fallbackSrc="https://example.com/placeholder.jpg"
      />
    </>
  );
}
```

### Responsive width

```tsx
import React from 'react';
import { Image } from '@oneui/ui-native';

function ImageResponsive() {
  return (
    <Image
      src="https://example.com/photo.jpg"
      alt="Full width"
      aspectRatio="16:9"
      width="100%"
    />
  );
}
```

### Corner radius

Pass `borderRadius` via `style` on the outer wrapper.

```tsx
import React from 'react';
import { Image } from '@oneui/ui-native';
import { tokens } from '@oneui/tokens';

function ImageRounded() {
  return (
    <Image
      src="https://example.com/photo.jpg"
      alt="Rounded"
      aspectRatio="1:1"
      width={120}
      style={{ borderRadius: tokens.shape['3'] }}
    />
  );
}
```

## Additional Notes

- **`fit` vs `objectFit`** — when both are set, `fit` wins (matches web precedence).
- **`onPress` + `onClick`** — aliases; when both are provided, both run (`onPress` first).
- **`interactive` without handler** — renders with `accessibilityRole="image"`, not `button`.
- **`loading`** — no-op on native; RN images load eagerly.
- **Extended CSS object-fit keywords** (`scale-down`, `inherit`, etc.) are web-only.
- **Sample app** — open **Image** in `native-components-sample` to browse `ImageAspectRatios`, `ImageStates`, `ImageWithFallback`, etc.
- **Web parity** — see `docs/parity/image-web-native-parity.md` for platform differences.
