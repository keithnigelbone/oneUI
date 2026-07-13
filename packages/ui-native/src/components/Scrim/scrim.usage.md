# Scrim

## Overview

The `Scrim` component is a decorative background overlay for modals, sheets, scroll fades, and carousel edges. It supports edge gradients (multi-stop SVG fade) or a flat overlay tint. Non-interactive — pair with Modal / Sheet for dismiss and focus management.

Native-only — no web peer.

Native implementation: `Scrim.native.tsx` · contract: `interface.ts` · showcase: `Scrim.showcase.native.tsx`

## Import

```typescript
import { Scrim } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` / `OneUINativeThemeProvider`. Render inside a parent with explicit `width` and `height` — the scrim fills 100% of its parent.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `attention` | `'low' \| 'medium' \| 'high'` | `'medium'` | Fade / overlay strength |
| `size` | `'XS' \| 'S' \| 'M' \| 'L' \| 'XL' \| 'full'` | `'XS'` | Band coverage along the fade axis (10%–80% for edge sizes; `full` = 100%) |
| `position` | `'top' \| 'bottom' \| 'start' \| 'end' \| 'center'` | `'bottom'` | Edge the fade anchors to |
| `variant` | `'gradient' \| 'overlay'` | `'gradient'` | Edge gradient vs flat tint |
| `style` | `ViewStyle` | — | Root container styles |
| `testID` | `string` | — | Test hook |

## Usage Examples

### Bottom sheet fade

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Scrim } from '@oneui/ui-native';

function BottomFade() {
  return (
    <View style={{ height: 200, width: '100%' }}>
      <Scrim position="bottom" size="L" attention="high" />
    </View>
  );
}
```

### Modal overlay

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Scrim } from '@oneui/ui-native';

function ModalScrim() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Scrim variant="overlay" position="center" size="full" attention="medium" />
    </View>
  );
}
```

### Scroll top hint

```tsx
import React from 'react';
import { View } from 'react-native';
import { Scrim } from '@oneui/ui-native';

function TopHint({ height }: { height: number }) {
  return (
    <View style={{ height, width: '100%' }}>
      <Scrim position="top" size="S" attention="low" />
    </View>
  );
}
```

### Carousel leading-edge fade

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Scrim } from '@oneui/ui-native';

function CarouselLeadingFade() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Scrim position="start" size="M" attention="medium" />
    </View>
  );
}
```

### Scrim over image

Position the scrim absolutely over media content.

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image, Scrim } from '@oneui/ui-native';

function ImageWithBottomFade() {
  return (
    <View style={{ width: '100%', aspectRatio: 16 / 9 }}>
      <Image src="https://example.com/photo.jpg" alt="Hero" width="100%" aspectRatio="16:9" />
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Scrim position="bottom" size="XL" attention="high" />
      </View>
    </View>
  );
}
```

### Subtle caption fade

```tsx
import React from 'react';
import { View } from 'react-native';
import { Scrim } from '@oneui/ui-native';

function CaptionFade() {
  return (
    <View style={{ height: 160, width: '100%' }}>
      <Scrim position="bottom" size="XS" attention="low" />
    </View>
  );
}
```

## Additional Notes

- **Parent sizing** — the scrim root is `width`/`height` 100%; the parent must define dimensions (fixed height, `aspectRatio`, or `absoluteFillObject`).
- **Edge gradient vs flat tint** — edge bands (`gradient` + XS–XL + top/bottom/start/end) use a 7-stop fade at 25% / 50% / 95% peak; full-coverage mode (`center`, `size="full"`, or `variant="overlay"`) uses a **uniform** flat color at 17% / 33% / 50% (`low` / `medium` / `high`).
- **Band sizes** — `XS` 10%, `S` 20%, `M` 40%, `L` 60%, `XL` 80% for edge gradient; full-coverage mode always covers 100%.
- **Accessibility** — root is `accessible={false}` with `aria-hidden`; screen readers ignore the scrim. The modal or sheet above must provide modal semantics and an accessible name.
- **Sample app** — open **Scrim** in `native-components-sample` to browse positions, sizes, attention levels, overlay, surface context, and image stacks.
