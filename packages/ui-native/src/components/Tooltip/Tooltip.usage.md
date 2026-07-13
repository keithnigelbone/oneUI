# Tooltip — React Native

A brief contextual popup shown on press/focus of a trigger element. Mirrors the
web `Tooltip` from `@oneui/ui`. Requires a `<TooltipProvider>` ancestor.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | The trigger element the tooltip attaches to. |
| `content` | `ReactNode` | — | Text or content displayed inside the tooltip. |
| `position` | `TooltipPosition` | — | Figma-style convenience position; maps to `side`+`align`. |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Side of the trigger to position against. |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment along the side axis. |
| `sideOffset` | `number` | — | Distance from the trigger in px. |
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled). |
| `onOpenChange` | `(open: boolean) => void` | — | Fires on open/close. |
| `trigger` | `'hover' \| 'click' \| 'focus' \| 'manual'` | `'hover'` | How the tooltip opens (RN: press maps to click). |
| `delay` | `number` | — | Delay before showing (ms). |
| `closeDelay` | `number` | — | Delay before hiding (ms). |
| `arrow` | `boolean` | `true` | Show the arrow pointing to the trigger. |
| `maxWidth` | `number \| string` | — | Max width; copy wraps within it. |
| `disabled` | `boolean` | `false` | Disables the tooltip. |
| `testID` | `string` | — | React Native test identifier. |

## Code examples

### Basic

```tsx
import { Tooltip, TooltipProvider, IconButton } from '@oneui/ui-native';

<TooltipProvider>
  <Tooltip content="Add to favourites">
    <IconButton aria-label="Favourite" />
  </Tooltip>
</TooltipProvider>
```

### Positioned + no arrow

```tsx
<Tooltip content="Settings" side="bottom" align="start" arrow={false}>
  <IconButton aria-label="Settings" />
</Tooltip>
```

### Controlled

```tsx
const [open, setOpen] = useState(false);

<Tooltip content="Saved!" open={open} onOpenChange={setOpen} trigger="manual">
  <Button onPress={() => setOpen(true)}>Save</Button>
</Tooltip>
```

## Accessibility

Mount one `<TooltipProvider>` near the app root. The tooltip content is exposed
to assistive tech and associated with its trigger. Prefer `trigger="click"` on
touch devices where hover is unavailable.
