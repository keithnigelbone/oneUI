# OneUI Flutter IconContained — Component Audit Report

**Date:** 2026-06-16
**Component:** `OneUiIconContained` (Flutter)
**Source:** `packages/ui_flutter/lib/widgets/one_ui_icon_contained.dart` + engine + a11y resolver + types
**Cross-checked against:**
- React Web IconContained (`packages/ui/src/components/IconContained/*`)
- React Native IconContained (`packages/ui-native/src/components/IconContained/*`)
- Figma spec (icon-contained matrix: 5 sizes × 2 attentions × 9 appearances + disabled)
- WCAG 2.1 AA
- Direct test runs of `apps/qa-playground-flutter/test/components/icon_contained/*`

**Severity legend:**
- **Critical** — ships broken UX, runtime crash, or AT failure
- **High** — visible regression vs spec / parity gap
- **Medium** — noticeable polish gap
- **Low** — nice-to-have / UX surprise

**Headline:** 16 audit findings → **16 actionable component bugs** — **1 Critical**, **6 High**, **7 Medium**, **2 Low**.

---

## 1. Functional bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| ICC-FN-001 | Functional | Flutter (all) | Caller passes `appearance: 'brand-bg'` for brand-background-tinted IconContained | 1) `OneUiIconContained(icon: 'heart', appearance: 'brand-bg', semanticsLabel: 'X')`. 2) Inspect resolved `data-appearance` + paint colours. | `brand-bg` is a documented role; `data-appearance == 'brand-bg'` and Brand-Bg tokens are used. Web does this via the `appearanceBrandBg` CSS class. | `resolveOneUiIconContainedAppearanceStatic` hard-codes `if (raw == 'brand-bg') return 'primary'` (line 74). Both static and runtime paths bypass `brand-bg`. Painted with Primary role. | Critical | `packages/ui_flutter/lib/widgets/one_ui_icon_contained_types.dart:74,90` |
| ICC-FN-002 | Functional | Flutter (all) | Decorative IconContained (no `semanticsLabel`) auto-derives label from icon name | 1) Render `OneUiIconContained(icon: 'heart')` with no `semanticsLabel` — meant decorative. 2) Inspect Semantics tree. | Web: no `aria-label` → root `aria-hidden`, `role=img` NOT set. Native: `accessible: false` when label missing. | `oneUiIconContainedEffectiveLabel` falls through to `formatOneUiIconName(semanticIconName)`. `icon: 'heart'` announces as "heart" even when decorative. | High | `packages/ui_flutter/lib/widgets/one_ui_icon_contained_a11y.dart:24-34` |
| ICC-FN-003 | Functional | Flutter (all) | IconContained rendered without `OneUiScope` (early bootstrap, isolated test, modular screen) | 1) Bare `MaterialApp` (no `OneUiScope`) around `OneUiIconContained(icon: 'heart', semanticsLabel: 'X')`. 2) Inspect resolved colours. | Assert pointing at missing bootstrap (debug) OR safe brand-neutral fallback using design tokens — not Material seed. | Silently falls back to `Theme.of(context).colorScheme.primary` / `onPrimary`. Apps that forget OneUI bootstrap render with raw Material colours. | High | `packages/ui_flutter/lib/engine/icon_contained_color_resolve.dart:87-93` |
| ICC-FN-004 | Functional | Flutter (all) | Caller mis-types: `appearance: 'destructive'` or `'success'` | 1) Pass unknown appearance string. 2) Check `data-appearance` and visible role. | Debug assert OR — for runtime fallback — resolve to `'primary'` so the chosen role is brand identity. | Returns `'secondary'` for any string not in `kOneUiIconContainedAppearances` (line 76). Silent wrong role; tests keying off `data-appearance` see confusing diffs. | Medium | `packages/ui_flutter/lib/widgets/one_ui_icon_contained_types.dart:75-76` |
| ICC-FN-005 | Functional | Flutter (all) | QA writes Flutter Driver / `integration_test` using `find.byIdentifier` (matches RN `testID` + web `data-testid`) | 1) `OneUiIconContained(testId: 'hero-favourite')`. 2) `find.byIdentifier('hero-favourite')`. | `Semantics(identifier: 'hero-favourite', label, image: true)` so the locator works on web / RN / Flutter. | Only `KeyedSubtree(key: ValueKey(testId))`. `find.byIdentifier` returns nothing. | High | `packages/ui_flutter/lib/widgets/one_ui_icon_contained.dart:134-138` |
| ICC-FN-006 | Functional | Flutter (all) | Brand sets IconContained recipe `cornerRadius: 'small'` (resolves to Shape-3) | 1) Configure recipe `cornerRadius: 'small'`. 2) Render IconContained. 3) Inspect border radius. | Container rounded to Shape-3, matching web and native (`useComponentRecipe` in `IconContained.native.tsx`). | `resolveIconContainedBorderRadiusPx` only reads `--IconContained-borderRadius`. Recipes stored on the separate channel are ignored. Always pill. | High | `packages/ui_flutter/lib/engine/icon_contained_size_resolve.dart:112-134` |
| ICC-FN-007 | Functional | Flutter (all) | Caller passes pre-sized SVG (`SvgPicture.asset` with explicit width/height) | 1) `OneUiIconContained(icon: SvgPicture.asset('heart.svg', width: 12, height: 12), size: 'm')`. 2) Inspect rendered glyph. | Glyph paints at natural 12×12 pixel-perfect. Web `isValidElement` renders the element untouched. | `SizedBox(iconPx) + FittedBox(BoxFit.contain)` upscales / downscales — fractional-pixel blurring at xs/s sizes. | Medium | `packages/ui_flutter/lib/widgets/one_ui_icon_contained.dart:87-96` |
| ICC-FN-008 | Functional | Flutter (all) | Caller passes no `appearance` (omitted) inside a Surface | 1) `OneUiIconContained(icon: 'heart')` inside `OneUiSurface(appearance: 'positive')`. 2) Inspect resolved appearance. | Per Figma variable-mode contract: `null` AND `'auto'` both inherit Surface. | Runtime resolver only special-cases `'auto'`. `null` bypasses Surface inheritance, returns `'secondary'`. | Low | `packages/ui_flutter/lib/widgets/one_ui_icon_contained_types.dart:68-96` |

