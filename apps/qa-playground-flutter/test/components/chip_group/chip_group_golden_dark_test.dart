/// ChipGroup visual-regression tests — DARK. Wrap layout across sizes on the
/// Jio dark fixture.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/chip_group/chip_group_golden_dark_test.dart
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
    ];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] ChipGroup dark — wrap × size', () {
    for (final size in ['s', 'm', 'l']) {
      testWidgets('dark / wrap / $size', (tester) async {
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
          darkMode: true,
        );
        await expectLater(
          find.byType(OneUiChipGroup),
          matchesGoldenFile('goldens/dark/chip_group_dark_wrap_$size.png'),
        );
      });
    }
  });
}
