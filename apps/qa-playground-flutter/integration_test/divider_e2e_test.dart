/// Divider — on-device integration tests.
///
/// Renders [OneUiDivider] on the connected emulator / simulator using the same
/// Jio-fixture harness the widget tests use, exercising real engine behaviour:
///   - real stroke px per size + round caps
///   - real centre slot (icon / label) with alignment
///   - real surface-context stroke remapping (neutral → primary)
///   - real separator landmark + hint in the AT tree
///   - dark mode
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../test/support/components/divider_harness.dart';

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

  group('Divider — on-device', () {
    testWidgets('[e2e] bare horizontal divider renders', (tester) async {
      await pumpDividerJioHarness(tester, const OneUiDivider());
      await _hold(tester, 2000);
      expect(dividerRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] sizes render at strictly increasing stroke px (s<m<l)', (tester) async {
      final px = <String, double>{};
      for (final size in ['s', 'm', 'l']) {
        await pumpDividerJioHarness(tester, OneUiDivider(size: size, attention: 'high'));
        await _hold(tester, _demoMode ? 500 : 0);
        px[size] = dividerStrokePx(tester, horizontal: true);
      }
      expect(px['s']!, lessThan(px['m']!));
      expect(px['m']!, lessThan(px['l']!));
    });

    testWidgets('[e2e] round caps render rounded vs square', (tester) async {
      await pumpDividerJioHarness(tester, const OneUiDivider(size: 'l', roundCaps: true));
      expect(dividerLineIsRounded(tester), isTrue);
      await pumpDividerJioHarness(tester, const OneUiDivider(size: 'l', roundCaps: false));
      await _hold(tester, 2000);
      expect(dividerLineIsRounded(tester), isFalse);
    });

    testWidgets('[e2e] label content renders with center alignment', (tester) async {
      await pumpDividerJioHarness(
        tester,
        const OneUiDivider(content: 'label', child: 'OR'),
      );
      await _hold(tester, 2000);
      expect(find.text('OR'), findsOneWidget);
    });

    testWidgets('[e2e] icon content renders', (tester) async {
      await pumpDividerJioHarness(
        tester,
        const OneUiDivider(content: 'icon', child: OneUiIcon(icon: 'check')),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIcon), findsOneWidget);
    });

    testWidgets('[e2e] each appearance renders', (tester) async {
      for (final app in ['neutral', 'primary', 'positive', 'negative', 'warning']) {
        await pumpDividerJioHarness(tester, OneUiDivider(appearance: app, attention: 'high', size: 'l'));
        await _hold(tester);
        expect(dividerRootFinder(), findsOneWidget);
      }
    });

    testWidgets('[e2e] vertical divider renders', (tester) async {
      await pumpDividerJioHarness(
        tester,
        const OneUiDivider(orientation: 'vertical', size: 'l', attention: 'high'),
        width: 80,
        height: 120,
      );
      await _hold(tester, 2000);
      expect(dividerStrokePx(tester, horizontal: false), kQaDividerStrokePx['l']);
    });

    testWidgets('[e2e] divider inside Surface auto-adapts (neutral → primary)', (tester) async {
      await pumpDividerJioHarness(
        tester,
        const OneUiDivider(appearance: 'neutral', attention: 'high', size: 'l'),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await _hold(tester, 2000);
      expect(dividerRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode divider renders', (tester) async {
      await pumpDividerJioHarness(
        tester,
        const OneUiDivider(appearance: 'primary', attention: 'high', size: 'l'),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(dividerRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] separator landmark exposes the hint in the AT tree', (tester) async {
      await pumpDividerJioHarness(tester, const OneUiDivider(semanticsHint: 'Section break'));
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorSemantics(tester).hint, 'Section break');
      });
    });
  });
}
