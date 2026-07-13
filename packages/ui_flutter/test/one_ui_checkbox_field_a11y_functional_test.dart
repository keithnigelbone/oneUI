/// CheckboxField accessibility + functional parity — web `CheckboxField.test.tsx`,
/// RN `CheckboxFieldA11y.test.ts`, Flutter web + mobile.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import 'checkbox_test_harness.dart';

void main() {
  group('oneUiCheckboxField semantics ids — web aria id composition', () {
    test('custom field id suffixes', () {
      expect(
        oneUiCheckboxFieldHeadingSemanticsId('my-field', hasHeading: true),
        'my-field-heading',
      );
      expect(
        oneUiCheckboxFieldDescriptionSemanticsId('my-field',
            hasDescription: true),
        'my-field-desc',
      );
      expect(
        oneUiCheckboxFieldFeedbackSemanticsId('my-field', hasFeedback: true),
        'my-field-feedback',
      );
      expect(
        oneUiCheckboxFieldDynamicTextSemanticsId('my-field',
            hasDynamicRow: true),
        'my-field-dynamic',
      );
    });

    test('returns null when section absent', () {
      expect(oneUiCheckboxFieldHeadingSemanticsId('id', hasHeading: false),
          isNull);
      expect(
        oneUiCheckboxFieldDescriptionSemanticsId('id', hasDescription: false),
        isNull,
      );
      expect(oneUiCheckboxFieldFeedbackSemanticsId('id', hasFeedback: false),
          isNull);
      expect(
        oneUiCheckboxFieldDynamicTextSemanticsId('id', hasDynamicRow: false),
        isNull,
      );
    });

    test('uses stable defaults when field id omitted', () {
      expect(oneUiCheckboxFieldHeadingSemanticsId(null, hasHeading: true),
          'oneui-checkboxfield-heading');
      expect(
        oneUiCheckboxFieldDescriptionSemanticsId(null, hasDescription: true),
        'oneui-checkboxfield-desc',
      );
    });
  });

  group('resolveOneUiCheckboxFieldAccessibility — RN CheckboxFieldA11y', () {
    test('exposes field label as accessibilityLabel', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'Notification channels',
      );
      expect(a11y.accessibilityLabel, 'Notification channels');
      expect(a11y.hideSubtree, isFalse);
    });

    test('prefers ariaLabel over visible label', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'Visible',
        ariaLabel: 'Override',
      );
      expect(a11y.accessibilityLabel, 'Override');
    });

    test('forwards ariaDescribedBy as callerAriaDescribedBy', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'L',
        ariaDescribedBy: 'help-id',
      );
      expect(a11y.callerAriaDescribedBy, 'help-id');
    });

    test('hides subtree when ariaHidden=true', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'L',
        ariaHidden: true,
      );
      expect(a11y.hideSubtree, isTrue);
      expect(a11y.accessibilityLabel, isNull);
    });

    test('passes accessibilityHint through unchanged', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'L',
        accessibilityHint: 'Choose one',
      );
      expect(a11y.accessibilityHint, 'Choose one');
    });

    test('marks disabled on field shell', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'L',
        disabled: true,
      );
      expect(a11y.disabled, isTrue);
    });
  });

  group('resolveOneUiCheckboxFieldState — RN useCheckboxFieldState', () {
    test('isInvalid from invalid prop', () {
      final state = resolveOneUiCheckboxFieldState(
        invalid: true,
        flattenedChildren: const [],
      );
      expect(state.isInvalid, isTrue);
      expect(state.fieldErrorOnlyRow, isTrue);
      expect(state.hasFeedback, isTrue);
    });

    test('isInvalid from ariaInvalid prop', () {
      final state = resolveOneUiCheckboxFieldState(
        ariaInvalid: true,
        flattenedChildren: const [],
      );
      expect(state.isInvalid, isTrue);
      expect(state.fieldErrorOnlyRow, isFalse);
    });

    test('fieldErrorOnlyRow false when error string present', () {
      final state = resolveOneUiCheckboxFieldState(
        invalid: true,
        error: 'Required',
        flattenedChildren: const [],
      );
      expect(state.isInvalid, isTrue);
      expect(state.fieldErrorOnlyRow, isFalse);
      expect(state.hasFeedback, isTrue);
    });

    test('isInvalid false when error is whitespace-only', () {
      final state = resolveOneUiCheckboxFieldState(
        error: '   ',
        flattenedChildren: const [],
      );
      expect(state.isInvalid, isFalse);
    });

    test('isDisabled mirrors disabled prop', () {
      expect(
        resolveOneUiCheckboxFieldState(
            disabled: true, flattenedChildren: const []).isDisabled,
        isTrue,
      );
      expect(
        resolveOneUiCheckboxFieldState(
            disabled: false, flattenedChildren: const []).isDisabled,
        isFalse,
      );
    });

    test('useFieldsetLegend when multi + label', () {
      final state = resolveOneUiCheckboxFieldState(
        label: 'Pick',
        flattenedChildren: [OneUiCheckbox(value: 'a', label: 'A')],
      );
      expect(state.useFieldsetLegend, isTrue);
    });

    test('heading semantics id only for integrated single with label', () {
      final withLabel = resolveOneUiCheckboxFieldState(
        label: 'Email',
        flattenedChildren: const [],
      );
      expect(withLabel.headingSemanticsId, isNotNull);

      final noLabel = resolveOneUiCheckboxFieldState(
        description: 'Help copy',
        flattenedChildren: const [],
      );
      expect(noLabel.headingSemanticsId, isNull);
      expect(noLabel.descriptionSemanticsId, isNotNull);
    });

    test('isInvalid false when neither invalid nor error provided — RN', () {
      final state = resolveOneUiCheckboxFieldState(flattenedChildren: const []);
      expect(state.isInvalid, isFalse);
    });

    test('isInvalid true when error string is non-empty — RN', () {
      final state = resolveOneUiCheckboxFieldState(
        error: 'Something went wrong',
        flattenedChildren: const [],
      );
      expect(state.isInvalid, isTrue);
    });

    test('multiOptionMode when children present — RN isMultiMode', () {
      expect(
        resolveOneUiCheckboxFieldState(
          flattenedChildren: [OneUiCheckbox(value: 'a', label: 'A')],
        ).multiOptionMode,
        isTrue,
      );
      expect(
        resolveOneUiCheckboxFieldState(flattenedChildren: const [])
            .multiOptionMode,
        isFalse,
      );
    });

    test('hasDynamicRow from helperButton alone', () {
      final state = resolveOneUiCheckboxFieldState(
        helperButton: 'Learn more',
        flattenedChildren: const [],
      );
      expect(state.hasDynamicRow, isTrue);
      expect(state.dynamicTextSemanticsId, isNotNull);
    });

    test('appearance auto resolves to secondary', () {
      final state = resolveOneUiCheckboxFieldState(
        appearance: 'auto',
        flattenedChildren: const [],
      );
      expect(state.resolvedAppearance, 'secondary');
    });
  });

  group('flattenCheckboxFieldChildren — web flattenFieldChildren', () {
    test('unwraps Row of checkboxes', () {
      final flat = flattenCheckboxFieldChildren([
        Row(
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
            OneUiCheckbox(value: 'b', label: 'B'),
          ],
        ),
      ]);
      expect(flat.length, 2);
    });

    test('unwraps Padding wrapper', () {
      final flat = flattenCheckboxFieldChildren([
        Padding(
          padding: const EdgeInsets.all(8),
          child: OneUiCheckbox(value: 'a', label: 'A'),
        ),
      ]);
      expect(flat.length, 1);
      expect(flat.single, isA<OneUiCheckbox>());
    });
  });

  group('resolveOneUiCheckboxFieldGroupDescribedBy', () {
    test('composes auto-linked description and feedback ids', () {
      final describedBy = resolveOneUiCheckboxFieldGroupDescribedBy(
        descriptionSemanticsId: 'oneui-checkboxfield-desc',
        feedbackSemanticsId: 'oneui-checkboxfield-feedback',
      );
      expect(describedBy, contains('oneui-checkboxfield-desc'));
      expect(describedBy, contains('oneui-checkboxfield-feedback'));
    });
  });

  group('checkboxFieldSizeToInputNumeric — RN parity', () {
    test('maps legacy aliases', () {
      expect(checkboxFieldSizeToInputNumeric('small'), 8);
      expect(checkboxFieldSizeToInputNumeric('medium'), 10);
      expect(checkboxFieldSizeToInputNumeric('large'), 12);
    });

    test('defaults to 10 when size omitted', () {
      expect(checkboxFieldSizeToInputNumeric(null), 10);
    });
  });

  group('enhanceCheckboxFieldOptions — web enhanceCheckboxOptions', () {
    test('inherits field disabled and invalid onto children', () {
      final enhanced = enhanceCheckboxFieldOptions(
        [OneUiCheckbox(value: 'a', label: 'Alpha')],
        disabled: true,
        readOnly: false,
        size: 'm',
        appearance: 'secondary',
        invalid: true,
      );
      expect(enhanced.single, isA<OneUiCheckbox>());
      final box = enhanced.single as OneUiCheckbox;
      expect(box.disabled, isTrue);
      expect(box.errorHighlight, isTrue);
      expect(box.ariaInvalid, isTrue);
    });

    test('inherits field appearance when child appearance is auto', () {
      final enhanced = enhanceCheckboxFieldOptions(
        [OneUiCheckbox(value: 'a', label: 'A', appearance: 'auto')],
        disabled: false,
        readOnly: false,
        size: 'm',
        appearance: 'sparkle',
        invalid: false,
      );
      expect((enhanced.single as OneUiCheckbox).appearance, 'sparkle');
    });

    test('preserves explicit child ariaInvalid over field invalid', () {
      final enhanced = enhanceCheckboxFieldOptions(
        [OneUiCheckbox(value: 'a', label: 'A', ariaInvalid: false)],
        disabled: false,
        readOnly: false,
        size: 'm',
        appearance: 'secondary',
        invalid: true,
      );
      expect((enhanced.single as OneUiCheckbox).ariaInvalid, isFalse);
    });

    test('forwards fieldRequired when child required is false', () {
      final enhanced = enhanceCheckboxFieldOptions(
        [OneUiCheckbox(value: 'a', label: 'A')],
        disabled: false,
        readOnly: false,
        size: 'm',
        appearance: 'secondary',
        invalid: false,
        fieldRequired: true,
      );
      expect((enhanced.single as OneUiCheckbox).required, isTrue);
    });
  });

  group('OneUiCheckboxField functional — web CheckboxField.test.tsx', () {
    testWidgetsAllPlatforms('renders label and checkbox', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(label: 'Accept'),
      );
      expect(find.text('Accept'), findsOneWidget);
      expect(find.byType(OneUiCheckbox), findsOneWidget);
    });

    testWidgetsAllPlatforms('calls onCheckedChange on tap — React',
        (tester) async {
      var calls = 0;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Toggle',
          onCheckedChange: (_) => calls++,
        ),
      );
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(calls, 1);
    });

    testWidgetsAllPlatforms('onSelectedChange RN alias fires on tap',
        (tester) async {
      var calls = 0;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Toggle',
          onSelectedChange: (_) => calls++,
        ),
      );
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(calls, 1);
    });

    testWidgetsAllPlatforms('renders dynamicText string row', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'x',
          dynamicText: '0/10',
        ),
      );
      expect(find.text('0/10'), findsOneWidget);
    });

    testWidgetsAllPlatforms('does not render dynamic row when omitted',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(label: 'x'),
      );
      expect(find.text('0/10'), findsNothing);
    });

    testWidgetsAllPlatforms('renders custom feedback slot', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'x',
          feedback: OneUiInputFeedback(
            variant: OneUiInputFeedbackVariant.informative,
            attention: OneUiInputFeedbackAttention.low,
            feedbackMessage: 'Note',
          ),
        ),
      );
      expect(find.text('Note'), findsOneWidget);
    });

    testWidgetsAllPlatforms('renders dynamicTextSlot', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'x',
          dynamicTextSlot: OneUiInputDynamicText(content: '0/10'),
        ),
      );
      expect(find.text('0/10'), findsOneWidget);
    });

    testWidgetsAllPlatforms('description-only integrated beside control',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          description: 'Select all that apply.',
        ),
      );
      expect(find.text('Select all that apply.'), findsOneWidget);
      expect(find.byType(OneUiCheckbox), findsOneWidget);
    });

    testWidgetsAllPlatforms('controlled checked on integrated single',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Opt-in',
          checked: true,
        ),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxChecked(tester, 'Opt-in', checked: true);
      });
    });

    testWidgetsAllPlatforms('multi-option flattens Column children',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Pick',
          children: [
            Column(
              children: [
                OneUiCheckbox(value: 'x', label: 'X'),
                OneUiCheckbox(value: 'y', label: 'Y'),
              ],
            ),
          ],
        ),
      );
      expect(find.text('X'), findsOneWidget);
      expect(find.text('Y'), findsOneWidget);
    });

    testWidgetsAllPlatforms('group value change on multi-option',
        (tester) async {
      List<String>? next;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Topics',
          description: 'Select all that apply',
          groupDefaultValue: const ['a'],
          onGroupValueChange: (v) => next = v,
          children: [
            OneUiCheckbox(value: 'a', label: 'Alpha'),
            OneUiCheckbox(value: 'b', label: 'Beta'),
          ],
        ),
      );
      expect(find.text('Topics'), findsOneWidget);
      expect(find.text('Select all that apply'), findsOneWidget);

      await tester.tap(find.text('Beta'));
      await tester.pumpAndSettle();
      expect(next, contains('b'));
    });

    testWidgetsAllPlatforms(
        'renders label and description on multi-option field', (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Topics',
          description: 'Select all that apply',
          children: [
            OneUiCheckbox(value: 'a', label: 'Alpha'),
            OneUiCheckbox(value: 'b', label: 'Beta'),
          ],
        ),
      );
      expect(find.text('Topics'), findsOneWidget);
      expect(find.text('Select all that apply'), findsOneWidget);
      expect(find.byType(OneUiCheckbox), findsNWidgets(2));
    });

    testWidgetsAllPlatforms('invalid story renders error feedback string',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Confirm you are human',
          invalid: true,
          error: 'Please complete verification.',
        ),
      );
      expect(find.text('Please complete verification.'), findsOneWidget);
    });

    testWidgetsAllPlatforms('helperButton renders dynamic row end action',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Nickname',
          dynamicText: '0/20',
          helperButton: 'Clear',
        ),
      );
      expect(find.text('Clear'), findsOneWidget);
    });

    testWidgetsAllPlatforms('controlled groupValue on multi-option',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Pick',
          groupValue: const ['b'],
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
            OneUiCheckbox(value: 'b', label: 'B'),
          ],
        ),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxChecked(tester, 'A', checked: false);
        expectCheckboxChecked(tester, 'B', checked: true);
      });
    });

    testWidgetsAllPlatforms('indeterminate integrated single', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Partial',
          indeterminate: true,
        ),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxMixed(tester, 'Partial');
      });
    });

    testWidgetsAllPlatforms('readOnly blocks toggle but stays enabled',
        (tester) async {
      var checked = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Locked',
          readOnly: true,
          checked: checked,
          onCheckedChange: (v) => checked = v,
        ),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxReadOnlyEnabled(tester, 'Locked');
      });
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(checked, isFalse);
    });

    testWidgetsAllPlatforms('required asterisk on label', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Terms',
          required: true,
        ),
      );
      expect(find.textContaining('*'), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        'testId exposed via Semantics.identifier on integrated control',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Terms',
          testId: 'qa-checkbox-field',
        ),
      );
      expect(find.byKey(const ValueKey('qa-checkbox-field')), findsOneWidget);
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Terms');
        expect(
          data.identifier,
          'qa-checkbox-field',
          reason:
              'testId must reach the platform AT tree on the checkbox control '
              'via Semantics(identifier:).',
        );
      });
    });

    testWidgetsAllPlatforms('integrated field label tap toggles checkbox',
        (tester) async {
      var checked = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Accept terms',
          onCheckedChange: (v) => checked = v,
        ),
      );
      await tester.tap(find.text('Accept terms'));
      await tester.pumpAndSettle();
      expect(checked, isTrue);
    });

    testWidgetsAllPlatforms(
        'CB-A11Y-004 required field exposes hasRequiredState on checkbox',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Terms',
          required: true,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Terms');
        expect(data.hasFlag(SemanticsFlag.isRequired), isTrue);
      });
    });

    testWidgetsAllPlatforms('Space toggles integrated field checkbox',
        (tester) async {
      var checked = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Newsletter',
          onCheckedChange: (v) => checked = v,
        ),
      );
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(checked, isTrue);
    });

    testWidgetsAllPlatforms(
      'invalid does not change checkbox box border — web parity',
      (tester) async {
        await pumpCheckboxHarness(
          tester,
          const OneUiCheckboxField(label: 'Valid'),
        );
        final validBorder = checkboxBoxBorderColor(tester);

        await pumpCheckboxHarness(
          tester,
          const OneUiCheckboxField(
            label: 'Valid',
            invalid: true,
            error: 'Please complete verification.',
          ),
        );
        final invalidBorder = checkboxBoxBorderColor(tester);

        expect(validBorder, isNotNull);
        expect(invalidBorder, validBorder);
      },
    );
  });

  group('OneUiCheckboxField a11y — semantics tree', () {
    testWidgetsAllPlatforms('integrated checkbox exposes role=checkbox',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(label: 'Accept'),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxChecked(tester, 'Accept', checked: false);
      });
    });

    testWidgetsAllPlatforms('aria-hidden excludes field subtree',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Hidden field',
          ariaHidden: true,
        ),
      );
      withSemanticsHandle(tester, () {
        expect(checkboxFieldSemanticsLabel('Hidden field'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('multi-option renders two checkbox semantics nodes',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Options',
          children: [
            OneUiCheckbox(value: 'a', label: 'Alpha'),
            OneUiCheckbox(value: 'b', label: 'Beta'),
          ],
        ),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxChecked(tester, 'Alpha', checked: false);
        expectCheckboxChecked(tester, 'Beta', checked: false);
      });
    });

    testWidgetsAllPlatforms(
        'invalid field exposes validationResult on checkbox', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Confirm',
          invalid: true,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Confirm');
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });

    testWidgetsAllPlatforms(
        'invalid without error renders field error slot anchor',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Confirm',
          invalid: true,
          id: 'cf-invalid',
        ),
      );
      expect(
        find.byWidgetPredicate(
          (widget) =>
              widget is Semantics &&
              widget.properties.identifier == 'cf-invalid-feedback',
        ),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('ariaLabel override on integrated checkbox',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Visible',
          ariaLabel: 'Override label',
        ),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxChecked(tester, 'Override label', checked: false);
        expect(checkboxSemanticsLabel('Visible'), findsNothing);
      });
    });

    testWidgetsAllPlatforms(
        'accessibilityHint forwarded to integrated checkbox', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Accept',
          accessibilityHint: 'Double tap to toggle',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Accept');
        expect(data.label, 'Accept');
        expect(data.hint, 'Double tap to toggle');
      });
    });

    testWidgetsAllPlatforms(
        'invalid with error exposes validationResult and message',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Confirm',
          invalid: true,
          error: 'Please complete verification.',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Confirm');
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
      expect(find.text('Please complete verification.'), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        'multi-option invalid propagates to child checkboxes', (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Options',
          invalid: true,
          children: [
            OneUiCheckbox(value: 'a', label: 'Alpha'),
            OneUiCheckbox(value: 'b', label: 'Beta'),
          ],
        ),
      );
      withSemanticsHandle(tester, () {
        final alpha = checkboxSemanticsData(tester, 'Alpha');
        final beta = checkboxSemanticsData(tester, 'Beta');
        expect(alpha.validationResult, SemanticsValidationResult.invalid);
        expect(beta.validationResult, SemanticsValidationResult.invalid);
      });
    });

    testWidgetsAllPlatforms('custom id composes feedback semantics anchor',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          id: 'human-check',
          label: 'Confirm',
          error: 'Required',
        ),
      );
      expect(
        find.byWidgetPredicate(
          (widget) =>
              widget is Semantics &&
              widget.properties.identifier == 'human-check-feedback',
        ),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('disabled integrated field blocks toggle',
        (tester) async {
      var checked = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Locked',
          disabled: true,
          checked: checked,
          onCheckedChange: (v) => checked = v,
        ),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxDisabled(tester, 'Locked');
      });
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(checked, isFalse);
    });
  });
}
