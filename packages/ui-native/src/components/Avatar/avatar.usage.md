# Avatar

## Overview

The `Avatar` component displays user profile pictures, initials, or icons. It supports three content modes (`image`, `icon`, `text`), three attention levels, and the full multi-accent appearance set. Use it in lists, comments, navigation, and as a slot inside `Badge` or other composite components.

Native implementation: `Avatar.native.tsx` · contract: `interface.ts` · showcase: `Avatar.showcase.native.tsx`

## Import

```typescript
import { Avatar } from '@oneui/ui-native';
import { Icon } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` (or `OneUINativeThemeProvider`) so spacing, typography, and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `content` | `'image' \| 'icon' \| 'text'` | `'image'` | Display mode — photo, custom icon, or initials |
| `size` | `'2xs' \| 'xs' \| 's' \| 'm' \| 'l' \| 'xl' \| '2xl' \| 'custom'` | `'m'` | T-shirt size scale (lowercase) |
| `attention` | `'high' \| 'medium' \| 'low'` | `'high'` | Visual emphasis — filled / tinted / transparent |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'primary'` | Multi-accent colour role (`'auto'` inherits from slot parent or falls back to `'primary'`) |
| `src` | `string` | — | Image URL when `content="image"` |
| `alt` | `string` | `''` | Accessibility label; also used to derive initials when `content="text"` |
| `fallback` | `ReactNode` | — | Custom fallback when the image fails, or override for icon/text slots |
| `icon` | `ReactNode` | — | Custom icon element when `content="icon"` (defaults to a person glyph) |
| `customSize` | `number` | — | Pixel size when `size="custom"` (must be > 40) |
| `disabled` | `boolean` | `false` | Reduces opacity and disables pointer events |
| `style` | `ViewStyle` | — | Additional root container styles |
| `accessibilityHint` | `string` | — | React Native accessibility hint |
| `testID` | `string` | — | Test identifier on the root element |

## Usage Examples

### Image avatar

```tsx
import React from 'react';
import { Avatar } from '@oneui/ui-native';

function AvatarWithImage() {
  return (
    <Avatar
      content="image"
      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
      alt="John Doe"
      size="l"
      attention="high"
    />
  );
}
```

### Text initials

Initials are extracted automatically from `alt` via `getInitials()` (up to two characters).

```tsx
import React from 'react';
import { Avatar } from '@oneui/ui-native';

function AvatarWithInitials() {
  return (
    <>
      <Avatar content="text" alt="John Doe" size="m" />
      <Avatar content="text" alt="Jane Smith" size="l" attention="medium" />
      <Avatar content="text" alt="AB" size="xl" attention="low" />
    </>
  );
}
```

### Icon avatar

Pass a custom icon as `icon`; otherwise a default person glyph is shown.

```tsx
import React from 'react';
import { Avatar, Icon } from '@oneui/ui-native';

function AvatarWithIcon() {
  return (
    <Avatar
      content="icon"
      alt="User"
      size="m"
      icon={<Icon icon="heart" />}
    />
  );
}
```

### Sizes

```tsx
import React from 'react';
import { Avatar } from '@oneui/ui-native';
import { tokens } from '@oneui/tokens';

function AvatarSizes() {
  return (
    <>
      {(['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'] as const).map((size) => (
        <Avatar key={size} content="text" alt="John Smith" size={size} />
      ))}
      <Avatar
        content="text"
        alt="John Smith"
        size="custom"
        customSize={tokens.shape['10']}
      />
    </>
  );
}
```

### Attention levels

| Level | Visual |
| ----- | ------ |
| `high` | Filled (`bold` surface) |
| `medium` | Tinted (`subtle` surface) |
| `low` | Transparent background |

```tsx
import React from 'react';
import { Avatar } from '@oneui/ui-native';

