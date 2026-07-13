# SegmentedControl

## Overview

`SegmentedControl` is a single-select control for switching between a small set of related views or filters. It uses a compound API: the root manages selection state and track paint, while `SegmentedControl.Item` renders each segment, optionally with a leading icon (`start`) or trailing `CounterBadge` (`end`).

Native implementation: `SegmentedControl.native.tsx` · contract: `interface.ts` · showcase: `SegmentedControl.showcase.native.tsx`

## Import

```typescript
import { SegmentedControl } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so segment colour tokens resolve correctly.

## Props

### `SegmentedControl` (root)

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `ReactNode` | — | **Required** — one or more `SegmentedControl.Item` |
| `value` | `string` | — | Controlled selected value |
| `defaultValue` | `string` | — | Uncontrolled initial selected value |
| `onValueChange` | `(value: string) => void` | — | Fires when selection changes |
| `size` | `'s' \| 'm' \| 'l'` | `'m'` | Segment size |
| `attention` | `'high' \| 'medium' \| 'low'` | `'high'` | Selected-segment fill: high → bold, medium → subtle (item role), low → subtle (track role) |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` | Colour role for selected segments when attention is high/medium |
| `shape` | `'pill' \| 'rectangular'` | `'pill'` | Track/segment corner shape |
| `equalWidth` | `boolean` | `true` for `text` type | Every segment shares equal width |
| `trackEmphasis` | `'high' \| 'medium' \| 'low'` | `'high'` | Track prominence: high → minimal fill, medium → ghost + border, low → ghost |
| `type` | `'text' \| 'icon'` | `'text'` | Text-label or icon-only segments |
| `disabled` | `boolean` | `false` | Disables the whole group |
| `style` | `ViewStyle` | — | Track container styles |
| `testID` | `string` | — | Test identifier |
| `accessibilityHint` | `string` | — | Additional a11y hint |
| `aria-label` | `string` | — | Accessible group name |

### `SegmentedControl.Item`

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `string` | — | **Required** — unique segment value |
| `children` | `ReactNode` | — | Segment label text |
| `start` | `ReactNode` | — | Leading icon slot |
| `end` | `ReactNode` | — | Trailing `CounterBadge` slot |
| `disabled` | `boolean` | `false` | Disables this segment only |
| `aria-label` | `string` | — | **Required for icon-only segments** |
| `onPress` | `() => void` | — | Fires on selection |
| `onClick` | `() => void` | — | Web-parity alias for `onPress` |
| `style` | `ViewStyle` | — | Segment styles |
| `testID` | `string` | — | Test identifier |
| `accessibilityHint` | `string` | — | Additional a11y hint |

## Usage Examples

### Basic text segments

```tsx
import React, { useState } from 'react';
import { SegmentedControl } from '@oneui/ui-native';

function ViewSwitcher() {
  const [value, setValue] = useState('list');

  return (
    <SegmentedControl value={value} onValueChange={setValue} aria-label="View mode">
      <SegmentedControl.Item value="list">List</SegmentedControl.Item>
      <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      <SegmentedControl.Item value="map">Map</SegmentedControl.Item>
    </SegmentedControl>
  );
}
```

### Icon-only segments

```tsx
import React, { useState } from 'react';
import { SegmentedControl } from '@oneui/ui-native';
import { Icon } from '@oneui/ui-native';

function IconSwitcher() {
  const [value, setValue] = useState('list');

  return (
    <SegmentedControl value={value} onValueChange={setValue} type="icon" aria-label="Layout">
      <SegmentedControl.Item value="list" start={<Icon icon="list" />} aria-label="List view" />
      <SegmentedControl.Item value="grid" start={<Icon icon="grid" />} aria-label="Grid view" />
    </SegmentedControl>
  );
}
```

### Segment with a CounterBadge

```tsx
import React, { useState } from 'react';
import { SegmentedControl, CounterBadge } from '@oneui/ui-native';

function InboxTabs() {
  const [value, setValue] = useState('inbox');

  return (
    <SegmentedControl value={value} onValueChange={setValue} aria-label="Inbox filters">
      <SegmentedControl.Item value="inbox" end={<CounterBadge count={4} />}>
        Inbox
      </SegmentedControl.Item>
      <SegmentedControl.Item value="archived">Archived</SegmentedControl.Item>
    </SegmentedControl>
  );
}
```

### Low-emphasis, rectangular

```tsx
import React, { useState } from 'react';
import { SegmentedControl } from '@oneui/ui-native';

function LowEmphasisSwitcher() {
  const [value, setValue] = useState('day');

  return (
    <SegmentedControl
      value={value}
      onValueChange={setValue}
      attention="low"
      trackEmphasis="low"
      shape="rectangular"
      aria-label="Time range"
    >
      <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
      <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
      <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
    </SegmentedControl>
  );
}
```

## Additional Notes

- Placement inside `<Surface mode="...">` re-steps track and selected-segment colours automatically — never set a background on a raw `View`.
- Icon-only segments (`type="icon"`) require `aria-label` on every `SegmentedControl.Item` since there is no visible text.
- A selected segment with `attention="high"` publishes its own `<Surface mode="bold">` boundary internally so a nested `CounterBadge` re-steps for contrast against the bold fill.
- **Sample app** — open **SegmentedControl** in `native-components-sample` to browse showcase suites.
