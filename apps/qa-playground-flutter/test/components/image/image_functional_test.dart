/// Image functional QA tests — mirrors web `Image.test.tsx` + `useImageState`.
///
/// Runs on the synthetic measurement harness (offline). Every behavioural claim
/// reads REAL rendered state: the `AspectRatio` ratio, the `ClipRRect` radius,
/// the `Opacity` factor, the rendered `Image.fit`/alignment, the fallback-icon
/// chrome, and real `onLoad`/`onError` callbacks — never a bare `findsOneWidget`.
///
/// The shared avatar byte-cache is seeded per test so the LOADED vs ERROR paths
/// are deterministic with zero network:
///   - [seedImageFailure] → forces the error / fallback chrome (clean teardown);
///   - [seedImageBytes] + [pumpImageQaHarnessLoaded] → forces the real raster.
///
/// Probed facts baked in: testId → ValueKey (NOT Semantics.identifier — see
/// regression IMG-FN-001); interactive+handler → OneUiFocusInteractive button;
/// interactive without a handler OR disabled → static img role (no button);
/// disabled → Opacity 0.5; fit prop → real Image.BoxFit; aspectRatio → real
/// AspectRatio widget; broken src → fallback icon + onError; fallbackSrc → recovery.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/image_style_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';
import 'package:ui_flutter/widgets/one_ui_image_types.dart';

import '../../support/components/image_harness.dart';

const _src = 'https://example.com/photo.jpg';
const _fallbackSrc = 'https://example.com/fallback.jpg';

