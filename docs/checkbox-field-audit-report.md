# OneUI Flutter CheckboxField — Component Audit Report

**Date:** 2026-06-17
**Component:** `OneUiCheckboxField` (Flutter)
**Source:**
- `packages/ui_flutter/lib/widgets/one_ui_checkbox_field.dart`
- `packages/ui_flutter/lib/widgets/one_ui_checkbox_field_types.dart`
- `packages/ui_flutter/lib/widgets/one_ui_checkbox_field_a11y.dart`
- composed: `one_ui_checkbox.dart`, `one_ui_checkbox_group.dart`,
  `one_ui_input_feedback.dart`, `one_ui_input_dynamic_text.dart`,
  `one_ui_icon_button.dart`
- engines: `checkbox_size_resolve.dart`, `checkbox_color_resolve.dart`,
  `text_style_resolve.dart`, `input_feedback_resolve.dart`

**Cross-checked against:**
- React Web `packages/ui/src/components/CheckboxField/CheckboxField.tsx`
- `CheckboxField.shared.ts` (shared prop + resolver contract)
- `CheckboxField.module.css` (layout token contract)
- the composed `Checkbox` (`Checkbox.tsx`, `Checkbox.shared.ts`,
  `Checkbox.module.css`) — CheckboxField wraps it
- Figma spec — **CheckboxField** (`size: s|m|l` × `appearance` × `accent` ×
  `checked` × `indeterminate` × `readOnly` × `label` × `required` × `infoIcon` ×
  `description` × `feedback` × `disabled` × `content`; states sheet =
  `unchecked|checked|indeterminate` rows × `M|S|L` sizes × `readOnly false|true`
  columns, each cell adding a Description line)
- Jio brand Convex snapshot (`apps/qa-playground-flutter/assets/qa-fixtures/jio/theme-snapshot.json`)
- WCAG 2.1 AA (2.1.1 keyboard, 2.5.5 target size, 3.3.2 labels/required, 4.1.2 name/role/value)
- Direct test runs of `apps/qa-playground-flutter/test/components/checkbox_field/*`

**Severity legend:**
- **Critical** — ships broken UX, runtime crash, or AT failure
- **High** — visible regression vs spec / parity gap
- **Medium** — noticeable polish or a11y gap
- **Low** — nice-to-have / hardening

**Headline:** **4 confirmed Flutter component bugs**, **2 debatable
hardening/parity-leaning gaps**, and **6 parity proofs** (Flutter already matches
the web contract — GREEN, not bugs). The confirmed bugs are inherited from the
composed inner `Checkbox` control but are reproduced through the **CheckboxField
public API**, since that is the surface a CheckboxField consumer uses. A few
suspected defects were **disproven** by cross-checking web and probing the real
widget; they are documented as parity proofs so the team doesn't re-investigate.

| Bucket | Count | IDs |
|--------|-------|-----|
| Confirmed Flutter component bug | 4 | CBF-A11Y-001 (Space), CBF-A11Y-001b (Enter), CBF-FN-001 (testId identifier), CBF-A11Y-002 (`required` not exposed to AT) |
| Debatable hardening / parity-leaning | 2 | CBF-DEB-001 (touch target), CBF-DEB-002 (invalid appearance assert) |
| Parity proof — Flutter is correct (GREEN) | 6 | CBF-PAR-001..006 |

---

## 0. Methodology (no false confidence)

Every finding was **reproduced against the real widget with a throwaway probe
before any assertion was written** — no speculative RED tests. Probes used the
real Jio fixture (production token resolution) via the CheckboxField public API.
Captured probe results:

| Finding | Probe result | Attribution |
|---------|--------------|-------------|
| Control box sizing | s=16 m=20 l=24 px | correct |
| Disabled opacity | `Opacity 0.5` | correct (`--Disabled-Opacity`) |
| ReadOnly opacity | `Opacity 1.0` | correct (web parity) |
| `appearance:auto` fill | == `appearance:secondary` fill | **PARITY** CBF-PAR-001 |
| `appearance:primary` vs `secondary` | different fills | correct (roles wired) |
| `invalid` / `error` | `validationResult=invalid` on control | **PARITY** CBF-PAR-002 |
| `required:true` (with label) | visible ` *` asterisk renders | correct (visual) |
| `required:true` (no label) | no asterisk | **PARITY** CBF-PAR-003 |
| `error` feedback | `InputFeedback` + visible text + `alert` role | **PARITY** CBF-PAR-004 |
| `infoIcon:true` (with label) | one `OneUiIconButton` | correct |
| `infoIcon:true` (no label) | no IconButton | **PARITY** CBF-PAR-006 |
| Space key (focused, desktop) | `checked` stays false | **CONFIRMED** CBF-A11Y-001 |
| Enter key (focused, desktop) | `checked` stays false | **CONFIRMED** CBF-A11Y-001b |
| `testId` | `SemanticsData.identifier == ''` | **CONFIRMED** CBF-FN-001 |
| `required:true` | `hasRequiredState=false`, `validationResult=none` | **CONFIRMED** CBF-A11Y-002 |
| Control box height (mobile, size m) | 20px | **DEBATABLE** CBF-DEB-001 |
| `appearance:'destructive'` | no assert, silent fallback fill | **DEBATABLE** CBF-DEB-002 |

