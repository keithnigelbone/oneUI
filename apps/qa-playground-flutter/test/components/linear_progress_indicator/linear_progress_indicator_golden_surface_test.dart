/// LinearProgressIndicator golden tests — surface context.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';

import '../../support/components/linear_progress_indicator_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] LPI surface', () {
    testWidgets('bold surface', (tester) async {
      await pumpLpiJioHarnessSettled(
        tester,
        const OneUiLinearProgressIndicator(
          appearance: 'secondary',
          value: 60,
          semanticsLabel: 'b',
        ),
        surfaceMode: 'bold',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        lpiRootFinder(),
        matchesGoldenFile('goldens/surface/lpi_surface_bold_secondary.png'),
      );
    });

    testWidgets('subtle surface', (tester) async {
      await pumpLpiJioHarnessSettled(
        tester,
        const OneUiLinearProgressIndicator(
          appearance: 'secondary',
          value: 60,
          semanticsLabel: 's',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        lpiRootFinder(),
        matchesGoldenFile('goldens/surface/lpi_surface_subtle_secondary.png'),
      );
    });

    testWidgets('minimal surface', (tester) async {
      await pumpLpiJioHarnessSettled(
        tester,
        const OneUiLinearProgressIndicator(
          appearance: 'secondary',
          value: 60,
          semanticsLabel: 'm',
        ),
        surfaceMode: 'minimal',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        lpiRootFinder(),
        matchesGoldenFile('goldens/surface/lpi_surface_minimal_secondary.png'),
      );
    });

    testWidgets('moderate surface', (tester) async {
      await pumpLpiJioHarnessSettled(
        tester,
        const OneUiLinearProgressIndicator(
          appearance: 'secondary',
          value: 60,
          semanticsLabel: 'mod',
        ),
        surfaceMode: 'moderate',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        lpiRootFinder(),
        matchesGoldenFile('goldens/surface/lpi_surface_moderate_secondary.png'),
      );
    });

    testWidgets('elevated surface', (tester) async {
      await pumpLpiJioHarnessSettled(
        tester,
        const OneUiLinearProgressIndicator(
          appearance: 'secondary',
          value: 60,
          semanticsLabel: 'e',
        ),
        surfaceMode: 'elevated',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        lpiRootFinder(),
        matchesGoldenFile('goldens/surface/lpi_surface_elevated_secondary.png'),
      );
    });
  });
}
