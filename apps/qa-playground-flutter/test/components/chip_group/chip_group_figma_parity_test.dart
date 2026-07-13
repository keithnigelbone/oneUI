/// ChipGroup Figma-parity QA suite — `[figma]`.
///
/// Exercises every value of the Figma ChipGroup API against the real widget:
///   size   S | M | L   (propagated to child chips — measured via child height)
///   wrap   true | false (Figma containerType: wrap | inline)
/// asserting real layout widgets and real child geometry. Offline (synthetic
/// measurement harness).
///
/// Verified facts (probed): size=s→24px / m→28px / l→32px child chrome ;
/// wrap=true→Wrap ; wrap=false→horizontal SingleChildScrollView+Row.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group_types.dart';

import '../../support/components/chip_group_harness.dart';

const _kChildChromePxBySize = <String, double>{'s': 24, 'm': 28, 'l': 32};

List<OneUiChip> _selectedChips() => [
      OneUiChip(child: 'A', value: 'a', selected: true),
    ];

void main() {
  // ===========================================================================
  // SIZE — propagates to the child chips.
  // ===========================================================================

  group('[figma] ChipGroup — size propagation', () {
    for (final entry in _kChildChromePxBySize.entries) {
      testWidgetsAllPlatforms('[figma] size=${entry.key} → child chrome ${entry.value}px',
          (tester) async {
        await pumpChipQaHarness(
          tester,
          OneUiChipGroup(size: entry.key, children: _selectedChips()),
        );
        expect(chipHeightPx(tester), entry.value,
            reason: 'group size ${entry.key} drives child chip height');
      });
    }

    test('[figma] group size resolves through the same scale as chips', () {
      expect(resolveOneUiChipGroupState(size: 's').resolvedSize, 's');
      expect(resolveOneUiChipGroupState(size: 'm').resolvedSize, 'm');
      expect(resolveOneUiChipGroupState(size: 'l').resolvedSize, 'l');
    });
  });

  // ===========================================================================
  // WRAP / containerType — wrap | inline.
  // ===========================================================================

  group('[figma] ChipGroup — wrap / containerType', () {
    testWidgetsAllPlatforms('[figma] wrap=true renders a Wrap', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(wrap: true, children: _selectedChips()),
      );
      expect(chipGroupWrapFinder(), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] wrap=false renders an inline horizontal scroll',
        (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(wrap: false, children: _selectedChips()),
      );
      expect(chipGroupInlineScrollFinder(), findsOneWidget);
      expect(chipGroupWrapFinder(), findsNothing);
    });

    test('[figma] containerType wrap↔inline maps to the wrap boolean', () {
      expect(resolveChipGroupWrap(containerType: 'wrap'), isTrue);
      expect(resolveChipGroupWrap(containerType: 'inline'), isFalse);
    });
  });

  // ===========================================================================
  // FULL MATRIX — size × wrap renders every cell with correct layout + child size.
  // ===========================================================================

  group('[figma] ChipGroup — size × wrap matrix', () {
    for (final size in ['s', 'm', 'l']) {
      for (final wrap in [true, false]) {
        testWidgetsAllPlatforms('[figma] $size / ${wrap ? 'wrap' : 'inline'}',
            (tester) async {
          await pumpChipQaHarness(
            tester,
            OneUiChipGroup(size: size, wrap: wrap, children: _selectedChips()),
          );
          if (wrap) {
            expect(chipGroupWrapFinder(), findsOneWidget);
          } else {
            expect(chipGroupInlineScrollFinder(), findsOneWidget);
          }
          expect(chipHeightPx(tester), _kChildChromePxBySize[size]);
        });
      }
    }
  });

  // ===========================================================================
  // ORIENTATION — vertical groups stack in a Column.
  // ===========================================================================

  group('[figma] ChipGroup — orientation', () {
    testWidgetsAllPlatforms('[figma] orientation=vertical stacks in a Column', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(orientation: 'vertical', children: [
          OneUiChip(child: 'A', value: 'a'),
          OneUiChip(child: 'B', value: 'b'),
        ]),
      );
      expect(chipGroupColumnFinder(), findsOneWidget);
      // vertical → children stacked, second below first.
      expect(tester.getTopLeft(find.text('B')).dy,
          greaterThan(tester.getTopLeft(find.text('A')).dy));
    });
  });
}
