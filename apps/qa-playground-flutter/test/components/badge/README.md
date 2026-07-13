# Badge QA tests

| File | Layer | Status |
|------|-------|--------|
| `badge_functional_test.dart` | Functional `[fn]` + smoke (size, attention, appearance, slots, shrink-wrap, Surface context) | mostly green |
| `badge_a11y_test.dart` | Resolver `[a11y]` + widget semantics (live-region, label precedence, slot exclusion) | mostly green |
| `badge_golden_test.dart` | Visual regression — light mode (core states, attention × appearance, size × attention, slot variations) | bless if pixel drift |
| `badge_golden_dark_test.dart` | Visual regression — dark mode | bless if pixel drift |
| `badge_golden_surface_test.dart` | Visual regression — inside `<Surface mode=…>` | bless if pixel drift |
| `badge_regression_test.dart` | **Audit burn-down** — one RED test per open audit bug | count shrinks as bugs close |
| `../../../integration_test/badge_e2e_test.dart` | On-device E2E | E2E |

Full test plan: [`../../docs/badge_test_plan.md`](../../docs/badge_test_plan.md).

## Regression suite philosophy

The regression file asserts **correct** behavior from [`docs/badge-audit-report.md`](../../../../docs/badge-audit-report.md).
Tests fail deterministically until the matching dev fix lands. They are not flaky.

Several audit items were **reclassified or fixed** — the regression tests were updated accordingly:

| ID | Status | Notes |
|----|--------|-------|
| BADGE-FN-001 / FN-011 | **Fixed** | `oneUiConvexGapPlaceholder` guards release via `kDebugMode`; debug builds show ConvexGapCard by design |
| BADGE-FN-002, FN-003, FN-004 | **Fixed** | `Flexible` text, harness bootstrap, widget-child path |
| BADGE-FN-008 | **Fixed** | Slot a11y uses real slot widgets (`OneUiCounterBadge`), not raw `Semantics` |
| BADGE-A11Y-002, A11Y-003 | **Fixed** | Whitespace trim + inherited `Directionality` |
| BADGE-A11Y-005 | **Not a bug** | Harness issue; test removed (audit §0) |
| BADGE-A11Y-006 | **Manual** | Skipped — requires Flutter Web browser verification |
| BADGE-A11Y-008 | **Fixed** | `MediaQuery.highContrastOf` in `badge_color_resolve.dart` |
| BADGE-VIS-001, VIS-004–007 | **Fixed** | Overflow, padding, slot sizes |
| BADGE-FN-010 | **Fixed** | Invalid appearance → `neutral` via `oneUiResolveBadgeExplicitAppearance` |
| BADGE-A11Y-004 | **Fixed** | `ConstrainedBox(minHeight)` shell |
| BADGE-VIS-008 | **Fixed** | `--Badge-roleMaterialText` in `badge_color_resolve.dart` |
| BADGE-VIS-002 | **Fixed** | Label `Text.height` follows `resolveBadgeLayout` tokens (no widget clamp) |

Still open: VIS-004 (mixed-slot symmetric padding).

## Quick run

```bash
# All headless badge tests
flutter test test/components/badge/

# Just the regression burn-down
flutter test test/components/badge/badge_regression_test.dart

# Bless new visual baselines
flutter test --update-goldens test/components/badge/
```

## Driving the bug count to zero

1. Apply the dev fix for the matching `[BADGE-XX-NNN]`.
2. Re-run `flutter test test/components/badge/badge_regression_test.dart`.
3. That test should turn green; decrement `totalPendingBugs` in the meta counter.
4. When all bug tests pass, set the counter to `0`.

See `docs/badge-audit-report.md` for the full table + recommended fixes.
