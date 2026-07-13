# PaginationDots

## Overview

The `PaginationDots` component displays a row of pagination indicators for carousels, onboarding flows, and paginated content. It supports controlled/uncontrolled active index, a sliding window with edge-state dots, optional loop mode, and read-only display. Dots morph between `active` (pill), `regular` (circle), and `edge` (smaller circle) states.

Native implementation: `PaginationDots.native.tsx` · contract: `interface.ts` · showcase: `PaginationDots.showcase.native.tsx`

## Import

```typescript
import { PaginationDots } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so dot colour tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `count` | `number` | — | **Required** — total number of pages/slides |
| `activeIndex` | `number` | — | Controlled active index (0-based) |
| `defaultActiveIndex` | `number` | `0` | Uncontrolled initial active index |
| `onActiveIndexChange` | `(index: number) => void` | — | Fires when the active dot changes |
| `loop` | `boolean` | `false` | Wrap navigation at boundaries |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` → `'primary'` | Dot colour role |
| `readOnly` | `boolean` | `false` | Display-only — dots are not tappable; root uses `progressbar` role |
| `aria-label` | `string` | — | Accessible group name (recommended) |
| `style` | `ViewStyle` | — | Container styles |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Basic pagination

```tsx
import React from 'react';
import { PaginationDots } from '@oneui/ui-native';

function CarouselDots() {
  return (
    <PaginationDots
      count={5}
      defaultActiveIndex={0}
      aria-label="Carousel pagination"
    />
  );
}
```

### Controlled active index

```tsx
import React, { useState } from 'react';
import { PaginationDots } from '@oneui/ui-native';

function ControlledPagination() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <PaginationDots
      count={8}
      activeIndex={activeIndex}
      onActiveIndexChange={setActiveIndex}
      aria-label="Slide pagination"
    />
  );
}
```

### Long sequence (sliding window)

When `count` exceeds the window size (max 5), edge dots shrink to signal more content.

```tsx
import React, { useState } from 'react';
import { PaginationDots } from '@oneui/ui-native';

function LongPagination() {
  const [activeIndex, setActiveIndex] = useState(4);

  return (
    <PaginationDots
      count={12}
      activeIndex={activeIndex}
      onActiveIndexChange={setActiveIndex}
      aria-label="Gallery pagination"
    />
  );
}
```

### Loop mode

```tsx
import React, { useState } from 'react';
import { PaginationDots } from '@oneui/ui-native';

function LoopPagination() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <PaginationDots
      count={10}
      activeIndex={activeIndex}
      onActiveIndexChange={setActiveIndex}
      loop
      aria-label="Infinite carousel"
    />
  );
}
```

### Read-only progress indicator

```tsx
import React from 'react';
import { PaginationDots } from '@oneui/ui-native';

function ReadOnlyProgress() {
  return (
    <PaginationDots
      count={5}
      activeIndex={2}
      readOnly
      aria-label="Step 3 of 5"
    />
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { PaginationDots } from '@oneui/ui-native';

function PaginationAppearances() {
  return (
    <>
      <PaginationDots count={5} appearance="primary" aria-label="Primary dots" />
      <PaginationDots count={5} appearance="secondary" aria-label="Secondary dots" />
    </>
  );
}
```

## Additional Notes

- Active index is clamped to `[0, count - 1]`; out-of-range values log a dev warning.
- Interactive mode uses `accessibilityRole: 'tablist'` on the root; each dot is a `tab`.
- Read-only mode uses `accessibilityRole: 'progressbar'` with `accessibilityValue` min/max/now.
- Figma defines only one size (`M`) — no size prop is exposed.
- Pair with swipe gestures or prev/next buttons in the parent screen for full carousel UX.
- **Sample app** — open **PaginationDots** in `native-components-sample` to browse showcase suites.
