/// Checkbox accessibility + functional parity — web `Checkbox.test.tsx`,
/// RN `CheckboxA11y.test.ts` / `useCheckboxState`, Flutter web + mobile.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_group.dart';

import 'checkbox_test_harness.dart';

void main() {
  group('resolveCheckboxAccessibilityLabel — RN label fallback chain', () {
    test('prefers semanticsLabel over ariaLabel and visible label', () {
      expect(
        resolveCheckboxAccessibilityLabel(
          semanticsLabel: 'Screen reader',
          ariaLabel: 'Aria',
          label: 'Visible',
        ),
        'Screen reader',
      );
    });

    test('prefers ariaLabel over visible label', () {
      expect(
        resolveCheckboxAccessibilityLabel(
          ariaLabel: 'Aria only',
          label: 'Visible',
        ),
        'Aria only',
      );
    });

    test('falls back to description when label omitted', () {
      expect(
        resolveCheckboxAccessibilityLabel(
          description: 'Weekly digest only.',
        ),
        'Weekly digest only.',
      );
    });
  });

  group('getCheckboxAccessibilityProps — RN CheckboxA11y.test.ts', () {
    test('exposes checked=true when selected', () {
      final a11y = getCheckboxAccessibilityProps(
        ariaLabel: 'Accept terms',
        isDisabled: false,
        isReadOnly: false,
        isChecked: true,
        isIndeterminate: false,
      );
      expect(a11y.exposeControl, isTrue);
      expect(a11y.label, 'Accept terms');
      expect(a11y.checked, isTrue);
      expect(a11y.canTap, isTrue);
    });

    test('reports mixed state for indeterminate', () {
      final a11y = getCheckboxAccessibilityProps(
        ariaLabel: 'Mixed',
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: true,
      );
      expect(a11y.checked, 'mixed');
    });

    test('forwards aria-describedby as describedBy', () {
      final a11y = getCheckboxAccessibilityProps(
        ariaLabel: 'Box',
        ariaDescribedby: 'help-1',
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: false,
      );
      expect(a11y.describedBy, 'help-1');
    });

    test('passes accessibilityHint through unchanged', () {
      final a11y = getCheckboxAccessibilityProps(
        ariaLabel: 'Box',
        accessibilityHint: 'Toggles the option',
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: false,
      );
      expect(a11y.hint, 'Toggles the option');
    });

    test('marks disabled state and blocks tap', () {
      final a11y = getCheckboxAccessibilityProps(
        ariaLabel: 'Box',
        isDisabled: true,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: false,
      );
      expect(a11y.canTap, isFalse);
    });

    test('readOnly allows exposure but blocks tap', () {
      final a11y = getCheckboxAccessibilityProps(
        label: 'Locked',
        isDisabled: false,
        isReadOnly: true,
        isChecked: true,
        isIndeterminate: false,
      );
      expect(a11y.exposeControl, isTrue);
      expect(a11y.canTap, isFalse);
    });

    test('aria-hidden collapses exposure', () {
      final a11y = getCheckboxAccessibilityProps(
        ariaLabel: 'Hidden',
        ariaHidden: true,
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: false,
      );
      expect(a11y.hidden, isTrue);
      expect(a11y.exposeControl, isFalse);
    });

    test('CB-A11Y-002 required forwards to semantics model', () {
      final a11y = getCheckboxAccessibilityProps(
        ariaLabel: 'Terms',
        required: true,
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: false,
      );
      expect(a11y.isRequired, isTrue);
    });

    test('CB-A11Y-005 errorHighlight marks invalid without ariaInvalid', () {
      final a11y = getCheckboxAccessibilityProps(
        ariaLabel: 'Box',
        errorHighlight: true,
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: false,
      );
      expect(a11y.isInvalid, isTrue);
    });

    test('aria-labelledby omits visible label from control semantics', () {
      final a11y = getCheckboxAccessibilityProps(
        label: 'Terms',
        ariaLabelledBy: 'terms-heading',
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: false,
      );
      expect(a11y.labelledBy, 'terms-heading');
      expect(a11y.label, isEmpty);
    });
  });

  group('resolveOneUiCheckboxState — RN useCheckboxState', () {
    test('defaults size=m, appearance=secondary, enabled', () {
      final state = resolveOneUiCheckboxState(isChecked: false);
      expect(state.resolvedSize, 'm');
      expect(state.resolvedAppearance, 'secondary');
      expect(state.isDisabled, isFalse);
      expect(state.isReadOnly, isFalse);
    });

    test('canonicalises legacy size aliases', () {
      expect(
          resolveOneUiCheckboxState(size: 'small', isChecked: false)
              .resolvedSize,
          's');
      expect(
          resolveOneUiCheckboxState(size: 'medium', isChecked: false)
              .resolvedSize,
          'm');
      expect(
          resolveOneUiCheckboxState(size: 'large', isChecked: false)
              .resolvedSize,
          'l');
    });

    test('keeps explicit appearance roles', () {
      expect(
        resolveOneUiCheckboxState(appearance: 'positive', isChecked: false)
            .resolvedAppearance,
        'positive',
      );
    });

    test('unknown appearance falls back to secondary', () {
      expect(
        resolveOneUiCheckboxState(appearance: 'destructive', isChecked: false)
            .resolvedAppearance,
        'secondary',
      );
    });

    test('inherits group size, appearance, disabled, readOnly', () {
      final state = resolveOneUiCheckboxState(
        isChecked: false,
        groupSize: 'l',
        groupAppearance: 'neutral',
        groupDisabled: true,
        groupReadOnly: true,
      );
      expect(state.resolvedSize, 'l');
      expect(state.resolvedAppearance, 'neutral');
      expect(state.isDisabled, isTrue);
      expect(state.isReadOnly, isTrue);
    });
  });

  group('oneUiCheckboxDataAttrs — web Checkbox.tsx CSS selectors', () {
    test('emits full matrix for sizes and states', () {
      expect(
        oneUiCheckboxDataAttrs(
          resolvedSize: 'l',
          resolvedAppearance: 'negative',
          uncheckedAppearance: 'neutral',
          isReadOnly: false,
          isChecked: false,
          isIndeterminate: false,
        ),
        {
          'data-size': 'l',
          'data-appearance': 'negative',
          'data-unchecked-appearance': 'neutral',
          'data-unchecked': '',
        },
      );

      expect(
        oneUiCheckboxDataAttrs(
          resolvedSize: 'm',
          resolvedAppearance: 'secondary',
          uncheckedAppearance: 'neutral',
          isReadOnly: false,
          isChecked: true,
          isIndeterminate: false,
        ),
        containsPair('data-checked', ''),
      );

      expect(
        oneUiCheckboxDataAttrs(
          resolvedSize: 's',
          resolvedAppearance: 'secondary',
          uncheckedAppearance: 'neutral',
          isReadOnly: false,
          isChecked: false,
          isIndeterminate: true,
        ),
        containsPair('data-indeterminate', ''),
      );

      expect(
        oneUiCheckboxDataAttrs(
          resolvedSize: 'm',
          resolvedAppearance: 'secondary',
          uncheckedAppearance: 'neutral',
          isReadOnly: true,
          isChecked: true,
          isIndeterminate: false,
        ),
        containsPair('data-readonly', ''),
      );
    });
  });

  group('OneUiCheckbox functional — web Checkbox.test.tsx', () {
    testWidgetsAllPlatforms('renders label and toggles on tap', (tester) async {
      var checked = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Accept terms',
          checked: checked,
          onCheckedChange: (v) => checked = v,
        ),
      );

      expect(find.text('Accept terms'), findsOneWidget);
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(checked, isTrue);
    });

    testWidgetsAllPlatforms('tap on label text toggles control',
        (tester) async {
      var checked = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Accept terms',
          checked: checked,
          onCheckedChange: (v) => checked = v,
        ),
      );

      await tester.tap(find.text('Accept terms'));
      await tester.pumpAndSettle();
      expect(checked, isTrue);
    });

    testWidgetsAllPlatforms('description renders below label', (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Subscribe',
          description: 'Weekly digest only.',
        ),
      );
      expect(find.text('Weekly digest only.'), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        'description-only uses description as accessible name', (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(description: 'Weekly digest only.'),
      );
      expect(find.text('Weekly digest only.'), findsOneWidget);
      withSemanticsHandle(tester, () {
        expectCheckboxChecked(tester, 'Weekly digest only.', checked: false);
      });
    });

    testWidgetsAllPlatforms('ariaLabel overrides visible label in semantics',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Visible',
          ariaLabel: 'From aria',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(checkboxSemanticsLabel('From aria'), findsOneWidget);
        expect(checkboxSemanticsLabel('Visible'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('controlled checked state updates visually',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        StatefulBuilder(
          builder: (context, setState) {
            return Column(
              children: [
                OneUiCheckbox(
                  label: 'Controlled',
                  checked: true,
                  onCheckedChange: (_) {},
                ),
                TextButton(
                  onPressed: () => setState(() {}),
                  child: const Text('noop'),
                ),
              ],
            );
          },
        ),
      );
      expectCheckboxChecked(tester, 'Controlled', checked: true);
    });

    testWidgetsAllPlatforms('defaultChecked uncontrolled starts checked',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Uncontrolled',
          defaultChecked: true,
        ),
      );
      expectCheckboxChecked(tester, 'Uncontrolled', checked: true);
    });

    testWidgetsAllPlatforms('onCheckedChange fires false on uncheck',
        (tester) async {
      bool? last;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Toggle',
          defaultChecked: true,
          onCheckedChange: (v) => last = v,
        ),
      );

      await tester.tap(find.text('Toggle'));
      await tester.pumpAndSettle();
      expect(last, isFalse);
    });

    testWidgetsAllPlatforms('forwards testId to keyed subtree', (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          testId: 'qa-checkbox-root',
          label: 'QA',
        ),
      );
      expect(find.byKey(const ValueKey('qa-checkbox-root')), findsOneWidget);
    });

    testWidgetsAllPlatforms('testId exposed via Semantics.identifier',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckbox(
          testId: 'qa-checkbox',
          label: 'QA',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'QA');
        expect(data.identifier, 'qa-checkbox');
      });
    });

    testWidgetsAllPlatforms('expands touch target when parent has room',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const SizedBox(
          width: 100,
          child: OneUiCheckbox(ariaLabel: 'Only'),
        ),
      );
      final rowSize = tester.getSize(
        find.descendant(
          of: find.byType(OneUiCheckbox),
          matching: find.byType(Row),
        ),
      );
      expect(rowSize.width, greaterThanOrEqualTo(44));
      expect(rowSize.height, greaterThanOrEqualTo(44));
    });

    testWidgetsAllPlatforms('does not overflow in tight showcase cells',
        (tester) async {
      await pumpCheckboxStoryHarness(
        tester,
        const Center(
          child: SizedBox(
            width: 36,
            child: OneUiCheckbox(ariaLabel: 'Only'),
          ),
        ),
      );
      expect(tester.takeException(), isNull);
    });

    testWidgetsAllPlatforms('renders without visible label', (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(ariaLabel: 'Standalone'),
      );
      withSemanticsHandle(tester, () {
        expect(checkboxSemanticsLabel('Standalone'), findsOneWidget);
      });
    });
  });

  group('OneUiCheckbox accessibility — widget semantics', () {
    testWidgetsAllPlatforms('checked semantics flip on tap', (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Toggle',
          defaultChecked: false,
        ),
      );

      expectCheckboxChecked(tester, 'Toggle', checked: false);
      await tester.tap(find.text('Toggle'));
      await tester.pumpAndSettle();
      expectCheckboxChecked(tester, 'Toggle', checked: true);
    });

    testWidgetsAllPlatforms('indeterminate exposes mixed semantics',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Select all',
          indeterminate: true,
        ),
      );
      expectCheckboxMixed(tester, 'Select all');
    });

    testWidgetsAllPlatforms('disabled blocks toggle and semantics',
        (tester) async {
      var changed = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Disabled',
          disabled: true,
          onCheckedChange: (_) => changed = true,
        ),
      );

      expectCheckboxDisabled(tester, 'Disabled');
      await tester.tap(find.text('Disabled'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('readOnly stays enabled but cannot toggle',
        (tester) async {
      var changed = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Locked',
          readOnly: true,
          defaultChecked: false,
          onCheckedChange: (_) => changed = true,
        ),
      );

      expectCheckboxReadOnlyEnabled(tester, 'Locked');
      await tester.tap(find.text('Locked'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
      expectCheckboxChecked(tester, 'Locked', checked: false);
    });

    testWidgetsAllPlatforms('aria-hidden excludes control from semantics tree',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Hidden',
          ariaHidden: true,
        ),
      );
      withSemanticsHandle(tester, () {
        expect(checkboxSemanticsLabel('Hidden'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('accessibilityHint surfaces in semantics',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Hinted',
          accessibilityHint: 'Toggles the option',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Hinted');
        expect(data.hint, 'Toggles the option');
      });
    });

    testWidgetsAllPlatforms('CB-A11Y-001 Space toggles focused checkbox',
        (tester) async {
      var checked = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Terms',
          autofocus: true,
          onCheckedChange: (v) => checked = v,
        ),
      );
      expect(FocusManager.instance.primaryFocus?.hasFocus, isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(checked, isTrue);
      expectCheckboxChecked(tester, 'Terms', checked: true);
    });

    testWidgetsAllPlatforms('CB-A11Y-001 Enter toggles focused checkbox',
        (tester) async {
      var checked = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Terms',
          autofocus: true,
          onCheckedChange: (v) => checked = v,
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(checked, isTrue);
    });

    testWidgetsAllPlatforms('CB-A11Y-002 required exposes hasRequiredState',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckbox(
          label: 'Required opt-in',
          required: true,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Required opt-in');
        expect(data.hasFlag(SemanticsFlag.isRequired), isTrue);
      });
    });

    testWidgetsAllPlatforms(
        'CB-A11Y-005 errorHighlight exposes validationResult invalid',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckbox(
          label: 'Invalid box',
          errorHighlight: true,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Invalid box');
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });
  });

  group('OneUiCheckboxGroup — web CheckboxGroup.test.tsx', () {
    testWidgetsAllPlatforms('multi-select adds and removes values',
        (tester) async {
      final values = <String>['a'];
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxGroup(
          defaultValue: const ['a'],
          onValueChange: (v) => values
            ..clear()
            ..addAll(v),
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
            OneUiCheckbox(value: 'b', label: 'B'),
          ],
        ),
      );

      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(values, containsAll(['a', 'b']));

      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(values, ['b']);
    });

    testWidgetsAllPlatforms('group disabled blocks all children',
        (tester) async {
      var changed = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxGroup(
          disabled: true,
          onValueChange: (_) => changed = true,
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
            OneUiCheckbox(value: 'b', label: 'B'),
          ],
        ),
      );

      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
      expectCheckboxDisabled(tester, 'B');
    });

    testWidgetsAllPlatforms('group errorHighlight propagates to children',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxGroup(
          errorHighlight: true,
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
          ],
        ),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'A');
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });

    testWidgetsAllPlatforms('explicit child checked overrides group selection',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxGroup(
          value: const ['a'],
          children: [
            OneUiCheckbox(value: 'a', label: 'A', checked: false),
          ],
        ),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxChecked(tester, 'A', checked: false);
      });
    });
  });
}