function AvatarAttention() {
  return (
    <>
      <Avatar content="text" alt="JD" attention="high" size="xl" />
      <Avatar content="text" alt="JD" attention="medium" size="xl" />
      <Avatar content="text" alt="JD" attention="low" size="xl" />
    </>
  );
}
```

### Appearance roles

```tsx
import React from 'react';
import { Avatar, Icon } from '@oneui/ui-native';

function AvatarAppearances() {
  return (
    <>
      <Avatar content="icon" alt="User" appearance="primary" icon={<Icon icon="heart" />} />
      <Avatar content="icon" alt="User" appearance="secondary" icon={<Icon icon="heart" />} />
      <Avatar content="text" alt="John Smith" appearance="positive" />
    </>
  );
}
```

### Disabled state

```tsx
import React from 'react';
import { Avatar } from '@oneui/ui-native';

function DisabledAvatar() {
  return (
    <Avatar content="text" alt="John Doe" size="2xl" disabled />
  );
}
```

### Image fallback

When an image URL fails to load, the avatar falls back to the icon slot (default person glyph). Provide `fallback` for a custom recovery element.

```tsx
import React from 'react';
import { Avatar, Icon } from '@oneui/ui-native';

function AvatarImageFallback() {
  return (
    <>
      <Avatar content="image" src="https://example.com/profile.jpg" alt="John Doe" size="xl" />
      <Avatar
        content="image"
        src="https://invalid.example/broken.jpg"
        alt="Jane Smith"
        size="xl"
      />
      <Avatar
        content="image"
        src="https://invalid.example/broken.jpg"
        alt="User"
        size="xl"
        fallback={<Icon icon="heart" />}
      />
    </>
  );
}
```

### Inside a Badge slot

When nested in a `Badge` `start` / `end` slot, the avatar inherits slot sizing and appearance from the parent badge context.

```tsx
import React from 'react';
import { Avatar, Badge } from '@oneui/ui-native';

function AvatarInBadge() {
  return (
    <Badge attention="high" start={<Avatar content="icon" alt="User" />} aria-label="Notifications">
      3
    </Badge>
  );
}
```

### Surface context

Place avatars inside `<Surface mode="...">` so on-colour tokens remap correctly on tinted backgrounds.

```tsx
import React from 'react';
import { Avatar, Surface } from '@oneui/ui-native';

function AvatarOnSurface() {
  return (
    <Surface mode="bold">
      <Avatar content="text" alt="JS" size="xl" attention="high" />
      <Avatar content="text" alt="JS" size="xl" attention="medium" />
      <Avatar content="text" alt="JS" size="xl" attention="low" />
    </Surface>
  );
}
```

### Accessibility

```tsx
import React from 'react';
import { Avatar } from '@oneui/ui-native';

function AccessibleAvatar() {
  return (
    <Avatar
      content="text"
      alt="John Doe"
      accessibilityHint="Profile picture"
      testID="user-avatar"
    />
  );
}
```

The root element exposes `accessibilityRole="image"` and uses `alt` as `accessibilityLabel` (defaults to `"avatar"` when empty).

## Additional Notes

- **Content prop** is a string enum (`'image' | 'icon' | 'text'`), not a child element slot.
- **Sizes** use lowercase t-shirt tokens (`'2xs'`–`'2xl'`), not legacy `'3XS'` / `'fill'` values.
- **Text at small sizes** — at `2xs` and `xs`, `content="text"` automatically falls back to the icon path because initials are too small to read.
- **No press handler** — native `Avatar` is decorative; wrap in `Pressable` if you need navigation.
- **Badge overlap** — compose via `Badge` slot props (`start` / `end`), not a dedicated `badgeAvatarOverlap` prop.
- **Sample app** — open **Avatar** in `native-components-sample` to browse all showcase suites (`AvatarVariants`, `AvatarSizes`, `AvatarSurfaceContext`, etc.).
- **Web parity** — mirrors `packages/ui/src/components/Avatar/Avatar.shared.ts`; see `docs/parity/avatar-web-native-parity.md` for platform differences.
