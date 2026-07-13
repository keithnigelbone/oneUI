# CircularProgressIndicator — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/CircularProgressIndicator/CircularProgressIndicator.tsx](../../packages/ui/src/components/CircularProgressIndicator/CircularProgressIndicator.tsx) | [packages/ui-native/src/components/CircularProgressIndicator/CircularProgressIndicator.native.tsx](../../packages/ui-native/src/components/CircularProgressIndicator/CircularProgressIndicator.native.tsx) |
| Static visuals | `CircularProgressIndicator.module.css` (SVG + CSS keyframes + `[data-surface]` cascade) | `CircularProgressIndicator.styles.native.ts` + inline paint via `useSurfaceTokens` + `Animated.Value` loops |
| Prop contract | `CircularProgressIndicator.shared.ts` (`useCircularProgressState`) | `interface.ts` (`useCircularProgressIndicatorState` — owned per the playbook) |
| Stories / showcase | `CircularProgressIndicator.stories.tsx` | `CircularProgressIndicator.showcase.native.tsx` |

## Storybook ↔ native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `CircularProgressIndicatorDefault` | **Aligned** |
| 2 | `Variants` | `CircularProgressIndicatorVariants` | **Aligned** — determinate + indeterminate side by side at `3XL`. |
| 3 | `Sizes` | `CircularProgressIndicatorSizes` | **Aligned** — all 10 size presets (`2XS`..`5XL`) at fixed 65% value. |
| 4 | `Appearances` | `CircularProgressIndicatorAppearances` | **Aligned** — all 9 multi-accent roles at 65% / `3XL`. |
| 5 | `WithContent` | `CircularProgressIndicatorWithContent` | **Aligned** — text (auto-percentage label) at `L..5XL`; icon (inline SVG download glyph) at `XL..5XL`. Web uses `<Icon>`; native ships an inline `<Path>` glyph until the Jio icon catalog is wired through `@oneui/ui-native/icons`. |
| 6 | `States` | `CircularProgressIndicatorStates` | **Aligned** — `0/25/50/75/100%` at `3XL` with `content="text"`. |
| 7 | `Interactive` | `CircularProgressIndicatorInteractive` | **Aligned** — tracking (1%/50ms), jumping (random target/2s), indeterminate, all `4XL`. Web's `--CircularProgressIndicator-valueTransitionDuration: 0s` override has no native equivalent; tracking on native still uses the standard transition (cumulative motion still reads as continuous but slightly easier). Tracked as a known gap. |
| 8 | `SurfaceContext` | `CircularProgressIndicatorSurfaceContext` | **Aligned** — flat list of all 5 surface modes (`minimal`, `subtle`, `moderate`, `bold`, `elevated`) plus a `default` baseline. Each row hosts both variants so the on-surface contrast is visible. |
| 9 | `Motion` (multi-mode) | covered by `Interactive` + `SurfaceContext` | **Partially aligned** — web's motion playground stitches tracking / jumping / indeterminate / entry-exit into one switcher with live CSS source. Native exposes the same animation engine but the switcher UI is not ported (no Storybook docs on native). Behaviour parity for `animate` + `show` is identical at the component level. |
| — | (no web equivalent) | `CircularProgressIndicatorDisabled` | **Native extension** — common Storybook pattern; web renders the same via `opacity` inline style if needed. |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `variant` | yes | yes | `'determinate' \| 'indeterminate'` |
| `size` | yes | yes | 10-step `'2XS'..'5XL'` |
| `appearance` | yes | yes | Full 9-role union + `'auto'` (aliased to `ComponentAppearance`) |
| `content` | yes | yes | `'none' \| 'icon' \| 'text'` |
| `value` / `min` / `max` | yes | yes | Identical clamping |
| `children` | yes | yes | Rendered as icon when `content='icon'` |
| `animate` / `show` | yes | yes | Same state machine: determinate enters only at value=0, exits only when value reaches 100; indeterminate driven by `show`. |
| `aria-label` / `aria-labelledby` / `aria-describedby` | yes | yes | Mapped to `accessibilityLabel` / `accessibilityLabelledBy` |
| `aria-live` | yes | yes | Mapped to `accessibilityLiveRegion` (`off → none`) |
| `aria-hidden` | yes | yes | Drives `accessibilityElementsHidden` + `importantForAccessibility` |
| `accessibilityHint` | no | yes | RN-only — surfaced for VoiceOver / TalkBack |
| `testID` | no | yes | RN convention |
| `className` | yes | no | Web-only |
| `style` | `CSSProperties` | `ViewStyle` | |
| `data-testid` | yes | n/a — use `testID` | |

## Token / paint mapping

