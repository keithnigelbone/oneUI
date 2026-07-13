/// InputDynamicText accessibility QA tests.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text_types.dart';

import '../../support/components/input_dynamic_text_harness.dart';

void main() {
  setUpAll(() async {
    await ensureInputDynamicTextIconsLoaded();
  });

  group('[a11y] InputDynamicText', () {
    testWidgetsAllPlatforms('[a11y] polite live region on leading copy',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          content: '12 / 100 characters',
          ariaLive: OneUiInputDynamicTextAriaLive.polite,
        ),
      );
      withSemanticsHandle(tester, () {
        expect(inputDynamicTextLiveRegionFinder(), findsOneWidget);
        expect(find.text('12 / 100 characters'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] assertive live region on leading copy',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          content: 'Count',
          ariaLive: OneUiInputDynamicTextAriaLive.assertive,
        ),
      );
      withSemanticsHandle(tester, () {
        expect(inputDynamicTextLiveRegionFinder(), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] no live region when aria-live omitted',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(content: 'Static copy'),
      );
      withSemanticsHandle(tester, () {
        expect(inputDynamicTextLiveRegionFinder(), findsNothing);
      });
    });

    testWidgetsAllPlatforms('[a11y] endAriaLabel surfaces on helper button',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          end: 'Helper Button',
          endAriaLabel: 'Open helper',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = inputDynamicTextHelperButtonSemantics(tester);
        expect(data.label, contains('Open helper'));
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] accessibilityHint on helper button',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          end: 'Help',
          endAriaLabel: 'Help action',
          accessibilityHint: 'Opens contextual help',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = inputDynamicTextHelperButtonSemantics(tester);
        expect(data.label, contains('Help action'));
        expect(data.hint, contains('Opens contextual help'));
      });
    });

    testWidgetsAllPlatforms('[a11y] disabled helper button is not enabled',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          end: 'Clear',
          endAriaLabel: 'Clear field',
          disabled: true,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = inputDynamicTextHelperButtonSemantics(tester);
        expect(data.label, contains('Clear field'));
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      });
    });
  });
}
