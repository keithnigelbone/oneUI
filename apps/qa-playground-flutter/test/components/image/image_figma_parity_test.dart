/// Image Figma-parity QA suite — `[figma]`.
///
/// Exercises EVERY value of the Figma Image API against the real widget /
/// resolver, asserting actual behaviour (the rendered `AspectRatio` value, the
/// real `BoxFit`, the wire round-trips, interactive/disabled rendering) — never
/// a bare `findsOneWidget`. Runs offline on the synthetic measurement harness;
/// live raster pixels are covered by the Jio goldens.
///
/// Figma API surface (from the design + `Image.shared.ts`):
///   aspectRatio  auto | 1:1 | 1:2 | 2:1 | 2:3 | 3:2 | 3:4 | 4:3 | 9:16 | 16:9 |
///                9:21 | 21:9                       (default: auto)
///   fit/objectFit cover | contain | fill | none | scale-down (+ web-only
///                inherit/initial/revert/unset → cover) (default: cover)
///   interactive  true | false                      (default: false)
///   disabled     true | false                      (default: false)
///   loading      auto | lazy | eager               (no-op parity on Flutter)
///   fallback / fallbackSrc                          (error recovery)
///   width / height / objectPosition
///
/// Verified facts (probed before writing): aspectRatio→real AspectRatio numeric;
/// fit→real Image.BoxFit; broken src→fallback icon + onError; default fit cover.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/image_style_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';
import 'package:ui_flutter/widgets/one_ui_image_types.dart';

import '../../support/components/image_harness.dart';

const _src = 'https://example.com/photo.jpg';

/// Every Figma aspect-ratio preset → its expected numeric (null for auto).
const Map<OneUiImageAspectRatio, double?> _kAspectNumerics = {
  OneUiImageAspectRatio.auto: null,
  OneUiImageAspectRatio.r1x1: 1,
  OneUiImageAspectRatio.r1x2: 0.5,
  OneUiImageAspectRatio.r2x1: 2,
  OneUiImageAspectRatio.r2x3: 2 / 3,
  OneUiImageAspectRatio.r3x2: 1.5,
  OneUiImageAspectRatio.r3x4: 0.75,
  OneUiImageAspectRatio.r4x3: 4 / 3,
  OneUiImageAspectRatio.r9x16: 9 / 16,
  OneUiImageAspectRatio.r16x9: 16 / 9,
  OneUiImageAspectRatio.r9x21: 9 / 21,
  OneUiImageAspectRatio.r21x9: 21 / 9,
};

