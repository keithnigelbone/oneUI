# OneUI Flutter IndicatorBadge — Component Audit Report

**Date:** 2026-06-16
**Component:** `OneUiIndicatorBadge` (Flutter)
**Source:** `packages/ui_flutter/lib/widgets/one_ui_indicator_badge.dart` + engine + overlay
**Cross-checked against:**
- React Web IndicatorBadge (`packages/ui/src/components/IndicatorBadge/*`)
- React Native IndicatorBadge (`packages/ui-native/src/components/IndicatorBadge/*`)
- Figma spec (indicator-badge matrix: 5 sizes × 9 appearances, 2 overlay anchors)
- WCAG 2.1 AA

**Severity legend:**
- **Critical** — ships broken UX, runtime crash, or AT failure
- **High** — visible regression vs spec / parity gap
- **Medium** — noticeable polish gap
- **Low** — nice-to-have / UX surprise

**Headline:** 18 audit findings → **18 actionable component bugs** — **4 Critical**, **7 High**, **5 Medium**, **2 Low**.

---

## 1. Functional bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| IB-FN-001 | Functional | Flutter (all) | Brand-loading race: `OneUiIndicatorBadge` mounted before `OneUiScope.designSystemOf(context)` resolves | 1) Render `OneUiIndicatorBadge(semanticsLabel: 'Online')` outside or before `OneUiScope` initializes. 2) Observe rendered output. | Web renders `<span role="status">` with CSS fallbacks; semantics + label intact. Flutter should mirror with `SizedBox.shrink` or brand-agnostic fallback. End-user must NEVER see debug UI. | Returns deep-orange-bordered `ConvexGapCard` with English diagnostic text. Hard-coded `fontSize: 13/12`, no `kDebugMode` guard, AT sees the diagnostic text instead of the status indicator. Violates CLAUDE.md "Zero literals" (deepOrange + literal pixels). | Critical | `one_ui_indicator_badge.dart:29-37` |
| IB-FN-002 | Functional | Flutter (all) | Component override `--IndicatorBadge-backgroundColor` only applies when `appearance == 'primary'` | 1) Configure brand with `--IndicatorBadge-backgroundColor` override. 2) Render `OneUiIndicatorBadge(appearance: 'negative', semanticsLabel: 'X')`. 3) Inspect resolved background. | Web CSS `background-color: var(--IndicatorBadge-backgroundColor, var(--_idb-bold))` applies override regardless of `data-appearance`. | Line 31: `useComponentOverrides = appearance == 'primary'`. Override silently ignored for 8 non-primary roles. | High | `indicator_badge_color_resolve.dart:31-39` |
| IB-FN-003 | Functional | Flutter (all) | Unconfigured role falls back to `Theme.of(context).colorScheme.primary` (off-brand Material colour) | 1) Brand without `sparkle` in `themeConfig.appearances`. 2) Render `OneUiIndicatorBadge(appearance: 'sparkle', semanticsLabel: 'X')`. 3) Inspect colour. | Web silently uses `--Sparkle-Bold` with engine fallback chain to `--Surface-Bold` neutral. No Material primary leakage. | Returns `Theme.of(context).colorScheme.primary` — Material's seeded purple/blue, completely off-brand. | High | `indicator_badge_color_resolve.dart:22-28` |
| IB-FN-004 | Functional | Flutter (all) | Invalid / typo appearance string silently produces Material primary (no validation) | 1) Render `OneUiIndicatorBadge(appearance: 'negaitve', semanticsLabel: 'X')`. 2) Observe colour. | Debug assertion or warning + fall back to `'primary'`. | `appearance` is `String` (no typedef). `isAppearanceConfigured('negaitve')` false → Material primary. Silent off-brand colour. | Medium | `one_ui_indicator_badge_types.dart:7,66-68`; `indicator_badge_color_resolve.dart:22-28` |
| IB-FN-005 | Functional | Flutter (all) | Required `semanticsLabel` accepts empty/whitespace string → non-accessible status indicator (AT silent) | 1) Render `OneUiIndicatorBadge(semanticsLabel: '')`. 2) Enable TalkBack/VoiceOver. 3) Observe announcement. | Web dev-warns when aria-label is empty (`console.warn('IndicatorBadge: aria-label prop is required')`). Flutter should assert non-empty in debug. | Trimmed empty → `accessible: false` → no `Semantics` wrapper at all. AT sees a coloured circle with no name. No warning, no assertion. | Critical | `one_ui_indicator_badge_a11y.dart:12-19` |
| IB-FN-006 | Functional | Flutter (all) | `appearance='auto'` uses `surfaceDepth > 0` gate — diverges from web | 1) Wrap in `OneUiSurfaceBootstrap(rootRoles=positive)`. 2) Render `OneUiIndicatorBadge(appearance: 'auto', semanticsLabel: 'X')`. 3) Compare to web. | Web `useSurfaceAppearance()` returns nearest explicit Surface ancestor's appearance regardless of depth. | Flutter checks `surface != null && surface.surfaceDepth > 0`. Root-level surface appearance ignored. | Medium | `one_ui_indicator_badge_types.dart:60-68` |
| IB-FN-007 | Functional | Flutter (all) | Overlay `surfaceRingWidth` defaults to 0 — avatar overlay never gets punch-through ring | 1) Render `OneUiIndicatorBadgeOverlay(anchor: bottomEnd, surfaceRingColor: pageBg, host: avatar, indicator: ...)` and OMIT `surfaceRingWidth`. 2) Inspect. | Web `IndicatorBadge.stories.tsx` ALWAYS wraps avatar dot in `border: var(--Spacing-0-5) solid var(--Surface-Default)` — no opt-in flag. | `final ring = surfaceRingWidth ?? 0;` then `ring > 0` required for `Border.all` block. When null, the ring is skipped entirely. Dot renders flush against avatar. | High | `one_ui_indicator_badge_overlay.dart:42-55` |
| IB-FN-008 | Functional | Flutter (all) | Cross-platform parity drift — RN declares `aria-label` optional, web required, Flutter required-but-accepts-empty | 1) Compare `IndicatorBadge.shared.ts` (web required) vs `interface.ts` (RN optional) vs `one_ui_indicator_badge.dart` (Flutter required+empty-ok). | All three platforms agree. Figma + a11y spec require non-empty accessible name. | Native `interface.ts`: `'aria-label'?: string` — optional. Native consumers can ship without an accessible name. Flutter is stricter but allows empty (see IB-FN-005). | Medium | `packages/ui-native/src/components/IndicatorBadge/interface.ts:16`; `packages/ui/src/components/IndicatorBadge/IndicatorBadge.shared.ts:28` |

