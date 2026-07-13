# SingleTextButton — React Native

Circular, non-toggle action button carrying a max-2-character text label
(e.g. `"Ag"`, `"En"`, `"12"`). Mirrors the web `SingleTextButton` shared
contract from `packages/ui/src/components/SingleTextButton/SingleTextButton.shared.ts`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` (max 2 chars) | — | Visible label. Required. |
| `size` | `'s' \| 'm' \| 'l'` | `'m'` | Button size. |
| `attention` | `'high' \| 'medium' \| 'low'` | `'high'` | Drives the visual: high→bold fill, medium→subtle fill, low→ghost (transparent). |
| `appearance` | `ComponentAppearance \| 'tertiary' \| 'quaternary'` | `'auto'` → primary | Multi-accent role. Inherits the nearest `<Surface appearance>` when unset. |
| `condensed` | `boolean` | `false` | Reduces height/padding while keeping typography. |
| `fullWidth` | `boolean` | `false` | Stretch to fill container width — overrides the circular shape. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `loading` | `boolean` | `false` | Shows a spinner and marks the control busy; does not visually disable it. |
| `onPress` / `onClick` | `() => void` | — | Press handler (`onClick` is a web-parity alias). |
| `aria-label` | `string` | — | Accessible label override. |
| `testID` | `string` | — | React Native test identifier. |
| `style` | `ViewStyle` | — | Layout style only — do not paint background/border here. |

## Code examples

### Basic

```tsx
import { SingleTextButton } from '@oneui/ui-native';

<SingleTextButton attention="high">Ag</SingleTextButton>
```

### Variants via attention

```tsx
<SingleTextButton attention="high">Hi</SingleTextButton>
<SingleTextButton attention="medium">Md</SingleTextButton>
<SingleTextButton attention="low">Lo</SingleTextButton>
```

### Loading state

```tsx
<SingleTextButton attention="high" loading>
  Ag
</SingleTextButton>
```

### Inside a Surface (bold background)

```tsx
import { Surface, SingleTextButton } from '@oneui/ui-native';

<Surface mode="bold">
  <SingleTextButton attention="subtle" appearance="primary">
    Ag
  </SingleTextButton>
</Surface>
```

Colour is always surface-resolved from `attention` + `appearance` — never set
`backgroundColor` directly; wrap in `<Surface>` so it adapts automatically.

## Accessibility

Renders with `accessibilityRole="button"`. The accessible name comes from the
visible `children` text, falling back to `aria-label` when provided. `loading`
sets `accessibilityState.busy` and suppresses activation without applying the
disabled visual/state unless `disabled` is also set. Minimum touch target is
44x44.
