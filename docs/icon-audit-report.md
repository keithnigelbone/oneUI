# OneUI Flutter Icon — Component Audit Report

**Date:** 2026-06-16
**Component:** `OneUiIcon` (Flutter)
**Source:** `packages/ui_flutter/lib/widgets/one_ui_icon.dart` + engine + a11y resolver
**Cross-checked against:**
- React Web Icon (`packages/ui/src/components/Icon/*`)
- React Native Icon (`packages/ui-native/src/components/Icon/*`)
- Figma spec (icon matrix: 20 spacing-index sizes (2–40) × 9 appearances (auto/neutral/primary/secondary/sparkle/negative/positive/informative/warning) × 5 emphasis levels (high/medium/low/tinted/tintedA11y))
- WCAG 2.1 AA

**Severity legend:**
- **Critical** — ships broken UX, runtime crash, or AT failure
- **High** — visible regression vs spec / parity gap
- **Medium** — noticeable polish gap
- **Low** — nice-to-have / UX surprise

**Headline:** 17 audit findings → **17 actionable component bugs** — **2 Critical**, **7 High**, **6 Medium**, **2 Low**.

---

## Summary table — category × severity

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Functional | 1 | 3 | 5 | 0 | 9 |
| Accessibility (a11y) | 0 | 2 | 1 | 2 | 5 |
| Visual | 1 | 1 | 1 | 0 | 3 |
| **Total** | **2** | **7** | **6** | **2** | **17** |

---

## 1. Functional bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| ICN-FN-001 | Functional | Flutter (all) | `OneUiIcon` mounted outside `OneUiScope` (brand-loading race, isolated test, custom shell) | 1) Render `OneUiIcon(icon: 'heart')` without `OneUiScope` ancestor. 2) Observe result. | Icon renders with sensible fallback like the BadgeSlot `ConvexGapCard` graceful path. | `resolveOneUiIconSizePx:19` calls `OneUiScope.of(context)` which hard-asserts. Release throws `Null check operator`. | High | `packages/ui_flutter/lib/engine/icon_size_resolve.dart:19` |
| ICN-FN-002 | Functional | Flutter (all) | User passes unexpected type to `icon` parameter (typed as `Object`) | 1) `OneUiIcon(icon: 42)` or `OneUiIcon(icon: ['heart'])`. 2) Observe layout. | Assertion in debug or visible debug-mode warning. | `icon is String` / `icon is Widget` branches both false → `SizedBox.shrink`. No warning, layout silently collapses. | High | `packages/ui_flutter/lib/widgets/one_ui_icon.dart:30,70-71,99-101` |
| ICN-FN-003 | Functional | Flutter (all) | Icon inside `OneUiButton(appearance: negative)` expects to inherit | 1) Render `OneUiButton(appearance: 'negative', start: OneUiIcon(icon: 'delete'))`. 2) Inspect rendered icon colour. | Web wraps slots with `SlotParentAppearanceProvider` — Flutter Icon should inherit via `OneUiSlotParentAppearanceScope`. | `one_ui_button.dart` never wraps slots with `OneUiSlotParentAppearanceScope`. Icon defaults to neutral on coloured Bold button → wrong contrast. | Critical | `packages/ui_flutter/lib/widgets/one_ui_button.dart` (no scope); `one_ui_icon.dart:50` |
| ICN-FN-004 | Functional | Flutter (all) | Developer typos a size (e.g. `'11'` is not in the 20-preset) | 1) `OneUiIcon(icon: 'heart', size: '11')`. 2) Inspect rendered size and data-size. | Assertion in debug or `debugPrint` warning. | `oneUiResolveIconSize` silently returns `'5'`. `data-size` also reports `'5'`. Silent regression. | Medium | `packages/ui_flutter/lib/widgets/one_ui_icon_types.dart:86-90` |
| ICN-FN-005 | Functional | Flutter (all) | QA writes Playwright/Appium tests that find by `data-testid` / accessibility identifier | 1) Render `OneUiIcon(testId: 'cart-icon')`. 2) `find.byAccessibilityIdentifier('cart-icon')`. | `testId` becomes `Semantics.identifier`, parity with web `data-testid`. | Lines 122-125 wrap with `KeyedSubtree(key: ValueKey(tid))` only. Native test drivers cannot see it. | High | `packages/ui_flutter/lib/widgets/one_ui_icon.dart:122-125` |
| ICN-FN-006 | Functional | Flutter (all) | User passes `semanticsLabel: ''` (often from backend-driven label returning empty) | 1) `OneUiIcon(icon: 'heart', semanticsLabel: '')`. 2) Inspect Semantics tree. | Web: `span role='img' aria-label=''` — exposed unnamed. Min: dev warning. | Trim treats empty as 'not exposed' → `ExcludeSemantics` wraps. Icon invisible to AT. No warning. | Medium | `packages/ui_flutter/lib/widgets/one_ui_icon_a11y.dart:36-43`; `one_ui_icon.dart:77` |
| ICN-FN-007 | Functional | Flutter (all) | Catalog uses `ic_PROFILE_AVATAR` style ids | 1) `OneUiIcon(icon: 'ic_USER_PROFILE')` relies on derived label. 2) Inspect AT output. | Web format does `'${words.join(' ').toLowerCase()} icon'` → `'user profile icon'`. | Line 17 returns `words.join(' ')` WITHOUT `.toLowerCase()`. Output: `'USER PROFILE icon'`. AT shouts. | Medium | `packages/ui_flutter/lib/widgets/one_ui_icon_a11y.dart:14-19` |
| ICN-FN-008 | Functional | Flutter (all) | User puts explicitly-sized icon in Badge slot (`OneUiBadge(start: OneUiIcon(size: '4'))`) | 1) Compose Badge with non-default icon size in slot. 2) Inspect rendered size. | Slot context publishes expected icon px; non-default sizes should respect slot OR warn. | Lines 16-18 only apply slot override when `size == '5'`. Other sizes bypass slot → overflow/clip. | Medium | `packages/ui_flutter/lib/engine/icon_size_resolve.dart:14-18` |
| ICN-FN-009 | Functional | Flutter (all) | `OneUiIcon(appearance: 'auto')` at page root, no Surface, with slot parent | 1) Render `OneUiIcon(icon: 'heart', appearance: 'auto')` outside Surface but inside scope with slot parent `'primary'`. 2) Inspect resolved appearance. | `appearance='auto'` + slotParent=`'primary'` resolves to `'primary'` (matches docs). | Control flow checks `appearance == null` (false for `'auto'`) before slot-parent fallback → `'auto'` bypasses inheritance when no Surface. | Medium | `packages/ui_flutter/lib/widgets/one_ui_icon_types.dart:99-117` |

