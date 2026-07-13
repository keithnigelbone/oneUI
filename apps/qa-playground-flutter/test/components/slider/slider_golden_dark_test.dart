/// Slider visual-regression — DARK MODE subset.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';

import '../../support/components/slider_harness.dart';
import '../../support/golden_capture.dart';

const _kDarkAppearances = <String>[
  'secondary',
  'primary',
  'positive',
  'negative',
];

Widget _goldenSlider({
  String appearance = 'secondary',
  String knobStyle = 'outside',
}) {
  return SizedBox(
    width: 328,
    child: OneUiSlider(
      defaultValue: 60,
      appearance: appearance,
      knobStyle: knobStyle,
      size: 'm',
      showTooltip: 'false',
      ariaLabel: 'slider',
    ),
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][dark] Slider — outside / m × appearance', () {
    for (final app in _kDarkAppearances) {
      testWidgets('outside / m / $app (dark)', (tester) async {
        await pumpSliderJioHarnessSettled(
          tester,
          wrapOneUiGoldenChild(_goldenSlider(appearance: app)),
          darkMode: true,
        );
        await expectLater(
          oneUiGoldenCaptureFinder(),
          matchesGoldenFile('goldens/dark/slider_dark_outside_m_$app.png'),
        );
      });
    }
  });

  group('[golden][dark] Slider — inside / m (dark)', () {
    testWidgets('inside / m / secondary (dark)', (tester) async {
      await pumpSliderJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(_goldenSlider(knobStyle: 'inside')),
        darkMode: true,
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/dark/slider_dark_inside_m_secondary.png'),
      );
    });
  });
}
