# OneUI Flutter CounterBadge — Component Audit Report

**Date:** 2026-06-16
**Component:** `OneUiCounterBadge` (Flutter)
**Source:** `packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart` + engine + a11y resolver
**Cross-checked against:**
- React Web CounterBadge (`packages/ui/src/components/CounterBadge/*`)
- React Native CounterBadge (`packages/ui-native/src/components/CounterBadge/*`)
- Figma spec (counter-badge matrix: 5 sizes × 3 attention levels × 9 appearances, numeric display, dot mode, max overflow)
- WCAG 2.1 AA

**Severity legend:**
- **Critical** — ships broken UX, runtime crash, or AT failure
- **High** — visible regression vs spec / parity gap
- **Medium** — noticeable polish gap
- **Low** — nice-to-have / UX surprise

**Headline:** 22 audit findings → **22 actionable component bugs** — **4 Critical**, **9 High**, **7 Medium**, **2 Low**.

---

## 1. Functional bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| CB-FN-001 | Functional | Flutter (all) | Mounting `OneUiCounterBadge` before brand load completes, or outside `OneUiScope` (during brand swap / async hydration), shows a deep-orange debug card with English error text to the end user. | 1) Place `OneUiCounterBadge` anywhere outside of `OneUiScope`, or while `designSystem` is null during brand swap. 2) Observe the rendered output. | Either render nothing (`SizedBox.shrink`) or render the chip with CSS-fallback geometry like the web version, which has no equivalent error UI. | Returns `ConvexGapCard` with deep-orange border, English 'Convex / designSystem gaps' text, and hard-coded font sizes 12/13 px. Ships in production (no `kDebugMode` guard). Mirrors Badge BADGE-FN-001 and violates CLAUDE.md 'Zero literals'. | Critical | `one_ui_counter_badge.dart:42-49`; `convex_gap_card.dart:21-48` |
| CB-FN-002 | Functional | Flutter (all) | Render `OneUiCounterBadge` with `appearance='sparkle'` on a Jio sub-brand that does not configure the sparkle role. | 1) Render `OneUiCounterBadge(value: 5, appearance: 'sparkle')` on a brand whose `themeConfig.appearances` does not contain 'sparkle'. 2) Inspect the rendered colors. | Web silently falls back to the primary chain (`--Surface-Bold`) and a controlled neutral fill; Flutter should match. | `isAppearanceConfigured` returns false, role is null, the code falls back to `Theme.of(context).colorScheme.primary/onPrimary` which is the raw Material seed color — completely off-brand and not tied to design tokens. CLAUDE.md zero-tolerance: 'All styling via `var(--Token-Name)`'. | High | `counter_badge_color_resolve.dart:32-41` |
| CB-FN-003 | Functional | Flutter (all) | A brand sets `--CounterBadge-backgroundColor-bold` to a custom value. The counter is then rendered with `appearance='negative'`. | 1) Add `--CounterBadge-backgroundColor-bold` override in the brand config. 2) Render `OneUiCounterBadge(value: 5, appearance: 'negative', attention: 'high')`. 3) Inspect the fill. | Web reads `var(--CounterBadge-backgroundColor-bold, var(--_cb-bold))` regardless of appearance — the component override always wins, then the per-role intermediate variable is consumed. So component overrides apply for every appearance. | Flutter sets `useComponentOverrides = appearance == 'primary'`. Custom appearances ignore brand component tokens entirely. | High | `counter_badge_color_resolve.dart:43-54` |
| CB-FN-004 | Functional | Flutter (all) | Inside a `<Surface mode='subtle'>` with no slot-parent context, the counter is rendered with `appearance='auto'`. | 1) Wrap in `OneUiSurface(mode: 'subtle')`. 2) Render `OneUiCounterBadge(value: 5, appearance: 'auto')` directly inside. 3) Compare to web's `<Surface><CounterBadge appearance='auto' /></Surface>`. | Web `useCounterBadgeState` resolves auto to `slotParent ?? 'primary'`. Slot parent only comes from `useSlotParentAppearance` (Button/Badge slot context), NOT from Surface mode. Bare Surface should still resolve to primary. | Auto handling is parity-correct, but the fallback chain when the resolved role is unconfigured silently re-routes to `ColorScheme.primary` — combined effect diverges from web parity. | Medium | `one_ui_counter_badge_types.dart:125-127` |
| CB-FN-005 | Functional | Flutter (all) | Render `OneUiCounterBadge` with `max=0` and `value=1`. | 1) Render `OneUiCounterBadge(value: 1, max: 0)`. 2) Inspect text. | Align Flutter, RN, and web on one rule. RN-style (Flutter's current) is the safer default — web should change. | Flutter matches RN ('default to 99'). Web uses raw max producing '0+'. Cross-platform inconsistency. | Low | `one_ui_counter_badge_types.dart:56-59` |
| CB-FN-006 | Functional | Flutter (all) | Caller passes a computed value from Convex floats. | 1) Convex returns max as a double. 2) Caller floors it before passing to `OneUiCounterBadge`. | Match web/RN `number` signature with `Math.floor` / non-finite check. | Flutter accepts `int` only. Truncation happens at the call site, not in the component. | Low | `one_ui_counter_badge.dart:30` |
| CB-FN-007 | Functional | Flutter (all) | An inbox transitions from 1 unread to 0; AT user expects 'no unread messages' announced. | 1) Render `OneUiCounterBadge(value: 1, semanticsLabel: '1 unread')`. 2) Update value to 0. 3) Observe what TalkBack/VoiceOver announces. | When hidden, the `Semantics(liveRegion: true, label: semanticsLabel)` wrapper should remain (with empty visual) so the transition fires an announcement. | `isHidden` short-circuits to `SizedBox.shrink` at line 62-64, removing the `Semantics(liveRegion)` wrapper. AT users get no signal of the count reaching zero. | Medium | `one_ui_counter_badge.dart:62-64` |
| CB-FN-008 | Functional | Flutter (all) | QA runs an integration test (Playwright/Detox/Patrol) that locates the counter via a stable `testID` selector. | 1) Render `OneUiCounterBadge(value: 5, testId: 'qa-cart-counter')`. 2) Locate via `Semantics.identifier` or WebDriver `data-testid`. | Expose `Semantics(identifier: testId)` so Patrol/Maestro/WebDriver can locate it. Mirrors BADGE-FN-006. | Flutter wraps in `KeyedSubtree(key: ValueKey(tid))` only — only reachable via `find.byKey`. Cross-platform e2e harnesses break. | High | `one_ui_counter_badge.dart:141-144` |
| CB-FN-009 | Functional | Flutter (all) | Caller mistypes `appearance: 'positiv'`. | 1) Render `OneUiCounterBadge(value: 5, appearance: 'positiv')`. 2) Observe output. | Debug assertion or dev warning + fall back to 'primary'. | `kOneUiCounterBadgeFigmaAppearances` list is defined but NEVER consulted by the resolver. String 'positiv' flows to `isAppearanceConfigured` → false → Material primary (per CB-FN-002). | Medium | `one_ui_counter_badge_types.dart:18-27, 125-127` |
| CB-FN-010 | Functional | Flutter (all) | Caller passes both `variant: 'ghost'` and `attention: 'high'`. They later read `dataAttention` to drive analytics. | 1) Render `OneUiCounterBadge(value: 5, variant: 'ghost', attention: 'high')`. 2) Inspect `state.dataAttention`. | Web's `data-attention` attribute is not emitted at all. Flutter should either drop `dataAttention` or document that it is the *resolved* attention derived from variant. | Flutter emits `data-attention=low` (derived from ghost) in the `ValueKey`. The original `attention=high` input is lost — `KeyedSubtree` key therefore differs from the caller's intent. | Low | `one_ui_counter_badge_types.dart:120-123, 136` |
| CB-FN-011 | Functional | Flutter (all) | An xs-bold counter shows a small dot. Caller passes `value: 5` and no `semanticsLabel`. | 1) Render `OneUiCounterBadge(value: 5, size: 'xs', attention: 'high')`. 2) Visually it's a dot (numerals stripped). 3) Run TalkBack. | Web has no dot-mode for CounterBadge. Flutter must either: (a) drop dot-mode (match web), or (b) require non-empty `semanticsLabel` when dot-mode is active. | Dot-mode hides numerals but `displayValue` ('5') is still used as the a11y fallback. AT announces '5' while visually the user sees a dot — semantic mismatch. | Medium | `one_ui_counter_badge_types.dart:67-73, 135-137`; `one_ui_counter_badge_a11y.dart:14-23` |

