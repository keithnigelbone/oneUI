/// Slider motion QA — knob scale duration + tooltip visibility.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/subtle_motion_scope.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';

import '../../support/components/slider_harness.dart';

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
  group('[motion] Slider — knob scale', () {
    testWidgetsAllPlatforms('[motion] knob uses Motion-Duration-L when focused',
        (tester) async {
      final base = qaSliderTestDesignSystem();
      final ds = NativeDesignSystemPayload(
        componentCustomProperties: {
          ...base.componentCustomProperties,
          '--Motion-Duration-L': '260ms',
        },
        dimensionContexts: base.dimensionContexts,
        activeDimensionKey: base.activeDimensionKey,
        activeDimensionContext: base.activeDimensionContext,
      );
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(defaultValue: 50, ariaLabel: 'Knob motion'),
        designSystem: ds,
      );
      await focusSliderThumb(tester);
      await tester.pump();
      expect(_knobScaleDuration(tester), const Duration(milliseconds: 260));
    });

    testWidgetsAllPlatforms('[motion] subtleMotion zeroes knob scale duration',
        (tester) async {
      final subtle = designSystemWithSubtleMotion(qaSliderTestDesignSystem());
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(defaultValue: 50, ariaLabel: 'Subtle knob'),
        designSystem: subtle,
      );
      await focusSliderThumb(tester);
      await tester.pump();
      expect(_knobScaleDuration(tester), Duration.zero);
    });
  });

  group('[motion] Slider — tooltip', () {
    testWidgetsAllPlatforms('[motion] showTooltip=always renders value bubble',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: 33,
          showTooltip: 'always',
          ariaLabel: 'Tooltip',
        ),
      );
      expect(sliderTooltipFinder(), findsOneWidget);
      expect(find.text('33'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[motion] showTooltip auto appears while dragging',
        (tester) async {
      await pumpSliderQaHarness(
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
  });
}
