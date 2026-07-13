# Checkbox — Flutter Component Bugs (QA → Dev)

> **Owner:** `@oneui/ui_flutter` (Flutter component team)
> **Raised by:** QA / Testing team — 2026-06-17
> **Source component:** `packages/ui_flutter/lib/widgets/one_ui_checkbox.dart`,
> `one_ui_checkbox_types.dart`, `one_ui_checkbox_a11y.dart`,
> `lib/engine/checkbox_color_resolve.dart`, `checkbox_size_resolve.dart`
> **Full audit (with attribution + parity cross-check):** [`checkbox-audit-report.md`](checkbox-audit-report.md)
> **Repro:** `flutter test apps/qa-playground-flutter/test/components/checkbox/checkbox_regression_test.dart --name "<CB-ID>"`

Every item was reproduced against the real widget (Jio fixture) and cross-checked
against the canonical web component before filing. Each ticket cites the exact
source line and a deterministic failing test.

> **Out of scope for this list (do NOT raise against Flutter):** `CB-PAR-001`
> … `CB-PAR-006` are **parity proofs** — Flutter already matches the web
> contract (auto→secondary, accent ignored, neutral unchecked stroke, aria-invalid
> wiring, readOnly chrome, symmetric value-trim). They pass GREEN and must NOT be
> filed as bugs.

---

## 🔴 Confirmed bugs

### CB-A11Y-001 / CB-A11Y-001b — Checkbox not keyboard-operable (Space / Enter do not toggle)

| Field | Value |
|-------|-------|
| **Severity** | High (WCAG 2.1.1) |
| **Platform** | Flutter web / desktop |
| **Component** | `OneUiCheckbox` (`Focus` node) |

**Description**
A focused checkbox paints the focus ring but does not toggle on **Space** or
**Enter** — the only activation path is a pointer tap. Web renders a native
`<input type="checkbox">` that toggles on Space, so keyboard users can operate the
web control but not the Flutter one.

**Steps to reproduce**
1. `OneUiCheckbox(autofocus: true, …)` on a desktop/web target.
2. Confirm focus (ring renders), press Space, then Enter.

**Expected result:** Space (and Enter) toggle the checkbox.
**Actual result:** `checked` never changes (probed: `AFTER SPACE checked=false`,
`AFTER ENTER checked=false`).

**RCA**
The `Focus` node has `onFocusChange` but no key handling and no
`Shortcuts`/`Actions`:
```dart
// one_ui_checkbox.dart:378
Widget control = Focus(
  focusNode: _focusNode,
  autofocus: widget.autofocus,
  canRequestFocus: !state.isDisabled,
  onFocusChange: (_) => setState(() {}),   // <-- no onKeyEvent
  ...
```

**How to fix**
Add `onKeyEvent` (or `Shortcuts`+`Actions`) that calls `_handleTap()` on
`LogicalKeyboardKey.space` (and `enter`), gated by `a11y.canTap`; reuse the
existing press-scale feedback.

**Reference:** `one_ui_checkbox.dart:378-432`
**Repro tests:** `--name "[CB-A11Y-001]"`, `--name "[CB-A11Y-001b]"`

---

### CB-FN-001 — `testId` not exposed via `Semantics.identifier`

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckbox` (`testId`) |

**Description**
`testId` only wraps a `KeyedSubtree`, resolvable only inside the Dart test
process. It is never written to `Semantics(identifier:)`, so external drivers
(Patrol / Maestro / Appium) and the platform AT tree cannot find the control.
Web emits `data-testid` (`Checkbox.tsx:193`). Same class of gap as Avatar
`AVT-FN-003`.

**Steps to reproduce:** `OneUiCheckbox(testId: 'qa-checkbox', …)`; read the
`SemanticsData.identifier`.
**Expected result:** identifier == `'qa-checkbox'`.
**Actual result:** identifier == `''` (probed).

**RCA**
```dart
// one_ui_checkbox.dart:596-599
final tid = widget.testId?.trim();
if (tid != null && tid.isNotEmpty) {
  row = KeyedSubtree(key: ValueKey(tid), child: row);   // in-process only
}
```

**How to fix**
Set `identifier: tid` on the existing `Semantics` node (one_ui_checkbox.dart:576).

**Reference:** `one_ui_checkbox.dart:576-599`
**Repro test:** `--name "[CB-FN-001]"`

---

### CB-A11Y-002 — `required` prop is dead (never reaches Semantics)

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckbox` (`required`) |

**Description**
`required` is accepted by the constructor but never used — it is not forwarded to
`Semantics`, the a11y resolver, or validation. Screen-reader users are never told
the field is required. Web maps `required` to the native input's `required`
attribute.

**Steps to reproduce:** `OneUiCheckbox(required: true, label: 'X')`; inspect
semantics.
**Expected result:** `SemanticsFlag.hasRequiredState == true`.
**Actual result:** `hasRequiredState == false`, `validationResult == none`
(probed).

