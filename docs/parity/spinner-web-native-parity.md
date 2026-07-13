# Spinner — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/Spinner/Spinner.tsx](../../packages/ui/src/components/Spinner/Spinner.tsx) | [packages/ui-native/src/components/Spinner/Spinner.native.tsx](../../packages/ui-native/src/components/Spinner/Spinner.native.tsx) |
| Static visuals | `Spinner.module.css` (CSS keyframes) | `Spinner.styles.native.ts` + `Animated` rotation loop |
| Prop contract | `Spinner.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `Spinner.stories.tsx` | `Spinner.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `SpinnerDefault` | **Aligned** |
| 2 | `Sizes` (`'All sizes'`) | `SpinnerSizes` | **Aligned** |
| 3 | `OnSurfaceContext` (`'On surface context'`) | `SpinnerSurfaceContext` | **Aligned** — wraps in `<Surface mode='subtle' />` and `<Surface mode='bold' />`, mirroring the web `[data-surface]` block. |
| 4 | `Motion` | `SpinnerMotion` | **Partially aligned** — web pauses the CSS keyframe (`animation-play-state: paused`); native swaps the running `<Spinner>` for a static ring view, which is the closest equivalent given RN's `Animated.loop` API. |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `size` | yes | yes | `'2XS'..'5XL'` 10-step scale |
| `label` | yes | yes | Maps to `aria-label` (web) / `accessibilityLabel` (native) |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Web renders three SVG arcs in primary + secondary + sparkle (Figma spec); native today renders a single arc in `useSurfaceTokens('primary').content.tintedA11y` because RN does not have the same multi-`<circle>` keyframe primitive without inline `react-native-svg` math. Both convey the same indeterminate state — visual richness is a known native simplification.
- Both honour the brand-defined `motion.spinner.rotationMs` (Jio default 1500 ms).
- Both stop animating when reduced-motion is requested (web via `@media (prefers-reduced-motion: reduce)`; native via `useReduceMotion()`).

## Known gaps / follow-ups

- The three-arc multi-role rendering is web-only; tracked separately because porting it requires `react-native-svg` arc keyframes plus per-role colour resolution.
- `Motion` story uses pause/resume on web via CSS `animation-play-state`. Native replicates the visual end-state by rendering a static partial ring; if we add a true pause primitive (e.g. `Animated.stopAnimation`), it should land here.
