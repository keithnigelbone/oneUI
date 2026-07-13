# Progress

## Overview

The `Progress` component renders a horizontal progress bar for determinate or indeterminate loading states. It exposes standard progressbar accessibility semantics with optional `aria-label` and `aria-labelledby` for screen reader context.

Native implementation: `Progress.native.tsx` · contract: `interface.ts` · showcase: `Progress.showcase.native.tsx`

## Import

```typescript
import { Progress } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so fill colours remap correctly inside `<Surface>` containers.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `number` | `0` | Current progress value; omit for indeterminate |
| `max` | `number` | `100` | Maximum value |
| `min` | `number` | `0` | Minimum value |
| `size` | `'small' \| 'medium' \| 'large'` | — | Bar height preset |
| `aria-label` | `string` | — | Accessible name for the progressbar |
| `aria-labelledby` | `string` | — | Id reference for labelling |
| `style` | `ViewStyle` | — | Additional container styles |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Default determinate

```tsx
import React from 'react';
import { Progress } from '@oneui/ui-native';

function ProgressDefault() {
  return <Progress value={50} aria-label="Progress at 50%" />;
}
```

### Sizes

```tsx
import React from 'react';
import { Progress } from '@oneui/ui-native';

function ProgressSizes() {
  return (
    <>
      <Progress size="small" value={60} aria-label="Small progress" />
      <Progress size="medium" value={40} aria-label="Medium progress" />
      <Progress size="large" value={80} aria-label="Large progress" />
    </>
  );
}
```

### Indeterminate

Omit `value` (or pass `undefined` / `null`) for a busy/indeterminate bar.

```tsx
import React from 'react';
import { Progress } from '@oneui/ui-native';

function ProgressIndeterminate() {
  return <Progress aria-label="Loading" />;
}
```

### Value range

```tsx
import React from 'react';
import { Progress } from '@oneui/ui-native';

function ProgressValueRange() {
  return (
    <>
      <Progress size="medium" value={0} aria-label="0%" />
      <Progress size="medium" value={25} aria-label="25%" />
      <Progress size="medium" value={50} aria-label="50%" />
      <Progress size="medium" value={75} aria-label="75%" />
      <Progress size="medium" value={100} aria-label="100%" />
    </>
  );
}
```

### Custom min/max

```tsx
import React from 'react';
import { Progress } from '@oneui/ui-native';

function ProgressCustomRange() {
  return <Progress value={3} min={0} max={10} aria-label="Step 3 of 10" />;
}
```

### Surface context

Progress fill colours remap automatically inside `<Surface mode="...">`.

```tsx
import React from 'react';
import { Progress, Surface } from '@oneui/ui-native';

function ProgressOnSurface() {
  return (
    <Surface mode="bold">
      <Progress size="small" value={30} aria-label="30%" />
      <Progress size="medium" value={60} aria-label="60%" />
      <Progress size="large" value={90} aria-label="90%" />
    </Surface>
  );
}
```

## Additional Notes

- **Indeterminate detection** — `value === undefined` or `value === null` sets `accessibilityState.busy = true`.
- **Percentage clamping** — computed percentage is clamped to 0–100.
- **No appearance/variant props** — colour comes from the primary role via surface context.
- **Not `CircularProgressIndicator`** — use `CircularProgressIndicator` for spinner-style loading.
- **Sample app** — open **Progress** in `native-components-sample` to browse `ProgressSizes`, `ProgressIndeterminate`, etc.
- **Web parity** — mirrors the web linear progress primitive.
