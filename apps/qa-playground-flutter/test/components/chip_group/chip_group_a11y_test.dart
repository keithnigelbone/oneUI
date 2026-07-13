/// ChipGroup accessibility QA tests — pure selection logic + container semantics.
///
/// Probed contract: the group exposes a container Semantics node only when
/// labelled (ariaLabel / semanticsLabel / labelledBy); child chips remain the
/// individual toggle controls. `computeNextChipGroupValues` is the pure
/// single/multi/required/maxSelections engine shared with RN.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group_types.dart';

import '../../support/components/chip_group_harness.dart';

void main() {
  group('[a11y] computeNextChipGroupValues — selection engine', () {
    test('[a11y] single-select replaces the selection', () {
      expect(
        computeNextChipGroupValues(['a'], 'b', const OneUiChipGroupToggleOptions()),
        ['b'],
      );
    });

    test('[a11y] single-select deselect clears (not required)', () {
      expect(
        computeNextChipGroupValues(['a'], 'a', const OneUiChipGroupToggleOptions()),
        isEmpty,
      );
    });

    test('[a11y] single-select required deselect is blocked (null)', () {
      expect(
        computeNextChipGroupValues(
            ['a'], 'a', const OneUiChipGroupToggleOptions(required: true)),
        isNull,
      );
    });

    test('[a11y] multi-select adds then removes', () {
      expect(
        computeNextChipGroupValues(
            ['a'], 'b', const OneUiChipGroupToggleOptions(multiple: true)),
        ['a', 'b'],
      );
      expect(
        computeNextChipGroupValues(
            ['a', 'b'], 'a', const OneUiChipGroupToggleOptions(multiple: true)),
        ['b'],
      );
    });

    test('[a11y] multi-select maxSelections cap blocks the add (null)', () {
      expect(
        computeNextChipGroupValues(['a', 'b'], 'c',
            const OneUiChipGroupToggleOptions(multiple: true, maxSelections: 2)),
        isNull,
      );
    });

    test('[a11y] multi-select required keeps at least one (null)', () {
      expect(
        computeNextChipGroupValues(['a'], 'a',
            const OneUiChipGroupToggleOptions(multiple: true, required: true)),
        isNull,
      );
    });
  });

  group('[a11y] resolveOneUiChipGroupState — layout contract', () {
    test('[a11y] default wraps; containerType wrap → wrap:true', () {
      expect(resolveOneUiChipGroupState().wrap, isTrue);
      expect(resolveOneUiChipGroupState(containerType: 'wrap').wrap, isTrue);
    });

    test('[a11y] wrap:false / containerType:inline → wrap:false', () {
      expect(resolveOneUiChipGroupState(wrap: false).wrap, isFalse);
      expect(resolveOneUiChipGroupState(containerType: 'inline').wrap, isFalse);
      expect(resolveOneUiChipGroupState(containerType: 'inline').containerType, 'inline');
    });

    test('[a11y] explicit size is validated; unset stays null', () {
      expect(resolveOneUiChipGroupState(size: 'l').resolvedSize, 'l');
      expect(resolveOneUiChipGroupState().resolvedSize, isNull);
    });
  });

  group('[a11y] ChipGroup widget — container semantics', () {
    testWidgetsAllPlatforms('[a11y] ariaLabel exposes a labelled group container', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          ariaLabel: 'Filters',
          children: [OneUiChip(child: 'A', value: 'a')],
        ),
      );
      withSemanticsHandle(tester, () {
        expect(chipGroupSemanticsLabel('Filters'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsHint surfaces on the group', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          ariaLabel: 'Filters',
          semanticsHint: 'Pick one or more',
          children: [OneUiChip(child: 'A', value: 'a')],
        ),
      );
      withSemanticsHandle(tester, () {
        expect(chipGroupSemanticsData(tester, 'Filters').hint, 'Pick one or more');
      });
    });

    testWidgetsAllPlatforms('[a11y] child chips remain individually selectable', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          ariaLabel: 'Filters',
          children: [
            OneUiChip(child: 'A', value: 'a'),
            OneUiChip(child: 'B', value: 'b'),
          ],
        ),
      );
      withSemanticsHandle(tester, () {
        expect(chipSemanticsLabel('A'), findsOneWidget);
        expect(chipSemanticsLabel('B'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] group disabled blocks child toggles', (tester) async {
      var changed = false;
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          disabled: true,
          onValueChange: (_) => changed = true,
          children: [OneUiChip(child: 'A', value: 'a')],
        ),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });
}
