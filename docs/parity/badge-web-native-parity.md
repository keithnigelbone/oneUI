# Badge — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/Badge/Badge.tsx](../../packages/ui/src/components/Badge/Badge.tsx) | [packages/ui-native/src/components/Badge/Badge.native.tsx](../../packages/ui-native/src/components/Badge/Badge.native.tsx) |
| Static visuals | `Badge.module.css` | `Badge.styles.native.ts` |
| Prop contract | `Badge.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `Badge.stories.tsx` | `Badge.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `BadgeDefault` | **Aligned** |
| 2 | `Variants` | `BadgeVariants` | **Aligned** |
| 3 | `Sizes` | `BadgeSizes` | **Aligned** |
| 4 | `WithSlots` | `BadgeWithSlots` | **Aligned** — start/end slot matrix across attention levels |
| 5 | `SizesWithSlots` | `BadgeSizesWithSlots` | **Aligned** — XS/S omitted for CounterBadge to match Figma minimum |
| 6 | `Appearances` | `BadgeAppearances` | **Aligned** — 9-role × 3-attention matrix |
| 7 | `Interactive` | _intentionally skipped_ | **Web-only** — Storybook play function asserting `getByRole('status')` text content; equivalent assertion lives in the native A11y peer test. |
| 8 | `Responsive` | `BadgeResponsive` | **Aligned** — 5-size row framed for narrow viewports |
| 9 | `Themes` | `BadgeThemes` | **Aligned** — 5 surface boundaries × attention + slot mix |
| 10 | `SlotAdaptation` | `BadgeSlotAdaptation` | **Aligned** — variant × slot type matrix demonstrates surface context cascade |
| 11 | `InsideBoldSurface` | `BadgeSurfaceContextBold` | **Aligned** |
| 12 | `InsideSubtleSurface` | `BadgeSurfaceContextSubtle` | **Aligned** |
| 13 | `SurfaceContext` (all modes) | `BadgeSurfaceContextAllModes` | **Aligned** — 6 surface modes stacked |
| 14 | `FigmaParity` | _intentionally skipped_ | **Web-only** — uses `getComputedStyle` on DOM nodes to compare live geometry against the Figma spec. RN uses `onLayout` measurements; if we need this on native, it lives behind a separate visual-regression harness. |
| 15 | `FigmaSlotMatrix` | `BadgeFigmaSlotMatrix` | **Aligned** — variant × slot composition matrix used as a visual-regression target. |
| 16 | `BadgeBugReproduce` | _intentionally skipped_ | **Web-only** — debugging story tracking `badge-bugs.md`; the bugs it reproduces (missing `accent`/`content` props, slot-inheritance edge cases) are tracked separately. |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `children` | yes | yes | Badge text content |
| `attention` | yes | yes | `'high' \| 'medium' \| 'low'` |
| `variant` | yes | yes | `'bold' \| 'subtle' \| 'ghost'` (legacy alias for `attention`) |
| `size` | yes | yes | `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` |
| `appearance` | yes | yes | 9-role union + `'auto'` (defaults to `sparkle`) |
| `start` | yes | yes | Slot — Icon / Avatar / CounterBadge / IndicatorBadge |
| `end` | yes | yes | Slot — Icon / Avatar / CounterBadge / IndicatorBadge |
| `aria-label` | yes | yes | Required for screen-reader announcement |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Slot children inherit Badge size + appearance via the `ComponentSlotIconContext` / `SlotParentAppearanceProvider` (native) and the `--_slot-*-size` cascade (web). Both platforms keep the slot opt-out when the child explicitly sets its own appearance.
- The default appearance follows Figma — `sparkle` — matching `Badge.shared.ts` resolution rules.
- Both platforms render `role="status"` (web) / `accessibilityRole="status"` (native) so screen readers announce label changes.

## Known gaps / follow-ups

- The Figma parity inspector (`getComputedStyle`) is web-only; native parity is enforced via `Badge.styles.native.ts` static-style values that match the Figma spec.
- `BadgeBugReproduce` is a debug surface tied to ongoing web bug reports; it doesn't add coverage that other matrices don't already provide.
