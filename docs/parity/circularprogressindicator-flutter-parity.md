# CircularProgressIndicator — Flutter parity

Flutter: `packages/ui_flutter/lib/widgets/one_ui_circular_progress_indicator.dart`  
Web: `packages/ui/src/components/CircularProgressIndicator/`  
React Native: `packages/ui-native/src/components/CircularProgressIndicator/`

## API

| Web / RN prop | Flutter |
| ------------- | ------- |
| `variant` | `variant` |
| `size` | `size` (`2XS`…`5XL`) |
| `appearance` | `appearance` |
| `content` | `content` |
| `value` / `min` / `max` | `value` / `min` / `max` |
| `children` (icon) | `child` |
| `aria-label` | `semanticsLabel` |
| `aria-labelledby` | `semanticsLabelledBy` |
| `aria-describedby` | `semanticsDescribedBy` |
| `aria-live` | `ariaLive` |
| `aria-hidden` | `ariaHidden` |
| `accessibilityHint` | `semanticsHint` |
| `animate` / `show` | `animate` / `show` |
| `valueTransitionDuration` | `valueTransitionDuration` |
| `testID` / `data-testid` | `testId` |

State resolver mirrors `useCircularProgressState` / `useCircularProgressIndicatorState` (SVG geometry, indeterminate coercion, `auto` → `primary`).

## Visual

- Diameter: `--Spacing-2` … `--Spacing-16` per size (Convex dimension contexts).
- Ring colours: role `bold` / `subtle` / `tintedA11y` via `OneUiSurfaceScope` (same as web `--_indicator-color` cascade).
- Indeterminate: head/tail keyframes + 1080° rotation over 1500 ms / 6000 ms (motion token overrides supported).
- Determinate: arc sweep from normalized value; transition uses `--Motion-Duration-3XL` unless `valueTransitionDuration: 0`.
- Entry/exit: scale 0.93 → 1 + stroke fade when `animate` + `show` (phase machine matches web/RN).

## Accessibility

- `Semantics` label + value (`N percent`) when determinate; busy when indeterminate.
- Centre label/icon excluded from semantics tree.
- Dev-mode warning when label missing (web `console.warn` parity).
- `semanticsLabelledBy` / `semanticsDescribedBy` → `Semantics.identifier` (web `aria-labelledby` / RN `accessibilityLabelledBy`).
- `ariaLive` polite/assertive → `Semantics.liveRegion` (mobile + web).

## Tests

| File | Mirrors |
| ---- | ------- |
| `test/one_ui_circular_progress_indicator_a11y_test.dart` | RN `CircularProgressIndicatorA11y.test.ts` |
| `test/circular_progress_indicator_react_parity_test.dart` | Web `CircularProgressIndicator.test.tsx` + RN state + widget a11y (Android, iOS, Linux/web) |
| `test/one_ui_circular_progress_indicator_painter_test.dart` | Indeterminate trim / rotation painter |
| `test/one_ui_circular_progress_indicator_test.dart` | Types + smoke |

Run: `cd packages/ui_flutter && flutter test test/one_ui_circular_progress_indicator_a11y_test.dart test/circular_progress_indicator_react_parity_test.dart`

## Storybook

Flutter Storybook (`apps/storybook_flutter`) stories align with `CircularProgressIndicator.stories.tsx`: Default, Variants, Sizes, Appearances, With Content, States, Interactive, Surface Context, Motion (+ Jumping, Tracking, Entry Exit).
