# IndicatorBadge

## Overview

The `IndicatorBadge` component renders a small coloured dot for status indication (new content, active state, unread). It has no text content — only size and appearance vary. Commonly composed as a `Badge` slot or overlaid on avatars and icons.

Native implementation: `IndicatorBadge.native.tsx` · contract: `interface.ts` · showcase: `IndicatorBadge.showcase.native.tsx`

## Import

```typescript
import { IndicatorBadge } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so appearance tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `size` | `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` | `'m'` | Dot diameter |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` → slot parent or `'primary'` | Colour role |
| `style` | `ViewStyle` | — | Additional styles |
| `aria-label` | `string` | — | Accessible status description (e.g. `"New"`, `"Online"`) |
| `testID` | `string` | — | Test identifier |
| `accessibilityHint` | `string` | — | React Native accessibility hint |

## Usage Examples

### Basic indicator

```tsx
import React from 'react';
import { IndicatorBadge } from '@oneui/ui-native';

function NewIndicator() {
  return <IndicatorBadge aria-label="New" size="m" />;
}
```

### Sizes

```tsx
import React from 'react';
import { IndicatorBadge } from '@oneui/ui-native';

function IndicatorSizes() {
  return (
    <>
      {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
        <IndicatorBadge key={size} size={size} aria-label={`Status ${size}`} />
      ))}
    </>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { IndicatorBadge } from '@oneui/ui-native';

function IndicatorAppearances() {
  return (
    <>
      <IndicatorBadge appearance="primary" aria-label="Primary status" />
      <IndicatorBadge appearance="positive" aria-label="Online" />
      <IndicatorBadge appearance="negative" aria-label="Error" />
      <IndicatorBadge appearance="warning" aria-label="Warning" />
    </>
  );
}
```

### Inside a Badge slot

```tsx
import React from 'react';
import { Avatar, Badge, IndicatorBadge } from '@oneui/ui-native';

function AvatarWithIndicator() {
  return (
    <Badge
      attention="high"
      end={<IndicatorBadge appearance="positive" aria-label="Online" />}
      aria-label="User profile"
    >
      <Avatar content="text" alt="John Doe" />
    </Badge>
  );
}
```

### On a tinted surface

```tsx
import React from 'react';
import { IndicatorBadge, Surface } from '@oneui/ui-native';

function IndicatorOnSurface() {
  return (
    <Surface mode="bold">
      <IndicatorBadge appearance="primary" aria-label="Active" />
      <IndicatorBadge appearance="positive" aria-label="Online" />
    </Surface>
  );
}
```

## Additional Notes

- Without `aria-label`, the dot is hidden from assistive tech (`accessible={false}`).
- Always provide a meaningful `aria-label` when the indicator conveys status (e.g. `"New"`, `"Unread"`, `"Online"`).
- When nested in a `Badge` or `Button` slot, `appearance="auto"` inherits the parent's appearance role.
- For numeric counts use `CounterBadge` instead.
- **Sample app** — open **IndicatorBadge** in `native-components-sample` to browse showcase suites.
