# Badge

## Overview

The `Badge` component displays small status indicators, counts, or labels. It supports three attention levels (`high` / `medium` / `low`), five sizes, the full multi-accent appearance set, and optional `start` / `end` slots for `Avatar`, `IndicatorBadge`, or `CounterBadge`.

Native implementation: `Badge.native.tsx` · contract: `interface.ts` · showcase: `Badge.showcase.native.tsx`

## Import

```typescript
import { Badge, Avatar, CounterBadge, IndicatorBadge } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` (or `OneUINativeThemeProvider`) so spacing, typography, and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `ReactNode` | — | Badge label — plain string or number (rendered as label typography) |
| `size` | `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` | `'m'` | T-shirt size scale (lowercase) |
| `variant` | `'bold' \| 'subtle' \| 'ghost'` | `'bold'` | Visual fill style; `attention` maps to this when `variant` is omitted |
| `attention` | `'high' \| 'medium' \| 'low'` | — | Figma attention alias — `high`→`bold`, `medium`→`subtle`, `low`→`ghost` |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'sparkle'` | Multi-accent colour role (`'auto'` resolves to `'sparkle'`) |
| `start` | `ReactNode` | — | Leading slot — `Avatar`, `IndicatorBadge`, `CounterBadge`, etc. |
| `end` | `ReactNode` | — | Trailing slot |
| `style` | `ViewStyle` | — | Additional root container styles |
| `aria-label` | `string` | — | Accessibility label; also used when `children` is plain text |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier on the root element |

## Usage Examples

### Basic badge

```tsx
import React from 'react';
import { Badge } from '@oneui/ui-native';

function BasicBadge() {
  return (
    <Badge attention="high" aria-label="Status badge">
      New
    </Badge>
  );
}
```

### Variants and attention levels

| Attention | Variant | Visual |
| --------- | ------- | ------ |
| `high` | `bold` | Filled |
| `medium` | `subtle` | Tinted |
| `low` | `ghost` | Transparent with stroke |

```tsx
import React from 'react';
import { Badge } from '@oneui/ui-native';

function BadgeVariants() {
  return (
    <>
      <Badge variant="bold" aria-label="Bold">Bold</Badge>
      <Badge variant="subtle" aria-label="Subtle">Subtle</Badge>
      <Badge variant="ghost" aria-label="Ghost">Ghost</Badge>
      <Badge attention="high" aria-label="High">High</Badge>
      <Badge attention="medium" aria-label="Medium">Medium</Badge>
      <Badge attention="low" aria-label="Low">Low</Badge>
    </>
  );
}
```

### Sizes

```tsx
import React from 'react';
import { Badge } from '@oneui/ui-native';

function BadgeSizes() {
  return (
    <>
      {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
        <Badge key={size} size={size} aria-label={`${size} badge`}>
          {size.toUpperCase()}
        </Badge>
      ))}
    </>
  );
}
```

### With slots

Slot children auto-size against the parent badge via slot context.

```tsx
import React from 'react';
import { Avatar, Badge, CounterBadge, IndicatorBadge } from '@oneui/ui-native';

function BadgeWithSlots() {
  return (
    <>
      <Badge
        attention="high"
        start={<Avatar content="icon" alt="User" />}
        aria-label="Badge with avatar"
      >
        Badge
      </Badge>
      <Badge
        attention="high"
        start={<IndicatorBadge appearance="negative" aria-label="alert" />}
        aria-label="Badge with indicator"
      >
        Badge
      </Badge>
      <Badge
        attention="high"
        end={<CounterBadge value={3} appearance="negative" aria-label="3" />}
        aria-label="Badge with counter"
      >
        Badge
      </Badge>
    </>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { Badge } from '@oneui/ui-native';

function BadgeAppearances() {
  return (
    <>
      <Badge appearance="primary" attention="high" aria-label="Primary">Badge</Badge>
      <Badge appearance="negative" attention="medium" aria-label="Negative">Badge</Badge>
      <Badge appearance="positive" attention="low" aria-label="Positive">Badge</Badge>
    </>
  );
}
```

### Surface context

Place badges inside `<Surface mode="...">` so on-colour tokens remap on tinted backgrounds.

```tsx
import React from 'react';
import { Avatar, Badge, Surface } from '@oneui/ui-native';

function BadgeOnSurface() {
  return (
    <Surface mode="bold">
      <Badge attention="high" aria-label="High">Badge</Badge>
      <Badge attention="medium" aria-label="Medium">Badge</Badge>
      <Badge attention="low" aria-label="Low">Badge</Badge>
      <Badge
        attention="high"
        start={<Avatar content="icon" alt="User" />}
        aria-label="With icon"
      >
        Badge
      </Badge>
    </Surface>
  );
}
```

### Accessibility

Provide `aria-label` when the badge has no visible text (icon-only or slot-only content). Plain-text `children` derive the label automatically.

```tsx
import React from 'react';
import { Avatar, Badge } from '@oneui/ui-native';

function AccessibleBadge() {
  return (
    <>
      <Badge aria-label="3 unread messages" start={<Avatar content="text" alt="Jane Doe" />}>
        New
      </Badge>
      <Badge
        attention="medium"
        aria-label="Notifications"
        end={<CounterBadge value={9} aria-label="9 new items" />}
      >
        Inbox
      </Badge>
    </>
  );
}
```

## Additional Notes

- **Label content** is plain text in `children`, not a `<Text>` slot child.
- **Sizes** use lowercase t-shirt tokens (`'xs'`–`'xl'`), not legacy `'XS'` / `'M'` values.
- **`variant` vs `attention`** — prefer `attention` for Figma parity; `variant` wins when both are set.
- **Default appearance** is `'sparkle'` when omitted or `'auto'`.
- **CounterBadge at small sizes** — `CounterBadge` in `start`/`end` may not fit at `xs`/`s`; see `BadgeSizesWithSlots` showcase.
- **No press handler** — `Badge` is decorative; wrap in `Pressable` if you need interaction.
- **Sample app** — open **Badge** in `native-components-sample` to browse showcase suites (`BadgeVariants`, `BadgeWithSlots`, `BadgeSurfaceContextAllModes`, etc.).
- **Web parity** — mirrors `packages/ui/src/components/Badge/Badge.shared.ts`.
