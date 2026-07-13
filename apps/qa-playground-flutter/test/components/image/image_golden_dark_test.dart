/// Image visual-regression — DARK. The broken-image fallback chrome rendered
/// with the Jio dark fixture (`darkMode: true`) so the dark-surface fallback
/// background + icon colour remapping is captured.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/image/image_golden_dark_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';
import 'package:ui_flutter/widgets/one_ui_image_types.dart';

import '../../support/components/image_harness.dart';

const _src = 'https://example.com/broken.jpg';

void main() {
  setUp(() => seedImageFailure(_src));
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] Image dark — fallback chrome', () {
    testWidgets('dark / default icon', (tester) async {
      seedImageFailure(_src);
      await pumpImageJioHarness(
        tester,
        OneUiImage(src: _src, alt: 'x', aspectRatio: OneUiImageAspectRatio.r16x9),
        darkMode: true,
      );
      await expectLater(
        imageRootFinder(),
        matchesGoldenFile('goldens/dark/image_dark_default.png'),
      );
    });

    testWidgets('dark / disabled', (tester) async {
      seedImageFailure(_src);
      await pumpImageJioHarness(
        tester,
        OneUiImage(src: _src, alt: 'x', aspectRatio: OneUiImageAspectRatio.r16x9, disabled: true),
        darkMode: true,
      );
      await expectLater(
        imageRootFinder(),
        matchesGoldenFile('goldens/dark/image_dark_disabled.png'),
      );
    });
  });
}
