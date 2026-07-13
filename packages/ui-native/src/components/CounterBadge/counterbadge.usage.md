# CounterBadge

## Overview

The `CounterBadge` component displays a numeric count (notifications, cart items, unread messages). It supports overflow capping (`99+`), zero hiding, three attention levels, four sizes, and multi-accent appearance roles. Commonly composed as a `Badge` slot or overlaid on icons.

Native implementation: `CounterBadge.native.tsx` · contract: `interface.ts` · showcase: `CounterBadge.showcase.native.tsx`

## Import

```typescript
import { CounterBadge } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `number` | — | **Required** — count to display |
| `max` | `number` | `99` | Overflow cap — values above render as `{max}+` |
| `showZero` | `boolean` | `false` | Show `0`; otherwise zero counts are hidden |
| `size` | `'xs' \| 's' \| 'm' \| 'l'` | `'m'` | Badge size |
| `variant` | `'bold' \| 'subtle' \| 'ghost'` | `'bold'` | Fill style (overrides `attention` mapping) |
| `attention` | `'high' \| 'medium' \| 'low'` | — | Figma attention alias — `high`→`bold`, `medium`→`subtle`, `low`→`ghost` |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` → slot parent or `'primary'` | Multi-accent colour role |
| `style` | `ViewStyle` | — | Additional styles |
| `aria-label` | `string` | — | Accessible name (defaults to display value) |
| `testID` | `string` | — | Test identifier |
| `accessibilityHint` | `string` | — | React Native accessibility hint |

## Usage Examples

### Basic counter

```tsx
import React from 'react';
import { CounterBadge } from '@oneui/ui-native';

function NotificationCount() {
  return <CounterBadge value={5} attention="high" size="m" aria-label="5 notifications" />;
}
```

### Attention levels

```tsx
import React from 'react';
import { CounterBadge } from '@oneui/ui-native';

function CounterAttention() {
  return (
    <>
      <CounterBadge value={5} attention="high" aria-label="5 notifications" />
      <CounterBadge value={5} attention="medium" aria-label="5 notifications" />
      <CounterBadge value={5} attention="low" aria-label="5 notifications" />
    </>
  );
}
```

### Sizes

```tsx
import React from 'react';
import { CounterBadge } from '@oneui/ui-native';

function CounterSizes() {
  return (
    <>
      <CounterBadge size="xs" value={5} aria-label="5 notifications" />
      <CounterBadge size="s" value={5} aria-label="5 notifications" />
      <CounterBadge size="m" value={5} aria-label="5 notifications" />
      <CounterBadge size="l" value={5} aria-label="5 notifications" />
    </>
  );
}
```

### Overflow cap

```tsx
import React from 'react';
import { CounterBadge } from '@oneui/ui-native';

function CounterOverflow() {
  return (
    <>
      <CounterBadge value={99} aria-label="99 notifications" />
      <CounterBadge value={150} aria-label="150 notifications" />
      <CounterBadge value={15} max={9} aria-label="15 notifications" />
    </>
  );
}
```

### Zero and negative handling

```tsx
import React from 'react';
import { CounterBadge } from '@oneui/ui-native';

function CounterEdgeCases() {
  return (
    <>
      <CounterBadge value={0} aria-label="zero hidden" />
      <CounterBadge value={0} showZero aria-label="zero shown" />
      <CounterBadge value={-1} aria-label="negative hidden" />
    </>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { CounterBadge } from '@oneui/ui-native';

function CounterAppearances() {
  return (
    <>
      <CounterBadge value={5} appearance="primary" attention="high" aria-label="5 notifications" />
      <CounterBadge value={5} appearance="negative" attention="high" aria-label="5 notifications" />
      <CounterBadge value={5} appearance="positive" attention="medium" aria-label="5 notifications" />
    </>
  );
}
```

### Inside a Badge slot

```tsx
import React from 'react';
import { Badge, CounterBadge } from '@oneui/ui-native';

function BadgeWithCounter() {
  return (
    <Badge
      attention="high"
      end={<CounterBadge value={3} aria-label="3 new items" />}
      aria-label="Inbox"
    >
      Inbox
    </Badge>
  );
}
```

## Additional Notes

- Negative values and zero (without `showZero`) render nothing — the component returns `null`.
- Invalid `max` values (< 1) fall back to the default cap of `99`.
- `accessibilityLiveRegion` is `'polite'` so count updates are announced.
- When nested in a `Badge` or `Button` slot, `appearance="auto"` inherits the parent's appearance role.
- **Sample app** — open **CounterBadge** in `native-components-sample` to browse showcase suites.