---

## 2. Accessibility (a11y) bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| IB-A11Y-001 | Accessibility (a11y) | Flutter (all) | `liveRegion` always-on — every dot pulses announcement on every rebuild | 1) Render 10 IndicatorBadges with stable labels. 2) Trigger any unrelated rebuild (route change, theme toggle). 3) Observe TalkBack/VoiceOver/NVDA. | `liveRegion` ONLY true when badge's label actually changes. Web `role="status"` only re-announces when text content changes. | `Semantics(container: true, liveRegion: true, …)` hard-coded for every render. Each rebuild triggers polite announcement. | High | `one_ui_indicator_badge.dart:73-78` |
| IB-A11Y-002 | Accessibility (a11y) | Flutter Web | `Semantics(container: true)` on Flutter Web produces a focusable group — non-interactive dot becomes a tab stop | 1) Render any `OneUiIndicatorBadge(semanticsLabel: 'Online')` on Flutter Web. 2) Press Tab. 3) Observe focus ring. | Web `<span role="status">` has no `tabindex` — never a tab stop. | Flutter Web emits focusable ARIA group; non-interactive dot becomes part of tab order. Same defect as BADGE-A11Y-006. | Medium | `one_ui_indicator_badge.dart:73-78` |
| IB-A11Y-003 | Accessibility (a11y) | Flutter (all) | Bold-on-tinted contrast not verified — yellow warning dot on warning-subtle surface invisible (WCAG 1.4.11 fail) | 1) Wrap in `OneUiSurface(mode: 'subtle')` configured with warning role. 2) Render `OneUiIndicatorBadge(appearance: 'warning', semanticsLabel: 'Caution')`. 3) Measure contrast ratio. | WCAG 1.4.11 Non-text contrast ≥ 3:1 for status indicator vs immediate background. If too close, engine should apply stroke or higher-contrast fallback. | Returns raw `kSurfaceBold` token with no contrast guard. Yellow-warning bold (~#F5C518) on warning-subtle (~#FFF6D8) measures ~1.4:1 — fails WCAG. No stroke fallback, no warning. | High | `indicator_badge_color_resolve.dart:17-44` |
| IB-A11Y-004 | Accessibility (a11y) | Flutter Android, Flutter iOS | Indicator size at `xs` (~6px) below WCAG 1.4.11 target — invisible on high-DPI mobile when standalone | 1) Render `OneUiIndicatorBadge(size: 'xs', semanticsLabel: 'Online')` on phone. 2) Observe visibility from arm's length. | WCAG 2.5.5 / 1.4.11 — for non-interactive icons, ≥ 8 px diameter common heuristic. `xs` is borderline; should pair with outer ring or AT announcement. | `xs` → `Spacing-1-5` (~6px). On 3x DPI screen, rendered ~2 physical pixels — invisible to mild visual impairments. No minimum size guard, no fallback. | Medium | `indicator_badge_size_resolve.dart:25-32` |
| IB-A11Y-005 | Accessibility (a11y) | Flutter Android | Android high-contrast accessibility setting ignored — dot does not boost stroke / colour | 1) Enable Settings → Accessibility → Text and display → High contrast text. 2) Render IndicatorBadge on tinted surface. 3) Observe. | Boost contrast via stroke / deeper fill. Flutter exposes via `MediaQuery.highContrastOf(context)`. | Engine never reads `MediaQuery.highContrastOf`. Dot renders identically regardless of system high-contrast. | Medium | `indicator_badge_color_resolve.dart` (no MediaQuery read) |

---

## 3. Visual / UI bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| IB-VIS-001 | Visual | Flutter (all) | Overlay `Border.all` shrinks inner content — bordered dot is smaller than unbordered dot at same `indicatorSize` | 1) Render two avatars side-by-side: one with `surfaceRingWidth: Spacing-0-5`, one with 0. 2) Measure rendered dot diameter (excluding ring). | Web `box-shadow: 0 0 0 var(--Spacing-0-5) var(--Surface-Default)` paints ring OUTSIDE. Inner diameter unchanged. Flutter should mirror with `BoxShadow(spreadRadius)` or larger outer circle. | Wrap uses `DecoratedBox(border: Border.all(width: ring))` which insets the child by `ring`. Inner dot is `indicatorSize - 2*ring` in diameter. Ringed dot visibly smaller than unringed dot. | High | `one_ui_indicator_badge_overlay.dart:48-55` |
| IB-VIS-002 | Visual | Flutter (all) | Overlay anchors only cover `topEnd` / `bottomEnd` — `topStart` / `bottomStart` not supported | 1) Examine `OneUiIndicatorBadgeOverlayAnchor` enum. | All four corners. Web is pure CSS — any top/bottom/left/right combo works. | Enum has only `topEnd` and `bottomEnd`. `PositionedDirectional` correctly mirrors `end` in RTL, but no equivalent for `start`. | Low | `one_ui_indicator_badge_overlay.dart:7-13` |
| IB-VIS-003 | Visual | Flutter (all) | Shape switches between circle and rectangle based on `borderRadius` vs `side` — brand override can flip rendering primitive | 1) Configure `--IndicatorBadge-borderRadius: var(--Shape-1)`. 2) Render `OneUiIndicatorBadge(size: 'xl', semanticsLabel: 'X')`. 3) Compare to web. | Web `border-radius` always paints a (possibly squircle) rectangle. No rendering primitive switch. | Switches between `BoxShape.circle` (radius >= side/2) and `BoxShape.rectangle`. At threshold, AA differs (circle uses path; rectangle uses RRect). | Low | `one_ui_indicator_badge.dart:59-68` |
| IB-VIS-004 | Visual | Flutter (all) | Overlay `SizedBox(hostSide)` clips ring layout extent — adjacent siblings overlap | 1) Render `OneUiIndicatorBadgeOverlay(hostSide: 24, indicatorSize: 's' (~8px), anchor: bottomEnd)` with `surfaceRingWidth: 2`. 2) Place adjacent widgets in a Row with no spacing. | Web absolute-positioning with no clipping wrapper — ring naturally extends outside host bounds. | `SizedBox(width: hostSide, height: hostSide)` constrains layout. `PositionedDirectional` puts dot's bottom-right at SizedBox corner. With ring, visual extent exceeds layout extent → adjacent siblings see overlap. | Medium | `one_ui_indicator_badge_overlay.dart:70-80` |
| IB-VIS-005 | Visual | Flutter (all) | Surface-ring colour does not flip in dark mode — light-mode value baked into overlay at construction time | 1) Mount avatar overlay in light theme reading `Theme.of(context).colorScheme.surface`, pass as `surfaceRingColor`. 2) Toggle to dark. 3) Observe. | Web `border: ... solid var(--Surface-Default)` — CSS variable remaps via engine's dark emission. Ring always matches page background. | `surfaceRingColor` is a `Color`, not a token reference. If a consumer hoists the value above the theme change (e.g. caches `Color(0xFFFFFFFF)`), no dark-mode remap. | Medium | `one_ui_indicator_badge_overlay.dart:28,37`; `indicator_badge_showcase.dart:287,360-361` |

