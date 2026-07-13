# Badge — QA test plan

**Component:** `OneUiBadge`
**Source:** `packages/ui_flutter/lib/widgets/one_ui_badge.dart`
**Types:** `packages/ui_flutter/lib/widgets/one_ui_badge_types.dart`
**A11y resolver:** `packages/ui_flutter/lib/widgets/one_ui_badge_a11y.dart`
**Parity:** web `Badge.tsx`, RN `Badge.native.tsx`, web QA `badge-qa.spec.ts`

## Test files

| File | Layer |
|------|-------|
| `badge_functional_test.dart` | Functional `[fn]` + `[smoke]` |
| `badge_a11y_test.dart` | Resolver `[a11y]` + widget semantics |
| `badge_golden_test.dart` | Visual regression (light) |
| `badge_golden_dark_test.dart` | Visual regression (dark mode) |
| `badge_golden_surface_test.dart` | Visual regression (surface nesting) |
| `badge_regression_test.dart` | Audit burn-down — one test per bug from `docs/badge-audit-report.md` (28 skipped pending dev fix, 4 documented contracts pass) |
| `../../integration_test/badge_e2e_test.dart` | On-device E2E |

## Figma API (reference)

| Property | Values | Notes |
|----------|--------|-------|
| `size` | xs / s / m / l / xl | Maps to `--Badge-height-<size>` and matching paddings, font, gap. Unknown sizes fall back to `m`. |
| `attention` | high / medium / low | Maps to bold / subtle / ghost variant via `kBadgeAttentionToVariant`. |
| `appearance` | auto, neutral, primary, secondary, sparkle, positive, negative, informative, warning, brand-bg | `auto` inherits from the surrounding `<Surface>` parent (or `sparkle` outside). |
| `start` | none / Icon / Avatar / CounterBadge / IndicatorBadge | Renders before the label. |
| `end` | none / Icon / Avatar / CounterBadge / IndicatorBadge | Renders after the label. |
| `accent` (code-only) | primary / secondary / sparkle | No separate prop — use `appearance` to pick the role. |
| `content` (code-only) | string / number | Drives the visible label. Empty string ⇒ no Text widget. |
| `semanticsLabel` | string | Wins over child text as the accessible name. |
| `semanticsHint` | string | Supplementary description for AT. |
| `testId` | string | Attaches a `ValueKey` to the root for tests. |

## Conditional rules (tested explicitly)

- `appearance="auto"` outside a `<Surface>` defaults to `sparkle` (matches web/RN).
- `appearance="auto"` inside `<Surface mode=… appearance=secondary>` inherits the parent role.
- Explicit `appearance=…` wins over the surface parent.
- Explicit `variant=…` wins over `attention=…`.
- Empty child string emits no `Text` widget (badge still renders as a chip).
- Long label clips to one line with `TextOverflow.ellipsis` (`maxLines = 1`).
- Slot semantics are excluded from AT when the badge supplies its own `semanticsLabel`.

## P0 accessibility checks

- [x] Accessible name (`semanticsLabel` overrides; falls back to string child or number).
- [x] `Semantics.isLiveRegion` flag is set — badges are status chips and AT must announce updates (web `role="status"` / RN `accessibilityLiveRegion: 'polite'`).
- [x] Badge does NOT expose `Semantics.isButton` or a tap action — non-interactive.
- [x] `semanticsHint` flows through to AT.
- [x] Slot semantics excluded when the badge has its own label (no double-announcing).
- [x] No empty Semantics node when neither label nor child text supplied.

## False-confidence guardrails

These tests deliberately use observable side-effects so a regression that
silently ignores a Figma prop fails the suite:

- **`size`** — asserts strict ordering of `tester.getSize(badge).height` across
  xs ≤ s ≤ m ≤ l ≤ xl (and xs < xl). Unknown size string must round-trip to `m`.
- **`attention`** — asserts the resolved variant via the
  `oneui-badge|data-…|data-variant=…|…` key encoded on the root.
- **`appearance`** — `auto` outside Surface defaults to sparkle (data-attribute
  key encodes this), and inherits inside a Surface.
- **`start` / `end`** — slot widgets are looked up by `ValueKey` so the
  presence of the slot is observable, not just smoke.
- **shrink-wrap** — width inside a 400px parent is asserted < 200px so the badge
  cannot accidentally fill its parent.

## Visual matrix coverage

Light-mode goldens cover:
- `attention × appearance` — 3 × 8 = 24 baselines.
- `size × attention` — 5 × 3 = 15 baselines.
- core slots (start icon, end icon, both, label-only, counter slot, indicator slot, avatar slot).

Dark-mode goldens cover:
- `attention × appearance` — 3 × 6 = 18 baselines for the high-signal axis.
- start + end icon slot (1 baseline).

Surface goldens cover:
- 4 surface modes × 3 attention = 12 baselines under
  `<Surface mode=… appearance=primary>`.
- Cross-role surfaces: `subtle/secondary + primary badge`, `bold/neutral + auto badge low`.

## Run

```bash
cd apps/qa-playground-flutter

# Functional + a11y + smoke
flutter test test/components/badge/badge_functional_test.dart
flutter test test/components/badge/badge_a11y_test.dart

# Visual regression
flutter test test/components/badge/badge_golden_test.dart
flutter test test/components/badge/badge_golden_dark_test.dart
flutter test test/components/badge/badge_golden_surface_test.dart

# E2E on a connected device
flutter test integration_test/badge_e2e_test.dart -d emulator-5554

# Bless new baselines after an intentional visual change
flutter test --update-goldens test/components/badge/
```
