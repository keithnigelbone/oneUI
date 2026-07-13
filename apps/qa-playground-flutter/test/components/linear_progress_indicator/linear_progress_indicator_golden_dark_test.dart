/// LinearProgressIndicator golden tests — DARK mode.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';

import '../../support/components/linear_progress_indicator_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] LPI dark', () {
    for (final app in ['primary', 'secondary', 'positive']) {
      testWidgets('dark appearance $app', (tester) async {
        await pumpLpiJioHarnessSettled(
          tester,
          OneUiLinearProgressIndicator(
            appearance: app,
            value: 60,
            semanticsLabel: 'd',
          ),
          darkMode: true,
        );
        await expectLater(
          lpiRootFinder(),
          matchesGoldenFile('goldens/dark/lpi_dark_$app.png'),
        );
      });
    }
  });
}