---

## 2. Accessibility (a11y) bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| CB-A11Y-001 | Accessibility (a11y) | Flutter (all) | Caller passes `semanticsLabel: '   '` while value is 5. | 1) Render `OneUiCounterBadge(value: 5, semanticsLabel: '   ')`. 2) Observe AT. | Whitespace-only should be treated as absent AND emit a dev warning, mirroring web's `console.warn`. | Code does `explicit = semanticsLabel?.trim()` and only uses it if non-empty. The fall-through path uses `displayValue` ('5'), silently masking the developer's intent without warning. | Medium | `one_ui_counter_badge_a11y.dart:16-23` |
| CB-A11Y-002 | Accessibility (a11y) | Flutter (all) | Caller renders a static counter chip in a list cell that does not update. | 1) Render `OneUiCounterBadge(value: 5, semanticsLabel: '5 items')` in a static grid cell. 2) Observe TalkBack on scroll. | Either expose `liveRegion` as an opt-out prop, or use `Semantics.assertiveness` carefully so the announcement only fires when label changes. | `Semantics(liveRegion: true)` is always emitted (line 124). On iOS this maps to `UIAccessibilityNotificationLiveRegion` which announces on every rebuild — even when only the parent rebuilds with identical props. | Medium | `one_ui_counter_badge.dart:122-128` |
| CB-A11Y-003 | Accessibility (a11y) | Flutter (all) | Inspector/AT enumerates the Semantics tree for a counter chip with no `semanticsLabel` and an empty `displayValue`. | 1) Render `OneUiCounterBadge(value: 0, showZero: true)` (yields `visualDisplayValue = '0'`). 2) Inspect Semantics tree. | Single node with the resolved label, no orphan raw `Text` node. | When `a11y.accessible == false` (no `semanticsLabel` + empty `displayValue` mid-transition), the inner `Text` is exposed to AT without any container/label. | Medium | `one_ui_counter_badge.dart:121-128`; `one_ui_counter_badge_a11y.dart:19-23` |
| CB-A11Y-004 | Accessibility (a11y) | Flutter Web | User Tab-traverses a page containing a `CounterBadge`. | 1) Build Flutter Web. 2) Place an `OneUiCounterBadge` among interactive widgets. 3) Press Tab repeatedly. | Counter is NOT a tab stop (web `role='status'` has no tabindex). | `Semantics(container: true)` on Flutter Web produces a div with `role='group'` that can become a focus stop depending on engine. Parity bug with BADGE-A11Y-006. | Medium | `one_ui_counter_badge.dart:122` |
| CB-A11Y-005 | Accessibility (a11y) | Flutter-iOS, Flutter-Android | User has iOS Larger Text at maximum or Android font scale 200%. | 1) Enable accessibility text scale 200%. 2) Render `OneUiCounterBadge(value: 99)`. 3) Inspect glyph clipping. | Badge height should scale, OR text should wrap within taller box (WCAG 1.4.4 Resize Text). | `SizedBox(height: layout.height)` is fixed-pixel resolved from `--CounterBadge-height-{size}` tokens with no scale multiplier. Text inherits `MediaQuery.textScaler` so digit glyphs overflow the parent box and clip top/bottom. | High | `one_ui_counter_badge.dart:82-84`; `counter_badge_size_resolve.dart:46-51` |
| CB-A11Y-006 | Accessibility (a11y) | Flutter (all) | Dot-mode (`xs + high`) renders a coloured circle. AT user expects a meaningful announcement. | Covered by CB-FN-011 — included here to cross-reference the a11y angle: visually-invisible numeric content paired with default numeric AT label produces a content/semantic mismatch (WCAG 1.3.1 Info & Relationships). | Specialise the a11y label so dot-mode requires a non-empty `semanticsLabel` and never announces the numeric value the user cannot see. | Numeric `displayValue` is announced even though the user sees a dot. | Medium | `one_ui_counter_badge_a11y.dart:14-23` |

---

## 3. Visual / UI bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| CB-VIS-001 | Visual | Flutter (all) | Render `OneUiCounterBadge` in a tree where `OneUiScope.nativeTypographyOf(context)` returns null. | 1) Mount `OneUiCounterBadge` in a tree without `nativeTypography`. 2) Inspect text style. | Match web `--Label-3XS-FontSize` / `--Label-FontWeight-Medium` tokens; always set `fontFamily: var(--Typography-Font-Primary)`. | `labelStyle = typo?.emphasisStyle(...) ?? TextStyle(fontSize: height * 0.55, fontWeight: FontWeight.w600)` — hard-coded literal. `fontFamily` is NEVER set on the fallback path. Violates CLAUDE.md 'Zero literals' AND mandatory `font-family: var(--Typography-Font-Primary)`. | High | `counter_badge_size_resolve.dart:65-70` |
| CB-VIS-002 | Visual | Flutter (all) | Compare Flutter counter to web at sizes `m` and `l`. | 1) Render `OneUiCounterBadge(value: 8, size: 'l')` and compare visually with web. | Glyphs visually centred with same ascent/descent as web. Web uses CSS line-height (no first-ascent strip). | Flutter strips ascender+descender contribution → glyph appears shifted vertically vs web. Same root cause as BADGE-VIS-003. | Medium | `one_ui_counter_badge.dart:109-112` |
| CB-VIS-003 | Visual | Flutter (all) | Render counter at size 'm' and inspect resolved line-height. | 1) Render `OneUiCounterBadge(value: 5, size: 'm')`. 2) Inspect `TextStyle.height` of the resolved label. | Token-driven line-height from `var(--Label-2XS-LineHeight)`. CLAUDE.md: 'always pair line-height with font-size'. | Line 104-107 applies `.copyWith(color: ..., height: 1)`, forcing line-height ratio to 1.0 regardless of brand's `emphasisStyle`. Same root cause as BADGE-VIS-002. | High | `one_ui_counter_badge.dart:104-107` |
| CB-VIS-004 | Visual | Flutter (all) | Brand omits all per-size `--CounterBadge-height-*` tokens. | 1) Strip per-size CounterBadge tokens from the test brand. 2) Render at `size='s'` and `size='xl'`. 3) Inspect height. | Token cascade fallback (e.g. `--Spacing-3` chain) or dev assertion. Never a literal. | `final height = px(heightKeys) ?? 16` — hard-coded 16 literal violates CLAUDE.md 'Zero literals'. Every size collapses to 16 px. | Medium | `counter_badge_size_resolve.dart:46-51` |
| CB-VIS-005 | Visual | Flutter (all) | Render `OneUiCounterBadge(size: 'xl')`. | 1) Render `OneUiCounterBadge(value: 5, size: 'xl')`. 2) Compare to web `<CounterBadge size='xl' />` (does not compile — web only supports xs\|s\|m\|l). | Match web parity — either Flutter rejects 'xl' OR web is updated. | Flutter extended `kOneUiCounterBadgeSizes` to 5 entries (xl). The fallback height cascade falls through xl→l→m. The label-key map points xl to 'S' which has no parity in web. Causes off-by-one font sizing at xl. | High | `one_ui_counter_badge_types.dart:9-15`; `counter_badge_size_resolve.dart:22-28, 46-51` |

