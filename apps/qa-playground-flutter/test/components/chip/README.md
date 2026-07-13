# Chip QA tests

| File | Layer | Status |
|------|-------|--------|
| `chip_functional_test.dart` | Functional `[fn]` + smoke (selection, controlled/uncontrolled, onSelectedChange, disabled, slots, sizes, group membership) | pass |
| `chip_a11y_test.dart` | Resolver `[a11y]` + widget semantics (label fallback, button+selected role, hint, disabled, enabled) | pass |
| `chip_figma_parity_test.dart` | `[figma]` — every Figma API value (size, selected, attention→variant, appearance, disabled, slots, size×selected matrix) measured offline | 93 pass |
| `chip_platform_test.dart` | `[platform]` mobile (tap toggles, hit area, disabled) vs web/desktop (focus, **Space/Enter activation**, pointer toggle, disabled not activatable) | 16 pass |
| `chip_golden_test.dart` | Visual regression — light (selected × size, selected × appearance, attention, disabled, end slot) | 23 baselines |
| `chip_golden_dark_test.dart` | Visual regression — dark mode (selected × appearance, disabled) | 10 baselines |
| `chip_golden_surface_test.dart` | Visual regression — chips on bold/subtle Surfaces (context remapping) | 6 baselines |
| `chip_story_catalog_test.dart` | `[catalog]` Storybook nav-order parity with web `Chip.stories.tsx` | pass |
| `chip_regression_test.dart` | **Audit burn-down** — confirmed + debatable bugs (RED until fixed) + parity proofs (GREEN) | mixed |
| `../../../integration_test/chip_e2e_test.dart` | On-device E2E (toggles, group single+multi select, appearances, slots, dark, surface, semantics) | E2E |

Full audit: [`../../../../docs/chip-audit-report.md`](../../../../docs/chip-audit-report.md).
Dev tickets: [`../../../../docs/chip-flutter-bugs.md`](../../../../docs/chip-flutter-bugs.md).

Total goldens: **39** (23 light + 10 dark + 6 surface).

## Regression burn-down (open bugs fail until fixed)

`chip_regression_test.dart` asserts the **correct** contract for each open dev
ticket. Tests are not skipped and not hardcoded to fail — they fail because the
component still ships the gap:

| ID | Bug | Platforms |
|----|-----|-----------|
| CHP-FN-001 | `testId` → `Semantics.identifier` + `ValueKey` | ×3 |
| CHP-DEB-001 | mobile touch target ≥ 44px | ×3 |
| CHP-DEB-002 | invalid `appearance` asserts in debug | ×3 |

Tracker item **focus applied incorrectly** is not covered here — widget tests show
keyboard focus, roving focus, and `:focus-visible` halo already pass; needs a
playground/E2E repro before adding an automated assertion.

Repro one bug: `flutter test test/components/chip/chip_regression_test.dart --name "[CHP-FN-001]"`

## High-confidence testing (no false confidence)

Every assertion validates ACTUAL behaviour; each RED test was reproduced against
the real widget with a throwaway probe BEFORE the assertion was written:

- `chipHeightPx` measures the real rendered chrome (s=24 / m=28 / l=32).
- `chipFill` / `chipDecoration` read the real `BoxDecoration` to prove
  selected vs unselected paint differences.
- `chipOpacity` inspects the real `Opacity` widget: disabled = 0.38, enabled = 1.0.
- Real `SemanticsData` flags (`isButton`, `hasSelectedState`, `isSelected`,
  `isEnabled`, `identifier`, `hint`).
- Keyboard: real `sendKeyEvent(space/enter)` with a desktop platform override —
  proving Chip toggles on Space/Enter (PARITY GREEN), unlike Checkbox.
- `testId`: `Semantics.identifier` + `find.byKey(ValueKey(testId))`.
- `chipFocusHaloCount`: 2-layer focus halo on keyboard-focused chip (web `:focus-visible`).

## Offline vs network

Functional / a11y / figma / platform / regression / story-catalog run on the
**synthetic measurement harness** — fully offline, no Convex network. Only the
golden suites need the Jio fixture (network); generate baselines with
`--update-goldens` where the network is reachable.

## Quick run

```bash
# Offline suites (all GREEN)
flutter test test/components/chip/chip_functional_test.dart \
  test/components/chip/chip_a11y_test.dart \
  test/components/chip/chip_figma_parity_test.dart \
  test/components/chip/chip_platform_test.dart \
  test/components/chip/chip_story_catalog_test.dart

# Regression burn-down (confirmed + debatable RED, parity GREEN)
flutter test test/components/chip/chip_regression_test.dart

# Goldens (needs network)
flutter test --update-goldens \
  test/components/chip/chip_golden_test.dart \
  test/components/chip/chip_golden_dark_test.dart \
  test/components/chip/chip_golden_surface_test.dart

# On-device E2E
flutter test integration_test/chip_e2e_test.dart -d <device>
```

