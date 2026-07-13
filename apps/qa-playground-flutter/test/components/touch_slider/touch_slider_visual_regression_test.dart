/// TouchSlider visual regression burn-down — resolver + painted fill contracts.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/touch_slider_cap_ratio.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider_types.dart';

import '../../support/components/touch_slider_harness.dart';

void main() {
  group('[visual] TouchSlider — fill ratio contract', () {
    test('[visual] [TSL-VIS-001] fillRatio tracks value across min/max', () {
      final low = resolveOneUiTouchSliderState(
        value: 0,
        min: 0,
        max: 100,
        appearance: 'secondary',
        orientation: 'horizontal',
        progressStyle: 'rounded',
        disabled: false,
        readOnly: false,
      );
      final high = resolveOneUiTouchSliderState(
        value: 100,
        min: 0,
        max: 100,
        appearance: 'secondary',
        orientation: 'horizontal',
        progressStyle: 'rounded',
        disabled: false,
        readOnly: false,
      );
      expect(low.fillRatio, 0);
      expect(high.fillRatio, 1);
    });

    test('[visual] [TSL-VIS-002] touchSliderFillExtentPx at 50% is half track',
        () {
      const track = 200.0;
      const thickness = 12.0;
      final extent = touchSliderFillExtentPx(
        fillRatio: 0.5,
        thickness: thickness,
        trackLength: track,
        progressStyle: 'rounded',
        hasStartSlot: true,
      );
      expect(extent, closeTo(100, 0.01));
    });

    test('[visual] [TSL-VIS-003] sharp fill grows from zero without min pill',
        () {
      const track = 200.0;
      final extent = touchSliderFillExtentPx(
        fillRatio: 0.25,
        thickness: 12,
        trackLength: track,
        progressStyle: 'sharp',
        hasStartSlot: false,
      );
      expect(extent, closeTo(50, 0.01));
    });
  });

  group('[visual] TouchSlider — painted fill span', () {
    for (final value in [0.0, 50.0, 100.0]) {
      testWidgetsAllPlatforms(
        '[visual] [TSL-VIS-00${value == 0 ? 4 : value == 50 ? 5 : 6}] '
        'horizontal rounded fill at $value',
        (tester) async {
          await pumpTouchSliderQaHarness(
            tester,
            goldenTouchSliderMatrixCell(defaultValue: value),
          );
          expectTouchSliderFillSpan(
            tester,
            defaultValue: value,
            progressStyle: 'rounded',
            orientation: 'horizontal',
          );
        },
      );
    }

    testWidgetsAllPlatforms(
        '[visual] [TSL-VIS-007] vertical rounded fill at 50%',
        (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        goldenTouchSliderMatrixCell(
          defaultValue: 50,
          orientation: 'vertical',
        ),
      );
      expectTouchSliderFillSpan(
        tester,
        defaultValue: 50,
        progressStyle: 'rounded',
        orientation: 'vertical',
      );
    });

    testWidgetsAllPlatforms(
        '[visual] [TSL-VIS-008] sharp horizontal fill at 50%',
        (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        goldenTouchSliderMatrixCell(
          defaultValue: 50,
          progressStyle: 'sharp',
        ),
      );
      expectTouchSliderFillSpan(
        tester,
        defaultValue: 50,
        progressStyle: 'sharp',
        orientation: 'horizontal',
      );
    });
  });
}
