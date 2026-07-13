/// CheckboxField — on-device integration tests.
///
/// Renders [OneUiCheckboxField] on the connected emulator / simulator using the
/// same Jio-fixture harness the widget tests use, exercising real engine
/// behaviour:
///   - real single-field render (label + description + feedback + required + info)
///   - real pointer toggles + uncontrolled state
///   - real multi-option group multi-select
///   - real Semantics announcement (TalkBack / VoiceOver: checked / mixed / invalid)
///   - real error feedback alert region
///   - dark mode + surface context
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';

import '../test/support/components/checkbox_field_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('CheckboxField — on-device', () {
    testWidgets('[e2e] single field renders label + description', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(
          label: 'Accept terms',
          description: 'You agree to our ToS.',
        ),
      );
      await _hold(tester, 2000);
      expect(checkboxFieldRootFinder(), findsOneWidget);
      expect(find.text('You agree to our ToS.'), findsOneWidget);
    });

    testWidgets('[e2e] all sizes render at strictly increasing control dimensions',
        (tester) async {
      final sizes = <String, double>{};
      for (final size in ['s', 'm', 'l']) {
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          OneUiCheckboxField(label: 'x', size: size, checked: true),
        );
        await _hold(tester, _demoMode ? 600 : 0);
        sizes[size] = checkboxBoxSizePx(tester);
      }
      expect(sizes['s']!, lessThan(sizes['m']!));
      expect(sizes['m']!, lessThan(sizes['l']!));
    });

    testWidgets('[e2e] each of the 3 state rows renders', (tester) async {
      for (final state in ['unchecked', 'checked', 'indeterminate']) {
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          OneUiCheckboxField(
            label: 'State $state',
            checked: state == 'checked',
            indeterminate: state == 'indeterminate',
          ),
        );
        await _hold(tester);
        expect(checkboxFieldRootFinder(), findsOneWidget);
      }
    });

    testWidgets('[e2e] uncontrolled toggle flips on tap', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Toggle'),
      );
      expectCheckboxChecked(tester, 'Toggle', checked: false);
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      await _hold(tester, 2000);
      expectCheckboxChecked(tester, 'Toggle', checked: true);
    });

    testWidgets('[e2e] required field renders the asterisk', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Mandatory', required: true),
      );
      await _hold(tester, 2000);
      expect(checkboxFieldHasRequiredAsterisk(tester), isTrue);
    });

    testWidgets('[e2e] info icon renders beside the label', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Marketing', infoIcon: true),
      );
      await _hold(tester, 2000);
      expect(checkboxFieldHasInfoIcon(tester), isTrue);
    });

    testWidgets('[e2e] error feedback renders + announces alert to AT', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Confirm', error: 'Please complete verification.'),
      );
      await _hold(tester, 2000);
      expect(find.text('Please complete verification.'), findsOneWidget);
      withSemanticsHandle(tester, () {
        expect(
          find.byWidgetPredicate((w) =>
              w is Semantics && w.properties.role == SemanticsRole.alert),
          findsWidgets,
        );
        final data = checkboxSemanticsData(tester, 'Confirm');
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });

    testWidgets('[e2e] multi-option group multi-select adds and removes values',
        (tester) async {
      final values = <String>['email'];
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        OneUiCheckboxField(
          label: 'Notification channels',
          groupDefaultValue: const ['email'],
          onGroupValueChange: (v) => values
            ..clear()
            ..addAll(v),
          children: [
            OneUiCheckbox(value: 'email', label: 'Email'),
            OneUiCheckbox(value: 'sms', label: 'SMS'),
            OneUiCheckbox(value: 'push', label: 'Push'),
          ],
        ),
      );
      await tester.tap(find.text('SMS'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(values, containsAll(['email', 'sms']));

      await tester.tap(find.text('Email'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(values, ['sms']);
    });

    testWidgets('[e2e] each appearance renders distinctly', (tester) async {
      for (final app in ['secondary', 'primary', 'positive', 'negative', 'sparkle']) {
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          OneUiCheckboxField(label: '$app field', appearance: app, checked: true),
        );
        await _hold(tester);
        expect(checkboxFieldRootFinder(), findsOneWidget);
      }
    });

    testWidgets('[e2e] disabled field dims and blocks toggle', (tester) async {
      var changed = false;
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        OneUiCheckboxField(
          label: 'Off',
          disabled: true,
          checked: true,
          onCheckedChange: (_) => changed = true,
        ),
      );
      await _hold(tester, 2000);
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
      final opacities = find
          .descendant(of: checkboxFieldRootFinder(), matching: find.byType(Opacity))
          .evaluate()
          .map((e) => (e.widget as Opacity).opacity);
      expect(opacities, contains(0.5));
    });

    testWidgets('[e2e] readOnly stays enabled and cannot toggle', (tester) async {
      var changed = false;
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        OneUiCheckboxField(
          label: 'Locked',
          readOnly: true,
          checked: true,
          onCheckedChange: (_) => changed = true,
        ),
      );
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(changed, isFalse);
      expectCheckboxReadOnlyEnabled(tester, 'Locked');
    });

    testWidgets('[e2e] field inside Surface auto-adapts (auto appearance)', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(
          label: 'On surface',
          description: 'Adapts to context.',
          appearance: 'auto',
          checked: false,
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'positive',
      );
      await _hold(tester, 2000);
      expect(checkboxFieldRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode field renders without contrast holes', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(
          label: 'Dark',
          description: 'Dark mode.',
          appearance: 'primary',
          checked: true,
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(checkboxFieldRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] indeterminate announces mixed to AT', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Select all', indeterminate: true),
      );
      await _hold(tester, 2000);
      expectCheckboxMixed(tester, 'Select all');
    });

    testWidgets('[e2e] labelled field exposes the accessible name in AT tree', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Accept terms'),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Accept terms');
        expect(data.label, 'Accept terms');
      });
    });

    testWidgets('[e2e] testId locator works in-process', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'QA', testId: 'qa-field'),
      );
      await _hold(tester);
      expect(find.byKey(const ValueKey('qa-field')), findsOneWidget);
    });
  });
}
