/// InputFeedback accessibility QA tests — live regions, roles, aria overrides.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import '../../support/components/input_feedback_harness.dart';

void main() {
  setUpAll(() async {
    await ensureInputFeedbackIconsLoaded();
  });

  group('[a11y] InputFeedback', () {
    testWidgetsAllPlatforms('[a11y] negative feedback exposes alert role',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          feedbackMessage: 'Invalid email address.',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Invalid email address.'), findsOneWidget);
        // PROBED: alert maps assertive; Flutter forbids liveRegion + alert on one node.
        final data =
            inputFeedbackSemanticsData(tester, label: 'Invalid email address.');
        expect(data.role, SemanticsRole.alert);
        expect(inputFeedbackHasLiveRegion(tester), isFalse);
        expect(data.hasFlag(SemanticsFlag.isLiveRegion), isFalse);
      });
    });

    for (final variant in [
      OneUiInputFeedbackVariant.positive,
      OneUiInputFeedbackVariant.warning,
      OneUiInputFeedbackVariant.informative,
    ]) {
      testWidgetsAllPlatforms(
          '[a11y] ${variant.wireValue} exposes polite live region',
          (tester) async {
        const message = 'Status message';
        await pumpInputFeedbackQaHarness(
          tester,
          OneUiInputFeedback(
            variant: variant,
            feedbackMessage: message,
          ),
        );
        withSemanticsHandle(tester, () {
          final data = inputFeedbackSemanticsData(tester, label: message);
          // PROBED: status variants → polite liveRegion, not alert role.
          expect(data.role, isNot(SemanticsRole.alert));
          expect(inputFeedbackHasLiveRegion(tester), isTrue);
          expect(inputFeedbackSemanticsIsLiveRegion(tester), isTrue);
        });
      });
    }

    testWidgetsAllPlatforms('[a11y] ariaLabel overrides visible message label',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          feedbackMessage: 'Visible copy',
          ariaLabel: 'Screen reader label',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Screen reader label'), findsOneWidget);
        expect(find.bySemanticsLabel('Visible copy'), findsNothing);
      });
    });

    testWidgetsAllPlatforms(
        '[a11y] ariaHidden removes feedback from semantics tree',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          feedbackMessage: 'Hidden from AT',
          ariaHidden: true,
        ),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Hidden from AT'), findsNothing);
        expect(inputFeedbackHasLiveRegion(tester), isFalse);
      });
    });
  });
}
