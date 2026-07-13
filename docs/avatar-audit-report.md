# OneUI Flutter Avatar — Component Audit Report

**Date:** 2026-06-16 (AVT-FN-011 appended 2026-06-17)
**Component:** `OneUiAvatar` (Flutter)
**Source:** `packages/ui_flutter/lib/widgets/one_ui_avatar.dart` + engine + a11y resolver + types
**Cross-checked against:**
- React Web Avatar (`packages/ui/src/components/Avatar/Avatar.tsx` + `Avatar.module.css`)
- React Native Avatar (`packages/ui-native/src/components/Avatar/*`)
- Figma spec (Avatar matrix: 8 sizes × 3 attentions × 9 appearances × 3 content types + disabled)
- WCAG 2.1 AA
- Direct test runs of `apps/qa-playground-flutter/test/components/avatar/*`

**Severity legend:**
- **Critical** — ships broken UX, runtime crash, or AT failure
- **High** — visible regression vs spec / parity gap
- **Medium** — noticeable polish gap
- **Low** — nice-to-have / UX surprise

**Headline:** 19 audit findings → **19 actionable component bugs** — **0 Critical**, **6 High**, **10 Medium**, **3 Low**.

---

## 1. Functional bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| AVT-FN-001 | Functional | Flutter (all) | `content: text` with empty `alt` | 1) `OneUiAvatar(content: text, alt: '')`. 2) Inspect rendered children. | Resolver downgrades empty alt to `icon` content (mirrors the 2xs/xs text→icon guard). User sees the default person silhouette instead of an empty pill. | `oneUiAvatarGetInitials('')` returns `''`. The widget renders `Text('')` → an invisible empty Text inside a coloured circle. Broken UX with zero feedback. | High | `packages/ui_flutter/lib/widgets/one_ui_avatar_types.dart:80-89`; `packages/ui_flutter/lib/widgets/one_ui_avatar.dart:191-200` |
| AVT-FN-002 | Functional | Flutter (all) | Avatar rendered without `OneUiScope` (early bootstrap, isolated test, modular screen) | 1) Bare `MaterialApp` (no `OneUiScope`) around `OneUiAvatar(content: icon, alt: 'A')`. 2) Inspect resolved colours. | Debug-mode assertion pointing at the missing bootstrap OR safe brand-neutral fallback using design tokens — not Material seed. | The widget DOES render `ConvexGapCard` when the design system payload is missing (early-exit at avatar.dart:134-140). BUT the colour resolver falls back to `Theme.of(context).colorScheme.primary` / `onPrimary` when role tokens are present-but-incomplete — off-brand colour ships silently. | High | `packages/ui_flutter/lib/engine/avatar_color_resolve.dart:48-65` |
| AVT-FN-003 | Functional | Flutter (all) | QA writes Flutter Driver / `integration_test` using `find.byIdentifier` (matches RN `testID` + web `data-testid`) | 1) `OneUiAvatar(testId: 'hero-avatar')`. 2) `find.byIdentifier('hero-avatar')`. | `Semantics(identifier: 'hero-avatar', label, image: true)` so the locator works on web / RN / Flutter. | Only `KeyedSubtree(key: ValueKey(testId))`. `Semantics.identifier` empty. `find.byIdentifier` returns nothing on Playwright/Patrol/Maestro/Appium. | High | `packages/ui_flutter/lib/widgets/one_ui_avatar.dart:260-263` |
| AVT-FN-004 | Functional | Flutter (all) | Brand needs `brand-bg`-tinted avatar (e.g. on a Brand-Bg surface) | 1) `OneUiAvatar(appearance: 'brand-bg')`. 2) Inspect `data-appearance`. | `'brand-bg'` resolves cleanly, listed in `kOneUiAvatarFigmaAppearances`, painted with Brand-Bg tokens. Matches IconContained / Button / Chip catalogues. | The docstring on types.dart:28 says “Code also supports `brand-bg`” but the constant `kOneUiAvatarFigmaAppearances` (line 29-38) EXCLUDES it. `resolveOneUiAvatarAppearance` returns the string verbatim; downstream `tokensForAppearance` may not have a `brand-bg` role. Inconsistent / unreliable. | High | `packages/ui_flutter/lib/widgets/one_ui_avatar_types.dart:28-38` |
| AVT-FN-005 | Functional | Flutter (all) | Caller mis-types: `appearance: 'destructive'` or `'success'` | 1) Pass unknown appearance string. 2) Check `data-appearance` and visible role. | Debug assert in dev mode; in release fall back to `'primary'` (brand identity). | Returns the string verbatim from `resolveOneUiAvatarAppearance`. `tokensForAppearance` returns null. Colour resolver silently falls back to Material `colorScheme.primary` (`onPrimary`). Off-brand colour ships. | Medium | `packages/ui_flutter/lib/widgets/one_ui_avatar_types.dart:56-73`; `packages/ui_flutter/lib/engine/avatar_color_resolve.dart:48-65` |
| AVT-FN-006 | Functional | Flutter (all) | Caller mis-types: `size: 'huge'` / `'jumbo'` | 1) Pass unknown size. 2) Inspect rendered size. | Debug assert in dev. | Silently falls back to `'m'` (`oneUiResolveAvatarSize:51`). Masks caller typos; test expectations off. | Medium | `packages/ui_flutter/lib/widgets/one_ui_avatar_types.dart:49-53` |
| AVT-FN-007 | Functional | Flutter (all) | Caller passes pre-sized SVG (`SvgPicture.asset` with explicit width/height) as `icon` | 1) `OneUiAvatar(icon: SvgPicture.asset('a.svg', width: 12, height: 12), size: 'm')`. 2) Inspect rendered glyph. | Glyph paints at natural 12×12 pixel-perfect. Web `isValidElement` renders the element untouched. | `SizedBox(iconPx) + FittedBox(BoxFit.contain)` upscales / downscales — fractional-pixel blurring at xs/s sizes. | Medium | `packages/ui_flutter/lib/widgets/one_ui_avatar.dart:202-214` |
| AVT-FN-008 | Functional | Flutter (all) | `customSize` used for text content with a small pixel value | 1) `OneUiAvatar(content: text, size: 'custom', customSize: 24, alt: 'M J')`. 2) Inspect rendered font size. | Text font size scales relative to `customSize` (≤ container/2). | `_textStyleForSize` always maps `'custom'` to `Label-L` (~18 px font) regardless of `customSize`. For a 24 px container the text overflows the pill. | Medium | `packages/ui_flutter/lib/engine/avatar_size_resolve.dart:37,122-130` |
| AVT-FN-009 | Functional | Flutter (all) | Brand omits `--Avatar-borderRadius` token (legacy / partial migration) and renders custom-size avatar | 1) Strip `--Avatar-borderRadius`. 2) Render `size: 'custom'`. 3) Inspect ConvexGapCard rows. | One `--Avatar-borderRadius` gap row. | `_collectGaps` resolves the token TWICE for `size: 'custom'` (line 101 and line 111). The gap list contains the same missing-token message twice. Diagnostic noise. | Low | `packages/ui_flutter/lib/widgets/one_ui_avatar.dart:101-118` |
| AVT-FN-010 | Functional | Flutter (all) | Dev passes whitespace-only `src` (e.g. trimmed input) | 1) `OneUiAvatar(content: image, alt: 'A', src: '   ')`. 2) Inspect network behaviour. | Treat as empty (no load attempt) — fall through to non-image branch. | `widget.src!.isNotEmpty` is true for `'   '`, so the platform-view / HTTP fetch fires, hits the failed set, eventually error-falls-back. Wasted request. | Low | `packages/ui_flutter/lib/widgets/one_ui_avatar.dart:165-168` |
| AVT-FN-011 | Functional | Flutter (all) | Unknown `size` value (typo or stale code path) | 1) `OneUiAvatar(content: icon, size: 'jumbo', alt: 'Alice')`. 2) Inspect rendered widget. | `oneUiResolveAvatarSize` falls unknown sizes back to `'m'` (40 px). Rendered output equals a real `size: 'm'` avatar. | Resolver returns `'m'`, but `_collectGaps` validates against raw `widget.size`. The container cascade has a `--Avatar-size-m` fallback (succeeds); the iconSize cascade `['--Avatar-iconSize-$sz']` does NOT. A gap is added → `ConvexGapCard` renders instead of the avatar. Resolver and gap-collector disagree. | Medium | `packages/ui_flutter/lib/widgets/one_ui_avatar.dart:79-99` |

