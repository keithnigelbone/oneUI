# Icon

## Overview

The `Icon` component renders semantic glyphs or custom SVG components with design-system sizing and surface-aware colour. Colour is resolved internally from `appearance` × `emphasis` against the surrounding `<Surface>` context — never pass a hex `color` prop. Use icons inline with text, inside Input slots, Avatar, Badge, and other composite components.

Native implementation: `Icon.native.tsx` · contract: `interface.ts` · showcase: `Icon.showcase.native.tsx`

## Import

```typescript
import { Icon } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` (or `OneUINativeThemeProvider`) so spacing tokens and surface colours resolve correctly. For semantic icon names (`icon="heart"`), register a glyph loader at startup (e.g. `initJdsJioIcons(JdsIcons)`).

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `icon` | `SemanticIconName \| ReactElement \| IconComponent` | — | Glyph to render — semantic name, pre-built element, or JDS/custom SVG component |
| `size` | `'2' \| '2.5' \| '3' \| '3.5' \| '4' \| '4.5' \| '5' \| '6' \| '7' \| '8' \| '9' \| '10' \| '12' \| '14' \| '16' \| '18' \| '20' \| '24' \| '32' \| '40' \| number` | `'5'` | Spacing-index token or pixel escape hatch |
| `appearance` | `'neutral' \| 'primary' \| 'secondary' \| 'sparkle' \| 'negative' \| 'positive' \| 'warning' \| 'informative'` | `'neutral'` | Colour role |
| `emphasis` | `'high' \| 'medium' \| 'low' \| 'tinted' \| 'tintedA11y'` | `'high'` | Colour prominence on top of the appearance role |
| `style` | `ViewStyle` | — | Additional container styles |
| `aria-label` | `string` | — | Accessible name; derived from icon name when omitted |
| `aria-hidden` | `boolean` | — | Hide from assistive tech (decorative icons) |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Default semantic icon

```tsx
import React from 'react';
import { Icon } from '@oneui/ui-native';

function IconDefault() {
  return <Icon icon="heart" size="5" appearance="neutral" aria-label="Heart" />;
}
```

### Sizes

Spacing-index tokens map to `tokens.spacing` keys (`'2'` … `'40'`).

```tsx
import React from 'react';
import { Icon } from '@oneui/ui-native';

function IconSizes() {
  return (
    <>
      <Icon icon="heart" size="4" aria-label="Small" />
      <Icon icon="heart" size="8" aria-label="Medium" />
      <Icon icon="heart" size="16" aria-label="Large" />
    </>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { Icon } from '@oneui/ui-native';

function IconAppearances() {
  return (
    <>
      <Icon icon="heart" appearance="primary" size="8" aria-label="Primary" />
      <Icon icon="heart" appearance="secondary" size="8" aria-label="Secondary" />
      <Icon icon="check" appearance="positive" emphasis="tintedA11y" size="8" aria-label="Verified" />
      <Icon icon="heart" appearance="negative" emphasis="tinted" size="8" aria-label="Error" />
    </>
  );
}
```

### Emphasis levels

```tsx
import React from 'react';
import { Icon } from '@oneui/ui-native';

function IconEmphasis() {
  return (
    <>
      <Icon icon="heart" appearance="primary" emphasis="high" size="8" aria-label="High" />
      <Icon icon="heart" appearance="primary" emphasis="medium" size="8" aria-label="Medium" />
      <Icon icon="heart" appearance="primary" emphasis="low" size="8" aria-label="Low" />
      <Icon icon="heart" appearance="primary" emphasis="tinted" size="8" aria-label="Tinted" />
      <Icon icon="heart" appearance="primary" emphasis="tintedA11y" size="8" aria-label="Tinted A11y" />
    </>
  );
}
```

### Direct component (escape hatch)

Pass a JDS or custom SVG component when semantic names are unavailable.

```tsx
import React from 'react';
import { Icon } from '@oneui/ui-native';
import { IcStar } from '@your-icon-pack';

function IconDirectComponent() {
  return <Icon icon={IcStar} size="8" appearance="neutral" aria-label="Star" />;
}
```

### Inline with text

Use `aria-hidden` on decorative icons beside visible copy.

```tsx
import React from 'react';
import { Icon, Text } from '@oneui/ui-native';

function IconInContext() {
  return (
    <>
      <Icon icon="check" size="3" appearance="positive" emphasis="tintedA11y" aria-hidden />
      <Text variant="body" size="S" attention="tinted">
        Verified
      </Text>
    </>
  );
}
```

### Surface context

The same `appearance="primary"` icon paints differently inside each `<Surface mode="...">` because role tokens remap automatically.

```tsx
import React from 'react';
import { Icon, Surface } from '@oneui/ui-native';

function IconOnSurface() {
  return (
    <Surface mode="bold">
      <Icon icon="heart" appearance="primary" size="8" aria-label="Primary on bold" />
      <Icon icon="heart" appearance="neutral" size="8" aria-label="Neutral on bold" />
    </Surface>
  );
}
```

## Additional Notes

- **No `color` prop** — colour comes from `appearance` × `emphasis` × surface context, matching web variable-mode auto-resolution.
- **Semantic names** require a registered `IconProvider` loader; without one, use the direct-component escape hatch.
- **Slot inheritance** — when nested inside Button or Avatar icon slots, omit `size` to inherit the parent slot's resolved pixel side via `ComponentSlotIconContext`.
- **`brand-bg` folding** — slot parents with `brand-bg` appearance fold to `primary` for Icon (no dedicated glyph scale).
- **Sample app** — open **Icon** in `native-components-sample` to browse `IconSizes`, `IconAppearances`, `IconSurfaceContext`, etc.
- **Web parity** — mirrors `packages/ui/src/components/Icon/Icon.tsx`; see `docs/parity/icon-web-native-parity.md` for platform differences.
