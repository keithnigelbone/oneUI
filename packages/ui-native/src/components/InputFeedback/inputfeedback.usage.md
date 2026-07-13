# InputFeedback

## Overview

The `InputFeedback` component renders contextual validation or status copy below an input. It supports four semantic variants, three attention levels, and three sizes. Negative feedback defaults to `accessibilityRole="alert"` with an assertive live region; other variants use `status` with a polite live region.

Native implementation: `InputFeedback.native.tsx` · contract: `interface.ts` · showcase: `InputFeedback.showcase.native.tsx`

## Import

```typescript
import { InputFeedback } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so role colours and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `variant` | `'negative' \| 'positive' \| 'warning' \| 'informative'` | `'negative'` | Semantic colour role |
| `attention` | `'low' \| 'medium' \| 'high'` | `'low'` | `'low'` text only; `'medium'` tinted; `'high'` filled |
| `size` | `'s' \| 'm' \| 'l'` | `'m'` | Feedback size (S / M / L) |
| `feedback_message` | `string` | — | Primary string copy (Figma `feedback_message`) |
| `customIcon` | `ReactNode` | — | Replaces the variant-default icon |
| `children` | `ReactNode` | — | Fallback content when `feedback_message` is not set |
| `role` | `'alert' \| 'status' \| 'none'` | — | Native accessibility role; defaults: `'alert'` for negative, `'status'` otherwise |
| `style` | `ViewStyle` | — | Additional styles on the root container |
| `accessibilityHint` | `string` | — | Describes the result of activating an interactive element |
| `testID` | `string` | — | Test identifier |
| `aria-label` | `string` | — | Accessible name override; falls back to message text |
| `aria-hidden` | `boolean` | — | Hide from the accessibility tree |
| `aria-describedby` | `string` | — | Id of the element this feedback describes |

## Usage Examples

### Default negative feedback

```tsx
import React from 'react';
import { InputFeedback } from '@oneui/ui-native';

function InputFeedbackDefault() {
  return (
    <InputFeedback
      variant="negative"
      attention="low"
      size="m"
      feedback_message="Password must be at least 8 characters."
    />
  );
}
```

### Variants

```tsx
import React from 'react';
import { InputFeedback } from '@oneui/ui-native';

function InputFeedbackVariants() {
  return (
    <>
      <InputFeedback variant="negative" feedback_message="Negative feedback message." />
      <InputFeedback variant="positive" feedback_message="Positive feedback message." />
      <InputFeedback variant="warning" feedback_message="Warning feedback message." />
      <InputFeedback variant="informative" feedback_message="Informative feedback message." />
    </>
  );
}
```

### Attention levels

| Level | Visual |
| ----- | ------ |
| `low` | Text only |
| `medium` | Tinted fill + stroke |
| `high` | Bold filled background |

```tsx
import React from 'react';
import { InputFeedback } from '@oneui/ui-native';

function InputFeedbackAttention() {
  return (
    <>
      <InputFeedback variant="negative" attention="low" feedback_message="Low attention" />
      <InputFeedback variant="negative" attention="medium" feedback_message="Medium attention" />
      <InputFeedback variant="negative" attention="high" feedback_message="High attention" />
    </>
  );
}
```

### Custom icon

Pass a ReactNode — native has no semantic icon name string API.

```tsx
import React from 'react';
import { InputFeedback, Icon } from '@oneui/ui-native';

function InputFeedbackCustomIcon() {
  return (
    <InputFeedback
      variant="negative"
      feedback_message="Custom icon feedback"
      customIcon={<Icon icon="error" size="4" appearance="negative" aria-hidden />}
    />
  );
}
```

### Via InputField shorthand

```tsx
import React from 'react';
import { InputField } from '@oneui/ui-native';

function InputFieldWithError() {
  return (
    <InputField
      label="Email"
      placeholder="you@example.com"
      error="Enter a valid email address"
    />
  );
}
```

### Surface context

Feedback colours remap automatically inside `<Surface mode="...">`.

```tsx
import React from 'react';
import { InputFeedback, Surface } from '@oneui/ui-native';

function InputFeedbackOnSurface() {
  return (
    <Surface mode="bold">
      <InputFeedback variant="negative" attention="low" feedback_message="Negative low" />
      <InputFeedback variant="positive" attention="medium" feedback_message="Positive medium" />
    </Surface>
  );
}
```

## Additional Notes

- **Empty message** — when `feedback_message` and `children` are both empty, the component renders nothing.
- **`feedback_message` vs `children`** — prefer `feedback_message` for string copy; `children` is the backward-compatible fallback.
- **No `disabled` prop** — remove the message to signal irrelevance; empty strings render nothing.
- **Live regions** — negative → assertive; others → polite; controlled by the resolved `role`.
- **Sample app** — open **InputFeedback** in `native-components-sample` to browse the variant × attention × size matrix.
- **Web parity** — mirrors `packages/ui/src/components/Input/internals/InputFeedback.tsx`.
