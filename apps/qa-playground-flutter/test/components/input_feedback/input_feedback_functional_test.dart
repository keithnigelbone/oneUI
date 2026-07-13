/// InputFeedback functional QA tests — Figma matrix smoke + real rendered probes.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import '../../support/components/input_feedback_harness.dart';

void main() {
  setUpAll(() async {
    await ensureInputFeedbackIconsLoaded();
  });

  group('[smoke] InputFeedback', () {
    testWidgetsAllPlatforms('[smoke] renders message', (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(feedbackMessage: 'This field is required.'),
      );
      expect(find.text('This field is required.'), findsOneWidget);
    });
  });

  group('[functional] InputFeedback', () {
    testWidgetsAllPlatforms('[fn] testId attaches ValueKey', (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          testId: 'qa-feedback',
          feedbackMessage: 'Error',
        ),
      );
      expect(find.byKey(const ValueKey('qa-feedback')), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] empty message renders nothing',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(feedbackMessage: ''),
      );
      // PROBED: build returns SizedBox.shrink — no icon, message, or chrome.
      expect(inputFeedbackIsRendered(tester), isFalse);
      expect(inputFeedbackIconFinder(), findsNothing);
    });

    testWidgetsAllPlatforms(
        '[fn] data payload key encodes size variant attention', (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          size: OneUiInputFeedbackSize.l,
          variant: OneUiInputFeedbackVariant.warning,
          attention: OneUiInputFeedbackAttention.high,
          feedbackMessage: 'Warning',
        ),
      );
      expect(
        inputFeedbackProbedPayloadKey(tester),
        'oneui-input-feedback|data-size=12|data-variant=warning|data-attention=high',
      );
    });

    for (final variant in OneUiInputFeedbackVariant.values) {
      testWidgetsAllPlatforms(
          '[fn] variant=${variant.wireValue} renders default icon',
          (tester) async {
        await pumpInputFeedbackQaHarness(
          tester,
          OneUiInputFeedback(
            variant: variant,
            feedbackMessage: 'Probe ${variant.wireValue}',
          ),
        );
        final icon = tester.widget<OneUiIcon>(inputFeedbackIconFinder());
        // PROBED: defaultIconName from one_ui_input_feedback_types.dart.
        expect(icon.icon, variant.defaultIconName);
      });
    }

    testWidgetsAllPlatforms('[fn] customIcon overrides default icon widget',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          feedbackMessage: 'Locked field',
          customIcon: OneUiIcon(
            icon: 'lock',
            size: '4',
            excludeFromSemantics: true,
          ),
        ),
      );
      final icon = tester.widget<OneUiIcon>(inputFeedbackIconFinder());
      expect(icon.icon, 'lock');
    });

    testWidgetsAllPlatforms(
        '[fn] child Text supplies message when feedbackMessage null',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(child: Text('From child slot')),
      );
      expect(find.text('From child slot'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] medium attention uses tinted background',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          variant: OneUiInputFeedbackVariant.informative,
          attention: OneUiInputFeedbackAttention.medium,
          feedbackMessage: 'Medium attention',
        ),
      );
      // PROBED: medium/high attention fills are non-transparent vs low.
      expect(inputFeedbackBackgroundColor(tester), isNot(Colors.transparent));
    });
  });
}