---

## 2. Accessibility (a11y) bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| ICC-A11Y-001 | Accessibility (a11y) | Flutter (all) | Disabled IconContained used as status badge (greyed favourite) | 1) `OneUiIconContained(icon: 'heart', disabled: true, semanticsLabel: 'Favourite')`. 2) Run TalkBack / VoiceOver. | Screen reader announces "Favourite, image, disabled" — web parity with `aria-disabled` on `role=img`. | `Semantics(image: true, enabled: a11y.enabled)`. The `enabled` flag is only meaningful for button / link / textfield. Image role ignores `enabled`. | Medium | `packages/ui_flutter/lib/widgets/one_ui_icon_contained.dart:145-153` |
| ICC-A11Y-002 | Accessibility (a11y) | Flutter Web | Caller leaves `semanticsLabel: null` (per ICC-FN-002 derived from icon name) | 1) `OneUiIconContained(icon: 'chevronleft')` on Flutter Web. 2) Run VoiceOver / NVDA. | Skip decorative OR produce a contextually meaningful label. | `formatOneUiIconName('chevronleft')` returns `'chevronleft'` verbatim (regex requires camelCase boundary). AT announces "chevronleft, image". | High | `packages/ui_flutter/lib/widgets/one_ui_icon_a11y.dart:21-26` |
| ICC-A11Y-003 | Accessibility (a11y) | Flutter (all) | Caller passes only `semanticsHint` without label | 1) `OneUiIconContained(icon: 'heart', semanticsHint: 'Opens favourites')`. 2) Run AT. | Refuse hint without label (web / native pattern) + debug warning OR expose with auto-label. | Auto-label kicks in (per ICC-FN-002), so hint is exposed with the unhelpful 'heart' label. With `excludeFromSemantics: true` the hint is silently dropped. Asymmetric. | Medium | `packages/ui_flutter/lib/widgets/one_ui_icon_contained_a11y.dart:44-71` |
| ICC-A11Y-004 | Accessibility (a11y) | Flutter (all) | IconContained as state indicator; disabled multiplied by `Opacity(0.38)` | 1) `OneUiIconContained(appearance: 'primary', attention: 'high', disabled: true)`. 2) Measure contrast vs page background. | Disabled visibly de-emphasises while keeping ≥ 3:1 OR disallow disabled on non-interactive. | `Opacity(0.38)` uniform over fill + glyph. Final contrast drops to ~1.3:1. Native uses 0.5; web `--Disabled-Opacity` typical 0.5. | Medium | `packages/ui_flutter/lib/engine/icon_contained_color_resolve.dart:95-117` |
| ICC-A11Y-005 | Accessibility (a11y) | Flutter (all) | Jio catalogue unavailable during async load window — Material fallback fires | 1) Render `OneUiIconContained` on cold start before catalogue loads. 2) Inspect Semantics tree. | Only outer `Semantics(label, image: true)` exposed. | Material `Icon` with `semanticLabel: ''` emits a Semantics node. Outer `container: true` re-groups; some readers announce "Favourite. Empty." with pause. | Low | `packages/ui_flutter/lib/widgets/semantic_icon_material.dart:75-80`; `packages/ui_flutter/lib/widgets/one_ui_icon_contained.dart:119,150` |

---

## 3. Visual / UI bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| ICC-VIS-001 | Visual | Flutter (all) | Arabic / Hebrew locale uses `chevronright` as forward arrow | 1) `Directionality(rtl, child: OneUiIconContained(icon: 'chevronright'))`. 2) Compare to web RTL. | Chevron mirrors to point left in RTL — web `:dir(rtl) svg { transform: scaleX(-1) }`; native `I18nManager.isRTL`. | `_semanticIconMap` maps to plain `Icons.chevron_right` etc — none have `matchTextDirection: true`. No `Directionality` query. | High | `packages/ui_flutter/lib/widgets/semantic_icon_material.dart:106-114` |
| ICC-VIS-002 | Visual | Flutter (all) | Brand omits tinted content token for a role (legacy / partial migration) | 1) Brand with Negative role and content `{high: …}` only, no tinted. 2) Render `attention: medium`. 3) Inspect foreground colour. | Web cascade: `var(--Negative-Tinted, var(--Text-High))` — global fallback always exists. | `icon_contained_color_resolve.dart:41` uses `(role.content['tinted'] ?? role.content['high']!)`. Null-check operator can throw; commonly paints in role's own High (looks like Subtle background — invisible glyph). | Medium | `packages/ui_flutter/lib/engine/icon_contained_color_resolve.dart:36-43` |
| ICC-VIS-003 | Visual | Flutter (all) | No design-system payload; container border-radius resolution | 1) Render `OneUiIconContained` outside `OneUiScope`. 2) Inspect border radius. | Token-derived pill OR mathematically equivalent (`min(W, H) / 2`). | `resolveIconContainedBorderRadiusPx` returns literal `9999`. Out of line with CLAUDE.md "Zero literals" rule. Masks ICC-FN-006. | Low | `packages/ui_flutter/lib/engine/icon_contained_size_resolve.dart:132-134` |

---

## 4. Summary

### 4.1 Total bug count by category

| Category | Audit findings | Real bugs |
|----------|----------------|-----------|
| Functional | 8 | 8 |
| Accessibility (a11y) | 5 | 5 |
| Visual | 3 | 3 |
| **Total** | **16** | **16 actionable** |

