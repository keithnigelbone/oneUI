/// CircularProgressIndicator visual-regression — SURFACE CONTEXT. Renders the
/// ring inside bold / subtle Surfaces (primary, secondary, negative) so the
/// `[data-surface]` token remapping is captured — the core of OneUI surface
/// context-awareness (the ring's track/indicator resolve against the surface).
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens \
///     test/components/circular_progress_indicator/circular_progress_indicator_golden_surface_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';

import '../../support/components/circular_progress_indicator_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] CPI — surface context (bold)', () {
    for (final appearance in ['primary', 'secondary', 'negative']) {
      testWidgets('bold / $appearance', (tester) async {
        await pumpCpiJioHarnessSettled(
          tester,
          OneUiCircularProgressIndicator(
              value: 50, size: '3XL', appearance: appearance, semanticsLabel: 'a'),
          surfaceMode: 'bold',
          surfaceAppearance: appearance,
        );
        await expectLater(
          find.byType(OneUiCircularProgressIndicator),
          matchesGoldenFile('goldens/surface/cpi_surface_bold_$appearance.png'),
        );
      });
    }
  });

  group('[golden] CPI — surface context (subtle)', () {
    for (final appearance in ['primary', 'secondary']) {
      testWidgets('subtle / $appearance', (tester) async {
        await pumpCpiJioHarnessSettled(
          tester,
          OneUiCircularProgressIndicator(
              value: 50, size: '3XL', appearance: appearance, semanticsLabel: 'a'),
          surfaceMode: 'subtle',
          surfaceAppearance: appearance,
        );
        await expectLater(
          find.byType(OneUiCircularProgressIndicator),
          matchesGoldenFile('goldens/surface/cpi_surface_subtle_$appearance.png'),
        );
      });
    }
  });
}
