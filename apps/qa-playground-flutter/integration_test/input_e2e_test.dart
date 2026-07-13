/// Input — on-device integration tests.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import '../test/support/components/input_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputIconsLoaded();
  });

  group('Input — on-device', () {
    testWidgets('[e2e] default input renders + accepts text', (tester) async {
      String? last;
      await pumpInputJioHarnessSettled(
        tester,
        OneUiInput(
          placeholder: 'Email',
          onChanged: (v) => last = v,
        ),
      );
      await _hold(tester, 2000);
      expect(inputRootFinder(), findsOneWidget);
      await tester.enterText(inputTextFieldFinder(), 'test@jio.com');
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(last, 'test@jio.com');
    });

    testWidgets('[e2e] sizes render at touch-clamped non-decreasing heights',
        (tester) async {
      final sizes = <String, double>{};
      for (final entry in {
        'xs': OneUiInputSize.xs,
        's': OneUiInputSize.s,
        'm': OneUiInputSize.m,
        'l': OneUiInputSize.l,
      }.entries) {
        await pumpInputJioHarnessSettled(
          tester,
          OneUiInput(size: entry.value, placeholder: entry.key),
        );
        await _hold(tester, _demoMode ? 400 : 0);
        final numeric = resolveOneUiInputNumericSize(entry.value);
        expect(
          inputShellHeightPx(tester),
          expectedInputShellHeightPx(numeric),
          reason: 'size=${entry.key} on S-360 (WCAG touch floor)',
        );
        sizes[entry.key] = inputShellHeightPx(tester);
      }
      // xs/s/m clamp to 44px on mobile — monotonic, not strictly increasing.
      expect(sizes['xs']!, lessThanOrEqualTo(sizes['s']!));
      expect(sizes['s']!, lessThanOrEqualTo(sizes['m']!));
      expect(sizes['m']!, lessThanOrEqualTo(sizes['l']!));
      expect(sizes['l']!, greaterThan(sizes['xs']!),
          reason: 'l (f12) exceeds touch-clamped xs/s/m floor');
    });

    testWidgets('[e2e] disabled blocks editing', (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(value: 'Locked', disabled: true),
      );
      await _hold(tester, 2000);
      expect(inputTextField(tester).enabled, isFalse);
    });

    testWidgets('[e2e] inside Surface auto-adapts', (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(
          appearance: OneUiInputAppearance.auto,
          placeholder: 'Auto',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await _hold(tester, 2000);
      expect(inputRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode input renders', (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(
          appearance: OneUiInputAppearance.primary,
          placeholder: 'Email',
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(inputRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] labelled control exposes name in AT tree', (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(ariaLabel: 'Email address', placeholder: 'email'),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        final data = inputControlSemanticsData(tester);
        expect(data.label, contains('Email address'));
        expect(data.hasFlag(SemanticsFlag.isTextField), isTrue);
      });
    });
  });
}
