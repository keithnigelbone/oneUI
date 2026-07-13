/// Logo functional QA tests — mirrors web `Logo.tsx` / `useLogoState` + Figma API.
///
/// Runs on the synthetic measurement harness (offline). Every behavioural claim
/// reads REAL rendered state: the laid-out logo box `Size`, the `Opacity`
/// factor, the rendered `SvgPicture` / raster `Image`, the focus-interactive
/// button, the fallback widget, and real `onLoad`/`onError` callbacks — never a
/// bare `findsOneWidget`.
///
/// The synthetic DS pins `--Logo-size-*` to fixed px ([kQaLogoSizePx]) so size
/// assertions read deterministic values. The shared avatar byte-cache is seeded
/// per test ([seedLogoImageBytes] / [seedLogoImageFailure]) so the `src` LOADED
/// vs ERROR paths are deterministic with zero network.
///
/// Probed facts baked in: size preset → fixed px box; custom → customSize;
/// mark = square box, full = box width × SVG viewBox aspect; content priority
/// children > svgContent > src > empty; testId → Semantics.identifier (CORRECT,
/// unlike Image — see regression LOGO-PAR-009); interactive + handler + alt →
/// OneUiFocusInteractive button; interactive WITHOUT handler / disabled → static
/// img; disabled → Opacity 0.5; broken src → fallback + onError.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import '../../support/components/logo_harness.dart';

const _src = 'https://example.com/logo.png';