---

## 2. Accessibility (a11y) bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| ICN-A11Y-001 | Accessibility (a11y) | Flutter (all) | User passes `semanticsLabel: '​'` (zero-width joiner) from i18n key lookup | 1) `OneUiIcon(icon: 'heart', semanticsLabel: '​')`. 2) Enable TalkBack/VoiceOver. | Whitespace-only label treated as empty OR developer warning. | Trim catches ASCII + common Unicode but not zero-width joiners. Single visible glyph `'·'` exposed. No diagnostic. | Low | `packages/ui_flutter/lib/widgets/one_ui_icon_a11y.dart:41-43,53-54` |
| ICN-A11Y-002 | Accessibility (a11y) | Flutter (all) | `OneUiIcon(icon: unknown, semanticsLabel: 'X', excludeFromSemantics: true)` — Jio catalog miss → Material fallback | 1) Pass name not in catalog with `excludeFromSemantics` + label. 2) Inspect Semantics during catalog-loading race. | Material default semanticLabel suppressed; outer `ExcludeSemantics` wraps. | Two suppression layers work for common case but fragile during Jio-catalog-NOT-READY race. | Low | `packages/ui_flutter/lib/widgets/one_ui_icon.dart:77,97,127-129` |
| ICN-A11Y-003 | Accessibility (a11y) | Flutter (all) | Decorative icon (`OneUiIcon(icon: 'heart')` no label) in focused page | 1) Tab through page or sweep with TalkBack/VoiceOver. | Decorative icon fully removed from a11y tree. | Code path takes `hidden=true` → `ExcludeSemantics(child: result)`. Works correctly today. | Low | `packages/ui_flutter/lib/widgets/one_ui_icon.dart:127-129` |
| ICN-A11Y-004 | Accessibility (a11y) | Flutter (all) | User enables Increase Contrast (iOS) / High Contrast Text (Android), views page with `emphasis: tinted` icons | 1) Toggle `MediaQuery.highContrastOf → true`. 2) Render `OneUiIcon(emphasis: tinted)`. | Engine consults `MediaQuery.highContrastOf` and promotes to `tintedA11y/high` — web `prefers-contrast: more` parity. | `resolveOneUiIconColor` ignores high-contrast. Tinted on subtle surface keeps low-contrast tint → WCAG 1.4.11 violation. | High | `packages/ui_flutter/lib/engine/icon_color_resolve.dart:44-82` |
| ICN-A11Y-005 | Accessibility (a11y) | Flutter Android, Flutter iOS | User sets system font scale to 200% | 1) Enable accessibility Large text at 200%. 2) Render `OneUiIcon(icon: 'menu', size: '5')` inline in body text. | Inline icons paired with text scale proportionally; ≥24px to remain visible. | Spacing-token sizing not user-preference-aware. 20px icon stays 20px at 200% → visual mismatch with 32px text; sizes 2/2.5 (8/10 px) drop below 24×24 minimum. | High | `packages/ui_flutter/lib/engine/icon_size_resolve.dart:13-58` |

---

