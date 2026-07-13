# OneUI Flutter Checkbox — Component Audit Report

**Date:** 2026-06-17
**Component:** `OneUiCheckbox` (+ `OneUiCheckboxGroup`) (Flutter)
**Source:**
- `packages/ui_flutter/lib/widgets/one_ui_checkbox.dart`
- `packages/ui_flutter/lib/widgets/one_ui_checkbox_types.dart`
- `packages/ui_flutter/lib/widgets/one_ui_checkbox_a11y.dart`
- `packages/ui_flutter/lib/widgets/one_ui_checkbox_group.dart`
- `packages/ui_flutter/lib/engine/checkbox_size_resolve.dart`
- `packages/ui_flutter/lib/engine/checkbox_color_resolve.dart`
- `packages/ui_flutter/lib/engine/checkbox_indicator_motion_resolve.dart`

**Cross-checked against:**
- React Web `packages/ui/src/components/Checkbox/Checkbox.tsx`
- `Checkbox.module.css` (the canonical token contract)
- `Checkbox.shared.ts` (the shared prop + resolver contract)
- Figma spec — **Checkbox** (`size: s|m|l` × `appearance` × `accent` ×
  `checked` × `indeterminate` × `readOnly` × `label` × `description` × `disabled`;
  states sheet = `unchecked|checked|indeterminate` rows × `M|S|L` sizes ×
  `readOnly false|true` columns)
- Jio brand Convex snapshot (`apps/qa-playground-flutter/assets/qa-fixtures/jio/theme-snapshot.json`)
- WCAG 2.1 AA (2.1.1 keyboard, 2.5.5 target size, 4.1.2 name/role/value)
- Direct test runs of `apps/qa-playground-flutter/test/components/checkbox/*`

**Severity legend:**
- **Critical** — ships broken UX, runtime crash, or AT failure
- **High** — visible regression vs spec / parity gap
- **Medium** — noticeable polish or a11y gap
- **Low** — nice-to-have / hardening

**Headline:** **4 confirmed Flutter component bugs**, **3 debatable
hardening/parity-leaning gaps**, and **6 parity proofs** (Flutter already matches
the web contract — these are GREEN, not bugs). A few suspected defects were
**disproven** by cross-checking web and probing the real widget; they are
documented as parity proofs so the team doesn't re-investigate them.

| Bucket | Count | IDs |
|--------|-------|-----|
| Confirmed Flutter component bug | 4 | CB-A11Y-001 (Space), CB-A11Y-001b (Enter), CB-FN-001 (testId identifier), CB-A11Y-002 (dead `required` prop) |
| Debatable hardening / parity-leaning | 3 | CB-DEB-001 (errorHighlight→AT), CB-DEB-002 (touch target), CB-DEB-003 (invalid appearance assert) |
| Parity proof — Flutter is correct (GREEN) | 6 | CB-PAR-001..006 |

---

## 0. Methodology (no false confidence)

Every finding was **reproduced against the real widget with a throwaway probe
before any assertion was written** — no speculative RED tests. Probes used the
real Jio fixture (production token resolution). Captured probe results:

| Finding | Probe result | Attribution |
|---------|--------------|-------------|
| Box sizing | s=16 m=20 l=24 px (Jio **and** synthetic DS) | correct |
| Disabled opacity | `Opacity 0.5` | correct (web `--Disabled-Opacity`) |
| ReadOnly opacity | `Opacity 1.0` | correct (web parity) |
| `appearance:auto` fill | == `appearance:secondary` fill | **PARITY** CB-PAR-001 |
| `accent:primary` fill | == default fill (no change) | **PARITY** CB-PAR-002 |
| `appearance:primary` vs `secondary` | different fills | correct (roles wired) |
| Unchecked border, `negative` vs `secondary` | identical neutral grey | **PARITY** CB-PAR-003 |
| Space key (focused, desktop) | `checked` stays false | **CONFIRMED** CB-A11Y-001 |
| Enter key (focused, desktop) | `checked` stays false | **CONFIRMED** CB-A11Y-001b |
| Focus ring | `boxShadow.length == 2` on focus | correct |
| `testId` | `SemanticsData.identifier == ''` | **CONFIRMED** CB-FN-001 |
| `required:true` | `hasRequiredState=false`, `validationResult=none` | **CONFIRMED** CB-A11Y-002 |
| `errorHighlight:true` | key has `data-invalid`, `validationResult=none` | **DEBATABLE** CB-DEB-001 |
| `aria-invalid:true` | `validationResult=invalid` | **PARITY** CB-PAR-004 |
| Labelled box height (mobile, size m) | 20px (root 216×20) | **DEBATABLE** CB-DEB-002 |
| `appearance:'destructive'` | no assert, silent fallback fill | **DEBATABLE** CB-DEB-003 |
| Group value `' home '` (padded) | resolves checked=true | **PARITY** CB-PAR-006 |

---

## 1. Confirmed Flutter component bugs (RED)

