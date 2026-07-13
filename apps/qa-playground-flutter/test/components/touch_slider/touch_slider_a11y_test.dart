/// TouchSlider accessibility QA tests.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider_types.dart';

import '../../support/components/touch_slider_harness.dart';

void main() {
  group('[a11y] resolveOneUiTouchSliderSemantics', () {
    test('[a11y] prefers semanticsLabel over ariaLabel', () {
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
      final sem = resolveOneUiTouchSliderSemantics(
        state: state,
        min: 0,
        max: 100,
        step: 10,
        largeStep: 20,
        semanticsLabel: 'Screen reader',
        ariaLabel: 'Aria',
      );
      expect(sem.label, 'Screen reader');
    });

    test('[a11y] readOnly stays enabled in semantics (Figma + Slider parity)', () {
      final state = resolveOneUiTouchSliderState(
        value: 50,
        min: 0,
        max: 100,
        appearance: 'secondary',
        orientation: 'horizontal',
        progressStyle: 'rounded',
        disabled: false,
        readOnly: true,
      );
      expect(state.isDisabled, isFalse);
      expect(state.isReadOnly, isTrue);

      final sem = resolveOneUiTouchSliderSemantics(
        state: state,
        min: 0,
        max: 100,
        step: 10,
        largeStep: 20,
        ariaLabel: 'Read only volume',
      );
      expect(sem.enabled, isTrue);
      expect(sem.readOnly, isTrue);
    });
  });

  group('[a11y] TouchSlider widget semantics', () {
    testWidgetsAllPlatforms('[a11y] exposes slider role and value string',
        (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        const OneUiTouchSlider(defaultValue: 55, ariaLabel: 'Level'),
      );

      withSemanticsHandle(tester, () {
        final data = touchSliderSemanticsData(tester, 'Level');
        expect(data.hasFlag(SemanticsFlag.isSlider), isTrue);
        expect(data.value, anyOf('55', '55.0'));
      });
    });
  });
}
