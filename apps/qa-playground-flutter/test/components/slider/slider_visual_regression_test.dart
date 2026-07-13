/// Slider visual regression burn-down — geometry contracts from React CSS + Figma.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/slider_active_track_geometry.dart';
import 'package:ui_flutter/engine/slider_size_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_slider_types.dart';

import '../../support/components/slider_harness.dart';

void main() {
  group('[visual] Slider — active fill geometry', () {
    test('[visual] [SLDR-VIS-001] continuous fill spans min → thumb', () {
      const trackLength = 328.0;
      final geom = computeSliderActiveTrackGeometry(
        values: [60],
        min: 0,
        max: 100,
        trackLength: trackLength,
        isRange: false,
        knobStyle: 'outside',
        trackThickness: 4,
      );
      expect(geom.isEmpty, isFalse);
      expect(geom.leadingPx, 0);
      expect(geom.spanPx, closeTo(196.8, 0.1));
    });

    test('[visual] [SLDR-VIS-002] range fill spans lower → upper thumb', () {
      const trackLength = 328.0;
      final geom = computeSliderActiveTrackGeometry(
        values: [25, 75],
        min: 0,
        max: 100,
        trackLength: trackLength,
        isRange: true,
        knobStyle: 'outside',
        trackThickness: 4,
      );
      expect(geom.leadingPx, closeTo(82, 0.1));
      expect(geom.spanPx, closeTo(164, 0.1));
    });

    test('[visual] [SLDR-VIS-003] inside continuous extends trailing cap', () {
      final geom = computeSliderActiveTrackGeometry(
        values: [50],
        min: 0,
        max: 100,
        trackLength: 328,
        isRange: false,
        knobStyle: 'inside',
        trackThickness: 12,
      );
      expect(geom.extendTrailingPx, 6);
      expect(geom.extendLeadingPx, 0);
    });
  });

  group('[visual] Slider — layout metrics', () {
    testWidgetsAllPlatforms(
        '[visual] [SLDR-VIS-004] outside knob diameter exceeds rail height',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: 50,
          knobStyle: 'outside',
          ariaLabel: 'Outside',
        ),
      );
      final layout = sliderResolvedLayout(tester);
      expect(layout.knobOutsidePx, greaterThan(layout.trackHeightOutsidePx));
    });

    testWidgetsAllPlatforms(
        '[visual] [SLDR-VIS-005] inside knob dot is smaller than track',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: 50,
          knobStyle: 'inside',
          ariaLabel: 'Inside',
        ),
      );
      final layout = sliderResolvedLayout(tester);
      expect(layout.knobInsidePx, lessThan(layout.trackHeightInsidePx));
    });

    testWidgetsAllPlatforms(
        '[visual] [SLDR-VIS-006] mid-value paints non-zero active track width',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: 50,
          knobStyle: 'outside',
          ariaLabel: 'Fill',
        ),
      );
      final span = sliderActiveTrackSpanPx(tester);
      expect(span, isNotNull);
      expect(span!, greaterThan(100));
    });

    for (final size in kOneUiSliderSizes) {
      testWidgetsAllPlatforms(
          '[visual] [SLDR-VIS-007] size=$size scales knob vs track',
          (tester) async {
        await pumpSliderQaHarness(
          tester,
          OneUiSlider(
            defaultValue: 50,
            size: size,
            knobStyle: 'outside',
            ariaLabel: 'Size $size',
          ),
        );
        final layout = sliderResolvedLayout(tester, size: size);
        expect(layout.knobOutsidePx, greaterThan(layout.trackHeightOutsidePx));
      });
    }

    testWidgetsAllPlatforms(
        '[visual] [SLDR-VIS-008] size l scales larger than size m',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: 50,
          size: 'm',
          knobStyle: 'outside',
          ariaLabel: 'M',
        ),
      );
      final mKnob = sliderResolvedLayout(tester, size: 'm').knobOutsidePx;

      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: 50,
          size: 'l',
          knobStyle: 'outside',
          ariaLabel: 'L',
        ),
      );
      final lKnob = sliderResolvedLayout(tester, size: 'l').knobOutsidePx;
      expect(lKnob, greaterThan(mKnob));
    });
  });
}
