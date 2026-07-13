/// InputFeedback Figma-parity QA suite — `[figma]`.
///
/// Exercises every Figma API value against the real widget on the synthetic
/// measurement harness (offline). Per-role COLOURS are covered by Jio goldens.
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

  group('[figma] InputFeedback — size', () {
    for (final wire in kOneUiInputFeedbackFigmaSizes) {
      testWidgetsAllPlatforms('[figma] size=$wire encodes numeric f-step',
          (tester) async {
        final size = inputFeedbackSizeFromWire(wire);
        await pumpInputFeedbackQaHarness(
          tester,
          OneUiInputFeedback(
            size: size,
            feedbackMessage: 'Size $wire',
          ),
        );
        // PROBED: ValueKey payload carries data-size=<numericStep>.
        expect(
          inputFeedbackProbedPayloadKey(tester),
          contains('data-size=${size.numericStep}'),
        );
      });
    }

    testWidgetsAllPlatforms('[figma] default size is m (f10)', (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(feedbackMessage: 'Default size'),
      );
      expect(
        inputFeedbackProbedPayloadKey(tester),
        contains('data-size=10'),
      );
    });
  });

  group('[figma] InputFeedback — attention', () {
    test('[figma] default attention is low', () {
      expect(
        resolveOneUiInputFeedbackState(feedbackMessage: 'x').resolvedAttention,
        OneUiInputFeedbackAttention.low,
      );
    });

    for (final wire in kOneUiInputFeedbackFigmaAttentions) {
      testWidgetsAllPlatforms('[figma] attention=$wire encodes data-attention',
          (tester) async {
        final attention = inputFeedbackAttentionFromWire(wire);
        await pumpInputFeedbackQaHarness(
          tester,
          OneUiInputFeedback(
            attention: attention,
            feedbackMessage: 'Attention $wire',
          ),
        );
        expect(
          inputFeedbackProbedPayloadKey(tester),
          contains('data-attention=$wire'),
        );
      });
    }

    testWidgetsAllPlatforms('[figma] low attention keeps transparent fill',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          attention: OneUiInputFeedbackAttention.low,
          feedbackMessage: 'Low',
        ),
      );
      // PROBED: DecoratedBox background is fully transparent at low attention.
      expect(inputFeedbackBackgroundColor(tester), Colors.transparent);
    });

    testWidgetsAllPlatforms('[figma] high attention uses filled background',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          variant: OneUiInputFeedbackVariant.negative,
          attention: OneUiInputFeedbackAttention.high,
          feedbackMessage: 'High',
        ),
      );
      expect(inputFeedbackBackgroundColor(tester), isNot(Colors.transparent));
    });
  });

  group('[figma] InputFeedback — variant', () {
    for (final wire in kOneUiInputFeedbackFigmaVariants) {
      testWidgetsAllPlatforms('[figma] variant=$wire encodes data-variant',
          (tester) async {
        final variant = inputFeedbackVariantFromWire(wire);
        await pumpInputFeedbackQaHarness(
          tester,
          OneUiInputFeedback(
            variant: variant,
            feedbackMessage: 'Variant $wire',
          ),
        );
        expect(
          inputFeedbackProbedPayloadKey(tester),
          contains('data-variant=$wire'),
        );
      });
    }

    for (final variant in OneUiInputFeedbackVariant.values) {
      testWidgetsAllPlatforms(
          '[figma] variant=${variant.wireValue} renders default icon',
          (tester) async {
        await pumpInputFeedbackQaHarness(
          tester,
          OneUiInputFeedback(
            variant: variant,
            feedbackMessage: 'Icon ${variant.wireValue}',
          ),
        );
        expect(inputFeedbackIconFinder(), findsOneWidget);
        final icon = tester.widget<OneUiIcon>(inputFeedbackIconFinder());
        expect(icon.icon, variant.defaultIconName);
      });
    }

    test('[figma] variant surfaceRole mapping', () {
      expect(OneUiInputFeedbackVariant.negative.surfaceRole, 'negative');
      expect(OneUiInputFeedbackVariant.positive.surfaceRole, 'positive');
      expect(OneUiInputFeedbackVariant.warning.surfaceRole, 'warning');
      expect(OneUiInputFeedbackVariant.informative.surfaceRole, 'informative');
    });
  });

  group('[figma] InputFeedback — feedbackMessage / customIcon', () {
    testWidgetsAllPlatforms('[figma] feedbackMessage renders visible copy',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(feedbackMessage: 'This field is required.'),
      );
      expect(find.text('This field is required.'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] feedback_message snake_case alias renders',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(feedback_message: 'From Figma API'),
      );
      expect(find.text('From Figma API'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] customIcon overrides default icon widget',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          feedbackMessage: 'Custom lock icon',
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

    testWidgetsAllPlatforms('[figma] customIconName builds semantic icon',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          feedbackMessage: 'Help copy',
          customIconName: 'help',
        ),
      );
      final icon = tester.widget<OneUiIcon>(inputFeedbackIconFinder());
      expect(icon.icon, 'help');
    });

    testWidgetsAllPlatforms('[figma] empty message renders nothing',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(feedbackMessage: '   '),
      );
      expect(inputFeedbackIsRendered(tester), isFalse);
      expect(inputFeedbackIconFinder(), findsNothing);
    });
  });
}
