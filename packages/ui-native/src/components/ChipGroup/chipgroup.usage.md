# ChipGroup

## Overview

The `ChipGroup` component orchestrates a set of `Chip` children for single- or multi-select filtering. It manages selection state (`value` / `onValueChange`), propagates shared `size` / `variant` / `appearance` to child chips, and supports horizontal or vertical layout with optional wrapping.

Native implementation: `ChipGroup.native.tsx` · contract: `interface.ts` · showcase: `ChipGroup.showcase.native.tsx`

## Import

```typescript
import { ChipGroup, Chip } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so chip surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `ReactNode` | — | **Required** — `Chip` elements, each with a unique `value` |
| `value` | `string[]` | — | Controlled selected chip values |
| `defaultValue` | `string[]` | `[]` | Uncontrolled initial selection |
| `onValueChange` | `(value: string[]) => void` | — | Fires when selection changes |
| `multiple` | `boolean` | `false` | Allow more than one chip selected |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `wrap` | `boolean` | `true` | Wrap chips to next line (horizontal only) |
| `size` | `'s' \| 'm' \| 'l'` | — | Shared chip size (inherited by children) |
| `variant` | `'bold' \| 'subtle' \| 'ghost'` | — | Shared chip variant |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | — | Shared appearance role |
| `maxSelections` | `number` | — | Cap for multi-select (blocks further toggles) |
| `required` | `boolean` | — | Prevents deselecting the last chip |
| `disabled` | `boolean` | — | Disables all child chips |
| `loopFocus` | `boolean` | — | Reserved for focus-loop behaviour |
| `aria-label` | `string` | — | Accessible group name (recommended) |
| `aria-labelledby` | `string` | — | Reference to external heading for group name |
| `style` | `ViewStyle` | — | Container styles |
| `testID` | `string` | — | Test identifier |
| `accessibilityHint` | `string` | — | React Native accessibility hint |

## Usage Examples

### Basic filter group

```tsx
import React from 'react';
import { ChipGroup, Chip } from '@oneui/ui-native';

function CategoryFilter() {
  return (
    <ChipGroup aria-label="Category filter" size="m">
      <Chip value="all">All</Chip>
      <Chip value="news">News</Chip>
      <Chip value="sport">Sport</Chip>
      <Chip value="tech">Tech</Chip>
    </ChipGroup>
  );
}
```

### Controlled single-select

```tsx
import React, { useState } from 'react';
import { ChipGroup, Chip } from '@oneui/ui-native';

function ControlledSingleSelect() {
  const [value, setValue] = useState<string[]>(['news']);

  return (
    <ChipGroup
      aria-label="Topics"
      value={value}
      onValueChange={setValue}
      appearance="secondary"
      variant="bold"
    >
      <Chip value="news">News</Chip>
      <Chip value="sport">Sport</Chip>
      <Chip value="tech">Tech</Chip>
    </ChipGroup>
  );
}
```

### Multi-select

```tsx
import React from 'react';
import { ChipGroup, Chip } from '@oneui/ui-native';

function MultiSelectTags() {
  return (
    <ChipGroup aria-label="Tags" multiple defaultValue={['news']} appearance="secondary">
      <Chip value="news">News</Chip>
      <Chip value="sport">Sport</Chip>
      <Chip value="tech">Tech</Chip>
      <Chip value="culture">Culture</Chip>
    </ChipGroup>
  );
}
```

### Variants

```tsx
import React from 'react';
import { ChipGroup, Chip } from '@oneui/ui-native';

function ChipGroupVariants() {
  return (
    <ChipGroup aria-label="Bold chips" variant="bold" defaultValue={['a']}>
      <Chip value="a">Alpha</Chip>
      <Chip value="b">Beta</Chip>
      <Chip value="c">Gamma</Chip>
    </ChipGroup>
  );
}
```

### Vertical layout

```tsx
import React from 'react';
import { ChipGroup, Chip } from '@oneui/ui-native';

function VerticalGroup() {
  return (
    <ChipGroup aria-label="Vertical group" orientation="vertical" defaultValue={['news']}>
      <Chip value="news">News</Chip>
      <Chip value="sport">Sport</Chip>
      <Chip value="tech">Tech</Chip>
    </ChipGroup>
  );
}
```

### No-wrap scroll row

```tsx
import React from 'react';
import { View } from 'react-native';
import { ChipGroup, Chip } from '@oneui/ui-native';
import { tokens } from '@oneui/tokens';

function ScrollRow() {
  return (
    <View style={{ maxWidth: tokens.spacing['32'] }}>
      <ChipGroup aria-label="Scroll row" wrap={false}>
        <Chip value="1">One</Chip>
        <Chip value="2">Two</Chip>
        <Chip value="3">Three</Chip>
        <Chip value="4">Four</Chip>
        <Chip value="5">Five</Chip>
        <Chip value="6">Six</Chip>
      </ChipGroup>
    </View>
  );
}
```

### Disabled group

```tsx
import React from 'react';
import { ChipGroup, Chip } from '@oneui/ui-native';

function DisabledGroup() {
  return (
    <ChipGroup aria-label="Disabled group" disabled defaultValue={['news']}>
      <Chip value="news">News</Chip>
      <Chip value="sport">Sport</Chip>
    </ChipGroup>
  );
}
```

## Additional Notes

- Each child `Chip` **must** have a unique `value` string — the group uses it for selection tracking.
- In single-select mode (`multiple={false}`), `defaultValue` with multiple entries is normalised to the first value only.
- `required` blocks deselecting the last chip; `maxSelections` blocks adding beyond the cap in multi-select mode.
- Standalone `Chip` components (outside a group) manage their own `selected` state — see `chip.usage.md`.
- Container is `accessible={false}` so each `Chip` remains individually focusable on VoiceOver / TalkBack.
- **Sample app** — open **ChipGroup** in `native-components-sample` to browse showcase suites.
