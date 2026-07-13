# Modal — React Native

A popup dialog that demands user attention and interaction. Mirrors the web
`Modal` from `@oneui/ui`.

## Props (selected)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled). |
| `onOpenChange` | `(open, details) => void` | — | Fires on open/close; `details.reason` says why. |
| `dismissible` | `boolean` | `true` | Allow back-button (Android) / outside-press dismissal. |
| `size` | `'S' \| 'M' \| 'L' \| 'FullWidth'` | `'M'` | Size preset. |
| `header` | `boolean` | `true` | Show the header section. |
| `headerAlign` | `'left' \| 'center'` | `'left'` | Header content alignment. |
| `headerStart` | `ReactNode` | — | Header start slot. |
| `dividerVisibility` | `'none' \| 'onScroll' \| 'always'` | — | Header/footer divider behaviour. |
| `footerOrientation` | `'horizontal' \| 'vertical'` | — | Footer button layout. |
| `children` | `ReactNode` | — | Modal body content. |
| `testID` | `string` | — | React Native test identifier. |

## Code examples

### Uncontrolled with a trigger

```tsx
import { useState } from 'react';
import { Modal, Button } from '@oneui/ui-native';

function ConfirmDelete() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Delete</Button>
      <Modal
        open={open}
        onOpenChange={(next) => setOpen(next)}
        size="M"
      >
        {/* header + body + footer content */}
      </Modal>
    </>
  );
}
```

### Non-dismissible (force a choice)

```tsx
<Modal open={open} dismissible={false} onOpenChange={setOpen}>
  {/* user must pick an action */}
</Modal>
```

### Full-width sheet

```tsx
<Modal open={open} size="FullWidth" onOpenChange={setOpen}>
  {/* … */}
</Modal>
```

## Accessibility

The modal traps focus while open, exposes a dialog role, and restores focus to
the trigger on close. On Android the hardware back button respects
`dismissible`. `onOpenChange` reports the close `reason` (e.g. backdrop press,
back button, programmatic) so callers can react appropriately.
