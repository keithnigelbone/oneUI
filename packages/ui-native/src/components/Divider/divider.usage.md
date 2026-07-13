# Divider

## Overview

The `Divider` component separates content horizontally or vertically. It supports three stroke sizes, three attention levels, optional inline label or icon content, content alignment, and multi-accent appearance roles. Used standalone or embedded (e.g. above `BottomNavigation`).

Native implementation: `Divider.native.tsx` · contract: `interface.ts` · showcase: `Divider.showcase.native.tsx`

## Import

```typescript
import { Divider, Icon } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so stroke colour tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Line direction |
| `size` | `'s' \| 'm' \| 'l'` | `'m'` | Stroke weight |
| `attention` | `'high' \| 'medium' \| 'low'` | `'low'` | Stroke emphasis |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` → `'neutral'` | Colour role for the line |
| `contentAlign` | `'center' \| 'start' \| 'end'` | `'center'` | Inline label/icon alignment |
| `roundCaps` | `boolean` | `false` | Rounded line cap ends |
| `children` | `string \| ReactElement<typeof Icon>` | — | Inline label text or `<Icon>` node |
| `style` | `ViewStyle` | — | Additional root styles |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Basic divider

```tsx
import React from 'react';
import { Divider } from '@oneui/ui-native';

function BasicDivider() {
  return <Divider />;
}
```

### Orientations

```tsx
import React from 'react';
import { Divider, View } from '@oneui/ui-native';

function DividerOrientations() {
  return (
    <>
      <Divider orientation="horizontal" />
      <View style={{ flexDirection: 'row', height: 120 }}>
        <Divider orientation="vertical" />
      </View>
    </>
  );
}
```

### Sizes and attention

```tsx
import React from 'react';
import { Divider } from '@oneui/ui-native';

function DividerVariants() {
  return (
    <>
      {(['s', 'm', 'l'] as const).map((size) => (
        <Divider key={size} size={size} />
      ))}
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <Divider key={attention} attention={attention} />
      ))}
    </>
  );
}
```

### With label

```tsx
import React from 'react';
import { Divider } from '@oneui/ui-native';

function DividerWithLabel() {
  return (
    <>
      <Divider contentAlign="center">Or continue with</Divider>
      <Divider contentAlign="start">Section</Divider>
      <Divider contentAlign="end">End aligned</Divider>
    </>
  );
}
```

### With icon

`children` must be a string or a design-system `<Icon>` element.

```tsx
import React from 'react';
import { Divider, Icon } from '@oneui/ui-native';

function DividerWithIcon() {
  return (
    <>
      <Divider contentAlign="center" attention="medium">
        <Icon icon="star" aria-hidden />
      </Divider>
      <Divider contentAlign="start">
        <Icon icon="heart" aria-hidden />
      </Divider>
    </>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { Divider } from '@oneui/ui-native';

function DividerAppearances() {
  return (
    <>
      <Divider appearance="primary" attention="medium" />
      <Divider appearance="negative" attention="high" />
      <Divider appearance="neutral" attention="low" />
    </>
  );
}
```

### Round caps

```tsx
import React from 'react';
import { Divider } from '@oneui/ui-native';

function RoundCaps() {
  return <Divider roundCaps attention="medium" />;
}
```

### Surface context

```tsx
import React from 'react';
import { Divider, Surface } from '@oneui/ui-native';

function DividerOnSurface() {
  return (
    <Surface mode="subtle">
      <Divider attention="medium" />
      <Divider>Label on subtle surface</Divider>
    </Surface>
  );
}
```

### In BottomNavigation

`BottomNavigation` renders a horizontal `Divider` above the tab row when `showDivider={true}` (default).

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function NavWithDivider() {
  return (
    <BottomNavigation aria-label="Primary" defaultValue="home">
      <BottomNavigationItem value="home" icon="home" label="Home" />
      <BottomNavigationItem value="search" icon="search" label="Search" />
    </BottomNavigation>
  );
}
```

## Additional Notes

- **`children` types** — plain string for label text, or `<Icon>` only (not arbitrary React nodes).
- **Default appearance** resolves `'auto'` to `'neutral'`.
- **Accessibility** — exposes separator semantics with `aria-orientation`; decorative line segments are hidden from the tree.
- **Vertical dividers** need a parent with explicit height in a row layout.
- **Sample app** — open **Divider** in `native-components-sample` for `DividerOrientations`, `DividerWithIcon`, `DividerAttentionLevels`, `DividerSurfaceContext`, etc.
- **Web parity** — mirrors `packages/ui/src/components/Divider/Divider.shared.ts`.
