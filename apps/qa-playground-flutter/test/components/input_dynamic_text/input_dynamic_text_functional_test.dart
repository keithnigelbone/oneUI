/// InputDynamicText functional QA tests.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text_types.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import '../../support/components/input_dynamic_text_harness.dart';

void main() {
  setUpAll(() async {
    await ensureInputDynamicTextIconsLoaded();
  });

  group('[smoke] InputDynamicText', () {
    testWidgetsAllPlatforms('[smoke] renders helper copy', (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(content: '0 / 100 characters'),
      );
      expect(find.text('0 / 100 characters'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] renders trailing helper button',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          content: 'Dynamic text',
          end: 'Helper Button',
        ),
      );
      expect(find.text('Helper Button'), findsOneWidget);
      expect(inputDynamicTextHelperButtonFinder(), findsOneWidget);
    });
  });

  group('[functional] InputDynamicText', () {
    testWidgetsAllPlatforms('[fn] testId attaches ValueKey', (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          testId: 'qa-dynamic',
          content: 'Helper',
        ),
      );
      expect(find.byKey(const ValueKey('qa-dynamic')), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] onEndClick fires on helper tap',
        (tester) async {
      var hits = 0;
      await pumpInputDynamicTextQaHarness(
        tester,
        OneUiInputDynamicText(
          end: 'Clear',
          onEndClick: () => hits++,
        ),
      );
      await tester.tap(inputDynamicTextHelperInteractiveFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] disabled blocks helper tap', (tester) async {
      var hits = 0;
      await pumpInputDynamicTextQaHarness(
        tester,
        OneUiInputDynamicText(
          end: 'Clear',
          disabled: true,
          onEndClick: () => hits++,
        ),
      );
      await tester.tap(inputDynamicTextHelperInteractiveFinder(),
          warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(hits, 0);
    });

    testWidgetsAllPlatforms('[fn] empty content+end renders nothing meaningful',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(),
      );
      expect(inputDynamicTextHelperButtonFinder(), findsNothing);
      expect(find.byType(Text), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] trailingOnly end-only layout',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(end: 'Help'),
      );
      expect(inputDynamicTextRowAlignment(tester), MainAxisAlignment.end);
      expect(find.text('Help'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] content-only omits helper button',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(content: '0/100 characters'),
      );
      expect(find.text('0/100 characters'), findsOneWidget);
      expect(inputDynamicTextHelperButtonFinder(), findsNothing);
    });

    for (final entry in {
      's': OneUiInputLabelSize.s,
      'm': OneUiInputLabelSize.m,
      'l': OneUiInputLabelSize.l,
    }.entries) {
      testWidgetsAllPlatforms('[fn] size=${entry.key} encodes data-size',
          (tester) async {
        await pumpInputDynamicTextQaHarness(
          tester,
          OneUiInputDynamicText(
            size: entry.key,
            content: 'Row ${entry.key}',
          ),
        );
        expect(
          find.byKey(
            ValueKey<String>(
              'oneui-input-dynamic-text|data-size=${entry.key}',
            ),
          ),
          findsOneWidget,
        );
      });
    }

    testWidgetsAllPlatforms('[fn] disabled encodes data-disabled',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          content: 'Locked',
          disabled: true,
        ),
      );
      expect(
        find.byKey(
          const ValueKey<String>(
            'oneui-input-dynamic-text|data-size=m|data-disabled=true',
          ),
        ),
        findsOneWidget,
      );
    });
  });
}
