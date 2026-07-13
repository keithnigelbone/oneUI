/// InputField functionality + a11y — parity with
/// `InputFieldA11y.test.ts` and `Input.test.tsx` (InputField describe).
library;

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_field.dart';
import 'package:ui_flutter/widgets/one_ui_input_field_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_input_field_types.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import 'input_field_test_harness.dart';

void main() {
  group('resolveOneUiInputFieldState — RN useInputFieldState parity', () {
    test("defaults appearance auto to secondary", () {
      expect(resolveOneUiInputFieldState().resolvedAppearance, 'secondary');
    });

    test('passes explicit appearance', () {
      expect(
        resolveOneUiInputFieldState(appearance: OneUiInputAppearance.primary)
            .resolvedAppearance,
        'primary',
      );
    });

    test('normalises t-shirt sizes', () {
      expect(resolveOneUiInputFieldState(size: 's').numericSize, 8);
      expect(resolveOneUiInputFieldState(size: 'm').numericSize, 10);
      expect(resolveOneUiInputFieldState(size: 'l').numericSize, 12);
    });

    test('isInvalid covers invalid, aria-invalid, and error string', () {
      expect(resolveOneUiInputFieldState(invalid: true).isInvalid, isTrue);
      expect(resolveOneUiInputFieldState(ariaInvalid: true).isInvalid, isTrue);
      expect(resolveOneUiInputFieldState(error: 'Bad').isInvalid, isTrue);
      expect(resolveOneUiInputFieldState(error: '   ').isInvalid, isFalse);
    });

    test('hasInfoIcon requires infoIcon + label + no labelSlot', () {
      expect(
          resolveOneUiInputFieldState(infoIcon: true, label: 'Email')
              .hasInfoIcon,
          isTrue);
      expect(resolveOneUiInputFieldState(infoIcon: true, label: '').hasInfoIcon,
          isFalse);
      expect(
        resolveOneUiInputFieldState(
          infoIcon: true,
          label: 'Email',
          labelSlot: const Text('slot'),
        ).hasInfoIcon,
        isFalse,
      );
    });

    test('[IFD-FN-001] fieldErrorOnlyRow when valid without error or feedback',
        () {
      final state = resolveOneUiInputFieldState(label: 'Email');
      expect(state.isInvalid, isFalse);
      expect(state.fieldErrorOnlyRow, isTrue);
      expect(state.hasFeedback, isTrue);
    });

    test('fieldErrorOnlyRow false when error string or custom feedback set',
        () {
      expect(
        resolveOneUiInputFieldState(label: 'Email', error: 'Bad')
            .fieldErrorOnlyRow,
        isFalse,
      );
      expect(
        resolveOneUiInputFieldState(
          label: 'Email',
          feedback: const Text('custom'),
        ).fieldErrorOnlyRow,
        isFalse,
      );
    });

    test('hasDynamicRow on strings or slot', () {
      expect(resolveOneUiInputFieldState(dynamicText: '0/100').hasDynamicRow,
          isTrue);
      expect(resolveOneUiInputFieldState(helperButton: 'Clear').hasDynamicRow,
          isTrue);
      expect(
        resolveOneUiInputFieldState(dynamicTextSlot: const SizedBox())
            .hasDynamicRow,
        isTrue,
      );
      expect(resolveOneUiInputFieldState().hasDynamicRow, isFalse);
    });

    test('resolvedAccessibilityLabel fallback order', () {
      expect(
        resolveOneUiInputFieldState(label: '  Email  ')
            .resolvedAccessibilityLabel,
        'Email',
      );
      expect(
        resolveOneUiInputFieldState(
          accessibilityLabel: 'Native',
          ariaLabel: 'Web',
          label: 'Visible',
        ).resolvedAccessibilityLabel,
        'Native',
      );
      expect(
        resolveOneUiInputFieldState(
                accessibilityLabel: '   ', label: 'Fallback')
            .resolvedAccessibilityLabel,
        'Fallback',
      );
      expect(
          resolveOneUiInputFieldState(label: '   ').resolvedAccessibilityLabel,
          isNull);
    });

    test('defaults info icon aria label', () {
      expect(
          resolveOneUiInputFieldState().infoIconAriaLabel, 'More information');
      expect(
          resolveOneUiInputFieldState(infoIconAriaLabel: 'Why?')
              .infoIconAriaLabel,
          'Why?');
    });

    test('emits semantics ids when field id is set', () {
      final state = resolveOneUiInputFieldState(
        id: 'email',
        description: 'Hint copy',
        error: 'Required',
        dynamicText: '0/100',
      );
      expect(state.feedbackSemanticsId, 'email-feedback');
      expect(state.descriptionSemanticsId, 'email-description');
      expect(state.dynamicTextSemanticsId, 'email-dynamic');
    });

    test('omits semantics ids without field id', () {
      final state =
          resolveOneUiInputFieldState(error: 'Required', description: 'Hint');
      expect(state.feedbackSemanticsId, isNull);
      expect(state.descriptionSemanticsId, isNull);
      expect(state.dynamicTextSemanticsId, isNull);
    });

    test('encodes web data-* payload on state', () {
      final state = resolveOneUiInputFieldState(
        size: 'm',
        appearance: OneUiInputAppearance.secondary,
        disabled: true,
        invalid: true,
      );
      expect(state.dataSize, 'm');
      expect(state.dataAppearance, 'secondary');
      expect(state.dataDisabled, isTrue);
      expect(state.dataInvalid, isTrue);
      expect(state.dataPayloadKey, contains('oneui-input-field'));
      expect(state.dataPayloadKey, contains('data-size=m'));
      expect(state.dataPayloadKey, contains('data-disabled=true'));
      expect(state.dataPayloadKey, contains('data-invalid=true'));
    });

    test('auto inherits parent appearance from Surface', () {
      expect(
        resolveOneUiInputFieldState(
          appearance: OneUiInputAppearance.auto,
          parentAppearance: 'positive',
        ).resolvedAppearance,
        'positive',
      );
    });

    test('Figma API size row matches s/m/l', () {
      expect(kOneUiInputFieldFigmaSizes, ['s', 'm', 'l']);
      for (final sz in kOneUiInputFieldFigmaSizes) {
        expect(resolveOneUiInputFieldState(size: sz).dataSize, sz);
      }
    });
  });

  group('resolveOneUiInputFieldDescribedBy', () {
    test('auto-links feedback when id + error', () {
      final state = resolveOneUiInputFieldState(id: 'email', error: 'Bad');
      expect(
        resolveOneUiInputFieldDescribedBy(
          feedbackSemanticsId: state.feedbackSemanticsId,
        ),
        'email-feedback',
      );
    });
  });

  group('resolveOneUiInputFieldInputAccessibility', () {
    test('forwards accessibilityHint and aria-describedby', () {
      final a11y = resolveOneUiInputFieldInputAccessibility(
        accessibilityHint: 'Activates voice search',
        ariaDescribedBy: 'help-id',
      );
      expect(a11y.accessibilityHint, 'Activates voice search');
      expect(a11y.ariaDescribedBy, 'help-id');
    });

    test('trims empty strings to null', () {
      final a11y = resolveOneUiInputFieldInputAccessibility(
        accessibilityHint: '   ',
        ariaDescribedBy: '',
      );
      expect(a11y.accessibilityHint, isNull);
      expect(a11y.ariaDescribedBy, isNull);
    });
  });

  group('resolveOneUiInputFieldAccessibility', () {
    test('hides entire field when aria-hidden', () {
      final a11y = resolveOneUiInputFieldAccessibility(ariaHidden: true);
      expect(a11y.hideDescendants, isTrue);
      expect(a11y.excludeFromSemantics, isTrue);
    });

    test('default root is decorative', () {
      final a11y = resolveOneUiInputFieldAccessibility();
      expect(a11y.hideDescendants, isFalse);
      expect(a11y.excludeFromSemantics, isTrue);
    });
  });

  group('OneUiInputField widget', () {
    testWidgetsAllPlatforms('renders placeholder and label', (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(label: 'Email', placeholder: 'you@example.com'),
      );
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('you@example.com'), findsOneWidget);
    });

    testWidgetsAllPlatforms('renders description', (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
            description: 'Enter your email', placeholder: 'x'),
      );
      expect(find.text('Enter your email'), findsOneWidget);
    });

    testWidgetsAllPlatforms('renders error via InputFeedback', (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
            error: 'This field is required', placeholder: 'x'),
      );
      expect(find.text('This field is required'), findsOneWidget);
      expect(find.byType(OneUiInputFeedback), findsOneWidget);
    });

    testWidgetsAllPlatforms('renders required asterisk', (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(label: 'Name', required: true, placeholder: 'x'),
      );
      expect(find.textContaining('*'), findsOneWidget);
    });

    testWidgetsAllPlatforms('renders dynamic text and helper button',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
          placeholder: 'x',
          dynamicText: '0/100 characters',
          helperButton: 'Help',
        ),
      );
      expect(find.text('0/100 characters'), findsOneWidget);
      expect(find.text('Help'), findsOneWidget);
      expect(find.byType(OneUiInputDynamicText), findsOneWidget);
    });

    testWidgetsAllPlatforms('labelSlot overrides string label', (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
          labelSlot: Text('From slot'),
          label: 'Ignored',
          placeholder: 'x',
        ),
      );
      expect(find.text('From slot'), findsOneWidget);
      expect(find.text('Ignored'), findsNothing);
    });

    testWidgetsAllPlatforms('dynamicTextSlot overrides strings',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
          label: 'L',
          placeholder: 'x',
          dynamicText: 'ignored',
          dynamicTextSlot: OneUiInputDynamicText(content: 'From slot'),
        ),
      );
      expect(find.text('From slot'), findsOneWidget);
      expect(find.text('ignored'), findsNothing);
    });

    testWidgetsAllPlatforms(
        'label header owned by field not duplicated on shell', (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
            label: 'Email', description: 'Hint copy', placeholder: 'x'),
      );
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Hint copy'), findsOneWidget);
      expect(find.byType(OneUiInput), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        'links error feedback via controlsNodes when id is set',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
          id: 'email',
          label: 'Email',
          error: 'Required',
          placeholder: 'x',
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = inputFieldTextFieldSemantics(tester).getSemanticsData();
        expect(data.controlsNodes, contains('email-feedback'));
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms(
        'forwards accessibilityHint to text field semantics', (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
          label: 'Search',
          accessibilityHint: 'Activates voice search',
          placeholder: 'x',
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = inputFieldTextFieldSemantics(tester).getSemanticsData();
        expect(data.hint, 'Activates voice search');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('onSubmit fires with current value',
        (tester) async {
      String? submitted;
      await pumpInputFieldHarness(
        tester,
        OneUiInputField(
          placeholder: 'Submit me',
          defaultValue: 'Hello',
          onSubmit: (v) => submitted = v,
        ),
      );
      await tester.tap(find.byType(TextField));
      await tester.pump();
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      expect(submitted, 'Hello');
    });

    testWidgetsAllPlatforms('forwards visible label to text field semantics',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(label: 'Email', placeholder: 'you@example.com'),
      );
      final data = inputFieldTextFieldSemantics(tester).getSemanticsData();
      expect(data.label, 'Email');
    });

    testWidgetsAllPlatforms('prefers accessibilityLabel over visible label',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
          label: 'Visible',
          accessibilityLabel: 'Screen reader name',
          placeholder: 'x',
        ),
      );
      final data = inputFieldTextFieldSemantics(tester).getSemanticsData();
      expect(data.label, 'Screen reader name');
    });

    testWidgetsAllPlatforms('info icon is exposed to assistive tech',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(label: 'Email', infoIcon: true, placeholder: 'x'),
      );
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('More information'), findsOneWidget);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('aria-hidden collapses semantics tree',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
          ariaHidden: true,
          label: 'Hidden',
          placeholder: 'x',
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Hidden'), findsNothing);
        expect(find.bySemanticsLabel('x'), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('disabled field is not enabled in semantics',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(label: 'Email', disabled: true, placeholder: 'x'),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = inputFieldTextFieldSemantics(tester).getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms(
        '[INP-A11Y-001] readOnly stays enabled in AT (web readonly + RN a11y)',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
          accessibilityLabel: 'Read only field',
          defaultValue: 'locked',
          readOnly: true,
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = inputFieldTextFieldSemantics(tester).getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
        expect(data.hasFlag(SemanticsFlag.isReadOnly), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('exposes data-* payload KeyedSubtree on root',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
          label: 'Email',
          size: 'm',
          appearance: OneUiInputAppearance.secondary,
          placeholder: 'x',
        ),
      );
      expect(
        find.byWidgetPredicate(
          (w) =>
              w is KeyedSubtree &&
              w.key is ValueKey<String> &&
              (w.key! as ValueKey<String>)
                  .value
                  .contains('oneui-input-field|data-size=m'),
        ),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('forwards leftAddon to inner input start slot',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
          placeholder: 'x',
          leftAddon: Text('L'),
        ),
      );
      expect(find.text('L'), findsOneWidget);
    });

    testWidgetsAllPlatforms('onHelperPress alias fires helper action',
        (tester) async {
      var pressed = false;
      await pumpInputFieldHarness(
        tester,
        OneUiInputField(
          placeholder: 'x',
          helperButton: 'Help',
          onHelperPress: () => pressed = true,
        ),
      );
      await tester.tap(find.text('Help'));
      await tester.pump();
      expect(pressed, isTrue);
    });

    testWidgets('repaints when brand design system tokens change',
        (tester) async {
      await tester.pumpWidget(
        pumpInputFieldApp(
          const OneUiInputField(label: 'Brand', placeholder: 'x'),
          designSystem: inputFieldTestDesignSystem(fieldGapPx: '6px'),
          brandHash: 'brand-a',
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(OneUiInputField), findsOneWidget);

      await tester.pumpWidget(
        pumpInputFieldApp(
          const OneUiInputField(
            key: ValueKey('brand-b-gap'),
            label: 'Brand',
            placeholder: 'x',
          ),
          designSystem: inputFieldTestDesignSystem(fieldGapPx: '12px'),
          brandHash: 'brand-b',
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('brand-b-gap')), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        '[IFD-FN-001] renders hidden fieldErrorSlot anchor when valid',
        (tester) async {
      await pumpInputFieldHarness(
        tester,
        const OneUiInputField(
          label: 'Email',
          id: 'email',
          placeholder: 'you@example.com',
        ),
      );
      expect(
        find.byWidgetPredicate(
          (w) => w is OneUiInputFeedback && w.fieldErrorSlot,
        ),
        findsOneWidget,
      );
    });

    testWidgets('[IFD-DEB-002] size s meets 44px touch target on Android',
        (tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.android;
      try {
        await pumpInputFieldHarness(
          tester,
          const OneUiInputField(
            label: 'Email',
            size: 's',
            placeholder: 'you@example.com',
          ),
        );
        final shell = find.descendant(
          of: find.byType(OneUiInputField),
          matching: find.byType(AnimatedContainer),
        );
        expect(tester.getSize(shell).height, greaterThanOrEqualTo(44));
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  });
}
