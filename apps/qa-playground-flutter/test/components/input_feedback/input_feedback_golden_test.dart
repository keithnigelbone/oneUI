/// InputFeedback visual-regression tests — light mode.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import '../../support/components/input_feedback_harness.dart';

const _kVariants = kOneUiInputFeedbackFigmaVariants;
const _kAttentions = kOneUiInputFeedbackFigmaAttentions;
const _kSizes = kOneUiInputFeedbackFigmaSizes;

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputFeedbackIconsLoaded();
  });

  group('[golden] InputFeedback — variant × attention (size m)', () {
    for (final variantWire in _kVariants) {
      for (final attWire in _kAttentions) {
        testWidgets('$variantWire / $attWire', (tester) async {
          await pumpInputFeedbackJioHarnessSettled(
            tester,
            OneUiInputFeedback(
              variant: inputFeedbackVariantFromWire(variantWire),
              attention: inputFeedbackAttentionFromWire(attWire),
              feedbackMessage: 'Feedback message',
            ),
          );
          await expectLater(
            inputFeedbackRootFinder(),
            matchesGoldenFile(
              'goldens/input_feedback_${variantWire}_${attWire}_m.png',
            ),
          );
        });
      }
    }
  });

  group('[golden] InputFeedback — size (negative / low)', () {
    for (final sizeWire in _kSizes) {
      testWidgets('size=$sizeWire', (tester) async {
        await pumpInputFeedbackJioHarnessSettled(
          tester,
          OneUiInputFeedback(
            size: inputFeedbackSizeFromWire(sizeWire),
            feedbackMessage: 'Size $sizeWire feedback',
          ),
        );
        await expectLater(
          inputFeedbackRootFinder(),
          matchesGoldenFile(
              'goldens/input_feedback_size_${sizeWire}_negative_low.png'),
        );
      });
    }
  });

  group('[golden] InputFeedback — custom icon', () {
    testWidgets('customIcon lock override', (tester) async {
      await pumpInputFeedbackJioHarnessSettled(
        tester,
        const OneUiInputFeedback(
          feedbackMessage: 'Using a custom icon',
          customIcon: OneUiIcon(
            icon: 'lock',
            size: '4',
            excludeFromSemantics: true,
          ),
        ),
      );
      await expectLater(
        inputFeedbackRootFinder(),
        matchesGoldenFile('goldens/input_feedback_custom_icon.png'),
      );
    });
  });
}