| Web token / selector | Native equivalent |
|---|---|
| `var(--Primary-Bold)` (indicator stroke) | `useSurfaceTokens(appearance).surfaces.bold` |
| `var(--Primary-Subtle)` (track stroke) | `useSurfaceTokens(appearance).surfaces.subtle` |
| `var(--Primary-TintedA11y)` (label / icon colour) | `useSurfaceTokens(appearance).content.tintedA11y` |
| `[data-surface="bold"]` token remapping | `<Surface mode="bold">` wrapping; `useSurfaceTokens` reads from `SurfaceContext` so the same `appearance` resolves to a different hex inside a Surface |
| `--Motion-Duration-3XL` (determinate value transition) | `tokens.motion.duration.expressive.xlong` |
| `--Motion-Duration-XL` (entry / exit) | `useMotion().duration.moderate.xl`, falls back to 450 ms when no theme is mounted |
| `--Motion-Easing-Transition-Moderate` | `Easing.bezier(0.4, 0, 0.2, 1)` (closest stable native approximation; brand override happens via `Animated.bezier` if surfaced through `useMotion().easings.transition.moderate.bezier`) |
| `--CircularProgressIndicator-rotateDuration` (6000ms) | `CPI_INDETERMINATE_ROTATE_MS = 6000` in styles file |
| `--CircularProgressIndicator-trimDuration` (1500ms) | `CPI_INDETERMINATE_TRIM_MS = 1500` in styles file |
| `@property --cpi-indeterminate-head/tail` keyframes | Single `Animated.Value` 0→1 cycle + `lerpKeyframe` shaping head and tail per cycle (one timing-loop instead of three) |
| Label typography `--Label-3XS-FontSize` etc. | `useTypographyTokens('label', SIZE_TO_LABEL[size], { emphasis: 'medium' })` |

## Behaviour parity

- **Determinate value transition** — both platforms animate the indicator stroke-dashoffset between value updates. Web uses CSS transitions on `stroke-dashoffset`; native uses `Animated.timing` + `setNativeProps` on the indicator `<Circle>` (non-native-driver because SVG props are off the native driver path). The exact duration differs (web ~1015ms via `--Motion-Duration-3XL`; native ~700ms via `expressive.xlong`) — this is the closest equivalent on the native scale.
- **Indeterminate animation** — both render the same After Effects composition (head 2→100 over 0–76.667% of a 1500ms cycle, tail held 0 until 43.333% then 0→100, rotation 0→1080° over 6000ms). Web has each track on its own keyframe; native folds head + tail into a single 0→1 timing loop and uses `lerpKeyframe` to shape both outputs every frame.
- **Entry / exit** — opt-in via `animate`. The state machine (determinate enters only at value=0, exits only when value reaches 100; indeterminate driven by `show`) is duplicated in the native component. Visual treatment is identical: scale 0.93 → 1, stroke 0 → natural, content opacity 0 → 1, all over `--Motion-Duration-XL` (~450ms).
- **Reduced motion** — web honours `prefers-reduced-motion`; native honours `useReduceMotion()`. Both short-circuit indeterminate loops + value transitions to static end-states.
- **Surface context** — both adapt fully inside `<Surface mode="…">`. Web via the `[data-surface]` CSS cascade; native because `useSurfaceTokens` reads from the closest `SurfaceContext`. No `<div style={{ background }}>` workarounds (web) or hard-coded hero fills (native).

## Layers ↔ OneUI mapping

Layers React V4 (`jdscircularprogressindicator-4`) + RN (`jdscircularprogressindicator`) treat CPI and Spinner as one component via a `type: 'cpi' | 'spinner'` prop. OneUI keeps them split:

| Layers prop | OneUI native equivalent |
|---|---|
| `type: 'cpi' \| 'spinner'` | not surfaced — use `<CircularProgressIndicator>` vs `<Spinner>` |
| `variant: 'determinate' \| 'indeterminate'` | identical |
| `size: 'M' \| '2XS' \| 'XS' \| 'S' \| 'L' \| 'XL' \| '2XL' \| '3XL' \| '4XL' \| '5XL'` | identical |
| `appearance` | identical (full 9-role + `auto`) |
| `min` / `max` / `value` | identical |
| `content: React.ReactElement<JDSText \| JDSIcon>` | `content: 'none' \| 'icon' \| 'text'` + optional `children` for the icon node (decouples text rendering from the consumer) |
| `ariaLabel` / `ariaDescribedby` / `ariaLive` | `aria-label` / `aria-describedby` / `aria-live` (dashed for cross-platform parity) |
| `accessibilityHint` | identical |
| `testID` | identical |

## Known gaps / follow-ups

- **Value transition duration** — native uses `expressive.xlong` (≈700ms); web uses `--Motion-Duration-3XL` (≈1015ms). When the native motion scale gains a `3xl` equivalent in `tokens.motion.duration`, swap and remove this entry.
- **Per-instance value transition override** — web exposes `--CircularProgressIndicator-valueTransitionDuration` so the `Interactive` story can switch to 0ms for tracking mode. Native has no token-prop equivalent yet; the demo therefore uses the standard transition (still reads continuously thanks to the 50ms update cadence).
- **Storybook Motion playground** — web's `Motion` story stitches the three modes and the entry/exit cycle into a single radio-driven demo with live CSS source. Native ships the same engine but does not port the playground UI itself.
- **Icon in `WithContent`** — native uses an inline SVG `<Path>` glyph until the Jio icon catalog is wired through `@oneui/ui-native/icons`. Web uses `<Icon icon="download" />`.