### CB-A11Y-001 / CB-A11Y-001b — Checkbox is not keyboard-operable (Space / Enter do not toggle)

| Field | Value |
|-------|-------|
| **Severity** | High (WCAG 2.1.1 keyboard) |
| **Platform** | Flutter web / desktop (keyboard) |
| **Component** | `OneUiCheckbox` (`Focus` node) |

**Description.** The checkbox receives keyboard focus and paints the focus ring,
but pressing **Space** or **Enter** does **not** toggle it. The `Focus` widget
(`one_ui_checkbox.dart:378`) has `onFocusChange` but **no `onKeyEvent`** and there
is no `Shortcuts`/`Actions` wiring, so the only activation path is a pointer tap.
On web the component renders a real `<input type="checkbox">`
(`BaseCheckbox.Root`) that the browser toggles on Space natively — so a keyboard
user can operate the web checkbox but **not** the Flutter one. This is a genuine
Flutter-only accessibility regression.

**Probe.** `autofocus:true`, `debugDefaultTargetPlatformOverride = linux`,
`primaryFocus.hasFocus == true`, ring `boxShadow.length == 2`, yet
`AFTER SPACE checked=false` and `AFTER ENTER checked=false`.

**Expected.** Space (and idiomatically Enter) toggle the focused checkbox.
**Actual.** Neither key toggles.

**How to fix.** Add an `onKeyEvent` to the `Focus` node (or wrap in
`Shortcuts`/`Actions`) that calls `_handleTap()` on `LogicalKeyboardKey.space`
(and `enter`), gated by `a11y.canTap`. Mirror the press-scale animation so the
keyboard activation matches the pointer feedback.

**Reference:** `one_ui_checkbox.dart:378-432` (`Focus` has no key handler).
**Repro tests:** `[CB-A11Y-001]`, `[CB-A11Y-001b]`.

---

### CB-FN-001 — `testId` is not exposed to platform AT trees (in-process only)

| Field | Value |
|-------|-------|
| **Severity** | Medium (test-automation parity) |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckbox` (`testId`) |

**Description.** `testId` only wraps the subtree in a `KeyedSubtree`
(`one_ui_checkbox.dart:596-599`), which is resolvable **only inside the Dart test
process** (`find.byKey`). It is never written to `Semantics(identifier:)`, so
external drivers (Patrol, Maestro, Appium) and the platform accessibility tree
cannot locate the control. On web, `data-testid` is emitted on the control
(`Checkbox.tsx:193`) and Playwright reads it. Same gap as Avatar `AVT-FN-003`.

**Probe.** `SemanticsData.identifier == ''` for `testId: 'qa-checkbox'`.

**Expected.** `Semantics(identifier: testId)` so the id reaches the AT tree.
**Actual.** identifier empty; only the in-process key works.

**How to fix.** Set `identifier: tid` on the existing `Semantics` node (in
addition to, or instead of, the `KeyedSubtree`).

**Reference:** `one_ui_checkbox.dart:576-599`.
**Repro test:** `[CB-FN-001]`.

---

### CB-A11Y-002 — `required` prop is dead (never reaches Semantics)

| Field | Value |
|-------|-------|
| **Severity** | Medium (a11y / form parity) |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckbox` (`required`) |

**Description.** `OneUiCheckbox` accepts `required` in its constructor
(`one_ui_checkbox.dart:62,97`) but the value is **never referenced again** —
it is not forwarded to the `Semantics` node, the a11y resolver, or any
validation path. A screen-reader user is never told the field is required. On web
`required` maps to the native input's `required` attribute (form validation +
`aria-required`).

**Probe.** `required:true` → `SemanticsFlag.hasRequiredState == false`,
`validationResult == none`.

**Expected.** `Semantics(required: true)` (and ideally surfaced in validation).
**Actual.** Prop silently dropped.

**How to fix.** Pass `required: widget.required ? true : null` to the `Semantics`
widget; optionally feed it into the validation result when unchecked.

**Reference:** `one_ui_checkbox.dart:97` (field declared, never used).
**Repro test:** `[CB-A11Y-002]`.

---

## 2. Debatable / hardening (RED — web shares the gap, so a design call)

### CB-DEB-001 — `errorHighlight` paints `data-invalid` but is silent to AT

| Field | Value |
|-------|-------|
| **Severity** | Low (a11y hardening) |
| **Platform** | Flutter (all) |
| **Component** | `OneUiCheckbox` (`errorHighlight`) |

**Description.** `errorHighlight:true` produces the `data-invalid` data-attr
(carried into the QA `KeyedSubtree` key) but does **not** set
`validationResult: invalid` on the `Semantics` node — the a11y resolver only
flips `isInvalid` from `ariaInvalid`, not `errorHighlight`. So assistive tech gets
no invalid cue. **Web shares this exact split**: `errorHighlight` → `data-invalid`
wrapper attr only (`Checkbox.tsx:203`, visual), while `aria-invalid` is wired to
the `ariaInvalid` prop (`Checkbox.tsx:185`). Standalone Checkbox CSS has no
`data-invalid` chrome either. So this is parity-aligned — raise only if the team
wants Flutter to be *more* accessible than web by mapping `errorHighlight` →
`validationResult`.

