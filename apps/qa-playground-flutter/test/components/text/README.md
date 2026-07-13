# Text — QA test suite

Comprehensive functional, accessibility, Figma-parity, platform, visual-regression, and on-device E2E coverage for `OneUiText`.

## Run

```bash
# All headless widget tests for Text
flutter test test/components/text/

# Single tier
flutter test test/components/text/text_figma_parity_test.dart
flutter test test/components/text/text_platform_test.dart

# Visual / golden (requires Jio fixture network)
flutter test test/components/text/text_golden_test.dart
flutter test test/components/text/text_golden_dark_test.dart
flutter test test/components/text/text_golden_surface_test.dart

# Bless baselines after intentional visual changes
flutter test --update-goldens test/components/text/

# E2E on device
flutter test integration_test/text_e2e_test.dart -d emulator-5554

# E2E with visible holds (debugging)
flutter test integration_test/text_e2e_test.dart -d emulator-5554 \
  --dart-define=DEMO_MODE=true

# From monorepo root
pnpm qa:flutter:component -- text
```

## Test tiers

| File | Tag | What it validates |
|------|-----|-------------------|
| `text_functional_test.dart` | `[fn]` `[smoke]` | Callbacks, variants, testId, decorations, maxLines |
| `text_a11y_test.dart` | `[a11y]` | Semantics label/header/link, resolver units + widget probes |
| `text_figma_parity_test.dart` | `[figma]` | Every Figma API value (offline synthetic harness) |
| `text_platform_test.dart` | `[platform]` | Mobile tap vs desktop link/header semantics |
| `text_golden_test.dart` | `[golden]` | Light-mode pixel regression (Jio fixture, 11 baselines + 1 synthetic code) |
| `text_golden_dark_test.dart` | `[golden][dark]` | Dark-mode token remapping (8 baselines; code omitted — JetBrains offline) |
| `text_golden_surface_test.dart` | `[golden][surface]` | Surface-context colour remapping (13 baselines) |
| `text_regression_test.dart` | `[regression]` | Audit burn-down + parity proofs |
| `integration_test/text_e2e_test.dart` | `[e2e]` | Real device rendering + gestures |

## Figma matrix covered

- **Variants:** body, label, title, headline, display, code
- **Size:** per-variant clamping (body 2XS–2XL, label 3XS–2XL, display/headline/title L/M/S, code M/S/XS)
- **Weight:** high, medium, low (scoped to body/label/code only)
- **Attention:** none, high, medium, low, tintedA11y (display/headline/title high-only)
- **Appearance:** auto + 9 roles (`auto` → `neutral`)
- **Decorations:** italic, underline, strikethrough
- **Layout:** textAlign left/center/right, numberOfLines truncation

## Regression burn-down

Intentional RED tests in `text_regression_test.dart`:

- `[TXT-DEB-001]` — `testId` not exposed via `Semantics.identifier`

Fix the component, then flip the test green.

## Harness

`test/support/components/text_harness.dart`:

- `pumpTextQaHarness` — synthetic DS + full typography roles (offline functional/a11y/figma)
- `pumpTextJioHarnessSettled` — real Jio fixture (goldens + E2E)
- Real-value accessors: `textStyleOf`, `textColorOf`, `textAlignOf`, `textSemanticsData`
