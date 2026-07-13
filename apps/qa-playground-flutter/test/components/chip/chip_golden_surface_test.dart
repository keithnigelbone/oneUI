/// Chip visual-regression tests — SURFACE CONTEXT. Renders chips nested inside
/// bold / subtle Surfaces (primary, secondary, negative, positive) so the
/// `[data-surface]` token remapping is captured — the core of OneUI surface
/// context-awareness.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/chip/chip_golden_surface_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';

import '../../support/components/chip_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] Chip — surface context (bold)', () {
    for (final appearance in ['primary', 'secondary', 'positive', 'negative']) {
      testWidgets('bold / $appearance', (tester) async {
        await pumpChipJioHarnessSettled(
          tester,
          OneUiChip(child: 'Label', selected: true, appearance: appearance),
          surfaceMode: 'bold',
          surfaceAppearance: appearance,
        );
        await expectLater(
          find.byType(OneUiChip),
          matchesGoldenFile('goldens/surface/chip_surface_bold_$appearance.png'),
        );
      });
    }
  });

  group('[golden] Chip — surface context (subtle)', () {
    for (final appearance in ['primary', 'secondary']) {
      testWidgets('subtle / $appearance', (tester) async {
        await pumpChipJioHarnessSettled(
          tester,
          OneUiChip(child: 'Label', selected: true, appearance: appearance),
          surfaceMode: 'subtle',
          surfaceAppearance: appearance,
        );
        await expectLater(
          find.byType(OneUiChip),
          matchesGoldenFile('goldens/surface/chip_surface_subtle_$appearance.png'),
        );
      });
    }
  });
}
