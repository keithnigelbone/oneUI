/// React / RN parity — `Slider.test.tsx` resolver + widget smoke.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_slider_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_slider_types.dart';

import 'slider_test_harness.dart';

void main() {
  group('React parity — resolveOneUiSliderState', () {
    test('appearance=auto → secondary', () {
      expect(
        resolveOneUiSliderState(
          values: [50],
          appearance: 'auto',
          orientation: 'horizontal',
          size: 'm',
          knobStyle: 'outside',
          showTooltip: 'auto',
          snapToSteps: true,
          disabled: false,
          readOnly: false,
        ).resolvedAppearance,
        'secondary',
      );
    });

    test('readOnly is distinct from disabled in state', () {
      final ro = resolveOneUiSliderState(
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
      expect(ro.isDisabled, isFalse);
      expect(ro.isReadOnly, isTrue);
    });
  });

  group('React parity — widget semantics', () {
    testWidgets('slider role + value string', (tester) async {
      await tester.pumpWidget(
        pumpSliderStoryApp(
          const OneUiSlider(defaultValue: 42, ariaLabel: 'Brightness'),
        ),
      );
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        final node = tester.getSemantics(find.bySemanticsLabel('Brightness'));
        final data = node.getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.isSlider), isTrue);
        expect(data.value, anyOf('42', '42.0'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('renders slider semantics value', (tester) async {
      await tester.pumpWidget(
        pumpSliderStoryApp(
          const OneUiSlider(defaultValue: 42, ariaLabel: 'Gain'),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(
          tester.getSemantics(find.bySemanticsLabel('Gain')).getSemanticsData().value,
          anyOf('42', '42.0'),
        );
      } finally {
        handle.dispose();
      }
    });
  });

  group('React parity — thumb semantics resolver', () {
    test('increased/decreased value strings clamp to min/max', () {
      final state = resolveOneUiSliderState(
        values: [0],
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
        thumbValue: 0,
        min: 0,
        max: 100,
        step: 10,
        largeStep: 20,
        ariaLabel: 'Min',
      );
      expect(sem.decreasedValue, 0);
      expect(sem.increasedValue, 10);
    });
  });
}
