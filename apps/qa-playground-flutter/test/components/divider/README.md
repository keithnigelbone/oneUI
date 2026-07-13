# Divider QA tests

| File | Layer | Status |
|------|-------|--------|
| `divider_functional_test.dart` | Functional `[fn]` + smoke (size→stroke, roundCaps, content slot, contentAlign, colour/attention) | pass |
| `divider_a11y_test.dart` | Resolver `[a11y]` + widget semantics (hint fallback chain, separator landmark, decorative-line exclusion, testId/testID→identifier) | pass |
| `divider_figma_parity_test.dart` | `[figma]` — every Figma API value (orientation, size, slot, contentAlign, 8 appearances, attention, roundCaps, orientation×size matrix) measured offline | pass |
| `divider_platform_test.dart` | `[platform]` mobile (separator landmark + hint, layout, hidden lines) vs web/desktop (landmark, **not focusable/interactive**, vertical layout) | pass |
| `divider_golden_test.dart` | Visual regression — light (size×attention, roundCaps, label×align, icon, appearance, vertical) | 23 baselines |
| `divider_golden_dark_test.dart` | Visual regression — dark mode (appearance, label) | 5 baselines |
| `divider_golden_surface_test.dart` | Visual regression — divider on bold/subtle Surfaces (neutral→primary remap) | 4 baselines |
| `divider_story_catalog_test.dart` | `[catalog]` Storybook nav-order parity with web `Divider.stories.tsx` | pass |
| `divider_regression_test.dart` | **Audit burn-down — 0 confirmed + 0 debatable RED, 10 parity + meta GREEN** | **all GREEN** |
| `../../../integration_test/divider_e2e_test.dart` | On-device E2E (sizes, roundCaps, content, appearances, vertical, surface, dark, semantics) | E2E |

Total goldens: **32** (23 light + 5 dark + 4 surface).

## Audit findings (regression burn-down)

Every claim was cross-checked against the web component
(`packages/ui/src/components/Divider/`) and reproduced against the real Flutter
widget with a throwaway probe BEFORE the assertion was written.

### Confirmed Flutter bugs (RED — fix in Flutter)

**None.** Divider is well-built: `testId` correctly reaches the AT tree, `auto`
resolves to `neutral`, stroke px (0.5/1/1.5), attention colour tiers, content
alignment, and decorative-line semantics exclusion all match the web contract.

### Debatable — hardening (resolved)

- **`DIV-DEB-001` (GREEN)** — invalid `appearance` now asserts in debug and
  falls back to `neutral` via `resolveOneUiDividerAppearance()` in
  `one_ui_divider_types.dart`. Probed: `appearance:'destructive'` →
  `FlutterError` in debug; release falls back to `neutral`.

### Reclassified — NOT a Flutter bug (source of truth = Figma, not web)

- **`DIV-DEB-002` → `DIV-PAR-009` (GREEN).** The Figma API table marks
  **`roundCaps: true` as the default** (the highlighted chip — consistent with
  every other row: orientation→horizontal, size→m, slot→none, align→center,
  attention→low). Flutter's default `kOneUiDividerRoundCapsDefault = true`
  (`one_ui_divider_types.dart:63`) **honours Figma — correct.** The divergence is
  on the **web** side, where `useDividerState` defaults `roundCaps = false`
  (`Divider.shared.ts:112`). **Action:** file a WEB ticket to change the web
  default to `true`; no change needed in Flutter. Validated GREEN by `DIV-PAR-009`.

### Parity proofs (GREEN — Flutter matches the Figma/web contract, NOT bugs)

`DIV-PAR-001` testId→`Semantics.identifier` (✔ — unlike Chip/CPI, Divider gets
this right) · `DIV-PAR-002` auto→neutral · `DIV-PAR-003` stroke s<m<l · `DIV-PAR-004`
contentAlign center→2 lines, start/end→1 · `DIV-PAR-005` decorative lines excluded
from semantics · `DIV-PAR-006` content normalise (text→label, unknown→none) ·
`DIV-PAR-007` attention colour tiers distinct · `DIV-PAR-008` semanticsHint surfaces ·
`DIV-PAR-009` default roundCaps matches the Figma default (true).

### Known framework limitation (NOT asserted RED)

Web emits `role="separator"` + `aria-orientation`. **Flutter 3.44's
`SemanticsRole` enum has no `divider`/`separator` member** (verified against the
engine enum at `bin/cache/pkg/sky_engine/lib/ui/semantics.dart`), so the
component uses a container landmark + `explicitChildNodes` — the closest
cross-platform mapping. This is documented rather than tested RED: a test
demanding an impossible role could never go green (that would be false
confidence). Re-evaluate when the engine adds the role.

## High-confidence testing (no false confidence)

Every assertion validates ACTUAL behaviour; each finding was reproduced against
the real widget with a throwaway probe BEFORE the assertion was written:

- `dividerStrokePx` measures the real rendered line (`getSize`): horizontal →
  height, vertical → width (S=0.5 / M=1 / L=1.5px from `--Stroke-*`).
- `dividerLineIsRounded` / `dividerLineColor` read the real `BoxDecoration`
  (borderRadius + colour) — proving round caps and attention colour tiers.
- `dividerHiddenLineSegmentCount` counts the real `ExcludeSemantics` segments,
  proving contentAlign geometry (center=2, start/end=1) and a11y exclusion.
- Real `SemanticsData` (hint, identifier, role/flag absence for non-interactive).
- Goldens render with the real Jio Convex fixture (production token resolution).

## Offline vs network

Functional / a11y / figma / platform / regression / story-catalog run on the
**synthetic measurement harness** — fully offline, no Convex network. Only the
golden suites need the Jio fixture (network); generate baselines with
`--update-goldens` where the network is reachable.

## Quick run

```bash
# Offline suites (all GREEN)
flutter test test/components/divider/divider_functional_test.dart \
  test/components/divider/divider_a11y_test.dart \
  test/components/divider/divider_figma_parity_test.dart \
  test/components/divider/divider_platform_test.dart \
  test/components/divider/divider_story_catalog_test.dart

# Regression burn-down (all GREEN)
flutter test test/components/divider/divider_regression_test.dart

# Goldens (needs network)
flutter test --update-goldens \
  test/components/divider/divider_golden_test.dart \
  test/components/divider/divider_golden_dark_test.dart \
  test/components/divider/divider_golden_surface_test.dart

# On-device E2E
flutter test integration_test/divider_e2e_test.dart -d <device>
```

## Driving the bug count to zero

1. Apply the dev fix to `packages/ui_flutter/lib/widgets/one_ui_divider*.dart`
   (or `divider_color_resolve.dart`) for the matching `[DIV-XX-NNN]`.
2. Re-run `divider_regression_test.dart`.
3. That test turns green; commit alongside the fix and update the `[meta]` counts.
4. When all `[debatable]` items are resolved (or consciously waived), the
   burn-down is complete.
