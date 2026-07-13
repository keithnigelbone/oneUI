# Card

## Overview

The `Card` component is a flexible content container. It renders as a static panel or an interactive pressable surface, supports all multi-accent appearance roles, and integrates with the OneUI surface system so children automatically adapt on tinted backgrounds.

Native implementation: `Card.native.tsx` · contract: `interface.ts` · showcase: `Card.showcase.native.tsx`

## Import

```typescript
import { Card } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` (or `OneUINativeThemeProvider`) so spacing, typography, and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `ReactNode` | — | Card content |
| `surface` | `'default' \| 'ghost' \| 'minimal' \| 'subtle' \| 'moderate' \| 'bold' \| 'elevated'` | — | When set, the card becomes a `<Surface>` and children adapt via the resolved surface context |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'primary'` | Multi-accent colour role used when `surface` is set |
| `interactive` | `boolean` | `false` | Enables press feedback (active opacity + elevation lift) and wraps content in a `Pressable` |
| `disabled` | `boolean` | `false` | Disables the card (only applies when `interactive` is `true`) |
| `onPress` | `() => void` | — | Press handler (interactive cards) |
| `onClick` | `() => void` | — | Web parity alias for `onPress` |
| `style` | `ViewStyle` | — | Additional native styles on the root element |
| `aria-label` | `string` | — | VoiceOver / TalkBack label |
| `accessibilityHint` | `string` | — | Describes the result of pressing (React Native) |
| `testID` | `string` | — | Test identifier on the root element |

## Usage Examples

### Static card

```tsx
import React from 'react';
import { Card } from '@oneui/ui-native';
import { Text } from '@oneui/ui-native';

function StaticCard() {
  return (
    <Card aria-label="Profile summary">
      <Text>John Doe</Text>
      <Text>john@example.com</Text>
    </Card>
  );
}
```

### Interactive card

Set `interactive` and provide `onPress`. The card receives a `Pressable` wrapper with elevation lift on press.

```tsx
import React from 'react';
import { Card, Text } from '@oneui/ui-native';

function InteractiveCard() {
  return (
    <Card
      interactive
      onPress={() => console.log('Card pressed')}
      aria-label="Open article"
      accessibilityHint="Opens the full article"
    >
      <Text>Tap to open</Text>
    </Card>
  );
}
```

### Disabled interactive card

```tsx
import React from 'react';
import { Card, Text } from '@oneui/ui-native';

function DisabledCard() {
  return (
    <Card
      interactive
      disabled
      onPress={() => {}}
      aria-label="Unavailable"
    >
      <Text>Disabled card</Text>
    </Card>
  );
}
```

### Tinted surface card

Use the `surface` prop to make the card a themed surface. Children automatically adapt their token resolution to the card's tint level.

```tsx
import React from 'react';
import { Card, Text } from '@oneui/ui-native';

function SubtleCard() {
  return (
    <Card surface="subtle" aria-label="Highlighted section">
      <Text>Tinted background content</Text>
    </Card>
  );
}
```

### Surface + appearance role

Combine `surface` with `appearance` to tint the card using a non-primary role.

```tsx
import React from 'react';
import { Card, Text } from '@oneui/ui-native';

function SecondarySubtleCard() {
  return (
    <Card surface="subtle" appearance="secondary" aria-label="Secondary card">
      <Text>Secondary-tinted content</Text>
    </Card>
  );
}
```

### Interactive surface card

```tsx
import React from 'react';
import { Card, Text } from '@oneui/ui-native';

function InteractiveSurfaceCard() {
  return (
    <Card
      surface="subtle"
      interactive
      onPress={() => console.log('Pressed')}
      aria-label="Tap to expand"
    >
      <Text>Interactive tinted card</Text>
    </Card>
  );
}
```

### Nested inside a Surface

When `Card` is placed inside a `<Surface>`, it inherits the parent surface context. The card's own tokens (stroke, background) remap automatically.

```tsx
import React from 'react';
import { Card, Surface, Text } from '@oneui/ui-native';

function CardOnBoldSurface() {
  return (
    <Surface mode="bold">
      <Card aria-label="Content card">
        <Text>Content on bold surface</Text>
      </Card>
    </Surface>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { Card, Text } from '@oneui/ui-native';

function CardAppearances() {
  return (
    <>
      <Card surface="subtle" appearance="positive" aria-label="Positive card">
        <Text>Positive</Text>
      </Card>
      <Card surface="subtle" appearance="negative" aria-label="Negative card">
        <Text>Negative</Text>
      </Card>
      <Card surface="subtle" appearance="warning" aria-label="Warning card">
        <Text>Warning</Text>
      </Card>
    </>
  );
}
```

### Accessibility

Provide `aria-label` on all cards. For interactive cards, add `accessibilityHint` to describe the outcome of the press action.

```tsx
import React from 'react';
import { Card, Text } from '@oneui/ui-native';

function AccessibleCard() {
  return (
    <Card
      interactive
      onPress={() => {}}
      aria-label="Premium plan"
      accessibilityHint="Activates the premium subscription"
    >
      <Text>Upgrade to Premium</Text>
    </Card>
  );
}
```

## Additional Notes

- **`surface` vs plain background** — always use the `surface` prop instead of setting `backgroundColor` manually. A raw `View` with a background bypasses the `[data-surface]` token-remapping cascade, causing children to render with incorrect colours.
- **Interactive cards** — `disabled` is only meaningful when `interactive` is also `true`. A non-interactive card cannot be disabled.
- **`onPress` / `onClick`** — both are supported; `onPress` takes priority when both are provided.
- **Elevation** — interactive cards lift to elevation level 2 while pressed and return to level 0 on release.
- **Sample app** — open **Card** in `native-components-sample` to browse the full showcase suite.
- **Web parity** — mirrors `packages/ui/src/components/Card/Card.tsx`.
