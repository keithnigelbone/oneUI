# Logo QA tests

| File | Layer | Status |
|------|-------|--------|
| `logo_functional_test.dart` | Functional `[fn]` + smoke (size→px box, custom size, mark/full variant geometry, content priority children>svg>src>empty, interactive button + tap, disabled opacity, src load/error + fallback, testId→identifier, material payload) | pass |
| `logo_a11y_test.dart` | Resolver `[a11y]` + widget semantics (alt→label, empty alt→decorative ExcludeSemantics, interactive→button, hint forwarding, static≠button) | pass |
| `logo_figma_parity_test.dart` | `[figma]` — every Figma API value (size XS/S/M/L/XL/custom enum + rendered box, ascending size scale, interactive true/false) measured offline | pass |
| `logo_platform_test.dart` | `[platform]` mobile (img landmark, button-fires, IO `Image.memory` raster) vs web/desktop (landmark, **not focusable**, inline SVG, interactive fires) | pass |
| `logo_golden_test.dart` | Visual regression — light (5 sizes, mark/full variants, disabled) | 8 baselines |
| `logo_golden_dark_test.dart` | Visual regression — dark mode (mark, disabled) | 2 baselines |
| `logo_golden_surface_test.dart` | Visual regression — mark on bold/subtle Surfaces (currentColor remap) | 2 baselines |
| `logo_story_catalog_test.dart` | `[catalog]` Storybook nav-order parity with web `Logo.stories.tsx` | pass |
| `logo_regression_test.dart` | **Audit burn-down — 0 confirmed, 1 debatable RED, 11 parity + meta GREEN** | **3 RED / 26 GREEN by design** |
| `../../../integration_test/logo_e2e_test.dart` | On-device E2E (sizes, full variant, loaded raster, fallback, interactive, disabled, decorative, testId, surface, dark) | E2E |

Total goldens: **12** (8 light + 2 dark + 2 surface).

## Deterministic network (no false confidence, no flakiness)

`OneUiLogo` in `src` mode loads its raster through the shared avatar byte loader,
which consults `kOneUiAvatarNetworkImageCache` / `kAvatarImageLoadFailed`
**before** hitting the network. The harness exposes:

- `seedLogoImageBytes(url)` — force the **LOADED** path (renders a real `Image`;
  assert `onLoad`).
- `seedLogoImageFailure(url)` — force the **ERROR / fallback** path (renders the
  `fallback` widget; assert `onError`) with clean teardown.
- `clearLogoNetworkCache()` — reset between tests.

`src` load/error assertions use `pumpLogoQaHarnessLoaded`, which advances the
async load state machine and the deferred `addPostFrameCallback` error state
inside `WidgetTester.runAsync` so the decode completes before teardown (no leaked
`ImageStream`). SVG / children / empty / structural tests use the clean
`pumpLogoQaHarness`. The synthetic DS pins `--Logo-size-*` to fixed px
(`kQaLogoSizePx` = 16/20/24/32/40) so size geometry reads deterministic values.

## Audit findings (regression burn-down)

