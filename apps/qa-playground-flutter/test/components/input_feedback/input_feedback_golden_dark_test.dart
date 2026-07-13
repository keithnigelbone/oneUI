/// InputFeedback visual-regression tests — dark mode subset.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import '../../support/components/input_feedback_harness.dart';

const _kVariants = kOneUiInputFeedbackFigmaVariants;
const _kAttentions = kOneUiInputFeedbackFigmaAttentions;

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputFeedbackIconsLoaded();
  });

  group('[golden][dark] InputFeedback — variant × attention (dark)', () {
    for (final variantWire in _kVariants) {
      for (final attWire in _kAttentions) {
        testWidgets('$variantWire / $attWire (dark)', (tester) async {
          await pumpInputFeedbackJioHarnessSettled(
            tester,
            OneUiInputFeedback(
              variant: inputFeedbackVariantFromWire(variantWire),
              attention: inputFeedbackAttentionFromWire(attWire),
              feedbackMessage: 'Dark mode feedback',
            ),
            darkMode: true,
          );
          await expectLater(
            inputFeedbackRootFinder(),
            matchesGoldenFile(
              'goldens/dark/input_feedback_dark_${variantWire}_${attWire}.png',
            ),
          );
        });
      }
    }
  });
}
