/// ChipGroup visual-regression tests — SURFACE CONTEXT. A wrapping group nested
/// inside bold / subtle Surfaces so the `[data-surface]` token remapping is
/// captured for every child chip.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/chip_group/chip_group_golden_surface_test.dart
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';

import '../../support/components/chip_group_harness.dart';

Widget _group() => SizedBox(
      width: 280,
      child: OneUiChipGroup(
        defaultValue: const ['a'],
        children: [
          OneUiChip(child: 'All', value: 'a'),
          OneUiChip(child: 'Unread', value: 'b'),
          OneUiChip(child: 'Starred', value: 'c'),
        ],
      ),
    );

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] ChipGroup — surface context', () {
    for (final mode in ['bold', 'subtle']) {
      for (final appearance in ['primary', 'secondary']) {
        testWidgets('$mode / $appearance', (tester) async {
          await pumpChipJioHarnessSettled(
            tester,
            _group(),
            surfaceMode: mode,
            surfaceAppearance: appearance,
          );
          await expectLater(
            find.byType(OneUiChipGroup),
            matchesGoldenFile('goldens/surface/chip_group_${mode}_$appearance.png'),
          );
        });
      }
    }
  });
}