---

## 4. Summary

### 4.1 Total bug count by category

| Category | Audit findings | Real bugs |
|----------|----------------|-----------|
| Functional | 8 | 8 |
| Accessibility (a11y) | 5 | 5 |
| Visual | 5 | 5 |
| **Total** | **18** | **18 actionable** |

### 4.2 Total bug count by severity

| Severity | Count |
|----------|-------|
| Critical | **4** |
| High | **7** |
| Medium | **5** |
| Low | **2** |
| **Total** | **18** |

### 4.3 Platform-wise distribution

| Platform | Count |
|----------|-------|
| Flutter (all — Android + iOS + Web) | 15 |
| Flutter-iOS / Flutter-Android only (high-DPI standalone xs) | 1 |
| Flutter Android only (high-contrast MediaQuery) | 1 |
| Flutter Web only (focusable group / tab stop) | 1 |

### 4.4 Critical & High issues — at a glance

1. **IB-FN-001** — `ConvexGapCard` debug UI shipped to end users during brand-loading race. Single biggest UX risk.
2. **IB-FN-005** — Required `semanticsLabel` accepts empty/whitespace → AT silent on every status indicator.
3. **IB-FN-002** — `--IndicatorBadge-backgroundColor` override gated to `appearance == 'primary'`; silently ignored for 8 roles.
4. **IB-FN-003** — Missing brand role short-circuits to Material `colorScheme.primary` (off-brand colour).
5. **IB-FN-007** — Avatar overlay punch-through ring is opt-in; defaults to 0; dot renders flush against avatar.
6. **IB-A11Y-001** — `liveRegion: true` hard-coded → phantom announcements on every rebuild.
7. **IB-A11Y-003** — Bold-on-tinted (e.g. warning-bold on warning-subtle) measures ~1.4:1 → WCAG 1.4.11 fail.
8. **IB-VIS-001** — `Border.all` shrinks the inner dot; web `box-shadow` paints outside (ring causes diameter loss).

### 4.5 Accessibility compliance summary

| Concern | Status |
|---------|--------|
| WCAG 1.4.11 Non-text Contrast | Fail (IB-A11Y-003, IB-A11Y-004) |
| WCAG 4.1.2 Name / Role / Value | Fail (IB-FN-005, IB-FN-008) |
| Screen-reader (TalkBack / VoiceOver) | 3 failure modes (empty label, phantom live-region pulses, no AT name when label trimmed empty) |
| Keyboard / focus | 1 issue on Flutter Web (IB-A11Y-002) |
| High-contrast / Dynamic Type | Fail (IB-A11Y-005) — `MediaQuery.highContrastOf` not read |
| Live-region semantics (`role="status"`) | Always-on (regression — should track label changes only) |

### 4.6 Components / variants with the most issues

| Surface | Issues |
|---------|--------|
| Overlay subsystem (`OneUiIndicatorBadgeOverlay`) | **5** (IB-FN-007, IB-VIS-001, IB-VIS-002, IB-VIS-004, IB-VIS-005) — riskiest area |
| Colour resolver (`indicator_badge_color_resolve.dart`) | 4 (IB-FN-002, IB-FN-003, IB-A11Y-003, IB-A11Y-005) |
| Semantics resolver | 3 (IB-FN-005, IB-A11Y-001, IB-A11Y-002) |
| Appearance / role resolution | 3 (IB-FN-003, IB-FN-004, IB-FN-006) |
| `OneUiScope` / brand-loading fallback (`ConvexGapCard`) | 1 (IB-FN-001) — but Critical impact |

### 4.7 Regression risk areas

1. **Overlay punch-through ring** — switching from `Border.all` to `BoxShadow(spreadRadius)` will affect every avatar overlay golden.
2. **`liveRegion` change-tracking** — making `liveRegion` conditional on label diff requires `StatefulWidget`; every existing screen-reader baseline changes.
3. **Brand-loading transition window** — `ConvexGapCard` exposure during async brand init (shared risk with Badge/CounterBadge).
4. **High-contrast contrast guard** — adding the stroke fallback for low-contrast surface pairs will change every bold-on-tinted screenshot baseline.
5. **Material `colorScheme.primary` removal** — flipping unconfigured-role fallback from Material primary → neutral changes the rendered colour for any incomplete brand config.

---

## 5. Recommendations for fixes & stabilisation

### 5.1 Immediate (this sprint — Critical)

1. **Replace `ConvexGapCard` with a silent fallback** (`SizedBox.shrink()` or a transparent placeholder with the resolved layout dims + `Semantics(label: semanticsLabel)`). Gate the diagnostic UI behind `assert(() { … return true; }())` so it never ships to production (IB-FN-001).
2. **Assert non-empty `semanticsLabel`** in debug builds: `assert(semanticsLabel.trim().isNotEmpty, 'IndicatorBadge: semanticsLabel must be non-empty')`. Optionally default to `'Status indicator'` (IB-FN-005).
3. **Remove the `appearance == 'primary'` gate** on `useComponentOverrides`; call `resolveColorFromComponentPropertyKeys` unconditionally (IB-FN-002).
4. **Remove Material `colorScheme.primary` fallback** — cascade through neutral / primary instead of reaching for `Theme.of(context)` (IB-FN-003).

### 5.2 Next sprint (High)

