# IndicatorBadge QA tests

| File | Layer | Status |
|------|-------|--------|
| `indicator_badge_functional_test.dart` | Functional `[fn]` + smoke (size, appearance, overlay anchors, data-attribute key, Surface context) | ~40 pass |
| `indicator_badge_a11y_test.dart` | Resolver `[a11y]` + widget semantics (live-region, label-required contract) | ~25 pass |
| `indicator_badge_golden_test.dart` | Visual regression — core dots, size × appearance, overlay anchors | ~30 baselines |
| `indicator_badge_regression_test.dart` | **Audit burn-down — 18 RED tests by design** (1 per audit bug). Pass count grows as devs close bugs. | **~18 fail / 1 pass** |
| `../../../integration_test/indicator_badge_e2e_test.dart` | On-device E2E | E2E |

Full audit: [`../../../../docs/indicator-badge-audit-report.md`](../../../../docs/indicator-badge-audit-report.md).

## Why we don't skip the regression tests

The 18 failures in `indicator_badge_regression_test.dart` are the **18 real
component bugs** identified in the audit. They are **not** flaky — they fail
deterministically because the indicator badge ships with those bugs.

A test that exists only to be skipped doesn't validate anything. Skipped tests
give a misleading `100% passed` signal while the bugs ship to production. The
suite is designed to **fail when the component is broken** — the failures are
the bug tickets that block release.

## Quick run

```bash
# All headless indicator-badge tests
flutter test test/components/indicator_badge/

# Just the regression suite (lists pending bugs by [IB-XX-NNN] tag)
flutter test test/components/indicator_badge/indicator_badge_regression_test.dart

# E2E (requires connected device)
flutter test integration_test/indicator_badge_e2e_test.dart -d emulator-5554

# Bless new visual baselines
flutter test --update-goldens test/components/indicator_badge/
```

## Driving the bug count to zero

1. Apply the dev fix to `packages/ui_flutter/lib/widgets/one_ui_indicator_badge.dart`
   (or its engine / a11y / overlay resolver) for the matching `[IB-XX-NNN]`.
2. Re-run `flutter test test/components/indicator_badge/indicator_badge_regression_test.dart`.
3. That test turns green; commit alongside the fix.
4. Decrement `totalPendingBugs` in the `[meta] burn-down counter` test.
5. When all 18 pass, the meta counter is set to 0 and the suite goes fully green.

See [`docs/indicator-badge-audit-report.md`](../../../../docs/indicator-badge-audit-report.md)
for the full table + recommended fixes.
