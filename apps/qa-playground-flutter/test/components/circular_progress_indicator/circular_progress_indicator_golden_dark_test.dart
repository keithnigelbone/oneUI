/// CircularProgressIndicator visual-regression — DARK. Same appearance subset as
/// the light goldens, rendered with the Jio dark fixture (darkMode: true) so the
/// dark-surface token remapping for the ring track/indicator is captured.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens \
///     test/components/circular_progress_indicator/circular_progress_indicator_golden_dark_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';

import '../../support/components/circular_progress_indicator_harness.dart';

const _kKeyAppearances = <String>['primary', 'secondary', 'positive', 'negative'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] CPI dark — appearance', () {
    for (final app in _kKeyAppearances) {
      testWidgets('dark / $app', (tester) async {
        await pumpCpiJioHarnessSettled(
          tester,
          OneUiCircularProgressIndicator(value: 50, size: '3XL', appearance: app, semanticsLabel: 'a'),
          darkMode: true,
        );
        await expectLater(
          find.byType(OneUiCircularProgressIndicator),
          matchesGoldenFile('goldens/dark/cpi_dark_$app.png'),
        );
      });
    }
  });

  group('[golden] CPI dark — content text', () {
    testWidgets('dark / text', (tester) async {
      await pumpCpiJioHarnessSettled(
        tester,
        const OneUiCircularProgressIndicator(
          value: 66,
          size: '3XL',
          content: 'text',
          semanticsLabel: 'pct',
        ),
        darkMode: true,
      );
      await expectLater(
        find.byType(OneUiCircularProgressIndicator),
        matchesGoldenFile('goldens/dark/cpi_dark_content_text.png'),
      );
    });
  });
}
