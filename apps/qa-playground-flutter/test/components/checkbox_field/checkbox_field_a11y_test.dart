/// CheckboxField accessibility QA tests — RN `CheckboxField.test.tsx` a11y +
/// `CheckboxFieldA11y.test.ts` + `one_ui_checkbox_field_a11y_functional_test.dart`.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field_types.dart';

import '../../support/components/checkbox_field_harness.dart';

void main() {
  group('[a11y] oneUiCheckboxField semantics ids — web aria id composition', () {
    test('[a11y] custom field id suffixes', () {
      expect(
        oneUiCheckboxFieldHeadingSemanticsId('my-field', hasHeading: true),
        'my-field-heading',
      );
      expect(
        oneUiCheckboxFieldDescriptionSemanticsId('my-field', hasDescription: true),
        'my-field-desc',
      );
      expect(
        oneUiCheckboxFieldFeedbackSemanticsId('my-field', hasFeedback: true),
        'my-field-feedback',
      );
      expect(
        oneUiCheckboxFieldDynamicTextSemanticsId('my-field', hasDynamicRow: true),
        'my-field-dynamic',
      );
    });

    test('[a11y] returns null when section absent', () {
      expect(oneUiCheckboxFieldHeadingSemanticsId('id', hasHeading: false), isNull);
      expect(
        oneUiCheckboxFieldDescriptionSemanticsId('id', hasDescription: false),
        isNull,
      );
      expect(oneUiCheckboxFieldFeedbackSemanticsId('id', hasFeedback: false), isNull);
      expect(
        oneUiCheckboxFieldDynamicTextSemanticsId('id', hasDynamicRow: false),
        isNull,
      );
    });

    test('[a11y] uses stable defaults when field id omitted', () {
      expect(
        oneUiCheckboxFieldHeadingSemanticsId(null, hasHeading: true),
        'oneui-checkboxfield-heading',
      );
      expect(
        oneUiCheckboxFieldDescriptionSemanticsId(null, hasDescription: true),
        'oneui-checkboxfield-desc',
      );
    });
  });

  group('[a11y] resolveOneUiCheckboxFieldAccessibility — RN CheckboxFieldA11y', () {
    test('[a11y] exposes field label as accessibilityLabel', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'Notification channels',
      );
      expect(a11y.accessibilityLabel, 'Notification channels');
      expect(a11y.hideSubtree, isFalse);
    });

    test('[a11y] prefers ariaLabel over visible label', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'Visible',
        ariaLabel: 'Override',
      );
      expect(a11y.accessibilityLabel, 'Override');
    });

    test('[a11y] forwards ariaDescribedBy as callerAriaDescribedBy', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'L',
        ariaDescribedBy: 'help-id',
      );
      expect(a11y.callerAriaDescribedBy, 'help-id');
    });

    test('[a11y] hides subtree when ariaHidden=true', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'L',
        ariaHidden: true,
      );
      expect(a11y.hideSubtree, isTrue);
      expect(a11y.accessibilityLabel, isNull);
    });

    test('[a11y] passes accessibilityHint through unchanged', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'L',
        accessibilityHint: 'Choose one',
      );
      expect(a11y.accessibilityHint, 'Choose one');
    });

    test('[a11y] marks disabled on field shell', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'L',
        disabled: true,
      );
      expect(a11y.disabled, isTrue);
    });
  });

  group('[a11y] resolveOneUiCheckboxFieldState — RN useCheckboxFieldState', () {
    test('[a11y] isInvalid from invalid prop', () {
      final state = resolveOneUiCheckboxFieldState(
        invalid: true,
        flattenedChildren: const [],
      );
      expect(state.isInvalid, isTrue);
      expect(state.fieldErrorOnlyRow, isTrue);
      expect(state.hasFeedback, isTrue);
    });

    test('[a11y] isInvalid from ariaInvalid prop', () {
      final state = resolveOneUiCheckboxFieldState(
        ariaInvalid: true,
        flattenedChildren: const [],
      );
      expect(state.isInvalid, isTrue);
      expect(state.fieldErrorOnlyRow, isFalse);
    });

    test('[a11y] fieldErrorOnlyRow false when error string present', () {
      final state = resolveOneUiCheckboxFieldState(
        invalid: true,
        error: 'Required',
        flattenedChildren: const [],
      );
      expect(state.isInvalid, isTrue);
      expect(state.fieldErrorOnlyRow, isFalse);
      expect(state.hasFeedback, isTrue);
    });

    test('[a11y] isInvalid false when error is whitespace-only', () {
      final state = resolveOneUiCheckboxFieldState(
        error: '   ',
        flattenedChildren: const [],
      );
      expect(state.isInvalid, isFalse);
    });

    test('[a11y] isDisabled mirrors disabled prop', () {
      expect(
        resolveOneUiCheckboxFieldState(disabled: true, flattenedChildren: const []).isDisabled,
        isTrue,
      );
      expect(
        resolveOneUiCheckboxFieldState(disabled: false, flattenedChildren: const []).isDisabled,
        isFalse,
      );
    });

    test('[a11y] useFieldsetLegend when multi + label', () {
      final state = resolveOneUiCheckboxFieldState(
        label: 'Pick',
        flattenedChildren: [OneUiCheckbox(value: 'a', label: 'A')],
      );
      expect(state.useFieldsetLegend, isTrue);
    });

    test('[a11y] heading semantics id only for integrated single with label', () {
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

    test('[a11y] multiOptionMode when children present', () {
      expect(
        resolveOneUiCheckboxFieldState(
          flattenedChildren: [OneUiCheckbox(value: 'a', label: 'A')],
        ).multiOptionMode,
        isTrue,
      );
      expect(
        resolveOneUiCheckboxFieldState(flattenedChildren: const []).multiOptionMode,
        isFalse,
      );
    });

    test('[a11y] hasDynamicRow from helperButton alone', () {
      final state = resolveOneUiCheckboxFieldState(
        helperButton: 'Learn more',
        flattenedChildren: const [],
      );
      expect(state.hasDynamicRow, isTrue);
      expect(state.dynamicTextSemanticsId, isNotNull);
    });

    test('[a11y] appearance auto resolves to secondary', () {
      final state = resolveOneUiCheckboxFieldState(
        appearance: 'auto',
        flattenedChildren: const [],
      );
      expect(state.resolvedAppearance, 'secondary');
    });
  });

  group('[a11y] resolveOneUiCheckboxFieldGroupDescribedBy', () {
    test('[a11y] composes auto-linked description and feedback ids', () {
      final describedBy = resolveOneUiCheckboxFieldGroupDescribedBy(
        descriptionSemanticsId: 'oneui-checkboxfield-desc',
        feedbackSemanticsId: 'oneui-checkboxfield-feedback',
      );
      expect(describedBy, contains('oneui-checkboxfield-desc'));
      expect(describedBy, contains('oneui-checkboxfield-feedback'));
    });
  });

  group('[a11y] enhanceCheckboxFieldOptions — web enhanceCheckboxOptions', () {
    test('[a11y] inherits field disabled and invalid onto children', () {
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

    test('[a11y] inherits field appearance when child appearance is auto', () {
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
  });

  group('[a11y] CheckboxField widget — semantics tree', () {
    testWidgetsAllPlatforms('[a11y] integrated checkbox exposes role=checkbox', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Accept'),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxChecked(tester, 'Accept', checked: false);
      });
    });

    testWidgetsAllPlatforms('[a11y] description renders helper copy', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Terms',
          description: 'Required to continue.',
          children: [
            OneUiCheckbox(value: 'on', label: 'Accept'),
          ],
        ),
      );
      expect(find.text('Required to continue.'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[a11y] aria-hidden excludes field subtree', (tester) async {
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] multi-option renders two checkbox semantics nodes', (tester) async {
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] invalid field exposes validationResult on checkbox', (tester) async {
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] ariaLabel override on integrated checkbox', (tester) async {
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] accessibilityHint forwarded to integrated checkbox', (tester) async {
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] invalid with error exposes validationResult and message', (tester) async {
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] multi-option invalid propagates to child checkboxes', (tester) async {
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] disabled integrated field blocks toggle', (tester) async {
      var checked = false;
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] custom id composes feedback semantics anchor', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(
          id: 'human-check',
          label: 'Confirm',
          error: 'Required',
        ),
      );
      expect(fieldFeedbackSemanticsAnchor('human-check'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[a11y] invalid without error renders field error slot anchor', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Confirm',
          invalid: true,
          id: 'cf-invalid',
        ),
      );
      expect(fieldFeedbackSemanticsAnchor('cf-invalid'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[a11y] integrated field label becomes accessible name on checkbox', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Accept terms', testId: 'a11y-label'),
      );
      expect(find.byKey(const ValueKey('a11y-label')), findsOneWidget);
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Accept terms');
        expect(data.label, 'Accept terms');
      });
    });

    testWidgetsAllPlatforms('[a11y] ariaLabel overrides label as accessible name', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Accept',
          ariaLabel: 'Custom',
          testId: 'a11y-override',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Custom');
        expect(data.label, 'Custom');
        expect(checkboxSemanticsLabel('Accept'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('[a11y] multi mode field container exposes label semantics', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Select',
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
            OneUiCheckbox(value: 'b', label: 'B'),
          ],
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxFieldMultiContainerSemantics(tester, 'Select');
        expect(data.label, 'Select');
        expect(data.hasFlag(SemanticsFlag.isHeader), isFalse);
      });
    });

    testWidgetsAllPlatforms('[a11y] multi mode field container disabled when field disabled', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Select',
          disabled: true,
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
          ],
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxFieldMultiContainerSemantics(tester, 'Select');
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      });
    });

    testWidgetsAllPlatforms('[a11y] multi mode all child Checkboxes expose checkbox role', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Select',
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
            OneUiCheckbox(value: 'b', label: 'B'),
            OneUiCheckbox(value: 'c', label: 'C'),
          ],
        ),
      );
      withSemanticsHandle(tester, () {
        expect(countCheckboxRoleSemantics(tester), 3);
      });
    });

    testWidgetsAllPlatforms('[a11y] accessibilityHint forwarded on multi mode field container', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Select',
          accessibilityHint: 'Select your preferences',
          children: [OneUiCheckbox(value: 'a', label: 'A')],
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxFieldMultiContainerSemantics(tester, 'Select');
        expect(data.hint, 'Select your preferences');
      });
    });
  });
}