void main() {
  setUp(clearImageNetworkCache);
  tearDown(clearImageNetworkCache);

  group('[smoke] Image', () {
    testWidgetsAllPlatforms('[smoke] renders a static img landmark with alt label', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'Team photo'));
      expect(imageRootFinder(), findsOneWidget);
      expect(imageSemanticsRoleFinder(), findsWidgets);
      expect(find.bySemanticsLabel('Team photo'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] emits the QA payload subtree', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'x'));
      expect(imagePayloadSubtreeFinder(), findsOneWidget);
    });
  });

  // ===========================================================================
  // ASPECT RATIO — preset → real AspectRatio widget value.
  // ===========================================================================

  group('[functional] Image — aspectRatio', () {
    testWidgetsAllPlatforms('[fn] auto → no AspectRatio wrapper', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'x'));
      expect(imageAspectRatioValue(tester), isNull);
    });

    testWidgetsAllPlatforms('[fn] 16:9 → AspectRatio 16/9', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        const OneUiImage(src: _src, alt: 'x', aspectRatio: OneUiImageAspectRatio.r16x9),
      );
      expect(imageAspectRatioValue(tester), closeTo(16 / 9, 1e-9));
    });

    testWidgetsAllPlatforms('[fn] 1:1 → AspectRatio 1.0', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        const OneUiImage(src: _src, alt: 'x', aspectRatio: OneUiImageAspectRatio.r1x1),
      );
      expect(imageAspectRatioValue(tester), closeTo(1.0, 1e-9));
    });
  });

  // ===========================================================================
  // OBJECT FIT — fit / objectFit prop → real BoxFit on the raster.
  // ===========================================================================

  group('[functional] Image — object fit', () {
    test('[fn] boxFitForImageObjectFit maps every mode (the real resolver)', () {
      expect(boxFitForImageObjectFit(OneUiImageObjectFit.cover), BoxFit.cover);
      expect(boxFitForImageObjectFit(OneUiImageObjectFit.contain), BoxFit.contain);
      expect(boxFitForImageObjectFit(OneUiImageObjectFit.fill), BoxFit.fill);
      expect(boxFitForImageObjectFit(OneUiImageObjectFit.none), BoxFit.none);
      expect(boxFitForImageObjectFit(OneUiImageObjectFit.scaleDown), BoxFit.scaleDown);
    });

    test('[fn] fit wins over objectFit (web parity)', () {
      final r = OneUiImageObjectFitX.resolve(
        fit: OneUiImageObjectFit.contain,
        objectFit: OneUiImageObjectFit.fill,
      );
      expect(r, OneUiImageObjectFit.contain);
    });

    test('[fn] neither fit nor objectFit → defaults to cover', () {
      expect(OneUiImageObjectFitX.resolve(), OneUiImageObjectFit.cover);
    });

    testWidgetsAllPlatforms('[fn] default fit renders BoxFit.cover on the raster', (tester) async {
      seedImageBytes(_src);
      await pumpImageQaHarnessLoaded(tester, const OneUiImage(src: _src, alt: 'x'));
      expect(imageRasterFinder(), findsOneWidget);
      expect(imageRasterBoxFit(tester), BoxFit.cover);
    });

    testWidgetsAllPlatforms('[fn] fit=contain renders BoxFit.contain on the raster', (tester) async {
      seedImageBytes(_src);
      await pumpImageQaHarnessLoaded(
        tester,
        const OneUiImage(src: _src, alt: 'x', fit: OneUiImageObjectFit.contain),
      );
      expect(imageRasterBoxFit(tester), BoxFit.contain);
    });
  });

  // ===========================================================================
  // CLIP RADIUS — --Image-borderRadius and per-instance override.
  // ===========================================================================

  group('[functional] Image — border radius', () {
    testWidgetsAllPlatforms('[fn] clips to --Image-borderRadius (8px)', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'x'));
      expect(imageClipRadius(tester).topLeft.x, kQaImageBorderRadiusPx);
    });

    testWidgetsAllPlatforms('[fn] borderRadiusToken override changes the radius', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        const OneUiImage(src: _src, alt: 'x', borderRadiusToken: '--Shape-3'),
      );
      expect(imageClipRadius(tester).topLeft.x, kQaImageShape3RadiusPx);
    });
  });

  // ===========================================================================
  // INTERACTIVE — button vs static img role; tap fires.
  // ===========================================================================

  group('[functional] Image — interactive', () {
    testWidgetsAllPlatforms('[fn] interactive + onPress → focus-interactive button', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        OneUiImage(src: _src, alt: 'Open', interactive: true, onPress: () {}),
      );
      expect(imageInteractiveFinder(), findsOneWidget);
      expect(imageSemanticsRoleFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] onPress fires on tap', (tester) async {
      var hits = 0;
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        OneUiImage(src: _src, alt: 'Open', interactive: true, onPress: () => hits++),
      );
      await tester.tap(imageRootFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] onClick (web alias) also fires on tap', (tester) async {
      var hits = 0;
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        OneUiImage(src: _src, alt: 'Open', interactive: true, onClick: () => hits++),
      );
      await tester.tap(imageRootFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] interactive WITHOUT a handler stays a static img', (tester) async {
      // PROBED: focusInteractive=0, roleImg=1. (Web renders a <button> regardless
      // — see regression IMG-DEB-001.)
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        const OneUiImage(src: _src, alt: 'x', interactive: true),
      );
      expect(imageInteractiveFinder(), findsNothing);
      expect(imageSemanticsRoleFinder(), findsWidgets);
    });
  });

  // ===========================================================================
  // DISABLED — opacity + button suppression.
  // ===========================================================================

  group('[functional] Image — disabled', () {
    testWidgetsAllPlatforms('[fn] disabled applies the resolved opacity (0.5)', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        const OneUiImage(src: _src, alt: 'x', disabled: true),
      );
      expect(imageDisabledOpacity(tester), kQaImageDisabledOpacity);
    });

    testWidgetsAllPlatforms('[fn] disabled + interactive does NOT render a button', (tester) async {
      // PROBED: opacity=0.5, focusInteractive=0, roleImg=1.
      var hits = 0;
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        OneUiImage(
          src: _src,
          alt: 'x',
          interactive: true,
          disabled: true,
          onPress: () => hits++,
        ),
      );
      expect(imageInteractiveFinder(), findsNothing);
      expect(imageDisabledOpacity(tester), kQaImageDisabledOpacity);
    });
  });

  // ===========================================================================
  // FALLBACK / ERROR — broken src → fallback chrome, callbacks, recovery.
  // ===========================================================================

  group('[functional] Image — fallback & error', () {
    testWidgetsAllPlatforms('[fn] broken src renders the default fallback icon', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'x'));
      expect(imageFallbackIconFinder(), findsOneWidget);
      expect(imageRasterFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] broken src fires onError exactly once', (tester) async {
      var errors = 0;
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        OneUiImage(src: _src, alt: 'x', onError: () => errors++),
      );
      expect(errors, 1);
    });

    testWidgetsAllPlatforms('[fn] custom fallback widget wins over the default icon', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        const OneUiImage(
          src: _src,
          alt: 'x',
          fallback: Text('Image unavailable'),
        ),
      );
      expect(find.text('Image unavailable'), findsOneWidget);
      expect(imageFallbackIconFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] fallbackSrc recovers without firing onError', (tester) async {
      var errors = 0;
      seedImageFailure(_src);
      seedImageBytes(_fallbackSrc);
      await pumpImageQaHarnessLoaded(
        tester,
        OneUiImage(
          src: _src,
          fallbackSrc: _fallbackSrc,
          alt: 'x',
          onError: () => errors++,
        ),
      );
      expect(imageRasterFinder(), findsOneWidget);
      expect(imageFallbackIconFinder(), findsNothing);
      expect(errors, 0, reason: 'recovering to fallbackSrc must not report an error');
    });
  });

  // ===========================================================================
  // LOADED — real raster + onLoad callback.
  // ===========================================================================

  group('[functional] Image — loaded', () {
    testWidgetsAllPlatforms('[fn] valid src renders the raster (no fallback icon)', (tester) async {
      seedImageBytes(_src);
      await pumpImageQaHarnessLoaded(tester, const OneUiImage(src: _src, alt: 'x'));
      expect(imageRasterFinder(), findsOneWidget);
      expect(imageFallbackIconFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] onLoad fires when the raster resolves', (tester) async {
      var loads = 0;
      seedImageBytes(_src);
      await pumpImageQaHarnessLoaded(
        tester,
        OneUiImage(src: _src, alt: 'x', onLoad: () => loads++),
      );
      expect(loads, greaterThanOrEqualTo(1));
    });
  });

  // ===========================================================================
  // WIDTH / HEIGHT — numeric + px string parse; percentage ignored.
  // ===========================================================================

  group('[functional] Image — width/height parsing', () {
    test('[fn] parseImageLayoutLength handles num, px-string, and %', () {
      expect(parseImageLayoutLength(120), 120);
      expect(parseImageLayoutLength('120px'), 120);
      expect(parseImageLayoutLength('50%'), isNull, reason: 'percentage is web-only, ignored');
      expect(parseImageLayoutLength(null), isNull);
    });

    testWidgetsAllPlatforms('[fn] numeric width constrains the SizedBox', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        const OneUiImage(src: _src, alt: 'x', width: 120, height: 90),
        width: 320,
        height: 240,
      );
      final size = tester.getSize(imageRootFinder());
      expect(size.width, 120);
      expect(size.height, 90);
    });
  });
}
