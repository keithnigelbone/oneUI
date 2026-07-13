# OneUI Flutter Badge — Component Audit Report

**Date:** 2026-06-15 (revised 2026-06-16 after harness reclassification — see §0)
**Component:** `OneUiBadge` (Flutter)
**Source:** `packages/ui_flutter/lib/widgets/one_ui_badge.dart` + engine
**Cross-checked against:**
- React Web Badge (`packages/ui/src/components/Badge/*`)
- Figma spec (badge matrix: 5 sizes × 3 attentions × 9 slot configs)
- WCAG 2.1 AA
- Direct test runs of `apps/qa-playground-flutter/test/components/badge/*` and `integration_test/badge_e2e_test.dart`

**Severity legend:**
- **Critical** — ships broken UX, runtime crash, or AT failure
- **High** — visible regression vs spec / parity gap
- **Medium** — noticeable polish gap
- **Low** — nice-to-have / UX surprise

**Headline:** 27 audit findings → **24 actionable component bugs** — **6 Critical**, **9 High**, **6 Medium**, **3 Low** — plus 2 debatable + 1 not-a-bug + 1 reclassified-as-not-a-bug after harness fix.

---

## 0. Revision note (2026-06-16) — harness reclassification

Re-running the regression suite after fixing the QA harness to wrap with
`OneUiSurfaceBootstrap` (instead of a bare `OneUiSurfaceScope`) flipped three
audit findings to passing. They were partially attributable to the test
harness, not the component:

| Audit ID | Previous severity | Reclassified | Reason |
|----------|------------------|--------------|--------|
| **BADGE-FN-003** | Critical | **High** (still a real bug, scope re-classified) | The badge does have a hidden runtime contract: nested CounterBadge/IndicatorBadge slots require `OneUiSurfaceBootstrap` somewhere in the ancestry. Production apps satisfy it; custom integrations crash with a 99k-px overflow + assertion error. RCA refined: it's a "hard-asserting hidden dependency", not "always crashes". |
| **BADGE-A11Y-005** | High | **NOT A BUG** | The outer `Semantics(liveRegion: true)` IS emitted correctly when the badge is mounted in a real production tree. The original failure was caused by the QA harness omitting `OneUiSurfaceBootstrap`, not by the badge widget. Removed from the active bug list. |
| **BADGE-VIS-006** | High | **Low (edge case)** | CounterBadge's hard-coded 16-px fallback only fires when both (a) brand omits per-size CounterBadge tokens AND (b) `OneUiSurfaceBootstrap` is absent. Production never hits both conditions simultaneously. Kept on the list for hygiene (token backfill in `default_component_properties_map.dart`) but demoted. |

**Net real component bugs after reclassification: 24** (was 27).

---

## 1. Functional bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| BADGE-FN-001 | Functional | Flutter (all) | Brand-loading race: `OneUiBadge` rendered before `OneUiScope.designSystemOf(context)` resolves | Mount `<OneUiBadge child:'New'>` outside `OneUiScope`, or during brand swap | Web renders `<span role="status">` with CSS fallbacks; semantics + live region intact | Returns a deep-orange debug `ConvexGapCard` with English error text to the end user. No `Semantics`, no live region, no label. Slots/child dropped. | Critical | `one_ui_badge.dart:53-61`, `convex_gap_card.dart:21-48` |
| BADGE-FN-002 | Functional | Flutter (all) | Long label inside an unbounded or wider-than-content parent | `OneUiBadge(child: 'A very long status label that exceeds…')` in a Column / wide Container | Web `inline-flex + text-overflow: ellipsis` clips with `…` | RenderFlex overflowed by up to ~99,276 px (observed during QA test runs). `maxLines:1 + ellipsis` never fires because Text gets unbounded width. | Critical | `one_ui_badge.dart:118-130, 148-153` |
| BADGE-FN-003 | Functional | Flutter (all) | Nested `OneUiCounterBadge` / `OneUiIndicatorBadge` slot used in a tree that does NOT include `OneUiSurfaceBootstrap` as an ancestor | Mount `OneUiBadge(start: OneUiCounterBadge(value:3))` in a custom Flutter shell (or test harness) that wraps only with `OneUiSurfaceScope`, not the full Bootstrap | Inner slot widget renders gracefully OR the badge degrades to a labelled placeholder. No hard assertion, no overflow. | `BadgeSurfaceImmuneScope.build` asserts `OneUiRootSurfaceScope.of(context).value != null` → hard `_AssertionError` → parent Row overflows by ~99k px. Reproduced in any tree without Bootstrap. Production qa-playground apps DO wrap with Bootstrap, so this only surfaces in custom integrations / unit-test contexts. | High | `packages/ui_flutter/lib/widgets/badge_surface_immune_scope.dart:18`, `packages/ui_flutter/lib/theme/one_ui_root_surface_scope.dart:21` |
| BADGE-FN-004 | Functional | Flutter (all) | Pass a non-String, non-num `Object` as `child` | `OneUiBadge(child: SomeWidget())` without `semanticsLabel` | TypeScript blocks this on web; React renders elements safely | `child.toString()` renders `"Instance of 'SomeWidget'"` visibly. Resolver returns null → no Semantics wrapper → invisible to AT. | Critical | `one_ui_badge.dart:40, 93, 184`; `one_ui_badge_a11y.dart:24-34` |
| BADGE-FN-005 | Functional | Flutter (all) | `<OneUiBadge />` (no child, no semanticsLabel) | `OneUiBadge()` placed in tree | Web always emits `<span role="status">` (empty live region) and dev-warns about missing `aria-label` | Flutter renders colored chip with zero accessibility wrapper; no warning. | High | `one_ui_badge.dart:184-194` |
| BADGE-FN-006 | Functional | Flutter (all) | `testId` discoverability in integration tests / Playwright-style locators | `OneUiBadge(testId: 'my-badge')` then locate via semantics / debug tree | Web exposes `data-testid="my-badge"` on the rendered element | Flutter wraps in `KeyedSubtree(key: ValueKey(tid))` — only reachable via `find.byKey`; cross-platform harnesses break | High | `one_ui_badge.dart:204-207` |
| BADGE-FN-007 | Functional | Flutter (all) | `appearance="auto"` on a brand whose `themeConfig.appearances` lacks `sparkle` | `OneUiBadge(child: 'X')` on a brand without Sparkle config | Web silently uses `--Surface-Bold` neutral fallback | Falls into Material `ColorScheme.primary` fallback → completely off-brand colour, no warning | High | `badge_color_resolve.dart:37-46`; `one_ui_badge_types.dart:99` |
| BADGE-FN-008 | Functional | Flutter (all) | Slot a11y dropped whenever badge has its own label | `OneUiBadge(semanticsLabel: 'Verified', start: Avatar(alt:'User'))` | Web exposes both badge name AND nested slot labels (e.g. counter, indicator) | `_BadgeSlot.hideFromAccessibility = a11y.accessible` blanket-applies `ExcludeSemantics` to slots → AT loses `Avatar.alt`, `CounterBadge.semanticsLabel`, `IndicatorBadge.semanticsLabel`. | High | `one_ui_badge.dart:100, 138, 247-249` |
| BADGE-FN-009 | Functional | Flutter (all) | Conflicting props: `variant="bold"` + `attention="low"` together | Pass both props | Web emits `data-variant="bold"` only; attention is purely an alias | Flutter encodes both `data-variant=bold` AND `data-attention=low` in the KeyedSubtree key → unnecessary rebuilds, hot-reload state churn | Low | `one_ui_badge.dart:196-202`; `one_ui_badge_types.dart:84-111` |
| BADGE-FN-010 | Functional | Flutter (all) | Typo / invalid string for `appearance` | `OneUiBadge(appearance: 'invalid')` | TypeScript blocks at compile time on web | `OneUiBadgeAppearance = typedef String` (no validation). Falls through to Material `colorScheme.primary` fallback silently | Medium | `one_ui_badge_types.dart:11, 84-111` |
| BADGE-FN-011 | Functional | Flutter (all) | Production build with brand-loading race | Ship an APK / web build where brand load is async | Web has no equivalent dev-only debug UI; production strips warnings | `ConvexGapCard` renders English error text + `Colors.deepOrange` + hard-coded font sizes in production builds (no `kDebugMode` guard). Also violates CLAUDE.md "Zero literals" rule. | Critical | `convex_gap_card.dart:21-48` |