5. **Make avatar overlay surface ring opt-OUT instead of opt-in**: when `anchor == bottomEnd` and `surfaceRingWidth == null`, default to `Spacing-0-5` (~2px) and `surfaceRingColor` to the nearest `--Surface-Fill-Default` (IB-FN-007).
6. **Make `liveRegion` track label changes only** — convert to `StatefulWidget`, store previous label, only set `liveRegion: true` when label differs (IB-A11Y-001).
7. **Replace `Border.all` with `BoxShadow(spreadRadius: ring, blurRadius: 0)`** so the ring paints outside the dot (IB-VIS-001).
8. **Add contrast guard for bold-on-tinted** — compute relative luminance vs resolved parent surface fill; if < 3:1, add 1px stroke in `--Text-OnBold-High` or role's `Bold-High` (IB-A11Y-003).

### 5.3 Polish (Medium / Low)

9. Normalize `appearance` against `kOneUiIndicatorBadgeFigmaAppearances ∪ {'brand-bg', 'auto'}`; fall back to `'primary'` with `debugPrint` in debug builds (IB-FN-004).
10. Drop the `surfaceDepth > 0` gate for `appearance: 'auto'` — inherit from `surface.parentAppearance` whenever surface is present (IB-FN-006).
11. Make `'aria-label'` required on RN; harden Flutter via assertion. Add `check:parity` test that diffs prop tables (IB-FN-008).
12. Audit Flutter Web `Semantics(container: true)` for accidental tab-stop. Set `excludeSemantics: false` + explicitly mark inner subtree non-focusable (IB-A11Y-002).
13. Document that `xs` is intended for slot/overlay only. When standalone (no `BadgeSlotSizeScope`) AND `size == 'xs'`, log debug warning. Recommend `s` minimum for standalone use (IB-A11Y-004).
14. Read `MediaQuery.highContrastOf(context)`. When true, swap fill for role's `Bold-High` or add 1px stroke in `--Text-High`. Apply across all badge components (IB-A11Y-005).
15. Extend `OneUiIndicatorBadgeOverlayAnchor` enum: `topStart`, `topEnd`, `bottomStart`, `bottomEnd`. Map each to `PositionedDirectional(top/bottom, start/end: 0)` (IB-VIS-002).
16. Always use `BoxShape.rectangle + BorderRadius.circular(min(borderRadius, side/2))`. Test AA on iOS/Android/Web. Document if circle is unavoidable (IB-VIS-003).
17. Expand wrapping `SizedBox` by ring width on dot's side, OR translate dot via `PositionedDirectional(bottom: -ring, end: -ring)` to keep visual centre at corner (IB-VIS-004).
18. Make `surfaceRingColor` optional and default to `OneUiSurfaceScope.of(context).resolvedRoles[...].surfaces[kSurfaceDefault]` inside the overlay's build, OR accept a token name string (IB-VIS-005).

---

## 6. Methodology

- **Functional audit:** static comparison of `one_ui_indicator_badge.dart`, `one_ui_indicator_badge_overlay.dart`, and the colour/size engines against `packages/ui/src/components/IndicatorBadge/IndicatorBadge.tsx` + `IndicatorBadge.module.css` + `IndicatorBadge.shared.ts`.
- **A11y audit:** code walk of `one_ui_indicator_badge_a11y.dart` and the `Semantics` emission in `one_ui_indicator_badge.dart`, checked against WCAG 2.1 AA criteria and React Native `interface.ts` accessibility props.
- **Visual audit:** comparison of resolved geometry / colour / token cascade vs Figma matrix (indicator-badge nodes) and web CSS module rules. Overlay rendering compared against `IndicatorBadge.stories.tsx` avatar-overlay reference.
- **Cross-platform parity:** prop tables compared between `IndicatorBadge.shared.ts` (web), `interface.ts` (RN), and `one_ui_indicator_badge.dart` (Flutter) to surface `aria-label` requirement drift.

---

## 7. References

- **Component source:** `packages/ui_flutter/lib/widgets/one_ui_indicator_badge.dart`
- **Overlay:** `packages/ui_flutter/lib/widgets/one_ui_indicator_badge_overlay.dart`
- **A11y resolver:** `packages/ui_flutter/lib/widgets/one_ui_indicator_badge_a11y.dart`
- **Types & state:** `packages/ui_flutter/lib/widgets/one_ui_indicator_badge_types.dart`
- **Engine:** `packages/ui_flutter/lib/engine/indicator_badge_color_resolve.dart`, `indicator_badge_size_resolve.dart`
- **Showcase:** `packages/ui_flutter/lib/foundations/indicator_badge_showcase.dart`
- **Web parity reference:** `packages/ui/src/components/IndicatorBadge/{IndicatorBadge.tsx, IndicatorBadge.module.css, IndicatorBadge.shared.ts, IndicatorBadge.stories.tsx, interface.ts}`
- **RN parity reference:** `packages/ui-native/src/components/IndicatorBadge/interface.ts`
- **QA test suite:** `apps/qa-playground-flutter/test/components/indicator_badge/`

---

## 8. Individual Bug Reports (Copy-Paste Format)

Each block below is self-contained — copy from `===` to `===` into a Jira / GitHub / Linear ticket.

### 8.1 Functional bugs

```
===============================================================
Bug ID:       IB-FN-001
Title:        Brand-loading race renders debug ConvexGapCard instead of graceful fallback
Category:     Functional
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadge

Scenario:
OneUiIndicatorBadge mounted before OneUiScope.designSystemOf(context)
resolves (brand swap, first paint, any tree without OneUiScope).

Steps to Reproduce:
1. Render `OneUiIndicatorBadge(semanticsLabel: 'Online')` outside or
   before OneUiScope initializes.
2. Observe rendered output.

Expected Result:
- Web renders `<span role="status">` with CSS fallbacks; semantics +
  label intact.
- Flutter should mirror with SizedBox.shrink or brand-agnostic fallback.
- End-user must NEVER see debug UI.

Actual Result:
- Returns deep-orange-bordered ConvexGapCard with English diagnostic text.
- Hard-coded fontSize: 13/12, no kDebugMode guard.
- AT sees the diagnostic text instead of the status indicator.
- Violates CLAUDE.md "Zero literals" (deepOrange + literal pixels).

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge.dart:29-37

Root Cause:
Mirrors BADGE-FN-001 — guard is a debug widget reused as production
fallback. No kDebugMode gating, no semantics preservation.

Suggested Fix:
- Return `SizedBox.shrink()` or a transparent SizedBox with the resolved
  layout dims and Semantics(label: semanticsLabel).
- Gate ConvexGapCard behind `assert(() { … return true; }())`.
===============================================================
```

