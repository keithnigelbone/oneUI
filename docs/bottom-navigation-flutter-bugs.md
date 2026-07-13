# BottomNavigation — Flutter Component Bugs (QA → Dev)

> **Owner:** `@oneui/ui_flutter` (Flutter component team)
> **Raised by:** QA / Testing team — 2026-06-17
> **Source component:** `packages/ui_flutter/lib/widgets/one_ui_bottom_navigation.dart`,
> `one_ui_bottom_nav_item.dart`, `one_ui_bottom_nav_item_a11y.dart`,
> `lib/engine/bottom_navigation_size_resolve.dart`
> **Full audit (with attribution + parity cross-check):** [`bottom-navigation-audit-report.md`](bottom-navigation-audit-report.md)
> **Repro:** `flutter test apps/qa-playground-flutter/test/components/bottom_navigation/bottom_navigation_regression_test.dart --name "<BN-ID>"`

Every item was reproduced against the real widget and cross-checked against the
canonical web component before filing. Each ticket cites the exact source line
and a deterministic failing test.

> **Out of scope for this list (do NOT raise against Flutter):** `BN-VIS-001`
> and `BN-VIS-002` (brand item-height / icon-size tokens not applied) are
> **brand-token naming mismatches in `packages/ui/cdn-bootstrap/jio.ts`** that
> affect web and Flutter identically. The Flutter component already consumes the
> correct `--BottomNavItem-*` token names (proven by the green `[parity]` tests),
> so those go to the **tokens / foundation** team, not here.

---

## 🔴 Confirmed bugs

### BN-VIS-003 — Bottom-nav label ignores label typography tokens

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Platform** | Flutter (Android / iOS / Web) |
| **Component** | `OneUiBottomNavItem` (label rendering) |

**Description**
The bottom-navigation item label does not respect the component's label
typography tokens. On web, the label font size / weight / line-height are driven
by `--BottomNavItem-labelFontSize`, `--BottomNavItem-labelFontWeight`, and
`--BottomNavItem-labelLineHeight` (with `Label-XS` fallbacks). The Flutter
implementation ignores all three and always renders a fixed `Label-XS / medium`
style. Any brand- or component-level override of the bottom-nav label typography
therefore has **zero effect** on Flutter, and the label can visually diverge
from the web rendering.

**Scenario:** Brand or component customises bottom-nav label typography.

**Steps to reproduce**
1. Render a labelled `OneUiBottomNavigation`.
2. Provide a design system that sets `--BottomNavItem-labelFontSize: 29px`.

**Expected result:** Label renders at 29px (matches web `BottomNavigation.module.css:160-162`).
**Actual result:** Label renders at 12px / weight 400 — the token is never read.

**RCA**
The label style is hard-coded in the layout resolver and never reads the label tokens:
```dart
// packages/ui_flutter/lib/engine/bottom_navigation_size_resolve.dart:120-121
final labelStyle = typo?.emphasisStyle('label', 'XS', emphasis: 'medium') ??
    const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, height: 1);
```

**How to fix**
Resolve `--BottomNavItem-labelFontSize` / `-labelFontWeight` / `-labelLineHeight`
through the existing `px()` / `ds.resolveCSSValue` cascade and apply them as
`fontSize` / `fontWeight` / `height` overrides on `labelStyle`, keeping
`emphasisStyle('label','XS','medium')` as the fallback — i.e. mirror the web
fallback chain `var(--BottomNavItem-labelFontSize, var(--Label-XS-FontSize))`.

**Reference:** `bottom_navigation_size_resolve.dart:120-121`
**Repro test:** `--name "[BN-VIS-003]"`

---

### BN-FN-002 — Padded item `value` never resolves as selected (trim asymmetry)

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Platform** | Flutter (Android / iOS / Web) |
| **Component** | `OneUiBottomNavItem` (selection / value handling) |

**Description**
When an item's `value` contains leading/trailing whitespace, the bottom nav
behaves inconsistently. On press, the item **trims** its value before notifying
the parent (`onValueChange` receives the trimmed value), but the "is this item
selected?" check compares the parent's current value against the item's **raw,
untrimmed** value. The two never match, so the tab fires a selection change yet
never visually becomes active. Web trims neither side, so values stay consistent
there. Impact: in controlled mode a padded-value tab lands in a confusing dead
state (emits change, never highlights). Edge case, but a Flutter-specific
internal-contract inconsistency.

**Scenario:** Item `value` has surrounding whitespace, controlled mode.

**Steps to reproduce**
1. `OneUiBottomNavigation(value:'home', children:[OneUiBottomNavItem(value:' home ', label:'Home', …)])`.
2. Observe the selected state, then tap the tab.

**Expected result:** Trimming is symmetric (or absent, like web) so the matching tab shows `isSelected: true`.
**Actual result:** Tab never selected, yet tap emits `onValueChange('home')`.

**RCA**
Trim is applied on emit but not on active-match:
```dart
// one_ui_bottom_nav_item.dart:88-91  → trims before onValueChange
final itemValue = widget.value?.trim();
// one_ui_bottom_navigation_types.dart:94-106
// resolveOneUiBottomNavItemActive compares parentValue == value UNTRIMMED
```

**How to fix**
Make trimming consistent. Preferred (web parity): remove the `.trim()` in
`_handlePress` and use `widget.value` directly. Alternative: trim both `value`
and `parentValue` inside `resolveOneUiBottomNavItemActive`.

**Reference:** `one_ui_bottom_nav_item.dart:88-91` + `one_ui_bottom_navigation_types.dart:94-106`
**Repro test:** `--name "[BN-FN-002]"`

---