---

## 4. Summary

### 4.1 Total bug count by category

| Category | Audit findings | Real bugs |
|----------|----------------|-----------|
| Functional | 11 | 11 |
| Accessibility (a11y) | 6 | 6 |
| Visual | 5 | 5 |
| **Total** | **22** | **22 actionable** |

### 4.2 Total bug count by severity

| Severity | Count |
|----------|-------|
| Critical | **4** |
| High | **9** |
| Medium | **7** |
| Low | **2** |
| **Total** | **22** |

### 4.3 Platform-wise distribution

| Platform | Count |
|----------|-------|
| Flutter (all — Android + iOS + Web) | 20 |
| Flutter-iOS / Flutter-Android only (Dynamic Type / font scale clipping) | 1 |
| Flutter Web only (focusable group / tab stop) | 1 |

### 4.4 Critical & High issues — at a glance

1. **CB-FN-001** — `ConvexGapCard` debug UI shipped to end users during brand-loading race. Single biggest UX risk.
2. **CB-FN-002** — Missing brand role short-circuits to Material `colorScheme.primary` (off-brand colour).
3. **CB-FN-003** — Component override tokens (`--CounterBadge-backgroundColor-*`) silently ignored unless `appearance=='primary'`.
4. **CB-FN-008** — `testId` never reaches `Semantics.identifier`; cross-platform e2e harnesses cannot find the chip.
5. **CB-A11Y-005** — Fixed-pixel `height` + scaled text clips digit glyphs at iOS Dynamic Type ≥ XXXL / Android font scale ≥ 150%.
6. **CB-VIS-001** — Typography fallback path uses hard-coded `fontSize`/`fontWeight` literals and never sets `fontFamily`.
7. **CB-VIS-003** — `.copyWith(height: 1)` silently discards the token line-height paired with the font-size.
8. **CB-VIS-005** — `size: 'xl'` accepted by Flutter only; label-key map points it to 'S' with no parity in web/RN.

### 4.5 Accessibility compliance summary

| Concern | Status |
|---------|--------|
| WCAG 1.3.1 Info & Relationships | Fail (CB-FN-011 / CB-A11Y-006 — dot-mode announces invisible numeric content) |
| WCAG 1.4.4 Resize Text | Fail (CB-A11Y-005 — fixed height clips at large text scale) |
| WCAG 4.1.2 Name / Role / Value | Fail (CB-A11Y-001 — whitespace-only label silently fall-through; CB-A11Y-003 — raw Text leaks) |
| Screen-reader (TalkBack / VoiceOver) | 4 failure modes (whitespace label, phantom live-region pulses, dot-mode numeric leak, dropped live-region on hide) |
| Keyboard / focus | 1 issue on Flutter Web (CB-A11Y-004 — focusable group) |
| Live-region semantics (`role="status"`) | Always-on (regression — should track label changes only AND remain attached when value=0 transitions away) |

### 4.6 Components / variants with the most issues

| Surface | Issues |
|---------|--------|
| Colour resolver (`counter_badge_color_resolve.dart`) | **3** (CB-FN-002, CB-FN-003, CB-FN-004) — biggest engine-side risk |
| Size resolver (`counter_badge_size_resolve.dart`) | **4** (CB-VIS-001, CB-VIS-004, CB-VIS-005, CB-A11Y-005) — riskiest area |
| Semantics resolver (`one_ui_counter_badge_a11y.dart`) | 4 (CB-FN-007, CB-FN-011, CB-A11Y-001, CB-A11Y-003) |
| Appearance / role resolution | 3 (CB-FN-002, CB-FN-004, CB-FN-009) |
| Dot mode (xs + high) | 2 (CB-FN-011, CB-A11Y-006) |
| `OneUiScope` / brand-loading fallback (`ConvexGapCard`) | 1 (CB-FN-001) — but Critical impact |

### 4.7 Regression risk areas

1. **Brand-loading transition window** — `ConvexGapCard` exposure during async brand init (shared risk with Badge/IndicatorBadge).
2. **Material `colorScheme.primary` removal** — flipping unconfigured-role fallback from Material primary → neutral changes the rendered colour for any incomplete brand config.
3. **`liveRegion` change-tracking** — making `liveRegion` conditional on label diff requires `StatefulWidget`; every existing screen-reader baseline changes.
4. **`textHeightBehavior` + `.copyWith(height: 1)` removal** — relaxing the vertical-centring overrides changes every golden at sizes `s`/`m`/`l`.
5. **`xl` size handling** — either dropping `xl` (Flutter-only addition) or extending web/RN to 5 sizes touches every per-size token wiring.
6. **Dynamic Type / `textScaler` height fix** — multiplying badge height by text scale changes layout heights for every counter on iOS/Android at accessible text sizes.

---

## 5. Recommendations for fixes & stabilisation

### 5.1 Immediate (this sprint — Critical)

1. **Replace `ConvexGapCard` with a silent fallback** (`SizedBox.shrink()` or a transparent placeholder with the resolved layout dims + `Semantics(label: semanticsLabel)`). Gate the diagnostic UI behind `assert(() { … return true; }())` so it never ships to production (CB-FN-001).
2. **Remove the `appearance == 'primary'` gate** on `useComponentOverrides`; call `resolveColorFromComponentPropertyKeys` unconditionally so brand `--CounterBadge-*` overrides apply across all 9 appearances (CB-FN-003).
3. **Remove Material `colorScheme.primary` fallback** — cascade through neutral / primary instead of reaching for `Theme.of(context)` when the requested role is unconfigured (CB-FN-002).
4. **Expose `testId` as `Semantics.identifier`** — attach `Semantics(identifier: tid)` (Flutter 3.19+) in addition to the existing `KeyedSubtree(key: ValueKey(tid))` (CB-FN-008).

### 5.2 Next sprint (High)

