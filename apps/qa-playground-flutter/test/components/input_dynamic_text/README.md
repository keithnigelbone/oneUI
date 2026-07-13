# InputDynamicText — QA test suite

Comprehensive functional, accessibility, Figma-parity, platform, visual-regression, and on-device E2E coverage for `OneUiInputDynamicText`.

## Run

```bash
# All headless widget tests for InputDynamicText
flutter test test/components/input_dynamic_text/

# Single tier
flutter test test/components/input_dynamic_text/input_dynamic_text_figma_parity_test.dart
flutter test test/components/input_dynamic_text/input_dynamic_text_platform_test.dart

# Visual / golden (requires Jio fixture network)
flutter test test/components/input_dynamic_text/input_dynamic_text_golden_test.dart
flutter test test/components/input_dynamic_text/input_dynamic_text_golden_dark_test.dart
flutter test test/components/input_dynamic_text/input_dynamic_text_golden_surface_test.dart

# Bless baselines after intentional visual changes
flutter test --update-goldens test/components/input_dynamic_text/

# E2E on device
flutter test integration_test/input_dynamic_text_e2e_test.dart -d emulator-5554

# E2E with visible holds (debugging)
flutter test integration_test/input_dynamic_text_e2e_test.dart -d emulator-5554 \
  --dart-define=DEMO_MODE=true

# From monorepo root
pnpm qa:flutter:component -- input-dynamic-text
```

## Test tiers

| File | Tag | What it validates |
|------|-----|-------------------|
| `input_dynamic_text_functional_test.dart` | `[fn]` `[smoke]` | Callbacks, slots, size/data attributes, disabled, trailingOnly, isEmpty |
| `input_dynamic_text_a11y_test.dart` | `[a11y]` | aria-live regions, helper button label/hint/enabled state |
| `input_dynamic_text_figma_parity_test.dart` | `[figma]` | Every Figma API value (offline synthetic harness) |
| `input_dynamic_text_platform_test.dart` | `[platform]` | Mobile tap vs desktop keyboard activation |
| `input_dynamic_text_golden_test.dart` | `[golden]` | Light-mode pixel regression (Jio fixture) |
| `input_dynamic_text_golden_dark_test.dart` | `[golden][dark]` | Dark-mode token remapping |
| `input_dynamic_text_golden_surface_test.dart` | `[golden][surface]` | Surface-context nesting |
| `input_dynamic_text_regression_test.dart` | `[regression]` | Audit burn-down + parity proofs |
| `integration_test/input_dynamic_text_e2e_test.dart` | `[e2e]` | Real device rendering + gestures |

## Figma matrix covered

- **Sizes:** s, m, l → body XS/S/M + trailing Button f8/f10/f12
- **Content:** Text, none (leading dynamic copy)
- **End:** none, Button (trailing helper action)
- **States:** trailingOnly, isEmpty, disabled
- **aria-live:** off, polite, assertive on leading copy

## Regression burn-down

Intentional RED tests in `input_dynamic_text_regression_test.dart`:

- `[IDT-DEB-001]` — `testId` not exposed via `Semantics.identifier`

Fix the component, then flip the test green.

## Harness

`test/support/components/input_dynamic_text_harness.dart`:

- `pumpInputDynamicTextQaHarness` — synthetic DS (offline functional/a11y/figma)
- `pumpInputDynamicTextJioHarnessSettled` — real Jio fixture (goldens + E2E)
- `ensureInputDynamicTextIconsLoaded` — preloads icon catalog via `ensureInputIconsLoaded`
- Real-value accessors: `inputDynamicTextLeadingTextStyle`, `inputDynamicTextHelperButtonHeightPx`, `inputDynamicTextRowAlignment`, `inputDynamicTextLiveRegionFinder`, `inputDynamicTextHelperButtonSemantics`

## Fixed — golden / figma hang (icon catalog must be preloaded)

Preload icons in real-async `setUpAll`:

```dart
setUpAll(() async {
  await ensureJioFixtureReady();              // goldens only
  await ensureInputDynamicTextIconsLoaded();  // prevents lazy in-test hang
});
```