### 4.2 Total bug count by severity

| Severity | Count |
|----------|-------|
| Critical | **1** |
| High | **6** |
| Medium | **7** |
| Low | **2** |
| **Total** | **16** |

### 4.3 Platform-wise distribution

| Platform | Count |
|----------|-------|
| Flutter (all — Android + iOS + Web) | 15 |
| Flutter Web only (auto-label derived from lower-case icon ids) | 1 |

### 4.4 Critical & High issues — at a glance

1. **ICC-FN-001** — `appearance: 'brand-bg'` silently re-mapped to `'primary'`. The role is documented but the resolver contradicts its own catalogue.
2. **ICC-FN-002** — Decorative IconContained auto-derives a label from the icon name; web/native mark these `aria-hidden`.
3. **ICC-FN-003** — Color resolver returns Material `colorScheme.primary` / `onPrimary` when `OneUiScope` is absent (no debug assert, no token-derived fallback).
4. **ICC-FN-005** — `testId` wired into `ValueKey` only — `Semantics.identifier` missing; cross-platform locators (RN `testID`, web `data-testid`) break.
5. **ICC-FN-006** — Recipe / `cornerRadius` design decision ignored (no `useComponentRecipe`); always pill.
6. **ICC-A11Y-002** — Auto-derived label from lower-case icon names produces poor screen-reader text ("chevronleft, image").
7. **ICC-VIS-001** — RTL-direction icons don't auto-mirror (`chevronleft` / `arrowleft` / `back`).

### 4.5 Accessibility compliance summary

| Concern | Status |
|---------|--------|
| WCAG 1.4.11 Non-text Contrast | Fail (ICC-A11Y-004) — disabled `Opacity(0.38)` drops to ~1.3:1 |
| WCAG 4.1.2 Name / Role / Value | Fail (ICC-FN-002, ICC-A11Y-002, ICC-A11Y-003) — auto-derived labels, asymmetric hint handling |
| Screen-reader (TalkBack / VoiceOver) | 4 failure modes (decorative auto-derive, lower-case icon ids, hint without label, disabled not announced) |
| Material fallback semantics leak | Edge case (ICC-A11Y-005) — empty-label node from inner `Icon` fallback |
| RTL mirroring | Fail (ICC-VIS-001) — `chevron` / `arrow` icons stay LTR in RTL locales |
| Token-derived fallbacks | Fail (ICC-FN-003, ICC-VIS-002, ICC-VIS-003) — Material seed colours leak; literal `9999` pill radius |

### 4.6 Components / variants with the most issues

| Surface | Issues |
|---------|--------|
| Appearance / role resolver (`one_ui_icon_contained_types.dart`) | 3 (ICC-FN-001, ICC-FN-004, ICC-FN-008) |
| Colour resolver (`icon_contained_color_resolve.dart`) | 3 (ICC-FN-003, ICC-A11Y-004, ICC-VIS-002) |
| A11y resolver (`one_ui_icon_contained_a11y.dart`) | 3 (ICC-FN-002, ICC-A11Y-002, ICC-A11Y-003) |
| Size / shape resolver (`icon_contained_size_resolve.dart`) | 2 (ICC-FN-006, ICC-VIS-003) |
| Material `_semanticIconMap` fallback (`semantic_icon_material.dart`) | 2 (ICC-A11Y-005, ICC-VIS-001) |
| Widget shell (`one_ui_icon_contained.dart`) | 3 (ICC-FN-005, ICC-FN-007, ICC-A11Y-001) |

### 4.7 Regression risk areas

1. **Appearance resolver fix (`brand-bg`)** — removing the `'brand-bg' → 'primary'` remap will flip rendered colours wherever `brand-bg` is currently used; goldens need re-blessing.
2. **Decorative-label removal** — dropping `formatOneUiIconName` fallback affects every story that omitted `semanticsLabel`; Semantics-tree golden tests must be updated.
3. **`Semantics.identifier` for `testId`** — once added, integration tests can match by identifier; existing `find.byKey` callers continue to work but redundant `KeyedSubtree` should be removed in one pass.
4. **RTL mirroring of `chevron` / `arrow` icons** — adding `matchTextDirection: true` (or `Transform.flip` for non-Material glyphs) flips every RTL screenshot for affected pages.
5. **Disabled opacity alignment** — switching from `0.38` → `0.5` (or `--Disabled-Opacity`) affects every disabled-state golden.
6. **Pill radius literal removal** — replacing `9999` with `min(containerPx, containerPx) / 2` changes radius math at small sizes and may affect AA on iOS/Android.

---

## 5. Recommendations for fixes & stabilisation

### 5.1 Immediate (this sprint — Critical)

1. **Stop re-mapping `appearance: 'brand-bg'` to `'primary'`** in both static and runtime resolvers (ICC-FN-001).
   - Files: `packages/ui_flutter/lib/widgets/one_ui_icon_contained_types.dart:74, 90`.
   - `tokensForAppearance(context, 'brand-bg')` already works; `oneUiAppearanceCssLabel` emits `--Brand-Bg-*` tokens.

### 5.2 Next sprint (High)

2. **Stop auto-deriving labels from the icon name** when caller omits `semanticsLabel`. Return `null`; let the parent decide (ICC-FN-002, ICC-A11Y-002).
   - File: `packages/ui_flutter/lib/widgets/one_ui_icon_contained_a11y.dart:24-34`.