```
===============================================================
Bug ID:       IB-FN-002
Title:        Component override --IndicatorBadge-backgroundColor only applies when appearance=='primary'
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadge + indicator_badge_color_resolve

Scenario:
Brand sets --IndicatorBadge-backgroundColor; rendered with
appearance='negative'.

Steps to Reproduce:
1. Configure brand with --IndicatorBadge-backgroundColor override.
2. Render `OneUiIndicatorBadge(appearance: 'negative', semanticsLabel: 'X')`.
3. Inspect resolved background.

Expected Result:
- Web CSS `background-color: var(--IndicatorBadge-backgroundColor,
  var(--_idb-bold))` applies override regardless of data-appearance.

Actual Result:
- Line 31: `useComponentOverrides = appearance == 'primary'`.
- Override silently ignored for 8 non-primary roles.

Code Reference:
- packages/ui_flutter/lib/engine/indicator_badge_color_resolve.dart:31-39

Root Cause:
Component-level overrides hard-coded to a single role; web treats them
as cross-role.

Suggested Fix:
- Remove the gate — call `resolveColorFromComponentPropertyKeys`
  unconditionally; if null, fall through to role's `surfaces[kSurfaceBold]`.
===============================================================
```

```
===============================================================
Bug ID:       IB-FN-003
Title:        Unconfigured role falls back to Theme.of(context).colorScheme.primary (off-brand Material colour)
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadge + indicator_badge_color_resolve

Scenario:
Brand omits sparkle role; render appearance='sparkle'.

Steps to Reproduce:
1. Brand without 'sparkle' in themeConfig.appearances.
2. Render `OneUiIndicatorBadge(appearance: 'sparkle', semanticsLabel: 'X')`.
3. Inspect colour.

Expected Result:
- Web silently uses --Sparkle-Bold with engine fallback chain to
  --Surface-Bold neutral.
- No Material primary leakage.

Actual Result:
- Returns Theme.of(context).colorScheme.primary — Material's seeded
  purple/blue, completely off-brand.

Code Reference:
- packages/ui_flutter/lib/engine/indicator_badge_color_resolve.dart:22-28

Root Cause:
isAppearanceConfigured false → short-circuits to Material ColorScheme
instead of cascading. Same defect as BADGE-FN-007.

Suggested Fix:
- Fall back to `tokensForAppearance(context, 'neutral').surfaces[kSurfaceBold]`
  (or 'primary' if neutral missing).
- Never reach for Theme.of.
===============================================================
```

```
===============================================================
Bug ID:       IB-FN-004
Title:        Invalid / typo appearance string silently produces Material primary (no validation)
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadge

Scenario:
Developer passes misspelled appearance string.

Steps to Reproduce:
1. Render `OneUiIndicatorBadge(appearance: 'negaitve', semanticsLabel: 'X')`.
2. Observe colour.

Expected Result:
- Debug assertion or warning + fall back to 'primary'.

Actual Result:
- appearance is `String` (no typedef).
- isAppearanceConfigured('negaitve') false → Material primary.
- Silent off-brand colour.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge_types.dart:7,66-68
- packages/ui_flutter/lib/engine/indicator_badge_color_resolve.dart:22-28

Root Cause:
appearance has no runtime guard. resolveOneUiIndicatorBadgeState passes
raw string through; only role lookup catches it.

Suggested Fix:
- Normalize against kOneUiIndicatorBadgeFigmaAppearances ∪ {'brand-bg', 'auto'}.
- If not in set, fall back to 'primary' and emit debugPrint in debug builds.
===============================================================
```

```
===============================================================
Bug ID:       IB-FN-005
Title:        Required semanticsLabel accepts empty/whitespace string → non-accessible status indicator (AT silent)
Category:     Functional
Severity:     Critical
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadge + one_ui_indicator_badge_a11y

Scenario:
Developer passes '' or '   ' to satisfy `required`.

Steps to Reproduce:
1. Render `OneUiIndicatorBadge(semanticsLabel: '')`.
2. Enable TalkBack/VoiceOver.
3. Observe announcement.

Expected Result:
- Web dev-warns when aria-label is empty
  (`console.warn('IndicatorBadge: aria-label prop is required')`).
- Flutter should assert non-empty in debug.

Actual Result:
- Trimmed empty → `accessible: false` → no Semantics wrapper at all.
- AT sees a coloured circle with no name.
- No warning, no assertion.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge_a11y.dart:12-19

Root Cause:
`required` only enforces non-null. A11y resolver silently degrades.
Status indicators without an accessible name are a regression.

Suggested Fix:
- Debug-mode `assert(semanticsLabel.trim().isNotEmpty,
  'IndicatorBadge: semanticsLabel must be non-empty')`.
- Optionally fall back to 'Status indicator' default.
===============================================================
```

```
===============================================================
Bug ID:       IB-FN-006
Title:        appearance='auto' uses surfaceDepth>0 gate — diverges from web
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadge

Scenario:
IndicatorBadge with appearance='auto' inside <Surface mode='default'
appearance='positive'> at depth 0 (root via Bootstrap).

Steps to Reproduce:
1. Wrap in OneUiSurfaceBootstrap(rootRoles=positive).
2. Render `OneUiIndicatorBadge(appearance: 'auto', semanticsLabel: 'X')`.
3. Compare to web.

Expected Result:
- Web `useSurfaceAppearance()` returns nearest explicit Surface ancestor's
  appearance regardless of depth.

Actual Result:
- Flutter checks `surface != null && surface.surfaceDepth > 0`.
- Root-level surface appearance ignored.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge_types.dart:60-68

Root Cause:
Using surfaceDepth as a proxy for nesting creates asymmetric semantics;
web has no such gate.

Suggested Fix:
- Inherit from surface.parentAppearance whenever surface is present
  (regardless of depth), OR move depth check to the Surface scope.
- Document semantics.
===============================================================
```

