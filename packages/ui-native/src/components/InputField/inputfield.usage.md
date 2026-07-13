# InputField

## Overview

The `InputField` component is the form-field aggregator: label header (with optional description, required asterisk, and info icon), bordered `Input`, optional `InputFeedback`, and optional `InputDynamicText` helper row. It forwards input props to the inner shell and wires `accessibilityLabel` from the visible `label` automatically.

Native implementation: `InputField.native.tsx` · contract: `interface.ts` · showcase: `InputField.showcase.native.tsx`

## Import

```typescript
import { InputField } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so spacing, typography, and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `label` | `string` | — | Label text for the field |
| `description` | `string` | — | Description text below the label row |
| `infoIcon` | `boolean` | — | Shows default info control when `true` with a string `label` |
| `infoIconSlot` | `ReactNode` | — | Replaces the default info `IconButton` |
| `infoIconAriaLabel` | `string` | `'More information'` | Accessible name for the default info button |
| `size` | `'xs' \| 's' \| 'm' \| 'l'` | `'m'` | Input size |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` | Multi-accent role (`'auto'` → `'secondary'`) |
| `shape` | `'default' \| 'pill'` | `'default'` | Container shape |
| `attention` | `'medium' \| 'high'` | `'medium'` | Visual attention |
| `start` | `ReactNode` | — | Leading slot (delegated to Input) |
| `start2` | `ReactNode` | — | Second leading slot |
| `end` | `ReactNode` | — | Trailing slot |
| `end2` | `ReactNode` | — | Second trailing slot |
| `placeholder` | `string` | — | Placeholder text |
| `value` | `string` | — | Current value (controlled) |
| `defaultValue` | `string` | — | Default value (uncontrolled) |
| `onChange` | `(value: string) => void` | — | Change handler |
| `onSubmit` | `(value: string) => void` | — | Submit handler |
| `disabled` | `boolean` | — | Disabled state |
| `readOnly` | `boolean` | — | Read-only state |
| `required` | `boolean` | — | Adds visible asterisk + a11y required |
| `invalid` | `boolean` | — | Paints negative stroke + default negative feedback |
| `maxLength` | `number` | — | Maximum character length |
| `id` | `string` | — | Field id |
| `name` | `string` | — | Web parity; RN ignores it |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url' \| 'search'` | — | Input type |
| `autoComplete` | `string` | — | RN `autoComplete` passthrough |
| `autoFocus` | `boolean` | — | RN `autoFocus` passthrough |
| `onFocus` | `(e: InputFocusEvent) => void` | — | Focus handler |
| `onBlur` | `(e: InputFocusEvent) => void` | — | Blur handler |
| `error` | `string` | — | Shorthand for negative `InputFeedback` row |
| `feedback` | `ReactNode` | — | Pre-built `InputFeedback`; wins over `error` |
| `dynamicText` | `string` | — | Leading copy for the dynamic text row |
| `helperButton` | `string` | — | Trailing action label for the dynamic text row |
| `onHelperPress` | `() => void` | — | Handler for `helperButton` |
| `fullWidth` | `boolean` | — | Stretch to fill parent width |
| `style` | `ViewStyle` | — | Additional styles on the root container |
| `testID` | `string` | — | Forwarded to inner `<Input>`; root is `` `${testID}-field` `` |
| `accessibilityLabel` | `string` | — | Override for inner Input a11y name |
| `accessibilityHint` | `string` | — | Hint forwarded to inner Input |
| `aria-label` | `string` | — | Web-aligned alias for `accessibilityLabel` |
| `aria-describedby` | `string` | — | Id of the describing element |
| `aria-invalid` | `boolean` | — | Alias for `invalid` |
| `aria-hidden` | `boolean` | — | Hide entire stack from a11y tree |

## Usage Examples

### Default field

```tsx
import React from 'react';
import { InputField } from '@oneui/ui-native';

function InputFieldDefault() {
  return <InputField label="Label" placeholder="Placeholder" />;
}
```

### With description and required

```tsx
import React from 'react';
import { InputField } from '@oneui/ui-native';

function InputFieldRequired() {
  return (
    <InputField
      label="Required field"
      description="Helpful supporting copy below the label."
      required
      placeholder="Adds asterisk + a11y required"
    />
  );
}
```

### Error state

```tsx
import React from 'react';
import { InputField } from '@oneui/ui-native';

function InputFieldError() {
  return (
    <InputField
      label="Email"
      placeholder="you@example.com"
      type="email"
      error="Enter a valid email address"
    />
  );
}
```

### Full composition

```tsx
import React from 'react';
import { InputField } from '@oneui/ui-native';

function InputFieldFull() {
  return (
    <InputField
      label="Email address"
      description="We will never share your address."
      infoIcon
      infoIconAriaLabel="Why we ask for your email"
      placeholder="you@example.com"
      type="email"
      required
      error="Enter a valid email address"
      dynamicText="0 / 240 characters"
      helperButton="Clear"
      onHelperPress={() => undefined}
    />
  );
}
```

### 4-slot system

```tsx
import React from 'react';
import { InputField, Icon } from '@oneui/ui-native';

function InputFieldWithSlots() {
  return (
    <InputField
      label="Amount"
      start={<Icon icon="heart" />}
      start2="$"
      end2=".00"
      end={<Icon icon="close" />}
      placeholder="Enter amount"
    />
  );
}
```

### Controlled field

```tsx
import React, { useState } from 'react';
import { InputField } from '@oneui/ui-native';

function InputFieldControlled() {
  const [value, setValue] = useState('Hello');
  return (
    <InputField
      label="Controlled"
      value={value}
      onChange={setValue}
      placeholder="Type to update"
    />
  );
}
```

### Search pattern

```tsx
import React from 'react';
import { InputField, Icon } from '@oneui/ui-native';

function InputFieldSearch() {
  return (
    <InputField
      label="Search"
      shape="pill"
      start={<Icon icon="search" />}
      end={<Icon icon="close" />}
      placeholder="Search products, brands, categories…"
    />
  );
}
```

### Surface context

```tsx
import React from 'react';
import { InputField, Surface, Icon } from '@oneui/ui-native';

function InputFieldOnSurface() {
  return (
    <Surface mode="bold" appearance="secondary">
      <InputField
        label="Medium (outlined)"
        placeholder="Medium on bold"
        start={<Icon icon="heart" />}
      />
      <InputField
        label="High (filled)"
        attention="high"
        placeholder="Filled on bold"
        start={<Icon icon="heart" />}
      />
    </Surface>
  );
}
```

## Additional Notes

- **`accessibilityLabel` resolution** — `accessibilityLabel` → `aria-label` → trimmed `label`; visible label alone is sufficient.
- **`invalid` derivation** — true when `invalid`, `aria-invalid`, or non-empty `error` is set.
- **`infoIcon`** renders only when `infoIcon={true}` AND a string `label` is present.
- **`testID`** targets the inner `<Input>` control; the decorative root wrapper uses `` `${testID}-field` ``.
- **No web `validate` / `validationMode`** — drive validation from the host form library and forward `error` / `invalid`.
- **Sample app** — open **InputField** in `native-components-sample` to browse all showcase suites.
- **Web parity** — mirrors `packages/ui/src/components/InputField/InputField.shared.ts`.