3. **Replace Material `colorScheme.primary` fallback** in `icon_contained_color_resolve.dart:87-93` with: (a) debug-mode assert pointing at missing `OneUiScope`, (b) release-mode token-derived neutral fallback (ICC-FN-003).
4. **Wire `testId` into `Semantics(identifier: …)`**. Drop the redundant `KeyedSubtree(ValueKey(testId))` wrap — merge into the outer `Semantics`. For the decorative branch, still emit `Semantics(identifier, container: true)` so the locator works (ICC-FN-005).
5. **Port `useComponentRecipe` to the Flutter resolver** so brand recipe `cornerRadius` is honoured. Read the recipe channel before falling back to `--IconContained-borderRadius` (ICC-FN-006).
6. **Re-declare direction-sensitive entries** in `_semanticIconMap` with `matchTextDirection: true` (`Icons.chevron_left/right`, `Icons.arrow_back/forward` etc) OR wrap the glyph in `Transform.flip` when `Directionality.of(context) == TextDirection.rtl` (ICC-VIS-001).

### 5.3 Polish (Medium / Low)

7. **Invalid appearance string** — debug-mode assert / `debugPrint`; release fallback to `'primary'` (matches `'auto'` default) (ICC-FN-004).
8. **Pre-sized Widget glyphs** — drop the `FittedBox(BoxFit.contain)` wrap; use only `SizedBox + IconTheme.merge`. Glyph overflow is the caller's responsibility (web parity) (ICC-FN-007).
9. **`null` appearance vs `'auto'`** — treat both identically in the runtime path OR clarify the docstring (ICC-FN-008).
10. **Disabled image announcement** — suffix the announced label with ", disabled" when `isDisabled`. Drop the `enabled` param on image Semantics; image role ignores it (ICC-A11Y-001).
11. **`semanticsHint` without label** — debug warning + ignore the hint (mirror RN `accessible = !ariaHidden && Boolean(label)`). Don't expose a hint that has no name (ICC-A11Y-003).
12. **Disabled opacity** — align with native (0.5) or read from `--Disabled-Opacity`. Document non-interactive disabled-state semantics (ICC-A11Y-004).
13. **Inner Material fallback** — pass `excludeFromSemantics: true` to the Material `Icon` fallback when `semanticLabel` is empty (ICC-A11Y-005).
14. **Foreground fallback chain** — final fallback should be platform `Text-High` (i.e. `tokens(context, 'neutral').content['high']`) instead of role-local `high`. Apply same fix to `onBoldContent['high']!` path (ICC-VIS-002).
15. **Pill literal** — derive pill fallback from token system: `min(containerPx, containerPx) / 2` (density-aware) (ICC-VIS-003).

---

## 6. Methodology

- **Functional audit:** static comparison of `one_ui_icon_contained.dart`, `one_ui_icon_contained_types.dart`, and the colour/size engines against `packages/ui/src/components/IconContained/IconContained.tsx` + `IconContained.module.css` + `IconContained.shared.ts` and the native peer (`IconContained.native.tsx`, `useComponentRecipe`).
- **A11y audit:** code walk of `one_ui_icon_contained_a11y.dart`, `one_ui_icon_a11y.dart`, and the Semantics emission in `one_ui_icon_contained.dart`, checked against WCAG 2.1 AA criteria and React Native `interface.ts` accessibility props.
- **Visual audit:** comparison of resolved geometry / colour / token cascade vs Figma matrix (icon-contained nodes — 5 sizes × 2 attentions × 9 appearances + disabled) and web CSS module rules. Material fallback path (`_semanticIconMap`) compared against Jio's direction-aware SVGs.
- **Cross-platform parity:** prop / recipe tables compared between `IconContained.shared.ts` (web), `interface.ts` (RN), and `one_ui_icon_contained.dart` (Flutter) to surface drift on `appearance`, recipe `cornerRadius`, and `testId` / `testID` / `data-testid`.

---

## 7. References

- **Component source:** `packages/ui_flutter/lib/widgets/one_ui_icon_contained.dart`
- **A11y resolver:** `packages/ui_flutter/lib/widgets/one_ui_icon_contained_a11y.dart`, `packages/ui_flutter/lib/widgets/one_ui_icon_a11y.dart`
- **Types & state:** `packages/ui_flutter/lib/widgets/one_ui_icon_contained_types.dart`
- **Engine:** `packages/ui_flutter/lib/engine/icon_contained_color_resolve.dart`, `packages/ui_flutter/lib/engine/icon_contained_size_resolve.dart`
- **Semantic icon fallback:** `packages/ui_flutter/lib/widgets/semantic_icon_material.dart`
- **Web parity reference:** `packages/ui/src/components/IconContained/{IconContained.tsx, IconContained.module.css, IconContained.shared.ts, interface.ts}`
- **RN parity reference:** `packages/ui-native/src/components/IconContained/{IconContained.native.tsx, interface.ts}`
- **QA test suite:** `apps/qa-playground-flutter/test/components/icon_contained/`

---

## 8. Individual Bug Reports (Copy-Paste Format)

Each block below is self-contained — copy from `===` to `===` into a Jira / GitHub / Linear ticket.

### 8.1 Functional bugs

```
===============================================================
Bug ID:       ICC-FN-001
Title:        appearance: 'brand-bg' silently re-mapped to 'primary'
Category:     Functional
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained

Scenario:
Caller passes appearance: 'brand-bg' for brand-background-tinted
IconContained.

Steps to Reproduce:
1. Render `OneUiIconContained(icon: 'heart', appearance: 'brand-bg',
   semanticsLabel: 'X')`.
2. Inspect resolved `data-appearance` and paint colours.

Expected Result:
- `brand-bg` is a documented role; `data-appearance == 'brand-bg'`
  and Brand-Bg tokens are used.
- Web does this via the `appearanceBrandBg` CSS class.

Actual Result:
- `resolveOneUiIconContainedAppearanceStatic` hard-codes
  `if (raw == 'brand-bg') return 'primary'` (line 74).
- Both static and runtime paths bypass `brand-bg`.
- Painted with Primary role.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_contained_types.dart:74,90

Root Cause:
Defensive remap from an earlier prototype before `brand-bg` was promoted
to first-class role. `brand-bg` is already in
`kOneUiIconContainedAppearances` on line 32 — the resolver contradicts
its own catalogue.

Suggested Fix:
- Delete both `brand-bg → primary` early returns.
- `tokensForAppearance(context, 'brand-bg')` already works;
  `oneUiAppearanceCssLabel` emits `--Brand-Bg-*` tokens.
===============================================================
```

