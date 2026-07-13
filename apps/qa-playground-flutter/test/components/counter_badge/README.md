# CounterBadge QA tests

| File | Layer | Status |
|------|-------|--------|
| `counter_badge_functional_test.dart` | Functional `[fn]` + smoke (size, attention, appearance, max, dot-mode, showZero, Surface context) | Green |
| `counter_badge_a11y_test.dart` | Resolver `[a11y]` + widget semantics (live-region lifecycle, label precedence) | Green |
| `counter_badge_golden_test.dart` | Visual regression — light mode (core states, attention × appearance, size × attention, dot, overflow) | ~50 baselines |
| `counter_badge_golden_dark_test.dart` | Visual regression — dark mode | ~19 baselines |
| `counter_badge_golden_surface_test.dart` | Visual regression — inside `<Surface mode=…>` | ~13 baselines |
| `counter_badge_regression_test.dart` | Audit burn-down — **real assertions only** (no hardcoded `fail()` stubs) | **~8 open bugs** |
| `../../../integration_test/counter_badge_e2e_test.dart` | On-device E2E | E2E |

Full audit: [`../../../../docs/counter-badge-audit-report.md`](../../../../docs/counter-badge-audit-report.md).

## Regression test policy

Each `[CB-XX-NNN]` test asserts **observable behavior** (semantics tree, resolved
colors, data-attribute keys, layout metrics). Tests turn green automatically when
the component fix lands — no manual `fail()` removal.

**Do not** use unconditional `fail()` as a ticket stub. If an assertion cannot be
written yet, track the item in the audit doc or issue tracker instead.

### Closed in tests (no longer failing)

| ID | Resolution |
|----|------------|
| CB-FN-001 | Production guarded via `kDebugMode` (`convex_design_system_guard.dart`); debug diagnostic expected in `flutter test` |
| CB-FN-003 | `--CounterBadge-backgroundColor-bold` applies for all appearances |
| CB-FN-004 | `appearance=auto` inside Surface → primary |
| CB-FN-006 | Runtime overflow math (API `int` vs web `number` is audit-only, not a failing test) |
| CB-FN-009 | Invalid appearance → neutral |
| CB-FN-010 | `data-attention` derived from explicit variant (documented contract) |
| CB-A11Y-001 | Whitespace label trimmed; AT gets displayValue |
| CB-A11Y-002 | `OneUiStatusSemantics` — live region off after settle |
| CB-A11Y-003 | Single semantics label; inner Text excluded |
| CB-A11Y-004 | Not a focus stop |
| CB-VIS-001 | Typography fallback sets fontFamily |
| CB-VIS-004 | Height spacing cascade (not literal 16 px) |
| CB-VIS-005 | Flutter `xl` size accepted; height ≥ `l` |

### Still open (fails until dev fix)

| ID | What developers must fix |
|----|--------------------------|
| CB-FN-002 | Unconfigured `appearance='sparkle'` must fall back to neutral (not pass through canonical list to Material) |
| CB-FN-005 | `max=0` should produce `"0+"` (or align web to Flutter default 99) |
| CB-FN-007 | Hidden `value=0` must retain live-region semantics for 1→0 AT announcement |
| CB-FN-008 | `testId` → `Semantics.identifier` for Patrol/Maestro |
| CB-FN-011 | Dot-mode without `semanticsLabel` must not announce raw digit |
| CB-A11Y-005 | Badge height must scale with `MediaQuery.textScaler` (WCAG 1.4.4) |
| CB-A11Y-006 | Same as CB-FN-011 (dot-mode a11y) |
| CB-VIS-002 | Remove `textHeightBehavior` override on digit label |
| CB-VIS-003 | Line-height from token, not `.copyWith(height: 1)` |

## Quick run

```bash
# All headless counter-badge tests
flutter test test/components/counter_badge/

# Just the regression suite (lists pending bugs by [CB-XX-NNN] tag)
flutter test test/components/counter_badge/counter_badge_regression_test.dart

# E2E (requires connected device)
flutter test integration_test/counter_badge_e2e_test.dart -d emulator-5554

# Bless new visual baselines
flutter test --update-goldens test/components/counter_badge/
```

## Driving the bug count to zero

1. Apply the dev fix to `packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart`
   (or its engine / a11y resolver) for the matching `[CB-XX-NNN]`.
2. Re-run `flutter test test/components/counter_badge/counter_badge_regression_test.dart`.
3. That test turns green automatically when behavior matches the assertion.
4. Decrement `totalPendingBugs` in the `[meta] burn-down counter` test.
5. When all pending pass, set the meta counter to `0`.

See [`docs/counter-badge-audit-report.md`](../../../../docs/counter-badge-audit-report.md)
for the full table + recommended fixes.