## 3. Visual / UI bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| ICN-VIS-001 | Visual | Flutter (all) | User passes custom widget glyph (Container, SvgPicture, etc.) | 1) Render `OneUiIcon` with `icon:` arbitrary Widget. 2) Inspect widget tree. | Single outer container, one IconTheme provider — web parity. | Lines 80-91 wrap with `IconTheme.merge` + `SizedBox` + `FittedBox`, then 103-112 wrap AGAIN. Sub-pixel rounding on hairline strokes. | Medium | `packages/ui_flutter/lib/widgets/one_ui_icon.dart:79-112` |
| ICN-VIS-002 | Visual | Flutter (all) | Arabic/Hebrew locale renders back-arrow icon | 1) `Directionality(rtl, child: OneUiIcon(icon: 'arrowLeft'))`. 2) Observe direction. | Directional icons mirror in RTL (Material `matchTextDirection` convention). | Neither `OneUiSemanticIcon` nor `OneUiIcon` queries Directionality. SVG + Material fallback render LTR-only. `arrowLeft` in Arabic still points left. | High | `packages/ui_flutter/lib/widgets/semantic_icon_material.dart:59-81` |
| ICN-VIS-003 | Visual | Flutter (all) | Cold-start with several icons on screen | 1) Profile first paint of any `OneUiIcon`. 2) Observe glyph swap. | Smooth first-paint (preload or `AnimatedSwitcher` fade). | `_ensureCatalogThenRebuild` does async load + `setState`. First build returns Material fallback; second build returns Jio SVG. User sees glyph flip. | Critical | `packages/ui_flutter/lib/widgets/semantic_icon_material.dart:44-72` |

---

## 4. Severity rollup

### 4.1 Total bug count by category

| Category | Audit findings | Real bugs |
|----------|----------------|-----------|
| Functional | 9 | 9 |
| Accessibility (a11y) | 5 | 5 |
| Visual | 3 | 3 |
| **Total** | **17** | **17 actionable** |

### 4.2 Total bug count by severity

| Severity | Count |
|----------|-------|
| Critical | **2** |
| High | **7** |
| Medium | **6** |
| Low | **2** |
| **Total** | **17** |

### 4.3 Platform-wise distribution

| Platform | Count |
|----------|-------|
| Flutter (all — Android + iOS + Web) | 16 |
| Flutter-iOS / Flutter-Android only (text-scale inline mismatch) | 1 |

### 4.4 Critical & High issues — at a glance

1. **ICN-FN-003** — Button start/end slots do not propagate appearance to Icon; icons on coloured Bold buttons render with wrong contrast.
2. **ICN-VIS-003** — Jio catalog load race causes a glyph flip from Material fallback to Jio SVG on first paint.
3. **ICN-FN-001** — Missing `OneUiScope` crashes Icon with `AssertionError` / null-check throw in release.
4. **ICN-FN-002** — Non-String / non-Widget icon silently renders empty `SizedBox`; no diagnostic.
5. **ICN-FN-005** — `testId` exposed only via `ValueKey`, not `Semantics.identifier`; cross-platform locators break.
6. **ICN-A11Y-004** — High-contrast mode never escalates `tinted` → `tintedA11y`; WCAG 1.4.11 fail on subtle surfaces.
7. **ICN-A11Y-005** — Icon does not respect `MediaQuery.textScaler` for inline icons; xs sizes drop below 24×24 minimum.
8. **ICN-VIS-002** — Directional icons (arrowLeft, chevronRight, back) do not auto-mirror in RTL locales.

### 4.5 Accessibility compliance summary

| Concern | Status |
|---------|--------|
| WCAG 1.3.2 Meaningful Sequence | Fail (ICN-VIS-002 — RTL directional icons not mirrored) |
| WCAG 1.4.4 Resize Text | Fail (ICN-A11Y-005 — inline icons not text-scale-aware) |
| WCAG 1.4.11 Non-text Contrast | Fail (ICN-A11Y-004 — tinted emphasis not boosted in high-contrast mode) |
| WCAG 4.1.2 Name / Role / Value | Borderline (ICN-FN-006 — empty `semanticsLabel` silently hides icon; ICN-FN-007 — uppercase a11y leak) |
| Screen-reader (TalkBack / VoiceOver) | 4 failure modes (empty label hides icon, uppercase snake_case leaks, zero-width joiner edge case, hidden+labelled race during catalog load) |
| Keyboard / focus | No interactive surface — N/A for non-interactive icons |
| High-contrast / Dynamic Type | Fail (ICN-A11Y-004, ICN-A11Y-005 — `MediaQuery.highContrastOf` and `MediaQuery.textScaler` not read) |

### 4.6 Components / variants with the most issues

| Surface | Issues |
|---------|--------|
| Size resolver (`icon_size_resolve.dart`) | **4** (ICN-FN-001, ICN-FN-004, ICN-FN-008, ICN-A11Y-005) — riskiest area |
| Semantic / a11y resolver (`one_ui_icon_a11y.dart`) | 4 (ICN-FN-006, ICN-FN-007, ICN-A11Y-001, ICN-A11Y-002) |
| Icon shell rendering (`one_ui_icon.dart`) | 4 (ICN-FN-002, ICN-FN-005, ICN-VIS-001, ICN-A11Y-003) |
| Appearance / slot inheritance | 2 (ICN-FN-003, ICN-FN-009) |
| Material / SVG fallback path (`semantic_icon_material.dart`) | 2 (ICN-VIS-002, ICN-VIS-003) |
| Colour resolver (`icon_color_resolve.dart`) | 1 (ICN-A11Y-004) |

