/// InputFeedback — on-device integration tests.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import '../test/support/components/input_feedback_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputFeedbackIconsLoaded();
  });

  group('InputFeedback — on-device', () {
    testWidgets('[e2e] negative feedback renders with alert semantics',
        (tester) async {
      await pumpInputFeedbackJioHarnessSettled(
        tester,
        const OneUiInputFeedback(
          feedbackMessage: 'This field is required.',
        ),
      );
      await _hold(tester, 2000);
      expect(find.text('This field is required.'), findsOneWidget);
      withSemanticsHandle(tester, () {
        expect(inputFeedbackProbedRole(tester), SemanticsRole.alert);
      });
    });

    testWidgets('[e2e] each variant renders on Jio fixture', (tester) async {
      for (final variant in OneUiInputFeedbackVariant.values) {
        await pumpInputFeedbackJioHarnessSettled(
          tester,
          OneUiInputFeedback(
            variant: variant,
            feedbackMessage: '${variant.wireValue} feedback',
          ),
        );
        await _hold(tester, _demoMode ? 400 : 0);
        expect(inputFeedbackRootFinder(), findsOneWidget);
      }
    });

    testWidgets('[e2e] positive feedback exposes polite live region',
        (tester) async {
      await pumpInputFeedbackJioHarnessSettled(
        tester,
        const OneUiInputFeedback(
          variant: OneUiInputFeedbackVariant.positive,
          feedbackMessage: 'Saved successfully.',
        ),
      );
      await _hold(tester);
      withSemanticsHandle(tester, () {
        expect(inputFeedbackHasLiveRegion(tester), isTrue);
      });
    });

    testWidgets('[e2e] dark mode negative high attention renders',
        (tester) async {
      await pumpInputFeedbackJioHarnessSettled(
        tester,
        const OneUiInputFeedback(
          variant: OneUiInputFeedbackVariant.negative,
          attention: OneUiInputFeedbackAttention.high,
          feedbackMessage: 'Critical error in dark mode',
        ),
        darkMode: true,
      );
      await _hold(tester);
      expect(inputFeedbackRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] inside Surface bold renders with remapped tokens',
        (tester) async {
      await pumpInputFeedbackJioHarnessSettled(
        tester,
        const OneUiInputFeedback(
          variant: OneUiInputFeedbackVariant.informative,
          attention: OneUiInputFeedbackAttention.medium,
          feedbackMessage: 'Tip on bold surface',
        ),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await _hold(tester);
      expect(inputFeedbackRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] sizes render at distinct payload keys', (tester) async {
      final keys = <String, String>{};
      for (final size in OneUiInputFeedbackSize.values) {
        await pumpInputFeedbackJioHarnessSettled(
          tester,
          OneUiInputFeedback(
            size: size,
            feedbackMessage: 'Size ${size.wireValue}',
          ),
        );
        await _hold(tester, _demoMode ? 300 : 0);
        keys[size.wireValue] = inputFeedbackProbedPayloadKey(tester);
      }
      expect(keys['s'], isNot(keys['m']));
      expect(keys['m'], isNot(keys['l']));
    });
  });
}
