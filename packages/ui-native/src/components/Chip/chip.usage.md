# Chip

## Overview

The `Chip` component is a compact, selectable pill for filters, tags, and choices. It supports three attention levels, three sizes, toggle selection, optional `start`/`end` slots, and the multi-accent appearance set. Compose inside a `ChipGroup` (when available) to inherit shared size/variant/appearance.

Native implementation: `Chip.native.tsx` · contract: `interface.ts` · showcase: `Chip.showcase.native.tsx`

## Import

```typescript
import { Chip, Icon, Avatar } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so spacing, typography, and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `ReactNode` | — | Chip label — plain string/number recommended |
| `size` | `'s' \| 'm' \| 'l'` | `'m'` | T-shirt size (inherits from `ChipGroup` when nested) |
| `variant` | `'bold' \| 'subtle' \| 'ghost'` | `'ghost'` | Visual fill; `attention` maps when `variant` omitted |
| `attention` | `'high' \| 'medium' \| 'low'` | — | Figma alias — `high`→`bold`, `medium`→`subtle`, `low`→`ghost` |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` → `'secondary'` | Multi-accent colour role |
| `selected` | `boolean` | — | Controlled selected state |
| `defaultSelected` | `boolean` | — | Uncontrolled initial selected state |
| `onSelectedChange` | `(selected: boolean, eventDetails?: unknown) => void` | — | Toggle handler; second arg is the press event on native |
| `value` | `string` | — | Identifier for group orchestration |
| `disabled` | `boolean` | `false` | Disables press and dims the chip |
| `start` | `ReactNode` | — | Leading slot (icon, avatar, badge) |
| `end` | `ReactNode` | — | Trailing slot |
| `style` | `ViewStyle` | — | Additional root styles |
| `aria-label` | `string` | — | Accessible name; plain-text `children` derive label |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Basic chip

```tsx
import React from 'react';
import { Chip } from '@oneui/ui-native';

function BasicChip() {
  return (
    <Chip appearance="secondary" attention="high" aria-label="Filter chip">
      Chip
    </Chip>
  );
}
```

### Toggle selection

```tsx
import React, { useState } from 'react';
import { Chip } from '@oneui/ui-native';

function ToggleChip() {
  const [selected, setSelected] = useState(false);

  return (
    <Chip
      appearance="secondary"
      attention="high"
      selected={selected}
      onSelectedChange={setSelected}
      aria-label="Toggle chip"
    >
      {selected ? 'Selected' : 'Unselected'}
    </Chip>
  );
}
```

### Attention levels

```tsx
import React from 'react';
import { Chip } from '@oneui/ui-native';

function ChipAttention() {
  return (
    <>
      <Chip appearance="secondary" attention="high" defaultSelected>High</Chip>
      <Chip appearance="secondary" attention="medium">Medium</Chip>
      <Chip appearance="secondary" attention="low">Low</Chip>
    </>
  );
}
```

### Sizes

```tsx
import React from 'react';
import { Chip } from '@oneui/ui-native';

function ChipSizes() {
  return (
    <>
      {(['s', 'm', 'l'] as const).map((size) => (
        <Chip key={size} size={size} appearance="secondary" attention="high">
          {size.toUpperCase()}
        </Chip>
      ))}
    </>
  );
}
```

### With slots

```tsx
import React from 'react';
import { Avatar, Chip, Icon } from '@oneui/ui-native';

function ChipWithSlots() {
  return (
    <>
      <Chip start={<Icon icon="heart" aria-hidden />} appearance="secondary">
        Favorite
      </Chip>
      <Chip start={<Avatar content="text" alt="AB" />} appearance="secondary">
        User
      </Chip>
      <Chip end={<Icon icon="close" aria-hidden />} appearance="secondary">
        Removable
      </Chip>
    </>
  );
}
```

### Disabled states

```tsx
import React from 'react';
import { Chip } from '@oneui/ui-native';

function ChipDisabled() {
  return (
    <>
      <Chip appearance="secondary" disabled>Disabled</Chip>
      <Chip appearance="secondary" defaultSelected disabled>Disabled selected</Chip>
    </>
  );
}
```

### Surface context

```tsx
import React from 'react';
import { Chip, Surface } from '@oneui/ui-native';

function ChipOnSurface() {
  return (
    <Surface mode="bold">
      <Chip appearance="secondary" attention="high" defaultSelected>Bold surface</Chip>
      <Chip appearance="secondary" attention="medium">Subtle</Chip>
    </Surface>
  );
}
```

## Additional Notes

- **Interactive** — `accessibilityRole="button"` with `accessibilityState.selected`.
- **Default variant** is `'ghost'` when neither `variant` nor `attention` is set.
- **Default appearance** resolves `'auto'` to `'secondary'`.
- **Label** is plain text in `children`, not a slot child element.
- **`onSelectedChange`** receives the native press event as the optional second argument.
- **Sample app** — open **Chip** in `native-components-sample` for `ChipAttentionLevels`, `ChipSelectedChange`, `ChipWithSlots`, `ChipSurfaceContext`, etc.
- **Web parity** — mirrors `packages/ui/src/components/Chip/Chip.shared.ts`.
