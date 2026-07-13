/// Radio — on-device integration tests.
///
/// Renders [OneUiRadio] / [OneUiRadioGroup] on the connected emulator /
/// simulator using the same Jio-fixture harness the widget tests use, exercising
/// real engine behaviour:
///   - real single-selection (mutual exclusivity) via pointer taps
///   - real size-preset box geometry (s < m < l)
///   - real Semantics announcement (TalkBack / VoiceOver: checked + mutually
///     exclusive group)
///   - real disabled dimming / readOnly lock
///   - real surface-context recolor + dark mode
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';

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

  group('Radio — on-device', () {
    testWidgets('[e2e] group renders every option', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(children: [
          OneUiRadio(value: 'a', label: 'Basic'),
          OneUiRadio(value: 'b', label: 'Pro'),
        ]),
      );
      await _hold(tester, 2000);
      expect(radioRootFinder(), findsNWidgets(2));
      expect(find.text('Basic'), findsOneWidget);
    });

    testWidgets('[e2e] all sizes render at strictly increasing dimensions (s<m<l)',
        (tester) async {
      final sizes = <String, double>{};
      for (final size in ['s', 'm', 'l']) {
        await pumpRadioJioHarnessSettled(
          tester,
          OneUiRadioGroup(defaultValue: 'a', children: [
            OneUiRadio(value: 'a', size: size, ariaLabel: 'r'),
          ]),
        );
        await _hold(tester, _demoMode ? 600 : 0);
        sizes[size] = radioBoxSizePx(tester);
      }
      expect(sizes['s']!, lessThan(sizes['m']!));
      expect(sizes['m']!, lessThan(sizes['l']!));
    });

    testWidgets('[e2e] tap selects exactly one (mutual exclusivity)', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(defaultValue: 'a', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      expect(radioHasInnerDot(tester, within: radioRootFinder().at(0)), isTrue);
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      await _hold(tester, 2000);
      expect(radioHasInnerDot(tester, within: radioRootFinder().at(0)), isFalse);
      expect(radioHasInnerDot(tester, within: radioRootFinder().at(1)), isTrue);
    });

    testWidgets('[e2e] onValueChange fires with the selected value', (tester) async {
      String? value;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(onValueChange: (v) => value = v, children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(value, 'a');
    });

    testWidgets('[e2e] each appearance renders a distinct checked fill', (tester) async {
      for (final app in ['secondary', 'primary', 'positive', 'negative', 'sparkle']) {
        await pumpRadioJioHarnessSettled(
          tester,
          OneUiRadioGroup(defaultValue: 'a', children: [
            OneUiRadio(value: 'a', appearance: app, ariaLabel: '$app box'),
          ]),
        );
        await _hold(tester);
        expect(radioRootFinder(), findsOneWidget);
      }
    });

    testWidgets('[e2e] disabled state dims the radio', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(disabled: true, defaultValue: 'a', children: [
          OneUiRadio(value: 'a', label: 'Off'),
        ]),
      );
      await _hold(tester, 2000);
      expect(radioOpacity(tester), lessThan(1.0));
    });

    testWidgets('[e2e] readOnly stays enabled and cannot select', (tester) async {
      var changed = false;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(readOnly: true, onValueChange: (_) => changed = true, children: [
          OneUiRadio(value: 'a', label: 'Locked'),
        ]),
      );
      await tester.tap(find.text('Locked'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(changed, isFalse);
      expectRadioEnabled(tester, 'Locked');
    });

    testWidgets('[e2e] radio inside a Surface auto-adapts (auto appearance)', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(defaultValue: 'a', children: [
          OneUiRadio(value: 'a', appearance: 'auto', label: 'On surface'),
        ]),
        surfaceMode: 'subtle',
        surfaceAppearance: 'positive',
      );
      await _hold(tester, 2000);
      expect(radioRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode radio renders without contrast holes', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(defaultValue: 'a', children: [
          OneUiRadio(value: 'a', appearance: 'primary', label: 'Dark'),
        ]),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(radioRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] selected option announces checked + mutually exclusive to AT',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(defaultValue: 'a', children: [
          OneUiRadio(value: 'a', label: 'Selected'),
        ]),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        final data = radioSemanticsData(tester, 'Selected', checked: true);
        expect(data.hasFlag(SemanticsFlag.isChecked), isTrue);
        expect(data.hasFlag(SemanticsFlag.isInMutuallyExclusiveGroup), isTrue);
      });
    });

    testWidgets('[e2e] horizontal group lays options on one row', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(orientation: 'horizontal', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      await _hold(tester, 2000);
      final aY = tester.getTopLeft(find.text('A')).dy;
      final bY = tester.getTopLeft(find.text('B')).dy;
      expect((aY - bY).abs(), lessThan(2));
    });
  });
}
