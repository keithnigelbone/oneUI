/// Checkbox accessibility QA tests — RN `CheckboxA11y.test.ts` + widget semantics.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_types.dart';

import '../../support/components/checkbox_harness.dart';

void main() {
  group('[a11y] resolveCheckboxAccessibilityLabel — RN label fallback chain', () {
    test('[a11y] prefers semanticsLabel over ariaLabel and visible label', () {
      expect(
        resolveCheckboxAccessibilityLabel(
          semanticsLabel: 'Screen reader',
          ariaLabel: 'Aria',
          label: 'Visible',
        ),
        'Screen reader',
      );
    });

    test('[a11y] prefers ariaLabel over visible label', () {
      expect(
        resolveCheckboxAccessibilityLabel(
          ariaLabel: 'Aria only',
          label: 'Visible',
        ),
        'Aria only',
      );
    });

    test('[a11y] falls back to description when label omitted', () {
      expect(
        resolveCheckboxAccessibilityLabel(
          description: 'Weekly digest only.',
        ),
        'Weekly digest only.',
      );
    });
  });

  group('[a11y] getCheckboxAccessibilityProps — RN CheckboxA11y.test.ts', () {
    test('[a11y] exposes checked=true when selected', () {
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

    test('[a11y] reports mixed state for indeterminate', () {
      final a11y = getCheckboxAccessibilityProps(
        ariaLabel: 'Mixed',
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: true,
      );
      expect(a11y.checked, 'mixed');
    });

    test('[a11y] forwards aria-describedby as describedBy', () {
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

    test('[a11y] marks disabled state and blocks tap', () {
      final a11y = getCheckboxAccessibilityProps(
        ariaLabel: 'Box',
        isDisabled: true,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: false,
      );
      expect(a11y.canTap, isFalse);
    });

    test('[a11y] readOnly allows exposure but blocks tap', () {
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

    test('[a11y] aria-hidden collapses exposure', () {
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
  });

  group('[a11y] resolveOneUiCheckboxState — RN useCheckboxState', () {
    test('[a11y] defaults size=m, appearance=secondary, enabled', () {
      final state = resolveOneUiCheckboxState(isChecked: false);
      expect(state.resolvedSize, 'm');
      expect(state.resolvedAppearance, 'secondary');
      expect(state.isDisabled, isFalse);
      expect(state.isReadOnly, isFalse);
    });

    test('[a11y] canonicalises legacy size aliases', () {
      expect(resolveOneUiCheckboxState(size: 'small', isChecked: false).resolvedSize, 's');
      expect(resolveOneUiCheckboxState(size: 'medium', isChecked: false).resolvedSize, 'm');
      expect(resolveOneUiCheckboxState(size: 'large', isChecked: false).resolvedSize, 'l');
    });
  });

  group('[a11y] Checkbox — role and name (RN a11y parity)', () {
    testWidgetsAllPlatforms('[a11y] checkbox semantics expose checked state when unselected', (tester) async {
      await pumpCheckboxQaHarness(tester, OneUiCheckbox(label: 'Option', checked: false));
      withSemanticsHandle(tester, () {
        final d = checkboxSemanticsData(tester, 'Option', checked: false);
        expect(d.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isChecked), isFalse);
      });
    });

    testWidgetsAllPlatforms('[a11y] label prop becomes accessible name', (tester) async {
      await pumpCheckboxQaHarness(tester, OneUiCheckbox(label: 'Accept terms'));
      withSemanticsHandle(tester, () {
        expect(checkboxSemanticsLabel('Accept terms'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] readOnly stays enabled in semantics (RN parity)', (tester) async {
      await pumpCheckboxQaHarness(tester, OneUiCheckbox(readOnly: true, label: 'Locked'));
      expectCheckboxReadOnlyEnabled(tester, 'Locked');
    });

    testWidgetsAllPlatforms('[a11y] disabled marks not enabled', (tester) async {
      await pumpCheckboxQaHarness(tester, OneUiCheckbox(disabled: true, label: 'Off'));
      expectCheckboxDisabled(tester, 'Off');
    });
  });

  group('[a11y] OneUiCheckbox — widget semantics', () {
    testWidgetsAllPlatforms('[a11y] description-only uses description as accessible name', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(description: 'Weekly digest only.'),
      );
      expect(find.text('Weekly digest only.'), findsOneWidget);
      withSemanticsHandle(tester, () {
        expectCheckboxChecked(tester, 'Weekly digest only.', checked: false);
      });
    });

    testWidgetsAllPlatforms('[a11y] ariaLabel overrides visible label in semantics', (tester) async {
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] renders without visible label', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(ariaLabel: 'Standalone'),
      );
      withSemanticsHandle(tester, () {
        expect(checkboxSemanticsLabel('Standalone'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] checked semantics flip on tap', (tester) async {
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] indeterminate exposes mixed semantics', (tester) async {
      await pumpCheckboxQaHarness(
        tester,
        OneUiCheckbox(
          label: 'Select all',
          indeterminate: true,
        ),
      );
      expectCheckboxMixed(tester, 'Select all');
    });

    testWidgetsAllPlatforms('[a11y] disabled blocks toggle and semantics', (tester) async {
      var changed = false;
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] readOnly stays enabled but cannot toggle', (tester) async {
      var changed = false;
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] aria-hidden excludes control from semantics tree', (tester) async {
      await pumpCheckboxQaHarness(
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

    testWidgetsAllPlatforms('[a11y] accessibilityHint surfaces in semantics', (tester) async {
      await pumpCheckboxQaHarness(
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
  });
}