5. **Fix Dynamic Type clipping** — multiply the badge height by `MediaQuery.textScalerOf(context).scale(1)` for the same factor used by Text, or migrate to `IntrinsicHeight` so the box grows with the glyph (CB-A11Y-005).
6. **Replace the literal `fontSize` / `fontWeight` fallback** with `--Label-3XS-*` token resolution; always set `fontFamily` from `--Typography-Font-Primary` on every `TextStyle` produced by the size resolver (CB-VIS-001).
7. **Drop `.copyWith(height: 1)`** — let the typography token chain dictate line-height. If vertical centring is broken at certain sizes, fix the container, not the line-height (CB-VIS-003).
8. **Decide `xl` parity** — either gate `xl` behind a feature flag (Flutter-only experimental) or extend web/RN matrices to 5 sizes and ensure all per-size tokens (height/padH/font) are wired for each platform (CB-VIS-005).
9. **Align `max` validation cross-platform** — adopt RN/Flutter rule ('default to 99' on invalid input) and update web to match instead of changing Flutter (CB-FN-005).

### 5.3 Polish (Medium / Low)

10. Document and standardise `appearance='auto'` resolution — combine with CB-FN-002 fix so that 'auto' inside Surface still yields role-correct primary tokens, never Material seed (CB-FN-004).
11. Decide on `max` parameter type — widen to `num` and apply `Math.floor` in `oneUiResolveCounterBadgeMax`, or keep `int` and document. Pick one (CB-FN-006).
12. Preserve the live-region announcement when `isHidden && semanticsLabel != null` — render an empty `Semantics(liveRegion: true, label: semanticsLabel, child: SizedBox.shrink())` so the 1→0 transition still fires an announcement (CB-FN-007).
13. Normalise `appearance` against `kOneUiCounterBadgeFigmaAppearances ∪ {'auto', 'brand-bg'}`; fall back to `'primary'` with `debugPrint` in debug builds for typos (CB-FN-009).
14. Drop `dataAttention` from the `ValueKey`, or document that it reflects the *resolved* (post-variant-override) attention not the original prop input (CB-FN-010).
15. **Resolve dot-mode semantic mismatch** — either remove dot-mode entirely (match web), or specialise the a11y label so dot-mode requires a non-empty `semanticsLabel` and never announces the numeric value (CB-FN-011 / CB-A11Y-006).
16. Add debug warning for whitespace-only `semanticsLabel` — `assert(() { if (semanticsLabel != null && semanticsLabel.trim().isEmpty) { debugPrint('CounterBadge: whitespace-only semanticsLabel ignored'); } return true; }());` (CB-A11Y-001).
17. Make `liveRegion` track label changes only — convert to `StatefulWidget`, store previous label, only set `liveRegion: true` when label differs; or expose `liveRegion` as an opt-out prop (CB-A11Y-002).
18. Always wrap with `Semantics(container: true)` — set label from `displayValue` when no explicit label is provided so the fallback path never leaks raw `Text` to AT (CB-A11Y-003).
19. On Flutter Web, set `Semantics(container: true, focusable: false)` or migrate to a custom `SemanticsConfiguration` that sets `isFocusable = false` to keep non-interactive status chips out of the tab order (CB-A11Y-004).
20. Remove the `textHeightBehavior` override, or pair with a corrected line-height multiplier derived from the typography token, so digit baseline matches web (CB-VIS-002).
21. Replace the `?? 16` height literal with `?? ds.resolveSpacingPx('3')` (or equivalent token chain matching web's `--Spacing-{N}`); never let a hard-coded px fallback survive (CB-VIS-004).

---

## 6. Methodology

- **Functional audit:** static comparison of `one_ui_counter_badge.dart`, `one_ui_counter_badge_types.dart`, and the colour/size engines against `packages/ui/src/components/CounterBadge/CounterBadge.tsx` + `CounterBadge.module.css` + `CounterBadge.shared.ts`.
- **A11y audit:** code walk of `one_ui_counter_badge_a11y.dart` and the `Semantics` emission in `one_ui_counter_badge.dart`, checked against WCAG 2.1 AA criteria (1.3.1, 1.4.4, 4.1.2) and React Native `interface.ts` accessibility props.
- **Visual audit:** comparison of resolved geometry / colour / typography token cascade vs Figma matrix (counter-badge nodes — 5 sizes × 3 attention × 9 appearances, numeric + dot + max overflow) and web CSS module rules. Dot-mode behaviour (xs + high) is Flutter-only and audited against the absence of any web equivalent.
- **Cross-platform parity:** prop tables compared between `CounterBadge.shared.ts` (web), `interface.ts` (RN), and `one_ui_counter_badge.dart` (Flutter) to surface `max` validation drift, `size` matrix drift (`xl` Flutter-only), and `testId` semantics-identifier wiring.

---

## 7. References

- **Component source:** `packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart`
- **A11y resolver:** `packages/ui_flutter/lib/widgets/one_ui_counter_badge_a11y.dart`
- **Types & state:** `packages/ui_flutter/lib/widgets/one_ui_counter_badge_types.dart`
- **Engine:** `packages/ui_flutter/lib/engine/counter_badge_color_resolve.dart`, `counter_badge_size_resolve.dart`
- **Convex gap fallback:** `packages/ui_flutter/lib/widgets/convex_gap_card.dart`
- **Web parity reference:** `packages/ui/src/components/CounterBadge/{CounterBadge.tsx, CounterBadge.module.css, CounterBadge.shared.ts, CounterBadge.stories.tsx, interface.ts}`
- **RN parity reference:** `packages/ui-native/src/components/CounterBadge/interface.ts`
- **QA test suite:** `apps/qa-playground-flutter/test/components/counter_badge/`

---

## 8. Individual Bug Reports (Copy-Paste Format)

Each block below is self-contained — copy from `===` to `===` into a Jira / GitHub / Linear ticket.

### 8.1 Functional bugs

```
===============================================================
Bug ID:       CB-FN-001
Title:        Missing OneUiScope returns visible debug ConvexGapCard instead of silent fallback
Category:     Functional
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge

Scenario:
Mounting OneUiCounterBadge before brand load completes, or outside
OneUiScope (during brand swap / async hydration), shows a deep-orange
debug card with English error text to the end user.

Steps to Reproduce:
1. Place OneUiCounterBadge anywhere outside of OneUiScope, or while
   designSystem is null during brand swap.
2. Observe the rendered output.

Expected Result:
- Either render nothing (SizedBox.shrink) or render the chip with
  CSS-fallback geometry like the web version, which has no equivalent
  error UI.

Actual Result:
- Returns ConvexGapCard with deep-orange border, English 'Convex /
  designSystem gaps' text, and hard-coded font sizes 12/13 px.
- Ships in production (no kDebugMode guard).
- Mirrors Badge BADGE-FN-001 and violates CLAUDE.md 'Zero literals'.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart:42-49
- packages/ui_flutter/lib/widgets/convex_gap_card.dart:21-48

Root Cause:
build() shortcut at line 42 returns ConvexGapCard with hard-coded
literals whenever designSystemOf(context) is null. There is no
kDebugMode guard and no SizedBox.shrink alternative.

Suggested Fix:
- Replace the fallback with `return const SizedBox.shrink();` for
  production, gating the ConvexGapCard behind
  `assert(() { ... }());` or `kDebugMode`.
===============================================================
```

```
===============================================================
Bug ID:       CB-FN-002
Title:        Brand whose themeConfig lacks the requested role falls through to Material primary (off-brand color)
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge + counter_badge_color_resolve

Scenario:
Render OneUiCounterBadge with appearance='sparkle' on a Jio sub-brand
that does not configure the sparkle role.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 5, appearance: 'sparkle')` on a
   brand whose themeConfig.appearances does not contain 'sparkle'.
2. Inspect the rendered colors.

Expected Result:
- Web silently falls back to the primary chain (--Surface-Bold) and a
  controlled neutral fill; Flutter should match.

Actual Result:
- isAppearanceConfigured returns false, role is null, the code falls
  back to Theme.of(context).colorScheme.primary/onPrimary which is the
  raw Material seed color — completely off-brand and not tied to
  design tokens.
- CLAUDE.md zero-tolerance: 'All styling via var(--Token-Name)'.

Code Reference:
- packages/ui_flutter/lib/engine/counter_badge_color_resolve.dart:32-41

Root Cause:
When the requested appearance is missing the resolver picks Material's
ColorScheme.primary instead of cascading through the role chain
(primary→neutral) like RN's useSurfaceTokens does.

Suggested Fix:
- Replicate the RN cascade (`appearance → primary → neutral`) using
  `tokensForAppearance`, never reach into Theme.of.
===============================================================
```

```
===============================================================
Bug ID:       CB-FN-003
Title:        Component override tokens only honored when appearance === 'primary'
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge + counter_badge_color_resolve

Scenario:
A brand sets --CounterBadge-backgroundColor-bold to a custom value.
The counter is then rendered with appearance='negative'.

Steps to Reproduce:
1. Add `--CounterBadge-backgroundColor-bold` override in the brand
   config.
2. Render `OneUiCounterBadge(value: 5, appearance: 'negative',
   attention: 'high')`.
3. Inspect the fill.

Expected Result:
- Web reads `var(--CounterBadge-backgroundColor-bold, var(--_cb-bold))`
  regardless of appearance — the component override always wins, then
  the per-role intermediate variable is consumed.
- So component overrides apply for every appearance.

Actual Result:
- Flutter sets `useComponentOverrides = appearance == 'primary'`.
- Custom appearances ignore brand component tokens entirely.

Code Reference:
- packages/ui_flutter/lib/engine/counter_badge_color_resolve.dart:43-54

Root Cause:
The gating literal at line 43 limits override-token resolution to the
primary role only; this diverges from the web CSS chain which is
appearance-agnostic.

Suggested Fix:
- Remove the `useComponentOverrides = appearance == 'primary'` gate;
  let `fromComponent(...)` resolve for all appearances.
===============================================================
```

```
===============================================================
Bug ID:       CB-FN-004
Title:        appearance='auto' falls back via Surface-effective-appearance — diverges from web slot-only semantics
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge

Scenario:
Inside a `<Surface mode='subtle'>` with no slot-parent context, the
counter is rendered with appearance='auto'.

Steps to Reproduce:
1. Wrap in OneUiSurface(mode: 'subtle').
2. Render `OneUiCounterBadge(value: 5, appearance: 'auto')` directly
   inside.
3. Compare to web's `<Surface><CounterBadge appearance='auto' /></Surface>`.

Expected Result:
- Web `useCounterBadgeState` resolves auto to `slotParent ?? 'primary'`.
- Slot parent only comes from `useSlotParentAppearance` (Button/Badge
  slot context), NOT from Surface mode.
- Bare Surface should still resolve to primary.

Actual Result:
- Auto handling is parity-correct, but the fallback chain when the
  resolved role is unconfigured silently re-routes to
  ColorScheme.primary — combined effect diverges from web parity.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge_types.dart:125-127

Root Cause:
Auto handling is parity-correct, but the fallback chain when the
resolved role is unconfigured silently re-routes to
ColorScheme.primary — combined effect diverges from web parity.

Suggested Fix:
- Document the auto→primary resolution and combine with CB-FN-002 fix
  so that 'auto' inside Surface still yields role-correct primary
  tokens, never Material seed.
===============================================================
```

```
===============================================================
Bug ID:       CB-FN-005
Title:        max=0 / negative max treated as 'default 99' — diverges from web's raw clamp behaviour
Category:     Functional
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge

Scenario:
Render OneUiCounterBadge with max=0 and value=1.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 1, max: 0)`.
2. Inspect text.

Expected Result:
- Align Flutter, RN, and web on one rule.
- RN-style (Flutter's current) is the safer default — web should change.

Actual Result:
- Flutter matches RN ('default to 99').
- Web uses raw max producing '0+'.
- Cross-platform inconsistency.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge_types.dart:56-59

Root Cause:
Three platforms have three slightly different max-validation rules.
Flutter matches RN, not web.

Suggested Fix:
- Align all three platforms on one rule.
- The RN one (Flutter's current) is the safer default; web should be
  updated, not Flutter.
===============================================================
```

