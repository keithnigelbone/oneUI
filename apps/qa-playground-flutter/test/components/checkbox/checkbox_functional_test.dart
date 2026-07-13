/// Checkbox functional QA tests — mirrors web `Checkbox.test.tsx` / RN QA playground.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_group.dart';

import '../../support/components/checkbox_harness.dart';

void main() {
  group('[smoke] Checkbox — Figma 3 state rows (RN parity)', () {
    testWidgetsAllPlatforms('[smoke] unselected with label and description', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(
          checked: false,
          label: 'Label',
          description: 'Description',
          testId: 'cb-unselected',
        ),
      );
      expect(find.text('Label'), findsOneWidget);
      expect(find.text('Description'), findsOneWidget);
      expectCheckboxChecked(tester, 'Label', checked: false);
    });

    testWidgetsAllPlatforms('[smoke] selected with label and description', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(
          checked: true,
          label: 'Label',
          description: 'Description',
        ),
      );
      expectCheckboxChecked(tester, 'Label', checked: true);
    });

    testWidgetsAllPlatforms('[smoke] indeterminate with label and description', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(
          indeterminate: true,
          label: 'Label',
          description: 'Description',
        ),
      );
      expectCheckboxMixed(tester, 'Label');
    });
  });

  group('[smoke] Checkbox — core props (RN smoke)', () {
    testWidgetsAllPlatforms('[smoke] renders without label', (tester) async {
      await pumpCheckboxQaHarness(tester, OneUiCheckbox(ariaLabel: 'Standalone'));
      expect(find.byType(OneUiCheckbox), findsOneWidget);
    });

    for (final size in ['s', 'm', 'l']) {
      testWidgetsAllPlatforms('[smoke] size="$size" renders', (tester) async {
        await pumpCheckboxQaHarness(
          tester,
          OneUiCheckbox(size: size, ariaLabel: 'Size $size'),
        );
        expect(find.byType(OneUiCheckbox), findsOneWidget);
      });
    }
  });

  group('[functional] Checkbox — selected state (RN parity)', () {
    testWidgetsAllPlatforms('[fn] indeterminate overrides selected in semantics', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(
          indeterminate: true,
          checked: true,
          label: 'Mixed wins',
        ),
      );
      expectCheckboxMixed(tester, 'Mixed wins');
    });

    testWidgetsAllPlatforms('[fn] controlled selected stays false after tap', (tester) async {
      var calls = 0;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(
          checked: false,
          label: 'Controlled',
          onCheckedChange: (_) => calls++,
        ),
      );
      await tester.tap(find.text('Controlled'));
      await tester.pumpAndSettle();
      expect(calls, 1);
      expectCheckboxChecked(tester, 'Controlled', checked: false);
    });
  });

  group('[functional] Checkbox — interaction (RN parity)', () {
    testWidgetsAllPlatforms('[fn] indeterminate press selects (true)', (tester) async {
      bool? last;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(
          indeterminate: true,
          label: 'Select all',
          onCheckedChange: (v) => last = v,
        ),
      );
      await tester.tap(find.text('Select all'));
      await tester.pumpAndSettle();
      expect(last, isTrue);
    });

    testWidgetsAllPlatforms('[fn] uncontrolled toggles false → true → false', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(label: 'Toggle'),
      );
      expectCheckboxChecked(tester, 'Toggle', checked: false);
      await tester.tap(find.text('Toggle'));
      await tester.pumpAndSettle();
      expectCheckboxChecked(tester, 'Toggle', checked: true);
      await tester.tap(find.text('Toggle'));
      await tester.pumpAndSettle();
      expectCheckboxChecked(tester, 'Toggle', checked: false);
    });

    testWidgetsAllPlatforms('[fn] readOnly blocks onCheckedChange', (tester) async {
      var changed = false;
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(
          readOnly: true,
          label: 'Locked',
          onCheckedChange: (_) => changed = true,
        ),
      );
      await tester.tap(find.text('Locked'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });

  group('[functional] OneUiCheckbox — web Checkbox.test.tsx', () {
    testWidgetsAllPlatforms('[fn] renders label and toggles on tap', (tester) async {
      var checked = false;
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[fn] tap on label text toggles control', (tester) async {
      var checked = false;
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[fn] description renders below label', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(
          label: 'Subscribe',
          description: 'Weekly digest only.',
        ),
      );
      expect(find.text('Weekly digest only.'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] controlled checked state updates visually', (tester) async {
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[fn] defaultChecked uncontrolled starts checked', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(
          label: 'Uncontrolled',
          defaultChecked: true,
        ),
      );
      expectCheckboxChecked(tester, 'Uncontrolled', checked: true);
    });

    testWidgetsAllPlatforms('[fn] onCheckedChange fires false on uncheck', (tester) async {
      bool? last;
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[fn] forwards testId to keyed subtree', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(
          testId: 'qa-checkbox-root',
          label: 'QA',
        ),
      );
      expect(find.byKey(const ValueKey('qa-checkbox-root')), findsOneWidget);
    });
  });

  group('[functional] OneUiCheckboxGroup — web CheckboxGroup.test.tsx', () {
    testWidgetsAllPlatforms('[fn] multi-select adds and removes values', (tester) async {
      final values = <String>['a'];
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[fn] group disabled blocks all children', (tester) async {
      var changed = false;
      await pumpCheckboxQaHarness(
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
  });
}
