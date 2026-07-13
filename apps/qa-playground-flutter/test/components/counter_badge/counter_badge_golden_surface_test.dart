/// CounterBadge visual-regression tests — Surface-context nesting.
///
/// Per CLAUDE.md, Surface Context Awareness is the CORE of the design system.
/// CounterBadges inside `<Surface mode=…>` must auto-remap their tokens vs the
/// parent step. If the cascade breaks, every brand experience that uses
/// counters inside tinted cards is silently broken.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';

import '../../support/components/counter_badge_harness.dart';

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

  group('[golden][surface] CounterBadge — inside Surface(mode=X, appearance=primary)', () {
    for (final mode in _kSurfaceModes) {
      for (final att in _kAttentions) {
        testWidgets('surface=$mode / attention=$att', (tester) async {
          await pumpCounterBadgeQaHarnessSettled(
            tester,
            OneUiCounterBadge(
              value: 8,
              attention: att,
              appearance: 'auto',
              semanticsLabel: '8',
            ),
            surfaceMode: mode,
            surfaceAppearance: 'primary',
          );
          await expectLater(
            find.byType(OneUiCounterBadge),
            matchesGoldenFile(
              'goldens/surface/counter_badge_in_surface_${mode}_$att.png',
            ),
          );
        });
      }
    }
  });

  group('[golden][surface] CounterBadge — cross-role', () {
    testWidgets('subtle secondary surface + primary counter (high)', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          attention: 'high',
          appearance: 'primary',
          semanticsLabel: '8',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await expectLater(
        find.byType(OneUiCounterBadge),
        matchesGoldenFile('goldens/surface/counter_badge_in_subtle_secondary_primary_high.png'),
      );
    });
  });
}
