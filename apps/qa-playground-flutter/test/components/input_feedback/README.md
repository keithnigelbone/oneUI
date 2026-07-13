# InputFeedback — QA test suite

Comprehensive functional, accessibility, Figma-parity, platform, visual-regression, and on-device E2E coverage for `OneUiInputFeedback`.

## Run

```bash
# All headless widget tests for InputFeedback
flutter test test/components/input_feedback/

# Single tier
flutter test test/components/input_feedback/input_feedback_figma_parity_test.dart
flutter test test/components/input_feedback/input_feedback_platform_test.dart

# Visual / golden (requires Jio fixture network)
flutter test test/components/input_feedback/input_feedback_golden_test.dart
flutter test test/components/input_feedback/input_feedback_golden_dark_test.dart
flutter test test/components/input_feedback/input_feedback_golden_surface_test.dart

# Bless baselines after intentional visual changes
flutter test --update-goldens test/components/input_feedback/

# E2E on device
flutter test integration_test/input_feedback_e2e_test.dart -d emulator-5554

# E2E with visible holds (debugging)
flutter test integration_test/input_feedback_e2e_test.dart -d emulator-5554 \
  --dart-define=DEMO_MODE=true

# From monorepo root
pnpm qa:flutter:component -- input-feedback
```

## Test tiers

| File | Tag | What it validates |
|------|-----|-------------------|
| `input_feedback_functional_test.dart` | `[fn]` `[smoke]` | Message render, testId ValueKey, empty message, data payload key |
| `input_feedback_a11y_test.dart` | `[a11y]` | Alert role (negative), polite live region (positive), ariaLabel, ariaHidden |
| `input_feedback_figma_parity_test.dart` | `[figma]` | Every Figma API value (offline synthetic harness) |
| `input_feedback_platform_test.dart` | `[platform]` | Mobile vs desktop semantics + non-interactive contract |
| `input_feedback_golden_test.dart` | `[golden]` | Light-mode pixel regression (Jio fixture, 16 baselines) |
| `input_feedback_golden_dark_test.dart` | `[golden][dark]` | Dark-mode token remapping (12 baselines) |
| `input_feedback_golden_surface_test.dart` | `[golden][surface]` | Surface-context nesting (13 baselines) |
| `input_feedback_regression_test.dart` | `[regression]` | Audit burn-down + parity proofs |
| `integration_test/input_feedback_e2e_test.dart` | `[e2e]` | Real device rendering + semantics |

## Figma matrix covered

- **Sizes:** s, m, l → f8 / f10 / f12
- **Attention:** low (default), medium, high
- **Variants:** negative, positive, warning, informative
- **Default icons:** error, checkCircle, warning, info
- **feedbackMessage** / **feedback_message** alias
- **customIcon** / **customIconName**

## Regression burn-down

Intentional RED tests in `input_feedback_regression_test.dart`:

- `[IFB-DEB-001]` — `testId` not exposed via `Semantics.identifier`

GREEN parity proofs:

- `[IFB-A11Y-001]` — negative → `SemanticsRole.alert`; others → polite `liveRegion`

## Harness

`test/support/components/input_feedback_harness.dart`:

- `pumpInputFeedbackQaHarness` — synthetic DS (offline functional/a11y/figma)
- `pumpInputFeedbackJioHarnessSettled` — real Jio fixture (goldens + E2E)
- Real-value accessors: `inputFeedbackSemanticsData`, `inputFeedbackHasLiveRegion`, `inputFeedbackProbedPayloadKey`, `inputFeedbackBackgroundColor`
- `ensureInputFeedbackIconsLoaded` — preload SVG catalog in `setUpAll` (prevents 10-min hang)

## Fixed — golden / figma hang (icon catalog must be preloaded)

Default feedback icons (`error`, `checkCircle`, `warning`, `info`) load from the SVG
catalog. Preload via `ensureInputFeedbackIconsLoaded()` in every tier's `setUpAll` —
never lazy-load inside `testWidgets` fake-async zone.