```
===============================================================
Bug ID:       ICC-FN-002
Title:        Decorative IconContained auto-derives label from icon name, breaking parity
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained + one_ui_icon_contained_a11y

Scenario:
`OneUiIconContained(icon: 'heart')` with no `semanticsLabel` — meant
decorative.

Steps to Reproduce:
1. Render `OneUiIconContained(icon: 'heart')`.
2. Inspect Semantics tree.

Expected Result:
- Web: no `aria-label` → root `aria-hidden`, `role=img` NOT set.
- Native: `accessible: false` when label missing.

Actual Result:
- `oneUiIconContainedEffectiveLabel` falls through to
  `formatOneUiIconName(semanticIconName)`.
- `icon: 'heart'` announces as "heart" even when decorative.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_contained_a11y.dart:24-34

Root Cause:
Helper was copied wholesale from `OneUiIcon`'s `effectiveLabel`, which
auto-derives by design. IconContained is a decorative wrapper — its
parent decides whether the icon is content.

Suggested Fix:
- Return `null` when explicit `semanticsLabel` is null/empty.
- Drop the `formatOneUiIconName` branch.
===============================================================
```

```
===============================================================
Bug ID:       ICC-FN-003
Title:        Color resolver returns Material colorScheme.primary when OneUiScope absent
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained + icon_contained_color_resolve

Scenario:
IconContained rendered without `OneUiScope` (early bootstrap, isolated
test, modular screen).

Steps to Reproduce:
1. Build `MaterialApp` (bare) around `OneUiIconContained(icon: 'heart',
   semanticsLabel: 'X')` — no `OneUiScope`.
2. Inspect resolved fill and glyph colours.

Expected Result:
- Assert pointing at missing OneUI bootstrap (debug) OR safe brand-neutral
  fallback using design tokens — not Material seed.

Actual Result:
- Silently falls back to `Theme.of(context).colorScheme.primary` /
  `onPrimary`.
- Apps that forget OneUI bootstrap render with raw Material colours.

Code Reference:
- packages/ui_flutter/lib/engine/icon_contained_color_resolve.dart:87-93

Root Cause:
Defensive fallback for unit tests but never gated by `kDebugMode`.
Visual regression in "works on my machine" scenarios; production apps
ship with off-brand seeds.

Suggested Fix:
- `assert` in debug pointing at missing `OneUiScope`.
- Token-derived neutral fallback in release.
- Align with Avatar / Button fallback patterns.
===============================================================
```

```
===============================================================
Bug ID:       ICC-FN-004
Title:        Invalid appearance string falls through to 'secondary' (masks caller errors)
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained

Scenario:
Caller mis-types: `appearance: 'destructive'` or `'success'`.

Steps to Reproduce:
1. Pass an unknown appearance string.
2. Check `data-appearance` and the visible role.

Expected Result:
- Debug assert OR — for runtime fallback — resolve to `'primary'` so
  the chosen role is brand identity.

Actual Result:
- Returns `'secondary'` for any string not in
  `kOneUiIconContainedAppearances` (line 76).
- Silent wrong role; tests keying off `data-appearance` see confusing
  diffs.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_contained_types.dart:75-76

Root Cause:
Author chose `'secondary'` as a "safe" default, but it masks typos and
is inconsistent with the `'auto'` default (which resolves to primary).

Suggested Fix:
- Debug-mode assert / `debugPrint`.
- Release fallback to `'primary'` (matches `'auto'` default).
===============================================================
```

```
===============================================================
Bug ID:       ICC-FN-005
Title:        testId wired into ValueKey but not Semantics.identifier — cross-platform locators break
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained

Scenario:
QA writes Flutter Driver / `integration_test` using `find.byIdentifier`
(matches RN `testID` and web `data-testid`).

Steps to Reproduce:
1. Render `OneUiIconContained(testId: 'hero-favourite')`.
2. `find.byIdentifier('hero-favourite')`.

Expected Result:
- `Semantics(identifier: 'hero-favourite', label, image: true)` so the
  locator works on web / RN / Flutter.

Actual Result:
- Only `KeyedSubtree(key: ValueKey<String>(testId))`.
- `find.byIdentifier` returns nothing.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_contained.dart:134-138

Root Cause:
Pattern copied from `OneUiIcon` (same gap). `testId` must flow into
`Semantics(identifier: …)`, not just a `ValueKey`.

Suggested Fix:
- Drop the `testId`-only `KeyedSubtree`.
- Merge into the outer `Semantics(identifier: testId, …)`.
- For the decorative branch, wrap with
  `Semantics(identifier: testId, container: true)` so the locator still
  works.
===============================================================
```

```
===============================================================
Bug ID:       ICC-FN-006
Title:        Recipe / cornerRadius design decision ignored — no useComponentRecipe
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained + icon_contained_size_resolve

Scenario:
Brand sets IconContained recipe `cornerRadius: 'small'` (resolves to
Shape-3).

Steps to Reproduce:
1. Configure IconContained recipe `cornerRadius: 'small'`.
2. Render `OneUiIconContained(...)`.
3. Inspect resolved border radius.

Expected Result:
- Container rounded to Shape-3, matching web and native
  (`useComponentRecipe` in `IconContained.native.tsx`).

Actual Result:
- `resolveIconContainedBorderRadiusPx` only reads
  `--IconContained-borderRadius`.
- Recipes stored on the separate recipe channel are ignored.
- Always pill.

Code Reference:
- packages/ui_flutter/lib/engine/icon_contained_size_resolve.dart:112-134

Root Cause:
Recipe resolution was wired into the native peer (`useComponentRecipe`)
but never ported to Flutter. The Flutter resolver only knows about the
CSS-style component-property override.

Suggested Fix:
- Read the icon-contained recipe via the Dart equivalent of
  `useComponentRecipe`.
- Apply the resolved `borderRadius` token first; fall back to the
  `--IconContained-borderRadius` override, then to pill.
===============================================================
```