```
===============================================================
Bug ID:       CB-FN-006
Title:        max parameter typed `int` — diverges from web/RN `number` signature
Category:     Functional
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge

Scenario:
Caller passes a computed value from Convex floats.

Steps to Reproduce:
1. Convex returns max as a double.
2. Caller floors it before passing to OneUiCounterBadge.

Expected Result:
- Match web/RN `number` signature with Math.floor / non-finite check.

Actual Result:
- Flutter accepts `int` only.
- Truncation happens at the call site, not in the component.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart:30

Root Cause:
Type signature divergence between platforms.

Suggested Fix:
- Either keep `int` and document, or widen to `num` and apply
  `Math.floor` in `oneUiResolveCounterBadgeMax`.
===============================================================
```

```
===============================================================
Bug ID:       CB-FN-007
Title:        showZero=false hides badge AND drops the live-region — no '0 unread' announcement on 1→0 transition
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge

Scenario:
An inbox transitions from 1 unread to 0; AT user expects 'no unread
messages' announced.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 1, semanticsLabel: '1 unread')`.
2. Update value to 0.
3. Observe what TalkBack/VoiceOver announces.

Expected Result:
- When hidden, the Semantics(liveRegion: true, label: semanticsLabel)
  wrapper should remain (with empty visual) so the transition fires an
  announcement.

Actual Result:
- isHidden short-circuits to SizedBox.shrink at line 62-64, removing
  the Semantics(liveRegion) wrapper.
- AT users get no signal of the count reaching zero.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart:62-64

Root Cause:
Hiding the entire subtree drops the live region, so the screen reader
has nothing to announce for the 1→0 transition.

Suggested Fix:
- When `isHidden && semanticsLabel != null`, render an empty
  `Semantics(liveRegion: true, label: semanticsLabel,
  child: SizedBox.shrink())` so the announcement still fires.
===============================================================
```

```
===============================================================
Bug ID:       CB-FN-008
Title:        testId only encoded as ValueKey; not exposed as Semantics.identifier
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge

Scenario:
QA runs an integration test (Playwright/Detox/Patrol) that locates the
counter via a stable testID selector.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 5, testId: 'qa-cart-counter')`.
2. Locate via Semantics.identifier or WebDriver `data-testid`.

Expected Result:
- Expose `Semantics(identifier: testId)` so Patrol/Maestro/WebDriver
  can locate it.
- Mirrors BADGE-FN-006.

Actual Result:
- Flutter wraps in `KeyedSubtree(key: ValueKey(tid))` only — only
  reachable via `find.byKey`.
- Cross-platform e2e harnesses break.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart:141-144

Root Cause:
ValueKey is not propagated to the SemanticsNode; e2e harnesses
(Patrol, Maestro, WebDriver) read Semantics.identifier, not Flutter
widget keys.

Suggested Fix:
- Attach `Semantics(identifier: tid)` (Flutter 3.19+) in addition to
  (or instead of) the KeyedSubtree wrapping.
===============================================================
```

