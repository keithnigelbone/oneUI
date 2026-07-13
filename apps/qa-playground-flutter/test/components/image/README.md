# Image QA tests

| File | Layer | Status |
|------|-------|--------|
| `image_functional_test.dart` | Functional `[fn]` + smoke (aspectRatio→AspectRatio, fit→BoxFit, clip radius, interactive button, disabled opacity, width/height parse, fallback/error chrome, loaded raster + onLoad/onError) | pass |
| `image_a11y_test.dart` | Resolver `[a11y]` + widget semantics (alt→label, ariaLabel override, img landmark vs button, silent fallback icon, button suppression) | pass |
| `image_figma_parity_test.dart` | `[figma]` — every Figma API value (12 aspect ratios, 5 fits + extended keywords, interactive, disabled, loading, fallback, aspect×fit matrix) measured offline | pass |
| `image_platform_test.dart` | `[platform]` mobile (img landmark, button-fires, IO `Image.memory` raster, objectPosition alignment) vs web/desktop (landmark, **not focusable**, loading strategies) | pass |
| `image_golden_test.dart` | Visual regression — light (aspect-ratio shapes, border radii, disabled, fallback chrome) | 9 baselines |
| `image_golden_dark_test.dart` | Visual regression — dark mode (fallback chrome, disabled) | 2 baselines |
| `image_golden_surface_test.dart` | Visual regression — fallback chrome on bold/subtle Surfaces (neutral remap) | 2 baselines |
| `image_story_catalog_test.dart` | `[catalog]` Storybook nav-order parity with web `Image.stories.tsx` | pass |
| `image_regression_test.dart` | **Audit burn-down — 1 confirmed + 2 debatable RED, 11 parity + meta GREEN** | **9 RED / 22 GREEN by design** |
| `../../../integration_test/image_e2e_test.dart` | On-device E2E (aspect ratios, loaded raster, fallback, interactive, disabled, surface, dark, semantics) | E2E |

Total goldens: **13** (9 light + 2 dark + 2 surface).

## Deterministic network (no false confidence, no flakiness)

`OneUiImage` loads its raster through the shared avatar byte loader, which
consults `kOneUiAvatarNetworkImageCache` / `kAvatarImageLoadFailed` **before**
hitting the network. The harness exposes:

- `seedImageBytes(url)` — force the **LOADED** path (renders a real `Image`
  widget; assert real `Image.fit` / `Image.alignment` / `onLoad`).
- `seedImageFailure(url)` — force the **ERROR / fallback** path (renders the
  fallback icon; assert `onError`, custom fallback, `fallbackSrc` recovery) with
  clean teardown.
- `clearImageNetworkCache()` — reset between tests.

Loaded-path assertions use `pumpImageQaHarnessLoaded`, which decodes the seeded
raster inside `WidgetTester.runAsync` so the codec completes before teardown (no
leaked `ImageStream`). Most behavioural tests use the error path (clean) or
purely structural reads, which never leave a live decode stream.

## Audit findings (regression burn-down)

Every claim was cross-checked against the web component
(`packages/ui/src/components/Image/`) and reproduced against the real Flutter
widget with a throwaway probe BEFORE the assertion was written.

### Confirmed Flutter bugs (RED — fix in Flutter)

- **`IMG-FN-001`** — `testId` never reaches the AT tree. Probed: `testId:'tid-x'`
  → `find.byKey` matches **1** but `Semantics.identifier` matches **0**. `testId`
  only becomes a `ValueKey` (`one_ui_image.dart:255-258`); it is invisible to the
  platform AT tree and to UI-automation resource-id / accessibilityIdentifier
  queries (Appium / XCUITest). **Divider wires the same prop to
  `Semantics(identifier:)`** (`one_ui_divider.dart:190-193`) — proving the
  intended pattern. Web forwards `testID → data-testid`.
  **Fix:** wrap the root in `Semantics(identifier: testId, …)` (as Divider does).

### Debatable — hardening / parity-leaning (RED — design call)

- **`IMG-DEB-001`** — `interactive: true` **without** a press handler degrades to
  a static `img` (no button). Probed: `focusInteractive=0, roleImg=1`. Web renders
  a `<button>` whenever `interactive` regardless of `onClick`, so AT announces an
  actionable control. Arguably Flutter is *more* correct (nothing to action) —
  hence debatable. **Fix (if parity wins):** render the focus-interactive button
  whenever `interactive`, even with no handler.