Every claim was cross-checked against the web component
(`packages/ui/src/components/Logo/`) and the Figma API ([Logo #36]), and
reproduced against the real Flutter widget with a throwaway probe BEFORE the
assertion was written.

### Confirmed Flutter bugs (RED — fix in Flutter)

**NONE.** Unlike the sibling Image component, Logo gets the two things Image got
wrong **right**, proven GREEN below:

- `testId` reaches the AT tree — wired to BOTH a `ValueKey` AND
  `Semantics(identifier:)` (`one_ui_logo.dart:366-371`), so Appium / XCUITest
  resource-id queries can find it (`LOGO-PAR-009`). Image ships this key-only
  (`IMG-FN-001`).
- The broken-`src` → fallback transition defers its state change via
  `WidgetsBinding.instance.addPostFrameCallback` (`one_ui_logo.dart:98-106`), so
  it never throws "setState during build" (`LOGO-PAR-010`).

### Debatable — hardening / parity-leaning (RED — design call)

- **`LOGO-DEB-001`** — `interactive: true` + a press handler + **empty `alt`**
  silently drops the handler AND all semantics. Probed: `focusInteractive=0`, a
  tap fires the handler **0** times; the decorative branch (empty alt) wins, so
  no `OneUiFocusInteractive` is built and `onPress` is never wired (only a debug
  `print` warns). A developer who passes a handler gets a dead, unannounced
  control. **Debatable** because a decorative (no-alt) control arguably *should*
  not be actionable — and the web `Logo` does not implement `interactive` at all,
  so there is no web contract to violate. **Fix (if hardening wins):** either
  honour the handler (build the button) or assert/throw so the ignored handler is
  not silent.

### Parity proofs (GREEN — Flutter matches the web/Figma contract, NOT bugs)

`LOGO-PAR-001` alt→label · `LOGO-PAR-002` empty alt→decorative (web `aria-hidden`
inner) · `LOGO-PAR-003` Figma size set = XS…XL+custom · `LOGO-PAR-004` t-shirt
labels normalise · `LOGO-PAR-005` 5 distinct size boxes · `LOGO-PAR-006` mark
square / full widens to SVG aspect · `LOGO-PAR-007` content priority
children>svg>src · `LOGO-PAR-008` interactive+handler+alt → button that fires ·
`LOGO-PAR-009` testId → `Semantics.identifier` · `LOGO-PAR-010` broken src defers
error (no setState-in-build crash) · `LOGO-PAR-011` disabled dims 0.5 + suppresses
the button.

### Known shared-dependency limitation (NOT asserted RED — would be false confidence)

Logo's `src` mode delegates raster loading to `OneUiImageRemote`, which carries
the Image finding **`IMG-FN-002`**: on IO, `Image.memory`'s `errorBuilder` calls
`_OneUiImageRemoteIoState._fail()` → `setState` synchronously during build, which
can throw "setState during build" when fetched bytes fail to decode (observed on
a **real device** during a rapid `src` swap). It does **not** reproduce
deterministically on the Dart VM (probed: undecodable bytes → no crash offline,
`raster=1`), so it is documented here rather than asserted as a Logo RED test —
asserting an unreproducible crash offline would be false confidence. Fix belongs
in `one_ui_image_remote_io.dart` (defer `_fail` via `addPostFrameCallback`),
which fixes it for both Image and Logo.

### Figma vs web note (not a Flutter bug)

Figma defines `interactive: true/false`, but the **web** `Logo.tsx` does not
implement it (always `role="img"`, comment: "Non-interactive (brand identity
display)"). Flutter is the only platform honouring the Figma `interactive` prop —
Flutter *exceeds* web here. If anything, web has the parity gap.

## High-confidence testing (no false confidence)

Every assertion validates ACTUAL behaviour; each finding was reproduced with a
throwaway probe BEFORE the assertion was written:

- `logoBoxSize` reads the real laid-out shell `SizedBox` size.
- `logoDisabledOpacity` reads the real `Opacity.opacity`.
- `logoInteractiveFinder` proves the real `OneUiFocusInteractive`; tap counters
  prove the real callbacks fire.
- Real `SemanticsData` (image role, button flag, label, identifier, hint) — never
  a bare `findsOneWidget` for an a11y claim (the `SvgPicture` emits its own
  decorative Semantics widget, so merged semantics data is the only trustworthy
  source).
- `onLoad` / `onError` counters prove the real `src` callbacks (seeded bytes vs.
  seeded failure).
- Goldens render with the real Jio Convex fixture (production token resolution).

## Offline vs network

Functional / a11y / figma / platform / regression / story-catalog run on the
**synthetic measurement harness** with deterministic byte-cache seeding — fully
offline, no Convex network. Only the golden suites need the Jio fixture; baselines
are committed under `goldens/`.

## Quick run

```bash
# Offline suites
flutter test test/components/logo/logo_functional_test.dart \
  test/components/logo/logo_a11y_test.dart \
  test/components/logo/logo_figma_parity_test.dart \
  test/components/logo/logo_platform_test.dart \
  test/components/logo/logo_story_catalog_test.dart

# Regression burn-down (1 debatable RED, parity + meta GREEN)
flutter test test/components/logo/logo_regression_test.dart

# Goldens (12 committed baselines)
flutter test test/components/logo/logo_golden_test.dart \
  test/components/logo/logo_golden_dark_test.dart \
  test/components/logo/logo_golden_surface_test.dart

# On-device E2E
flutter test integration_test/logo_e2e_test.dart -d <device>
```

## Driving the bug count to zero

1. Decide LOGO-DEB-001 (honour the handler, or assert/throw vs. silent drop).
2. Re-run `logo_regression_test.dart`; update the `[meta]` counts.
3. (Cross-component) fix `IMG-FN-002` in `one_ui_image_remote_io.dart` to harden
   Logo's `src` decode-error path on-device.
