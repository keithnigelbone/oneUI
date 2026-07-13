# IconContained

## Overview

The `IconContained` component renders an icon inside a filled or tinted circular container. It supports two attention levels (`high` = bold fill, `medium` = subtle fill), five t-shirt sizes, multi-accent appearances, and a disabled state. Non-interactive — use `IconButton` for pressable icon actions.

Native implementation: `IconContained.native.tsx` · contract: `interface.ts` · showcase: `IconContained.showcase.native.tsx`

## Import

```typescript
import { IconContained } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `icon` | `SemanticIconName \| ReactElement \| IconComponent` | — | **Required** — icon to display |
| `size` | `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` | `'m'` | Container size |
| `attention` | `'high' \| 'medium'` | `'high'` | `high` = bold fill, `medium` = subtle fill |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` → `'primary'` | Multi-accent colour role |
| `disabled` | `boolean` | `false` | Reduces opacity |
| `style` | `ViewStyle` | — | Additional container styles |
| `aria-label` | `string` | — | Accessible name — required for non-decorative use |
| `aria-hidden` | `boolean` | — | Hide from accessibility tree |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Basic contained icon

```tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconComponent, IconComponentProps } from '@oneui/shared';
import { IconContained } from '@oneui/ui-native';

const HeartIcon: IconComponent = ({ size = 24, color = 'currentColor' }: IconComponentProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color as string}
      d="M12 21s-7.5-4.534-9.5-10A5.5 5.5 0 0 1 12 7a5.5 5.5 0 0 1 9.5 4C19.5 16.466 12 21 12 21Z"
    />
  </Svg>
);

function BasicIconContained() {
  return <IconContained icon={HeartIcon} aria-label="Favourite" />;
}
```

### Attention levels

```tsx
import React from 'react';
import { IconContained } from '@oneui/ui-native';

function IconContainedAttention() {
  return (
    <>
      <IconContained icon="heart" attention="high" aria-label="High" />
      <IconContained icon="heart" attention="medium" aria-label="Medium" />
    </>
  );
}
```

### Sizes

```tsx
import React from 'react';
import { IconContained } from '@oneui/ui-native';

function IconContainedSizes() {
  return (
    <>
      {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
        <IconContained key={size} icon="heart" size={size} aria-label={`Size ${size}`} />
      ))}
    </>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { IconContained } from '@oneui/ui-native';

function IconContainedAppearances() {
  return (
    <>
      <IconContained icon="heart" appearance="primary" aria-label="Primary" />
      <IconContained icon="heart" appearance="secondary" aria-label="Secondary" />
      <IconContained icon="heart" appearance="positive" aria-label="Positive" />
    </>
  );
}
```

### Disabled state

```tsx
import React from 'react';
import { IconContained } from '@oneui/ui-native';

function DisabledIconContained() {
  return <IconContained icon="heart" disabled aria-label="Unavailable" />;
}
```

### On a tinted surface

```tsx
import React from 'react';
import { IconContained, Surface } from '@oneui/ui-native';

function IconContainedOnSurface() {
  return (
    <Surface mode="bold">
      <IconContained icon="heart" attention="high" aria-label="Heart" />
      <IconContained icon="heart" attention="medium" aria-label="Heart" />
    </Surface>
  );
}
```

### Decorative (hidden from a11y)

```tsx
import React from 'react';
import { IconContained } from '@oneui/ui-native';

function DecorativeIconContained() {
  return <IconContained icon="heart" aria-hidden />;
}
```

## Additional Notes

- Non-interactive — `accessibilityRole` is `'image'`, not `'button'`.
- Without `aria-label`, the node is not exposed to assistive tech unless `aria-hidden` is set.
- `icon` accepts semantic names (e.g. `"heart"`), `ReactElement`, or an `IconComponent` (accepts `size` + `color` props).
- Custom `IconComponent` glyphs get automatic size and on-colour via the internal `Icon` wrapper.
- **Sample app** — open **IconContained** in `native-components-sample` to browse showcase suites.
