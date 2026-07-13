/// LinearProgressIndicator — on-device integration tests.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';

import '../test/support/components/linear_progress_indicator_harness.dart';

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

  group('LinearProgressIndicator — on-device', () {
    testWidgets('[e2e] determinate fill fraction', (tester) async {
      await pumpLpiJioHarnessSettled(
        tester,
        const OneUiLinearProgressIndicator(value: 50, semanticsLabel: 'Upload'),
      );
      await _hold(tester);
      expect(lpiFillFraction(tester), closeTo(0.5, 0.05));
    });

    testWidgets('[e2e] sizes strictly increasing', (tester) async {
      final heights = <String, double>{};
      for (final size in ['S', 'M', 'L']) {
        await pumpLpiJioHarnessSettled(
          tester,
          OneUiLinearProgressIndicator(
            size: size,
            value: 50,
            semanticsLabel: 's',
          ),
        );
        await _hold(tester, _demoMode ? 500 : 0);
        heights[size] = lpiTrackHeightPx(tester);
      }
      expect(heights['S']!, lessThan(heights['M']!));
      expect(heights['M']!, lessThan(heights['L']!));
    });

    testWidgets('[e2e] indeterminate animation runs', (tester) async {
      await pumpLpiJioHarness(
        tester,
        const OneUiLinearProgressIndicator(
          type: 'indeterminate',
          semanticsLabel: 'Loading',
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));
      await _hold(tester);
      expect(lpiIsIndeterminate(tester), isTrue);
    });

    testWidgets('[e2e] semantics value percent', (tester) async {
      await pumpLpiJioHarnessSettled(
        tester,
        const OneUiLinearProgressIndicator(value: 42, semanticsLabel: 'Task'),
      );
      final handle = tester.ensureSemantics();
      try {
        expect(lpiSemanticsData(tester, 'Task').value, '42');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[e2e] dark mode renders', (tester) async {
      await pumpLpiJioHarnessSettled(
        tester,
        const OneUiLinearProgressIndicator(
          appearance: 'primary',
          value: 60,
          semanticsLabel: 'd',
        ),
        darkMode: true,
      );
      await _hold(tester);
      expect(lpiRootFinder(), findsOneWidget);
    });
  });
}