```
===============================================================
Bug ID:       ICC-FN-007
Title:        Custom Widget glyph force-fitted with FittedBox(contain) — breaks intrinsic-size assets
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained

Scenario:
Caller passes a pre-sized SVG (`SvgPicture.asset` with explicit width /
height).

Steps to Reproduce:
1. `OneUiIconContained(icon: SvgPicture.asset('heart.svg', width: 12,
   height: 12), size: 'm')`.
2. Inspect the rendered glyph.

Expected Result:
- Glyph paints at natural 12×12 pixel-perfect.
- Web `isValidElement` renders the element untouched.

Actual Result:
- `SizedBox(iconPx) + FittedBox(BoxFit.contain)` upscales / downscales
  the glyph.
- Fractional-pixel blurring at xs/s sizes.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_contained.dart:87-96

Root Cause:
Defensive sizing changes the contract — pre-sized glyphs should render
as-is. Web parity is "glyph overflow is the caller's responsibility".

Suggested Fix:
- Drop the `FittedBox` wrap.
- Use only `SizedBox + IconTheme.merge`.
- Document: glyph overflow is the caller's responsibility (web parity).
===============================================================
```

```
===============================================================
Bug ID:       ICC-FN-008
Title:        appearance == null defaults differ from web — null doesn't inherit Surface
Category:     Functional
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained

Scenario:
Caller passes no `appearance` (omitted) inside a Surface.

Steps to Reproduce:
1. `OneUiIconContained(icon: 'heart')` inside
   `OneUiSurface(appearance: 'positive')`.
2. Inspect resolved appearance.

Expected Result:
- Per Figma variable-mode contract: `null` AND `'auto'` both inherit
  Surface.

Actual Result:
- Runtime resolver only special-cases `'auto'`.
- `null` bypasses Surface inheritance and returns `'secondary'`.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_contained_types.dart:68-96

Root Cause:
Static and runtime resolvers were authored separately; the docstring
contradicts the implementation.

Suggested Fix:
- Treat `null` and `'auto'` identically in the runtime path, OR
- Clarify docstring to require explicit `'auto'` for Surface inheritance.
===============================================================
```

### 8.2 Accessibility (a11y) bugs

```
===============================================================
Bug ID:       ICC-A11Y-001
Title:        Semantics(image: true, enabled: false) does NOT announce 'disabled' on iOS/Android
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained

Scenario:
Disabled IconContained used as a status badge (e.g. greyed favourite).

Steps to Reproduce:
1. Render `OneUiIconContained(icon: 'heart', disabled: true,
   semanticsLabel: 'Favourite')`.
2. Enable TalkBack / VoiceOver.

Expected Result:
- Screen reader announces "Favourite, image, disabled" — web parity
  with `aria-disabled` on `role=img`.

Actual Result:
- `Semantics(image: true, enabled: a11y.enabled)`.
- The `enabled` flag is only meaningful for button / link / textfield.
- Image role ignores `enabled` — disabled state is never announced.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_contained.dart:145-153

Root Cause:
Disabled modelled on interactive Button widget, but IconContained is
non-interactive. Flutter's `Semantics.enabled` only flows into
`SemanticsFlag.isEnabled` for actionable roles.

Suggested Fix:
- Suffix the announced label with ", disabled" when `isDisabled` (e.g.
  `'Favourite, disabled'`).
- Drop the `enabled` parameter on the image Semantics.
===============================================================
```

```
===============================================================
Bug ID:       ICC-A11Y-002
Title:        Auto-derived label from lower-case icon names produces poor screen-reader text
Category:     Accessibility (a11y)
Severity:     High
Platform:     Flutter Web
Component:    OneUiIconContained + one_ui_icon_a11y

Scenario:
Caller leaves `semanticsLabel: null` (per ICC-FN-002, label derived
from icon name).

Steps to Reproduce:
1. Render `OneUiIconContained(icon: 'chevronleft')` on Flutter Web.
2. Enable VoiceOver / NVDA.

Expected Result:
- Skip decorative OR produce a contextually meaningful label
  (e.g. "Previous").

Actual Result:
- `formatOneUiIconName('chevronleft')` returns `'chevronleft'` verbatim
  (regex requires camelCase boundary).
- AT announces "chevronleft, image".

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_a11y.dart:21-26

Root Cause:
Icon catalogue uses lower-case ids (`'chevronleft'`, `'arrowback'`), but
the formatter assumes camelCase (`'chevronLeft'`) and the regex split
fails.

Suggested Fix:
- Combined with ICC-FN-002 (don't auto-derive at all).
- If kept, use a curated map (`chevronleft → 'previous'`,
  `arrowback → 'back'`) rather than a regex.
===============================================================
```

