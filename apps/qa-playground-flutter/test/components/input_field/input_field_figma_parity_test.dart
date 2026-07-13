/// InputField Figma-parity QA suite — `[figma]`.
///
/// Exercises every Figma InputField API value against the real widget on the
/// synthetic measurement harness. Per-role colours are covered by Jio goldens.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_field.dart';
import 'package:ui_flutter/widgets/one_ui_input_field_types.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import '../../support/components/input_field_harness.dart';

Finder inputFieldFieldErrorSlotFinder() => find.descendant(
      of: inputFieldRootFinder(),
      matching: find.byWidgetPredicate(
        (w) => w is OneUiInputFeedback && w.fieldErrorSlot,
      ),
    );

void main() {
  setUpAll(() async {
    await ensureInputIconsLoaded();
  });

  group('[figma] InputField — size', () {
    for (final sizeKey in kOneUiInputFieldFigmaSizes) {
      final numeric = resolveOneUiInputNumericSize(sizeKey);
      testWidgetsAllPlatforms(
          '[figma] size=$sizeKey → f$numeric height (S-360 touch clamp)',
          (tester) async {
        await pumpInputFieldQaHarness(
          tester,
          OneUiInputField(
            label: 'Field',
            size: sizeKey,
            placeholder: sizeKey,
          ),
        );
        // PROBED: inner OneUiInput shell minHeight — token f-step, clamped to 44px on S-360.
        expect(
          inputFieldShellHeightPx(tester),
          expectedInputShellHeightPx(numeric),
        );
      });
    }

    testWidgetsAllPlatforms(
        '[figma] unset size defaults to m (f10, S-360 touch clamp)',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Default', placeholder: 'x'),
      );
      expect(
        inputFieldShellHeightPx(tester),
        expectedInputShellHeightPx(resolveOneUiInputNumericSize('m')),
      );
    });

    testWidgetsAllPlatforms(
        '[figma] sizes non-decreasing s ≤ m ≤ l with l > s on touch clamp',
        (tester) async {
      final px = <String, double>{};
      for (final s in kOneUiInputFieldFigmaSizes) {
        await pumpInputFieldQaHarness(
          tester,
          OneUiInputField(label: s, size: s, placeholder: s),
        );
        px[s] = inputFieldShellHeightPx(tester);
      }
      expect(px['s']!, lessThanOrEqualTo(px['m']!));
      expect(px['m']!, lessThanOrEqualTo(px['l']!));
      expect(px['l']!, greaterThan(px['s']!));
    });
  });

  group('[figma] InputField — label', () {
    testWidgetsAllPlatforms('[figma] label=true renders visible label text',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Email', placeholder: 'you@example.com'),
      );
      expect(inputFieldLabelFinder('Email'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] label=false still renders inner input',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(ariaLabel: 'Standalone', placeholder: 'x'),
      );
      expect(inputFieldInnerInputFinder(), findsOneWidget);
      expect(inputFieldLabelFinder('Email'), findsNothing);
    });
  });

  group('[figma] InputField — required', () {
    testWidgetsAllPlatforms('[figma] required=true renders asterisk on label',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Name', required: true),
      );
      expect(inputFieldHasRequiredAsterisk(tester), isTrue);
    });

    testWidgetsAllPlatforms('[figma] required=false renders no asterisk',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Name', required: false),
      );
      expect(inputFieldHasRequiredAsterisk(tester), isFalse);
    });

    testWidgetsAllPlatforms('[figma] required without label drops asterisk',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(required: true, description: 'no label'),
      );
      expect(inputFieldHasRequiredAsterisk(tester), isFalse);
    });
  });

  group('[figma] InputField — infoIcon', () {
    testWidgetsAllPlatforms(
        '[figma] infoIcon=true with label renders info button', (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Password', infoIcon: true),
      );
      expect(inputFieldHasInfoIcon(tester), isTrue);
    });

    testWidgetsAllPlatforms('[figma] infoIcon=false renders no info button',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Password', infoIcon: false),
      );
      expect(inputFieldHasInfoIcon(tester), isFalse);
    });

    testWidgetsAllPlatforms('[figma] infoIcon without label is gated off',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(infoIcon: true, description: 'no label'),
      );
      expect(inputFieldHasInfoIcon(tester), isFalse,
          reason: 'hasInfoIcon = infoIcon && hasLabel && labelSlot == null');
    });

    testWidgetsAllPlatforms(
        '[figma] infoIcon gated when labelSlot replaces label', (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'Ignored',
          infoIcon: true,
          labelSlot: Text('Custom label'),
        ),
      );
      expect(inputFieldHasInfoIcon(tester), isFalse,
          reason: 'labelSlot != null → resolver hasInfoIcon=false');
    });
  });

  group('[figma] InputField — description', () {
    testWidgetsAllPlatforms('[figma] description=true renders helper copy',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'Password',
          description: 'At least 8 characters.',
        ),
      );
      expect(inputFieldDescriptionFinder('At least 8 characters.'),
          findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] description=false renders no helper copy',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Password'),
      );
      expect(find.text('At least 8 characters.'), findsNothing);
    });
  });

  group('[figma] InputField — feedback', () {
    testWidgetsAllPlatforms('[figma] error string renders InputFeedback row',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Email', error: 'Invalid email'),
      );
      expect(inputFieldFeedbackFinder(), findsOneWidget);
      expect(find.text('Invalid email'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] custom feedback slot renders',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'Field',
          feedback: OneUiInputFeedback(feedbackMessage: 'Custom feedback'),
        ),
      );
      expect(find.text('Custom feedback'), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        '[figma] valid field renders hidden fieldErrorSlot anchor (web parity)',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Clean', id: 'clean'),
      );
      expect(inputFieldFieldErrorSlotFinder(), findsOneWidget);
      expect(find.text('Clean'), findsOneWidget);
    });
  });

  group('[figma] InputField — dynamicText', () {
    testWidgetsAllPlatforms('[figma] dynamicText=true renders dynamic row',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'Bio',
          dynamicText: '0 / 140',
        ),
      );
      expect(inputFieldDynamicTextFinder(), findsOneWidget);
      expect(find.text('0 / 140'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] helperButton renders trailing button copy',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'Code',
          helperButton: 'Send code',
        ),
      );
      expect(find.text('Send code'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] dynamicText=false renders no dynamic row',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Plain'),
      );
      expect(inputFieldDynamicTextFinder(), findsNothing);
    });
  });

  group('[figma] InputField — disabled', () {
    testWidgetsAllPlatforms('[figma] disabled cascades to inner TextField',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Locked', value: 'x', disabled: true),
      );
      final field = find.descendant(
        of: inputFieldRootFinder(),
        matching: find.byType(TextField),
      );
      expect(tester.widget<TextField>(field).enabled, isFalse);
    });
  });

  group('[figma] InputField — gating rules (resolveOneUiInputFieldState)', () {
    test('[figma] isInvalid = invalid || ariaInvalid || error != empty', () {
      expect(
        resolveOneUiInputFieldState(invalid: true).isInvalid,
        isTrue,
      );
      expect(
        resolveOneUiInputFieldState(ariaInvalid: true).isInvalid,
        isTrue,
      );
      expect(
        resolveOneUiInputFieldState(error: 'bad').isInvalid,
        isTrue,
      );
      expect(
        resolveOneUiInputFieldState().isInvalid,
        isFalse,
      );
    });

    test(
        '[figma] hasFeedback = error || feedback || fieldErrorOnlyRow (web parity)',
        () {
      expect(
        resolveOneUiInputFieldState(error: 'x').hasFeedback,
        isTrue,
      );
      expect(
        resolveOneUiInputFieldState(feedback: const SizedBox()).hasFeedback,
        isTrue,
      );
      expect(resolveOneUiInputFieldState().hasFeedback, isTrue);
      expect(resolveOneUiInputFieldState().fieldErrorOnlyRow, isTrue);
    });

    testWidgetsAllPlatforms(
        '[figma] invalid/error drives inner validationResult', (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Email', error: 'Required', id: 'email'),
      );
      withSemanticsHandle(tester, () {
        final data = inputFieldControlSemanticsData(tester);
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });
  });

  group('[figma] InputField — nested Input props forwarded', () {
    testWidgetsAllPlatforms('[figma] appearance=primary renders inner input',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'Search',
          appearance: OneUiInputAppearance.primary,
          placeholder: 'Search',
        ),
      );
      expect(inputFieldInnerInputFinder(), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] shape=pill on inner input',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'Pill',
          shape: OneUiInputShape.pill,
          placeholder: 'x',
        ),
      );
      final radius = inputShellDecoration(
        tester,
        within: inputFieldInnerInputFinder(),
      ).borderRadius as BorderRadius?;
      expect(radius?.topLeft.x, greaterThan(100));
    });
  });
}
