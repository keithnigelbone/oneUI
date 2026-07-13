# IndicatorBadge — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/IndicatorBadge/IndicatorBadge.tsx](../../packages/ui/src/components/IndicatorBadge/IndicatorBadge.tsx) | [packages/ui-native/src/components/IndicatorBadge/IndicatorBadge.native.tsx](../../packages/ui-native/src/components/IndicatorBadge/IndicatorBadge.native.tsx) |
| Static visuals | `IndicatorBadge.module.css` | `IndicatorBadge.styles.native.ts` |
| Prop contract | `IndicatorBadge.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `IndicatorBadge.stories.tsx` | `IndicatorBadge.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `IndicatorBadgeDefault` | **Aligned** |
| 2 | `Sizes` | `IndicatorBadgeSizes` | **Aligned** |
| 3 | `Appearances` | `IndicatorBadgeAppearances` | **Aligned** |
| 4 | `SurfaceContext` | `IndicatorBadgeSurfaceContext` | **Aligned** — six surface boundaries (`default`/`minimal`/`subtle`/`moderate`/`bold`/`elevated`) |
| 5 | `Interactive` | _intentionally skipped_ | **Web-only** — Storybook play function asserting `getByRole('status')` and `aria-label`. Equivalent assertion lives in `indicatorBadgeA11y.test.ts`. |
| 6 | `Responsive` | `IndicatorBadgeResponsive` | **Aligned** — same 5-size matrix as `Sizes`, framed for narrow viewports. |
| 7 | `Themes` | `IndicatorBadgeThemes` | **Aligned** — labels each surface row + cycles through 5 appearance roles. |
| 8 | `Motion` | `IndicatorBadgeMotion` | **Partially aligned** — web uses CSS `transition: opacity, transform` against `--Motion-Duration-*`; native uses `Animated.parallel([opacity, scale])` with values close to the design spec. Reduced-motion drops the scale transform. |
| 9 | `WithComponents` | `IndicatorBadgeWithComponents` | **Aligned** — overlaid avatar tile + icon-button tile with rendered indicator. |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `size` | yes | yes | `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` |
| `appearance` | yes | yes | 9-role union + `'auto'` |
| `aria-label` | yes | yes | Required for screen-reader announcement (`role="status"`) |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Both render a non-interactive coloured dot at `tokens.shape.Pill`.
- Both expose `role="status"` (web) / `accessibilityRole="status"` (native) so screen readers pick up the indicator changes via `aria-label`.
- The motion design follows the same intent on both platforms: opacity + scale on entry, opacity-only when reduced motion is requested.

## Known gaps / follow-ups

- The web Motion story has a Storybook-specific subtle-motion control + play-function audit; native uses the runtime `useReduceMotion()` hook instead. Equivalent guarantee: when reduced motion is active, the scale transform is skipped.
