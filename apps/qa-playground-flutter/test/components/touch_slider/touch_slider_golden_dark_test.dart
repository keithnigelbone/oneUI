/// TouchSlider visual-regression — DARK. Appearance grid + key matrix cells.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';

import '../../support/components/touch_slider_harness.dart';
import '../../support/golden_capture.dart';

const _kDarkAppearances = <String>[
  'secondary',
  'primary',
  'positive',
  'negative',
];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][dark] TouchSlider — appearance grid (rounded / 50)', () {
    for (final appearance in _kDarkAppearances) {
      testWidgets('dark / $appearance / rounded / 50', (tester) async {
        await pumpTouchSliderJioHarnessSettled(
          tester,
          wrapOneUiGoldenChild(
            goldenTouchSliderMatrixCell(
              defaultValue: 50,
              appearance: appearance,
            ),
          ),
          darkMode: true,
        );
        await expectLater(
          oneUiGoldenCaptureFinder(),
          matchesGoldenFile(
            'goldens/dark/touch_slider_dark_h_rounded_50_$appearance.png',
          ),
        );
      });
    }
  });

  group('[golden][dark] TouchSlider — matrix subset', () {
    testWidgets('dark / horizontal / sharp / 0', (tester) async {
      await pumpTouchSliderJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          goldenTouchSliderMatrixCell(
            defaultValue: 0,
            progressStyle: 'sharp',
          ),
        ),
        darkMode: true,
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/dark/touch_slider_dark_h_sharp_0.png'),
      );
    });

    testWidgets('dark / horizontal / sharp / 100', (tester) async {
      await pumpTouchSliderJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          goldenTouchSliderMatrixCell(
            defaultValue: 100,
            progressStyle: 'sharp',
          ),
        ),
        darkMode: true,
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/dark/touch_slider_dark_h_sharp_100.png'),
      );
    });
  });

  group('[golden] TouchSlider — dark baselines', () {
    testWidgets('dark / rounded / secondary (legacy)', (tester) async {
      await pumpTouchSliderJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(goldenTouchSliderWidget()),
        darkMode: true,
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile(
          'goldens/dark/touch_slider_dark_default_rounded_secondary.png',
        ),
      );
    });
  });
}