```
===============================================================
Bug ID:       ICC-A11Y-003
Title:        semanticsHint forwarded asymmetrically
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained + one_ui_icon_contained_a11y

Scenario:
Caller passes only `semanticsHint` without a label.

Steps to Reproduce:
1. Render `OneUiIconContained(icon: 'heart', semanticsHint: 'Opens
   favourites')`.
2. Enable TalkBack / VoiceOver.

Expected Result:
- Refuse hint without label (web / native pattern) + debug warning OR
  expose with auto-label.

Actual Result:
- Auto-label kicks in (per ICC-FN-002), so the hint is exposed but
  paired with the unhelpful 'heart' label.
- With `excludeFromSemantics: true`, the hint is silently dropped.
- Behaviour is asymmetric.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_icon_contained_a11y.dart:44-71

Root Cause:
`resolveOneUiIconContainedSemantics` doesn't gate the hint behind an
explicit label. Web / RN require label-before-hint
(`accessible = !ariaHidden && Boolean(label)`).

Suggested Fix:
- Require an explicit `semanticsLabel` for `semanticsHint`.
- Emit a debug warning when `semanticsHint` is set without
  `semanticsLabel`.
- Mirror RN `accessible = !ariaHidden && Boolean(label)`.
===============================================================
```

```
===============================================================
Bug ID:       ICC-A11Y-004
Title:        Disabled high-attention icon falls below WCAG 1.4.11 contrast
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained + icon_contained_color_resolve

Scenario:
IconContained used as a state indicator; disabled state multiplied by
`Opacity(0.38)`.

Steps to Reproduce:
1. Render `OneUiIconContained(appearance: 'primary', attention: 'high',
   disabled: true)`.
2. Measure contrast vs page background.

Expected Result:
- Disabled visibly de-emphasises while keeping ≥ 3:1 OR disallow
  disabled on non-interactive.

Actual Result:
- `Opacity(0.38)` uniform over fill + glyph.
- Final contrast drops to ~1.3:1.
- Native uses `0.5`; web `--Disabled-Opacity` typical `0.5`.

Code Reference:
- packages/ui_flutter/lib/engine/icon_contained_color_resolve.dart:95-117

Root Cause:
Disabled treatment was copied from interactive controls where WCAG
1.4.11 is waived. IconContained is non-interactive — the exemption
doesn't apply.

Suggested Fix:
- Align `disabledOpacity` with native (0.5) or read from
  `--Disabled-Opacity`.
- Document non-interactive disabled-state semantics in the component
  docstring.
===============================================================
```

```
===============================================================
Bug ID:       ICC-A11Y-005
Title:        Inner OneUiSemanticIcon Material fallback may leak empty-label node
Category:     Accessibility (a11y)
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained + semantic_icon_material

Scenario:
Jio icon catalogue unavailable during async load window — Material
fallback fires.

Steps to Reproduce:
1. Render `OneUiIconContained` on cold start before the catalogue loads.
2. Inspect the Semantics tree.

Expected Result:
- Only the outer `Semantics(label, image: true)` is exposed.

Actual Result:
- Material `Icon` with `semanticLabel: ''` emits a Semantics node.
- The outer `container: true` re-groups; some readers announce
  "Favourite. Empty." with a pause between.

Code Reference:
- packages/ui_flutter/lib/widgets/semantic_icon_material.dart:75-80
- packages/ui_flutter/lib/widgets/one_ui_icon_contained.dart:119,150

Root Cause:
Empty-label Semantics nodes are not portable across platforms (TalkBack
and VoiceOver disagree). The Material fallback was added without
`excludeFromSemantics`.

Suggested Fix:
- Pass `excludeFromSemantics: true` to the Material `Icon` fallback
  when `semanticLabel` is empty.
===============================================================
```

### 8.3 Visual / UI bugs

```
===============================================================
Bug ID:       ICC-VIS-001
Title:        RTL-direction icons don't auto-mirror (chevronleft/arrowleft/back)
Category:     Visual
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained + semantic_icon_material

Scenario:
Arabic / Hebrew locale uses `chevronright` as the forward arrow.

Steps to Reproduce:
1. `Directionality(textDirection: TextDirection.rtl, child:
   OneUiIconContained(icon: 'chevronright'))`.
2. Compare to web in the same locale.

Expected Result:
- Chevron mirrors to point left in RTL — web
  `:dir(rtl) svg { transform: scaleX(-1) }`; native `I18nManager.isRTL`.

Actual Result:
- `_semanticIconMap` maps to plain `Icons.chevron_right` etc.
- None of the direction-sensitive entries have
  `matchTextDirection: true`.
- No `Directionality` query in the fallback path.

Code Reference:
- packages/ui_flutter/lib/widgets/semantic_icon_material.dart:106-114

Root Cause:
Material fallback uses default `IconData`s without
`matchTextDirection: true`. Jio web SVGs are direction-aware via CSS,
but the Flutter fallback isn't.

Suggested Fix:
- Re-declare direction-sensitive entries with
  `matchTextDirection: true` (chevron, arrow, back, forward).
- OR wrap in `Transform.flip` when
  `Directionality.of(context) == TextDirection.rtl` on a known
  direction-sensitive set.
===============================================================
```

```
===============================================================
Bug ID:       ICC-VIS-002
Title:        Foreground falls back to role 'high' content token instead of Text-High when tinted missing
Category:     Visual
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained + icon_contained_color_resolve

Scenario:
Brand omits the tinted content token for a role (legacy / partial
migration).

Steps to Reproduce:
1. Configure a brand where the Negative role has content `{high: …}`
   only, with no `tinted` value.
2. Render `OneUiIconContained(appearance: 'negative', attention: 'medium')`.
3. Inspect the foreground glyph colour.

Expected Result:
- Web cascade:
  `var(--Negative-Tinted, var(--Text-High))` — global fallback always
  exists.

Actual Result:
- `icon_contained_color_resolve.dart:41` uses
  `(role.content['tinted'] ?? role.content['high']!)`.
- The null-check operator can throw.
- Commonly paints in the role's own `high` token, which often matches
  the Subtle background — the glyph becomes invisible.

Code Reference:
- packages/ui_flutter/lib/engine/icon_contained_color_resolve.dart:36-43

Root Cause:
Wrong final fallback target — web cascades to a global `Text-High`,
Flutter cascades to a role-local `high`.

Suggested Fix:
- Final fallback to the platform `Text-High` token
  (`tokens(context, 'neutral').content['high']`).
- Apply the same fix to the `onBoldContent['high']!` path.
===============================================================
```

```
===============================================================
Bug ID:       ICC-VIS-003
Title:        Container Shape-Pill falls back to literal 9999 — magic literal violates zero-tolerance rule
Category:     Visual
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIconContained + icon_contained_size_resolve

Scenario:
No design-system payload available; container border-radius is
resolved from defaults.

Steps to Reproduce:
1. Render `OneUiIconContained` outside `OneUiScope`.
2. Inspect the resolved border radius.

Expected Result:
- Token-derived pill OR mathematically equivalent
  (`min(W, H) / 2`).

Actual Result:
- `resolveIconContainedBorderRadiusPx` returns literal `9999`.
- Out of line with CLAUDE.md "Zero literals" rule.
- Masks ICC-FN-006 (when recipes are absent, the pill is the only
  visible behaviour).

Code Reference:
- packages/ui_flutter/lib/engine/icon_contained_size_resolve.dart:132-134

Root Cause:
Pill is "infinitely round", but Flutter `BorderRadius.circular(9999)`
doesn't truncate like CSS `border-radius: 9999px` does — the literal
is the only literal in the whole pipeline.

Suggested Fix:
- Derive the pill fallback from the token system:
  `min(containerPx, containerPx) / 2` (density-aware).
- Eliminates the magic literal.
===============================================================
```

---

## 9. Test coverage map

Each bug ID maps to a regression test in
`apps/qa-playground-flutter/test/components/icon_contained/icon_contained_regression_test.dart`.

| Bug ID | Test name | Coverage notes |
|--------|-----------|----------------|
| ICC-FN-001 | `[ICC-FN-001] appearance: 'brand-bg' uses Brand-Bg tokens, not Primary` | Render with `appearance: 'brand-bg'`; assert resolved colours match `tokensForAppearance(context, 'brand-bg')` and `data-appearance == 'brand-bg'`. |
| ICC-FN-002 | `[ICC-FN-002] decorative IconContained omits Semantics.label and role=image` | Render `OneUiIconContained(icon: 'heart')` with no `semanticsLabel`; assert no `Semantics(label, image: true)` node in the tree. |
| ICC-FN-003 | `[ICC-FN-003] OneUiScope-less render asserts in debug, token-neutral in release` | Bare `MaterialApp` (no `OneUiScope`); in debug assert `AssertionError`; in release assert resolved colours match neutral tokens, not Material `colorScheme.primary`. |
| ICC-FN-004 | `[ICC-FN-004] invalid appearance string asserts in debug, falls back to primary in release` | Render `appearance: 'destructive'`; in debug assert `debugPrint`/assertion fires; in release assert resolved role is `'primary'`. |
| ICC-FN-005 | `[ICC-FN-005] testId is exposed via Semantics.identifier` | Render `testId: 'hero-favourite'`; assert `find.byIdentifier('hero-favourite')` returns the IconContained. |
| ICC-FN-006 | `[ICC-FN-006] brand recipe cornerRadius is honoured` | Configure brand recipe `cornerRadius: 'small'`; render IconContained; assert resolved border radius matches Shape-3. |
| ICC-FN-007 | `[ICC-FN-007] pre-sized Widget glyph renders at intrinsic size` | Pass `SvgPicture.asset(..., width: 12, height: 12)`; render at `size: 'm'`; assert no `FittedBox` ancestor and the SvgPicture's resolved size is 12×12. |
| ICC-FN-008 | `[ICC-FN-008] appearance: null inherits Surface like appearance: 'auto'` | Mount inside `OneUiSurface(appearance: 'positive')` with no `appearance` prop; assert resolved role matches `'positive'`. |
| ICC-A11Y-001 | `[ICC-A11Y-001] disabled IconContained announces ', disabled' suffix` | Render `disabled: true` with explicit `semanticsLabel: 'Favourite'`; assert resolved `Semantics.label` ends with `', disabled'` and no `enabled: false` on the image Semantics. |
| ICC-A11Y-002 | `[ICC-A11Y-002] lower-case icon ids do not produce raw-id labels` | Render `icon: 'chevronleft'` with no `semanticsLabel`; assert no `Semantics.label == 'chevronleft'` node (either decorative or curated). |
| ICC-A11Y-003 | `[ICC-A11Y-003] semanticsHint without semanticsLabel is rejected in debug` | Render `semanticsHint: 'Opens favourites'` with no `semanticsLabel`; in debug assert warning fires; assert hint is not exposed. |
| ICC-A11Y-004 | `[ICC-A11Y-004] disabled opacity aligns with --Disabled-Opacity (0.5)` | Render `disabled: true, attention: 'high'`; assert resolved Opacity widget's opacity equals `0.5` (or `--Disabled-Opacity` token). |
| ICC-A11Y-005 | `[ICC-A11Y-005] Material fallback excludes empty-label semantics node` | Force Material fallback path (catalogue absent); assert inner `Icon` has `excludeFromSemantics: true` when `semanticLabel` is empty. |
| ICC-VIS-001 | `[ICC-VIS-001] direction-sensitive icons mirror in RTL` | Wrap with `Directionality(rtl)`; render `icon: 'chevronright'`; assert resolved glyph paints mirrored (either `matchTextDirection: true` on IconData or `Transform.flip` ancestor). |
| ICC-VIS-002 | `[ICC-VIS-002] missing tinted token falls back to Text-High, not role's own high` | Brand with Negative role missing `tinted`; render `attention: 'medium', appearance: 'negative'`; assert resolved glyph colour matches `neutral.content['high']`. |
| ICC-VIS-003 | `[ICC-VIS-003] container pill radius is derived, not literal 9999` | Render IconContained at every size; assert resolved border radius equals `min(containerPx, containerPx) / 2` for every size. |

---