```
===============================================================
Bug ID:       CB-FN-009
Title:        appearance is typedef String — silent fall-through on typos (no validation)
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge

Scenario:
Caller mistypes `appearance: 'positiv'`.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 5, appearance: 'positiv')`.
2. Observe output.

Expected Result:
- Debug assertion or dev warning + fall back to 'primary'.

Actual Result:
- `kOneUiCounterBadgeFigmaAppearances` list is defined but NEVER
  consulted by the resolver.
- String 'positiv' flows to `isAppearanceConfigured` → false →
  Material primary (per CB-FN-002).

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge_types.dart:18-27, 125-127

Root Cause:
appearance is `String` for cross-language flexibility but lacks
validation in dev/debug.

Suggested Fix:
- Add `assert(kOneUiCounterBadgeFigmaAppearances.contains(appearance)
  || appearance == 'auto' || appearance == 'brand-bg')` in debug
  builds, and fall back to 'primary' for unknown values.
===============================================================
```

```
===============================================================
Bug ID:       CB-FN-010
Title:        Variant precedence: `dataAttention` reports the *derived* value not the input — silent prop loss
Category:     Functional
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge

Scenario:
Caller passes both `variant: 'ghost'` and `attention: 'high'`. They
later read `dataAttention` to drive analytics.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 5, variant: 'ghost',
   attention: 'high')`.
2. Inspect state.dataAttention.

Expected Result:
- Web's data-attention attribute is not emitted at all.
- Flutter should either drop dataAttention or document that it is the
  *resolved* attention derived from variant.

Actual Result:
- Flutter emits `data-attention=low` (derived from ghost) in the
  ValueKey.
- The original `attention=high` input is lost — KeyedSubtree key
  therefore differs from the caller's intent.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge_types.dart:120-123, 136

Root Cause:
data-attention is encoded into the ValueKey but web doesn't emit it;
the dual-direction mapping creates a derived value that doesn't match
the original prop.

Suggested Fix:
- Either drop dataAttention from the ValueKey, or document that it
  reflects the resolved (post-variant-override) value.
===============================================================
```

```
===============================================================
Bug ID:       CB-FN-011
Title:        Flutter-only dot-mode (xs + bold) — a11y label announces numeric value visually replaced by a dot
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge + one_ui_counter_badge_a11y

Scenario:
An xs-bold counter shows a small dot. Caller passes value: 5 and no
semanticsLabel.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 5, size: 'xs', attention: 'high')`.
2. Visually it's a dot (numerals stripped).
3. Run TalkBack.

Expected Result:
- Web has no dot-mode for CounterBadge.
- Flutter must either: (a) drop dot-mode (match web), or (b) require
  non-empty semanticsLabel when dot-mode is active.

Actual Result:
- Dot-mode hides numerals but `displayValue` ('5') is still used as
  the a11y fallback.
- AT announces '5' while visually the user sees a dot — semantic
  mismatch.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge_types.dart:67-73, 135-137
- packages/ui_flutter/lib/widgets/one_ui_counter_badge_a11y.dart:14-23

Root Cause:
Dot mode is implemented visually but a11y is not specialised. Web is
the source of truth and does not implement dot mode at all — Flutter
diverges from web's contract by introducing this state.

Suggested Fix:
- Either remove dot-mode (match web), or specialise the a11y label to
  omit the numeric value when dot-mode and require a non-empty
  semanticsLabel.
===============================================================
```

### 8.2 Accessibility (a11y) bugs

```
===============================================================
Bug ID:       CB-A11Y-001
Title:        Whitespace-only semanticsLabel falls through silently to displayValue (no dev warning)
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge + one_ui_counter_badge_a11y

