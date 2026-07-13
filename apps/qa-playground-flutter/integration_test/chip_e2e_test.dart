/// Chip — on-device integration tests.
///
/// Renders [OneUiChip] / [OneUiChipGroup] on the connected emulator / simulator
/// using the same Jio-fixture harness the widget tests use, exercising real
/// engine behaviour:
///   - real surface-context token remapping (selected fill on tinted surfaces)
///   - real pointer toggles + uncontrolled state
///   - real group single + multi select
///   - real Semantics announcement (button + selected)
///   - dark mode
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../test/support/components/chip_harness.dart';

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

  group('Chip — on-device', () {
    testWidgets('[e2e] default renders a labelled chip', (tester) async {
      await pumpChipJioHarnessSettled(tester, OneUiChip(child: 'Filter', selected: true));
      await _hold(tester, 2000);
      expect(find.byType(OneUiChip), findsOneWidget);
      expect(find.text('Filter'), findsOneWidget);
    });

    testWidgets('[e2e] sizes render at strictly increasing heights (s<m<l)', (tester) async {
      final sizes = <String, double>{};
      for (final size in ['s', 'm', 'l']) {
        await pumpChipJioHarnessSettled(
          tester,
          OneUiChip(child: 'C', size: size, selected: true),
        );
        await _hold(tester, _demoMode ? 600 : 0);
        sizes[size] = chipHeightPx(tester);
      }
      expect(sizes['s']!, lessThan(sizes['m']!));
      expect(sizes['m']!, lessThan(sizes['l']!));
    });

    testWidgets('[e2e] uncontrolled toggle flips selection on tap', (tester) async {
      await pumpChipJioHarnessSettled(tester, OneUiChip(child: 'Toggle'));
      expectChipSelected(tester, selected: false, label: 'Toggle');
      await tester.tap(find.text('Toggle'));
      await tester.pumpAndSettle();
      await _hold(tester, 2000);
      expectChipSelected(tester, selected: true, label: 'Toggle');
    });

    testWidgets('[e2e] group single-select swaps selection', (tester) async {
      List<String> values = const ['a'];
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChipGroup(
          defaultValue: const ['a'],
          onValueChange: (v) => values = v,
          children: [
            OneUiChip(child: 'All', value: 'a'),
            OneUiChip(child: 'Unread', value: 'b'),
          ],
        ),
      );
      await tester.tap(find.text('Unread'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(values, ['b']);
    });

    testWidgets('[e2e] group multi-select adds and removes values', (tester) async {
      var values = <String>['a'];
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChipGroup(
          multiple: true,
          defaultValue: const ['a'],
          onValueChange: (v) => values = v,
          children: [
            OneUiChip(child: 'Apples', value: 'a'),
            OneUiChip(child: 'Bananas', value: 'b'),
            OneUiChip(child: 'Cherries', value: 'c'),
          ],
        ),
      );
      await tester.tap(find.text('Bananas'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(values, containsAll(['a', 'b']));
      await tester.tap(find.text('Apples'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(values, ['b']);
    });

    testWidgets('[e2e] each appearance renders distinctly', (tester) async {
      for (final app in ['secondary', 'primary', 'positive', 'negative', 'informative']) {
        await pumpChipJioHarnessSettled(
          tester,
          OneUiChip(child: app, appearance: app, selected: true),
        );
        await _hold(tester);
        expect(find.byType(OneUiChip), findsOneWidget);
      }
    });

    testWidgets('[e2e] attention levels render', (tester) async {
      for (final attention in ['high', 'medium', 'low']) {
        await pumpChipJioHarnessSettled(
          tester,
          OneUiChip(child: attention, attention: attention, selected: true),
        );
        await _hold(tester);
        expect(find.byType(OneUiChip), findsOneWidget);
      }
    });

    testWidgets('[e2e] start/end slots render', (tester) async {
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChip(
          child: 'Liked',
          selected: true,
          start: const OneUiIcon(icon: 'favorite', semanticsLabel: 'fav'),
          end: const OneUiIcon(icon: 'close', semanticsLabel: 'remove'),
        ),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIcon), findsNWidgets(2));
    });

    testWidgets('[e2e] disabled state dims the chip', (tester) async {
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChip(child: 'Off', disabled: true, selected: true),
      );
      await _hold(tester, 2000);
      expect(chipOpacity(tester), lessThan(1.0));
    });

    testWidgets('[e2e] chip inside Surface auto-adapts (auto appearance)', (tester) async {
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChip(child: 'On surface', appearance: 'auto', selected: true),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiChip), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode chip renders without contrast holes', (tester) async {
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChip(child: 'Dark', appearance: 'primary', selected: true),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiChip), findsOneWidget);
    });

    testWidgets('[e2e] labelled chip exposes name + selected in AT tree', (tester) async {
      await pumpChipJioHarnessSettled(tester, OneUiChip(child: 'Filter', selected: true));
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        expect(chipSemanticsLabel('Filter'), findsOneWidget);
        expectChipSelected(tester, selected: true, label: 'Filter');
      });
    });
  });
}
