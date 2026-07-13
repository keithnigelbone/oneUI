# Component test folders

Add one folder per OneUI Flutter component. Each folder should contain:

| File | Purpose |
|------|---------|
| `{name}_functional_test.dart` | `[fn]` / `[smoke]` widget tests |
| `{name}_a11y_test.dart` | `[a11y]` pure resolver + semantics tests |
| `{name}_story_catalog_test.dart` | Optional Storybook nav parity |

**Reference implementation:** [`checkbox/`](checkbox/)

## Planned components

| Folder | Widget | Status |
|--------|--------|--------|
| `checkbox/` | `OneUiCheckbox` | ✅ Implemented (RN + web parity) |
| `checkbox_field/` | `OneUiCheckboxField` | Pending |
| `button/` | `OneUiButton` | ✅ Implemented (RN + web parity) |
| `input/` | `OneUiInput` | Pending |
| `input_field/` | `OneUiInputField` | Pending |
| `chip/` | `OneUiChip` | Pending |
| `chip_group/` | `OneUiChipGroup` | Pending |
| `radio/` | `OneUiRadio` | Pending |
| `radio_field/` | `OneUiRadioField` | Pending |
| `badge/` | `OneUiBadge` | Pending |

Add harnesses under `test/support/components/{name}_harness.dart` when needed.