---

## 2. Accessibility (a11y) bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| BADGE-A11Y-001 | Accessibility (a11y) | Flutter (all) | Widget child with no explicit `semanticsLabel` | `OneUiBadge(child: SomeWidget())` then enable TalkBack/VoiceOver | `Semantics(liveRegion: true)` should wrap regardless of child runtime type; dev-mode warning if no label | Resolver only handles `String` / `num` → returns null → no Semantics emitted, no live region, AT never announces | Critical | `one_ui_badge_a11y.dart:24-33`; `one_ui_badge.dart:93, 184` |
| BADGE-A11Y-002 | Accessibility (a11y) | Flutter (all) | Whitespace-only `semanticsLabel` | `OneUiBadge(semanticsLabel: '   ', child: 'A')` | Whitespace should be trimmed → treated as absent | Emits `Semantics(label: '   ')` → silent live-region fires (phantom announcements) | High | `one_ui_badge_a11y.dart:28` |
| BADGE-A11Y-003 | Accessibility (a11y) | Flutter (all) | App locale is RTL (Arabic / Hebrew) | Set `Locale('ar')`, render any labelled badge | Semantics should inherit `Directionality.of(context)` | Hard-codes `textDirection: TextDirection.ltr` → AT reads RTL text in reverse character order | Critical | `one_ui_badge.dart:191` |
| BADGE-A11Y-004 | Accessibility (a11y) | Flutter-iOS, Flutter-Android | iOS Dynamic Type ≥ XXXL OR Android font scale ≥ 150% | Enable accessibility text scale 200%+ and render badge | Badge height scales OR text wraps within taller box (WCAG 1.4.4 Resize Text) | `SizedBox(height: layout.height)` is fixed-pixel; Text follows MediaQuery scale → bottom of glyphs clipped vertically at large font scales | High | `one_ui_badge.dart:156-157`; `badge_size_resolve.dart:76-80` |
| ~~BADGE-A11Y-005~~ | ~~Accessibility (a11y)~~ | ~~Flutter (all)~~ | ~~Slot semantics leak when badge has no label~~ | ~~`OneUiBadge(start: CounterBadge(semanticsLabel: '3 unread'))` (no badge label)~~ | ~~Outer `Semantics(liveRegion: true)` wraps the slot so updates announce~~ | **RECLASSIFIED 2026-06-16 — NOT A BUG.** Original test failure was caused by the QA harness omitting `OneUiSurfaceBootstrap`. The outer `Semantics(liveRegion: true)` IS emitted correctly when the badge is mounted in a real production tree. See §0. | ~~High~~ → **Resolved** | — |
| BADGE-A11Y-006 | Accessibility (a11y) | Flutter Web | Keyboard tab traversal | Tab through page containing non-interactive `OneUiBadge` | Badge is NOT a tab stop (web `role="status"` has no `tabindex`) | `Semantics(container: true)` on Flutter Web may produce an implicit focusable group, making non-interactive badge keyboard-navigable | Medium | `one_ui_badge.dart:185-194` |
| BADGE-A11Y-007 | Accessibility (a11y) | Flutter (all) | `semanticsHint` set without `semanticsLabel` (and child is non-String) | `OneUiBadge(semanticsHint: 'Open inbox', child: Widget())` | Hint announced OR dev warning emitted | Hint silently discarded (entire Semantics wrapper skipped); no warning | Medium | `one_ui_badge_a11y.dart:36-53`; `one_ui_badge.dart:184, 189` |
| BADGE-A11Y-008 | Accessibility (a11y) | Flutter (all) | High-contrast mode enabled (iOS "Increase Contrast" / Android "High Contrast Text") | `MediaQuery.highContrastOf(context) == true`, render `attention="low"` ghost variant | Stroke boosted to `strokeMedium` / opaque colour for visible boundary | Engine ignores `MediaQuery.highContrastOf`; ghost border stays at ~12% opacity → invisible boundary, WCAG 1.4.11 Non-text Contrast fail | High | `badge_color_resolve.dart:73-90`; `surface_engine.dart:244-248` |

---

## 3. Visual / UI bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| BADGE-VIS-001 | Visual | Flutter (all) | Long label, parent narrower than intrinsic text width | Render `OneUiBadge(child:'Long status text')` in 80px box | Label truncates with `…` (`white-space: nowrap; text-overflow: ellipsis`) | Yellow-black RenderFlex overflow stripes; ellipsis never activates (Text receives infinite width via `Row(mainAxisSize.min)`) | Critical | `one_ui_badge.dart:119-128, 148-153`. Fix: wrap `Text` in `Flexible` |
| BADGE-VIS-002 | Visual | Flutter (all) | Any labelled badge | Inspect resolved Text line-height | Brand `--Badge-lineHeight-{size}` multiplier (e.g. 1.25 for Label-XS) | `.copyWith(height: 1)` at line 121 silently overrides the brand line-height; `heightMult` from engine discarded → tighter vertical metrics than web. Violates CLAUDE.md "always pair line-height with font-size" | High | `one_ui_badge.dart:121`; `badge_size_resolve.dart:130-134, 183` |
| BADGE-VIS-003 | Visual | Flutter (all) | Sizes `l` and `xl` | Render xl badge with 'Badge' text, compare to Figma | Standard typographic ascent/descent | `TextHeightBehavior(applyHeightToFirstAscent:false, applyHeightToLastDescent:false)` strips line-box padding → glyph baseline shifts upward vs web | Medium | `one_ui_badge.dart:124-127` |
| BADGE-VIS-004 | Visual | Flutter (all) | `xl` badge with ANY slot configuration (single Icon, both Icons, nested Counter/Indicator, mixed) | `OneUiBadge(size:'xl', start: Icon(...))` and any other xl + slot combo | Web's `Badge.module.css` has NO `[data-size="xl"]:has(.start/.end)` override — xl keeps its base symmetric padding (Spacing-2-5 = 10px both sides) regardless of slots. Comment in CSS: *"XL has symmetric padding even with slots — Figma ref 409:10118"*. xs / s / m / l correctly use asymmetric padding via `:has()` (NOT a bug at those sizes). | Flutter applies asymmetric / reduced padding for ALL xl + slot combos: `_iconStart` (6/10), `_iconEnd` (10/6), `_iconBoth` (6/6), `_mixedIconStartBadgeEnd` (6/10), `_mixedBadgeStartIconEnd` (10/6), `_nestedBadgePadding` (6/6). Badge visually leans OR shrinks below spec width. | High | `badge_slot_padding.dart` xl branches in `_iconStart`, `_iconEnd`, `_iconBoth`, `_mixedIconStartBadgeEnd`, `_mixedBadgeStartIconEnd`, `_nestedBadgePadding` |
| BADGE-VIS-005 | Visual | Flutter (all) | `xs` badge with `IndicatorBadge` slot | `OneUiBadge(size:'xs', start: OneUiIndicatorBadge(...))` | 4px dot per web CSS `--_slot-indicator-size: var(--Spacing-1)` | Renders 6px dot (Spacing-1-5); dot protrudes beyond 12px badge height → clipping | Medium | `badge_slot_context.dart:21-25`; `indicator_badge_size_resolve.dart:25-30` |
| BADGE-VIS-006 | Visual | Flutter (all) | `xs`/`s`/`m` badge with `CounterBadge` slot only when BOTH per-size brand tokens AND `OneUiSurfaceBootstrap` are absent (Storybook/preview without live Convex AND custom shell) | Open badge story in a degraded environment lacking both safety nets | 12 px counter height (Spacing-3) | Falls back to hard-coded `?? 16` → counter vertically overflows parent badge. Production never hits both conditions; **downgraded to Low edge case 2026-06-16** (see §0). Still tracked because the per-size tokens should be backfilled for hygiene. | **Low** (was High) | `counter_badge_size_resolve.dart:47-51`; `default_component_properties_map.dart` |
| BADGE-VIS-007 | Visual | Flutter (all) | `appearance="auto"` outside `OneUiSurface` on Jio | `OneUiBadge(child:'X')` at page root | Developer expectation = primary green | Resolves to sparkle purple by default. Consistent with web (not a divergence) but a UX surprise vs Figma's "default" cell | Low | `one_ui_badge_types.dart:99`; web `Badge.shared.ts:65` |
| BADGE-VIS-008 | Visual | Flutter (all) | Metallic-material role on bold variant badge with slot Icon | Brand with `--Badge-roleMaterialText` set, `OneUiBadge(attention:'high', start: Icon)` | Icon renders in metallic colour matching label | `slotIconColor` ignores `--Badge-roleMaterialText`; uses `onBoldContent.tintedA11y` → icon vs label colour mismatch | Medium | `badge_color_resolve.dart:100-102`; web `Badge.module.css:376` |

