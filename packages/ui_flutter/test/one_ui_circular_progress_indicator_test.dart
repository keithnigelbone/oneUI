/// Core CPI unit tests — types, layout helpers, and smoke widget cases.
///
/// Full React/RN parity: [circular_progress_indicator_react_parity_test.dart],
/// a11y resolver: [one_ui_circular_progress_indicator_a11y_test.dart],
/// painter: [one_ui_circular_progress_indicator_painter_test.dart].
library;

import 'package:flutter_test/flutter_test.dart';

import 'cpi_test_harness.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';

void main() {
  group('one_ui_circular_progress_indicator_types', () {
    test('null value forces indeterminate', () {
      final s = resolveOneUiCircularProgressIndicatorState(
        variant: 'determinate',
        value: null,
      );
      expect(s.isIndeterminate, isTrue);
      expect(s.resolvedVariant, 'indeterminate');
    });

    test('clamps and normalizes value', () {
      final s = resolveOneUiCircularProgressIndicatorState(
          value: 150, min: 0, max: 100);
      expect(s.percentage, 100);
      expect(s.normalizedValue, 1);
    });

    test('auto appearance resolves to primary', () {
      final s = resolveOneUiCircularProgressIndicatorState(appearance: 'auto');
      expect(s.resolvedAppearance, 'primary');
    });

    test('label visible at M and all canonical sizes', () {
      expect(isCpiLabelVisible('M'), isTrue);
      expect(isCpiLabelVisible('S'), isTrue);
      expect(isCpiLabelVisible('2XS'), isTrue);
      expect(isCpiLabelVisible('L'), isTrue);
    });

    test('icon content visible at all sizes when child is set', () {
      expect(isCpiIconContentVisible('icon', '★'), isTrue);
      expect(isCpiIconContentVisible('icon', null), isFalse);
      expect(isCpiIconContentVisible('none', '★'), isFalse);
    });

    test('resolveCpiSize accepts Figma lowercase aliases', () {
      expect(resolveCpiSize('m'), 'M');
      expect(resolveCpiSize('3xl'), '3XL');
      expect(resolveCpiSize('bogus'), 'M');
    });

    test('dataPayloadKey encodes data-* attrs', () {
      final s = resolveOneUiCircularProgressIndicatorState(
        value: 10,
        size: 'l',
        appearance: 'secondary',
      );
      expect(s.resolvedSize, 'L');
      expect(s.dataPayloadKey, contains('oneui-cpi'));
      expect(s.dataPayloadKey, contains('data-size=L'));
      expect(s.dataPayloadKey, contains('data-appearance=secondary'));
    });

    test('brand-bg maps to primary for icon appearance', () {
      expect(cpiAppearanceToIconAppearance('brand-bg'), 'primary');
    });

    test('all sizes have stroke map and spacing name', () {
      for (final size in kOneUiCircularProgressIndicatorSizes) {
        expect(kCpiSvgStrokeMap[size], isNotNull);
        expect(kCpiSizeToSpacingName[size], isNotNull);
      }
    });
  });

  group('OneUiCircularProgressIndicator smoke', () {
    testWidgets('renders with semantics label', (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 25,
            semanticsLabel: 'Task progress',
          ),
        ),
      );
      await pumpCpiLayout(tester);
      expect(find.bySemanticsLabel('Task progress'), findsOneWidget);
    });
  });
}
