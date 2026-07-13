# OneUI Flutter Chip — Component Audit Report

**Date:** 2026-06-18
**Component:** `OneUiChip` (Flutter)
**Source:**
- `packages/ui_flutter/lib/widgets/one_ui_chip.dart`
- `packages/ui_flutter/lib/widgets/one_ui_chip_types.dart`
- `packages/ui_flutter/lib/widgets/one_ui_chip_a11y.dart`
- `packages/ui_flutter/lib/widgets/one_ui_chip_group_scope.dart`
- `packages/ui_flutter/lib/engine/chip_color_resolve.dart`
- `packages/ui_flutter/lib/engine/chip_size_resolve.dart`
- `packages/ui_flutter/lib/engine/chip_slot_kind.dart`
- `packages/ui_flutter/lib/widgets/one_ui_focus_interactive.dart` (shared focus/keyboard)

**Cross-checked against:**
- React Web `packages/ui/src/components/Chip/` (Chip.tsx, Chip.module.css, Chip.shared.ts)
- Figma spec — **Chip** (`size: S|M|L` × `selected` × `attention: high|medium|low`
  × `appearance` (auto/neutral/primary/secondary/negative/positive/informative/warning)
  × `disabled` × `start`/`end` slots: none/icon/Avatar/CounterBadge/IndicatorBadge)
- WCAG 2.1 AA (2.1.1 keyboard, 2.5.5 target size, 4.1.2 name/role/value)
- Direct test runs of `apps/qa-playground-flutter/test/components/chip/*`

**Severity legend:** Critical / High / Medium / Low (see Checkbox audit).

**Headline:** **1 confirmed Flutter component bug**, **2 debatable
hardening/parity-leaning gaps**, and **5 parity proofs** (Flutter already matches
the web contract — GREEN, not bugs). Notably, Chip is **fully keyboard-operable**
(Space + Enter), unlike Checkbox — a suspected gap that was **disproven** by
probing and is documented as a parity proof.

| Bucket | Count | IDs |
|--------|-------|-----|
| Confirmed Flutter component bug | 1 | CHP-FN-001 (testId dead — no identifier, no key) |
| Debatable hardening / parity-leaning | 2 | CHP-DEB-001 (44px touch target), CHP-DEB-002 (invalid appearance assert) |
| Parity proof — Flutter is correct (GREEN) | 5 | CHP-PAR-001 (Space), CHP-PAR-001b (Enter), CHP-PAR-002 (auto→secondary), CHP-PAR-003 (attention→variant), CHP-PAR-004 (disabled) |

---

## 0. Methodology (no false confidence)

Every finding was **reproduced against the real widget with a throwaway probe
before any assertion was written** — no speculative RED tests. Probes ran on both
the synthetic measurement DS (offline) and, where palette colours mattered, the
real Jio fixture. Captured probe results:

| Finding | Probe result | Attribution |
|---------|--------------|-------------|
| Chrome height | s=24 m=28 l=32 px (synthetic DS) | correct (`--Chip-height-*`) |
| Disabled opacity | `Opacity 0.38` | correct (`--Disabled-Opacity`) |
| Enabled opacity | `Opacity 1.0` | correct |
| Selected vs unselected fill | distinct (bold dark vs subtle light) | correct |
| `appearance:auto` resolved role | `secondary` | **PARITY** CHP-PAR-002 |
| `attention` high/medium/low → variant | bold / subtle / ghost | **PARITY** CHP-PAR-003 |
| Toggle semantics | `button:true, hasSelectedState, isSelected` | correct (selected toggle) |
| `semanticsHint` | surfaces to `SemanticsData.hint` | correct |
| `ariaLabel` | becomes accessible name | correct |
| Keyboard Space (linux, autofocus) | toggles selected (true) | **PARITY** CHP-PAR-001 |
| Keyboard Enter (linux, autofocus) | toggles selected | **PARITY** CHP-PAR-001b |
| Disabled tap / keyboard | no `onSelectedChange`; `isEnabled=false` | **PARITY** CHP-PAR-004 |
| `testId` | `identifier=""` AND `find.byKey` 0 matches | **BUG** CHP-FN-001 |
| Invalid `appearance:'destructive'` | no `FlutterError` (silent fallback) | **DEBATABLE** CHP-DEB-002 |
| Mobile touch target (m, android) | chrome height 28px (< 44) | **DEBATABLE** CHP-DEB-001 |
| Group toggle via `value` | tap adds/removes from selection set | correct |