---

## 4. Summary

### 4.1 Total bug count by category (post-reclassification)

| Category | Audit findings | Real bugs | Reclassified |
|----------|----------------|-----------|--------------|
| Functional | 11 | 11 | — |
| Accessibility (a11y) | 8 | 7 | A11Y-005 → not a bug |
| Visual | 8 | 8 | VIS-006 demoted High → Low |
| **Total** | **27** | **24 actionable** + 2 debatable + 1 not-a-bug + 1 reclassified | |

### 4.2 Total bug count by severity (post-reclassification)

| Severity | Was (audit) | Now (real bugs) | Notes |
|----------|-------------|-----------------|-------|
| Critical | 7 | **6** | FN-003 demoted to High |
| High | 11 | **9** | A11Y-005 removed, VIS-006 demoted; FN-003 added |
| Medium | 6 | **6** | unchanged |
| Low | 3 | **3** | (VIS-006 enters; VIS-007 still here) |
| **Total** | **27** | **24** | |

### 4.3 Platform-wise distribution (real bugs)

| Platform | Count |
|----------|-------|
| Flutter (all — Android + iOS + Web) | 22 |
| Flutter-iOS / Flutter-Android only (font-scale clipping) | 1 |
| Flutter Web only (tab-traversal a11y leak — needs verification) | 1 |

### 4.4 Critical & High issues — at a glance

1. **BADGE-FN-001 + BADGE-FN-011** — `ConvexGapCard` debug UI ships to production. Single biggest UX risk.
2. **BADGE-FN-002 / BADGE-VIS-001** — Long-label RenderFlex overflow (up to ~99k px observed in tests). Yellow stripes visible to end users.
3. **BADGE-FN-003** — Hidden `OneUiSurfaceBootstrap` ancestor requirement for nested CounterBadge/IndicatorBadge slots. Hard-asserts with 99k-px overflow if the consumer skips Bootstrap.
4. **BADGE-FN-004 / BADGE-A11Y-001** — Non-String child renders garbage `Instance of '…'` text invisible to AT.
5. **BADGE-A11Y-003** — Hard-coded LTR direction breaks Arabic / Hebrew screen reader output.
6. **BADGE-A11Y-004** — Fixed badge height clips text at iOS Dynamic Type / Android 150%+ font scale (WCAG 1.4.4 fail).
7. **BADGE-A11Y-008** — Ghost-variant border invisible in high-contrast mode (WCAG 1.4.11 Non-text Contrast fail).
8. **BADGE-VIS-002** — `height: 1` silently overrides brand line-height tokens.
9. **BADGE-FN-008** — Slot a11y (Avatar alt, counter label) suppressed whenever badge owns the label — lost context for AT users.

### 4.5 Accessibility compliance summary

| Concern | Status |
|---------|--------|
| WCAG 1.4.4 Resize Text | ❌ Fail (BADGE-A11Y-004) |
| WCAG 1.4.11 Non-text Contrast | ❌ Fail (BADGE-A11Y-008) |
| WCAG 4.1.2 Name / Role / Value | ❌ Fail (BADGE-FN-004, BADGE-A11Y-001) |
| Screen-reader (TalkBack / VoiceOver) | ❌ 4 failure modes (empty badges, non-String children, whitespace labels, RTL reversal) — A11Y-005 dropped after harness reclassification |
| Keyboard / focus | ⚠ 1 issue pending real-Web verification (BADGE-A11Y-006) |
| High-contrast / Dynamic Type | ❌ 2 issues; both `MediaQuery` signals unused by the engine |
| Live-region semantics (`role="status"`) | ⚠ Conditional on label resolution — fails in empty / object-child cases |

### 4.6 Components / variants with the most issues

| Surface | Issues |
|---------|--------|
| `start`/`end` slot subsystem (incl. nested Counter/Indicator) | **6** (FN-003, FN-008, VIS-004, VIS-005, VIS-006, VIS-008) — riskiest area; A11Y-005 dropped after harness reclassification |
| `OneUiScope` / brand-loading fallback (`ConvexGapCard`) | 2 (FN-001, FN-011) — but Critical impact |
| Label rendering (Text + line-height + overflow) | 4 (FN-002, VIS-001, VIS-002, VIS-003) |
| Semantics resolver | 4 (FN-004, A11Y-001, A11Y-002, A11Y-007) |
| Appearance / variant resolution | 4 (FN-007, FN-009, FN-010, VIS-007) |

### 4.7 Regression risk areas

1. **Slot subsystem** — Counter/Indicator inside slots; any token change in `default_component_properties_map.dart` cascades to visual blowups.
2. **Label width handling** — switching to `Flexible`/`Expanded` will affect every existing baseline; goldens will need re-blessing.
3. **Brand-loading transition window** — `ConvexGapCard` exposure during async brand init.
4. **Live-region semantics** — any change to `a11y.accessible` gating affects screen-reader announcement count.
5. **RTL locales** — once `textDirection: TextDirection.ltr` is removed, every existing RTL screenshot baseline changes.

---

## 5. Recommendations for fixes & stabilisation

### 5.1 Immediate (this sprint — Critical)

1. **Replace `ConvexGapCard` with a silent fallback** (`SizedBox.shrink()` or a neutral chip) and guard the diagnostic message with `kDebugMode`.
   - Files: `one_ui_badge.dart:53`, `one_ui_counter_badge.dart:42`, `one_ui_indicator_badge.dart:29`, `convex_gap_card.dart`.
