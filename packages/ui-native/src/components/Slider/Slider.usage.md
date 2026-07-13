# Slider — React Native

A draggable value slider — a single thumb (`number`) or a range (`number[]`).
Supports tick marks, a value tooltip, and leading/trailing icon slots. Mirrors
the web `Slider` from `@oneui/ui`.

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
| `minStepsBetweenValues` | `number` | — | Minimum step gap enforced between thumbs on a range slider. |
| `appearance` | `ComponentAppearance` | `'auto'` → `'secondary'` | Multi-accent role for the progress fill. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slider orientation. |
| `size` | `'s' \| 'm' \| 'l'` | `'m'` | Track/thumb size. |
| `knobStyle` | `'inside' \| 'outside'` | `'outside'` | Thumb placement relative to the track. |
| `showTooltip` | `'auto' \| 'always' \| false` | `'auto'` | Value tooltip visibility — `'auto'` shows it during drag + focus. |
| `formatValue` | `(value: number, index: number) => string` | — | Formatter for the tooltip value. |
| `showSteps` | `boolean` | `false` | Render tick marks at every step. |
| `stepLabels` | `ReactNode[]` | — | Optional labels rendered under step marks. |
| `snapToSteps` | `boolean` | `true` | When `true`, the thumb snaps to exact step positions; when `false`, dragging is continuous but tick marks still appear. |
| `start` | `ReactNode` | — | Node before the track (e.g. an `IconButton`), ~30×30 slot. |
| `end` | `ReactNode` | — | Node after the track (e.g. an `IconButton`), ~30×30 slot. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `readOnly` | `boolean` | `false` | Non-interactive, visually distinct. |
| `aria-label` | `string` | — | Accessible name. |
| `aria-labelledby` | `string` | — | ID of a labelling element. |
| `ariaLabels` | `string[]` | — | Per-thumb accessible name for a range slider. |
| `testID` | `string` | — | React Native test identifier. |
| `style` | `ViewStyle` | — | Styles for the root container. |

## Code examples

### Single value (uncontrolled)

```tsx
import { Slider } from '@oneui/ui-native';

<Slider defaultValue={40} aria-label="Volume" />
```

### Controlled, with tooltip always visible

```tsx
const [v, setV] = useState(40);

<Slider
  value={v}
  onValueChange={setV}
  onValueCommitted={save}
  showTooltip="always"
  aria-label="Brightness"
/>
```

### Range with per-thumb labels

```tsx
<Slider
  defaultValue={[20, 80]}
  min={0}
  max={100}
  ariaLabels={['Minimum price', 'Maximum price']}
/>
```

### Stepped, with tick marks and labels

```tsx
<Slider
  defaultValue={2}
  min={0}
  max={4}
  step={1}
  showSteps
  stepLabels={['XS', 'S', 'M', 'L', 'XL']}
/>
```

### Leading/trailing icon slots, inside a Surface

```tsx
import { Icon, Slider, Surface } from '@oneui/ui-native';

<Surface mode="subtle" style={{ padding: 16, borderRadius: 12 }}>
  <Slider
    defaultValue={50}
    appearance="secondary"
    start={<Icon icon="volume-low" aria-hidden />}
    end={<Icon icon="volume-high" aria-hidden />}
  />
</Surface>
```

## Accessibility

Renders with `accessibilityRole="adjustable"` and exposes the current/min/max
value per thumb. Provide `aria-label` (or `aria-labelledby`) for a single
thumb, or `ariaLabels` for a range slider so each thumb is announced
distinctly. `largeStep` drives larger increments for assistive interactions.
