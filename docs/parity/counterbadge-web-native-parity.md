# CounterBadge — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/CounterBadge/CounterBadge.tsx](../../packages/ui/src/components/CounterBadge/CounterBadge.tsx) | [packages/ui-native/src/components/CounterBadge/CounterBadge.native.tsx](../../packages/ui-native/src/components/CounterBadge/CounterBadge.native.tsx) |
| Static visuals | `CounterBadge.module.css` | `CounterBadge.styles.native.ts` |
| Prop contract | `CounterBadge.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `CounterBadge.stories.tsx` | `CounterBadge.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `CounterBadgeDefault` | **Aligned** |
| 2 | `Variants` | `CounterBadgeVariants` | **Aligned** |
| 3 | `Sizes` | `CounterBadgeSizes` | **Aligned** |
| 4 | `MaxValue` | `CounterBadgeMaxValue` | **Aligned** — extra "More values" + "Zero handling" sub-rows kept on native; same overflow rules. |
| 5 | `Appearances` | `CounterBadgeAppearances` | **Aligned** — 9-role × 3-attention matrix |
| 6 | `Interactive` | _intentionally skipped_ | **Web-only** — Storybook play function asserting `getByRole('status')` text content. Equivalent assertion lives in `counterBadgeA11y.test.ts`. |
| 7 | `Responsive` | `CounterBadgeResponsive` | **Aligned** — 4-size matrix in row form, framed for narrow viewports. |
| 8 | `Motion` | `CounterBadgeMotion` | **Partially aligned** — web uses CSS keyframes + `interpolate-size: allow-keywords` for width; native uses `Animated.parallel` for entry/exit + `Animated.sequence` for the increment pulse. Width interpolation is not natively supported, so the count text snaps width on increment instead. Reduced motion drops both transforms. |
| 9 | `Themes` | `CounterBadgeThemes` | **Aligned** — 4 surface boundaries (`default`/`minimal`/`subtle`/`elevated`) × 3 attention levels. |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `value` | yes | yes | Numeric count |
| `max` | yes | yes | Default `99` |
| `attention` | yes | yes | `'high' \| 'medium' \| 'low'` |
| `size` | yes | yes | `'xs' \| 's' \| 'm' \| 'l'` |
| `appearance` | yes | yes | 9-role union + `'auto'` |
| `showZero` | yes | yes | Default false on both platforms |
| `aria-label` | yes | yes | Required for screen-reader announcement |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Both render `role="status"` with the resolved label/value text.
- Both clamp `value > max` to the `max+` overflow string.
- Both honour `showZero` — `value === 0 && !showZero` returns `null`.

## Known gaps / follow-ups

- Native increment pulse is opacity- and scale-only; the web `interpolate-size` width transition would require dynamic measurement on RN. Filed as a follow-up if we move the badge into a dynamic chip / inbox rail.
- The web Motion play function audits `transitionProperty`/`animationName` for `subtleMotion`; native uses the runtime `useReduceMotion()` hook, which short-circuits the scale transform.
