# CheckboxField — Flutter Component Bugs (QA → Dev)

> **Owner:** `@oneui/ui_flutter` (Flutter component team)
> **Raised by:** QA / Testing team — 2026-06-17
> **Source component:** `packages/ui_flutter/lib/widgets/one_ui_checkbox_field.dart`,
> `one_ui_checkbox_field_types.dart`, `one_ui_checkbox_field_a11y.dart`, and the
> composed `one_ui_checkbox.dart`
> **Full audit (with attribution + parity cross-check):** [`checkbox-field-audit-report.md`](checkbox-field-audit-report.md)
> **Repro:** `flutter test apps/qa-playground-flutter/test/components/checkbox_field/checkbox_field_regression_test.dart --name "<CBF-ID>"`

Every item was reproduced against the real widget (Jio fixture) through the
**CheckboxField public API** and cross-checked against the canonical web component
before filing. CheckboxField composes the inner `Checkbox`, so the keyboard /
`testId` gaps are shared with the Checkbox control (see `checkbox-flutter-bugs.md`);
they are filed here too because a CheckboxField consumer hits them through this
component's API. Each ticket cites the exact source line and a deterministic
failing test.

> **Out of scope for this list (do NOT raise against Flutter):** `CBF-PAR-001`
> … `CBF-PAR-006` are **parity proofs** — Flutter already matches the web
> contract (auto→secondary, invalid→validationResult, asterisk gated on label,
> alert feedback, readOnly chrome, infoIcon gated on label). They pass GREEN and
> must NOT be filed as bugs.

---

## 🔴 Confirmed bugs

### CBF-A11Y-001 / CBF-A11Y-001b — Field control not keyboard-operable (Space / Enter do not toggle)

| Field | Value |
|-------|-------|
| **Severity** | High (WCAG 2.1.1) |
| **Platform** | Flutter web / desktop |
| **Component** | `OneUiCheckboxField` → inner `OneUiCheckbox` (`Focus` node) |

**Description**
A tab-focused field control paints the focus ring but does not toggle on
**Space** or **Enter** — the only activation path is a pointer tap. Web renders a
native `<input type="checkbox">` that toggles on Space, so keyboard users can
operate the web field but not the Flutter one. Inherited from the inner control.

**Steps to reproduce**
1. `OneUiCheckboxField(label: …)` on a desktop/web target.
2. Tab to focus the control (ring renders), press Space, then Enter.

**Expected result:** Space (and Enter) toggle the field control.
**Actual result:** `checked` never changes (probed: `AFTER SPACE checked=false`,
`AFTER ENTER checked=false`).

**How to fix**
Add `onKeyEvent` (or `Shortcuts`+`Actions`) to the inner Checkbox `Focus` node
that calls `_handleTap()` on `LogicalKeyboardKey.space` (and `enter`), gated by
`a11y.canTap`. Fixing the control (CB-A11Y-001) fixes the field.

**Reference:** `one_ui_checkbox.dart:378-432`
**Repro tests:** `--name "[CBF-A11Y-001]"`, `--name "[CBF-A11Y-001b]"`

---

### CBF-FN-001 — `testId` not exposed via `Semantics.identifier`

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckboxField` (`testId`) |

**Description**
The field `testId` only wraps a `KeyedSubtree`, resolvable only inside the Dart
test process. It is never written to `Semantics(identifier:)`, so external drivers
(Patrol / Maestro / Appium) and the platform AT tree cannot find the control. Web
emits `data-testid`. Same class as Checkbox `CB-FN-001` / Avatar `AVT-FN-003`.

**Steps to reproduce:** `OneUiCheckboxField(testId: 'qa-field', …)`; read
`SemanticsData.identifier`.
**Expected result:** identifier == `'qa-field'`.
**Actual result:** identifier == `''` (probed).

**How to fix**
Set `identifier:` on the inner control's `Semantics` node (and/or a field-shell
container Semantics).

**Reference:** `one_ui_checkbox_field.dart:325-328`, `one_ui_checkbox.dart:576-599`
**Repro test:** `--name "[CBF-FN-001]"`

---

### CBF-A11Y-002 — `required` is exposed only as a visual asterisk, never to AT

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckboxField` (`required`) |

