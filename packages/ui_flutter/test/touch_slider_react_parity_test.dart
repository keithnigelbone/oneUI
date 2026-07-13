/// React / RN parity — `TouchSlider.test.tsx` resolver + widget smoke.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider_types.dart';

import 'slider_test_harness.dart';

void main() {
  group('React parity — resolveOneUiTouchSliderState', () {
    test('readOnly is distinct from disabled in state', () {
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
    });

    test('single double value — number[] unused on web', () {
      final state = resolveOneUiTouchSliderState(
        value: 33,
        min: 0,
        max: 100,
        appearance: 'secondary',
        orientation: 'horizontal',
        progressStyle: 'sharp',
        disabled: false,
        readOnly: false,
      );
      expect(state.value, 33);
      expect(state.progressStyle, 'sharp');
    });
  });

  group('Figma parity — widget semantics', () {
    testWidgets('readOnly stays enabled in semantics', (tester) async {
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          const OneUiTouchSlider(
            defaultValue: 50,
            readOnly: true,
            ariaLabel: 'Read only',
          ),
        ),
      );
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        final data =
            tester.getSemantics(find.bySemanticsLabel('Read only')).getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('slider role + value string', (tester) async {
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          const OneUiTouchSlider(defaultValue: 55, ariaLabel: 'Level'),
        ),
      );
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        final node = tester.getSemantics(find.bySemanticsLabel('Level'));
        expect(node.getSemanticsData().value, anyOf('55', '55.0'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('drag adjusts value', (tester) async {
      double? last;
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          OneUiTouchSlider(
            defaultValue: 20,
            ariaLabel: 'Gain',
            onValueChange: (v) => last = v,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.drag(touchSliderTrackFinder(), const Offset(120, 0));
      await tester.pumpAndSettle();
      expect(last, isNotNull);
      expect(last!, greaterThan(20));
    });
  });

  group('React parity — touchSliderKeyboardStep', () {
    test('page step uses largeStep', () {
      expect(
        touchSliderKeyboardStep(page: true, step: 1, largeStep: 20),
        20,
      );
    });
  });
}
