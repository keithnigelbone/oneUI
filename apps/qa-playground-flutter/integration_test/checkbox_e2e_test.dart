/// Checkbox — on-device integration tests.
///
/// Renders [OneUiCheckbox] / [OneUiCheckboxGroup] on the connected emulator /
/// simulator using the same Jio-fixture harness the widget tests use, exercising
/// real engine behaviour:
///   - real surface-context token remapping (unchecked-appearance inheritance)
///   - real pointer toggles + uncontrolled state
///   - real group multi-select
///   - real Semantics announcement (TalkBack / VoiceOver: checked / mixed)
///   - dark mode
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_group.dart';

import '../test/support/components/checkbox_harness.dart';

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

  group('Checkbox — on-device', () {
    testWidgets('[e2e] default renders a box', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'Accept terms'),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiCheckbox), findsOneWidget);
      expect(find.text('Accept terms'), findsOneWidget);
    });

    testWidgets('[e2e] all sizes render at strictly increasing dimensions (s<m<l)',
        (tester) async {
      final sizes = <String, double>{};
      for (final size in ['s', 'm', 'l']) {
        await pumpCheckboxJioHarnessSettled(
          tester,
          OneUiCheckbox(ariaLabel: 'cb', size: size, checked: true),
        );
        await _hold(tester, _demoMode ? 600 : 0);
        sizes[size] = checkboxBoxSizePx(tester);
      }
      expect(sizes['s']!, lessThan(sizes['m']!));
      expect(sizes['m']!, lessThan(sizes['l']!));
    });

    testWidgets('[e2e] each of the 3 state rows renders', (tester) async {
      for (final state in ['unchecked', 'checked', 'indeterminate']) {
        await pumpCheckboxJioHarnessSettled(
          tester,
          OneUiCheckbox(
            label: 'State $state',
            checked: state == 'checked',
            indeterminate: state == 'indeterminate',
          ),
        );
        await _hold(tester);
        expect(find.byType(OneUiCheckbox), findsOneWidget);
      }
    });

    testWidgets('[e2e] uncontrolled toggle flips on tap', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'Toggle'),
      );
      expectCheckboxChecked(tester, 'Toggle', checked: false);
      await tester.tap(find.text('Toggle'));
      await tester.pumpAndSettle();
      await _hold(tester, 2000);
      expectCheckboxChecked(tester, 'Toggle', checked: true);
    });

    testWidgets('[e2e] group multi-select adds and removes values', (tester) async {
      final values = <String>['a'];
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckboxGroup(
          defaultValue: const ['a'],
          onValueChange: (v) => values
            ..clear()
            ..addAll(v),
          children: [
            OneUiCheckbox(value: 'a', label: 'Apples'),
            OneUiCheckbox(value: 'b', label: 'Bananas'),
            OneUiCheckbox(value: 'c', label: 'Cherries'),
          ],
        ),
      );
      await tester.tap(find.text('Bananas'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(values, containsAll(['a', 'b']));

      await tester.tap(find.text('Apples'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(values, ['b']);
    });

    testWidgets('[e2e] each appearance renders distinctly', (tester) async {
      for (final app in ['secondary', 'primary', 'positive', 'negative', 'sparkle']) {
        await pumpCheckboxJioHarnessSettled(
          tester,
          OneUiCheckbox(ariaLabel: '$app box', appearance: app, checked: true),
        );
        await _hold(tester);
        expect(find.byType(OneUiCheckbox), findsOneWidget);
      }
    });

    testWidgets('[e2e] disabled state dims the checkbox', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'Off', disabled: true, checked: true),
      );
      await _hold(tester, 2000);
      final op = tester.widget<Opacity>(find
          .descendant(of: checkboxRootFinder(), matching: find.byType(Opacity))
          .first);
      expect(op.opacity, lessThan(1.0));
    });

    testWidgets('[e2e] readOnly stays enabled and cannot toggle', (tester) async {
      var changed = false;
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(
          label: 'Locked',
          readOnly: true,
          checked: true,
          onCheckedChange: (_) => changed = true,
        ),
      );
      await tester.tap(find.text('Locked'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(changed, isFalse);
      expectCheckboxReadOnlyEnabled(tester, 'Locked');
    });

    testWidgets('[e2e] checkbox inside Surface auto-adapts (auto appearance)',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'On surface', appearance: 'auto', checked: false),
        surfaceMode: 'subtle',
        surfaceAppearance: 'positive',
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiCheckbox), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode checkbox renders without contrast holes',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'Dark', appearance: 'primary', checked: true),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiCheckbox), findsOneWidget);
    });

    testWidgets('[e2e] indeterminate announces mixed to AT', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'Select all', indeterminate: true),
      );
      await _hold(tester, 2000);
      expectCheckboxMixed(tester, 'Select all');
    });

    testWidgets('[e2e] labelled checkbox exposes label in AT tree', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'Accept terms'),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        expect(checkboxSemanticsLabel('Accept terms'), findsOneWidget);
      });
    });

    testWidgets('[e2e] testId locator works in-process', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'QA', testId: 'qa-checkbox'),
      );
      await _hold(tester);
      expect(find.byKey(const ValueKey('qa-checkbox')), findsOneWidget);
    });
  });
}