---

## 2. Accessibility (a11y) bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| AVT-A11Y-001 | Accessibility (a11y) | Flutter (all) | Decorative avatar (no `alt`) | 1) `OneUiAvatar(content: icon, alt: '')` placed next to a name label. 2) Run VoiceOver / TalkBack. | No Semantics node (web parity: empty `aria-label` → `aria-hidden`). The accompanying name carries the meaning. | Resolver coerces empty alt to `'avatar'` (a11y.dart:38). AT announces generic “avatar, image” — pollution beside the actual name. | High | `packages/ui_flutter/lib/widgets/one_ui_avatar_a11y.dart:38` |
| AVT-A11Y-002 | Accessibility (a11y) | Flutter iOS + Android | Disabled avatar used as status indicator (greyed) | 1) `OneUiAvatar(disabled: true, alt: 'Alice')`. 2) Run TalkBack / VoiceOver. | "Alice, image, disabled" — web parity with `aria-disabled` on `role="img"` (NVDA / VoiceOver both announce). | `Semantics(image: true, enabled: a11y.enabled)`. The `enabled` flag is only meaningful for button / link / textfield roles; image role ignores it. AT announces just "Alice" — disabled state invisible. | High | `packages/ui_flutter/lib/widgets/one_ui_avatar.dart:241-251` |
| AVT-A11Y-003 | Accessibility (a11y) | Flutter (all) | Caller passes only `semanticsHint` without `alt` | 1) `OneUiAvatar(alt: '', semanticsHint: 'Profile picture')`. 2) Run AT. | Refuse hint without alt (web / native pattern) + debug warning. | Hint is paired with the generic `'avatar'` label → AT announces “avatar, profile picture”. Useless context. | Medium | `packages/ui_flutter/lib/widgets/one_ui_avatar_a11y.dart:23-43` |
| AVT-A11Y-004 | Accessibility (a11y) | Flutter (all) | Avatar as status indicator; disabled multiplied by `Opacity(0.38)` | 1) `OneUiAvatar(appearance: 'primary', attention: 'high', disabled: true)`. 2) Measure contrast vs page background. | Disabled visibly de-emphasises while keeping ≥ 3:1 (WCAG 1.4.11). Native uses 0.5. | `Opacity(0.38)` literal fallback (`resolveAvatarDisabledOpacity:131,149`). Contrast drops to ~1.3:1 for the badge against a light page. Fails WCAG 1.4.11. | Medium | `packages/ui_flutter/lib/engine/avatar_color_resolve.dart:129-150` |
| AVT-A11Y-005 | Accessibility (a11y) | Flutter Web | `content: image` with real `src` on Flutter Web | 1) Render `OneUiAvatar(content: image, src: 'https://…')` on Flutter Web. 2) Inspect a11y tree in DevTools. | Single Semantics node from `Semantics(image: true, label: alt)`; underlying `<img>` platform-view excluded. | Image branch (avatar.dart:185-190) does NOT wrap `OneUiAvatarNetworkImage` in `ExcludeSemantics` — only the non-image branch does (line 224). Browser may expose the `<img>` element separately on Flutter Web, double-announcing. | Low | `packages/ui_flutter/lib/widgets/one_ui_avatar.dart:182-227` |