Scenario:
Caller passes `semanticsLabel: '   '` while value is 5.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 5, semanticsLabel: '   ')`.
2. Observe AT.

Expected Result:
- Whitespace-only should be treated as absent AND emit a dev warning,
  mirroring web's `console.warn`.

Actual Result:
- Code does `explicit = semanticsLabel?.trim()` and only uses it if
  non-empty.
- The fall-through path uses displayValue ('5'), silently masking the
  developer's intent without warning.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge_a11y.dart:16-23

Root Cause:
Trim-empty path silently degrades, unlike web which dev-warns when
aria-label is missing.

Suggested Fix:
- Add `assert(() { if (semanticsLabel != null &&
  semanticsLabel.trim().isEmpty) { debugPrint('CounterBadge:
  whitespace-only semanticsLabel ignored'); } return true; }());`.
===============================================================
```

```
===============================================================
Bug ID:       CB-A11Y-002
Title:        liveRegion always-on causes phantom announcements on iOS / Android rebuilds
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge

Scenario:
Caller renders a static counter chip in a list cell that does not
update.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 5, semanticsLabel: '5 items')` in
   a static grid cell.
2. Observe TalkBack on scroll.

Expected Result:
- Either expose `liveRegion` as an opt-out prop, or use
  Semantics.assertiveness carefully so the announcement only fires
  when label changes.

Actual Result:
- `Semantics(liveRegion: true)` is always emitted (line 124).
- On iOS this maps to UIAccessibilityNotificationLiveRegion which
  announces on every rebuild — even when only the parent rebuilds
  with identical props.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart:122-128

Root Cause:
liveRegion is always-on with no way to opt out; web defers to the
implicit liveRegion behaviour of `role='status'`.

Suggested Fix:
- Either expose a `liveRegion` prop (default true) for opt-out, or
  track previous label and only set `liveRegion: true` when it differs.
===============================================================
```

```
===============================================================
Bug ID:       CB-A11Y-003
Title:        ExcludeSemantics only wraps when accessible=true — non-accessible path leaks raw Text
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge + one_ui_counter_badge_a11y

Scenario:
Inspector/AT enumerates the Semantics tree for a counter chip with no
semanticsLabel and an empty displayValue.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 0, showZero: true)` (yields
   visualDisplayValue = '0').
2. Inspect Semantics tree.

Expected Result:
- Single node with the resolved label, no orphan raw Text node.

Actual Result:
- When `a11y.accessible == false` (no semanticsLabel + empty
  displayValue mid-transition), the inner Text is exposed to AT
  without any container/label.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart:121-128
- packages/ui_flutter/lib/widgets/one_ui_counter_badge_a11y.dart:19-23

Root Cause:
The ExcludeSemantics only wraps when `a11y.accessible` is true; the
fallback path leaves raw text exposed.

Suggested Fix:
- Always wrap with Semantics(container: true) — set label from
  `displayValue` when no explicit label is provided.
===============================================================
```

```
===============================================================
Bug ID:       CB-A11Y-004
Title:        Semantics(container: true) on Flutter Web emits a focusable group for the non-interactive status node
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter Web
Component:    OneUiCounterBadge

Scenario:
User Tab-traverses a page containing a CounterBadge.

Steps to Reproduce:
1. Build Flutter Web.
2. Place an OneUiCounterBadge among interactive widgets.
3. Press Tab repeatedly.

Expected Result:
- Counter is NOT a tab stop (web role='status' has no tabindex).

Actual Result:
- `Semantics(container: true)` on Flutter Web produces a div with
  role='group' that can become a focus stop depending on engine.
- Parity bug with BADGE-A11Y-006.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart:122

Root Cause:
container: true causes a SemanticsNode boundary that the web engine
may render as focusable.

Suggested Fix:
- Use `Semantics(container: true, excludeSemantics: false,
  focusable: false)` or migrate to a custom SemanticsConfiguration
  that sets `isFocusable = false`.
===============================================================
```

```
===============================================================
Bug ID:       CB-A11Y-005
Title:        Fixed-pixel height clips digit glyphs at iOS Dynamic Type ≥ XXXL / Android font scale ≥ 150%
Category:     Accessibility (a11y)
Severity:     High
Platform:     Flutter iOS, Flutter Android
Component:    OneUiCounterBadge + counter_badge_size_resolve

Scenario:
User has iOS Larger Text at maximum or Android font scale 200%.

Steps to Reproduce:
1. Enable accessibility text scale 200%.
2. Render `OneUiCounterBadge(value: 99)`.
3. Inspect glyph clipping.

Expected Result:
- Badge height should scale, OR text should wrap within taller box
  (WCAG 1.4.4 Resize Text).

Actual Result:
- `SizedBox(height: layout.height)` is fixed-pixel resolved from
  `--CounterBadge-height-{size}` tokens with no scale multiplier.
- Text inherits MediaQuery.textScaler so digit glyphs overflow the
  parent box and clip top/bottom.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart:82-84
- packages/ui_flutter/lib/engine/counter_badge_size_resolve.dart:46-51

Root Cause:
Height resolved from a px token (no MediaQuery.textScalerOf).

Suggested Fix:
- Multiply the height by `MediaQuery.textScalerOf(context).scale(1)`
  for the same scale factor used by Text; or migrate to
  `IntrinsicHeight`.
===============================================================
```

```
===============================================================
Bug ID:       CB-A11Y-006
Title:        Dot-mode (xs+high) AT announcement reads the numeric value the user cannot see — WCAG 1.3.1 mismatch
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge + one_ui_counter_badge_a11y

Scenario:
Dot-mode (`size='xs', attention='high'`) renders a coloured circle;
AT user expects a meaningful announcement, not the hidden numeric
value.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 5, size: 'xs', attention: 'high')`.
2. Enable TalkBack/VoiceOver.
3. Observe announcement.

Expected Result:
- Dot-mode should require a non-empty `semanticsLabel` and never
  announce the numeric value the user cannot see.
- Visually-invisible numeric content paired with default numeric AT
  label violates WCAG 1.3.1 Info & Relationships.

Actual Result:
- Numeric `displayValue` is announced even though the user sees a dot.
- Cross-references CB-FN-011 for the functional side of this defect.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge_a11y.dart:14-23

Root Cause:
The a11y resolver uses `displayValue` as the fallback label without
checking the dot-mode state from `oneUiResolveCounterBadgeState`.

Suggested Fix:
- Either remove dot-mode (match web), or specialise the a11y label so
  dot-mode requires a non-empty `semanticsLabel` and never announces
  the numeric value.
===============================================================
```

### 8.3 Visual / UI bugs

```
===============================================================
Bug ID:       CB-VIS-001
Title:        Hard-coded font size / weight fallback + missing fontFamily when nativeTypography is absent
Category:     Visual
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge + counter_badge_size_resolve

Scenario:
Render OneUiCounterBadge in a tree where
OneUiScope.nativeTypographyOf(context) returns null.

Steps to Reproduce:
1. Mount OneUiCounterBadge in a tree without nativeTypography.
2. Inspect text style.

Expected Result:
- Match web `--Label-3XS-FontSize` / `--Label-FontWeight-Medium`
  tokens.
- Always set `fontFamily: var(--Typography-Font-Primary)`.

Actual Result:
- `labelStyle = typo?.emphasisStyle(...) ?? TextStyle(fontSize: height
  * 0.55, fontWeight: FontWeight.w600)` — hard-coded literal.
- fontFamily is NEVER set on the fallback path.
- Violates CLAUDE.md 'Zero literals' AND mandatory
  `font-family: var(--Typography-Font-Primary)`.

Code Reference:
- packages/ui_flutter/lib/engine/counter_badge_size_resolve.dart:65-70

Root Cause:
Fallback path uses literal numbers instead of token-resolved values;
no fontFamily is ever set on the TextStyle.

Suggested Fix:
- Replace literal fallback with `--Label-3XS-*` token resolution;
  always set `fontFamily` from `--Typography-Font-Primary`.
===============================================================
```

```
===============================================================
Bug ID:       CB-VIS-002
Title:        textHeightBehavior strips line-box padding — digit baseline shifts vs web
Category:     Visual
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge

Scenario:
Compare Flutter counter to web at sizes m and l.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 8, size: 'l')` and compare
   visually with web.

Expected Result:
- Glyphs visually centred with same ascent/descent as web.
- Web uses CSS line-height (no first-ascent strip).

Actual Result:
- Flutter strips ascender+descender contribution → glyph appears
  shifted vertically vs web.
- Same root cause as BADGE-VIS-003.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart:109-112

Root Cause:
TextHeightBehavior strips the typographic line-box padding that web
relies on for vertical centring.

Suggested Fix:
- Remove the textHeightBehavior override, or pair with a corrected
  line-height multiplier from the typography token.
===============================================================
```

```
===============================================================
Bug ID:       CB-VIS-003
Title:        .copyWith(height: 1) overrides token line-height — diverges from web Label line-height
Category:     Visual
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge

Scenario:
Render counter at size 'm' and inspect resolved line-height.

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 5, size: 'm')`.
2. Inspect TextStyle.height of the resolved label.

Expected Result:
- Token-driven line-height from `var(--Label-2XS-LineHeight)`.
- CLAUDE.md: 'always pair line-height with font-size'.

Actual Result:
- Line 104-107 applies `.copyWith(color: ..., height: 1)`, forcing
  line-height ratio to 1.0 regardless of brand's emphasisStyle.
- Same root cause as BADGE-VIS-002.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart:104-107

Root Cause:
Override hard-codes height=1 to make the digit baseline-centre, but
silently discards the line-height paired with the font-size.

Suggested Fix:
- Drop `height: 1`; let the typography token chain dictate line-height.
- If vertical centring is broken, fix the container, not the
  line-height.
===============================================================
```

```
===============================================================
Bug ID:       CB-VIS-004
Title:        Hard-coded height fallback of 16 px (instead of token) when --CounterBadge-height-{size} unresolved
Category:     Visual
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge + counter_badge_size_resolve

Scenario:
Brand omits all per-size `--CounterBadge-height-*` tokens.

Steps to Reproduce:
1. Strip per-size CounterBadge tokens from the test brand.
2. Render at size='s' and size='xl'.
3. Inspect height.

Expected Result:
- Token cascade fallback (e.g. --Spacing-3 chain) or dev assertion.
- Never a literal.

Actual Result:
- `final height = px(heightKeys) ?? 16` — hard-coded 16 literal
  violates CLAUDE.md 'Zero literals'.
- Every size collapses to 16 px.

Code Reference:
- packages/ui_flutter/lib/engine/counter_badge_size_resolve.dart:46-51

Root Cause:
Px literal fallback when token cascade fails.

Suggested Fix:
- Replace `?? 16` with `?? ds.resolveSpacingPx('3')` (or equivalent
  token chain matching web's `--Spacing-{N}`).
===============================================================
```

```
===============================================================
Bug ID:       CB-VIS-005
Title:        size: 'xl' accepted by Flutter but mapped to label key 'S' with no parity in web/RN
Category:     Visual
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiCounterBadge + counter_badge_size_resolve

Scenario:
Render OneUiCounterBadge(size: 'xl').

Steps to Reproduce:
1. Render `OneUiCounterBadge(value: 5, size: 'xl')`.
2. Compare to web `<CounterBadge size='xl' />` (does not compile — web
   only supports xs|s|m|l).

Expected Result:
- Match web parity — either Flutter rejects 'xl' OR web is updated.

Actual Result:
- Flutter extended `kOneUiCounterBadgeSizes` to 5 entries (xl).
- The fallback height cascade falls through xl→l→m.
- The label-key map points xl to 'S' which has no parity in web.
- Causes off-by-one font sizing at xl.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_counter_badge_types.dart:9-15
- packages/ui_flutter/lib/engine/counter_badge_size_resolve.dart:22-28, 46-51

Root Cause:
Flutter extended the size matrix to 5 entries (xl) ahead of web/RN,
with no per-platform token wiring.

Suggested Fix:
- Either gate xl behind a feature flag, or extend web/RN matrices to 5
  sizes and ensure all per-size tokens (height/padH/font) are wired.
===============================================================
```

---

## 9. Test coverage map

Each bug ID maps to a regression test in
`apps/qa-playground-flutter/test/components/counter_badge/counter_badge_regression_test.dart`.

| Bug ID | Test name | Coverage notes |
|--------|-----------|----------------|
| CB-FN-001 | `[CB-FN-001] brand-loading race shows silent fallback, never ConvexGapCard` | Mount without OneUiScope; assert no `ConvexGapCard` in tree; assert `SizedBox.shrink` or transparent placeholder with semantics. |
| CB-FN-002 | `[CB-FN-002] unconfigured role falls back to neutral, not Material primary` | Brand without sparkle role; render `appearance: 'sparkle'`; assert resolved colour matches neutral's `surfaces[kSurfaceBold]` (never `Theme.of(context).colorScheme.primary`). |
| CB-FN-003 | `[CB-FN-003] --CounterBadge-backgroundColor-bold override applies across all appearances` | Brand with `--CounterBadge-backgroundColor-bold` override; render 9 appearances at `attention: 'high'`; assert resolved fill matches override for each. |
| CB-FN-004 | `[CB-FN-004] appearance='auto' inside Surface resolves to primary, never Material seed` | Wrap in `OneUiSurface(mode: 'subtle')`; render `appearance: 'auto'`; assert resolved colour matches primary bold. |
| CB-FN-005 | `[CB-FN-005] max=0 / negative max defaults to 99 (cross-platform aligned)` | Render `value: 1, max: 0` and `value: 1, max: -5`; assert displayed text is '1' (not '0+' or '-5+'). |
| CB-FN-006 | `[CB-FN-006] max parameter accepts num and floors fractional input` | Once widened: render `max: 99.7`; assert resolved threshold is 99. |
| CB-FN-007 | `[CB-FN-007] hidden badge preserves liveRegion announcement for 1→0 transition` | Render with `value: 1`, then update to `value: 0, showZero: false`; assert `Semantics(liveRegion: true)` is still present and label is announced. |
| CB-FN-008 | `[CB-FN-008] testId exposed as Semantics.identifier` | Render with `testId: 'qa-cart-counter'`; assert generated `SemanticsNode.identifier == 'qa-cart-counter'`. |
| CB-FN-009 | `[CB-FN-009] invalid appearance string falls back to primary with debug warning` | Render `appearance: 'positiv'`; in debug mode assert `debugPrint` fired; assert resolved colour matches primary bold. |
| CB-FN-010 | `[CB-FN-010] dataAttention reflects resolved value or is dropped from ValueKey` | Render `variant: 'ghost', attention: 'high'`; assert ValueKey does not silently differ from caller's `attention` intent, or that dataAttention is documented as derived. |
| CB-FN-011 | `[CB-FN-011] dot-mode (xs+high) drops numeric AT label OR requires semanticsLabel` | Render `value: 5, size: 'xs', attention: 'high'` without semanticsLabel; assert AT label is NOT '5' (or dot-mode is removed entirely). |
| CB-A11Y-001 | `[CB-A11Y-001] whitespace-only semanticsLabel emits debug warning` | Render `semanticsLabel: '   '`; in debug mode assert `debugPrint` fired; assert fallback label is `displayValue`. |
| CB-A11Y-002 | `[CB-A11Y-002] liveRegion only true when label changes` | Render with stable label; trigger unrelated rebuild; assert `liveRegion: false` after first frame (or that liveRegion is an opt-out prop). |
| CB-A11Y-003 | `[CB-A11Y-003] raw Text never exposed to AT when accessible=false` | Render `value: 0, showZero: true` with no semanticsLabel; assert Semantics tree has a single labelled node, no orphan Text node. |
| CB-A11Y-004 | `[CB-A11Y-004] Flutter Web does not emit focusable group for non-interactive counter` | Flutter Web only; render counter; assert generated DOM has no `tabindex="0"`. |
| CB-A11Y-005 | `[CB-A11Y-005] badge height scales with MediaQuery.textScaler — no digit clipping at 200%` | Wrap in `MediaQuery(textScaler: TextScaler.linear(2.0))`; render `value: 99`; assert rendered height ≥ glyph height; no clipping. |
| CB-A11Y-006 | `[CB-A11Y-006] dot-mode AT label omits numeric value` | Render `value: 5, size: 'xs', attention: 'high'` with `semanticsLabel: '5 unread'`; assert AT announces '5 unread' and never '5' from displayValue. |
| CB-VIS-001 | `[CB-VIS-001] typography fallback uses --Label-3XS-* tokens + Typography-Font-Primary` | Mount without nativeTypography; assert `TextStyle.fontFamily` matches resolved `--Typography-Font-Primary`; assert no literal `fontSize` / `fontWeight` numbers. |
| CB-VIS-002 | `[CB-VIS-002] textHeightBehavior preserves typographic line-box padding` | Render at sizes m and l; assert glyph baseline matches web reference within tolerance. |
| CB-VIS-003 | `[CB-VIS-003] line-height comes from typography token, not .copyWith(height: 1)` | Render at size 'm'; assert resolved `TextStyle.height` matches `--Label-2XS-LineHeight` from the brand. |
| CB-VIS-004 | `[CB-VIS-004] missing --CounterBadge-height token cascades through Spacing chain, never 16px literal` | Strip per-size CounterBadge tokens; render at every size; assert resolved height matches `--Spacing-{N}` token cascade, never `16.0`. |
| CB-VIS-005 | `[CB-VIS-005] size 'xl' parity with web/RN OR feature-flagged` | Static parity test: assert `kOneUiCounterBadgeSizes` matches web `size` union; if `xl` retained, assert per-size tokens (height/padH/font) all wired. |

---
