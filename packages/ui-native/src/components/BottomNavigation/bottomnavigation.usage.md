# BottomNavigation

## Overview

The `BottomNavigation` component is a tab bar container for mobile primary navigation. It manages selection state, label layout, and appearance context for its `BottomNavigationItem` children. Supports 2–5 tabs, controlled or uncontrolled selection, and optional top divider.

Native implementation: `BottomNavigation.native.tsx` · contract: `interface.ts` · showcase: `BottomNavigation.showcase.native.tsx`

## Import

```typescript
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so surface and typography tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `ReactNode` | — | `BottomNavigationItem` elements (2–5 rendered; excess are clipped) |
| `labelType` | `'none' \| '1line' \| '2line'` | `'1line'` | Label layout for all items — icon-only, single line, or two-line wrap |
| `value` | `string` | — | Controlled selected tab value |
| `defaultValue` | `string` | — | Uncontrolled initial selected tab value |
| `onValueChange` | `(value: string) => void` | — | Called when the user selects a tab |
| `showDivider` | `boolean` | `true` | Render a horizontal `Divider` above the tab row |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'primary'` | Multi-accent colour role for active/inactive icon and label colours |
| `aria-label` | `string` | — | **Required** — landmark label for the tab list (`accessibilityRole="tablist"`) |
| `style` | `ViewStyle` | — | Additional root container styles |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier on the root element |

## Usage Examples

### Basic navigation

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function PrimaryNav() {
  return (
    <BottomNavigation aria-label="Primary" defaultValue="search">
      <BottomNavigationItem value="home" icon="home" label="Home" />
      <BottomNavigationItem value="search" icon="search" label="Search" />
      <BottomNavigationItem value="profile" icon="user" label="Profile" />
    </BottomNavigation>
  );
}
```

### Controlled selection

```tsx
import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function ControlledNav() {
  const [value, setValue] = useState('home');

  return (
    <BottomNavigation aria-label="Primary" value={value} onValueChange={setValue}>
      <BottomNavigationItem value="home" icon="home" label="Home" />
      <BottomNavigationItem value="search" icon="search" label="Search" />
      <BottomNavigationItem value="profile" icon="user" label="Profile" />
    </BottomNavigation>
  );
}
```

### Label types

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function LabelTypeNav() {
  return (
    <>
      {/* Icon + single-line label (default) */}
      <BottomNavigation aria-label="One line" labelType="1line" defaultValue="home">
        <BottomNavigationItem value="home" icon="home" label="Home" />
        <BottomNavigationItem value="search" icon="search" label="Search" />
      </BottomNavigation>

      {/* Two-line labels — long copy wraps */}
      <BottomNavigation aria-label="Two line" labelType="2line" defaultValue="account">
        <BottomNavigationItem value="account" icon="user" label="Account Profile Page" />
        <BottomNavigationItem value="search" icon="search" label="Search Everything" />
      </BottomNavigation>

      {/* Icon-only — items derive names from `value` or `aria-label` */}
      <BottomNavigation aria-label="Icon only" labelType="none" defaultValue="home">
        <BottomNavigationItem value="home" icon="home" />
        <BottomNavigationItem value="search" icon="search" />
        <BottomNavigationItem value="profile" icon="user" />
      </BottomNavigation>
    </>
  );
}
```

### Item count and max tabs

The design system supports 2–5 tabs. Passing more than five children logs a dev warning and only the first five render.

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function FiveTabNav() {
  return (
    <BottomNavigation aria-label="Five tabs" defaultValue="home">
      <BottomNavigationItem value="home" icon="home" label="Home" />
      <BottomNavigationItem value="search" icon="search" label="Search" />
      <BottomNavigationItem value="explore" icon="globe" label="Explore" />
      <BottomNavigationItem value="inbox" icon="mail" label="Inbox" />
      <BottomNavigationItem value="profile" icon="user" label="Profile" />
    </BottomNavigation>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function AppearanceNav() {
  return (
    <BottomNavigation aria-label="Secondary nav" appearance="secondary" defaultValue="home">
      <BottomNavigationItem value="home" icon="home" label="Home" />
      <BottomNavigationItem value="search" icon="search" label="Search" />
      <BottomNavigationItem value="profile" icon="user" label="Profile" />
    </BottomNavigation>
  );
}
```

### Without divider

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function NavWithoutDivider() {
  return (
    <BottomNavigation aria-label="Primary" showDivider={false} defaultValue="home">
      <BottomNavigationItem value="home" icon="home" label="Home" />
      <BottomNavigationItem value="search" icon="search" label="Search" />
    </BottomNavigation>
  );
}
```

### Surface context

Wrap the bar in `<Surface mode="...">` so icon and label colours remap on tinted backgrounds.

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem, Surface } from '@oneui/ui-native';

function NavOnSurface() {
  return (
    <Surface mode="bold">
      <BottomNavigation aria-label="Bold surface nav" defaultValue="home">
        <BottomNavigationItem value="home" icon="home" label="Home" />
        <BottomNavigationItem value="search" icon="search" label="Search" />
        <BottomNavigationItem value="profile" icon="user" label="Profile" />
      </BottomNavigation>
    </Surface>
  );
}
```

## Additional Notes

- **Always set `aria-label`** on the container — it is required for the tab-list landmark.
- **Selection exclusivity** — when the parent has a `value`, only the matching item is active; per-item `active` cannot override.
- **Icon prop** — pass a semantic icon name (`"home"`) or a custom glyph/component; see `BottomNavigationItem` usage for item-level props.
- **`BottomNavigationItem` must be a direct child** — the parent provides context for `labelType`, `value`, and `appearance`.
- **Sample app** — open **BottomNavigation** in `native-components-sample` for `BottomNavigationLabelTypes`, `BottomNavigationControlled`, `BottomNavigationSurfaceModes`, etc.
- **Web parity** — mirrors `packages/ui/src/components/BottomNavigation/BottomNavigation.shared.ts`.
