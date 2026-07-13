/// ChipGroup visual-regression tests — LIGHT. Captures the wrap vs inline
/// layouts across sizes with a selected first chip, rendered with the real Jio
/// fixture (production token resolution).
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/chip_group/chip_group_golden_test.dart
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';

import '../../support/components/chip_group_harness.dart';

List<OneUiChip> _chips() => [
      OneUiChip(child: 'All', value: 'a'),
      OneUiChip(child: 'Unread', value: 'b'),
      OneUiChip(child: 'Starred', value: 'c'),
      OneUiChip(child: 'Sent', value: 'd'),
    ];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] ChipGroup — wrap × size', () {
    for (final size in ['s', 'm', 'l']) {
      testWidgets('wrap / $size', (tester) async {
        await pumpChipJioHarnessSettled(
          tester,
          SizedBox(
            width: 280,
            child: OneUiChipGroup(
              size: size,
              defaultValue: const ['a'],
              children: _chips(),
            ),
          ),
        );
        await expectLater(
          find.byType(OneUiChipGroup),
          matchesGoldenFile('goldens/chip_group_wrap_$size.png'),
        );
      });
    }
  });

  group('[golden] ChipGroup — inline (no wrap)', () {
    for (final size in ['s', 'm', 'l']) {
      testWidgets('inline / $size', (tester) async {
        await pumpChipJioHarnessSettled(
          tester,
          SizedBox(
            width: 280,
            child: OneUiChipGroup(
              size: size,
              wrap: false,
              defaultValue: const ['a'],
              children: _chips(),
            ),
          ),
        );
        await expectLater(
          find.byType(OneUiChipGroup),
          matchesGoldenFile('goldens/chip_group_inline_$size.png'),
        );
      });
    }
  });

  group('[golden] ChipGroup — multi select', () {
    testWidgets('multi / two selected', (tester) async {
      await pumpChipJioHarnessSettled(
        tester,
        SizedBox(
          width: 280,
          child: OneUiChipGroup(
            multiple: true,
            defaultValue: const ['a', 'c'],
            children: _chips(),
          ),
        ),
      );
      await expectLater(
        find.byType(OneUiChipGroup),
        matchesGoldenFile('goldens/chip_group_multi_selected.png'),
      );
    });
  });
}
