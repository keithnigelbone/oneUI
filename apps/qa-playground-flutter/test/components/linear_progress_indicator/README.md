# LinearProgressIndicator QA tests

| File | Layer | Status |
|------|-------|--------|
| `linear_progress_indicator_functional_test.dart` | Functional `[fn]` + smoke | offline |
| `linear_progress_indicator_a11y_test.dart` | Resolver + widget `[a11y]` | offline |
| `linear_progress_indicator_figma_parity_test.dart` | `[figma]` Figma API matrix | offline |
| `linear_progress_indicator_platform_test.dart` | `[platform]` mobile vs desktop | offline |
| `linear_progress_indicator_story_catalog_test.dart` | `[catalog]` Storybook nav parity | offline |
| `linear_progress_indicator_regression_test.dart` | Audit burn-down LPI-FN/DEB/PAR | offline |
| `linear_progress_indicator_visual_regression_test.dart` | `[visual]` LPI-VIS-00N | offline |
| `linear_progress_indicator_golden_test.dart` | Light goldens (~22 baselines) | Jio fixture — commit `goldens/` |
| `linear_progress_indicator_golden_dark_test.dart` | Dark mode goldens | Jio fixture — commit `goldens/dark/` |
| `linear_progress_indicator_golden_surface_test.dart` | Surface context goldens | Jio fixture — commit `goldens/surface/` |
| `../../../integration_test/linear_progress_indicator_e2e_test.dart` | On-device `[e2e]` | device |

## Audit IDs

- **LPI-FN-001** (GREEN) — `testId` reaches `Semantics.identifier` (fixed at implementation; CPI lesson applied).
- **LPI-DEB-001** (RED target) — invalid `appearance` asserts in debug.
- **LPI-DEB-002** (RED target) — unlabelled progressbar asserts WCAG 4.1.2 in debug; `semanticsLabelledBy`-only is allowed when a sibling `Semantics(identifier, label)` anchor exists (resolved at runtime for TalkBack/VoiceOver).
- **LPI-PAR-001…003** (GREEN) — value fill, indeterminate ignores value, auto→primary.

## Quick run

```bash
# Offline suites (from apps/qa-playground-flutter)
flutter test test/components/linear_progress_indicator/linear_progress_indicator_functional_test.dart
flutter test test/components/linear_progress_indicator/linear_progress_indicator_a11y_test.dart
flutter test test/components/linear_progress_indicator/linear_progress_indicator_figma_parity_test.dart

# Goldens (requires Jio Convex fixture + network; commit baselines after --update-goldens)
flutter test --update-goldens test/components/linear_progress_indicator/linear_progress_indicator_golden_test.dart
flutter test --update-goldens test/components/linear_progress_indicator/linear_progress_indicator_golden_dark_test.dart
flutter test --update-goldens test/components/linear_progress_indicator/linear_progress_indicator_golden_surface_test.dart

# Full component suite + dashboard report (from repo root)
pnpm qa:flutter:component -- linear-progress-indicator

# Package-level (from packages/ui_flutter)
flutter test test/one_ui_linear_progress_indicator_test.dart
flutter test test/linear_progress_indicator_react_parity_test.dart

# E2E on device
flutter test integration_test/linear_progress_indicator_e2e_test.dart
```

## Harness

- `test/support/components/linear_progress_indicator_harness.dart` — synthetic DS (`qaLpiTestDesignSystem`) + Jio fixture pumps; accessors `lpiFillFraction`, `lpiTrackHeightPx`, `lpiIndicatorColor`, etc.
