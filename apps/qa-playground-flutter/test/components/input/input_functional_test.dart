library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';

import '../../support/components/input_harness.dart';

void main() {
  setUpAll(() async {
    await ensureInputIconsLoaded();
  });

  group('[smoke] Input', () {
    testWidgetsAllPlatforms('[smoke] renders with placeholder', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(placeholder: 'Enter text'),
      );
      expect(find.text('Enter text'), findsOneWidget);
    });
  });

  group('[functional] Input', () {
    testWidgetsAllPlatforms('[fn] onChange fires when text entered', (tester) async {
      String? last;
      await pumpInputQaHarness(
        tester,
        OneUiInput(
          placeholder: 'Name',
          onChanged: (v) => last = v,
        ),
      );
      await tester.enterText(inputTextFieldFinder(), 'Ada');
      await tester.pumpAndSettle();
      expect(last, 'Ada');
    });

    testWidgetsAllPlatforms('[fn] disabled blocks editing', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(
          value: 'Locked',
          disabled: true,
        ),
      );
      expect(inputTextField(tester).enabled, isFalse);
    });

    testWidgetsAllPlatforms('[fn] testId attaches ValueKey', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(testId: 'qa-input', placeholder: 'X'),
      );
      expect(find.byKey(const Key('qa-input')), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] controlled value renders', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(value: 'Controlled'),
      );
      expect(find.text('Controlled'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] readOnly stays enabled', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(value: 'Read', readOnly: true),
      );
      expect(inputTextField(tester).enabled, isTrue);
      expect(inputTextField(tester).readOnly, isTrue);
    });
  });
}
