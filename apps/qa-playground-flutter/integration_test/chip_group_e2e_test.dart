/// ChipGroup — on-device integration tests.
///
/// Renders [OneUiChipGroup] on the connected emulator / simulator using the Jio
/// fixture, exercising real engine behaviour: single + multi select, layout
/// (wrap / inline / vertical), size propagation, disabled, and labelled group
/// semantics.
///
/// `--dart-define=DEMO_MODE=true` holds each variant ~1.5s for visual debugging.
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';

import '../test/support/components/chip_group_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

List<OneUiChip> _chips() => [
      OneUiChip(child: 'All', value: 'a'),
      OneUiChip(child: 'Unread', value: 'b'),
      OneUiChip(child: 'Starred', value: 'c'),
    ];

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('ChipGroup — on-device', () {
    testWidgets('[e2e] renders all children', (tester) async {
      await pumpChipJioHarnessSettled(tester, OneUiChipGroup(children: _chips()));
      await _hold(tester, 2000);
      expect(find.byType(OneUiChip), findsNWidgets(3));
    });

    testWidgets('[e2e] single-select swaps selection', (tester) async {
      List<String> values = const ['a'];
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChipGroup(
          defaultValue: const ['a'],
          onValueChange: (v) => values = v,
          children: _chips(),
        ),
      );
      await tester.tap(find.text('Unread'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(values, ['b']);
    });

    testWidgets('[e2e] multi-select adds and removes', (tester) async {
      var values = <String>['a'];
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChipGroup(
          multiple: true,
          defaultValue: const ['a'],
          onValueChange: (v) => values = v,
          children: _chips(),
        ),
      );
      await tester.tap(find.text('Starred'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(values, containsAll(['a', 'c']));
      await tester.tap(find.text('All'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(values, ['c']);
    });

    testWidgets('[e2e] inline (no wrap) renders a horizontal scroll', (tester) async {
      await pumpChipJioHarnessSettled(
        tester,
        SizedBox(width: 240, child: OneUiChipGroup(wrap: false, children: _chips())),
      );
      await _hold(tester, 2000);
      expect(chipGroupInlineScrollFinder(), findsOneWidget);
    });

    testWidgets('[e2e] vertical orientation stacks chips', (tester) async {
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChipGroup(orientation: 'vertical', children: _chips()),
      );
      await _hold(tester, 2000);
      expect(chipGroupColumnFinder(), findsOneWidget);
    });

    testWidgets('[e2e] size propagates to children', (tester) async {
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChipGroup(size: 'l', children: [OneUiChip(child: 'A', value: 'a', selected: true)]),
      );
      await _hold(tester);
      final large = chipHeightPx(tester);
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChipGroup(size: 's', children: [OneUiChip(child: 'A', value: 'a', selected: true)]),
      );
      await _hold(tester);
      expect(large, greaterThan(chipHeightPx(tester)));
    });

    testWidgets('[e2e] disabled group ignores taps', (tester) async {
      var changed = false;
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChipGroup(
          disabled: true,
          onValueChange: (_) => changed = true,
          children: _chips(),
        ),
      );
      await tester.tap(find.text('Unread'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(changed, isFalse);
    });

    testWidgets('[e2e] labelled group exposes container semantics', (tester) async {
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChipGroup(ariaLabel: 'Filters', children: _chips()),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        expect(chipGroupSemanticsLabel('Filters'), findsOneWidget);
      });
    });

    testWidgets('[e2e] group inside Surface auto-adapts', (tester) async {
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChipGroup(defaultValue: const ['a'], children: _chips()),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiChipGroup), findsOneWidget);
    });
  });
}
