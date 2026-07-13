# Radio QA tests

| File | Layer | Status |
|------|-------|--------|
| `radio_functional_test.dart` | Functional `[fn]` + smoke (single-selection / mutual exclusivity, dot moves, controlled vs uncontrolled, disabled/readOnly, per-option disable, state persistence, orientation, onPress) | pass |
| `radio_a11y_test.dart` | Resolver `[a11y]` + widget semantics (label fallback, radio role + `inMutuallyExclusiveGroup`, disabled/readOnly, hint, aria-hidden, radiogroup container role) | pass |
| `radio_figma_parity_test.dart` | `[figma]` — every Figma API value end-to-end (size, appearance, accent-ignored, checked, readOnly, disabled, label, description, states matrix) | pass |
| `radio_platform_test.dart` | `[platform]` mobile (tap selects, hit area, radio role) vs web/desktop (focus ring, pointer select, no focus when disabled) | pass |
| `radio_golden_test.dart` | Visual regression — light (state × size, state × appearance, readOnly, disabled, label/description) | 20 baselines |
| `radio_golden_dark_test.dart` | Visual regression — dark mode (state × appearance, readOnly) | 9 baselines |
| `radio_golden_surface_test.dart` | Visual regression — `appearance:auto` inside Surface (unchecked-appearance inheritance) | 6 baselines |
| `radio_story_catalog_test.dart` | `[catalog]` Storybook nav-order parity with web `Radio.stories.tsx` | pass |
| `radio_regression_test.dart` | Audit burn-down — real assertions only (no `fail()` stubs); tests go green when the fix lands | **1 debatable open** (touch target) |
| `../../../integration_test/radio_e2e_test.dart` | On-device E2E (single-selection, sizes, appearances, disabled, readOnly, surface, dark, semantics, horizontal) | E2E |

Total goldens: **35** (20 light + 9 dark + 6 surface).

## Deterministic, non-circular measurement

- `radioBoxSizePx` / `radioBoxDecoration` / `radioBorderColor` read the real
  laid-out `AnimatedContainer` (box has a border; the inner dot does not), so the
  size/fill/border assertions never re-parse a token.
- `radioHasInnerDot` proves the real selection indicator (a borderless filled
  `AnimatedContainer`), so single-selection is asserted on what the user sees.
- `radioOpacity` reads the real `Opacity.opacity` (disabled 0.5 Jio / 0.38
  synthetic; readOnly 1.0).
- Real merged `SemanticsData` (`hasCheckedState`, `isChecked`,
  `isInMutuallyExclusiveGroup`, `isEnabled`, `hint`, `identifier`) — never a bare
  `findsOneWidget` for an a11y claim.
- The synthetic DS pins `--Radio-boxSize-*` (s=16 / m=20 / l=24) and
  `--Radio-dotSize-*`; goldens use the real Jio Convex fixture.

> **Behavioural nuance (verified by probe):** a bare `OneUiRadio.size` defaults
> to `'m'` and **wins over** the group `size` (group size is only the fallback
> for an unset option). `RadioField` overrides the option size via
> `enhanceRadioOptions`, so field size propagates. Size tests set `size` on the
> option directly.

## Audit findings (regression burn-down)

Every claim was cross-checked against the web component
(`packages/ui/src/components/Radio/`) and the Figma API ([Radio #36]), and
reproduced against the real Flutter widget with a throwaway probe BEFORE the
assertion was written.

### Confirmed Flutter bugs (RED — fix in Flutter)

- **`RADIO-FN-001`** — standalone `OneUiRadio` `testId` is a **fully dead prop**:
  PROBED `byKey(testId)=0` AND `Semantics.identifier=""`. Unlike `Checkbox`
  (which at least wraps a `KeyedSubtree`), Radio never references `testId` in
  `build()`. Web emits `data-testid`; Appium/XCUITest need
  `Semantics(identifier:)`.
- **`RADIO-A11Y-001`** — `required` is a dead prop: PROBED `hasRequiredState=false`.
  Accepted by the constructor, never wired to `Semantics`.
- **`RADIO-A11Y-002` / `-002b`** — keyboard activation gap: PROBED focus works
  (ring renders) but Space and arrow keys do **not** move selection (no
  `onKeyEvent` on the `Focus` node). Web `<input type=radio>` selects natively.

### Debatable — hardening / parity-leaning (RED — design call)

- **`RADIO-DEB-001`** — `RadioField` `testId` reaches only an in-process
  `KeyedSubtree`, not `Semantics(identifier:)`.
- **`RADIO-DEB-002`** — labelled radio box is 20px tall on mobile (< WCAG 2.5.5
  44px). Web shares the small box.
- **`RADIO-DEB-003`** — `RadioField` `required` paints a visual `*` but is not
  announced to AT.

### Parity proofs (GREEN — Flutter matches the web/Figma contract, NOT bugs)

`RADIO-PAR-001` auto→secondary · `-002` accent ignored · `-003` neutral unchecked
stroke · `-004` readOnly enabled + opacity 1.0 · `-005` disabled dims 0.5 + blocks
· `-006` single-selection mutual exclusivity · `-007` option size wins over group
size · `-008` aria-hidden excludes · `-009` default label "Radio" · `-010` 2-layer
focus halo · `-011` re-tap selected is a no-op (no deselect in a bare group).

## Quick run

```bash
# Offline suites (all GREEN)
flutter test test/components/radio/radio_functional_test.dart \
  test/components/radio/radio_a11y_test.dart \
  test/components/radio/radio_figma_parity_test.dart \
  test/components/radio/radio_platform_test.dart \
  test/components/radio/radio_story_catalog_test.dart

# Regression burn-down (confirmed + debatable RED, parity + meta GREEN)
flutter test test/components/radio/radio_regression_test.dart

# Goldens (35 committed baselines)
flutter test --update-goldens test/components/radio/radio_golden_test.dart \
  test/components/radio/radio_golden_dark_test.dart \
  test/components/radio/radio_golden_surface_test.dart

# On-device E2E
flutter test integration_test/radio_e2e_test.dart -d <device>
```

## Driving the bug count to zero

1. Apply the Flutter fix for the matching `[RADIO-XX-NNN]` in
   `packages/ui_flutter/lib/widgets/one_ui_radio*.dart`.
2. Re-run `radio_regression_test.dart`; update the `[meta]` counts.
3. When all `[confirmed]` + `[debatable]` pass, the burn-down is complete.