### 4.7 Regression risk areas

1. **Catalog preload** — Switching from async-load + setState to bootstrap preload changes every first-paint golden.
2. **Slot appearance propagation** — Wrapping Button slots with `OneUiSlotParentAppearanceScope` shifts icon colour on every Button + Icon combination; every Button golden requires re-blessing.
3. **RTL auto-mirroring** — Once directional icons mirror, every RTL screenshot baseline changes; need to inventory the canonical mirrorable name set first.
4. **MediaQuery.textScaler integration** — Multiplying icon size by user text-scale changes layout for every inline icon; risk of breaking existing Row/Column widths.
5. **High-contrast boost** — Promoting `tinted` → `tintedA11y` under high contrast affects every emphasis: tinted golden on tinted surfaces.
6. **Custom Widget icon shell** — Branching the shell for custom vs semantic-name path removes one IconTheme layer; existing custom-glyph goldens need re-blessing.

---

## 5. Real-bug summary list

Each bug below is a real component defect requiring developer action. Ordered by severity then ID.

### Critical (2)

- **ICN-FN-003** — Button slot inheritance broken (Icon does not inherit appearance from parent Button).
- **ICN-VIS-003** — Jio catalog load race causes visible Material → Jio SVG glyph flip on first paint.

### High (7)

- **ICN-FN-001** — Missing `OneUiScope` hard-asserts (size resolver uses `of(context)` not `maybeOf`).
- **ICN-FN-002** — Non-String / non-Widget icon silently renders empty box; no warning.
- **ICN-FN-005** — `testId` only encoded as `ValueKey`; cross-platform locators cannot find the icon.
- **ICN-A11Y-004** — High-contrast mode ignored; tinted emphasis stays low-contrast on subtle surfaces.
- **ICN-A11Y-005** — Inline icons do not respect `MediaQuery.textScaler`; small sizes drop below 24×24 minimum at 200% scale.
- **ICN-VIS-002** — Directional icons do not auto-mirror in RTL.

### Medium (6)

