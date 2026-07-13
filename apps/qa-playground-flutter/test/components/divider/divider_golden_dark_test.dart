/// Divider visual-regression — DARK. Attention + appearance subset rendered with
/// the Jio dark fixture (darkMode: true) so the dark-surface stroke remapping is
/// captured.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens \
///     test/components/divider/divider_golden_dark_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';

import '../../support/components/divider_harness.dart';

const _kKeyAppearances = <String>['neutral', 'primary', 'secondary', 'negative'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] Divider dark — appearance', () {
    for (final app in _kKeyAppearances) {
      testWidgets('dark / $app', (tester) async {
        await pumpDividerJioHarness(
          tester,
          OneUiDivider(appearance: app, attention: 'high', size: 'l'),
          darkMode: true,
        );
        await expectLater(
          find.byType(OneUiDivider),
          matchesGoldenFile('goldens/dark/divider_dark_$app.png'),
        );
      });
    }
  });

  group('[golden] Divider dark — label content', () {
    testWidgets('dark / label', (tester) async {
      await pumpDividerJioHarness(
        tester,
        const OneUiDivider(content: 'label', child: 'OR'),
        darkMode: true,
      );
      await expectLater(
        find.byType(OneUiDivider),
        matchesGoldenFile('goldens/dark/divider_dark_label.png'),
      );
    });
  });
}
