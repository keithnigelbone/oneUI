# Input family + Text — Flutter QA audit report

> Full audit of `OneUiText`, `OneUiInput`, `OneUiInputField`, `OneUiInputDynamicText`, `OneUiInputFeedback`  
> Cross-verified against web (`packages/ui/src/components/`), Figma API matrices (`*_types.dart`), and qa-playground-flutter test suites.  
> Platforms: Android / iOS / Web (linux/macOS proxy in widget tests via `debugDefaultTargetPlatformOverride`; `testWidgetsAllPlatforms` ×3).

## Executive summary

| Category | Confirmed | Debatable | Cleared (parity GREEN) |
|----------|-----------|-----------|------------------------|
| Functional | 3 | 0 | 20+ |
| Accessibility | 2 | 7 | 15+ |
| Visual/UI | 1 | 2 | 100+ golden cases |

**Test coverage:** 9 tiers per component (functional, a11y, figma, platform, golden×3, regression, e2e).  
**Intentional RED tests:** regression `[confirmed]` + `[debatable]` groups — failures are tickets until production widgets are fixed.

---

## Confirmed bugs (fix in `packages/ui_flutter`)

See detailed reports below. Regression tests marked `[confirmed]` will flip GREEN when fixed.

| ID | Component | Type | Test |
|----|-----------|------|------|
| INP-A11Y-001 | Input | A11y | `input_regression_test.dart` |
| INP-FN-001 | Input | Functional | `input_regression_test.dart` |
| INP-FN-002 | Input | Functional | `input_regression_test.dart` |
| INP-VIS-001 | Input | Visual | `input_regression_test.dart` |
| IFD-FN-001 | InputField | Functional | `input_field_regression_test.dart` |
| TXT-FN-001 | Text | Functional | `text_regression_test.dart` |
| TXT-A11Y-001 | Text | A11y | `text_regression_test.dart` |

---

## Debatable / hardening (design call)

| ID | Component | Type | Test |
|----|-----------|------|------|
| INP-DEB-001 | Input | E2E locator | `input_regression_test.dart` |
| INP-DEB-002 | Input | A11y touch target | `input_regression_test.dart` |
| IFD-DEB-001 | InputField | E2E locator | `input_field_regression_test.dart` |
| IFD-DEB-002 | InputField | A11y touch target | `input_field_regression_test.dart` |
| IDT-DEB-001 | InputDynamicText | E2E locator | `input_dynamic_text_regression_test.dart` |
| IFB-DEB-001 | InputFeedback | E2E locator | `input_feedback_regression_test.dart` |
| TXT-DEB-001 | Text | E2E locator | `text_regression_test.dart` |

---

## Cleared — no bug (GREEN parity proofs)

- Input: xs f6 native size, brand-bg→secondary, readOnly TextField.enabled, errorHighlight→invalid
- InputField: describedby wiring, required→isRequired, invalid gating, infoIcon gating, label order
- InputFeedback: alert/polite live regions, empty message shrink, default icons
- InputDynamicText: size steps, aria-live, trailingOnly, disabled helper
- Text: weight/attention scoping, size clamping, decorations, surface colour remap

---

## Detailed bug reports

(Full format in user-facing audit deliverable — see regression test files for probed values.)
