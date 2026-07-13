# InputField — QA test suite

Comprehensive functional, accessibility, Figma-parity, platform, visual-regression, and on-device E2E coverage for `OneUiInputField`.

## Run

```bash
# All headless widget tests for InputField
flutter test test/components/input_field/

# Single tier
flutter test test/components/input_field/input_field_figma_parity_test.dart
flutter test test/components/input_field/input_field_platform_test.dart

# Visual / golden (requires Jio fixture network)
flutter test test/components/input_field/input_field_golden_test.dart
flutter test test/components/input_field/input_field_golden_dark_test.dart
flutter test test/components/input_field/input_field_golden_surface_test.dart

# Bless baselines after intentional visual changes
flutter test --update-goldens test/components/input_field/

# E2E on device
flutter test integration_test/input_field_e2e_test.dart -d emulator-5554

# E2E with visible holds (debugging)
flutter test integration_test/input_field_e2e_test.dart -d emulator-5554 \
  --dart-define=DEMO_MODE=true

# From monorepo root
pnpm qa:flutter:component -- input-field
```

## Test tiers

| File | Tag | What it validates |
|------|-----|-------------------|
| `input_field_functional_test.dart` | `[fn]` `[smoke]` | Callbacks, disabled, description, feedback, dynamicText, testId |
| `input_field_a11y_test.dart` | `[a11y]` | Root decorative semantics, ariaLabel, describedby, alert feedback |
| `input_field_figma_parity_test.dart` | `[figma]` | Every Figma API value (offline synthetic harness) |
| `input_field_platform_test.dart` | `[platform]` | Mobile tap/enterText vs desktop keyboard/hover |
| `input_field_golden_test.dart` | `[golden]` | Light-mode pixel regression (Jio fixture) |
| `input_field_golden_dark_test.dart` | `[golden][dark]` | Dark-mode token remapping |
| `input_field_golden_surface_test.dart` | `[golden][surface]` | Surface-context nesting |
| `input_field_regression_test.dart` | `[regression]` | Audit burn-down + parity proofs |
| `integration_test/input_field_e2e_test.dart` | `[e2e]` | Real device rendering + gestures |

## Figma matrix covered

- **Sizes:** s, m, l (f8 / f10 / f12)
- **Booleans:** label, required, infoIcon, description, feedback, dynamicText, disabled
- **Gating:** infoIcon requires label (no labelSlot); required asterisk gated on label; invalid from error/ariaInvalid/invalid
- **Nested Input:** appearance, attention, shape, slots forwarded to inner `OneUiInput`
- **describedby:** `{id}-description`, `{id}-feedback`, `{id}-dynamic` when `id` is set

## Regression burn-down

Intentional RED tests in `input_field_regression_test.dart`:

- `[IFD-DEB-001]` — `testId` not exposed via `Semantics.identifier`
- `[IFD-DEB-002]` — size s touch target below 44px on mobile

Investigated and parity-aligned (GREEN in regression suite):

- `[IFD-A11Y-002]` — `required` **is** exposed to AT via inner `OneUiInput` (`IFD-PAR-008`)

GREEN parity proofs: `[IFD-PAR-001]`..`[IFD-PAR-008]`.

Fix the component, then flip RED tests green.

## Harness

`test/support/components/input_field_harness.dart` (re-exports `input_harness.dart`):

- `pumpInputFieldQaHarness` — synthetic DS (offline functional/a11y/figma)
- `pumpInputFieldJioHarnessSettled` — real Jio fixture (goldens + E2E)
- Real-value accessors: `inputFieldShellHeightPx`, `inputFieldControlSemanticsData`, `inputFieldDescribedByNodeIds`, `inputFieldHasRequiredAsterisk`, `inputFieldHasInfoIcon`

Preload icons in `setUpAll`:

```dart
setUpAll(() async {
  await ensureJioFixtureReady();   // goldens / e2e only
  await ensureInputIconsLoaded();  // prevents 10-min icon-catalog hang
});
```
