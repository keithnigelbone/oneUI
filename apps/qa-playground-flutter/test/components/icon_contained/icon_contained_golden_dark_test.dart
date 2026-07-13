/// IconContained visual-regression tests — DARK MODE.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained_types.dart';

import '../../support/components/icon_contained_harness.dart';

const _kDarkAppearances = <String>[
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden][dark] IconContained — attention × appearance (dark)', () {
    for (final attention in OneUiIconContainedAttention.values) {
      for (final app in _kDarkAppearances) {
        testWidgets('${attention.name} / $app (dark)', (tester) async {
          await pumpIconContainedQaHarnessSettled(
            tester,
            OneUiIconContained(
              icon: 'heart',
              attention: attention,
              appearance: app,
              semanticsLabel: 'Like',
            ),
            darkMode: true,
          );
          await expectLater(
            find.byType(OneUiIconContained),
            matchesGoldenFile(
                'goldens/dark/icon_contained_dark_${attention.name}_$app.png'),
          );
        });
      }
    }
  });
}
