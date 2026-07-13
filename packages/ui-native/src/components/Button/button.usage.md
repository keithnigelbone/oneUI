# Button

## Overview

The `Button` component is a pressable control with a visible text label. It supports four sizes, three attention levels, the full multi-accent appearance set, optional start/end icons, loading state, and condensed layout. For icon-only actions use `IconButton` instead.

Native implementation: `Button.native.tsx` · contract: `interface.ts` · showcase: `Button.showcase.native.tsx`

## Import

```typescript
import { Button, Icon } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so spacing, typography, and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `string` | — | **Required** — button label text |
| `variant` | `'bold' \| 'subtle' \| 'ghost'` | `'bold'` | Visual fill style; `attention` maps to this when `variant` is omitted |
| `attention` | `'high' \| 'medium' \| 'low'` | `'high'` | Figma attention alias — `high`→`bold`, `medium`→`subtle`, `low`→`ghost` |
| `size` | `6 \| 8 \| 10 \| 12 \| 'xs' \| 's' \| 'm' \| 'l'` | `10` (`'m'`) | F-step number or t-shirt alias |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` → `'primary'` | Multi-accent colour role |
| `contained` | `boolean` | `true` | Filled pill button; `false` delegates to link-style rendering |
| `condensed` | `boolean` | `false` | Reduced height/padding (contained only) |
| `fullWidth` | `boolean` | `false` | Stretch to container width |
| `disabled` | `boolean` | `false` | Disables press and dims the button |
| `loading` | `boolean` | `false` | Shows spinner; blocks press |
| `onPress` | `() => void` | — | Press handler (React Native convention) |
| `onClick` | `() => void` | — | Web parity alias for `onPress` |
| `start` | `SemanticIconName \| ReactNode` | — | Leading icon — semantic name or custom node |
| `end` | `SemanticIconName \| ReactNode` | — | Trailing icon |
| `leftIcon` | `SemanticIconName \| ReactElement` | — | **Deprecated** — use `start` |
| `rightIcon` | `SemanticIconName \| ReactElement` | — | **Deprecated** — use `end` |
| `decoration` | `DecorationConfig \| null` | — | Override decoration context |
| `style` | `ViewStyle` | — | Additional root styles |
| `aria-label` | `string` | — | Accessible name when label alone is insufficient |
| `aria-describedby` | `string` | — | ID of describing element |
| `aria-expanded` | `boolean` | — | Expanded state for menus/disclosures |
| `aria-haspopup` | `boolean \| 'dialog' \| 'grid' \| 'listbox' \| 'menu' \| 'tree'` | — | Popup indicator |
| `aria-controls` | `string` | — | ID of controlled element |
| `aria-hidden` | `boolean` | — | Hide from accessibility tree |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Basic button

```tsx
import React from 'react';
import { Button } from '@oneui/ui-native';

function BasicButton() {
  return (
    <Button attention="high" size="m" onPress={() => console.log('Pressed')}>
      Button
    </Button>
  );
}
```

### Attention levels

| Attention | Variant | Visual |
| --------- | ------- | ------ |
| `high` | `bold` | Filled |
| `medium` | `subtle` | Tinted |
| `low` | `ghost` | Transparent |

```tsx
import React from 'react';
import { Button } from '@oneui/ui-native';

function ButtonAttention() {
  return (
    <>
      <Button attention="high">High</Button>
      <Button attention="medium">Medium</Button>
      <Button attention="low">Low</Button>
    </>
  );
}
```

### Sizes

Canonical sizes: `'xs'` (f6), `'s'` (f8), `'m'` (f10), `'l'` (f12).

```tsx
import React from 'react';
import { Button } from '@oneui/ui-native';

function ButtonSizes() {
  return (
    <>
      <Button size="xs">Extra Small</Button>
      <Button size="s">Small</Button>
      <Button size="m">Medium</Button>
      <Button size="l">Large</Button>
    </>
  );
}
```

### With icons

Pass a semantic icon name or a custom `<Icon>` node. Icons inherit surface context from the button.

```tsx
import React from 'react';
import { Button, Icon } from '@oneui/ui-native';

function ButtonWithIcons() {
  return (
    <>
      <Button start="heart">Favorite</Button>
      <Button end="arrow-right">Continue</Button>
      <Button start={<Icon icon="heart" aria-hidden />}>Custom icon</Button>
    </>
  );
}
```

### Loading and disabled

```tsx
import React from 'react';
import { Button } from '@oneui/ui-native';

function ButtonStates() {
  return (
    <>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
      <Button condensed>Condensed</Button>
      <Button fullWidth>Full width</Button>
    </>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { Button } from '@oneui/ui-native';

function ButtonAppearances() {
  return (
    <>
      <Button appearance="primary" attention="high">Primary</Button>
      <Button appearance="secondary" attention="medium">Secondary</Button>
      <Button appearance="negative" attention="high">Delete</Button>
    </>
  );
}
```

### Surface context

```tsx
import React from 'react';
import { Button, Surface } from '@oneui/ui-native';

function ButtonOnSurface() {
  return (
    <Surface mode="bold">
      <Button attention="high">Bold on bold</Button>
      <Button attention="medium">Subtle on bold</Button>
      <Button attention="low">Ghost on bold</Button>
    </Surface>
  );
}
```

## Additional Notes

- **`children` must be a string** — not a `<Text>` slot; the button renders label typography internally.
- **Sizes** — prefer `'xs'` / `'s'` / `'m'` / `'l'` over legacy `'2xs'` / `'xl'` / numeric `7` / `14` / `16` (deprecated with dev warnings).
- **Icon-only actions** — use `<IconButton>`, not `Button` without a label.
- **Loading** — sets `accessibilityState.busy` and blocks interaction.
- **Sample app** — open **Button** in `native-components-sample` for `ButtonAttentionLevels`, `ButtonSizes`, `ButtonWithIcons`, `ButtonSurfaceContext`, etc.
- **Web parity** — mirrors `packages/ui/src/components/Button/Button.shared.ts`.
