/// InputFeedback visual-regression tests — Surface-context nesting.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import '../../support/components/input_feedback_harness.dart';

const _kSurfaceModes = <String>['bold', 'subtle', 'minimal', 'elevated'];
const _kAttentions = kOneUiInputFeedbackFigmaAttentions;

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputFeedbackIconsLoaded();
  });

  group('[golden][surface] InputFeedback — inside Surface(mode=X)', () {
    for (final mode in _kSurfaceModes) {
      for (final attWire in _kAttentions) {
        testWidgets('surface=$mode / attention=$attWire', (tester) async {
          await pumpInputFeedbackJioHarnessSettled(
            tester,
            OneUiInputFeedback(
              variant: OneUiInputFeedbackVariant.negative,
              attention: inputFeedbackAttentionFromWire(attWire),
              feedbackMessage: 'Surface feedback',
            ),
            surfaceMode: mode,
            surfaceAppearance: 'primary',
          );
          await expectLater(
            inputFeedbackRootFinder(),
            matchesGoldenFile(
              'goldens/surface/input_feedback_in_surface_${mode}_$attWire.png',
            ),
          );
        });
      }
    }
  });

  group('[golden][surface] InputFeedback — cross-role nesting', () {
    testWidgets('informative on secondary subtle surface', (tester) async {
      await pumpInputFeedbackJioHarnessSettled(
        tester,
        const OneUiInputFeedback(
          variant: OneUiInputFeedbackVariant.informative,
          attention: OneUiInputFeedbackAttention.medium,
          feedbackMessage: 'Cross-role tip',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        inputFeedbackRootFinder(),
        matchesGoldenFile(
          'goldens/surface/input_feedback_in_subtle_secondary_informative_medium.png',
        ),
      );
    });
  });
}
