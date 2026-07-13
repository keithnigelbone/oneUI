# RadioField

## Overview

The `RadioField` component is the form-field shell for radio selections. It supports three modes: **integrated single** (label + implicit lone Radio for on/off), **multi-option** (fieldset header + multiple `<Radio>` children), and **plain option** (single `<Radio>` child labels itself). It wires error feedback, dynamic helper rows, and group-level disabled/read-only state.

Native implementation: `RadioField.native.tsx` · contract: `interface.ts` · showcase: `RadioField.showcase.native.tsx`

## Import

```typescript
import { RadioField, Radio } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so spacing, typography, and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `ReactNode` | — | Radio options; omit for integrated single mode |
| `value` | `string` | — | Group selected value (controlled) |
| `defaultValue` | `string` | — | Group default selected value (uncontrolled) |
| `onValueChange` | `(value: string) => void` | — | Group change handler |
| `checked` | `boolean` | — | Integrated single mode — controlled on/off |
| `defaultChecked` | `boolean` | — | Integrated single mode — uncontrolled default |
| `onCheckedChange` | `(checked: boolean) => void` | — | Integrated single mode toggle handler |
| `singleOptionValue` | `string` | `'on'` | Form value for the implicit lone Radio |
| `invalid` | `boolean` | — | Marks field invalid — drives error chrome |
| `label` | `string` | — | Field header label (multi) or integrated label (single) |
| `description` | `string` | — | Description below the label row |
| `infoIconSlot` | `ReactNode` | — | Trailing control beside the label |
| `fullWidth` | `boolean` | — | Stretch to fill container width |
| `required` | `boolean` | — | Renders asterisk after the label |
| `disabled` | `boolean` | — | Group-level disabled |
| `readOnly` | `boolean` | — | Group-level read-only |
| `size` | `'s' \| 'm' \| 'l'` | — | Size preset forwarded to all options |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | — | Appearance forwarded to all options |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout orientation |
| `error` | `string` | — | Error message shorthand for negative feedback |
| `feedback` | `ReactNode` | — | Custom feedback node; replaces auto-rendered `error` |
| `dynamicTextSlot` | `ReactNode` | — | Custom dynamic text row node |
| `dynamicText` | `string` | — | Leading copy for the dynamic text row |
| `helperButton` | `string` | — | Trailing label rendered as a pressable Text |
| `onHelperPress` | `() => void` | — | Handler for `helperButton` |
| `style` | `ViewStyle` | — | Inline styles for the outer wrapper |
| `aria-label` | `string` | — | Accessible name |
| `aria-describedby` | `string` | — | Id reference for description |
| `aria-hidden` | `boolean` | — | Hide from accessibility tree |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Multi-option field

```tsx
import React from 'react';
import { RadioField, Radio } from '@oneui/ui-native';

function RadioFieldDefault() {
  return (
    <RadioField
      label="Delivery speed"
      description="Applies to this order only."
      defaultValue="std"
      dynamicText="Optional"
      helperButton="Learn more"
    >
      <Radio value="std">Standard</Radio>
      <Radio value="exp">Express</Radio>
    </RadioField>
  );
}
```

### Controlled group

```tsx
import React, { useState } from 'react';
import { RadioField, Radio } from '@oneui/ui-native';

function RadioFieldControlled() {
  const [value, setValue] = useState('pro');
  return (
    <RadioField label="Plan" value={value} onValueChange={setValue}>
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
    </RadioField>
  );
}
```

### Integrated single mode

No `children` — implicit lone Radio beside the field label for on/off toggles.

```tsx
import React, { useState } from 'react';
import { RadioField } from '@oneui/ui-native';

function RadioFieldIntegratedSingle() {
  const [checked, setChecked] = useState(false);
  return (
    <RadioField
      label="Subscribe to weekly digest"
      description="Tap the radio to toggle on/off."
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}
```

### Required and error

```tsx
import React from 'react';
import { RadioField, Radio } from '@oneui/ui-native';

function RadioFieldError() {
  return (
    <RadioField
      label="Pick a delivery speed"
      description="You need to pick one before continuing."
      invalid
      error="Please choose an option to continue."
    >
      <Radio value="std">Standard</Radio>
      <Radio value="exp">Express</Radio>
    </RadioField>
  );
}
```

### With dynamic text row

```tsx
import React from 'react';
import { RadioField, Radio } from '@oneui/ui-native';

function RadioFieldWithDynamicText() {
  return (
    <RadioField
      label="Plan"
      description="Choose a plan to continue."
      defaultValue="pro"
      dynamicText="0 / 120"
      helperButton="Suggest"
    >
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
    </RadioField>
  );
}
```

### Horizontal orientation

```tsx
import React from 'react';
import { RadioField, Radio } from '@oneui/ui-native';

function RadioFieldHorizontal() {
  return (
    <RadioField label="Size" orientation="horizontal" defaultValue="m">
      <Radio value="s">Small</Radio>
      <Radio value="m">Medium</Radio>
      <Radio value="l">Large</Radio>
    </RadioField>
  );
}
```

### Surface context

```tsx
import React from 'react';
import { RadioField, Radio, Surface } from '@oneui/ui-native';

function RadioFieldOnSurface() {
  return (
    <Surface mode="bold">
      <RadioField
        appearance="neutral"
        label="Notify me"
        description="You can change this anytime."
        defaultValue="yes"
      >
        <Radio value="yes">Yes</Radio>
        <Radio value="no">No</Radio>
      </RadioField>
    </Surface>
  );
}
```

## Additional Notes

- **Three modes** — integrated single (0 children + label), plain option (1 child), multi-option (2+ children).
- **No web `validate` / `validationMode`** — drive validation externally and forward `error` / `invalid`.
- **Layers `active` → `checked` / `value`** — boolean on/off uses `checked` + `onCheckedChange`; string selection uses `value` + `onValueChange`.
- **Layers `state`** — use `readOnly`, `invalid`, and `error` instead of `'idle' | 'readOnly' | 'positive' | 'negative'`.
- **`helperText` folded** — use `error` (negative), `feedback` slot, or `dynamicText` row.
- **Sample app** — open **RadioField** in `native-components-sample` to browse all showcase suites.
- **Web parity** — mirrors `packages/ui/src/components/RadioField/RadioField.shared.ts`.
