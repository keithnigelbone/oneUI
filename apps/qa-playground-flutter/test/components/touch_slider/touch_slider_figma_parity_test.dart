/// TouchSlider Figma-parity QA suite — `[figma]`.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/touch_slider_cap_ratio.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider_types.dart';

import '../../support/components/touch_slider_harness.dart';

Finder _touchSliderTrack(Finder slider) {
  return find.descendant(of: slider, matching: find.byType(ClipRRect));
}

Size _trackClipSize(WidgetTester tester, Finder slider) {
  return tester.getSize(_touchSliderTrack(slider));
}

RenderBox _fillBox(WidgetTester tester, Finder slider) {
  return tester.renderObject<RenderBox>(
    find.descendant(
      of: slider,
      matching: find.byKey(const ValueKey<String>('touch-slider-fill')),
    ),
  );
}

void main() {
  group('[figma] TouchSlider — progressStyle', () {
    for (final style in kOneUiTouchSliderProgressStyles) {
      testWidgetsAllPlatforms('[figma] progressStyle=$style renders',
          (tester) async {
        await pumpTouchSliderQaHarness(
          tester,
          OneUiTouchSlider(
            defaultValue: 50,
            progressStyle: style,
            ariaLabel: style,
          ),
        );
        expect(touchSliderRootFinder(), findsOneWidget);
      });
    }
  });

  group('[figma] TouchSlider — appearance', () {
    for (final appearance in kOneUiTouchSliderFigmaAppearanceRoles) {
      testWidgetsAllPlatforms('[figma] appearance=$appearance renders',
          (tester) async {
        await pumpTouchSliderQaHarness(
          tester,
          OneUiTouchSlider(
            defaultValue: 50,
            appearance: appearance,
            ariaLabel: appearance,
          ),
        );
        expect(touchSliderRootFinder(), findsOneWidget);
      });
    }
  });

  group('[figma] TouchSlider — orientation', () {
    for (final orientation in kOneUiTouchSliderOrientations) {
      testWidgetsAllPlatforms('[figma] orientation=$orientation renders',
          (tester) async {
        await pumpTouchSliderQaHarness(
          tester,
          SizedBox(
            height: orientation == 'vertical' ? 240 : null,
            child: OneUiTouchSlider(
              defaultValue: 50,
              orientation: orientation,
              ariaLabel: orientation,
            ),
          ),
        );
        expect(touchSliderRootFinder(), findsOneWidget);
      });
    }
  });

  group('[figma] TouchSlider — fill geometry', () {
    testWidgets('[figma] horizontal rounded 50% fill width', (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        const OneUiTouchSlider(
          defaultValue: 50,
          progressStyle: 'rounded',
          start: Icon(Icons.volume_up, size: 18),
          ariaLabel: 'Fill',
        ),
      );
      await tester.pumpAndSettle();

      final slider = touchSliderRootFinder();
      final track = _trackClipSize(tester, slider);
      final fill = _fillBox(tester, slider);
      expect(fill.size.width, closeTo(track.width * 0.5, 2.0));
    });

    testWidgets('[figma] horizontal sharp 50% fill width', (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        const OneUiTouchSlider(
          defaultValue: 50,
          progressStyle: 'sharp',
          start: Icon(Icons.volume_up, size: 18),
          ariaLabel: 'Sharp fill',
        ),
      );
      await tester.pumpAndSettle();

      final slider = touchSliderRootFinder();
      final track = _trackClipSize(tester, slider);
      final fill = _fillBox(tester, slider);
      expect(fill.size.width, closeTo(track.width * 0.5, 2.0));
    });

    testWidgets('[figma] vertical rounded 50% fill height', (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        const SizedBox(
          height: 240,
          child: OneUiTouchSlider(
            defaultValue: 50,
            orientation: 'vertical',
            progressStyle: 'rounded',
            start: Icon(Icons.volume_up, size: 18),
            ariaLabel: 'Vertical fill',
          ),
        ),
      );
      await tester.pumpAndSettle();

      final slider = touchSliderRootFinder();
      final track = _trackClipSize(tester, slider);
      final fill = _fillBox(tester, slider);
      expect(fill.size.height, closeTo(track.height * 0.5, 2.0));
    });
  });

  group('[figma] TouchSlider — state resolver', () {
    test('[figma] fillRatio at value 50', () {
      final state = resolveOneUiTouchSliderState(
        value: 50,
        min: 0,
        max: 100,
        appearance: 'secondary',
        orientation: 'horizontal',
        progressStyle: 'rounded',
        disabled: false,
        readOnly: false,
      );
      expect(state.value, 50);
      expect(state.fillRatio, closeTo(0.5, 0.001));
    });

    test('[figma] readOnly is distinct from disabled', () {
      final state = resolveOneUiTouchSliderState(
        value: 42,
        min: 0,
        max: 100,
        appearance: 'secondary',
        orientation: 'horizontal',
        progressStyle: 'sharp',
        disabled: false,
        readOnly: true,
      );
      expect(state.isDisabled, isFalse);
      expect(state.isReadOnly, isTrue);
    });

    test('[figma] sparkle and brand-bg are not in Figma appearance API', () {
      expect(kOneUiTouchSliderAppearances, isNot(contains('sparkle')));
      expect(kOneUiTouchSliderAppearances, isNot(contains('brand-bg')));
    });

    test('[figma] cap ratio matches 138×32 Figma reference', () {
      expect(
        computeTouchSliderCapRatio(138, 32),
        closeTo(16 / 138, 0.0001),
      );
    });
  });
}
