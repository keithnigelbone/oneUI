# CheckboxField QA tests

Mirrors RN `apps/qa-playground/native/tests/CheckboxField/CheckboxField.test.tsx`,
web `packages/ui/src/components/CheckboxField/CheckboxField.test.tsx`, and
`packages/ui_flutter/test/one_ui_checkbox_field_a11y_functional_test.dart`.
Built on the gold-standard pattern (Avatar / BottomNavigation / Checkbox).

| File | Layer | Status |
|------|-------|--------|
| `checkbox_field_functional_test.dart` | Functional `[fn]` + smoke (single mode toggle, controlled/uncontrolled, indeterminate, readOnly, error/feedback, dynamic-text row, multi-option group) | pass |
| `checkbox_field_a11y_test.dart` | Resolver `[a11y]` (semantics ids, field accessibility, state resolver, group describedBy, enhance options) + widget semantics | pass |
| `checkbox_field_figma_parity_test.dart` | `[figma]` — every Figma API value end-to-end (size, appearance, checked, indeterminate, readOnly, label, **required**, **infoIcon**, description, **feedback**, disabled + states-sheet matrix with description per cell + all-affordances-together) | 171 pass |
| `checkbox_field_platform_test.dart` | `[platform]` mobile (tap toggles, hit size, checkbox role, error alert region) vs web/desktop (focus ring structure, pointer toggle, no ring when disabled/at rest, error alert) | 18 pass |
| `checkbox_field_golden_test.dart` | Visual regression — light (state × size, state × appearance, readOnly, disabled, label+description, required asterisk, info icon, feedback error, full single field, multi-option) | 33 baselines |
| `checkbox_field_golden_dark_test.dart` | Visual regression — dark mode (state × appearance, label+description, feedback error, required, readOnly) | 17 baselines |
| `checkbox_field_golden_surface_test.dart` | Visual regression — `appearance:auto` field shell inside Surface (unchecked-appearance inheritance + on-surface copy contrast) | 6 baselines |
| `checkbox_field_regression_test.dart` | **Audit burn-down — 4 confirmed + 2 debatable RED, 6 parity + meta GREEN** | **14 RED / 19 GREEN by design** |
| `../../../integration_test/checkbox_field_e2e_test.dart` | On-device E2E (single field, sizes, toggle, required/info/feedback, multi-select, dark, surface, semantics) | E2E |

Harness: `test/support/components/checkbox_field_harness.dart` — extended with
`pumpCheckboxFieldJioHarnessSettled` (Jio fixture + `darkMode` + `surfaceMode` /
`surfaceAppearance`, reusing the Checkbox golden pipeline so there is no second
design-system to drift) and field-specific finders (`checkboxFieldRootFinder`,
label / description / required-asterisk / info-icon / feedback finders + bool
helpers). The existing resolver / functional / multi-container finder API is
unchanged.

Full audit: [`../../../../docs/checkbox-field-audit-report.md`](../../../../docs/checkbox-field-audit-report.md).
Dev tickets: [`../../../../docs/checkbox-field-flutter-bugs.md`](../../../../docs/checkbox-field-flutter-bugs.md).

Total goldens: **56** (33 light + 17 dark + 6 surface).

## Why we don't skip regression tests

The 14 failures in `checkbox_field_regression_test.dart` are the **real component
gaps** from the audit — 4 confirmed Flutter bugs (×platform multiplier) plus 2
debatable hardening items. They fail deterministically because the component
ships with those gaps. The `[parity]` + `[meta]` groups are GREEN proofs that the
Flutter field matches the web contract.

CheckboxField composes the inner `OneUiCheckbox`, so the keyboard / `testId` /
`required` gaps are inherited from / shared with the Checkbox control — but they
are reproduced **here through the CheckboxField public API**, because that is the
surface a consumer of CheckboxField actually uses.

## High-confidence testing (no false confidence)

