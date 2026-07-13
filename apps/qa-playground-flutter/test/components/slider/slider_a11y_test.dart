/// Slider accessibility QA tests — resolver units + widget semantics.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_slider_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_slider_types.dart';

import '../../support/components/slider_harness.dart';

void main() {
  group('[a11y] resolveOneUiSliderThumbSemantics', () {
    test('[a11y] prefers semanticsLabel over ariaLabel', () {
      final state = resolveOneUiSliderState(
        values: [50],
        appearance: 'secondary',
        orientation: 'horizontal',
        size: 'm',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: false,
      );
      final sem = resolveOneUiSliderThumbSemantics(
        state: state,
        thumbIndex: 0,
        thumbValue: 50,
        min: 0,
        max: 100,
        step: 10,
        largeStep: 20,
        semanticsLabel: 'Screen reader',
        ariaLabel: 'Aria',
      );
      expect(sem.label, 'Screen reader');
    });

    test('[a11y] range mode uses per-thumb ariaLabels', () {
      final state = resolveOneUiSliderState(
        values: [20, 80],
        appearance: 'secondary',
        orientation: 'horizontal',
        size: 'm',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: false,
      );
      final sem = resolveOneUiSliderThumbSemantics(
        state: state,
        thumbIndex: 1,
        thumbValue: 80,
        min: 0,
        max: 100,
        step: 10,
        largeStep: 20,
        ariaLabels: ['Min', 'Max'],
      );
      expect(sem.label, 'Max');
    });

    test('[a11y] readOnly stays enabled with readOnly flag', () {
      final state = resolveOneUiSliderState(
        values: [50],
        appearance: 'secondary',
        orientation: 'horizontal',
        size: 'm',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: true,
      );
      final sem = resolveOneUiSliderThumbSemantics(
        state: state,
        thumbIndex: 0,
        thumbValue: 50,
        min: 0,
        max: 100,
        step: 10,
        largeStep: 20,
        ariaLabel: 'RO',
      );
      expect(sem.enabled, isTrue);
      expect(sem.readOnly, isTrue);
    });

    test('[a11y] increased/decreased clamp at min/max', () {
      final state = resolveOneUiSliderState(
        values: [100],
        appearance: 'secondary',
        orientation: 'horizontal',
        size: 'm',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: false,
      );
      final sem = resolveOneUiSliderThumbSemantics(
        state: state,
        thumbIndex: 0,
        thumbValue: 100,
        min: 0,
        max: 100,
        step: 10,
        largeStep: 20,
        ariaLabel: 'Max',
      );
      expect(sem.increasedValue, 100);
      expect(sem.decreasedValue, 90);
    });
  });

  group('[a11y] Slider widget semantics', () {
    testWidgetsAllPlatforms('[a11y] exposes slider role and value string',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(defaultValue: 42, ariaLabel: 'Brightness'),
      );

      withSemanticsHandle(tester, () {
        final data = sliderSemanticsData(tester, 'Brightness');
        expect(data.hasFlag(SemanticsFlag.isSlider), isTrue);
        expect(data.value, anyOf('42', '42.0'));
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] disabled reports isEnabled=false',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: 42,
          disabled: true,
          ariaLabel: 'Off',
        ),
      );

      withSemanticsHandle(tester, () {
        final data = sliderSemanticsData(tester, 'Off');
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      });
    });

    testWidgetsAllPlatforms('[a11y] readOnly reports readOnly semantics',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: 42,
          readOnly: true,
          ariaLabel: 'ReadOnly',
        ),
      );

      withSemanticsHandle(tester, () {
        final data = sliderSemanticsData(tester, 'ReadOnly');
        expect(data.hasFlag(SemanticsFlag.isReadOnly), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] range exposes two independent slider nodes',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: [20, 80],
          ariaLabels: ['Low', 'High'],
        ),
      );

      withSemanticsHandle(tester, () {
        final low = sliderSemanticsData(tester, 'Low');
        final high = sliderSemanticsData(tester, 'High');
        expect(low.hasFlag(SemanticsFlag.isSlider), isTrue);
        expect(high.hasFlag(SemanticsFlag.isSlider), isTrue);
        expect(low.value, anyOf('20', '20.0'));
        expect(high.value, anyOf('80', '80.0'));
      });
    });

    testWidgetsAllPlatforms('[a11y] keyboard nudge updates semantics value',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(
          defaultValue: 50,
          step: 10,
          ariaLabel: 'Nudge',
        ),
      );

      await focusSliderThumb(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      withSemanticsHandle(tester, () {
        final data = sliderSemanticsData(tester, 'Nudge');
        expect(data.value, anyOf('60', '60.0'));
      });
    });
  });
}