---

## 1. Confirmed Flutter component bugs (RED)

### CBF-A11Y-001 / CBF-A11Y-001b — Field control is not keyboard-operable (Space / Enter do not toggle)

| Field | Value |
|-------|-------|
| **Severity** | High (WCAG 2.1.1 keyboard) |
| **Platform** | Flutter web / desktop (keyboard) |
| **Component** | `OneUiCheckboxField` → inner `OneUiCheckbox` (`Focus` node) |

**Description.** Tab-focusing the integrated field control paints the focus ring,
but pressing **Space** or **Enter** does **not** toggle it. The inner Checkbox's
`Focus` node (`one_ui_checkbox.dart:378`) has `onFocusChange` but **no
`onKeyEvent`** and no `Shortcuts`/`Actions`, so the only activation path is a
pointer tap. On web the field renders a real `<input type="checkbox">`
(`BaseCheckbox.Root`) that the browser toggles on Space natively. The field
inherits this gap from the control.

**Probe.** linux target, Tab focuses the control, ring renders, yet
`AFTER SPACE checked=false` and `AFTER ENTER checked=false`.

**Expected.** Space (and idiomatically Enter) toggle the focused field control.
**Actual.** Neither key toggles.

**How to fix.** Add an `onKeyEvent` to the inner Checkbox's `Focus` node (or wrap
in `Shortcuts`/`Actions`) that calls `_handleTap()` on `LogicalKeyboardKey.space`
(and `enter`), gated by `a11y.canTap`. Fixing the control fixes the field.

**Reference:** `one_ui_checkbox.dart:378-432`.
**Repro tests:** `[CBF-A11Y-001]`, `[CBF-A11Y-001b]`.

---

### CBF-FN-001 — `testId` is not exposed to platform AT trees (in-process only)

| Field | Value |
|-------|-------|
| **Severity** | Medium (test-automation parity) |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckboxField` (`testId`) |

**Description.** The field `testId` only wraps the subtree in a `KeyedSubtree`
(`one_ui_checkbox_field.dart:325-328`), resolvable **only inside the Dart test
process** (`find.byKey`). It is never written to `Semantics(identifier:)`, so
external drivers (Patrol, Maestro, Appium) and the platform accessibility tree
cannot locate the control. On web `data-testid` is emitted and Playwright reads
it. Same class of gap as Checkbox `CB-FN-001` and Avatar `AVT-FN-003`.

**Probe.** `SemanticsData.identifier == ''` for `testId: 'qa-field'`.

**Expected.** `Semantics(identifier: testId)` so the id reaches the AT tree.
**Actual.** identifier empty; only the in-process key works.

**How to fix.** Set `identifier:` on the inner control's `Semantics` node (and/or
a container Semantics on the field shell) in addition to the `KeyedSubtree`.

**Reference:** `one_ui_checkbox_field.dart:325-328`; `one_ui_checkbox.dart:576-599`.
**Repro test:** `[CBF-FN-001]`.

---

### CBF-A11Y-002 — `required` is exposed only as a visual asterisk, never to AT

| Field | Value |
|-------|-------|
| **Severity** | Medium (a11y / form parity) |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckboxField` (`required`) |

**Description.** `required:true` renders a visible ` *` asterisk on the label
rich text (`one_ui_checkbox_field.dart:583-592`), but the value is **never
forwarded to the inner `Checkbox`, its `Semantics`, or any validation path**. The
inner control reports `hasRequiredState=false`. On web the asterisk span is
`aria-hidden="true"` and the **accessible** required cue comes from mapping
`required` to the native input's `required` attribute (`CheckboxField.tsx:176`
passes `required` into `checkboxCommon`). So the Flutter field shows the asterisk
but a screen-reader user is never told the field is required — the visual cue and
the AT cue have diverged. (Companion to Checkbox `CB-A11Y-002`, where `required`
is a dead prop on the control itself.)

**Probe.** `required:true` → asterisk renders, but
`SemanticsFlag.hasRequiredState == false`, `validationResult == none`.

**Expected.** `Semantics(required: true)` on the control (and ideally surfaced in
validation when unchecked).
**Actual.** Required is visual-only.