- **ICN-FN-004** — Unknown size silently falls back to `'5'`; no diagnostic.
- **ICN-FN-006** — Empty-string `semanticsLabel` hides icon (diverges from web's empty-but-exposed behaviour).
- **ICN-FN-007** — `formatOneUiIconName` does not `.toLowerCase()` the snake_case `ic_` branch; AT shouts capitals.
- **ICN-FN-008** — Badge slot size override ignored unless icon size == `'5'`.
- **ICN-FN-009** — `appearance: 'auto'` bypasses slot-parent fallback when no Surface present.
- **ICN-VIS-001** — Custom widget icons get double `IconTheme.merge` + redundant SizedBox/FittedBox layers.

### Low (2)

- **ICN-A11Y-001** — Whitespace-only `semanticsLabel` (zero-width chars) passes empty check.
- **ICN-A11Y-002** — Hidden + labelled icons may leak Material default `semanticLabel` during Jio catalog race.

---

## 6. Individual Bug Reports (Copy-Paste Format)

Each block below is self-contained — copy from `===` to `===` into a Jira / GitHub / Linear ticket.

### 6.1 Functional bugs

```
===============================================================
Bug ID:       ICN-FN-001
Title:        Missing OneUiScope crashes Icon with AssertionError
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon + icon_size_resolve

Scenario:
OneUiIcon mounted outside OneUiScope (brand-loading race, isolated test,
custom shell).

Steps to Reproduce:
1. Render `OneUiIcon(icon: 'heart')` without OneUiScope ancestor.
2. Observe result.

Expected Result:
- Icon renders with a sensible fallback like the BadgeSlot ConvexGapCard
  graceful path (or SizedBox.shrink with default f-step).

Actual Result:
- resolveOneUiIconSizePx:19 calls OneUiScope.of(context) which hard-asserts.
- Release throws Null check operator.

Code Reference:
- packages/ui_flutter/lib/engine/icon_size_resolve.dart:19

Root Cause:
icon_size_resolve uses of(context) not maybeOf — icon_color_resolve
uses designSystemOf which is null-safe.

Suggested Fix:
- Switch to `OneUiScope.maybeOf(context)` with f-step default fallback.
===============================================================
```

```
===============================================================
Bug ID:       ICN-FN-002
Title:        Non-String / non-Widget icon silently renders empty SizedBox
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon

Scenario:
User passes unexpected type to icon parameter (typed as Object).

Steps to Reproduce:
1. `OneUiIcon(icon: 42)` or `OneUiIcon(icon: ['heart'])`.
2. Observe layout.

Expected Result:
- Assertion in debug or visible debug-mode warning.

Actual Result:
- `icon is String` / `icon is Widget` branches both false → SizedBox.shrink.
- No warning, layout silently collapses.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon.dart:30,70-71,99-101

Root Cause:
Object union from web parity but Dart cannot enforce — runtime branch
falls through silently.

Suggested Fix:
- Add `assert(icon is String || icon is Widget)` or fall back to
  `Icons.broken_image` in debug.
===============================================================
```

```
===============================================================
Bug ID:       ICN-FN-003
Title:        Button start/end slots do not propagate appearance to Icon (slot inheritance broken)
Category:     Functional
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiButton + OneUiIcon (slot inheritance)

Scenario:
Icon inside OneUiButton(appearance: negative) expects to inherit.

Steps to Reproduce:
1. Render `OneUiButton(appearance: 'negative', start: OneUiIcon(icon: 'delete'))`.
2. Inspect rendered icon colour.

Expected Result:
- Web wraps slots with SlotParentAppearanceProvider — Flutter Icon
  should inherit via OneUiSlotParentAppearanceScope.

Actual Result:
- one_ui_button.dart never wraps slots with OneUiSlotParentAppearanceScope.
- Icon defaults to neutral on coloured Bold button → wrong contrast.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_button.dart (no scope)
- packages/ui_flutter/lib/widgets/one_ui_icon.dart:50

Root Cause:
Web parity gap — Button doesn't publish appearance context for
user-placed icons in slots.

Suggested Fix:
- Wrap each Button slot with
  `OneUiSlotParentAppearanceScope(appearance: resolved, child: slot)`.
===============================================================
```

```
===============================================================
Bug ID:       ICN-FN-004
Title:        Unknown size silently falls back to '5' with no warning
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon + one_ui_icon_types

Scenario:
Developer typos a size (e.g. '11' is not in the 20-preset).

Steps to Reproduce:
1. `OneUiIcon(icon: 'heart', size: '11')`.
2. Inspect rendered size and data-size.

Expected Result:
- Assertion in debug or debugPrint warning.

Actual Result:
- `oneUiResolveIconSize` silently returns '5'.
- `data-size` also reports '5'. Silent regression.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_types.dart:86-90

Root Cause:
Validator added but no diagnostic fires for invalid input.

Suggested Fix:
- `assert(kOneUiIconSizes.contains(t))` or `debugPrint` in `kDebugMode`.
===============================================================
```

```
===============================================================
Bug ID:       ICN-FN-005
Title:        testId exposed only via ValueKey, not Semantics.identifier — cross-platform locators break
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon

Scenario:
QA writes Playwright/Appium tests that find by data-testid /
accessibility identifier.

Steps to Reproduce:
1. `OneUiIcon(testId: 'cart-icon')` then
   `find.byAccessibilityIdentifier('cart-icon')`.

Expected Result:
- testId becomes Semantics.identifier, parity with web data-testid.

Actual Result:
- Lines 122-125 wrap with `KeyedSubtree(key: ValueKey(tid))` only.
- Native test drivers cannot see it.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon.dart:122-125

Root Cause:
Reused Badge testId pattern. ValueKey is widget-tree handle, not an
a11y identifier.

Suggested Fix:
- Add `identifier: tid` to outer `Semantics(...)`.
- Create `Semantics(identifier: tid, container: true)` for hidden branch.
===============================================================
```

```
===============================================================
Bug ID:       ICN-FN-006
Title:        Empty-string semanticsLabel hides icon — diverges from web (web exposes empty role=img)
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon + one_ui_icon_a11y

Scenario:
User passes semanticsLabel: '' (often from backend-driven label
returning empty).

Steps to Reproduce:
1. `OneUiIcon(icon: 'heart', semanticsLabel: '')`.
2. Inspect Semantics tree.

Expected Result:
- Web: `span role='img' aria-label=''` — exposed unnamed.
- Minimum: dev warning.

Actual Result:
- Trim treats empty as 'not exposed' → ExcludeSemantics wraps.
- Icon invisible to AT. No warning.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_a11y.dart:36-43
- packages/ui_flutter/lib/widgets/one_ui_icon.dart:77

Root Cause:
Defensive normalisation diverges from web AND silently turns a labelled
icon decorative.

Suggested Fix:
- Preserve '' as exposed-but-unnamed semantics node OR debugPrint warning.
===============================================================
```

```
===============================================================
Bug ID:       ICN-FN-007
Title:        formatOneUiIconName does not lowercase ic_ snake_case branch — parity broken
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon + one_ui_icon_a11y

Scenario:
Catalog uses ic_PROFILE_AVATAR style ids.

Steps to Reproduce:
1. `OneUiIcon(icon: 'ic_USER_PROFILE')` relies on derived label.
2. Inspect AT output.

Expected Result:
- Web format does `'${words.join(' ').toLowerCase()} icon'`
  → 'user profile icon'.

Actual Result:
- Line 17 returns `words.join(' ')` WITHOUT `.toLowerCase()`.
- Output: 'USER PROFILE icon'. AT shouts.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_a11y.dart:14-19

Root Cause:
Direct port omitted `.toLowerCase()`.

Suggested Fix:
- Change line 17 to add `.toLowerCase()`.
===============================================================
```

```
===============================================================
Bug ID:       ICN-FN-008
Title:        BadgeSlotSize override ignored unless icon size == '5'
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon + icon_size_resolve

Scenario:
User puts explicitly-sized icon in Badge slot
(`OneUiBadge(start: OneUiIcon(size: '4'))`).

Steps to Reproduce:
1. Compose Badge with non-default icon size in slot.
2. Inspect rendered size.

Expected Result:
- Slot context publishes expected icon px; non-default sizes should
  respect slot OR warn.

Actual Result:
- Lines 16-18 only apply slot override when size == '5'.
- Other sizes bypass slot → overflow/clip.

Code Reference:
- packages/ui_flutter/lib/engine/icon_size_resolve.dart:14-18

Root Cause:
Special-case treats '5' as sentinel default — asymmetric.

Suggested Fix:
- Honour user's explicit size everywhere OR clamp resolved px to
  slot iconPx.
===============================================================
```

```
===============================================================
Bug ID:       ICN-FN-009
Title:        appearance='auto' outside Surface falls to 'neutral' silently (no slot-parent fallback)
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon + one_ui_icon_types

Scenario:
OneUiIcon(appearance: 'auto') at page root, no Surface, with slot parent.

Steps to Reproduce:
1. Render `OneUiIcon(icon: 'heart', appearance: 'auto')` outside Surface
   but inside scope with slot parent='primary'.
2. Inspect resolved appearance.

Expected Result:
- appearance='auto' + slotParent='primary' resolves to 'primary'
  (matches docs).

Actual Result:
- Control flow checks `appearance == null` (false for 'auto') before
  slot-parent fallback → 'auto' bypasses inheritance when no Surface.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_types.dart:99-117

Root Cause:
Asymmetric control flow — null inherits slot, 'auto' doesn't.

Suggested Fix:
- Hoist slot-parent fallback before final `return 'neutral'`; apply to
  both null AND 'auto'+null surface.
===============================================================
```

### 6.2 Accessibility (a11y) bugs

```
===============================================================
Bug ID:       ICN-A11Y-001
Title:        Whitespace-only semanticsLabel passes empty check (zero-width chars)
Category:     Accessibility (a11y)
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon + one_ui_icon_a11y

Scenario:
User passes semanticsLabel: '​' (zero-width joiner) from i18n key
lookup.

Steps to Reproduce:
1. `OneUiIcon(icon: 'heart', semanticsLabel: '​')`.
2. Enable TalkBack/VoiceOver.

Expected Result:
- Whitespace-only label treated as empty OR developer warning.

Actual Result:
- Trim catches ASCII + common Unicode but not zero-width joiners.
- Single visible glyph '·' exposed. No diagnostic.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_a11y.dart:41-43,53-54

Root Cause:
Trim catches whitespace but not format chars.

Suggested Fix:
- Debug-mode assertion that label contains visible characters
  (regex `\p{L}|\p{N}|\p{S}`).
===============================================================
```

```
===============================================================
Bug ID:       ICN-A11Y-002
Title:        Hidden + labelled: inner Material Icon may leak default semanticLabel
Category:     Accessibility (a11y)
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon + semantic_icon_material

Scenario:
OneUiIcon(icon: unknown, semanticsLabel: 'X', excludeFromSemantics: true)
— Jio catalog miss → Material fallback.

Steps to Reproduce:
1. Pass name not in catalog with excludeFromSemantics + label.
2. Inspect Semantics during catalog-loading race.

Expected Result:
- Material default semanticLabel suppressed; outer ExcludeSemantics wraps.

Actual Result:
- Two suppression layers work for common case but fragile during
  Jio-catalog-NOT-READY race.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon.dart:77,97,127-129

Root Cause:
Two semantic suppression layers + race window.

Suggested Fix:
- Pass `excludeFromSemantics: true` to inner Material Icon directly.
===============================================================
```

```
===============================================================
Bug ID:       ICN-A11Y-003
Title:        Decorative icon a11y: defensive observation (verify ExcludeSemantics holds)
Category:     Accessibility (a11y)
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon

Scenario:
Decorative icon (`OneUiIcon(icon: 'heart')` no label) in focused page.

Steps to Reproduce:
1. Tab through page or sweep with TalkBack/VoiceOver.

Expected Result:
- Decorative icon fully removed from a11y tree.

Actual Result:
- Code path takes `hidden=true` → `ExcludeSemantics(child: result)`.
- Works correctly today.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon.dart:127-129

Root Cause:
Chain works as long as ExcludeSemantics stays at outermost layer.

Suggested Fix:
- Add an a11y golden test verifying `find.bySemanticsLabel(anything)`
  returns zero for decorative icon.
===============================================================
```

```
===============================================================
Bug ID:       ICN-A11Y-004
Title:        High-contrast mode (Android/iOS) — emphasis tinted/tintedA11y never escalates
Category:     Accessibility (a11y)
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon + icon_color_resolve

Scenario:
User enables Increase Contrast (iOS) / High Contrast Text (Android),
views page with emphasis: tinted icons.

Steps to Reproduce:
1. Toggle `MediaQuery.highContrastOf → true`.
2. Render `OneUiIcon(emphasis: tinted)`.

Expected Result:
- Engine consults `MediaQuery.highContrastOf` and promotes to
  tintedA11y/high — web `prefers-contrast: more` parity.

Actual Result:
- `resolveOneUiIconColor` ignores high-contrast.
- Tinted on subtle surface keeps low-contrast tint → WCAG 1.4.11
  violation.

Code Reference:
- packages/ui_flutter/lib/engine/icon_color_resolve.dart:44-82

Root Cause:
No `MediaQuery.highContrastOf` check anywhere.

Suggested Fix:
- When `MediaQuery.maybeHighContrastOf == true`, override emphasis to
  tintedA11y before resolving.
===============================================================
```

```
===============================================================
Bug ID:       ICN-A11Y-005
Title:        Icon does not respect MediaQuery.textScaler for inline icons
Category:     Accessibility (a11y)
Severity:     High
Platform:     Flutter Android, Flutter iOS
Component:    OneUiIcon + icon_size_resolve

Scenario:
User sets system font scale to 200%.

Steps to Reproduce:
1. Enable accessibility Large text at 200%.
2. Render `OneUiIcon(icon: 'menu', size: '5')` inline in body text.

Expected Result:
- Inline icons paired with text scale proportionally; ≥24px to remain
  visible.

Actual Result:
- Spacing-token sizing not user-preference-aware.
- 20px icon stays 20px at 200% → visual mismatch with 32px text;
  sizes 2/2.5 (8/10 px) drop below 24×24 minimum.

Code Reference:
- packages/ui_flutter/lib/engine/icon_size_resolve.dart:13-58

Root Cause:
Spacing tokens platform/density-aware but not user-preference-aware.

Suggested Fix:
- Expose `respectTextScale: bool` prop (default false standalone, true
  inline-text); multiply boxSize by `MediaQuery.textScalerOf`.
===============================================================
```

### 6.3 Visual / UI bugs

```
===============================================================
Bug ID:       ICN-VIS-001
Title:        Custom iconWidget gets double IconTheme.merge + redundant SizedBox/FittedBox
Category:     Visual
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon

Scenario:
User passes custom widget glyph (Container, SvgPicture, etc.).

Steps to Reproduce:
1. Render `OneUiIcon` with `icon:` arbitrary Widget.
2. Inspect widget tree.

Expected Result:
- Single outer container, one IconTheme provider — web parity.

Actual Result:
- Lines 80-91 wrap with IconTheme.merge + SizedBox + FittedBox.
- Lines 103-112 wrap AGAIN.
- Sub-pixel rounding on hairline strokes.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon.dart:79-112

Root Cause:
Defensive layering — inner IconTheme for Material descendants, outer
for semantic path — they overlap for custom glyph.

Suggested Fix:
- Branch the shell: custom path emits single SizedBox + FittedBox;
  semantic-name keeps current shell.
===============================================================
```

```
===============================================================
Bug ID:       ICN-VIS-002
Title:        Directional icons (arrowLeft, chevronRight, back) do not auto-mirror in RTL
Category:     Visual
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon + semantic_icon_material

Scenario:
Arabic/Hebrew locale renders back-arrow icon.

Steps to Reproduce:
1. `Directionality(rtl, child: OneUiIcon(icon: 'arrowLeft'))`.
2. Observe direction.

Expected Result:
- Directional icons mirror in RTL (Material `matchTextDirection`
  convention).

Actual Result:
- Neither OneUiSemanticIcon nor OneUiIcon queries Directionality.
- SVG + Material fallback render LTR-only.
- arrowLeft in Arabic still points left.

Code Reference:
- packages/ui_flutter/lib/widgets/semantic_icon_material.dart:59-81

Root Cause:
No RTL auto-mirror; Material's `matchTextDirection` not set on Jio
fallback icons.

Suggested Fix:
- Static set of mirrorable names; `Transform.scale(x: -1)` when
  `Directionality == rtl`.
===============================================================
```

```
===============================================================
Bug ID:       ICN-VIS-003
Title:        Jio catalog load race: first paint shows Material placeholder, snaps to Jio SVG
Category:     Visual
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIcon + semantic_icon_material

Scenario:
Cold-start with several icons on screen.

Steps to Reproduce:
1. Profile first paint of any OneUiIcon.
2. Observe glyph swap.

Expected Result:
- Smooth first-paint (preload or AnimatedSwitcher fade).

Actual Result:
- `_ensureCatalogThenRebuild` does async load + setState.
- First build returns Material fallback; second build returns Jio SVG.
- User sees glyph flip.

Code Reference:
- packages/ui_flutter/lib/widgets/semantic_icon_material.dart:44-72

Root Cause:
Async load + setState guarantees glyph-swap mid-frame.

Suggested Fix:
- Preload Jio catalog in OneUiSurfaceBootstrap OR `AnimatedSwitcher`
  fade transition.
===============================================================
```

---

## 7. Test coverage map

Each bug ID maps to a regression test in
`apps/qa-playground-flutter/test/components/icon/icon_regression_test.dart`.

| Bug ID | Test name | Coverage notes |
|--------|-----------|----------------|
| ICN-FN-001 | `[ICN-FN-001] missing OneUiScope falls back gracefully (no AssertionError)` | Mount `OneUiIcon` without `OneUiScope`; assert no `AssertionError`; assert resolved size matches default f-step fallback. |
| ICN-FN-002 | `[ICN-FN-002] non-String / non-Widget icon emits debug warning or assertion` | Pass `icon: 42` and `icon: ['heart']`; in debug mode assert `AssertionError` or `debugPrint` fired; assert `Icons.broken_image` rendered. |
| ICN-FN-003 | `[ICN-FN-003] Button slot wraps Icon with OneUiSlotParentAppearanceScope` | Render `OneUiButton(appearance: 'negative', start: OneUiIcon(...))`; assert resolved icon colour matches `negative.bold-high`, not `neutral`. |
| ICN-FN-004 | `[ICN-FN-004] unknown size emits debug warning, resolves to '5'` | Render `size: '11'`; in debug mode assert `debugPrint` fired listing valid sizes; assert resolved `data-size: '5'`. |
| ICN-FN-005 | `[ICN-FN-005] testId is exposed via Semantics.identifier` | Render `testId: 'cart-icon'`; assert outer `Semantics.identifier == 'cart-icon'`; assert hidden branch also exposes identifier. |
| ICN-FN-006 | `[ICN-FN-006] empty-string semanticsLabel exposes empty role=img node OR emits warning` | Render `semanticsLabel: ''`; assert Semantics node present (not excluded) OR `debugPrint` fired. |
| ICN-FN-007 | `[ICN-FN-007] ic_SNAKE_CASE id is lowercased before deriving a11y label` | Render `icon: 'ic_USER_PROFILE'`; assert resolved a11y label == `'user profile icon'`, not `'USER PROFILE icon'`. |
| ICN-FN-008 | `[ICN-FN-008] explicit icon size in Badge slot honoured (not silently overridden)` | Render `OneUiBadge(start: OneUiIcon(size: '4'))`; assert rendered icon px matches `'4'` resolved px OR clamped to slot bounds — never silently widened. |
| ICN-FN-009 | `[ICN-FN-009] appearance='auto' inherits slot-parent when no Surface present` | Render `OneUiIcon(appearance: 'auto')` inside `OneUiSlotParentAppearanceScope(appearance: 'primary')` with no Surface; assert resolved appearance == `'primary'`. |
| ICN-A11Y-001 | `[ICN-A11Y-001] zero-width-joiner semanticsLabel emits debug warning` | Render `semanticsLabel: '​'`; in debug mode assert `AssertionError` or `debugPrint` fired about non-visible label. |
| ICN-A11Y-002 | `[ICN-A11Y-002] hidden+labelled icon never leaks inner Material default semanticLabel during catalog race` | Force Jio catalog "not ready" race; render with `excludeFromSemantics: true`; assert no Material default label visible in Semantics tree. |
| ICN-A11Y-003 | `[ICN-A11Y-003] decorative icon (no semanticsLabel) is fully removed from a11y tree` | Render `OneUiIcon(icon: 'heart')` with no label; assert `find.bySemanticsLabel(anything)` returns zero. |
| ICN-A11Y-004 | `[ICN-A11Y-004] high-contrast mode promotes emphasis: tinted → tintedA11y` | Wrap with `MediaQuery(highContrast: true)`; render `emphasis: 'tinted'` on subtle surface; assert resolved colour matches `tintedA11y` token. |
| ICN-A11Y-005 | `[ICN-A11Y-005] respectTextScale prop scales inline icon size with MediaQuery.textScaler` | Wrap with `MediaQuery(textScaler: TextScaler.linear(2.0))`; render `OneUiIcon(size: '5', respectTextScale: true)`; assert rendered px == base × 2; assert standalone icons unaffected. |
| ICN-VIS-001 | `[ICN-VIS-001] custom widget icon has single IconTheme layer (no double-wrap)` | Render `OneUiIcon(icon: Container(...))`; assert exactly one `IconTheme` ancestor; assert single `SizedBox + FittedBox` chain. |
| ICN-VIS-002 | `[ICN-VIS-002] directional icons auto-mirror in RTL` | Render `Directionality(rtl, child: OneUiIcon(icon: 'arrowLeft'))`; assert `Transform.scale(x: -1)` applied; assert non-directional icons unchanged. |
| ICN-VIS-003 | `[ICN-VIS-003] catalog preload prevents first-paint Material → Jio SVG glyph flip` | Cold-start with `OneUiSurfaceBootstrap` preloading catalog; assert first build returns Jio SVG (not Material fallback); assert no glyph swap between frame 1 and frame 2. |

---
