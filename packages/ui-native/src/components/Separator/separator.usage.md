# Separator

## Overview

The `Separator` component renders a thin decorative line to divide content horizontally or vertically. It is a minimal primitive — no label, colour roles, or attention levels. For labelled dividers with inline text or icons, use `Divider` instead.

Native implementation: `Separator.native.tsx` · contract: `interface.ts` · showcase: `Separator.showcase.native.tsx`

## Import

```typescript
import { Separator } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so stroke colour tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Line direction |
| `style` | `ViewStyle` | — | Additional styles |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Horizontal separator

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Separator } from '@oneui/ui-native';

function HorizontalLayout() {
  return (
    <View>
      <Text>Top section</Text>
      <Separator />
      <Text>Bottom section</Text>
    </View>
  );
}
```

### Vertical separator

Place inside a row with a fixed height so the vertical line stretches.

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Separator } from '@oneui/ui-native';
import { tokens } from '@oneui/tokens';

function VerticalLayout() {
  return (
    <View
      style={{
        flexDirection: 'row',
        height: tokens.spacing['9'],
        alignItems: 'stretch',
        gap: tokens.spacing['3-5'],
      }}
    >
      <Text>Left</Text>
      <Separator orientation="vertical" />
      <Text>Right</Text>
    </View>
  );
}
```

## Additional Notes

- Decorative only — `accessible={false}` and `aria-hidden` (hidden from assistive tech).
- Stroke colour resolves from the current surface context automatically.
- Use `Divider` when you need inline label/icon content, size variants, or attention levels.
- **Sample app** — open **Separator** in `native-components-sample` to browse showcase suites.
