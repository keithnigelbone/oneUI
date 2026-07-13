/// TouchSlider motion QA — fill duration + drag zero-duration contract.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/subtle_motion_scope.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';

import '../../support/components/touch_slider_harness.dart';

Duration _fillAnimationDuration(WidgetTester tester) {
  return tester
      .widget<AnimatedPositioned>(
        find.byKey(const ValueKey<String>('touch-slider-fill')),
      )
      .duration;
}

void main() {
  group('[motion] TouchSlider — fill animation', () {
    testWidgetsAllPlatforms('[motion] fill uses Motion-Duration-M at rest',
        (tester) async {
      final ds = qaTouchSliderTestDesignSystem();
      final merged = NativeDesignSystemPayload(
        componentCustomProperties: {
          ...ds.componentCustomProperties,
          '--Motion-Duration-M': '210ms',
        },
        dimensionContexts: ds.dimensionContexts,
        activeDimensionKey: ds.activeDimensionKey,
        activeDimensionContext: ds.activeDimensionContext,
      );
      await pumpTouchSliderQaHarness(
        tester,
        const OneUiTouchSlider(defaultValue: 50, ariaLabel: 'Motion'),
        designSystem: merged,
      );
      expect(_fillAnimationDuration(tester), const Duration(milliseconds: 210));
    });

    testWidgetsAllPlatforms('[motion] fill duration is zero while dragging',
        (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        const OneUiTouchSlider(defaultValue: 25, ariaLabel: 'Drag motion'),
      );

      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(20, 0));
      await tester.pump();
      expect(_fillAnimationDuration(tester), Duration.zero);
      await gesture.up();
    });

    testWidgetsAllPlatforms('[motion] subtleMotion zeroes fill settle duration',
        (tester) async {
      final base = qaTouchSliderTestDesignSystem();
      final subtle = designSystemWithSubtleMotion(base, touchSlider: true);
      await pumpTouchSliderQaHarness(
        tester,
        const OneUiTouchSlider(defaultValue: 60, ariaLabel: 'Subtle'),
        designSystem: subtle,
      );
      expect(_fillAnimationDuration(tester), Duration.zero);
    });
  });
}
