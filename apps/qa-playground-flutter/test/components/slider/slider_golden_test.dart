/// Slider visual-regression — LIGHT. Captures golden PNGs across the Figma
/// matrix: knobStyle × size, key appearances, range, and showSteps.
///
/// Rendered with the real Jio fixture (production token resolution).
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_slider_types.dart';

import '../../support/components/slider_harness.dart';
import '../../support/golden_capture.dart';

const _kKnobStyles = kOneUiSliderKnobStyles;
const _kSizes = kOneUiSliderSizes;
const _kKeyAppearances = <String>[
  'secondary',
  'primary',
  'positive',
  'negative',
];

Widget _goldenSlider({
  Object defaultValue = 50,
  String appearance = 'secondary',
  String knobStyle = 'outside',
  String size = 'm',
  bool showSteps = false,
}) {
  return SizedBox(
    width: 328,
    child: OneUiSlider(
      defaultValue: defaultValue,
      appearance: appearance,
      knobStyle: knobStyle,
      size: size,
      showSteps: showSteps,
      showTooltip: 'false',
      ariaLabel: 'slider',
    ),
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] Slider — knobStyle × size (secondary)', () {
    for (final knob in _kKnobStyles) {
      for (final size in _kSizes) {
        testWidgets('$knob / $size', (tester) async {
          await pumpSliderJioHarnessSettled(
            tester,
            wrapOneUiGoldenChild(_goldenSlider(knobStyle: knob, size: size)),
          );
          await expectLater(
            oneUiGoldenCaptureFinder(),
            matchesGoldenFile('goldens/slider_${knob}_$size.png'),
          );
        });
      }
    }
  });

  group('[golden] Slider — appearance (outside / m)', () {
    for (final app in _kKeyAppearances) {
      testWidgets('outside / m / $app', (tester) async {
        await pumpSliderJioHarnessSettled(
          tester,
          wrapOneUiGoldenChild(_goldenSlider(appearance: app)),
        );
        await expectLater(
          oneUiGoldenCaptureFinder(),
          matchesGoldenFile('goldens/slider_outside_m_$app.png'),
        );
      });
    }
  });

  group('[golden] Slider — range + showSteps', () {
    testWidgets('range outside / m', (tester) async {
      await pumpSliderJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          _goldenSlider(defaultValue: [25, 75]),
        ),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/slider_range_outside_m.png'),
      );
    });

    testWidgets('showSteps outside / m', (tester) async {
      await pumpSliderJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          SizedBox(
            width: 328,
            child: OneUiSlider(
              defaultValue: 0,
              min: 0,
              max: 4,
              step: 1,
              showSteps: true,
              showTooltip: 'false',
              ariaLabel: 'slider',
            ),
          ),
        ),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/slider_showsteps_outside_m.png'),
      );
    });
  });
}
