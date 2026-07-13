/// IconContained — on-device integration tests.
///
/// Renders [OneUiIconContained] on the connected emulator / simulator using
/// the same harness widget tests use, exercising real engine behaviour:
///   - Jio SVG catalog loading at device DPI
///   - Container shape (pill) + disabled opacity
///   - real surface-context token remapping
///   - real Semantics announcement (TalkBack/VoiceOver)
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained_types.dart';

import '../test/support/components/icon_contained_harness.dart';

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

  group('IconContained — on-device', () {
    testWidgets('[e2e] default renders pill container', (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(icon: 'heart', semanticsLabel: 'Favourite'),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIconContained), findsOneWidget);
    });

    testWidgets('[e2e] all 5 sizes render at increasing dimensions',
        (tester) async {
      final sizes = <String, double>{};
      for (final size in kOneUiIconContainedSizes) {
        await pumpIconContainedQaHarnessSettled(
          tester,
          OneUiIconContained(
            icon: 'heart',
            size: size,
            semanticsLabel: 'Favourite',
          ),
        );
        await _hold(tester, _demoMode ? 800 : 0);
        // Measure the inner DecoratedBox (the pill container with explicit
        // containerPx). Avoids depending on whether the parent Center
        // tight-wraps OneUiIconContained on a given device.
        final pillBox = find.descendant(
          of: iconContainedRootFinder(),
          matching: find.byType(DecoratedBox),
        ).first;
        sizes[size] = tester.getSize(pillBox).width;
      }
      // All 5 sizes must render distinct widths — xs < s < m < l < xl.
      expect(sizes.length, 5);
      expect(sizes['xs']!, lessThan(sizes['s']!));
      expect(sizes['s']!, lessThan(sizes['m']!));
      expect(sizes['m']!, lessThan(sizes['l']!));
      expect(sizes['l']!, lessThan(sizes['xl']!));
    });

    testWidgets('[e2e] medium + high attention render distinctly',
        (tester) async {
      for (final attention in OneUiIconContainedAttention.values) {
        await pumpIconContainedQaHarnessSettled(
          tester,
          OneUiIconContained(
            icon: 'heart',
            attention: attention,
            semanticsLabel: 'Favourite ${attention.name}',
          ),
        );
        await _hold(tester);
        expect(find.byType(OneUiIconContained), findsOneWidget);
      }
    });

    testWidgets('[e2e] disabled state dims the container', (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          appearance: 'primary',
          attention: OneUiIconContainedAttention.high,
          disabled: true,
          semanticsLabel: 'Already favourited',
        ),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIconContained), findsOneWidget);
    });

    testWidgets('[e2e] icon inside Surface auto-adapts colour', (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          appearance: 'auto',
          attention: OneUiIconContainedAttention.high,
          semanticsLabel: 'Favourite',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'positive',
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIconContained), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode renders without contrast holes',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          appearance: 'primary',
          attention: OneUiIconContainedAttention.high,
          semanticsLabel: 'Favourite',
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIconContained), findsOneWidget);
    });

    testWidgets('[e2e] labelled icon exposes label in AT tree', (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(icon: 'heart', semanticsLabel: 'Favourite'),
      );
      await _hold(tester, 2000);
      expect(find.bySemanticsLabel('Favourite'), findsOneWidget);
    });
  });
}
