/// IconContained visual-regression tests — captures golden PNGs across
/// every meaningful Figma matrix combination.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained_types.dart';

import '../../support/components/icon_contained_harness.dart';

const _kAppearances = <String>[
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden] IconContained — appearance × attention matrix (size=m)', () {
    for (final attention in OneUiIconContainedAttention.values) {
      for (final app in _kAppearances) {
        testWidgets('${attention.name} / $app', (tester) async {
          await pumpIconContainedQaHarnessSettled(
            tester,
            OneUiIconContained(
              icon: 'heart',
              attention: attention,
              appearance: app,
              semanticsLabel: 'Like',
            ),
          );
          await expectLater(
            find.byType(OneUiIconContained),
            matchesGoldenFile(
                'goldens/icon_contained_${attention.name}_$app.png'),
          );
        });
      }
    }
  });

  group('[golden] IconContained — size sweep (appearance=primary attention=medium)', () {
    for (final size in kOneUiIconContainedSizes) {
      testWidgets('size=$size', (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          OneUiIconContained(
            icon: 'heart',
            size: size,
            appearance: 'primary',
            semanticsLabel: 'Like',
          ),
        );
        await expectLater(
          find.byType(OneUiIconContained),
          matchesGoldenFile('goldens/icon_contained_size_$size.png'),
        );
      });
    }
  });

  group('[golden] IconContained — disabled state', () {
    testWidgets('disabled=true / attention=high / primary', (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          attention: OneUiIconContainedAttention.high,
          appearance: 'primary',
          disabled: true,
          semanticsLabel: 'Like',
        ),
      );
      await expectLater(
        find.byType(OneUiIconContained),
        matchesGoldenFile('goldens/icon_contained_disabled_high.png'),
      );
    });

    testWidgets('disabled=true / attention=medium / secondary', (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          attention: OneUiIconContainedAttention.medium,
          appearance: 'secondary',
          disabled: true,
          semanticsLabel: 'Like',
        ),
      );
      await expectLater(
        find.byType(OneUiIconContained),
        matchesGoldenFile('goldens/icon_contained_disabled_medium.png'),
      );
    });
  });
}
