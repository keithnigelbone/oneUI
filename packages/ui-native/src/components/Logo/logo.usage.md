# Logo

## Overview

The `Logo` component displays brand marks from `children`, inline SVG (`svgContent`), or a remote/local image (`src`). It supports mark/full variants, t-shirt sizes, custom pixel dimensions, optional interactivity, and fallback content when sources fail.

Native implementation: `Logo.native.tsx` · contract: `interface.ts` · showcase: `Logo.showcase.native.tsx`

## Import

```typescript
import { Logo } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so surface tokens resolve correctly for fallback content.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `variant` | `'mark' \| 'full'` | `'mark'` | Logo variant |
| `size` | `'xs' \| 's' \| 'm' \| 'l' \| 'xl' \| 'custom' \| 'XS' \| 'S' \| 'M' \| 'L' \| 'XL' \| 'CUSTOM'` | `'m'` | Size token; Figma uppercase aliases canonicalise to lowercase |
| `customSize` | `number` | — | Positive pixel dimension when `size="custom"` |
| `children` | `ReactNode` | — | Custom JSX content (highest priority) |
| `src` | `string` | — | Image URL |
| `svgContent` | `string` | — | Inline SVG markup string |
| `alt` | `string` | — | Accessible name; empty/whitespace hides decorative logos from screen readers (required) |
| `onLoad` | `() => void` | — | Load callback |
| `onError` | `() => void` | — | Error callback |
| `fallback` | `ReactNode` | — | Custom fallback when content fails or is empty |
| `interactive` | `boolean` | `false` | Tappable when true (requires `onPress`/`onClick` and meaningful `alt`) |
| `disabled` | `boolean` | `false` | Disables press handling and reduces opacity |
| `onPress` | `() => void` | — | Press handler when `interactive` is true |
| `onClick` | `() => void` | — | Web alias for `onPress` |
| `style` | `ViewStyle` | — | Additional container styles |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Default logo

```tsx
import React from 'react';
import { Logo } from '@oneui/ui-native';

const SAMPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>';

function LogoDefault() {
  return <Logo size="m" svgContent={SAMPLE_SVG} alt="Brand Logo" />;
}
```

### Sizes

```tsx
import React from 'react';
import { Logo } from '@oneui/ui-native';

function LogoSizes() {
  return (
    <>
      {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
        <Logo key={size} size={size} svgContent={SAMPLE_SVG} alt="Brand Logo" />
      ))}
      <Logo size="custom" customSize={48} svgContent={SAMPLE_SVG} alt="Brand Logo" />
    </>
  );
}
```

### Variants

```tsx
import React from 'react';
import { Logo } from '@oneui/ui-native';

function LogoVariants() {
  return (
    <>
      <Logo variant="mark" size="xl" svgContent={SAMPLE_SVG} alt="Mark variant" />
      <Logo variant="full" size="xl" svgContent={SAMPLE_SVG} alt="Full variant" />
    </>
  );
}
```

### Content sources

Priority: `children` → `svgContent` → `src` → empty.

```tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Logo } from '@oneui/ui-native';

function LogoContentSources() {
  return (
    <>
      <Logo alt="SVG Content" size="xl" svgContent={SAMPLE_SVG} />
      <Logo alt="External Image" size="xl" src="https://example.com/logo.png" />
      <Logo alt="Custom JSX" size="xl">
        <Svg width="100%" height="100%" viewBox="0 0 24 24">
          <Path d="M12 2L2 7l10 5 10-5-10-5z" />
        </Svg>
      </Logo>
    </>
  );
}
```

### Interactive logo

Requires meaningful `alt` and a press handler.

```tsx
import React from 'react';
import { Logo } from '@oneui/ui-native';

function LogoInteractive() {
  return (
    <Logo
      size="m"
      variant="mark"
      svgContent={SAMPLE_SVG}
      alt="Jio — go home"
      interactive
      onPress={() => console.log('navigate home')}
      accessibilityHint="Navigates to home"
    />
  );
}
```

### Fallback

```tsx
import React from 'react';
import { Text } from 'react-native';
import { Logo } from '@oneui/ui-native';

function LogoFallback() {
  return (
    <Logo
      alt="With Fallback"
      size="xl"
      src="https://invalid.example/broken.png"
      fallback={<Text>?</Text>}
    />
  );
}
```

### Decorative logo

Empty `alt` hides the logo from assistive tech.

```tsx
import React from 'react';
import { Logo } from '@oneui/ui-native';

function LogoDecorative() {
  return <Logo size="m" svgContent={SAMPLE_SVG} alt="" />;
}
```

### Surface context

```tsx
import React from 'react';
import { Logo, Surface } from '@oneui/ui-native';

function LogoOnSurface() {
  return (
    <Surface mode="bold">
      <Logo size="l" svgContent={SAMPLE_SVG} alt="Brand Logo" />
      <Logo size="xl" svgContent={SAMPLE_SVG} alt="Brand Logo" />
    </Surface>
  );
}
```

## Additional Notes

- **`alt` is required** — pass `""` for decorative logos hidden from screen readers.
- **Content priority** — `children` wins over `svgContent` over `src`.
- **`interactive` guardrails** — dev warnings when `interactive={true}` lacks a handler or meaningful `alt`.
- **Figma size aliases** — `'XS'` / `'XL'` / `'CUSTOM'` canonicalise to lowercase at runtime.
- **No JDS `logoType` prop** — use `variant="mark" | "full"` and content props instead.
- **Sample app** — open **Logo** in `native-components-sample` to browse `LogoSizes`, `LogoSurfaceContext`, etc.
- **Web parity** — mirrors `packages/ui/src/components/Logo/Logo.shared.ts`.
