# Icon QA tests

| File | Layer | Status |
|------|-------|--------|
| `icon_functional_test.dart` | Functional `[fn]` + smoke (size, appearance, emphasis, slot inheritance, Surface) | ~80 pass |
| `icon_a11y_test.dart` | Resolver `[a11y]` + widget semantics (decorative / labelled / exclude / focus) | ~30 pass |
| `icon_golden_test.dart` | Visual regression — light (appearance×emphasis, size sweep, slot inheritance) | ~45 baselines |
| `icon_golden_dark_test.dart` | Visual regression — dark mode | ~18 baselines |
| `icon_golden_surface_test.dart` | Visual regression — inside `<Surface mode=…>` | 8 baselines |
| `icon_regression_test.dart` | **Audit burn-down — 17 RED tests by design** | **~17 fail / 1 pass** |
| `../../../integration_test/icon_e2e_test.dart` | On-device E2E | E2E |

Full audit: [`../../../../docs/icon-audit-report.md`](../../../../docs/icon-audit-report.md).

## Why we don't skip regression tests

The 17 failures in `icon_regression_test.dart` are the **17 real component
bugs** from the audit. They fail deterministically because the icon ships
with those bugs. Skipped tests give a false `100% passed` signal — the
suite is designed to **fail when the component is broken**.

## Quick run

```bash
# All headless icon tests
flutter test test/components/icon/

# Just the regression suite (lists pending bugs by [ICN-XX-NNN] tag)
flutter test test/components/icon/icon_regression_test.dart

# E2E (requires connected device)
flutter test integration_test/icon_e2e_test.dart -d emulator-5554

# Bless new visual baselines
flutter test --update-goldens test/components/icon/
```

## High-confidence testing

This suite avoids false confidence by validating ACTUAL behaviour:
- `tester.getSize` measures the rendered Icon dimensions, not just the data attribute.
- `find.bySemanticsLabel` traverses the live Semantics tree.
- Slot inheritance asserted via the data-attribute key the widget actually emits.
- `tester.takeException()` confirms no silent overflow or crash.
- Regression tests assert the EXPECTED contract — they fail until the dev fix lands.

## Driving the bug count to zero

1. Apply the dev fix to `packages/ui_flutter/lib/widgets/one_ui_icon.dart`
   (or its engine / a11y resolver) for the matching `[ICN-XX-NNN]`.
2. Re-run `flutter test test/components/icon/icon_regression_test.dart`.
3. That test turns green; commit with the fix.
4. Decrement `totalPendingBugs` in the `[meta] burn-down counter`.
5. When all 17 pass, the meta counter is 0 and the suite is fully green.