**How to fix.** Forward `required: widget.required` into the inner `OneUiCheckbox`
in `_buildIntegrated` / `enhanceCheckboxFieldOptions`, and fix the control to
honour it (CB-A11Y-002): `Semantics(required: required ? true : null)`.

**Reference:** `one_ui_checkbox_field.dart:583-592` (asterisk),
`one_ui_checkbox_field.dart:354-377` (control build — `required` not passed).
**Repro test:** `[CBF-A11Y-002]`.

---

## 2. Debatable / hardening (RED — web shares the gap, so a design call)

### CBF-DEB-001 — Mobile touch target below 44px

| Field | Value |
|-------|-------|
| **Severity** | Low (WCAG 2.5.5 / platform HIG) |
| **Platform** | Flutter Android / iOS |
| **Component** | `OneUiCheckboxField` → inner control (hit area) |

**Description.** The integrated field control box equals the box token (s=16,
m=20, l=24 px) with no extra hit padding, so a labelled `size=m` field has a 20px
control box (probe). WCAG 2.5.5 and platform HIG recommend ≥44px on touch. Web
has the same small box, so this is platform-minimum hardening rather than a clear
regression. The field's larger label/description copy does not expand the
control's gesture area.

**Reference:** `one_ui_checkbox.dart:394-401` (box sized to `metrics.boxSize`).
**Repro test:** `[CBF-DEB-001]`.

---

### CBF-DEB-002 — Unknown `appearance` silently falls back (no debug assert)

| Field | Value |
|-------|-------|
| **Severity** | Low (hardening) |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckboxField` (`appearance`) |

**Description.** `appearance` is a `typedef String`; the field forwards an unknown
role (e.g. `'destructive'`) to the inner Checkbox unchanged, tokens miss, and the
colour resolver silently falls back (probe: no `FlutterError`). Web catches this
at compile time via the TypeScript union. A `kDebugMode` assert against the known
role set (on the field and/or the control) would recover that safety.

**Reference:** `one_ui_checkbox_field_types.dart:108-110`;
`one_ui_checkbox_types.dart:89-91`.
**Repro test:** `[CBF-DEB-002]`.

---

## 3. Parity proofs (GREEN — Flutter already matches web; NOT bugs)

These are documented so suspected defects are not re-investigated.

| ID | Claim verified | Source contract |
|----|----------------|-----------------|
| CBF-PAR-001 | `appearance:auto` resolves to the **secondary** stack | `CheckboxField.shared.ts` / `one_ui_checkbox_field_types.dart:109-110` |
| CBF-PAR-002 | `invalid` / `error` drives `validationResult=invalid` on the control (field wires `errorHighlight` + `aria-invalid`) | `CheckboxField.tsx:135,180` |
| CBF-PAR-003 | required asterisk is gated on a label (`labelSuffixInside = required && hasLabelHeader`) | `CheckboxField.tsx:156-161` |
| CBF-PAR-004 | error feedback renders an `InputFeedback` with the `alert` role | `CheckboxField.tsx:141-150`, `InputFeedback` RN parity |
| CBF-PAR-005 | `readOnly` stays enabled + opacity 1.0, distinct from disabled | `Checkbox.module.css` readOnly chrome |
| CBF-PAR-006 | `infoIcon` is gated on a label (`hasInfoIcon = infoIcon && hasLabel`) | `one_ui_checkbox_field_types.dart:113`; web `labelTrailing = hasLabelHeader && infoIconSlot` |

**Note on the disproven suspicions.** "required asterisk should always show" and
"infoIcon should always show when requested" were both probed and are **correctly
gated on a label**, matching web — GREEN, do not raise. The `appearance:auto →
secondary` and `invalid → validationResult` behaviours match the web field
exactly.

---

## 4. Burn-down

| Bug ID | Severity | Bucket | Repro test |
|--------|----------|--------|-----------|
| CBF-A11Y-001 | High | Confirmed | `[CBF-A11Y-001]` |
| CBF-A11Y-001b | High | Confirmed | `[CBF-A11Y-001b]` |
| CBF-FN-001 | Medium | Confirmed | `[CBF-FN-001]` |
| CBF-A11Y-002 | Medium | Confirmed | `[CBF-A11Y-002]` |
| CBF-DEB-001 | Low | Debatable | `[CBF-DEB-001]` |
| CBF-DEB-002 | Low | Debatable | `[CBF-DEB-002]` |
| CBF-PAR-001..006 | — | Parity (GREEN) | `[CBF-PAR-00N]` |

**4 confirmed Flutter bugs + 2 debatable + 6 parity proofs.** Run the suite:
```bash
flutter test apps/qa-playground-flutter/test/components/checkbox_field/checkbox_field_regression_test.dart
```
`[confirmed]` and `[debatable]` groups fail (RED = open); `[parity]` and `[meta]`
pass (GREEN). Each RED turns green when the matching Flutter fix lands.
