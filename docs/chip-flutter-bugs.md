# Chip — Flutter Component Bugs (QA → Dev)

> **Owner:** `@oneui/ui_flutter` (Flutter component team)
> **Raised by:** QA / Testing team — 2026-06-18
> **Source component:** `packages/ui_flutter/lib/widgets/one_ui_chip.dart`,
> `one_ui_chip_types.dart`, `one_ui_chip_a11y.dart`,
> `lib/engine/chip_color_resolve.dart`, `chip_size_resolve.dart`
> **Full audit (with attribution + parity cross-check):** [`chip-audit-report.md`](chip-audit-report.md)
> **Repro:** `flutter test apps/qa-playground-flutter/test/components/chip/chip_regression_test.dart --name "<CHP-ID>"`

Every item was reproduced against the real widget (synthetic measurement
harness — offline) and cross-checked against the canonical web component
(`packages/ui/src/components/Chip/`) before filing. Each ticket cites the exact
source line and a deterministic failing test.

> **Out of scope for this list (do NOT raise against Flutter):** `CHP-PAR-001`
> … `CHP-PAR-004` are **parity proofs** — Flutter already matches the web
> contract (Space/Enter keyboard activation, auto→secondary, attention→variant,
> disabled blocks activation). They pass GREEN and must NOT be filed as bugs.
> In particular, Chip — unlike Checkbox — is fully keyboard-operable.

---

## 🔴 Confirmed bugs

### CHP-FN-001 — `testId` is a dead prop (never reaches `Semantics.identifier` or a key)

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Platform** | Flutter (all) |
| **Component** | `OneUiChip` (`testId` / `testID`) |

**Description**
`testId` is accepted by the constructor and stored on the widget, but it is
**never used in `build()`** — it is wired to neither `Semantics(identifier:)`
NOR a `KeyedSubtree`/`ValueKey`. So external drivers (Patrol / Maestro / Appium)
and the platform AT tree cannot locate the chip, and even an in-process
`find.byKey()` fails. This is worse than the Checkbox gap (`CB-FN-001`), where
`testId` at least produced an in-process key. Web emits `data-testid` on the
root toggle button (`Chip.tsx`), which Playwright reads.

**Steps to reproduce:** `OneUiChip(child: 'QA', testId: 'qa-chip')`; read the
chip's `SemanticsData.identifier` and `find.byKey(const ValueKey('qa-chip'))`.
**Expected result:** identifier == `'qa-chip'`.
**Actual result:** identifier == `''` AND `find.byKey(ValueKey('qa-chip'))` ==
0 matches (probed).

**RCA**
```dart
// one_ui_chip.dart:48-53 (constructor)  → stored at :70
String? testId,
...
testId = testId ?? testID;
final String? testId;        // <-- never referenced again
// one_ui_chip.dart:335-351 (build) — Semantics has NO identifier:
return Semantics(
  button: true, selected: ..., enabled: ..., label: ..., hint: ...,
  // no identifier: widget.testId
  ...
```

**How to fix**
Set `identifier: widget.testId` on the root `Semantics` node (and/or wrap the
chrome in a `KeyedSubtree(key: ValueKey(testId))` for in-process parity with
Checkbox). Trim/guard empty as the Checkbox fix does.

**Reference:** `one_ui_chip.dart:48-53, 70, 335-351`
**Repro test:** `--name "[CHP-FN-001]"`

---

## 🟡 Debatable / hardening (raise only if the team wants the improvement)

### CHP-DEB-001 — Mobile touch target below 44px

| Field | Value |
|-------|-------|
| **Severity** | Low (WCAG 2.5.5) |
| **Platform** | Flutter Android / iOS |
| **Component** | `OneUiChip` (hit area) |

**Description**
The chip chrome height equals the `--Chip-height-*` token (s=24 / m=28 / l=32),
with no touch hit padding — a `size=m` chip is 28px tall on mobile (probed
android chrome height = 28). WCAG 2.5.5 / platform HIG recommend ≥44px on touch.
Web ships the same compact chip, so this is platform-min hardening, not a clear
shipped defect.

**Expected result:** ≥44px tappable area on mobile.
**Actual result:** 28px (size m).

**RCA**
`one_ui_chip.dart:293-295` sizes the chrome `SizedBox` to `layout.height` with no
min-target expansion on touch platforms.

**How to fix**
Add touch-only hit-test padding (expand the gesture area, keep the painted
chrome) — same fix shape as Checkbox `CB-DEB-002`.

**Reference:** `one_ui_chip.dart:293-295`, `chip_size_resolve.dart`
**Repro test:** `--name "[CHP-DEB-001]"`

---

### CHP-DEB-002 — Unknown `appearance` silently falls back (no debug assert)

| Field | Value |
|-------|-------|
| **Severity** | Low (hardening) |
| **Platform** | Flutter (all) |
| **Component** | `resolveOneUiChipState` / `OneUiChip` (`appearance`) |

**Description**
`appearance` is a `typedef String`; an unknown role (e.g. `'destructive'`) passes
through `normalizeAppearanceRoleKey` unchanged, role tokens miss, and the colour
resolver silently falls back (probed: no `FlutterError`). Web blocks this at
compile time via the TypeScript union.

**Expected result:** A `kDebugMode` assertion for an unknown role.
**Actual result:** Silent pass-through + colour fallback.

**RCA**
`one_ui_chip_types.dart` `resolveOneUiChipState` normalises any non-`auto`
appearance without validating it against the known role set.

**How to fix**
Add a `kDebugMode` `assert` against `kOneUiChipAppearances`, or model appearance
as an enum — same fix as Checkbox `CB-DEB-003`.

**Reference:** `one_ui_chip_types.dart` (`resolveOneUiChipState`)
**Repro test:** `--name "[CHP-DEB-002]"`

---

## Summary

| Bug ID | Severity | Bucket | Repro test name |
|--------|----------|--------|-----------------|
| CHP-FN-001 | Medium | Confirmed | `[CHP-FN-001]` |
| CHP-DEB-001 | Low | Debatable / target | `[CHP-DEB-001]` |
| CHP-DEB-002 | Low | Debatable / hardening | `[CHP-DEB-002]` |

**1 confirmed Flutter component bug + 2 debatable.** Run all at once:
```bash
flutter test apps/qa-playground-flutter/test/components/chip/chip_regression_test.dart
```
The `[confirmed]` and `[debatable]` groups fail (RED = open bug); the `[parity]`
and `[meta]` groups pass (GREEN = Flutter is correct, incl. keyboard activation).
