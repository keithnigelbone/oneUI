/// Image visual-regression — SURFACE CONTEXT. The broken-image fallback chrome
/// rendered inside bold / subtle Surfaces so the `[data-surface]` neutral-role
/// token remapping of the fallback background + icon is captured.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/image/image_golden_surface_test.dart
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

  group('[golden] Image — surface context', () {
    for (final mode in ['bold', 'subtle']) {
      testWidgets('$mode surface', (tester) async {
        seedImageFailure(_src);
        await pumpImageJioHarness(
          tester,
          OneUiImage(src: _src, alt: 'x', aspectRatio: OneUiImageAspectRatio.r16x9),
          surfaceMode: mode,
          surfaceAppearance: 'primary',
        );
        await expectLater(
          imageRootFinder(),
          matchesGoldenFile('goldens/surface/image_surface_$mode.png'),
        );
      });
    }
  });
}
