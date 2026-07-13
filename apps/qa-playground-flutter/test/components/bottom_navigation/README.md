# BottomNavigation QA tests

Figma source: **BottomNav** (`items: 2|3|4|5` × `label: 1Line|2Line|none`) +
**BottomNav.Item** (`active: true|false` × `type: label1Line|label2Line|labelFalse`).

| File | Layer | Status |
|------|-------|--------|
| `bottom_navigation_functional_test.dart` | Functional `[fn]` + smoke (items, label types, active resolution, controlled/uncontrolled, icon swap, divider, callbacks, layout, testId) | ~164 pass |
| `bottom_navigation_a11y_test.dart` | Resolver `[a11y]` + widget semantics (nav landmark, tab button/selected/disabled/link, icon-only labels, hints, keyboard, touch target) | ~54 pass |
| `bottom_navigation_figma_parity_test.dart` | Figma API parity `[figma]` — every `items` / `label` / `type` / `active` value exercised end-to-end | ~41 pass |
| `bottom_navigation_platform_test.dart` | Platform-specific `[platform]` — mobile (tap, touch target, link) vs web/desktop (keyboard, `<a>` link semantics) | ~14 pass |
| `bottom_navigation_golden_test.dart` | Visual regression — light (items×label matrix, appearance sweep, active swap, disabled, divider) | 23 baselines |
| `bottom_navigation_golden_dark_test.dart` | Visual regression — dark mode | 7 baselines |
| `bottom_navigation_golden_surface_test.dart` | Visual regression — `appearance:auto` inside a Surface | 6 baselines |
| `bottom_navigation_regression_test.dart` | **Audit burn-down + attribution** — `[confirmed]` (2 Flutter bugs) + `[debatable]` (3) are RED; `[parity]` (BN-VIS-001/002) GREEN proving Flutter honours canonical tokens (the real fix is a foundation token-name mismatch in `jio.ts`, not Flutter) | **`+7 -13`** |
| `../../../integration_test/bottom_navigation_e2e_test.dart` | On-device / Chrome E2E | E2E |

Full audit: [`../../../../docs/bottom-navigation-audit-report.md`](../../../../docs/bottom-navigation-audit-report.md).

## Why we don't skip regression tests — and how attribution is kept honest

Every finding was reproduced against the real widget before being written (no
speculative RED), then **cross-checked against the web CSS** to attribute it
correctly. The suite splits failures so you never get false confidence in
either direction:

- `[confirmed]` (RED) — **2 genuine Flutter component bugs**: BN-VIS-003 (label
  typography hard-coded; web honours `--BottomNavItem-labelFontSize`) and
  BN-FN-002 (value-trim asymmetry not present in web).
- `[debatable]` (RED) — **3 hardening / a11y gaps** that are parity-aligned with
  web (BN-FN-001 appearance validation, BN-A11Y-001 icon-only naming, BN-A11Y-002
  resolver hint trim). Design calls, not clear defects.
- `[parity]` (GREEN) — BN-VIS-001/002 **prove the Flutter resolver honours the
  canonical `--BottomNavItem-*` tokens exactly like the web CSS**. The brand
  values look "dead" only because `packages/ui/cdn-bootstrap/jio.ts` emits a
  different prefix (`--BottomNavigation-item*`) — a **foundation** bug that hits
  web AND Flutter equally, *not* a Flutter component defect.

## High-confidence testing (no false confidence)

This suite validates ACTUAL behaviour, never just snapshots/constants:

- `tester.getSize` measures the rendered item shell height (none 56 < 1line 64
  < 2line 72) and the equal-width Expanded slots for 2/3/4/5 items.
- Selected / disabled / link state is read off the real `SemanticsData`
  (`isSelected`, `isEnabled`, `isLink`, `linkUrl`) — aria-current / `<a>` parity.
- labelType / appearance / item-count resolution is asserted via the
  data-attribute key the widget actually emits (`oneui-bottom-nav|data-items=…`).
- Active-icon swap is asserted by which icon Key/glyph is in the tree.
- Callback ordering (`onClick`/`onTap`/`onPressed` → `onValueChange`) is captured
  in a list and compared exactly.
- Token wiring is proved by injecting a sentinel brand token value and measuring
  the rendered result — the regression suite catches dead brand tokens.
- The Jio Convex fixture renders byte-identical to `qa-playground:flutter`;
  measurement tests use a synthetic px-pinned design system so assertions are
  never circular against the resolver's own output.

## Platform coverage

`testWidgetsAllPlatforms` runs functional/a11y/figma on Android + iOS + Linux
(web/desktop semantics proxy). `bottom_navigation_platform_test.dart` adds
explicit mobile-vs-web behaviour (touch target, pointer tap, keyboard
Space/Enter, `<a>` link semantics). E2E runs on real devices + Chrome.

## Quick run

```bash
flutter test test/components/bottom_navigation/
flutter test test/components/bottom_navigation/bottom_navigation_regression_test.dart
flutter test --update-goldens test/components/bottom_navigation/
flutter test integration_test/bottom_navigation_e2e_test.dart -d emulator-5554
flutter test integration_test/bottom_navigation_e2e_test.dart -d chrome
bash scripts/run_e2e_all_devices.sh bottom-navigation   # Android + iOS merged
```

## Driving the bug count to zero

1. Apply the dev fix in `packages/ui_flutter/lib/widgets/one_ui_bottom_navigation*`
   or `lib/engine/bottom_navigation_*_resolve.dart` for the matching `[BN-XX-NNN]`.
2. Re-run the regression suite — that test turns green.
3. Commit alongside the fix; decrement the burn-down counter.
4. When all 7 pass, the suite is fully green.