```
===============================================================
Bug ID:       IB-FN-007
Title:        Overlay surfaceRingWidth defaults to 0 — avatar overlay never gets punch-through ring
Category:     Functional
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadgeOverlay

Scenario:
Avatar status overlay using `OneUiIndicatorBadgeOverlay(anchor:
bottomEnd)` without explicit surfaceRingWidth.

Steps to Reproduce:
1. Render `OneUiIndicatorBadgeOverlay(anchor: bottomEnd,
   surfaceRingColor: pageBg, host: avatar, indicator: ...)` and OMIT
   surfaceRingWidth.
2. Inspect.

Expected Result:
- Web IndicatorBadge.stories.tsx ALWAYS wraps avatar dot in
  `border: var(--Spacing-0-5) solid var(--Surface-Default)` — no opt-in flag.

Actual Result:
- `final ring = surfaceRingWidth ?? 0;` then `ring > 0` required for
  Border.all block.
- When null, the ring is skipped entirely.
- Dot renders flush against avatar.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge_overlay.dart:42-55

Root Cause:
API treats ring as opt-in; Figma + web treat it as integral to
bottomEnd avatar overlay.

Suggested Fix:
- When anchor==bottomEnd and surfaceRingWidth==null, default to
  Spacing-0-5 (~2px) and surfaceRingColor to nearest --Surface-Fill-Default.
- Make ring opt-OUT.
===============================================================
```

```
===============================================================
Bug ID:       IB-FN-008
Title:        Cross-platform parity drift — RN declares aria-label optional, web required, Flutter required-but-accepts-empty
Category:     Functional
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadge (parity vs RN + web)

Scenario:
Cross-platform component-parity audit.

Steps to Reproduce:
1. Compare IndicatorBadge.shared.ts (web required) vs interface.ts
   (RN optional) vs one_ui_indicator_badge.dart (Flutter required+empty-ok).

Expected Result:
- All three platforms agree.
- Figma + a11y spec require non-empty accessible name.

Actual Result:
- Native interface.ts: `'aria-label'?: string` — optional.
- Native consumers can ship without an accessible name.
- Flutter is stricter but allows empty (see IB-FN-005).

Code Reference:
- packages/ui-native/src/components/IndicatorBadge/interface.ts:16
- packages/ui/src/components/IndicatorBadge/IndicatorBadge.shared.ts:28

Root Cause:
Platform parity drift; native interface was relaxed (probably because
RN doesn't enforce TS as strictly at the call site).

Suggested Fix:
- Make 'aria-label' required on RN.
- Harden Flutter via assertion.
- Add check:parity test that diffs prop tables.
===============================================================
```

### 8.2 Accessibility (a11y) bugs

```
===============================================================
Bug ID:       IB-A11Y-001
Title:        liveRegion always-on — every dot pulses announcement on every rebuild
Category:     Accessibility (a11y)
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadge

Scenario:
Page with multiple static status indicators; any unrelated rebuild
fires phantom announcements.

Steps to Reproduce:
1. Render 10 IndicatorBadges with stable labels.
2. Trigger any unrelated rebuild (route change, theme toggle).
3. Observe TalkBack/VoiceOver/NVDA.

Expected Result:
- liveRegion ONLY true when badge's label actually changes.
- Web role='status' only re-announces when text content changes.

Actual Result:
- `Semantics(container: true, liveRegion: true, …)` hard-coded for every
  render.
- Each rebuild triggers polite announcement.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge.dart:73-78

Root Cause:
liveRegion=true should track LABEL CHANGE, not the widget. Same defect
class as Counter/Badge live-region churn.

Suggested Fix:
- Track previous label via StatefulWidget and only set liveRegion=true
  when label differs.
- OR drop liveRegion entirely and let consumers wrap status changes in
  their own live region.
===============================================================
```

```
===============================================================
Bug ID:       IB-A11Y-002
Title:        Semantics(container: true) on Flutter Web produces a focusable group — non-interactive dot becomes a tab stop
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter Web
Component:    OneUiIndicatorBadge

Scenario:
Keyboard-only user tabs through a page with status indicators.

Steps to Reproduce:
1. Render any `OneUiIndicatorBadge(semanticsLabel: 'Online')` on
   Flutter Web.
2. Press Tab.
3. Observe focus ring.

Expected Result:
- Web <span role='status'> has no tabindex — never a tab stop.

Actual Result:
- Flutter Web emits focusable ARIA group; non-interactive dot becomes
  part of tab order.
- Same defect as BADGE-A11Y-006.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge.dart:73-78

Root Cause:
container: true maps to focusable group on Flutter Web; combined with
liveRegion gives a polite live region that's also tab-stop-able.

Suggested Fix:
- Use Semantics with explicit focusable: false.
- OR migrate to a SemanticsConfiguration that sets isFocusable=false.
===============================================================
```

```
===============================================================
Bug ID:       IB-A11Y-003
Title:        Bold-on-tinted contrast not verified — yellow warning dot on warning-subtle surface invisible (WCAG 1.4.11 fail)
Category:     Accessibility (a11y)
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadge + indicator_badge_color_resolve

Scenario:
IndicatorBadge appearance='warning' inside <Surface mode='subtle'>
whose role is also warning-tinted.

Steps to Reproduce:
1. Wrap in OneUiSurface(mode: 'subtle') configured with warning role.
2. Render `OneUiIndicatorBadge(appearance: 'warning',
   semanticsLabel: 'Caution')`.
3. Measure contrast ratio.

Expected Result:
- WCAG 1.4.11 Non-text contrast ≥ 3:1 for status indicator vs immediate
  background.
- If too close, engine should apply stroke or higher-contrast fallback.

Actual Result:
- Returns raw kSurfaceBold token with no contrast guard.
- Yellow-warning bold (~#F5C518) on warning-subtle (~#FFF6D8) measures
  ~1.4:1 — fails WCAG.
- No stroke fallback, no warning.

Code Reference:
- packages/ui_flutter/lib/engine/indicator_badge_color_resolve.dart:17-44

Root Cause:
Engine emits role tokens that are context-aware via [data-surface]
remapping on web, but Flutter reads resolved value directly without
verifying contrast vs parent surface. Flutter lacks --Surface-Halo-Gap
punch-through ring for indicators on coloured surfaces.

Suggested Fix:
- Compute relative luminance vs resolved parent surface fill.
- If contrast < 3:1, add 1px stroke in --Text-OnBold-High (or role's
  Bold-High).
- Surface validateBrandCSS-style debug warning.
===============================================================
```

