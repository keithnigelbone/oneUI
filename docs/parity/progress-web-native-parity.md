# Progress — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/Progress/Progress.tsx](../../packages/ui/src/components/Progress/Progress.tsx) | [packages/ui-native/src/components/Progress/Progress.native.tsx](../../packages/ui-native/src/components/Progress/Progress.native.tsx) |
| Static visuals | `Progress.module.css` | `Progress.styles.native.ts` |
| Prop contract | `Progress.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | _no Storybook stories yet_ — primitive | `Progress.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

The web `Progress` is a thin wrapper over `@base-ui/react/progress` and ships **without** a Storybook file today — the only `*.stories.tsx` peer in the Progress family is `CircularProgressIndicator`. Because there is no web matrix to mirror, the native showcase exposes a self-consistent set of sections that prove the prop contract end-to-end. When web Progress eventually lands a Storybook file, this table should be updated to mirror it 1:1.

| Native section | Coverage |
|---|---|
| `ProgressDefault` | Single mid-state Progress at default size — sanity render. |
| `ProgressSizes` | `small` / `medium` / `large` |
| `ProgressIndeterminate` | `value` omitted — indeterminate state |
| `ProgressBoundaries` | 0% / 100% — clipping check |
| `ProgressValueRange` | 0 / 25 / 50 / 75 / 100 sweep — animation / interpolation check |
| `ProgressSurfaceContext` | All 6 surface modes — verifies `[data-surface]` cascade on track + indicator |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `value` | yes | yes | `0–max`, omit for indeterminate |
| `min` | yes | yes | Defaults to 0 |
| `max` | yes | yes | Defaults to 100 |
| `size` | yes | yes | `'small' \| 'medium' \| 'large'` |
| `aria-label` | yes | yes | Required for screen-reader announcement |
| `aria-labelledby` | yes | yes | |
| `style` | yes (via `className`) | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Both platforms compute `percentage = clamp((value - min) / (max - min) * 100, 0, 100)` and treat `value === undefined` as indeterminate.
- Track + indicator radius use `--Progress-borderRadius` / `tokens.shape.Pill` so the bar reads as a continuous capsule on both platforms.
- Both platforms set `role="progressbar"` (web inherits from Base UI; native uses `accessibilityRole='progressbar'`) so screen readers announce progress correctly.

## Known gaps / follow-ups

- Web doesn't ship a Storybook file for Progress yet. When that lands, sync this doc and the native sections so naming matches.
- The indeterminate-state animation curve is a CSS keyframe on web (`@keyframes progressShimmer`) and an `Animated.loop` on native. They look comparable side-by-side but are not pixel-identical.
