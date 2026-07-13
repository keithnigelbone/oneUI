/// Badge visual-regression tests — DARK MODE.
///
/// Re-runs the most-discriminating subset of the light-mode matrix under
/// `darkMode: true` so a regression that breaks dark-mode token remapping
/// fails here instead of in production.
///
/// Why a subset, not the full matrix: light-mode goldens already cover every
/// prop axis. Dark-mode primarily revalidates the surface step flip
/// (2500 → 100) and on-bold contrast inversion. Six appearance × three
/// attention + a slot pair give us coverage proportional to risk without
/// doubling test runtime.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/badge_harness.dart';

const _kDarkAppearances = <String>[
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
];

const _kAttentions = <String>['high', 'medium', 'low'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][dark] Badge — attention × appearance matrix (dark)', () {
    for (final att in _kAttentions) {
      for (final app in _kDarkAppearances) {
        testWidgets('$att / $app (dark)', (tester) async {
          await pumpBadgeQaHarnessSettled(
            tester,
            OneUiBadge(
              semanticsLabel: 'b',
              attention: att,
              appearance: app,
              child: 'Badge',
            ),
            darkMode: true,
          );
          await expectLater(
            find.byType(OneUiBadge),
            matchesGoldenFile('goldens/dark/badge_dark_${att}_$app.png'),
          );
        });
      }
    }
  });

  group('[golden][dark] Badge — slot variations (dark)', () {
    testWidgets('start + end icons / high (dark)', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          attention: 'high',
          appearance: 'primary',
          start: OneUiIcon(icon: 'check'),
          end: OneUiIcon(icon: 'arrow_forward'),
          child: 'Badge',
        ),
        darkMode: true,
      );
      await expectLater(
        find.byType(OneUiBadge),
        matchesGoldenFile('goldens/dark/badge_dark_slots_high.png'),
      );
    });
  });
}
