/// CounterBadge — on-device integration tests.
///
/// Renders [OneUiCounterBadge] standalone on the connected emulator /
/// simulator using the same harness widget tests use
/// (`pumpCounterBadgeQaHarness`), so the component fills the screen and you
/// can watch real engine behaviour:
///   - actual digit rendering at device pixel density
///   - actual dot-mode geometry at xs + bold
///   - real overflow handling (99+)
///   - real surface-context token remapping
///   - real live-region semantics announcement
///
/// **Two modes**, picked via `--dart-define=DEMO_MODE`:
///
///   `DEMO_MODE=false` (default, CI-friendly): framework-speed.
///   `DEMO_MODE=true` (interactive / debugging): holds each variant ~1.5s.
///
/// Run:
///   flutter test integration_test/counter_badge_e2e_test.dart -d emulator-5554
///   flutter test integration_test/counter_badge_e2e_test.dart -d "iPhone 17 Pro"
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';

import '../test/support/components/counter_badge_harness.dart';

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

  group('CounterBadge — on-device', () {
    testWidgets('[e2e] high attention / primary — "8" renders', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          attention: 'high',
          appearance: 'primary',
          semanticsLabel: '8 unread',
        ),
      );
      await _hold(tester, 2000);
      expect(find.text('8'), findsOneWidget);
    });

    testWidgets('[e2e] medium attention / subtle variant', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          attention: 'medium',
          appearance: 'primary',
          semanticsLabel: '8',
        ),
      );
      await _hold(tester);
      expect(find.text('8'), findsOneWidget);
    });

    testWidgets('[e2e] low attention / ghost variant', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          attention: 'low',
          appearance: 'primary',
          semanticsLabel: '8',
        ),
      );
      await _hold(tester);
      expect(find.text('8'), findsOneWidget);
    });

    testWidgets('[e2e] dot-mode (xs + high) renders as a dot, no numerals',
        (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 5,
          size: 'xs',
          attention: 'high',
          appearance: 'negative',
          semanticsLabel: '5 alerts',
        ),
      );
      await _hold(tester, 2000);
      expect(find.text('5'), findsNothing,
          reason: 'xs + bold (dot-mode) suppresses numerals');
      expect(find.byType(OneUiCounterBadge), findsOneWidget);
    });

    testWidgets('[e2e] overflow value renders "99+"', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 150,
          attention: 'high',
          appearance: 'primary',
          semanticsLabel: '99+',
        ),
      );
      await _hold(tester, 2000);
      expect(find.text('99+'), findsOneWidget);
    });

    testWidgets('[e2e] size variants xs / s / m / l / xl render at increasing heights',
        (tester) async {
      final heights = <String, double>{};
      for (final size in ['xs', 's', 'm', 'l', 'xl']) {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          OneUiCounterBadge(
            value: 5,
            size: size,
            attention: 'medium',
            appearance: 'primary',
            semanticsLabel: 'Size $size',
          ),
        );
        await _hold(tester, _demoMode ? 1000 : 0);
        heights[size] = tester.getSize(counterBadgeRootFinder()).height;
      }
      expect(heights['xs']!, lessThanOrEqualTo(heights['s']!));
      expect(heights['s']!, lessThanOrEqualTo(heights['m']!));
      expect(heights['m']!, lessThanOrEqualTo(heights['l']!));
      expect(heights['l']!, lessThanOrEqualTo(heights['xl']!));
      expect(heights['xl']!, greaterThan(heights['xs']!));
    });

    testWidgets('[e2e] counter inside Surface auto-adapts colors', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          attention: 'high',
          appearance: 'auto',
          semanticsLabel: '8',
        ),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await _hold(tester, 2000);
      expect(find.text('8'), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode counter renders without contrast holes',
        (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          attention: 'high',
          appearance: 'primary',
          semanticsLabel: '8',
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(find.text('8'), findsOneWidget);
    });

    testWidgets('[e2e] value=0 + showZero=false → hidden',
        (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 0, semanticsLabel: '0'),
      );
      await _hold(tester);
      expect(find.text('0'), findsNothing);
    });
  });
}