```
===============================================================
Bug ID:       IB-A11Y-004
Title:        Indicator size at xs (~6px) below WCAG 1.4.11 target — invisible on high-DPI mobile when standalone
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter Android, Flutter iOS
Component:    OneUiIndicatorBadge + indicator_badge_size_resolve

Scenario:
Smallest size used as standalone status indicator on a phone at default
density.

Steps to Reproduce:
1. Render `OneUiIndicatorBadge(size: 'xs', semanticsLabel: 'Online')`
   on phone.
2. Observe visibility from arm's length.

Expected Result:
- WCAG 2.5.5 / 1.4.11 — for non-interactive icons, ≥ 8 px diameter
  common heuristic.
- xs is borderline; should pair with outer ring or AT announcement.

Actual Result:
- xs → Spacing-1-5 (~6px).
- On 3x DPI screen, rendered ~2 physical pixels — invisible to mild
  visual impairments.
- No minimum size guard, no fallback.

Code Reference:
- packages/ui_flutter/lib/engine/indicator_badge_size_resolve.dart:25-32

Root Cause:
xs intended for slot/overlay use only. Component does not enforce
minimum visible diameter for standalone use.

Suggested Fix:
- Document that xs is intended for slot/overlay only.
- For standalone use, recommend s minimum.
- When standalone (no BadgeSlotSizeScope) AND size==xs, log debug warning.
===============================================================
```

```
===============================================================
Bug ID:       IB-A11Y-005
Title:        Android high-contrast accessibility setting ignored — dot does not boost stroke / colour
Category:     Accessibility (a11y)
Severity:     Medium
Platform:     Flutter Android
Component:    OneUiIndicatorBadge + indicator_badge_color_resolve

Scenario:
Android device with 'Accessibility → High contrast text' enabled.

Steps to Reproduce:
1. Enable Settings → Accessibility → Text and display → High contrast text.
2. Render IndicatorBadge on tinted surface.
3. Observe.

Expected Result:
- Boost contrast via stroke / deeper fill.
- Flutter exposes via MediaQuery.highContrastOf(context).

Actual Result:
- Engine never reads MediaQuery.highContrastOf.
- Dot renders identically regardless of system high-contrast.

Code Reference:
- packages/ui_flutter/lib/engine/indicator_badge_color_resolve.dart
  (no MediaQuery read)

Root Cause:
Same defect class as Badge equivalent. No platform reads highContrast
for any badge family.

Suggested Fix:
- Read MediaQuery.highContrastOf(context).
- When true, swap fill for role's Bold-High or add 1px stroke in
  --Text-High.
- Apply across all badge components.
===============================================================
```

### 8.3 Visual / UI bugs

```
===============================================================
Bug ID:       IB-VIS-001
Title:        Overlay Border.all shrinks inner content — bordered dot is smaller than unbordered dot at same indicatorSize
Category:     Visual
Severity:     High
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadgeOverlay

Scenario:
Avatar with bottomEnd overlay using surfaceRingColor + surfaceRingWidth > 0.

Steps to Reproduce:
1. Render two avatars side-by-side: one with surfaceRingWidth: Spacing-0-5,
   one with 0.
2. Measure rendered dot diameter (excluding ring).

Expected Result:
- Web `box-shadow: 0 0 0 var(--Spacing-0-5) var(--Surface-Default)`
  paints ring OUTSIDE.
- Inner diameter unchanged.
- Flutter should mirror with BoxShadow(spreadRadius) or larger outer
  circle.

Actual Result:
- Wrap uses `DecoratedBox(border: Border.all(width: ring))` which insets
  the child by ring.
- Inner dot is `indicatorSize - 2*ring` in diameter.
- Ringed dot visibly smaller than unringed dot.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge_overlay.dart:48-55

Root Cause:
Border.all renders inside the box in Flutter; web box-shadow renders
outside.

Suggested Fix:
- Replace Border.all with `BoxShadow(spreadRadius: ring, color:
  surfaceRingColor, blurRadius: 0)`.
- OR wrap in larger SizedBox with ring colour as outer fill and dot
  centered.
===============================================================
```

```
===============================================================
Bug ID:       IB-VIS-002
Title:        Overlay anchors only cover topEnd / bottomEnd — topStart / bottomStart not supported
Category:     Visual
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadgeOverlay

Scenario:
Figma flows that need top-left/bottom-left anchored dots (selection
cues, dismissed cards).

Steps to Reproduce:
1. Examine `OneUiIndicatorBadgeOverlayAnchor` enum.

Expected Result:
- All four corners.
- Web is pure CSS — any top/bottom/left/right combo works.

Actual Result:
- Enum has only `topEnd` and `bottomEnd`.
- PositionedDirectional correctly mirrors end in RTL, but no equivalent
  for start.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge_overlay.dart:7-13

Root Cause:
Enum constrained to two Storybook patterns. Real apps need at least
topStart.

Suggested Fix:
- Extend enum: topStart, topEnd, bottomStart, bottomEnd.
- Map each to PositionedDirectional(top/bottom, start/end: 0).
===============================================================
```

```
===============================================================
Bug ID:       IB-VIS-003
Title:        Shape switches between circle and rectangle based on borderRadius vs side — brand override can flip rendering primitive
Category:     Visual
Severity:     Low
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadge

Scenario:
Brand sets --IndicatorBadge-borderRadius to small literal (e.g. Shape-1 ~2px).

Steps to Reproduce:
1. Configure --IndicatorBadge-borderRadius: var(--Shape-1).
2. Render `OneUiIndicatorBadge(size: 'xl', semanticsLabel: 'X')`.
3. Compare to web.

Expected Result:
- Web `border-radius` always paints a (possibly squircle) rectangle.
- No rendering primitive switch.

Actual Result:
- Switches between BoxShape.circle (radius >= side/2) and
  BoxShape.rectangle.
- At threshold, AA differs (circle uses path; rectangle uses RRect).

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge.dart:59-68

Root Cause:
Switch likely added because BoxShape.rectangle + BorderRadius.circular(9999)
produces visible AA artifacts at small sizes. Threshold creates
discontinuity.

Suggested Fix:
- Always use BoxShape.rectangle + BorderRadius.circular(min(borderRadius,
  side/2)).
- Test AA on iOS/Android/Web.
- Document if circle is unavoidable.
===============================================================
```

