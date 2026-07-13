# RadioField QA tests

| File | Layer | Status |
|------|-------|--------|
| `radio_field_functional_test.dart` | Functional `[fn]` + smoke (integrated single / plain / multi modes, deselect-on-reselect, single-selection, disabled/readOnly, description/required/infoIcon/feedback/dynamicText slots, orientation, testId) | pass |
| `radio_field_a11y_test.dart` | Resolver `[a11y]` + widget semantics (field label resolver, semantics-id auto-link, radiogroup role, option roles, description identifier, feedback live region, aria-hidden subtree collapse) | pass |
| `radio_field_figma_parity_test.dart` | `[figma]` — every Figma API value end-to-end (size→option box, appearance, checked, readOnly, disabled, label, description, required, infoIcon, feedback, states matrix, group role) | pass |
| `radio_field_platform_test.dart` | `[platform]` mobile (tap selects + role) vs web/desktop (focused option focus ring, pointer select) | pass |
| `radio_field_golden_test.dart` | Visual regression — light (size × checked, content slots, readOnly/disabled, integrated single) | 14 baselines |
| `radio_field_golden_dark_test.dart` | Visual regression — dark mode (checked, readOnly, feedback) | 4 baselines |
| `radio_field_golden_surface_test.dart` | Visual regression — `appearance:auto` inside Surface | 6 baselines |
| `radio_field_story_catalog_test.dart` | `[catalog]` Storybook nav-order parity with web `RadioField.stories.tsx` | pass |
| `radio_field_regression_test.dart` | Audit burn-down — real assertions only (no `fail()` stubs) | **all green** |
| `../../../integration_test/radio_field_e2e_test.dart` | On-device E2E (integrated toggle, multi select, content slots, disabled, readOnly, group role, horizontal, dark) | E2E |

Total goldens: **24** (14 light + 4 dark + 6 surface).

## Composition modes (verified by probe)

- **Integrated single** (no children + `label`): a lone control beside the field
  label, `deselectOnReselect=true` — tap selects (`onCheckedChange(true)` /
  `onValueChange(singleOptionValue='on')`); re-tap deselects.
- **Plain** (one child): the option owns its label; field adds description /
  feedback.
- **Multi** (two+ children): fieldset-legend header + `RadioGroup`; single
  selection across options.

The field propagates `size` / `appearance` / `disabled` / `readOnly` / `invalid`
onto each option (`enhanceRadioOptions`), so the option box renders at the field
size (unlike a bare `RadioGroup`, where the option size wins).

## High-confidence testing (no false confidence)

Every assertion validates ACTUAL behaviour, reproduced with a throwaway probe
before the assertion was written:

- `radioHasInnerDot` proves which option is selected; `radioFieldOpacity` reads
  the real disabled dim (0.5).
- Real merged `SemanticsData` (radiogroup role, option `isInMutuallyExclusiveGroup`,
  description/feedback identifiers, live region) — never a bare `findsOneWidget`.
- `find.bySemanticsLabel` is used for the aria-hidden assertion because
  `ExcludeSemantics` keeps the `Semantics` *widget* but drops it from the
  *semantics tree* — a widget finder would give false confidence.
- Goldens render with the real Jio Convex fixture (production token resolution).

## Audit findings (regression burn-down)

### Confirmed Flutter bugs (RED — fix in Flutter)

- **`RF-A11Y-001`** — `required` field renders a visible `*` but is **not
  announced to AT** (no required flag on the field/group semantics).

### Debatable — hardening / parity-leaning (RED — design call)

- **`RF-FN-001`** — `testId` reaches only an in-process `KeyedSubtree`, not
  `Semantics(identifier:)` (native locators can't find the field).
- **`RF-A11Y-002`** — keyboard Space does not select the focused option (inherited
  from `OneUiRadio`'s missing `onKeyEvent`).

### Parity proofs (GREEN — Flutter matches the web/Figma contract, NOT bugs)

`RF-PAR-001` integrated deselect-on-reselect · `-002` multi single-selection ·
`-003` field size propagates to option box · `-004` disabled dims 0.5 + propagates
· `-005` readOnly enabled + opacity 1.0 · `-006` appearance auto→secondary ·
`-007` infoIcon requires a label · `-008` feedback announces via a live region ·
`-009` aria-hidden collapses subtree · `-010` description auto-linked via identifier.

## Quick run

```bash
# Offline suites (all GREEN)
flutter test test/components/radio_field/radio_field_functional_test.dart \
  test/components/radio_field/radio_field_a11y_test.dart \
  test/components/radio_field/radio_field_figma_parity_test.dart \
  test/components/radio_field/radio_field_platform_test.dart \
  test/components/radio_field/radio_field_story_catalog_test.dart

# Regression burn-down (confirmed + debatable RED, parity + meta GREEN)
flutter test test/components/radio_field/radio_field_regression_test.dart

# Goldens (24 committed baselines)
flutter test --update-goldens test/components/radio_field/radio_field_golden_test.dart \
  test/components/radio_field/radio_field_golden_dark_test.dart \
  test/components/radio_field/radio_field_golden_surface_test.dart

# On-device E2E
flutter test integration_test/radio_field_e2e_test.dart -d <device>
```
