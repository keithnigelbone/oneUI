import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_aria_described_by.dart';
import 'package:ui_flutter/widgets/one_ui_input_field_a11y.dart';

void main() {
  group('composeOneUiAriaDescribedBy', () {
    test('returns null when empty', () {
      expect(composeOneUiAriaDescribedBy(), isNull);
    });

    test('caller ids precede auto-linked ids', () {
      expect(
        composeOneUiAriaDescribedBy(
          callerAriaDescribedBy: 'custom help-id',
          autoLinkedIds: ['email-feedback', 'email-description'],
        ),
        'custom help-id email-feedback email-description',
      );
    });

    test('dedupes overlapping tokens', () {
      expect(
        composeOneUiAriaDescribedBy(
          callerAriaDescribedBy: 'email-feedback extra',
          autoLinkedIds: ['email-feedback', 'email-dynamic'],
        ),
        'email-feedback extra email-dynamic',
      );
    });
  });

  group('field semantics id helpers', () {
    test('requires non-empty field id', () {
      expect(
        oneUiInputFieldFeedbackSemanticsId('email', hasFeedback: true),
        'email-feedback',
      );
      expect(oneUiInputFieldFeedbackSemanticsId('', hasFeedback: true), isNull);
      expect(oneUiInputFieldFeedbackSemanticsId('email', hasFeedback: false),
          isNull);
    });
  });

  group('resolveOneUiInputFieldDescribedBy', () {
    test('merges caller + field-owned targets', () {
      expect(
        resolveOneUiInputFieldDescribedBy(
          callerAriaDescribedBy: 'external',
          descriptionSemanticsId: 'f-description',
          feedbackSemanticsId: 'f-feedback',
          dynamicTextSemanticsId: 'f-dynamic',
        ),
        'external f-description f-feedback f-dynamic',
      );
    });
  });
}
