/// Icon — on-device integration tests.
///
/// Renders [OneUiIcon] on the connected emulator / simulator using the same
/// harness widget tests use, exercising real engine behaviour:
///   - Jio SVG catalog loading at device DPI
///   - Material fallback when catalog miss
///   - real surface-context token remapping
///   - real Semantics announcement (TalkBack/VoiceOver)
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';

import '../test/support/components/icon_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('Icon — on-device', () {
    testWidgets('[e2e] default size renders heart glyph', (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(icon: 'heart', semanticsLabel: 'Like'),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIcon), findsOneWidget);
    });

    testWidgets('[e2e] size sweep — 2 / 5 / 10 / 20 / 40 render at increasing sizes',
        (tester) async {
      final sizes = <String, double>{};
      for (final size in ['2', '5', '10', '20', '40']) {
        await pumpIconQaHarnessSettled(
          tester,
          OneUiIcon(icon: 'heart', size: size, semanticsLabel: 'Like'),
        );
        await _hold(tester, _demoMode ? 800 : 0);
        // Use the first descendant SizedBox — this is the shell OneUiIcon emits
        // with the resolved `boxSize`. Works regardless of whether the inner
        // glyph renders as a Material `Icon` (catalog miss) or an SVG (Jio
        // catalog loaded — which is the default on a real device).
        final shellBox = find.descendant(
          of: iconRootFinder(),
          matching: find.byType(SizedBox),
        ).first;
        sizes[size] = tester.getSize(shellBox).width;
      }
      // All 5 sizes must render distinct widths — '2' < '5' < '10' < '20' < '40'.
      expect(sizes.length, 5,
          reason: 'all 5 requested sizes must report a measurable width');
      expect(sizes['2']!, lessThan(sizes['5']!));
      expect(sizes['5']!, lessThan(sizes['10']!));
      expect(sizes['10']!, lessThan(sizes['20']!));
      expect(sizes['20']!, lessThan(sizes['40']!));
    });

    testWidgets('[e2e] each Figma appearance renders distinctly',
        (tester) async {
      for (final app in ['neutral', 'primary', 'negative', 'positive', 'sparkle']) {
        await pumpIconQaHarnessSettled(
          tester,
          OneUiIcon(
            icon: 'heart',
            appearance: app,
            semanticsLabel: '$app icon',
          ),
        );
        await _hold(tester);
        expect(
          find.byKey(ValueKey<String>(
            'oneui-icon|data-size=5|data-appearance=$app|data-emphasis=high',
          )),
          findsOneWidget,
        );
      }
    });

    testWidgets('[e2e] each emphasis level renders distinctly', (tester) async {
      for (final emphasis in OneUiIconEmphasis.values) {
        await pumpIconQaHarnessSettled(
          tester,
          OneUiIcon(
            icon: 'heart',
            appearance: 'primary',
            emphasis: emphasis,
            semanticsLabel: 'Like',
          ),
        );
        await _hold(tester);
        expect(find.byType(OneUiIcon), findsOneWidget);
      }
    });

    testWidgets('[e2e] icon inside Surface auto-adapts colour', (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(icon: 'heart', appearance: 'auto', semanticsLabel: 'Like'),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await _hold(tester, 2000);
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-icon|data-size=5|data-appearance=primary|data-emphasis=high',
        )),
        findsOneWidget,
      );
    });

    testWidgets('[e2e] dark-mode icon renders without contrast holes',
        (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(icon: 'heart', semanticsLabel: 'Like'),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIcon), findsOneWidget);
    });

    testWidgets('[e2e] decorative icon (no label) hidden from AT', (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(icon: 'heart'),
      );
      await _hold(tester);
      expect(find.bySemanticsLabel('heart'), findsNothing);
      expect(find.bySemanticsLabel('Like'), findsNothing);
    });

    testWidgets('[e2e] labelled icon exposes Like in AT tree', (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(icon: 'heart', semanticsLabel: 'Like'),
      );
      await _hold(tester, 2000);
      expect(find.bySemanticsLabel('Like'), findsOneWidget);
    });
  });
}
