# Avatar QA tests

| File | Layer | Status |
|------|-------|--------|
| `avatar_functional_test.dart` | Functional `[fn]` + smoke (size, attention, appearance, content, disabled, Surface, testId, initials) | ~80 pass |
| `avatar_a11y_test.dart` | Resolver `[a11y]` + widget semantics (image role, disabled, hint, focus, ExcludeSemantics) | ~15 pass |
| `avatar_golden_test.dart` | Visual regression — light (attention×appearance, size sweep, content, disabled, customSize) | ~35 baselines |
| `avatar_golden_dark_test.dart` | Visual regression — dark mode | ~19 baselines |
| `avatar_golden_surface_test.dart` | Visual regression — auto-resolution inside Surface | ~6 baselines |
| `avatar_regression_test.dart` | **Audit burn-down — 19 RED tests by design** | **~19 fail / 1 pass** |
| `../../../integration_test/avatar_e2e_test.dart` | On-device E2E | E2E |

Full audit: [`../../../../docs/avatar-audit-report.md`](../../../../docs/avatar-audit-report.md).

## Why we don't skip regression tests

The 19 failures in `avatar_regression_test.dart` are the **19 real
component bugs** from the audit. They fail deterministically because the
component ships with those bugs. The suite is designed to **fail when the
component is broken**.

## Quick run

```bash
flutter test test/components/avatar/
flutter test test/components/avatar/avatar_regression_test.dart
flutter test integration_test/avatar_e2e_test.dart -d emulator-5554
flutter test --update-goldens test/components/avatar/
```

## High-confidence testing

This suite avoids false confidence by validating ACTUAL behaviour:
- `tester.getSize` measures rendered container + glyph dimensions per size.
- Opacity widget inspected directly to verify disabled state applies < 1.0.
- Data-attribute key validates content / size / attention / appearance resolution.
- Border radius read off the actual BoxDecoration, not just expected.
- Initials extraction tested against the actual rendered Text widget.
- Surface inheritance assertions read the resolved data-appearance string.
- Image content branch exercised with real `kOneUiAvatarSampleImageUrl`.
- Regression tests assert the EXPECTED contract — they fail until the dev fix lands.

## Driving the bug count to zero

1. Apply the dev fix to `packages/ui_flutter/lib/widgets/one_ui_avatar*.dart`
   for the matching `[AVT-XX-NNN]`.
2. Re-run the regression suite.
3. That test turns green; commit alongside the fix.
4. Decrement `totalPendingBugs`.
5. When all 19 pass, the suite is fully green.
