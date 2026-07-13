# RadioField — Flutter ↔ Web ↔ React Native parity

## Component

| Platform | Entry |
| -------- | ----- |
| Web | `packages/ui/src/components/RadioField/RadioField.tsx` |
| React Native | `packages/ui-native/src/components/RadioField/RadioField.native.tsx` |
| Flutter (web + mobile) | `packages/ui_flutter/lib/widgets/one_ui_radio_field.dart` |

## Render modes

| Mode | Condition | Flutter behavior |
| ---- | --------- | ---------------- |
| Integrated single | No children + non-empty `label` | Row: lone `OneUiRadio` + label/description/feedback/dynamic; `deselectOnReselect` |
| Plain | Exactly one `OneUiRadio` | Optional description header; group with `deselectOnReselect` |
| Multi | Two+ options (flattened) | Fieldset-style header + `SemanticsRole.radioGroup` + group + footer |

Child flattening mirrors web `flattenFieldChildren` (Fragment / `Column` of radios).

## Props (RN `RadioFieldProps` + web `RadioFieldProps`)

| Prop | Flutter |
| ---- | ------- |
| `children`, `value`, `defaultValue`, `onValueChange` | Yes |
| `checked`, `defaultChecked`, `onCheckedChange`, `singleOptionValue` | Yes (integrated) |
| `label`, `description`, `infoIconSlot`, `required`, `fullWidth`, `width` | Yes |
| `disabled`, `readOnly`, `size`, `appearance`, `orientation` | Yes |
| `invalid`, `error`, `feedback`, `dynamicTextSlot`, `dynamicText`, `helperButton`, `onHelperPressed` | Yes |
| `aria-label`, `accessibilityHint`, `aria-describedby`, `aria-hidden` | Yes |
| `id`, `testId` | Yes (`semanticsIdentifier` composition via `id`) |
| Web-only `validate`, `validationMode`, `name` | Not ported (host form / RN parity doc) |

## Tokens

- Field stack gap: `--RadioField-gap` → `--InputField-gap` → `--Spacing-1-5`
- Integrated column gap: `--RadioField-singleColumnGap` → `--Spacing-1`
- Integrated row gap: `--RadioField-singleRowGap` → `--Spacing-1`
- Label stack: `--InputLabel-stackGap` → `--Spacing-1`
- Header colours: resolved `appearance` role (`--{Role}-High`, `--{Role}-Medium-Text`)
- Label typography: `Body` S/M/L + medium weight (Figma InputLabel stack)
- Disabled shell: `--Disabled-Opacity`
- Inner radios: full `OneUiRadio` token pipeline (brand CSS / Convex snapshot)

## Brand switching

- `bindRadioFieldBrandScope(context)` in `build` — subscribes to `OneUiScope` + `OneUiBrandLoadState`
- Storybook foundations wrap previews in `KeyedSubtree(radioFieldBrandScopeKey)`
- Default story page keys preview with `radioFieldBrandScopeKey`
- Tests: `test/one_ui_radio_field_brand_switch_test.dart` (geometry + appearance label colour)

## Storybook

Flutter nav matches `RadioField.stories.tsx` exactly (see `test/radio_field_story_catalog_test.dart`).

## Accessibility

| Concern | Flutter |
| ------- | ------- |
| Integrated label | `Semantics` header id + `ariaLabelledBy` on lone radio |
| Multi-option group name | Outer `SemanticsRole.radioGroup` with field `label` |
| Plain group name | `aria-label` / `accessibilityLabel` on `OneUiRadioGroup` |
| Description / feedback / dynamic | Composed `aria-describedby` ids |
| `aria-hidden` | `ExcludeSemantics` on entire field |
| `accessibilityHint` | Forwarded to group / integrated radio |
| Error | `OneUiInputFeedback` with semantics id + negative variant |
| Required | Asterisk with `--Negative-*` token |

## Group enhancements

`OneUiRadioGroup`: `deselectOnReselect`, `errorHighlight`, `accessibilityHint`.

## Tests

- `test/one_ui_radio_field_test.dart` — state, flatten, a11y, widget modes
- `test/one_ui_radio_field_brand_switch_test.dart` — brand token + theme role repaint
- `test/radio_field_story_catalog_test.dart` — Storybook nav lockstep with web
