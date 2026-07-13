/// TouchSlider visual-regression — SURFACE context (`appearance: auto`).
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';

import '../../support/components/touch_slider_harness.dart';
import '../../support/golden_capture.dart';

const _kSurfaceModes = <String>['subtle', 'bold'];
const _kSurfaceAppearances = <String>['primary', 'secondary'];

Widget _surfaceTouchSlider() {
  return const SizedBox(
    width: 328,
    child: OneUiTouchSlider(
      defaultValue: 50,
      appearance: 'auto',
      progressStyle: 'rounded',
      start: OneUiIcon(icon: 'volumeOn', size: '5'),
      ariaLabel: 'Volume',
    ),
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][surface] TouchSlider — appearance:auto inherits surface', () {
    for (final mode in _kSurfaceModes) {
      for (final app in _kSurfaceAppearances) {
        testWidgets('mode=$mode / appearance=$app', (tester) async {
          await pumpTouchSliderJioHarnessSettled(
            tester,
            wrapOneUiGoldenChild(_surfaceTouchSlider()),
            surfaceMode: mode,
            surfaceAppearance: app,
          );
          await expectLater(
            oneUiGoldenCaptureFinder(),
            matchesGoldenFile(
              'goldens/surface/touch_slider_surface_${mode}_$app.png',
            ),
          );
        });
      }
    }
  });

  group('[golden] TouchSlider — surface baselines', () {
    testWidgets('bold / secondary (legacy)', (tester) async {
      await pumpTouchSliderJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(goldenTouchSliderWidget()),
        surfaceMode: 'bold',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile(
          'goldens/surface/touch_slider_surface_bold_secondary.png',
        ),
      );
    });
  });
}