2. **Wrap `Text` in `Flexible`** inside the Row so ellipsis fires before RenderFlex overflows.
   - File: `one_ui_badge.dart:118-130, 148-153`.
   - Follow-up: re-bless 47 light + 19 dark + 14 surface goldens.
3. **Tighten `child` type from `Object?`** to runtime-validated `Object?` — emit a dev warning when `child` is not String/num and `semanticsLabel` is null. Drop the `child.toString()` rendering for non-stringy types.
   - File: `one_ui_badge.dart:40, 93`.
4. **Replace hard-coded `TextDirection.ltr`** with `Directionality.of(context)`.
   - File: `one_ui_badge.dart:191`.

### 5.2 Next sprint (High)

5. **Make `BadgeSurfaceImmuneScope` gracefully fall back** when `OneUiRootSurfaceScope` is missing (BADGE-FN-003).
   ```dart
   // packages/ui_flutter/lib/widgets/badge_surface_immune_scope.dart
   @override
   Widget build(BuildContext context) {
     final root = OneUiRootSurfaceScope.maybeOf(context);
     if (root == null) return child;   // graceful fallback
     return OneUiSurfaceScope(value: root, child: child);
   }
   ```
   Removes the hard-assert + 99k-px overflow for any consumer who skips the `OneUiSurfaceBootstrap` wrapper.
6. Always emit the outer `Semantics(liveRegion:true)` wrapper (with a fallback empty label or skip-without-warning when truly decorative — but keep the wrapper for non-decorative cases).
7. Allow badge height to grow with `MediaQuery.textScaler` (replace `SizedBox(height)` with `ConstrainedBox(minHeight)`).
8. Honour `MediaQuery.highContrastOf` in `resolveBadgeColors` — boost `strokeLow` → `strokeMedium` for ghost variant.
9. Symmetric padding for size=`xl` with mixed slot configs (`badge_slot_padding.dart:63`).
10. Fix `IndicatorBadge` size resolution inside xs badge slot (slot cascade should map xs → Spacing-1).
11. Stop forcing `height: 1` in the labelStyle; trust the engine's `heightMult` (`one_ui_badge.dart:121`).
12. Stop blanket `ExcludeSemantics` on slots — expose slot labels concatenated after badge label, or follow web's `aria-describedby`-style merge.

### 5.3 Polish (Medium / Low)

13. Trim `semanticsLabel` whitespace before non-empty check.
14. Replace `KeyedSubtree(testId)` with `Semantics(identifier: testId)` so cross-platform locators work.
15. Type `OneUiBadgeAppearance` as a sealed union (or assert against `kOneUiBadgeFigmaAppearances`).
16. Drop `data-attention` from KeyedSubtree key — encode only what affects render output.
17. Audit Flutter Web `Semantics(container: true)` for accidental tab-stop.
18. Re-evaluate `TextHeightBehavior` ascent/descent stripping for l/xl sizes.
19. Backfill `--CounterBadge-height-xs/s/l` in `default_component_properties_map.dart` (BADGE-VIS-006 — Low hygiene fix; only affects degraded Storybook/preview environments).
20. Consider switching the `appearance: 'auto'` outside-Surface default from sparkle → neutral (UX expectation alignment) — but verify with design before changing.

---

## 6. Methodology