## 🟡 Debatable / hardening (raise only if the team wants the improvement)

### BN-FN-001 — No validation of unknown `appearance`

| Field | Value |
|-------|-------|
| **Severity** | Low (hardening) |
| **Platform** | Flutter (all) |
| **Component** | `OneUiBottomNavigation` (appearance resolution) |

**Description**
`appearance` accepts any string at runtime with no validation. On web this is a
TypeScript union, so an invalid role is caught at compile time. In Flutter
`appearance` is a plain `String`; an unknown role (e.g. `'destructive'`) passes
straight through, the role tokens fail to resolve, and the colour engine
silently falls back — with no debug warning. Impact: developer typos ship as
silently mis-coloured nav bars instead of being flagged. Robustness gap, not a
functional regression.

**Steps to reproduce:** `OneUiBottomNavigation(appearance:'destructive', …)`.
**Expected result:** A debug assertion/warning for an unknown role.
**Actual result:** Silent pass-through and colour fallback.

**RCA**
`resolveOneUiBottomNavigationAppearance` returns any non-`auto` string unchanged;
the appearance type is `typedef String` with no guard
(`one_ui_bottom_navigation_types.dart:78-91`).

**How to fix**
Add a `kDebugMode` `assert` against the known role set
(`primary/secondary/neutral/sparkle/positive/negative/warning/informative/brand-bg/auto`)
in the resolver, or model appearance as an enum.

**Reference:** `one_ui_bottom_navigation_types.dart:78-91`
**Repro test:** `--name "[BN-FN-001]"`

---

### BN-A11Y-001 — Nameless icon-only tabs all announce "Tab"

| Field | Value |
|-------|-------|
| **Severity** | Low (a11y) |
| **Platform** | Flutter (all) |
| **Component** | `OneUiBottomNavItem` (accessible name) |

**Description**
When `labelType` is `'none'` (icon-only) and an item provides no
`semanticsLabel`, `label`, or `value`, the accessible name falls back to the
generic string `"Tab"`. If several such items exist, every one announces
`"Tab"`, so a screen-reader user can't distinguish them. The component prints a
debug-mode warning but still ships ambiguous names in release. Note this
fallback is shared with web, so it's an a11y improvement rather than a
Flutter-specific regression.

**Steps to reproduce:** `labelType:'none'` with two `OneUiBottomNavItem(icon: …)` and no names.
**Expected result:** Each tab has a unique accessible name (or a hard assertion in debug).
**Actual result:** All nameless tabs announce `"Tab"`.

**RCA**
`resolveOneUiBottomNavItemAccessibilityLabel` ends its fallback chain at the
constant `kOneUiBottomNavIconOnlyFallbackLabel = 'Tab'`
(`one_ui_bottom_nav_item_a11y.dart:20-42`).

**How to fix**
Promote the existing debug warning to an `assert`, or require
`semanticsLabel`/`value` when `labelType:'none'`. (Or close as won't-fix + add a
usage-doc note, since it matches web.)

**Reference:** `one_ui_bottom_nav_item_a11y.dart:20-42`
**Repro test:** `--name "[BN-A11Y-001]"`

---

### BN-A11Y-002 — Item hint resolver doesn't trim whitespace (internal only)

| Field | Value |
|-------|-------|
| **Severity** | Trivial (internal consistency) |
| **Platform** | Flutter (all) |
| **Component** | `resolveOneUiBottomNavItemSemantics` |

**Description**
The per-item accessibility resolver forwards the hint string as-is, including
whitespace-only values, whereas the container-level resolver trims and nulls
empty hints. In practice the Flutter Semantics layer normalises a
whitespace-only hint to empty before it reaches assistive tech, so there is **no
user-facing symptom** today — this is purely an inconsistency between the two
resolvers' contracts. Worth aligning for predictability if the resolver is
reused.

**Steps to reproduce:** `OneUiBottomNavItem(…, accessibilityHint:'   ')`; inspect the resolver output.
**Expected result:** Resolver returns `null` for a whitespace-only hint (like the container resolver).
**Actual result:** Resolver returns `'   '` (the widget layer happens to normalise it later).

**RCA**
`resolveOneUiBottomNavItemSemantics` forwards
`hint: semanticsHint ?? accessibilityHint` raw
(`one_ui_bottom_nav_item_a11y.dart:85`); the container resolver trims +
null-checks (`one_ui_bottom_navigation_a11y.dart:21-26`).

**How to fix**
Mirror the container logic — `trim()` and return `null` when empty.

**Reference:** `one_ui_bottom_nav_item_a11y.dart:85` vs `one_ui_bottom_navigation_a11y.dart:21-26`
**Repro test:** `--name "[BN-A11Y-002]"`

---

## Summary

| Bug ID | Severity | Bucket | Repro test name |
|--------|----------|--------|-----------------|
| BN-VIS-003 | Medium | Confirmed | `[BN-VIS-003]` |
| BN-FN-002 | Low | Confirmed | `[BN-FN-002]` |
| BN-FN-001 | Low | Debatable / hardening | `[BN-FN-001]` |
| BN-A11Y-001 | Low | Debatable / a11y | `[BN-A11Y-001]` |
| BN-A11Y-002 | Trivial | Debatable / internal | `[BN-A11Y-002]` |

**2 confirmed Flutter component bugs + 3 debatable.** Run all five at once:
```bash
flutter test apps/qa-playground-flutter/test/components/bottom_navigation/bottom_navigation_regression_test.dart
```
The `[confirmed]` and `[debatable]` groups fail (RED = open bug); the `[parity]`
group passes (GREEN = Flutter is correct, token mismatch is a foundation issue).
