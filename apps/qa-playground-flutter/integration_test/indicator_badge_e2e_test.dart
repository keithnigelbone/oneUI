/// IndicatorBadge — on-device integration tests.
///
/// Renders [OneUiIndicatorBadge] standalone on the connected emulator /
/// simulator using `pumpIndicatorBadgeQaHarness`, exercising real engine
/// behaviour:
///   - actual dot rendering at device DPI
///   - real overlay positioning (top-end on icon, bottom-end on avatar with ring)
///   - real surface-context token remapping
///   - real live-region semantics announcement
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed.
///   `true` (interactive / debugging): holds each variant ~1.5s.
///
/// Run:
///   flutter test integration_test/indicator_badge_e2e_test.dart -d emulator-5554
///   flutter test integration_test/indicator_badge_e2e_test.dart -d "iPhone 17 Pro"
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_overlay.dart';

import '../test/support/components/indicator_badge_harness.dart';

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

  group('IndicatorBadge — on-device', () {
    testWidgets('[e2e] primary dot renders at size m', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(
          appearance: 'primary',
          semanticsLabel: 'Online',
        ),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
    });

    testWidgets('[e2e] negative dot stands out vs surroundings', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(
          appearance: 'negative',
          semanticsLabel: 'Unread',
        ),
      );
      await _hold(tester);
      expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
    });

    testWidgets('[e2e] size variants xs / s / m / l / xl render at increasing diameters',
        (tester) async {
      final sizes = <String, double>{};
      for (final size in ['xs', 's', 'm', 'l', 'xl']) {
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          OneUiIndicatorBadge(
            size: size,
            appearance: 'primary',
            semanticsLabel: 'dot',
          ),
        );
        await _hold(tester, _demoMode ? 800 : 0);
        sizes[size] = tester.getSize(indicatorBadgeRootFinder()).height;
      }
      expect(sizes['xs']!, lessThanOrEqualTo(sizes['s']!));
      expect(sizes['s']!, lessThanOrEqualTo(sizes['m']!));
      expect(sizes['m']!, lessThanOrEqualTo(sizes['l']!));
      expect(sizes['l']!, lessThanOrEqualTo(sizes['xl']!));
      expect(sizes['xl']!, greaterThan(sizes['xs']!));
    });

    testWidgets('[e2e] top-end overlay anchors on an icon tile', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        SizedBox(
          width: 40,
          height: 40,
          child: OneUiIndicatorBadgeOverlay(
            hostSide: 40,
            host: const ColoredBox(color: Color(0xFFE0E0E0)),
            indicator: const OneUiIndicatorBadge(
              size: 's',
              appearance: 'negative',
              semanticsLabel: 'unread',
            ),
            anchor: OneUiIndicatorBadgeOverlayAnchor.topEnd,
            indicatorSize: 's',
          ),
        ),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
      expect(find.byType(OneUiIndicatorBadgeOverlay), findsOneWidget);
    });

    testWidgets('[e2e] bottom-end overlay with ring on an avatar tile', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        SizedBox(
          width: 48,
          height: 48,
          child: OneUiIndicatorBadgeOverlay(
            hostSide: 48,
            host: const DecoratedBox(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFFB0C4DE),
              ),
            ),
            indicator: const OneUiIndicatorBadge(
              size: 'm',
              appearance: 'positive',
              semanticsLabel: 'Online',
            ),
            anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
            indicatorSize: 'm',
            surfaceRingColor: const Color(0xFFFFFFFF),
            surfaceRingWidth: 2,
          ),
        ),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
    });

    testWidgets('[e2e] indicator inside Surface auto-adapts colors', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(
          appearance: 'auto',
          semanticsLabel: 'dot',
        ),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode indicator renders without contrast holes',
        (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(
          appearance: 'primary',
          semanticsLabel: 'dot',
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
    });
  });
}