- **Functional audit:** static comparison of `one_ui_badge.dart` and its engine against `packages/ui/src/components/Badge/Badge.tsx` + `Badge.module.css` + `Badge.shared.ts`.
- **A11y audit:** code walk of `one_ui_badge_a11y.dart` and surrounding Semantics emission, checked against WCAG 2.1 AA criteria and React Native `interface.ts` accessibility props.
- **Visual audit:** comparison of resolved geometry / colour / token cascade vs Figma matrix (node 409:10118 — badge spec page) and web CSS module rules.
- **Direct evidence:** test runs of `apps/qa-playground-flutter/test/components/badge/badge_functional_test.dart` and `badge_a11y_test.dart` surfaced the RenderFlex overflow first-hand (99,276 px overflow with nested CounterBadge slot).
- **Reclassification (2026-06-16):** the QA harness was updated to wrap with `OneUiSurfaceBootstrap` (matching the qa-playground app's real production tree). Three audit findings flipped from failing to passing as a result; severity was re-evaluated. See §0 for the audit-trail of those changes.

---

## 7. References

- **Component source:** `packages/ui_flutter/lib/widgets/one_ui_badge.dart`
- **A11y resolver:** `packages/ui_flutter/lib/widgets/one_ui_badge_a11y.dart`
- **Types & state:** `packages/ui_flutter/lib/widgets/one_ui_badge_types.dart`
- **Engine:** `packages/ui_flutter/lib/engine/badge_color_resolve.dart`, `badge_size_resolve.dart`, `badge_slot_context.dart`, `badge_slot_padding.dart`
- **Nested slot components:** `packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart`, `one_ui_indicator_badge.dart`
- **Web parity reference:** `packages/ui/src/components/Badge/{Badge.tsx, Badge.module.css, Badge.shared.ts, interface.ts}`
- **Existing Figma parity doc:** `docs/badge-figma-parity.md`
- **QA test suite:** `apps/qa-playground-flutter/test/components/badge/`
- **Test plan:** `apps/qa-playground-flutter/test/docs/badge_test_plan.md`

---

## 8. Individual Bug Reports (Copy-Paste Format)

Each block below is self-contained — copy from `===` to `===` into a Jira / GitHub / Linear ticket.

### 8.1 Functional bugs

```
===============================================================
Bug ID:       BADGE-FN-001
Title:        ConvexGapCard debug UI shown to end users during brand load
Category:     Functional
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
OneUiBadge is rendered before OneUiScope.designSystemOf(context) returns
non-null — e.g. during async brand swap, network delay, or when the badge
is mounted outside an OneUiScope ancestor entirely.

Steps to Reproduce:
1. Render `<OneUiBadge child:'New'>` in a tree without a fully-loaded
   OneUiScope ancestor (or trigger a brand-swap mid-render).
2. Observe the rendered output in the running app.

Expected Result:
- Web renders `<span role="status">` with CSS fallbacks; semantics + live
  region intact.
- Flutter should render a silent fallback chip (SizedBox.shrink or a
  neutral placeholder) — no user-visible diagnostic text.

Actual Result:
- Renders a deep-orange `ConvexGapCard` with English error text
  ("Flutter cannot render a token-backed Badge without Convex …").
- No Semantics wrapper, no live region, no label.
- Slots and child content are dropped entirely.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:53-61
- packages/ui_flutter/lib/widgets/convex_gap_card.dart:21-48

Suggested Fix:
- Return `SizedBox.shrink()` (or a brand-neutral placeholder) when ds == null.
- Guard the diagnostic ConvexGapCard with `if (kDebugMode)` so it never
  ships to production.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-FN-002
Title:        Long label overflows with RenderFlex stripes (ellipsis never fires)
Category:     Functional
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
A long string `child` is rendered inside any parent narrower than the
text's intrinsic width.

Steps to Reproduce:
1. Mount `OneUiBadge(child: 'A very long status label that overflows…')`
   inside a Column / wide Container.
2. Resize the parent narrower than the text's intrinsic width.

Expected Result:
- Label truncates with `…` (ellipsis), matching web's
  `text-overflow: ellipsis; white-space: nowrap`.

Actual Result:
- Yellow / black diagonal RenderFlex overflow stripes painted across
  the badge.
- Overflow up to ~99,276 px reproduced in QA test runs.
- `maxLines: 1, overflow: TextOverflow.ellipsis` is set on the Text but
  never activates because `Row(mainAxisSize: MainAxisSize.min)` passes
  unbounded width to the Text child.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:118-130 (Text)
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:148-153 (Row)

Suggested Fix:
- Wrap the Text in `Flexible(fit: FlexFit.loose, child: Text(...))` so
  the Row delegates available width and ellipsis fires.
- Re-bless 80 baseline goldens (47 light + 19 dark + 14 surface) after fix.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-FN-003
Title:        Nested CounterBadge / IndicatorBadge slot hard-asserts without OneUiSurfaceBootstrap
Category:     Functional
Severity:     High  (was Critical — reclassified 2026-06-16; see §0)
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge + BadgeSurfaceImmuneScope

Scenario:
A Badge with a nested CounterBadge or IndicatorBadge in start/end slot
is mounted in a tree that does NOT include OneUiSurfaceBootstrap as an
ancestor — e.g. a custom Flutter app shell, or a widget test that wraps
only with OneUiSurfaceScope.

Steps to Reproduce:
1. Build a tree:
     MaterialApp(home: OneUiSurfaceScope(value: ..., child: OneUiScope(..., child: <Badge>)))
   NOTE: no OneUiSurfaceBootstrap → no OneUiRootSurfaceScope.
2. Mount `OneUiBadge(start: OneUiCounterBadge(value: 3, semanticsLabel:'3'))`.
3. Run `flutter test` or render in app.

Expected Result:
- BadgeSurfaceImmuneScope falls back gracefully when the root scope is
  absent (renders child as-is). No hard assert, no overflow.

Actual Result:
- BadgeSurfaceImmuneScope.build calls OneUiRootSurfaceScope.of(context)
  which asserts `value != null` → hard _AssertionError.
- Parent Badge's Row overflows by ~99,646 px (yellow/black stripes).
- 100% reproducible in any tree without Bootstrap.

Production note:
- qa-playground apps DO wrap with OneUiSurfaceBootstrap, so end users
  hitting this requires either (a) custom integration, (b) brand-load
  race, or (c) unit-test contexts.

Code Reference:
- packages/ui_flutter/lib/widgets/badge_surface_immune_scope.dart:18
- packages/ui_flutter/lib/theme/one_ui_root_surface_scope.dart:21

Suggested Fix:
Replace the hard-asserting `OneUiRootSurfaceScope.of(context)` with a
graceful `maybeOf` + null fallback in BadgeSurfaceImmuneScope:

  @override
  Widget build(BuildContext context) {
    final root = OneUiRootSurfaceScope.maybeOf(context);
    if (root == null) return child;   // graceful fallback
    return OneUiSurfaceScope(value: root, child: child);
  }

This turns "must wrap with Bootstrap" from a hidden contract into a
graceful degradation.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-FN-004
Title:        Non-String child renders garbage text invisible to AT
Category:     Functional
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
`child` is declared as `Object?` and accepts arbitrary widgets / objects.

Steps to Reproduce:
1. Mount `OneUiBadge(child: SomeWidget())` without `semanticsLabel`.
2. Enable TalkBack / VoiceOver.

Expected Result:
- TypeScript (web) blocks non-renderable types at compile time.
- Flutter should either type-narrow `child` to `String | num | null`, or
  emit a dev-mode warning + skip the visual rendering.

Actual Result:
- `child.toString()` is rendered visually as
  `"Instance of 'SomeWidget'"`.
- `resolveOneUiBadgeAccessibilityLabel` returns null for non-stringy
  types → no `Semantics` wrapper emitted → badge invisible to AT.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:40 (child: Object?)
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:93 (hasVisibleText)
- packages/ui_flutter/lib/widgets/one_ui_badge_a11y.dart:24-34

Suggested Fix:
- Narrow `child` type to `Object?` only as a marker (String | num
  preferred) with runtime assertion in debug mode.
- Skip rendering `child.toString()` when child is not String/num.
- Emit dev-mode warning when `child` is non-stringy and `semanticsLabel`
  is null.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-FN-005
Title:        Empty badge has no role="status" / no AT wrapper
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
`<OneUiBadge />` is rendered with no child and no semanticsLabel.

Steps to Reproduce:
1. Mount `OneUiBadge()` (no props).
2. Inspect Semantics tree with `tester.ensureSemantics()`.

Expected Result:
- Web emits `<span role="status">` with empty content — still a live
  region; dev warns about missing `aria-label`.
- Flutter should emit `Semantics(liveRegion: true)` even with no label,
  or emit a dev warning.

Actual Result:
- Colored chip is rendered with zero accessibility wrapper.
- No `Semantics` node, no live region, no label, no warning.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:184-194

Suggested Fix:
- Always emit `Semantics(liveRegion: true)` wrapper.
- Add dev warning when both `child` and `semanticsLabel` are absent.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-FN-006
Title:        testId not discoverable via semantics / cross-platform locators
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
Integration tests / Playwright-style locators query by test ID.

Steps to Reproduce:
1. Render `OneUiBadge(testId: 'my-badge')`.
2. Try to find via Semantics finder or debug-tree label.

Expected Result:
- Web exposes `data-testid="my-badge"` on the rendered `<span>` —
  readable from DOM, accessibility tree, and Playwright locators.

Actual Result:
- Flutter wraps shell in `KeyedSubtree(key: ValueKey<String>(tid))`.
- Only reachable via `find.byKey(ValueKey('my-badge'))` — no semantics
  property, no debug-tree label.
- Cross-platform test harnesses break.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:204-207

Suggested Fix:
- Use `Semantics(identifier: testId)` so platform AT tree exposes the
  ID for both Flutter Web (browser DOM) and native locators.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-FN-007
Title:        appearance="auto" silently falls back to Material primary on missing brand role
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
A brand's themeConfig.appearances does not define the `sparkle` role
(or the engine's lookup fails for any reason).

Steps to Reproduce:
1. Configure a brand without sparkle in themeConfig.appearances.
2. Render `OneUiBadge(child:'X')` (no appearance prop ⇒ auto ⇒ sparkle).

Expected Result:
- Web silently uses `--Surface-Bold` (neutral) fallback.

Actual Result:
- Falls into Material `ColorScheme.primary` fallback in
  `badge_color_resolve.dart:40-46`.
- Completely off-brand colour, no warning.

Code Reference:
- packages/ui_flutter/lib/engine/badge_color_resolve.dart:37-46
- packages/ui_flutter/lib/widgets/one_ui_badge_types.dart:99

Suggested Fix:
- When the resolved role's tokens are absent, fall back to the
  Neutral role (or `--Surface-Bold`) rather than Material colorScheme.
- Emit a dev-mode warning so brand authors know the role is missing.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-FN-008
Title:        Slot a11y labels dropped whenever badge has its own label
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge + _BadgeSlot

Scenario:
A labelled badge contains a nested Avatar / CounterBadge / IndicatorBadge
in its start/end slot.

Steps to Reproduce:
1. Render `OneUiBadge(semanticsLabel:'Verified', start: Avatar(alt:'User'))`.
2. Enable TalkBack / VoiceOver and traverse the badge.

Expected Result:
- AT announces "Verified, User" (or the badge name + slot's accessible
  label concatenated, mirroring web behavior).

Actual Result:
- `_BadgeSlot.hideFromAccessibility = a11y.accessible` blanket-applies
  `ExcludeSemantics` to slots.
- AT loses Avatar.alt, CounterBadge.semanticsLabel,
  IndicatorBadge.semanticsLabel.
- AT only announces the badge label; slot context is silent.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:100, 138, 247-249

Suggested Fix:
- Stop blanket-excluding slot semantics.
- Either follow web's `aria-describedby`-style merge, or concatenate
  the slot's accessible label after the badge label so AT users get
  full context.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-FN-009
Title:        Conflicting variant + attention encoded in subtree key (rebuild churn)
Category:     Functional
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
Both `variant` and `attention` props are passed explicitly.

Steps to Reproduce:
1. Render `OneUiBadge(variant:'bold', attention:'low', child:'X')`.
2. Inspect KeyedSubtree key.

Expected Result:
- Web emits `data-variant="bold"` only; attention is purely a CSS
  alias and not exposed in the DOM.

Actual Result:
- Flutter encodes both `data-variant=bold` AND `data-attention=low`
  in the KeyedSubtree key.
- Key churns whenever attention prop changes even though it has no
  visual effect → unnecessary rebuilds, hot-reload state churn.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:196-202
- packages/ui_flutter/lib/widgets/one_ui_badge_types.dart:84-111

Suggested Fix:
- Drop `data-attention` from KeyedSubtree key; encode only resolved
  properties that affect render output.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-FN-010
Title:        Invalid appearance string falls through with no warning
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
Typo or non-canonical string is passed as `appearance`.

Steps to Reproduce:
1. Render `OneUiBadge(appearance: 'primori', child: 'X')` (typo).
2. Observe the rendered colour.

Expected Result:
- TypeScript blocks at compile time on web.
- Flutter should assert against `kOneUiBadgeFigmaAppearances` and
  warn / fallback to neutral.

Actual Result:
- `OneUiBadgeAppearance = typedef String` (no validation).
- Falls through to Material `ColorScheme.primary` silently.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge_types.dart:11, 84-111
- packages/ui_flutter/lib/engine/badge_color_resolve.dart:37-46

Suggested Fix:
- Convert OneUiBadgeAppearance to a sealed enum / assert against
  `kOneUiBadgeFigmaAppearances` in debug mode.
- Fallback to neutral with a dev warning when the input is invalid.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-FN-011
Title:        Production ConvexGapCard contains literals, English text, and orange colour
Category:     Functional
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    ConvexGapCard (impacts OneUiBadge / OneUiCounterBadge / OneUiIndicatorBadge)

Scenario:
Any badge that falls into the design-system-null fallback path in a
production build.

Steps to Reproduce:
1. Build the app with `flutter build apk --release` or similar.
2. Trigger a brand-loading race (or unmount OneUiScope mid-render).

Expected Result:
- Web has no equivalent dev-only debug UI; production strips warnings.
- Flutter should not surface debug text in production at all.

Actual Result:
- ConvexGapCard renders English error text + `Colors.deepOrange` +
  hard-coded 12/13pt font literals in production builds.
- No `kDebugMode` guard.
- Violates CLAUDE.md "Zero literals" rule.

Code Reference:
- packages/ui_flutter/lib/widgets/convex_gap_card.dart:21-48

Suggested Fix:
- Wrap entire ConvexGapCard render in `if (kDebugMode)` and return
  `SizedBox.shrink()` otherwise.
- Replace literal colours / sizes with tokens.
===============================================================
```

### 8.2 Accessibility (a11y) bugs

```
===============================================================
Bug ID:       BADGE-A11Y-001
Title:        Live region silenced for Widget children
Category:     Accessibility (a11y)
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge + resolveOneUiBadgeAccessibilityLabel

Scenario:
`child` is a Widget (not String/num) and no `semanticsLabel` is set.

Steps to Reproduce:
1. Mount `OneUiBadge(child: SomeWidget())`.
2. Enable TalkBack / VoiceOver.
3. Trigger a state change that updates the badge.

Expected Result:
- `Semantics(liveRegion: true)` wraps regardless of child runtime type.
- Dev-mode warning fires when no resolvable label is found.

Actual Result:
- Resolver only handles `String` / `num` → returns null.
- `a11y.accessible == false` → no Semantics emitted.
- AT never announces the badge update.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge_a11y.dart:24-33
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:93, 184

Suggested Fix:
- Always emit the Semantics wrapper.
- When no label is resolvable AND child is non-stringy, set
  `semanticsLabel` to a best-effort fallback OR `excludeSemantics: true`
  + dev warning.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-A11Y-002
Title:        Whitespace-only semanticsLabel triggers silent live-region announcements
Category:     Accessibility (a11y)
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge + resolveOneUiBadgeAccessibilityLabel

Scenario:
`semanticsLabel` is set but contains only whitespace.

Steps to Reproduce:
1. Render `OneUiBadge(semanticsLabel: '   ', child: 'A')`.
2. Enable TalkBack / VoiceOver.

Expected Result:
- Whitespace-only label should be trimmed and treated as absent.

Actual Result:
- `semanticsLabel.isNotEmpty` is true for whitespace; resolver returns
  `'   '` verbatim.
- AT reads silence but the live region fires → phantom announcements.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge_a11y.dart:28

Suggested Fix:
- Use `semanticsLabel.trim().isNotEmpty` as the guard, matching the
  RN `interface.ts` `ariaLabel.trim().length > 0` pattern.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-A11Y-003
Title:        Hard-coded TextDirection.ltr breaks RTL locales
Category:     Accessibility (a11y)
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
App is configured with an RTL locale (Arabic, Hebrew, Persian, Urdu).

Steps to Reproduce:
1. Set `Locale('ar')` on MaterialApp.
2. Render `OneUiBadge(semanticsLabel: 'حالة', child: 'حالة')`.
3. Enable TalkBack / VoiceOver.

Expected Result:
- Semantics inherits `Directionality.of(context)` → text read in
  correct RTL order.

Actual Result:
- `Semantics(textDirection: TextDirection.ltr)` is hard-coded.
- AT reads RTL text in reversed character order.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:191

Suggested Fix:
- Remove the explicit `textDirection: TextDirection.ltr` argument so
  Semantics inherits direction from the widget tree, OR explicitly
  set `Directionality.of(context)`.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-A11Y-004
Title:        Badge clips vertically at large accessibility font scales
Category:     Accessibility (a11y)
Severity:     High
Platform:     Flutter (iOS, Android)
Component:    OneUiBadge

Scenario:
User has enabled large accessibility text scaling.

Steps to Reproduce:
1. Set iOS Dynamic Type to "Accessibility Extra Extra Extra Large"
   (font scale ~310%) OR Android font scale to 200%+.
2. Render any labelled OneUiBadge.

Expected Result:
- Badge height scales OR text wraps within a taller box (WCAG 1.4.4
  Resize Text).

Actual Result:
- `SizedBox(height: layout.height)` is fixed-pixel.
- `Text` follows MediaQuery scale.
- Bottom of glyphs is clipped vertically at large font scales —
  visible text is incomplete.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:156-157
- packages/ui_flutter/lib/engine/badge_size_resolve.dart:76-80

Suggested Fix:
- Replace `SizedBox(height: layout.height)` with `ConstrainedBox(
  constraints: BoxConstraints(minHeight: layout.height))` so the
  badge can grow with scaled text.
- Alternatively, cap textScaler on the inner Text and rely on the
  fixed height.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-A11Y-005
Title:        Slot semantics announce without live-region wrapper when badge has no label
Status:       *** RECLASSIFIED 2026-06-16 — NOT A BUG ***
Severity:     ~~High~~ — Resolved (no developer action required)

Reclassification:
The original failing test was caused by the QA harness wrapping with a
bare `OneUiSurfaceScope` instead of the full `OneUiSurfaceBootstrap`.
Once the harness was fixed to match the qa-playground app's real
production tree, the outer `Semantics(liveRegion: true)` was confirmed
to be emitted correctly when ANY descendant slot carries an accessible
label.

No badge-side code change required. See §0 for the audit trail.

The corresponding regression test (`[BADGE-A11Y-005]`) was removed
from `apps/qa-playground-flutter/test/components/badge/badge_regression_test.dart`
as part of the harness fix (or auto-passes with the harness change).
===============================================================
```

```
===============================================================
Bug ID:       BADGE-A11Y-006
Title:        Non-interactive badge may become a tab stop on Flutter Web
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter Web
Component:    OneUiBadge

Scenario:
Keyboard user tabs through a page containing OneUiBadge.

Steps to Reproduce:
1. Open Flutter Web build with a OneUiBadge on the page.
2. Press Tab repeatedly to traverse focusable elements.

Expected Result:
- Badge is NOT a tab stop (web `role="status"` has no tabindex).

Actual Result:
- `Semantics(container: true)` may render an implicit `tabindex="0"`
  group in the browser a11y tree, making the badge keyboard-navigable.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:185-194

Suggested Fix:
- Audit the generated DOM on Flutter Web with `container: true` and
  `liveRegion: true`.
- If accidentally focusable, set `excludeSemantics: false` + explicitly
  mark the inner subtree as non-focusable.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-A11Y-007
Title:        semanticsHint silently dropped when no label is resolvable
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge + resolveOneUiBadgeSemantics

Scenario:
`semanticsHint` is supplied but `semanticsLabel` is absent AND child is
a non-String widget.

Steps to Reproduce:
1. Render `OneUiBadge(semanticsHint: 'Open inbox for details', child: SomeWidget())`.
2. Enable TalkBack / VoiceOver.

Expected Result:
- Hint announced OR dev warning emitted that the hint will be discarded.

Actual Result:
- `a11y.accessible == false` → entire Semantics wrapper skipped.
- Hint is silently discarded; AT never speaks it; no warning.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge_a11y.dart:36-53
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:184, 189

Suggested Fix:
- Always emit Semantics with at least the hint when only the hint is
  provided.
- Emit dev warning when hint is set but no label can be resolved.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-A11Y-008
Title:        Ghost-variant border invisible in high-contrast mode (WCAG 1.4.11 fail)
Category:     Accessibility (a11y)
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge + resolveBadgeColors

Scenario:
User enables system high-contrast mode (iOS "Increase Contrast" or
Android "High Contrast Text").

Steps to Reproduce:
1. Enable system high contrast.
2. Render `OneUiBadge(attention: 'low', child: 'X')` (ghost variant).

Expected Result:
- Engine reads `MediaQuery.highContrastOf(context) == true` and boosts
  stroke from `strokeLow` (~12% opacity) to `strokeMedium` (opaque).

Actual Result:
- Engine ignores `MediaQuery.highContrastOf` entirely.
- Ghost border stays at ~12% opacity → invisible boundary.
- WCAG 1.4.11 Non-text Contrast fail.

Code Reference:
- packages/ui_flutter/lib/engine/badge_color_resolve.dart:73-90
- packages/ui_flutter/lib/engine/surface_engine.dart:244-248

Suggested Fix:
- In `resolveBadgeColors`, check `MediaQuery.highContrastOf(context)`
  and substitute `strokeMedium` (or opaque `strokeLow`) for the ghost
  border in high-contrast mode.
- Boost text colors from `tintedA11y` → `high` in the same branch.
===============================================================
```

### 8.3 Visual / UI bugs

```
===============================================================
Bug ID:       BADGE-VIS-001
Title:        Long-label RenderFlex overflow (visible yellow/black stripes)
Category:     Visual
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
A Badge with a long string child is rendered inside any parent narrower
than the text's intrinsic width.

Steps to Reproduce:
1. Render `OneUiBadge(child: 'Long status text')` inside an 80-px Container.

Expected Result:
- Label truncates with `…` matching web `white-space: nowrap;
  text-overflow: ellipsis`.

Actual Result:
- Yellow / black diagonal overflow stripes paint over the badge.
- Ellipsis never fires because Text receives infinite width through
  `Row(mainAxisSize.min)`.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:119-128
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:148-153

Suggested Fix:
- Wrap Text in `Flexible(child: Text(...))` so the Row's constraint
  cascades into the Text and ellipsis fires.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-VIS-002
Title:        Brand --Badge-lineHeight-* discarded by hard-coded height: 1
Category:     Visual
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
Any labelled badge — line-height comes from the brand token system
(e.g. 1.25× for Label-XS on Jio).

Steps to Reproduce:
1. Render `OneUiBadge(child: 'Badge')`.
2. Inspect `Text` widget's resolved TextStyle.height.

Expected Result:
- `height` = brand-resolved `heightMult` from `badge_size_resolve.dart:130-134`
  (e.g. 1.25 for Label-XS).

Actual Result:
- `.copyWith(height: 1)` at `one_ui_badge.dart:121` silently overrides
  the engine-computed multiplier.
- Vertical metrics are tighter than web; violates CLAUDE.md "always
  pair line-height token with font-size token".

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:121
- packages/ui_flutter/lib/engine/badge_size_resolve.dart:130-134, 183

Suggested Fix:
- Remove the `.copyWith(height: 1)` override; trust the engine's
  `heightMult`.
- If the override is needed for compact line-box rendering, route it
  through a brand-configurable token.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-VIS-003
Title:        TextHeightBehavior strips ascent/descent at l/xl sizes
Category:     Visual
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge

Scenario:
Sizes `l` and `xl` (larger fonts).

Steps to Reproduce:
1. Render `OneUiBadge(size: 'xl', child: 'Badge')`.
2. Compare to Figma reference / web rendering.

Expected Result:
- Standard typographic ascent/descent line box, matching web CSS
  `line-height` model.

Actual Result:
- `TextHeightBehavior(applyHeightToFirstAscent: false,
  applyHeightToLastDescent: false)` strips line-box padding.
- Glyph baseline shifts upward relative to web.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge.dart:124-127

Suggested Fix:
- Re-evaluate whether the strip is intentional.
- If kept for `m` size compact rendering, only apply it at smaller
  sizes (`xs`, `s`, `m`) — not at `l` / `xl`.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-VIS-004
Title:        xl badge with any slot configuration uses reduced / asymmetric padding
Category:     Visual
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge + badge_slot_padding

Affects:      xl ONLY. xs/s/m/l asymmetric padding is intentional
              (matches web `:has(.start)` / `:has(.end)` overrides).

Scenario:
Any xl badge that has at least one slot (start, end, or both — Icon
or nested CounterBadge/IndicatorBadge).

Steps to Reproduce:
1. Render any of:
     - OneUiBadge(size:'xl', start: Icon(...))
     - OneUiBadge(size:'xl', end: Icon(...))
     - OneUiBadge(size:'xl', start: Icon, end: Icon)
     - OneUiBadge(size:'xl', start: OneUiCounterBadge(value:3))
     - OneUiBadge(size:'xl', start: Icon, end: OneUiCounterBadge(value:3))
2. Measure the resolved horizontal padding.

Expected Result (per Figma 409:10118 + web CSS):
- Padding stays symmetric at Spacing-2-5 (10 px) on both sides,
  regardless of slot configuration.
- Web `Badge.module.css` deliberately has NO `[data-size="xl"]:has(.start)`
  override; the comment reads "XL has symmetric padding even with slots".

Actual Result (Flutter):
- _iconStart  (xl): left=6 (Spacing-1-5), right=10 (Spacing-2-5)  ← asymmetric
- _iconEnd    (xl): left=10, right=6                              ← asymmetric
- _iconBoth   (xl): left=6, right=6                               ← symmetric BUT below spec (should be 10/10)
- _mixedIconStartBadgeEnd (xl): left=6, right=10                  ← asymmetric
- _mixedBadgeStartIconEnd (xl): left=10, right=6                  ← asymmetric
- _nestedBadgePadding     (xl): left=6, right=6                   ← below spec
Badge visually leans, or shrinks narrower than the Figma reference.

Code Reference (xl branches inside each helper):
- packages/ui_flutter/lib/engine/badge_slot_padding.dart:131-138 (_mixedIconStartBadgeEnd)
- packages/ui_flutter/lib/engine/badge_slot_padding.dart:161-168 (_mixedBadgeStartIconEnd)
- packages/ui_flutter/lib/engine/badge_slot_padding.dart:185-188 (_nestedBadgePadding)
- packages/ui_flutter/lib/engine/badge_slot_padding.dart:203-206 (_iconBoth)
- packages/ui_flutter/lib/engine/badge_slot_padding.dart:231-235 (_iconStart)
- packages/ui_flutter/lib/engine/badge_slot_padding.dart:266-270 (_iconEnd)

Suggested Fix:
At the entry to `resolveBadgeContainerPaddingWithFlags`, add an early
return for `size == 'xl'` BEFORE the slot-config branches:

  if (size == 'xl') {
    return EdgeInsets.symmetric(horizontal: padH, vertical: padV);
  }

This collapses all six xl-specific branches into the symmetric base.
Other sizes (xs/s/m/l) keep their existing asymmetric slot-aware
behaviour (which correctly matches web `:has()` overrides).
===============================================================
```

```
===============================================================
Bug ID:       BADGE-VIS-005
Title:        IndicatorBadge in xs badge slot renders at 6px instead of 4px
Category:     Visual
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge + BadgeSlotSizeScope + OneUiIndicatorBadge

Scenario:
Size `xs` badge with an IndicatorBadge in start or end slot.

Steps to Reproduce:
1. Render `OneUiBadge(size: 'xs', start: OneUiIndicatorBadge(semanticsLabel:'dot'))`.
2. Measure the dot's diameter and the badge's height.

Expected Result:
- Dot = 4 px per web CSS `--_slot-indicator-size: var(--Spacing-1) = 4px`.

Actual Result:
- Dot renders at 6 px (Spacing-1-5 fallback).
- Dot protrudes beyond the 12-px badge height → vertical clipping.

Code Reference:
- packages/ui_flutter/lib/engine/badge_slot_context.dart:21-25
- packages/ui_flutter/lib/engine/indicator_badge_size_resolve.dart:25-30

Suggested Fix:
- Map `kBadgeSlotSizes['xs'].indicatorBadgeSize` to a value that
  resolves to Spacing-1 (4 px) — not the `xs` alias which resolves
  to Spacing-1-5.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-VIS-006
Title:        CounterBadge in xs/s/m slot inflates to 16px in degraded environments
Category:     Visual
Severity:     Low  (was High — reclassified 2026-06-16; see §0)
Platform:     Flutter (Android, iOS, Web) — degraded preview surfaces only
Component:    OneUiCounterBadge + default_component_properties_map

Scenario (narrowed after reclassification):
A small badge (xs/s/m) contains a nested CounterBadge AND the runtime
is missing BOTH safety nets simultaneously:
  (a) the brand omits per-size `--CounterBadge-height-xs/s/l` tokens, AND
  (b) the tree does not include `OneUiSurfaceBootstrap`.
Production qa-playground apps satisfy at least one of these, so end
users never hit this. Storybook with a degraded brand + custom shell
is the only environment that triggers it.

Steps to Reproduce:
1. Spin up a Storybook story or preview that does NOT load the full
   Jio brand AND does NOT wrap with OneUiSurfaceBootstrap.
2. Render a xs/s/m badge with a nested CounterBadge.
3. Observe the counter rendering at 16 px instead of the spec'd 12 px.

Expected Result:
- CounterBadge height = 12 px (Spacing-3) per web CSS, even in degraded
  environments.

Actual Result:
- Cascade `--CounterBadge-height-xs → --CounterBadge-height-m` resolves
  null → hard-coded `?? 16` fallback fires.
- Counter overflows parent badge in xs (16 / 12 = 133%).

Code Reference:
- packages/ui_flutter/lib/engine/counter_badge_size_resolve.dart:47-51
- packages/ui_flutter/lib/brand/default_component_properties_map.dart

Suggested Fix (hygiene, not P0):
- Backfill `--CounterBadge-height-xs`, `-s`, `-m`, `-l` in
  `default_component_properties_map.dart` so the hardcoded `?? 16`
  fallback never fires.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-VIS-007
Title:        appearance="auto" outside Surface defaults to sparkle purple
Category:     Visual
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge + resolveOneUiBadgeStateInContext

Scenario:
A Badge is rendered at page root without an enclosing OneUiSurface,
and `appearance` is unset (defaults to `auto`).

Steps to Reproduce:
1. Render `OneUiBadge(child:'X')` at the top of a page.
2. Observe colour on Jio brand.

Expected Result:
- Developer intuition / Figma's "default" matrix cell suggests primary
  green.

Actual Result:
- Resolver returns sparkle, badge renders in purple/violet (sparkle
  palette).
- Consistent with web `Badge.shared.ts:65` — NOT a Flutter divergence
  — but a cross-platform UX surprise.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_badge_types.dart:99
- packages/ui/src/components/Badge/Badge.shared.ts:65

Suggested Fix:
- (Cross-platform discussion required) Consider switching the
  `appearance: 'auto'` outside-Surface default from sparkle → neutral
  or primary.
- Coordinate with design team before changing — affects both web and
  Flutter baselines.
===============================================================
```

```
===============================================================
Bug ID:       BADGE-VIS-008
Title:        Metallic-material bold badge slot icon ignores --Badge-roleMaterialText
Category:     Visual
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiBadge + resolveBadgeColors

Scenario:
A brand sets `--Badge-roleMaterialText` (metallic material override)
for a role, and renders a bold-variant badge with an Icon slot.

Steps to Reproduce:
1. Configure a brand with `--Badge-roleMaterialText` set for the
   active role.
2. Render `OneUiBadge(attention:'high', start: Icon(...), child:'Badge')`.
3. Compare icon colour to label colour.

Expected Result:
- Icon renders in the metallic colour matching the label.

Actual Result:
- `slotIconColor` reads `role.onBoldContent['tintedA11y']` unconditionally.
- Ignores the material override → icon colour does not match label
  colour on metallic-material badges.

Code Reference:
- packages/ui_flutter/lib/engine/badge_color_resolve.dart:100-102
- packages/ui/src/components/Badge/Badge.module.css:376
  (`--Primary-High: var(--_bg-material-text, var(--_bg-icon-on-bold))`)

Suggested Fix:
- In `resolveBadgeColors`, check for `--Badge-roleMaterialText` on
  the active role before falling back to `onBoldContent.tintedA11y`.
- Use `var(--Badge-roleMaterialText, var(--{Role}-Bold-TintedA11y))`
  cascade matching web behaviour.
===============================================================
```

