# IconButton

## Overview

The `IconButton` component is a pressable icon-only control. It shares the button family's variant/attention/appearance system, supports f-step and t-shirt sizes, loading and disabled states, and optional `3:2` layout. Use for toolbar actions, dismiss buttons, and compact triggers where a text label is unnecessary.

Native implementation: `IconButton.native.tsx` · contract: `interface.ts` · showcase: `IconButton.showcase.native.tsx`

## Import

```typescript
import { IconButton, Icon } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so button surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `icon` | `SemanticIconName \| ReactElement \| IconComponent` | — | **Required** — semantic name, custom element, or `IconComponent` |
| `aria-label` | `string` | — | **Required** — accessible name (no visible label) |
| `variant` | `'bold' \| 'subtle' \| 'ghost'` | `'bold'` | Fill style; `attention` maps to this when `variant` is omitted |
| `attention` | `'high' \| 'medium' \| 'low'` | `'high'` | Figma attention alias |
| `size` | `4 \| 6 \| 8 \| 10 \| 12 \| 14 \| '2xs' \| 'xs' \| 's' \| 'm' \| 'l' \| 'xl' \| 'small' \| 'medium' \| 'large'` | `10` (`'m'`) | F-step number or t-shirt alias |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` → `'primary'` | Multi-accent colour role |
| `condensed` | `boolean` | `false` | Reduced padding |
| `layout` | `'1:1' \| '3:2'` | `'1:1'` | Aspect ratio of the hit target |
| `fullWidth` | `boolean` | `false` | Stretch to container width |
| `disabled` | `boolean` | `false` | Disables press and dims |
| `loading` | `boolean` | `false` | Shows spinner; blocks press |
| `onPress` | `() => void` | — | Press handler |
| `onClick` | `() => void` | — | Web parity alias for `onPress` |
| `aria-expanded` | `boolean` | — | Expanded state for menus/disclosures |
| `aria-haspopup` | `boolean \| 'dialog' \| 'grid' \| 'listbox' \| 'menu' \| 'tree'` | — | Popup indicator |
| `style` | `ViewStyle` | — | Additional root styles |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Basic icon button

```tsx
import React from 'react';
import { IconButton } from '@oneui/ui-native';

function AddButton() {
  return <IconButton icon="add" aria-label="Add item" onPress={() => console.log('add')} />;
}
```

### With custom icon component

```tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconComponent, IconComponentProps } from '@oneui/shared';
import { IconButton } from '@oneui/ui-native';

const PlusIcon: IconComponent = ({ size = 24, color = 'currentColor' }: IconComponentProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill={color as string} />
  </Svg>
);

function CustomIconButton() {
  return <IconButton icon={PlusIcon} aria-label="Add item" />;
}
```

### Attention levels

```tsx
import React from 'react';
import { IconButton } from '@oneui/ui-native';

function IconButtonAttention() {
  return (
    <>
      <IconButton icon="heart" aria-label="Like" attention="high" />
      <IconButton icon="heart" aria-label="Like" attention="medium" />
      <IconButton icon="heart" aria-label="Like" attention="low" />
    </>
  );
}
```

### Sizes

```tsx
import React from 'react';
import { IconButton } from '@oneui/ui-native';

function IconButtonSizes() {
  return (
    <>
      <IconButton icon="heart" aria-label="Like" size="xs" />
      <IconButton icon="heart" aria-label="Like" size="s" />
      <IconButton icon="heart" aria-label="Like" size="m" />
      <IconButton icon="heart" aria-label="Like" size="l" />
      <IconButton icon="heart" aria-label="Like" size="xl" />
    </>
  );
}
```

### Loading and disabled

```tsx
import React from 'react';
import { IconButton } from '@oneui/ui-native';

function IconButtonStates() {
  return (
    <>
      <IconButton icon="heart" aria-label="Like" loading />
      <IconButton icon="heart" aria-label="Like" disabled />
    </>
  );
}
```

### On a tinted surface

```tsx
import React from 'react';
import { IconButton, Surface } from '@oneui/ui-native';

function IconButtonOnSurface() {
  return (
    <Surface mode="bold">
      <IconButton icon="close" aria-label="Close" attention="high" />
      <IconButton icon="close" aria-label="Close" attention="medium" />
      <IconButton icon="close" aria-label="Close" attention="low" />
    </Surface>
  );
}
```

## Additional Notes

- `aria-label` is **required** — there is no visible text label.
- Semantic icon names (e.g. `"add"`, `"heart"`) resolve through the design-system `Icon` registry.
- For icon-only menus, pair `aria-expanded` and `aria-haspopup` with the popup state.
- Use `Button` when the action needs a visible text label.
- **Sample app** — open **IconButton** in `native-components-sample` to browse showcase suites.
