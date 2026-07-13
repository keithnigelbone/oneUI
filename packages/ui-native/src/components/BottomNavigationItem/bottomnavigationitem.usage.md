# BottomNavigationItem

## Overview

The `BottomNavigationItem` component renders a single tab inside `BottomNavigation`. It displays an icon (with optional `activeIcon` swap), an optional label, and handles press/selection. Always compose inside a `BottomNavigation` parent for correct selection and label-type behaviour.

Native implementation: `BottomNavigationItem.native.tsx` · contract: `interface.ts` · showcase: `BottomNavigationItem.showcase.native.tsx` (item-only) · parent showcase: `BottomNavigation.showcase.native.tsx`

## Import

```typescript
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `icon` | `SemanticIconName \| ReactElement \| IconComponent` | — | **Required** — tab icon (semantic name or custom element) |
| `activeIcon` | `SemanticIconName \| ReactElement \| IconComponent` | — | Icon shown when the tab is selected; falls back to `icon` |
| `label` | `string` | — | Visible label text (hidden when parent `labelType="none"`) |
| `value` | `string` | — | Tab identifier — matched against parent `value` for selection |
| `active` | `boolean` | — | Explicit active state (ignored when parent has a `value`) |
| `disabled` | `boolean` | `false` | Disables press and dims the item |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | — | Overrides parent appearance for this item |
| `labelType` | `'none' \| '1line' \| '2line'` | — | Overrides parent `labelType` for this item |
| `href` | `string` | — | Opens URL via `Linking.openURL` on press |
| `onPress` | `() => void` | — | Press handler (React Native convention) |
| `onClick` | `() => void` | — | Web parity alias for `onPress` |
| `style` | `ViewStyle` | — | Additional pressable styles |
| `aria-label` | `string` | — | Accessible tab name; falls back to `label`, then humanized `value` |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier on the pressable root |

## Usage Examples

### Inside BottomNavigation (canonical)

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function TabBar() {
  return (
    <BottomNavigation aria-label="Primary" defaultValue="home">
      <BottomNavigationItem value="home" icon="home" label="Home" />
      <BottomNavigationItem value="search" icon="search" label="Search" />
      <BottomNavigationItem value="profile" icon="user" label="Profile" />
    </BottomNavigation>
  );
}
```

### Semantic icon names

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function SemanticIcons() {
  return (
    <BottomNavigation aria-label="Primary" defaultValue="home">
      <BottomNavigationItem value="home" icon="home" label="Home" aria-label="Home" />
      <BottomNavigationItem value="search" icon="search" label="Search" aria-label="Search" />
    </BottomNavigation>
  );
}
```

### Active icon swap

When selected, `activeIcon` replaces `icon`.

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function ActiveIconSwap() {
  return (
    <BottomNavigation aria-label="Primary" defaultValue="user">
      <BottomNavigationItem
        value="user"
        icon="user"
        activeIcon="search"
        label="User"
      />
    </BottomNavigation>
  );
}
```

### Icon-only tabs

With parent `labelType="none"`, provide `aria-label` or rely on humanized `value` (`"my-profile"` → `"My Profile"`).

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function IconOnlyTabs() {
  return (
    <BottomNavigation aria-label="Icon-only tabs" labelType="none" defaultValue="home">
      <BottomNavigationItem value="home" icon="home" />
      <BottomNavigationItem value="search" icon="search" />
      <BottomNavigationItem value="profile" icon="user" />
    </BottomNavigation>
  );
}
```

### Disabled item

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function DisabledTab() {
  return (
    <BottomNavigation aria-label="Primary" defaultValue="home">
      <BottomNavigationItem value="home" icon="home" label="Home" />
      <BottomNavigationItem value="search" icon="search" label="Disabled" disabled />
      <BottomNavigationItem value="profile" icon="user" label="Profile" />
    </BottomNavigation>
  );
}
```

### Standalone item (preview only)

For visual regression the item can render outside a parent, but production use always requires `BottomNavigation`.

```tsx
import React from 'react';
import { BottomNavigationItem } from '@oneui/ui-native';

function StandaloneItem() {
  return <BottomNavigationItem icon="home" label="Home" active />;
}
```

### Custom press handler

Parent `onValueChange` still fires when `value` is set; add `onPress` for side effects.

```tsx
import React from 'react';
import { BottomNavigation, BottomNavigationItem } from '@oneui/ui-native';

function NavWithSideEffect() {
  return (
    <BottomNavigation aria-label="Primary" defaultValue="home">
      <BottomNavigationItem
        value="home"
        icon="home"
        label="Home"
        onPress={() => console.log('Home pressed')}
      />
    </BottomNavigation>
  );
}
```

## Additional Notes

- **Parent context is required** for selection — `value` on the item updates the parent via context `onValueChange`.
- **`active` is ignored** when the parent `BottomNavigation` has a `value`; use matching `value` strings instead.
- **Icon appearance** — active tabs use the resolved appearance role; inactive tabs use `'neutral'`.
- **Label typography** — uses `Label-XS` tokens; two-line labels wrap inside a fixed-height box.
- **Accessibility** — each item exposes `accessibilityRole="tab"` with `accessibilityState.selected`.
- **Sample app** — see `BottomNavigationItemLabelTypes`, `BottomNavigationItemWithIcons` in the sample app; full bar examples in the **BottomNavigation** showcase.
- **Web alias** — exported as `BottomNavItem` for web parity.
