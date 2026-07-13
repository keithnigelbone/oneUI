/// IconButton visual-regression tests — Surface-context nesting.
///
/// Renders IconButton inside each main Surface mode so `[data-surface]` token
/// remapping regressions fail here instead of in production.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';

import '../../support/components/icon_button_harness.dart';

const _kSurfaceModes = <String>['bold', 'subtle', 'minimal', 'elevated'];

const _kAttentions = <String, OneUiIconButtonAttention>{
  'high': OneUiIconButtonAttention.high,
  'medium': OneUiIconButtonAttention.medium,
  'low': OneUiIconButtonAttention.low,
};

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    // Preload SVG icons in real-async setUpAll (lazy in-test load hangs capture).
    await ensureIconButtonIconsLoaded();
  });

  group('[golden][surface] IconButton — inside Surface(mode=X)', () {
    for (final mode in _kSurfaceModes) {
      for (final att in _kAttentions.entries) {
        testWidgets('surface=$mode / attention=${att.key}', (tester) async {
          await pumpIconButtonJioHarnessSettled(
            tester,
            OneUiIconButton(
              icon: 'heart',
              semanticsLabel: 'Like',
              attention: att.value,
              appearance: 'auto',
            ),
            surfaceMode: mode,
            surfaceAppearance: 'primary',
          );
          await expectLater(
            find.byType(OneUiIconButton),
            matchesGoldenFile(
              'goldens/surface/icon_button_in_surface_${mode}_${att.key}.png',
            ),
          );
        });
      }
    }
  });

  group('[golden][surface] IconButton — cross-role secondary surface', () {
    testWidgets('secondary subtle / high attention', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          attention: OneUiIconButtonAttention.high,
          appearance: 'auto',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        find.byType(OneUiIconButton),
        matchesGoldenFile('goldens/surface/icon_button_secondary_subtle_high.png'),
      );
    });
  });
}
