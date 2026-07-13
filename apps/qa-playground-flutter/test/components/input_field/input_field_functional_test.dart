library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input_field.dart';

import '../../support/components/input_field_harness.dart';

void main() {
  setUpAll(() async {
    await ensureInputIconsLoaded();
  });

  group('[smoke] InputField', () {
    testWidgetsAllPlatforms('[smoke] renders label and input', (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'Email',
          placeholder: 'you@example.com',
        ),
      );
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('you@example.com'), findsOneWidget);
    });
  });

  group('[functional] InputField', () {
    testWidgetsAllPlatforms('[fn] onChange forwards typed text',
        (tester) async {
      String? last;
      await pumpInputFieldQaHarness(
        tester,
        OneUiInputField(
          label: 'Name',
          placeholder: 'Name',
          onChanged: (v) => last = v,
        ),
      );
      await tester.enterText(find.byType(TextField), 'Ada');
      await tester.pumpAndSettle();
      expect(last, 'Ada');
    });

    testWidgetsAllPlatforms('[fn] description renders helper copy',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'Password',
          description: 'At least 8 characters.',
        ),
      );
      expect(find.text('At least 8 characters.'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] disabled blocks editing', (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'Locked',
          value: 'x',
          disabled: true,
        ),
      );
      expect(tester.widget<TextField>(find.byType(TextField)).enabled, isFalse);
    });

    testWidgetsAllPlatforms('[fn] testId wraps ValueKey locator',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'QA',
          testId: 'qa-input-field',
        ),
      );
      // PROBED: field + inner Input both wrap KeyedSubtree(testId) — finds ≥1.
      expect(find.byKey(const ValueKey('qa-input-field')), findsWidgets);
    });

    testWidgetsAllPlatforms('[fn] error renders feedback row', (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Email', error: 'Invalid'),
      );
      expect(inputFieldFeedbackFinder(), findsOneWidget);
      expect(find.text('Invalid'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] dynamicText row renders', (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Bio', dynamicText: '0 / 140'),
      );
      expect(inputFieldDynamicTextFinder(), findsOneWidget);
    });
  });
}