**Description**
`required:true` renders a visible ` *` asterisk on the label but is never
forwarded to the inner `Checkbox` / `Semantics`. The control reports
`hasRequiredState=false`, so screen-reader users are never told the field is
required. Web's asterisk span is `aria-hidden`; the accessible cue comes from
mapping `required` to the native input's `required` attribute. The visual and AT
cues have diverged.

**Steps to reproduce:** `OneUiCheckboxField(label: 'X', required: true)`; inspect
the inner control semantics.
**Expected result:** `SemanticsFlag.hasRequiredState == true`.
**Actual result:** asterisk renders, but `hasRequiredState == false`,
`validationResult == none` (probed).

**How to fix**
Forward `required: widget.required` into the inner `OneUiCheckbox` in
`_buildIntegrated` (and `enhanceCheckboxFieldOptions` for multi mode), and fix the
control to honour it (CB-A11Y-002): `Semantics(required: required ? true : null)`.

**Reference:** `one_ui_checkbox_field.dart:583-592` (asterisk), `354-377` (control build)
**Repro test:** `--name "[CBF-A11Y-002]"`

---

## 🟡 Debatable / hardening (raise only if the team wants the improvement)

### CBF-DEB-001 — Mobile touch target below 44px

| Field | Value |
|-------|-------|
| **Severity** | Low (WCAG 2.5.5) |
| **Platform** | Flutter Android / iOS |
| **Component** | `OneUiCheckboxField` → inner control (hit area) |

**Description**
The integrated field control box equals the box token (s=16/m=20/l=24) with no
touch hit padding — a labelled `size=m` field has a 20px control box (probed).
WCAG 2.5.5 / platform HIG recommend ≥44px on touch. Web shares the small box, so
this is platform-min hardening.

**Expected result:** ≥44px tappable area on mobile.
**Actual result:** 20px (size m).

**How to fix**
Add touch-only hit-test padding on the control (expand the gesture area, keep the
painted box) — same fix as Checkbox `CB-DEB-002`.

**Reference:** `one_ui_checkbox.dart:394-401`
**Repro test:** `--name "[CBF-DEB-001]"`

---

### CBF-DEB-002 — Unknown `appearance` silently falls back (no debug assert)

| Field | Value |
|-------|-------|
| **Severity** | Low (hardening) |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckboxField` (`appearance`) |

**Description**
`appearance` is a `typedef String`; the field forwards an unknown role through to
the inner Checkbox unchanged, tokens miss, the colour resolver silently falls back
(probed: no `FlutterError`). Web blocks this at compile time via the TS union.

**Expected result:** A `kDebugMode` assertion for an unknown role.
**Actual result:** Silent pass-through + colour fallback.

**How to fix**
Add a `kDebugMode` `assert` against the known role set (field and/or control), or
model appearance as an enum — same fix as Checkbox `CB-DEB-003`.

**Reference:** `one_ui_checkbox_field_types.dart:108-110`, `one_ui_checkbox_types.dart:89-91`
**Repro test:** `--name "[CBF-DEB-002]"`

---

## Summary

| Bug ID | Severity | Bucket | Repro test name |
|--------|----------|--------|-----------------|
| CBF-A11Y-001 | High | Confirmed | `[CBF-A11Y-001]` |
| CBF-A11Y-001b | High | Confirmed | `[CBF-A11Y-001b]` |
| CBF-FN-001 | Medium | Confirmed | `[CBF-FN-001]` |
| CBF-A11Y-002 | Medium | Confirmed | `[CBF-A11Y-002]` |
| CBF-DEB-001 | Low | Debatable / target | `[CBF-DEB-001]` |
| CBF-DEB-002 | Low | Debatable / hardening | `[CBF-DEB-002]` |

**4 confirmed Flutter component bugs + 2 debatable.** Run all at once:
```bash
flutter test apps/qa-playground-flutter/test/components/checkbox_field/checkbox_field_regression_test.dart
```
The `[confirmed]` and `[debatable]` groups fail (RED = open bug); the `[parity]`
and `[meta]` groups pass (GREEN = Flutter is correct).
