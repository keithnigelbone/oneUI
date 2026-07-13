/// TouchSlider visual-regression — LIGHT. Captures golden PNGs across the Figma
/// matrix: orientation × progressStyle × value (0 / 50 / 100).
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';

import '../../support/components/touch_slider_harness.dart';
import '../../support/golden_capture.dart';

const _kMatrixValues = <double>[0, 50, 100];
const _kMatrixStyles = <String>['rounded', 'sharp'];
const _kMatrixOrientations = <String>['horizontal', 'vertical'];
const _kKeyAppearances = <String>[
  'secondary',
  'primary',
  'positive',
  'negative',
];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][smoke] TouchSlider — light', () {
    testWidgets('[smoke] default renders for golden setup', (tester) async {
      await pumpTouchSliderJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(goldenTouchSliderWidget()),
      );
      expect(touchSliderRootFinder(), findsOneWidget);
    });
  });

  group('[golden] TouchSlider — Figma matrix (light)', () {
    for (final orientation in _kMatrixOrientations) {
      for (final style in _kMatrixStyles) {
        for (final value in _kMatrixValues) {
          testWidgets('$orientation / $style / $value', (tester) async {
            await pumpTouchSliderJioHarnessSettled(
              tester,
              wrapOneUiGoldenChild(
                goldenTouchSliderMatrixCell(
                  defaultValue: value,
                  progressStyle: style,
                  orientation: orientation,
                ),
              ),
            );
            await expectLater(
              oneUiGoldenCaptureFinder(),
              matchesGoldenFile(
                touchSliderGoldenFileName(
                  orientation: orientation,
                  progressStyle: style,
                  value: value,
                ),
              ),
            );
          });
        }
      }
    }
  });

  group('[golden] TouchSlider — appearance grid (horizontal / rounded / 50)', () {
    for (final appearance in _kKeyAppearances) {
      if (appearance == 'secondary') continue;
      testWidgets('horizontal / rounded / 50 / $appearance', (tester) async {
        await pumpTouchSliderJioHarnessSettled(
          tester,
          wrapOneUiGoldenChild(
            goldenTouchSliderMatrixCell(
              defaultValue: 50,
              appearance: appearance,
            ),
          ),
        );
        await expectLater(
          oneUiGoldenCaptureFinder(),
          matchesGoldenFile(
            'goldens/touch_slider_h_rounded_50_$appearance.png',
          ),
        );
      });
    }
  });

  group('[golden] TouchSlider — light baselines', () {
    testWidgets('default / rounded / secondary', (tester) async {
      await pumpTouchSliderJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(goldenTouchSliderWidget()),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/touch_slider_default_rounded_secondary.png'),
      );
    });
  });
}
