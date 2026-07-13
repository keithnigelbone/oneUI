# OneUI Flutter ChipGroup — Component Audit Report

**Date:** 2026-06-18
**Component:** `OneUiChipGroup` (Flutter)
**Source:**
- `packages/ui_flutter/lib/widgets/one_ui_chip_group.dart`
- `packages/ui_flutter/lib/widgets/one_ui_chip_group_types.dart`
- `packages/ui_flutter/lib/widgets/one_ui_chip_group_a11y.dart`
- `packages/ui_flutter/lib/widgets/one_ui_chip_group_focus.dart`
- `packages/ui_flutter/lib/widgets/one_ui_chip_group_scope.dart`

**Cross-checked against:**
- React Web `packages/ui/src/components/ChipGroup/` (ChipGroup.tsx, ChipGroup.shared.ts)
- Figma spec — **ChipGroup** (`size: S|M|L` × `wrap: true|false` → `containerType: wrap|inline`)
- WCAG 2.1 AA (2.1.1 keyboard / roving focus, 4.1.2 name/role/value)
- Direct test runs of `apps/qa-playground-flutter/test/components/chip_group/*`

**Headline:** **1 confirmed Flutter component bug**, **1 debatable hardening
gap**, and **5 parity proofs** (Flutter already matches the web contract — GREEN,
not bugs). ChipGroup is in good shape: the selection engine, roving arrow-key
focus, disabled propagation, size propagation, and containerType layouts are all
correct.

| Bucket | Count | IDs |
|--------|-------|-----|
| Confirmed Flutter component bug | 1 | CHG-FN-001 (testId dead) |
| Debatable hardening / parity-leaning | 1 | CHG-DEB-001 (invalid appearance assert) |
| Parity proof — Flutter is correct (GREEN) | 5 | CHG-PAR-001 (selection engine), CHG-PAR-002 (roving focus), CHG-PAR-003 (disabled), CHG-PAR-004 (size propagation), CHG-PAR-005 (containerType layout) |

---

## 0. Methodology (no false confidence)

Reproduced against the real widget with a throwaway probe before any assertion.
Captured probe results:

| Finding | Probe result | Attribution |
|---------|--------------|-------------|
| Layout — default | `Wrap` | correct (wrap) |
| Layout — `wrap:false` | `SingleChildScrollView` + `Row` | correct (inline) |
| Layout — `orientation:vertical` | `Column` | correct |
| Labelled group | 1 container `Semantics` node | correct (chips are the controls) |
| `testId` | `identifier=""` AND `find.byKey` 0 matches | **BUG** CHG-FN-001 |
| `computeNextChipGroupValues` | single/multi/required/max all correct | **PARITY** CHG-PAR-001 |
| disabled | child tap → no `onValueChange` | **PARITY** CHG-PAR-003 |
| single-select tap | swaps selection (`['a']`→`['b']`) | correct |
| multi-select tap | adds/removes correctly | correct |
| `size:l` / `size:s` | child chrome 32px / 24px | **PARITY** CHG-PAR-004 |
| Arrow-key focus (linux) | focus A → ArrowRight → focus B | **PARITY** CHG-PAR-002 |
| Invalid `appearance` forwarded | no `FlutterError` (silent fallback) | **DEBATABLE** CHG-DEB-001 |

---

## 1. Confirmed Flutter component bug

### CHG-FN-001 — `testId` is a dead prop (Medium)
Stored on the widget but never wired in `build()` (the group `Semantics(identifier:)`
is set only for `labelledBy`). No identifier, no key → ungettable by automation
or AT. Web emits `data-testid`. See [`chip-group-flutter-bugs.md`](chip-group-flutter-bugs.md).

---

## 2. Debatable / hardening

### CHG-DEB-001 — Unknown `appearance` silently forwarded (Low)
`appearance` flows to every child chip; an unknown role normalises away and the
colour resolver falls back silently (no debug assert). Web enforces the union at
compile time. Add a `kDebugMode` assert.

The 28px mobile touch target also applies, but it is a child-`OneUiChip` property
tracked once as `CHP-DEB-001`.

---

## 3. Parity proofs (Flutter is correct — GREEN, do not file)

| ID | Contract | Proof |
|----|----------|-------|
| CHG-PAR-001 | selection engine (single / multi / required / maxSelections) | `computeNextChipGroupValues` unit-verified |
| CHG-PAR-002 | roving arrow-key focus | probed A → ArrowRight → B |
| CHG-PAR-003 | disabled group blocks all children | probed no `onValueChange` |
| CHG-PAR-004 | group size propagates to child chips | probed s=24 / l=32 child chrome |
| CHG-PAR-005 | containerType wrap→`Wrap`, inline→horizontal scroll | layout widgets verified |

---

## 4. Test coverage produced

| Suite | File | Result |
|-------|------|--------|
| Functional | `chip_group_functional_test.dart` | GREEN (offline) |
| A11y | `chip_group_a11y_test.dart` | GREEN (offline) |
| Figma parity | `chip_group_figma_parity_test.dart` | GREEN (offline) |
| Platform | `chip_group_platform_test.dart` | GREEN (offline) |
| Story catalog | `chip_group_story_catalog_test.dart` | GREEN (offline) |
| Regression | `chip_group_regression_test.dart` | 6 RED (1 confirmed + 1 debatable × platforms) / 12 GREEN (parity + meta) by design |
| Goldens | `chip_group_golden_test.dart` (+ `_dark`, `_surface`) | 14 baselines (Jio fixture — needs network) |
| E2E | `integration_test/chip_group_e2e_test.dart` | on-device |

Offline suites use the synthetic measurement harness; goldens use the real Jio
Convex fixture (production token resolution).
