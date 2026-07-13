# LinkButton

## Overview

The `LinkButton` component is a pressable text link styled with the button family's variant/attention/appearance system. It supports optional start/end icon slots, underline control, loading and disabled states, and three t-shirt sizes. Use for inline navigation actions where a filled `Button` would be too heavy.

Native implementation: `LinkButton.native.tsx` · contract: `interface.ts` · showcase: `LinkButton.showcase.native.tsx`

## Import

```typescript
import { LinkButton } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so link colour tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `ReactNode` | — | **Required** — link label text |
| `variant` | `'bold' \| 'subtle' \| 'ghost'` | `'bold'` | Visual style; `attention` maps when `variant` is omitted |
| `attention` | `'high' \| 'medium' \| 'low'` | `'high'` | Figma attention alias |
| `size` | `6 \| 8 \| 10 \| 12 \| 'xs' \| 's' \| 'm' \| 'l' \| 'small' \| 'medium' \| 'large'` | `10` (`'m'`) | F-step number or t-shirt alias |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` → `'primary'` | Multi-accent colour role |
| `start` | `ReactNode` | — | Leading icon slot |
| `end` | `ReactNode` | — | Trailing icon slot |
| `showUnderline` | `boolean` | `true` | Show text underline |
| `disabled` | `boolean` | `false` | Disables press and dims |
| `loading` | `boolean` | `false` | Shows spinner; blocks press |
| `onPress` | `() => void` | — | Press handler |
| `onClick` | `() => void` | — | Web parity alias for `onPress` |
| `aria-label` | `string` | — | Accessible name when `children` is not plain text |
| `style` | `ViewStyle` | — | Additional root styles |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Basic link

```tsx
import React from 'react';
import { LinkButton } from '@oneui/ui-native';

function BasicLink() {
  return (
    <LinkButton aria-label="Learn more" onPress={() => console.log('navigate')}>
      Learn more
    </LinkButton>
  );
}
```

### Attention levels

```tsx
import React from 'react';
import { LinkButton } from '@oneui/ui-native';

function LinkAttention() {
  return (
    <>
      <LinkButton attention="high" aria-label="High attention">High</LinkButton>
      <LinkButton attention="medium" aria-label="Medium attention">Medium</LinkButton>
      <LinkButton attention="low" aria-label="Low attention">Low</LinkButton>
    </>
  );
}
```

### Sizes

```tsx
import React from 'react';
import { LinkButton } from '@oneui/ui-native';

function LinkSizes() {
  return (
    <>
      <LinkButton size="s" aria-label="Small link">Small</LinkButton>
      <LinkButton size="m" aria-label="Medium link">Medium</LinkButton>
      <LinkButton size="l" aria-label="Large link">Large</LinkButton>
    </>
  );
}
```

### With icon slots

```tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { LinkButton } from '@oneui/ui-native';
import { tokens } from '@oneui/tokens';

function ExternalLinkIcon() {
  return (
    <Svg width={tokens.spacing['5']} height={tokens.spacing['5']} viewBox="0 0 24 24">
      <Path d="M14 3v2H5v14h14v-9h2v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h10zm7 0v6h-2V6.413l-7.293 7.294-1.414-1.414L17.585 5H15V3h6z" fill="currentColor" />
    </Svg>
  );
}

function LinkWithIcon() {
  return (
    <LinkButton end={<ExternalLinkIcon />} aria-label="Open external link">
      Visit site
    </LinkButton>
  );
}
```

### Without underline

```tsx
import React from 'react';
import { LinkButton } from '@oneui/ui-native';

function LinkNoUnderline() {
  return (
    <LinkButton showUnderline={false} aria-label="Subtle link">
      Subtle link
    </LinkButton>
  );
}
```

### Loading and disabled

```tsx
import React from 'react';
import { LinkButton } from '@oneui/ui-native';

function LinkStates() {
  return (
    <>
      <LinkButton loading aria-label="Loading link">Loading</LinkButton>
      <LinkButton disabled aria-label="Disabled link">Disabled</LinkButton>
    </>
  );
}
```

### On a tinted surface

```tsx
import React from 'react';
import { LinkButton, Surface } from '@oneui/ui-native';

function LinkOnSurface() {
  return (
    <Surface mode="bold">
      <LinkButton attention="high" aria-label="Action on bold">Action</LinkButton>
      <LinkButton attention="medium" aria-label="Action on bold">Action</LinkButton>
      <LinkButton attention="low" aria-label="Action on bold">Action</LinkButton>
    </Surface>
  );
}
```

## Additional Notes

- `accessibilityRole` is `'link'` — distinct from `Button`'s `'button'` role.
- When `children` is a plain string, it becomes the `accessibilityLabel` automatically.
- Set `aria-label` when `children` is not readable text (icons only, complex nodes).
- `showUnderline={false}` removes the underline while keeping link semantics.
- **Sample app** — open **LinkButton** in `native-components-sample` to browse showcase suites.
