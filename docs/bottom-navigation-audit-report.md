# OneUI Flutter BottomNavigation — Component Audit Report

**Date:** 2026-06-17
**Component:** `OneUiBottomNavigation` + `OneUiBottomNavItem` (Flutter)
**Source:**
- `packages/ui_flutter/lib/widgets/one_ui_bottom_navigation.dart`
- `packages/ui_flutter/lib/widgets/one_ui_bottom_nav_item.dart`
- `packages/ui_flutter/lib/widgets/one_ui_bottom_navigation_types.dart`
- `packages/ui_flutter/lib/widgets/one_ui_bottom_navigation_a11y.dart`
- `packages/ui_flutter/lib/widgets/one_ui_bottom_nav_item_a11y.dart`
- `packages/ui_flutter/lib/engine/bottom_navigation_size_resolve.dart`
- `packages/ui_flutter/lib/engine/bottom_navigation_color_resolve.dart`

**Cross-checked against:**
- React Web `BottomNavigation.tsx` / `BottomNavItem.tsx`
- RN peer + `BottomNavigation.shared.ts`
- Figma spec — **BottomNav** (`items: 2|3|4|5` × `label: 1Line|2Line|none`) and
  **BottomNav.Item** (`active: true|false` × `type: label1Line|label2Line|labelFalse`)
- Jio brand Convex snapshot (`apps/qa-playground-flutter/assets/qa-fixtures/jio/theme-snapshot.json`)
- WCAG 2.1 AA
- Direct test runs of `apps/qa-playground-flutter/test/components/bottom_navigation/*`
  and `integration_test/bottom_navigation_e2e_test.dart`

**Severity legend:**
- **Critical** — ships broken UX, runtime crash, or AT failure
- **High** — visible regression vs spec / parity gap
- **Medium** — noticeable polish gap
- **Low** — nice-to-have / UX surprise

**Headline (revised after web-parity cross-check):** **2 confirmed Flutter
component bugs**, **3 debatable hardening/a11y gaps**, and **2 findings that are
NOT Flutter bugs** — they are a **foundation token-naming mismatch** that
affects web and Flutter equally.

> **Important attribution correction.** The first draft of this audit blamed the
> Flutter size/typography resolver for ignoring brand tokens. Cross-checking the
> canonical web CSS (`BottomNavigation.module.css`) proved the opposite: the
> Flutter resolver reads the **same** `--BottomNavItem-*` token names as web
> (verified — injecting `--BottomNavItem-height-1line: 100px` renders 100px).
> The brand bootstrap `packages/ui/cdn-bootstrap/jio.ts:9804-9817` emits a
> **different** prefix (`--BottomNavigation-item*`) that **neither** platform
> consumes, so brand item-height/icon-size customisation is dead on **web AND
> Flutter**. That is a foundation/token-emission bug, not a Flutter component
> defect — see §3.

| Bucket | Count | IDs |
|--------|-------|-----|
| Confirmed Flutter component bug | 2 | BN-VIS-003 (label typography parity), BN-FN-002 (value-trim asymmetry) |
| Debatable hardening / a11y (parity-aligned) | 3 | BN-FN-001, BN-A11Y-001, BN-A11Y-002 |
| Foundation token mismatch (NOT Flutter; web too) | 2 | BN-VIS-001, BN-VIS-002 |

---

## 0. Methodology (no false confidence)

Every finding below was **reproduced against the real widget before it was
written as a test** — there are no speculative RED tests. Reproduction probes:

| Finding | Probe result | Attribution |
|---------|--------------|-------------|
| BN-VIS-001 | canonical `--BottomNavItem-height-1line: 100px` → renders **100px** ✅; brand `--BottomNavigation-itemHeight: 100px` → renders 64px (ignored) | **Foundation** (jio.ts wrong prefix). Flutter correct. |
| BN-VIS-002 | canonical `--BottomNavItem-iconSize: 28px` → renders 28×28 box ✅; brand `--BottomNavigation-itemIconSize` → ignored | **Foundation**. Flutter correct. |
| BN-VIS-003 | **canonical** `--BottomNavItem-labelFontSize: 29px` → renders **12px** (ignored even though web CSS:160 honours it) | **Flutter bug** — label typography hard-coded. |
| BN-FN-002 | `value:' home '` + parent `'home'` → tab never `isSelected`, yet tap emits trimmed `'home'`. Web trims neither. | **Flutter bug** — trim asymmetry. |
| BN-A11Y-001 | two icon-only tabs, no name → both announce generic `"Tab"` (component debug-warns) | Debatable; parity-aligned. |
| BN-A11Y-002 | item `accessibilityHint:'   '` → resolver returns raw `'   '` (container resolver trims). Widget layer normalises to `''`, so no user symptom. | Debatable; internal only. |
| BN-FN-001 | `appearance:'destructive'` → no debug assertion (web blocks via TypeScript) | Debatable; hardening. |

