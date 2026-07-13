import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field_types.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_types.dart';

import 'checkbox_test_harness.dart';

void main() {
  group('resolveOneUiCheckboxFieldState — RN useCheckboxFieldState', () {
    test('integrated single when no children', () {
      final state = resolveOneUiCheckboxFieldState(
        label: 'Email updates',
        flattenedChildren: const [],
      );
      expect(state.integratedSingle, isTrue);
      expect(state.multiOptionMode, isFalse);
    });

    test('multi when children present', () {
      final state = resolveOneUiCheckboxFieldState(
        label: 'Options',
        flattenedChildren: [
          OneUiCheckbox(value: 'a', label: 'A'),
          OneUiCheckbox(value: 'b', label: 'B'),
        ],
      );
      expect(state.multiOptionMode, isTrue);
      expect(state.integratedSingle, isFalse);
    });

    test('invalid from error string', () {
      final state = resolveOneUiCheckboxFieldState(
        error: 'Required',
        flattenedChildren: const [],
      );
      expect(state.isInvalid, isTrue);
    });

    test('hasInfoIcon requires infoIcon flag and non-empty label', () {
      expect(
        resolveOneUiCheckboxFieldState(
          flattenedChildren: const [],
          label: 'Terms',
          infoIcon: true,
        ).hasInfoIcon,
        isTrue,
      );
      expect(
        resolveOneUiCheckboxFieldState(
          flattenedChildren: const [],
          infoIcon: true,
        ).hasInfoIcon,
        isFalse,
      );
    });

    test('encodes web data-* payload on state', () {
      final s = resolveOneUiCheckboxFieldState(
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
      expect(s.dataPayloadKey, contains('oneui-checkbox-field'));
      expect(s.dataPayloadKey, contains('data-size=m'));
      expect(s.dataPayloadKey, contains('data-disabled=true'));
      expect(s.dataPayloadKey, contains('data-invalid=true'));
    });

    test('Figma API size row matches s/m/l', () {
      expect(kOneUiCheckboxFieldFigmaSizes, ['s', 'm', 'l']);
    });
  });

  group('flattenCheckboxFieldChildren — web flattenFieldChildren', () {
    test('unwraps Column of checkboxes', () {
      final flat = flattenCheckboxFieldChildren([
        Column(
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
            OneUiCheckbox(value: 'b', label: 'B'),
          ],
        ),
      ]);
      expect(flat.length, 2);
      expect(flat.every((w) => w is OneUiCheckbox), isTrue);
    });
  });

  group('resolveOneUiCheckboxFieldAccessibility — RN CheckboxFieldA11y', () {
    test('field label as accessibilityLabel', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'Notifications',
      );
      expect(a11y.accessibilityLabel, 'Notifications');
    });

    test('aria-label overrides visible label', () {
      final a11y = resolveOneUiCheckboxFieldAccessibility(
        label: 'Visible',
        ariaLabel: 'Override',
      );
      expect(a11y.accessibilityLabel, 'Override');
    });
  });

  group('checkboxFieldSizeToInputNumeric', () {
    test('maps s/m/l and legacy aliases', () {
      expect(checkboxFieldSizeToInputNumeric('s'), 8);
      expect(checkboxFieldSizeToInputNumeric('m'), 10);
      expect(checkboxFieldSizeToInputNumeric('l'), 12);
      expect(checkboxFieldSizeToInputNumeric('small'), 8);
      expect(checkboxFieldSizeToInputNumeric('medium'), 10);
      expect(checkboxFieldSizeToInputNumeric('large'), 12);
      expect(checkboxFieldSizeToInputNumeric(null), 10);
    });
  });

  group('OneUiCheckboxField widget — web CheckboxField.test.tsx parity', () {
    testWidgetsAllPlatforms('integrated single renders label', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Email me about product updates',
        ),
      );
      expect(find.text('Email me about product updates'), findsOneWidget);
      expect(find.byType(OneUiCheckbox), findsOneWidget);
    });

    testWidgetsAllPlatforms('multi options render children', (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Contact method',
          groupDefaultValue: const ['email'],
          children: [
            OneUiCheckbox(value: 'email', label: 'Email'),
            OneUiCheckbox(value: 'sms', label: 'SMS'),
          ],
        ),
      );
      expect(find.text('Contact method'), findsOneWidget);
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('SMS'), findsOneWidget);
    });

    testWidgetsAllPlatforms('required asterisk visible', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Terms',
          required: true,
        ),
      );
      expect(find.textContaining('*'), findsOneWidget);
    });

    testWidgetsAllPlatforms('error feedback renders', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Subscribe',
          error: 'You must accept to continue',
        ),
      );
      expect(find.text('You must accept to continue'), findsOneWidget);
    });

    testWidgetsAllPlatforms('integrated toggles checked state', (tester) async {
      var checked = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Updates',
          checked: checked,
          onCheckedChange: (v) => checked = v,
        ),
      );

      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(checked, isTrue);
    });

    testWidgetsAllPlatforms('exposes data-* payload KeyedSubtree on root',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Checkbox',
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
                  .contains('oneui-checkbox-field|data-size=m'),
        ),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms(
        'infoIcon renders default info control beside label', (tester) async {
      await pumpCheckboxHarness(
        tester,
        const OneUiCheckboxField(
          label: 'Checkbox',
          infoIcon: true,
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('More information'), findsOneWidget);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('onHelperPress alias fires helper action',
        (tester) async {
      var pressed = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxField(
          label: 'Terms',
          helperButton: 'Help',
          onHelperPress: () => pressed = true,
        ),
      );
      await tester.tap(find.text('Help'));
      await tester.pump();
      expect(pressed, isTrue);
    });
  });
}
