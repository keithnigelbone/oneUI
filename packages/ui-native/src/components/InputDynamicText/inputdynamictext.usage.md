# InputDynamicText

## Overview

The `InputDynamicText` component renders a helper row below an input: optional leading copy (Body / Text-Medium) and an optional trailing `Button` (`attention="low"`, `condensed`). Typically composed by `InputField` via the `dynamicText` / `helperButton` shorthands, but usable standalone for character counts, helper actions, and live-region updates.

Native implementation: `InputDynamicText.native.tsx` · contract: `interface.ts` · showcase: `InputDynamicText.showcase.native.tsx`

## Import

```typescript
import { InputDynamicText } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so typography and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `content` | `string` | — | Leading copy; row hides when both `content` and `end` are empty after trim |
| `end` | `string` | — | Trailing action label — rendered as `<Button attention="low" condensed>` |
| `size` | `'s' \| 'm' \| 'l'` | `'m'` | Row size — maps Body XS / S / M and matching Button size |
| `disabled` | `boolean` | `false` | Dims leading copy to Text-Low; disables trailing Button |
| `aria-live` | `'off' \| 'polite' \| 'assertive'` | — | Live region for leading copy; maps to `accessibilityLiveRegion` |
| `onEndClick` | `() => void` | — | Handler for the trailing Button |
| `endAriaLabel` | `string` | — | Override accessible name for the trailing control |
| `accessibilityHint` | `string` | — | Hint forwarded to the trailing Button |
| `style` | `ViewStyle` | — | Additional styles on the row container |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Default row

```tsx
import React from 'react';
import { InputDynamicText } from '@oneui/ui-native';

function InputDynamicTextDefault() {
  return (
    <InputDynamicText
      size="m"
      content="0 / 280 characters"
      end="Helper Button"
      onEndClick={() => undefined}
    />
  );
}
```

### Sizes

```tsx
import React from 'react';
import { InputDynamicText } from '@oneui/ui-native';

function InputDynamicTextSizes() {
  return (
    <>
      <InputDynamicText size="s" content="Dynamic text" end="Clear" onEndClick={() => undefined} />
      <InputDynamicText size="m" content="Dynamic text" end="Clear" onEndClick={() => undefined} />
      <InputDynamicText size="l" content="Dynamic text" end="Clear" onEndClick={() => undefined} />
    </>
  );
}
```

### Slot combinations

```tsx
import React from 'react';
import { InputDynamicText } from '@oneui/ui-native';

function InputDynamicTextSlots() {
  return (
    <>
      <InputDynamicText size="m" content="0 / 280 characters" />
      <InputDynamicText size="m" end="Helper Button" onEndClick={() => undefined} />
      <InputDynamicText size="m" content="Trim whitespace allowed" end="Clear" onEndClick={() => undefined} />
    </>
  );
}
```

### Disabled

```tsx
import React from 'react';
import { InputDynamicText } from '@oneui/ui-native';

function InputDynamicTextDisabled() {
  return (
    <InputDynamicText
      size="m"
      content="0 / 280 characters"
      end="Helper Button"
      disabled
      onEndClick={() => undefined}
    />
  );
}
```

### Live region

Announce character-count updates to screen readers.

```tsx
import React from 'react';
import { InputDynamicText } from '@oneui/ui-native';

function InputDynamicTextLiveRegion() {
  return (
    <InputDynamicText
      size="m"
      content="Updating: 12 / 100 characters"
      end="Clear"
      aria-live="polite"
      onEndClick={() => undefined}
    />
  );
}
```

### Via InputField shorthand

Prefer composing through `InputField` when building full form fields.

```tsx
import React from 'react';
import { InputField } from '@oneui/ui-native';

function InputFieldWithDynamicText() {
  return (
    <InputField
      label="Bio"
      placeholder="Tell us about yourself"
      dynamicText="0 / 240 characters"
      helperButton="Clear"
      onHelperPress={() => undefined}
    />
  );
}
```

### Surface context

Leading copy colour remaps automatically inside `<Surface mode="...">`.

```tsx
import React from 'react';
import { InputDynamicText, Surface } from '@oneui/ui-native';

function InputDynamicTextOnSurface() {
  return (
    <Surface mode="bold">
      <InputDynamicText
        size="m"
        content="0 / 280 characters"
        end="Helper Button"
        onEndClick={() => undefined}
      />
    </Surface>
  );
}
```

## Additional Notes

- **Empty state** — when both `content` and `end` are empty/whitespace after trim, the component renders `null`.
- **Trailing-only layout** — when only `end` is set, the row right-aligns the trailing slot.
- **`onEndClick` required** — a visible `helperButton` without a handler renders a non-functional button.
- **No JDS `helperText` prop** — use `content` for leading copy and `end` for the trailing action label.
- **Sample app** — open **InputDynamicText** in `native-components-sample` to browse all showcase suites.
- **Web parity** — mirrors `packages/ui/src/components/Input/internals/InputDynamicText.tsx`.
