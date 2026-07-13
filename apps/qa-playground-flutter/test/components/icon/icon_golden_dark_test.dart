/// Icon visual-regression tests — DARK MODE.
///
/// Re-runs the most-discriminating subset of the light-mode matrix under
/// `darkMode: true` to validate surface step flip (2500 → 100) and on-bold
/// contrast inversion.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';

import '../../support/components/icon_harness.dart';

const _kDarkAppearances = <String>[
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden][dark] Icon — appearance × emphasis matrix (dark)', () {
    for (final app in _kDarkAppearances) {
      for (final emphasis in [
        OneUiIconEmphasis.high,
        OneUiIconEmphasis.medium,
        OneUiIconEmphasis.tintedA11y,
      ]) {
        testWidgets('$app / ${emphasis.name} (dark)', (tester) async {
          await pumpIconQaHarnessSettled(
            tester,
            OneUiIcon(
              icon: 'heart',
              appearance: app,
              emphasis: emphasis,
              semanticsLabel: 'Like',
            ),
            darkMode: true,
          );
          await expectLater(
            find.byType(OneUiIcon),
            matchesGoldenFile('goldens/dark/icon_dark_${app}_${emphasis.name}.png'),
          );
        });
      }
    }
  });
}
