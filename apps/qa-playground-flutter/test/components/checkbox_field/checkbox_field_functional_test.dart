/// CheckboxField functional QA tests — mirrors RN `CheckboxField.test.tsx` /
/// web `CheckboxField.test.tsx`.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import '../../support/components/checkbox_field_harness.dart';

const _appearances = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
];

void main() {
  group('[smoke] CheckboxField — Figma matrix: appearance', () {
    for (final appearance in _appearances) {
      testWidgetsAllPlatforms('[smoke] appearance="$appearance" renders', (tester) async {
        await pumpCheckboxQaHarness(
          tester,
          OneUiCheckboxField(
            appearance: appearance,
            testId: 'cbf-app-$appearance',
          ),
        );
        expect(find.byKey(ValueKey('cbf-app-$appearance')), findsOneWidget);
        expect(find.byType(OneUiCheckbox), findsOneWidget);
        withSemanticsHandle(tester, () {
          expect(
            find.descendant(
              of: find.byType(OneUiCheckbox),
              matching: find.byWidgetPredicate(
                (widget) =>
                    widget is Semantics && widget.properties.checked != null,
              ),
            ),
            findsOneWidget,
          );
        });
      });
    }
  });

  group('[smoke] CheckboxField — core props (RN smoke)', () {
    testWidgetsAllPlatforms('[smoke] renders without crashing (all defaults)', (tester) async {
      await pumpCheckboxQaHarness(tester, const OneUiCheckboxField());
      expect(find.byType(OneUiCheckbox), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] renders with label', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Subscribe'),
      );
      expect(find.text('Subscribe'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] renders with label and description', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Label', description: 'Description'),
      );
      expect(find.text('Label'), findsOneWidget);
      expect(find.text('Description'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] renders selected without crashing', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Opt-in', checked: true),
      );
      expectCheckboxChecked(tester, 'Opt-in', checked: true);
    });

    testWidgetsAllPlatforms('[smoke] renders disabled without crashing', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Opt-in', disabled: true),
      );
      expectCheckboxDisabled(tester, 'Opt-in');
    });

    testWidgetsAllPlatforms('[smoke] renders readOnly without crashing', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Opt-in', readOnly: true),
      );
      expectCheckboxReadOnlyEnabled(tester, 'Opt-in');
    });

    testWidgetsAllPlatforms('[smoke] renders with error string', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Option', error: 'Required field'),
      );
      expect(find.text('Required field'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] renders with required', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Option', required: true),
      );
      expect(find.textContaining('*'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] renders fullWidth', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(fullWidth: true, label: 'Option'),
      );
      expect(find.text('Option'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] renders with dynamicText and helperButton', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Option',
          dynamicText: '0 / 100 characters',
          helperButton: 'View rules',
        ),
      );
      expect(find.text('0 / 100 characters'), findsOneWidget);
      expect(find.text('View rules'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] multi-option mode renders', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Choose options',
          children: [
            OneUiCheckbox(value: 'a', label: 'Option A'),
            OneUiCheckbox(value: 'b', label: 'Option B'),
          ],
        ),
      );
      expect(find.text('Option A'), findsOneWidget);
      expect(find.text('Option B'), findsOneWidget);
    });
  });

  group('[functional] CheckboxField — single mode', () {
    testWidgetsAllPlatforms('[fn] label renders as visible text', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Accept terms'),
      );
      expect(find.text('Accept terms'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] description renders as visible text', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Accept',
          description: 'By accepting you agree to our ToS',
        ),
      );
      expect(find.text('By accepting you agree to our ToS'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] inner Checkbox exposes checkbox semantics role', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Accept', testId: 'cbf-single'),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxChecked(tester, 'Accept', checked: false);
      });
    });

    testWidgetsAllPlatforms('[fn] press fires onSelectedChange with true (false → true)', (tester) async {
      var next = false;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Accept',
          checked: false,
          onSelectedChange: (v) => next = v,
        ),
      );
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(next, isTrue);
    });

    testWidgetsAllPlatforms('[fn] press fires onSelectedChange with false (true → false)', (tester) async {
      var next = true;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Accept',
          checked: true,
          onSelectedChange: (v) => next = v,
        ),
      );
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(next, isFalse);
    });

    testWidgetsAllPlatforms('[fn] press on indeterminate fires onSelectedChange with true', (tester) async {
      var next = false;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Accept',
          indeterminate: true,
          onSelectedChange: (v) => next = v,
        ),
      );
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(next, isTrue);
    });

    testWidgetsAllPlatforms('[fn] onCheckedChange RN alias fires on tap', (tester) async {
      var calls = 0;
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[fn] checked=true shows checked state', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Accept', checked: true),
      );
      expectCheckboxChecked(tester, 'Accept', checked: true);
    });

    testWidgetsAllPlatforms('[fn] indeterminate=true shows mixed state', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Accept', indeterminate: true),
      );
      expectCheckboxMixed(tester, 'Accept');
    });

    testWidgetsAllPlatforms('[fn] disabled=true blocks toggle', (tester) async {
      var changed = false;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Accept',
          disabled: true,
          onSelectedChange: (_) => changed = true,
        ),
      );
      expectCheckboxDisabled(tester, 'Accept');
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('[fn] readOnly=true blocks toggle', (tester) async {
      var changed = false;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Accept',
          readOnly: true,
          onSelectedChange: (_) => changed = true,
        ),
      );
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('[fn] testId on field wrapper attaches ValueKey', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Option', testId: 'cbf-testid'),
      );
      expect(find.byKey(const ValueKey('cbf-testid')), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] required=true shows asterisk on label', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Option', required: true),
      );
      expect(find.textContaining('*'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] required=false hides asterisk', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Option', required: false),
      );
      expect(find.textContaining(' *'), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] description-only integrated beside control', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(description: 'Select all that apply.'),
      );
      expect(find.text('Select all that apply.'), findsOneWidget);
      expect(find.byType(OneUiCheckbox), findsOneWidget);
    });
  });

  group('[functional] CheckboxField — error and feedback', () {
    testWidgetsAllPlatforms('[fn] error string renders as feedback text', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Option', error: 'This field is required'),
      );
      expect(find.text('This field is required'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] error string makes isInvalid — inner Checkbox has errorHighlight', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Option', error: 'Required'),
      );
      expectCheckboxWidgetErrorHighlight(tester, highlighted: true);
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Option');
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });

    testWidgetsAllPlatforms('[fn] invalid=true makes isInvalid even without error string', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Option', invalid: true, id: 'cbf-invalid'),
      );
      expect(fieldFeedbackSemanticsAnchor('cbf-invalid'), findsOneWidget);
      expectCheckboxWidgetErrorHighlight(tester, highlighted: true);
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Option');
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });

    testWidgetsAllPlatforms('[fn] error auto-rendered feedback exposes alert semantics role', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Option', error: 'Validation failed'),
      );
      expect(find.text('Validation failed'), findsOneWidget);
      withSemanticsHandle(tester, () {
        // Negative variant maps to alert role (Flutter); RN uses liveRegion polite on Text.
        expect(
          find.byWidgetPredicate(
            (widget) =>
                widget is Semantics && widget.properties.role == SemanticsRole.alert,
          ),
          findsWidgets,
        );
      });
    });

    testWidgetsAllPlatforms('[fn] empty error string is NOT invalid feedback', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Option', error: ''),
      );
      expect(find.text(''), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] feedback slot renders custom content', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Option',
          feedback: OneUiInputFeedback(
            variant: OneUiInputFeedbackVariant.informative,
            attention: OneUiInputFeedbackAttention.low,
            feedbackMessage: 'Custom feedback',
          ),
        ),
      );
      expect(find.text('Custom feedback'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] invalid story renders error feedback string', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Confirm you are human',
          invalid: true,
          error: 'Please complete verification.',
        ),
      );
      expect(find.text('Please complete verification.'), findsOneWidget);
    });
  });

  group('[functional] CheckboxField — dynamic text row', () {
    testWidgetsAllPlatforms('[fn] dynamicText renders as visible text', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(label: 'Option', dynamicText: '0 / 100 characters'),
      );
      expect(find.text('0 / 100 characters'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] helperButton renders with visible text', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Option',
          dynamicText: '0 / 100',
          helperButton: 'View rules',
        ),
      );
      expect(find.text('View rules'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] helperButton fires onHelperPressed when pressed', (tester) async {
      var pressed = false;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Option',
          helperButton: 'View rules',
          onHelperPressed: () => pressed = true,
        ),
      );
      await tester.tap(find.text('View rules'));
      await tester.pumpAndSettle();
      expect(pressed, isTrue);
    });

    testWidgetsAllPlatforms('[fn] dynamicTextSlot overrides dynamicText', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Option',
          dynamicText: 'Ignored',
          dynamicTextSlot: OneUiInputDynamicText(content: '0/10'),
        ),
      );
      expect(find.text('0/10'), findsOneWidget);
      expect(find.text('Ignored'), findsNothing);
    });
  });

  group('[functional] CheckboxField — multi-option mode', () {
    testWidgetsAllPlatforms('[fn] children render as stacked Checkboxes', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Select all that apply',
          children: [
            OneUiCheckbox(value: 'a', label: 'Option A', testId: 'opt-a'),
            OneUiCheckbox(value: 'b', label: 'Option B', testId: 'opt-b'),
            OneUiCheckbox(value: 'c', label: 'Option C', testId: 'opt-c'),
          ],
        ),
      );
      expect(find.byKey(const ValueKey('opt-a')), findsOneWidget);
      expect(find.byKey(const ValueKey('opt-b')), findsOneWidget);
      expect(find.byKey(const ValueKey('opt-c')), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] field label renders as header text in multi mode', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Select options',
          children: [OneUiCheckbox(value: 'a', label: 'A')],
        ),
      );
      expect(find.text('Select options'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] field description renders in multi mode', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Select',
          description: 'Choose at least one',
          children: [OneUiCheckbox(value: 'a', label: 'A')],
        ),
      );
      expect(find.text('Choose at least one'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] groupValue controls which child Checkboxes are checked', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          groupValue: const ['b'],
          children: [
            OneUiCheckbox(value: 'a', label: 'Option A'),
            OneUiCheckbox(value: 'b', label: 'Option B'),
          ],
        ),
      );
      expectCheckboxChecked(tester, 'Option A', checked: false);
      expectCheckboxChecked(tester, 'Option B', checked: true);
    });

    testWidgetsAllPlatforms('[fn] pressing a child fires onGroupValueChange', (tester) async {
      List<String>? next;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          onGroupValueChange: (v) => next = v,
          children: [
            OneUiCheckbox(value: 'a', label: 'Option A', testId: 'multi-a'),
            OneUiCheckbox(value: 'b', label: 'Option B', testId: 'multi-b'),
          ],
        ),
      );
      await tester.tap(find.byKey(const ValueKey('multi-a')));
      await tester.pumpAndSettle();
      expect(next, ['a']);
    });

    testWidgetsAllPlatforms('[fn] field-level disabled is forwarded to all children', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          disabled: true,
          children: [
            OneUiCheckbox(value: 'a', label: 'A', testId: 'dis-a'),
            OneUiCheckbox(value: 'b', label: 'B', testId: 'dis-b'),
          ],
        ),
      );
      expectCheckboxDisabled(tester, 'A');
      expectCheckboxDisabled(tester, 'B');
    });

    testWidgetsAllPlatforms('[fn] invalid=true forwards errorHighlight to child checkboxes', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          invalid: true,
          children: [OneUiCheckbox(value: 'a', label: 'A', testId: 'inv-a')],
        ),
      );
      expectCheckboxWidgetErrorHighlight(tester, testId: 'inv-a', highlighted: true);
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'A');
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });

    testWidgetsAllPlatforms('[fn] uncontrolled multi mode: first press selects value', (tester) async {
      List<String>? next;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          onGroupValueChange: (v) => next = v,
          children: [OneUiCheckbox(value: 'a', label: 'A', testId: 'unc-a')],
        ),
      );
      await tester.tap(find.byKey(const ValueKey('unc-a')));
      await tester.pumpAndSettle();
      expect(next, ['a']);
    });

    testWidgetsAllPlatforms('[fn] controlled multi mode: deselect removes value from group', (tester) async {
      List<String>? next;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          groupValue: const ['a'],
          onGroupValueChange: (v) => next = v,
          children: [OneUiCheckbox(value: 'a', label: 'A', testId: 'ctrl-a')],
        ),
      );
      expectCheckboxChecked(tester, 'A', checked: true);
      await tester.tap(find.byKey(const ValueKey('ctrl-a')));
      await tester.pumpAndSettle();
      expect(next, isEmpty);
    });

    testWidgetsAllPlatforms('[fn] multi-select updates group values', (tester) async {
      final values = <String>[];
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Channels',
          groupDefaultValue: const ['email'],
          onGroupValueChange: (v) => values
            ..clear()
            ..addAll(v),
          children: [
            OneUiCheckbox(value: 'email', label: 'Email'),
            OneUiCheckbox(value: 'sms', label: 'SMS'),
          ],
        ),
      );
      await tester.tap(find.text('SMS'));
      await tester.pumpAndSettle();
      expect(values, containsAll(['email', 'sms']));
    });

    testWidgetsAllPlatforms('[fn] multi mode: selecting two children accumulates group values', (tester) async {
      final calls = <List<String>>[];
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          onGroupValueChange: (v) => calls.add(List<String>.from(v)),
          children: [
            OneUiCheckbox(value: 'a', label: 'A', testId: 'multi-acc-a'),
            OneUiCheckbox(value: 'b', label: 'B', testId: 'multi-acc-b'),
          ],
        ),
      );
      await tester.tap(find.byKey(const ValueKey('multi-acc-a')));
      await tester.pumpAndSettle();
      expect(calls.last, ['a']);

      await tester.tap(find.byKey(const ValueKey('multi-acc-b')));
      await tester.pumpAndSettle();
      expect(calls.last, containsAll(['a', 'b']));
    });

    testWidgetsAllPlatforms('[fn] child own onSelectedChange fires on press', (tester) async {
      var childChanged = false;
      List<String>? groupNext;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          onGroupValueChange: (v) => groupNext = v,
          children: [
            OneUiCheckbox(
              value: 'a',
              label: 'A',
              testId: 'own-cb',
              onSelectedChange: (_) => childChanged = true,
            ),
          ],
        ),
      );
      await tester.tap(find.byKey(const ValueKey('own-cb')));
      await tester.pumpAndSettle();
      expect(groupNext, ['a']);
      expect(childChanged, isTrue);
    });

    testWidgetsAllPlatforms('[fn] child with no value is ignored in group selection', (tester) async {
      var called = false;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          onGroupValueChange: (_) => called = true,
          children: [OneUiCheckbox(label: 'No value', testId: 'no-val')],
        ),
      );
      await tester.tap(find.byKey(const ValueKey('no-val')));
      await tester.pumpAndSettle();
      expect(called, isFalse);
    });

    testWidgetsAllPlatforms('[fn] disabled field blocks changes', (tester) async {
      var changed = false;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckboxField(
          label: 'Channels',
          disabled: true,
          onGroupValueChange: (_) => changed = true,
          children: [OneUiCheckbox(value: 'email', label: 'Email')],
        ),
      );
      await tester.tap(find.text('Email'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('[fn] multi-option flattens Column children', (tester) async {
      await pumpCheckboxQaHarness(
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
  });
}
