/// RadioField — on-device integration tests.
///
/// Renders [OneUiRadioField] on the connected emulator / simulator using the
/// same Jio-fixture harness the widget tests use, exercising real behaviour
/// across the integrated-single, plain, and multi composition modes:
///   - real single-selection via pointer taps
///   - real integrated-single deselect-on-reselect
///   - real content slots (description / required / infoIcon / feedback)
///   - real disabled dimming / readOnly lock
///   - real radiogroup Semantics + dark mode
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
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';

import '../test/support/components/radio_harness.dart';

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

  group('RadioField — on-device', () {
    testWidgets('[e2e] integrated single renders label + lone control', (tester) async {
      await pumpRadioJioHarnessSettled(tester, OneUiRadioField(label: 'Enable feature'));
      await _hold(tester, 2000);
      expect(radioFieldRootFinder(), findsOneWidget);
      expect(radioRootFinder(), findsOneWidget);
      expect(find.text('Enable feature'), findsOneWidget);
    });

    testWidgets('[e2e] integrated single toggles on/off (deselect on reselect)', (tester) async {
      bool? checked;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Enable', onCheckedChange: (v) => checked = v),
      );
      await tester.tap(find.byType(OneUiRadio));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(checked, isTrue);
      await tester.tap(find.byType(OneUiRadio));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(checked, isFalse);
    });

    testWidgets('[e2e] multi field selects exactly one option', (tester) async {
      String? value;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', onValueChange: (v) => value = v, children: [
          OneUiRadio(value: 'basic', label: 'Basic'),
          OneUiRadio(value: 'pro', label: 'Pro'),
        ]),
      );
      await tester.tap(find.text('Pro'));
      await tester.pumpAndSettle();
      await _hold(tester, 2000);
      expect(value, 'pro');
      expectRadioChecked(tester, 'Pro', checked: true);
      expectRadioChecked(tester, 'Basic', checked: false);
    });

    testWidgets('[e2e] description + required + infoIcon render together', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(
          label: 'Plan',
          description: 'Pick exactly one.',
          required: true,
          infoIcon: true,
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      await _hold(tester, 2000);
      expect(find.text('Pick exactly one.'), findsOneWidget);
      expect(find.textContaining('*'), findsOneWidget);
      expect(find.byType(OneUiIconButton), findsOneWidget);
    });

    testWidgets('[e2e] error feedback renders the message', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', error: 'Choose a plan', children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      await _hold(tester, 2000);
      expect(find.text('Choose a plan'), findsOneWidget);
    });

    testWidgets('[e2e] disabled field dims + blocks selection', (tester) async {
      var changed = false;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', disabled: true, onValueChange: (_) => changed = true,
            children: [OneUiRadio(value: 'a', label: 'A')]),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      await _hold(tester, 2000);
      expect(changed, isFalse);
      expect(radioFieldOpacity(tester), lessThan(1.0));
    });

    testWidgets('[e2e] readOnly field stays enabled and cannot select', (tester) async {
      var changed = false;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', readOnly: true, onValueChange: (_) => changed = true,
            children: [OneUiRadio(value: 'a', label: 'Locked')]),
      );
      await tester.tap(find.text('Locked'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(changed, isFalse);
      expectRadioEnabled(tester, 'Locked');
    });

    testWidgets('[e2e] multi field exposes the radiogroup role', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        final grp = find.descendant(
          of: radioGroupFinder(),
          matching: find.byWidgetPredicate(
              (w) => w is Semantics && w.properties.role == SemanticsRole.radioGroup),
        );
        expect(grp, findsOneWidget);
      });
    });

    testWidgets('[e2e] horizontal field lays options on one row', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(orientation: 'horizontal', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      await _hold(tester, 2000);
      final aY = tester.getTopLeft(find.text('A')).dy;
      final bY = tester.getTopLeft(find.text('B')).dy;
      expect((aY - bY).abs(), lessThan(2));
    });

    testWidgets('[e2e] dark-mode field renders', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', defaultValue: 'a', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(radioFieldRootFinder(), findsOneWidget);
    });
  });
}
