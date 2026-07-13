# CircularProgressIndicator

## Overview

The `CircularProgressIndicator` (CPI) displays determinate arc progress or an indeterminate spinner. It supports ten size presets, nine appearance roles, optional centre content (`text` auto-percentage or `icon`), and entry/exit animation. Percentage labels render at size `L` and above per Figma spec.

Native implementation: `CircularProgressIndicator.native.tsx` · contract: `interface.ts` · showcase: `CircularProgressIndicator.showcase.native.tsx`

## Import

```typescript
import { CircularProgressIndicator } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so colour tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `variant` | `'determinate' \| 'indeterminate'` | `'determinate'` | Arc vs spinner |
| `size` | `'2XS' \| 'XS' \| 'S' \| 'M' \| 'L' \| 'XL' \| '2XL' \| '3XL' \| '4XL' \| '5XL'` | `'M'` | T-shirt size (uppercase) |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` → `'primary'` | Ring stroke colour role |
| `content` | `'none' \| 'icon' \| 'text'` | `'none'` | Centre content mode |
| `value` | `number` | — | Progress value (required for determinate; omitted coerces to indeterminate) |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `children` | `ReactNode` | — | Centre icon node when `content="icon"` |
| `animate` | `boolean` | `false` | Enable entry/exit animations |
| `show` | `boolean` | `true` | Controlled visibility when `animate` is true |
| `valueTransitionDuration` | `number` | — | Determinate transition duration in ms (`0` = instant) |
| `style` | `ViewStyle` | — | Outermost wrapper styles |
| `aria-label` | `string` | — | Accessible name |
| `aria-labelledby` | `string` | — | ID of labelling element |
| `aria-describedby` | `string` | — | ID of describing element |
| `aria-live` | `'off' \| 'polite' \| 'assertive'` | — | Live region politeness |
| `aria-hidden` | `boolean` | — | Hide from accessibility tree |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Basic determinate

```tsx
import React from 'react';
import { CircularProgressIndicator } from '@oneui/ui-native';

function BasicProgress() {
  return (
    <CircularProgressIndicator value={25} size="M" aria-label="Task progress" />
  );
}
```

### Determinate vs indeterminate

```tsx
import React from 'react';
import { CircularProgressIndicator } from '@oneui/ui-native';

function ProgressVariants() {
  return (
    <>
      <CircularProgressIndicator
        variant="determinate"
        value={65}
        size="3XL"
        aria-label="Determinate progress"
      />
      <CircularProgressIndicator
        variant="indeterminate"
        size="3XL"
        aria-label="Loading"
      />
    </>
  );
}
```

### Sizes

Ten presets from `'2XS'` through `'5XL'`.

```tsx
import React from 'react';
import { CircularProgressIndicator } from '@oneui/ui-native';

function ProgressSizes() {
  const sizes = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;

  return (
    <>
      {sizes.map((size) => (
        <CircularProgressIndicator
          key={size}
          value={65}
          size={size}
          aria-label={`${size} progress`}
        />
      ))}
    </>
  );
}
```

### Centre text (auto percentage)

Percentage label renders at **`L` and above** only. Below `L`, the ring shows without a label.

```tsx
import React from 'react';
import { CircularProgressIndicator } from '@oneui/ui-native';

function ProgressWithText() {
  return (
    <>
      {/* S/M — ring only */}
      <CircularProgressIndicator value={50} size="M" content="text" aria-label="50 percent" />
      {/* L+ — shows "50%" */}
      <CircularProgressIndicator value={50} size="L" content="text" aria-label="50 percent" />
      <CircularProgressIndicator value={25} size="3XL" content="text" aria-label="25 percent" />
    </>
  );
}
```

### Centre icon

Icons render at every size when `content="icon"` and `children` is provided.

```tsx
import React from 'react';
import { CircularProgressIndicator, Icon } from '@oneui/ui-native';

function ProgressWithIcon() {
  return (
    <CircularProgressIndicator
      value={75}
      size="3XL"
      content="icon"
      aria-label="Download progress"
    >
      <Icon icon="download" aria-hidden />
    </CircularProgressIndicator>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { CircularProgressIndicator } from '@oneui/ui-native';

function ProgressAppearances() {
  return (
    <>
      <CircularProgressIndicator value={65} appearance="primary" size="3XL" aria-label="Primary" />
      <CircularProgressIndicator value={65} appearance="positive" size="3XL" aria-label="Positive" />
      <CircularProgressIndicator value={65} appearance="negative" size="3XL" aria-label="Negative" />
    </>
  );
}
```

### Custom value range

```tsx
import React from 'react';
import { CircularProgressIndicator } from '@oneui/ui-native';

function CustomRange() {
  return (
    <CircularProgressIndicator
      value={3}
      min={0}
      max={10}
      size="XL"
      aria-label="Step 3 of 10"
    />
  );
}
```

### Surface context

```tsx
import React from 'react';
import { CircularProgressIndicator, Surface } from '@oneui/ui-native';

function ProgressOnSurface() {
  return (
    <Surface mode="bold">
      <CircularProgressIndicator value={40} size="3XL" aria-label="Progress on bold surface" />
    </Surface>
  );
}
```

## Additional Notes

- **Size tokens are uppercase** (`'M'`, `'3XL'`) — unlike Button/Badge lowercase sizes.
- **Missing `value` on determinate** coerces to indeterminate (dev warning in `__DEV__`).
- **`content="icon"` requires `children`** — dev warning if omitted.
- **`content="text"` below `L`** shows ring only (Figma gate).
- **Accessibility** — `accessibilityRole="progressbar"`; indeterminate sets `accessibilityState.busy`.
- **Sample app** — open **CircularProgressIndicator** in `native-components-sample` for `CircularProgressIndicatorVariants`, `CircularProgressIndicatorWithContent`, `CircularProgressIndicatorSurfaceContext`, etc.
- **Web parity** — mirrors `packages/ui/src/components/CircularProgressIndicator/CircularProgressIndicator.shared.ts`.
