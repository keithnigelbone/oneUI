# Input

## Overview

The `Input` component is the bordered text-entry shell with a 4-slot system (`start`, `start2`, `end`, `end2`), multi-accent appearance, two attention levels, and four t-shirt sizes including a dedicated XS tier. Label, description, required asterisk, and feedback rows live in the higher-level `InputField` aggregator — use `Input` directly only when you manage those externally.

Native implementation: `Input.native.tsx` · contract: `interface.ts` · showcase: `Input.showcase.native.tsx`

## Import

```typescript
import { Input } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so spacing, typography, and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `size` | `'xs' \| 's' \| 'm' \| 'l'` | `'m'` | T-shirt size (XS = f6, S = f8, M = f10, L = f12) |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` | Multi-accent role (`'auto'` → `'secondary'`) |
| `shape` | `'default' \| 'pill'` | `'default'` | Container shape |
| `attention` | `'medium' \| 'high'` | `'medium'` | `'medium'` outlined; `'high'` filled |
| `errorHighlight` | `boolean` | — | Paints negative bold stroke on the container |
| `start` | `ReactNode` | — | Leading slot — Icon, IconButton, Avatar, Image, ChipGroup, or Text |
| `start2` | `ReactNode` | — | Second leading slot — typically prefix text |
| `end` | `ReactNode` | — | Trailing slot — IconButton, Icon, Button, or Text |
| `end2` | `ReactNode` | — | Second trailing slot — suffix text |
| `placeholder` | `string` | — | Placeholder text |
| `value` | `string` | — | Current value (controlled) |
| `defaultValue` | `string` | — | Default value (uncontrolled) |
| `onChange` | `(value: string) => void` | — | Change handler — receives the new value string |
| `onSubmit` | `(value: string) => void` | — | Submit handler — wired to `TextInput.onSubmitEditing` |
| `disabled` | `boolean` | — | Whether the input is disabled |
| `readOnly` | `boolean` | — | Whether the input is read-only |
| `required` | `boolean` | — | Forwarded to a11y; no native visual effect |
| `maxLength` | `number` | — | Maximum character length |
| `id` | `string` | — | RN `TextInput.id` |
| `name` | `string` | — | Web parity; RN ignores it |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url' \| 'search'` | — | Maps to `keyboardType` + `secureTextEntry` |
| `autoComplete` | `string` | — | RN `autoComplete` passthrough |
| `autoFocus` | `boolean` | — | RN `autoFocus` passthrough |
| `onFocus` | `(e: InputFocusEvent) => void` | — | Focus handler |
| `onBlur` | `(e: InputFocusEvent) => void` | — | Blur handler |
| `onKeyPress` | `(e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void` | — | Key press handler |
| `onSubmitEditing` | `(e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void` | — | Raw submit event |
| `style` | `ViewStyle` | — | Additional styles on the bordered container |
| `testID` | `string` | — | Test identifier |
| `accessibilityLabel` | `string` | — | Accessible name (required without external label) |
| `accessibilityHint` | `string` | — | Hint describing what activating the input does |
| `aria-label` | `string` | — | Web-aligned alias for `accessibilityLabel` |
| `aria-describedby` | `string` | — | Id of the element that describes the input |
| `aria-invalid` | `boolean` | — | Marks invalid; pairs with `errorHighlight` |
| `aria-hidden` | `boolean` | — | Hide from the accessibility tree |

## Usage Examples

### Default input

```tsx
import React from 'react';
import { Input } from '@oneui/ui-native';

function InputDefault() {
  return <Input placeholder="Placeholder" size="m" appearance="auto" accessibilityLabel="Search" />;
}
```

### Sizes

Native ships a dedicated XS (f6) tier — unlike web, which coerces `xs` to `s`.

```tsx
import React from 'react';
import { Input } from '@oneui/ui-native';

function InputSizes() {
  return (
    <>
      {(['xs', 's', 'm', 'l'] as const).map((size) => (
        <Input
          key={size}
          size={size}
          accessibilityLabel={`Size ${size.toUpperCase()}`}
          placeholder={`Size ${size.toUpperCase()}`}
        />
      ))}
    </>
  );
}
```

### Attention levels

| Level | Visual |
| ----- | ------ |
| `medium` | Outlined — transparent fill + stroke at rest |
| `high` | Filled — role Subtle background |

```tsx
import React from 'react';
import { Input } from '@oneui/ui-native';

function InputAttention() {
  return (
    <>
      <Input attention="medium" placeholder="Outlined" accessibilityLabel="Outlined" />
      <Input attention="high" placeholder="Filled" accessibilityLabel="Filled" />
    </>
  );
}
```

### 4-slot system

```tsx
import React from 'react';
import { Input, Icon } from '@oneui/ui-native';

function InputWithSlots() {
  return (
    <>
      <Input start={<Icon icon="heart" />} placeholder="With start icon" accessibilityLabel="With icon" />
      <Input start2="$" placeholder="0.00" type="number" accessibilityLabel="Amount" />
      <Input end2="kg" placeholder="Enter weight" type="number" accessibilityLabel="Weight" />
      <Input
        start={<Icon icon="heart" />}
        start2="$"
        end2=".00"
        end={<Icon icon="close" />}
        placeholder="Enter amount"
        accessibilityLabel="Amount"
      />
    </>
  );
}
```

### Controlled input

```tsx
import React, { useState } from 'react';
import { Input } from '@oneui/ui-native';

function InputControlled() {
  const [value, setValue] = useState('Hello');
  return (
    <Input
      accessibilityLabel="Controlled input"
      value={value}
      onChange={setValue}
      placeholder="Type to update"
    />
  );
}
```

### Error state

Pair `errorHighlight` with visible feedback text for accessibility.

```tsx
import React from 'react';
import { Input } from '@oneui/ui-native';

function InputError() {
  return (
    <Input
      accessibilityLabel="Input with error"
      placeholder="Error state"
      errorHighlight
      aria-invalid
    />
  );
}
```

### Search pattern

```tsx
import React from 'react';
import { Input, Icon } from '@oneui/ui-native';

function InputSearch() {
  return (
    <Input
      accessibilityLabel="Search"
      shape="pill"
      start={<Icon icon="search" />}
      end={<Icon icon="close" />}
      placeholder="Search products, brands, categories…"
    />
  );
}
```

### Surface context

Place inputs inside `<Surface mode="...">` so border, fill, and slot icon colours remap automatically.

```tsx
import React from 'react';
import { Input, Surface, Icon } from '@oneui/ui-native';

function InputOnSurface() {
  return (
    <Surface mode="bold" appearance="secondary">
      <Input
        accessibilityLabel="Medium outlined on bold"
        placeholder="Medium on bold"
        start={<Icon icon="heart" />}
      />
      <Input
        accessibilityLabel="High filled on bold"
        attention="high"
        placeholder="Filled on bold"
        start={<Icon icon="heart" />}
      />
    </Surface>
  );
}
```

## Additional Notes

- **No built-in label** — wrap in `<InputField label="…">` or pass `accessibilityLabel` explicitly.
- **`'auto'` appearance** resolves to `'secondary'` (Figma default for accent paints).
- **`readOnly` vs `disabled`** — read-only stays focusable; only `disabled` announces as disabled.
- **`onChange` signature** — receives `(value: string)`, not a DOM event.
- **Native XS size** — intentionally diverges from web size coercion; see parity docs.
- **Sample app** — open **Input** in `native-components-sample` to browse all showcase suites.
- **Web parity** — mirrors `packages/ui/src/components/Input/Input.shared.ts`.
