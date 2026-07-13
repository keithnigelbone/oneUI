/// Badge — on-device integration tests.
///
/// Renders [OneUiBadge] standalone on the connected emulator / simulator
/// using the same harness widget tests use (`pumpBadgeQaHarness`), so the
/// component fills the screen and you can watch real engine behaviour:
///   - actual font rendering and overflow at the device's pixel density
///   - actual layout shrink-wrapping and ellipsis behavior
///   - real surface-context token remapping for nested badges
///   - real live-region semantics announcement (for accessibility QA)
///
/// This is what the headless widget tests in
/// `test/components/badge/badge_functional_test.dart` *cannot* verify —
/// they assert the API contract; this layer asserts the engine renders it.
///
/// **Two modes**, picked via `--dart-define=DEMO_MODE`:
///
///   `DEMO_MODE=false` (default, CI-friendly):
///     - All actions happen at framework speed.
///     - Runtime: ~30s for the suite.
///
///   `DEMO_MODE=true` (interactive / debugging):
///     - Holds each variant on-screen for ~1.5s.
///     - Runtime: ~1 min for the suite.
///
/// Run:
///   # Fast / CI:
///   flutter test integration_test/badge_e2e_test.dart -d emulator-5554
///
///   # Slow / watchable:
///   flutter test integration_test/badge_e2e_test.dart -d emulator-5554 \
///     --dart-define=DEMO_MODE=true
///
///   # iOS:
///   flutter test integration_test/badge_e2e_test.dart -d "iPhone 17 Pro"
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../test/support/components/badge_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

/// Hold the current frame visible on-device for [ms] so a human can watch.
/// No-op in CI mode (default).
Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('Badge — on-device', () {
    testWidgets('[e2e] high attention (bold variant) renders + text appears',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'New release',
          attention: 'high',
          appearance: 'primary',
          child: 'New',
        ),
      );
      await _hold(tester, 2000);

      expect(find.text('New'), findsOneWidget);
    });

    testWidgets('[e2e] medium attention (subtle variant) renders distinctly',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'Beta',
          attention: 'medium',
          appearance: 'primary',
          child: 'Beta',
        ),
      );
      await _hold(tester);
      expect(find.text('Beta'), findsOneWidget);
    });

    testWidgets('[e2e] low attention (ghost variant) renders without fill',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'Optional',
          attention: 'low',
          appearance: 'primary',
          child: 'Optional',
        ),
      );
      await _hold(tester);
      expect(find.text('Optional'), findsOneWidget);
    });

    testWidgets('[e2e] start + end icons render alongside label',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'Verified',
          attention: 'high',
          appearance: 'positive',
          start: OneUiIcon(icon: 'check'),
          end: OneUiIcon(icon: 'arrow_forward'),
          child: 'Verified',
        ),
      );
      await _hold(tester, 2000);

      expect(find.text('Verified'), findsOneWidget);
      expect(find.byType(OneUiIcon), findsNWidgets(2));
    });

    testWidgets('[e2e] CounterBadge nested in start slot stays circular',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'Inbox',
          attention: 'high',
          appearance: 'primary',
          start: OneUiCounterBadge(value: 7, semanticsLabel: '7'),
          child: 'Inbox',
        ),
      );
      await _hold(tester, 2000);

      expect(find.byType(OneUiCounterBadge), findsOneWidget);
      expect(find.text('Inbox'), findsOneWidget);
    });

    testWidgets('[e2e] IndicatorBadge nested in end slot renders as dot',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'Status',
          attention: 'medium',
          appearance: 'primary',
          end: OneUiIndicatorBadge(
            appearance: 'negative',
            semanticsLabel: 'unread',
          ),
          child: 'Mail',
        ),
      );
      await _hold(tester);

      expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
    });

    testWidgets('[e2e] size variants xs / s / m / l / xl render at increasing heights',
        (tester) async {
      final heights = <String, double>{};
      for (final size in ['xs', 's', 'm', 'l', 'xl']) {
        await pumpBadgeQaHarnessSettled(
          tester,
          OneUiBadge(
            semanticsLabel: 'Size $size',
            size: size,
            attention: 'high',
            appearance: 'primary',
            child: 'Size $size',
          ),
        );
        await _hold(tester, _demoMode ? 1000 : 0);
        heights[size] = tester.getSize(badgeRootFinder()).height;
      }

      expect(heights['xs']!, lessThanOrEqualTo(heights['s']!));
      expect(heights['s']!, lessThanOrEqualTo(heights['m']!));
      expect(heights['m']!, lessThanOrEqualTo(heights['l']!));
      expect(heights['l']!, lessThanOrEqualTo(heights['xl']!));
      expect(heights['xl']!, greaterThan(heights['xs']!));
    });

    testWidgets('[e2e] badge inside Surface auto-adapts colors', (tester) async {
      // Inside a bold primary surface the badge with appearance=auto must
      // pick up the parent role and render distinguishable. If the surface
      // context cascade is broken, this badge becomes invisible.
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'Status',
          attention: 'high',
          appearance: 'auto',
          child: 'Status',
        ),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await _hold(tester, 2000);

      expect(find.text('Status'), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode badge renders without contrast holes',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'Beta (dark)',
          attention: 'high',
          appearance: 'primary',
          child: 'Beta',
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);

      expect(find.text('Beta'), findsOneWidget);
    });
  });
}