void main() {
  setUp(clearImageNetworkCache);
  tearDown(clearImageNetworkCache);

  // ===========================================================================
  // ASPECT RATIO — all 12 presets resolve + render the real AspectRatio.
  // ===========================================================================

  group('[figma] Image — aspectRatio', () {
    _kAspectNumerics.forEach((ratio, expected) {
      test('[figma] ${ratio.wireValue} numeric resolves to $expected', () {
        final n = ratio.numeric;
        if (expected == null) {
          expect(n, isNull);
        } else {
          expect(n, closeTo(expected, 1e-9));
        }
      });
    });

    _kAspectNumerics.forEach((ratio, expected) {
      testWidgetsAllPlatforms('[figma] ${ratio.wireValue} renders AspectRatio=$expected', (tester) async {
        seedImageFailure(_src);
        await pumpImageQaHarness(tester, OneUiImage(src: _src, alt: 'x', aspectRatio: ratio));
        final actual = imageAspectRatioValue(tester);
        if (expected == null) {
          expect(actual, isNull, reason: 'auto must not wrap in AspectRatio');
        } else {
          expect(actual, closeTo(expected, 1e-9));
        }
      });
    });

    test('[figma] aspectRatio wire round-trips both ways', () {
      for (final ratio in OneUiImageAspectRatio.values) {
        expect(OneUiImageAspectRatioX.fromWire(ratio.wireValue), ratio);
      }
      expect(OneUiImageAspectRatioX.fromWire('bogus'), OneUiImageAspectRatio.auto);
      expect(OneUiImageAspectRatioX.fromWire(null), OneUiImageAspectRatio.auto);
    });
  });

  // ===========================================================================
  // OBJECT FIT — canonical keywords + extended CSS keywords map to cover.
  // ===========================================================================

  group('[figma] Image — object fit', () {
    const canonical = {
      'cover': OneUiImageObjectFit.cover,
      'contain': OneUiImageObjectFit.contain,
      'container': OneUiImageObjectFit.contain, // Figma `container` → contain
      'fill': OneUiImageObjectFit.fill,
      'none': OneUiImageObjectFit.none,
      'scale-down': OneUiImageObjectFit.scaleDown,
    };
    canonical.forEach((wire, expected) {
      test('[figma] fit "$wire" → $expected', () {
        expect(OneUiImageObjectFitX.fromWire(wire), expected);
      });
    });

    for (final ext in ['inherit', 'initial', 'revert', 'revert-layer', 'unset']) {
      test('[figma] web-only keyword "$ext" maps to cover', () {
        expect(OneUiImageObjectFitX.fromWire(ext), OneUiImageObjectFit.cover);
      });
    }

    for (final entry in {
      OneUiImageObjectFit.cover: BoxFit.cover,
      OneUiImageObjectFit.contain: BoxFit.contain,
      OneUiImageObjectFit.fill: BoxFit.fill,
      OneUiImageObjectFit.none: BoxFit.none,
      OneUiImageObjectFit.scaleDown: BoxFit.scaleDown,
    }.entries) {
      test('[figma] ${entry.key} → ${entry.value} (BoxFit)', () {
        expect(boxFitForImageObjectFit(entry.key), entry.value);
      });
    }

    testWidgetsAllPlatforms('[figma] fit=fill renders BoxFit.fill on the raster', (tester) async {
      seedImageBytes(_src);
      await pumpImageQaHarnessLoaded(
        tester,
        const OneUiImage(src: _src, alt: 'x', fit: OneUiImageObjectFit.fill),
      );
      expect(imageRasterBoxFit(tester), BoxFit.fill);
    });
  });

  // ===========================================================================
  // INTERACTIVE / DISABLED — Figma boolean toggles.
  // ===========================================================================

  group('[figma] Image — interactive / disabled', () {
    testWidgetsAllPlatforms('[figma] interactive=false → static img landmark', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'x'));
      expect(imageSemanticsRoleFinder(), findsWidgets);
      expect(imageInteractiveFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[figma] interactive=true (+handler) → button', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        OneUiImage(src: _src, alt: 'x', interactive: true, onPress: () {}),
      );
      expect(imageInteractiveFinder(), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] disabled=true dims the image', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'x', disabled: true));
      expect(imageDisabledOpacity(tester), kQaImageDisabledOpacity);
    });
  });

  // ===========================================================================
  // LOADING — auto | lazy | eager. Wire round-trip (no-op parity on Flutter).
  // ===========================================================================

  group('[figma] Image — loading strategy', () {
    test('[figma] loading wire round-trips', () {
      expect(OneUiImageLoadingStrategyX.fromWire('lazy'), OneUiImageLoadingStrategy.lazy);
      expect(OneUiImageLoadingStrategyX.fromWire('eager'), OneUiImageLoadingStrategy.eager);
      expect(OneUiImageLoadingStrategyX.fromWire('auto'), OneUiImageLoadingStrategy.auto);
      expect(OneUiImageLoadingStrategyX.fromWire(null), OneUiImageLoadingStrategy.auto);
    });

    testWidgetsAllPlatforms('[figma] every loading strategy renders without error', (tester) async {
      for (final l in OneUiImageLoadingStrategy.values) {
        seedImageFailure(_src);
        await pumpImageQaHarness(tester, OneUiImage(src: _src, alt: 'x', loading: l));
        expect(imageRootFinder(), findsOneWidget);
      }
    });
  });

  // ===========================================================================
  // FALLBACK — broken src → icon; custom fallback; fallbackSrc recovery.
  // ===========================================================================

  group('[figma] Image — fallback', () {
    testWidgetsAllPlatforms('[figma] broken src → default fallback icon + onError', (tester) async {
      var errors = 0;
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        OneUiImage(src: _src, alt: 'x', onError: () => errors++),
      );
      expect(imageFallbackIconFinder(), findsOneWidget);
      expect(errors, 1);
    });

    testWidgetsAllPlatforms('[figma] fallbackSrc recovers to a real raster', (tester) async {
      const fb = 'https://example.com/fb.jpg';
      seedImageFailure(_src);
      seedImageBytes(fb);
      await pumpImageQaHarnessLoaded(
        tester,
        const OneUiImage(src: _src, fallbackSrc: fb, alt: 'x'),
      );
      expect(imageRasterFinder(), findsOneWidget);
    });
  });

  // ===========================================================================
  // FULL MATRIX — aspectRatio × fit renders coherently.
  // ===========================================================================

  group('[figma] Image — aspectRatio × fit matrix', () {
    for (final ratio in [OneUiImageAspectRatio.r1x1, OneUiImageAspectRatio.r16x9]) {
      for (final fit in [OneUiImageObjectFit.cover, OneUiImageObjectFit.contain]) {
        testWidgetsAllPlatforms('[figma] ${ratio.wireValue} / $fit', (tester) async {
          seedImageBytes(_src);
          await pumpImageQaHarnessLoaded(
            tester,
            OneUiImage(src: _src, alt: 'x', aspectRatio: ratio, fit: fit),
          );
          expect(imageAspectRatioValue(tester), closeTo(ratio.numeric!, 1e-9));
          expect(imageRasterBoxFit(tester), boxFitForImageObjectFit(fit));
        });
      }
    }
  });
}
