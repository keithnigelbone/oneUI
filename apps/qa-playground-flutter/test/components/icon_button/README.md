# IconButton — QA test suite

Comprehensive functional, accessibility, Figma-parity, platform, visual-regression, and on-device E2E coverage for `OneUiIconButton`.

## Run

```bash
# All headless widget tests for IconButton
flutter test test/components/icon_button/

# Single tier
flutter test test/components/icon_button/icon_button_figma_parity_test.dart
flutter test test/components/icon_button/icon_button_platform_test.dart

# Visual / golden (requires Jio fixture network)
flutter test test/components/icon_button/icon_button_golden_test.dart
flutter test test/components/icon_button/icon_button_golden_dark_test.dart
flutter test test/components/icon_button/icon_button_golden_surface_test.dart

# Bless baselines after intentional visual changes
flutter test --update-goldens test/components/icon_button/

# E2E on device
flutter test integration_test/icon_button_e2e_test.dart -d emulator-5554

# E2E with visible holds (debugging)
flutter test integration_test/icon_button_e2e_test.dart -d emulator-5554 \
  --dart-define=DEMO_MODE=true

# From monorepo root
pnpm qa:flutter:component -- icon-button
```

## Test tiers

| File | Tag | What it validates |
|------|-----|-------------------|
| `icon_button_functional_test.dart` | `[fn]` `[smoke]` | Callbacks, sizes, condensed, layout, loading, contained |
| `icon_button_a11y_test.dart` | `[a11y]` | Semantics label/hint/busy/expanded, keyboard activation |
| `icon_button_figma_parity_test.dart` | `[figma]` | Every Figma API value (offline synthetic harness) |
| `icon_button_platform_test.dart` | `[platform]` | Mobile tap vs desktop keyboard/hover |
| `icon_button_golden_test.dart` | `[golden]` | Light-mode pixel regression (Jio fixture, 23 baselines) |
| `icon_button_golden_dark_test.dart` | `[golden][dark]` | Dark-mode token remapping (20 baselines) |
| `icon_button_golden_surface_test.dart` | `[golden][surface]` | Surface-context nesting (13 baselines) |
| `icon_button_story_catalog_test.dart` | `[catalog]` | Storybook nav order vs web |
| `icon_button_regression_test.dart` | `[regression]` | Audit burn-down + parity proofs |
| `integration_test/icon_button_e2e_test.dart` | `[e2e]` | Real device rendering + gestures |

## Figma matrix covered

- **Sizes:** 2xs, xs, s, m, l, xl
- **Attention:** high, medium, low
- **Appearances:** auto + 7 Figma roles (+ brand-bg in goldens)
- **Shape:** 1:1 (square), 3:2 (wide)
- **Contained / uncontained**
- **Condensed / fullWidth** (contained only)
- **States:** default, disabled, loading, focus (forceFocusRing)

## Regression burn-down (resolved)

Former debatable findings in `icon_button_regression_test.dart` — now green parity proofs:

- `[IBT-DEB-001]` — `testId` → `Semantics.identifier` (AT / Appium)
- `[IBT-DEB-002]` — 2xs keeps 20px Figma chrome; mobile hit slop expands to ≥44px

## Harness

`test/support/components/icon_button_harness.dart`:

- `pumpIconButtonQaHarness` — synthetic DS (offline functional/a11y/figma)
- `pumpIconButtonJioHarnessSettled` — real Jio fixture (goldens + E2E)
- Real-value accessors: `iconButtonHeightPx`, `iconButtonMinHitTestSize`, `iconButtonFill`, `iconButtonOpacity`, `iconButtonSemanticsData`

## Fixed — golden / figma hang (icon catalog must be preloaded)

`icon_button_figma_parity_test.dart` and the three `icon_button_golden_*` files
used to hang to the 10-minute test timeout (figma at its first test; goldens at
the first capture). Root cause: the SVG **icon catalog was loaded lazily inside
the fake-async `testWidgets` zone** on the first pump, where the asset load never
completes. Fix: preload it in real-async `setUpAll`:

```dart
setUpAll(() async {
  await ensureJioFixtureReady();        // goldens only
  await ensureIconButtonIconsLoaded();  // <-- prevents the lazy in-test hang
});
```

Suites that always passed (functional / a11y / platform / regression) already did
this; figma had no `setUpAll` and the golden files preloaded the Jio fixture but
not the icon catalog. (Display-only siblings `icon`/`icon_contained` preload via
`JioIconCatalog.instance.ensureLoaded()`.) 56 golden baselines committed.
