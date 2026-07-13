# Checkbox — QA test plan

**Component:** `OneUiCheckbox` / `OneUiCheckboxGroup`  
**Source:** `packages/ui_flutter/lib/widgets/one_ui_checkbox.dart`  
**Parity:** web `Checkbox.test.tsx`, RN `CheckboxA11y.test.ts`, web QA `checkbox-qa.spec.ts`

## Test files

| File | Layer |
|------|-------|
| `checkbox_functional_test.dart` | Functional `[fn]` |
| `checkbox_a11y_test.dart` | Resolver `[a11y]` + semantics |
| `checkbox_story_catalog_test.dart` | Storybook catalog |

## Figma API (reference)

| Property | Values |
|----------|--------|
| size | S / M / L |
| appearance | auto, primary, secondary, … |
| selected | true / false |
| indeterminate | true / false |
| readOnly | true / false |
| disabled | true / false |

## P0 accessibility checks

- [ ] Accessible name (label / ariaLabel / description fallback)
- [ ] `checked` / `mixed` semantics
- [ ] Disabled not tappable + `isEnabled: false`
- [ ] ReadOnly distinguishable from disabled
- [ ] `aria-hidden` removes from semantics tree
- [ ] `accessibilityHint` forwarded

## Run

```bash
cd apps/qa-playground-flutter
flutter test test/components/checkbox/
```
