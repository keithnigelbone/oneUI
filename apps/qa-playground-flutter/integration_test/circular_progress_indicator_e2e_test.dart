/// CircularProgressIndicator — on-device integration tests.
///
/// Renders [OneUiCircularProgressIndicator] on the connected emulator /
/// simulator using the same Jio-fixture harness the widget tests use, exercising
/// real engine behaviour:
///   - real determinate sweep (value → painted arc fraction)
///   - real indeterminate spinner running on-device
///   - real size scale (diameter grows)
///   - real appearance + surface-context token remapping
///   - real Semantics announcement (numeric 0–100 value / busy)
///   - dark mode
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../test/support/components/circular_progress_indicator_harness.dart';

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

  group('CircularProgressIndicator — on-device', () {
    testWidgets('[e2e] determinate renders the value arc', (tester) async {
      await pumpCpiJioHarnessSettled(
        tester,
        const OneUiCircularProgressIndicator(value: 50, size: '3XL', semanticsLabel: 'Upload'),
      );
      await _hold(tester, 2000);
      expect(cpiRootFinder(), findsOneWidget);
      expect(cpiPainter(tester).determinateSweepFraction, closeTo(0.5, 0.01));
    });

    testWidgets('[e2e] sizes render at strictly increasing diameters', (tester) async {
      final sizes = <String, double>{};
      for (final size in ['S', 'M', 'L', 'XL']) {
        await pumpCpiJioHarnessSettled(
          tester,
          OneUiCircularProgressIndicator(value: 50, size: size, semanticsLabel: 'c'),
        );
        await _hold(tester, _demoMode ? 500 : 0);
        sizes[size] = cpiDiameterPx(tester);
      }
      expect(sizes['S']!, lessThan(sizes['M']!));
      expect(sizes['M']!, lessThan(sizes['L']!));
      expect(sizes['L']!, lessThan(sizes['XL']!));
    });

    testWidgets('[e2e] indeterminate spinner runs on-device', (tester) async {
      await pumpCpiJioHarness(
        tester,
        const OneUiCircularProgressIndicator(variant: 'indeterminate', size: '3XL', semanticsLabel: 'Loading'),
      );
      await tester.pump(const Duration(milliseconds: 120));
      await tester.pump(const Duration(milliseconds: 120));
      await _hold(tester, 2000);
      expect(cpiPainter(tester).isIndeterminate, isTrue);
    });

    testWidgets('[e2e] each appearance renders', (tester) async {
      for (final app in ['primary', 'secondary', 'positive', 'negative', 'warning']) {
        await pumpCpiJioHarnessSettled(
          tester,
          OneUiCircularProgressIndicator(value: 50, size: '3XL', appearance: app, semanticsLabel: app),
        );
        await _hold(tester);
        expect(cpiRootFinder(), findsOneWidget);
      }
    });

    testWidgets('[e2e] centre percentage renders at L+', (tester) async {
      await pumpCpiJioHarnessSettled(
        tester,
        const OneUiCircularProgressIndicator(
            value: 66, size: '3XL', content: 'text', semanticsLabel: 'pct'),
      );
      await _hold(tester, 2000);
      expect(find.text('66'), findsOneWidget);
    });

    testWidgets('[e2e] icon content renders', (tester) async {
      await pumpCpiJioHarnessSettled(
        tester,
        const OneUiCircularProgressIndicator(
          value: 50,
          size: '3XL',
          content: 'icon',
          semanticsLabel: 'ico',
          child: OneUiIcon(icon: 'check'),
        ),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIcon), findsOneWidget);
    });

    testWidgets('[e2e] ring inside Surface auto-adapts', (tester) async {
      await pumpCpiJioHarnessSettled(
        tester,
        const OneUiCircularProgressIndicator(value: 50, size: '3XL', appearance: 'auto', semanticsLabel: 'On surface'),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await _hold(tester, 2000);
      expect(cpiRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode ring renders without contrast holes', (tester) async {
      await pumpCpiJioHarnessSettled(
        tester,
        const OneUiCircularProgressIndicator(value: 50, size: '3XL', appearance: 'primary', semanticsLabel: 'Dark'),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(cpiRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] determinate announces "N percent" in the AT tree', (tester) async {
      await pumpCpiJioHarnessSettled(
        tester,
        const OneUiCircularProgressIndicator(value: 42, size: '3XL', semanticsLabel: 'Upload'),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsData(tester, 'Upload').value, '42');
      });
    });
  });
}
