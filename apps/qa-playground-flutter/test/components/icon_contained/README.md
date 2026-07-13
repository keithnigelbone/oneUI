# IconContained QA tests

| File | Layer | Status |
|------|-------|--------|
| `icon_contained_functional_test.dart` | Functional `[fn]` + smoke (size, attention, appearance, disabled, Surface, custom glyph) | ~65 pass |
| `icon_contained_a11y_test.dart` | Resolver `[a11y]` + widget semantics (image role, disabled, hint, focus) | ~25 pass |
| `icon_contained_golden_test.dart` | Visual regression — light (attention×appearance, size sweep, disabled) | ~23 baselines |
| `icon_contained_golden_dark_test.dart` | Visual regression — dark mode | ~12 baselines |
| `icon_contained_regression_test.dart` | **Audit burn-down — asserts correct contract per bug** | **Fails until each bug is fixed** |
| `../../../integration_test/icon_contained_e2e_test.dart` | On-device E2E | E2E |

Full audit: [`../../../../docs/icon-contained-audit-report.md`](../../../../docs/icon-contained-audit-report.md).

## Why we don't skip regression tests

Each regression case in `icon_contained_regression_test.dart` maps to one audit
bug (`ICC-FN-*`, `ICC-A11Y-*`, `ICC-VIS-*`) and asserts the **expected**
contract. Tests fail while the component is wrong and turn green when the matching
fix lands — no stub `fail()` calls.

## Quick run

```bash
flutter test test/components/icon_contained/
flutter test test/components/icon_contained/icon_contained_regression_test.dart
flutter test integration_test/icon_contained_e2e_test.dart -d emulator-5554
flutter test --update-goldens test/components/icon_contained/
```

## High-confidence testing

This suite avoids false confidence by validating ACTUAL behaviour:
- `tester.getSize` measures rendered container + glyph dimensions.
- Opacity widget inspected directly to verify disabled state applies < 1.0.
- Data-attribute key validates appearance / attention / disabled resolution.
- Border radius read off the actual BoxDecoration, not just expected.
- Regression tests assert the EXPECTED contract — they fail until the dev fix lands.

## Driving the bug count to zero

1. Apply the dev fix to `packages/ui_flutter/lib/widgets/one_ui_icon_contained.dart`
   for the matching `[ICC-XX-NNN]`.
2. Re-run the regression suite.
3. That test turns green; commit alongside the fix.
4. Re-run `flutter test test/components/icon_contained/icon_contained_regression_test.dart`.
5. When all regression cases pass, the audit burn-down is complete.