```
===============================================================
Bug ID:       IB-VIS-004
Title:        Overlay SizedBox(hostSide) clips ring layout extent — adjacent siblings overlap
Category:     Visual
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadgeOverlay

Scenario:
Avatar with bottomEnd indicator that has a ring extending beyond the
host bounds.

Steps to Reproduce:
1. Render `OneUiIndicatorBadgeOverlay(hostSide: 24, indicatorSize: 's'
   (~8px), anchor: bottomEnd)` with surfaceRingWidth: 2.
2. Place adjacent widgets in a Row with no spacing.

Expected Result:
- Web absolute-positioning with no clipping wrapper — ring naturally
  extends outside host bounds.

Actual Result:
- SizedBox(width: hostSide, height: hostSide) constrains layout.
- PositionedDirectional puts dot's bottom-right at SizedBox corner.
- With ring, visual extent exceeds layout extent → adjacent siblings
  see overlap.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge_overlay.dart:70-80

Root Cause:
SizedBox-around-Stack idiom doesn't account for ring overflow.

Suggested Fix:
- Expand wrapping SizedBox by ring width on dot's side.
- OR translate dot via PositionedDirectional(bottom: -ring, end: -ring)
  to keep visual centre at corner.
===============================================================
```

```
===============================================================
Bug ID:       IB-VIS-005
Title:        Surface-ring colour does not flip in dark mode — light-mode value baked into overlay at construction time
Category:     Visual
Severity:     Medium
Platform:     Flutter (Android, iOS, Web)
Component:    OneUiIndicatorBadgeOverlay

Scenario:
App switches from light to dark theme while avatar overlay is mounted.

Steps to Reproduce:
1. Mount avatar overlay in light theme reading
   Theme.of(context).colorScheme.surface, pass as surfaceRingColor.
2. Toggle to dark.
3. Observe.

Expected Result:
- Web `border: ... solid var(--Surface-Default)` — CSS variable remaps
  via engine's dark emission.
- Ring always matches page background.

Actual Result:
- surfaceRingColor is a `Color`, not a token reference.
- If a consumer hoists the value above the theme change (e.g. caches
  Color(0xFFFFFFFF)), no dark-mode remap.

Code Reference:
- packages/ui_flutter/lib/widgets/one_ui_indicator_badge_overlay.dart:28,37
- packages/ui_flutter/lib/foundations/indicator_badge_showcase.dart:287,360-361

Root Cause:
surfaceRingColor accepts Color, not token name. Pattern relies on caller
re-reading Theme on every rebuild.

Suggested Fix:
- Make surfaceRingColor optional and default to
  `OneUiSurfaceScope.of(context).resolvedRoles[...].surfaces[kSurfaceDefault]`
  inside the overlay's build.
- OR accept a token name string.
===============================================================
```

---

## 9. Test coverage map

Each bug ID maps to a regression test in
`apps/qa-playground-flutter/test/components/indicator_badge/indicator_badge_regression_test.dart`.

| Bug ID | Test name | Coverage notes |
|--------|-----------|----------------|
| IB-FN-001 | `[IB-FN-001] brand-loading race shows silent fallback, never ConvexGapCard` | Mount without OneUiScope; assert no `ConvexGapCard` in tree; assert `SizedBox.shrink` or transparent placeholder with semantics. |
| IB-FN-002 | `[IB-FN-002] --IndicatorBadge-backgroundColor override applies across all appearances` | Brand with override; render 9 appearances; assert resolved colour matches override for each. |
| IB-FN-003 | `[IB-FN-003] unconfigured role falls back to neutral, not Material primary` | Brand without sparkle role; render `appearance: 'sparkle'`; assert resolved colour matches neutral's `surfaces[kSurfaceBold]`. |
| IB-FN-004 | `[IB-FN-004] invalid appearance string falls back to primary with debug warning` | Render `appearance: 'negaitve'`; in debug mode assert `debugPrint` fired; assert resolved colour matches primary. |
| IB-FN-005 | `[IB-FN-005] empty / whitespace semanticsLabel asserts in debug` | Render `semanticsLabel: ''` and `'   '`; assert `AssertionError` fires in debug mode. |
| IB-FN-006 | `[IB-FN-006] appearance='auto' inherits from root-level Surface (depth 0)` | Wrap in `OneUiSurfaceBootstrap` with positive root role; render `appearance: 'auto'`; assert resolved colour matches positive bold. |
| IB-FN-007 | `[IB-FN-007] bottomEnd overlay defaults to surfaceRingWidth Spacing-0-5` | Render overlay with anchor: bottomEnd and OMIT surfaceRingWidth; assert ring is present with width ≈ 2px. |
| IB-FN-008 | `[IB-FN-008] parity — Flutter aria-label requires non-empty across platforms` | Static parity test diffing prop tables of web / RN / Flutter; assert all three require non-empty `aria-label` / `semanticsLabel`. |
| IB-A11Y-001 | `[IB-A11Y-001] liveRegion only true when label changes` | Render with stable label; trigger unrelated rebuild; assert `liveRegion: false` after first frame. |
| IB-A11Y-002 | `[IB-A11Y-002] Flutter Web does not emit focusable group for non-interactive dot` | Flutter Web only; render dot; assert generated DOM has no `tabindex="0"`. |
| IB-A11Y-003 | `[IB-A11Y-003] warning dot on warning-subtle surface gets contrast stroke` | Wrap in subtle surface with warning role; render `appearance: 'warning'`; assert stroke is added when contrast < 3:1. |
| IB-A11Y-004 | `[IB-A11Y-004] standalone xs dot emits debug warning` | Render `size: 'xs'` outside `BadgeSlotSizeScope`; in debug mode assert `debugPrint` fired recommending `s`. |
| IB-A11Y-005 | `[IB-A11Y-005] MediaQuery.highContrastOf boosts dot contrast` | Wrap with `MediaQuery(highContrast: true)`; render on tinted surface; assert stroke / colour boost applied. |
| IB-VIS-001 | `[IB-VIS-001] surfaceRingWidth paints OUTSIDE — inner diameter unchanged` | Render two overlays with same indicatorSize, one with ring, one without; assert measured inner diameters match. |
| IB-VIS-002 | `[IB-VIS-002] overlay anchor supports topStart / bottomStart` | Render overlay with `anchor: topStart` and `bottomStart`; assert dot positioned at correct corner; RTL mirror check. |
| IB-VIS-003 | `[IB-VIS-003] shape always uses BoxShape.rectangle + clamped radius` | Render across the borderRadius / size grid; assert resolved `BoxShape.rectangle` for every combination. |
| IB-VIS-004 | `[IB-VIS-004] overlay layout extent includes ring — adjacent siblings do not overlap` | Render two avatar overlays in a Row with no spacing; assert no overlap of ringed dots. |
| IB-VIS-005 | `[IB-VIS-005] surfaceRingColor re-resolves on dark-mode toggle` | Mount overlay in light theme; toggle to dark; assert ring colour matches dark-mode `--Surface-Default`. |

---
