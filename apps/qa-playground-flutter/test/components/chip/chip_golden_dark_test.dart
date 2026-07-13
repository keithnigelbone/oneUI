/// Chip visual-regression tests — DARK. Same matrix subset as the light goldens
/// but rendered with the Jio dark fixture (darkMode: true), so token remapping
/// for the dark surface is captured.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/chip/chip_golden_dark_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';

import '../../support/components/chip_harness.dart';

const _kKeyAppearances = <String>['secondary', 'primary', 'positive', 'negative'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] Chip dark — selected × appearance', () {
    for (final selected in [false, true]) {
      for (final app in _kKeyAppearances) {
        final sel = selected ? 'selected' : 'unselected';
        testWidgets('dark / $sel / $app', (tester) async {
          await pumpChipJioHarnessSettled(
            tester,
            OneUiChip(
              ariaLabel: 'chip',
              child: 'Label',
              appearance: app,
              selected: selected,
            ),
            darkMode: true,
          );
          await expectLater(
            find.byType(OneUiChip),
            matchesGoldenFile('goldens/dark/chip_dark_${sel}_$app.png'),
          );
        });
      }
    }
  });

  group('[golden] Chip dark — disabled', () {
    for (final selected in [false, true]) {
      final sel = selected ? 'selected' : 'unselected';
      testWidgets('dark / disabled / $sel', (tester) async {
        await pumpChipJioHarnessSettled(
          tester,
          OneUiChip(
            ariaLabel: 'chip',
            child: 'Label',
            appearance: 'primary',
            disabled: true,
            selected: selected,
          ),
          darkMode: true,
        );
        await expectLater(
          find.byType(OneUiChip),
          matchesGoldenFile('goldens/dark/chip_dark_disabled_$sel.png'),
        );
      });
    }
  });
}