The focus ring is drawn by `OneUiFocusInteractive` (the wrapper), **not** on the
chip's inner `AnimatedContainer` — so `boxShadow` on the inner decoration is
`null` even when focused. Tests therefore assert focusability + keyboard
activation rather than a shadow-count on the wrong widget (avoiding false
confidence).

---

## 1. Confirmed Flutter component bug

### CHP-FN-001 — `testId` is a dead prop (Medium)
Stored on the widget (`one_ui_chip.dart:70`) but never referenced in `build()`:
neither `Semantics(identifier:)` nor a `KeyedSubtree` key. External automation and
the AT tree cannot locate the chip; even in-process `find.byKey` fails. Worse than
Checkbox `CB-FN-001` (which kept the key). Web emits `data-testid`.
**Fix:** set `identifier: widget.testId` on the root `Semantics` (+ optional
`KeyedSubtree`). See [`chip-flutter-bugs.md`](chip-flutter-bugs.md).

---

## 2. Debatable / hardening (web shares the gap → design call)

### CHP-DEB-001 — Mobile touch target below 44px (Low)
`size=m` chrome is 28px tall; no touch hit-padding. WCAG 2.5.5 / HIG want ≥44px.
Web ships the same compact chip → platform-min hardening.

### CHP-DEB-002 — Unknown `appearance` silently falls back (Low)
`appearance` is `typedef String`; an unknown role normalises through and the
colour resolver falls back silently (no debug assert). Web enforces the union at
compile time. Add a `kDebugMode` assert against `kOneUiChipAppearances`.

---

## 3. Parity proofs (Flutter is correct — GREEN, do not file)

| ID | Contract | Proof |
|----|----------|-------|
| CHP-PAR-001 | Space activates the focused chip | `OneUiFocusInteractive` Shortcuts → ActivateIntent; probed toggle on Space |
| CHP-PAR-001b | Enter activates the focused chip | probed toggle on Enter |
| CHP-PAR-002 | `appearance=auto` → secondary | `resolveOneUiChipState(appearance:'auto').resolvedAppearance == 'secondary'` (Chip.shared.ts) |
| CHP-PAR-003 | attention high/medium/low → bold/subtle/ghost variant | `kChipAttentionToVariant` resolver |
| CHP-PAR-004 | disabled blocks tap + keyboard, reports `isEnabled=false` | probed no `onSelectedChange`, `canRequestFocus:false` |

A suspected "Chip not keyboard-operable" gap (by analogy to Checkbox
`CB-A11Y-001`) was **disproven**: Chip uses `OneUiFocusInteractive`, which wires
Space/Enter, whereas Checkbox uses a bare `Focus` node with no key handler.

---

## 4. Test coverage produced

| Suite | File | Result |
|-------|------|--------|
| Functional | `chip_functional_test.dart` | GREEN (offline) |
| A11y | `chip_a11y_test.dart` | GREEN (offline) |
| Figma parity | `chip_figma_parity_test.dart` | 93 GREEN (offline) |
| Platform | `chip_platform_test.dart` | 16 GREEN (offline) |
| Story catalog | `chip_story_catalog_test.dart` | GREEN (offline) |
| Regression | `chip_regression_test.dart` | 9 RED (1 confirmed + 2 debatable × platforms) / 8 GREEN (parity + meta) by design |
| Goldens | `chip_golden_test.dart` (+ `_dark`, `_surface`) | 40 baselines (Jio fixture — needs network) |
| E2E | `integration_test/chip_e2e_test.dart` | on-device |

Functional / a11y / figma / platform / regression / story-catalog run on the
**synthetic measurement harness** and require no network. Goldens use the real
Jio Convex fixture (production token resolution).

---

## 5. Blank-page fix (separate from component bugs)

The qa-playground **Chip detail page rendered blank**. Root cause: the *Interactive*
scenario band rendered `ChipDefaultStoryPage` (which uses `Expanded`) directly
inside the unbounded scenarios scroll view → "RenderFlex children have non-zero
flex but incoming height constraints are unbounded" → the layout-assertion cascade
propagated up to the scroll viewport and blanked the whole page. Fixed in
`apps/qa-playground-flutter/lib/showcases/qa_component_scenarios.dart` by routing
the Interactive band through `QaStoryCanvas` (bounded height) — the same wrapper
the Default band and the Avatar page use. Verified: all chip + chip-group
scenario/figma bands render with 0 errors. This is a **playground wiring bug**,
not an `OneUiChip` component bug.
