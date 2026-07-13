/// Slider visual-regression — SURFACE context.
///
/// Validates that `appearance: 'auto'` inherits the parent Surface role while
/// the slider fill and knob adapt via [data-surface] token remapping.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';

import '../../support/components/slider_harness.dart';
import '../../support/golden_capture.dart';

const _kSurfaceModes = <String>['subtle', 'bold'];
const _kSurfaceAppearances = <String>['primary', 'secondary'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][surface] Slider — appearance:auto inherits surface', () {
    for (final mode in _kSurfaceModes) {
      for (final app in _kSurfaceAppearances) {
        testWidgets('mode=$mode / appearance=$app', (tester) async {
          await pumpSliderJioHarnessSettled(
            tester,
            wrapOneUiGoldenChild(
              const SizedBox(
                width: 328,
                child: OneUiSlider(
                  defaultValue: 50,
                  appearance: 'auto',
                  knobStyle: 'outside',
                  size: 'm',
                  showTooltip: 'false',
                  ariaLabel: 'slider',
                ),
              ),
            ),
            surfaceMode: mode,
            surfaceAppearance: app,
          );
          await expectLater(
            oneUiGoldenCaptureFinder(),
            matchesGoldenFile('goldens/surface/slider_surface_${mode}_$app.png'),
          );
        });
      }
    }
  });
}