---

## 3. Visual / UI bugs

| Bug ID | Category | Platform | Scenario | Steps to Reproduce | Expected Result | Actual Result | Severity | Reference |
|--------|----------|----------|----------|-------------------|-----------------|---------------|----------|-----------|
| AVT-VIS-001 | Visual | Flutter (all) | `attention: high` on a brand that has both `onBoldContent.tinted` AND `onBoldContent.tintedA11y` populated (the common case) | 1) `OneUiAvatar(content: ?, attention: 'high', appearance: 'primary')`. 2) Compare icon and text initials side by side at the same size. | Icon and text initials paint in the SAME on-bold shade (web Avatar.module.css:202-207 uses `Bold-TintedA11y` for both). | `_iconFromRole` HIGH uses `onBoldContent['tinted'] ?? onBoldContent['tintedA11y']!`. `_textFromRole` HIGH uses `onBoldContent['tintedA11y'] ?? onBoldContent['high']!`. When both keys exist the resolver paints icon in `tinted` and text in `tintedA11y` — DIFFERENT shades on the same fill. | High | `packages/ui_flutter/lib/engine/avatar_color_resolve.dart:76-94` |
| AVT-VIS-002 | Visual | Flutter (all) | No design-system payload; container border-radius resolution | 1) Render `OneUiAvatar` outside `OneUiScope`. 2) Inspect border radius. | Token-derived pill OR mathematically equivalent (`containerPx / 2`). | `resolveAvatarBorderRadiusPx` returns literal `9999` (avatar_size_resolve.dart:135,143). Out of line with CLAUDE.md "Zero literals" rule. | Medium | `packages/ui_flutter/lib/engine/avatar_size_resolve.dart:132-144` |
| AVT-VIS-003 | Visual | Flutter (all) | Text content with small `customSize` | 1) `OneUiAvatar(content: text, size: 'custom', customSize: 20, alt: 'M J')`. 2) Inspect. | Font size proportional to container (≤ container/2). | Always Label-L (~18 px) regardless of `customSize`. Text overflows pill at small customSize values. Same root cause as AVT-FN-008; tracked separately because the visual symptom (text spilling out) is distinct from the resolver bug. | Medium | `packages/ui_flutter/lib/engine/avatar_size_resolve.dart:37,122-130` |