The corresponding RED tests live in
`apps/qa-playground-flutter/test/components/bottom_navigation/bottom_navigation_regression_test.dart`.

---

## 1. Functional bugs

| Bug ID | Category | Platform | Scenario | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-----------------|---------------|----------|-----------|
| BN-FN-001 | Functional | Flutter (all) | Invalid `appearance` string (`'destructive'`) | Unknown appearance asserts in debug (caller typo surfaced) | `resolveOneUiBottomNavigationAppearance` returns the string verbatim; role tokens miss; colour resolver silently falls back. No warning. | Medium | `one_ui_bottom_navigation_types.dart:78-91`; `bottom_navigation_color_resolve.dart` |
| BN-FN-002 | Functional | Flutter (all) | Item `value` has surrounding whitespace (`' home '`) | Active resolution should trim consistently — a padded value still lights up as selected when it matches | `_handlePress` trims before `onValueChange` (emits `'home'`), but `resolveOneUiBottomNavItemActive` compares `parentValue == value` WITHOUT trimming → the tab can never show `isSelected` in controlled mode. Asymmetric trim. | Medium | `one_ui_bottom_nav_item.dart:88-91`; `one_ui_bottom_navigation_types.dart:94-106` |

> **Not a bug (web parity, documented):** rendering **> 5 items** emits only a
> `kDebugMode` warning and renders all children — this matches web, which also
> renders all and warns. `clampOneUiBottomNavChildren` exists but is
> intentionally unused. Kept as a parity note, not a defect.

---

## 2. Accessibility (a11y) bugs

| Bug ID | Category | Platform | Scenario | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-----------------|---------------|----------|-----------|
| BN-A11Y-001 | Accessibility | Flutter (all) | Multiple icon-only tabs (`label: none`) with no `semanticsLabel`/`label`/`value` | Each tab must have a unique, meaningful accessible name — or a debug assertion | All such tabs fall back to the generic `"Tab"` (`kOneUiBottomNavIconOnlyFallbackLabel`). A screen-reader user hears `"Tab, Tab"` — indistinguishable. Only a `kDebugMode` `debugPrint`; ships ambiguous in release. | High | `one_ui_bottom_nav_item_a11y.dart:20-42`; `one_ui_bottom_nav_item.dart:128-142` |
| BN-A11Y-002 | Accessibility | Flutter (all) | Item `accessibilityHint`/`semanticsHint` is whitespace-only (`'   '`) | `resolveOneUiBottomNavItemSemantics` normalises a whitespace hint to null (as the container resolver does) | The item resolver forwards `semanticsHint ?? accessibilityHint` raw — a public-API contract mismatch with `resolveOneUiBottomNavigationSemantics`, which trims. **Resolver-only**: Flutter's Semantics layer happens to normalise the rendered widget hint to `''`, so this is a latent inconsistency (verified — no widget-level symptom today), not a shipped AT defect. RED test is the pure resolver assertion. | Medium | `one_ui_bottom_nav_item_a11y.dart:83-89` vs `one_ui_bottom_navigation_a11y.dart:21-26` |

> **Verified correct (not bugs):** nav landmark label resolution + hint trim;
> tab `isButton` + `isSelected` (aria-current parity); disabled clears
> `isEnabled`; `href` exposes `isLink` + `linkUrl`, dropped when disabled;
> inner icon + label are `ExcludeSemantics` (no double announce); Space/Enter
> keyboard activation. All covered green in `bottom_navigation_a11y_test.dart`.

---

## 3. Visual / token bugs

### 3a. Confirmed Flutter component bug

| Bug ID | Category | Platform | Scenario | Expected | Actual | Severity | Reference |
|--------|----------|----------|----------|----------|--------|----------|-----------|
| BN-VIS-003 | Visual / parity | Flutter (all) | Brand/component sets `--BottomNavItem-labelFontSize` / `-labelFontWeight` / `-labelLineHeight` (the **canonical** names the web CSS reads) | Label typography follows those tokens, like web (`BottomNavigation.module.css:160-162`) | Flutter ignores all three — the label style is hard-wired to `typo.emphasisStyle('label','XS','medium')`. Verified: canonical `--BottomNavItem-labelFontSize: 29px` renders 12px. Genuine Flutter-vs-web parity gap. | Medium | `bottom_navigation_size_resolve.dart:120-121` |

