/// Logo visual-regression — SURFACE CONTEXT. The inline-SVG mark rendered inside
/// bold / subtle Surfaces so the `[data-surface]` neutral/primary content-token
/// remap (the logo `currentColor` adapting to stay visible on a tint) is
/// captured.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/logo/logo_golden_surface_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import '../../support/components/logo_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] Logo — surface context', () {
    for (final mode in ['bold', 'subtle']) {
      testWidgets('$mode surface', (tester) async {
        await pumpLogoJioHarness(
          tester,
          OneUiLogo(alt: 'x', size: OneUiLogoSize.xl, svgContent: kQaLogoMarkSvg),
          surfaceMode: mode,
          surfaceAppearance: 'primary',
          width: 140,
          height: 140,
        );
        await expectLater(
          logoRootFinder(),
          matchesGoldenFile('goldens/surface/logo_surface_$mode.png'),
        );
      });
    }
  });
}
