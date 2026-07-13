# Checkbox QA tests

| File | Layer | Status |
|------|-------|--------|
| `checkbox_functional_test.dart` | Functional `[fn]` + smoke (toggle, controlled/uncontrolled, indeterminate, readOnly, group multi-select) | pass |
| `checkbox_a11y_test.dart` | Resolver `[a11y]` + widget semantics (label fallback, checked/mixed, disabled, readOnly, hint, aria-hidden) | pass |
| `checkbox_figma_parity_test.dart` | `[figma]` — every Figma API value end-to-end (size, appearance, accent-ignored, checked, indeterminate, readOnly, disabled, label, description, states matrix) | 153 pass |
| `checkbox_platform_test.dart` | `[platform]` mobile (tap toggles, hit area, checkbox role) vs web/desktop (focus ring, pointer toggle, no focus when disabled) | 14 pass |
| `checkbox_golden_test.dart` | Visual regression — light (state × size, state × appearance, readOnly, disabled, label/description, errorHighlight) | 30 baselines |
| `checkbox_golden_dark_test.dart` | Visual regression — dark mode (state × appearance, readOnly) | 14 baselines |
| `checkbox_golden_surface_test.dart` | Visual regression — `appearance:auto` inside Surface (unchecked-appearance inheritance) | 6 baselines |
| `checkbox_regression_test.dart` | **Audit burn-down — 4 confirmed + 3 debatable RED, 6 parity + meta GREEN** | **17 RED / 19 GREEN by design** |
| `../../../integration_test/checkbox_e2e_test.dart` | On-device E2E (real toggles, group multi-select, dark, surface, semantics) | E2E |

Full audit: [`../../../../docs/checkbox-audit-report.md`](../../../../docs/checkbox-audit-report.md).
Dev tickets: [`../../../../docs/checkbox-flutter-bugs.md`](../../../../docs/checkbox-flutter-bugs.md).

Total goldens: **50** (30 light + 14 dark + 6 surface).

## Why we don't skip regression tests

The 17 failures in `checkbox_regression_test.dart` are the **real component
gaps** from the audit — 4 confirmed Flutter bugs (×platform multiplier) plus 3
debatable hardening items. They fail deterministically because the component
ships with those gaps. The `[parity]` + `[meta]` groups are GREEN proofs that
Flutter matches the web contract.

## High-confidence testing (no false confidence)

This suite validates ACTUAL behaviour — every RED test was reproduced against the
real widget with a throwaway probe BEFORE the assertion was written:

- `checkboxBoxSizePx` measures the real rendered box (s=16 / m=20 / l=24).
- `checkboxBoxDecoration` reads the real `BoxDecoration` (fill + border + shadows)
  to prove appearance/accent/checked/readonly paint differences.
- `Opacity` widget inspected directly: disabled = 0.5, readOnly = 1.0.
- Real `SemanticsData` flags (`hasCheckedState`, `isChecked`,
  `isCheckStateMixed`, `isEnabled`, `validationResult`, `identifier`).
- Keyboard: real `sendKeyEvent(space/enter)` with a desktop platform override —
  proving the keyboard-activation gap rather than guessing.
- Goldens render with the real Jio Convex fixture (production token resolution),
  not a synthetic palette, so baselines match the qa-playground app.

## Quick run

```bash
# Functional + a11y + figma + platform (all GREEN)
flutter test test/components/checkbox/checkbox_functional_test.dart \
  test/components/checkbox/checkbox_a11y_test.dart \
  test/components/checkbox/checkbox_figma_parity_test.dart \
  test/components/checkbox/checkbox_platform_test.dart

# Regression burn-down (confirmed + debatable RED, parity + meta GREEN)
flutter test test/components/checkbox/checkbox_regression_test.dart

# Goldens
flutter test --update-goldens \
  test/components/checkbox/checkbox_golden_test.dart \
  test/components/checkbox/checkbox_golden_dark_test.dart \
  test/components/checkbox/checkbox_golden_surface_test.dart

# On-device E2E
flutter test integration_test/checkbox_e2e_test.dart -d <device>
```

## Driving the bug count to zero

1. Apply the dev fix to `packages/ui_flutter/lib/widgets/one_ui_checkbox*.dart`
   (or the engines) for the matching `[CB-XX-NNN]`.
2. Re-run `checkbox_regression_test.dart`.
3. That test turns green; commit alongside the fix and update the `[meta]` counts.
4. When all `[confirmed]` + `[debatable]` pass, the burn-down is complete.
