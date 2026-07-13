# ChipGroup — Flutter Component Bugs (QA → Dev)

> **Owner:** `@oneui/ui_flutter` (Flutter component team)
> **Raised by:** QA / Testing team — 2026-06-18
> **Source component:** `packages/ui_flutter/lib/widgets/one_ui_chip_group.dart`,
> `one_ui_chip_group_types.dart`, `one_ui_chip_group_a11y.dart`,
> `one_ui_chip_group_focus.dart`, `one_ui_chip_group_scope.dart`
> **Full audit:** [`chip-group-audit-report.md`](chip-group-audit-report.md)
> **Repro:** `flutter test apps/qa-playground-flutter/test/components/chip_group/chip_group_regression_test.dart --name "<CHG-ID>"`

Every item was reproduced against the real widget (synthetic measurement harness
— offline) and cross-checked against the canonical web component
(`packages/ui/src/components/ChipGroup/`) before filing.

> **Out of scope (do NOT raise against Flutter):** `CHG-PAR-001` … `CHG-PAR-005`
> are **parity proofs** — Flutter already matches the web contract (selection
> engine, roving arrow-key focus, disabled propagation, size propagation,
> containerType layout). They pass GREEN and must NOT be filed as bugs.

---

## 🔴 Confirmed bugs

### CHG-FN-001 — `testId` is a dead prop (never reaches `Semantics.identifier` or a key)

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Platform** | Flutter (all) |
| **Component** | `OneUiChipGroup` (`testId` / `testID`) |

**Description**
`testId` is accepted and stored on the widget but is **never used in `build()`**.
The group's `Semantics(identifier:)` is only set for `semanticsLabelledBy` /
`ariaLabelledBy`; `testId` is wired to neither `identifier` nor a `KeyedSubtree`.
External automation (Patrol / Maestro / Appium), the platform AT tree, and even
in-process `find.byKey()` cannot locate the group. Web emits `data-testid` on the
root element. Same class as `CHP-FN-001` and Checkbox `CB-FN-001`.

**Steps to reproduce:** `OneUiChipGroup(testId: 'qa-group', ariaLabel: 'Filters', children: [...])`;
read the group `SemanticsData.identifier` and `find.byKey(ValueKey('qa-group'))`.
**Expected result:** identifier == `'qa-group'`.
**Actual result:** identifier == `''` AND `find.byKey` == 0 matches (probed).

**RCA**
```dart
// one_ui_chip_group.dart:39-41 (constructor) → stored at :67
String? testId,
}) : testId = testId ?? testID;
final String? testId;     // <-- never referenced in build()
// build(): Semantics(identifier:) is set ONLY for labelledBy (lines 214-224):
identifier: labelledById != null && labelledById.isNotEmpty ? labelledById : null,
```

**How to fix**
Set `identifier: widget.testId` on the group `Semantics` node when present (fall
back to `labelledById`), and/or wrap the root in `KeyedSubtree(key: ValueKey(testId))`.

**Reference:** `one_ui_chip_group.dart:39-41, 67, 212-225`
**Repro test:** `--name "[CHG-FN-001]"`

---

## 🟡 Debatable / hardening (raise only if the team wants the improvement)

### CHG-DEB-001 — Unknown `appearance` silently forwarded to children (no debug assert)

| Field | Value |
|-------|-------|
| **Severity** | Low (hardening) |
| **Platform** | Flutter (all) |
| **Component** | `OneUiChipGroup` (`appearance`) → child `OneUiChip` |

**Description**
`appearance` is a `String` forwarded to every child chip via group defaults. An
unknown role (e.g. `'destructive'`) is normalised away and the child colour
resolver silently falls back (probed: no `FlutterError`). Web blocks this at
compile time via the TypeScript union. Same class as `CHP-DEB-002`.

**Expected result:** A `kDebugMode` assertion for an unknown role.
**Actual result:** Silent pass-through + colour fallback on every child.

**How to fix**
Validate `appearance` against `kOneUiChipAppearances` in `kDebugMode` (group
and/or chip), or model appearance as an enum.

**Reference:** `one_ui_chip_group.dart` (defaults forwarding), `one_ui_chip_types.dart`
**Repro test:** `--name "[CHG-DEB-001]"`

> **Note:** the 28px mobile touch target affects ChipGroup too, but it is a
> property of the child `OneUiChip` — tracked once as `CHP-DEB-001`. Fixing the
> chip fixes the group.

---

## Summary

| Bug ID | Severity | Bucket | Repro test name |
|--------|----------|--------|-----------------|
| CHG-FN-001 | Medium | Confirmed | `[CHG-FN-001]` |
| CHG-DEB-001 | Low | Debatable / hardening | `[CHG-DEB-001]` |

**1 confirmed Flutter component bug + 1 debatable.** Run all at once:
```bash
flutter test apps/qa-playground-flutter/test/components/chip_group/chip_group_regression_test.dart
```
The `[confirmed]` and `[debatable]` groups fail (RED = open bug); the `[parity]`
and `[meta]` groups pass (GREEN = Flutter is correct).
