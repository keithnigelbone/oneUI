# CheckboxField

## Overview

The `CheckboxField` component is a field shell around `Checkbox`. It supports two modes: **single** (integrated checkbox with field label, description, error, and helper row) and **multi-option** (fieldset header + stacked `<Checkbox>` children with group selection). Use it for form layouts that need legends, validation feedback, or grouped options.

Native implementation: `CheckboxField.native.tsx` · contract: `interface.ts` · showcase: `CheckboxField.showcase.native.tsx`

## Import

```typescript
import { Checkbox, CheckboxField } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so surface and typography tokens resolve correctly.

## Props

Inherits most `CheckboxProps` except `labelSuffixInside`, `labelTrailing`, `errorHighlight`, `label`, `description`, and deprecated `accent`. Field-specific props:

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `ReactNode` | — | Multi-option mode — stack of `<Checkbox value="…">` items |
| `groupValue` | `string[]` | — | Controlled selected values (multi mode) |
| `groupDefaultValue` | `string[]` | — | Uncontrolled initial selected values (multi mode) |
| `onGroupValueChange` | `(value: string[]) => void` | — | Multi-option change handler |
| `label` | `string` | — | Field header (multi) or integrated label (single) |
| `description` | `string` | — | Description below the label row |
| `infoIconSlot` | `ReactNode` | — | Trailing control beside label (e.g. info `IconButton`) |
| `required` | `boolean` | `false` | Renders required asterisk after label |
| `invalid` | `boolean` | `false` | Mark field invalid |
| `error` | `string` | — | Error message (also sets invalid when non-empty) |
| `feedback` | `ReactNode` | — | Custom feedback node — replaces auto `error` row |
| `dynamicTextSlot` | `ReactNode` | — | Custom dynamic text row (overrides `dynamicText`/`helperButton`) |
| `dynamicText` | `string` | — | Leading copy for helper row |
| `helperButton` | `string` | — | Trailing pressable label in helper row |
| `onHelperPress` | `() => void` | — | Handler for `helperButton` press |
| `fullWidth` | `boolean` | `false` | Stretch to container width |
| `style` | `ViewStyle` | — | Outer field wrapper styles |

Plus inherited checkbox props: `selected`, `defaultSelected`, `indeterminate`, `onSelectedChange`, `size`, `appearance`, `disabled`, `readOnly`, `aria-label`, `aria-describedby`, `aria-hidden`, `accessibilityHint`, `testID`.

## Usage Examples

### Single mode (default)

```tsx
import React from 'react';
import { CheckboxField } from '@oneui/ui-native';

function SingleField() {
  return (
    <CheckboxField
      label="Send me product news"
      description="You can change this any time."
      size="m"
      dynamicText="Optional"
      helperButton="Learn more"
      onHelperPress={() => console.log('Learn more')}
    />
  );
}
```

### Controlled single checkbox

```tsx
import React, { useState } from 'react';
import { CheckboxField } from '@oneui/ui-native';

function ControlledField() {
  const [selected, setSelected] = useState(false);

  return (
    <CheckboxField
      label="Accept terms"
      selected={selected}
      onSelectedChange={setSelected}
    />
  );
}
```

### Required and error

```tsx
import React from 'react';
import { CheckboxField } from '@oneui/ui-native';

function FieldWithError() {
  return (
    <>
      <CheckboxField label="Required option" description="Marked required." required />
      <CheckboxField
        label="Accept the terms"
        description="Tap to acknowledge before continuing."
        invalid
        error="You must accept the terms to continue."
      />
    </>
  );
}
```

### Multi-option mode

```tsx
import React, { useState } from 'react';
import { Checkbox, CheckboxField } from '@oneui/ui-native';

function MultiOptionField() {
  const [groupValue, setGroupValue] = useState<string[]>(['email']);

  return (
    <CheckboxField
      label="Notification channels"
      description="Pick where we should reach you."
      groupValue={groupValue}
      onGroupValueChange={setGroupValue}
      dynamicText={`${groupValue.length} channel${groupValue.length === 1 ? '' : 's'} selected`}
    >
      <Checkbox value="email" label="Email" />
      <Checkbox value="sms" label="SMS" />
      <Checkbox value="push" label="Push notifications" description="In-app reminders." />
    </CheckboxField>
  );
}
```

### Sizes

```tsx
import React from 'react';
import { CheckboxField } from '@oneui/ui-native';

function FieldSizes() {
  return (
    <>
      <CheckboxField size="s" label="Small" dynamicText="Helper" />
      <CheckboxField size="m" label="Medium" dynamicText="Helper" />
      <CheckboxField size="l" label="Large" dynamicText="Helper" />
    </>
  );
}
```

### States

```tsx
import React from 'react';
import { CheckboxField } from '@oneui/ui-native';

function FieldStates() {
  return (
    <>
      <CheckboxField label="Default" />
      <CheckboxField label="Checked" selected />
      <CheckboxField label="Indeterminate" indeterminate />
      <CheckboxField label="Disabled" disabled />
      <CheckboxField label="Read-only" readOnly selected />
    </>
  );
}
```

### Surface context

```tsx
import React from 'react';
import { CheckboxField, Surface } from '@oneui/ui-native';

function FieldOnSurface() {
  return (
    <Surface mode="bold">
      <CheckboxField
        appearance="neutral"
        label="Enable backup"
        description="Stored encrypted in your region."
        dynamicText="Helper text"
      />
    </Surface>
  );
}
```

## Additional Notes

- **Two modes** — omit `children` for single integrated checkbox; pass `<Checkbox>` children for multi-option groups.
- **Validation** — no built-in `validate`/`validationMode`; forward `error`/`invalid` from your form library.
- **Layers mapping** — JDS `helperText` maps to `error`/`feedback`; JDS `active` maps to `selected` + `indeterminate` booleans.
- **Accessibility** — outer wrapper surfaces field label; inner checkboxes keep `accessibilityRole="checkbox"`.
- **Sample app** — open **CheckboxField** in `native-components-sample` for `CheckboxFieldMultiOption`, `CheckboxFieldRequiredAndError`, `CheckboxFieldSurfaceContext`, etc.
- **Web parity** — mirrors `packages/ui/src/components/CheckboxField/CheckboxField.shared.ts`.
