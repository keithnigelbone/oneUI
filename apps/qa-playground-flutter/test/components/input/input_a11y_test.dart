library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_input_a11y.dart';

import '../../support/components/input_harness.dart';

void main() {
  setUpAll(() async {
    await ensureInputIconsLoaded();
  });

  group('[a11y] resolveOneUiInputAccessibility', () {
    test('[a11y] prefers ariaLabel over placeholder', () {
      final a11y = resolveOneUiInputAccessibility(
        ariaLabel: 'Search',
        placeholder: 'Type here',
        isDisabled: false,
        isReadOnly: false,
        type: 'text',
      );
      expect(a11y.label, 'Search');
    });
  });

  group('[a11y] Input widget', () {
    testWidgetsAllPlatforms('[a11y] ariaLabel surfaces in semantics', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(ariaLabel: 'Email address', placeholder: 'email'),
      );
      withSemanticsHandle(tester, () {
        final data = inputControlSemanticsData(tester);
        expect(data.label, contains('Email address'));
      });
    });

    testWidgetsAllPlatforms('[a11y] errorHighlight marks validation invalid',
        (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(
          ariaLabel: 'Email',
          errorHighlight: true,
          value: 'bad',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = inputControlSemanticsData(tester);
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });
  });
}
