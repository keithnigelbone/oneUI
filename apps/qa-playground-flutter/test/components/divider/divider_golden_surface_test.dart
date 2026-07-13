/// Divider visual-regression — SURFACE CONTEXT. Renders the divider inside bold
/// / subtle Surfaces so the `[data-surface]` token remapping is captured. Divider
/// also has a special rule: a `neutral` stroke remaps to `primary` inside a
/// non-default nested surface (`divider_color_resolve.dart` `_effectiveStrokeAppearance`).
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens \
///     test/components/divider/divider_golden_surface_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';

import '../../support/components/divider_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] Divider — surface context (bold)', () {
    for (final appearance in ['primary', 'secondary', 'negative']) {
      testWidgets('bold / $appearance', (tester) async {
        await pumpDividerJioHarness(
          tester,
          OneUiDivider(appearance: appearance, attention: 'high', size: 'l'),
          surfaceMode: 'bold',
          surfaceAppearance: appearance,
        );
        await expectLater(
          find.byType(OneUiDivider),
          matchesGoldenFile('goldens/surface/divider_surface_bold_$appearance.png'),
        );
      });
    }
  });

  group('[golden] Divider — neutral remaps to primary in subtle surface', () {
    testWidgets('subtle / neutral→primary', (tester) async {
      await pumpDividerJioHarness(
        tester,
        // neutral stroke inside a non-default surface remaps to the primary role.
        const OneUiDivider(appearance: 'neutral', attention: 'high', size: 'l'),
        surfaceMode: 'subtle',
        surfaceAppearance: 'primary',
      );
      await expectLater(
        find.byType(OneUiDivider),
        matchesGoldenFile('goldens/surface/divider_surface_subtle_neutral.png'),
      );
    });
  });
}
