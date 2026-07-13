/// Button visual-regression tests — Surface-context nesting.
///
/// Closes BUG-19: zero surface-nested visual coverage in the suite.
/// Per CLAUDE.md, Surface Context Awareness is the CORE OF THE DESIGN
/// SYSTEM — components inside `<Surface mode="...">` must auto-remap
/// their tokens against the parent step. If the cascade breaks for
/// Button (e.g. a regression in `OneUiSurfaceScope.maybeOf`), every
/// brand experience that uses Buttons inside cards is silently broken.
///
/// We render the standard "high attention primary" button inside each
/// of the 4 main Surface modes (bold / subtle / minimal / elevated) and
/// each of the 3 attention levels, producing 12 goldens. This is the
/// minimum useful coverage; expand as needed for cross-role surfaces.
///
/// Workflow:
///   1. Bless baselines:
///      flutter test --update-goldens test/components/button/button_golden_surface_test.dart
///   2. Inspect the new PNGs under test/components/button/goldens/surface/
///   3. CI re-runs without `--update-goldens`; pixel diffs fail the suite.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';

import '../../support/components/button_harness.dart';

const _kSurfaceModes = <String>[
  'bold',
  'subtle',
  'minimal',
  'elevated',
];

const _kAttentions = <String, OneUiButtonAttention>{
  'high': OneUiButtonAttention.high,
  'medium': OneUiButtonAttention.medium,
  'low': OneUiButtonAttention.low,
};

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][surface] Button — inside Surface(mode=X, appearance=primary)', () {
    for (final mode in _kSurfaceModes) {
      for (final att in _kAttentions.entries) {
        testWidgets('surface=$mode / attention=${att.key}', (tester) async {
          // The harness's `surfaceMode` knob wraps the button in
          // OneUiSurface — the entire [data-surface] token-remap cascade
          // runs for every child read. If the cascade is broken, the
          // golden will differ from the matching baseline.
          await pumpButtonQaHarnessSettled(
            tester,
            OneUiButton(
              label: 'Save',
              attention: att.value,
              appearance: 'auto',
            ),
            surfaceMode: mode,
            surfaceAppearance: 'primary',
          );

          // Capture the WHOLE Surface, not just the Button — we want the
          // baseline to include the surrounding fill, so any regression
          // in the parent-step contrast also surfaces visually.
          await expectLater(
            find.byType(OneUiButton),
            matchesGoldenFile(
              'goldens/surface/button_in_surface_${mode}_${att.key}.png',
            ),
          );
        });
      }
    }
  });

  group('[golden][surface] Button — cross-role: inside Surface(appearance=secondary)', () {
    // Cross-role nesting: a secondary-tinted card with primary-appearance
    // buttons inside. This is the CLAUDE.md example for picking which
    // role fills the surface vs which role the inner buttons lean on.
    testWidgets('subtle secondary surface + primary buttons', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Save',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/surface/button_in_subtle_secondary_primary_high.png'),
      );
    });

    testWidgets('bold neutral surface + ghost buttons', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Cancel',
          attention: OneUiButtonAttention.low,
          appearance: 'auto',
        ),
        surfaceMode: 'bold',
        surfaceAppearance: 'neutral',
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/surface/button_in_bold_neutral_ghost_low.png'),
      );
    });
  });
}
