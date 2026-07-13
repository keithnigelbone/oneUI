import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/slider_motion_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';

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

Duration _knobScaleDuration(WidgetTester tester) {
  return tester
      .widget<AnimatedScale>(
        find.descendant(
          of: sliderRootFinder(),
          matching: find.byType(AnimatedScale),
        ),
      )
      .duration;
}

void main() {
  group('resolveSliderMotion', () {
    testWidgets('reads Convex motion tokens', (tester) async {
      late SliderMotionSpec spec;
      final ds = _motionDs(const {
        '--Motion-Duration-L': '333ms',
        '--Motion-Duration-XS': '111ms',
      });
      await tester.pumpWidget(
        pumpSliderStoryApp(
          Builder(
            builder: (ctx) {
              spec = resolveSliderMotion(ctx, ds);
              return const SizedBox();
            },
          ),
          designSystem: ds,
        ),
      );
      expect(spec.knobScaleDurationMs, 333);
      expect(spec.colorDurationMs, 111);
    });

    testWidgets('subtleMotion override zeroes knob scale duration', (tester) async {
      final ds = _motionDs(const {
        '--Motion-Duration-L': '0ms',
        '--Motion-Duration-M': '0ms',
      });
      await pumpSliderStoryHarness(
        tester,
        const OneUiSlider(defaultValue: 50, ariaLabel: 'Motion'),
        designSystem: ds,
      );
      await focusSliderThumb(tester);
      await tester.pump();
      expect(_knobScaleDuration(tester), Duration.zero);
    });
  });

  group('OneUiSlider knob motion', () {
    testWidgets('knob AnimatedScale uses resolved duration when focused',
        (tester) async {
      final ds = _motionDs(const {'--Motion-Duration-L': '275ms'});
      await pumpSliderStoryHarness(
        tester,
        const OneUiSlider(defaultValue: 50, ariaLabel: 'Knob'),
        designSystem: ds,
      );
      await focusSliderThumb(tester);
      await tester.pump();
      expect(_knobScaleDuration(tester), const Duration(milliseconds: 275));
    });

    testWidgets('showTooltip=always renders tooltip bubble', (tester) async {
      await pumpSliderStoryHarness(
        tester,
        const OneUiSlider(
          defaultValue: 42,
          showTooltip: 'always',
          ariaLabel: 'Tip',
        ),
      );
      expect(sliderTooltipFinder(), findsOneWidget);
      expect(find.text('42'), findsOneWidget);
    });

    testWidgets('showTooltip auto appears while dragging', (tester) async {
      await pumpSliderStoryHarness(
        tester,
        const OneUiSlider(
          defaultValue: 50,
          showTooltip: 'auto',
          ariaLabel: 'Drag tip',
        ),
      );
      expect(sliderTooltipFinder(), findsNothing);

      final gesture = await tester.startGesture(
        tester.getCenter(sliderKnobHitFinder()),
      );
      await gesture.moveBy(const Offset(24, 0));
      await tester.pump();
      expect(sliderTooltipFinder(), findsOneWidget);
      await gesture.up();
    });

    testWidgets('knob scale animation runs after focus (partial settle)',
        (tester) async {
      final ds = _motionDs(const {'--Motion-Duration-L': '200ms'});
      await pumpSliderStoryHarness(
        tester,
        const OneUiSlider(defaultValue: 50, ariaLabel: 'Anim'),
        designSystem: ds,
      );
      await focusSliderThumb(tester);
      await tester.pump(const Duration(milliseconds: 50));
      expect(_knobScaleDuration(tester), const Duration(milliseconds: 200));
      await tester.pumpAndSettle();
    });
  });
}
