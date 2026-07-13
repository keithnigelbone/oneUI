import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/touch_slider_motion_resolve.dart';
import 'package:ui_flutter/foundations/subtle_motion_scope.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';

import 'slider_test_harness.dart';

NativeDesignSystemPayload _motionDs(Map<String, String> motionTokens) {
  final base = sliderTestDesignSystem();
  return NativeDesignSystemPayload(
    componentCustomProperties: {
      ...base.componentCustomProperties,
      ...motionTokens,
    },
    dimensionContexts: base.dimensionContexts,
    activeDimensionKey: base.activeDimensionKey,
    activeDimensionContext: base.activeDimensionContext,
  );
}

Duration _fillAnimationDuration(WidgetTester tester) {
  return tester
      .widget<AnimatedPositioned>(
        find.byKey(const ValueKey<String>('touch-slider-fill')),
      )
      .duration;
}

void main() {
  group('resolveTouchSliderMotion', () {
    testWidgets('reads Convex motion tokens', (tester) async {
      late TouchSliderMotionSpec spec;
      final ds = _motionDs(const {
        '--Motion-Duration-M': '222ms',
        '--Motion-Duration-XS': '88ms',
      });
      await tester.pumpWidget(
        pumpSliderStoryApp(
          Builder(
            builder: (ctx) {
              spec = resolveTouchSliderMotion(ctx, ds);
              return const SizedBox();
            },
          ),
          designSystem: ds,
        ),
      );
      expect(spec.fillDurationMs, 222);
      expect(spec.colorDurationMs, 88);
    });

    testWidgets('designSystemWithSubtleMotion zeroes fill duration token',
        (tester) async {
      final base = sliderTestDesignSystem();
      final subtle = designSystemWithSubtleMotion(base, touchSlider: true);
      await tester.pumpWidget(
        pumpSliderStoryApp(
          Builder(
            builder: (ctx) {
              final spec = resolveTouchSliderMotion(ctx, subtle);
              expect(spec.fillDurationMs, 0);
              return const SizedBox();
            },
          ),
          designSystem: subtle,
        ),
      );
    });
  });

  group('OneUiTouchSlider fill motion', () {
    testWidgets('fill AnimatedPositioned uses resolved duration at rest',
        (tester) async {
      final ds = _motionDs(const {'--Motion-Duration-M': '190ms'});
      await pumpTouchSliderStoryHarness(
        tester,
        const OneUiTouchSlider(defaultValue: 50, ariaLabel: 'Fill'),
        designSystem: ds,
      );
      expect(_fillAnimationDuration(tester), const Duration(milliseconds: 190));
    });

    testWidgets('fill animation duration is zero while dragging', (tester) async {
      final ds = _motionDs(const {'--Motion-Duration-M': '200ms'});
      await pumpTouchSliderStoryHarness(
        tester,
        const OneUiTouchSlider(defaultValue: 20, ariaLabel: 'Drag'),
        designSystem: ds,
      );

      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(24, 0));
      await tester.pump();

      expect(_fillAnimationDuration(tester), Duration.zero);
      await gesture.up();
    });
  });
}
