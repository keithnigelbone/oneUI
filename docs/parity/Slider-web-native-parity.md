# Slider Web ↔ Native Parity

| Feature | Web (`Slider.tsx`) | Native (`Slider.native.tsx`) | Notes |
| :--- | :--- | :--- | :--- |
| **Controlled Value** | `value`, `onValueChange` | `value`, `onValueChange` | Parity |
| **Uncontrolled** | `defaultValue` | `defaultValue` | Parity |
| **Range** | `number[]` support | `number[]` support | Parity |
| **Orientation** | `horizontal` \| `vertical` | `horizontal` \| `vertical` | Parity |
| **Size** | `s` \| `m` \| `l` | `s` \| `m` \| `l` | Parity |
| **Knob Style** | `inside` \| `outside` | `inside` \| `outside` | Parity |
| **Steps** | `showSteps`, `snapToSteps` | `showSteps`, `snapToSteps` | Parity |
| **Tooltip** | `showTooltip`, `formatValue` | `showTooltip`, `formatValue` | Parity (Custom bubble) |
| **Slots** | `start`, `end` | `start`, `end` | Parity |
| **States** | `disabled`, `readOnly` | `disabled`, `readOnly` | Parity |
| **A11y** | ARIA roles | `accessibilityRole="adjustable"` | Parity |

## Implementation details

The native implementation uses `PanResponder` for gesture handling. For range sliders, it selects the nearest thumb based on touch position.

### Known Gaps
- `largeStep`: Not yet used in native (web uses it for keyboard navigation).
- `minStepsBetweenValues`: Not yet enforced in native range logic.
- `stepLabels`: Web supports custom labels under ticks; native only renders ticks currently.
