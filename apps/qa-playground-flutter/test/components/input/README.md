# Input — QA test suite

Comprehensive functional, accessibility, Figma-parity, platform, visual-regression, and on-device E2E coverage for `OneUiInput`.

## Run

```bash
# All headless widget tests for Input
flutter test test/components/input/

# Single tier
flutter test test/components/input/input_figma_parity_test.dart
flutter test test/components/input/input_platform_test.dart

# Visual / golden (requires Jio fixture network)
flutter test test/components/input/input_golden_test.dart
flutter test test/components/input/input_golden_dark_test.dart
flutter test test/components/input/input_golden_surface_test.dart

# Bless baselines after intentional visual changes
flutter test --update-goldens test/components/input/

# E2E on device
flutter test integration_test/input_e2e_test.dart -d emulator-5554

# From monorepo root
pnpm qa:flutter:component -- input
```

## Test tiers

| File | Tag | What it validates |
|------|-----|-------------------|
| `input_functional_test.dart` | `[fn]` `[smoke]` | Callbacks, disabled, readOnly, controlled value, testId |
| `input_a11y_test.dart` | `[a11y]` | ariaLabel, errorHighlight → validationResult |
| `input_figma_parity_test.dart` | `[figma]` | Every Figma API value (offline synthetic harness) |
| `input_platform_test.dart` | `[platform]` | Mobile tap/enterText vs desktop Tab focus |
| `input_golden_test.dart` | `[golden]` | Light-mode pixel regression (Jio fixture) |
| `input_golden_dark_test.dart` | `[golden][dark]` | Dark-mode token remapping |
| `input_golden_surface_test.dart` | `[golden][surface]` | Surface-context nesting |
| `input_regression_test.dart` | `[regression]` | Audit burn-down + parity proofs |
| `integration_test/input_e2e_test.dart` | `[e2e]` | Real device rendering + gestures |

## Figma matrix covered

- **Sizes:** xs (f6 native), s, m, l
- **Attention:** medium, high
- **Appearances:** auto + 8 Figma roles (brand-bg → secondary)
- **Shape:** default, pill
- **States:** idle, filled, readOnly, disabled, errorHighlight

## Regression burn-down

Intentional RED tests in `input_regression_test.dart`:

- `[INP-DEB-001]` — `testId` not exposed via `Semantics.identifier`
- `[INP-DEB-002]` — xs touch target below 44px on mobile

## Harness

`test/support/components/input_harness.dart`:

- `pumpInputQaHarness` — synthetic DS (offline functional/a11y/figma)
- `pumpInputJioHarnessSettled` — real Jio fixture (goldens + E2E)
- Real-value accessors: `inputShellHeightPx`, `inputShellDecoration`, `inputControlSemanticsData`
