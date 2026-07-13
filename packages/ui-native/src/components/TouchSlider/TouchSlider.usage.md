# TouchSlider — React Native

An adjustable slider for selecting a value (or a range) by dragging a thumb.
Mirrors the web `TouchSlider` from `@oneui/ui`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| number[]` | — | Controlled value (array = range). |
| `defaultValue` | `number \| number[]` | — | Initial value (uncontrolled). |
| `onValueChange` | `(value: number \| number[]) => void` | — | Fires continuously during drag. |
| `onValueCommitted` | `(value: number \| number[]) => void` | — | Fires when interaction ends. |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `step` | `number` | `1` | Step increment. |
| `largeStep` | `number` | `10` | Large step increment (keyboard / a11y). |
| `appearance` | `ComponentAppearance` | `'auto'` | Multi-accent role for the progress fill. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slider orientation. |
| `progressStyle` | `'rounded' \| 'sharp'` | `'rounded'` | Progress edge style. |
| `start` | `ReactNode` | — | Node before the track (e.g. an icon), 30×30 slot. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `readOnly` | `boolean` | `false` | Non-interactive, visually distinct. |
| `aria-label` | `string` | — | Accessible name. |
| `aria-labelledby` | `string` | — | ID of a labelling element. |
| `testID` | `string` | — | React Native test identifier. |
| `style` | `ViewStyle` | — | Styles for the root container. |

## Code examples

### Single value (uncontrolled)

```tsx
import { TouchSlider } from '@oneui/ui-native';

<TouchSlider defaultValue={40} aria-label="Volume" />
```

### Controlled

```tsx
const [v, setV] = useState(40);

<TouchSlider value={v} onValueChange={setV} onValueCommitted={save} aria-label="Brightness" />
```

### Range

```tsx
<TouchSlider defaultValue={[20, 80]} min={0} max={100} aria-label="Price range" />
```

### Appearance inside a Surface

```tsx
import { Surface, TouchSlider } from '@oneui/ui-native';

<Surface mode="subtle" style={{ padding: 16, borderRadius: 12 }}>
  <TouchSlider defaultValue={50} appearance="secondary" />
</Surface>
```

## Accessibility

Renders with `accessibilityRole="adjustable"` and exposes the current/min/max
value. Provide `aria-label` (or `aria-labelledby`) so the control is announced.
`largeStep` drives larger increments for assistive interactions.
