# Checkbox

## Overview

The `Checkbox` component is a tri-state toggle control (`unchecked`, `checked`, `indeterminate`). It supports three sizes, multi-accent appearance roles, integrated label/description rows, and read-only/disabled states. For field-level composition (legend, error, multi-option groups) use `CheckboxField`.

Native implementation: `Checkbox.native.tsx` · contract: `interface.ts` · showcase: `Checkbox.showcase.native.tsx`

## Import

```typescript
import { Checkbox } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so surface and typography tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `label` | `string` | — | Visible label beside the control |
| `description` | `string` | — | Supplementary copy below the label row |
| `labelSuffixInside` | `ReactNode` | — | Inline node after label (used by `CheckboxField` for required asterisk) |
| `labelTrailing` | `ReactNode` | — | Trailing node on the label row (e.g. info `IconButton`) |
| `value` | `string` | — | Option identifier for multi-select orchestrators |
| `selected` | `boolean` | — | Controlled selected state |
| `defaultSelected` | `boolean` | — | Uncontrolled initial selected state |
| `indeterminate` | `boolean` | `false` | Mixed/indeterminate state |
| `onSelectedChange` | `(selected: boolean) => void` | — | Fires with next selected value on press |
| `onPress` | `() => void` | — | Press alias (toggle handler) |
| `size` | `'s' \| 'm' \| 'l' \| 'small' \| 'medium' \| 'large'` | `'m'` | Size preset (legacy aliases canonicalise to `'s'`/`'m'`/`'l'`) |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` → `'secondary'` | Border, hover, and checked fill role |
| `accent` | `'primary' \| 'secondary' \| 'sparkle'` | — | **Deprecated** — ignored; use `appearance` |
| `disabled` | `boolean` | `false` | Non-interactive, dimmed |
| `readOnly` | `boolean` | `false` | Visually distinct non-editable state |
| `errorHighlight` | `boolean` | `false` | Invalid chrome on the wrapper |
| `style` | `ViewStyle` | — | Additional root styles |
| `aria-label` | `string` | — | Accessible name when no `label` |
| `aria-describedby` | `string` | — | Forwarded as `accessibilityLabelledBy` |
| `aria-invalid` | `boolean \| 'true' \| 'false'` | — | Invalid state for assistive tech |
| `aria-hidden` | `boolean` | — | Hide from accessibility tree |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier on the pressable |

## Usage Examples

### Basic checkbox

```tsx
import React from 'react';
import { Checkbox } from '@oneui/ui-native';

function BasicCheckbox() {
  return <Checkbox label="Accept terms and conditions" />;
}
```

### Controlled selection

```tsx
import React, { useState } from 'react';
import { Checkbox } from '@oneui/ui-native';

function ControlledCheckbox() {
  const [selected, setSelected] = useState(false);

  return (
    <Checkbox
      label="Subscribe to newsletter"
      selected={selected}
      onSelectedChange={setSelected}
    />
  );
}
```

### States

```tsx
import React from 'react';
import { Checkbox } from '@oneui/ui-native';

function CheckboxStates() {
  return (
    <>
      <Checkbox label="Default" />
      <Checkbox label="Checked" selected />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Read-only" readOnly selected />
    </>
  );
}
```

### Sizes

```tsx
import React from 'react';
import { Checkbox } from '@oneui/ui-native';

function CheckboxSizes() {
  return (
    <>
      <Checkbox size="s" label="Small" />
      <Checkbox size="m" label="Medium" />
      <Checkbox size="l" label="Large" />
    </>
  );
}
```

### With description

```tsx
import React from 'react';
import { Checkbox } from '@oneui/ui-native';

function CheckboxWithDescription() {
  return (
    <Checkbox
      label="Enable backup"
      description="Your data is encrypted at rest."
    />
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { Checkbox } from '@oneui/ui-native';

function CheckboxAppearances() {
  return (
    <>
      <Checkbox appearance="primary" label="Primary" selected />
      <Checkbox appearance="secondary" label="Secondary" selected />
      <Checkbox appearance="positive" label="Positive" selected />
    </>
  );
}
```

### Multi-option value (inside CheckboxField)

```tsx
import React from 'react';
import { Checkbox, CheckboxField } from '@oneui/ui-native';

function MultiOption() {
  return (
    <CheckboxField label="Channels" groupDefaultValue={['email']}>
      <Checkbox value="email" label="Email" />
      <Checkbox value="sms" label="SMS" />
      <Checkbox value="push" label="Push" />
    </CheckboxField>
  );
}
```

### Surface context

```tsx
import React from 'react';
import { Checkbox, Surface } from '@oneui/ui-native';

function CheckboxOnSurface() {
  return (
    <Surface mode="bold">
      <Checkbox label="Bold surface" selected />
      <Checkbox label="Unchecked" />
    </Surface>
  );
}
```

## Additional Notes

- **State prop is `selected`**, not legacy JDS `checked` or `active`.
- **Default appearance** resolves `'auto'` to `'secondary'` (matches web).
- **Tri-state a11y** — `accessibilityState.checked` is `'mixed'` when `indeterminate`.
- **No form props** — `name`, `id`, `required` are web-only; use host form libraries on native.
- **Field wrapper** — use `CheckboxField` for legends, errors, required asterisk, and multi-option groups.
- **Sample app** — open **Checkbox** in `native-components-sample` for `CheckboxSizes`, `CheckboxStates`, `CheckboxAppearances`, `CheckboxSurfaceContext`, etc.
- **Web parity** — mirrors `packages/ui/src/components/Checkbox/Checkbox.shared.ts`.
