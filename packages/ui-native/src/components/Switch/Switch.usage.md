# Switch — React Native

Toggle control that mirrors the web `Switch` component from `@oneui/ui`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | — | Controlled checked state. |
| `defaultChecked` | `boolean` | `false` | Initial checked state (uncontrolled). |
| `onCheckedChange` | `(checked: boolean) => void` | — | Fires on toggle with the new value. |
| `size` | `'s' \| 'm' \| 'l'` | `'m'` | Size preset. |
| `appearance` | `ComponentAppearance` | `'auto'` → secondary | Color role for the checked state fill. |
| `accent` | `'primary' \| 'secondary' \| 'sparkle'` | — | (v1: accepted but not applied) |
| `disabled` | `boolean` | `false` | Disables interaction and dims opacity. |
| `readOnly` | `boolean` | `false` | Non-interactive, visually distinct. |
| `children` | `string` | — | Label text alongside the control. |
| `aria-label` | `string` | — | Accessible name when no `children`. |
| `accessibilityHint` | `string` | — | Describes the result of toggling. |
| `aria-hidden` | `boolean` | — | Hides from accessibility tree. |
| `testID` | `string` | — | React Native test identifier. |
| `style` | `ViewStyle` | — | Inline styles on the wrapper. |

## Code examples

### Uncontrolled (default)

```tsx
import { Switch } from '@oneui/ui-native';

<Switch defaultChecked={false} />
<Switch defaultChecked>Auto-update</Switch>
```

### Controlled

```tsx
import { useState } from 'react';
import { Switch } from '@oneui/ui-native';

function NotificationsToggle() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch checked={enabled} onCheckedChange={setEnabled}>
      Push notifications
    </Switch>
  );
}
```

### With label

```tsx
<Switch size="s">Enable feature</Switch>
<Switch size="m">Send notifications</Switch>
<Switch size="l" defaultChecked>Auto-update</Switch>
```

### Inside a Surface (bold background)

```tsx
import { Surface } from '@oneui/ui-native';

<Surface mode="bold" style={{ padding: 16, borderRadius: 12 }}>
  <Switch appearance="secondary">Dark mode</Switch>
</Surface>
```

Components inside `<Surface>` automatically adapt their colors via the surface context engine — no manual color overrides needed.

### Disabled

```tsx
<Switch disabled>Cannot toggle this</Switch>
<Switch disabled defaultChecked>Locked on</Switch>
```

### Read-only

```tsx
<Switch readOnly checked>Read-only on</Switch>
<Switch readOnly>Read-only off</Switch>
```

### All appearance roles

```tsx
<Switch appearance="primary" defaultChecked />
<Switch appearance="secondary" defaultChecked />
<Switch appearance="positive" defaultChecked />
<Switch appearance="negative" defaultChecked />
<Switch appearance="warning" defaultChecked />
<Switch appearance="sparkle" defaultChecked />
```

## Accessibility

The Switch renders with `accessibilityRole="switch"` and `accessibilityState.checked`. The accessible label is resolved from:
1. `aria-label` prop
2. `children` string (if no `aria-label`)

Screen readers announce the label + checked state automatically. Use `accessibilityHint` to describe the effect of toggling.

## Size → geometry

| Size | Track width | Knob size | Travel |
|------|-------------|-----------|--------|
| `s` | Spacing-7 (28px) | Spacing-3 (12px) | Spacing-3 (12px) |
| `m` | Spacing-9 (36px) | Spacing-4 (16px) | Spacing-4 (16px) |
| `l` | Spacing-10 (40px) | Spacing-5 (20px) | Spacing-4 (16px) |
