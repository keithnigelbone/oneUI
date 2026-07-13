/// LinearProgressIndicator golden tests — LIGHT mode.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';

import '../../support/components/linear_progress_indicator_harness.dart';

const _kValues = <int>[0, 25, 50, 75, 100];
const _kSizes = <String>['s', 'm', 'l'];
const _kAppearances = <String>[
  'auto',
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
  });

  group('[golden] LPI — value steps', () {
    for (final v in _kValues) {
      testWidgets('value $v', (tester) async {
        await pumpLpiJioHarnessSettled(
          tester,
          OneUiLinearProgressIndicator(
            value: v.toDouble(),
            semanticsLabel: 'v',
          ),
        );
        await expectLater(
          lpiRootFinder(),
          matchesGoldenFile('goldens/lpi_value_$v.png'),
        );
      });
    }
  });

  group('[golden] LPI — sizes', () {
    for (final size in _kSizes) {
      testWidgets('size $size', (tester) async {
        await pumpLpiJioHarnessSettled(
          tester,
          OneUiLinearProgressIndicator(
            size: size.toUpperCase(),
            value: 55,
            semanticsLabel: 's',
          ),
        );
        await expectLater(
          lpiRootFinder(),
          matchesGoldenFile('goldens/lpi_size_$size.png'),
        );
      });
    }
  });

  group('[golden] LPI — caps', () {
    testWidgets('round', (tester) async {
      await pumpLpiJioHarnessSettled(
        tester,
        const OneUiLinearProgressIndicator(
          roundCaps: true,
          value: 45,
          semanticsLabel: 'r',
        ),
      );
      await expectLater(
        lpiRootFinder(),
        matchesGoldenFile('goldens/lpi_caps_round.png'),
      );
    });

    testWidgets('flat', (tester) async {
      await pumpLpiJioHarnessSettled(
        tester,
        const OneUiLinearProgressIndicator(
          roundCaps: false,
          value: 45,
          semanticsLabel: 'f',
        ),
      );
      await expectLater(
        lpiRootFinder(),
        matchesGoldenFile('goldens/lpi_caps_flat.png'),
      );
    });
  });

  group('[golden] LPI — appearances', () {
    for (final app in _kAppearances) {
      testWidgets('appearance $app', (tester) async {
        await pumpLpiJioHarnessSettled(
          tester,
          OneUiLinearProgressIndicator(
            appearance: app,
            value: 65,
            semanticsLabel: 'a',
          ),
        );
        await expectLater(
          lpiRootFinder(),
          matchesGoldenFile('goldens/lpi_appearance_$app.png'),
        );
      });
    }
  });

  group('[golden] LPI — types', () {
    testWidgets('determinate', (tester) async {
      await pumpLpiJioHarnessSettled(
        tester,
        const OneUiLinearProgressIndicator(
          type: 'determinate',
          value: 60,
          semanticsLabel: 'd',
        ),
      );
      await expectLater(
        lpiRootFinder(),
        matchesGoldenFile('goldens/lpi_type_determinate.png'),
      );
    });

    testWidgets('indeterminate', (tester) async {
      await pumpLpiJioHarness(
        tester,
        const OneUiLinearProgressIndicator(
          type: 'indeterminate',
          semanticsLabel: 'i',
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));
      await expectLater(
        lpiRootFinder(),
        matchesGoldenFile('goldens/lpi_type_indeterminate.png'),
      );
    });
  });
}
