# Radio

## Overview

The `Radio` component is a standalone radio control with optional label, description, and multi-accent appearance. It supports controlled (`checked` + `onChange`) and uncontrolled (`defaultChecked`) modes. For mutual exclusion across multiple options, compose via `RadioField` — native has no `<RadioGroup>` orchestrator.

Native implementation: `Radio.native.tsx` · contract: `interface.ts` · showcase: `Radio.showcase.native.tsx`

## Import

```typescript
import { Radio } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so appearance and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `string` | — | Option identifier — used by `RadioField` to map selections |
| `label` | `string` | — | Visible label (takes precedence over `children`) |
| `description` | `string` | — | Supplementary copy below the label row |
| `children` | `ReactNode` | — | Option label when `label` is omitted |
| `labelSuffixInside` | `ReactNode` | — | Inline node after label text (e.g. required asterisk from `RadioField`) |
| `labelTrailing` | `ReactNode` | — | Trailing node on the label row (e.g. info icon from `RadioField`) |
| `errorHighlight` | `boolean` | — | Invalid chrome (mirrors `Input.errorHighlight`) |
| `disabled` | `boolean` | — | Disabled state |
| `readOnly` | `boolean` | — | Read-only — focusable but cannot be toggled |
| `size` | `'s' \| 'm' \| 'l'` | `'m'` | Size preset |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` | Multi-accent role (`'auto'` → `'secondary'`) |
| `accent` | `'primary' \| 'secondary' \| 'sparkle'` | — | **Deprecated** — ignored; use `appearance` |
| `checked` | `boolean` | — | Checked state (controlled) |
| `defaultChecked` | `boolean` | `false` | Initial checked state (uncontrolled) |
| `onChange` | `(checked: boolean) => void` | — | Called when checked state would change |
| `onPress` | `() => void` | — | Raw press handler — fires before `onChange` |
| `style` | `ViewStyle` | — | Inline styles for the wrapper |
| `aria-label` | `string` | — | Accessible name |
| `aria-labelledby` | `string` | — | Id reference for labelling |
| `aria-describedby` | `string` | — | Id reference for description |
| `aria-invalid` | `boolean \| 'true' \| 'false'` | — | Invalid state |
| `aria-hidden` | `boolean` | — | Hide from accessibility tree |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `accessibilityLabel` | `string` | — | Native accessible name |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### With label

```tsx
import React from 'react';
import { Radio } from '@oneui/ui-native';

function RadioWithLabel() {
  return (
    <Radio aria-label="Subscribe to updates" size="m">
      Subscribe to weekly product updates
    </Radio>
  );
}
```

### Controlled selection

For mutual exclusion, manage selection in parent state or use `RadioField`.

```tsx
import React, { useState } from 'react';
import { Radio } from '@oneui/ui-native';

function RadioControlled() {
  const [value, setValue] = useState('newsletter');
  const options = [
    { value: 'newsletter', label: 'Subscribe to newsletter' },
    { value: 'updates', label: 'Product updates only' },
    { value: 'none', label: 'No notifications' },
  ] as const;

  return (
    <>
      {options.map((opt) => (
        <Radio
          key={opt.value}
          value={opt.value}
          checked={value === opt.value}
          onPress={() => setValue(opt.value)}
          aria-label={opt.label}
        >
          {opt.label}
        </Radio>
      ))}
    </>
  );
}
```

### Sizes

```tsx
import React from 'react';
import { Radio } from '@oneui/ui-native';

function RadioSizes() {
  return (
    <>
      <Radio size="s" checked={false} aria-label="Small unchecked" />
      <Radio size="m" checked aria-label="Medium checked" />
      <Radio size="l" checked={false} aria-label="Large unchecked" />
    </>
  );
}
```

### States

```tsx
import React from 'react';
import { Radio } from '@oneui/ui-native';

function RadioStates() {
  return (
    <>
      <Radio checked={false}>Unchecked</Radio>
      <Radio checked>Checked</Radio>
      <Radio checked={false} disabled>Disabled unchecked</Radio>
      <Radio checked disabled>Disabled checked</Radio>
      <Radio checked={false} readOnly>Read-only unchecked</Radio>
      <Radio checked readOnly>Read-only checked</Radio>
    </>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { Radio } from '@oneui/ui-native';

function RadioAppearances() {
  return (
    <>
      <Radio appearance="primary" checked>Primary</Radio>
      <Radio appearance="secondary" checked>Secondary</Radio>
      <Radio appearance="positive" checked>Positive</Radio>
    </>
  );
}
```

### Surface context

```tsx
import React from 'react';
import { Radio, Surface } from '@oneui/ui-native';

function RadioOnSurface() {
  return (
    <Surface mode="bold">
      <Radio appearance="secondary" checked aria-label="Checked">Checked</Radio>
      <Radio appearance="secondary" checked={false} aria-label="Unchecked">Unchecked</Radio>
    </Surface>
  );
}
```

## Additional Notes

- **No native `<RadioGroup>`** — multi-option semantics live in `RadioField`; uncontrolled Radios toggle independently.
- **`checked` not `selected`** — Layers/JDS `selected` maps to `checked`.
- **`size` lowercase** — `'s' | 'm' | 'l'`, not `'S' | 'M' | 'L'`.
- **`accent` deprecated** — use `appearance` for colour roles.
- **`accessibilityLabel` resolution** — `accessibilityLabel` → `aria-label` → `label`.
- **Sample app** — open **Radio** in `native-components-sample` to browse `RadioSizes`, `RadioInteractive`, etc.
- **Web parity** — see `docs/parity/radio-web-native-parity.md` for platform differences.
