/// Logo visual-regression — DARK mode. The inline-SVG mark rendered on a dark
/// root so the `--Logo-color` content token remap (light-on-dark) is captured.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/logo/logo_golden_dark_test.dart
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

  group('[golden] Logo — dark mode', () {
    testWidgets('mark', (tester) async {
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', size: OneUiLogoSize.xl, svgContent: kQaLogoMarkSvg),
        darkMode: true,
        width: 120,
        height: 120,
      );
      await expectLater(
        logoShellBoxFinder().first,
        matchesGoldenFile('goldens/logo_dark_mark.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', size: OneUiLogoSize.xl, disabled: true, svgContent: kQaLogoMarkSvg),
        darkMode: true,
        width: 120,
        height: 120,
      );
      await expectLater(
        logoRootFinder(),
        matchesGoldenFile('goldens/logo_dark_disabled.png'),
      );
    });
  });
}
