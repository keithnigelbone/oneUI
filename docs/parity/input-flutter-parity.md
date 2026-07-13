# Input family: Flutter (`@oneui/ui_flutter`) parity guide

Flutter implements the bordered **Input** shell, **InputFeedback**, **InputDynamicText**, and **`OneUiInputField`** (web `InputField.tsx` / RN `InputField.native.tsx` parity). Storybook field stories use both the aggregator and composed showcases in `input_field_showcase.dart`.

**Sources**

| Area | Web | Native | Flutter |
|------|-----|--------|---------|
| Input | `packages/ui/src/components/Input/` | `packages/ui-native/src/components/Input/` | `packages/ui_flutter/lib/widgets/one_ui_input.dart` |
| Feedback | `packages/ui/src/components/Input/internals/InputFeedback.tsx` | `packages/ui-native/src/components/InputFeedback/` | `packages/ui_flutter/lib/widgets/one_ui_input_feedback.dart` |
| Dynamic text | `packages/ui/src/components/Input/internals/InputDynamicText.tsx` | `packages/ui-native/src/components/InputDynamicText/` | `packages/ui_flutter/lib/widgets/one_ui_input_dynamic_text.dart` |
| Parity (web↔RN) | [`input-web-native-parity.md`](./input-web-native-parity.md) | same | this doc |
| Storybook | `Input.stories.tsx` / `InputField.stories.tsx` | `.showcase.native.tsx` | `apps/storybook_flutter` + `input_*_story_catalog.dart` |

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|-------|
| **Input shell** | **Aligned** | 4-slot row, appearance/attention/shape, label stack, types, focus/blur, `onKeyDown`, `onSubmit` + `onSubmitEditing`. |
| **Sizes** | **Aligned** | XS/S/M/L → f6/f8/f10/f12 (native parity). Web still coerces XS→S on web only. |
| **InputFeedback** | **Aligned** | Variants × attention × size; `role` + `child`; `SemanticsRole.alert` for negative; icon box uses resolved `iconSizePx`. |
| **InputDynamicText** | **Aligned** | Content + helper button, sizes, polite `aria-live` on leading copy. |
| **InputField aggregator** | **Shipped** | `OneUiInputField` + `resolveOneUiInputFieldState` in `one_ui_input_field_types.dart`. |
| **`aria-invalid`** | **Wired** | `SemanticsValidationResult.invalid` on the text field (not `value: 'invalid'`). |
| **`aria-describedby`** | **Best-effort** | `composeOneUiAriaDescribedBy` + `resolveOneUiInputFieldDescribedBy`; `controlsNodes` for interim linking; `OneUiWebAriaDescribedByBinder` patches true `aria-describedby` on Flutter web ([flutter#180496](https://github.com/flutter/flutter/issues/180496)). |
| **`required`** | **Wired** | `Semantics(isRequired: true)`. |
| **`accessibilityHint`** | **Wired** | Wins over placeholder in resolver; widget test on semantics tree. |
| **Storybook** | **Aligned** | Input + Internals stories; field compositions (full / slots / search / surface). |
| **CI gate** | **Optional** | `pnpm check:parity:flutter` — file/export/story presence checks. |

---

## 2. Accessibility (`OneUiInput`)

Mirrors RN `getInputAccessibilityProps` in `one_ui_input_a11y.dart`:

| Prop | Flutter semantics |
|------|-------------------|
| `accessibilityLabel` / `aria-label` | `Semantics.label` (wins over visible label) |
| `accessibilityHint` | `Semantics.hint` (wins over placeholder) |
| `required` | `Semantics.isRequired` |
| `aria-invalid` / `errorHighlight` | `SemanticsValidationResult.invalid` |
| `aria-describedby` | `oneUiParseAriaDescribedByNodeIds` → `Semantics.controlsNodes` (interim ID linking) |
| `aria-hidden` | `excludeSemantics: true` |
| `readOnly` / `disabled` | `enabled: false`; read-only also sets `readOnly: true` |
| Password `type` | `obscured: true` |

Widget tests: `packages/ui_flutter/test/one_ui_input_test.dart` (semantics group).

---

## 3. InputField (`OneUiInputField`)

| Topic | Flutter | Web / RN |
|-------|---------|----------|
| Stack order | label → input → feedback → dynamic | Same (Figma `.DNA/InputField`) |
| Error row | `error` → `OneUiInputFeedback` (negative / low) | Same shorthand |
| `id` + described-by | Auto targets: `{id}-description`, `{id}-feedback`, `{id}-dynamic` | Web `Field.Root` links validation; RN forwards `aria-describedby` on inner `Input` |
| Invalid state | `errorHighlight` + `ariaInvalid` on inner `OneUiInput` | `invalid` / `aria-invalid` |
| Root semantics | Decorative (`ExcludeSemantics` when `aria-hidden`) | RN `accessible: false` on root `View` |

Pass **`id`** on `OneUiInputField` when you need error/description/helper rows linked to the text field for assistive tech.

Tests: `packages/ui_flutter/test/one_ui_input_field_test.dart`, `one_ui_aria_described_by_test.dart`.

---

## 4. InputFeedback

| Topic | Implementation |
|-------|----------------|
| Icon size | `resolveInputFeedbackLayout` → `iconSizePx` via `resolveOneUiIconSizePx` + `FEEDBACK_TO_ICON_SIZE` (`3`/`4`/`5`) |
| `role` prop | `OneUiInputFeedbackRole` override; default negative → `alert`, others → `status` |
| Alert semantics | `SemanticsRole.alert` (Flutter disallows `liveRegion` on the same node) |
| `child` | Custom message widget when `feedbackMessage` absent; `Text` child copy extracted in resolver |
| Surface context | Story: `inputFeedbackSurfaceContextSection` |

Tests: `packages/ui_flutter/test/one_ui_input_feedback_test.dart`.

---

## 5. Storybook (Flutter)

| Web story | Flutter catalog |
|-----------|-----------------|
| `InputFieldFullComposition` | `InputFoundationStory.fullComposition` |
| `InputFieldSlotsComposition` | `InputFoundationStory.slotsComposition` |
| `InputFieldSearch` | `InputFoundationStory.search` |
| `InputFieldSurfaceContext` | `InputFoundationStory.fieldSurfaceContext` |
| `InputFeedbackShowcase` | `InputFeedbackFoundationStory.variantsAndAttention` |
| `InputDynamicTextShowcase` | `InputDynamicTextFoundationStory.showcase` |
| Feedback/Dynamic surface rows | `InputFeedbackFoundationStory.surfaceContext`, `InputDynamicTextFoundationStory.surfaceContext` |

Run: `cd apps/storybook_flutter && flutter run` (with Convex URL configured).

---

## 6. Quality gate

```bash
pnpm check:parity:flutter
cd packages/ui_flutter && flutter test test/one_ui_input_test.dart test/one_ui_input_feedback_test.dart test/one_ui_input_dynamic_text_test.dart test/one_ui_input_field_test.dart test/one_ui_aria_described_by_test.dart
```

---

## 7. Known gaps

1. **Engine `Semantics.describedBy`** — when Flutter ships it, remove the web DOM binder and keep `composeOneUiAriaDescribedBy` as the single composer.
2. **Web XS size** — web coerces `xs`→`s`; Flutter follows native f6 tier.
3. **Tooltip on info icon** — web `InputField` default; Flutter stories omit tooltip (use custom `infoIconSlot`).
4. **Chromatic / `pnpm check:parity`** — web↔RN only; Flutter slice is separate (`check:parity:flutter`).

---

## 8. Related docs

- [`input-web-native-parity.md`](./input-web-native-parity.md)
- [`inputfeedback-web-native-parity.md`](./inputfeedback-web-native-parity.md)
- [`inputdynamictext-web-native-parity.md`](./inputdynamictext-web-native-parity.md)
- [`inputfield-web-native-parity.md`](./inputfield-web-native-parity.md)
- [`docs/surface-context-awareness.md`](../surface-context-awareness.md)
