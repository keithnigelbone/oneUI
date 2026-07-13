# Container

## Overview

The `Container` component is a layout wrapper that constrains content width and applies platform grid margins. Three variants cover typical page layouts: fluid (default, grows with viewport), fixed (capped max-width), and full-bleed (edge-to-edge). Presentational only — no landmark role on native.

Native implementation: `Container.native.tsx` · contract: `interface.ts` · showcase: `Container.showcase.native.tsx`

## Import

```typescript
import { Container } from '@oneui/ui-native';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `variant` | `'fluid' \| 'fixed' \| 'full-bleed'` | `'fluid'` | Layout constraint mode |
| `maxWidth` | `string \| number` | — | Override max width on `fixed` variant (e.g. `320` or `'480px'`) |
| `children` | `ReactNode` | — | Page content |
| `style` | `ViewStyle` | — | Additional container styles |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Fluid (default)

Fills the viewport and applies platform grid margin. No upper width cap — for apps, dashboards, and tools.

```tsx
import React from 'react';
import { Container, Text } from '@oneui/ui-native';

function FluidLayout() {
  return (
    <Container variant="fluid">
      <Text>Content grows with the screen.</Text>
    </Container>
  );
}
```

### Fixed max-width

Capped at the platform max-width (e.g. 600 dp on RN). Override with `maxWidth`.

```tsx
import React from 'react';
import { Container, Text } from '@oneui/ui-native';

function FixedLayout() {
  return (
    <Container variant="fixed">
      <Text>Content is centered with a max width.</Text>
    </Container>
  );
}
```

### Custom max width

```tsx
import React from 'react';
import { Container, Text } from '@oneui/ui-native';

function CustomMaxWidth() {
  return (
    <>
      <Container variant="fixed" maxWidth={320}>
        <Text>Narrow column (320 dp)</Text>
      </Container>
      <Container variant="fixed" maxWidth="480px">
        <Text>Parsed pixel string</Text>
      </Container>
    </>
  );
}
```

### Full-bleed

No margin, no cap — for hero sections and media strips.

```tsx
import React from 'react';
import { Container, Text } from '@oneui/ui-native';

function FullBleedLayout() {
  return (
    <Container variant="full-bleed">
      <Text>Edge-to-edge content.</Text>
    </Container>
  );
}
```

### Nested in a screen

```tsx
import React from 'react';
import { Container, Text } from '@oneui/ui-native';

function Screen() {
  return (
    <Container variant="fluid" style={{ flex: 1 }}>
      <Text>Screen body</Text>
    </Container>
  );
}
```

## Additional Notes

- **Presentational** — `accessible={false}`; children remain in default accessibility order.
- **Native surface is narrow** — extended layout/surface props exist on web only (`Container.shared.ts`).
- **`maxWidth` applies only to `variant="fixed"`** — parsed from number or px string.
- **Sample app** — open **Container** in `native-components-sample` for `ContainerFluid`, `ContainerFixed`, `ContainerFullBleed`, `ContainerCustomMaxWidth`.
- **Web parity** — mirrors `packages/ui/src/components/Container/Container.tsx` variant behaviour.
