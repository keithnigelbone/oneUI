/// Badge visual-regression tests — Surface-context nesting.
///
/// Per CLAUDE.md, Surface Context Awareness is the CORE of the design system —
/// components inside `<Surface mode="...">` must auto-remap their tokens
/// against the parent step. If the cascade breaks for Badge, every brand
/// experience that uses Badges inside tinted cards is silently broken.
///
/// We render the standard "high attention auto" badge inside each of the 4
/// main Surface modes (bold / subtle / minimal / elevated) and each of the 3
/// attention levels, producing 12 baselines. Cross-role nesting (secondary
/// surface + primary badge, etc.) adds 2 more.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';

import '../../support/components/badge_harness.dart';

const _kSurfaceModes = <String>[
  'bold',
  'subtle',
  'minimal',
  'elevated',
];

const _kAttentions = <String>['high', 'medium', 'low'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][surface] Badge — inside Surface(mode=X, appearance=primary)', () {
    for (final mode in _kSurfaceModes) {
      for (final att in _kAttentions) {
        testWidgets('surface=$mode / attention=$att', (tester) async {
          await pumpBadgeQaHarnessSettled(
            tester,
            OneUiBadge(
              semanticsLabel: 'b',
              attention: att,
              appearance: 'auto',
              child: 'Badge',
            ),
            surfaceMode: mode,
            surfaceAppearance: 'primary',
          );
          await expectLater(
            find.byType(OneUiBadge),
            matchesGoldenFile(
              'goldens/surface/badge_in_surface_${mode}_$att.png',
            ),
          );
        });
      }
    }
  });

  group('[golden][surface] Badge — cross-role: inside Surface(appearance=secondary)', () {
    testWidgets('subtle secondary surface + primary badge (high)', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          attention: 'high',
          appearance: 'primary',
          child: 'Badge',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        find.byType(OneUiBadge),
        matchesGoldenFile('goldens/surface/badge_in_subtle_secondary_primary_high.png'),
      );
    });

    testWidgets('bold neutral surface + auto badge (low)', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          attention: 'low',
          appearance: 'auto',
          child: 'Badge',
        ),
        surfaceMode: 'bold',
        surfaceAppearance: 'neutral',
      );
      await expectLater(
        find.byType(OneUiBadge),
        matchesGoldenFile('goldens/surface/badge_in_bold_neutral_auto_low.png'),
      );
    });
  });
}
