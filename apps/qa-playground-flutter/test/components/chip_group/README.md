# ChipGroup QA tests

| File | Layer | Status |
|------|-------|--------|
| `chip_group_functional_test.dart` | Functional `[fn]` + smoke (layout wrap/inline/vertical, single/multi select, maxSelections, required, disabled, size propagation) | pass |
| `chip_group_a11y_test.dart` | `[a11y]` selection-engine units (`computeNextChipGroupValues`), layout resolver, container semantics, hint | pass |
| `chip_group_figma_parity_test.dart` | `[figma]` — size S/M/L (propagation), wrap/containerType, orientation, size×wrap matrix | pass |
| `chip_group_platform_test.dart` | `[platform]` mobile (tap select, disabled) vs web/desktop (**arrow roving focus**, Space activation) | pass |
| `chip_group_golden_test.dart` | Visual regression — light (wrap × size, inline × size, multi-select) | 7 baselines |
| `chip_group_golden_dark_test.dart` | Visual regression — dark (wrap × size) | 3 baselines |
| `chip_group_golden_surface_test.dart` | Visual regression — group on bold/subtle Surfaces | 4 baselines |
| `chip_group_story_catalog_test.dart` | `[catalog]` Storybook nav-order parity with web `ChipGroup.stories.tsx` | pass |
| `chip_group_regression_test.dart` | **Audit burn-down** — confirmed + debatable bugs (RED until fixed) + parity proofs (GREEN) | mixed |
| `../../../integration_test/chip_group_e2e_test.dart` | On-device E2E (single/multi select, layouts, size, disabled, surface, semantics) | E2E |

Full audit: [`../../../../docs/chip-group-audit-report.md`](../../../../docs/chip-group-audit-report.md).
Dev tickets: [`../../../../docs/chip-group-flutter-bugs.md`](../../../../docs/chip-group-flutter-bugs.md).

Total goldens: **14** (7 light + 3 dark + 4 surface).

## Regression burn-down (open bugs fail until fixed)

| ID | Bug | Platforms |
|----|-----|-----------|
| CHG-FN-001 | group `testId` → `Semantics.identifier` + `ValueKey` | ×3 |
| CHG-DEB-001 | invalid group `appearance` asserts in debug | ×3 |

Tracker item **focus applied incorrectly** — not automated here (see chip README).

## High-confidence testing (no false confidence)

- `chipHeightPx` measures the real child chrome to prove size propagation
  (s=24 / m=28 / l=32).
- Layout asserted via real widgets (`Wrap` / `SingleChildScrollView` / `Column`).
- `computeNextChipGroupValues` exercised directly for single / multi / required /
  maxSelections.
- Roving focus proved with real `sendKeyEvent(arrowRight)` + `primaryFocus`.
- Goldens render with the real Jio Convex fixture.

## Offline vs network

Functional / a11y / figma / platform / regression / story-catalog run on the
**synthetic measurement harness** — offline. Only the goldens need the Jio
fixture; generate baselines with `--update-goldens` where the network is
reachable.

## Quick run

```bash
# Offline suites
flutter test test/components/chip_group/chip_group_functional_test.dart \
  test/components/chip_group/chip_group_a11y_test.dart \
  test/components/chip_group/chip_group_figma_parity_test.dart \
  test/components/chip_group/chip_group_platform_test.dart \
  test/components/chip_group/chip_group_story_catalog_test.dart

# Regression burn-down
flutter test test/components/chip_group/chip_group_regression_test.dart

# Goldens (needs network)
flutter test --update-goldens \
  test/components/chip_group/chip_group_golden_test.dart \
  test/components/chip_group/chip_group_golden_dark_test.dart \
  test/components/chip_group/chip_group_golden_surface_test.dart

# On-device E2E
flutter test integration_test/chip_group_e2e_test.dart -d <device>
```
