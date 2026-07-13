# CircularProgressIndicator QA tests

| File | Layer | Status |
|------|-------|--------|
| `circular_progress_indicator_functional_test.dart` | Functional `[fn]` + smoke (variant, value→sweep, size→diameter, content, colour overrides, show) | pass |
| `circular_progress_indicator_a11y_test.dart` | Resolver `[a11y]` + widget semantics (value string, busy, hint, ariaHidden, live region, labelledBy→identifier, no double-announce) | pass |
| `circular_progress_indicator_figma_parity_test.dart` | `[figma]` — every Figma API value (10 sizes, variant, 9 appearances, content, min/max/value, size×variant matrix) measured offline | pass |
| `circular_progress_indicator_platform_test.dart` | `[platform]` mobile (TalkBack/VoiceOver value, busy, diameter, ticker) vs web/desktop (value, live region, **status role — not focusable**, diameter) | pass |
| `circular_progress_indicator_golden_test.dart` | Visual regression — light (value steps, sizes, appearance, content text/icon) | 17 baselines |
| `circular_progress_indicator_golden_dark_test.dart` | Visual regression — dark mode (appearance, content text) | 5 baselines |
| `circular_progress_indicator_golden_surface_test.dart` | Visual regression — ring on bold/subtle Surfaces (context remapping) | 5 baselines |
| `circular_progress_indicator_story_catalog_test.dart` | `[catalog]` Storybook nav-order parity with web `CircularProgressIndicator.stories.tsx` | pass |
| `circular_progress_indicator_regression_test.dart` | **Audit burn-down — 1 confirmed + 2 debatable RED, 8 parity + meta GREEN** | **9 RED / 19 GREEN by design** |
| `../../../integration_test/circular_progress_indicator_e2e_test.dart` | On-device E2E (determinate arc, sizes, indeterminate spinner, appearances, content, surface, dark, semantics) | E2E |

Total goldens: **27** (17 light + 5 dark + 5 surface).

## Audit findings (regression burn-down)

Every claim was cross-checked against the web component and reproduced against
the real Flutter widget with a throwaway probe BEFORE the assertion was written.

### Confirmed Flutter bug (RED — fix in Flutter)

- **`CPI-FN-001`** — `testId` is **not** exposed via `Semantics.identifier`.
  Probed: `testId:'cpi-root'` → `identifier=""` (a `find.byKey` match exists, so
  flutter_test can locate it, but native AT automation cannot). `build()` assigns
  `identifier:` to the aria-labelledby id and only wraps `testId` in a
  `KeyedSubtree` key (`one_ui_circular_progress_indicator.dart:584,597`) — so the
  AT identifier slot is squatted by `labelledBy` and `testId` never reaches the
  platform AT tree. Web emits `data-testid` on the progressbar root.
  **Fix:** when `testId` is set, thread it into `Semantics(identifier:)`.

### Debatable — hardening / parity-leaning (RED — design call, web has these for free)

- **`CPI-DEB-001`** — invalid `appearance` does not assert in debug. Probed:
  `appearance:'destructive'` → no `FlutterError`; the role silently falls back.
  Web blocks this at compile time (TypeScript union). **Fix:** debug-`assert` the
  appearance against the known role set.
- **`CPI-DEB-002`** — an unlabelled progressbar does not assert (WCAG 4.1.2).
  Probed: no `semanticsLabel`/`labelledBy` → no `FlutterError`. The widget's own
  `build()` (`:512-523`) acknowledges the requirement but only `debugPrint`s
  inside an `assert` that always returns true, so an unnamed progressbar ships
  silently. **Fix:** hard-assert in debug when no accessible name is provided.

### Parity proofs (GREEN — Flutter matches web, NOT bugs)

`CPI-PAR-001` value→"N percent" · `CPI-PAR-002` indeterminate busy ·
`CPI-PAR-003` clamp + min/max · `CPI-PAR-004` determinate-without-value coerces
indeterminate · `CPI-PAR-005` auto→primary · `CPI-PAR-006` ariaHidden collapses ·
`CPI-PAR-007` show=false removes ring · `CPI-PAR-008` indicatorColor override.

## High-confidence testing (no false confidence)

Every assertion validates ACTUAL behaviour; each RED test was reproduced against
the real widget with a throwaway probe BEFORE the assertion was written:

- `cpiDiameterPx` measures the real rendered ring (`getSize`): 2XS=8 … 5XL=64px,
  resolved from the `--Spacing-*` scale (CPI maps size→spacing index).
- `cpiPainter` reads the real `OneUiCircularProgressIndicatorPainter`:
  `isIndeterminate`, `determinateSweepFraction` (= value/(max−min)),
  `indicatorColor`/`trackColor` — proving what is actually painted, not just that
  a widget exists.
- Real `SemanticsData` (`value` "N percent", `hint`, `identifier`, `liveRegion`,
  label exclusion of the centre %-text).
- `testId`: probed `identifier=""` while `find.byKey` matches — a Key-only prop,
  invisible to native AT, captured RED as `CPI-FN-001`.
- Goldens render with the real Jio Convex fixture (production token resolution).

## Offline vs network

Functional / a11y / figma / platform / regression / story-catalog run on the
**synthetic measurement harness** — fully offline, no Convex network. Only the
golden suites need the Jio fixture (network); generate baselines with
`--update-goldens` where the network is reachable.

## Quick run

```bash
# Offline suites (all GREEN)
flutter test test/components/circular_progress_indicator/circular_progress_indicator_functional_test.dart \
  test/components/circular_progress_indicator/circular_progress_indicator_a11y_test.dart \
  test/components/circular_progress_indicator/circular_progress_indicator_figma_parity_test.dart \
  test/components/circular_progress_indicator/circular_progress_indicator_platform_test.dart \
  test/components/circular_progress_indicator/circular_progress_indicator_story_catalog_test.dart

# Regression burn-down (confirmed + debatable RED, parity + meta GREEN)
flutter test test/components/circular_progress_indicator/circular_progress_indicator_regression_test.dart

# Goldens (needs network)
flutter test --update-goldens \
  test/components/circular_progress_indicator/circular_progress_indicator_golden_test.dart \
  test/components/circular_progress_indicator/circular_progress_indicator_golden_dark_test.dart \
  test/components/circular_progress_indicator/circular_progress_indicator_golden_surface_test.dart

# On-device E2E
flutter test integration_test/circular_progress_indicator_e2e_test.dart -d <device>
```

## Driving the bug count to zero

1. Apply the dev fix to `packages/ui_flutter/lib/widgets/one_ui_circular_progress_indicator*.dart`
   for the matching `[CPI-XX-NNN]`.
2. Re-run `circular_progress_indicator_regression_test.dart`.
3. That test turns green; commit alongside the fix and update the `[meta]` counts.
4. When all `[confirmed]` + `[debatable]` pass, the burn-down is complete.
