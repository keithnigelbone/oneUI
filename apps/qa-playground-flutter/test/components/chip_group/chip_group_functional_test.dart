/// ChipGroup functional QA tests — mirrors web `ChipGroup.test.tsx`.
///
/// Runs on the synthetic measurement harness (offline). Probed facts baked in:
///   wrap(default)→Wrap ; wrap:false→horizontal SingleChildScrollView+Row ;
///   orientation:vertical→Column ; single-select swaps ; multi adds/removes ;
///   maxSelections caps ; required blocks deselecting the last ; group disabled
///   blocks all children ; group size propagates to child chip height.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';

import '../../support/components/chip_group_harness.dart';

List<OneUiChip> _chips() => [
      OneUiChip(child: 'A', value: 'a'),
      OneUiChip(child: 'B', value: 'b'),
      OneUiChip(child: 'C', value: 'c'),
    ];

void main() {
  group('[smoke] ChipGroup', () {
    testWidgetsAllPlatforms('[smoke] renders children chips', (tester) async {
      await pumpChipQaHarness(tester, OneUiChipGroup(children: _chips()));
      expect(find.text('A'), findsOneWidget);
      expect(find.text('B'), findsOneWidget);
      expect(find.text('C'), findsOneWidget);
    });
  });

  group('[functional] ChipGroup — layout', () {
    testWidgetsAllPlatforms('[fn] default wraps (Wrap)', (tester) async {
      await pumpChipQaHarness(tester, OneUiChipGroup(children: _chips()));
      expect(chipGroupWrapFinder(), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] wrap:false uses a horizontal scroll (inline)', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(wrap: false, children: _chips()),
      );
      expect(chipGroupInlineScrollFinder(), findsOneWidget);
      expect(chipGroupWrapFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] containerType:inline matches wrap:false', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(containerType: 'inline', children: _chips()),
      );
      expect(chipGroupInlineScrollFinder(), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] orientation:vertical uses a Column', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(orientation: 'vertical', children: _chips()),
      );
      expect(chipGroupColumnFinder(), findsOneWidget);
    });
  });

  group('[functional] ChipGroup — single select', () {
    testWidgetsAllPlatforms('[fn] tapping a chip swaps the selection', (tester) async {
      List<String> values = const ['a'];
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          defaultValue: const ['a'],
          onValueChange: (v) => values = v,
          children: _chips(),
        ),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(values, ['b']);
    });

    testWidgetsAllPlatforms('[fn] tapping the selected chip clears it (not required)', (tester) async {
      List<String> values = const ['a'];
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          defaultValue: const ['a'],
          onValueChange: (v) => values = v,
          children: _chips(),
        ),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(values, isEmpty);
    });
  });

  group('[functional] ChipGroup — multi select', () {
    testWidgetsAllPlatforms('[fn] adds and removes values', (tester) async {
      var values = <String>['a'];
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          multiple: true,
          defaultValue: const ['a'],
          onValueChange: (v) => values = v,
          children: _chips(),
        ),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(values, containsAll(['a', 'b']));
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(values, ['b']);
    });

    testWidgetsAllPlatforms('[fn] maxSelections caps additions', (tester) async {
      var values = <String>['a', 'b'];
      var calls = 0;
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          multiple: true,
          maxSelections: 2,
          defaultValue: const ['a', 'b'],
          onValueChange: (v) {
            calls++;
            values = v;
          },
          children: _chips(),
        ),
      );
      await tester.tap(find.text('C'));
      await tester.pumpAndSettle();
      expect(calls, 0, reason: 'adding past maxSelections is a no-op');
      expect(values, ['a', 'b']);
    });

    testWidgetsAllPlatforms('[fn] required blocks deselecting the last chip', (tester) async {
      var calls = 0;
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          multiple: true,
          required: true,
          defaultValue: const ['a'],
          onValueChange: (_) => calls++,
          children: _chips(),
        ),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(calls, 0, reason: 'required keeps at least one selection');
    });
  });

  group('[functional] ChipGroup — disabled + size', () {
    testWidgetsAllPlatforms('[fn] group disabled blocks all children', (tester) async {
      var changed = false;
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          disabled: true,
          onValueChange: (_) => changed = true,
          children: _chips(),
        ),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('[fn] group size propagates to child chip height', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          size: 'l',
          children: [OneUiChip(child: 'A', value: 'a', selected: true)],
        ),
      );
      expect(chipHeightPx(tester), 32, reason: 'size=l → 32px child chrome');

      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          size: 's',
          children: [OneUiChip(child: 'A', value: 'a', selected: true)],
        ),
      );
      expect(chipHeightPx(tester), 24, reason: 'size=s → 24px child chrome');
    });
  });
}