**Reference:** `one_ui_checkbox_a11y.dart:78` (`isInvalid` from `ariaInvalid` only);
`one_ui_checkbox_types.dart:141` (`data-invalid` from `errorHighlight`).
**Repro test:** `[CB-DEB-001]`.

---

### CB-DEB-002 — Mobile touch target below 44px

| Field | Value |
|-------|-------|
| **Severity** | Low (WCAG 2.5.5 / platform HIG) |
| **Platform** | Flutter Android / iOS |
| **Component** | `OneUiCheckbox` (hit area) |

**Description.** The interactive box is the resolved box token (s=16, m=20,
l=24 px) with no extra hit padding, so a labelled `size=m` checkbox is only 20px
tall (probe: root `216×20`). WCAG 2.5.5 and platform HIG recommend ≥44px on
touch. Web has the same small box, so this is platform-minimum hardening rather
than a clear regression; the fix is to add touch-only hit-test padding (e.g. a
`MaterialTapTargetSize.padded` style expansion) without changing the painted box.

**Reference:** `one_ui_checkbox.dart:394-401` (box sized to `metrics.boxSize`,
no min-target expansion).
**Repro test:** `[CB-DEB-002]`.

---

### CB-DEB-003 — Unknown `appearance` silently falls back (no debug assert)

| Field | Value |
|-------|-------|
| **Severity** | Low (hardening) |
| **Platform** | Flutter (all) |
| **Component** | `resolveOneUiCheckboxState` |

**Description.** `appearance` is a `typedef String`; an unknown role (e.g.
`'destructive'`) passes through `resolveOneUiCheckboxState` unchanged
(`one_ui_checkbox_types.dart:89-91`), tokens miss, and the colour resolver
silently falls back (probe: no `FlutterError`, renders a primary-ish fill). Web
catches this at compile time via the TypeScript union. A `kDebugMode` assert
against the known role set would recover that safety.

**Reference:** `one_ui_checkbox_types.dart:89-91`.
**Repro test:** `[CB-DEB-003]`.

---

## 3. Parity proofs (GREEN — Flutter already matches web; NOT bugs)

These are documented so suspected defects are not re-investigated.

| ID | Claim verified | Source contract |
|----|----------------|-----------------|
| CB-PAR-001 | `appearance:auto` resolves to the **secondary** stack | `Checkbox.shared.ts:140-143` |
| CB-PAR-002 | `accent` is `@deprecated` and ignored at runtime | `Checkbox.shared.ts:23-24,101` |
| CB-PAR-003 | Unchecked stroke stays **neutral** for any appearance (only surface context tints it) | `Checkbox.module.css:95` `--_cb-unchecked-stroke` |
| CB-PAR-004 | `aria-invalid` (not `errorHighlight`) drives `validationResult` | `Checkbox.tsx:185` |
| CB-PAR-005 | `readOnly` stays enabled + opacity 1.0, distinct from disabled | `Checkbox.module.css:58-60,666-690` |
| CB-PAR-006 | Group value with surrounding whitespace still selects (trim is symmetric — unlike BottomNav BN-FN-002) | `one_ui_checkbox.dart:191-198` |

**Note on the disproven trim bug.** BottomNavigation had a real trim asymmetry
(BN-FN-002). The Checkbox was probed for the same pattern and is **correct**:
`_isChecked` trims `widget.value` before `group.isSelected`, and `_handleTap`
trims before `group.toggleValue`, so a padded value round-trips consistently.
GREEN — do not raise.

---

## 4. Burn-down

| Bug ID | Severity | Bucket | Repro test |
|--------|----------|--------|-----------|
| CB-A11Y-001 | High | Confirmed | `[CB-A11Y-001]` |
| CB-A11Y-001b | High | Confirmed | `[CB-A11Y-001b]` |
| CB-FN-001 | Medium | Confirmed | `[CB-FN-001]` |
| CB-A11Y-002 | Medium | Confirmed | `[CB-A11Y-002]` |
| CB-DEB-001 | Low | Debatable | `[CB-DEB-001]` |
| CB-DEB-002 | Low | Debatable | `[CB-DEB-002]` |
| CB-DEB-003 | Low | Debatable | `[CB-DEB-003]` |
| CB-PAR-001..006 | — | Parity (GREEN) | `[CB-PAR-00N]` |

**4 confirmed Flutter bugs + 3 debatable + 6 parity proofs.** Run the suite:
```bash
flutter test apps/qa-playground-flutter/test/components/checkbox/checkbox_regression_test.dart
```
`[confirmed]` and `[debatable]` groups fail (RED = open); `[parity]` and `[meta]`
pass (GREEN). Each RED turns green when the matching Flutter fix lands.
