# Text

## Overview

The `Text` component is the typography primitive for all visible copy. It supports six variants (display, headline, title, body, label, code), per-variant size scales, content-colour attention levels, multi-accent appearances, weight, decorations, truncation, alignment, inline links, and script-aware typography via `lang` / `script`.

Native implementation: `Text.native.tsx` · contract: `interface.ts` · showcase: `Text.showcase.native.tsx`

## Import

```typescript
import { Text } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` (and optionally `TypographyLanguageProvider`) so typography and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `variant` | `'body' \| 'label' \| 'title' \| 'headline' \| 'display' \| 'code'` | `'body'` | Typography role |
| `size` | Variant-dependent — see below | `'M'` (resolved per variant) | Size within the variant scale |
| `weight` | `'high' \| 'medium' \| 'low'` | `'medium'` | Font weight (code variant always medium) |
| `attention` | `'high' \| 'medium' \| 'low' \| 'tintedA11y'` | `'medium'` | Content-colour emphasis |
| `italic` | `boolean` | `false` | Italic decoration |
| `underline` | `boolean` | `false` | Underline decoration |
| `strikethrough` | `boolean` | `false` | Strikethrough decoration |
| `language` | `'latin' \| 'others'` | `'latin'` | **Deprecated** — use `lang` or `script` |
| `lang` | `string` | — | BCP 47 language tag for script inference |
| `script` | `TypographyScriptId \| string` | — | Explicit script override |
| `scriptMode` | `'ui' \| 'reading'` | `'ui'` | UI vs reading font + line-height mode |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` | Multi-accent role (`'auto'` → `'neutral'`) |
| `text` | `string` | — | Convenience string content; `children` wins when both set |
| `textAlign` | `'left' \| 'center' \| 'right'` | — | Text alignment |
| `maxLines` | `number` | — | Maximum visible lines before truncation |
| `link` | `string \| ReactNode` | — | Inline substring link or trailing link slot |
| `onLinkPress` | `() => void` | — | Handler when inline `link` substring is tapped |
| `onPress` | `() => void` | — | Optional press handler — promotes role to `link` |
| `style` | `TextStyle` | — | Additional text styles |
| `children` | `ReactNode` | — | Text content |
| `aria-label` | `string` | — | Accessible name when no visible text |
| `aria-hidden` | `boolean` | — | Hide from accessibility tree |
| `accessibilityHint` | `string` | — | Describes interactive activation result |
| `testID` | `string` | — | Test identifier |

### Size by variant

| Variant | Valid sizes |
| ------- | ----------- |
| `display`, `headline`, `title` | `'L'`, `'M'`, `'S'` |
| `body` | `'L'`, `'M'`, `'S'`, `'XS'`, `'2XS'` (no `'3XS'`) |
| `label` | `'L'`, `'M'`, `'S'`, `'XS'`, `'2XS'`, `'3XS'` |
| `code` | `'M'`, `'S'`, `'XS'` |

Invalid size/variant pairs are clamped at runtime with a dev warning.

## Usage Examples

### Default body text

```tsx
import React from 'react';
import { Text } from '@oneui/ui-native';

function TextDefault() {
  return (
    <Text variant="body" size="M">
      The quick brown fox jumps over the lazy dog
    </Text>
  );
}
```

### Variants and sizes

```tsx
import React from 'react';
import { Text } from '@oneui/ui-native';

function TextVariants() {
  return (
    <>
      <Text variant="display" size="L" attention="high">Display L</Text>
      <Text variant="headline" size="M" attention="high">Headline M</Text>
      <Text variant="title" size="S" attention="medium">Title S</Text>
      <Text variant="body" size="M" attention="medium">Body M</Text>
      <Text variant="label" size="S" attention="medium">Label S</Text>
      <Text variant="code" size="M">const x = 1;</Text>
    </>
  );
}
```

### Attention and weight

```tsx
import React from 'react';
import { Text } from '@oneui/ui-native';

function TextAttentionWeight() {
  return (
    <>
      <Text variant="body" attention="high" weight="high">High attention, high weight</Text>
      <Text variant="body" attention="medium" weight="medium">Medium attention, medium weight</Text>
      <Text variant="body" attention="low" weight="low">Low attention, low weight</Text>
      <Text variant="label" attention="tintedA11y" appearance="primary">Tinted A11y primary</Text>
    </>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { Text } from '@oneui/ui-native';

function TextAppearances() {
  return (
    <>
      <Text variant="title" size="M" appearance="primary" attention="high">Primary</Text>
      <Text variant="title" size="M" appearance="positive" attention="tintedA11y">Positive</Text>
      <Text variant="title" size="M" appearance="negative" attention="high">Negative</Text>
    </>
  );
}
```

### Decorations

```tsx
import React from 'react';
import { Text } from '@oneui/ui-native';

function TextDecorations() {
  return (
    <>
      <Text italic>The quick brown fox</Text>
      <Text underline>The quick brown fox</Text>
      <Text strikethrough>The quick brown fox</Text>
      <Text italic underline strikethrough>Combined</Text>
    </>
  );
}
```

### Truncation

```tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from '@oneui/ui-native';
import { tokens } from '@oneui/tokens';

function TextTruncation() {
  return (
    <View style={{ maxWidth: tokens.spacing['40'] }}>
      <Text variant="body" maxLines={1}>
        This text overflows and truncates with an ellipsis after a single line.
      </Text>
    </View>
  );
}
```

### Inline link

```tsx
import React from 'react';
import { Text } from '@oneui/ui-native';

function TextLink() {
  return (
    <Text variant="body" link="documentation" onLinkPress={() => undefined}>
      Read more in the documentation before continuing.
    </Text>
  );
}
```

### Surface context

Text colours remap automatically inside `<Surface mode="...">`.

```tsx
import React from 'react';
import { Text, Surface } from '@oneui/ui-native';

function TextOnSurface() {
  return (
    <Surface mode="bold">
      <Text variant="title" size="M" attention="high">Title — high attention</Text>
      <Text variant="body" size="M" attention="medium">Body — medium attention</Text>
      <Text variant="label" size="S" attention="tintedA11y" appearance="primary">
        Label — tintedA11y primary
      </Text>
    </Surface>
  );
}
```

## Additional Notes

- **Not React Native's `Text`** — import from `@oneui/ui-native`, not `react-native`.
- **No explicit heading roles** — `display` / `headline` / `title` variants do not set `accessibilityRole="header"`; Text is a generic primitive.
- **`onPress` vs `link`** — `onPress` promotes the root to `link` role unless an inner rendered link exists.
- **`language` deprecated** — prefer `lang` (BCP 47) or explicit `script`.
- **Invalid sizes clamped** — e.g. body `'3XS'` falls back to `'2XS'` with a dev warning.
- **Sample app** — open **Text** in `native-components-sample` to browse `TextVariants`, `TextSurfaceContext`, etc.
- **Web parity** — mirrors `packages/ui/src/components/text/Text.shared.ts`.