### 3b. NOT a Flutter bug — foundation token-naming mismatch (affects web too)

The brand bootstrap emits `--BottomNavigation-item*`, but **both** the web CSS
and the Flutter resolver read `--BottomNavItem-*` (note the missing/extra `-item`
segment). So these brand values are dead on **both** platforms:

```
jio.ts emits                          web CSS + Flutter read           result
--BottomNavigation-itemHeight-1line   --BottomNavItem-height-1line     brand value ignored → --Spacing-16 (64px) on web AND Flutter
--BottomNavigation-itemIconSize       --BottomNavItem-iconSize         brand value ignored → --Spacing-5 (20px) on both
```

| Bug ID | Category | Platform | Finding | Fix location | Severity |
|--------|----------|----------|---------|--------------|----------|
| BN-VIS-001 | Token naming | web + Flutter | `--BottomNavigation-itemHeight*` is never consumed (both platforms read `--BottomNavItem-height-*`). Flutter **correctly** honours the canonical token — proven GREEN in `[parity]`. | `packages/ui/cdn-bootstrap/jio.ts:9809-9812` (+ token generator) — emit `--BottomNavItem-*` | High |
| BN-VIS-002 | Token naming | web + Flutter | `--BottomNavigation-itemIconSize` is never consumed (both read `--BottomNavItem-iconSize`). Flutter correct (GREEN). | `jio.ts:9808` | Medium |

> These two are **not** Flutter component defects — the QA `[parity]` tests prove
> the Flutter resolver consumes the canonical `--BottomNavItem-*` names exactly
> like web. They are flagged here so the foundation/token-emission owner fixes
> the prefix once for both platforms.

---

## 4. Summary

### 4.1 Attribution (revised)

| Bucket | Count | IDs | Where the fix lives |
|--------|-------|-----|---------------------|
| **Confirmed Flutter component bug** | 2 | BN-VIS-003, BN-FN-002 | `packages/ui_flutter/lib/.../bottom_navigation*` |
| **Debatable hardening / a11y** (parity-aligned) | 3 | BN-FN-001, BN-A11Y-001, BN-A11Y-002 | Flutter (design call) |
| **Foundation token mismatch** (NOT Flutter; web too) | 2 | BN-VIS-001, BN-VIS-002 | `packages/ui/cdn-bootstrap/jio.ts` + token generator |

The regression suite reflects this exactly: **`+7 -13`** — `[parity]` BN-VIS-001/002
are GREEN (Flutter is correct), `[confirmed]` + `[debatable]` are RED.

### 4.2 Root cause — token prefix divergence

The brand foundation publishes `--BottomNavigation-item{Height,IconSize}` while
**both** platforms' components read `--BottomNavItem-{height,iconSize}`. The
single highest-leverage fix is in the **token layer** (`jio.ts` / generator):
rename the emitted keys to `--BottomNavItem-*`. Separately, the Flutter label
style (BN-VIS-003) must route through `--BottomNavItem-labelFontSize/Weight/LineHeight`
to reach web parity.

### 4.3 What is correct (high-confidence green coverage)

- Items 2–5 render equal-width tabs (`Expanded` flex:1); >5 renders all (web parity).
- `label` none/1line/2line + Figma aliases (`1Line`/`2Line`/`label1Line`/`label2Line`/`labelFalse`) normalise correctly.
- Active resolution: explicit `active` wins, value/`defaultValue` match, controlled stickiness, uncontrolled tap.
- Active-icon swap, divider show/hide, callback ordering (`onClick`/`onTap`/`onPressed` → `onValueChange`), disabled gating.
- Nav landmark + tab semantics, selected/disabled/link flags, icon-only humanised names, keyboard activation, ≥44px touch target.

---

## 5. Driving the bug count to zero

1. **Flutter bugs (BN-VIS-003, BN-FN-002):** fix in
   `packages/ui_flutter/lib/widgets/one_ui_bottom_nav_item.dart` /
   `lib/engine/bottom_navigation_size_resolve.dart`. The `[confirmed]` RED test
   turns green.
2. **Foundation mismatch (BN-VIS-001/002):** fix in
   `packages/ui/cdn-bootstrap/jio.ts` + the token generator (emit `--BottomNavItem-*`).
   This is a cross-platform fix; the Flutter `[parity]` tests already pass.
3. **Debatable (BN-FN-001, BN-A11Y-001/002):** a design call — close as
   "won't fix" (parity-aligned with web) or harden the resolver/validation.
4. Re-run `flutter test apps/qa-playground-flutter/test/components/bottom_navigation/bottom_navigation_regression_test.dart`.
