/// RadioField — unit + widget tests aligned with web `RadioField.test.tsx` and
/// RN `RadioFieldA11y.test.ts` (functional + accessibility, all platforms).
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field_types.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';
import 'package:ui_flutter/engine/radio_size_resolve.dart';

import 'radio_field_test_harness.dart'
    show
        radioFieldSemanticsLabel,
        radioGroupRoleFinder,
        testWidgetsAllPlatforms;
import 'radio_field_test_harness.dart' as radio_harness;

void main() {
  // ---------------------------------------------------------------------------
  // RN `RadioFieldA11y.test.ts` — resolveOneUiRadioFieldState / a11y helpers
  // ---------------------------------------------------------------------------
  group('resolveOneUiRadioFieldState — RN useRadioFieldState parity', () {
    test('integrated single when no children and label set', () {
      final s = resolveOneUiRadioFieldState(
        flattenedChildren: const [],
        label: 'Notify',
      );
      expect(s.integratedSingle, isTrue);
      expect(s.multiOptionMode, isFalse);
      expect(s.plainOptionMode, isFalse);
      expect(s.hasLabel, isTrue);
      expect(s.headingSemanticsId, 'oneui-radiofield-heading');
    });

    test('integrated single false when label whitespace only', () {
      final s = resolveOneUiRadioFieldState(
        flattenedChildren: const [],
        label: '   ',
      );
      expect(s.integratedSingle, isFalse);
    });

    test('multi when two or more children', () {
      final s = resolveOneUiRadioFieldState(
        flattenedChildren: [const SizedBox(), const SizedBox(), const SizedBox()],
        label: 'Pick',
      );
      expect(s.multiOptionMode, isTrue);
      expect(s.useFieldsetLegend, isTrue);
    });

    test('plain when one child', () {
      final s = resolveOneUiRadioFieldState(
        flattenedChildren: [OneUiRadio(value: 'a')],
      );
      expect(s.plainOptionMode, isTrue);
      expect(s.useFieldsetLegend, isFalse);
    });

    test('isInvalid from error or invalid flag', () {
      expect(
        resolveOneUiRadioFieldState(flattenedChildren: const [], invalid: true)
            .isInvalid,
        isTrue,
      );
      expect(
        resolveOneUiRadioFieldState(flattenedChildren: const [], error: 'Bad')
            .isInvalid,
        isTrue,
      );
      expect(
        resolveOneUiRadioFieldState(flattenedChildren: const [], error: '   ')
            .isInvalid,
        isFalse,
      );
      expect(resolveOneUiRadioFieldState(flattenedChildren: const []).isInvalid,
          isFalse);
    });

    test('isDisabled mirrors disabled prop', () {
      expect(
        resolveOneUiRadioFieldState(flattenedChildren: const [], disabled: true)
            .isDisabled,
        isTrue,
      );
      expect(
        resolveOneUiRadioFieldState(
                flattenedChildren: const [], disabled: false)
            .isDisabled,
        isFalse,
      );
    });

    test('radioFieldSizeToInputNumeric maps s/m/l', () {
      expect(radioFieldSizeToInputNumeric('s'), 8);
      expect(radioFieldSizeToInputNumeric('m'), 10);
      expect(radioFieldSizeToInputNumeric('l'), 12);
    });

    test('hasInfoIcon requires infoIcon flag and non-empty label', () {
      expect(
        resolveOneUiRadioFieldState(
          flattenedChildren: const [],
          label: 'Speed',
          infoIcon: true,
        ).hasInfoIcon,
        isTrue,
      );
      expect(
        resolveOneUiRadioFieldState(
          flattenedChildren: const [],
          infoIcon: true,
        ).hasInfoIcon,
        isFalse,
      );
      expect(
        resolveOneUiRadioFieldState(
          flattenedChildren: const [],
          label: '   ',
          infoIcon: true,
        ).hasInfoIcon,
        isFalse,
      );
    });

    test('encodes web data-* payload on state', () {
      final s = resolveOneUiRadioFieldState(
        flattenedChildren: const [],
        label: 'Notify',
        size: 'm',
        appearance: 'primary',
        disabled: true,
        invalid: true,
      );
      expect(s.dataSize, 'm');
      expect(s.dataAppearance, 'primary');
      expect(s.dataDisabled, isTrue);
      expect(s.dataInvalid, isTrue);
      expect(s.dataPayloadKey, contains('oneui-radio-field'));
      expect(s.dataPayloadKey, contains('data-size=m'));
      expect(s.dataPayloadKey, contains('data-disabled=true'));
      expect(s.dataPayloadKey, contains('data-invalid=true'));
    });

    test('Figma API size row matches s/m/l', () {
      expect(kOneUiRadioFieldFigmaSizes, ['s', 'm', 'l']);
    });

    test('singleColumnGap fallback matches web per-size defaults', () {
      expect(radioFieldSingleColumnGapFallbackPx('s'), 6);
      expect(radioFieldSingleColumnGapFallbackPx('m'), 8);
      expect(radioFieldSingleColumnGapFallbackPx('l'), 10);
    });
  });

  group('radio field semantics id helpers', () {
    test('stable ids when field id set', () {
      expect(
        oneUiRadioFieldHeadingSemanticsId('contact', hasHeading: true),
        'contact-heading',
      );
      expect(
        oneUiRadioFieldDescriptionSemanticsId('contact', hasDescription: true),
        'contact-desc',
      );
      expect(
        oneUiRadioFieldFeedbackSemanticsId('contact', hasFeedback: true),
        'contact-feedback',
      );
      expect(
        oneUiRadioFieldDynamicTextSemanticsId('contact', hasDynamicRow: true),
        'contact-dynamic',
      );
    });

    test('fallback ids without field id', () {
      expect(
        oneUiRadioFieldHeadingSemanticsId(null, hasHeading: true),
        'oneui-radiofield-heading',
      );
      expect(
        oneUiRadioFieldDescriptionSemanticsId(null, hasDescription: true),
        'oneui-radiofield-desc',
      );
    });
  });

  group('resolveOneUiRadioFieldGroupDescribedBy', () {
    test('merges caller + auto-linked targets', () {
      expect(
        resolveOneUiRadioFieldGroupDescribedBy(
          callerAriaDescribedBy: 'external',
          descriptionSemanticsId: 'f-desc',
          feedbackSemanticsId: 'f-feedback',
        ),
        'external f-desc f-feedback',
      );
    });
  });

  group('flattenRadioFieldChildren', () {
    test('unwraps Column of radios', () {
      final flat = flattenRadioFieldChildren([
        Column(
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      ]);
      expect(flat.length, 2);
      expect(flat.every((w) => w is OneUiRadio), isTrue);
    });
  });

  group(
      'resolveOneUiRadioFieldAccessibility — RN getRadioFieldAccessibilityProps',
      () {
    test('exposes field label as accessibilityLabel', () {
      final a11y = resolveOneUiRadioFieldAccessibility(label: 'Delivery speed');
      expect(a11y.accessibilityLabel, 'Delivery speed');
      expect(a11y.hideSubtree, isFalse);
      expect(a11y.disabled, isFalse);
    });

    test('prefers aria-label over visible label', () {
      final a11y = resolveOneUiRadioFieldAccessibility(
        label: 'Visible',
        ariaLabel: 'Override',
      );
      expect(a11y.accessibilityLabel, 'Override');
    });

    test('forwards aria-describedby as callerAriaDescribedBy', () {
      final a11y = resolveOneUiRadioFieldAccessibility(
        label: 'L',
        ariaDescribedBy: 'help-id',
      );
      expect(a11y.callerAriaDescribedBy, 'help-id');
    });

    test('hideSubtree when aria-hidden=true', () {
      final a11y = resolveOneUiRadioFieldAccessibility(
        label: 'L',
        ariaHidden: true,
      );
      expect(a11y.hideSubtree, isTrue);
      expect(a11y.accessibilityLabel, isNull);
    });

    test('passes accessibilityHint through unchanged', () {
      final a11y = resolveOneUiRadioFieldAccessibility(
        label: 'L',
        accessibilityHint: 'Choose one',
      );
      expect(a11y.accessibilityHint, 'Choose one');
    });

    test('marks disabled state', () {
      expect(
        resolveOneUiRadioFieldAccessibility(label: 'L', disabled: true)
            .disabled,
        isTrue,
      );
    });
  });

  group('enhanceRadioFieldOptions', () {
    test('merges disabled and invalid onto OneUiRadio', () {
      final child = OneUiRadio(value: 'a', label: 'A');
      final out = enhanceRadioFieldOptions(
        [child],
        disabled: true,
        readOnly: false,
        size: 'l',
        appearance: 'primary',
        invalid: true,
      );
      final r = out.first as OneUiRadio;
      expect(r.disabled, isTrue);
      expect(r.size, 'l');
      expect(r.appearance, 'primary');
      expect(r.errorHighlight, isTrue);
    });

    test('propagates group aria-describedby when option has none', () {
      final out = enhanceRadioFieldOptions(
        [OneUiRadio(value: 'a', label: 'A')],
        disabled: false,
        readOnly: false,
        size: 'm',
        appearance: 'auto',
        invalid: false,
        groupAriaDescribedBy: 'field-desc field-feedback',
      );
      expect((out.first as OneUiRadio).ariaDescribedby,
          'field-desc field-feedback');
    });
  });

  // ---------------------------------------------------------------------------
  // Web `RadioField.test.tsx` — widget behaviour (android / iOS / linux web)
  // ---------------------------------------------------------------------------
  group('OneUiRadioField widget — web functional parity', () {
    testWidgetsAllPlatforms('multi: renders field label and option radios',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Pick one',
          defaultValue: 'a',
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      expect(find.text('Pick one'), findsOneWidget);
      expect(find.byType(OneUiRadio), findsNWidgets(2));
      expect(find.text('A'), findsOneWidget);
      expect(find.text('B'), findsOneWidget);
    });

    testWidgetsAllPlatforms('multi: changes selection on tap', (tester) async {
      String? last;
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Pick',
          defaultValue: 'a',
          onValueChange: (v) => last = v,
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        radio_harness.expectRadioChecked(tester, 'A', checked: true);
        radio_harness.expectRadioChecked(tester, 'B', checked: false);
      });
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(last, 'b');
      radio_harness.withSemanticsHandle(tester, () {
        radio_harness.expectRadioChecked(tester, 'B', checked: true);
      });
    });

    testWidgetsAllPlatforms('integrated single renders label and lone radio',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        const OneUiRadioField(
          label: 'Notifications',
          defaultValue: 'on',
        ),
      );
      expect(find.text('Notifications'), findsOneWidget);
      expect(find.byType(OneUiRadio), findsOneWidget);
      expect(find.byType(OneUiRadioGroup), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        'integrated single toggles off when re-clicking selected', (
      tester,
    ) async {
      String? last;
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Enable',
          defaultValue: 'on',
          onValueChange: (v) => last = v,
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        radio_harness.expectRadioChecked(tester, 'Enable', checked: true);
      });
      await tester.tap(find.byType(OneUiRadio));
      await tester.pumpAndSettle();
      expect(last, '');
      radio_harness.withSemanticsHandle(tester, () {
        radio_harness.expectRadioChecked(tester, 'Enable', checked: false);
      });
      await tester.tap(find.byType(OneUiRadio));
      await tester.pumpAndSettle();
      expect(last, 'on');
      radio_harness.withSemanticsHandle(tester, () {
        radio_harness.expectRadioChecked(tester, 'Enable', checked: true);
      });
    });

    testWidgetsAllPlatforms('flattens Column children for multi mode',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Contact',
          defaultValue: 'a',
          children: [
            Column(
              children: [
                OneUiRadio(value: 'a', label: 'A'),
                OneUiRadio(value: 'b', label: 'B'),
              ],
            ),
          ],
        ),
      );
      expect(find.byType(OneUiRadio), findsNWidgets(2));
    });

    testWidgetsAllPlatforms('renders description and feedback footer',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Contact method',
          description: 'Choose how we should reach you.',
          defaultValue: 'email',
          feedback: const OneUiInputFeedback(
            attention: OneUiInputFeedbackAttention.low,
            feedbackMessage: 'You can change this later in settings.',
          ),
          children: [
            OneUiRadio(value: 'email', label: 'Email'),
            OneUiRadio(value: 'sms', label: 'SMS'),
          ],
        ),
      );
      expect(find.text('Choose how we should reach you.'), findsOneWidget);
      expect(
        find.text('You can change this later in settings.'),
        findsOneWidget,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility — RN + web roles / describedby / disabled / hidden
  // ---------------------------------------------------------------------------
  group('OneUiRadioField widget — accessibility parity', () {
    testWidgetsAllPlatforms('multi field exposes group label to assistive tech',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Pick one',
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        expect(radioFieldSemanticsLabel('Pick one'), findsWidgets);
        expect(radioFieldSemanticsLabel('A'), findsWidgets);
        expect(radioFieldSemanticsLabel('B'), findsWidgets);
      });
    });

    testWidgetsAllPlatforms('prefers accessibilityLabel over visible label',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Visible',
          ariaLabel: 'Override',
          children: [
            OneUiRadio(value: 'a', label: 'A'),
          ],
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        expect(radioFieldSemanticsLabel('Override'), findsWidgets);
      });
    });

    testWidgetsAllPlatforms('forwards accessibilityHint on field and options',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Pick',
          accessibilityHint: 'Choose one option',
          children: [
            OneUiRadio(value: 'a', label: 'A'),
          ],
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        final data = radio_harness.fieldLabelSemanticsData(tester, 'Pick');
        expect(data.hint, 'Choose one option');
      });
    });

    testWidgetsAllPlatforms('aria-hidden collapses semantics subtree',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        const OneUiRadioField(
          ariaHidden: true,
          label: 'Hidden',
          defaultValue: 'on',
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Hidden'), findsNothing);
        expect(radio_harness.tryRadioSemanticsData(tester, 'Hidden'), isNull);
      });
    });

    testWidgetsAllPlatforms('disabled field and options are not enabled',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Pick',
          disabled: true,
          children: [
            OneUiRadio(value: 'a', label: 'A'),
          ],
        ),
      );
      expect(find.byType(OneUiRadioField), findsOneWidget);
      expect(find.text('A'), findsOneWidget);
      radio_harness.withSemanticsHandle(tester, () {
        final radioFinder = find.descendant(
          of: find.byType(OneUiRadio),
          matching: find.byType(Semantics),
        );
        expect(radioFinder, findsWidgets);
        final data = tester.getSemantics(radioFinder.first).getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      });
    });

    testWidgetsAllPlatforms('readOnly blocks selection change', (tester) async {
      String? last;
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Pick',
          readOnly: true,
          defaultValue: 'a',
          onValueChange: (v) => last = v,
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(last, isNull);
    });

    testWidgetsAllPlatforms(
        'links description via controlsNodes when id is set', (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          id: 'contact',
          label: 'Contact method',
          description: 'Choose how we should reach you.',
          defaultValue: 'email',
          children: [
            OneUiRadio(value: 'email', label: 'Email'),
          ],
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        final data = radio_harness.radioSemanticsData(tester, 'Email');
        expect(data.controlsNodes, isNotNull);
        expect(data.controlsNodes, contains('contact-desc'));
      });
    });

    testWidgetsAllPlatforms(
        'auto error feedback is announced with assertive live region', (
      tester,
    ) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          id: 'contact',
          label: 'Contact',
          error: 'Required',
          children: [
            OneUiRadio(value: 'email', label: 'Email'),
          ],
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Required'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms(
        'integrated radio exposes checked state in semantics', (
      tester,
    ) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        const OneUiRadioField(
          label: 'Notifications',
          defaultValue: 'on',
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        radio_harness.expectRadioChecked(tester, 'Notifications',
            checked: true);
      });
    });

    testWidgetsAllPlatforms('plain mode exposes radiogroup when ariaLabel set',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          ariaLabel: 'Solo group',
          children: [
            OneUiRadio(value: 'a', label: 'A'),
          ],
        ),
      );
      expect(radioGroupRoleFinder(), findsOneWidget);
      radio_harness.withSemanticsHandle(tester, () {
        expect(radioFieldSemanticsLabel('Solo group'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('required asterisk is visible', (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        const OneUiRadioField(
          label: 'Terms',
          required: true,
          defaultValue: 'on',
        ),
      );
      expect(find.textContaining('Terms *'), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        'required field exposes hasRequiredState on radio options',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Pick',
          required: true,
          defaultValue: 'a',
          children: const [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        final data = radio_harness.radioSemanticsData(tester, 'A');
        expect(data.hasFlag(SemanticsFlag.isRequired), isTrue);
      });
    });

    testWidgetsAllPlatforms('Space selects focused option in multi field',
        (tester) async {
      String? last;
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Pick',
          defaultValue: '',
          onValueChange: (v) => last = v,
          children: const [
            OneUiRadio(value: 'a', label: 'A', autofocus: true),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(last, 'a');
    });

    testWidgetsAllPlatforms('arrow down selects next option in multi field',
        (tester) async {
      String? last;
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Pick',
          defaultValue: 'a',
          onValueChange: (v) => last = v,
          children: const [
            OneUiRadio(value: 'a', label: 'A', autofocus: true),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      expect(last, 'b');
    });

    testWidgetsAllPlatforms('exposes data-* payload KeyedSubtree on root',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        const OneUiRadioField(
          label: 'Radio',
          description: 'Description',
          size: 'm',
          appearance: 'primary',
        ),
      );
      expect(
        find.byWidgetPredicate(
          (w) =>
              w is KeyedSubtree &&
              w.key is ValueKey<String> &&
              (w.key! as ValueKey<String>)
                  .value
                  .contains('oneui-radio-field|data-size=m'),
        ),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms(
        'infoIcon renders default info control beside label', (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        const OneUiRadioField(
          label: 'Radio',
          infoIcon: true,
          defaultValue: 'on',
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('More information'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('onHelperPress alias fires helper action',
        (tester) async {
      var pressed = false;
      await radio_harness.pumpRadioFieldHarness(
        tester,
        OneUiRadioField(
          label: 'Pick',
          defaultValue: 'on',
          helperButton: 'Help',
          onHelperPress: () => pressed = true,
        ),
      );
      await tester.tap(find.text('Help'));
      await tester.pump();
      expect(pressed, isTrue);
    });

    testWidgetsAllPlatforms('testId exposed via Semantics.identifier on field',
        (tester) async {
      await radio_harness.pumpRadioFieldHarness(
        tester,
        const OneUiRadioField(
          label: 'Plan',
          testId: 'plan-field',
        ),
      );
      radio_harness.withSemanticsHandle(tester, () {
        expect(find.byKey(const ValueKey('plan-field')), findsOneWidget);
        final node = tester.getSemantics(find.byType(OneUiRadioField));
        expect(node.getSemanticsData().identifier, 'plan-field');
      });
    });
  });
}