void main() {
  setUp(clearLogoNetworkCache);
  tearDown(clearLogoNetworkCache);

  // ===========================================================================
  // SMOKE
  // ===========================================================================

  group('[smoke] Logo', () {
    testWidgetsAllPlatforms('[smoke] renders an img landmark with alt label', (tester) async {
      await pumpLogoQaHarness(tester, OneUiLogo(alt: 'Acme', svgContent: kQaLogoMarkSvg));
      expect(logoRootFinder(), findsOneWidget);
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Acme'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[smoke] emits the QA payload subtree', (tester) async {
      await pumpLogoQaHarness(tester, OneUiLogo(alt: 'x', svgContent: kQaLogoMarkSvg));
      expect(logoPayloadSubtreeFinder(), findsOneWidget);
    });
  });

  // ===========================================================================
  // SIZE — Figma `size` (XS/S/M/L/XL/custom) → real laid-out box px.
  // ===========================================================================

  group('[functional] Logo — size', () {
    for (final entry in kQaLogoSizePx.entries) {
      testWidgetsAllPlatforms('[fn] size=${entry.key.name} → ${entry.value.toInt()}px square box',
          (tester) async {
        await pumpLogoQaHarness(
          tester,
          OneUiLogo(alt: 'x', size: entry.key, svgContent: kQaLogoMarkSvg),
        );
        final box = logoBoxSize(tester);
        expect(box.width, entry.value);
        expect(box.height, entry.value);
      });
    }

    testWidgetsAllPlatforms('[fn] default size is m (24px)', (tester) async {
      await pumpLogoQaHarness(tester, OneUiLogo(alt: 'x', svgContent: kQaLogoMarkSvg));
      expect(logoBoxSize(tester).height, kQaLogoSizeMPx);
    });

    testWidgetsAllPlatforms('[fn] size=custom uses customSize px', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'x', size: OneUiLogoSize.custom, customSize: 56, svgContent: kQaLogoMarkSvg),
      );
      final box = logoBoxSize(tester);
      expect(box.width, 56);
      expect(box.height, 56);
    });

    testWidgetsAllPlatforms('[fn] size=custom with no customSize falls back to m', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'x', size: OneUiLogoSize.custom, svgContent: kQaLogoMarkSvg),
      );
      expect(logoBoxSize(tester).height, kQaLogoSizeMPx);
    });
  });

  // ===========================================================================
  // VARIANT — mark (square) vs full (width × SVG viewBox aspect).
  // ===========================================================================

  group('[functional] Logo — variant', () {
    testWidgetsAllPlatforms('[fn] mark is a square box (ignores wordmark aspect)', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'x', variant: OneUiLogoVariant.mark, size: OneUiLogoSize.l, svgContent: kQaLogoWordmarkSvg),
      );
      final box = logoBoxSize(tester);
      expect(box.width, kQaLogoSizeLPx);
      expect(box.height, kQaLogoSizeLPx);
    });

    testWidgetsAllPlatforms('[fn] full widens to height × SVG viewBox aspect', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'x', variant: OneUiLogoVariant.full, size: OneUiLogoSize.l, svgContent: kQaLogoWordmarkSvg),
      );
      final box = logoBoxSize(tester);
      expect(box.height, kQaLogoSizeLPx);
      expect(box.width, closeTo(kQaLogoSizeLPx * kQaLogoWordmarkAspect, 0.1));
    });
  });

  // ===========================================================================
  // CONTENT PRIORITY — children > svgContent > src > empty.
  // ===========================================================================

  group('[functional] Logo — content priority', () {
    testWidgetsAllPlatforms('[fn] children wins over svgContent + src', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(
          alt: 'x',
          svgContent: kQaLogoMarkSvg,
          src: _src,
          child: const Icon(Icons.star),
        ),
      );
      expect(find.byIcon(Icons.star), findsOneWidget);
      expect(logoSvgFinder(), findsNothing);
      expect(logoRasterFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] svgContent wins over src', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'x', svgContent: kQaLogoMarkSvg, src: _src),
      );
      expect(logoSvgFinder(), findsOneWidget);
      expect(logoRasterFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] src renders a raster when no svg/children', (tester) async {
      seedLogoImageBytes(_src);
      await pumpLogoQaHarnessLoaded(tester, const OneUiLogo(alt: 'x', src: _src));
      expect(logoRasterFinder(), findsOneWidget);
      expect(logoSvgFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] empty content with a fallback renders the fallback', (tester) async {
      await pumpLogoQaHarness(
        tester,
        const OneUiLogo(alt: 'x', fallback: Text('No logo')),
      );
      expect(find.text('No logo'), findsOneWidget);
    });
  });

  // ===========================================================================
  // INTERACTIVE — button vs static; tap fires.
  // ===========================================================================

  group('[functional] Logo — interactive', () {
    testWidgetsAllPlatforms('[fn] interactive + onPress + alt → focus-interactive button', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'Home', interactive: true, onPress: () {}, svgContent: kQaLogoMarkSvg),
      );
      expect(logoInteractiveFinder(), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] onPress fires on tap', (tester) async {
      var hits = 0;
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'Home', interactive: true, onPress: () => hits++, svgContent: kQaLogoMarkSvg),
      );
      await tester.tap(logoRootFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] onClick (web alias) also fires on tap', (tester) async {
      var hits = 0;
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'Home', interactive: true, onClick: () => hits++, svgContent: kQaLogoMarkSvg),
      );
      await tester.tap(logoRootFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] interactive WITHOUT a handler stays static (no button)', (tester) async {
      // PROBED: interactive:true, no handler → focusInteractive=0 (nothing to action).
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'x', interactive: true, svgContent: kQaLogoMarkSvg),
      );
      expect(logoInteractiveFinder(), findsNothing);
    });
  });

  // ===========================================================================
  // DISABLED — opacity + button suppression.
  // ===========================================================================

  group('[functional] Logo — disabled', () {
    testWidgetsAllPlatforms('[fn] disabled applies opacity 0.5', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'x', disabled: true, svgContent: kQaLogoMarkSvg),
      );
      expect(logoDisabledOpacity(tester), kQaLogoDisabledOpacity);
    });

    testWidgetsAllPlatforms('[fn] disabled + interactive does NOT render a button', (tester) async {
      // PROBED: focusInteractive=0, opacity=0.5 — isInteractive = interactive && !disabled.
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(
          alt: 'x',
          interactive: true,
          disabled: true,
          onPress: () {},
          svgContent: kQaLogoMarkSvg,
        ),
      );
      expect(logoInteractiveFinder(), findsNothing);
      expect(logoDisabledOpacity(tester), kQaLogoDisabledOpacity);
    });
  });

  // ===========================================================================
  // SRC — loaded raster + onLoad; broken src → fallback + onError.
  // ===========================================================================

  group('[functional] Logo — src load & error', () {
    testWidgetsAllPlatforms('[fn] valid src renders the raster + fires onLoad', (tester) async {
      var loads = 0;
      seedLogoImageBytes(_src);
      await pumpLogoQaHarnessLoaded(
        tester,
        OneUiLogo(alt: 'x', src: _src, onLoad: () => loads++),
      );
      expect(logoRasterFinder(), findsOneWidget);
      expect(loads, greaterThanOrEqualTo(1));
    });

    testWidgetsAllPlatforms('[fn] broken src fires onError + shows the fallback', (tester) async {
      var errors = 0;
      seedLogoImageFailure(_src);
      await pumpLogoQaHarnessLoaded(
        tester,
        OneUiLogo(alt: 'x', src: _src, fallback: const Text('FB'), onError: () => errors++),
      );
      expect(errors, 1);
      expect(find.text('FB'), findsOneWidget);
      expect(logoRasterFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] broken src with no fallback fires onError + renders nothing', (tester) async {
      var errors = 0;
      seedLogoImageFailure(_src);
      await pumpLogoQaHarnessLoaded(
        tester,
        OneUiLogo(alt: 'x', src: _src, onError: () => errors++),
      );
      expect(errors, 1);
      expect(logoRasterFinder(), findsNothing);
    });
  });

  // ===========================================================================
  // TEST ID — reaches the AT tree (parity with Divider; unlike Image).
  // ===========================================================================

  group('[functional] Logo — testId', () {
    testWidgetsAllPlatforms('[fn] testId maps to Semantics.identifier', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'x', testId: 'brand-logo', svgContent: kQaLogoMarkSvg),
      );
      withSemanticsHandle(tester, () {
        expect(logoIdentifierFinder('brand-logo'), findsOneWidget);
      });
    });
  });

  // ===========================================================================
  // MATERIAL — metallic preset reaches the data payload.
  // ===========================================================================

  group('[functional] Logo — material', () {
    testWidgetsAllPlatforms('[fn] material is recorded in the data payload key', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'x', material: 'gold', svgContent: kQaLogoMarkSvg),
      );
      final subtree = tester.widget<KeyedSubtree>(logoPayloadSubtreeFinder());
      final key = (subtree.key! as ValueKey<String>).value;
      expect(key, contains('data-material=gold'));
    });
  });
}