---

## 4. Parked design gaps (NOT counted as bugs)

| Item | Why parked |
|------|-----------|
| **2xs icon = container size** (avatar_size_resolve.dart:104) | Matches Figma + web spec. Icon fills the 16 px container intentionally — no padding margin at the smallest size. Design decision, not a defect. |
| **Initials limited to 2 chars** (`oneUiAvatarGetInitials` `.take(2)`) | Matches web `getInitials()` and Figma reference. "Mary Jane Watson" → "MJ" by spec, not "MJS". |
| **No interactive variant** (no onPress) | Flutter `OneUiAvatar` is intentionally non-interactive. Interactive needs would warrant a separate `OneUiAvatarButton` widget. Web Avatar is also non-interactive by default; interactive is a separate Base UI wrapper. |
| **`accent` not a separate prop** | Figma comment (web Avatar.tsx:40-41) confirms the accent band uses the same role colours as `appearance`. No prop divergence needed in Flutter. |

---

## 5. Summary

### 5.1 Total bug count by category

| Category | Audit findings | Real bugs |
|----------|----------------|-----------|
| Functional | 11 | 11 |
| Accessibility (a11y) | 5 | 5 |
| Visual | 3 | 3 |
| **Total** | **19** | **19 actionable** |

### 5.2 Total bug count by severity

| Severity | Count |
|----------|-------|
| Critical | **0** |
| High | **6** |
| Medium | **10** |
| Low | **3** |
| **Total** | **19** |

### 5.3 Platform-wise distribution

| Platform | Count |
|----------|-------|
| Flutter (all — Android + iOS + Web) | 17 |
| Flutter iOS + Android (image role disabled-state) | 1 |
| Flutter Web only (image-branch double-announce risk) | 1 |

### 5.4 Critical & High issues — at a glance

1. **AVT-FN-001** — Empty `alt` + text content renders an invisible empty Text inside a coloured pill. Should downgrade to icon content like 2xs/xs do.
2. **AVT-FN-002** — Colour resolver silently falls back to Material `colorScheme.primary` when role tokens are absent (no `OneUiScope` or incomplete brand). Off-brand colour ships.
3. **AVT-FN-003** — `testId` wired into `ValueKey` only — `Semantics.identifier` empty; cross-platform locators (RN `testID`, web `data-testid`) break.
4. **AVT-FN-004** — `brand-bg` is documented as supported but missing from `kOneUiAvatarFigmaAppearances`. Inconsistent with IconContained / Button / Chip catalogues.
5. **AVT-A11Y-001** — Empty `alt` coerced to generic `'avatar'` label. AT announces "avatar, image" beside the user's actual name. Web/native parity is decorative (`aria-hidden`).
6. **AVT-A11Y-002** — Disabled state not announced. `Semantics(image: true, enabled: false)` is silent — image role ignores the `enabled` flag on iOS / Android.
7. **AVT-VIS-001** — `_iconFromRole` and `_textFromRole` use asymmetric first-choice tokens on HIGH attention. Icon and text initials paint in different shades on the same bold fill.

### 5.5 Accessibility compliance summary

| Concern | Status |
|---------|--------|
| WCAG 1.4.11 (Non-text Contrast) | **Fails** for disabled state (`opacity 0.38`, AVT-A11Y-004). |
| WCAG 1.4.4 (Resize Text) | Text scaling honoured via Label typography tokens; no clipping below 200 % at default sizes. PASS. |
| WCAG 2.5.5 (Target Size) | Non-interactive; not applicable. |
| Decorative content marking | **Fails** — empty `alt` is forced to a label instead of being marked decorative (AVT-A11Y-001). |
| Disabled state announcement | **Fails** for image role on iOS / Android (AVT-A11Y-002). |
| Cross-platform locator | **Fails** — `testId` not in `Semantics.identifier` (AVT-FN-003). |

### 5.6 Driving the bug count to zero

1. Apply the dev fix to `packages/ui_flutter/lib/widgets/one_ui_avatar*.dart` for the matching `[AVT-XX-NNN]`.
2. Re-run the regression suite (`flutter test test/components/avatar/avatar_regression_test.dart`).
3. That test turns green; commit alongside the fix.
4. Decrement `totalPendingBugs` in the `[meta] burn-down counter` test.
5. When all 19 pass, the suite is fully green.