This suite validates ACTUAL behaviour — every RED test was reproduced against the
real widget with a throwaway probe BEFORE the assertion was written:

- `checkboxBoxSizePx` measures the real rendered control box (s=16 / m=20 / l=24).
- `checkboxBoxDecoration` reads the real `BoxDecoration` (fill + border + shadows)
  to prove appearance / auto / checked paint differences.
- `checkboxFieldHasRequiredAsterisk` / `checkboxFieldHasInfoIcon` /
  `checkboxFieldHasFeedback` inspect real rendered `Text` rich spans,
  `OneUiIconButton`, and `OneUiInputFeedback` — not props.
- `Opacity` widget inspected directly: disabled = 0.5, readOnly = 1.0.
- Real `SemanticsData` flags (`hasCheckedState`, `isChecked`,
  `isCheckStateMixed`, `isEnabled`, `hasRequiredState`, `validationResult`,
  `identifier`) and the InputFeedback `alert` role.
- Keyboard: real `sendKeyEvent(tab → space/enter)` with a desktop platform
  override — proving the keyboard-activation gap rather than guessing.
- Goldens render with the real Jio Convex fixture (production token resolution),
  pinned to the whole field shell so label / description / feedback are captured.

## Probed facts (real widget, Jio fixture)

| Aspect | Probe result | Attribution |
|--------|--------------|-------------|
| Control box | s=16 m=20 l=24 px | correct |
| Disabled / readOnly opacity | 0.5 / 1.0 | correct |
| `appearance:auto` fill | == `secondary` fill | PARITY CBF-PAR-001 |
| `invalid` / `error` | `validationResult=invalid` on control | PARITY CBF-PAR-002 |
| `required` asterisk | renders ` *` with a label; dropped without | PARITY CBF-PAR-003 |
| `error` feedback | InputFeedback + visible text + `alert` role | PARITY CBF-PAR-004 |
| `infoIcon` | one IconButton with a label; dropped without | PARITY CBF-PAR-006 |
| Space / Enter (focused) | `checked` stays false | CONFIRMED CBF-A11Y-001/001b |
| `testId` | `identifier == ''` | CONFIRMED CBF-FN-001 |
| `required:true` | `hasRequiredState=false` | CONFIRMED CBF-A11Y-002 |
| Touch layout height (mobile, m) | ≥ 44px (box stays 20px) | DEBATABLE CBF-DEB-001 (GREEN) |
| `appearance:'destructive'` | no FlutterError, silent fallback | DEBATABLE CBF-DEB-002 |

## Quick run

```bash
# Functional + a11y + figma + platform (all GREEN)
flutter test test/components/checkbox_field/checkbox_field_functional_test.dart \
  test/components/checkbox_field/checkbox_field_a11y_test.dart \
  test/components/checkbox_field/checkbox_field_figma_parity_test.dart \
  test/components/checkbox_field/checkbox_field_platform_test.dart

# Regression burn-down (confirmed + debatable RED, parity + meta GREEN)
flutter test test/components/checkbox_field/checkbox_field_regression_test.dart

# Goldens
flutter test --update-goldens \
  test/components/checkbox_field/checkbox_field_golden_test.dart \
  test/components/checkbox_field/checkbox_field_golden_dark_test.dart \
  test/components/checkbox_field/checkbox_field_golden_surface_test.dart

# On-device E2E
flutter test integration_test/checkbox_field_e2e_test.dart -d <device>
```

## Driving the bug count to zero

1. Apply the dev fix to `packages/ui_flutter/lib/widgets/one_ui_checkbox_field*.dart`
   (or the composed `one_ui_checkbox*.dart`) for the matching `[CBF-XX-NNN]`.
2. Re-run `checkbox_field_regression_test.dart`.
3. That test turns green; commit alongside the fix and update the `[meta]` counts.
4. When all `[confirmed]` + `[debatable]` pass, the burn-down is complete.