- **`IMG-DEB-002`** — `disabled + interactive` drops the button role entirely
  (renders a static `img` + `Opacity 0.5`). Probed: `isButton=false`. Web renders
  `<button disabled>` so AT still announces a *disabled* control. **Fix:** keep
  the button (disabled) so the disabled affordance is exposed to AT.

### Parity proofs (GREEN — Flutter matches the web/Figma contract, NOT bugs)

`IMG-PAR-001` alt→label · `IMG-PAR-002` ariaLabel overrides alt · `IMG-PAR-003`
aspectRatio numeric (16:9, 1:1, 4:3) · `IMG-PAR-004` fit→BoxFit (all 5) ·
`IMG-PAR-005` extended CSS object-fit keywords → cover · `IMG-PAR-006` broken
src → fallback icon + onError · `IMG-PAR-007` fallbackSrc recovers without onError
· `IMG-PAR-008` custom fallback wins over the default icon · `IMG-PAR-009` default
fit = cover · `IMG-PAR-010` interactive + handler → button that fires ·
`IMG-PAR-011` percentage width ignored (web parity).

### Known platform limitation (NOT asserted RED)

The raster renderer is chosen at COMPILE time by a conditional import
(`one_ui_image_remote.dart`): Flutter-web → `Image.network`, IO/mobile/desktop →
`Image.memory`. Widget/E2E tests run on the Dart VM (IO path), so the web
`Image.network` branch is exercised by the browser goldens / E2E, **not** the VM
suites — asserting `Image.network` in a VM test would be false confidence.

The Flutter `OneUiImage` API also intentionally omits the web-only props
`srcSet`, `sizes`, `crossOrigin`, `decoding`, `draggable`, `lottieAttributes`
(documented in `Image.shared.ts`); these have no Flutter equivalent and are not
tested.

## High-confidence testing (no false confidence)

Every assertion validates ACTUAL behaviour; each finding was reproduced with a
throwaway probe BEFORE the assertion was written:

- `imageAspectRatioValue` reads the real `AspectRatio.aspectRatio`.
- `imageRasterBoxFit` / `imageRasterAlignment` read the real rendered `Image`.
- `imageDisabledOpacity` reads the real `Opacity.opacity`.
- `imageClipRadius` reads the real `ClipRRect.borderRadius`.
- `imageFallbackIconFinder` proves the real broken-image chrome; `onLoad`/`onError`
  counters prove the real callbacks fire (seeded bytes vs. seeded failure).
- Real `SemanticsData` (img role, button flag, label) — never a bare
  `findsOneWidget` for a behavioural claim.
- Goldens render with the real Jio Convex fixture (production token resolution).

## Offline vs network

Functional / a11y / figma / platform / regression / story-catalog run on the
**synthetic measurement harness** with deterministic byte-cache seeding — fully
offline, no Convex network. Only the golden suites need the Jio fixture
(network); generate baselines with `--update-goldens` where the network is
reachable.

## Quick run

```bash
# Offline suites
flutter test test/components/image/image_functional_test.dart \
  test/components/image/image_a11y_test.dart \
  test/components/image/image_figma_parity_test.dart \
  test/components/image/image_platform_test.dart \
  test/components/image/image_story_catalog_test.dart

# Regression burn-down (1 confirmed + 2 debatable RED, parity + meta GREEN)
flutter test test/components/image/image_regression_test.dart

# Goldens (needs network)
flutter test --update-goldens \
  test/components/image/image_golden_test.dart \
  test/components/image/image_golden_dark_test.dart \
  test/components/image/image_golden_surface_test.dart

# On-device E2E
flutter test integration_test/image_e2e_test.dart -d <device>
```

## Driving the bug count to zero

1. Apply the dev fix to `packages/ui_flutter/lib/widgets/one_ui_image*.dart` for
   the matching `[IMG-XX-NNN]`.
2. Re-run `image_regression_test.dart`.
3. That test turns green; commit alongside the fix and update the `[meta]` counts.
4. When all `[confirmed]` + `[debatable]` items are resolved (or consciously
   waived), the burn-down is complete.
