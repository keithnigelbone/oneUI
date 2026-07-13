# Spinner

## Overview

The `Spinner` component is an indeterminate loading indicator — a rotating arc ring. It supports ten uppercase t-shirt sizes and an optional accessibility label. Used standalone, inside `Button`/`IconButton` loading states, or on any surface awaiting async content.

Native implementation: `Spinner.native.tsx` · contract: `interface.ts` · showcase: `Spinner.showcase.native.tsx`

## Import

```typescript
import { Spinner } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so stroke colour tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `size` | `'2XS' \| 'XS' \| 'S' \| 'M' \| 'L' \| 'XL' \| '2XL' \| '3XL' \| '4XL' \| '5XL'` | `'M'` | Ring diameter |
| `label` | `string` | — | Accessibility label announced via live region |
| `style` | `ViewStyle` | — | Additional container styles |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Default spinner

```tsx
import React from 'react';
import { Spinner } from '@oneui/ui-native';

function Loading() {
  return <Spinner />;
}
```

### With accessibility label

```tsx
import React from 'react';
import { Spinner } from '@oneui/ui-native';

function AccessibleSpinner() {
  return <Spinner label="Loading content" />;
}
```

### Sizes

```tsx
import React from 'react';
import { Spinner } from '@oneui/ui-native';

function SpinnerSizes() {
  const sizes = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;

  return (
    <>
      {sizes.map((size) => (
        <Spinner key={size} size={size} />
      ))}
    </>
  );
}
```

### Inline with content

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Spinner } from '@oneui/ui-native';

function LoadingRow() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Spinner size="S" label="Loading" />
      <Text>Please wait…</Text>
    </View>
  );
}
```

### On a tinted surface

```tsx
import React from 'react';
import { Spinner, Surface } from '@oneui/ui-native';

function SpinnerOnSurface() {
  return (
    <>
      <Spinner size="M" />
      <Surface mode="subtle">
        <Spinner size="M" />
      </Surface>
      <Surface mode="bold">
        <Spinner size="XL" />
      </Surface>
    </>
  );
}
```

## Additional Notes

- Indeterminate only — no `value` prop. For determinate progress use `Progress` or `CircularProgressIndicator`.
- Sizes use **uppercase** tokens (`'2XS'`–`'5XL'`), unlike most other components.
- `accessibilityRole` is `'progressbar'` with `accessibilityState: { busy: true }`.
- `accessibilityLiveRegion` is `'polite'` — label updates are announced.
- The rotating ring SVG is `aria-hidden`; the root carries the a11y semantics.
- `Button` and `IconButton` embed a spinner automatically when `loading={true}`.
- **Sample app** — open **Spinner** in `native-components-sample` to browse showcase suites.