**RCA**
`widget.required` is declared (`one_ui_checkbox.dart:97`) but never referenced in
`build()`. The `Semantics` node (`one_ui_checkbox.dart:576-586`) sets
checked/mixed/enabled/readOnly/validationResult but **not** `required`.

**How to fix**
Pass `required: widget.required ? true : null` to the `Semantics` widget;
optionally feed it into the validation result for unchecked-required.

**Reference:** `one_ui_checkbox.dart:97`, `576-586`
**Repro test:** `--name "[CB-A11Y-002]"`

---

## 🟡 Debatable / hardening (raise only if the team wants the improvement)

### CB-DEB-001 — `errorHighlight` is silent to assistive tech

| Field | Value |
|-------|-------|
| **Severity** | Low (a11y) |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckbox` (`errorHighlight`) |

**Description**
`errorHighlight:true` emits the `data-invalid` marker but does not set
`validationResult: invalid`, so AT gets no invalid cue. **Web shares this split**
(`errorHighlight` → `data-invalid` visual only; only `aria-invalid` is announced),
so this is parity-aligned — raise only to make Flutter more accessible than web.

**Expected result:** `validationResult == invalid` when `errorHighlight`.
**Actual result:** `validationResult == none` (probed); only `ariaInvalid` flips it.

**RCA**
`one_ui_checkbox_a11y.dart:78` derives `isInvalid` from `ariaInvalid` only;
`errorHighlight` only reaches the `data-invalid` data-attr
(`one_ui_checkbox_types.dart:141`).

**How to fix**
OR `errorHighlight` into `isInvalid` in `resolveOneUiCheckboxSemantics`.

**Reference:** `one_ui_checkbox_a11y.dart:78`, `one_ui_checkbox_types.dart:141`
**Repro test:** `--name "[CB-DEB-001]"`

---

### CB-DEB-002 — Mobile touch target below 44px

| Field | Value |
|-------|-------|
| **Severity** | Low (WCAG 2.5.5) |
| **Platform** | Flutter Android / iOS |
| **Component** | `OneUiCheckbox` (hit area) |

**Description**
The interactive box equals the box token (s=16/m=20/l=24), with no touch hit
padding — a labelled `size=m` checkbox is 20px tall (probed root `216×20`). WCAG
2.5.5 / platform HIG recommend ≥44px on touch. Web shares the small box, so this
is platform-min hardening.

**Expected result:** ≥44px tappable area on mobile.
**Actual result:** 20px (size m).

**RCA**
`one_ui_checkbox.dart:394-401` sizes the `AnimatedContainer` to `metrics.boxSize`
with no min-target expansion.

**How to fix**
Add touch-only hit-test padding (expand the gesture area, keep the painted box).

**Reference:** `one_ui_checkbox.dart:394-401`
**Repro test:** `--name "[CB-DEB-002]"`

---

### CB-DEB-003 — Unknown `appearance` silently falls back (no debug assert)

| Field | Value |
|-------|-------|
| **Severity** | Low (hardening) |
| **Platform** | Flutter (all) |
| **Component** | `resolveOneUiCheckboxState` |

**Description**
`appearance` is a `typedef String`; an unknown role passes through unchanged,
tokens miss, the colour resolver silently falls back (probed: no `FlutterError`).
Web blocks this at compile time via the TS union.

**Expected result:** A `kDebugMode` assertion for an unknown role.
**Actual result:** Silent pass-through + colour fallback.

**RCA**
`one_ui_checkbox_types.dart:89-91` returns any non-`auto` string verbatim.

**How to fix**
Add a `kDebugMode` `assert` against the known role set, or model appearance as an
enum.

**Reference:** `one_ui_checkbox_types.dart:89-91`
**Repro test:** `--name "[CB-DEB-003]"`

---

## Summary

| Bug ID | Severity | Bucket | Repro test name |
|--------|----------|--------|-----------------|
| CB-A11Y-001 | High | Confirmed | `[CB-A11Y-001]` |
| CB-A11Y-001b | High | Confirmed | `[CB-A11Y-001b]` |
| CB-FN-001 | Medium | Confirmed | `[CB-FN-001]` |
| CB-A11Y-002 | Medium | Confirmed | `[CB-A11Y-002]` |
| CB-DEB-001 | Low | Debatable / a11y | `[CB-DEB-001]` |
| CB-DEB-002 | Low | Debatable / target | `[CB-DEB-002]` |
| CB-DEB-003 | Low | Debatable / hardening | `[CB-DEB-003]` |

**4 confirmed Flutter component bugs + 3 debatable.** Run all at once:
```bash
flutter test apps/qa-playground-flutter/test/components/checkbox/checkbox_regression_test.dart
```
The `[confirmed]` and `[debatable]` groups fail (RED = open bug); the `[parity]`
and `[meta]` groups pass (GREEN = Flutter is correct).
