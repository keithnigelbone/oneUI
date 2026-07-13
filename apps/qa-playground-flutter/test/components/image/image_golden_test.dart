/// Image visual-regression tests — LIGHT. Captures golden PNGs of the real
/// rendered chrome across the Figma matrix: aspect-ratio box shapes, border
/// radii, disabled opacity, and the broken-image fallback (default icon +
/// custom content).
///
/// The raster is deterministically forced into the FALLBACK path
/// ([seedImageFailure]) so the goldens are stable with zero network image
/// fetching, while the surrounding TOKENS (fallback background/colour, radius,
/// neutral role) resolve from the real Jio fixture — byte-identical to the
/// qa-playground:flutter app.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/image/image_golden_test.dart
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';
import 'package:ui_flutter/widgets/one_ui_image_types.dart';

import '../../support/components/image_harness.dart';

const _src = 'https://example.com/broken.jpg';

const _kRatios = <String, OneUiImageAspectRatio>{
  '1x1': OneUiImageAspectRatio.r1x1,
  '4x3': OneUiImageAspectRatio.r4x3,
  '16x9': OneUiImageAspectRatio.r16x9,
  '9x16': OneUiImageAspectRatio.r9x16,
};

void main() {
  setUp(() => seedImageFailure(_src));
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // aspect-ratio box shapes — 4 baselines
  group('[golden] Image — aspect ratios', () {
    _kRatios.forEach((name, ratio) {
      testWidgets('aspect $name', (tester) async {
        seedImageFailure(_src);
        await pumpImageJioHarness(
          tester,
          OneUiImage(src: _src, alt: 'x', aspectRatio: ratio),
        );
        await expectLater(
          imageRootFinder(),
          matchesGoldenFile('goldens/image_aspect_$name.png'),
        );
      });
    });
  });

  // border radius — 2 baselines
  group('[golden] Image — border radius', () {
    for (final token in ['--Shape-0', '--Shape-3']) {
      testWidgets('radius $token', (tester) async {
        seedImageFailure(_src);
        await pumpImageJioHarness(
          tester,
          OneUiImage(
            src: _src,
            alt: 'x',
            aspectRatio: OneUiImageAspectRatio.r16x9,
            borderRadiusToken: token,
          ),
        );
        await expectLater(
          imageRootFinder(),
          matchesGoldenFile('goldens/image_radius_${token.replaceAll('--', '').toLowerCase()}.png'),
        );
      });
    }
  });

  // states — 2 baselines
  group('[golden] Image — states', () {
    testWidgets('default (fallback chrome)', (tester) async {
      seedImageFailure(_src);
      await pumpImageJioHarness(
        tester,
        OneUiImage(src: _src, alt: 'x', aspectRatio: OneUiImageAspectRatio.r16x9),
      );
      await expectLater(
        imageRootFinder(),
        matchesGoldenFile('goldens/image_state_default.png'),
      );
    });

    testWidgets('disabled (opacity)', (tester) async {
      seedImageFailure(_src);
      await pumpImageJioHarness(
        tester,
        OneUiImage(src: _src, alt: 'x', aspectRatio: OneUiImageAspectRatio.r16x9, disabled: true),
      );
      await expectLater(
        imageRootFinder(),
        matchesGoldenFile('goldens/image_state_disabled.png'),
      );
    });
  });

  // fallback variants — 1 baseline
  group('[golden] Image — fallback', () {
    testWidgets('custom fallback content', (tester) async {
      seedImageFailure(_src);
      await pumpImageJioHarness(
        tester,
        OneUiImage(
          src: _src,
          alt: 'x',
          aspectRatio: OneUiImageAspectRatio.r16x9,
          fallback: const Center(child: Text('No image')),
        ),
      );
      await expectLater(
        imageRootFinder(),
        matchesGoldenFile('goldens/image_fallback_custom.png'),
      );
    });
  });
}
