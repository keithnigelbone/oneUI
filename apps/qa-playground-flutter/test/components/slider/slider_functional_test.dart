/// Slider functional QA tests — mirrors web `Slider.test.tsx`.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_slider_types.dart';

import '../../support/components/slider_harness.dart';

void main() {
  group('[smoke] Slider', () {
    testWidgetsAllPlatforms('[smoke] renders with ariaLabel', (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(defaultValue: 50, ariaLabel: 'Volume'),
      );
      expect(sliderRootFinder(), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] range mode renders two thumbs', (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: [20, 80],
          ariaLabels: ['Min', 'Max'],
        ),
      );
      expect(sliderRootFinder(), findsOneWidget);
      expect(find.bySemanticsLabel('Min'), findsOneWidget);
      expect(find.bySemanticsLabel('Max'), findsOneWidget);
    });
  });

  group('[functional] Slider — value change', () {
    testWidgetsAllPlatforms('[fn] horizontal drag updates value', (tester) async {
      double? last;
      await pumpSliderQaHarness(
        tester,
        OneUiSlider(
          defaultValue: 20,
          ariaLabel: 'Volume',
          onValueChange: (v) => last = v as double,
        ),
      );

      final center = tester.getCenter(sliderRootFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(80, 0));
      await gesture.up();
      await tester.pumpAndSettle();

      expect(last, isNotNull);
      expect(last!, greaterThan(20));
    });

    testWidgetsAllPlatforms('[fn] ArrowRight nudges value via keyboard',
        (tester) async {
      double? last;
      await pumpSliderQaHarness(
        tester,
        OneUiSlider(
          defaultValue: 50,
          step: 10,
          ariaLabel: 'Keyboard',
          onValueChange: (v) => last = v as double,
        ),
      );

      await focusSliderThumb(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(last, isNotNull);
      expect(last!, greaterThan(50));
    });

    testWidgetsAllPlatforms('[fn] controlled value ignores internal drag state',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          value: 40,
          step: 10,
          ariaLabel: 'Controlled',
        ),
      );

      withSemanticsHandle(tester, () {
        expect(sliderSemanticsData(tester, 'Controlled').value, anyOf('40', '40.0'));
      });

      await tester.tap(sliderRootFinder());
      await tester.pumpAndSettle();

      withSemanticsHandle(tester, () {
        expect(sliderSemanticsData(tester, 'Controlled').value, anyOf('40', '40.0'));
      });
    });

    testWidgetsAllPlatforms('[fn] snapToSteps=false keeps sub-unit defaultValue',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 0.5,
          snapToSteps: false,
          ariaLabel: 'Fine',
        ),
      );

      withSemanticsHandle(tester, () {
        expect(
          sliderSemanticsData(tester, 'Fine').value,
          anyOf('0.5', '0.50'),
        );
      });
    });
  });

  group('[functional] Slider — states', () {
    testWidgetsAllPlatforms('[fn] disabled blocks onValueChange', (tester) async {
      var changed = false;
      await pumpSliderQaHarness(
        tester,
        OneUiSlider(
          defaultValue: 50,
          disabled: true,
          ariaLabel: 'Locked',
          onValueChange: (_) => changed = true,
        ),
      );

      await tester.tap(sliderRootFinder());
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('[fn] readOnly blocks onValueChange', (tester) async {
      var changed = false;
      await pumpSliderQaHarness(
        tester,
        OneUiSlider(
          defaultValue: 50,
          readOnly: true,
          ariaLabel: 'Read only',
          onValueChange: (_) => changed = true,
        ),
      );

      await tester.tap(sliderRootFinder());
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('[fn] forwards testId to Semantics.identifier',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: 30,
          ariaLabel: 'QA',
          testId: 'qa-slider',
        ),
      );

      withSemanticsHandle(tester, () {
        expect(sliderSemanticsData(tester, 'QA').identifier, 'qa-slider');
      });
    });
  });

  group('[functional] Slider — tooltip & steps', () {
    testWidgetsAllPlatforms('[fn] showTooltip=always renders tooltip bubble',
        (tester) async {
      await pumpSliderQaHarness(
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

    testWidgetsAllPlatforms('[fn] showTooltip=false omits tooltip bubble',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: 42,
          showTooltip: 'false',
          ariaLabel: 'No tip',
        ),
      );
      expect(sliderTooltipFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] formatValue appears in tooltip text',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        OneUiSlider(
          defaultValue: 1200,
          max: 5000,
          showTooltip: 'always',
          ariaLabel: 'Money',
          formatValue: (v, _) => '\$$v',
        ),
      );
      expect(find.textContaining('1200'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] showSteps renders inner tick marks',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          showSteps: true,
          min: 0,
          max: 4,
          step: 1,
          defaultValue: 0,
          ariaLabel: 'Steps',
        ),
      );
      expect(sliderInnerStepTickCount(tester), greaterThanOrEqualTo(3));
    });

    testWidgetsAllPlatforms('[fn] stepLabels render label widgets',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        OneUiSlider(
          showSteps: true,
          stepLabels: const [
            Text('A'),
            Text('B'),
            Text('C'),
            Text('D'),
            Text('E'),
          ],
          min: 0,
          max: 4,
          step: 1,
          defaultValue: 0,
          ariaLabel: 'Labels',
        ),
      );
      expect(find.text('B'), findsOneWidget);
      expect(find.text('C'), findsOneWidget);
      expect(find.text('D'), findsOneWidget);
    });
  });

  group('[functional] Slider — orientation & knobStyle', () {
    testWidgetsAllPlatforms('[fn] vertical orientation renders', (tester) async {
      await pumpSliderQaHarness(
        tester,
        const SizedBox(
          height: 200,
          child: OneUiSlider(
            defaultValue: 30,
            orientation: 'vertical',
            ariaLabel: 'Vertical',
          ),
        ),
      );
      expect(sliderRootFinder(), findsOneWidget);
      expect(sliderResolvedLayout(tester).verticalHeightPx, greaterThan(0));
    });

    for (final knob in kOneUiSliderKnobStyles) {
      testWidgetsAllPlatforms('[fn] knobStyle=$knob renders', (tester) async {
        await pumpSliderQaHarness(
          tester,
          OneUiSlider(
            defaultValue: 50,
            knobStyle: knob,
            ariaLabel: 'Knob $knob',
          ),
        );
        expect(sliderRootFinder(), findsOneWidget);
      });
    }
  });

  group('[functional] Slider — size (Figma / RN)', () {
    for (final size in kOneUiSliderSizes) {
      testWidgetsAllPlatforms('[fn] size=$size resolves layout metrics',
          (tester) async {
        await pumpSliderQaHarness(
          tester,
          OneUiSlider(
            defaultValue: 50,
            size: size,
            ariaLabel: 'Size $size',
          ),
        );
        final layout = sliderResolvedLayout(tester, size: size);
        expect(layout.knobOutsidePx, greaterThan(layout.trackHeightOutsidePx));
        if (size == 'l') {
          expect(layout.knobOutsidePx, greaterThan(12));
        }
        if (size == 's') {
          expect(layout.knobInsidePx, lessThanOrEqualTo(8));
        }
      });
    }
  });
}
