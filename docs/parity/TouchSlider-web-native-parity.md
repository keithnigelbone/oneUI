# TouchSlider Web-Native Parity

| Feature | Web | Native | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Geometry** | 138×32 / 32×138 | Spacing-28 × Spacing-9 | ✅ Parity | Matches Figma spec (node 5723-7946). |
| **Appearances** | primary, secondary, neutral, sparkle, brand-bg, positive, negative, warning, informative | primary, secondary, neutral, sparkle, brand-bg, positive, negative, warning, informative | ✅ Parity | All roles supported via `useSurfaceTokens`. |
| **Orientation** | horizontal, vertical | horizontal, vertical | ✅ Parity | |
| **Progress Style** | rounded, sharp | rounded, sharp | ✅ Parity | `sharp` flips trailing edge to flat 90°. |
| **Slots** | start, end | start, end | ✅ Parity | Absolute-positioned overlays inside the pill. |
| **Disabled** | Opacity reduction | Opacity reduction | ✅ Parity | |
| **ReadOnly** | Non-interactive | Non-interactive | ✅ Parity | |
| **State** | Controlled/Uncontrolled | Controlled/Uncontrolled | ✅ Parity | |
| **Accessibility** | ARIA slider/Base UI | accessibilityRole: adjustable | ✅ Parity | Native `adjustable` role provides standard slider behavior. |

## Implementation Details

### Native-specific notes:
- **Interaction**: Implemented via `PanResponder` to handle dragging across the chunky track.
- **Color derivation**: Rail color is derived from fill color with 22% alpha (matching web's `color-mix`).
- **Corner Radii**: Specifically managed for `progressStyle="sharp"` to ensure leading edge remains rounded while trailing edge flattens.
