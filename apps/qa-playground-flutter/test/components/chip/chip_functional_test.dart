/// Chip functional QA tests — mirrors web `Chip.test.tsx` / RN QA playground.
///
/// Runs on the synthetic measurement harness (no network) and asserts REAL
/// rendered geometry + REAL SemanticsData, never just `findsOneWidget`, so a
/// green test means the behaviour actually happened. Probed facts baked in:
///   selected → Semantics(selected:true) ; uncontrolled toggles on tap ;
///   disabled blocks onSelectedChange ; group membership via `value` toggles
///   through OneUiChipGroup ; sizes s/m/l → 24/28/32 px chrome.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/chip_harness.dart';

void main() {
  group('[smoke] Chip', () {
    testWidgetsAllPlatforms('[smoke] renders label text', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'Filter'));
      expect(find.text('Filter'), findsOneWidget);
    });

    for (final size in ['s', 'm', 'l']) {
      testWidgetsAllPlatforms('[smoke] size="$size" renders', (tester) async {
        await pumpChipQaHarness(
          tester,
          OneUiChip(child: 'Sz', size: size, selected: true),
        );
        expect(chipRootFinder(), findsOneWidget);
      });
    }
  });

  group('[functional] Chip — selection state', () {
    testWidgetsAllPlatforms('[fn] selected=true exposes selected semantics', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'On', selected: true));
      expectChipSelected(tester, selected: true, label: 'On');
    });

    testWidgetsAllPlatforms('[fn] selected=false exposes unselected semantics', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'Off', selected: false));
      expectChipSelected(tester, selected: false, label: 'Off');
    });

    testWidgetsAllPlatforms('[fn] uncontrolled toggles false → true → false', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'Toggle'));
      expectChipSelected(tester, selected: false, label: 'Toggle');
      await tester.tap(find.text('Toggle'));
      await tester.pumpAndSettle();
      expectChipSelected(tester, selected: true, label: 'Toggle');
      await tester.tap(find.text('Toggle'));
      await tester.pumpAndSettle();
      expectChipSelected(tester, selected: false, label: 'Toggle');
    });

    testWidgetsAllPlatforms('[fn] controlled selected stays put after tap (no setState)', (tester) async {
      var calls = 0;
      await pumpChipQaHarness(
        tester,
        OneUiChip(
          child: 'Controlled',
          selected: false,
          onSelectedChange: (v, [d]) => calls++,
        ),
      );
      await tester.tap(find.text('Controlled'));
      await tester.pumpAndSettle();
      expect(calls, 1, reason: 'callback fires once');
      expectChipSelected(tester, selected: false, label: 'Controlled',
          );
    });
  });

  group('[functional] Chip — onSelectedChange', () {
    testWidgetsAllPlatforms('[fn] fires true when toggling on', (tester) async {
      bool? last;
      await pumpChipQaHarness(
        tester,
        OneUiChip(child: 'Pick', onSelectedChange: (v, [d]) => last = v),
      );
      await tester.tap(find.text('Pick'));
      await tester.pumpAndSettle();
      expect(last, isTrue);
    });

    testWidgetsAllPlatforms('[fn] fires false when toggling off', (tester) async {
      bool? last;
      await pumpChipQaHarness(
        tester,
        OneUiChip(
          child: 'Pick',
          defaultSelected: true,
          onSelectedChange: (v, [d]) => last = v,
        ),
      );
      await tester.tap(find.text('Pick'));
      await tester.pumpAndSettle();
      expect(last, isFalse);
    });

    testWidgetsAllPlatforms('[fn] disabled blocks onSelectedChange', (tester) async {
      var changed = false;
      await pumpChipQaHarness(
        tester,
        OneUiChip(
          child: 'Off',
          disabled: true,
          onSelectedChange: (v, [d]) => changed = true,
        ),
      );
      await tester.tap(find.text('Off'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });

  group('[functional] Chip — slots', () {
    testWidgetsAllPlatforms('[fn] start slot renders before the label', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChip(
          child: 'Liked',
          selected: true,
          start: const OneUiIcon(icon: 'favorite', semanticsLabel: 'fav'),
        ),
      );
      expect(find.text('Liked'), findsOneWidget);
      expect(find.byType(OneUiIcon), findsOneWidget);
      final iconX = tester.getCenter(find.byType(OneUiIcon)).dx;
      final labelX = tester.getCenter(find.text('Liked')).dx;
      expect(iconX, lessThan(labelX), reason: 'start slot sits left of the label');
    });

    testWidgetsAllPlatforms('[fn] end slot renders after the label', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChip(
          child: 'Liked',
          selected: true,
          end: const OneUiIcon(icon: 'close', semanticsLabel: 'remove'),
        ),
      );
      final iconX = tester.getCenter(find.byType(OneUiIcon)).dx;
      final labelX = tester.getCenter(find.text('Liked')).dx;
      expect(iconX, greaterThan(labelX), reason: 'end slot sits right of the label');
    });
  });

  group('[functional] Chip — sizes map to real chrome height', () {
    for (final entry in {'s': 24.0, 'm': 28.0, 'l': 32.0}.entries) {
      testWidgetsAllPlatforms('[fn] size=${entry.key} → ${entry.value}px chrome', (tester) async {
        await pumpChipQaHarness(
          tester,
          OneUiChip(child: 'H', size: entry.key, selected: true),
        );
        expect(chipHeightPx(tester), entry.value);
      });
    }
  });

  group('[functional] ChipGroup membership via value', () {
    testWidgetsAllPlatforms('[fn] single-select swaps the selected chip', (tester) async {
      List<String> values = const ['a'];
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          defaultValue: const ['a'],
          onValueChange: (v) => values = v,
          children: [
            OneUiChip(child: 'A', value: 'a'),
            OneUiChip(child: 'B', value: 'b'),
          ],
        ),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(values, ['b'], reason: 'single-select replaces selection');
    });

    testWidgetsAllPlatforms('[fn] multi-select adds and removes values', (tester) async {
      var values = <String>['a'];
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          multiple: true,
          defaultValue: const ['a'],
          onValueChange: (v) => values = v,
          children: [
            OneUiChip(child: 'A', value: 'a'),
            OneUiChip(child: 'B', value: 'b'),
          ],
        ),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(values, containsAll(['a', 'b']));
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(values, ['b']);
    });

    testWidgetsAllPlatforms('[fn] group disabled blocks selection', (tester) async {
      var changed = false;
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          disabled: true,
          onValueChange: (_) => changed = true,
          children: [
            OneUiChip(child: 'A', value: 'a'),
          ],
        ),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });
}
